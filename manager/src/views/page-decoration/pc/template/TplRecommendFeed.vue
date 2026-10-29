<template>
  <div class="tpl-recommend-feed" :style="customStyle">
    <!-- 1. 推荐流居中标题栏 -->
    <div class="recommend-feed-header">
      <div class="header-decor-line left"></div>
      <div class="header-center-title">
        <svg class="heart-icon" viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
        </svg>
        <h3 class="main-title">{{ options.title || '猜你喜欢' }}</h3>
        <span class="sub-title" v-if="options.subtitle">{{ options.subtitle }}</span>
      </div>
      <div class="header-decor-line right"></div>
    </div>

    <!-- 2. 推荐流布局：精选大卡+网格 (featured) 或 标准网格 (grid) -->
    <!-- A. 精选大卡+网格 (featured 布局) -->
    <div
      v-if="(options.layoutStyle || 'featured') === 'featured'"
      class="recommend-featured-layout"
    >
      <!-- 左侧精选特大卡片 (Featured Hero Card) -->
      <div class="featured-big-card" v-if="featuredGoods">
        <div class="big-card-badge">为你特别甄选</div>
        <div class="big-card-thumb">
          <img :src="featuredGoods.thumbnail || defaultThumb" :alt="featuredGoods.goodsName" />
        </div>
        <div class="big-card-info">
          <div class="big-title">{{ featuredGoods.goodsName }}</div>
          <div class="big-reason">99.8% 高好评 · 猜你对这款高人气科技数码感兴趣</div>
          <div class="big-price-row">
            <div class="big-price">
              <span class="sym">￥</span>
              <span class="val">{{ featuredGoods.price }}</span>
              <span class="del" v-if="featuredGoods.originalPrice">￥{{ featuredGoods.originalPrice }}</span>
            </div>
            <button type="button" class="big-buy-btn">立即入手 &gt;</button>
          </div>
        </div>
      </div>

      <!-- 右侧与后续标准卡片网格 -->
      <div class="featured-sub-grid">
        <div
          v-for="(item, idx) in regularGoods"
          :key="item.id || idx"
          class="recommend-card"
        >
          <div class="card-thumb">
            <img :src="item.thumbnail || defaultThumb" :alt="item.goodsName" />
            <span class="rec-tag">推荐</span>
          </div>
          <div class="card-body">
            <div class="goods-title">{{ item.goodsName }}</div>
            <div class="recommend-meta">
              <span class="reason-tag">同品类热度榜</span>
            </div>
            <div class="price-row">
              <div class="price-box">
                <span class="sym">￥</span>
                <span class="val">{{ item.price }}</span>
              </div>
              <button type="button" class="cart-pill-btn">+</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- B. 标准网格流 (grid 布局) -->
    <div
      v-else
      class="recommend-standard-grid"
      :class="`cols-${actualCols}`"
      :style="{ gridTemplateColumns: `repeat(${actualCols}, 1fr)` }"
    >
      <div
        v-for="(item, idx) in displayGoods"
        :key="item.id || idx"
        class="recommend-card"
      >
        <div class="card-thumb">
          <img :src="item.thumbnail || defaultThumb" :alt="item.goodsName" />
          <span class="rec-tag">为你推荐</span>
        </div>
        <div class="card-body">
          <div class="goods-title">{{ item.goodsName }}</div>
          <div class="recommend-meta">
            <span class="sales-num">已售 {{ 200 + idx * 70 }}+</span>
            <span class="rate-num">98%好评</span>
          </div>
          <div class="price-row">
            <div class="price-box">
              <span class="sym">￥</span>
              <span class="val">{{ item.price }}</span>
            </div>
            <button type="button" class="cart-pill-btn">+</button>
          </div>
        </div>
      </div>
    </div>

    <!-- 底部换一批 / 探索更多推荐 -->
    <div class="recommend-footer-action">
      <button type="button" class="refresh-rec-btn">
        <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
          <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>
        </svg>
        <span>换一批推荐好物</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

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

const defaultThumb = 'https://lilishop-pc.oss-cn-beijing.aliyuncs.com/static/goods/goods_1.png';

