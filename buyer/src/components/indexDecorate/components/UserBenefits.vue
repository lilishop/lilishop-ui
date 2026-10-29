<template>
  <div class="decor-user-benefits" :style="customStyle">
    <!-- 1. 用户头像与信息区 -->
    <div class="user-main-info">
      <div class="avatar-box">
        <img v-if="options.avatar" :src="options.avatar" alt="avatar" />
        <div v-else class="avatar-placeholder">
          <svg viewBox="0 0 24 24" width="22" height="22" fill="#ffffff">
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
          </svg>
        </div>
      </div>

      <div class="user-greeting">
        <div class="badge-tag">{{ options.badgeText || '请登录' }}</div>
        <div class="welcome-text" :title="options.welcomeText || '欢迎来到商城'">
          {{ options.welcomeText || '欢迎来到商城' }}
        </div>
        <div class="sub-text" :title="options.subtitle || '登录后查看专属权益'">
          {{ options.subtitle || '登录后查看专属权益' }}
        </div>
      </div>
    </div>

    <!-- 2. 登录 / 注册按钮组 -->
    <div class="action-btn-row">
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
        <div class="metric-val">0</div>
        <div class="metric-label">{{ options.cartText || '购物车' }}</div>
      </a>
      <a href="javascript:;" class="metric-card" v-if="options.showCoupons !== false" @click="handleNavigate(options.couponUrl || '/member/coupon')">
        <div class="metric-val">0</div>
        <div class="metric-label">{{ options.couponText || '优惠券' }}</div>
      </a>
      <a href="javascript:;" class="metric-card" v-if="options.showOrders !== false" @click="handleNavigate(options.orderUrl || '/member/order')">
        <div class="metric-val">0</div>
        <div class="metric-label">{{ options.orderText || '订单' }}</div>
      </a>
    </div>

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
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { Star, Clock, Present, Service } from '@element-plus/icons-vue';

const router = useRouter();

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

function handleNavigate(url) {
  if (!url) return;
  if (/^https?:\/\//i.test(url)) {
    window.open(url, '_blank');
  } else {
    router.push(url);
  }
}

const defaultServices = [
  { name: '收藏', url: '/member/favorites', icon: 'Star' },
  { name: '足迹', url: '/member/footprint', icon: 'Clock' },
  { name: '红包', url: '/couponCenter', icon: 'Present' },
  { name: '客服', url: '/article', icon: 'Service' }
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
  if (Array.isArray(props.options?.services) && props.options.services.length > 0) {
    return props.options.services;
  }
  return defaultServices;
});

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
