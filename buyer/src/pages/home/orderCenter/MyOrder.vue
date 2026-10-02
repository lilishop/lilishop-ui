<template>
  <div class="wrapper">
    <card _Title="我的订单" :_Size="16" :_Tabs="changeWay" @_Change="change" _More="全部订单" _Src="/home/MyOrder" v-if="homePage"></card>

    <UserCenterLayout
      v-if="!homePage"
      :tabs="changeWay"
      :active-tab="activeOrderTab"
      @tab-change="change"
    >
      <template #extra>
        <div class="order-search">
          <el-input
            v-model="params.keywords"
            size="large"
            @keyup.enter="getList"
            placeholder="输入订单号搜索"
          />
          <el-button type="primary" @click="getList">搜索</el-button>
        </div>
      </template>

      <!-- 订单列表 -->
      <empty v-if="orderList.length === 0" />
      <div class="order-content" v-else>
        <div class="order-cols">
          <span>订单详情</span>
          <span>金额</span>
          <span>操作</span>
        </div>
        <div
          class="order-list"
          v-for="(order, onderIndex) in orderList"
          :key="onderIndex"
        >
          <div class="order-header">
            <div class="order-sn" v-if="order.isAfterSale">
              {{ order.createTime }}<span>售后单号 {{ order.serviceSn }}</span><span class="order-store" @click="shopPage(order.storeId)">{{ order.storeName }}</span>
            </div>
            <div class="order-sn" v-else>
              {{ order.createTime }}<span>订单号 {{ order.sn }}</span><span class="order-store" @click="shopPage(order.storeId)">{{ order.storeName }}</span>
            </div>
            <div class="order-status">{{ order.isAfterSale ? filterAfterSaleStatus(order.serviceStatus) : filterOrderStatus(order.orderStatus) }}</div>
          </div>
          <div class="order-body">
            <div class="col-detail">
              <div
                v-for="(goods, goodsIndex) in order.orderItems"
                :key="goodsIndex"
                class="goods-item"
              >
                <div class="goods-thumb">
                  <img
                    @click="goodsDetail(goods.skuId, goods.goodsId)"
                    class="hover-color"
                    :src="goods.image"
                    alt=""
                    @error="$event.target.style.visibility = 'hidden'"
                  />
                </div>
                <div class="goods-info">
                  <div class="goods-name hover-color" @click="goodsDetail(goods.skuId, goods.goodsId)">{{ goods.name }}</div>
                  <div class="goods-num">共{{ goods.num }}件</div>
                  <div class="goods-extra">
                    <span v-if="refundPriceList(goods.isRefund)" class="refund-tag">{{ refundPriceList(goods.isRefund) }}</span>
                    <button v-if="goods.complainStatus == 'NO_APPLY'" type="button" class="sub-btn" @click="complain(order.sn, goodsIndex)">投诉</button>
                  </div>
                </div>
              </div>
              <button v-if="canAfterSale(order)" type="button" class="sub-btn" @click="applyAfterSale(order.orderItems)">申请售后</button>
            </div>
            <div class="col-amount">
              <div class="order-amount">{{ $filters.unitPrice(order.flowPrice, "￥") }}</div>
              <div v-if="paymentLabel(order)" class="pay-method">{{ paymentLabel(order) }}</div>
            </div>
            <div class="col-ops">
              <template v-if="order.isAfterSale">
                <button type="button" class="text-link" @click="goAfterSaleDetail(order.serviceSn)">售后详情</button>
              </template>
              <template v-else>
                <button v-if="order.allowOperationVO && order.allowOperationVO.pay" type="button" class="op-btn" @click="goPay(order.sn)">去支付</button>
                <button v-if="order.allowOperationVO && order.allowOperationVO.rog" type="button" class="op-btn" @click="received(order.sn)">确认收货</button>
                <button type="button" class="text-link" @click="orderDetail(order.sn)">订单详情</button>
                <button v-if="order.allowOperationVO && order.allowOperationVO.cancel" type="button" class="text-link" @click="handleCancelOrder(order.sn)">取消订单</button>
                <button v-if="order.orderStatus === 'COMPLETED'" type="button" class="text-link" @click="delOrder(order.sn)">删除订单</button>
              </template>
            </div>
          </div>
        </div>
        <el-skeleton size="large" fix v-if="spinShow"></el-skeleton>
      </div>

      <!-- 分页 -->
      <div class="page-size">
        <el-pagination v-model:current-page="params.pageNumber" v-model:page-size="params.pageSize"
          :total="total" :page-sizes="[20, 50, 100]" @current-change="changePageNum"
          @size-change="changePageSize" layout="total, sizes, prev, pager, next, jumper"></el-pagination>
      </div>
    </UserCenterLayout>

    <!-- 个人中心首页订单列表 -->
    <empty v-if="homePage && orderList.length === 0" />
    <div class="order-content" v-else-if="homePage">
      <div class="order-cols">
        <span>订单详情</span>
        <span>金额</span>
        <span>操作</span>
      </div>
      <div
        class="order-list"
        v-for="(order, onderIndex) in orderList"
        :key="onderIndex"
      >
        <div class="order-header">
          <div class="order-sn" v-if="order.isAfterSale">
            {{ order.createTime }}<span>售后单号 {{ order.serviceSn }}</span><span class="order-store" @click="shopPage(order.storeId)">{{ order.storeName }}</span>
          </div>
          <div class="order-sn" v-else>
            {{ order.createTime }}<span>订单号 {{ order.sn }}</span><span class="order-store" @click="shopPage(order.storeId)">{{ order.storeName }}</span>
          </div>
          <div class="order-status">{{ order.isAfterSale ? filterAfterSaleStatus(order.serviceStatus) : filterOrderStatus(order.orderStatus) }}</div>
        </div>
        <div class="order-body">
          <div class="col-detail">
            <div
              v-for="(goods, goodsIndex) in order.orderItems"
              :key="goodsIndex"
              class="goods-item"
            >
              <div class="goods-thumb">
                <img
                  @click="goodsDetail(goods.skuId, goods.goodsId)"
                  class="hover-color"
                  :src="goods.image"
                  alt=""
                  @error="$event.target.style.visibility = 'hidden'"
                />
              </div>
              <div class="goods-info">
                <div class="goods-name hover-color" @click="goodsDetail(goods.skuId, goods.goodsId)">{{ goods.name }}</div>
                <div class="goods-num">共{{ goods.num }}件</div>
                <div class="goods-extra">
                  <span v-if="refundPriceList(goods.isRefund)" class="refund-tag">{{ refundPriceList(goods.isRefund) }}</span>
                  <button v-if="goods.complainStatus == 'NO_APPLY'" type="button" class="sub-btn" @click="complain(order.sn, goodsIndex)">投诉</button>
                </div>
              </div>
            </div>
            <button v-if="canAfterSale(order)" type="button" class="sub-btn" @click="applyAfterSale(order.orderItems)">申请售后</button>
          </div>
          <div class="col-amount">
            <div class="order-amount">{{ $filters.unitPrice(order.flowPrice, "￥") }}</div>
            <div v-if="paymentLabel(order)" class="pay-method">{{ paymentLabel(order) }}</div>
          </div>
          <div class="col-ops">
            <template v-if="order.isAfterSale">
              <button type="button" class="text-link" @click="goAfterSaleDetail(order.serviceSn)">售后详情</button>
            </template>
            <template v-else>
              <button v-if="order.allowOperationVO && order.allowOperationVO.pay" type="button" class="op-btn" @click="goPay(order.sn)">去支付</button>
              <button v-if="order.allowOperationVO && order.allowOperationVO.rog" type="button" class="op-btn" @click="received(order.sn)">确认收货</button>
              <button type="button" class="text-link" @click="orderDetail(order.sn)">订单详情</button>
              <button v-if="order.allowOperationVO && order.allowOperationVO.cancel" type="button" class="text-link" @click="handleCancelOrder(order.sn)">取消订单</button>
              <button v-if="order.orderStatus === 'COMPLETED'" type="button" class="text-link" @click="delOrder(order.sn)">删除订单</button>
            </template>
          </div>
        </div>
      </div>
      <el-skeleton size="large" fix v-if="spinShow"></el-skeleton>
    </div>
    <!-- 选择售后商品 -->
    <el-dialog v-model="afterSaleModal" title="请选择申请售后的商品">
      <div>
        <el-table :data="afterSaleArr" border @row-click="afterSaleSelect">
          <el-table-column prop="name" label="商品名称" />
          <el-table-column prop="goodsPrice" label="价格" />
        </el-table>
      </div>
      <template #footer><div></div></template>
    </el-dialog>
    <el-dialog v-model="cancelAvail" title="请选择取消订单原因">
      <el-radio-group v-model="cancelParams.reason">
        <el-radio :label="item.reason" v-for="item in cancelReason" :key="item.id">
          {{ item.reason }}
        </el-radio>
      </el-radio-group>
      <template #footer>
        <div style="text-align: right">
          <el-button @click="cancelAvail = false">取消</el-button>
          <el-button type="primary" @click="sureCancel">确定</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { Message, Modal } from "@/utils/message";
