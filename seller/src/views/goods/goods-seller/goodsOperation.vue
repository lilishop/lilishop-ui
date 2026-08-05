<template>
  <div class="goods-operation">
    <!-- 填写商品详细信息（含商品类型、商品分类） -->
    <second-step ref="second" :firstData="firstData" v-if="activestep === 1"></second-step>
    <!-- 发布完成 -->
    <third-step ref="third" v-if="activestep === 2"></third-step>
  </div>
</template>
<script>
import secondStep from "./goodsOperationSec";
import thirdStep from "./goodsOperationThird";
export default {
  name: "addGoods",
  components: {
    secondStep,
    thirdStep,
  },

  data() {
    return {
      /** 当前激活步骤：1 填写详情，2 发布成功 */
      activestep: 1,
      firstData: {},
    };
  },
  mounted() {
    window.scrollTo(0, 0);
  },
};
</script>
<style lang="scss" scoped>
@import "./addGoods.scss";
</style>
