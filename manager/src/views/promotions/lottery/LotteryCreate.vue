<!-- 新增抽奖活动独立页面，沿用券活动添加页的单卡片与分区表单规范。作者 Bulbasaur，2026-11-15。 -->
<template>
  <div class="lottery-create-page">
    <el-card>
      <LotteryForm ref="editor" @saved="returnToList" @cancel="returnToList" />
    </el-card>
  </div>
</template>
<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAppStore } from '@/stores/app';
import LotteryForm from './LotteryForm.vue';
const router = useRouter(), appStore = useAppStore(), editor = ref();
/** 保存、取消或返回均回到抽奖列表；直接打开新增地址时也不依赖浏览器历史。 */
function returnToList() {
  appStore.removeTag('add-lottery-activity');
  localStorage.pageOpenedList = JSON.stringify(appStore.pageOpenedList);
  router.replace('/lottery');
}
</script>
