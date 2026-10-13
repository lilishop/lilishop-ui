<template>
  <div class="layout" :style="wrapperStyle">
    <div class="flex-two" :style="gapStyle">
      <div class="flex-item" :style="imgStyle">
        <img :src="res.list[0].img" alt />
      </div>
      <div class="flex-item" :style="imgStyle">
        <img :src="res.list[1].img" alt />
      </div>
    </div>
  </div>
</template>
<script>
import { cubeWrapperStyle, cubeImgStyle, cubeGapStyle } from "./cubeStyle";

export default {
  title: "两张横图",
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
.flex-two {
  width: 100%;
  display: flex;
  height: 110px;
  overflow: hidden;
}
.flex-item {
  flex: 1;
  min-width: 0;
  > img {
    display: block;
    width: 100%;
    height: 100%;
  }
}
</style>
