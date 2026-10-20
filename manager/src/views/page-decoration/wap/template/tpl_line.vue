<template>
  <div
    class="tpl-line"
    :style="{
      background: lineBg,
      padding: `0 ${res.paddingX ?? 0}px`,
      marginBottom: (res.pageGap ?? 10) + 'px',
    }"
  >
    <div
      :style="{
        borderTop: `${res.lineHeight ?? 1}px ${res.lineStyle ?? 'dashed'} ${res.lineColor ?? '#979797'}`,
      }"
    ></div>
  </div>
</template>

<script>
export default {
  name: "tpl_line",
  props: {
    res: { type: Object, default: () => ({}) },
  },
  computed: {
    lineBg() {
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
