<template>
  <div
    class="decor-category-mega-menu"
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
        @click="goGoodsList(cat.id)"
      >
        <span class="cat-name">{{ cat.name }}</span>
        <el-icon class="arrow-icon"><ArrowRight /></el-icon>
      </div>
    </div>

    <!-- 右侧悬浮超级大面板 (Mega Menu) -->
    <transition name="fade-flyout">
      <div
        v-if="panelVisible && activeChildren.length"
        class="mega-flyout-panel"
        @mouseenter="handlePanelEnter"
        @mouseleave="handleMouseLeave"
      >
        <!-- 顶部快捷推荐标签（展示前8个二级分类） -->
        <div class="flyout-top-tags" v-if="activeChildren && activeChildren.length">
          <span
            v-for="(sub, sIdx) in activeChildren.slice(0, 8)"
            :key="sub.id || sIdx"
            class="top-tag-pill"
            @click.stop="goGoodsList(sub.id, sub.parentId)"
          >
            {{ sub.name }}
            <el-icon class="pill-arrow"><ArrowRight /></el-icon>
          </span>
        </div>

        <!-- 详细分类二级与三级平铺网格 -->
        <div class="flyout-content-scroll">
          <div
            v-for="(sub, sIdx) in activeChildren"
            :key="sub.id || sIdx"
            class="cat-row"
          >
            <!-- 二级分类标题 -->
            <div
              class="lvl2-title"
              @click.stop="goGoodsList(sub.id, sub.parentId)"
            >
              <span class="lvl2-name">{{ sub.name }}</span>
              <el-icon class="lvl2-arrow"><ArrowRight /></el-icon>
            </div>

            <!-- 三级分类细项 -->
            <div class="lvl3-tags-wrap">
              <span
                v-for="(leaf, lIdx) in (sub.children || [])"
                :key="leaf.id || lIdx"
                class="lvl3-tag"
                @click.stop="goGoodsList(leaf.id, sub.id, sub.parentId)"
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
import { useRouter } from 'vue-router';
import { ArrowRight } from '@element-plus/icons-vue';
import { getCategory } from '@/api/goods';

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

const router = useRouter();

// 默认真实类目备选数据（防止弱网下未加载出接口时空白）
const fallbackCategories = [
  {
    id: '1348576427264204941',
    name: '电脑办公',
    children: [
      { id: '1-1', name: '电脑整机', parentId: '1348576427264204941', children: [{ id: '1-1-1', name: '笔记本' }, { id: '1-1-2', name: '游戏本' }, { id: '1-1-3', name: '台式机' }, { id: '1-1-4', name: '平板电脑' }] },
      { id: '1-2', name: '电脑配件', parentId: '1348576427264204941', children: [{ id: '1-2-1', name: '显示器' }, { id: '1-2-2', name: '显卡' }, { id: '1-2-3', name: '机械键盘' }, { id: '1-2-4', name: '鼠标' }] },
      { id: '1-3', name: '手机通讯', parentId: '1348576427264204941', children: [{ id: '1-3-1', name: '5G智能手机' }, { id: '1-3-2', name: '拍照手机' }, { id: '1-3-3', name: '蓝牙耳机' }] }
    ]
  },
  {
    id: '1348576427268399553',
    name: '家用电器',
    children: [
      { id: '2-1', name: '大家电', parentId: '1348576427268399553', children: [{ id: '2-1-1', name: '平板电视' }, { id: '2-1-2', name: '风冷冰箱' }, { id: '2-1-3', name: '滚筒洗衣机' }, { id: '2-1-4', name: '变频空调' }] },
      { id: '2-2', name: '生活电器', parentId: '1348576427268399553', children: [{ id: '2-2-1', name: '空气净化器' }, { id: '2-2-2', name: '扫地机器人' }, { id: '2-2-3', name: '吸尘器' }] },
      { id: '2-3', name: '厨房小电', parentId: '1348576427268399553', children: [{ id: '2-3-1', name: '电饭煲' }, { id: '2-3-2', name: '复古咖啡机' }, { id: '2-3-3', name: '破壁料理机' }] }
    ]
  },
  {
    id: '1348576427260010496',
    name: '服装鞋包',
    children: [
      { id: '3-1', name: '女装流行', parentId: '1348576427260010496', children: [{ id: '3-1-1', name: '连衣裙' }, { id: '3-1-2', name: '羊绒大衣' }, { id: '3-1-3', name: '早秋衬衫' }, { id: '3-1-4', name: '休闲裤' }] },
      { id: '3-2', name: '男装精选', parentId: '1348576427260010496', children: [{ id: '3-2-1', name: '商务夹克' }, { id: '3-2-2', name: '休闲T恤' }, { id: '3-2-3', name: '免烫衬衫' }, { id: '3-2-4', name: '牛仔裤' }] }
    ]
  },
  {
    id: '1348576427268399363',
    name: '食品生鲜',
    children: [
      { id: '4-1', name: '生鲜水果', parentId: '1348576427268399363', children: [{ id: '4-1-1', name: '进口车厘子' }, { id: '4-1-2', name: '红富士苹果' }, { id: '4-1-3', name: '佳沛奇异果' }] },
      { id: '4-2', name: '休闲零食', parentId: '1348576427268399363', children: [{ id: '4-2-1', name: '每日坚果' }, { id: '4-2-2', name: '烘焙饼干' }, { id: '4-2-3', name: '巧克力糖果' }] }
    ]
  },
  {
    id: '1348576427268399172',
    name: '精品箱包',
    children: [
      { id: '5-1', name: '潮流女包', parentId: '1348576427268399172', children: [{ id: '5-1-1', name: '真皮单肩包' }, { id: '5-1-2', name: '托特大包' }, { id: '5-1-3', name: '斜挎小方包' }] },
      { id: '5-2', name: '商务男包', parentId: '1348576427268399172', children: [{ id: '5-2-1', name: '双肩电脑包' }, { id: '5-2-2', name: '公文手提包' }] }
    ]
  },
  {
    id: '1348576427268399318',
    name: '美妆个护',
    children: [
      { id: '6-1', name: '面部护肤', parentId: '1348576427268399318', children: [{ id: '6-1-1', name: '修护精华' }, { id: '6-1-2', name: '补水面膜' }, { id: '6-1-3', name: '爽肤水' }, { id: '6-1-4', name: '眼霜' }] },
      { id: '6-2', name: '彩妆香水', parentId: '1348576427268399318', children: [{ id: '6-2-1', name: '大牌口红' }, { id: '6-2-2', name: '持久气垫' }, { id: '6-2-3', name: '沙龙香氛' }] }
    ]
  },
  {
    id: '1348576427268399274',
    name: '运动户外',
    children: [
      { id: '7-1', name: '运动鞋服', parentId: '1348576427268399274', children: [{ id: '7-1-1', name: '缓震跑鞋' }, { id: '7-1-2', name: '专业篮球鞋' }, { id: '7-1-3', name: '运动速干衣' }] },
      { id: '7-2', name: '户外装备', parentId: '1348576427268399274', children: [{ id: '7-2-1', name: '露营帐篷' }, { id: '7-2-2', name: '登山包' }, { id: '7-2-3', name: '运动手表' }] }
    ]
  },
  {
    id: '1348576427268399217',
    name: '家居家装',
    children: [
      { id: '8-1', name: '家纺布艺', parentId: '1348576427268399217', children: [{ id: '8-1-1', name: '四件套' }, { id: '8-1-2', name: '乳胶枕' }, { id: '8-1-3', name: '羽绒被' }] },
      { id: '8-2', name: '现代家具', parentId: '1348576427268399217', children: [{ id: '8-2-1', name: '人体工学椅' }, { id: '8-2-2', name: '升降电脑桌' }, { id: '8-2-3', name: '真皮沙发' }] }
    ]
  }
];

