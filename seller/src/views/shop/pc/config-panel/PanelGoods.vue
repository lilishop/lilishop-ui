<template>
  <div class="panel-goods-commerce">
    <!-- 1. 楼层标题设置 (部分包含标题的商品楼层可用，如商品条 goodsBar、网格楼层等) -->
    <div class="panel-section" v-if="hasTitleConfig">
      <div class="section-title">楼层主副标题</div>
      <div class="form-item">
        <span class="item-label">主标题</span>
        <el-input v-model="options.title" size="small" placeholder="如：热门推荐 / 限时秒杀" clearable />
      </div>
      <div class="form-item">
        <span class="item-label">副标题</span>
        <el-input v-model="options.subtitle" size="small" placeholder="如：全网热销爆款 · 每日必抢" clearable />
      </div>
      <div class="form-item">
        <span class="item-label">查看更多链接</span>
        <div class="link-picker-wrap">
          <el-input
            v-model="options.moreUrl"
            size="small"
            placeholder="如：/goodsList 或活动页面"
            clearable
          >
            <template #prefix>
              <el-icon class="link-input-icon"><Link /></el-icon>
            </template>
          </el-input>
          <el-button
            type="primary"
            plain
            size="small"
            class="action-picker-btn link-btn"
            @click="handleSelectMoreLink"
          >
            <el-icon class="mr-4"><Link /></el-icon>
            <span>选择链接</span>
          </el-button>
        </div>
        <div class="link-current-tag" v-if="options.moreUrl">
          <span class="tag-label">当前链接:</span>
          <span class="tag-val" :title="options.moreUrl">{{ options.moreUrl }}</span>
        </div>
      </div>
    </div>

    <!-- 2. 横幅楼层专属横幅海报 (bannerFloor) -->
    <div class="panel-section" v-if="component.type === 'bannerFloor'">
      <div class="section-title">左侧专属大促海报</div>
      <div class="form-item">
        <span class="item-label">海报图片</span>
        <div class="picker-flex-wrap">
          <div
            class="thumb-preview-box"
            @click="handleSelectBannerImg"
            :title="options.bannerImg ? '点击更换海报' : '点击选择海报'"
          >
            <template v-if="options.bannerImg">
              <img :src="options.bannerImg" alt="海报" class="preview-img" />
              <span class="thumb-clear-btn" @click.stop="options.bannerImg = ''" title="清除图片">
                <el-icon><Close /></el-icon>
              </span>
            </template>
            <template v-else>
              <el-icon class="thumb-empty-icon"><Picture /></el-icon>
              <span class="thumb-empty-tip">选图</span>
            </template>
          </div>
          <div class="input-with-action flex-1">
            <el-input
              v-model="options.bannerImg"
              size="small"
              placeholder="请输入或选择海报图片"
              clearable
            />
            <el-button
              size="small"
              class="action-picker-btn"
              @click="handleSelectBannerImg"
            >
              <el-icon class="mr-4"><Picture /></el-icon>
              <span>选择图片</span>
            </el-button>
          </div>
        </div>
      </div>

      <div class="form-item mt-10">
        <span class="item-label">海报跳转地址</span>
        <div class="link-picker-wrap">
          <el-input
            v-model="options.bannerUrl"
            size="small"
            placeholder="如 /goodsList 或活动专区"
            clearable
          >
            <template #prefix>
              <el-icon class="link-input-icon"><Link /></el-icon>
            </template>
          </el-input>
          <el-button
            type="primary"
            plain
            size="small"
            class="action-picker-btn link-btn"
            @click="handleSelectBannerLink"
          >
            <el-icon class="mr-4"><Link /></el-icon>
            <span>选择链接</span>
          </el-button>
        </div>
        <div class="link-current-tag" v-if="options.bannerUrl">
          <span class="tag-label">当前链接:</span>
          <span class="tag-val" :title="options.bannerUrl">{{ options.bannerUrl }}</span>
        </div>
      </div>
    </div>

    <!-- 3. 频道楼层专属多 Tab 设置 (channelFloor) -->
    <div class="panel-section" v-if="component.type === 'channelFloor'">
      <div class="section-title flex-between">
        <span>频道 Tabs 专区设置</span>
        <el-button link type="primary" size="small" @click="handleAddTab">
          <el-icon><Plus /></el-icon> 添加 Tab
        </el-button>
      </div>
      <div class="tabs-list">
        <div v-for="(tab, tIdx) in options.tabs" :key="tIdx" class="tab-item-row">
          <el-input v-model="tab.title" size="small" placeholder="Tab 名称" style="width: 100px" />
          <el-cascader
            v-model="tab.categoryId"
            :options="categoryOptions"
            :props="cascaderProps"
            placeholder="绑定分类"
            clearable
            filterable
            size="small"
            style="flex: 1"
          />
          <el-button link type="danger" size="small" @click="options.tabs.splice(tIdx, 1)">
            <el-icon><Delete /></el-icon>
          </el-button>
        </div>
      </div>
    </div>

    <!-- 4. 排版与列数设置 -->
    <div class="panel-section" v-if="options.columns !== undefined">
      <div class="section-title">排版与列数</div>
      <div class="form-item flex-row">
        <span class="item-label">单行展示列数</span>
        <el-radio-group v-model="options.columns" size="small">
          <el-radio-button :label="3">3 列</el-radio-button>
          <el-radio-button :label="4">4 列</el-radio-button>
          <el-radio-button :label="5">5 列</el-radio-button>
          <el-radio-button :label="6">6 列</el-radio-button>
        </el-radio-group>
      </div>
    </div>

    <!-- 5. 数据源设置 -->
    <div class="panel-section" v-if="component.type !== 'recommendFeed'">
      <div class="section-title">商品数据来源</div>
      <div class="form-item flex-row">
        <span class="item-label">数据源模式</span>
        <el-radio-group v-model="options.dataSource" size="small">
          <el-radio-button label="manual">手动选品</el-radio-button>
          <el-radio-button label="category">分类自动拉取</el-radio-button>
        </el-radio-group>
      </div>

      <!-- A. 分类自动拉取区 -->
      <div class="category-pick-wrap" v-if="options.dataSource === 'category'">
        <div class="form-item">
          <span class="item-label">商品分类选择器</span>
          <div class="category-select-row">
            <el-cascader
              v-model="options.categoryId"
              :options="categoryOptions"
              :props="cascaderProps"
              placeholder="全部分类 (支持级联与搜索)"
              clearable
              filterable
              class="category-cascader"
              @change="handleCategoryChange"
            />
            <el-button size="small" type="primary" plain @click="openCategoryModal">
              分类选择器
            </el-button>
          </div>
        </div>

        <!-- 已选分类路径徽章 -->
        <div class="form-item" v-if="selectedCategoryLabel">
          <span class="item-label">已选分类</span>
          <div class="category-badge">
            <span class="badge-icon">🏷️</span>
            <span class="badge-text">{{ selectedCategoryLabel }}</span>
            <el-button link type="danger" size="small" @click="handleClearCategory">清除</el-button>
          </div>
        </div>

        <div class="form-item flex-row">
          <span class="item-label">拉取商品数量</span>
          <el-input-number
            v-model="options.goodsCount"
            :min="1"
            :max="50"
            size="small"
            controls-position="right"
          />
        </div>

        <div class="form-item">
          <span class="item-label">商品排序规则</span>
          <el-select v-model="options.sortType" size="small" placeholder="排序规则" style="width: 100%;">
            <el-option label="综合推荐" value="default" />
            <el-option label="销量优先" value="sales" />
            <el-option label="价格从低到高" value="price_asc" />
            <el-option label="价格从高到低" value="price_desc" />
            <el-option label="最新上架" value="new" />
          </el-select>
        </div>

        <div class="category-hint">
          <span>💡 提示：买家前台将根据所选分类与排序规则自动加载最新商品；若分类无商品将展示精选推荐商品。</span>
        </div>
      </div>

      <!-- B. 手动选品区 -->
      <div class="manual-pick-wrap" v-if="options.dataSource === 'manual'">
        <div class="pick-header">
          <span class="pick-info">已选商品 ({{ options.goods?.length || 0 }} 件)</span>
          <div class="pick-tools">
            <el-button v-if="options.goods?.length" link type="danger" size="small" @click="options.goods = []">清空</el-button>
            <el-button type="primary" size="small" @click="handleOpenGoodsPicker">从商品库选择</el-button>
            <el-button size="small" @click="handleAddCustomGoods">
              <el-icon class="mr-4"><Plus /></el-icon> 自定义加品
            </el-button>
          </div>
        </div>

        <!-- 已选商品列表滚动区 -->
        <div class="selected-goods-list" v-if="options.goods?.length">
          <div
            v-for="(g, gIdx) in options.goods"
            :key="g.id || gIdx"
            class="selected-item"
          >
            <!-- 缩略图：点击可通过 openImagePicker 更换商品图片 -->
            <div class="item-thumb-box" @click="handleSelectGoodsThumb(g)" title="点击更换商品图片">
              <img :src="g.thumbnail || defaultThumb" alt="" class="item-thumb" />
              <div class="thumb-hover-overlay">
                <el-icon><Picture /></el-icon>
                <span>换图</span>
              </div>
            </div>

            <div class="item-info">
              <div class="item-name-row">
                <el-input v-model="g.goodsName" size="small" placeholder="商品名称" class="item-name-input" />
              </div>
              <div class="item-meta-row">
                <div class="price-input-wrap">
                  <span class="price-sym">￥</span>
                  <el-input v-model="g.price" size="small" placeholder="价格" class="price-mini-input" />
                </div>
                <!-- 链接选择按钮 -->
                <el-button
                  link
                  type="primary"
                  size="small"
                  class="item-link-btn"
                  @click="handleSelectGoodsLink(g)"
                  :title="g.url || '配置商品跳转链接'"
                >
                  <el-icon><Link /></el-icon>
                  <span v-if="g.url" class="link-btn-text">已配链接</span>
                  <span v-else class="link-btn-text">选链接</span>
                </el-button>
              </div>
              <div class="item-url-badge" v-if="g.url" :title="g.url">
                <span class="badge-dot"></span>
                <span class="badge-text">{{ g.url }}</span>
                <el-icon class="badge-del" @click.stop="g.url = ''" title="清除链接"><Close /></el-icon>
              </div>
            </div>

            <div class="item-actions">
              <el-button link type="danger" size="small" @click="removeSelectedGoods(gIdx)" title="移除商品">
                <el-icon><Delete /></el-icon>
              </el-button>
            </div>
          </div>
        </div>
        <div class="empty-goods-tip" v-else>
          暂无商品，请点击“从商品库选择”或“自定义加品”
        </div>
      </div>
    </div>

    <!-- 6. 商品卡片信息显隐开关 -->
    <div class="panel-section">
      <div class="section-title">商品元素显隐控制</div>
      <div class="switch-grid">
        <div class="switch-item" v-if="options.showTitle !== undefined">
          <span>商品标题</span>
          <el-switch v-model="options.showTitle" size="small" />
        </div>
        <div class="switch-item" v-if="options.showPrice !== undefined">
          <span>销售价格</span>
          <el-switch v-model="options.showPrice" size="small" />
        </div>
        <div class="switch-item" v-if="options.showOriginalPrice !== undefined">
          <span>原价/划线价</span>
          <el-switch v-model="options.showOriginalPrice" size="small" />
        </div>
        <div class="switch-item" v-if="options.showCartBtn !== undefined">
          <span>加购按钮</span>
          <el-switch v-model="options.showCartBtn" size="small" />
        </div>
        <div class="switch-item" v-if="options.showTags !== undefined">
          <span>促销标签</span>
          <el-switch v-model="options.showTags" size="small" />
        </div>
      </div>
    </div>

    <!-- 商品库选择弹窗 (兜底) -->
    <el-dialog
      v-if="!openGoodsPicker && showGoodsModal"
      v-model="showGoodsModal"
      title="从商品库选择商品"
      width="1160px"
      append-to-body
      destroy-on-close
    >
      <goods-dialog
        :selectedWay="tempSelectedGoods"
        @selected="(val) => { tempSelectedGoods = val; }"
      />
      <template #footer>
        <el-button @click="showGoodsModal = false">取消</el-button>
        <el-button type="primary" @click="confirmGoodsSelected">确定</el-button>
      </template>
    </el-dialog>

    <!-- 分类选择弹窗 -->
    <el-dialog
      v-model="showCategoryModal"
      title="选择商品分类"
      width="680px"
      append-to-body
      destroy-on-close
    >
      <category-selector @selected="handleCategoryModalSelect" />
      <div class="modal-current-selected" v-if="modalSelectedCategory">
        当前选定分类：<strong>{{ modalSelectedCategory.name }}</strong> (ID: {{ modalSelectedCategory.id }})
      </div>
      <template #footer>
        <el-button @click="showCategoryModal = false">取消</el-button>
        <el-button type="primary" :disabled="!modalSelectedCategory" @click="confirmCategoryModal">确定选择</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, inject, onMounted } from 'vue';
