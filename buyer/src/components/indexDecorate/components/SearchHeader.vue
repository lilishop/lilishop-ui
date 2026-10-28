<template>
  <div class="decor-search-header" :style="customStyle">
    <div class="header-inner">
      <!-- 商城 Logo -->
      <div class="logo-area">
        <router-link to="/">
          <img
            v-if="options.logoUrl"
            :src="options.logoUrl"
            alt="Logo"
            class="site-logo"
          />
          <span v-else class="text-logo">LiliShop</span>
        </router-link>
      </div>

      <!-- 搜索主区域 -->
      <div class="search-main">
        <div class="search-input-box">
          <el-input
            v-model="keyword"
            size="large"
            :placeholder="options.placeholder || '搜索品牌或商品'"
            @keyup.enter="handleSearch"
            class="input-control"
          />
          <button type="button" class="search-btn" @click="handleSearch">
            <el-icon :size="18"><Search /></el-icon>
            <span>搜索</span>
          </button>
        </div>

        <!-- 热门推荐词 -->
        <div class="hot-words" v-if="options.showHotWords && options.hotWords?.length">
          <span
            v-for="(word, idx) in options.hotWords"
            :key="idx"
            class="hot-word"
            @click="quickSearch(word)"
          >
            {{ word }}
          </span>
        </div>
      </div>

      <!-- 购物车入口 -->
      <div class="cart-entry" v-if="options.showCart">
        <router-link to="/cart" class="cart-btn">
          <el-icon :size="20" class="cart-icon"><ShoppingCart /></el-icon>
          <span>我的购物车</span>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
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

const router = useRouter();
const keyword = ref('');

function handleSearch() {
  const kw = keyword.value.trim();
  if (kw) {
    router.push({ path: '/goodsList', query: { keyword: kw } });
  }
}

function quickSearch(word) {
  keyword.value = word;
  handleSearch();
}

const customStyle = computed(() => {
  const s = props.componentStyle || {};
  return {
    backgroundColor: s.backgroundColor || '#ffffff',
    minHeight: `${s.height || 90}px`
  };
});
</script>

<style lang="scss" scoped>
.decor-search-header {
  width: 100%;
  display: flex;
  align-items: center;

  .header-inner {
    max-width: 1600px;
    width: 100%;
    margin: 0 auto;
    padding: 16px 20px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 40px;

    .logo-area {
      flex-shrink: 0;

      .site-logo {
        max-height: 52px;
        max-width: 180px;
        object-fit: contain;
      }

      .text-logo {
        font-size: 26px;
        font-weight: 800;
        color: #e11d48;
        letter-spacing: -0.5px;
      }
    }

    .search-main {
      flex: 1;
      max-width: 600px;

      .search-input-box {
        display: flex;
        align-items: center;

        :deep(.el-input__wrapper) {
          border-top-right-radius: 0;
          border-bottom-right-radius: 0;
          border-color: #e11d48;
          box-shadow: 0 0 0 1px #e11d48 inset !important;
        }

        .search-btn {
          height: 40px;
          padding: 0 24px;
          background: #e11d48;
          color: #ffffff;
          border: none;
          border-top-right-radius: 4px;
          border-bottom-right-radius: 4px;
          font-size: 15px;
          font-weight: 500;
          display: flex;
          align-items: center;
          gap: 6px;
          cursor: pointer;
          transition: background 0.2s;

          &:hover {
            background: #be123c;
          }
        }
      }

      .hot-words {
        margin-top: 6px;
        display: flex;
        flex-wrap: wrap;
        gap: 12px;
        font-size: 12px;

        .hot-word {
          color: #94a3b8;
          cursor: pointer;
          transition: color 0.2s;

          &:hover {
            color: #e11d48;
          }
        }
      }
    }

    .cart-entry {
      flex-shrink: 0;

      .cart-btn {
        display: flex;
        align-items: center;
        gap: 8px;
        height: 40px;
        padding: 0 18px;
        border: 1px solid #e2e8f0;
        border-radius: 4px;
        color: #334155;
        text-decoration: none;
        font-size: 13px;
        font-weight: 500;
        background: #f8fafc;
        transition: all 0.2s;

        &:hover {
          border-color: #e11d48;
          color: #e11d48;
          background: #fff1f2;
        }

        .cart-icon {
          color: #e11d48;
        }
      }
    }
  }
}
</style>
