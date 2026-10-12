<template>
  <div class="tpl-coupon" :style="wrapperStyle">
    <div class="coupon-title" v-if="title">{{ title }}</div>
    <div class="coupon-list">
      <div class="coupon-item" v-for="i in 2" :key="i">
        <div class="coupon-left">
          <div class="coupon-amount">
            <span class="coupon-symbol">¥</span>10
          </div>
          <div class="coupon-threshold">满100可用</div>
        </div>
        <div class="coupon-right">
          <div class="coupon-name">优惠券名称</div>
          <div class="coupon-btn">立即领取</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "tpl_coupon",
  props: {
    res: { type: Object, default: () => ({}) },
  },
  computed: {
    title() {
      return (this.res.list && this.res.list[0] && this.res.list[0].title) || "";
    },
    wrapperStyle() {
      return {
        background: this.res.bgColor || "#FFFFFF",
        padding: `10px ${this.res.paddingX || 0}px`,
        marginBottom: `${this.res.pageGap !== undefined ? this.res.pageGap : 10}px`,
        borderRadius: `${this.res.borderRadius || 0}px`,
        overflow: "hidden",
      };
    },
  },
};
</script>

<style scoped lang="scss">
.tpl-coupon {
  font-size: 13px;
}
.coupon-title {
  font-size: 15px;
  font-weight: 600;
  padding: 4px 10px 10px;
}
.coupon-item {
  display: flex;
  margin: 0 10px 10px;
  border-radius: 6px;
  overflow: hidden;
  background: linear-gradient(90deg, #ffece8, #fff5f4);
}
.coupon-left {
  width: 90px;
  padding: 12px 0;
  text-align: center;
  color: #e1251b;
  border-right: 1px dashed #f0c0bb;
}
.coupon-amount {
  font-size: 20px;
  font-weight: 700;
}
.coupon-symbol {
  font-size: 12px;
}
.coupon-threshold {
  font-size: 11px;
}
.coupon-right {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 12px;
}
.coupon-name {
  color: #333;
}
.coupon-btn {
  background: #e1251b;
  color: #fff;
  font-size: 12px;
  padding: 4px 10px;
  border-radius: 12px;
}
</style>