import { Plus, Delete, Link, Picture, Close } from '@element-plus/icons-vue';
import { ElMessageBox } from 'element-plus';
import GoodsDialog from '@/views/lili-dialog/goods-dialog.vue';
import CategorySelector from '@/views/lili-dialog/template/category.vue';
import { getCategoryTree } from '@/api/goods.js';

// 注入来自 pc/index.vue 的全局选择器
const openImagePicker = inject('openImagePicker', null);
const openLinkPicker = inject('openLinkPicker', null);
const openGoodsPicker = inject('openGoodsPicker', null);

const tempSelectedGoods = ref([]);

const props = defineProps({
  component: {
    type: Object,
    required: true
  },
  options: {
    type: Object,
    required: true
  }
});

const defaultThumb = 'https://lilishop-pc.oss-cn-beijing.aliyuncs.com/static/goods/goods_1.png';
const showGoodsModal = ref(false);
const showCategoryModal = ref(false);
const modalSelectedCategory = ref(null);

// 默认值补充
if (!props.options.dataSource) {
  props.options.dataSource = 'manual';
}
if (!props.options.sortType) {
  props.options.sortType = 'default';
}
if (props.options.goodsCount === undefined) {
  props.options.goodsCount = props.component?.type === 'goodsCard' ? 1 : 6;
}
if (props.component?.type === 'goodsCard') {
  props.options.showSales = false;
}

