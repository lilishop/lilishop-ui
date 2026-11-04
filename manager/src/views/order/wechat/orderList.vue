<template>
  <div>
    <el-alert
      title="小程序订单"
      type="info"
      :closable="false"
      show-icon
      class="wechat-order-notice"
      description="仅展示微信小程序下单且使用微信支付的订单。自动上报开关开启且微信侧已开通发货管理时，按现有履约流程上报。"
    />
    <OrderList fixed-client-type="WECHAT_MP" fixed-payment-method="WECHAT" :allow-export="false" />
  </div>
</template>

<script setup>
import OrderList from "../order/orderList.vue";

defineOptions({ name: "wechatOrderList" });
</script>

<style scoped>
.wechat-order-notice {
  margin-bottom: 16px;
}
</style>
