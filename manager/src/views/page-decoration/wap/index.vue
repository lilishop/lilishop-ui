<template>
  <div class="wrapper">
    <!-- 拖拽栏 ，展示栏  -->
    <div class="model-view">
      <div class="model-view-menu">
        <div
          v-for="grp in modelGroups"
          :key="grp.key"
          class="model-group"
        >
          <div class="model-group-title">{{ grp.title }}</div>
          <draggable
            class="model-view-menu-item"
            :list="grp.list"
            :item-key="getModelKey"
            :clone="cloneModel"
            :move="handleMove"
            :group="{ name: 'model', pull: 'clone', put: false, animation: 150 }"
            :sort="false"
            ghost-class="ghost"
          >
            <template #item="{ element: model }">
              <li class="model-item">
                <el-icon v-if="model.icon && iconMap[model.icon]" :size="22">
                  <component :is="iconMap[model.icon]" />
                </el-icon>
                <span>{{ model.name }}</span>
              </li>
            </template>
          </draggable>
        </div>
      </div>

      <div class="model-view-content">
        <div class="page-setting-entry" @click="showPageSetting">页面设置</div>
        <div class="content" :style="canvasStyle">
          <div class="wap-title" :style="titleBarStyle">{{ contentData.title || "页面标题" }}</div>
          <draggable
            class="draggable"
            group="model"
            ghost-class="ghost"
            @add="handleContentlAdd"
            @end="handleContentlEnd"
            v-model="contentData.list"
            :item-key="getContentItemKey"
          >
            <template #item="{ element, index }">
              <div class="list">
                <div class="floor-name">{{ element.name || element.type }}</div>
                <div
                  v-if="templates[element.type]"
                  class="component"
                  :class="{ active: selected == index }"
                  @click="handleComponent(element, index)"
                >
                  <component :is="templates[element.type]" :res="element.options"></component>
                </div>
                <div
                  v-else
                  class="component unknown-component"
                  @click="handleUnknownComponent(element, index)"
                >
                  未知组件「{{ element.type }}」已下线，点击删除
                </div>
                <div v-if="element.hidden" class="floor-hidden-mask">已隐藏</div>
                <div v-if="selected == index" class="floor-tools">
                  <el-icon
                    :class="{ disabled: index === 0 }"
                    @click="moveComponent(index, -1)"
                    ><Top
                  /></el-icon>
                  <el-icon
                    :class="{ disabled: index === contentData.list.length - 1 }"
                    @click="moveComponent(index, 1)"
                    ><Bottom
                  /></el-icon>
                  <el-icon @click="copyComponent(index)"><CopyDocument /></el-icon>
                  <el-icon @click="closeComponent(index)"><Delete /></el-icon>
                  <el-icon @click="toggleHide(index)"
                    ><View v-if="!element.hidden" /><Hide v-else
                  /></el-icon>
                </div>
              </div>
            </template>
          </draggable>
        </div>
      </div>

      <!-- 右侧栏 -->
      <div class="model-config">
        <decorate
          @handleDrawer="handleDrawer"
          v-if="decorateData"
          :res="decorateData"
        ></decorate>
        <PanelPageSetting v-else :res="contentData" />
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref, watch, nextTick, onMounted, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import {
  Picture,
  PictureFilled,
  Document,
  Grid,
  Menu,
  Search,
  Goods,
  Bell,
  VideoCamera,
  VideoPlay,
  Tickets,
  Shop,
  UserFilled,
  Timer,
  Scissor,
  Coin,
  Ticket,
  Collection,
  Crop,
  Minus,
  EditPen,
  Top,
  Bottom,
  CopyDocument,
  Delete,
  View,
  Hide,
} from "@element-plus/icons-vue";
import templates from "./template/index";
import Draggable from "vuedraggable";
import { modelData } from "./config";
import decorate from "./decorate";
import PanelPageSetting from "./config-panel/PanelPageSetting.vue";
import * as API_Other from "@/api/other";
import * as API_Promotions from "@/api/promotion";
import { getStore } from "@/libs/storage";
import { Message, Modal } from "@/utils/message";
import { useAppStore } from "@/stores/app";

const route = useRoute();
const router = useRouter();
const appStore = useAppStore();

// script setup 下 :is 无法按字符串解析局部导入，用映射表渲染组件图标
const iconMap = {
  Picture,
  PictureFilled,
  Document,
  Grid,
  Menu,
  Search,
  Goods,
  Bell,
  VideoCamera,
  VideoPlay,
  Tickets,
  Shop,
  UserFilled,
  Timer,
  Scissor,
  Coin,
  Ticket,
  Collection,
  Crop,
  Minus,
  EditPen,
};