if (props.component?.type === 'goodsList' && (props.options.columns === undefined || props.options.columns === 4)) {
  props.options.columns = 6;
}

const hasTitleConfig = computed(() => {
  return ['gridFloor', 'bannerFloor', 'goodsBar', 'channelFloor', 'recommendFeed'].includes(props.component.type);
});

// 分类树与级联配置
const cascaderProps = {
  label: 'name',
  value: 'id',
  children: 'children',
  emitPath: false,
  checkStrictly: true
};

const rawCategoryTree = ref([]);

const fallbackCategories = [
  {
    id: '1',
    name: '手机数码',
    children: [
      {
        id: '1-1',
        name: '智能手机',
        children: [
          { id: '1-1-1', name: '5G旗舰手机' },
          { id: '1-1-2', name: '折叠屏手机' }
        ]
      },
      {
        id: '1-2',
        name: '电脑办公',
        children: [
          { id: '1-2-1', name: '轻薄笔记本' },
          { id: '1-2-2', name: '游戏笔记本' }
        ]
      }
    ]
  },
  {
    id: '2',
    name: '家用电器',
    children: [
      {
        id: '2-1',
        name: '厨房小电',
        children: [
          { id: '2-1-1', name: '咖啡机' },
          { id: '2-1-2', name: '破壁机' }
        ]
      }
    ]
  },
  {
    id: '3',
    name: '美妆个护',
    children: [
      {
        id: '3-1',
        name: '面部护肤',
        children: [
          { id: '3-1-1', name: '精华液' },
          { id: '3-1-2', name: '面霜乳液' }
        ]
      }
    ]
  },
  {
    id: '4',
    name: '运动户外',
    children: [
      {
        id: '4-1',
        name: '运动鞋包',
        children: [
          { id: '4-1-1', name: '跑步鞋' },
          { id: '4-1-2', name: '休闲板鞋' }
        ]
      },
      {
        id: '4-2',
        name: '户外装备',
        children: [
          { id: '4-2-1', name: '露营帐篷' },
          { id: '4-2-2', name: '户外背包' }
        ]
      }
    ]
  },
  {
    id: '5',
    name: '家居生活',
    children: [
      {
        id: '5-1',
        name: '居家日用',
        children: [
          { id: '5-1-1', name: '香薰蜡烛' },
          { id: '5-1-2', name: '收纳整理' }
        ]
      }
    ]
  }
];

