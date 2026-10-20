<template>
  <el-dialog
    v-if="goodsFlag"
    v-model="flag"
    width="1160px"
    top="120px"
    :z-index="10000"
    :close-on-click-modal="false"
    append-to-body
    destroy-on-close
    @close="clickClose"
  >
    <goodsDialog
      v-if="flag"
      ref="goodsDialogRef"
      :selectedWay="goodsData"
      @selected="
        (val) => {
          goodsData = val;
        }
      "
    />
    <template #footer>
      <el-button @click="clickClose">取消</el-button>
      <el-button type="primary" @click="clickOK">确定</el-button>
    </template>
  </el-dialog>

  <el-drawer
    v-else
    v-model="flag"
    class="link-selector-drawer"
    direction="rtl"
    size="1160px"
    :with-header="false"
    :z-index="10000"
    :close-on-click-modal="false"
    append-to-body
    destroy-on-close
    @close="clickClose"
  >
    <linkDialog
      v-if="flag"
      class="linkDialog"
      @selectedLink="
        (val) => {
          linkData = val;
        }
      "
    />
    <template #footer>
      <el-button @click="clickClose">取消</el-button>
      <el-button type="primary" @click="clickOK">确定</el-button>
    </template>
  </el-drawer>
</template>
<script setup>
import { ref } from "vue";
import goodsDialog from "./goods-dialog";
import linkDialog from "./link-dialog";

const emit = defineEmits(["closeFlag", "selectedGoodsData", "selectedLink"]);

const goodsFlag = ref(false); // 是否商品选择器
const goodsData = ref([]); //选择的商品
const linkData = ref(""); //选择的链接
const flag = ref(false); // modal显隐

// 模板 ref：原 ref="goodsDialog" 与 import 的组件同名，改名避免互相覆盖
const goodsDialogRef = ref(null);

function clearGoodsSelected() {
  goodsData.value = [];
}
// 关闭弹窗
function clickClose() {
  flag.value = false;
  goodsFlag.value = false;
  emit("closeFlag", false);
}
// 单选商品
function singleGoods() {
  var timer = setInterval(() => {
    if (goodsDialogRef.value) {
      goodsDialogRef.value.type = "single";
      clearInterval(timer);
    }
  }, 100);
}
// 点击确认
function clickOK() {
  if (goodsFlag.value) {
    emit("selectedGoodsData", goodsData.value);
  } else {
    emit("selectedLink", linkData.value);
  }
  clickClose();
}
// 打开组件方法
function open(type, mutiple) {
  flag.value = true;
  if (type == "goods") {
    goodsFlag.value = true;
    if (mutiple) {
      singleGoods();
    }
  } else {
    goodsFlag.value = false;
  }
}
// 关闭组件
function close() {
  flag.value = false;
}

// 外部通过 ref 访问的成员（grep manager/src 全量确认）：
// - open：page-decoration 各 modelList、modelForm/modelFormItem、hotzone/Zone、wap/advertising、alertAdvertising 等打开弹窗（goods/link）
// - singleGoods：modelList/forYour.vue、mixModel.vue 直接调用
// - clearGoodsSelected：wap/decorate.vue、modelList/goodsAndType.vue 调用
// - goodsData：modelList/newGoodsSort.vue、notEnough.vue 回写已选商品
// - goodsFlag：wap/decorate.vue 直接写入
// - flag：wap/decorate.vue 直接写入 true 打开弹窗
// - close：未被 grep 到外部调用，原 Options API 实例天然暴露，保守保留
defineExpose({
  open,
  close,
  singleGoods,
  clearGoodsSelected,
  goodsData,
  goodsFlag,
  flag,
});
</script>
<style scoped lang="scss">
:deep(.el-dialog__body) {
  width: 100%;
  height: 500px;
  overflow: hidden;
}
</style>
<style lang="scss">
// 抽屉 append-to-body 后不在当前组件 DOM 内，不能使用 scoped 样式
.link-selector-drawer {
  max-width: 96vw;
  .el-drawer__body {
    overflow: hidden;
  }
  .goods-select-table,
  .shops-select-table,
  .articles-select-table,
  .specials-select-table {
    height: calc(100vh - 240px) !important;
  }
}
// 商品分类下拉挂载到 body，需要高于抽屉的 10000 层级
.goods-dialog-cascader-popper {
  z-index: 10001 !important;
}
</style>
