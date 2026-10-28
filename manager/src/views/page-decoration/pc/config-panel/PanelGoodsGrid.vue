<template>
  <div class="panel-goods-grid">
    <!-- 1. 标题与更多设置 -->
    <div class="panel-section">
      <div class="section-title">宫格标题设置</div>
      <div class="form-item">
        <span class="item-label">主标题</span>
        <el-input v-model="options.title" size="small" placeholder="如：爆款热卖榜" />
      </div>
      <div class="form-item">
        <span class="item-label">副标题</span>
        <el-input v-model="options.subtitle" size="small" placeholder="如：近30天爆卖好物精选" />
      </div>
      <div class="form-item">
        <span class="item-label">展示查看更多</span>
        <el-switch v-model="options.showMoreLink" size="small" />
      </div>
      <div class="form-item" v-if="options.showMoreLink !== false">
        <span class="item-label">更多文案</span>
        <el-input v-model="options.moreText" size="small" placeholder="如：查看全部" />
      </div>
    </div>

    <!-- 2. 宫格排版设置 (网格与列数) -->
    <div class="panel-section">
      <div class="section-title">宫格排版与线条</div>
      <div class="form-item">
        <span class="item-label">一行展示几个 (列数)</span>
        <el-radio-group v-model="options.columns" size="small">
          <el-radio-button :label="4">4 列</el-radio-button>
          <el-radio-button :label="5">5 列 (推荐)</el-radio-button>
          <el-radio-button :label="6">6 列</el-radio-button>
        </el-radio-group>
      </div>
      <div class="form-item">
        <span class="item-label">矩阵实线网格分割线</span>
        <el-switch v-model="options.showBorder" size="small" />
      </div>
    </div>

    <!-- 3. 商品列表与管理 -->
    <div class="panel-section">
      <div class="section-title flex-between">
        <span>宫格商品数据 ({{ options.goods?.length || 0 }} 件)</span>
        <el-button type="primary" size="small" @click="showModal = true">
          选择真实商品
        </el-button>
      </div>

      <div class="goods-grid-preview" v-if="options.goods?.length">
        <div v-for="(g, idx) in options.goods" :key="g.id || idx" class="grid-item-row">
          <span class="idx-badge">{{ idx + 1 }}</span>
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
    <el-dialog v-model="showModal" title="选择宫格商品" width="600px" append-to-body>
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
        <el-button @click="showModal = false">完成</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { Delete, Check } from '@element-plus/icons-vue';

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
const showModal = ref(false);

if (!props.options.title) props.options.title = '爆款热卖榜';
if (!props.options.subtitle) props.options.subtitle = '近30天爆卖好物精选';
if (props.options.showMoreLink === undefined) props.options.showMoreLink = true;
if (!props.options.moreText) props.options.moreText = '查看全部';
if (!props.options.columns) props.options.columns = 5;
if (props.options.showBorder === undefined) props.options.showBorder = true;
if (!props.options.goods) {
  props.options.goods = [
    { id: '1', goodsName: '旗舰 5G 智能手机 12GB+256GB 超光影影像系统', price: '3999.00', originalPrice: '4599.00', thumbnail: '/static/goods/goods_1.png' },
    { id: '2', goodsName: '无线头戴式深度主动降噪蓝牙耳机 空间音频Hi-Res', price: '1099.00', originalPrice: '1499.00', thumbnail: '/static/goods/goods_2.png' },
    { id: '3', goodsName: '14英寸 全面屏轻薄商务笔记本电脑 酷睿i7 高刷防眩光', price: '5699.00', originalPrice: '6299.00', thumbnail: '/static/goods/goods_3.png' },
    { id: '4', goodsName: '运动健康专业监测智能手表 心率血氧长续航50米防水', price: '899.00', originalPrice: '1199.00', thumbnail: '/static/goods/goods_4.png' },
    { id: '5', goodsName: '奢宠酵母焕活修护精华露 50ml 紧致淡纹抗皱滋养', price: '680.00', originalPrice: '890.00', thumbnail: '/static/goods/goods_5.png' },
    { id: '6', goodsName: '意式半自动家用复古咖啡机 20Bar高压恒温萃取蒸汽奶泡', price: '899.00', originalPrice: '1280.00', thumbnail: '/static/goods/goods_6.png' },
    { id: '7', goodsName: '碳板专业竞速轻量缓震跑步鞋 透气防滑男女同款潮鞋', price: '459.00', originalPrice: '699.00', thumbnail: '/static/goods/goods_7.png' },
    { id: '8', goodsName: '极简静音无雾负离子香薰加湿器 大容量客厅卧室通用', price: '299.00', originalPrice: '399.00', thumbnail: '/static/goods/goods_8.png' },
    { id: '9', goodsName: '智能降噪AI翻译蓝牙墨镜 超轻防紫外线偏光太阳镜', price: '599.00', originalPrice: '799.00', thumbnail: '/static/goods/goods_1.png' },
    { id: '10', goodsName: '15.6英寸 4K超高清便携式显示器 Type-C一线直连高色域', price: '1299.00', originalPrice: '1699.00', thumbnail: '/static/goods/goods_3.png' }
  ];
}

const mockPool = [
  { id: '1', goodsName: '旗舰 5G 智能手机 12GB+256GB 超光影影像系统', price: '3999.00', thumbnail: '/static/goods/goods_1.png' },
  { id: '2', goodsName: '无线头戴式深度主动降噪蓝牙耳机 空间音频Hi-Res', price: '1099.00', thumbnail: '/static/goods/goods_2.png' },
  { id: '3', goodsName: '14英寸 全面屏轻薄商务笔记本电脑 酷睿i7 高刷防眩光', price: '5699.00', thumbnail: '/static/goods/goods_3.png' },
  { id: '4', goodsName: '运动健康专业监测智能手表 心率血氧长续航50米防水', price: '899.00', thumbnail: '/static/goods/goods_4.png' },
  { id: '5', goodsName: '奢宠酵母焕活修护精华露 50ml 紧致淡纹抗皱滋养', price: '680.00', thumbnail: '/static/goods/goods_5.png' },
  { id: '6', goodsName: '意式半自动家用复古咖啡机 20Bar高压恒温萃取蒸汽奶泡', price: '899.00', thumbnail: '/static/goods/goods_6.png' },
  { id: '7', goodsName: '碳板专业竞速轻量缓震跑步鞋 透气防滑男女同款潮鞋', price: '459.00', thumbnail: '/static/goods/goods_7.png' },
  { id: '8', goodsName: '极简静音无雾负离子香薰加湿器 大容量客厅卧室通用', price: '299.00', thumbnail: '/static/goods/goods_8.png' }
];

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
.panel-goods-grid {
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

  .goods-grid-preview {
    max-height: 240px;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 6px;
    margin-top: 8px;

    .grid-item-row {
      display: flex;
      align-items: center;
      gap: 8px;
      background: #f8fafc;
      padding: 6px 8px;
      border-radius: 6px;

      .idx-badge {
        font-size: 11px;
        font-weight: 700;
        color: #94a3b8;
        width: 16px;
        text-align: center;
      }

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
      border-color: #f97316;
    }

    &.selected {
      background: #fff7ed;
      border-color: #f97316;
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
      color: #f97316;
      font-size: 18px;
      font-weight: 800;
    }
  }
}
</style>
