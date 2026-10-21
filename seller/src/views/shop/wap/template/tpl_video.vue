<template>
  <div class="layout" :style="wrapperStyle">
    <div class="video-shell" :style="boxStyle">
      <div
        class="video-ratio"
        :style="{ paddingBottom: aspectPadding + '%' }"
      >
        <div class="video-ratio-inner">
          <video
            v-if="item.videoUrl"
            class="video-media"
            :src="item.videoUrl"
            :poster="item.poster"
            muted
          />
          <template v-else>
            <img
              v-if="item.poster"
              class="video-media"
              :src="item.poster"
              alt=""
            />
            <div v-else class="video-placeholder">视频楼层</div>
          </template>
          <div class="play-icon">▶</div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { computed } from "vue";
import {
  ensureVideoItem,
  getVideoWrapperStyle,
  getVideoBoxStyle,
  getAspectPadding,
} from "../video-style";

const props = defineProps(["res"]);

const item = computed(() => {
  const data = props.res.list[0] || {};
  ensureVideoItem(data);
  return data;
});

// 面板保存过样式字段（options 级）才启用新样式，老数据走 item.style 体系
const styled = computed(() => props.res && props.res.paddingTop !== undefined);
// 画布 375px ≈ 750rpx，预览按一半像素呈现
const px = (v) => `${(Number(v) || 0) / 2}px`;
const wrapperStyle = computed(() => {
  const res = props.res || {};
  if (!styled.value) return getVideoWrapperStyle(item.value);
  const bg =
    !res.bgColor2 || res.bgColor1 === res.bgColor2
      ? res.bgColor1
      : `linear-gradient(180deg, ${res.bgColor1}, ${res.bgColor2})`;
  return {
    padding: `${px(res.paddingTop)} ${px(res.paddingX)} ${px(res.paddingBottom)}`,
    background: bg,
    borderRadius: px(res.borderRadius),
    marginBottom: px(res.pageGap),
    overflow: Number(res.borderRadius) > 0 ? "hidden" : "visible",
    boxSizing: "border-box",
  };
});
const boxStyle = computed(() => {
  if (!styled.value) return getVideoBoxStyle(item.value);
  return {
    borderRadius: px(props.res.imgRadius),
    overflow: "hidden",
    position: "relative",
    width: "100%",
  };
});
const aspectPadding = computed(() => getAspectPadding(item.value.aspectRatio));
</script>
<style lang="scss" scoped>
.layout {
  padding: 0;
  margin: 0;
  background: transparent;
}

.video-shell {
  width: 100%;
}

.video-ratio {
  width: 100%;
  height: 0;
  position: relative;
}

.video-ratio-inner {
  position: absolute;
  inset: 0;
}

.video-media {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  background: #000;
}

.video-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999;
  font-size: 14px;
  background: #f5f5f5;
}

.play-icon {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 44px;
  height: 44px;
  line-height: 44px;
  text-align: center;
  background: rgba(0, 0, 0, 0.5);
  color: #fff;
  border-radius: 50%;
  font-size: 18px;
  pointer-events: none;
}
</style>
