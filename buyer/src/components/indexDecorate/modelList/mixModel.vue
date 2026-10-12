<template>
  <div class="mix-model">
    <!-- 左侧 -->
    <div class="left-card">
      <left :data="data" />
    </div>
    <!-- 右侧 -->
    <div class="right-card">
      <right :data="data" />
    </div>
  </div>
</template>

<script setup>
import left from './mixs/mix-goods'
import right from './mixs/mix-brand'

defineOptions({ name: "mixModel" });

defineProps({
  data: {
    type: Object,
    default: () => ({})
  }
})
</script>

<style scoped lang="scss">
.mix-model{
  display: flex;
  justify-content:space-between;
}
.left-card,.right-card{
  width: 584px;
  height: 344px;
  border-radius: 10px;
  opacity: 1;
  background: #FFFFFF;
  box-shadow: 0px 1px 13px 0px #E5E5E5;
  position: relative;
  overflow: hidden;
}
</style>
