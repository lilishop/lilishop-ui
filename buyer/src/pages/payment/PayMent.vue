<template>
  <div class="wrapper">
    <BaseHeader></BaseHeader>
    <div class="wrapper-head">
      <div class="head-left">
        <div class="left-tips">订单提交成功，请尽快付款！</div>
        <div class="left-tips-time">请您尽快完成支付，否则订单会被自动取消</div>
      </div>
      <div class="head-right">
        <div>应付金额 <span class="price">{{payDetail.price | unitPrice}}</span>元</div>
      </div>
    </div>
    <div class="wrapper-box">
      <div class="-box-item" @click="handlePay('ALIPAY')">
        <img src="https://ss3.bdstatic.com/yrwDcj7w0QhBkMak8IuT_XF5ehU5bvGh7c50/logopic/a9936a369e82e0c6c42112674a5220e8_fullsize.jpg" alt="">
        <span>支付宝</span>
      </div>
      <div  class="-box-item" @click="handlePay('WECHAT')">
        <img src="https://dss1.bdstatic.com/6OF1bjeh1BF3odCf/it/u=3774939867,2826752539&fm=74&app=80&f=JPEG&size=f121,121?sec=1880279984&t=796e842a5ef2d16d9edc872d6f1147ef" alt="">
        <span>微信</span>
      </div>
    </div>
    <BaseFooter></BaseFooter>
  </div>
</template>
<script>
import { tradeDetail } from '@/api/pay.js';
export default {
  data () {
    return {
      payDetail: {}, // 支付详情
      qrcode: '' // 支付二维码
    };
  },
  methods: {
    getTradeDetail () {
      const params = this.$route.query;
      params.clientType = 'PC'
      tradeDetail(params).then(res => {
        if (res.success) {
          this.payDetail = res.result;
        }
      });
    },
    handlePay (way) {
      const params = this.$route.query;
      params.paymentMethod = way;
      params.paymentClient = 'NATIVE';
      params.price = this.payDetail.price;
      this.$router.push({path: '/qrpay', query: params});
    }
  },
  mounted () {
    this.getTradeDetail();
  }
};
</script>
<style scoped lang="scss">
.head-left{
    font-weight: bold;
}
.left-tips{
    font-size: 21px;

}
.-box-item{
    margin-right: 30px;
    display: flex;
    font-size: 21px;
    font-weight: bold;
    align-items: center;
    margin: 20px 20px;
    cursor: pointer;
    @include content_color($light_content_color);

    &:hover{color: $theme_color;}

    >span{
        margin-left: 10px;
    }
    >img{
        border-radius: 10px;
        width: 60px;
        height: 60px;
    }
}
.left-tips-time{
    font-size: 16px;
}
.wrapper-head{
    display: flex;
    align-items: center;
    justify-content: space-between;
   line-height: 1.75;
}
.wrapper-head,
.wrapper-box {
  padding: 20px 40px;
  width: 1200px;
  margin: 20px auto;
}
.wrapper-box {
  @include white_background_color();
  height: auto;
  display: flex;
}
.wrapper {
  width: 100%;
  height: 100%;
}
.price{
    font-size: 18px;
    font-weight: bold;
    color: $theme_color;
}
.head-right{
    font-weight: bold;
}
</style>