const defaultPool = [
  { id: '1', goodsName: '旗舰 5G 智能手机 12GB+256GB 超光影影像系统', price: '3999.00', originalPrice: '4599.00', thumbnail: 'https://lilishop-pc.oss-cn-beijing.aliyuncs.com/static/goods/goods_1.png' },
  { id: '2', goodsName: '无线头戴式深度主动降噪蓝牙耳机 空间音频Hi-Res', price: '1099.00', originalPrice: '1499.00', thumbnail: 'https://lilishop-pc.oss-cn-beijing.aliyuncs.com/static/goods/goods_2.png' },
  { id: '3', goodsName: '14英寸 全面屏轻薄商务笔记本电脑 酷睿i7 高刷防眩光', price: '5699.00', originalPrice: '6299.00', thumbnail: 'https://lilishop-pc.oss-cn-beijing.aliyuncs.com/static/goods/goods_3.png' },
  { id: '4', goodsName: '运动健康专业监测智能手表 心率血氧长续航50米防水', price: '899.00', originalPrice: '1199.00', thumbnail: 'https://lilishop-pc.oss-cn-beijing.aliyuncs.com/static/goods/goods_4.png' },
  { id: '5', goodsName: '奢宠酵母焕活修护精华露 50ml 紧致淡纹抗皱滋养', price: '680.00', originalPrice: '890.00', thumbnail: 'https://lilishop-pc.oss-cn-beijing.aliyuncs.com/static/goods/goods_5.png' },
  { id: '6', goodsName: '意式半自动家用复古咖啡机 20Bar高压恒温萃取蒸汽奶泡', price: '899.00', originalPrice: '1280.00', thumbnail: 'https://lilishop-pc.oss-cn-beijing.aliyuncs.com/static/goods/goods_6.png' },
  { id: '7', goodsName: '碳板专业竞速轻量缓震跑步鞋 透气防滑男女同款潮鞋', price: '459.00', originalPrice: '699.00', thumbnail: 'https://lilishop-pc.oss-cn-beijing.aliyuncs.com/static/goods/goods_7.png' },
  { id: '8', goodsName: '极简静音无雾负离子香薰加湿器 大容量客厅卧室通用', price: '299.00', originalPrice: '399.00', thumbnail: 'https://lilishop-pc.oss-cn-beijing.aliyuncs.com/static/goods/goods_8.png' },
  { id: '9', goodsName: '智能降噪AI翻译蓝牙墨镜 超轻防紫外线偏光太阳镜', price: '599.00', originalPrice: '799.00', thumbnail: 'https://lilishop-pc.oss-cn-beijing.aliyuncs.com/static/goods/goods_1.png' }
];

const displayGoods = computed(() => {
  if (Array.isArray(props.options?.goods) && props.options.goods.length > 0) {
    return props.options.goods;
  }
  const count = props.options?.pageSize || 8;
  return defaultPool.slice(0, count);
});

const featuredGoods = computed(() => {
  return displayGoods.value[0] || defaultPool[0];
});

const regularGoods = computed(() => {
  return displayGoods.value.slice(1, 7);
});

const actualCols = computed(() => {
  const ratio = props.componentStyle?.widthRatio || '100%';
  if (ratio === '16.67%' || ratio === '16.6%') return 1;
  if (ratio === '33.33%' || ratio === '33.3%') return 2;
  if (ratio === '50%') return 3;
  if (ratio === '66.67%' || ratio === '66.6%') return 4;
  return 5;
});

const customStyle = computed(() => {
  const s = props.componentStyle || {};
  const bg = props.options?.backgroundColor || s.backgroundColor || '#f8fafc';
  return {
    backgroundColor: bg,
    padding: Array.isArray(s.padding)
      ? `${s.padding[0]}px ${s.padding[1]}px ${s.padding[2]}px ${s.padding[3]}px`
      : '24px 20px',
    borderRadius: Array.isArray(s.radius)
      ? `${s.radius[0]}px ${s.radius[1]}px ${s.radius[2]}px ${s.radius[3]}px`
      : '12px'
  };
});
</script>

