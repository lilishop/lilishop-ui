<template>
  <div
    class="tpl-blank"
    :style="{
      background: res.bgColor ?? '#f5f5f5',
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
};
</script>