const qrcode = ref(""); // 二维码
const selected = ref(0); // 已选下标
// 页面设置默认值（老数据没有这些字段，加载时合并）
const PAGE_SETTING_DEFAULTS = {
  name: "",
  title: "",
  bgType: "color", // color | image
  bgColor: "#F5F5F5",
  bgImage: "",
  bgFill: "stretch", // stretch 拉伸 | contain 缩放 | cover 填充
  topColor: "#ffffff",
  titleColor: "black", // black | white
};
function mergePageData(data) {
  const source = data && typeof data === "object" ? data : {};
  return {
    ...PAGE_SETTING_DEFAULTS,
    ...source,
    list: Array.isArray(source.list) ? source.list : [],
  };
}
const contentData = ref({
  // 总数据
  ...PAGE_SETTING_DEFAULTS,
  list: [],
});
const decorateData = ref(""); // 装修数据
const decoratePromotionsData = ref(""); // 装修数据

watch(
  contentData,
  (val) => {
    appStore.styleStore = val;
  },
  { deep: true, immediate: true }
);

// 画布背景：背景色或背景图（拉伸/缩放/填充）
const canvasStyle = computed(() => {
  const d = contentData.value;
  if (d.bgType === "image" && d.bgImage) {
    const size =
      { stretch: "100% 100%", contain: "contain", cover: "cover" }[d.bgFill] ||
      "100% 100%";
    return {
      backgroundImage: `url(${d.bgImage})`,
      backgroundSize: size,
      backgroundRepeat: "no-repeat",
      backgroundColor: d.bgColor || "#F5F5F5",
    };
  }
  return { backgroundColor: d.bgColor || "#F5F5F5" };
});
// 画布顶部标题栏：背景用顶部颜色，文字色随标题颜色
const titleBarStyle = computed(() => {
  const d = contentData.value;
  return {
    background: d.topColor || "#ffffff",
    color: d.titleColor === "black" ? "#000" : "#fff",
  };
});
// 清空楼层选中，右侧回到页面设置面板
function showPageSetting() {
  selected.value = -1;
  decorateData.value = "";
}

// 组件面板三类分组（drawer 标记的是图片魔方的可选风格，不进左侧组件列表）
const modelGroups = computed(() => {
  const groups = [
    { key: "base", title: "基础组件" },
    { key: "marketing", title: "营销组件" },
    { key: "tools", title: "工具组件" },
  ];
  return groups.map((g) => ({
    ...g,
    list: modelData.filter((m) => m.group === g.key && !m.drawer),
  }));
});

onMounted(() => {
  init();
});

function getModelKey(model) {
  return model.type || model.name;
}
function getContentItemKey(element) {
  return element.key || element.model || element.type;
}
function cloneModel(model) {
  const key = Date.now() + "_" + Math.ceil(Math.random() * 99999);
  // 图片魔方拖入画布时默认使用「左一右二」风格
  const source =
    model.type === "tpl_ad_list"
      ? modelData.find((m) => m.type === "leftOneRightTwo") || model
      : model;
  const cloned = JSON.parse(JSON.stringify(source));
  return {
    ...cloned,
    key,
    model: cloned.type + "_" + key,
  };
}
// 初始化数据
function init() {
  // 先读缓存，如果缓存有值则读缓存。
  const cache = getStore('managerMobilePageCache')
    if(cache){
      Modal.confirm({
      title: '提示',
      content: '获取到本地有缓存数据，是否使用缓存数据？',
      okText: '使用',
      cancelText: '取消',
      onOk: () => {
        const data = JSON.parse(cache);
        contentData.value = mergePageData(data);
      }
    });

    }
  if (!route.query.id) {
    if (route.query.mode !== "add" && (!route.query.pagetype || route.query.pagetype === "INDEX")) {
      API_Other.getHomeList({
        pageNumber: 1,
        pageSize: 10,
        pageType: "INDEX",
        pageClientType: "H5",
      }).then((res) => {
        const records = (res && res.result && res.result.records) || [];
        const active = records.find((r) => r.pageShow === "OPEN") || records[0];
        if (!active || !active.id) return;
        router.replace({
          path: route.path,
          query: {
            ...route.query,
            id: active.id,
            name: active.name,
            type: active.pageShow === "OPEN",
            pagetype: "INDEX",
          },
        });
        API_Other.getHomeData(active.id).then((detail) => {
          const parsed = JSON.parse(detail.result.pageData);
          contentData.value = mergePageData(parsed);
          if (!contentData.value.name) {
            contentData.value.name = active.name || "";
          }
          const first = contentData.value.list[0];
          if (first && templates[first.type]) {
            handleComponent(first, 0);
          }
        });
      });
      return false;
    }
    // 新建页面：模板名称取路由参数
    if (!contentData.value.name) {
      contentData.value.name = route.query.name || "";
    }
    return false;
  }

  API_Other.getHomeData(route.query.id).then((res) => {
    const parsed = JSON.parse(res.result.pageData);
    contentData.value = mergePageData(parsed);
    if (!contentData.value.name) {
      contentData.value.name = route.query.name || "";
    }
    const first = contentData.value.list[0];
    if (first && templates[first.type]) {
      handleComponent(first, 0);
    }
  });

}

// 中间组件拖动，右侧数据绑定不变
function handleContentlEnd(evt) {
  const { newIndex } = evt;
  handleComponent(contentData.value.list[newIndex], newIndex);
}

