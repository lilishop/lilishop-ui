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
import wapList from "./wap.js";
import goodsDialog from "./goods-dialog";
import templateWay from "./template/index";

const emit = defineEmits(["selectedLink"]);

const changed = ref("");
const selected = ref(0);
const selectedLink = ref("");
// wap 为共享的模块级数组，保持原 data 引用同一数组的行为
const wap = ref(wapList);
const activeTab = ref(wapList[0]?.title || "");
// v-for 内模板 ref 收集为数组
const liliComponentRef = ref([]);

watch(
  changed,
  (val) => {
    emit("selectedLink", val[0]);
  },
  { deep: true }
);

onMounted(() => {
  nextTick(() => {
    if (liliComponentRef.value?.[0]) {
      liliComponentRef.value[0].type = "single";
    }
  });
  wap.value.forEach((item) => {
    if (item) {
      item.selected = false;
    }
  });
});
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
