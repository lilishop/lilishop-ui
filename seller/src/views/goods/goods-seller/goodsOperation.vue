<template>
  <div class="goods-operation">
    <div class="step-list">
      <steps :current="activestep" simple style="height:60px;margin-top: 10px" process-status="process">
        <div class="step-view">
          <step title="选择商品品类"/>
        </div>
        <div class="step-view">
          <step title="填写商品详情"/>
        </div>
        <div class="step-view">
          <step title="商品发布成功"/>
        </div>
      </steps>
    </div>
    <!-- 第一步 选择分类 -->
    <first-step ref='first' v-if="activestep === 0"></first-step>
    <!-- 第二步 商品详细信息 -->
    <second-step ref='second' v-if="activestep === 1"></second-step>
    <!-- 第三步 发布完成 -->
    <third-step ref='third' v-if="activestep === 2"></third-step>
    
    
  </div>
</template>

<script>



import firstStep from  './goodsOperationFirst'
import secondStep from  './goodsOperationSec'
import thirdStep from  './goodsOperationThird'
export default {
  name: "addGoods",
  components: {
    firstStep,
    secondStep,
    thirdStep
  },

  data() {
    return {
      /** 当前激活步骤*/
      activestep: '',
    };
  },

  mounted() {
    // 编辑商品、模板
    if (this.$route.query.id || this.$route.query.draftId) {
      this.activestep = 1;
    } else {
      this.activestep = 0
    }
    
  },
  methods: {
    
  }
};
</script>

<style lang="scss" scoped>
@import "./addGoods.scss";
</style>
