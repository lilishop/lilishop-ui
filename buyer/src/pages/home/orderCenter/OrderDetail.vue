<template>
  <div class="order-detail" v-if="order.order">
    <card _Title="订单详情" :_Size="16"></card>
    <p class="verificationCode" v-if="order.order.verificationCode">核验码：<span>{{order.order.verificationCode}}</span></p>
    <div class="order-card">
      <p class="global_color fontsize_18">{{ order.orderStatusValue }}</p>
      <p>订单号：{{ order.order.sn }}</p>
      <div style="color:#999;" class="operation-time">操作时间：{{order.order.updateTime}}</div>
      <Steps class="progress" :current="progressList.length" direction="vertical">
        <Step
          :title="progress.message"
          :content="progress.createTime"
          v-for="(progress, index) in progressList"
          :key="index"
        ></Step>
      </Steps>
    </div>
    <div class="order-card">
      <h3>收货人信息</h3>
      <p>收货人：{{order.order.consigneeName}}</p>
      <p>手机号码：{{order.order.consigneeMobile | secrecyMobile}}</p>
      <p>收货地址：{{order.order.consigneeAddressPath | unitAddress}} {{order.order.consigneeDetail}}</p>
    </div>
    <div class="order-card">
      <h3>付款信息</h3>
      <p>支付方式：{{order.paymentMethodValue}}</p>
      <p>付款状态：{{order.payStatusValue}}</p>
    </div>
    <div class="order-card" v-if="!order.order.verificationCode">
      <h3>配送信息</h3>
      <p>配送方式：{{order.deliveryMethodValue}}</p>
      <p>配送状态：{{order.deliverStatusValue}}</p>
    </div>
    <div class="order-card" v-if="order.order.receipt">
      <h3>发票信息</h3>
      <p>发票抬头：{{order.order.receiptVO.receiptTitle}}</p>
      <p>发票内容：{{order.order.receiptVO.receiptContent}}</p>
      <p v-if="order.order.receiptVO.taxpayerId">纳税人识别号：{{order.order.receiptVO.taxpayerId}}</p>
    </div>
    <!-- 订单商品 -->
    <div class="goods">
      <div class="shop-name">
        <span @click="shopPage(order.order.storeId)">{{ order.order.storeName }}</span>
      </div>
      <table>
        <thead>
          <tr>
            <th width="50%">商品</th>
            <th width="20%">货号</th>
            <th width="10%">单价</th>
            <th width="10%">数量</th>
            <th width="10%">小计</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(goods, goodsIndex) in order.orderItems" :key="goodsIndex">
            <td>
              <img @click="goodsDetail(goods.id, goods.goodsId)" :src="goods.image" alt="" />
              <div>
                <p @click="goodsDetail(goods.id, goods.goodsId)" class="hover-color">
                  {{ goods.goodsName }}
                </p>
              </div>
            </td>
            <td>{{ goods.id }}</td>
            <td>{{ goods.goodsPrice | unitPrice('￥') }}</td>
            <td>{{ goods.num }}</td>
            <td>{{ (goods.goodsPrice * goods.num) | unitPrice('￥') }}</td>
          </tr>
        </tbody>
      </table>
      <!-- 订单价格 -->
      <div class="order-price">
        <div>
          <span>商品件数：</span><span>{{ order.order.goodsNum }}件</span>
        </div>
        <div>
          <span>商品总价：</span><span>{{ order.order.goodsPrice | unitPrice("￥") }}</span><br>
        </div>
        <div>
          <span>运费：</span><span>+{{ order.order.freightPrice | unitPrice("￥") }}</span><br>
        </div>
        <div v-if="order.order.priceDetailDTO.couponPrice"><span>优惠券：</span><span>-{{ order.order.priceDetailDTO.couponPrice || 0 | unitPrice("￥") }}</span></div>
        <div v-if="order.order.discountPrice"><span>活动优惠：</span><span>-{{ order.order.discountPrice | unitPrice("￥") }}</span></div>
        <div>
          <span>应付金额：</span>
          <span class="actrual-price">{{ order.order.flowPrice | unitPrice("￥") }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import card from '@/components/card';
import { orderDetail, getTraces } from '@/api/order.js';
export default {
  components: { card },
  name: 'order-detail',
  data () {
    return {
      order: {}, // 订单详情数据
      progressList: [], // 订单流程
      logistics: [] // 物流数据
    };
  },
  methods: {
    goodsDetail (skuId, goodsId) {
      // 跳转商品详情
      let routeUrl = this.$router.resolve({
        path: '/goodsDetail',
        query: { skuId, goodsId }
      });
      window.open(routeUrl.href, '_blank');
    },
    // 跳转店铺首页
    shopPage (id) {
      let routeUrl = this.$router.resolve({
        path: '/Merchant',
        query: { id: id }
      });
      window.open(routeUrl.href, '_blank');
    },
    getDetail () { // 获取订单详情
      orderDetail(this.$route.query.sn).then(res => {
        if (res.success) {
          this.order = res.result;
          this.progressList = res.result.orderLogs
        }
      })
    },
    traces () { // 物流信息
      getTraces(this.$route.query.sn).then(res => {
        if (res.success) {
          this.logistics = res.result
        }
      })
    }
  },
  mounted () {
    this.getDetail()
    this.traces()
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
}
/** 店铺名称 */
.shop-name {
  margin: 15px 0;
  span {
    color: #438cde;
    cursor: pointer;
    &:hover {
      color: $theme_color;
    }
  }
  .ivu-icon {
    color: #ff8f23;
    cursor: pointer;
    &:hover {
      color: $theme_color;
    }
  }
}
/** 商品列表 */
table {
  border: 1px solid #ddd;
  color: #999;
  border-collapse: collapse;
  width: 100%;
  tr {
    border-top: 1px solid #ddd;
  }
  thead > tr {
    height: 40px;
    background: #eee;
  }
  td {
    padding: 5px;
    text-align: center;
    &:first-child {
      text-align: left;
      display: flex;
      img {
        width: 70px;
        height: 70px;
        margin-right: 10px;
        margin-left: 10px;
        cursor: pointer;
      }
    }
    &:last-child {
      color: $theme_color;
    }
  }
}
/** 订单价格 */
.order-price {
  text-align: right;
  margin-top: 30px;
  font-size: 16px;
  color: #999;
  > div > span:nth-child(2) {
    width: 130px;
    text-align: right;
    display: inline-block;
    margin-top: 10px;
  }
  .actrual-price {
    color: $theme_color;
    font-weight: bold;
    font-size: 20px;
  }
}
.verificationCode {
  font-size: 20px;
  margin-bottom: 20px;
  color: rgb(65, 63, 63);
  font-weight: bold;
  text-align: center;
  span{
    color: $theme_color;
  }
}
/** 订单进度条 */
.progress {
  margin: 15px 0;
}
</style>
