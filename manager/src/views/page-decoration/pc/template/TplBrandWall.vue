<template>
  <div class="tpl-brand-wall" :style="customStyle">
    <div
      class="brand-grid"
      :style="{
        gridTemplateColumns: `repeat(${actualColumns}, 1fr)`,
        gap: `${options.gap ?? 12}px`
      }"
    >
      <div
        v-for="(item, idx) in brandList"
        :key="idx"
        class="brand-box"
        @click="handleClickItem(item)"
      >
        <img
          v-if="item.img"
          :src="item.img"
          :alt="item.title || 'brand'"
          class="brand-img"
        />
        <div v-else class="brand-placeholder">
          <span>{{ item.title || item.name || '品牌' }}</span>
        </div>
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

const brandList = computed(() => {
  if (Array.isArray(props.options.items) && props.options.items.length > 0) {
    return props.options.items;
  }
  return [
    { title: '数码潮玩 · 爆款立减500', img: 'https://lilishop-pc.oss-cn-beijing.aliyuncs.com/static/brand-wall/brand_1.png', url: '/goodsList?category=1' },
    { title: '美妆奢宠 · 每满300减50', img: 'https://lilishop-pc.oss-cn-beijing.aliyuncs.com/static/brand-wall/brand_2.png', url: '/goodsList?category=2' },
    { title: '运动潮品 · 爆款低至5折', img: 'https://lilishop-pc.oss-cn-beijing.aliyuncs.com/static/brand-wall/brand_3.png', url: '/goodsList?category=3' },
    { title: '品质生活 · 限时第2件半价', img: 'https://lilishop-pc.oss-cn-beijing.aliyuncs.com/static/brand-wall/brand_4.png', url: '/goodsList?category=4' }
  ];
});

const actualColumns = computed(() => {
  const baseCols = Number(props.options?.columns) || 4;
  const ratio = props.componentStyle?.widthRatio || '100%';
  if (ratio === '33.33%' || ratio === '33.3%') {
    return Math.min(baseCols, 2);
  }
  if (ratio === '50%') {
    return Math.min(baseCols, 2);
  }
  if (ratio === '66.67%' || ratio === '66.6%' || ratio === '66.7%') {
    return Math.min(baseCols, 3);
  }
  return baseCols;
});

const customStyle = computed(() => {
  const s = props.componentStyle || {};
  return {
    backgroundColor: s.backgroundColor || 'transparent',
    padding: Array.isArray(s.padding)
      ? `${s.padding[0]}px ${s.padding[1]}px ${s.padding[2]}px ${s.padding[3]}px`
      : '10px 0'
  };
});

function handleClickItem(item) {
  if (item && item.url) {
    console.log('Navigate to:', item.url);
  }
}
</script>

<style lang="scss" scoped>
.tpl-brand-wall {
  width: 100%;
  user-select: none;
  box-sizing: border-box;

  .brand-grid {
    display: grid;
    width: 100%;

    .brand-box {
      background: #ffffff;
      border: 1px solid #f1f5f9;
      border-radius: 8px;
      overflow: hidden;
      aspect-ratio: 2 / 1;
      width: 100%;
      height: auto;
      min-height: 80px;
      max-height: 180px;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
      cursor: pointer;
      box-sizing: border-box;
      transition: all 0.25s ease;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
        border-color: #e2e8f0;

        .brand-img {
          transform: scale(1.03);
        }
      }

      .brand-img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
        transition: transform 0.25s ease;
      }

      .brand-placeholder {
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        background: #f8fafc;
        color: #64748b;
        font-size: 14px;
        font-weight: 500;
      }
    }
  }
}
</style>
