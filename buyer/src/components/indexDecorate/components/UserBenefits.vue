<template>
  <div class="decor-user-benefits" :style="customStyle">
    <!-- 1. 用户头像与信息区 -->
    <div class="user-main-info">
      <div class="avatar-box">
        <img v-if="displayAvatar" :src="displayAvatar" alt="用户头像" />
        <div v-else class="avatar-placeholder">
          <svg viewBox="0 0 24 24" width="22" height="22" fill="#ffffff">
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
          </svg>
        </div>
      </div>

      <div class="user-greeting">
        <div class="badge-tag">{{ isLoggedIn ? '已登录' : (options.badgeText || '请登录') }}</div>
        <div class="welcome-text" :title="welcomeText">
          {{ welcomeText }}
        </div>
        <div class="sub-text" :title="subtitle">
          {{ subtitle }}
        </div>
      </div>
    </div>

    <!-- 已登录时提供会员入口，装修中的登录与注册文案仅用于游客。 -->
    <div v-if="isLoggedIn" class="action-btn-row">
      <router-link to="/home" class="action-btn login-btn">会员中心</router-link>
      <router-link to="/home/MyOrder" class="action-btn register-btn">我的订单</router-link>
    </div>
    <div v-else class="action-btn-row">
      <a href="javascript:;" class="action-btn login-btn" @click="handleNavigate(options.loginUrl || '/login')">
        {{ options.loginText || '登录' }}
      </a>
      <a href="javascript:;" class="action-btn register-btn" @click="handleNavigate(options.registerUrl || '/signUp')">
        {{ options.registerText || '注册' }}
      </a>
    </div>

    <!-- 3. 指标数据卡 (购物车 / 优惠券 / 订单) -->
    <div class="metrics-cards-row">
      <a href="javascript:;" class="metric-card" v-if="options.showCart !== false" @click="handleNavigate(options.cartUrl || '/cart')">
        <div class="metric-val">{{ metricText('cart') }}</div>
        <div class="metric-label">{{ options.cartText || '购物车' }}</div>
      </a>
      <a href="javascript:;" class="metric-card" v-if="options.showCoupons !== false" @click="handleNavigate(metricUrl('coupons'))">
        <div class="metric-val">{{ metricText('coupons') }}</div>
        <div class="metric-label">{{ options.couponText || '优惠券' }}</div>
      </a>
      <a href="javascript:;" class="metric-card" v-if="options.showOrders !== false" @click="handleNavigate(metricUrl('orders'))">
        <div class="metric-val">{{ metricText('orders') }}</div>
        <div class="metric-label">{{ options.orderText || '订单' }}</div>
      </a>
    </div>

    <button v-if="hasMetricError" type="button" class="metrics-retry" @click="loadMetrics">
      数量加载失败，点击重试
    </button>

    <!-- 4. 快捷便民服务入口（底部图标排） -->
    <div class="quick-service-row">
      <a
        v-for="(srv, sIdx) in displayServices"
        :key="sIdx"
        href="javascript:;"
        class="service-item"
        @click="handleNavigate(srv.url)"
      >
        <el-icon class="service-icon"><component :is="getServiceIcon(srv.icon)" /></el-icon>
        <span class="service-name">{{ srv.name }}</span>
      </a>
    </div>
  </div>
</template>

