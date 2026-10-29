<template>
  <div class="decor-search-header" :style="customStyle">
    <div class="header-inner">
      <!-- 1. 商城 Logo 区域 -->
      <div class="logo-area">
        <router-link to="/">
          <img
            v-if="logoSrc"
            :src="logoSrc"
            alt="Logo"
            class="site-logo"
          />
          <span v-else class="text-logo">LiliShop</span>
        </router-link>
      </div>

      <!-- 2. 搜索核心区（紧凑居中，含商品/店铺 Tab、搜索框和热门推荐词） -->
      <div class="search-main">
        <!-- 搜索类型切换：商品 / 店铺 -->
        <div class="search-tabs" v-if="options.showSearchTypes !== false">
          <span
            class="tab-item"
            :class="{ active: currentSearchType === 'goods' }"
            @click="switchSearchType('goods')"
          >
            商品
          </span>
          <span
            class="tab-item"
            :class="{ active: currentSearchType === 'store' }"
            @click="switchSearchType('store')"
          >
            店铺
          </span>
        </div>

        <!-- 搜索输入框与按钮 -->
        <div class="search-box" :class="{ 'tab-store-active': currentSearchType === 'store' }">
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

        <!-- 热门推荐词 -->
        <div class="hot-words" v-if="options.showHotWords !== false && currentSearchType === 'goods' && hotWordsList.length">
          <span
            v-for="(word, idx) in hotWordsList"
            :key="idx"
            class="hot-w"
            @click="quickSearch(word)"
          >
            {{ word }}
          </span>
        </div>
      </div>

      <!-- 3. 购物车入口（紧凑跟随在搜索框右侧，带数量徽标） -->
      <div class="cart-entry" v-if="options.showCart !== false">
        <router-link to="/cart" class="cart-btn" :style="cartBtnStyle">
          <el-icon class="cart-icon"><ShoppingCart /></el-icon>
          <span class="cart-text">{{ options.cartText || '购物车' }}</span>
          <span class="cart-count">{{ cartCount }}</span>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { Search, ShoppingCart } from '@element-plus/icons-vue';
import { useAppStore } from '@/stores/app.js';
import { cartCount as fetchCartCount } from '@/api/cart.js';
import storage from '@/plugins/storage.js';

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

const emit = defineEmits(['search']);

const router = useRouter();
const route = useRoute();
const appStore = useAppStore();

const currentSearchType = ref(
  route.path === '/storeList'
    ? 'store'
    : (props.options?.defaultSearchType || 'goods')
);

watch(
  () => route.path,
  (p) => {
    if (p === '/storeList') {
      currentSearchType.value = 'store';
    } else if (p === '/goodsList') {
      currentSearchType.value = 'goods';
    }
  }
);

function switchSearchType(type) {
  currentSearchType.value = type;
}

const keyword = ref(route.query?.keyword || '');

watch(() => route.query?.keyword, (v) => {
  keyword.value = v || '';
});

const logoSrc = computed(() => {
  return props.options?.logoUrl || appStore.logoImg || '';
});

const placeholderText = computed(() => {
  if (currentSearchType.value === 'store') {
    const sph = props.options?.storePlaceholder;
    if (!sph || sph === '请输入店铺名称、品牌或经营范围') return '请输入店铺名称';
    return sph;
  }
  const ph = props.options?.placeholder;
  if (!ph || ph === '搜索品牌或商品' || ph === '请输入商品名称、品牌或型号') {
    return '请输入商品名称';
  }
  return ph;
});

const hotWordsList = computed(() => {
  if (Array.isArray(props.options?.hotWords) && props.options.hotWords.length) {
    return props.options.hotWords;
  }
  return ['iPhone 16 Pro', '小棕瓶', '戴森吹风机', '华为Mate 70', '五粮液', '跑鞋'];
});

const cartCount = computed(() => {
  return appStore.cartNum || 0;
});

