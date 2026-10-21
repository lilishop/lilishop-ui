<template>
  <div class="layout" :style="wrapperStyle">
    <div class="search" :style="boxStyle">
      <el-icon><Search /></el-icon>{{ displayText }}
    </div>
    <!-- 微信小程序右上角胶囊按钮 -->
    <div class="capsule">
      <span class="cap-icon">
        <svg width="18" height="5" viewBox="0 0 18 5" fill="currentColor">
          <circle cx="2.5" cy="2.5" r="2" />
          <circle cx="9" cy="2.5" r="2" />
          <circle cx="15.5" cy="2.5" r="2" />
        </svg>
      </span>
      <span class="cap-divider"></span>
      <span class="cap-icon">
        <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
          <circle cx="7.5" cy="7.5" r="6" stroke="currentColor" stroke-width="1.6" />
          <circle cx="7.5" cy="7.5" r="2.2" fill="currentColor" />
        </svg>
      </span>
    </div>
  </div>
</template>
<script setup>
import { computed, ref, watch, onBeforeUnmount } from "vue";
import { Search } from "@element-plus/icons-vue";

const props = defineProps(["res"]);

// 搜索热词轮播：有热词时按切换时间轮换展示，否则展示提示文字
const hotIndex = ref(0);
let hotTimer = null;
const validWords = computed(() =>
  (props.res.hotWords || []).filter((w) => w && w.trim())
);
const displayText = computed(() => {
  if (validWords.value.length) {
    return validWords.value[hotIndex.value % validWords.value.length];
  }
  return (props.res.list && props.res.list[0] && props.res.list[0].title) || "";
});

function stopHot() {
  if (hotTimer) {
    clearInterval(hotTimer);
    hotTimer = null;
  }
}

watch(
  () => [validWords.value.length, props.res.hotInterval],
  () => {
    stopHot();
    hotIndex.value = 0;
    if (validWords.value.length > 1) {
      hotTimer = setInterval(() => {
        hotIndex.value = (hotIndex.value + 1) % validWords.value.length;
      }, (Number(props.res.hotInterval) || 3) * 1000);
    }
  },
  { immediate: true }
);

onBeforeUnmount(stopHot);

// 面板保存过样式字段才启用自定义样式，老数据保持原样
const styled = computed(() => props.res && props.res.paddingX !== undefined);
// 画布 375px ≈ 750rpx，预览按一半像素呈现
const px = (v) => `${(Number(v) || 0) / 2}px`;
const wrapperStyle = computed(() => {
  const res = props.res || {};
  if (!styled.value) return {};
  const bg =
    !res.bgColor2 || res.bgColor1 === res.bgColor2
      ? res.bgColor1
      : `linear-gradient(180deg, ${res.bgColor1}, ${res.bgColor2})`;
  return {
    padding: `0 ${px(res.paddingX)}`,
    background: bg,
    borderRadius: px(res.borderRadius),
    overflow: Number(res.borderRadius) > 0 ? "hidden" : "visible",
  };
});
const boxStyle = computed(() => {
  const res = props.res || {};
  if (!styled.value) return {};
  return {
    background: res.boxColor || "#EDEDED",
    color: res.textColor || "#999999",
    borderRadius: px(res.boxRadius),
    justifyContent: res.textAlign === "center" ? "center" : "flex-start",
  };
});
</script>
<style lang="scss" scoped>
@import "./tpl.scss";
.search {
  flex: 1;
  min-width: 0;
  height: 32px;
  border-radius: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #ededed;
  gap: 4px;
  box-sizing: border-box;
  padding: 0 8px;
}
.layout {
  background: #fff;
  display: flex;
  align-items: center;
  gap: 8px;
}
.capsule {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 30px;
  padding: 0 12px;
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.55);
  box-sizing: border-box;
  color: #303133;
  .cap-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    svg {
      display: block;
    }
  }
  .cap-divider {
    width: 1px;
    height: 16px;
    background: rgba(0, 0, 0, 0.12);
    margin: 0 10px;
  }
}
</style>
