<template>
  <div class="decor-promo-group" :style="customStyle">
    <div
      class="promo-grid"
      :style="{ gridTemplateColumns: `repeat(${actualColumns}, 1fr)` }"
    >
      <router-link
        v-for="(card, idx) in cardsList"
        :key="idx"
        :to="card.url || '/goods'"
        class="promo-card"
        :style="card.bgImg ? { backgroundImage: `url(${card.bgImg})` } : {}"
      >
        <div class="card-inner">
          <h3 class="card-title">{{ card.title }}</h3>
          <p class="card-sub">{{ card.subtitle }}</p>
          <span class="action-btn">立即查看 ></span>
        </div>
      </router-link>
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
.decor-promo-group {
  width: 100%;
  box-sizing: border-box;

  .promo-grid {
    display: grid;
    gap: 16px;

    .promo-card {
      min-height: 160px;
      padding: 24px;
      background-color: #1e293b;
      background-size: cover;
      background-position: center;
      border-radius: 12px;
      text-decoration: none;
      display: flex;
      flex-direction: column;
      justify-content: center;
      color: #ffffff;
      transition: all 0.25s ease;
      box-shadow: 0 4px 14px rgba(0, 0, 0, 0.08);

      &:hover {
        transform: translateY(-3px);
        box-shadow: 0 10px 24px rgba(0, 0, 0, 0.15);
      }

      .card-inner {
        .card-title {
          font-size: 22px;
          font-weight: 800;
          color: #ffffff;
          margin: 0;
          text-shadow: 0 1px 4px rgba(0, 0, 0, 0.3);
        }

        .card-sub {
          font-size: 13px;
          color: rgba(255, 255, 255, 0.9);
          margin: 6px 0 14px 0;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
        }

        .action-btn {
          display: inline-block;
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
}
</style>