function cleanCategoryTree(list) {
  if (!Array.isArray(list)) return [];
  return list.map(item => {
    const node = {
      id: String(item.id),
      name: item.name
    };
    if (Array.isArray(item.children) && item.children.length > 0) {
      node.children = cleanCategoryTree(item.children);
    }
    return node;
  });
}

const categoryOptions = computed(() => {
  return cleanCategoryTree(rawCategoryTree.value);
});

function getPathLabels(tree, id) {
  if (!id || !Array.isArray(tree)) return [];
  for (const node of tree) {
    if (String(node.id) === String(id)) {
      return [node.name];
    }
    if (Array.isArray(node.children) && node.children.length > 0) {
      const sub = getPathLabels(node.children, id);
      if (sub.length > 0) {
        return [node.name, ...sub];
      }
    }
  }
  return [];
}

const selectedCategoryLabel = computed(() => {
  if (!props.options.categoryId) return '';
  const path = getPathLabels(rawCategoryTree.value, props.options.categoryId);
  if (path.length > 0) {
    return path.join(' / ');
  }
  return props.options.categoryName || `分类 ID: ${props.options.categoryId}`;
});

function handleCategoryChange(val) {
  if (!val) {
    props.options.categoryId = '';
    props.options.categoryName = '';
    return;
  }
  props.options.categoryId = String(val);
  const labels = getPathLabels(rawCategoryTree.value, val);
  if (labels.length > 0) {
    props.options.categoryName = labels[labels.length - 1];
  }
}

