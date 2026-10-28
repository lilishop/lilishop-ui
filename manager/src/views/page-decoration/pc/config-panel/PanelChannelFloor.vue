<template>
  <div class="panel-channel-floor">
    <!-- 1. 标题区设置 -->
    <div class="panel-section">
      <div class="section-title">标题区设置</div>
      <div class="form-item">
        <span class="item-label">展示标题区</span>
        <el-switch v-model="options.showTitle" size="small" />
      </div>
      <template v-if="options.showTitle !== false">
        <div class="form-item">
          <span class="item-label">主标题</span>
          <el-input v-model="options.title" size="small" placeholder="如：场景频道" />
        </div>
        <div class="form-item">
          <span class="item-label">副标题</span>
          <el-input v-model="options.subtitle" size="small" placeholder="如：主视觉 + 商品组合楼层" />
        </div>
      </template>
    </div>

    <!-- 2. 主视觉设置 (Hero Section) -->
    <div class="panel-section">
      <div class="section-title">场景主视觉</div>
      <div class="form-item">
        <span class="item-label">主视觉图片</span>
        <el-input v-model="options.heroImage" size="small" placeholder="建议尺寸: 520x560px" clearable />
      </div>
      <div class="form-item">
        <span class="item-label">主视觉大标题</span>
        <el-input v-model="options.heroTitle" size="small" placeholder="如：品质生活馆" />
      </div>
      <div class="form-item">
        <span class="item-label">主视觉副标题</span>
        <el-input v-model="options.heroSubtitle" size="small" placeholder="如：精选场景好物，一站购齐" />
      </div>
      <div class="form-item">
        <span class="item-label">行动按钮文案</span>
        <el-input v-model="options.heroButtonText" size="small" placeholder="如：进入频道" />
      </div>
      <div class="form-item">
        <span class="item-label">按钮跳转链接</span>
        <el-input v-model="options.heroHref" size="small" placeholder="如：/goods" />
      </div>
      <div class="form-item">
        <span class="item-label">主视觉视觉风格</span>
        <el-radio-group v-model="options.heroStyle" size="small">
          <el-radio-button label="gradient">主题渐变</el-radio-button>
          <el-radio-button label="plain">简洁浅色</el-radio-button>
        </el-radio-group>
      </div>
    </div>

    <!-- 3. 活动入口 (Promos) -->
    <div class="panel-section">
      <div class="section-title flex-between">
        <span>活动入口 ({{ options.promos?.length || 0 }} 个)</span>
        <el-button link type="primary" size="small" @click="handleAddPromo">
          <el-icon><Plus /></el-icon> 添加活动
        </el-button>
      </div>

      <div class="promos-list-editor">
        <div v-for="(p, pIdx) in options.promos" :key="pIdx" class="promo-editor-card">
          <div class="promo-row-1">
            <el-input v-model="p.tag" size="small" placeholder="标签(限时/新品)" style="width: 100px" />
            <el-input v-model="p.title" size="small" placeholder="活动主标题" style="flex: 1" />
            <el-button link type="danger" size="small" @click="options.promos.splice(pIdx, 1)">
              <el-icon><Delete /></el-icon>
            </el-button>
          </div>
          <div class="promo-row-2">
            <el-input v-model="p.desc" size="small" placeholder="活动描述(如: 领券最高减100)" />
          </div>
        </div>
      </div>
    </div>

    <!-- 4. 场景商品选择 -->
    <div class="panel-section">
      <div class="section-title flex-between">
        <span>场景商品位 ({{ options.goods?.length || 0 }} 件)</span>
        <el-button type="primary" size="small" @click="showGoodsModal = true">
          选择真实商品
        </el-button>
      </div>

      <div class="form-item">
        <span class="item-label">展示商品数量</span>
        <el-input-number v-model="options.goodsCount" :min="1" :max="8" size="small" controls-position="right" />
      </div>

      <div class="goods-list-preview" v-if="options.goods?.length">
        <div v-for="(g, idx) in options.goods" :key="g.id || idx" class="goods-item-row">
          <img :src="g.thumbnail || defaultThumb" class="g-thumb" alt="" />
          <div class="g-info">
            <span class="g-name">{{ g.goodsName }}</span>
            <span class="g-price">￥{{ g.price }}</span>
          </div>
          <el-button link type="danger" size="small" @click="options.goods.splice(idx, 1)">
            <el-icon><Delete /></el-icon>
          </el-button>
        </div>
      </div>
    </div>

    <!-- 商品选择弹窗 -->
    <el-dialog v-model="showGoodsModal" title="选择场景商品" width="600px" append-to-body>
      <div class="modal-goods-pool">
        <div
          v-for="item in mockPool"
          :key="item.id"
          class="pool-item"
          :class="{ selected: isSelected(item.id) }"
          @click="toggleSelect(item)"
        >
          <img :src="item.thumbnail" class="pool-thumb" alt="" />
          <div class="pool-meta">
            <div class="pool-name">{{ item.goodsName }}</div>
            <div class="pool-price">￥{{ item.price }}</div>
          </div>
          <el-icon v-if="isSelected(item.id)" class="check-icon"><Check /></el-icon>
        </div>
      </div>
      <template #footer>
        <el-button @click="showGoodsModal = false">完成</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { Plus, Delete, Check } from '@element-plus/icons-vue';