// 关闭楼层装修
function closeComponent(index) {
  nextTick(() => {
    decorateData.value = "";

    // 如果当前楼层不为一
    if (contentData.value.list.length > 1) {
      // 如果当前最底层 给下一层赋值

      if (index - 1 == -1) {
        handleComponent(contentData.value.list[index], index);
      } else {
        // 如果不是最底层给上一层赋值
        handleComponent(contentData.value.list[index - 1], index - 1);
      }
      contentData.value.list.splice(index, 1);
    } else {
      contentData.value.list.splice(index, 1);
    }
  });
}

// 点击楼层装修
function handleComponent(val, index) {
  selected.value = index;
  decorateData.value = val;
}
// 已下线的未知组件：点击占位条直接删除
function handleUnknownComponent(element, index) {
  console.warn(`[page-decoration] 未知组件类型: ${element.type}`);
  closeComponent(index);
}
// 上移/下移楼层
function moveComponent(index, dir) {
  const target = index + dir;
  if (target < 0 || target >= contentData.value.list.length) return;
  const list = contentData.value.list;
  [list[index], list[target]] = [list[target], list[index]];
  selected.value = target;
  handleComponent(contentData.value.list[target], target);
}
// 复制楼层
function copyComponent(index) {
  const cloned = JSON.parse(JSON.stringify(contentData.value.list[index]));
  const key = Date.now() + "_" + Math.ceil(Math.random() * 99999);
  cloned.key = key;
  cloned.model = cloned.type + "_" + key;
  contentData.value.list.splice(index + 1, 0, cloned);
  handleComponent(contentData.value.list[index + 1], index + 1);
}
// 隐藏/显示楼层（渲染端跳过 hidden 楼层）
function toggleHide(index) {
  const item = contentData.value.list[index];
  item.hidden = !item.hidden;
}
// 右侧栏回调
function handleDrawer(val) {
  let newIndex = selected.value;
  if (val.promotionsType) {
    if (contentData.value.list[newIndex].options.list.length >= 2) {
      Message.error("最多只能展示两个活动");
      return;
    }
    if (val.promotionsType === "LIVE") {
      API_Promotions.getLiveList({
        status: "START",
        pageSize: 1,
        pageNumber: 1,
      }).then((listRes) => {
        const records = listRes.result?.records || [];
        if (!listRes.success || records.length === 0) {
          Message.warning("暂无进行中的直播活动");
          return;
        }
        API_Promotions.getLiveInfo(records[0].id).then((infoRes) => {
          if (infoRes.success) {
            contentData.value.list[newIndex].options.list.push({
              type: val.promotionsType,
              title: val.name,
              title1: val.subName,
              color1: val.subColor,
              bk_color: val.subBkColor,
              data: infoRes.result.commodityList
                ? infoRes.result.commodityList.splice(0, 2)
                : [],
            });
          }
        });
      });
    } else {
      API_Promotions.getAllPromotion().then((res) => {
        let exist = contentData.value.list[newIndex].options.list.find(
          (i) => i.type === val.promotionsType
        );

        if (res.success && !exist) {
          contentData.value.list[newIndex].options.list.push({
            data: res.result[val.promotionsType]
              ? res.result[val.promotionsType].splice(0, 2)
              : [],
            type: val.promotionsType,
            title1: val.subName,
            color1: val.subColor,
            bk_color: val.subBkColor,
            title: val.name,
          });
        }
      });
    }
    contentData.value.list[newIndex] = {
      ...val,
      options: {
        ...contentData.value.list[newIndex].options,
      },
      model: val.type,
    };
  } else {
    decorateData.value = "";

    contentData.value.list[newIndex] = {
      ...val,
      options: {
        ...val.options,
      },
      model: val.type,
    };
    contentData.value.list = JSON.parse(
      JSON.stringify(contentData.value.list)
    );
    decorateData.value = contentData.value.list[newIndex];
  }
}

// 封装拖拽参数
// 原名 package 是 ESM 严格模式保留字，改名 packageModel
function packageModel(val, newIndex) {
  contentData.value.list[newIndex] = "";
  val = JSON.parse(JSON.stringify(val));
  const key = val.key || Date.now() + "_" + Math.ceil(Math.random() * 99999);
  contentData.value.list[newIndex] = {
    ...val,
    options: {
      ...val.options,
    },
    key,
    model: val.model || val.type + "_" + key,
  };
}
// 拖动
function handleContentlAdd(evt) {
  const { newIndex } = evt;

  packageModel(contentData.value.list[newIndex], newIndex);
  handleComponent(contentData.value.list[newIndex], newIndex);
}
function handleMove() {
  return true;
}
</script>
<style scoped lang="scss">
@import "./style.scss";

// 页面设置：画布容器支持悬浮入口、画布背景可透出到拖拽区
.model-view-content {
  position: relative;
}
.page-setting-entry {
  position: absolute;
  top: 12px;
  right: 16px;
  z-index: 200;
  padding: 6px 14px;
  font-size: 13px;
  color: #409eff;
  background: #ffffff;
  border: 1px solid #dcdfe6;
  border-radius: 6px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
  cursor: pointer;
  &:hover {
    border-color: #409eff;
  }
}
.content > .draggable {
  background: transparent;
}
.wap-title {
  border-bottom: none;
}
</style>
