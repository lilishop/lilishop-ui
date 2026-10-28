<template>
  <div class="panel-user-benefits">
    <!-- 用户问候与标语 -->
    <div class="panel-section">
      <div class="section-title">问候信息</div>
      <div class="form-item">
        <span class="item-label">状态标签</span>
        <el-input v-model="options.badgeText" size="small" placeholder="如：请登录" clearable />
      </div>
      <div class="form-item mt-10">
        <span class="item-label">欢迎主标语</span>
        <el-input v-model="options.welcomeText" size="small" placeholder="如：欢迎来到商城" clearable />
      </div>
      <div class="form-item mt-10">
        <span class="item-label">副标语提示</span>
        <el-input v-model="options.subtitle" size="small" placeholder="如：登录后查看专属权益" clearable />
      </div>
      <div class="form-item mt-10">
        <span class="item-label">自定义头像 URL (留空展示默认头像)</span>
        <el-input v-model="options.avatar" size="small" placeholder="请输入头像图片地址" clearable />
      </div>
    </div>

    <!-- 登录与注册按钮 -->
    <div class="panel-section">
      <div class="section-title">按钮配置</div>
      <div class="form-item">
        <span class="item-label">登录按钮文案</span>
        <el-input v-model="options.loginText" size="small" placeholder="登录" />
      </div>
      <div class="form-item mt-10">
        <span class="item-label">登录跳转路径</span>
        <el-input v-model="options.loginUrl" size="small" placeholder="/login" />
      </div>
      <div class="form-item mt-10">
        <span class="item-label">注册按钮文案</span>
        <el-input v-model="options.registerText" size="small" placeholder="注册" />
      </div>
      <div class="form-item mt-10">
        <span class="item-label">注册跳转路径</span>
        <el-input v-model="options.registerUrl" size="small" placeholder="/signUp" />
      </div>
    </div>

    <!-- 3项指标节点 (购物车 / 优惠券 / 订单) -->
    <div class="panel-section">
      <div class="section-title">指标节点展示</div>

      <!-- 购物车 -->
      <div class="metric-config-card">
        <div class="metric-config-head">
          <span class="metric-title">购物车</span>
          <el-switch v-model="options.showCart" size="small" />
        </div>
        <div class="metric-inputs" v-if="options.showCart !== false">
          <div class="sub-field">
            <span class="sub-label">展示文案</span>
            <el-input v-model="options.cartText" size="small" placeholder="购物车" />
          </div>
          <div class="sub-field mt-6">
            <span class="sub-label">跳转路径</span>
            <el-input v-model="options.cartUrl" size="small" placeholder="/cart" />
          </div>
        </div>
      </div>

      <!-- 优惠券 -->
      <div class="metric-config-card mt-10">
        <div class="metric-config-head">
          <span class="metric-title">优惠券</span>
          <el-switch v-model="options.showCoupons" size="small" />
        </div>
        <div class="metric-inputs" v-if="options.showCoupons !== false">
          <div class="sub-field">
            <span class="sub-label">展示文案</span>
            <el-input v-model="options.couponText" size="small" placeholder="优惠券" />
          </div>
          <div class="sub-field mt-6">
            <span class="sub-label">跳转路径</span>
            <el-input v-model="options.couponUrl" size="small" placeholder="/member/coupon" />
          </div>
        </div>
      </div>

      <!-- 订单 -->
      <div class="metric-config-card mt-10">
        <div class="metric-config-head">
          <span class="metric-title">订单</span>
          <el-switch v-model="options.showOrders" size="small" />
        </div>
        <div class="metric-inputs" v-if="options.showOrders !== false">
          <div class="sub-field">
            <span class="sub-label">展示文案</span>
            <el-input v-model="options.orderText" size="small" placeholder="订单" />
          </div>
          <div class="sub-field mt-6">
            <span class="sub-label">跳转路径</span>
            <el-input v-model="options.orderUrl" size="small" placeholder="/member/order" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
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

// 初始化缺省配置
if (props.options.badgeText === undefined) props.options.badgeText = '请登录';
if (props.options.welcomeText === undefined) props.options.welcomeText = '欢迎来到商城';
if (props.options.subtitle === undefined) props.options.subtitle = '登录后查看专属权益';
if (props.options.loginText === undefined) props.options.loginText = '登录';
if (props.options.registerText === undefined) props.options.registerText = '注册';
if (props.options.loginUrl === undefined) props.options.loginUrl = '/login';
if (props.options.registerUrl === undefined) props.options.registerUrl = '/signUp';

if (props.options.showCart === undefined) props.options.showCart = true;
if (props.options.showCoupons === undefined) props.options.showCoupons = true;
if (props.options.showOrders === undefined) props.options.showOrders = true;

if (props.options.cartText === undefined) props.options.cartText = '购物车';
if (props.options.couponText === undefined) props.options.couponText = '优惠券';
if (props.options.orderText === undefined) props.options.orderText = '订单';

if (props.options.cartUrl === undefined) props.options.cartUrl = '/cart';
if (props.options.couponUrl === undefined) props.options.couponUrl = '/member/coupon';
if (props.options.orderUrl === undefined) props.options.orderUrl = '/member/order';
</script>

<style lang="scss" scoped>
.panel-user-benefits {
  .panel-section {
    margin-bottom: 20px;
    padding-bottom: 16px;
    border-bottom: 1px dashed #e2e8f0;

    .section-title {
      font-size: 13px;
      font-weight: 600;
      color: #0f172a;
      margin-bottom: 12px;
    }

    .form-item {
      display: flex;
      flex-direction: column;
      gap: 6px;

      .item-label {
        font-size: 12px;
        color: #475569;
      }
    }

    .metric-config-card {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      padding: 10px 12px;

      .metric-config-head {
        display: flex;
        justify-content: space-between;
        align-items: center;

        .metric-title {
          font-size: 13px;
          font-weight: 600;
          color: #334155;
        }
      }

      .metric-inputs {
        margin-top: 8px;
        padding-top: 8px;
        border-top: 1px dashed #e2e8f0;

        .sub-field {
          display: flex;
          align-items: center;
          gap: 8px;

          .sub-label {
            width: 56px;
            font-size: 12px;
            color: #64748b;
            flex-shrink: 0;
          }
        }
      }
    }
  }

  .mt-6 { margin-top: 6px; }
  .mt-10 { margin-top: 10px; }
}
</style>
