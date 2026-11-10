<!--
  商家端-满赠活动列表页
  @author Bulbasaur
  @since 2026-11-09
-->
<template>
  <FullDiscountList default-activity-type="FULL_GIFT" />
</template>

<script setup>
import FullDiscountList from "./full-discount.vue";

defineOptions({ name: "store-full-gift" });
</script>
