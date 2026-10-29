<template>
  <div class="decor-goods-list" :style="customStyle">
    <!-- 标题栏 -->
    <div class="floor-title-bar" v-if="options.showTitle !== false && options.title">
      <div class="title-left">
        <h3 class="main-title">{{ options.title }}</h3>
        <span class="sub-title" v-if="options.subtitle">{{ options.subtitle }}</span>
      </div>
      <router-link
        :to="options.moreUrl || (options.categoryId ? `/goodsList?categoryId=${options.categoryId}` : '/goodsList')"
        class="more-link"
        v-if="options.showMoreLink !== false"
      >
        {{ options.moreText || '查看更多' }} &gt;
      </router-link>
    </div>

    <!-- 6 列商品列表网格 (整行展示 6 个商品) -->
    <div
      class="goods-flow-grid"
      :class="`cols-${actualColumns}`"
      :style="{ gridTemplateColumns: `repeat(${actualColumns}, 1fr)` }"
    >
      <div
        v-for="(g, idx) in sampleGoods"
        :key="g.id || idx"
        class="goods-flow-card"
      >
        <router-link
          :to="{ path: '/goodsDetail', query: { skuId: g.id, goodsId: g.goodsId || g.id } }"
          class="card-thumb-wrap"
        >
          <img :src="g.thumbnail || defaultThumb" :alt="g.goodsName" class="thumb-img" />
          <span class="self-tag" v-if="idx % 3 === 0">自营</span>
        </router-link>

        <div class="card-body">
          <h4 class="goods-name" v-if="options.showTitle !== false">
            <router-link :to="{ path: '/goodsDetail', query: { skuId: g.id, goodsId: g.goodsId || g.id } }">
              {{ g.goodsName }}
            </router-link>
          </h4>

          <div class="price-row">
            <div class="price-box">
              <span class="symbol">￥</span>
              <span class="price-val" v-if="options.showPrice !== false">{{ g.price }}</span>
              <span class="orig-price" v-if="options.showOriginalPrice && g.originalPrice">￥{{ g.originalPrice }}</span>
            </div>
            <button
              type="button"
              class="add-cart-circle"
              v-if="options.showCartBtn !== false"
              title="加入购物车"
              @click="addToCart(g)"
            >
              +
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { goodsList } from '@/api/goods';

const router = useRouter();

function handleNavigateGoods(g) {
  if (g.url) {
    const url = String(g.url).trim();
    if (/^https?:\/\//i.test(url)) {
      window.open(url, '_blank');
      return;
    }
    router.push(url);
    return;
  }
  router.push({
    path: '/goodsDetail',
    query: { skuId: g.id, goodsId: g.goodsId || g.id }
  });
}

function handleNavigateMore() {
  const url = props.options?.moreUrl || (props.options?.categoryId ? `/goodsList?categoryId=${props.options.categoryId}` : '/goodsList');
  if (/^https?:\/\//i.test(url)) {
    window.open(url, '_blank');
  } else {
    router.push(url);
  }
}

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

