<template>
  <div class="decor-channel-floor" :style="customStyle">
    <!-- 1. 标题区 -->
    <div class="channel-floor-header" v-if="options.showTitle !== false && options.title">
      <div class="header-main-title">
        <span class="title-pill"></span>
        <h3 class="title-text">{{ options.title }}</h3>
        <span class="subtitle-text" v-if="options.subtitle">{{ options.subtitle }}</span>
      </div>
      <router-link :to="options.heroHref || '/goods'" class="header-more">
        探索更多场景 &gt;
      </router-link>
    </div>

    <!-- 2. 场景频道组合布局：左侧主视觉+活动入口 + 右侧商品网格 -->
    <div class="channel-floor-body" :class="{ 'no-hero': !showHero }">
      <!-- 左侧主视觉卡片 (Hero Card) -->
      <div
        class="channel-hero-card"
        :class="[`style-${options.heroStyle || 'gradient'}`]"
        v-if="showHero"
      >
        <div class="hero-top-info">
          <div class="hero-badge">SCENE CHANNEL</div>
          <h3 class="hero-title">{{ options.heroTitle || '品质生活馆' }}</h3>
          <p class="hero-sub">{{ options.heroSubtitle || '精选场景好物，一站购齐' }}</p>
        </div>

        <div class="hero-image-wrap">
          <img :src="heroImg" alt="channel hero" class="hero-img" />
          <router-link :to="options.heroHref || '/goods'" class="hero-cta-btn">
            <span>{{ options.heroButtonText || '进入频道' }}</span>
            <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
              <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/>
            </svg>
          </router-link>
        </div>

        <!-- 专属活动入口 (Promos) -->
        <div class="hero-promos-wrap" v-if="promosList.length">
          <router-link
            v-for="(p, pIdx) in promosList"
            :key="pIdx"
            :to="p.url || '/goods'"
            class="hero-promo-item"
          >
            <span class="promo-tag" v-if="p.tag">{{ p.tag }}</span>
            <div class="promo-text-box">
              <span class="promo-title">{{ p.title }}</span>
              <span class="promo-desc">{{ p.desc }}</span>
            </div>
            <span class="promo-arrow">&gt;</span>
          </router-link>
        </div>
      </div>

      <!-- 右侧商品网格 (Scene Goods Grid) -->
      <div
        class="channel-goods-grid"
        :class="`cols-${rightColumns}`"
        :style="{ gridTemplateColumns: `repeat(${rightColumns}, 1fr)` }"
      >
        <div
          v-for="(g, idx) in displayGoods"
          :key="g.id || idx"
          class="scene-goods-card"
        >
          <router-link :to="`/goods/${g.id || 1}`" class="card-thumb-wrap">
            <img :src="g.thumbnail || defaultThumb" :alt="g.goodsName" class="goods-img" />
            <span class="scene-tag">场景精选</span>
          </router-link>

          <div class="card-info">
            <h4 class="goods-name">
              <router-link :to="`/goods/${g.id || 1}`">{{ g.goodsName }}</router-link>
            </h4>
            <div class="price-action-row">
              <div class="price-box">
                <span class="sym">￥</span>
                <span class="val">{{ g.price }}</span>
                <span class="orig" v-if="g.originalPrice">￥{{ g.originalPrice }}</span>
              </div>
              <button
                type="button"
                class="cart-btn"
                title="立即加购"
                @click="addToCart(g)"
              >
                +
              </button>
            </div>
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

const heroImg = computed(() => {
  return props.options?.heroImage || '/static/banner-floor/floor_banner_1.png';
});

const showHero = computed(() => {
  const ratio = props.componentStyle?.widthRatio || '100%';
  if (ratio === '16.67%' || ratio === '16.6%' || ratio === '33.33%' || ratio === '33.3%') {
    return false;
  }
  return true;
});

const rightColumns = computed(() => {
  const ratio = props.componentStyle?.widthRatio || '100%';
  if (ratio === '16.67%' || ratio === '16.6%') return 1;
  if (ratio === '33.33%' || ratio === '33.3%') return 2;
  if (ratio === '50%') return showHero.value ? 2 : 3;
  if (ratio === '66.67%' || ratio === '66.6%') return showHero.value ? 3 : 4;
  return 3;
});

