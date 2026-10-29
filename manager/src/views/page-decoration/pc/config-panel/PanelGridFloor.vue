<template>
  <div class="panel-grid-floor">
    <!-- 1. 楼层标题设置 (Floor Header) -->
    <div class="panel-section">
      <div class="section-title">楼层大标题设置</div>
      <div class="form-item">
        <span class="item-label">展示楼层标题</span>
        <el-switch v-model="options.showFloorTitle" size="small" />
      </div>
      <div class="form-row-2">
        <div class="form-item">
          <span class="item-label">楼层编号</span>
          <el-input v-model="options.floorNum" size="small" placeholder="如：1F" style="width: 90px;" />
        </div>
        <div class="form-item flex-1">
          <span class="item-label">楼层名称</span>
          <el-input v-model="options.title" size="small" placeholder="如：潮流数码" />
        </div>
      </div>
      <div class="form-item">
        <span class="item-label">英文/副标题</span>
        <el-input v-model="options.subtitle" size="small" placeholder="如：DIGITAL & TECH" />
      </div>
    </div>

    <!-- 2. 右侧子分类快捷标签 -->
    <div class="panel-section">
      <div class="section-title flex-between">
        <span>右侧分类标签</span>
        <el-button link type="primary" size="small" @click="handleAddTag">
          <el-icon><Plus /></el-icon> 添加标签
        </el-button>
      </div>
      <div class="tags-editor-wrap">
        <div v-for="(tag, tIdx) in options.subCategories" :key="tIdx" class="tag-edit-row">
          <el-input v-model="options.subCategories[tIdx]" size="small" placeholder="分类名称" />
          <el-button link type="danger" size="small" @click="options.subCategories.splice(tIdx, 1)">
            <el-icon><Delete /></el-icon>
          </el-button>
        </div>
      </div>
    </div>

    <!-- 3. 左侧专属营销竖版海报 -->
    <div class="panel-section">
      <div class="section-title">左侧专属大促海报</div>
      <div class="form-item">
        <span class="item-label">展示左侧海报</span>
        <el-switch v-model="options.showPoster" size="small" />
      </div>
      <template v-if="options.showPoster !== false">
        <div class="form-item">
          <span class="item-label">海报图片 URL</span>
          <el-input v-model="options.posterImg" size="small" placeholder="图片链接" clearable />
        </div>
        <div class="form-item">
          <span class="item-label">海报主标题</span>
          <el-input v-model="options.posterTitle" size="small" placeholder="如：数码潮电 酷玩季" />
        </div>
        <div class="form-item">
          <span class="item-label">海报副标题</span>
          <el-input v-model="options.posterSub" size="small" placeholder="如：领券最高立减 600 元" />
        </div>
        <div class="form-item">
          <span class="item-label">跳转链接</span>
          <el-input v-model="options.posterUrl" size="small" placeholder="如：/goods" />
        </div>
      </template>
    </div>

    <!-- 4. 右侧商品列数与排版 -->
    <div class="panel-section">
      <div class="section-title">右侧商品排版</div>
      <div class="form-item">
        <span class="item-label">单行展示列数</span>
        <el-radio-group v-model="options.columns" size="small">
          <el-radio-button :label="3">3 列</el-radio-button>
          <el-radio-button :label="4">4 列 (推荐)</el-radio-button>
          <el-radio-button :label="5">5 列</el-radio-button>
        </el-radio-group>
      </div>
    </div>

    <!-- 5. 楼层商品选择 -->
    <div class="panel-section">
      <div class="section-title flex-between">
        <span>楼层商品数据 ({{ options.goods?.length || 0 }} 件)</span>
        <el-button type="primary" size="small" @click="showGoodsModal = true">
          选择真实商品
        </el-button>
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
    <el-dialog v-model="showGoodsModal" title="选择楼层商品" width="600px" append-to-body>
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

const defaultThumb = 'https://lilishop-pc.oss-cn-beijing.aliyuncs.com/static/goods/goods_1.png';
const showGoodsModal = ref(false);