import { getOrderList, sureReceived, cancelOrder, delOrder } from '@/api/order';
import { afterSaleReason } from '@/api/member';
import { orderStatusList, afterSaleStatusList } from '../enumeration.js'
export default {
  name: 'MyOrder',
  props: {
    homePage: { // 判断是否个人中心首页展示内容
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      orderList: [], // 订单列表
      params: { // 请求参数
        pageNumber: 1,
        pageSize: 20,
        // orderStatus: 'ALL',
        keywords: '',
        tag: 'ALL'
      },
      cancelParams: { // 取消售后参数
        orderSn: '',
        reason: ''
      },
      // 状态数组
      orderStatusList,
      afterSaleStatusList,
      changeWay: ['全部', '待付款', '待发货', '待收货/使用'],
      activeOrderTab: 0,
      total: 0, // 数据总数
      spinShow: false, // 加载状态
      afterSaleModal: false, // 选择售后商品模态框
      afterSaleArr: [], // 售后商品列表
      cancelAvail: false, // 取消订单modal控制
      cancelReason: [] // 取消订单原因
    };
  },
  mounted () {
    if (this.homePage) this.params.pageSize = 5;
    if (!this.homePage) this.applyRouteTag();
    this.getList();
  },
  watch: {
    '$route.query.tag' () {
      if (this.homePage || this.$route.name !== 'MyOrder') return;
      const next = this.$route.query.tag || 'ALL';
      if (this.params.tag === next) return;
      this.applyRouteTag();
      this.getList();
    }
  },
  methods: {
    // 退款状态枚举
    refundPriceList(status) {
      switch (status) {
        case 'ALL_REFUND':
          return "全部退款";
        case 'PART_REFUND':
          return "部分退款";
        case 'NO_REFUND':
          return "";
        case 'REFUNDING':
          return "退款中";
        default:
          return "";
      }
    },
    goodsDetail (skuId, goodsId) {
      // 跳转商品详情
      let routeUrl = this.$router.resolve({
        path: '/goodsDetail',
        query: { skuId, goodsId }
      });
      window.open(routeUrl.href, '_blank');
    },
    orderTags () {
      return ['ALL', 'WAIT_PAY', 'WAIT_SHIP', 'WAIT_USE'];
    },
    applyRouteTag () {
      const tags = this.orderTags();
      const tag = this.$route.query.tag;
      const index = tags.indexOf(tag);
      this.activeOrderTab = index > -1 ? index : 0;
      this.params.tag = tags[this.activeOrderTab];
      this.params.pageNumber = 1;
    },
    // 切换订单状态
    change (index) {
      this.activeOrderTab = index;
      this.params.pageNumber = 1;
      delete this.params.commentStatus;
      const tags = this.orderTags();
      this.params.tag = tags[index] || 'ALL';
      const query = { ...this.$route.query };
      if (index === 0) delete query.tag;
      else query.tag = this.params.tag;
      const current = this.$route.query.tag || 'ALL';
      if (current !== this.params.tag) {
        this.$router.replace({ name: 'MyOrder', query });
      }
      this.getList()
    },
    // 跳转店铺首页
    shopPage (id) {
      this.$router.push({
        path: '/merchant',
        query: { id: id }
      });
    },
    orderDetail (sn) {
      this.$router.push({ name: 'OrderDetail', query: {sn} });
    },
    goAfterSaleDetail (sn) {
      this.$router.push({ name: 'AfterSaleDetail', query: { sn } });
    },
    received (sn) { // 确认收货
      sureReceived(sn).then(res => {
        if (res.success) {
          Message.success('确认收货成功')
          this.getList()
        }
      })
    },
    goPay (sn) { // 去支付
      this.$router.push({path: '/payment', query: {orderType: 'ORDER', sn}});
    },
    applyAfterSale (goodsItem) { // 申请售后
      let arr = []
      goodsItem.forEach(e => {
        if (e.afterSaleStatus === 'NOT_APPLIED'|| e.afterSaleStatus === 'PART_AFTER_SALE') {
          arr.push(e)
        }
      });
      if (arr.length === 1) {
        this.$router.push({name: 'ApplyAfterSale', query: {sn: arr[0].sn}})
      } else {
        this.afterSaleArr = arr;
        this.afterSaleModal = true
      }
    },
    // 申请售后
    afterSaleSelect (item) {
      this.$router.push({name: 'ApplyAfterSale', query: {sn: item.sn}})
    },
    complain (sn, goodsIndex) { // 投诉
      this.$router.push({name: 'Complain', query: {sn, index: goodsIndex}})
    },
    delOrder (sn) { // 删除订单
      Modal.confirm({
        title: '删除订单',
        content: '<p>确认删除当前订单吗？</p>',
        onOk: () => {
          delOrder(sn).then(res => {
            if (res.success) {
              Message.success('删除成功');
              this.getList()
            }
          })
        },
        onCancel: () => {}
      });
    },
    getList () {
      this.spinShow = true;
      let params = JSON.parse(JSON.stringify(this.params))
      if (params.orderStatus === 'ALL') {
        delete params.orderStatus
      }
      getOrderList(params).then(res => {
        this.spinShow = false
        if (res.success) {
          this.orderList = res.result.records;
          this.total = res.result.total;
        }
      });
    },
    mapAfterSaleOrder (item) {
      return {
        ...item,
        isAfterSale: true,
        serviceSn: item.sn,
        sn: item.orderSn,
        orderStatus: item.serviceStatus,
        flowPrice: item.applyRefundPrice,
        orderItems: [
          {
            image: item.goodsImage,
            name: item.goodsName,
            skuId: item.skuId,
            goodsId: item.goodsId,
            goodsPrice: item.flowPrice,
            num: item.num,
          },
        ],
        allowOperationVO: {},
      }
    },
    changePageNum (val) { // 修改页码
      this.params.pageNumber = val;
      this.getList()
    },
    changePageSize (val) { // 修改页数
      this.params.pageNumber = 1;
      this.params.pageSize = val;
      this.getList()
    },
    handleCancelOrder (sn) {
      // 取消订单
      this.cancelParams.orderSn = sn;
      afterSaleReason('CANCEL').then(res => {
        if (res.success) {
          this.cancelReason = res.result;
          this.cancelAvail = true
          this.cancelParams.reason = this.cancelReason[0].reason
        }
      })
    },
    sureCancel () { // 确定取消
      cancelOrder(this.cancelParams).then(res => {
        if (res.success) {
          Message.success('取消订单成功')
          this.getList()
          this.cancelAvail = false
        }
      })
    },
    filterOrderStatus (status) { // 获取订单状态中文
      const ob = this.orderStatusList.filter(e => { return e.status === status });
      return ob && ob[0] ? ob[0].name : status
    },
    filterAfterSaleStatus (status) {
      const ob = this.afterSaleStatusList.filter(e => e.status === status);
      return ob && ob[0] ? ob[0].name : status
    },
    canAfterSale (order) {
      if (order.isAfterSale || order.orderType === 'E_COUPON' || !order.groupAfterSaleStatus) {
        return false
      }
      return order.groupAfterSaleStatus.includes('NOT_APPLIED') || order.groupAfterSaleStatus.includes('PART_AFTER_SALE')
    },
    paymentLabel (order) {
      const map = {
        WECHAT: '微信支付',
        ALIPAY: '支付宝',
        WALLET: '余额支付',
        BANK_TRANSFER: '线下转账'
      }
      if (order.paymentMethod && map[order.paymentMethod]) {
        return map[order.paymentMethod]
      }
      if (order.payStatus === 'UNPAID' || order.orderStatus === 'UNPAID') {
        return '待支付'
      }
      return ''
    }
  }
};
</script>

