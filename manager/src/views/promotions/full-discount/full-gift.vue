<!--
  管理端-满赠活动列表页
  @author Bulbasaur
  @since 2026-11-09
-->
<template>
  <FullDiscountList default-activity-type="FULL_GIFT" />
</template>

<script setup>
import FullDiscountList from "./full-discount.vue";

defineOptions({ name: "manager-full-gift" });
</script>
