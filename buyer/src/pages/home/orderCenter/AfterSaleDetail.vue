<template>
  <div class="order-detail">
    <card _Title="售后详情" :_Size="16"></card>
    <div class="order-card">
      <h3>{{filterOrderStatus(afterSale.serviceStatus)}}</h3>
      <p class="global_color fontsize_18">{{ afterSale.orderStatusValue }}</p>
      <p>售后单号：{{ afterSale.sn }} &nbsp;&nbsp;&nbsp;订单号：{{afterSale.orderSn}}</p>
      <div style="color:#999;" class="operation-time">创建时间：{{afterSale.createTime}}</div>
      <div class="service-after">
        <div>
          本次售后服务由<span>{{afterSale.storeName}}</span>为您提供
        </div>
        <div>
          <img :src="afterSale.goodsImage" alt="" width="60" height="60">
          <span>{{afterSale.goodsName}}</span>
        </div>
      </div>
    </div>
    <div class="order-card">
      <h3>售后进程</h3>
      <Steps class="progress" :current="logList.length" direction="vertical">
        <Step
          :content="'操作人：'+ log.operatorName + '   ' + log.createTime"
          :title="log.message"
          v-for="(log, index) in logList"
          :key="index"
        ></Step>
      </Steps>
    </div>
    <div class="order-card">
      <h3 class="mb_10">服务单信息</h3>
      <table border="1" cellpadding='0' cellspacing="0">
        <tr>
          <td>退款方式</td><td>{{afterSale.refundWay == 'ORIGINAL' ? '原路退回' : '账号退款'}}{{afterSale.applyRefundPrice | unitPrice('￥')}}</td>
        </tr>
        <tr>
          <td>商品处理方式</td><td>{{afterSale.serviceType == 'RETURN_MONEY' ? '退款' : '退货'}}</td>
        </tr>
        <tr>
          <td>退款原因</td><td>{{afterSale.reason}}</td>
        </tr>
        <tr>
          <td>问题描述</td><td>{{afterSale.problemDesc}}</td>
        </tr>
      </table>
    </div>
    <div class="order-card" v-if="afterSale.afterSaleImage">
      <h3 class="mb_10">图片信息</h3>
      <div v-for="img in afterSale.afterSaleImage.split(',')" :key="img">
        <img :src="img" width="200" height="200" @click="perviewImg(img)" class="hover-pointer" alt="">
      </div>
    </div>
  </div>
</template>
<script>
import { afterSaleDetail, afterSaleReason, afterSaleLog } from '@/api/member.js';
import { afterSaleStatusList } from '../enumeration.js'
export default {
  name: 'aftersale-detail',
  data () {
    return {
      afterSale: {}, // 售后详情数据
      logList: [], // 日志
      afterSaleStatusList // 售后状态列表

    };
  },
  methods: {
    getDetail () { // 售后详情
      afterSaleDetail(this.$route.query.sn).then(res => {
        if (res.success) {
          this.afterSale = res.result;

          afterSaleReason(this.afterSale.serviceType).then(res => {
            res.result.forEach(element => {
              if (element.id === this.afterSale.reason) {
                this.$set(this.afterSale, 'reason', element.reason)
              }
            });
          })
        }
      })
    },
    getLog () { // 获取售后日志
      afterSaleLog(this.$route.query.sn).then(res => {
        this.logList = res.result;
      })
    },
    filterOrderStatus (status) { // 获取订单状态中文
      const ob = this.afterSaleStatusList.filter(e => { return e.status === status });
      return ob[0].name
    },
    perviewImg (img) {
      window.open(img, '_blank')
    }
  },
  mounted () {
    this.getDetail();
    this.getLog()
  }
};
</script>
<style lang="scss" scoped>
.order-card {
  padding: 10px;
  padding-bottom: 10px;
  margin-bottom: 10px;
  border-bottom: 1px solid #e8eaec;
  position: relative;
  .global_color {
    color: $theme_color;
  }
  p {
    color: #999;
    margin: 3px;
  }
  h3 {
    font-weight: normal;
    font-size: 16px;
  }
  .operation-time {
    position: absolute;
    right: 20px;
    top: 10px;
  }
  &:last-child{
    border: none;
  }
}
.service-after {
  border: 1px solid #eee;
  display: flex;
  height: 80px;
  padding: 10px;
  >div:nth-child(1) {
    width: 400px;
    font-size: 15px;
    font-weight: bold;
    text-align: center;
    line-height: 60px;
    span{color: $theme_color;}
    border-right: 1px solid #eee;
  }
  >div:nth-child(2){
    padding-left: 15px;
    img{vertical-align: top;}
    span{color: #999;}
  }
}
/** 售后进度条 */
.progress {
  margin: 15px 0;
}
table{
  border-color: #eee;
  width: 100%;
  color: #999;
  tr{
    td:nth-child(1){
      width: 200px;
    }
  }
  td{
    padding: 5px;
  }
}
</style>
