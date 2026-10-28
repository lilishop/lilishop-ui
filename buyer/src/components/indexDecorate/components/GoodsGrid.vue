<template>
  <div class="decor-goods-grid" :style="customStyle">
    <!-- 宫格顶部标题区 -->
    <div class="grid-header" v-if="options.title">
      <div class="grid-title-wrap">
        <span class="grid-title-decor"></span>
        <h3 class="grid-main-title">{{ options.title }}</h3>
        <span class="grid-sub-title" v-if="options.subtitle">{{ options.subtitle }}</span>
      </div>
      <router-link :to="options.moreUrl || '/goods'" class="grid-more" v-if="options.showMoreLink !== false">
        {{ options.moreText || '查看全部' }} &gt;
      </router-link>
    </div>

    <!-- 紧凑严谨的商品九宫格/矩阵网格 (Bordered Matrix Grid) -->
    <div
      class="matrix-grid-container"
      :class="[`cols-${actualColumns}`, { 'with-grid-border': options.showBorder !== false }]"
      :style="{ gridTemplateColumns: `repeat(${actualColumns}, 1fr)` }"
    >
      <div
        v-for="(item, idx) in displayGoods"
        :key="item.id || idx"
        class="matrix-grid-cell"
      >
        <div class="cell-rank-tag" v-if="idx < 5">
          <span class="rank-num">TOP {{ idx + 1 }}</span>
        </div>

        <router-link :to="`/goods/${item.id || 1}`" class="cell-thumb-box">
          <img :src="item.thumbnail || defaultThumb" :alt="item.goodsName" class="cell-thumb" />
        </router-link>

        <div class="cell-body">
          <h4 class="cell-name">
            <router-link :to="`/goods/${item.id || 1}`">{{ item.goodsName }}</router-link>
          </h4>
          <div class="cell-meta">
            <span class="badge-label">热卖好物</span>
          </div>
          <div class="cell-bottom-row">
            <div class="price-box">
              <span class="sym">￥</span>
              <span class="val">{{ item.price }}</span>
              <span class="del" v-if="item.originalPrice">￥{{ item.originalPrice }}</span>
            </div>
            <span class="action-add-pill" title="立即选购" @click="addToCart(item)">+</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { ElMessage } from 'element-plus';

const props = defineProps({
  component: {
    type: Object,
    default: () => ({})
  },
  options: {
    type: Object,
    default: () => ({})
  },
  componentStyle: {
    type: Object,
    default: () => ({})
  }
});

const defaultThumb = '/static/goods/goods_1.png';

const actualColumns = computed(() => {
  const ratio = props.componentStyle?.widthRatio || '100%';
  const base = Number(props.options?.columns) || 5;
  if (ratio === '16.67%' || ratio === '16.6%') return 1;
  if (ratio === '33.33%' || ratio === '33.3%') return 2;
  if (ratio === '50%') return 3;
  if (ratio === '66.67%' || ratio === '66.6%') return 4;
  return base;
});

