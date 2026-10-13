<template>
  <div class="layout" :style="wrapperStyle">
    <div class="banner-box" :style="cardMode ? {} : boxStyle">
      <el-carousel
        class="carousel"
        :class="{ 'card-mode': cardMode }"
        v-if="res"
        autoplay
        :interval="5000"
        height="150px"
        :type="cardMode ? 'card' : ''"
        :indicator-position="customIndicator ? 'none' : ''"
        @change="onChange"
      >
        <el-carousel-item v-for="(item, index) in res.list" :key="index">
          <div class="slide-wrap">
            <img class="image-mode" :style="boxStyle" :src="item.img" />
          </div>
        </el-carousel-item>
      </el-carousel>
      <div
        v-if="customIndicator && res.indicatorStyle !== 'none' && res.list.length > 1"
        class="indicator"
        :class="'pos-' + (res.indicatorPosition || 'center')"
      >
        <div
          v-for="(item, i) in res.list"
          :key="i"
          class="dot"
          :class="[res.indicatorStyle || 'round', { active: i === current }]"
          :style="i === current ? { background: indicatorColor } : {}"
        ></div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref, computed } from "vue";

defineOptions({ title: "导航栏" });
const props = defineProps(["res"]);

const current = ref(0);

// 配置过样式字段才启用自定义样式/指示器，老数据保持原样
const customIndicator = computed(
  () => props.res && props.res.indicatorStyle !== undefined
);
const cardMode = computed(() => props.res && props.res.swiperStyle === "card");
const indicatorColor = computed(() =>
  props.res.indicatorColorMode === "custom" && props.res.indicatorColor
    ? props.res.indicatorColor
    : "#409eff"
);
const wrapperStyle = computed(() => {
  const res = props.res || {};
  if (res.paddingTop === undefined) return {};
  const bg =
    !res.bgColor2 || res.bgColor1 === res.bgColor2
      ? res.bgColor1
      : `linear-gradient(180deg, ${res.bgColor1}, ${res.bgColor2})`;
  // 画布 375px ≈ 750rpx，预览按一半像素呈现
  const px = (v) => `${(Number(v) || 0) / 2}px`;
  return {
    padding: `${px(res.paddingTop)} ${px(res.paddingX)} ${px(res.paddingBottom)}`,
    background: bg,
    borderRadius: px(res.borderRadius),
    marginBottom: px(res.pageGap),
  };
});
const boxStyle = computed(() => {
  const res = props.res || {};
  if (res.imgRadius === undefined) return {};
  return { borderRadius: `${(Number(res.imgRadius) || 0) / 2}px` };
});

function onChange(index) {
  current.value = index;
}
</script>
<style lang="scss" scoped>
@import "./tpl.scss";
.carousel,
.image-mode {
  height: 150px;
}
.banner-box {
  position: relative;
  overflow: hidden;
}
.slide-wrap {
  height: 100%;
  padding: 0 3px;
  box-sizing: border-box;
}
.image-mode {
  width: 100%;
  display: block;
  overflow: hidden;
}
// 卡片模式：卡片铺满轮播项，去掉 el-carousel 默认卡片白底阴影
.card-mode {
  :deep(.el-carousel__item--card) {
    background: transparent;
    box-shadow: none;
  }
  :deep(.el-carousel__mask) {
    background: transparent;
  }
}
.indicator {
  position: absolute;
  bottom: 8px;
  display: flex;
  align-items: center;
  z-index: 2;
  &.pos-left {
    left: 12px;
  }
  &.pos-center {
    left: 50%;
    transform: translateX(-50%);
  }
  &.pos-right {
    right: 12px;
  }
  .dot {
    background: rgba(255, 255, 255, 0.7);
    transition: background 0.3s ease;
    &.round {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      margin: 0 3px;
    }
    &.line {
      width: 12px;
      height: 3px;
      border-radius: 2px;
      margin: 0 2px;
    }
  }
}
</style>
