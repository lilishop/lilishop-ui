<template>
  <div class="decor-coupon-list" :class="`skin-${options.skin || 'red'}`" :style="customStyle">
    <div
      class="coupon-grid"
      :style="{ gridTemplateColumns: `repeat(${actualColumns}, 1fr)` }"
    >
      <div
        v-for="(cp, idx) in coupons"
        :key="idx"
        class="coupon-card"
      >
        <div class="card-left">
          <div class="amount-wrap">
            <span class="symbol">￥</span>
            <span class="amount">{{ cp.price }}</span>
          </div>
          <span class="threshold">{{ cp.consumeThreshold ? `满 ${cp.consumeThreshold} 可用` : '无门槛' }}</span>
        </div>
        <div class="card-right">
          <span class="scope">{{ cp.title }}</span>
          <button type="button" class="claim-btn" @click="handleClaim(cp)">
            立即领取
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { ElMessage } from 'element-plus';

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

const defaultCoupons = [
  { id: '1', price: 20, consumeThreshold: 199, title: '全品类通用券', limitText: '全场通用 无门槛限制' },
  { id: '2', price: 50, consumeThreshold: 399, title: '数码家电专享券', limitText: '数码/手机/家电可用' },
  { id: '3', price: 100, consumeThreshold: 699, title: '大牌美妆特惠券', limitText: '美妆奢护专区可用' },
  { id: '4', price: 10, consumeThreshold: 99, title: '新客首单立减券', limitText: '首次下单专享福利' }
];

const actualColumns = computed(() => {
  const baseCols = Number(props.options?.columns) || 4;
  const ratio = props.componentStyle?.widthRatio || '100%';
  if (ratio === '16.67%' || ratio === '16.6%' || ratio === '16.7%') {
    return 1;
  }
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
      : '10px 0',
    borderRadius: Array.isArray(s.radius)
      ? `${s.radius[0]}px ${s.radius[1]}px ${s.radius[2]}px ${s.radius[3]}px`
      : '0'
  };
});

const coupons = computed(() => {
  if (Array.isArray(props.options?.coupons) && props.options.coupons.length > 0) {
    return props.options.coupons;
  }
  const count = props.options?.columns || 4;
  return defaultCoupons.slice(0, count);
});

function handleClaim(cp) {
  ElMessage.success(`领取成功！￥${cp.price} 优惠券已放入您的卡券包`);
}
</script>

<style lang="scss" scoped>
.decor-coupon-list {
  width: 100%;

  .coupon-grid {
    display: grid;
    gap: 16px;

    .coupon-card {
      display: flex;
      height: 90px;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
      transition: transform 0.2s;

      &:hover {
        transform: translateY(-2px);
      }

      .card-left {
        width: 120px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        color: #ffffff;
        padding: 8px;

        .amount-wrap {
          display: flex;
          align-items: baseline;

          .symbol { font-size: 14px; font-weight: 700; }
          .amount { font-size: 28px; font-weight: 800; }
        }

        .threshold {
          font-size: 11px;
          opacity: 0.9;
        }
      }

      .card-right {
        flex: 1;
        background: #ffffff;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        padding: 12px 14px;

        .scope {
          font-size: 13px;
          font-weight: 600;
          color: #1e293b;
        }

        .claim-btn {
          align-self: flex-start;
          padding: 4px 12px;
          border-radius: 14px;
          border: none;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: opacity 0.2s;

          &:hover { opacity: 0.85; }
        }
      }
    }
  }

  &.skin-red {
    .coupon-card .card-left { background: linear-gradient(135deg, #f43f5e, #e11d48); }
    .claim-btn { background: #ffe4e6; color: #e11d48; }
  }

  &.skin-dark {
    .coupon-card .card-left { background: linear-gradient(135deg, #334155, #0f172a); }
    .claim-btn { background: #f1f5f9; color: #0f172a; }
  }

  &.skin-gradient {
    .coupon-card .card-left { background: linear-gradient(135deg, #8b5cf6, #ec4899); }
    .claim-btn { background: #fdf2f8; color: #db2777; }
  }
}
</style>
