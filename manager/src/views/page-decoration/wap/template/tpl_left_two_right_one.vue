
<template>
  <div class="layout " :style="[wrapperStyle, gapStyle]">
    <div class="view-height-150">
      <div class="view-height-75" :style="imgStyle">
        <img class="image-mode" :src="res.list[0].img" alt />
      </div>
      <div class="view-height-75" :style="imgStyle">
        <img class="image-mode" :src="res.list[1].img" alt />
      </div>
    </div>
    <div class="view-height-150" :style="imgStyle">
      <img class="image-mode" style="height:150px;" :src="res.list[2].img" />
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { cubeWrapperStyle, cubeImgStyle, cubeGapStyle } from "./cubeStyle";

defineOptions({ title: "左二右一" });
const props = defineProps(["res"]);

const wrapperStyle = computed(() => cubeWrapperStyle(props.res));
const imgStyle = computed(() => cubeImgStyle(props.res));
const gapStyle = computed(() => cubeGapStyle(props.res));
</script>
<style lang="scss" scoped>
@import "./tpl.scss";
.layout {
  height: 150px;
  display: flex;
  align-items: center;
  justify-content: center;

  background-size: cover;
}
.view-height-150 {
  min-width: 0;
}
.view-height-75 {
  .image-mode {
    height: 75px;
  }
}
</style>
