<template>
  <div class="model-form">
    <div class="model-content">
      <model-form-item
        v-for="(element, index) in renderList"
        :key="element.key"
        :element="element"
        :index="index"
        :data="data"
      ></model-form-item>
    </div>
  </div>
</template>
<script setup>
import { computed } from 'vue';
import ModelFormItem from './ModelFormItem.vue';

defineOptions({ name: 'modelForm' });

const props = defineProps(['data']);

const renderList = computed(() => {
  const list = props.data?.list || [];
  return list.filter(
    (el) => el && el.key && !isBuiltinModule(el.type)
  );
});

function isBuiltinModule(type) {
  // 顶部广告、快捷导航由 Index 页单独渲染
  return type === 'topAdvert' || type === 'navBar';
}
</script>
<style lang="scss" scoped>
.model-form {
  position: relative;
  z-index: 0;
  width: 100%;
}
.model-content {
  width: 100%;
  min-height: 1200px;
  box-sizing: border-box;
  /* 勿设 overflow-x: hidden，会裁切 discountAdvert 的 margin-left: -100px 左溢背景 */
  overflow-x: visible;
}
</style>
