<template>
  <div class="fence">
    <div class="fence-toolbar">
      <el-input
        v-model="keyword"
        placeholder="搜索地点，定位后再绘制"
        clearable
        @keyup.enter="search"
      />
      <el-button @click="search">搜索</el-button>
      <el-button :type="mode === 'draw' ? 'primary' : ''" @click="drawing && pointCount ? finishDraw() : startDraw()">
        {{ drawing && pointCount ? "完成绘制" : "绘制模式" }}
      </el-button>
      <el-button :type="mode === 'edit' ? 'primary' : ''" @click="startEdit">编辑模式</el-button>
      <el-button :disabled="mode !== 'edit'" @click="deleteSelected">删除选中</el-button>
    </div>
    <ul v-if="tips.length" class="fence-tips">
      <li v-for="(tip, index) in tips" :key="index" @click="selectTip(tip)">
        <p>{{ tip.name }}</p>
        <p>{{ tip.address }}</p>
      </li>
    </ul>
    <div ref="mapEl" class="fence-map"></div>
    <div v-if="drawing && pointCount" class="fence-hint">当前图形 {{ pointCount }} 个顶点。</div>
    <div v-else-if="areaCount" class="fence-hint">已绘制 {{ areaCount }} 个区域。</div>
    <ul class="fence-desc">
      <li><span>绘制模式</span>鼠标左键点击及移动即可绘制图形，双击结束绘制。可以绘制多个区域</li>
      <li><span>编辑模式</span>可以拖拽顶点调整多边形形状，点击边线添加新顶点，地图会自动定位到绘制区域中心</li>
      <li><span>删除功能</span>编辑模式下选中多边形后点击「删除选中」删除指定区域</li>
      <li><span>多区域支持</span>支持绘制和编辑多个独立的服务区域，每个区域可以单独编辑和删除</li>
      <li><span>其他操作</span>ESC 键中断绘制，Ctrl+Z 撤销操作，右键撤销绘制点</li>
    </ul>
  </div>
</template>

