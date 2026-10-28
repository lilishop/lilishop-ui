<template>
  <div class="panel-recommend-feed">
    <!-- 1. 标题设置 -->
    <div class="panel-section">
      <div class="section-title">标题设置</div>
      <div class="form-item">
        <span class="item-label">主标题</span>
        <el-input v-model="options.title" size="small" placeholder="如：猜你喜欢" />
      </div>
      <div class="form-item">
        <span class="item-label">副标题</span>
        <el-input v-model="options.subtitle" size="small" placeholder="如：真实推荐商品流" />
      </div>
    </div>

    <!-- 2. 布局样式 -->
    <div class="panel-section">
      <div class="section-title">布局样式</div>
      <div class="form-item">
        <span class="item-label">展现形态</span>
        <el-radio-group v-model="options.layoutStyle" size="small">
          <el-radio-button label="featured">精选大卡+网格 (推荐)</el-radio-button>
          <el-radio-button label="grid">标准推荐网格</el-radio-button>
        </el-radio-group>
      </div>
      <div class="form-item">
        <span class="item-label">背景色</span>
        <el-color-picker v-model="options.backgroundColor" size="small" />
      </div>
    </div>

    <!-- 3. 加载与数量控制 -->
    <div class="panel-section">
      <div class="section-title">推荐流加载设置</div>
      <div class="form-item">
        <span class="item-label">首屏/每页数量</span>
        <el-input-number v-model="options.pageSize" :min="4" :max="20" size="small" controls-position="right" />
      </div>
      <div class="form-item">
        <span class="item-label">最多加载页数</span>
        <el-input-number v-model="options.maxPages" :min="1" :max="10" size="small" controls-position="right" />
      </div>
    </div>

    <!-- 4. 推荐商品池管理 -->
    <div class="panel-section">
      <div class="section-title flex-between">
        <span>推荐商品池 ({{ options.goods?.length || 0 }} 件)</span>
        <el-button type="primary" size="small" @click="showModal = true">
          选择真实商品
        </el-button>
      </div>

      <div class="goods-list-preview" v-if="options.goods?.length">
        <div v-for="(g, idx) in options.goods" :key="g.id || idx" class="goods-item-row">
          <span class="idx-tag">{{ idx === 0 ? '精选' : idx + 1 }}</span>
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
    <el-dialog v-model="showModal" title="选择推荐商品" width="600px" append-to-body>
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

if (!props.options.title) props.options.title = '猜你喜欢';
if (!props.options.subtitle) props.options.subtitle = '真实推荐商品流';
if (!props.options.layoutStyle) props.options.layoutStyle = 'featured';
if (!props.options.backgroundColor) props.options.backgroundColor = '#f8fafc';
if (!props.options.pageSize) props.options.pageSize = 8;
if (!props.options.maxPages) props.options.maxPages = 3;
if (!props.options.goods) {
  props.options.goods = [
    { id: '1', goodsName: '旗舰 5G 智能手机 12GB+256GB 超光影影像系统', price: '3999.00', originalPrice: '4599.00', thumbnail: '/static/goods/goods_1.png' },
    { id: '2', goodsName: '无线头戴式深度主动降噪蓝牙耳机 空间音频Hi-Res', price: '1099.00', originalPrice: '1499.00', thumbnail: '/static/goods/goods_2.png' },
    { id: '3', goodsName: '14英寸 全面屏轻薄商务笔记本电脑 酷睿i7 高刷防眩光', price: '5699.00', originalPrice: '6299.00', thumbnail: '/static/goods/goods_3.png' },
    { id: '4', goodsName: '运动健康专业监测智能手表 心率血氧长续航50米防水', price: '899.00', originalPrice: '1199.00', thumbnail: '/static/goods/goods_4.png' },
    { id: '5', goodsName: '奢宠酵母焕活修护精华露 50ml 紧致淡纹抗皱滋养', price: '680.00', originalPrice: '890.00', thumbnail: '/static/goods/goods_5.png' },
    { id: '6', goodsName: '意式半自动家用复古咖啡机 20Bar高压恒温萃取蒸汽奶泡', price: '899.00', originalPrice: '1280.00', thumbnail: '/static/goods/goods_6.png' },
    { id: '7', goodsName: '碳板专业竞速轻量缓震跑步鞋 透气防滑男女同款潮鞋', price: '459.00', originalPrice: '699.00', thumbnail: '/static/goods/goods_7.png' },
    { id: '8', goodsName: '极简静音无雾负离子香薰加湿器 大容量客厅卧室通用', price: '299.00', originalPrice: '399.00', thumbnail: '/static/goods/goods_8.png' }
  ];
}

const mockPool = [
  { id: '1', goodsName: '旗舰 5G 智能手机 12GB+256GB 超光影影像系统', price: '3999.00', thumbnail: '/static/goods/goods_1.png' },
  { id: '2', goodsName: '无线头戴式深度主动降噪蓝牙耳机 空间音频Hi-Res', price: '1099.00', thumbnail: '/static/goods/goods_2.png' },
  { id: '3', goodsName: '14英寸 全面屏轻薄商务笔记本电脑 酷睿i7 高刷防眩光', price: '5699.00', thumbnail: '/static/goods/goods_3.png' },
  { id: '4', goodsName: '运动健康专业监测智能手表 心率血氧长续航50米防水', price: '899.00', thumbnail: '/static/goods/goods_4.png' },
  { id: '5', goodsName: '奢宠酵母焕活修护精华露 50ml 紧致淡纹抗皱滋养', price: '680.00', thumbnail: '/static/goods/goods_5.png' },
  { id: '6', goodsName: '意式半自动家用复古咖啡机 20Bar高压恒温萃取蒸汽奶泡', price: '899.00', thumbnail: '/static/goods/goods_6.png' }
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
.panel-recommend-feed {
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

      .idx-tag {
        font-size: 10px;
        font-weight: 700;
        background: #fee2e2;
        color: #dc2626;
        padding: 2px 4px;
        border-radius: 3px;
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
      border-color: #ef4444;
    }

    &.selected {
      background: #fef2f2;
      border-color: #ef4444;
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
      color: #ef4444;
      font-size: 18px;
      font-weight: 800;
    }
  }
}
</style>