const promosList = computed(() => {
  if (Array.isArray(props.options?.promos) && props.options.promos.length > 0) {
    return props.options.promos;
  }
  return [
    { title: '大牌补贴', desc: '领券最高减100', tag: '限时', url: '/goods' },
    { title: '新品驾到', desc: '官方正品首发', tag: '新品', url: '/goods' }
  ];
});

const defaultGoods = [
  { id: '1', goodsName: '旗舰 5G 智能手机 12GB+256GB 超光影影像系统', price: '3999.00', originalPrice: '4599.00', thumbnail: '/static/goods/goods_1.png' },
  { id: '2', goodsName: '无线头戴式深度主动降噪蓝牙耳机 空间音频Hi-Res', price: '1099.00', originalPrice: '1499.00', thumbnail: '/static/goods/goods_2.png' },
  { id: '3', goodsName: '14英寸 全面屏轻薄商务笔记本电脑 酷睿i7 高刷防眩光', price: '5699.00', originalPrice: '6299.00', thumbnail: '/static/goods/goods_3.png' },
  { id: '4', goodsName: '运动健康专业监测智能手表 心率血氧长续航50米防水', price: '899.00', originalPrice: '1199.00', thumbnail: '/static/goods/goods_4.png' },
  { id: '5', goodsName: '意式半自动家用复古咖啡机 20Bar高压恒温萃取蒸汽奶泡', price: '899.00', originalPrice: '1280.00', thumbnail: '/static/goods/goods_6.png' },
  { id: '6', goodsName: '奢宠酵母焕活修护精华露 50ml 紧致淡纹抗皱滋养', price: '680.00', originalPrice: '890.00', thumbnail: '/static/goods/goods_5.png' }
];

