<template>
  <div
    class="tpl-blank"
    :style="{
      background: blankBg,
      height: px(res.height ?? 10),
      margin: `0 ${px(res.paddingX ?? 0)} ${px(res.pageGap ?? 0)}`,
    }"
  ></div>
</template>

<script>
const px = (v) => `${(Number(v) || 0) / 2}px`;

export default {
  name: "tpl_blank",
  props: {
    res: { type: Object, default: () => ({}) },
  },
  methods: {
    px,
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
