<template>
  <div class="layout" :style="wrapperStyle">
    <div class="menu-list" :class="{ styled: styled }" :style="listStyle">
      <div class="menu-item" v-for="(item, index) in res.list" :key="index">
        <div class="menu-img-wrap" :style="imgStyle">
          <img class="menu-img" :src="item.img" alt="" />
        </div>
        <div class="menu-title" :style="titleStyle">{{ item.title }}</div>
      </div>
    </div>
  </div>
</template>
<script>
import { cubeWrapperStyle, cubeImgStyle } from "./cubeStyle";

export default {
  props: ["res"],
  computed: {
    // 面板保存过样式字段才启用自定义样式，老数据保持原样
    styled() {
      return this.res && this.res.paddingTop !== undefined;
    },
    wrapperStyle() {
      return cubeWrapperStyle(this.res);
    },
    imgStyle() {
      return cubeImgStyle(this.res);
    },
    listStyle() {
      return this.styled
        ? { rowGap: `${(Number(this.res.contentGap) || 0) / 2}px` }
        : {};
    },
    titleStyle() {
      return this.styled && this.res.textColor
        ? { color: this.res.textColor }
        : {};
    },
  },
};
</script>
<style lang="scss" scoped>
@import "./tpl.scss";
.menu-list {
  display: flex;
  align-items: flex-start;
  flex-wrap: wrap;

  > .menu-item {
    text-align: center;
    width: 20%;
    margin: 10px 0;
  }

  &.styled > .menu-item {
    margin: 0;
  }
}
.menu-img-wrap {
  width: 44px;
  height: 44px;
  margin: 0 auto;
  overflow: hidden;
}
.menu-img {
  width: 44px;
  height: 44px;
}
.menu-title {
  font-size: 12px;
}
</style>
