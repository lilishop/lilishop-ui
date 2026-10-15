<template>
  <div class="wrapper">
    <!-- 拖拽栏 ，展示栏  -->
    <div class="model-view">
      <div class="model-view-menu">
        <draggable
          class="model-view-menu-item"
          :list="modelData"
          :item-key="getModelKey"
          :clone="cloneModel"
          :move="handleMove"
          v-bind="{
            group: { name: 'model', pull: 'clone', put: false, animation: 150 },
            sort: false,
            ghostClass: 'ghost',
          }"
        >
          <template #item="{ element: model }">
            <li
              v-if="!model.drawer && !model.drawerPromotions"
              class="model-item"
            >
              <img src alt />
              <span>{{ model.name }}</span>
            </li>
          </template>
        </draggable>
      </div>

      <div class="model-view-content">
        <div class="content">
          <div class="wap-title">首页</div>
          <draggable
            class="draggable"
            group="model"
            ghostClass="ghost"
            @add="handleContentlAdd"
            @end="handleContentlEnd"
            v-model="contentData.list"
            :item-key="getContentItemKey"
          >
            <template #item="{ element, index }">
              <div class="list">
                <component
                  class="component"
                  :class="{ active: selected == index }"
                  @click="handleComponent(element, index)"
                  :is="templates[element.type]"
                  :res="element.options"
                ></component>
                <el-icon
                  v-if="selected == index"
                  @click="closeComponent(index)"
                  class="close"
                  :size="25"
                  color="#e1251b"
                >
                  <CircleClose />
                </el-icon>
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
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref, watch, onMounted, nextTick } from "vue";
import { useRoute } from "vue-router";
import { CircleClose } from "@element-plus/icons-vue";
import templates from "./template/index";
import Draggable from "vuedraggable";
import { modelData } from "./config";
import decorate from "./decorate";
import * as API_Other from "@/api/other";
import { getStore } from "@/libs/storage";
import { Modal } from "@/utils/message";
import { useAppStore } from "@/stores/app";

const route = useRoute();
const appStore = useAppStore();

// templates: 模板类型，modelData: 装修模型，均为 import 常量，模板中直接使用
const selected = ref(0); // 已选下标
const contentData = ref({
  // 总数据
  list: [],
});
const decorateData = ref(""); // 装修数据

watch(
  contentData,
  (val) => {
    appStore.styleStore = val;
  },
  { deep: true }
);

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
  const cloned = JSON.parse(JSON.stringify(model));
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
        contentData.value = data;
      }
    });

    }
  if (!route.query.id) return false;

  API_Other.getHomeData(route.query.id).then((res) => {
    contentData.value = JSON.parse(res.result.pageData);

    handleComponent(contentData.value.list[0], 0);
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
// 右侧栏回调
function handleDrawer(val) {
  const newIndex = selected.value;
  decorateData.value = "";
  contentData.value.list[newIndex] = {
    ...val,
    options: {
      ...val.options,
    },
    model: val.type,
  };
  contentData.value = JSON.parse(JSON.stringify(contentData.value));
  decorateData.value = contentData.value.list[newIndex];
}

// 封装拖拽参数（原名 package，ESM 严格模式下为保留字，改名 packageModel）
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
</style>
