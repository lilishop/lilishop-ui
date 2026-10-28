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
      <router-link :to="options.loginUrl || '/login'" class="action-btn login-btn">
        {{ options.loginText || '登录' }}
      </router-link>
      <router-link :to="options.registerUrl || '/signUp'" class="action-btn register-btn">
        {{ options.registerText || '注册' }}
      </router-link>
    </div>

    <!-- 3. 指标数据卡 (购物车 / 优惠券 / 订单) -->
    <div class="metrics-cards-row">
      <router-link :to="options.cartUrl || '/cart'" class="metric-card">
        <div class="metric-val">0</div>
        <div class="metric-label">{{ options.cartText || '购物车' }}</div>
      </router-link>
      <router-link :to="options.couponUrl || '/member/coupon'" class="metric-card">
        <div class="metric-val">0</div>
        <div class="metric-label">{{ options.couponText || '优惠券' }}</div>
      </router-link>
      <router-link :to="options.orderUrl || '/member/order'" class="metric-card">
        <div class="metric-val">0</div>
        <div class="metric-label">{{ options.orderText || '订单' }}</div>
      </router-link>
    </div>

    <!-- 4. 分隔线 -->
    <div class="section-divider"></div>

    <!-- 5. 热点快报（万米魔方标准组件底部模块） -->
    <div class="news-section">
      <div class="news-header">
        <div class="news-title-wrap">
          <span class="news-title">热点快报</span>
          <span class="hot-badge">HOT</span>
        </div>
        <router-link to="/article" class="news-more">查看全部 &gt;</router-link>
      </div>
      <div class="news-list">
        <router-link to="/article" class="news-item" title="精选优质好物 官方正品保障">
          <span class="dot">·</span>
          <span class="news-text">精选优质好物 官方正品保障</span>
        </router-link>
        <router-link to="/article" class="news-item" title="双11狂欢 跨店每满300减50">
          <span class="dot">·</span>
          <span class="news-text">双11狂欢 跨店每满300减50</span>
        </router-link>
        <router-link to="/article" class="news-item" title="新人专享好礼 注册立领大礼包">
          <span class="dot">·</span>
          <span class="news-text">新人专享好礼 注册立领大礼包</span>
        </router-link>
      </div>
    </div>

    <!-- 6. 快捷便民服务入口（底部图标排） -->
    <div class="quick-service-row">
      <router-link to="/member/favorites" class="service-item">
        <el-icon class="service-icon"><Star /></el-icon>
        <span class="service-name">收藏</span>
      </router-link>
      <router-link to="/member/footprint" class="service-item">
        <el-icon class="service-icon"><Clock /></el-icon>
        <span class="service-name">足迹</span>
      </router-link>
      <router-link to="/couponCenter" class="service-item">
        <el-icon class="service-icon"><Present /></el-icon>
        <span class="service-name">红包</span>
      </router-link>
      <router-link to="/article" class="service-item">
        <el-icon class="service-icon"><Service /></el-icon>
        <span class="service-name">客服</span>
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { Star, Clock, Present, Service } from '@element-plus/icons-vue';

const props = defineProps({
  options: {
    type: Object,
    default: () => ({})
  },
  componentStyle: {
    type: Object,
    default: () => ({})
  }
});

const customStyle = computed(() => {
  const s = props.componentStyle || {};
  return {
    backgroundColor: s.backgroundColor || '#ffffff',
    borderRadius: Array.isArray(s.radius)
      ? `${s.radius[0]}px ${s.radius[1]}px ${s.radius[2]}px ${s.radius[3]}px`
      : '8px'
  };
});
</script>

<style lang="scss" scoped>
.decor-user-benefits {
  width: 100%;
  height: 100%;
  min-height: 420px;
  box-sizing: border-box;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
  padding: 14px 12px 10px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;

  .user-main-info {
    display: flex;
    align-items: center;
    gap: 8px;

    .avatar-box {
      width: 40px;
      height: 40px;
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
        background: #fff2e8;
        color: #ff6000;
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
    margin-top: 10px;

    .action-btn {
      flex: 1;
      height: 28px;
      line-height: 28px;
      font-size: 12px;
      font-weight: 500;
      text-align: center;
      border-radius: 14px;
      cursor: pointer;
      box-sizing: border-box;
      text-decoration: none;
      transition: all 0.15s ease;

      &.login-btn {
        background: #ff6000;
        color: #ffffff;
        box-shadow: 0 2px 6px rgba(255, 96, 0, 0.25);

        &:hover {
          background: #e55600;
        }
      }

      &.register-btn {
        background: #ffffff;
        color: #ff6000;
        border: 1px solid #ff6000;

        &:hover {
          background: #fff7ed;
        }
      }
    }
  }

  .metrics-cards-row {
    display: flex;
    align-items: center;
    justify-content: space-around;
    padding: 8px 0;
    margin-top: 10px;
    background: #f8fafc;
    border-radius: 6px;

    .metric-card {
      text-align: center;
      flex: 1;
      text-decoration: none;
      cursor: pointer;

      .metric-val {
        font-size: 15px;
        font-weight: 700;
        color: #0f172a;
        line-height: 1.1;
      }

      .metric-label {
        font-size: 11px;
        color: #64748b;
        margin-top: 2px;
      }

      &:hover {
        .metric-val, .metric-label {
          color: #ff6000;
        }
      }
    }
  }

  .section-divider {
    height: 1px;
    background: #f1f5f9;
    margin: 8px 0 6px;
  }

  .news-section {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 0 2px;

    .news-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 6px;

      .news-title-wrap {
        display: flex;
        align-items: center;
        gap: 4px;

        .news-title {
          font-size: 12px;
          font-weight: 700;
          color: #1e293b;
        }

        .hot-badge {
          background: #ef4444;
          color: #ffffff;
          font-size: 9px;
          font-weight: 700;
          padding: 0 3px;
          border-radius: 2px;
          line-height: 1.2;
        }
      }

      .news-more {
        font-size: 11px;
        color: #94a3b8;
        text-decoration: none;
        cursor: pointer;

        &:hover {
          color: #ff6000;
        }
      }
    }

    .news-list {
      display: flex;
      flex-direction: column;
      gap: 5px;

      .news-item {
        display: flex;
        align-items: center;
        gap: 4px;
        font-size: 11px;
        color: #475569;
        text-decoration: none;
        cursor: pointer;
        line-height: 1.3;
        transition: color 0.15s;

        .dot {
          color: #ff6000;
          font-weight: 700;
        }

        .news-text {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        &:hover {
          color: #ff6000;
        }
      }
    }
  }

  .quick-service-row {
    display: flex;
    align-items: center;
    justify-content: space-around;
    padding-top: 8px;
    border-top: 1px dashed #f1f5f9;
    margin-top: 4px;

    .service-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 2px;
      text-decoration: none;
      cursor: pointer;
      color: #64748b;
      transition: color 0.15s;

      .service-icon {
        font-size: 14px;
      }

      .service-name {
        font-size: 10px;
        line-height: 1;
      }

      &:hover {
        color: #ff6000;
      }
    }
  }
}
</style>
