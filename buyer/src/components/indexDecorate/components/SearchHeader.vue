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

      <!-- 2. 搜索核心区（紧凑居中，含搜索框和热门推荐词） -->
      <div class="search-main">
        <!-- 搜索输入框与按钮 -->
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

        <!-- 热门推荐词 -->
        <div class="hot-words" v-if="options.showHotWords !== false && hotWordsList.length">
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
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { Search, ShoppingCart } from '@element-plus/icons-vue';
import { useAppStore } from '@/stores/app.js';

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
const appStore = useAppStore();
const keyword = ref('');

const logoSrc = computed(() => {
  return props.options?.logoUrl || appStore.logoImg || '';
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

const cartCount = computed(() => {
  return appStore.cartNum || 0;
});

function handleSearch() {
  const kw = keyword.value.trim();
  if (kw) {
    router.push({ path: '/goodsList', query: { keyword: kw } });
  } else if (props.options?.placeholder) {
    router.push({ path: '/goodsList', query: { keyword: props.options.placeholder } });
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

  .header-inner {
    width: 1200px;
    max-width: 100%;
    margin: 0 auto;
    padding: 18px 20px 14px;
    display: flex;
    align-items: flex-start;
    justify-content: center; /* 紧凑聚拢居中，杜绝两侧过度留白 */
    gap: 42px; /* Logo、搜索框、购物车紧密贴近 */

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

        .search-input {
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

    .cart-entry {
      flex-shrink: 0;

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
}
</style>
