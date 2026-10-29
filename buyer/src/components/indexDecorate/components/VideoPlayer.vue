<template>
  <div
    class="decor-video-player"
    :class="{ 'has-link': !!options.url }"
    :style="customStyle"
    @click="handleClickPlaceholder"
  >
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
        backgroundImage: `url(${options.coverUrl || 'https://lilishop-pc.oss-cn-beijing.aliyuncs.com/static/video/video_cover.png'})`
      }"
    >
      <div class="video-play-hint">
        <span class="play-icon">▶</span>
        <span class="hint-text">{{ options.title || '官方品牌宣传片' }}</span>
      </div>
    </div>

    <!-- 跳转行动点徽标（如果配置了链接） -->
    <div
      v-if="options.url"
      class="video-cta-badge"
      @click.stop="handleNavigate"
      title="点击查看详情"
    >
      <span class="cta-dot"></span>
      <span class="cta-text">查看活动详情</span>
      <span class="cta-arrow">&gt;</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

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

function handleNavigate() {
  const url = props.options?.url ? String(props.options.url).trim() : '';
  if (!url) return;
  if (/^https?:\/\//i.test(url)) {
    window.open(url, '_blank');
  } else {
    router.push(url);
  }
}

function handleClickPlaceholder() {
  if (!props.options?.videoUrl && props.options?.url) {
    handleNavigate();
  }
}
</script>

<style lang="scss" scoped>
.decor-video-player {
  width: 100%;
  position: relative;
  overflow: hidden;
  box-sizing: border-box;

  &.has-link {
    .video-placeholder {
      cursor: pointer;
    }
  }

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
      transition: transform 0.2s ease, background 0.2s ease;

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

    &:hover .video-play-hint {
      transform: scale(1.04);
      background: rgba(15, 23, 42, 0.85);
    }
  }

  .video-cta-badge {
    position: absolute;
    top: 16px;
    right: 16px;
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px 14px;
    background: rgba(15, 23, 42, 0.8);
    border: 1px solid rgba(255, 255, 255, 0.25);
    border-radius: 20px;
    backdrop-filter: blur(8px);
    color: #ffffff;
    font-size: 12px;
    font-weight: 500;
    cursor: pointer;
    box-shadow: 0 4px 14px rgba(0, 0, 0, 0.25);
    transition: all 0.2s ease;
    z-index: 10;

    .cta-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: #e11d48;
      box-shadow: 0 0 8px #e11d48;
    }

    .cta-text {
      letter-spacing: 0.3px;
    }

    .cta-arrow {
      font-size: 11px;
      opacity: 0.8;
      transition: transform 0.2s ease;
    }

    &:hover {
      background: rgba(225, 29, 72, 0.9);
      border-color: rgba(255, 255, 255, 0.4);
      transform: translateY(-1px);
      box-shadow: 0 6px 18px rgba(225, 29, 72, 0.35);

      .cta-arrow {
        transform: translateX(2px);
      }
    }
  }
}
</style>
