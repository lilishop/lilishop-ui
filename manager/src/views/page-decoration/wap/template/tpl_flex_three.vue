
<template>
  <div class="layout" :style="[wrapperStyle, gapStyle]">
      <img class="image-mode" :style="imgStyle" :src="res.list[0].img" alt="">
      <img class="image-mode" :style="imgStyle" :src="res.list[1].img" alt="">
      <img class="image-mode" :style="imgStyle" :src="res.list[2].img" alt="">
  </div>
</template>

<script>
import { cubeWrapperStyle, cubeImgStyle, cubeGapStyle } from "./cubeStyle";

export default {
  title: "三列单行图片模块",
  props: ["res"],
  computed: {
    wrapperStyle() {
      return cubeWrapperStyle(this.res);
    },
    imgStyle() {
      return cubeImgStyle(this.res);
    },
    gapStyle() {
      return cubeGapStyle(this.res);
    },
  },
};
</script>
<style lang="scss" scoped>
@import "./tpl.scss";
.layout {
   background: #e8e8e8;
  height: 110px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-size: cover;
}
img{
   flex: 1;
   min-width: 0;
}
</style>
