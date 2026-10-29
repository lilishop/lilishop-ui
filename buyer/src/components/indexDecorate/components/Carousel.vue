<template>
  <div
    class="decor-carousel"
    :class="[
      isMini ? 'is-mini' : (isCompact ? 'is-compact' : '')
    ]"
    :style="customStyle"
  >
    <el-carousel
      height="100%"
      :autoplay="options.autoPlay !== false"
      :interval="Number(options.interval) || 4000"
      :arrow="options.showArrow !== false ? 'hover' : 'never'"
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
  },
  rowStyle: {
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
    { title: '潮流数码', img: 'https://lilishop-pc.oss-cn-beijing.aliyuncs.com/static/carousel/banner_1.png', url: '/goodsList?category=1' },
    { title: '奢宠美妆', img: 'https://lilishop-pc.oss-cn-beijing.aliyuncs.com/static/carousel/banner_2.png', url: '/goodsList?category=2' },
    { title: '运动潮流', img: 'https://lilishop-pc.oss-cn-beijing.aliyuncs.com/static/carousel/banner_3.png', url: '/goodsList?category=3' },
    { title: '居家生活', img: 'https://lilishop-pc.oss-cn-beijing.aliyuncs.com/static/carousel/banner_4.png', url: '/goodsList?category=4' }
  ];
});

const customStyle = computed(() => {
  const s = props.componentStyle || {};
  const fit = props.options.fitMode || 'cover';
  const hasRowHeight = Boolean(props.rowStyle?.height && Number(props.rowStyle.height) > 0);

  const styleObj = {
    borderRadius: Array.isArray(s.radius) && s.radius.some(r => r > 0)
      ? `${s.radius[0]}px ${s.radius[1]}px ${s.radius[2]}px ${s.radius[3]}px`
      : '8px',
    backgroundColor: (s.backgroundColor && s.backgroundColor !== 'transparent') ? s.backgroundColor : '#ffffff',
    '--carousel-fit': fit,
    height: '100%',
    minHeight: hasRowHeight ? '0' : '420px'
  };

  if (props.options.aspectRatio === 'custom' && props.options.height) {
    styleObj.height = `${props.options.height}px`;
    styleObj.minHeight = `${props.options.height}px`;
  }
  return styleObj;
});
</script>

<style lang="scss" scoped>
.decor-carousel {
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
  box-sizing: border-box;
  display: flex;
  flex-direction: column;

  .custom-carousel {
    width: 100%;
    height: 100%;
    flex: 1;

    :deep(.el-carousel__container) {
      height: 100% !important;
      position: relative;
    }

    :deep(.el-carousel__indicators--horizontal) {
      bottom: 12px;
      z-index: 10;
      background: rgba(0, 0, 0, 0.18);
      border-radius: 10px;
      padding: 3px 8px;
      backdrop-filter: blur(2px);

      .el-carousel__indicator {
        padding: 3px;

        .el-carousel__button {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background-color: rgba(255, 255, 255, 0.6);
          opacity: 1;
          transition: all 0.25s;
        }

        &.is-active .el-carousel__button {
          width: 16px;
          border-radius: 3px;
          background-color: #409EFF;
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
        object-fit: var(--carousel-fit, cover);
        display: block;
      }
    }
  }

  &.is-mini {
    :deep(.el-carousel__indicators--horizontal) {
      bottom: 8px;
    }
  }
}
</style>
