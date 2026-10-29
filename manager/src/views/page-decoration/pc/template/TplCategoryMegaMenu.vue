<template>
  <div class="tpl-category-mega-menu" :style="customStyle">
    <!-- 顶部标题：分类（同万米设计，纯净大方） -->
    <div class="menu-header">
      <span class="header-title">{{ options.title || '分类' }}</span>
    </div>

    <!-- 垂直一级类目列表（8项均匀铺满整个高度） -->
    <div class="category-list">
      <div
        v-for="(cat, idx) in categoriesList"
        :key="idx"
        class="cat-item"
        :style="{
          '--text-color': options.textColor || '#334155',
          '--active-color': options.activeColor || '#409EFF',
          '--font-size': `${options.fontSize || 13}px`
        }"
      >
        <span class="cat-name">{{ cat.name }}</span>
        <el-icon class="arrow-icon"><ArrowRight /></el-icon>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { ArrowRight } from '@element-plus/icons-vue';

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

const defaultCategories = [
  { id: '1', name: '潮流数码' },
  { id: '2', name: '奢宠美妆' },
  { id: '3', name: '智能家电' },
  { id: '4', name: '服饰鞋包' },
  { id: '5', name: '运动潮流' },
  { id: '6', name: '精品生鲜' },
  { id: '7', name: '居家生活' },
  { id: '8', name: '母婴玩具' }
];

const categoriesList = computed(() => {
  if (Array.isArray(props.options?.categories) && props.options.categories.length) {
    return props.options.categories.map(c => {
      const rawName = c.name || c.title || '';
      const cleanName = rawName.includes('/') ? rawName.split('/')[0].trim() : rawName;
      return {
        ...c,
        name: cleanName
      };
    });
  }
  return defaultCategories;
});

const customStyle = computed(() => {
  const s = props.componentStyle || {};
  return {
    backgroundColor: s.backgroundColor || '#ffffff',
    borderRadius: Array.isArray(s.radius)
      ? `${s.radius[0]}px ${s.radius[1]}px ${s.radius[2]}px ${s.radius[3]}px`
      : '8px'
  };
});
</script>

<style lang="scss" scoped>
.tpl-category-mega-menu {
  width: 100%;
  height: 100%;
  min-height: 420px;
  box-sizing: border-box;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
  display: flex;
  flex-direction: column;
  user-select: none;
  overflow: hidden;

  .menu-header {
    padding: 14px 16px 6px;
    display: flex;
    align-items: center;

    .header-title {
      font-size: 15px;
      font-weight: 700;
      color: #1e293b;
      letter-spacing: 0.5px;
    }
  }

  .category-list {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 2px 0 10px;

    .cat-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 8px 16px;
      cursor: pointer;
      transition: all 0.15s ease;

      .cat-name {
        font-size: var(--font-size, 13px);
        color: var(--text-color, #334155);
        font-weight: 500;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .arrow-icon {
        font-size: 12px;
        color: #94a3b8;
        transition: transform 0.15s ease, color 0.15s ease;
        flex-shrink: 0;
      }

      &:hover {
        background: #fff7ed;

        .cat-name {
          color: var(--active-color, #409EFF);
          font-weight: 600;
        }

        .arrow-icon {
          color: var(--active-color, #409EFF);
          transform: translateX(2px);
        }
      }
    }
  }
}
</style>