function handleClearCategory() {
  props.options.categoryId = '';
  props.options.categoryName = '';
}

function openCategoryModal() {
  modalSelectedCategory.value = null;
  showCategoryModal.value = true;
}

function handleCategoryModalSelect(val) {
  if (Array.isArray(val) && val.length > 0) {
    modalSelectedCategory.value = val[0];
  }
}

function confirmCategoryModal() {
  if (modalSelectedCategory.value) {
    props.options.categoryId = String(modalSelectedCategory.value.id);
    props.options.categoryName = modalSelectedCategory.value.name;
  }
  showCategoryModal.value = false;
}

onMounted(async () => {
  try {
    const res = await getCategoryTree();
    if (res && res.success && Array.isArray(res.result) && res.result.length > 0) {
      rawCategoryTree.value = res.result;
      return;
    }
  } catch (err) {
    console.warn('Load category tree failed:', err);
  }
  rawCategoryTree.value = fallbackCategories;
});

function handleAddTab() {
  if (!Array.isArray(props.options.tabs)) props.options.tabs = [];
  props.options.tabs.push({ title: '新频道专区', categoryId: '', goods: [] });
}

// 1. 选择查看更多链接 (适用于商品条 goodsBar、网格楼层等)
function handleSelectMoreLink() {
  if (openLinkPicker) {
    openLinkPicker(({ url }) => {
      if (url) props.options.moreUrl = url;
    });
  } else {
    ElMessageBox.prompt('请输入“查看更多”跳转链接：', '设置更多链接', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      inputValue: props.options.moreUrl || '',
      inputPattern: /^\S+$/,
      inputErrorMessage: '链接不能为空'
    })
      .then(({ value }) => {
        props.options.moreUrl = value.trim();
      })
      .catch(() => {});
  }
}

