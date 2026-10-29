<template>
  <div
    class="decor-carousel"
    :class="[
      isMini ? 'is-mini' : (isCompact ? 'is-compact' : '')
    ]"
    :style="customStyle"
  >
    <el-carousel
      :autoplay="options.autoPlay !== false"
      :interval="Number(options.interval) || 4000"
      :arrow="options.showArrow ? 'hover' : 'never'"
      :indicator-position="options.showIndicator !== false ? '' : 'none'"
      class="custom-carousel"
    >
      <el-carousel-item v-for="(slide, idx) in slidesList" :key="idx">
        <router-link :to="slide.url || '/'" class="slide-link">
          <img
            :src="slide.img"
            :alt="slide.title || 'banner'"
            class="slide-img"
          />
        </router-link>
      </el-carousel-item>
    </el-carousel>
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

const isMini = computed(() => props.componentStyle?.widthRatio === '16.67%');
const isCompact = computed(() => props.componentStyle?.widthRatio === '33.33%');

const slidesList = computed(() => {
  if (Array.isArray(props.options.list) && props.options.list.length > 0) {
    return props.options.list;
  }
  if (Array.isArray(props.options.banners) && props.options.banners.length > 0) {
    return props.options.banners.map(b => ({
      title: b.title,
      img: b.image || b.img || b.url,
      url: b.url || b.link
    }));
  }
  return [
    { title: '出游囤好货', img: 'https://lilishop-pc.oss-cn-beijing.aliyuncs.com/static/carousel/banner_1.png', url: '/goodsList?seckill=1' },
    { title: '科技新品', img: 'https://lilishop-pc.oss-cn-beijing.aliyuncs.com/static/carousel/banner_2.png', url: '/goodsList?category=1' },
    { title: '原产地直采', img: 'https://lilishop-pc.oss-cn-beijing.aliyuncs.com/static/carousel/banner_3.png', url: '/goodsList?category=2' },
    { title: '大牌美妆', img: 'https://lilishop-pc.oss-cn-beijing.aliyuncs.com/static/carousel/banner_4.png', url: '/goodsList?category=3' }
  ];
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
  const fit = props.options.fitMode || 'contain';

  const styleObj = {
    borderRadius: Array.isArray(s.radius)
      ? `${s.radius[0]}px ${s.radius[1]}px ${s.radius[2]}px ${s.radius[3]}px`
      : '8px',
    backgroundColor: s.backgroundColor || '#ffffff',
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
</script>

<style lang="scss" scoped>
.decor-carousel {
  width: 100%;
  position: relative;
  overflow: hidden;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
  box-sizing: border-box;

  .custom-carousel {
    width: 100%;
    height: 100%;

    :deep(.el-carousel__container) {
      height: 100% !important;
      position: relative;
    }

    :deep(.el-carousel__indicators--horizontal) {
      bottom: 14px;
      z-index: 10;

      .el-carousel__indicator {
        padding: 4px;

        .el-carousel__button {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background-color: rgba(0, 0, 0, 0.35);
          opacity: 1;
          transition: all 0.25s;
        }

        &.is-active .el-carousel__button {
          width: 22px;
          border-radius: 5px;
          background-color: #ea580c;
        }
      }
    }

    .slide-link {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      height: 100%;
      background: #ffffff;

      .slide-img {
        width: 100%;
        height: 100%;
        max-width: 100%;
        max-height: 100%;
        object-fit: var(--carousel-fit, contain) !important;
        object-position: center;
        display: block;
      }
    }
  }

  &.is-compact {
    :deep(.el-carousel__arrow) {
      width: 26px;
      height: 26px;
      font-size: 12px;
    }
    :deep(.el-carousel__indicators--horizontal) {
      bottom: 8px;
      .el-carousel__indicator {
        padding: 2px;
        .el-carousel__button {
          width: 6px;
          height: 6px;
        }
        &.is-active .el-carousel__button {
          width: 14px;
        }
      }
    }
  }

  &.is-mini {
    :deep(.el-carousel__arrow) {
      width: 20px;
      height: 20px;
      font-size: 10px;
    }
    :deep(.el-carousel__indicators--horizontal) {
      bottom: 4px;
      .el-carousel__indicator {
        padding: 1px;
        .el-carousel__button {
          width: 4px;
          height: 4px;
        }
        &.is-active .el-carousel__button {
          width: 10px;
        }
      }
    }
  }
}
</style>
