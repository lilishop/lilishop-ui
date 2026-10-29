<template>
  <div class="scroll-show">
    <div class="content">
      <!-- 1. 左侧区域：商城 Logo -->
      <div class="left-section">
        <router-link to="/" class="logo-link">
          <img v-if="logoSrc" :src="logoSrc" alt="Logo" class="site-logo" />
          <span v-else class="text-logo">LiliShop</span>
        </router-link>
      </div>

      <!-- 2. 中间搜索区域：与 SearchHeader 样式完全一致（蓝底色、圆角4px、搜索按钮） -->
      <div class="search-main">
        <div class="search-box">
          <input
            v-model="keyword"
            type="text"
            class="search-input"
            :placeholder="placeholderText"
            @keyup.enter="handleSearch"
          />
          <button type="button" class="search-btn" @click="handleSearch">
            <el-icon><Search /></el-icon>
            <span>搜索</span>
          </button>
        </div>
      </div>

      <!-- 3. 右侧“我的购物车”胶囊入口：与 SearchHeader 样式完全一致 -->
      <div class="cart-entry">
        <router-link to="/cart" class="cart-btn" @mouseenter="getCartList">
          <el-icon class="cart-icon"><ShoppingCart /></el-icon>
          <span class="cart-text">{{ options.cartText || '我的购物车' }}</span>
          <span class="cart-count">{{ Number(cartNum) > 99 ? '99+' : cartNum }}</span>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { cartCount } from '@/api/cart.js';
import storage from '@/plugins/storage.js';
import { ShoppingCart, Search } from '@element-plus/icons-vue';
import { useAppStore } from '@/stores/app';

const props = defineProps({
  options: {
    type: Object,
    default: () => ({})
  }
});

const router = useRouter();
const route = useRoute();
const appStore = useAppStore();

const keyword = ref(route.query.keyword || '');
const cartNum = computed(() => appStore.cartNum || 0);

watch(() => route.query.keyword, (v) => {
  keyword.value = v || '';
});

const logoSrc = computed(() => {
  return props.options?.logoUrl || appStore.logoImg || '';
});

const placeholderText = computed(() => {
  const ph = props.options?.placeholder;
  if (!ph || ph === '搜索品牌或商品' || ph === '请输入商品名称、品牌或型号') {
    return '请输入商品名称';
  }
  return ph;
});

function handleSearch() {
  const kw = (keyword.value || '').trim();
  if (route.path === '/goodsList') {
    const nextQuery = { ...route.query };
    if (kw) {
      nextQuery.keyword = kw;
    } else {
      delete nextQuery.keyword;
    }
    router.push({ path: '/goodsList', query: nextQuery });
  } else {
    router.push({ path: '/goodsList', query: kw ? { keyword: kw } : {} });
  }
}

function getCartList() {
  if (storage.getItem('userInfo')) {
    cartCount().then((res) => {
      appStore.setCartNum(res.result);
      storage.setItem('cartNum', res.result);
    });
  }
}

onMounted(() => {
  getCartList();
});
</script>

<style lang="scss" scoped>
.scroll-show {
  height: 60px;
  width: 100%;
  background: #ffffff;
}

.content {
  width: 1200px;
  max-width: 100%;
  height: 60px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-sizing: border-box;
  padding: 0 10px;
}

.left-section {
  display: flex;
  align-items: center;
  flex-shrink: 0;

  .logo-link {
    display: flex;
    align-items: center;
    text-decoration: none;
    height: 40px;

    .site-logo {
      max-height: 36px;
      max-width: 160px;
      object-fit: contain;
      display: block;
    }

    .text-logo {
      font-size: 22px;
      font-weight: 800;
      color: #409EFF;
      letter-spacing: -0.5px;
      line-height: 1;
    }
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
    height: 38px;
    box-sizing: border-box;
    background: #ffffff;

    .search-input {
      flex: 1;
      min-width: 0;
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
      padding: 0 22px;
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.15s;
      flex-shrink: 0;

      &:hover {
        background: #66b1ff;
      }
    }
  }
}

.cart-entry {
  flex-shrink: 0;

  .cart-btn {
    height: 38px;
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 0 16px;
    border: 1px solid #e2e8f0;
    border-radius: 4px;
    font-size: 13px;
    color: #334155;
    background: #ffffff;
    text-decoration: none;
    cursor: pointer;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
    transition: all 0.15s ease;
    box-sizing: border-box;

    .cart-icon {
      font-size: 16px;
      color: #409EFF;
    }

    .cart-text {
      font-weight: 500;
      white-space: nowrap;
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
</style>
