
<template>
  <div class="layout" :style="[wrapperStyle, gapStyle]">
    <div class="view-width-100" :style="imgStyle">
      <img class="image-mode" :src="res.list[0].img" />
    </div>
    <div class="view-width-100" :style="gapStyle">
      <div class="view-height-85" :style="imgStyle">
        <img class="image-mode" :src="res.list[1].img" alt />
      </div>
      <div class="view-height-85" :style="imgStyle">
        <img class="image-mode" :src="res.list[2].img" alt />
      </div>
    </div>
  </div>
</template>

<script>
import { cubeWrapperStyle, cubeImgStyle, cubeGapStyle } from "./cubeStyle";

export default {
  title: "上一下二",
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
  display: flex;
  align-items: center;
  justify-content: center;
  background-size: cover;
  flex-direction: column;
}
img {
  width: 100% !important;
  height: 85px !important;
}
.view-width-100 {
  padding: 1px 0;
  display: flex;
  height: 85px;
}
.view-height-85 {
  padding: 0 1px;
  flex: 1;
  min-width: 0;
}
</style>
