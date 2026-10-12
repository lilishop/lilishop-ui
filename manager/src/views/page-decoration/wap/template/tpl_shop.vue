<template>
  <div class="tpl-shop" :style="wrapperStyle">
    <div class="shop-title" v-if="title">{{ title }}</div>
    <div class="shop-grid">
      <div class="shop-item" v-for="i in 4" :key="i">
        <div class="shop-logo"></div>
        <div class="shop-name">店铺名称</div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "tpl_shop",
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
.shop-title {
  font-size: 15px;
  font-weight: 600;
  padding: 4px 12px 10px;
}
.shop-grid {
  display: flex;
  flex-wrap: wrap;
  padding: 0 12px;
}
.shop-item {
  width: 50%;
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}
.shop-logo {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #f0f0f0;
  flex-shrink: 0;
}
.shop-name {
  font-size: 13px;
  color: #333;
  margin-left: 8px;
}
</style>
