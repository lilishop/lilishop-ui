<template>
  <div
    class="tpl-blank"
    :style="{
      background: blankBg,
      height: (res.height ?? 10) + 'px',
      margin: `0 ${res.paddingX ?? 0}px ${res.pageGap ?? 10}px`,
    }"
  ></div>
</template>

<script>
export default {
  name: "tpl_blank",
  props: {
    res: { type: Object, default: () => ({}) },
  },
  computed: {
    blankBg() {
      const res = this.res || {};
      if (res.bgColor1 !== undefined) {
        return !res.bgColor2 || res.bgColor1 === res.bgColor2
          ? res.bgColor1
          : `linear-gradient(180deg, ${res.bgColor1}, ${res.bgColor2})`;
      }
      return res.bgColor || "#f5f5f5";
    },
  },
};
</script>