<style scoped lang="scss">
.wrapper {
  margin-bottom: 40px;
}
.order-search {
  display: flex;
  align-items: center;
  width: 330px;

  :deep(.el-input) {
    flex: 1;
  }

  :deep(.el-button) {
    margin-left: 8px;
  }
}
.order-content {
  --order-cols: minmax(0, 1fr) 120px 120px;
  --order-gap: 12px;
  padding-top: 14px;
}
.page-size {
  margin: 15px 0;
  display: flex;
  justify-content: flex-end;

  :deep(.el-pagination) {
    justify-content: flex-end;
  }
}
/** 订单列表 */
.order-cols {
  display: grid;
  grid-template-columns: var(--order-cols);
  column-gap: var(--order-gap);
  align-items: center;
  padding: 0 16px 10px;
  color: #999;
  font-size: 13px;

  span:first-child {
    padding-left: 72px;
  }

  span:nth-child(n + 2) {
    text-align: center;
  }
}
.order-list {
  border: 1px solid #eee;
  border-radius: 8px;
  margin-bottom: 12px;
  background: #fff;
  overflow: hidden;

  .order-header {
    display: grid;
    grid-template-columns: var(--order-cols);
    column-gap: var(--order-gap);
    align-items: center;
    padding: 10px 16px;
    background: #f7f7f7;
    border-bottom: 1px solid #f0f0f0;
  }

  .order-sn {
    grid-column: 1 / 3;
    display: flex;
    align-items: center;
    min-width: 0;
    font-size: 14px;
    color: #171A26;
    line-height: 1.5;

    span {
      margin-left: 16px;
    }
  }

  .order-store {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: #438cde;
    cursor: pointer;

    &:hover {
      color: $theme_color;
    }
  }

  .order-status {
    grid-column: 3;
    min-width: 0;
    text-align: center;
    font-size: 14px;
    color: #666;
    line-height: 1.4;
  }

  .order-body {
    display: grid;
    grid-template-columns: var(--order-cols);
    column-gap: var(--order-gap);
    align-items: center;
    padding: 14px 16px;
  }

  .goods-item {
    display: grid;
    grid-template-columns: 60px minmax(0, 1fr);
    column-gap: 12px;
    align-items: start;
    width: 100%;
    min-width: 0;

    & + .goods-item {
      margin-top: 12px;
      padding-top: 12px;
      border-top: 1px solid #f5f5f5;
    }
  }

  .goods-thumb {
    width: 60px;
    height: 60px;
    border: 1px solid #f0f0f0;
    overflow: hidden;
    background: #f5f5f5;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }
  }

  .goods-info {
    min-width: 0;
    overflow: hidden;
  }

  .goods-name {
    max-width: 100%;
    color: #333;
    font-size: 16px;
    line-height: 22px;
    max-height: 44px;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    overflow: hidden;
    word-break: break-all;
  }

  .goods-num {
    margin-top: 6px;
    color: #999;
    font-size: 14px;
    line-height: 1.4;
  }

  .goods-extra {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 6px;
  }

  .refund-tag {
    padding: 0 6px;
    border-radius: 4px;
    background: #fff7e8;
    color: #ff9900;
    font-size: 14px;
    line-height: 22px;
  }

  .sub-btn {
    height: 28px;
    margin-top: 8px;
    padding: 0 10px;
    border: 1px solid #ddd;
    border-radius: 4px;
    background: #fff;
    color: #666;
    font-size: 14px;
    line-height: 26px;
    cursor: pointer;

    &:hover {
      border-color: $theme_color;
      color: $theme_color;
    }
  }

  .goods-extra .sub-btn {
    margin-top: 0;
  }

  .col-amount,
  .col-ops {
    text-align: center;
  }

  .order-amount {
    color: #333;
    font-size: 16px;
    font-weight: 600;
    line-height: 1.4;
  }

  .pay-method {
    margin-top: 4px;
    color: #999;
    font-size: 14px;
    line-height: 1.4;
  }

  .col-ops {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
  }

  .op-btn {
    min-width: 96px;
    height: 32px;
    padding: 0 12px;
    border: 1px solid $theme_color;
    border-radius: 4px;
    background: #fff;
    color: #171A26;
    font-family: inherit;
    font-size: 14px;
    line-height: 30px;
    cursor: pointer;

    &:hover {
      background: #fff5f4;
    }
  }

  .text-link {
    border: none;
    background: none;
    padding: 0;
    color: #171A26;
    font-family: inherit;
    font-size: 14px;
    line-height: 22px;
    cursor: pointer;

    &:hover {
      color: $theme_color;
    }
  }
}
</style>
