<template>
  <div>
    <BaseHeader></BaseHeader>
    <div class="pay-done-box">
      <img src="../../assets/images/pay-success.png">
    </div>
    <div class="pay-btn">
      <Button type="primary" @click="$router.push('/')">继续逛逛</Button>
      <Button type="info" v-if="$route.query.orderType ==='RECHARGE'" @click="$router.push('/home/MoneyManagement')">查看余额</Button>
      <Button type="info" v-else @click="$router.push('/home/myOrder')">查看订单</Button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PayDone'
};
</script>

<style scoped>
.pay-done-box {
  margin: 100px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
.pay-btn{
  width: 300px;
  margin: 0 auto;
}
</style>
