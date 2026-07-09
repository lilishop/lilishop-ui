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
      goodsFlag: false,
      goodsData: [],
      linkData: "",
      flag: false,
    };
  },
  methods: {
    clearGoodsSelected() {
      this.goodsData = [];
    },
    clickClose() {
      this.flag = false;
      this.goodsFlag = false;
      this.$emit("closeFlag", false);
    },
    singleGoods() {
      var timer = setInterval(() => {
        if (this.$refs.goodsDialog) {
          this.$refs.goodsDialog.type = "single";
          clearInterval(timer);
        }
      }, 100);
    },
    clickOK() {
      if (this.goodsFlag) {
        this.$emit("selectedGoodsData", this.goodsData);
      } else {
        this.$emit("selectedLink", this.linkData);
      }
      this.clickClose();
    },
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
