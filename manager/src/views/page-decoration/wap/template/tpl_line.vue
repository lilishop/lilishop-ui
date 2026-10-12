<template>
  <div
    class="tpl-line"
    :style="{
      background: res.bgColor ?? '#FFFFFF',
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
};
</script>