const displayGoods = computed(() => {
  if (Array.isArray(props.options?.goods) && props.options.goods.length > 0) {
    return props.options.goods;
  }
  const count = props.options?.goodsCount || 6;
  return defaultGoods.slice(0, count);
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

function addToCart(item) {
  ElMessage.success(`已将 "${item.goodsName?.slice(0, 10)}..." 加入购物车`);
}
</script>

<style lang="scss" scoped>
.decor-channel-floor {
  width: 100%;
  box-sizing: border-box;

  .channel-floor-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-bottom: 12px;
    margin-bottom: 14px;
    border-bottom: 2px solid #f1f5f9;

    .header-main-title {
      display: flex;
      align-items: center;
      gap: 10px;

      .title-pill {
        width: 4px;
        height: 18px;
        background: linear-gradient(180deg, #6366f1, #4f46e5);
        border-radius: 2px;
      }

      .title-text {
        font-size: 20px;
        font-weight: 700;
        color: #1e293b;
        margin: 0;
      }

      .subtitle-text {
        font-size: 13px;
        color: #94a3b8;
        margin-left: 2px;
      }
    }

    .header-more {
      font-size: 13px;
      color: #64748b;
      text-decoration: none;
      transition: color 0.2s;

      &:hover {
        color: #4f46e5;
      }
    }
  }

  .channel-floor-body {
    display: flex;
    gap: 16px;
    align-items: stretch;

    &.no-hero {
      .channel-goods-grid {
        width: 100%;
      }
    }

    .channel-hero-card {
      width: 320px;
      flex-shrink: 0;
      border-radius: 12px;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      padding: 20px 18px 16px;
      box-sizing: border-box;
      position: relative;
      transition: all 0.3s ease;

      &.style-gradient {
        background: linear-gradient(145deg, #1e1b4b, #312e81 60%, #4338ca);
        color: #ffffff;
      }

      &.style-plain {
        background: #f8fafc;
        border: 1px solid #e2e8f0;
        color: #1e293b;

        .hero-badge {
          background: #e0e7ff;
          color: #4338ca;
        }

        .hero-title {
          color: #0f172a;
        }

        .hero-sub {
          color: #64748b;
        }

        .hero-cta-btn {
          background: #4f46e5;
          color: #ffffff;
        }
      }

      .hero-top-info {
        margin-bottom: 12px;

        .hero-badge {
          display: inline-block;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 1px;
          padding: 2px 8px;
          border-radius: 4px;
          background: rgba(255, 255, 255, 0.2);
          backdrop-filter: blur(4px);
          margin-bottom: 8px;
        }

        .hero-title {
          font-size: 22px;
          font-weight: 800;
          margin: 0 0 4px 0;
          line-height: 1.25;
        }

        .hero-sub {
          font-size: 12px;
          color: rgba(255, 255, 255, 0.8);
          margin: 0;
          line-height: 1.4;
        }
      }

      .hero-image-wrap {
        position: relative;
        width: 100%;
        height: 220px;
        border-radius: 8px;
        overflow: hidden;
        margin-bottom: 14px;
        background: rgba(0, 0, 0, 0.1);

        .hero-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.4s ease;
        }

        &:hover .hero-img {
          transform: scale(1.04);
        }

        .hero-cta-btn {
          position: absolute;
          bottom: 10px;
          right: 10px;
          background: #ffffff;
          color: #312e81;
          font-size: 12px;
          font-weight: 700;
          padding: 6px 14px;
          border-radius: 20px;
          display: flex;
          align-items: center;
          gap: 4px;
          text-decoration: none;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.25);
          cursor: pointer;
          transition: all 0.2s;

          &:hover {
            background: #4f46e5;
            color: #ffffff;
          }
        }
      }

      .hero-promos-wrap {
        display: flex;
        flex-direction: column;
        gap: 8px;
        margin-top: auto;

        .hero-promo-item {
          display: flex;
          align-items: center;
          gap: 8px;
          background: rgba(255, 255, 255, 0.12);
          backdrop-filter: blur(6px);
          padding: 8px 12px;
          border-radius: 8px;
          text-decoration: none;
          color: inherit;
          cursor: pointer;
          transition: all 0.2s;

          &:hover {
            background: rgba(255, 255, 255, 0.22);
            transform: translateX(3px);
          }

          .promo-tag {
            font-size: 10px;
            font-weight: 700;
            padding: 2px 6px;
            border-radius: 3px;
            background: #ef4444;
            color: #ffffff;
          }

          .promo-text-box {
            display: flex;
            flex-direction: column;
            flex: 1;

            .promo-title {
              font-size: 12px;
              font-weight: 700;
              line-height: 1.2;
            }

            .promo-desc {
              font-size: 11px;
              opacity: 0.85;
            }
          }

          .promo-arrow {
            font-size: 13px;
            opacity: 0.7;
          }
        }
      }
    }

    .channel-goods-grid {
      flex: 1;
      display: grid;
      gap: 12px;

      .scene-goods-card {
        background: #ffffff;
        border: 1px solid #f1f5f9;
        border-radius: 8px;
        padding: 10px;
        display: flex;
        flex-direction: column;
        transition: all 0.25s ease;

        &:hover {
          border-color: #cbd5e1;
          box-shadow: 0 6px 16px rgba(0, 0, 0, 0.06);
          transform: translateY(-2px);
        }

        .card-thumb-wrap {
          display: block;
          position: relative;
          width: 100%;
          aspect-ratio: 1 / 1;
          background: #f8fafc;
          border-radius: 6px;
          overflow: hidden;
          margin-bottom: 8px;

          .goods-img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            transition: transform 0.3s;
          }

          &:hover .goods-img {
            transform: scale(1.05);
          }

          .scene-tag {
            position: absolute;
            top: 6px;
            left: 6px;
            background: #4f46e5;
            color: #ffffff;
            font-size: 9px;
            font-weight: 700;
            padding: 1px 5px;
            border-radius: 3px;
          }
        }

        .card-info {
          display: flex;
          flex-direction: column;
          flex: 1;

          .goods-name {
            font-size: 12px;
            font-weight: 500;
            line-height: 1.4;
            height: 34px;
            overflow: hidden;
            text-overflow: ellipsis;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            margin: 0 0 6px 0;

            a {
              color: #1e293b;
              text-decoration: none;
              &:hover {
                color: #4f46e5;
              }
            }
          }

          .price-action-row {
            margin-top: auto;
            display: flex;
            align-items: center;
            justify-content: space-between;

            .price-box {
              display: flex;
              align-items: baseline;
              gap: 1px;

              .sym {
                font-size: 11px;
                font-weight: 700;
                color: #e11d48;
              }

              .val {
                font-size: 16px;
                font-weight: 800;
                color: #e11d48;
              }

              .orig {
                font-size: 10px;
                color: #94a3b8;
                text-decoration: line-through;
                margin-left: 3px;
              }
            }

            .cart-btn {
              width: 22px;
              height: 22px;
              border-radius: 50%;
              border: none;
              background: #f1f5f9;
              color: #475569;
              font-size: 14px;
              font-weight: 700;
              display: flex;
              align-items: center;
              justify-content: center;
              cursor: pointer;
              transition: all 0.2s;

              &:hover {
                background: #4f46e5;
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
