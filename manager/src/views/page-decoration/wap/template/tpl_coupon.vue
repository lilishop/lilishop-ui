<template>
  <div class="tpl-coupon" :class="{ styled: styled }" :style="wrapperStyle">
    <div class="coupon-title" v-if="title">{{ title }}</div>

    <!-- 老数据保持原样 -->
    <div v-if="!styled" class="coupon-list">
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

    <!-- 样式一：红色大卡横滑，右侧竖排领取 -->
    <div v-else-if="layoutStyle === '1'" class="cp-scroll" :style="scrollGap">
      <div class="cp1-item" v-for="(item, i) in displayData" :key="i">
        <div class="cp1-left">
          <div class="cp1-amount">
            <template v-if="item.couponType == 'DISCOUNT'">
              <span class="cp1-value">{{ item.couponDiscount }}</span
              ><span class="cp1-symbol">折</span>
            </template>
            <template v-else>
              <span class="cp1-symbol">¥</span
              ><span class="cp1-value">{{ item.price }}</span>
            </template>
          </div>
          <div class="cp1-threshold">{{ thresholdText(item) }}</div>
        </div>
        <div class="cp1-right">
          <span>领</span><span>取</span>
        </div>
        <i class="cp-notch cp-notch-t"></i>
        <i class="cp-notch cp-notch-b"></i>
      </div>
    </div>

    <!-- 样式二：白底小卡，底部去领取按钮 -->
    <div v-else-if="layoutStyle === '2'" class="cp-scroll" :style="scrollGap">
      <div class="cp2-item" v-for="(item, i) in displayData" :key="i">
        <div class="cp2-top">
          <div class="cp2-amount">
            <template v-if="item.couponType == 'DISCOUNT'">
              <span class="cp2-value">{{ item.couponDiscount }}</span
              ><span class="cp2-symbol">折</span>
            </template>
            <template v-else>
              <span class="cp2-symbol">¥</span
              ><span class="cp2-value">{{ item.price }}</span>
            </template>
          </div>
          <div class="cp2-threshold">{{ thresholdText(item) }}</div>
        </div>
        <div class="cp2-btn">去领取</div>
      </div>
    </div>

    <!-- 样式三：浅粉虚线卡，右侧竖排立即领取 -->
    <div v-else-if="layoutStyle === '3'" class="cp-scroll" :style="scrollGap">
      <div class="cp3-item" v-for="(item, i) in displayData" :key="i">
        <div class="cp3-left">
          <div class="cp3-amount">
            <template v-if="item.couponType == 'DISCOUNT'">
              <span class="cp3-value">{{ item.couponDiscount }}</span
              ><span class="cp3-symbol">折</span>
            </template>
            <template v-else>
              <span class="cp3-symbol">¥</span
              ><span class="cp3-value">{{ item.price }}</span>
            </template>
          </div>
          <div class="cp3-threshold">{{ thresholdText(item) }}</div>
        </div>
        <div class="cp3-right">
          <span>立</span><span>即</span><span>领</span><span>取</span>
        </div>
        <i class="cp-notch cp-notch-t"></i>
        <i class="cp-notch cp-notch-b"></i>
      </div>
    </div>

    <!-- 样式四：浅粉渐变 + 右侧渐变竖条领取 -->
    <div v-else class="cp-scroll" :style="scrollGap">
      <div class="cp4-item" v-for="(item, i) in displayData" :key="i">
        <div class="cp4-left">
          <div class="cp4-amount">
            <template v-if="item.couponType == 'DISCOUNT'">
              <span class="cp4-value">{{ item.couponDiscount }}</span
              ><span class="cp4-symbol">折</span>
            </template>
            <template v-else>
              <span class="cp4-symbol">¥</span
              ><span class="cp4-value">{{ item.price }}</span>
            </template>
          </div>
          <div class="cp4-threshold">{{ thresholdText(item) }}</div>
        </div>
        <div class="cp4-right">
          <span>领</span><span>取</span>
        </div>
        <i class="cp-notch cp-notch-t"></i>
        <i class="cp-notch cp-notch-b"></i>
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
    firstItem() {
      return (this.res.list && this.res.list[0]) || {};
    },
    title() {
      return this.firstItem.title || "";
    },
    layoutStyle() {
      return (this.res && this.res.layoutStyle) || "1";
    },
    displayData() {
      const data = this.firstItem.data || [];
      return data.slice(0, this.firstItem.count || 5);
    },
    // 面板保存过样式字段才启用自定义样式，老数据保持原样
    styled() {
      return this.res && this.res.paddingTop !== undefined;
    },
    scrollGap() {
      if (!this.styled) return {};
      return { columnGap: `${(Number(this.res.contentGap) || 0) / 2}px` };
    },
    wrapperStyle() {
      if (!this.styled) {
        return {
          background: this.res.bgColor || "#FFFFFF",
          padding: `10px ${this.res.paddingX || 0}px`,
          marginBottom: `${this.res.pageGap !== undefined ? this.res.pageGap : 10}px`,
          borderRadius: `${this.res.borderRadius || 0}px`,
          overflow: "hidden",
        };
      }
      const res = this.res;
      const bg =
        !res.bgColor2 || res.bgColor1 === res.bgColor2
          ? res.bgColor1
          : `linear-gradient(180deg, ${res.bgColor1}, ${res.bgColor2})`;
      const px = (v) => `${(Number(v) || 0) / 2}px`;
      return {
        background: bg,
        padding: `${px(res.paddingTop)} ${px(res.paddingX)} ${px(res.paddingBottom)}`,
        marginBottom: px(res.pageGap),
        borderRadius: px(res.borderRadius),
        overflow: "hidden",
      };
    },
  },
  methods: {
    thresholdText(item) {
      const t = Number(item.consumeThreshold);
      return t > 0 ? `满${item.consumeThreshold}元可用` : "无门槛使用";
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
.tpl-coupon.styled .coupon-item {
  margin: 0;
}
.tpl-coupon.styled .coupon-list {
  display: contents;
}

/* 参考 CRMEB 优惠券组件 */
.tpl-coupon.styled .coupon-title {
  padding: 0 0 8px;
}
.cp-scroll {
  display: flex;
  column-gap: 4px;
  overflow: hidden;
}
.cp-notch {
  position: absolute;
  right: 30px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #fff;
}
.cp-notch-t {
  top: -4px;
}
.cp-notch-b {
  bottom: -4px;
}

/* 样式一：红色大卡 */
.cp1-item {
  position: relative;
  display: flex;
  flex-shrink: 0;
  width: 132px;
  height: 66px;
  border-radius: 6px;
  background: linear-gradient(135deg, #ff5a36, #e1251b);
  color: #fff;
}
.cp1-left {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding-left: 12px;
}
.cp1-value {
  font-size: 20px;
  font-weight: 700;
}
.cp1-symbol {
  font-size: 11px;
}
.cp1-threshold {
  font-size: 10px;
  color: rgba(255, 255, 255, 0.85);
  margin-top: 2px;
}
.cp1-right {
  width: 30px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  border-left: 1px dashed rgba(255, 255, 255, 0.6);
}
.cp1-item .cp-notch {
  right: 26px;
}

/* 样式二：白底小卡 */
.cp2-item {
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  width: 74px;
  border-radius: 6px;
  background: #fff;
  border-left: 2px solid #f5483a;
  border-right: 2px solid #f5483a;
  overflow: hidden;
}
.cp2-top {
  padding: 8px 0 6px;
  text-align: center;
}
.cp2-value {
  font-size: 17px;
  font-weight: 700;
  color: #e1251b;
}
.cp2-symbol {
  font-size: 10px;
  color: #e1251b;
}
.cp2-threshold {
  font-size: 9px;
  color: #999;
  margin-top: 1px;
}
.cp2-btn {
  background: linear-gradient(90deg, #ff6a3d, #e1251b);
  color: #fff;
  font-size: 10px;
  text-align: center;
  padding: 4px 0;
}

/* 样式三：浅粉虚线卡 */
.cp3-item {
  position: relative;
  display: flex;
  flex-shrink: 0;
  width: 138px;
  height: 60px;
  border-radius: 6px;
  background: #fdf1ec;
  border: 1px dashed #f5483a;
}
.cp3-left {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding-left: 12px;
}
.cp3-value {
  font-size: 19px;
  font-weight: 700;
  color: #e1251b;
}
.cp3-symbol {
  font-size: 10px;
  color: #e1251b;
}
.cp3-threshold {
  font-size: 10px;
  color: #e1251b;
  margin-top: 1px;
}
.cp3-right {
  width: 32px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  color: #e1251b;
  border-left: 1px dashed #f5483a;
}
.cp3-item .cp-notch {
  right: 28px;
}

/* 样式四：浅粉渐变 + 渐变竖条 */
.cp4-item {
  position: relative;
  display: flex;
  flex-shrink: 0;
  width: 116px;
  height: 54px;
  border-radius: 6px;
  overflow: hidden;
}
.cp4-left {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding-left: 10px;
  background: linear-gradient(135deg, #fff3ec, #ffe0d3);
}
.cp4-value {
  font-size: 17px;
  font-weight: 700;
  color: #e1251b;
}
.cp4-symbol {
  font-size: 10px;
  color: #e1251b;
}
.cp4-threshold {
  font-size: 9px;
  color: #e1251b;
  margin-top: 1px;
}
.cp4-right {
  width: 26px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  color: #fff;
  background: linear-gradient(180deg, #ff6a3d, #e1251b);
}
.cp4-item .cp-notch {
  right: 22px;
  width: 6px;
  height: 6px;
}
.cp4-item .cp-notch-t {
  top: -3px;
}
.cp4-item .cp-notch-b {
  bottom: -3px;
}
</style>
