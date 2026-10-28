<template>
  <div class="tpl-promo-group" :style="customStyle">
    <div
      class="promo-grid"
      :style="{ gridTemplateColumns: `repeat(${actualColumns}, 1fr)` }"
    >
      <div
        v-for="(card, idx) in cardsList"
        :key="idx"
        class="card-item"
        :style="card.bgImg ? { backgroundImage: `url(${card.bgImg})` } : {}"
      >
        <span class="m-t">{{ card.title }}</span>
        <span class="s-t">{{ card.subtitle }}</span>
        <span class="btn">立即查看 ></span>
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

const defaultCards = [
  { title: '限时秒杀', subtitle: '抢券立减50元 · 爆款直降', bgImg: '/static/promo-group/promo_1.png', url: '/goodsList?seckill=1' },
  { title: '品牌特惠', subtitle: '大牌买一送一 · 领百元神券', bgImg: '/static/promo-group/promo_2.png', url: '/goodsList?brand=1' },
  { title: '新品首发', subtitle: '首单专享特惠 · 1元起尝鲜', bgImg: '/static/promo-group/promo_3.png', url: '/goodsList?new=1' }
];

const cardsList = computed(() => {
  if (Array.isArray(props.options?.cards) && props.options.cards.length > 0) {
    return props.options.cards;
  }
  return defaultCards;
});

const actualColumns = computed(() => {
  const baseCols = Number(props.options?.columns) || 3;
  const ratio = props.componentStyle?.widthRatio || '100%';
  if (ratio === '16.67%' || ratio === '16.6%' || ratio === '16.7%') {
    return 1;
  }
  if (ratio === '33.33%' || ratio === '33.3%') {
    return 1;
  }
  if (ratio === '50%') {
    return Math.min(baseCols, 2);
  }
  if (ratio === '66.67%' || ratio === '66.6%' || ratio === '66.7%') {
    return Math.min(baseCols, 2);
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
</script>

<style lang="scss" scoped>
.tpl-promo-group {
  width: 100%;
  user-select: none;
  box-sizing: border-box;

  .promo-grid {
    display: grid;
    gap: 16px;

    .card-item {
      padding: 24px;
      min-height: 150px;
      background-color: #1e293b;
      background-size: cover;
      background-position: center;
      border-radius: 12px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      color: #ffffff;
      box-shadow: 0 4px 14px rgba(0, 0, 0, 0.08);

      .m-t {
        font-size: 22px;
        font-weight: 800;
        color: #ffffff;
        text-shadow: 0 1px 4px rgba(0, 0, 0, 0.3);
      }

      .s-t {
        font-size: 13px;
        color: rgba(255, 255, 255, 0.9);
        margin: 6px 0 14px 0;
        text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
      }

      .btn {
        display: inline-block;
        align-self: flex-start;
        padding: 4px 12px;
        background: rgba(255, 255, 255, 0.25);
        backdrop-filter: blur(4px);
        border: 1px solid rgba(255, 255, 255, 0.4);
        border-radius: 14px;
        font-size: 12px;
        font-weight: 600;
        color: #ffffff;
      }
    }
  }
}
</style>
