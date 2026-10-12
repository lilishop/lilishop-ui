<template>
  <div
    class="tpl-rich-text"
    :style="{
      background: res.bgColor ?? '#FFFFFF',
      padding: `0 ${res.paddingX ?? 12}px`,
      marginBottom: (res.pageGap ?? 10) + 'px',
      borderRadius: (res.borderRadius ?? 0) + 'px',
      overflow: 'hidden',
    }"
  >
    <div class="rich-content" v-html="res.content ?? ''"></div>
  </div>
</template>

<script>
export default {
  name: "tpl_rich_text",
  props: {
    res: { type: Object, default: () => ({}) },
  },
};
</script>

<style scoped lang="scss">
.rich-content {
  :deep(img) {
    max-width: 100%;
    height: auto;
  }
}
</style>