<style lang="scss" scoped>
.tpl-recommend-feed {
  width: 100%;
  box-sizing: border-box;
  user-select: none;

  .recommend-feed-header {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 20px;
    gap: 16px;

    .header-decor-line {
      flex: 1;
      max-width: 120px;
      height: 1px;
      background: linear-gradient(90deg, transparent, #cbd5e1);

      &.right {
        background: linear-gradient(90deg, #cbd5e1, transparent);
      }
    }

    .header-center-title {
      display: flex;
      align-items: center;
      gap: 8px;

      .heart-icon {
        color: #ef4444;
      }

      .main-title {
        font-size: 22px;
        font-weight: 800;
        color: #0f172a;
        margin: 0;
      }

      .sub-title {
        font-size: 13px;
        color: #64748b;
        margin-left: 6px;
      }
    }
  }

  /* 精选大卡 + 网格复合布局 */
  .recommend-featured-layout {
    display: flex;
    gap: 14px;
    align-items: stretch;

    .featured-big-card {
      width: 320px;
      flex-shrink: 0;
      background: #ffffff;
      border-radius: 10px;
      padding: 16px;
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      box-shadow: 0 4px 14px rgba(0, 0, 0, 0.05);
      border: 1px solid #f1f5f9;
      position: relative;
      transition: all 0.3s ease;

      &:hover {
        transform: translateY(-3px);
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
      }

      .big-card-badge {
        position: absolute;
        top: 12px;
        left: 12px;
        background: linear-gradient(135deg, #ef4444, #f97316);
        color: #ffffff;
        font-size: 10px;
        font-weight: 700;
        padding: 3px 8px;
        border-radius: 4px;
        z-index: 2;
      }

      .big-card-thumb {
        width: 100%;
        aspect-ratio: 1 / 1;
        overflow: hidden;
        border-radius: 6px;
        margin-bottom: 12px;
        background: #f8fafc;
        display: flex;
        align-items: center;
        justify-content: center;

        img {
          width: 85%;
          height: 85%;
          object-fit: contain;
          transition: transform 0.3s ease;
        }

        &:hover img {
          transform: scale(1.05);
        }
      }

      .big-card-info {
        display: flex;
        flex-direction: column;
        flex: 1;

        .big-title {
          font-size: 14px;
          font-weight: 600;
          color: #0f172a;
          line-height: 1.4;
          margin-bottom: 6px;
        }

        .big-reason {
          font-size: 12px;
          color: #f97316;
          background: #fff7ed;
          padding: 4px 8px;
          border-radius: 4px;
          margin-bottom: 12px;
          line-height: 1.3;
        }

        .big-price-row {
          margin-top: auto;
          display: flex;
          align-items: center;
          justify-content: space-between;

          .big-price {
            display: flex;
            align-items: baseline;

            .sym {
              font-size: 13px;
              font-weight: 700;
              color: #dc2626;
            }

            .val {
              font-size: 20px;
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

          .big-buy-btn {
            background: linear-gradient(135deg, #ef4444, #dc2626);
            color: #ffffff;
            font-size: 12px;
            font-weight: 700;
            padding: 6px 14px;
            border-radius: 16px;
            border: none;
            cursor: pointer;
            transition: all 0.2s;

            &:hover {
              opacity: 0.9;
              transform: scale(1.03);
            }
          }
        }
      }
    }

    .featured-sub-grid {
      flex: 1;
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 12px;
    }
  }

  /* 标准网格流 */
  .recommend-standard-grid {
    display: grid;
    gap: 12px;
  }

  .recommend-card {
    background: #ffffff;
    border-radius: 8px;
    padding: 10px;
    display: flex;
    flex-direction: column;
    border: 1px solid #f1f5f9;
    transition: all 0.25s ease;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 16px rgba(0, 0, 0, 0.06);

      .card-thumb img {
        transform: scale(1.05);
      }

      .cart-pill-btn {
        background: #ef4444;
        color: #ffffff;
      }
    }

    .card-thumb {
      position: relative;
      width: 100%;
      aspect-ratio: 1 / 1;
      background: #f8fafc;
      border-radius: 6px;
      overflow: hidden;
      margin-bottom: 8px;

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition: transform 0.3s;
      }

      .rec-tag {
        position: absolute;
        top: 6px;
        left: 6px;
        background: #ef4444;
        color: #ffffff;
        font-size: 9px;
        font-weight: 700;
        padding: 1px 5px;
        border-radius: 3px;
      }
    }

    .card-body {
      display: flex;
      flex-direction: column;
      flex: 1;

      .goods-title {
        font-size: 12px;
        color: #1e293b;
        line-height: 1.4;
        height: 34px;
        overflow: hidden;
        text-overflow: ellipsis;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        margin-bottom: 4px;
      }

      .recommend-meta {
        font-size: 10px;
        color: #f97316;
        margin-bottom: 6px;

        .reason-tag {
          background: #fff7ed;
          padding: 1px 5px;
          border-radius: 3px;
        }

        .sales-num {
          color: #94a3b8;
          margin-right: 6px;
        }

        .rate-num {
          color: #10b981;
        }
      }

      .price-row {
        margin-top: auto;
        display: flex;
        align-items: center;
        justify-content: space-between;

        .price-box {
          display: flex;
          align-items: baseline;

          .sym {
            font-size: 11px;
            font-weight: 700;
            color: #dc2626;
          }

          .val {
            font-size: 16px;
            font-weight: 800;
            color: #dc2626;
          }
        }

        .cart-pill-btn {
          width: 22px;
          height: 22px;
          border-radius: 50%;
          border: none;
          background: #f1f5f9;
          color: #64748b;
          font-size: 14px;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
        }
      }
    }
  }

  .recommend-footer-action {
    display: flex;
    justify-content: center;
    margin-top: 20px;

    .refresh-rec-btn {
      display: flex;
      align-items: center;
      gap: 6px;
      background: #ffffff;
      border: 1px solid #e2e8f0;
      color: #475569;
      font-size: 13px;
      font-weight: 500;
      padding: 8px 24px;
      border-radius: 20px;
      cursor: pointer;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04);
      transition: all 0.2s;

      &:hover {
        border-color: #ef4444;
        color: #ef4444;
        box-shadow: 0 4px 12px rgba(239, 68, 68, 0.12);
      }
    }
  }
}
</style>
