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
<script setup>
import { computed } from "vue";
import { cubeWrapperStyle, cubeImgStyle, cubeGapStyle } from "./cubeStyle";

defineOptions({ title: "两张横图" });
const props = defineProps(["res"]);

const wrapperStyle = computed(() => cubeWrapperStyle(props.res));
const imgStyle = computed(() => cubeImgStyle(props.res));
const gapStyle = computed(() => cubeGapStyle(props.res));
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