<script setup>
import { markRaw, nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue";
import config from "@/config/index";
import { Message } from "@/utils/message";

const OVERLAY_ID = "polygon";

defineOptions({ name: "ServiceAreaFence" });

const props = defineProps({
  modelValue: {
    type: String,
    default: "",
  },
  visible: {
    type: Boolean,
    default: true,
  },
});

const emit = defineEmits(["update:modelValue"]);

const keyword = ref("");
const tips = ref([]);
const pointCount = ref(0);
const areaCount = ref(0);
const drawing = ref(false);
const mode = ref("edit");
const ready = ref(false);

// 模板 ref（原 this.$refs.mapEl），与顶层变量无同名冲突，保持原名
const mapEl = ref(null);

// 以下字段原本未在 data 声明、直接挂 this 上（created/mounted/方法内赋值），
// 非响应式实例字段，这里补声明为普通变量，避免 script setup 严格模式 ReferenceError
let map = null;
let editor = null;
let polygon = null;
let suggestion = null;
let TMap = null;
let draftRing = [];
let clickRing = [];
let areas = [];
let booting = false;
let alive = true;
let observer = null;
let mapBox = null;
let onMapDblClick = null;
let onMapContextMenu = null;
let pendingRing = null;
let committedJson = "";

watch(
  () => props.visible,
  (val) => {
    if (!val) {
      destroyMap();
      return;
    }
    nextTick(() => scheduleInit());
  }
);

watch(
  () => props.modelValue,
  (val) => {
    if (!ready.value || val === currentJson()) {
      return;
    }
    renderPolygons(parsePolygons(val));
  }
);

onMounted(() => {
  observer = new ResizeObserver(() => {
    if (map) {
      resizeMap();
      return;
    }
    scheduleInit();
  });
  if (mapEl.value) {
    observer.observe(mapEl.value);
  }
  scheduleInit();
});

onBeforeUnmount(() => {
  alive = false;
  if (observer) {
    observer.disconnect();
  }
  destroyMap();
});

function scheduleInit() {
  if (map || booting || !props.visible || !alive) {
    return;
  }
  const el = mapEl.value;
  if (!el || el.clientWidth < 10 || el.clientHeight < 10) {
    return;
  }
  initMap();
}

function initMap() {
  if (!config.tMapKey) {
    // 原代码写作 this.$message，但全局只注册了 $Message（小写笔误），此处按作者意图使用 Message
    Message.error("未配置腾讯地图 Key");
    return;
  }
  const el = mapEl.value;
  if (!el || el.clientWidth < 10 || el.clientHeight < 10) {
    return;
  }
  booting = true;
  loadTMap(config.tMapKey)
    .then((tmap) => {
      if (!alive || !props.visible) {
        booting = false;
        return;
      }
      const box = mapEl.value;
      if (!box || box.clientWidth < 10 || box.clientHeight < 10) {
        booting = false;
        return;
      }
      TMap = markRaw(tmap);
      map = markRaw(
        new TMap.Map(box, {
          zoom: 11,
          center: new TMap.LatLng(39.90923, 116.397428),
          doubleClickZoom: false,
        })
      );
      if (typeof map.setDoubleClickZoom === "function") {
        map.setDoubleClickZoom(false);
      }
      bindFinishGesture(box);
      const polygonStyle = new TMap.PolygonStyle({
        color: "rgba(64,158,255,0.25)",
        showBorder: true,
        borderColor: "#409EFF",
        borderWidth: 2,
      });
      polygon = markRaw(
        new TMap.MultiPolygon({
          map: map,
          styles: {
            default: polygonStyle,
            highlight: polygonStyle,
          },
          geometries: [],
        })
      );
      editor = markRaw(
        new TMap.tools.GeometryEditor({
          map: map,
          overlayList: [
            {
              id: OVERLAY_ID,
              overlay: polygon,
              drawingStyleId: "highlight",
              selectedStyleId: "highlight",
            },
          ],
          actionMode: TMap.tools.constants.EDITOR_ACTION.INTERACT,
          activeOverlayId: OVERLAY_ID,
          selectable: true,
          snappable: true,
          enableKeyboardEsc: true,
          enableUndoDraw: true,
        })
      );
      if (typeof editor.setSnapPolyStartPointOnDrawing === "function") {
        editor.setSnapPolyStartPointOnDrawing(true);
      }
      if (typeof editor.setUndoDrawEnable === "function") {
        editor.setUndoDrawEnable(true);
      }
      if (typeof editor.setKeyboardEscEnable === "function") {
        editor.setKeyboardEscEnable(true);
      }
      map.on("click", (event) => onMapClick(event));
      editor.on("drawing", (evt) => onDrawing(evt));
      editor.on("draw_complete", (geometry) => onDrawComplete(geometry));
      editor.on("draw_error", () => {
        Message.warning("围栏不能自相交，请调整顶点后再结束");
      });
      editor.on("adjust_complete", (geometry) => onAdjustComplete(geometry));
      editor.on("delete_complete", (list) => onDeleteComplete(list));
      suggestion = markRaw(new TMap.service.Suggestion({ pageSize: 8 }));
      ready.value = true;
      booting = false;
      renderPolygons(parsePolygons(props.modelValue));
      nextTick(() => resizeMap());
    })
    .catch((error) => {
      destroyMap();
      const text = String(error && error.message ? error.message : error);
      if (text.includes("far <= 0") || text.includes("near <= 0")) {
        return;
      }
      Message.error("腾讯地图加载失败，请检查 Key 是否开通 JavaScript API GL");
    });
}

function resizeMap() {
  const el = mapEl.value;
  if (!map || !el || el.clientWidth < 10 || el.clientHeight < 10) {
    return;
  }
  if (typeof map.resize === "function") {
    map.resize();
  }
}

function search() {
  const kw = (keyword.value || "").trim();
  if (!suggestion || !kw) {
    tips.value = [];
    return;
  }
  suggestion
    .getSuggestions({ keyword: kw })
    .then((result) => {
      tips.value = (result.data || [])
        .filter((item) => item.location)
        .map((item) => ({
          name: item.title,
          address: item.address || "",
          location: item.location,
        }));
    })
    .catch(() => {
      tips.value = [];
    });
}

function selectTip(tip) {
  if (!tip || !tip.location || !map) {
    return;
  }
  map.setCenter(tip.location);
  map.setZoom(15);
  tips.value = [];
}

function bindFinishGesture(box) {
  unbindFinishGesture();
  mapBox = box;
  onMapDblClick = (event) => {
    if (!drawing.value || pickedCount() < 3) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    finishDraw();
  };
  onMapContextMenu = (event) => {
    if (mode.value !== "draw") {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    undoDrawPoint();
  };
  box.addEventListener("dblclick", onMapDblClick, true);
  box.addEventListener("contextmenu", onMapContextMenu, true);
}

function unbindFinishGesture() {
  if (mapBox && onMapDblClick) {
    mapBox.removeEventListener("dblclick", onMapDblClick, true);
  }
  if (mapBox && onMapContextMenu) {
    mapBox.removeEventListener("contextmenu", onMapContextMenu, true);
  }
  mapBox = null;
  onMapDblClick = null;
  onMapContextMenu = null;
}

function undoDrawPoint() {
  if (!editor) {
    return;
  }
  if (typeof editor.undo === "function") {
    editor.undo();
    return;
  }
  const event = new KeyboardEvent("keydown", {
    key: "z",
    code: "KeyZ",
    ctrlKey: true,
    bubbles: true,
    cancelable: true,
  });
  if (mapBox) {
    mapBox.dispatchEvent(event);
  }
  document.dispatchEvent(event);
}

function onMapClick(event) {
  if (!drawing.value) {
    return;
  }
  const point = latLngOf(event && (event.latLng || event.latlng));
  if (!point) {
    return;
  }
  clickRing = dedupeRing((clickRing || []).concat([point]));
  pointCount.value = pickedCount();
}

function onDrawing(evt) {
  const ring = dedupeRing(ringFromPaths(evt && evt.geometry && evt.geometry.paths));
  if (!ring.length) {
    return;
  }
  draftRing = ring;
  pointCount.value = pickedCount();
}

function pickedCount() {
  return Math.max((draftRing || []).length, (clickRing || []).length);
}

function pickedRing() {
  const editorRing = dedupeRing(draftRing || []);
  const clickRingDeduped = dedupeRing(clickRing || []);
  if (clickRingDeduped.length >= 3) {
    return clickRingDeduped;
  }
  return editorRing.length >= clickRingDeduped.length ? editorRing : clickRingDeduped;
}

function startDraw() {
  if (!editor || !polygon) {
    return;
  }
  mode.value = "draw";
  drawing.value = true;
  pointCount.value = 0;
  draftRing = [];
  clickRing = [];
  pendingRing = null;
  editor.setActiveOverlay(OVERLAY_ID);
  if (typeof editor.setSelectable === "function") {
    editor.setSelectable(false);
  }
  editor.setActionMode(TMap.tools.constants.EDITOR_ACTION.DRAW);
}

function startEdit() {
  if (!editor) {
    return;
  }
  if (drawing.value && pickedCount() >= 3) {
    finishDraw();
  } else if (typeof editor.stop === "function") {
    try {
      editor.stop();
    } catch (e) {
      // 没有进行中的绘制时停止会抛错
    }
  }
  mode.value = "edit";
  drawing.value = false;
  pointCount.value = 0;
  draftRing = [];
  clickRing = [];
  pendingRing = null;
  if (typeof editor.setSelectable === "function") {
    editor.setSelectable(true);
  }
  editor.setActionMode(TMap.tools.constants.EDITOR_ACTION.INTERACT);
  fitAll();
}

function finishDraw() {
  if (!editor || !polygon || !drawing.value) {
    return;
  }
  const ring = pickedRing();
  if (ring.length < 3) {
    Message.warning("至少点击 3 个顶点后再结束");
    return;
  }
  pendingRing = ring;
  const before = (areas || []).length;
  if (typeof editor.stop === "function") {
    try {
      editor.stop();
    } catch (e) {
      // 编辑器中断绘制时可能抛错，随后用已选顶点落图
    }
  }
  if ((areas || []).length === before && pendingRing) {
    appendArea("fence-" + Date.now(), pendingRing);
  }
  pendingRing = null;
}

function deleteSelected() {
  if (!editor || mode.value !== "edit") {
    Message.warning("请先进入编辑模式并选中区域");
    return;
  }
  const selected = typeof editor.getSelectedList === "function" ? editor.getSelectedList() || [] : [];
  if (!selected.length) {
    Message.warning("请先选中要删除的区域");
    return;
  }
  const ids = selected.map((item) => item && item.id).filter(Boolean);
  if (typeof editor.delete === "function") {
    editor.delete();
  }
  areas = (areas || []).filter((area) => !ids.includes(area.id));
  redrawAreas();
  publishAreas();
}

function onDrawComplete(geometry) {
  if (!polygon) {
    return;
  }
  let ring = ringFromGeometry(geometry);
  if (ring.length < 3) {
    ring = pendingRing || pickedRing();
  }
  pendingRing = null;
  if (ring.length < 3) {
    return;
  }
  appendArea((geometry && geometry.id) || "fence-" + Date.now(), ring);
}

function onAdjustComplete(geometry) {
  const ring = ringFromGeometry(geometry);
  const id = geometry && geometry.id;
  if (!id || ring.length < 3) {
    return;
  }
  const list = (areas || []).slice();
  const index = list.findIndex((item) => item.id === id);
  if (index >= 0) {
    list[index] = { id, ring };
  } else {
    list.push({ id, ring });
  }
  areas = list;
  publishAreas();
}

function onDeleteComplete(list) {
  const ids = (list || []).map((item) => item && item.id).filter(Boolean);
  if (!ids.length) {
    return;
  }
  areas = (areas || []).filter((area) => !ids.includes(area.id));
  publishAreas();
}

function appendArea(id, ring) {
  const clean = dedupeRing(ring || []);
  if (clean.length < 3) {
    return;
  }
  const list = (areas || []).filter((area) => area.id !== id);
  list.push({ id, ring: clean });
  areas = list;
  redrawAreas();
  publishAreas();
  draftRing = [];
  clickRing = [];
  pointCount.value = 0;
  fitAll();
  if (mode.value === "draw") {
    drawing.value = true;
    if (typeof editor.setSelectable === "function") {
      editor.setSelectable(false);
    }
    editor.setActionMode(TMap.tools.constants.EDITOR_ACTION.DRAW);
  }
}

function redrawAreas() {
  if (!polygon || !TMap) {
    return;
  }
  polygon.setGeometries(
    (areas || []).map((area) => ({
      id: area.id,
      styleId: "highlight",
      paths: area.ring.map((point) => new TMap.LatLng(point.lat, point.lng)),
    }))
  );
}

function publishAreas() {
  const list = areas || [];
  areaCount.value = list.length;
  if (!list.length) {
    committedJson = "";
    if (props.modelValue) {
      emit("update:modelValue", "");
    }
    return;
  }
  const json = JSON.stringify({
    paths: list.map((area) =>
      area.ring.map((point) => [
        Number(Number(point.lng).toFixed(6)),
        Number(Number(point.lat).toFixed(6)),
      ])
    ),
  });
  committedJson = json;
  if (json !== (props.modelValue || "")) {
    emit("update:modelValue", json);
  }
}

function renderPolygons(polygons) {
  if (!polygon || !TMap || !editor) {
    return;
  }
  if (typeof editor.stop === "function") {
    try {
      editor.stop();
    } catch (e) {
      // 初始化时没有进行中的绘制
    }
  }
  areas = (polygons || []).map((ring, index) => ({
    id: "fence-" + index,
    ring,
  }));
  redrawAreas();
  areaCount.value = areas.length;
  committedJson = props.modelValue || "";
  mode.value = "edit";
  drawing.value = false;
  pointCount.value = 0;
  editor.setActiveOverlay(OVERLAY_ID);
  if (typeof editor.setSelectable === "function") {
    editor.setSelectable(true);
  }
  editor.setActionMode(TMap.tools.constants.EDITOR_ACTION.INTERACT);
  fitAll();
}

function fitAll() {
  if (!map || !TMap) {
    return;
  }
  const points = [];
  (areas || []).forEach((area) => {
    (area.ring || []).forEach((point) => points.push(point));
  });
  if (points.length < 2) {
    return;
  }
  const bounds = new TMap.LatLngBounds();
  points.forEach((point) => bounds.extend(new TMap.LatLng(point.lat, point.lng)));
  map.fitBounds(bounds, { padding: 48 });
}

function currentJson() {
  return committedJson || "";
}

function destroyMap() {
  ready.value = false;
  booting = false;
  drawing.value = false;
  unbindFinishGesture();
  const oldEditor = editor;
  const oldMap = map;
  editor = null;
  map = null;
  polygon = null;
  suggestion = null;
  try {
    if (oldEditor && typeof oldEditor.destroy === "function") {
      oldEditor.destroy();
    }
  } catch (e) {
    // 容器已隐藏时，腾讯地图会在销毁过程中抛 far <= 0
  }
  try {
    if (oldMap && typeof oldMap.destroy === "function") {
      oldMap.destroy();
    }
  } catch (e) {
    // 同上
  }
}

function ensureProcessShim() {
  const current = window.process;
  if (!current || typeof current !== "object") {
    window.process = {
      env: { NODE_ENV: "production" },
      browser: true,
      stderr: { isTTY: false },
      emitWarning() {},
    };
    return;
  }
  if (!current.env) {
    current.env = { NODE_ENV: "production" };
  }
  if (!current.stderr) {
    current.stderr = { isTTY: false };
  }
  if (typeof current.emitWarning !== "function") {
    current.emitWarning = function () {};
  }
}

function loadTMap(key) {
  if (window.TMap && window.TMap.tools && window.TMap.service) {
    return Promise.resolve(window.TMap);
  }
  if (!loadTMap.pending) {
    loadTMap.pending = new Promise((resolve, reject) => {
      ensureProcessShim();
      const script = document.createElement("script");
      script.charset = "utf-8";
      script.async = false;
      script.src =
        "https://map.qq.com/api/gljs?v=1.exp&libraries=tools,service&key=" +
        encodeURIComponent(key);
      script.onload = () => {
        if (window.TMap) {
          resolve(window.TMap);
        } else {
          reject(new Error("TMap missing"));
        }
      };
      script.onerror = () => reject(new Error("TMap load failed"));
      document.head.appendChild(script);
    });
  }
  return loadTMap.pending;
}

function dedupeRing(ring) {
  const result = [];
  ring.forEach((point) => {
    const last = result[result.length - 1];
    if (last && Math.abs(last.lat - point.lat) < 1e-6 && Math.abs(last.lng - point.lng) < 1e-6) {
      return;
    }
    result.push(point);
  });
  if (result.length > 3) {
    const first = result[0];
    const end = result[result.length - 1];
    if (Math.abs(first.lat - end.lat) < 1e-6 && Math.abs(first.lng - end.lng) < 1e-6) {
      result.pop();
    }
  }
  return result;
}

function asArray(value) {
  if (!value) {
    return [];
  }
  if (Array.isArray(value)) {
    return value;
  }
  if (typeof value.getLength === "function" && typeof value.getAt === "function") {
    const list = [];
    const size = value.getLength();
    for (let i = 0; i < size; i += 1) {
      list.push(value.getAt(i));
    }
    return list;
  }
  return [];
}

function ringFromGeometry(geometry) {
  if (!geometry) {
    return [];
  }
  const ring = longestRing(geometry.paths || geometry.path || geometry.points || geometry);
  return dedupeRing(ring);
}

function longestRing(value, depth) {
  if (!value || depth > 5) {
    return [];
  }
  const point = latLngOf(value);
  if (point) {
    return [point];
  }
  const list = asArray(value);
  if (list.length) {
    const flat = list.map(latLngOf).filter(Boolean);
    if (flat.length >= 3) {
      return flat;
    }
    let best = flat;
    list.forEach((item) => {
      const nested = longestRing(item, (depth || 0) + 1);
      if (nested.length > best.length) {
        best = nested;
      }
    });
    return best;
  }
  if (typeof value === "object") {
    return longestRing(value.paths || value.path || value.points, (depth || 0) + 1);
  }
  return [];
}

function ringFromPaths(paths) {
  return dedupeRing(longestRing(paths, 0));
}

function latLngOf(point) {
  if (!point || typeof point !== "object") {
    return null;
  }
  if (Array.isArray(point)) {
    return latLngFromPair(point[0], point[1]);
  }
  const lat = readNumber(point, ["getLat", "getLatitude"], ["lat", "latitude"]);
  const lng = readNumber(point, ["getLng", "getLongitude"], ["lng", "longitude"]);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return null;
  }
  return { lat, lng };
}

function latLngFromPair(first, second) {
  const a = Number(first);
  const b = Number(second);
  if (!Number.isFinite(a) || !Number.isFinite(b)) {
    return null;
  }
  if (Math.abs(a) > 90 && Math.abs(b) <= 90) {
    return { lng: a, lat: b };
  }
  if (Math.abs(b) > 90 && Math.abs(a) <= 90) {
    return { lng: b, lat: a };
  }
  return { lng: a, lat: b };
}

function readNumber(point, methods, fields) {
  for (let i = 0; i < methods.length; i += 1) {
    const name = methods[i];
    if (typeof point[name] === "function") {
      const value = Number(point[name]());
      if (Number.isFinite(value)) {
        return value;
      }
    }
  }
  for (let i = 0; i < fields.length; i += 1) {
    const value = Number(point[fields[i]]);
    if (Number.isFinite(value)) {
      return value;
    }
  }
  return NaN;
}

function parsePolygons(raw) {
  if (!raw) {
    return [];
  }
  try {
    const data = typeof raw === "string" ? JSON.parse(raw) : raw;
    if (!data) {
      return [];
    }
    const source = Array.isArray(data.paths) ? data.paths : Array.isArray(data.path) ? [data.path] : [];
    return source.map(readRing).filter((ring) => ring.length >= 3);
  } catch (e) {
    return [];
  }
}

function readRing(path) {
  if (!Array.isArray(path)) {
    return [];
  }
  return dedupeRing(
    path
      .map((point) => {
        if (!Array.isArray(point) || point.length < 2) {
          return null;
        }
        const lng = Number(point[0]);
        const lat = Number(point[1]);
        if (!Number.isFinite(lng) || !Number.isFinite(lat)) {
          return null;
        }
        return { lng, lat };
      })
      .filter(Boolean)
  );
}
</script>

<style scoped>
.fence {
  position: relative;
  width: 720px;
  max-width: 100%;
}
.fence-toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 8px;
}
.fence-toolbar .el-input {
  width: 280px;
}
.fence-tips {
  position: absolute;
  z-index: 1001;
  left: 0;
  top: 40px;
  width: 280px;
  max-height: 240px;
  overflow: auto;
  margin: 0;
  padding: 0;
  list-style: none;
  background: #fff;
  border: 1px solid #e4e7ed;
}
.fence-tips li {
  padding: 6px 10px;
  cursor: pointer;
}
.fence-tips li:hover {
  background: #f5f7fa;
}
.fence-tips p {
  margin: 0;
}
.fence-tips p:last-child {
  color: #909399;
  font-size: 12px;
}
.fence-map {
  width: 100%;
  height: 480px;
  border: 1px solid #e4e7ed;
}
.fence-hint {
  margin-top: 8px;
  color: #909399;
  font-size: 12px;
  line-height: 1.6;
}
.fence-desc {
  margin: 8px 0 0;
  padding: 0;
  list-style: none;
  color: #909399;
  font-size: 12px;
  line-height: 1.7;
}
.fence-desc span {
  margin-right: 6px;
  color: #606266;
}
</style>
