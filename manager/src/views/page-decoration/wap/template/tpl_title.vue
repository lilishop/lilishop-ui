<template>
  <div class="layout" :style="wrapperStyle">
    <!-- 新样式：左标题+副标题，右侧更多 -->
    <div v-if="styled" class="title-bar" :style="barStyle">
      <div class="title-left">
        <span class="title-main" :style="mainStyle">{{ item.title }}</span>
        <span class="title-sub" :style="subStyle" v-if="item.title1">{{ item.title1 }}</span>
      </div>
      <div v-if="item.showMore" class="title-more" :style="moreStyle">
        {{ item.moreText || "更多" }} &gt;
      </div>
    </div>
    <!-- 老数据：保持原样 -->
    <div
      v-else
      class="background"
      :style="{ backgroundColor: item.bk_color, textAlign: item.textAlign }"
    >
      <div class="title" :style="{ color: item.color }">{{ item.title }}</div>
      <div class="legacy-sub">
        <a :style="{ color: item.color1 }" style="text-decoration: none">{{ item.title1 }}</a>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";

defineOptions({ title: "标题栏" });
const props = defineProps(["res"]);

const item = computed(() => props.res?.list?.[0] || {});

// 面板保存过样式字段才启用新样式，老数据保持原样
const styled = computed(() => props.res && props.res.paddingTop !== undefined);

const px = (v) => `${(Number(v) || 0) / 2}px`;
const wrapperStyle = computed(() => {
  const res = props.res || {};
  if (!styled.value) return {};
  return {
    padding: `${px(res.paddingTop)} ${px(res.paddingX)} ${px(res.paddingBottom)}`,
    marginBottom: px(res.pageGap),
    borderRadius: `${px(res.radiusTop)} ${px(res.radiusTop)} ${px(res.radiusBottom)} ${px(res.radiusBottom)}`,
    overflow:
      Number(res.radiusTop) > 0 || Number(res.radiusBottom) > 0 ? "hidden" : "visible",
    background: "#ffffff",
    boxSizing: "border-box",
  };
});
const barStyle = computed(() => {
  const it = item.value;
  if (it.bgType === "image" && it.bgImage) {
    return {
      backgroundImage: `url(${it.bgImage})`,
      backgroundSize: "cover",
      backgroundPosition: "center",
    };
  }
  return { backgroundColor: it.bk_color || "#FFFFFF" };
});
const mainStyle = computed(() => ({
  color: item.value.color || "#282828",
  fontSize: px(item.value.fontSize || 20),
  fontWeight: item.value.textStyle === "bold" ? "bold" : "normal",
  fontStyle: item.value.textStyle === "italic" ? "italic" : "normal",
}));
const subStyle = computed(() => ({
  color: item.value.color1 || "#282828",
  fontSize: px(item.value.subFontSize || 14),
}));
const moreStyle = computed(() => ({
  color: item.value.moreColor || "#282828",
  fontSize: px(item.value.moreFontSize || 12),
}));
</script>
<style lang="scss" scoped>
@import "./tpl.scss";
.layout {
  background: #ffffff;
}
.title-bar {
  width: 100%;
  min-height: 42px;
  display: flex;
  align-items: center;
  padding: 0 12px;
  box-sizing: border-box;
}
.title-left {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: baseline;
  overflow: hidden;
}
.title-main {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.title-sub {
  margin-left: 6px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.title-more {
  flex-shrink: 0;
}
.background {
  background-color: rgb(255, 87, 62);
  position: relative;
  z-index: 2;
  width: 100%;
  height: 42px;
  background-size: cover;
  display: flex;
  align-items: center;
  justify-content: center;
}
.legacy-sub {
  position: absolute;
  right: 10px;
  top: 2px;
  color: #fff;
  line-height: 42px;
  font-size: 10px;
}
.title {
  line-height: 42px;
  font-size: 18px;
  font-weight: bold;
  margin-left: 4px;
}
</style>
