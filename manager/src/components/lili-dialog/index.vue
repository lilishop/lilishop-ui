<template>
  <el-dialog
    v-model="flag"
    width="1160px"
    top="120px"
    :z-index="10000"
    :close-on-click-modal="false"
    append-to-body
    destroy-on-close
    @close="clickClose"
  >
    <template v-if="flag">
      <goodsDialog
        @selected="
          (val) => {
            goodsData = val;
          }
        "
        v-if="goodsFlag"
        ref="goodsDialog"
        :selectedWay="goodsData"
      />
      <linkDialog
        @selectedLink="
          (val) => {
            linkData = val;
          }
        "
        v-else
        class="linkDialog"
      />
    </template>
    <template #footer>
      <el-button @click="clickClose">取消</el-button>
      <el-button type="primary" @click="clickOK">确定</el-button>
    </template>
  </el-dialog>
</template>
<script>
import goodsDialog from "./goods-dialog";
import linkDialog from "./link-dialog";
export default {
  components: {
    goodsDialog,
    linkDialog,
  },
  data() {
    return {
      goodsFlag: false, // 是否商品选择器
      goodsData: [], //选择的商品
      linkData: "", //选择的链接
      flag: false, // modal显隐
    };
  },
  methods: {
    clearGoodsSelected(){
      this.goodsData = []
    },
    // 关闭弹窗
    clickClose() {
      this.flag = false;
      this.goodsFlag = false;
      this.$emit("closeFlag", false);
    },
    // 单选商品
    singleGoods() {
      var timer = setInterval(() => {
        if (this.$refs.goodsDialog) {
          this.$refs.goodsDialog.type = "single";
          clearInterval(timer);
        }
      }, 100);
    },
    // 点击确认
    clickOK() {
      if (this.goodsFlag) {
        this.$emit("selectedGoodsData", this.goodsData);
      } else {
        this.$emit("selectedLink", this.linkData);
      }
      this.clickClose();
    },
    // 打开组件方法
    open(type, mutiple) {
      this.flag = true;
      if (type == "goods") {
        this.goodsFlag = true;
        if (mutiple) {
          this.singleGoods();
        }
      } else {
        this.goodsFlag = false;
      }
    },
    // 关闭组件
    close() {
      this.flag = false;
    },
  },
};
</script>
<style scoped lang="scss">
:deep(.el-dialog__body) {
  width: 100%;
  height: 500px;
  overflow: hidden;
}
</style>
