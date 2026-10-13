
<template>
  <div class="layout" :style="[wrapperStyle, gapStyle]">
    <img class="image-mode" :style="imgStyle" :src="res.list[0].img" alt="">
    <img class="image-mode" :style="imgStyle" :src="res.list[1].img" alt="">
    <img class="image-mode" :style="imgStyle" :src="res.list[2].img" alt="">
    <img class="image-mode" :style="imgStyle" :src="res.list[3].img" alt="">
    <img class="image-mode" :style="imgStyle" :src="res.list[4].img" alt="">
  </div>
</template>

<script setup>
import { computed } from "vue";
import { cubeWrapperStyle, cubeImgStyle, cubeGapStyle } from "./cubeStyle";

defineOptions({ title: "五列单行图片模块" });
const props = defineProps(["res"]);

const wrapperStyle = computed(() => cubeWrapperStyle(props.res));
const imgStyle = computed(() => cubeImgStyle(props.res));
const gapStyle = computed(() => cubeGapStyle(props.res));
</script>
<style lang="scss" scoped>
@import "./tpl.scss";
.layout {
  background: #e8e8e8;
  display: flex;
  align-items: center;
  justify-content: center;
  background-size: cover;
}
img {
  flex: 1;
  min-width: 0;
}
</style>