const props = defineProps({
  component: {
    type: Object,
    default: () => ({})
  },
  options: {
    type: Object,
    default: () => ({})
  }
});

const defaultThumb = '/static/goods/goods_1.png';
const showGoodsModal = ref(false);

if (props.options.showTitle === undefined) props.options.showTitle = true;
if (!props.options.title) props.options.title = '场景频道';
if (!props.options.subtitle) props.options.subtitle = '主视觉 + 商品组合楼层';
if (!props.options.heroImage) props.options.heroImage = '/static/banner-floor/floor_banner_1.png';
if (!props.options.heroTitle) props.options.heroTitle = '品质生活馆';
if (!props.options.heroSubtitle) props.options.heroSubtitle = '精选场景好物，一站购齐';
if (!props.options.heroButtonText) props.options.heroButtonText = '进入频道';
if (!props.options.heroHref) props.options.heroHref = '/goods';
if (!props.options.heroStyle) props.options.heroStyle = 'gradient';
if (!props.options.promos) {
  props.options.promos = [
    { title: '大牌补贴', desc: '领券最高减100', tag: '限时', url: '/goods' },
    { title: '新品驾到', desc: '官方正品首发', tag: '新品', url: '/goods' }
  ];
}
if (!props.options.goodsCount) props.options.goodsCount = 6;
if (!props.options.goods) {
  props.options.goods = [
    { id: '1', goodsName: '旗舰 5G 智能手机 12GB+256GB 超光影影像系统', price: '3999.00', originalPrice: '4599.00', thumbnail: '/static/goods/goods_1.png' },
    { id: '2', goodsName: '无线头戴式深度主动降噪蓝牙耳机 空间音频Hi-Res', price: '1099.00', originalPrice: '1499.00', thumbnail: '/static/goods/goods_2.png' },
    { id: '3', goodsName: '14英寸 全面屏轻薄商务笔记本电脑 酷睿i7 高刷防眩光', price: '5699.00', originalPrice: '6299.00', thumbnail: '/static/goods/goods_3.png' },
    { id: '4', goodsName: '运动健康专业监测智能手表 心率血氧长续航50米防水', price: '899.00', originalPrice: '1199.00', thumbnail: '/static/goods/goods_4.png' },
    { id: '5', goodsName: '意式半自动家用复古咖啡机 20Bar高压恒温萃取蒸汽奶泡', price: '899.00', originalPrice: '1280.00', thumbnail: '/static/goods/goods_6.png' },
    { id: '6', goodsName: '奢宠酵母焕活修护精华露 50ml 紧致淡纹抗皱滋养', price: '680.00', originalPrice: '890.00', thumbnail: '/static/goods/goods_5.png' }
  ];
}