const defaultGridGoods = [
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

const displayGoods = computed(() => {
  if (Array.isArray(props.options?.goods) && props.options.goods.length > 0) {
    return props.options.goods;
  }
  const count = (actualColumns.value * 2) || 10;
  return defaultGridGoods.slice(0, count);
});

const customStyle = computed(() => {
  const s = props.componentStyle || {};
  return {
    backgroundColor: s.backgroundColor || '#ffffff',
    padding: Array.isArray(s.padding)
      ? `${s.padding[0]}px ${s.padding[1]}px ${s.padding[2]}px ${s.padding[3]}px`
      : '18px 20px',
    borderRadius: Array.isArray(s.radius)
      ? `${s.radius[0]}px ${s.radius[1]}px ${s.radius[2]}px ${s.radius[3]}px`
      : '12px'
  };
});

function addToCart(item) {
  ElMessage.success(`已将 "${item.goodsName?.slice(0, 10)}..." 加入购物车`);
}
</script>

<style lang="scss" scoped>
.decor-goods-grid {
  width: 100%;
  box-sizing: border-box;

  .grid-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-bottom: 14px;
    margin-bottom: 14px;
    border-bottom: 1px solid #f1f5f9;

    .grid-title-wrap {
      display: flex;
      align-items: center;
      gap: 10px;

      .grid-title-decor {
        width: 4px;
        height: 18px;
        background: #f97316;
        border-radius: 2px;
      }

      .grid-main-title {
        font-size: 19px;
        font-weight: 700;
        color: #0f172a;
        margin: 0;
      }

      .grid-sub-title {
        font-size: 12px;
        color: #64748b;
        margin-left: 4px;
      }
    }

    .grid-more {
      font-size: 13px;
      color: #64748b;
      text-decoration: none;
      transition: color 0.2s;

      &:hover {
        color: #f97316;
      }
    }
  }

  .matrix-grid-container {
    display: grid;
    background: #ffffff;
    box-sizing: border-box;

    &.with-grid-border {
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      overflow: hidden;

      .matrix-grid-cell {
        border-right: 1px solid #f1f5f9;
        border-bottom: 1px solid #f1f5f9;
      }
    }

    .matrix-grid-cell {
      position: relative;
      padding: 16px 14px 14px 14px;
      display: flex;
      flex-direction: column;
      box-sizing: border-box;
      background: #ffffff;
      transition: all 0.2s ease;

      &:hover {
        background: #fafbfc;
        z-index: 1;
        box-shadow: 0 4px 14px rgba(0, 0, 0, 0.05);

        .cell-thumb {
          transform: scale(1.06);
        }

        .action-add-pill {
          background: #f97316;
          color: #ffffff;
        }
      }

      .cell-rank-tag {
        position: absolute;
        top: 10px;
        left: 10px;
        z-index: 2;

        .rank-num {
          display: inline-block;
          font-size: 10px;
          font-weight: 800;
          color: #f97316;
          background: #fff7ed;
          border: 1px solid #fed7aa;
          padding: 1px 6px;
          border-radius: 4px;
        }
      }

      .cell-thumb-box {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        aspect-ratio: 1 / 1;
        overflow: hidden;
        margin-bottom: 12px;
        text-decoration: none;

        .cell-thumb {
          width: 85%;
          height: 85%;
          object-fit: contain;
          transition: transform 0.3s ease;
        }
      }

      .cell-body {
        display: flex;
        flex-direction: column;
        flex: 1;

        .cell-name {
          font-size: 13px;
          font-weight: 500;
          line-height: 1.4;
          height: 36px;
          overflow: hidden;
          text-overflow: ellipsis;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          margin: 0 0 6px 0;

          a {
            color: #334155;
            text-decoration: none;
            &:hover {
              color: #f97316;
            }
          }
        }

        .cell-meta {
          display: flex;
          margin-bottom: 8px;

          .badge-label {
            font-size: 10px;
            color: #d97706;
            background: #fef3c7;
            padding: 1px 6px;
            border-radius: 3px;
          }
        }

        .cell-bottom-row {
          margin-top: auto;
          display: flex;
          align-items: baseline;
          justify-content: space-between;

          .price-box {
            display: flex;
            align-items: baseline;
            gap: 1px;

            .sym {
              font-size: 12px;
              font-weight: 700;
              color: #dc2626;
            }

            .val {
              font-size: 18px;
              font-weight: 800;
              color: #dc2626;
            }

            .del {
              font-size: 11px;
              color: #94a3b8;
              text-decoration: line-through;
              margin-left: 4px;
            }
          }

          .action-add-pill {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 22px;
            height: 22px;
            border-radius: 50%;
            background: #f1f5f9;
            color: #64748b;
            font-size: 15px;
            font-weight: 600;
            line-height: 1;
            transition: all 0.2s;
            cursor: pointer;
          }
        }
      }
    }
  }
}
</style>
