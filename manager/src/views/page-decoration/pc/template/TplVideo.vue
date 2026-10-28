<template>
  <div class="tpl-video" :style="customStyle">
    <div class="video-preview-box">
      <img :src="options.coverUrl || '/static/video/video_cover.png'" alt="cover" class="cover-img" />
      <div class="play-btn">▶</div>
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
    height: `${props.options?.height || 360}px`,
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

    .cover-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .play-btn {
      position: absolute;
      width: 50px;
      height: 50px;
      border-radius: 50%;
      background: rgba(225, 29, 72, 0.9);
      color: #ffffff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
      transition: transform 0.2s ease;

      &:hover {
        transform: scale(1.08);
      }
    }
  }
}
</style>