function handleSearch() {
  const kw = (keyword.value || '').trim();
  emit('search', kw);
  if (currentSearchType.value === 'store') {
    if (route.path === '/storeList') {
      const nextQuery = { ...route.query };
      if (kw) {
        nextQuery.keyword = kw;
      } else {
        delete nextQuery.keyword;
      }
      router.push({ path: '/storeList', query: nextQuery });
    } else {
      router.push({ path: '/storeList', query: kw ? { keyword: kw } : {} });
    }
  } else {
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
}

function quickSearch(word) {
  keyword.value = word;
  handleSearch();
}

function getCartList() {
  if (storage.getItem('userInfo')) {
    fetchCartCount().then((res) => {
      appStore.setCartNum(res.result);
      storage.setItem('cartNum', res.result);
    }).catch(() => {});
  }
}

onMounted(() => {
  getCartList();
});

const customStyle = computed(() => {
  const s = props.componentStyle || {};
  return {
    backgroundColor: s.backgroundColor || '#ffffff',
    minHeight: `${s.height || 120}px`
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
.decor-search-header {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #ffffff;
  border-bottom: 1px solid #f1f5f9;

  .header-inner {
    width: 1200px;
    max-width: 100%;
    margin: 0 auto;
    padding: 16px 0 14px 0;
    box-sizing: border-box;
    display: flex;
    align-items: center;
    justify-content: space-between;

    .logo-area {
      height: 40px;
      display: flex;
      align-items: center;
      flex-shrink: 0;

      a {
        display: flex;
        align-items: center;
        text-decoration: none;
      }

      .site-logo {
        max-height: 40px;
        max-width: 180px;
        object-fit: contain;
      }

      .text-logo {
        font-size: 26px;
        font-weight: 800;
        color: #409EFF;
        letter-spacing: -0.5px;
      }
    }

    .search-main {
      width: 580px;
      max-width: 50%;
      display: flex;
      flex-direction: column;

      .search-tabs {
        display: flex;
        align-items: flex-end;
        gap: 4px;
        margin-bottom: 0px;
        padding-left: 2px;
        z-index: 2;

        .tab-item {
          padding: 4px 16px;
          font-size: 13px;
          font-weight: 500;
          color: #64748b;
          cursor: pointer;
          border-radius: 4px 4px 0 0;
          transition: all 0.15s ease;
          user-select: none;

          &:hover {
            color: #409EFF;
          }

          &.active {
            color: #ffffff;
            background: #409EFF;
            font-weight: 600;
          }
        }
      }

      .search-box {
        display: flex;
        border: 2px solid #409EFF;
        border-radius: 0 4px 4px 4px;
        overflow: hidden;
        height: 40px;
        background: #ffffff;
        box-sizing: border-box;

        &.tab-store-active {
          border-radius: 4px;
        }

        .search-input {
          flex: 1;
          border: none;
          padding: 0 14px;
          font-size: 14px;
          outline: none;
          color: #334155;
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
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s;
          flex-shrink: 0;

          &:hover {
            background: #66b1ff;
          }
        }
      }

      .hot-words {
        margin-top: 6px;
        display: flex;
        flex-wrap: wrap;
        gap: 12px;
        font-size: 12px;
        color: #94a3b8;
        line-height: 1.4;

        .hot-w {
          cursor: pointer;
          transition: color 0.15s;

          &:hover {
            color: #409EFF;
          }
        }
      }
    }

    .cart-entry {
      flex-shrink: 0;

      .cart-btn {
        height: 40px;
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 0 18px;
        border: 1px solid #e2e8f0;
        border-radius: 4px;
        font-size: 13px;
        color: #334155;
        background: #ffffff;
        text-decoration: none;
        cursor: pointer;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
        transition: all 0.2s ease;
        box-sizing: border-box;

        .cart-icon {
          font-size: 18px;
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
          box-shadow: 0 2px 6px rgba(64, 158, 255, 0.15);
        }
      }
    }
  }
}
</style>
