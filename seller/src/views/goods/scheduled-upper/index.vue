<template>
  <goods-list scheduled-only />
</template>

<script setup>
/**
 * 商家商品定时上架列表，复用统一的商品筛选和列表布局。
 * @author Bulbasaur
 * @since 2026-11-03
 */
import GoodsList from "@/views/goods/goods-seller/goods.vue";

defineOptions({ name: "goodsScheduledUpper" });
</script>
