<template>
  <div
    class="tpl-blank"
    :style="{
      background: res.bgColor,
      height: res.height + 'px',
      margin: `0 ${res.paddingX}px ${res.pageGap}px`,
    }"
  ></div>
</template>

<script>
export default {
  name: "tpl_blank",
  props: {
    res: { type: Object, default: () => ({}) },
  },
};
</script>
