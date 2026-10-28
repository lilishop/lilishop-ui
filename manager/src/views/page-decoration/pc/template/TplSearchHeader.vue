<template>
  <div class="tpl-search-header" :style="customStyle">
    <div class="header-inner">
      <div class="logo-area">
        <img v-if="options.logoUrl" :src="options.logoUrl" alt="logo" class="logo-img" />
        <span v-else class="text-logo">LiliShop</span>
      </div>

      <div class="search-main">
        <div class="search-box">
          <input
            type="text"
            class="mock-input"
            :placeholder="options.placeholder || '搜索品牌或商品'"
            readonly
          />
          <button type="button" class="search-btn">
            <el-icon><Search /></el-icon>
            <span>搜索</span>
          </button>
        </div>
        <div class="hot-words" v-if="options.showHotWords !== false && options.hotWords?.length">
          <span v-for="(w, idx) in options.hotWords" :key="idx" class="hot-w">{{ w }}</span>
        </div>
      </div>

      <div
        class="cart-btn"
        v-if="options.showCart !== false"
        :style="cartBtnStyle"
      >
        <el-icon class="cart-icon" :style="{ color: options.cartBadgeColor || '#e11d48' }">
          <ShoppingCart />
        </el-icon>
        <span>{{ options.cartText || '我的购物车' }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { Search, ShoppingCart } from '@element-plus/icons-vue';

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

const customStyle = computed(() => {
  const s = props.componentStyle || {};
  return {
    backgroundColor: s.backgroundColor || '#ffffff',
    minHeight: `${s.height || 90}px`
  };
});

const cartBtnStyle = computed(() => {
  const o = props.options || {};
  return {
    backgroundColor: o.cartBgColor || '#ffffff',
    borderColor: o.cartBorderColor || '#e2e8f0',
    color: o.cartTextColor || '#334155'
  };
});
</script>

<style lang="scss" scoped>
.tpl-search-header {
  width: 100%;
  display: flex;
  align-items: center;
  user-select: none;

  .header-inner {
    width: 100%;
    padding: 16px 20px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 30px;

    .logo-area {
      .logo-img {
        max-height: 48px;
        object-fit: contain;
      }
      .text-logo {
        font-size: 24px;
        font-weight: 800;
        color: #e11d48;
      }
    }

    .search-main {
      flex: 1;
      max-width: 550px;

      .search-box {
        display: flex;
        border: 2px solid #e11d48;
        border-radius: 4px;
        overflow: hidden;

        .mock-input {
          flex: 1;
          border: none;
          padding: 8px 12px;
          font-size: 13px;
          outline: none;
          background: #ffffff;
        }

        .search-btn {
          background: #e11d48;
          color: #ffffff;
          border: none;
          padding: 0 20px;
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 14px;
        }
      }

      .hot-words {
        margin-top: 6px;
        display: flex;
        gap: 10px;
        font-size: 11px;
        color: #94a3b8;
      }
    }

    .cart-btn {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 8px 16px;
      border: 1px solid #e2e8f0;
      border-radius: 4px;
      font-size: 13px;
      color: #334155;
      background: #f8fafc;

      .cart-icon {
        color: #e11d48;
      }
    }
  }
}
</style>
