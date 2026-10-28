<template>
  <div class="model-form" :style="pageContainerStyle">
    <!-- Version 2: 新万米行模型渲染 -->
    <div v-if="isVersion2" class="v2-rows-container">
      <row-wrapper
        v-for="row in v2Rows"
        :key="row.id"
        :row="row"
      />
    </div>

    <!-- 旧版降级渲染 -->
    <div v-else class="model-content">
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
import RowWrapper from './RowWrapper.vue';

defineOptions({ name: 'modelForm' });

const props = defineProps(['data']);

// 是否为 v2 行模型数据
const isVersion2 = computed(() => {
  return (props.data?.version === 2 || props.data?.version === '2.0') && Array.isArray(props.data?.list);
});

const v2Rows = computed(() => {
  return props.data?.list || [];
});

const pageContainerStyle = computed(() => {
  if (isVersion2.value && props.data?.pageStyle?.backgroundColor) {
    return {
      backgroundColor: props.data.pageStyle.backgroundColor
    };
  }
  return {};
});

const renderList = computed(() => {
  const list = props.data?.list || [];
  return list.filter(
    (el) => el && el.key && !isBuiltinModule(el.type)
  );
});

function isBuiltinModule(type) {
  return type === 'topAdvert' || type === 'navBar';
}
</script>

<style lang="scss" scoped>
.model-form {
  position: relative;
  z-index: 0;
  width: 100%;
}

.v2-rows-container {
  width: 100%;
  min-height: 400px;
}

.model-content {
  width: 100%;
  min-height: 1200px;
  box-sizing: border-box;
  overflow-x: visible;
}
</style>
