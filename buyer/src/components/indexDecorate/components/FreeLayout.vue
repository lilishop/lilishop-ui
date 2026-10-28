<template>
  <div class="decor-free-layout" :style="customStyle">
    <div
      v-for="(el, idx) in options.elements"
      :key="idx"
      class="free-element"
      :style="{
        top: `${el.top || 0}px`,
        left: `${el.left || 0}px`,
        width: el.width ? `${el.width}px` : 'auto',
        height: el.height ? `${el.height}px` : 'auto'
      }"
    >
      <img v-if="el.type === 'image'" :src="el.src" alt="" style="width:100%;height:100%;object-fit:cover;" />
      <span v-else-if="el.type === 'text'">{{ el.text }}</span>
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
    height: `${props.options?.height || 320}px`,
    backgroundColor: s.backgroundColor || 'transparent',
    padding: Array.isArray(s.padding)
      ? `${s.padding[0]}px ${s.padding[1]}px ${s.padding[2]}px ${s.padding[3]}px`
      : '0',
    borderRadius: Array.isArray(s.radius)
      ? `${s.radius[0]}px ${s.radius[1]}px ${s.radius[2]}px ${s.radius[3]}px`
      : '0'
  };
});
</script>

<style lang="scss" scoped>
.decor-free-layout {
  position: relative;
  width: 100%;
  overflow: hidden;
  box-sizing: border-box;

  .free-element {
    position: absolute;
  }
}
</style>
