<template>
  <div class="decor-video-player" :style="customStyle">
    <video
      v-if="options.videoUrl"
      :src="options.videoUrl"
      :poster="options.coverUrl"
      :autoplay="options.autoPlay"
      :loop="options.loop"
      :controls="options.controls !== false"
      :muted="options.autoPlay"
      :style="{ height: `${options.height || 450}px` }"
      class="video-element"
    />
    <div
      v-else
      class="video-placeholder"
      :style="{
        height: `${options.height || 450}px`,
        backgroundImage: `url(${options.coverUrl || '/static/video/video_cover.png'})`
      }"
    >
      <div class="video-play-hint">
        <span class="play-icon">▶</span>
        <span class="hint-text">官方品牌宣传片</span>
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
    borderRadius: Array.isArray(s.radius)
      ? `${s.radius[0]}px ${s.radius[1]}px ${s.radius[2]}px ${s.radius[3]}px`
      : '8px'
  };
});
</script>

<style lang="scss" scoped>
.decor-video-player {
  width: 100%;
  overflow: hidden;
  box-sizing: border-box;

  .video-element {
    width: 100%;
    object-fit: cover;
    display: block;
    border-radius: inherit;
  }

  .video-placeholder {
    width: 100%;
    background: #0f172a;
    background-size: cover;
    background-position: center;
    border-radius: inherit;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #64748b;
    font-size: 14px;
    position: relative;

    .video-play-hint {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 10px;
      padding: 16px 24px;
      background: rgba(15, 23, 42, 0.7);
      border-radius: 12px;
      backdrop-filter: blur(4px);
      border: 1px solid rgba(255, 255, 255, 0.15);

      .play-icon {
        width: 48px;
        height: 48px;
        background: #e11d48;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #ffffff;
        font-size: 20px;
        padding-left: 3px;
        box-shadow: 0 4px 14px rgba(225, 29, 72, 0.4);
      }

      .hint-text {
        color: #ffffff;
        font-size: 13px;
        font-weight: 600;
        letter-spacing: 0.5px;
      }
    }
  }
}
</style>
