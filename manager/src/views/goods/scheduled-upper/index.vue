<template>
  <goods-list scheduled-only read-only />
</template>

<script setup>
/**
 * 平台商品定时上架列表。
 * @author Bulbasaur
 * @since 2026-11-03
 */
import GoodsList from "@/views/goods/goods-info/goods.vue";

defineOptions({ name: "goodsScheduledUpper" });
</script>