<script setup>
import { computed, onActivated, onBeforeUnmount, onDeactivated, onMounted, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { Star, Clock, Present, Service } from '@element-plus/icons-vue';
import storage from '@/plugins/storage';
import { cartCount } from '@/api/cart';
import { memberCouponList } from '@/api/member';
import { getOrderList } from '@/api/order';
import { useAppStore } from '@/stores/app';

const router = useRouter();
const appStore = useAppStore();

const props = defineProps({
  options: {
    type: Object,
    default: () => ({})
  },
  componentStyle: {
    type: Object,
    default: () => ({})
  },
  rowStyle: {
    type: Object,
    default: () => ({})
  }
});

const userInfo = ref({});
const isLoggedIn = ref(false);

/** 读取现有登录缓存；缺少令牌时按游客展示，损坏的资料缓存不阻断首页。 */
function syncLoginState() {
  isLoggedIn.value = Boolean(storage.getItem('accessToken'));
  userInfo.value = {};
  if (!isLoggedIn.value) return;
  try {
    const cached = JSON.parse(storage.getItem('userInfo') || '{}');
    userInfo.value = cached && typeof cached === 'object' ? cached : {};
  } catch {
    userInfo.value = {};
  }
}

syncLoginState();

// 购物车沿用顶部购物车的有效 SKU 种数；优惠券统计未使用张数，订单统计全部订单。
const metrics = reactive({
  cart: { status: 'idle', value: 0 },
  coupons: { status: 'idle', value: 0 },
  orders: { status: 'idle', value: 0 }
});
let metricRequestId = 0;
let metricsLoading = false;
const hasMetricError = computed(() => Object.values(metrics).some(item => item.status === 'error'));

/** 游客显示 0；已登录时区分加载、失败和真实的零值，购物车随公共状态更新。 */
function metricText(key) {
  if (!isLoggedIn.value) return 0;
  const metric = metrics[key];
  if (metric.status === 'loading' || metric.status === 'idle') return '…';
  if (metric.status === 'error') return '—';
  return key === 'cart' ? appStore.cartNum : metric.value;
}

/** 将装修默认的历史地址映射到现有列表，保留商家配置的其他自定义链接。 */
function metricUrl(key) {
  const isCoupon = key === 'coupons';
  const configured = isCoupon ? props.options.couponUrl : props.options.orderUrl;
  const legacy = isCoupon ? '/member/coupon' : '/member/order';
  return !configured || configured === legacy
    ? (isCoupon ? '/home/Coupons' : '/home/MyOrder')
    : configured;
}

/** 并行读取汇总；失败独立展示，离开页面后忽略旧请求，重入首页时刷新数量。 */
async function loadMetrics() {
  if (metricsLoading) return;
  syncLoginState();
  const requestId = ++metricRequestId;
  if (!isLoggedIn.value) {
    Object.values(metrics).forEach(item => { item.status = 'idle'; item.value = 0; });
    return;
  }
  metricsLoading = true;
  const page = { pageNumber: 1, pageSize: 1 };
  const queries = [
    ['cart', props.options.showCart !== false, () => cartCount()],
    ['coupons', props.options.showCoupons !== false, () => memberCouponList({ ...page, memberCouponStatus: 'NEW' })],
    ['orders', props.options.showOrders !== false, () => getOrderList({ ...page, tag: 'ALL' })]
  ];
  await Promise.all(queries.filter(([, visible]) => visible).map(async ([key, , fetchCount]) => {
    metrics[key].status = 'loading';
    try {
      const response = await fetchCount();
      const raw = key === 'cart' ? response?.result : response?.result?.total;
      const count = Number(raw);
      if (!response?.success || raw == null || !Number.isSafeInteger(count) || count < 0) {
        throw new Error('无效的数量响应');
      }
      if (requestId !== metricRequestId) return;
      metrics[key].value = count;
      metrics[key].status = 'ready';
      if (key === 'cart') {
        appStore.setCartNum(count);
        storage.setItem('cartNum', count);
      }
    } catch {
      if (requestId === metricRequestId) metrics[key].status = 'error';
    }
  }));
  if (requestId === metricRequestId) metricsLoading = false;
}

/** 使离开首页前的异步响应失效，避免覆盖下一次进入后的数据。 */
function invalidateMetrics() {
  metricRequestId += 1;
  metricsLoading = false;
}

onMounted(loadMetrics);
onActivated(loadMetrics);
onDeactivated(invalidateMetrics);
onBeforeUnmount(invalidateMetrics);

const displayAvatar = computed(() => isLoggedIn.value
  ? userInfo.value.face
  : props.options.avatar);
const welcomeText = computed(() => isLoggedIn.value
  ? `你好，${userInfo.value.nickName || userInfo.value.username || '会员'}`
  : (props.options.welcomeText || '欢迎来到商城'));
const subtitle = computed(() => isLoggedIn.value
  ? '查看我的订单与专属权益'
  : (props.options.subtitle || '登录后查看专属权益'));

function handleNavigate(url) {
  if (!url) return;
  if (/^https?:\/\//i.test(url)) {
    window.open(url, '_blank');
  } else {
    router.push(url);
  }
}

const defaultServices = [
  { name: '收藏', url: '/home/Favorites', icon: 'Star' },
  { name: '足迹', url: '/home/MyTracks', icon: 'Clock' },
  { name: '领券', url: '/coupon', icon: 'Present' },
  { name: '帮助', url: '/article', icon: 'Service' }
];

const iconMap = {
  Star,
  Clock,
  Present,
  Service
};

function getServiceIcon(iconName) {
  return iconMap[iconName] || Service;
}

const displayServices = computed(() => {
  const services = Array.isArray(props.options?.services) && props.options.services.length > 0
    ? props.options.services
    : defaultServices;
  return services.map(normalizeService);
});

/** 兼容装修中保存的旧默认入口，仅修正已知地址，不覆盖其他自定义链接。 */
function normalizeService(service) {
  const legacyRoutes = {
    '/member/favorites': '/home/Favorites',
    '/member/footprint': '/home/MyTracks',
    '/couponCenter': '/coupon'
  };
  const url = legacyRoutes[service.url] || service.url;
  let name = service.name;
  if (name === '红包' && url === '/coupon') name = '领券';
  if (name === '客服' && url === '/article') name = '帮助';
  return { ...service, url, name };
}

const customStyle = computed(() => {
  const s = props.componentStyle || {};
  const hasRowHeight = Boolean(props.rowStyle?.height && Number(props.rowStyle.height) > 0);
  return {
    backgroundColor: (s.backgroundColor && s.backgroundColor !== 'transparent') ? s.backgroundColor : '#ffffff',
    borderRadius: Array.isArray(s.radius) && s.radius.some(r => r > 0)
      ? `${s.radius[0]}px ${s.radius[1]}px ${s.radius[2]}px ${s.radius[3]}px`
      : '8px',
    height: '100%',
    minHeight: hasRowHeight ? '0' : '420px'
  };
});
</script>

<style lang="scss" scoped>
.metrics-retry {
  border: 0;
  background: transparent;
  color: #409eff;
  font-size: 11px;
  cursor: pointer;
}

.decor-user-benefits {
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
  padding: 24px 16px 20px;
  gap: 12px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  overflow: hidden;

  .user-main-info {
    display: flex;
    align-items: center;
    gap: 8px;

    .avatar-box {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      overflow: hidden;
      flex-shrink: 0;

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      .avatar-placeholder {
        width: 100%;
        height: 100%;
        background: #cbd5e1;
        display: flex;
        align-items: center;
        justify-content: center;
      }
    }

    .user-greeting {
      flex: 1;
      min-width: 0;
      display: flex;
      flex-direction: column;
      justify-content: center;

      .badge-tag {
        align-self: flex-start;
        padding: 1px 6px;
        background: #ecf5ff;
        color: #409EFF;
        font-size: 10px;
        font-weight: 700;
        border-radius: 8px;
        line-height: 1.2;
        margin-bottom: 2px;
      }

      .welcome-text {
        font-size: 13px;
        font-weight: 700;
        color: #111827;
        line-height: 1.25;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .sub-text {
        font-size: 11px;
        color: #94a3b8;
        line-height: 1.25;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
    }
  }

  .action-btn-row {
    display: flex;
    gap: 8px;
    margin-top: 8px;

    .action-btn {
      flex: 1;
      height: 32px;
      line-height: 32px;
      font-size: 12px;
      font-weight: 500;
      text-align: center;
      border-radius: 14px;
      cursor: pointer;
      text-decoration: none;
      box-sizing: border-box;
      transition: all 0.15s ease;

      &.login-btn {
        background: #409EFF;
        color: #ffffff;
        box-shadow: 0 2px 6px rgba(64, 158, 255, 0.25);

        &:hover {
          background: #66b1ff;
        }
      }

      &.register-btn {
        background: #ffffff;
        color: #409EFF;
        border: 1px solid #409EFF;

        &:hover {
          background: #ecf5ff;
        }
      }
    }
  }

  .metrics-cards-row {
    display: flex;
    align-items: center;
    justify-content: space-around;
    padding: 12px 0;
    margin-top: 6px;
    background: #f8fafc;
    border-radius: 6px;

    .metric-card {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-decoration: none;
      cursor: pointer;

      .metric-val {
        font-size: 15px;
        font-weight: 700;
        color: #409EFF;
        line-height: 1.2;
      }

      .metric-label {
        font-size: 11px;
        color: #64748b;
        margin-top: 2px;
      }
    }
  }

  .quick-service-row {
    display: flex;
    justify-content: space-around;
    align-items: center;
    padding-top: 14px;
    border-top: 1px dashed #f1f5f9;
    margin-top: 6px;

    .service-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 2px;
      cursor: pointer;
      color: #64748b;
      text-decoration: none;
      transition: color 0.15s ease;

      .service-icon {
        font-size: 20px;
        transition: transform 0.15s ease;
      }

      .service-name {
        font-size: 11px;
      }

      &:hover {
        color: #409EFF;

        .service-icon {
          transform: translateY(-2px);
        }
      }
    }
  }
}
</style>
