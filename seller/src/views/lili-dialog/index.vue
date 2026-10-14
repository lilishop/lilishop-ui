<template>
  <el-drawer
    v-model="goodsVisible"
    title="选择商品"
    direction="rtl"
    size="85%"
    :z-index="10000"
    :close-on-click-modal="false"
    append-to-body
    destroy-on-close
    class="lili-goods-drawer"
  >
    <goodsDialog
      v-if="goodsVisible"
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
  </el-drawer>

  <el-dialog
    v-model="linkVisible"
    width="1160px"
    top="120px"
    :z-index="10000"
    :close-on-click-modal="false"
    append-to-body
    destroy-on-close
    @close="clickClose"
  >
    <linkDialog
      v-if="linkVisible"
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
  </el-dialog>
</template>
<script setup>
import { computed, ref } from "vue";
import goodsDialog from "./goods-dialog";
import linkDialog from "./link-dialog";

const emit = defineEmits(["closeFlag", "selectedGoodsData", "selectedLink"]);

const goodsVisible = ref(false);
const linkVisible = ref(false);
const goodsFlag = ref(false);
const goodsData = ref([]);
const linkData = ref("");

// 模板 ref：原 ref="goodsDialog" 与 import 的组件同名，改名避免互相覆盖
const goodsDialogRef = ref(null);

const flag = computed({
  get() {
    return goodsVisible.value || linkVisible.value;
  },
  set(val) {
    if (val) {
      if (goodsFlag.value) {
        goodsVisible.value = true;
      } else {
        linkVisible.value = true;
      }
    } else {
      goodsVisible.value = false;
      linkVisible.value = false;
    }
  },
});

function clearGoodsSelected() {
  goodsData.value = [];
}
function clickClose() {
  goodsVisible.value = false;
  linkVisible.value = false;
  goodsFlag.value = false;
  emit("closeFlag", false);
}
function singleGoods() {
  const timer = setInterval(() => {
    if (goodsDialogRef.value) {
      goodsDialogRef.value.type = "single";
      clearInterval(timer);
    }
  }, 100);
}
function clickOK() {
  if (goodsVisible.value) {
    emit("selectedGoodsData", goodsData.value);
  } else if (linkVisible.value) {
    emit("selectedLink", linkData.value);
  }
  clickClose();
}
function open(type, mutiple) {
  if (type == "goods") {
    goodsFlag.value = true;
    goodsVisible.value = true;
    if (mutiple) {
      singleGoods();
    }
  } else {
    goodsFlag.value = false;
    linkVisible.value = true;
  }
}
// 外部通过 ref 访问的成员（grep seller/src 全量确认）：
// - open：所有调用方打开弹窗（goods/link）
// - singleGoods：shop/modelList/forYour.vue、mixModel.vue 直接调用
// - clearGoodsSelected：shop/wap/decorate.vue、modelList/goodsAndType.vue 调用
// - goodsData：促销/采购/装修多处回写已选商品
// - goodsFlag：shop/wap/decorate.vue 直接写入
// - flag（可写 computed）：shop/wap/decorate.vue 写入触发弹层开关
defineExpose({
  open,
  singleGoods,
  clearGoodsSelected,
  goodsData,
  goodsFlag,
  flag,
});
</script>
<style scoped lang="scss">
.lili-goods-drawer {
  :deep(.el-drawer__body) {
    display: flex;
    flex-direction: column;
    padding: 12px 20px;
    overflow: hidden;
  }

  :deep(.el-drawer__footer) {
    border-top: 1px solid #ebeef5;
    padding: 12px 20px;
    text-align: right;
  }
}

:deep(.el-dialog__body) {
  width: 100%;
  height: 640px;
  overflow: hidden;
}
</style>
