<template>
  <div
    class="tpl-category-mega-menu"
    :class="{ 'is-hovering': panelVisible && activeChildren.length }"
    :style="customStyle"
    @mouseleave="handleMouseLeave"
  >
    <!-- 顶部标题：分类 / 商品分类 -->
    <div class="menu-header">
      <span class="header-title">{{ options.title || '商品分类' }}</span>
    </div>

    <!-- 垂直一级类目列表 -->
    <div class="category-list">
      <div
        v-for="(cat, idx) in displayCategories"
        :key="cat.id || idx"
        class="cat-item"
        :class="{ 'is-active': activeIndex === idx && panelVisible }"
        :style="{
          '--text-color': options.textColor || '#334155',
          '--active-color': options.activeColor || '#409EFF',
          '--font-size': `${options.fontSize || 13}px`
        }"
        @mouseenter="handleMouseEnter(idx, cat)"
      >
        <span class="cat-name">{{ cat.name }}</span>
        <el-icon class="arrow-icon"><ArrowRight /></el-icon>
      </div>
    </div>

    <!-- 右侧悬浮超级大面板 (Mega Menu 仿真预览) -->
    <transition name="fade-flyout">
      <div
        v-if="panelVisible && activeChildren.length"
        class="mega-flyout-panel"
        @mouseenter="handlePanelEnter"
        @mouseleave="handleMouseLeave"
      >
        <div class="flyout-top-tags" v-if="activeChildren && activeChildren.length">
          <span
            v-for="(sub, sIdx) in activeChildren.slice(0, 8)"
            :key="sub.id || sIdx"
            class="top-tag-pill"
          >
            {{ sub.name }}
            <el-icon class="pill-arrow"><ArrowRight /></el-icon>
          </span>
        </div>

        <div class="flyout-content-scroll">
          <div
            v-for="(sub, sIdx) in activeChildren"
            :key="sub.id || sIdx"
            class="cat-row"
          >
            <div class="lvl2-title">
              <span class="lvl2-name">{{ sub.name }}</span>
              <el-icon class="lvl2-arrow"><ArrowRight /></el-icon>
            </div>
            <div class="lvl3-tags-wrap">
              <span
                v-for="(leaf, lIdx) in (sub.children || [])"
                :key="leaf.id || lIdx"
                class="lvl3-tag"
              >
                {{ leaf.name }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { ArrowRight } from '@element-plus/icons-vue';
import { getGoodsCategoryAll } from '@/api/goods.js';

const props = defineProps({
  options: {
    type: Object,
    default: () => ({})
  },
  componentStyle: {
    type: Object,
    default: () => ({})
  },
  rowStyle: {
    type: Object,
    default: () => ({})
  }
});

const defaultCategories = [
  {
    id: '1',
    name: '电脑办公',
    children: [
      { id: '1-1', name: '手机通讯', children: [{ name: '手机' }, { name: '游戏手机' }, { name: '老人机' }] },
      { id: '1-2', name: '电脑整机', children: [{ name: '笔记本' }, { name: '台式机' }, { name: '平板电脑' }] }
    ]
  },
  {
    id: '2',
    name: '家用电器',
    children: [
      { id: '2-1', name: '大家电', children: [{ name: '电视' }, { name: '冰箱' }, { name: '洗衣机' }, { name: '空调' }] },
      { id: '2-2', name: '厨房小电', children: [{ name: '电饭煲' }, { name: '微波炉' }, { name: '咖啡机' }] }
    ]
  },
  {
    id: '3',
    name: '服装鞋包',
    children: [
      { id: '3-1', name: '女装', children: [{ name: '连衣裙' }, { name: '衬衫' }, { name: '羽绒服' }] },
      { id: '3-2', name: '男装', children: [{ name: 'T恤' }, { name: '夹克' }, { name: '牛仔裤' }] }
    ]
  },
  {
    id: '4',
    name: '食品生鲜',
    children: [
      { id: '4-1', name: '生鲜水果', children: [{ name: '苹果' }, { name: '车厘子' }, { name: '奇异果' }] },
      { id: '4-2', name: '休闲零食', children: [{ name: '坚果炒货' }, { name: '饼干蛋糕' }, { name: '糖果果冻' }] }
    ]
  },
  { id: '5', name: '精品箱包' },
  { id: '6', name: '美妆个护' },
  { id: '7', name: '运动户外' },
  { id: '8', name: '家居家装' }
];

const systemCategories = ref([]);
const activeIndex = ref(-1);
const activeCategory = ref(null);
const panelVisible = ref(false);

const isCustomSource = computed(() => {
  if (props.options?.source === 'system') return false;
  if (props.options?.source === 'custom') {
    if (Array.isArray(props.options?.categories) && props.options.categories.length === 4) {
      const names = props.options.categories.map(c => c.name || c.title || '');
      const isPlaceholder = names.some(n => n.includes('精选')) &&
                            names.some(n => n.includes('新品')) &&
                            names.some(n => n.includes('企业')) &&
                            names.some(n => n.includes('领券'));
      if (isPlaceholder) return false;
    }
    return true;
  }
  return false;
});

const displayCategories = computed(() => {
  if (isCustomSource.value && Array.isArray(props.options?.categories) && props.options.categories.length) {
    return props.options.categories.map(c => ({
      ...c,
      name: c.name || c.title || ''
    }));
  }
  if (systemCategories.value && systemCategories.value.length) {
    return systemCategories.value;
  }
  return defaultCategories;
});

const activeChildren = computed(() => {
  if (!activeCategory.value) return [];
  if (Array.isArray(activeCategory.value.children) && activeCategory.value.children.length) {
    return activeCategory.value.children;
  }
  if (Array.isArray(activeCategory.value.subCategories) && activeCategory.value.subCategories.length) {
    return activeCategory.value.subCategories.map((s, idx) => ({
      id: s.id || `sub_${idx}`,
      name: s.name,
      children: (s.items || []).map((it, iIdx) => ({
        id: `leaf_${idx}_${iIdx}`,
        name: typeof it === 'string' ? it : it.name
      }))
    }));
  }
  return [];
});

function handleMouseEnter(idx, cat) {
  activeIndex.value = idx;
  activeCategory.value = cat;
  if (cat.children && cat.children.length) {
    panelVisible.value = true;
  } else if (cat.subCategories && cat.subCategories.length) {
    panelVisible.value = true;
  } else {
    panelVisible.value = false;
  }
}

function handlePanelEnter() {
  panelVisible.value = true;
}

function handleMouseLeave() {
  panelVisible.value = false;
  activeIndex.value = -1;
  activeCategory.value = null;
}

function fetchCategories() {
  getGoodsCategoryAll(0).then(res => {
    if (res.success && Array.isArray(res.result) && res.result.length) {
      systemCategories.value = res.result;
    }
  }).catch(() => {
    // 降级使用默认真实分类
  });
}

onMounted(() => {
  fetchCategories();
});

const customStyle = computed(() => {
  const s = props.componentStyle || {};
  const hasRowHeight = Boolean(props.rowStyle?.height && Number(props.rowStyle.height) > 0);
  return {
    backgroundColor: (s.backgroundColor && s.backgroundColor !== 'transparent') ? s.backgroundColor : '#ffffff',
    borderRadius: Array.isArray(s.radius) && s.radius.some(r => r > 0)
      ? `${s.radius[0]}px ${s.radius[1]}px ${s.radius[2]}px ${s.radius[3]}px`
      : '8px',
    height: '100%',
    minHeight: hasRowHeight ? '0' : '420px'
  };
});
</script>

<style lang="scss" scoped>
.tpl-category-mega-menu {
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: visible;

  &.is-hovering {
    z-index: 1050;
  }

  .menu-header {
    height: 42px;
    padding: 0 16px;
    display: flex;
    align-items: center;
    border-bottom: 1px solid #f1f5f9;
    flex-shrink: 0;

    .header-title {
      font-size: 14px;
      font-weight: 700;
      color: #1e293b;
      letter-spacing: 0.5px;
    }
  }

  .category-list {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: space-evenly;
    padding: 4px 0 8px;
    box-sizing: border-box;
    min-height: 0;
    overflow-y: auto;

    .cat-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 6px 16px;
      cursor: pointer;
      user-select: none;
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
        font-size: 11px;
        color: #94a3b8;
        transition: transform 0.15s ease, color 0.15s ease;
        flex-shrink: 0;
      }

      &:hover,
      &.is-active {
        background: #ecf5ff;

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

  .mega-flyout-panel {
    position: absolute;
    top: 0;
    left: 100%;
    width: 780px;
    min-height: 100%;
    max-height: 520px;
    background: #ffffff;
    z-index: 1100;
    box-shadow: 0 12px 32px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(0, 0, 0, 0.04);
    border: 1px solid #e2e8f0;
    border-left: none;
    border-radius: 0 8px 8px 0;
    padding: 16px 20px;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;

    .flyout-top-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      padding-bottom: 12px;
      border-bottom: 1px solid #f1f5f9;
      margin-bottom: 12px;
      flex-shrink: 0;

      .top-tag-pill {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        padding: 4px 10px;
        background: #f8fafc;
        border-radius: 14px;
        font-size: 12px;
        font-weight: 600;
        color: #334155;
        cursor: default;

        .pill-arrow {
          font-size: 10px;
          color: #94a3b8;
        }
      }
    }

    .flyout-content-scroll {
      flex: 1;
      overflow-y: auto;
      padding-right: 6px;

      &::-webkit-scrollbar {
        width: 4px;
      }
      &::-webkit-scrollbar-thumb {
        background: #cbd5e1;
        border-radius: 4px;
      }

      .cat-row {
        display: flex;
        align-items: flex-start;
        padding: 10px 0;
        border-bottom: 1px dashed #f1f5f9;

        &:last-child {
          border-bottom: none;
        }

        .lvl2-title {
          width: 96px;
          flex-shrink: 0;
          display: inline-flex;
          align-items: center;
          gap: 3px;
          color: #1e293b;
          font-weight: 600;
          font-size: 12px;
          padding-top: 1px;

          .lvl2-name {
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }

          .lvl2-arrow {
            font-size: 10px;
            color: #94a3b8;
          }
        }

        .lvl3-tags-wrap {
          flex: 1;
          display: flex;
          flex-wrap: wrap;
          gap: 6px 14px;

          .lvl3-tag {
            font-size: 12px;
            color: #64748b;
            line-height: 1.6;
          }
        }
      }
    }
  }
}

.fade-flyout-enter-active,
.fade-flyout-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}

.fade-flyout-enter-from,
.fade-flyout-leave-to {
  opacity: 0;
  transform: translateX(-4px);
}
</style>
