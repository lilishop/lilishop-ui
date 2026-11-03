<template>
  <div class="tpl-category-nav" :style="customStyle">
    <div class="nav-container">
      <!-- 1. 全部分类入口 (当开启显示全部分类时) -->
      <div
        v-if="options.showAllCategory"
        class="all-category-btn"
        :style="{ backgroundColor: options.activeColor || '#e11d48' }"
      >
        <img
          v-if="options.allCategoryIcon"
          :src="options.allCategoryIcon"
          class="all-icon-img"
          alt="icon"
        />
        <el-icon v-else class="all-icon-svg"><Menu /></el-icon>
        <span class="all-text">{{ options.allCategoryText || '全部分类' }}</span>
        <el-icon class="all-arrow"><ArrowDown /></el-icon>
      </div>

      <!-- 2. 分类导航项水平列表 -->
      <div class="nav-items-wrapper">
        <div
          v-for="(item, idx) in options.navItems"
          :key="idx"
          class="cat-item"
          :class="{ 'is-first': idx === 0 }"
          @click="handleClickItem(item)"
        >
          <img
            v-if="item.img"
            :src="item.img"
            class="cat-icon"
            alt="cat-icon"
          />
          <span
            class="cat-title"
            :style="{
              '--text-color': options.textColor || '#334155',
              '--active-color': options.activeColor || '#e11d48'
            }"
          >
            {{ item.title }}
          </span>
          <span v-if="item.badge" class="cat-badge" :style="{ backgroundColor: options.activeColor || '#e11d48' }">
            {{ item.badge }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { Menu, ArrowDown } from '@element-plus/icons-vue';

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
    height: `${s.height || 42}px`
  };
});

function handleClickItem(item) {
  if (item && item.url) {
    console.log('Navigate to:', item.url);
  }
}
</script>

<style lang="scss" scoped>
.tpl-category-nav {
  width: 100%;
  border-bottom: 1px solid #f1f5f9;
  user-select: none;
  display: flex;
  align-items: center;

  .nav-container {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    padding: 0 16px;
    box-sizing: border-box;

    // 全部分类按钮
    .all-category-btn {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      height: 100%;
      padding: 0 18px;
      color: #ffffff;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      flex-shrink: 0;
      margin-right: 20px;
      transition: opacity 0.2s;

      &:hover {
        opacity: 0.92;
      }

      .all-icon-img {
        width: 18px;
        height: 18px;
        object-fit: contain;
      }

      .all-icon-svg {
        font-size: 16px;
      }

      .all-text {
        letter-spacing: 0.5px;
      }

      .all-arrow {
        font-size: 12px;
        margin-left: 2px;
      }
    }

    // 分类项列表
    .nav-items-wrapper {
      flex: 1;
      height: 100%;
      display: flex;
      align-items: center;
      gap: 28px;
      overflow-x: auto;
      scrollbar-width: none; // Firefox
      &::-webkit-scrollbar {
        display: none; // Chrome/Safari
      }

      .cat-item {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        height: 100%;
        cursor: pointer;
        position: relative;
        flex-shrink: 0;
        transition: transform 0.15s ease;

        .cat-icon {
          width: 22px;
          height: 22px;
          object-fit: contain;
          border-radius: 4px;
          transition: transform 0.2s ease;
        }

        .cat-title {
          font-size: 14px;
          font-weight: 500;
          color: var(--text-color, #334155);
          transition: color 0.2s ease;
          line-height: 1.2;
          white-space: nowrap;
        }

        .cat-badge {
          position: absolute;
          top: 4px;
          right: -12px;
          color: #ffffff;
          font-size: 9px;
          line-height: 1;
          padding: 2px 4px;
          border-radius: 8px;
          font-weight: 600;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.15);
        }

        &:hover {
          .cat-icon {
            transform: scale(1.12);
          }

          .cat-title {
            color: var(--active-color, #e11d48);
          }
        }
      }
    }
  }
}
</style>