const systemCategories = ref([]);
const activeIndex = ref(-1);
const activeCategory = ref(null);
const panelVisible = ref(false);

const isCustomSource = computed(() => {
  // 1. 如果明确指定为系统分类，始终按系统商品分类处理
  if (props.options?.source === 'system') return false;
  // 2. 如果配置为 custom，但分类条目依然是初始未编辑的 4 个占位条目，依然展示真实系统分类
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
  // 3. 其它默认情况均默认展示系统商品分类
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
  return fallbackCategories;
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
      parentId: activeCategory.value.id,
      children: (s.items || []).map((it, iIdx) => ({
        id: `leaf_${idx}_${iIdx}`,
        name: typeof it === 'string' ? it : it.name,
        parentId: s.id
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

function goGoodsList(id, secondId, firstId) {
  const arr = [firstId, secondId, id];
  if (!arr[1]) arr.splice(0, 2);
  if (!arr[0]) arr.shift();
  router.push({
    path: '/goodsList',
    query: { categoryId: arr.filter(Boolean).join(',') }
  });
}

function loadCategories() {
  // 1. 优先读取 localStorage 缓存快速渲染
  try {
    const cached = localStorage.getItem('category');
    const exp = localStorage.getItem('category_expiration_time');
    if (cached && exp && new Date() <= Number(exp)) {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed) && parsed.length) {
        systemCategories.value = parsed;
      }
    }
  } catch (e) {}

  // 2. 调接口拉取最新分类
  getCategory(0).then(res => {
    if (res.success && Array.isArray(res.result) && res.result.length) {
      systemCategories.value = res.result;
      const expTime = new Date().setHours(new Date().getHours() + 1);
      localStorage.setItem('category_expiration_time', expTime);
      localStorage.setItem('category', JSON.stringify(res.result));
    }
  }).catch(err => {
    console.warn('获取分类失败', err);
  });
}

onMounted(() => {
  loadCategories();
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
.decor-category-mega-menu {
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
      text-decoration: none;
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
        cursor: pointer;
        transition: all 0.15s;

        .pill-arrow {
          font-size: 10px;
          color: #94a3b8;
        }

        &:hover {
          background: #ecf5ff;
          color: #409EFF;

          .pill-arrow {
            color: #409EFF;
          }
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
          cursor: pointer;
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

          &:hover {
            color: #409EFF;
            .lvl2-arrow {
              color: #409EFF;
            }
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
            cursor: pointer;
            transition: color 0.15s;
            line-height: 1.6;

            &:hover {
              color: #409EFF;
            }
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
