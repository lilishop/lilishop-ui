<template>
  <div
    class="tpl-carousel"
    :class="[
      isMini ? 'is-mini' : (isCompact ? 'is-compact' : '')
    ]"
    :style="customStyle"
  >
    <div class="carousel-container">
      <!-- 轮播图主屏 -->
      <transition name="carousel-fade" mode="out-in">
        <div :key="currentIdx" class="slide-view">
          <img
            :src="currentSlide.img"
            :alt="currentSlide.title || 'banner'"
            class="slide-img"
          />
        </div>
      </transition>

      <!-- 左右切换箭头按钮 -->
      <template v-if="options.showArrow !== false && slidesList.length > 1">
        <div class="arrow-btn prev-btn" @click.stop="prevSlide">
          <el-icon><ArrowLeft /></el-icon>
        </div>
        <div class="arrow-btn next-btn" @click.stop="nextSlide">
          <el-icon><ArrowRight /></el-icon>
        </div>
      </template>

      <!-- 底部指示点 -->
      <div
        v-if="options.showIndicator !== false && slidesList.length > 1"
        class="carousel-indicators"
      >
        <span
          v-for="(_, idx) in slidesList"
          :key="idx"
          class="indicator-dot"
          :class="{ active: currentIdx === idx }"
          @click.stop="currentIdx = idx"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue';
import { ArrowLeft, ArrowRight } from '@element-plus/icons-vue';

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

const currentIdx = ref(0);
let timer = null;

const isMini = computed(() => props.componentStyle?.widthRatio === '16.67%');
const isCompact = computed(() => props.componentStyle?.widthRatio === '33.33%');

const slidesList = computed(() => {
  if (Array.isArray(props.options.list) && props.options.list.length > 0) {
    return props.options.list;
  }
  return [
    { title: '出游囤好货', img: '/static/carousel/banner_1.png', url: '/goodsList?seckill=1' },
    { title: '科技新品', img: '/static/carousel/banner_2.png', url: '/goodsList?category=1' },
    { title: '原产地直采', img: '/static/carousel/banner_3.png', url: '/goodsList?category=2' },
    { title: '大牌美妆', img: '/static/carousel/banner_4.png', url: '/goodsList?category=3' }
  ];
});

const currentSlide = computed(() => {
  return slidesList.value[currentIdx.value] || slidesList.value[0];
});

function getAspectRatioCss(ratio) {
  if (ratio === '16:9') return '16 / 9';
  if (ratio === '2:1') return '2 / 1';
  if (ratio === '3:1') return '3 / 1';
  if (ratio === 'custom') return null;
  return '2.5 / 1';
}

const customStyle = computed(() => {
  const s = props.componentStyle || {};
  const fit = props.options.fitMode || 'cover';

  const styleObj = {
    borderRadius: Array.isArray(s.radius)
      ? `${s.radius[0]}px ${s.radius[1]}px ${s.radius[2]}px ${s.radius[3]}px`
      : '0px',
    '--carousel-fit': fit
  };

  if (props.options.height) {
    styleObj.height = `${props.options.height}px`;
    styleObj.aspectRatio = 'auto';
  } else {
    const ratio = props.options.aspectRatio || '2.5:1';
    const ratioCss = getAspectRatioCss(ratio);
    if (ratioCss) {
      styleObj.aspectRatio = ratioCss;
      styleObj['--carousel-ratio'] = ratioCss;
    } else {
      styleObj.height = `${s.height || 420}px`;
      styleObj.aspectRatio = 'auto';
    }
  }

  return styleObj;
});

function prevSlide() {
  const len = slidesList.value.length;
  currentIdx.value = (currentIdx.value - 1 + len) % len;
  resetTimer();
}

function nextSlide() {
  const len = slidesList.value.length;
  currentIdx.value = (currentIdx.value + 1) % len;
  resetTimer();
}

function startTimer() {
  stopTimer();
  if (props.options.autoPlay !== false && slidesList.value.length > 1) {
    const interval = Number(props.options.interval) || 4000;
    timer = setInterval(() => {
      const len = slidesList.value.length;
      currentIdx.value = (currentIdx.value + 1) % len;
    }, interval);
  }
}

function stopTimer() {
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
}

function resetTimer() {
  startTimer();
}

watch(
  () => [props.options.autoPlay, props.options.interval, slidesList.value.length],
  () => {
    startTimer();
  }
);

onMounted(() => {
  startTimer();
});

onBeforeUnmount(() => {
  stopTimer();
});
</script>

<style lang="scss" scoped>
.tpl-carousel {
  width: 100%;
  position: relative;
  overflow: hidden;
  user-select: none;
  background: #f8fafc;
  box-sizing: border-box;

  .carousel-container {
    width: 100%;
    height: 100%;
    position: relative;

    .slide-view {
      width: 100%;
      height: 100%;

      .slide-img {
        width: 100%;
        height: 100%;
        object-fit: var(--carousel-fit, contain);
        display: block;
      }
    }

    // 切换动效
    .carousel-fade-enter-active,
    .carousel-fade-leave-active {
      transition: opacity 0.4s ease;
    }
    .carousel-fade-enter-from,
    .carousel-fade-leave-to {
      opacity: 0;
    }

    // 左右箭头按钮
    .arrow-btn {
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: rgba(15, 23, 42, 0.35);
      color: #ffffff;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      font-size: 16px;
      transition: all 0.2s ease;
      z-index: 10;
      backdrop-filter: blur(2px);

      &:hover {
        background: rgba(15, 23, 42, 0.65);
        transform: translateY(-50%) scale(1.08);
      }

      &.prev-btn {
        left: 16px;
      }

      &.next-btn {
        right: 16px;
      }
    }

    // 底部指示点
    .carousel-indicators {
      position: absolute;
      bottom: 14px;
      left: 50%;
      transform: translateX(-50%);
      display: flex;
      align-items: center;
      gap: 8px;
      z-index: 10;

      .indicator-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.65);
        cursor: pointer;
        transition: all 0.25s ease;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.15);

        &.active {
          width: 22px;
          border-radius: 5px;
          background: #ea580c;
        }

        &:hover:not(.active) {
          background: #ffffff;
        }
      }
    }
  }

  &.is-compact {
    .arrow-btn {
      width: 26px;
      height: 26px;
      font-size: 12px;
      &.prev-btn { left: 8px; }
      &.next-btn { right: 8px; }
    }
    .carousel-indicators {
      bottom: 8px;
      gap: 5px;
      .indicator-dot {
        width: 6px;
        height: 6px;
        &.active { width: 14px; }
      }
    }
  }

  &.is-mini {
    .arrow-btn {
      width: 20px;
      height: 20px;
      font-size: 10px;
      &.prev-btn { left: 4px; }
      &.next-btn { right: 4px; }
    }
    .carousel-indicators {
      bottom: 4px;
      gap: 3px;
      .indicator-dot {
        width: 4px;
        height: 4px;
        &.active { width: 10px; }
      }
    }
  }
}
</style>
