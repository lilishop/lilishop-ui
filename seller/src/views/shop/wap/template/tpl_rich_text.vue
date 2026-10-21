<template>
  <div
    class="tpl-rich-text"
    :style="{
      background: richBg,
      padding: `0 ${px(res.paddingX ?? 12)}`,
      marginBottom: px(res.pageGap ?? 0),
      borderRadius: px(res.borderRadius ?? 0),
      overflow: 'hidden',
    }"
  >
    <div class="rich-content" v-html="res.content ?? ''"></div>
  </div>
</template>

<script>
const px = (v) => `${(Number(v) || 0) / 2}px`;

export default {
  name: "tpl_rich_text",
  props: {
    res: { type: Object, default: () => ({}) },
  },
  methods: {
    px,
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
