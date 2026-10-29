<template>
  <div class="tpl-grid-floor" :style="customStyle">
    <!-- 楼层大标题栏 (Floor Title Bar) -->
    <div class="floor-title-header" v-if="options.showFloorTitle !== false">
      <div class="floor-main-heading">
        <span class="floor-badge">{{ options.floorNum || '1F' }}</span>
        <span class="floor-title-text">{{ options.title || '潮流数码' }}</span>
        <span class="floor-subtitle-text" v-if="options.subtitle">{{ options.subtitle }}</span>
      </div>

      <div class="floor-header-right">
        <!-- 子分类快捷标签 -->
        <div class="sub-category-tags" v-if="subCategories.length">
          <span
            v-for="(tag, idx) in subCategories"
            :key="idx"
            class="tag-item"
            :class="{ active: activeTagIdx === idx }"
            @click="activeTagIdx = idx"
          >
            {{ tag }}
          </span>
        </div>
        <span class="more-link">查看更多 &gt;</span>
      </div>
    </div>

    <!-- 楼层主体：左侧竖向营销海报 + 右侧商品网格 -->
    <div class="floor-main-body" :class="{ 'no-poster': !showPoster }">
      <!-- 左侧营销大促海报 -->
      <div class="floor-left-poster" v-if="showPoster">
        <div class="poster-inner">
          <img :src="posterImg" alt="floor poster" class="poster-img" />
          <div class="poster-overlay">
            <div class="poster-top-badge">{{ options.floorNum || '1F' }} 甄选</div>
            <h4 class="poster-headline">{{ options.posterTitle || '数码潮电 酷玩季' }}</h4>
            <p class="poster-subline">{{ options.posterSub || '领券最高立减 600 元' }}</p>
            <div class="poster-pill-tags" v-if="posterTags.length">
              <span v-for="(pt, pIdx) in posterTags" :key="pIdx" class="pill-tag">{{ pt }}</span>
            </div>
            <div class="poster-action-btn">
              <span>立即抢购 &gt;</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧商品网格 (2行 x N列) -->
      <div
        class="floor-right-goods"
        :class="`cols-${rightColumns}`"
        :style="{ gridTemplateColumns: `repeat(${rightColumns}, 1fr)` }"
      >
        <div
          v-for="(g, idx) in displayGoods"
          :key="g.id || idx"
          class="floor-goods-card"
        >
          <div class="card-thumb-wrap">
            <img :src="g.thumbnail || defaultThumb" :alt="g.goodsName" class="goods-img" />
            <span class="corner-badge" v-if="idx < 3">HOT</span>
          </div>

          <div class="card-detail">
            <div class="goods-name-line">{{ g.goodsName }}</div>
            <div class="goods-tag-row">
              <span class="mini-tag">官方直营</span>
              <span class="mini-tag light">免息</span>
            </div>
            <div class="price-action-row">
              <div class="price-group">
                <span class="currency">￥</span>
                <span class="amount">{{ g.price }}</span>
                <span class="orig-amount" v-if="g.originalPrice">￥{{ g.originalPrice }}</span>
              </div>
              <button type="button" class="buy-action-btn" title="查看商品">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                  <path d="M11 9h2V6h3V4h-3V1h-2v3H8v2h3v3zm-4 9c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zm10 0c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2zm-9.83-3.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.86-7.01L19.42 4h-.01l-1.1 2-2.76 5H8.53l-.13-.27L6.16 6l-.95-2-.94-2H1v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.13 0-.25-.11-.25-.25z"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

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
const activeTagIdx = ref(0);

const subCategories = computed(() => {
  if (Array.isArray(props.options?.subCategories) && props.options.subCategories.length > 0) {
    return props.options.subCategories;
  }
  return ['旗舰手机', '轻薄笔电', '降噪耳机', '智能穿戴', '数码配件'];
});

const posterTags = computed(() => {
  if (Array.isArray(props.options?.posterTags) && props.options.posterTags.length > 0) {
    return props.options.posterTags;
  }
  return ['爆款低至5折', '新品首发', '分期免息'];
});

const posterImg = computed(() => {
  return props.options?.bannerImg || props.options?.posterImg || 'https://lilishop-pc.oss-cn-beijing.aliyuncs.com/static/banner-floor/floor_banner_1.png';
});

const showPoster = computed(() => {
  const ratio = props.componentStyle?.widthRatio || '100%';
  // 如果宽度太窄（如六分之一或三分之一），隐藏左侧海报避免挤压
  if (ratio === '16.67%' || ratio === '16.6%' || ratio === '33.33%' || ratio === '33.3%') {
    return false;
  }
  return props.options?.showPoster !== false;
});

const rightColumns = computed(() => {
  const ratio = props.componentStyle?.widthRatio || '100%';
  let baseCols = Number(props.options?.columns) || 4;
  if (ratio === '16.67%' || ratio === '16.6%') return 1;
  if (ratio === '33.33%' || ratio === '33.3%') return 2;
  if (ratio === '50%') return showPoster.value ? 2 : 3;
  if (ratio === '66.67%' || ratio === '66.6%') return showPoster.value ? 3 : 4;
  return baseCols; // 100% 默认 4 列
});

