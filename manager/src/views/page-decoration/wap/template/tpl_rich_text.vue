<template>
  <div
    class="tpl-rich-text"
    :style="{
      background: richBg,
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
  computed: {
    richBg() {
      const res = this.res || {};
      if (res.bgColor1 !== undefined) {
        return !res.bgColor2 || res.bgColor1 === res.bgColor2
          ? res.bgColor1
          : `linear-gradient(180deg, ${res.bgColor1}, ${res.bgColor2})`;
      }
      return res.bgColor || "#FFFFFF";
    },
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
