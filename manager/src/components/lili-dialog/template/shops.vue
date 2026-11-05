<template>
  <StoreSelector embedded :multiple="false" :query-params="shopQuery" @selected="selectShop" />
</template>
<script setup>
import StoreSelector from '@/components/store-selector/index.vue';
// Author: Bulbasaur; 2026-11-05. 装修链接复用统一店铺选择组件，保留单选及启用店铺范围。
const emit = defineEmits(['selected']);
const shopQuery = { storeDisable: 'OPEN' };
function selectShop(rows) { emit('selected', rows.map(row => ({ ...row, ___type: 'shops' }))); }
</script>