const defaultFloorGoods = [
  { id: '101', goodsName: '旗舰 5G 智能手机 12GB+256GB 超光影影像系统', price: '3999.00', originalPrice: '4599.00', thumbnail: 'https://lilishop-pc.oss-cn-beijing.aliyuncs.com/static/goods/goods_1.png' },
  { id: '102', goodsName: '无线头戴式深度主动降噪蓝牙耳机 空间音频Hi-Res', price: '1099.00', originalPrice: '1499.00', thumbnail: 'https://lilishop-pc.oss-cn-beijing.aliyuncs.com/static/goods/goods_2.png' },
  { id: '103', goodsName: '14英寸 全面屏轻薄商务笔记本电脑 酷睿i7 高刷防眩光', price: '5699.00', originalPrice: '6299.00', thumbnail: 'https://lilishop-pc.oss-cn-beijing.aliyuncs.com/static/goods/goods_3.png' },
  { id: '104', goodsName: '运动健康专业监测智能手表 心率血氧长续航50米防水', price: '899.00', originalPrice: '1199.00', thumbnail: 'https://lilishop-pc.oss-cn-beijing.aliyuncs.com/static/goods/goods_4.png' },
  { id: '105', goodsName: '奢宠酵母焕活修护精华露 50ml 紧致淡纹抗皱滋养', price: '680.00', originalPrice: '890.00', thumbnail: 'https://lilishop-pc.oss-cn-beijing.aliyuncs.com/static/goods/goods_5.png' },
  { id: '106', goodsName: '意式半自动家用复古咖啡机 20Bar高压恒温萃取蒸汽奶泡', price: '899.00', originalPrice: '1280.00', thumbnail: 'https://lilishop-pc.oss-cn-beijing.aliyuncs.com/static/goods/goods_6.png' },
  { id: '107', goodsName: '碳板专业竞速轻量缓震跑步鞋 透气防滑男女同款潮鞋', price: '459.00', originalPrice: '699.00', thumbnail: 'https://lilishop-pc.oss-cn-beijing.aliyuncs.com/static/goods/goods_7.png' },
  { id: '108', goodsName: '极简静音无雾负离子香薰加湿器 大容量客厅卧室通用', price: '299.00', originalPrice: '399.00', thumbnail: 'https://lilishop-pc.oss-cn-beijing.aliyuncs.com/static/goods/goods_8.png' }
];

const displayGoods = computed(() => {
  if (Array.isArray(props.options?.goods) && props.options.goods.length > 0) {
    return props.options.goods;
  }
  const count = (rightColumns.value * 2) || 8;
  return defaultFloorGoods.slice(0, count);
});

const customStyle = computed(() => {
  const s = props.componentStyle || {};
  return {
    backgroundColor: s.backgroundColor || '#ffffff',
    padding: Array.isArray(s.padding)
      ? `${s.padding[0]}px ${s.padding[1]}px ${s.padding[2]}px ${s.padding[3]}px`
      : '16px 20px',
    borderRadius: Array.isArray(s.radius)
      ? `${s.radius[0]}px ${s.radius[1]}px ${s.radius[2]}px ${s.radius[3]}px`
      : '12px'
  };
});
</script>