// 2. 选择 bannerFloor 横幅图片与链接
function handleSelectBannerImg() {
  if (openImagePicker) {
    openImagePicker((url) => {
      if (url) props.options.bannerImg = url;
    });
  } else {
    ElMessageBox.prompt('请输入海报图片 URL 地址：', '选择海报图片', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      inputValue: props.options.bannerImg || '',
      inputPattern: /^\S+$/,
      inputErrorMessage: '图片地址不能为空'
    })
      .then(({ value }) => {
        props.options.bannerImg = value.trim();
      })
      .catch(() => {});
  }
}

function handleSelectBannerLink() {
  if (openLinkPicker) {
    openLinkPicker(({ url }) => {
      if (url) props.options.bannerUrl = url;
    });
  } else {
    ElMessageBox.prompt('请输入海报跳转链接：', '设置海报链接', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      inputValue: props.options.bannerUrl || '',
      inputPattern: /^\S+$/,
      inputErrorMessage: '链接不能为空'
    })
      .then(({ value }) => {
        props.options.bannerUrl = value.trim();
      })
      .catch(() => {});
  }
}

// 3. 更换单个商品图片
function handleSelectGoodsThumb(g) {
  if (openImagePicker) {
    openImagePicker((url) => {
      if (url) g.thumbnail = url;
    });
  } else {
    ElMessageBox.prompt('请输入商品图片 URL 地址：', '更换商品图片', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      inputValue: g.thumbnail || '',
      inputPattern: /^\S+$/,
      inputErrorMessage: '图片地址不能为空'
    })
      .then(({ value }) => {
        g.thumbnail = value.trim();
      })
      .catch(() => {});
  }
}

// 4. 选择单个商品自定义跳转链接
function handleSelectGoodsLink(g) {
  if (openLinkPicker) {
    openLinkPicker(({ url, title }) => {
      if (url) g.url = url;
      if (!g.goodsName && title) g.goodsName = title;
    });
  } else {
    ElMessageBox.prompt('请输入商品跳转链接（如 /goodsDetail?goodsId=xxx 或完整网址）：', '设置商品链接', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      inputValue: g.url || '',
      inputPattern: /^\S+$/,
      inputErrorMessage: '链接不能为空'
    })
      .then(({ value }) => {
        g.url = value.trim();
      })
      .catch(() => {});
  }
}

// 5. 手动添加自定义商品
function handleAddCustomGoods() {
  if (!Array.isArray(props.options.goods)) props.options.goods = [];
  const nextId = String(Date.now());
  props.options.goods.push({
    id: nextId,
    goodsName: '全新自定义特惠好物',
    price: '99.00',
    originalPrice: '199.00',
    thumbnail: defaultThumb,
    url: ''
  });
}

function handleOpenGoodsPicker() {
  if (typeof openGoodsPicker === 'function') {
    openGoodsPicker((selectedGoods) => {
      applySelectedGoods(selectedGoods);
    }, props.options.goods || []);
  } else {
    tempSelectedGoods.value = Array.isArray(props.options.goods) ? [...props.options.goods] : [];
    showGoodsModal.value = true;
  }
}

function confirmGoodsSelected() {
  applySelectedGoods(tempSelectedGoods.value);
  showGoodsModal.value = false;
}

