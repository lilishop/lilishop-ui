<template>
  <div
    class="tpl-line"
    :style="{
      background: lineBg,
      padding: `0 ${px(res.paddingX ?? 0)}`,
      marginBottom: px(res.pageGap ?? 0),
    }"
  >
    <div
      :style="{
        borderTop: `${Math.max(1, (Number(res.lineHeight ?? 1) || 1) / 2)}px ${res.lineStyle ?? 'dashed'} ${res.lineColor ?? '#979797'}`,
      }"
    ></div>
  </div>
</template>

<script>
const px = (v) => `${(Number(v) || 0) / 2}px`;

export default {
  name: "tpl_line",
  props: {
    res: { type: Object, default: () => ({}) },
  },
  methods: {
    px,
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