<style lang="scss" scoped>
.tpl-grid-floor {
  width: 100%;
  box-sizing: border-box;
  user-select: none;

  /* 楼层大标题栏 */
  .floor-title-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-bottom: 14px;
    border-bottom: 2px solid #f1f5f9;
    margin-bottom: 16px;

    .floor-main-heading {
      display: flex;
      align-items: center;
      gap: 10px;

      .floor-badge {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        background: linear-gradient(135deg, #2563eb, #1d4ed8);
        color: #ffffff;
        font-weight: 800;
        font-size: 13px;
        padding: 3px 10px;
        border-radius: 4px;
        letter-spacing: 0.5px;
        box-shadow: 0 2px 6px rgba(37, 99, 235, 0.25);
      }

      .floor-title-text {
        font-size: 20px;
        font-weight: 700;
        color: #1e293b;
        letter-spacing: -0.2px;
      }

      .floor-subtitle-text {
        font-size: 12px;
        font-weight: 600;
        color: #94a3b8;
        text-transform: uppercase;
        letter-spacing: 1px;
        margin-left: 4px;
      }
    }

    .floor-header-right {
      display: flex;
      align-items: center;
      gap: 16px;

      .sub-category-tags {
        display: flex;
        align-items: center;
        gap: 8px;

        .tag-item {
          font-size: 13px;
          color: #64748b;
          padding: 4px 10px;
          border-radius: 14px;
          cursor: pointer;
          transition: all 0.2s;

          &:hover, &.active {
            color: #2563eb;
            background: #eff6ff;
            font-weight: 600;
          }
        }
      }

      .more-link {
        font-size: 13px;
        color: #64748b;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 2px;
        transition: color 0.2s;

        &:hover {
          color: #2563eb;
        }
      }
    }
  }

  /* 楼层主体 */
  .floor-main-body {
    display: flex;
    gap: 16px;
    align-items: stretch;

    &.no-poster {
      .floor-right-goods {
        width: 100%;
      }
    }

    /* 左侧竖向海报 */
    .floor-left-poster {
      width: 240px;
      flex-shrink: 0;
      border-radius: 10px;
      overflow: hidden;
      position: relative;
      background: #1e293b;

      .poster-inner {
        position: relative;
        width: 100%;
        height: 100%;
        min-height: 520px;

        .poster-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          filter: brightness(0.85);
          transition: transform 0.4s ease;
        }

        &:hover .poster-img {
          transform: scale(1.03);
        }

        .poster-overlay {
          position: absolute;
          inset: 0;
          padding: 24px 18px;
          display: flex;
          flex-direction: column;
          background: linear-gradient(180deg, rgba(15, 23, 42, 0.75) 0%, rgba(15, 23, 42, 0.2) 40%, rgba(15, 23, 42, 0.85) 100%);
          color: #ffffff;

          .poster-top-badge {
            align-self: flex-start;
            font-size: 11px;
            font-weight: 700;
            background: rgba(255, 255, 255, 0.25);
            backdrop-filter: blur(4px);
            padding: 3px 8px;
            border-radius: 4px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 12px;
          }

          .poster-headline {
            font-size: 22px;
            font-weight: 800;
            line-height: 1.3;
            margin: 0 0 6px 0;
            text-shadow: 0 2px 4px rgba(0, 0, 0, 0.4);
          }

          .poster-subline {
            font-size: 13px;
            color: rgba(255, 255, 255, 0.85);
            margin: 0 0 16px 0;
            line-height: 1.4;
          }

          .poster-pill-tags {
            display: flex;
            flex-wrap: wrap;
            gap: 6px;
            margin-bottom: auto;

            .pill-tag {
              font-size: 11px;
              padding: 3px 8px;
              background: rgba(255, 255, 255, 0.18);
              border-radius: 10px;
              backdrop-filter: blur(4px);
            }
          }

          .poster-action-btn {
            align-self: flex-start;
            margin-top: auto;
            background: #ffffff;
            color: #0f172a;
            font-size: 13px;
            font-weight: 700;
            padding: 8px 16px;
            border-radius: 20px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
            transition: all 0.2s;
            cursor: pointer;

            &:hover {
              background: #2563eb;
              color: #ffffff;
            }
          }
        }
      }
    }

    /* 右侧商品网格 */
    .floor-right-goods {
      flex: 1;
      display: grid;
      gap: 12px;

      .floor-goods-card {
        background: #ffffff;
        border: 1px solid #f1f5f9;
        border-radius: 8px;
        padding: 12px;
        display: flex;
        flex-direction: column;
        transition: all 0.25s ease;

        &:hover {
          border-color: #cbd5e1;
          box-shadow: 0 6px 16px rgba(0, 0, 0, 0.06);
          transform: translateY(-2px);
        }

        .card-thumb-wrap {
          position: relative;
          width: 100%;
          aspect-ratio: 1 / 1;
          background: #f8fafc;
          border-radius: 6px;
          overflow: hidden;
          margin-bottom: 10px;

          .goods-img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            transition: transform 0.3s;
          }

          &:hover .goods-img {
            transform: scale(1.05);
          }

          .corner-badge {
            position: absolute;
            top: 6px;
            left: 6px;
            background: linear-gradient(135deg, #ef4444, #dc2626);
            color: #ffffff;
            font-size: 10px;
            font-weight: 700;
            padding: 2px 6px;
            border-radius: 4px;
          }
        }

        .card-detail {
          display: flex;
          flex-direction: column;
          flex: 1;

          .goods-name-line {
            font-size: 14px;
            color: #1e293b;
            font-weight: 500;
            line-height: 1.4;
            height: 40px;
            overflow: hidden;
            text-overflow: ellipsis;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            margin-bottom: 6px;
          }

          .goods-tag-row {
            display: flex;
            gap: 4px;
            margin-bottom: 8px;

            .mini-tag {
              font-size: 10px;
              padding: 1px 5px;
              border-radius: 3px;
              background: #fee2e2;
              color: #dc2626;

              &.light {
                background: #eff6ff;
                color: #2563eb;
              }
            }
          }

          .price-action-row {
            margin-top: auto;
            display: flex;
            align-items: center;
            justify-content: space-between;

            .price-group {
              display: flex;
              align-items: baseline;
              gap: 2px;

              .currency {
                font-size: 12px;
                font-weight: 700;
                color: #e11d48;
              }

              .amount {
                font-size: 17px;
                font-weight: 800;
                color: #e11d48;
              }

              .orig-amount {
                font-size: 11px;
                color: #94a3b8;
                text-decoration: line-through;
                margin-left: 4px;
              }
            }

            .buy-action-btn {
              width: 26px;
              height: 26px;
              border-radius: 50%;
              border: none;
              background: #f1f5f9;
              color: #475569;
              display: flex;
              align-items: center;
              justify-content: center;
              cursor: pointer;
              transition: all 0.2s;

              &:hover {
                background: #2563eb;
                color: #ffffff;
              }
            }
          }
        }
      }
    }
  }
}
</style>