function applySelectedGoods(selectedGoods) {
  if (Array.isArray(selectedGoods)) {
    props.options.goods = selectedGoods.map(g => ({
      id: g.id || g.skuId || g.goodsId,
      goodsId: g.goodsId,
      goodsName: g.goodsName || g.name,
      price: g.price,
      originalPrice: g.originalPrice || g.price,
      thumbnail: g.thumbnail || g.pic || defaultThumb,
      url: g.url || ''
    }));
  }
}

function removeSelectedGoods(index) {
  props.options.goods.splice(index, 1);
}
</script>

<style lang="scss" scoped>
.panel-goods-commerce {
  .panel-section {
    margin-bottom: 20px;
    padding-bottom: 16px;
    border-bottom: 1px dashed #e2e8f0;

    .section-title {
      font-size: 13px;
      font-weight: 600;
      color: #0f172a;
      margin-bottom: 12px;

      &.flex-between {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
    }

    .form-item {
      display: flex;
      flex-direction: column;
      gap: 6px;
      margin-bottom: 12px;

      &.flex-row {
        flex-direction: row;
        align-items: center;
        justify-content: space-between;
      }

      .item-label {
        font-size: 12px;
        color: #475569;
        font-weight: 500;
      }
    }

    .tabs-list {
      display: flex;
      flex-direction: column;
      gap: 8px;

      .tab-item-row {
        display: flex;
        align-items: center;
        gap: 6px;
      }
    }

    .category-pick-wrap {
      background: #f8fafc;
      padding: 12px;
      border-radius: 6px;
      border: 1px solid #e2e8f0;
      display: flex;
      flex-direction: column;
      gap: 10px;

      .category-select-row {
        display: flex;
        gap: 8px;
        align-items: center;

        .category-cascader {
          flex: 1;
        }
      }

      .category-badge {
        display: flex;
        align-items: center;
        gap: 6px;
        background: #eff6ff;
        border: 1px solid #bfdbfe;
        color: #1d4ed8;
        padding: 6px 10px;
        border-radius: 4px;
        font-size: 12px;

        .badge-icon {
          font-size: 12px;
        }

        .badge-text {
          flex: 1;
          font-weight: 500;
          word-break: break-all;
        }
      }

      .category-hint {
        font-size: 11px;
        color: #64748b;
        line-height: 1.5;
        background: #ffffff;
        padding: 6px 8px;
        border-radius: 4px;
        border: 1px dashed #cbd5e1;
      }
    }

    .manual-pick-wrap {
      background: #f8fafc;
      padding: 10px;
      border-radius: 6px;
      border: 1px solid #e2e8f0;

      .pick-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 10px;

        .pick-info {
          font-size: 12px;
          font-weight: 500;
          color: #334155;
        }

        .pick-tools {
          display: flex;
          align-items: center;
          gap: 6px;
        }
      }

      .selected-goods-list {
        display: flex;
        flex-direction: column;
        gap: 8px;
        max-height: 280px;
        overflow-y: auto;

        .selected-item {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          transition: border-color 0.2s;

          &:hover {
            border-color: #cbd5e1;
          }

          .item-thumb-box {
            position: relative;
            width: 44px;
            height: 44px;
            border-radius: 4px;
            overflow: hidden;
            flex-shrink: 0;
            cursor: pointer;
            border: 1px solid #e2e8f0;

            .item-thumb {
              width: 100%;
              height: 100%;
              object-fit: cover;
              display: block;
            }

            .thumb-hover-overlay {
              position: absolute;
              inset: 0;
              background: rgba(15, 23, 42, 0.7);
              color: #ffffff;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              font-size: 10px;
              opacity: 0;
              transition: opacity 0.2s;

              .el-icon {
                font-size: 12px;
                margin-bottom: 1px;
              }
            }

            &:hover .thumb-hover-overlay {
              opacity: 1;
            }
          }

          .item-info {
            flex: 1;
            min-width: 0;
            display: flex;
            flex-direction: column;
            gap: 4px;

            .item-name-row {
              width: 100%;

              .item-name-input {
                width: 100%;
              }
            }

            .item-meta-row {
              display: flex;
              align-items: center;
              justify-content: space-between;

              .price-input-wrap {
                display: flex;
                align-items: center;
                gap: 2px;

                .price-sym {
                  font-size: 12px;
                  color: #e11d48;
                  font-weight: 700;
                }

                .price-mini-input {
                  width: 75px;
                }
              }

              .item-link-btn {
                font-size: 11px;
                padding: 0 4px;

                .link-btn-text {
                  margin-left: 2px;
                }
              }
            }

            .item-url-badge {
              display: flex;
              align-items: center;
              gap: 4px;
              font-size: 10px;
              background: #f0fdf4;
              border: 1px solid #bbf7d0;
              color: #166534;
              border-radius: 3px;
              padding: 1px 6px;
              overflow: hidden;

              .badge-dot {
                width: 5px;
                height: 5px;
                border-radius: 50%;
                background: #22c55e;
                flex-shrink: 0;
              }

              .badge-text {
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
                flex: 1;
              }

              .badge-del {
                cursor: pointer;
                color: #ef4444;
                font-size: 10px;
                flex-shrink: 0;

                &:hover {
                  font-weight: bold;
                }
              }
            }
          }

          .item-actions {
            flex-shrink: 0;
          }
        }
      }

      .empty-goods-tip {
        font-size: 12px;
        color: #94a3b8;
        text-align: center;
        padding: 16px 0;
      }
    }

    .switch-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 10px;

      .switch-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 8px 10px;
        background: #f8fafc;
        border: 1px solid #e2e8f0;
        border-radius: 6px;
        font-size: 12px;
        color: #334155;
      }
    }
  }

  .mr-4 {
    margin-right: 4px;
  }

  .mt-10 {
    margin-top: 10px;
  }

  .flex-1 {
    flex: 1;
  }

  .picker-flex-wrap {
    display: flex;
    align-items: center;
    gap: 8px;

    .thumb-preview-box {
      position: relative;
      width: 58px;
      height: 40px;
      border-radius: 4px;
      border: 1px dashed #cbd5e1;
      background: #ffffff;
      cursor: pointer;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      transition: border-color 0.2s;

      &:hover {
        border-color: #409eff;
      }

      .preview-img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
      }

      .thumb-empty-icon {
        font-size: 15px;
        color: #94a3b8;
      }

      .thumb-empty-tip {
        font-size: 10px;
        color: #94a3b8;
        line-height: 1;
        margin-top: 2px;
      }

      .thumb-clear-btn {
        position: absolute;
        top: 2px;
        right: 2px;
        background: rgba(0, 0, 0, 0.65);
        color: #ffffff;
        width: 14px;
        height: 14px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 10px;
        cursor: pointer;

        &:hover {
          background: #ef4444;
        }
      }
    }

    .input-with-action {
      display: flex;
      align-items: center;
      gap: 6px;

      .action-picker-btn {
        flex-shrink: 0;
        padding: 0 10px;
      }
    }
  }

  .link-picker-wrap {
    display: flex;
    align-items: center;
    gap: 6px;

    .link-input-icon {
      color: #94a3b8;
    }

    .action-picker-btn {
      flex-shrink: 0;
      padding: 0 10px;

      &.link-btn {
        background: #ecf5ff;
        border-color: #b3d8ff;
        color: #409eff;

        &:hover {
          background: #409eff;
          color: #ffffff;
        }
      }
    }
  }

  .link-current-tag {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 11px;
    background: #eff6ff;
    border: 1px solid #dbeafe;
    border-radius: 4px;
    padding: 3px 8px;
    margin-top: 4px;
    overflow: hidden;

    .tag-label {
      color: #3b82f6;
      font-weight: 500;
      flex-shrink: 0;
    }

    .tag-val {
      color: #1e40af;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }

  .modal-current-selected {
    margin-top: 12px;
    padding: 8px 12px;
    background: #f1f5f9;
    border-radius: 4px;
    font-size: 13px;
    color: #334155;
  }
}
</style>
