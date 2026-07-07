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
<script>
import {
  ensureVideoItem,
  getVideoWrapperStyle,
  getVideoBoxStyle,
  getAspectPadding,
} from "../video-style";

export default {
  props: ["res"],
  computed: {
    item() {
      const data = this.res.list[0] || {};
      ensureVideoItem(data);
      return data;
    },
    wrapperStyle() {
      return getVideoWrapperStyle(this.item);
    },
    boxStyle() {
      return getVideoBoxStyle(this.item);
    },
    aspectPadding() {
      return getAspectPadding(this.item.aspectRatio);
    },
  },
};
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
