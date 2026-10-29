<template>
  <div class="tpl-search-header" :style="customStyle">
    <div class="header-inner">
      <!-- 1. 商城 Logo 区域 -->
      <div class="logo-area">
        <img
          v-if="options.logoUrl"
          :src="options.logoUrl"
          :alt="options.logoAlt || 'logo'"
          class="logo-img"
        />
        <span v-else class="text-logo">LiliShop</span>
      </div>

      <!-- 2. 搜索核心区（紧凑居中，含搜索框和热门推荐词） -->
      <div class="search-main">
        <!-- 搜索输入框与按钮 -->
        <div class="search-box">
          <input
            type="text"
            class="mock-input"
            :placeholder="placeholderText"
            readonly
          />
          <button type="button" class="search-btn">
            <el-icon><Search /></el-icon>
            <span>搜索</span>
          </button>
        </div>

        <!-- 热门推荐词 -->
        <div class="hot-words" v-if="options.showHotWords !== false && hotWordsList.length">
          <span
            v-for="(w, idx) in hotWordsList"
            :key="idx"
            class="hot-w"
          >
            {{ w }}
          </span>
        </div>
      </div>

      <!-- 3. 购物车入口（紧凑跟随在搜索框右侧，带数量徽标） -->
      <div
        class="cart-btn"
        v-if="options.showCart !== false"
        :style="cartBtnStyle"
      >
        <el-icon class="cart-icon"><ShoppingCart /></el-icon>
        <span class="cart-text">{{ options.cartText || '购物车' }}</span>
        <span class="cart-count">0</span>
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

const placeholderText = computed(() => {
  return props.options?.placeholder || '请输入商品名称、品牌或型号';
});

const hotWordsList = computed(() => {
  if (Array.isArray(props.options?.hotWords) && props.options.hotWords.length) {
    return props.options.hotWords;
  }
  return ['iPhone 16 Pro', '小棕瓶', '戴森吹风机', '华为Mate 70', '五粮液', '跑鞋'];
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
  justify-content: center;
  background: #ffffff;
  user-select: none;

  .header-inner {
    width: 1200px;
    max-width: 100%;
    padding: 18px 20px 14px;
    display: flex;
    align-items: flex-start;
    justify-content: center; /* 紧凑聚拢居中，Logo、搜索框、购物车不向大屏两端散落 */
    gap: 42px; /* Logo、搜索框、购物车三者紧凑贴近 */

    .logo-area {
      height: 40px;
      display: flex;
      align-items: center;
      flex-shrink: 0;
      cursor: pointer;

      .logo-img {
        max-height: 40px;
        max-width: 200px;
        object-fit: contain;
        display: block;
      }

      .text-logo {
        font-size: 26px;
        font-weight: 800;
        color: #409EFF;
        letter-spacing: -0.5px;
        line-height: 1;
      }
    }

    .search-main {
      width: 560px;
      flex-shrink: 0;

      .search-box {
        display: flex;
        border: 2px solid #409EFF;
        border-radius: 4px;
        overflow: hidden;
        height: 40px;
        box-sizing: border-box;

        .mock-input {
          flex: 1;
          border: none;
          padding: 0 14px;
          font-size: 13px;
          color: #334155;
          outline: none;
          background: #ffffff;

          &::placeholder {
            color: #94a3b8;
          }
        }

        .search-btn {
          background: #409EFF;
          color: #ffffff;
          border: none;
          padding: 0 24px;
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.15s;

          &:hover {
            background: #66b1ff;
          }
        }
      }

      .hot-words {
        margin-top: 8px;
        display: flex;
        align-items: center;
        gap: 12px;
        font-size: 12px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;

        .hot-w {
          color: #94a3b8;
          cursor: pointer;
          transition: color 0.15s;

          &:hover {
            color: #409EFF;
          }
        }
      }
    }

    .cart-btn {
      height: 40px;
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 0 16px;
      border: 1px solid #e2e8f0;
      border-radius: 4px;
      font-size: 13px;
      color: #334155;
      background: #ffffff;
      cursor: pointer;
      flex-shrink: 0;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
      transition: all 0.15s ease;
      box-sizing: border-box;

      .cart-icon {
        font-size: 16px;
        color: #409EFF;
      }

      .cart-text {
        font-weight: 500;
      }

      .cart-count {
        background: #409EFF;
        color: #ffffff;
        font-size: 11px;
        font-weight: 700;
        padding: 0 6px;
        height: 18px;
        line-height: 18px;
        border-radius: 9px;
      }

      &:hover {
        border-color: #409EFF;
        color: #409EFF;
      }
    }
  }
}
</style>