const defaultMockGoods = [
  { id: '1', goodsName: '旗舰 5G 智能手机 12GB+256GB 超光影影像系统', price: '3999.00', originalPrice: '4599.00', thumbnail: 'https://lilishop-pc.oss-cn-beijing.aliyuncs.com/static/goods/goods_1.png' },
  { id: '2', goodsName: '无线头戴式深度主动降噪蓝牙耳机 空间音频Hi-Res', price: '1099.00', originalPrice: '1499.00', thumbnail: 'https://lilishop-pc.oss-cn-beijing.aliyuncs.com/static/goods/goods_2.png' },
  { id: '3', goodsName: '14英寸 全面屏轻薄商务笔记本电脑 酷睿i7 高刷防眩光', price: '5699.00', originalPrice: '6299.00', thumbnail: 'https://lilishop-pc.oss-cn-beijing.aliyuncs.com/static/goods/goods_3.png' },
  { id: '4', goodsName: '运动健康专业监测智能手表 心率血氧长续航50米防水', price: '899.00', originalPrice: '1199.00', thumbnail: 'https://lilishop-pc.oss-cn-beijing.aliyuncs.com/static/goods/goods_4.png' },
  { id: '5', goodsName: '奢宠酵母焕活修护精华露 50ml 紧致淡纹抗皱滋养', price: '680.00', originalPrice: '890.00', thumbnail: 'https://lilishop-pc.oss-cn-beijing.aliyuncs.com/static/goods/goods_5.png' },
  { id: '6', goodsName: '意式半自动家用复古咖啡机 20Bar高压恒温萃取蒸汽奶泡', price: '899.00', originalPrice: '1280.00', thumbnail: 'https://lilishop-pc.oss-cn-beijing.aliyuncs.com/static/goods/goods_6.png' },
  { id: '7', goodsName: '碳板专业竞速轻量缓震跑步鞋 透气防滑男女同款潮鞋', price: '459.00', originalPrice: '699.00', thumbnail: 'https://lilishop-pc.oss-cn-beijing.aliyuncs.com/static/goods/goods_7.png' },
  { id: '8', goodsName: '极简静音无雾负离子香薰加湿器 大容量客厅卧室通用', price: '299.00', originalPrice: '399.00', thumbnail: 'https://lilishop-pc.oss-cn-beijing.aliyuncs.com/static/goods/goods_8.png' },
  { id: '9', goodsName: '折叠屏旗舰手机 典藏陶瓷白 悬停双旋水滴铰链', price: '6999.00', originalPrice: '7999.00', thumbnail: 'https://lilishop-pc.oss-cn-beijing.aliyuncs.com/static/goods/goods_1.png' },
  { id: '10', goodsName: '真无线触控降噪蓝牙耳机 超低延迟游戏降噪', price: '599.00', originalPrice: '799.00', thumbnail: 'https://lilishop-pc.oss-cn-beijing.aliyuncs.com/static/goods/goods_2.png' },
  { id: '11', goodsName: '国AA级减蓝光润眼长臂台灯 智能感光多档色温无极调光', price: '249.00', originalPrice: '359.00', thumbnail: 'https://lilishop-pc.oss-cn-beijing.aliyuncs.com/static/goods/goods_4.png' },
  { id: '12', goodsName: '航空级铝镁合金静音万向轮拉杆登机箱 20英寸防刮耐磨', price: '499.00', originalPrice: '699.00', thumbnail: 'https://lilishop-pc.oss-cn-beijing.aliyuncs.com/static/goods/goods_7.png' }
];

const categoryFetchedGoods = ref([]);
const isFetching = ref(false);

async function fetchGoodsByCategory() {
  if (props.options.dataSource !== 'category') return;

  const count = Number(props.options.goodsCount) || (props.component?.type === 'goodsCard' ? 1 : 6);
  const params = {
    pageNumber: 1,
    pageSize: count
  };

  if (props.options.categoryId) {
    const rawCat = String(props.options.categoryId);
    const catParts = rawCat.split(',');
    params.categoryId = catParts[catParts.length - 1];
  }

  // 排序参数映射
  if (props.options.sortType === 'sales') {
    params.sort = 'buyCount';
    params.order = 'desc';
  } else if (props.options.sortType === 'price_asc') {
    params.sort = 'price';
    params.order = 'asc';
  } else if (props.options.sortType === 'price_desc') {
    params.sort = 'price';
    params.order = 'desc';
  } else if (props.options.sortType === 'new') {
    params.sort = 'releaseTime';
    params.order = 'desc';
  }

  try {
    isFetching.value = true;
    const res = await goodsList(params);
    const records = res?.data?.result?.records || res?.result?.records || res?.data?.records || [];
    if (Array.isArray(records) && records.length > 0) {
      categoryFetchedGoods.value = records.map(item => ({
        id: item.id || item.goodsId || item.sn,
        goodsId: item.goodsId || item.id,
        goodsName: item.goodsName || item.name,
        price: item.price,
        originalPrice: item.originalPrice || item.price,
        thumbnail: item.thumbnail || item.pic || defaultThumb
      }));
    }
  } catch (err) {
    console.warn('Fetch goods by category failed:', err);
  } finally {
    isFetching.value = false;
  }
}

onMounted(() => {
  fetchGoodsByCategory();
});

watch(
  () => [props.options.dataSource, props.options.categoryId, props.options.goodsCount, props.options.sortType],
  () => {
    fetchGoodsByCategory();
  }
);

const isGoodsCard = computed(() => {
  return props.component?.type === 'goodsCard' || props.options?.type === 'goodsCard';
});

