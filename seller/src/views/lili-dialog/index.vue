<template>
  <Modal
    :title="title"
    :styles="{ top: '120px' }"
    width="750"
    @on-cancel="clickClose"
    @on-ok="clickOK"
    v-model="flag"
    :mask-closable="false"
    scrollable
  >
    <goodsDialog
      @selected="
        (val) => {
          goodsData = val;
        }
      "
      ref="goodsDialog"
      v-if="goodsFlag"
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
  </Modal>
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
      title: "选择", // 模态框标题
      goodsFlag: false, // 是否商品选择器
      goodsData: "", //选择的商品
      linkData: "", //选择的链接
      flag: false, // 控制模态框显隐
    };
  },
  props: ["types"],
  watch: {},
  mounted() {},
  methods: {
    // 关闭弹窗
    clickClose() {
      this.$emit("closeFlag", false);
      this.goodsFlag = false;
    },

    // 单选商品
    singleGoods(){

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
      // this.clearFlag = false
    },
    open(type){
      this.flag = true;
      if(type == 'goods'){
        this.goodsFlag = true;
      } else {
        this.goodsFlag = false
      }

    },
    close(){
      this.flag = false;
    }
  },
};
</script>
<style scoped lang="scss">
/deep/ .ivu-modal {
  overflow: hidden;
  height: 650px !important;
}
/deep/ .ivu-modal-body {
  width: 100%;
  height: 500px;
  overflow: hidden;
}
</style>
