<template>
  <div class="wrapper">
    <el-tabs v-model="activeTab" class="tabs">
      <el-tab-pane
        :label="item.title"
        :name="item.title"
        v-for="(item, i) in wap"
        :key="i"
      >
        <component
          ref="liliComponentRef"
          :is="templateWay[item.name]"
          @selected="
            (val) => {
              changed = val;
            }
          "
        />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>
<script setup>
import { nextTick, onMounted, ref, watch } from "vue";
import { useRoute } from "vue-router";
import wapList from "./wap.js";
import goodsDialog from "./goods-dialog";
import templateWay from "./template/index";

const emit = defineEmits(["selectedLink"]);

const route = useRoute();

const changed = ref(""); // 变更模板
const selected = ref(0); // 已选数据
const selectedLink = ref(""); //选中的链接
// wap 为共享的模块级数组，保持原 data 引用同一数组的行为
const wap = ref(wapList); // tab标签
const activeTab = ref(wapList[0]?.title || "");
// v-for 内模板 ref 收集为数组；原名 lili-component 含连字符，改名并同步 script
const liliComponentRef = ref([]);

watch(
  changed,
  (val) => {
    emit("selectedLink", val[0]); //因为是单选，所以直接返回第一个
  },
  { deep: true }
);

onMounted(() => {
  nextTick(() => {
    if (liliComponentRef.value?.[0]) {
      liliComponentRef.value[0].type = "single"; //商品页面设置成为单选
    }
  });
  let url = window.location.href;
  if (url.indexOf("/floorList/renovation") != -1) {
    //此处去重防止移动楼层多次点击push 太多数据
    let obj = {};
    wap.value = wap.value.reduce((cur, next) => {
      //对象去重
      if (next.title != undefined) {
        obj[next.title]
          ? ""
          : (obj[next.title] = true && cur.push(next));
      }
      return cur;
    }, []);
    if (route.path !== "/floorList/main") {
      wap.value.forEach((items, indexs) => {
        if (items.title == "活动") {
          wap.value.splice(indexs, 1);
        }
      });
    }
  } else {
    wap.value.push({
      title: "活动",
      url: "3",
      name: "marketing",
    });
    let obj = {};
    wap.value = wap.value.reduce((cur, next) => {
      //对象去重
      if (next.title != undefined) {
        obj[next.title]
          ? ""
          : (obj[next.title] = true && cur.push(next));
      }
      return cur;
    }, []);
  }
  wap.value.forEach((item) => {
    if (item) {
      item.selected = false;
    }
  });
});

// 无 defineExpose：grep manager/src 全量确认无外部 ref/$refs/$parent 访问本组件成员
</script>
<style scoped lang="scss">
@import "./style.scss";
.wap-content-list {
  display: flex;
  flex-wrap: wrap;
}
.wap-flex {
  margin: 2px;
}
.tabs {
  width: 100%;
}

:deep(.el-tabs__content) {
  height: 500px;
  overflow: auto;
}
</style>