const actualColumns = computed(() => {
  let baseCols = Number(props.options?.columns) || 6;
  const ratio = props.componentStyle?.widthRatio || '100%';
  if (ratio === '16.67%' || ratio === '16.6%' || ratio === '16.7%') {
    return 1;
  }
  if (ratio === '33.33%' || ratio === '33.3%') {
    return Math.min(baseCols, 2);
  }
  if (ratio === '50%') {
    return Math.min(baseCols, 3);
  }
  if (ratio === '66.67%' || ratio === '66.6%' || ratio === '66.7%') {
    return Math.min(baseCols, 4);
  }
  return baseCols; // 100% 默认 6 列
});

const customStyle = computed(() => {
  const s = props.componentStyle || {};
  return {
    backgroundColor: s.backgroundColor || 'transparent',
    padding: Array.isArray(s.padding)
      ? `${s.padding[0]}px ${s.padding[1]}px ${s.padding[2]}px ${s.padding[3]}px`
      : '14px 0',
    borderRadius: Array.isArray(s.radius)
      ? `${s.radius[0]}px ${s.radius[1]}px ${s.radius[2]}px ${s.radius[3]}px`
      : '0'
  };
});

const sampleGoods = computed(() => {
  if (props.options.dataSource === 'category' && categoryFetchedGoods.value.length > 0) {
    const targetCount = Number(props.options.goodsCount) || (props.component?.type === 'goodsCard' ? 1 : 6);
    return categoryFetchedGoods.value.slice(0, targetCount);
  }
  if (Array.isArray(props.options.goods) && props.options.goods.length > 0) {
    return props.options.goods;
  }
  const count = props.options.goodsCount || (actualColumns.value * 2) || 12;
  return defaultMockGoods.slice(0, count);
});

function addToCart(item) {
  ElMessage.success(`已将 "${item.goodsName?.slice(0, 10)}..." 加入购物车`);
}
</script>

<style lang="scss" scoped>
.decor-goods-list {
  width: 100%;
  box-sizing: border-box;

  .floor-title-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 14px;
    padding: 0 4px;

    .title-left {
      display: flex;
      align-items: baseline;
      gap: 10px;

      .main-title {
        font-size: 20px;
        font-weight: 700;
        color: #1e293b;
        margin: 0;
      }

      .sub-title {
        font-size: 13px;
        color: #94a3b8;
      }
    }

    .more-link {
      cursor: pointer;
      font-size: 13px;
      color: #64748b;
      text-decoration: none;
      transition: color 0.2s;

      &:hover {
        color: #e11d48;
      }
    }
  }

  .goods-flow-grid {
    display: grid;
    gap: 12px;

    .goods-flow-card {
      background: #ffffff;
      border-radius: 8px;
      border: 1px solid #f1f5f9;
      padding: 10px;
      display: flex;
      flex-direction: column;
      transition: all 0.25s ease;

      &:hover {
        transform: translateY(-3px);
        box-shadow: 0 8px 18px rgba(0, 0, 0, 0.08);
        border-color: #e2e8f0;

        .thumb-img {
          transform: scale(1.05);
        }

        .add-cart-circle {
          background: #e11d48;
          color: #ffffff;
        }
      }

      .card-thumb-wrap {
        cursor: pointer;
        display: block;
        position: relative;
        width: 100%;
        aspect-ratio: 1 / 1;
        background: #f8fafc;
        border-radius: 6px;
        overflow: hidden;
        margin-bottom: 8px;

        .thumb-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.3s;
        }

        .self-tag {
          position: absolute;
          top: 6px;
          left: 6px;
          background: #e11d48;
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

        .goods-name {
          font-size: 14px;
          font-weight: 500;
          line-height: 1.4;
          height: 40px;
          overflow: hidden;
          text-overflow: ellipsis;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          margin: 0 0 4px 0;

          a {
            color: #1e293b;
            text-decoration: none;
            &:hover {
              color: #e11d48;
            }
          }
        }

        .meta-row {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 10px;
          color: #94a3b8;
          margin-bottom: 6px;
        }

        .price-row {
          margin-top: auto;
          display: flex;
          align-items: center;
          justify-content: space-between;

          .price-box {
            display: flex;
            align-items: baseline;

            .symbol {
              font-size: 11px;
              font-weight: 700;
              color: #e11d48;
            }

            .price-val {
              font-size: 16px;
              font-weight: 800;
              color: #e11d48;
            }

            .orig-price {
              font-size: 10px;
              color: #94a3b8;
              text-decoration: line-through;
              margin-left: 3px;
            }
          }

          .add-cart-circle {
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
  }
}
</style>