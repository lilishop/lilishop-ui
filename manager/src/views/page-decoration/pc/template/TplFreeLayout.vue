<template>
  <div class="tpl-free-layout" :style="customStyle">
    <div class="layout-hint">
      <span>自由布局画布区 (高度: {{ options.height || 260 }}px)</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  options: {
    type: Object,
    default: () => ({})
  },
  componentStyle: {
    type: Object,
    default: () => ({})
  }
});

const customStyle = computed(() => {
  const s = props.componentStyle || {};
  return {
    height: `${props.options?.height || 450}px`,
    backgroundColor: s.backgroundColor || '#f8fafc',
    borderRadius: Array.isArray(s.radius)
      ? `${s.radius[0]}px ${s.radius[1]}px ${s.radius[2]}px ${s.radius[3]}px`
      : '8px'
  };
});
</script>

<style lang="scss" scoped>
.tpl-free-layout {
  width: 100%;
  border: 1px dashed #cbd5e1;
  display: flex;
  align-items: center;
  justify-content: center;
  user-select: none;
  box-sizing: border-box;

  .layout-hint {
    color: #94a3b8;
    font-size: 13px;
  }
}
</style>
