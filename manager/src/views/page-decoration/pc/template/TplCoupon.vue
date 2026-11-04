<template>
  <div class="tpl-coupon" :class="`skin-${options.skin || 'red'}`" :style="customStyle">
    <div
      class="coupon-grid"
      :style="{ gridTemplateColumns: `repeat(${actualColumns}, 1fr)` }"
    >
      <div v-for="(cp, idx) in couponList" :key="cp.id || idx" class="coupon-item">
        <div class="left-val">
          <span class="symbol">￥</span>
          <span class="val">{{ cp.price }}</span>
        </div>
        <div class="right-info">
          <span class="title">{{ cp.consumeThreshold > 0 ? '满' + cp.consumeThreshold + '可用' : '无门槛使用' }}</span>
          <span class="scope" v-if="cp.title">{{ cp.title }}</span>
          <span class="btn">立即领取</span>
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

const couponList = computed(() => {
  if (Array.isArray(props.options?.coupons) && props.options.coupons.length > 0) {
    return props.options.coupons;
  }
  const count = props.options?.columns || 4;
  return defaultCoupons.slice(0, count);
});
</script>

<style lang="scss" scoped>
.tpl-coupon {
  width: 100%;
  user-select: none;
  box-sizing: border-box;

  .coupon-grid {
    display: grid;
    gap: 12px;

    .coupon-item {
      display: flex;
      height: 72px;
      border-radius: 6px;
      overflow: hidden;

      .left-val {
        width: 80px;
        color: #ffffff;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 700;

        .symbol { font-size: 13px; }
        .val { font-size: 22px; }
      }

      .right-info {
        flex: 1;
        background: #ffffff;
        padding: 6px 10px;
        display: flex;
        flex-direction: column;
        justify-content: center;
        border: 1px solid #f1f5f9;
        border-left: none;

        .title {
          font-size: 12px;
          font-weight: 600;
          color: #1e293b;
        }

        .scope {
          font-size: 11px;
          color: #64748b;
          margin-top: 2px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .btn {
          font-size: 11px;
          color: #e11d48;
          cursor: pointer;
          font-weight: 600;
          margin-top: 3px;
        }
      }
    }
  }

  &.skin-red {
    .left-val { background: linear-gradient(135deg, #f43f5e 0%, #e11d48 100%); }
    .btn { color: #e11d48 !important; }
  }

  &.skin-dark {
    .left-val { background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); color: #f59e0b; }
    .btn { color: #d97706 !important; }
  }

  &.skin-gradient {
    .left-val { background: linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%); }
    .btn { color: #8b5cf6 !important; }
  }
}
</style>