const mockPool = [
  { id: '1', goodsName: '旗舰 5G 智能手机 12GB+256GB 超光影影像系统', price: '3999.00', thumbnail: '/static/goods/goods_1.png' },
  { id: '2', goodsName: '无线头戴式深度主动降噪蓝牙耳机 空间音频Hi-Res', price: '1099.00', thumbnail: '/static/goods/goods_2.png' },
  { id: '3', goodsName: '14英寸 全面屏轻薄商务笔记本电脑 酷睿i7 高刷防眩光', price: '5699.00', thumbnail: '/static/goods/goods_3.png' },
  { id: '4', goodsName: '运动健康专业监测智能手表 心率血氧长续航50米防水', price: '899.00', thumbnail: '/static/goods/goods_4.png' },
  { id: '5', goodsName: '意式半自动家用复古咖啡机 20Bar高压恒温萃取蒸汽奶泡', price: '899.00', thumbnail: '/static/goods/goods_6.png' },
  { id: '6', goodsName: '奢宠酵母焕活修护精华露 50ml 紧致淡纹抗皱滋养', price: '680.00', thumbnail: '/static/goods/goods_5.png' }
];

function handleAddPromo() {
  if (!Array.isArray(props.options.promos)) props.options.promos = [];
  props.options.promos.push({
    title: '热销特惠',
    desc: '全品类甄选底价',
    tag: '热卖',
    url: '/goods'
  });
}

function isSelected(id) {
  return props.options.goods?.some(g => String(g.id) === String(id));
}

function toggleSelect(item) {
  if (!Array.isArray(props.options.goods)) props.options.goods = [];
  const idx = props.options.goods.findIndex(g => String(g.id) === String(item.id));
  if (idx > -1) {
    props.options.goods.splice(idx, 1);
  } else {
    props.options.goods.push({ ...item });
  }
}
</script>

<style lang="scss" scoped>
.panel-channel-floor {
  padding: 8px 4px;

  .panel-section {
    margin-bottom: 18px;
    padding-bottom: 14px;
    border-bottom: 1px dashed #e2e8f0;

    .section-title {
      font-size: 13px;
      font-weight: 600;
      color: #0f172a;
      margin-bottom: 10px;

      &.flex-between {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
    }

    .form-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 8px;

      .item-label {
        font-size: 12px;
        color: #475569;
        margin-right: 8px;
        white-space: nowrap;
      }
    }
  }

  .promos-list-editor {
    display: flex;
    flex-direction: column;
    gap: 8px;

    .promo-editor-card {
      background: #f8fafc;
      padding: 8px;
      border-radius: 6px;
      border: 1px solid #e2e8f0;

      .promo-row-1 {
        display: flex;
        gap: 6px;
        margin-bottom: 6px;
      }
    }
  }

  .goods-list-preview {
    max-height: 200px;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 6px;
    margin-top: 8px;

    .goods-item-row {
      display: flex;
      align-items: center;
      gap: 8px;
      background: #f8fafc;
      padding: 6px 8px;
      border-radius: 6px;

      .g-thumb {
        width: 36px;
        height: 36px;
        border-radius: 4px;
        object-fit: cover;
      }

      .g-info {
        flex: 1;
        overflow: hidden;
        display: flex;
        flex-direction: column;

        .g-name {
          font-size: 12px;
          color: #1e293b;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .g-price {
          font-size: 11px;
          font-weight: 700;
          color: #e11d48;
        }
      }
    }
  }
}

.modal-goods-pool {
  max-height: 360px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 8px;

  .pool-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 8px 12px;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
      border-color: #4f46e5;
    }

    &.selected {
      background: #eef2ff;
      border-color: #4f46e5;
    }

    .pool-thumb {
      width: 44px;
      height: 44px;
      border-radius: 4px;
      object-fit: cover;
    }

    .pool-meta {
      flex: 1;
      .pool-name {
        font-size: 13px;
        color: #1e293b;
        margin-bottom: 4px;
      }
      .pool-price {
        font-size: 12px;
        color: #e11d48;
        font-weight: 700;
      }
    }

    .check-icon {
      color: #4f46e5;
      font-size: 18px;
      font-weight: 800;
    }
  }
}
</style>
