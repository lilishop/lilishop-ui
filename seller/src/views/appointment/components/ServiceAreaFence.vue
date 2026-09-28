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

<script>
import { markRaw } from "vue";
import config from "@/config/index";

const OVERLAY_ID = "polygon";

export default {
  name: "ServiceAreaFence",
  props: {
    modelValue: {
      type: String,
      default: "",
    },
    visible: {
      type: Boolean,
      default: true,
    },
  },
  emits: ["update:modelValue"],
  data() {
    return {
      keyword: "",
      tips: [],
      pointCount: 0,
      areaCount: 0,
      drawing: false,
      mode: "edit",
      ready: false,
    };
  },
  created() {
    this.map = null;
    this.editor = null;
    this.polygon = null;
    this.suggestion = null;
    this.TMap = null;
    this.geometryId = "";
    this.draftRing = [];
    this.clickRing = [];
    this.areas = [];
    this.booting = false;
    this.alive = true;
  },
  watch: {
    visible(val) {
      if (!val) {
        this.destroyMap();
        return;
      }
      this.$nextTick(() => this.scheduleInit());
    },
    modelValue(val) {
      if (!this.ready || val === this.currentJson()) {
        return;
      }
      this.renderPolygons(parsePolygons(val));
    },
  },
  mounted() {
    this.observer = new ResizeObserver(() => {
      if (this.map) {
        this.resizeMap();
        return;
      }
      this.scheduleInit();
    });
    if (this.$refs.mapEl) {
      this.observer.observe(this.$refs.mapEl);
    }
    this.scheduleInit();
  },
  beforeUnmount() {
    this.alive = false;
    if (this.observer) {
      this.observer.disconnect();
    }
    this.destroyMap();
  },
  methods: {
    scheduleInit() {
      if (this.map || this.booting || !this.visible || !this.alive) {
        return;
      }
      const el = this.$refs.mapEl;
      if (!el || el.clientWidth < 10 || el.clientHeight < 10) {
        return;
      }
      this.initMap();
    },
    initMap() {
      if (!config.tMapKey) {
        this.$message.error("未配置腾讯地图 Key");
        return;
      }
      const el = this.$refs.mapEl;
      if (!el || el.clientWidth < 10 || el.clientHeight < 10) {
        return;
      }
      this.booting = true;
      loadTMap(config.tMapKey)
        .then((TMap) => {
          if (!this.alive || !this.visible) {
            this.booting = false;
            return;
          }
          const box = this.$refs.mapEl;
          if (!box || box.clientWidth < 10 || box.clientHeight < 10) {
            this.booting = false;
            return;
          }
          this.TMap = markRaw(TMap);
          this.map = markRaw(
            new TMap.Map(box, {
              zoom: 11,
              center: new TMap.LatLng(39.90923, 116.397428),
              doubleClickZoom: false,
            })
          );
          if (typeof this.map.setDoubleClickZoom === "function") {
            this.map.setDoubleClickZoom(false);
          }
          this.bindFinishGesture(box);
          const polygonStyle = new TMap.PolygonStyle({
            color: "rgba(64,158,255,0.25)",
            showBorder: true,
            borderColor: "#409EFF",
            borderWidth: 2,
          });
          this.polygon = markRaw(
            new TMap.MultiPolygon({
              map: this.map,
              styles: {
                default: polygonStyle,
                highlight: polygonStyle,
              },
              geometries: [],
            })
          );
          this.editor = markRaw(
            new TMap.tools.GeometryEditor({
              map: this.map,
              overlayList: [
                {
                  id: OVERLAY_ID,
                  overlay: this.polygon,
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
          if (typeof this.editor.setSnapPolyStartPointOnDrawing === "function") {
            this.editor.setSnapPolyStartPointOnDrawing(true);
          }
          if (typeof this.editor.setUndoDrawEnable === "function") {
            this.editor.setUndoDrawEnable(true);
          }
          if (typeof this.editor.setKeyboardEscEnable === "function") {
            this.editor.setKeyboardEscEnable(true);
          }
          this.map.on("click", (event) => this.onMapClick(event));
          this.editor.on("drawing", (evt) => this.onDrawing(evt));
          this.editor.on("draw_complete", (geometry) => this.onDrawComplete(geometry));
          this.editor.on("draw_error", () => {
            this.$message.warning("围栏不能自相交，请调整顶点后再结束");
          });
          this.editor.on("adjust_complete", (geometry) => this.onAdjustComplete(geometry));
          this.editor.on("delete_complete", (list) => this.onDeleteComplete(list));
          this.suggestion = markRaw(new TMap.service.Suggestion({ pageSize: 8 }));
          this.ready = true;
          this.booting = false;
          this.renderPolygons(parsePolygons(this.modelValue));
          this.$nextTick(() => this.resizeMap());
        })
        .catch((error) => {
          this.destroyMap();
          const text = String(error && error.message ? error.message : error);
          if (text.includes("far <= 0") || text.includes("near <= 0")) {
            return;
          }
          this.$message.error("腾讯地图加载失败，请检查 Key 是否开通 JavaScript API GL");
        });
    },
    resizeMap() {
      const el = this.$refs.mapEl;
      if (!this.map || !el || el.clientWidth < 10 || el.clientHeight < 10) {
        return;
      }
      if (typeof this.map.resize === "function") {
        this.map.resize();
      }
    },
    search() {
      const keyword = (this.keyword || "").trim();
      if (!this.suggestion || !keyword) {
        this.tips = [];
        return;
      }
      this.suggestion
        .getSuggestions({ keyword })
        .then((result) => {
          this.tips = (result.data || [])
            .filter((item) => item.location)
            .map((item) => ({
              name: item.title,
              address: item.address || "",
              location: item.location,
            }));
        })
        .catch(() => {
          this.tips = [];
        });
    },
    selectTip(tip) {
      if (!tip || !tip.location || !this.map) {
        return;
      }
      this.map.setCenter(tip.location);
      this.map.setZoom(15);
      this.tips = [];
    },
    bindFinishGesture(box) {
      this.unbindFinishGesture();
      this.mapBox = box;
      this.onMapDblClick = (event) => {
        if (!this.drawing || this.pickedCount() < 3) {
          return;
        }
        event.preventDefault();
        event.stopPropagation();
        this.finishDraw();
      };
      this.onMapContextMenu = (event) => {
        if (this.mode !== "draw") {
          return;
        }
        event.preventDefault();
        event.stopPropagation();
        this.undoDrawPoint();
      };
      box.addEventListener("dblclick", this.onMapDblClick, true);
      box.addEventListener("contextmenu", this.onMapContextMenu, true);
    },
    unbindFinishGesture() {
      if (this.mapBox && this.onMapDblClick) {
        this.mapBox.removeEventListener("dblclick", this.onMapDblClick, true);
      }
      if (this.mapBox && this.onMapContextMenu) {
        this.mapBox.removeEventListener("contextmenu", this.onMapContextMenu, true);
      }
      this.mapBox = null;
      this.onMapDblClick = null;
      this.onMapContextMenu = null;
    },
    undoDrawPoint() {
      if (!this.editor) {
        return;
      }
      if (typeof this.editor.undo === "function") {
        this.editor.undo();
        return;
      }
      const event = new KeyboardEvent("keydown", {
        key: "z",
        code: "KeyZ",
        ctrlKey: true,
        bubbles: true,
        cancelable: true,
      });
      if (this.mapBox) {
        this.mapBox.dispatchEvent(event);
      }
      document.dispatchEvent(event);
    },
    onMapClick(event) {
      if (!this.drawing) {
        return;
      }
      const point = latLngOf(event && (event.latLng || event.latlng));
      if (!point) {
        return;
      }
      this.clickRing = dedupeRing((this.clickRing || []).concat([point]));
      this.pointCount = this.pickedCount();
    },
    onDrawing(evt) {
      const ring = dedupeRing(ringFromPaths(evt && evt.geometry && evt.geometry.paths));
      if (!ring.length) {
        return;
      }
      this.draftRing = ring;
      this.pointCount = this.pickedCount();
    },
    pickedCount() {
      return Math.max((this.draftRing || []).length, (this.clickRing || []).length);
    },
    pickedRing() {
      const editorRing = dedupeRing(this.draftRing || []);
      const clickRing = dedupeRing(this.clickRing || []);
      if (clickRing.length >= 3) {
        return clickRing;
      }
      return editorRing.length >= clickRing.length ? editorRing : clickRing;
    },
    startDraw() {
      if (!this.editor || !this.polygon) {
        return;
      }
      this.mode = "draw";
      this.drawing = true;
      this.pointCount = 0;
      this.draftRing = [];
      this.clickRing = [];
      this.pendingRing = null;
      this.editor.setActiveOverlay(OVERLAY_ID);
      if (typeof this.editor.setSelectable === "function") {
        this.editor.setSelectable(false);
      }
      this.editor.setActionMode(this.TMap.tools.constants.EDITOR_ACTION.DRAW);
    },
    startEdit() {
      if (!this.editor) {
        return;
      }
      if (this.drawing && this.pickedCount() >= 3) {
        this.finishDraw();
      } else if (typeof this.editor.stop === "function") {
        try {
          this.editor.stop();
        } catch (e) {
          // 没有进行中的绘制时停止会抛错
        }
      }
      this.mode = "edit";
      this.drawing = false;
      this.pointCount = 0;
      this.draftRing = [];
      this.clickRing = [];
      this.pendingRing = null;
      if (typeof this.editor.setSelectable === "function") {
        this.editor.setSelectable(true);
      }
      this.editor.setActionMode(this.TMap.tools.constants.EDITOR_ACTION.INTERACT);
      this.fitAll();
    },
    finishDraw() {
      if (!this.editor || !this.polygon || !this.drawing) {
        return;
      }
      const ring = this.pickedRing();
      if (ring.length < 3) {
        this.$message.warning("至少点击 3 个顶点后再结束");
        return;
      }
      this.pendingRing = ring;
      const before = (this.areas || []).length;
      if (typeof this.editor.stop === "function") {
        try {
          this.editor.stop();
        } catch (e) {
          // 编辑器中断绘制时可能抛错，随后用已选顶点落图
        }
      }
      if ((this.areas || []).length === before && this.pendingRing) {
        this.appendArea("fence-" + Date.now(), this.pendingRing);
      }
      this.pendingRing = null;
    },
    deleteSelected() {
      if (!this.editor || this.mode !== "edit") {
        this.$message.warning("请先进入编辑模式并选中区域");
        return;
      }
      const selected = typeof this.editor.getSelectedList === "function" ? this.editor.getSelectedList() || [] : [];
      if (!selected.length) {
        this.$message.warning("请先选中要删除的区域");
        return;
      }
      const ids = selected.map((item) => item && item.id).filter(Boolean);
      if (typeof this.editor.delete === "function") {
        this.editor.delete();
      }
      this.areas = (this.areas || []).filter((area) => !ids.includes(area.id));
      this.redrawAreas();
      this.publishAreas();
    },
    onDrawComplete(geometry) {
      if (!this.polygon) {
        return;
      }
      let ring = ringFromGeometry(geometry);
      if (ring.length < 3) {
        ring = this.pendingRing || this.pickedRing();
      }
      this.pendingRing = null;
      if (ring.length < 3) {
        return;
      }
      this.appendArea((geometry && geometry.id) || "fence-" + Date.now(), ring);
    },
    onAdjustComplete(geometry) {
      const ring = ringFromGeometry(geometry);
      const id = geometry && geometry.id;
      if (!id || ring.length < 3) {
        return;
      }
      const areas = (this.areas || []).slice();
      const index = areas.findIndex((item) => item.id === id);
      if (index >= 0) {
        areas[index] = { id, ring };
      } else {
        areas.push({ id, ring });
      }
      this.areas = areas;
      this.publishAreas();
    },
    onDeleteComplete(list) {
      const ids = (list || []).map((item) => item && item.id).filter(Boolean);
      if (!ids.length) {
        return;
      }
      this.areas = (this.areas || []).filter((area) => !ids.includes(area.id));
      this.publishAreas();
    },
    appendArea(id, ring) {
      const clean = dedupeRing(ring || []);
      if (clean.length < 3) {
        return;
      }
      const areas = (this.areas || []).filter((area) => area.id !== id);
      areas.push({ id, ring: clean });
      this.areas = areas;
      this.redrawAreas();
      this.publishAreas();
      this.draftRing = [];
      this.clickRing = [];
      this.pointCount = 0;
      this.fitAll();
      if (this.mode === "draw") {
        this.drawing = true;
        if (typeof this.editor.setSelectable === "function") {
          this.editor.setSelectable(false);
        }
        this.editor.setActionMode(this.TMap.tools.constants.EDITOR_ACTION.DRAW);
      }
    },
    redrawAreas() {
      if (!this.polygon || !this.TMap) {
        return;
      }
      this.polygon.setGeometries(
        (this.areas || []).map((area) => ({
          id: area.id,
          styleId: "highlight",
          paths: area.ring.map((point) => new this.TMap.LatLng(point.lat, point.lng)),
        }))
      );
    },
    publishAreas() {
      const areas = this.areas || [];
      this.areaCount = areas.length;
      if (!areas.length) {
        this.committedJson = "";
        if (this.modelValue) {
          this.$emit("update:modelValue", "");
        }
        return;
      }
      const json = JSON.stringify({
        paths: areas.map((area) =>
          area.ring.map((point) => [
            Number(Number(point.lng).toFixed(6)),
            Number(Number(point.lat).toFixed(6)),
          ])
        ),
      });
      this.committedJson = json;
      if (json !== (this.modelValue || "")) {
        this.$emit("update:modelValue", json);
      }
    },
    renderPolygons(polygons) {
      if (!this.polygon || !this.TMap || !this.editor) {
        return;
      }
      if (typeof this.editor.stop === "function") {
        try {
          this.editor.stop();
        } catch (e) {
          // 初始化时没有进行中的绘制
        }
      }
      this.areas = (polygons || []).map((ring, index) => ({
        id: "fence-" + index,
        ring,
      }));
      this.redrawAreas();
      this.areaCount = this.areas.length;
      this.committedJson = this.modelValue || "";
      this.mode = "edit";
      this.drawing = false;
      this.pointCount = 0;
      this.editor.setActiveOverlay(OVERLAY_ID);
      if (typeof this.editor.setSelectable === "function") {
        this.editor.setSelectable(true);
      }
      this.editor.setActionMode(this.TMap.tools.constants.EDITOR_ACTION.INTERACT);
      this.fitAll();
    },
    fitAll() {
      if (!this.map || !this.TMap) {
        return;
      }
      const points = [];
      (this.areas || []).forEach((area) => {
        (area.ring || []).forEach((point) => points.push(point));
      });
      if (points.length < 2) {
        return;
      }
      const bounds = new this.TMap.LatLngBounds();
      points.forEach((point) => bounds.extend(new this.TMap.LatLng(point.lat, point.lng)));
      this.map.fitBounds(bounds, { padding: 48 });
    },
    currentJson() {
      return this.committedJson || "";
    },
    destroyMap() {
      this.ready = false;
      this.booting = false;
      this.drawing = false;
      this.unbindFinishGesture();
      const editor = this.editor;
      const map = this.map;
      this.editor = null;
      this.map = null;
      this.polygon = null;
      this.suggestion = null;
      try {
        if (editor && typeof editor.destroy === "function") {
          editor.destroy();
        }
      } catch (e) {
        // 容器已隐藏时，腾讯地图会在销毁过程中抛 far <= 0
      }
      try {
        if (map && typeof map.destroy === "function") {
          map.destroy();
        }
      } catch (e) {
        // 同上
      }
    },
  },
};

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
