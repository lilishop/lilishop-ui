<template>
  <div
    class="tpl-line"
    :style="{
      background: res.bgColor,
      padding: `0 ${res.paddingX}px`,
      marginBottom: res.pageGap + 'px',
    }"
  >
    <div
      :style="{
        borderTop: `${res.lineHeight}px ${res.lineStyle} ${res.lineColor}`,
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
};
</script>
