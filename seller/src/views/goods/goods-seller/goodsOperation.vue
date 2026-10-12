<template>
  <div class="goods-operation">
    <!-- 填详情/成功页不再展示顶部步骤条 -->
    <div class="step-list" v-show="activestep === 0">
      <el-steps :active="activestep" align-center style="height: 60px; margin-top: 10px">
        <el-step title="选择商品品类" />
        <el-step title="填写商品详情" />
        <el-step title="商品发布成功" />
      </el-steps>
    </div>
    <!-- 第一步 选择分类 -->
    <first-step ref='firstRef' v-show="activestep === 0" @change="getFirstData"></first-step>
    <!-- 第二步 商品详细信息 -->
    <second-step ref='second' :firstData="firstData" v-if="activestep === 1"></second-step>
    <!-- 第三步 发布完成 -->
    <third-step ref='third' v-if="activestep === 2"></third-step>
    
    
  </div>
</template>
<script setup>
import { onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import firstStep from './goodsOperationFirst'
import secondStep from './goodsOperationSec'
import thirdStep from './goodsOperationThird'

defineOptions({ name: "addGoods" });

const route = useRoute();

const firstRef = ref(null);

/** 当前激活步骤*/
const activestep = ref(0);
const firstData = ref({}); // 第一步传递的数据

// 子组件 goodsOperationSec 通过 $parent.activestep-- 回退一步
defineExpose({ activestep });

// 选择商品分类回调
function getFirstData (item) {
  firstData.value = item;
  activestep.value = 1;
}

onMounted(() => {
  // 编辑商品、模板、复制商品
  if (route.query.id || route.query.draftId || route.query.copyId) {
    activestep.value = 1;
  } else {
    activestep.value = 0
    firstRef.value.selectGoodsType = true;
  }
});
</script>
<style lang="scss" scoped>
@import "./addGoods.scss";
</style>
