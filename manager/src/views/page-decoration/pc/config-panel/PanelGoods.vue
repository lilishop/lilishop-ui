<template>
  <div class="panel-goods-commerce">
    <!-- 1. 楼层标题设置 (部分包含标题的商品楼层可用) -->
    <div class="panel-section" v-if="hasTitleConfig">
      <div class="section-title">楼层主副标题</div>
      <div class="form-item">
        <span class="item-label">主标题</span>
        <el-input v-model="options.title" size="small" placeholder="如：热门推荐" />
      </div>
      <div class="form-item">
        <span class="item-label">副标题</span>
        <el-input v-model="options.subtitle" size="small" placeholder="如：全网热销爆款" />
      </div>
      <div class="form-item">
        <span class="item-label">查看更多链接</span>
        <el-input v-model="options.moreUrl" size="small" placeholder="如：/goods" />
      </div>
    </div>

    <!-- 2. 横幅楼层专属横幅海报 (bannerFloor) -->
    <div class="panel-section" v-if="component.type === 'bannerFloor'">
      <div class="section-title">左侧专属大促海报</div>
      <div class="form-item">
        <span class="item-label">海报图片 URL</span>
        <el-input v-model="options.bannerImg" size="small" placeholder="海报图地址" clearable />
      </div>
      <div class="form-item">
        <span class="item-label">海报跳转地址</span>
        <el-input v-model="options.bannerUrl" size="small" placeholder="跳转路径" />
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
          <el-input v-model="tab.title" size="small" placeholder="Tab 名称" style="width: 110px" />
          <el-input v-model="tab.categoryId" size="small" placeholder="绑定的分类 ID" style="flex: 1" />
          <el-button link type="danger" size="small" @click="options.tabs.splice(tIdx, 1)">
            <el-icon><Delete /></el-icon>
          </el-button>
        </div>
      </div>
    </div>

    <!-- 4. 排版与列数设置 -->
    <div class="panel-section" v-if="options.columns !== undefined">
      <div class="section-title">排版与列数</div>
      <div class="form-item">
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
      <div class="form-item">
        <span class="item-label">数据源模式</span>
        <el-radio-group v-model="options.dataSource" size="small">
          <el-radio-button label="manual">手动选品</el-radio-button>
          <el-radio-button label="category">分类自动拉取</el-radio-button>
        </el-radio-group>
      </div>

      <div class="form-item" v-if="options.dataSource === 'category'">
        <span class="item-label">拉取商品数量</span>
        <el-input-number v-model="options.goodsCount" :min="2" :max="20" size="small" controls-position="right" />
      </div>

      <!-- 手动选品区 -->
      <div class="manual-pick-wrap" v-if="options.dataSource === 'manual'">
        <div class="pick-header">
          <span class="pick-info">已选商品 ({{ options.goods?.length || 0 }} 件)</span>
          <el-button type="primary" size="small" @click="showGoodsModal = true">
            选择商品
          </el-button>
        </div>

        <!-- 已选商品列表滚动区 -->
        <div class="selected-goods-list" v-if="options.goods?.length">
          <div
            v-for="(g, gIdx) in options.goods"
            :key="g.id || gIdx"
            class="selected-item"
          >
            <img :src="g.thumbnail || defaultThumb" alt="" class="item-thumb" />
            <div class="item-info">
              <span class="item-name">{{ g.goodsName }}</span>
              <span class="item-price">￥{{ g.price }}</span>
            </div>
            <el-button link type="danger" size="small" @click="removeSelectedGoods(gIdx)">
              <el-icon><Delete /></el-icon>
            </el-button>
          </div>
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

    <!-- 商品库选择弹窗 -->
    <el-dialog
      v-model="showGoodsModal"
      title="从商品库选择商品"
      width="900px"
      append-to-body
      destroy-on-close
    >
      <goods-dialog
        :selectedWay="options.goods || []"
        @selected="handleGoodsSelected"
      />
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { Plus, Delete } from '@element-plus/icons-vue';
import GoodsDialog from '@/components/lili-dialog/goods-dialog.vue';

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

const defaultThumb = '/static/goods/goods_1.png';
const showGoodsModal = ref(false);

if (props.component?.type === 'goodsList' && (props.options.columns === undefined || props.options.columns === 4)) {
  props.options.columns = 6;
}

const hasTitleConfig = computed(() => {
  return ['gridFloor', 'bannerFloor', 'goodsBar', 'channelFloor', 'recommendFeed'].includes(props.component.type);
});

function handleAddTab() {
  if (!Array.isArray(props.options.tabs)) props.options.tabs = [];
  props.options.tabs.push({ title: '新频道专区', categoryId: '', goods: [] });
}

function handleGoodsSelected(selectedGoods) {
  if (Array.isArray(selectedGoods)) {
    props.options.goods = selectedGoods.map(g => ({
      id: g.id,
      goodsName: g.goodsName,
      price: g.price,
      originalPrice: g.originalPrice,
      thumbnail: g.thumbnail
    }));
  }
  showGoodsModal.value = false;
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

      .item-label {
        font-size: 12px;
        color: #475569;
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
      }

      .selected-goods-list {
        display: flex;
        flex-direction: column;
        gap: 6px;
        max-height: 240px;
        overflow-y: auto;

        .selected-item {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 6px 8px;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 4px;

          .item-thumb {
            width: 36px;
            height: 36px;
            object-fit: cover;
            border-radius: 2px;
          }

          .item-info {
            flex: 1;
            min-width: 0;
            display: flex;
            flex-direction: column;

            .item-name {
              font-size: 12px;
              color: #1e293b;
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
            }

            .item-price {
              font-size: 12px;
              color: #e11d48;
              font-weight: 600;
            }
          }
        }
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
}
</style>
