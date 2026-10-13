
<template>
  <div class="layout" :style="[wrapperStyle, gapStyle]">
    <div class="view-height-150" :style="imgStyle">
      <img class="image-mode" :src="res.list[0].img" />
    </div>
    <div class="view-height-150">
      <div class="view-height-75" :style="imgStyle">
        <img class="image-mode" :src="res.list[1].img" alt />
      </div>
      <div class="view-height-75" :style="imgStyle">
        <img class="image-mode" :src="res.list[2].img" alt />
      </div>
    </div>
  </div>
</template>

<script>
import { cubeWrapperStyle, cubeImgStyle, cubeGapStyle } from "./cubeStyle";

export default {
  title: "左一右二",
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
}
.view-height-150 {
  min-width: 0;
}

</style>
