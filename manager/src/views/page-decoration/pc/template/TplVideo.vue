<template>
  <div class="tpl-video" :style="customStyle">
    <div class="video-preview-box">
      <video
        v-if="options.videoUrl"
        :src="options.videoUrl"
        :poster="options.coverUrl"
        :controls="options.controls !== false"
        muted
        class="video-el"
      />
      <template v-else>
        <img
          :src="options.coverUrl || 'https://lilishop-pc.oss-cn-beijing.aliyuncs.com/static/video/video_cover.png'"
          alt="cover"
          class="cover-img"
        />
        <div class="play-btn">▶</div>
      </template>

      <!-- 链接徽标（装修态提示） -->
      <div class="video-link-badge" v-if="options.url" :title="options.url">
        <span class="badge-icon">🔗</span>
        <span class="badge-text">{{ options.url }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  options: {
    type: Object,
    default: () => ({})
  },
  componentStyle: {
    type: Object,
    default: () => ({})
  }
});

const customStyle = computed(() => {
  const s = props.componentStyle || {};
  return {
    height: `${props.options?.height || 450}px`,
    borderRadius: Array.isArray(s.radius)
      ? `${s.radius[0]}px ${s.radius[1]}px ${s.radius[2]}px ${s.radius[3]}px`
      : '8px'
  };
});
</script>

<style lang="scss" scoped>
.tpl-video {
  width: 100%;
  background: #0f172a;
  overflow: hidden;
  user-select: none;
  box-sizing: border-box;

  .video-preview-box {
    width: 100%;
    height: 100%;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;

    .video-el {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }

    .cover-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }

    .play-btn {
      position: absolute;
      width: 54px;
      height: 54px;
      border-radius: 50%;
      background: rgba(225, 29, 72, 0.9);
      color: #ffffff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 22px;
      box-shadow: 0 4px 14px rgba(0, 0, 0, 0.35);
      transition: transform 0.2s ease;
      cursor: pointer;

      &:hover {
        transform: scale(1.08);
      }
    }

    .video-link-badge {
      position: absolute;
      top: 12px;
      right: 12px;
      max-width: 60%;
      display: flex;
      align-items: center;
      gap: 5px;
      padding: 4px 10px;
      background: rgba(15, 23, 42, 0.75);
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 20px;
      backdrop-filter: blur(4px);
      font-size: 11px;
      color: #e2e8f0;
      overflow: hidden;
      pointer-events: none;

      .badge-icon {
        font-size: 11px;
        flex-shrink: 0;
      }

      .badge-text {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }
  }
}
</style>
