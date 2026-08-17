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
      ref="goodsDialog"
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
      goodsVisible: false,
      linkVisible: false,
      goodsFlag: false,
      goodsData: [],
      linkData: "",
    };
  },
  computed: {
    flag: {
      get() {
        return this.goodsVisible || this.linkVisible;
      },
      set(val) {
        if (val) {
          if (this.goodsFlag) {
            this.goodsVisible = true;
          } else {
            this.linkVisible = true;
          }
        } else {
          this.goodsVisible = false;
          this.linkVisible = false;
        }
      },
    },
  },
  methods: {
    clearGoodsSelected() {
      this.goodsData = [];
    },
    clickClose() {
      this.goodsVisible = false;
      this.linkVisible = false;
      this.goodsFlag = false;
      this.$emit("closeFlag", false);
    },
    singleGoods() {
      const timer = setInterval(() => {
        if (this.$refs.goodsDialog) {
          this.$refs.goodsDialog.type = "single";
          clearInterval(timer);
        }
      }, 100);
    },
    clickOK() {
      if (this.goodsVisible) {
        this.$emit("selectedGoodsData", this.goodsData);
      } else if (this.linkVisible) {
        this.$emit("selectedLink", this.linkData);
      }
      this.clickClose();
    },
    open(type, mutiple) {
      if (type == "goods") {
        this.goodsFlag = true;
        this.goodsVisible = true;
        if (mutiple) {
          this.singleGoods();
        }
      } else {
        this.goodsFlag = false;
        this.linkVisible = true;
      }
    },
    close() {
      this.clickClose();
    },
  },
};
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