// 初始化缺省 options
if (props.options.showFloorTitle === undefined) props.options.showFloorTitle = true;
if (!props.options.floorNum) props.options.floorNum = '1F';
if (!props.options.title) props.options.title = '潮流数码';
if (!props.options.subtitle) props.options.subtitle = 'DIGITAL & TECH';
if (!props.options.subCategories) {
  props.options.subCategories = ['旗舰手机', '轻薄笔电', '降噪耳机', '智能穿戴', '数码配件'];
}
if (!props.options.posterImg) {
  props.options.posterImg = 'https://lilishop-pc.oss-cn-beijing.aliyuncs.com/static/banner-floor/floor_banner_1.png';
}
if (!props.options.posterTitle) props.options.posterTitle = '数码潮电 酷玩季';
if (!props.options.posterSub) props.options.posterSub = '领券最高立减 600 元';
if (!props.options.columns) props.options.columns = 4;
if (!props.options.goods) {
  props.options.goods = [
    { id: '101', goodsName: '旗舰 5G 智能手机 12GB+256GB 超光影影像系统', price: '3999.00', originalPrice: '4599.00', thumbnail: 'https://lilishop-pc.oss-cn-beijing.aliyuncs.com/static/goods/goods_1.png' },
    { id: '102', goodsName: '无线头戴式深度主动降噪蓝牙耳机 空间音频Hi-Res', price: '1099.00', originalPrice: '1499.00', thumbnail: 'https://lilishop-pc.oss-cn-beijing.aliyuncs.com/static/goods/goods_2.png' },
    { id: '103', goodsName: '14英寸 全面屏轻薄商务笔记本电脑 酷睿i7 高刷防眩光', price: '5699.00', originalPrice: '6299.00', thumbnail: 'https://lilishop-pc.oss-cn-beijing.aliyuncs.com/static/goods/goods_3.png' },
    { id: '104', goodsName: '运动健康专业监测智能手表 心率血氧长续航50米防水', price: '899.00', originalPrice: '1199.00', thumbnail: 'https://lilishop-pc.oss-cn-beijing.aliyuncs.com/static/goods/goods_4.png' },
    { id: '105', goodsName: '奢宠酵母焕活修护精华露 50ml 紧致淡纹抗皱滋养', price: '680.00', originalPrice: '890.00', thumbnail: 'https://lilishop-pc.oss-cn-beijing.aliyuncs.com/static/goods/goods_5.png' },
    { id: '106', goodsName: '意式半自动家用复古咖啡机 20Bar高压恒温萃取蒸汽奶泡', price: '899.00', originalPrice: '1280.00', thumbnail: 'https://lilishop-pc.oss-cn-beijing.aliyuncs.com/static/goods/goods_6.png' },
    { id: '107', goodsName: '碳板专业竞速轻量缓震跑步鞋 透气防滑男女同款潮鞋', price: '459.00', originalPrice: '699.00', thumbnail: 'https://lilishop-pc.oss-cn-beijing.aliyuncs.com/static/goods/goods_7.png' },
    { id: '108', goodsName: '极简静音无雾负离子香薰加湿器 大容量客厅卧室通用', price: '299.00', originalPrice: '399.00', thumbnail: 'https://lilishop-pc.oss-cn-beijing.aliyuncs.com/static/goods/goods_8.png' }
  ];
}

const mockPool = [
  { id: '101', goodsName: '旗舰 5G 智能手机 12GB+256GB 超光影影像系统', price: '3999.00', thumbnail: 'https://lilishop-pc.oss-cn-beijing.aliyuncs.com/static/goods/goods_1.png' },
  { id: '102', goodsName: '无线头戴式深度主动降噪蓝牙耳机 空间音频Hi-Res', price: '1099.00', thumbnail: 'https://lilishop-pc.oss-cn-beijing.aliyuncs.com/static/goods/goods_2.png' },
  { id: '103', goodsName: '14英寸 全面屏轻薄商务笔记本电脑 酷睿i7 高刷防眩光', price: '5699.00', thumbnail: 'https://lilishop-pc.oss-cn-beijing.aliyuncs.com/static/goods/goods_3.png' },
  { id: '104', goodsName: '运动健康专业监测智能手表 心率血氧长续航50米防水', price: '899.00', thumbnail: 'https://lilishop-pc.oss-cn-beijing.aliyuncs.com/static/goods/goods_4.png' },
  { id: '105', goodsName: '奢宠酵母焕活修护精华露 50ml 紧致淡纹抗皱滋养', price: '680.00', thumbnail: 'https://lilishop-pc.oss-cn-beijing.aliyuncs.com/static/goods/goods_5.png' },
  { id: '106', goodsName: '意式半自动家用复古咖啡机 20Bar高压恒温萃取蒸汽奶泡', price: '899.00', thumbnail: 'https://lilishop-pc.oss-cn-beijing.aliyuncs.com/static/goods/goods_6.png' },
  { id: '107', goodsName: '碳板专业竞速轻量缓震跑步鞋 透气防滑男女同款潮鞋', price: '459.00', thumbnail: 'https://lilishop-pc.oss-cn-beijing.aliyuncs.com/static/goods/goods_7.png' },
  { id: '108', goodsName: '极简静音无雾负离子香薰加湿器 大容量客厅卧室通用', price: '299.00', thumbnail: 'https://lilishop-pc.oss-cn-beijing.aliyuncs.com/static/goods/goods_8.png' }
];

function handleAddTag() {
  if (!Array.isArray(props.options.subCategories)) {
    props.options.subCategories = [];
  }
  props.options.subCategories.push('新分类');
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
.panel-grid-floor {
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

    .form-row-2 {
      display: flex;
      gap: 10px;
      margin-bottom: 8px;

      .flex-1 {
        flex: 1;
      }
    }
  }

  .tags-editor-wrap {
    display: flex;
    flex-direction: column;
    gap: 6px;

    .tag-edit-row {
      display: flex;
      align-items: center;
      gap: 8px;
    }
  }

  .goods-list-preview {
    max-height: 240px;
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
      border-color: #3b82f6;
    }

    &.selected {
      background: #eff6ff;
      border-color: #3b82f6;
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
      color: #3b82f6;
      font-size: 18px;
      font-weight: 800;
    }
  }
}
</style>
