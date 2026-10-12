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
          :group="{ name: 'model', pull: 'clone', put: false, animation: 150 }"
          :sort="false"
          ghost-class="ghost"
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
            ghost-class="ghost"
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
import { ref, watch, nextTick, onMounted } from "vue";
import { useRoute } from "vue-router";
import { CircleClose } from "@element-plus/icons-vue";
import templates from "./template/index";
import Draggable from "vuedraggable";
import { modelData } from "./config";
import decorate from "./decorate";
import * as API_Other from "@/api/other";
import * as API_Promotions from "@/api/promotion";
import { getStore } from "@/libs/storage";
import { Message, Modal } from "@/utils/message";
import { useAppStore } from "@/stores/app";

const route = useRoute();
const appStore = useAppStore();

const qrcode = ref(""); // 二维码
const selected = ref(0); // 已选下标
const contentData = ref({
  // 总数据
  list: [],
});
const decorateData = ref(""); // 装修数据
const decoratePromotionsData = ref(""); // 装修数据

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
</style>
