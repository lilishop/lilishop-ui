<template>
  <div class="wrapper">
    <BaseHeader></BaseHeader>
    <div class="wrapper-head">
      <div class="head-left">
        <div class="left-tips">订单提交成功，请尽快付款！</div>
        <div class="left-tips-time">请您尽快完成支付，否则订单会被自动取消</div>
      </div>
      <div class="head-right">
        <div>应付金额 <span class="price">{{ $filters.unitPrice($route.query.price) }}</span>元</div>
      </div>
    </div>
    <div class="content">
      <div class="pay-way">{{ payWayName }}支付</div>
      <div class="qrcode">
        <div class="qrcode-box">
          <div v-if="payLoading" class="qrcode-status">正在生成支付二维码...</div>
          <div v-else-if="payError" class="qrcode-status qrcode-status--error">
            <p>{{ payError }}</p>
            <p class="qrcode-status-tip">您可点击「重新支付」重试，或返回选择其他支付方式</p>
          </div>
          <vue-qr
            v-else
            :text="qrcode"
            :margin="0"
            colorDark="#000"
            colorLight="#fff"
            :size="200"
          />
        </div>
        <div v-if="!payError" class="intro">
          <el-icon><Iphone /></el-icon> 请使用{{ payWayName }}扫码付款
        </div>
      </div>
      <div class="btn-div">
        <p class="mb_10">支付成功后自动跳转，如未跳转请点击按钮手动跳转。。。</p>
        <div>
          <el-button :loading="payLoading" @click="handlePay">重新支付</el-button>
          <el-button type="success" @click="$router.push('/payDone')">支付成功</el-button>
        </div>
      </div>
      <a @click="$router.back()">选择其他支付方式></a>
    </div>
    <BaseFooter></BaseFooter>
  </div>
</template>
<script>
import { Message } from "@/utils/message";
import { Iphone } from '@element-plus/icons-vue';
import vueQr from 'vue-qr';
import { payCallback, pay } from '@/api/pay.js';
export default {
  components: { vueQr, Iphone },
  data () {
    return {
      qrcode: '',
      params: this.$route.query,
      interval: null,
      num: 0,
      payLoading: false,
      payError: '',
    };
  },
  computed: {
    payWayName () {
      return this.params.paymentMethod === 'ALIPAY' ? '支付宝' : '微信';
    },
  },
  methods: {
    formatPayError (rawMessage) {
      const message = (rawMessage || '').trim();
      if (!message || message === '支付业务异常，请稍后重试') {
        return `${this.payWayName}支付暂不可用，请稍后重试或选择其他支付方式`;
      }
      return message;
    },
    clearPayPoll () {
      if (this.interval) {
        clearInterval(this.interval);
        this.interval = null;
      }
    },
    handlePay () {
      this.clearPayPoll();
      const params = this.$route.query;
      this.payLoading = true;
      this.payError = '';
      this.qrcode = '';
      pay(params, { skipMessage: true })
        .then((res) => {
          this.payLoading = false;
          if (res.success && res.result) {
            this.qrcode = res.result;
            this.num = 0;
            this.interval = setInterval(this.callback, 5000);
            return;
          }
          this.payError = this.formatPayError(res.message);
          Message.error(this.payError);
        })
        .catch((err) => {
          this.payLoading = false;
          this.payError = this.formatPayError(err?.message || err?.data?.message);
          Message.error(this.payError);
        });
    },
    callback () {
      this.num++;
      if (this.num >= 7) {
        this.clearPayPoll();
      }
      const params = JSON.parse(JSON.stringify(this.$route.query));
      delete params.paymentMethod;
      delete params.paymentClient;
      payCallback(params).then((res) => {
        if (res.result) {
          this.clearPayPoll();
          this.$router.push({ path: '/payDone', query: { orderType: this.$route.query.orderType } });
        }
      });
    },
  },
  mounted () {
    this.handlePay();
  },
  beforeUnmount () {
    this.clearPayPoll();
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

.left-tips-time {
  font-size: 16px;
}
.wrapper-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  line-height: 1.75;
}
.wrapper-head,
.content {
  padding: 20px 40px;
  width: 1000px;
  margin: 20px auto;
}
.wrapper {
  width: 100%;
  height: 100%;
}
.content {
  background-color: #fff;
  box-shadow: 0 6px 10px #ddd;
  position: relative;
  display: flex;
  .pay-way {
    font-weight: bold;
    font-size: 18px;
  }

  .qrcode {
    margin: 30px 0 0 70px;
  }

  .qrcode-box {
    width: 200px;
    height: 200px;
    border: 1px solid #eee;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .qrcode-status {
    padding: 16px;
    text-align: center;
    color: #666;
    font-size: 14px;
    line-height: 1.6;
  }

  .qrcode-status--error {
    color: #f56c6c;
  }

  .qrcode-status-tip {
    margin-top: 8px;
    color: #909399;
    font-size: 14px;
  }

  .intro {
    background-color: #ff7674;
    height: 40px;
    line-height: 40px;
    margin-top: 10px;
    color: #fff;
    font-size: 16px;
    text-align: center;
  }

  .btn-div {
    margin:120px 0 0 30px;
  }

  a {
    position: absolute;
    right: 20px;
    top: 20px;
    cursor: pointer;
    color: #409eff;
    text-decoration: none;
  }
}
.price {
  font-size: 18px;
  font-weight: bold;
  color: $theme_color;
}
.head-right {
  font-weight: bold;
}
.mb_10 {
  margin-bottom: 10px;
}
</style>
