<template>
  <div class="wrapper">
    <BaseHeader></BaseHeader>
    <div class="wrapper-head">
      <div class="head-left">
        <div class="left-tips">订单提交成功，请尽快付款！</div>
        <div class="left-tips-time">请您尽快完成支付，否则订单会被自动取消</div>
        <div class="left-tips-count-down">
          <span class="count-down">{{ countdownText }}</span>
        </div>
      </div>
      <div class="head-right">
        <div>应付金额 <span class="price">{{ $filters.unitPrice(payDetail.price) }}</span>元</div>
      </div>
    </div>
    <div class="wrapper-box">
      <div v-if="support.includes('ALIPAY')" class="-box-item" @click="handlePay('ALIPAY')">
        <img
          src="https://ss3.bdstatic.com/yrwDcj7w0QhBkMak8IuT_XF5ehU5bvGh7c50/logopic/a9936a369e82e0c6c42112674a5220e8_fullsize.jpg"
          alt="">
        <span>支付宝</span>
      </div>
      <div v-if="support.includes('WECHAT')" class="-box-item" @click="handlePay('WECHAT')">
        <img
          src="https://dss1.bdstatic.com/6OF1bjeh1BF3odCf/it/u=3774939867,2826752539&fm=74&app=80&f=JPEG&size=f121,121?sec=1880279984&t=796e842a5ef2d16d9edc872d6f1147ef"
          alt="">
        <span>微信</span>
      </div>
      <div v-if="support.includes('WALLET') && $route.query.orderType !== 'RECHARGE'" class="-box-item" @click="handlePay('WALLET')">
        <i class="icomoon icon-wallet" style="font-size: 60px"></i>
        <span>余额支付</span>
        <span>当前剩余({{ $filters.unitPrice(walletValue, '￥') }})</span>
      </div>
    </div>
    <BaseFooter></BaseFooter>
  </div>
</template>
<script>

import { tradeDetail, pay } from '@/api/pay.js';
import { Message, Modal } from "@/utils/message";

export default {
  data () {
    return {
      payDetail: {},
      support: [],
      walletValue: 0,
      qrcode: '',
      endTime: 0,
      endText: '订单已超时取消',
      isStart: false,
      now: Date.now(),
      countdownTimer: null,
    };
  },
  computed: {
    countdownText () {
      if (!this.isStart || !this.endTime) return '';
      const diff = this.endTime - this.now;
      if (diff <= 0) return this.endText;
      const days = Math.floor(diff / 86400000);
      const hours = Math.floor((diff % 86400000) / 3600000);
      const minutes = Math.floor((diff % 3600000) / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);
      return `${days}天${hours}小时${minutes}分钟${seconds}秒`;
    },
  },
  methods: {
    // 获取订单详情
    getTradeDetail () {
      const params = this.$route.query;
      params.clientType = 'PC'
      tradeDetail(params).then(res => {
        if (res.success) {
          this.payDetail = res.result;
          this.endTime = this.payDetail.autoCancel
          this.isStart = true
          this.support = this.payDetail.support
          this.walletValue = this.payDetail.walletValue
          const price = Number(this.payDetail.price);
          if (!Number.isNaN(price) && price <= 0) {
            this.$router.replace('/payDone');
          }
        }
      }).catch((err) => {
        this.$router.push({name: 'MyOrder'});
      });
    },
    // 支付
    handlePay (way) {
      // 余额支付则直接跳转
      if (way === 'WALLET') {
        // 如果待支付金额大于余额，则报错
        if (this.payDetail.price > this.walletValue) {
          Message.error('余额不足以支付当前订单，如需充值请前往会员中心');
          return;
        }
      }
      const params = this.$route.query;
      params.paymentMethod = way;
      params.paymentClient = 'NATIVE';
      params.price = this.payDetail.price;
      if (way === 'WALLET') {
        Modal.confirm({
          title: '支付确认',
          content: '确认使用余额支付吗？',
          onOk: () => {
            return pay(params)
              .then((res) => {
                if (res.success) {
                  Message.success(res.message || '支付成功');
                  this.$router.push('/payDone');
                } else {
                  Message.warning(res.message || '支付失败');
                }
              })
              .catch((err) => {
                // 支付失败兜底：业务错误（如 CARD_KEY_STORE_SELL_FORBIDDEN）通常已由 axios 拦截器提示
                if (err?.message && !err?.data?.message) {
                  Message.error(err.message);
                }
              });
          }
        });
      } else {
        this.$router.push({path: '/qrpay', query: params});
      }
    }
  },
  mounted () {
    this.getTradeDetail();
    this.countdownTimer = setInterval(() => {
      this.now = Date.now();
    }, 1000);
  },
  beforeUnmount () {
    if (this.countdownTimer) clearInterval(this.countdownTimer);
  },
};
</script>
<style scoped lang="scss">
.head-left {
  font-weight: bold;
}

.left-tips {
  font-size: 21px;

}
.-box-item {
  display: flex;
  font-size: 18px;
  font-weight: bold;
  align-items: center;
  margin: 20px 20px;
  cursor: pointer;
  @include content_color($light_content_color);

  &:hover {
    color: $theme_color;
  }

  > span {
    margin-left: 15px;
  }

  > img {
    border-radius: 10px;
    width: 60px;
    height: 60px;
  }
}

.left-tips-time {
  font-size: 16px;
}

.left-tips-count-down {
  font-size: 10px;
  color: red;
}

.wrapper-head {
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
}

.wrapper {
  width: 100%;
  height: 100%;
}

.price {
  font-size: 18px;
  font-weight: bold;
  color: $theme_color;
}

.head-right {
  font-weight: bold;
  font-size: 18px;
}
.count-down{
  font-size: 16px!important;
}
</style>
