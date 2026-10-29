<template>
  <div class="not-found-page">
    <TopBar></TopBar>
    <SearchHeader :options="{ showHotWords: false }"></SearchHeader>
    <div class="not-found">
      <h1>页面不存在</h1>
      <p>你访问的地址没有对应页面</p>
      <el-button type="primary" @click="$router.push('/')">返回首页</el-button>
    </div>
    <BaseFooter></BaseFooter>
  </div>
</template>

<script setup>
import TopBar from '@/components/indexDecorate/components/TopBar.vue';
import SearchHeader from '@/components/indexDecorate/components/SearchHeader.vue';

defineOptions({ name: "NotFound" });
</script>

<style scoped lang="scss">
.not-found {
  width: 1200px;
  min-height: 420px;
  margin: 24px auto 40px;
  background: #fff;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.not-found h1 {
  margin: 0;
  color: #333;
  font-size: 28px;
  font-weight: 600;
}

.not-found p {
  margin: 12px 0 24px;
  color: #999;
  font-size: 14px;
}
</style>
