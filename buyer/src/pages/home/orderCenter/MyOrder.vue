<template>
  <div class="wrapper">
    <card _Title="我的订单" :_Size="16" :_Tabs="changeWay" @_Change="change" _More="全部订单" _Src="/home/MyOrder" v-if="homePage"></card>

    <UserCenterLayout
      v-if="!homePage"
      title="我的订单"
      :tabs="changeWay"
      :active-tab="activeOrderTab"
      @tab-change="change"
    >
      <template #extra>
        <div class="order-search">
          <el-input
            v-model="params.keywords"
            @keyup.enter="getList"
            placeholder="输入订单号搜索"
          />
          <el-button type="primary" @click="getList">搜索</el-button>
        </div>
      </template>

      <!-- 订单列表 -->
      <empty v-if="orderList.length === 0" />
      <div class="order-content" v-else>
        <div
          class="order-list"
          v-for="(order, onderIndex) in orderList"
          :key="onderIndex"
        >
          <div class="order-header">
            <div>
              <div>{{ filterOrderStatus(order.orderStatus) }}</div>
              <div>
                订单号：{{ order.sn }} &nbsp; &nbsp; &nbsp;{{order.createTime}}
              </div>
            </div>
            <div>
              <el-button v-if="order.orderStatus === 'COMPLETED'" @click="delOrder(order.sn)" class="del-btn mr_10 fontsize_16" style="margin-top:-5px;" type="text" icon="ios-trash-outline" size="small"></el-button>
              <span>{{ $filters.unitPrice(order.flowPrice, "￥") }}</span>
            </div>
          </div>
          <div class="order-body">
            <div class="goods-list">
              <div
                v-for="(goods, goodsIndex) in order.orderItems"
                :key="goodsIndex"
              >
                <img
                  @click="goodsDetail(goods.skuId, goods.goodsId)"
                  class="hover-color"
                  :src="goods.image"
                  alt=""
                />
                <div>
                  <div class="hover-color" @click="goodsDetail(goods.skuId, goods.goodsId)">{{ goods.name }}</div>
                  <div class="mt_10">
                    <span class="global_color">{{ $filters.unitPrice(goods.goodsPrice, "￥") }} </span> x {{ goods.num }}
                    <span style="margin-left: 10px;color: #ff9900;">{{refundPriceList(goods.isRefund)}}</span>
                  </div>
                  <el-button v-if="goods.commentStatus == 'UNFINISHED'" @click="comment(order.sn, goodsIndex)" size="small" type="success" class="fontsize_12" style="position:relative;top:-22px;left:190px;margin-right:10px">评价</el-button>
                  <el-button v-if="goods.complainStatus == 'NO_APPLY'" @click="complain(order.sn, goodsIndex)" type="danger" class="fontsize_12" size="small" style="position:relative;top:-22px;left:190px">投诉</el-button>
                </div>
              </div>
            </div>
            <div>
              <span @click="shopPage(order.storeId)">{{ order.storeName }}</span>
            </div>
            <div class="order-actions">
              <!-- 订单基础操作 -->
              <el-button @click="orderDetail(order.sn)" type="warning" size="small">订单详情</el-button>
              <el-button @click="handleCancelOrder(order.sn)" type="danger" v-if="order.allowOperationVO.cancel" size="small">取消订单</el-button>
              <el-button @click="goPay(order.sn)" size="small" type="success" v-if="order.allowOperationVO.pay">去支付</el-button>
              <el-button @click="received(order.sn)" size="small" type="primary" v-if="order.allowOperationVO.rog">确认收货</el-button>
              <!-- 售后（E_COUPON 卡密已交付不支持售后 FR-B-04） -->
              <el-button v-if="order.orderType !== 'E_COUPON' && order.groupAfterSaleStatus && (order.groupAfterSaleStatus.includes('NOT_APPLIED')|| order.groupAfterSaleStatus.includes('PART_AFTER_SALE'))"
                      @click="applyAfterSale(order.orderItems)" size="small">申请售后</el-button>
            </div>
          </div>
        </div>
        <el-skeleton size="large" fix v-if="spinShow"></el-skeleton>
      </div>

      <!-- 分页 -->
      <div class="page-size">
        <el-pagination v-model:current-page="params.pageNumber" v-model:page-size="params.pageSize"
          :total="total" @current-change="changePageNum"
          @size-change="changePageSize" layout="total, sizes, prev, pager, next, jumper"></el-pagination>
      </div>
    </UserCenterLayout>

    <!-- 个人中心首页订单列表 -->
    <empty v-if="homePage && orderList.length === 0" />
    <div class="order-content" v-else-if="homePage">
      <div
        class="order-list"
        v-for="(order, onderIndex) in orderList"
        :key="onderIndex"
      >
        <div class="order-header">
          <div>
            <div>{{ filterOrderStatus(order.orderStatus) }}</div>
            <div>
              订单号：{{ order.sn }} &nbsp; &nbsp; &nbsp;{{order.createTime}}
            </div>
          </div>
          <div>
            <el-button v-if="order.orderStatus === 'COMPLETED'" @click="delOrder(order.sn)" class="del-btn mr_10 fontsize_16" style="margin-top:-5px;" type="text" icon="ios-trash-outline" size="small"></el-button>
            <span>{{ $filters.unitPrice(order.flowPrice, "￥") }}</span>
          </div>
        </div>
        <div class="order-body">
          <div class="goods-list">
            <div
              v-for="(goods, goodsIndex) in order.orderItems"
              :key="goodsIndex"
            >
              <img
                @click="goodsDetail(goods.skuId, goods.goodsId)"
                class="hover-color"
                :src="goods.image"
                alt=""
              />
              <div>
                <div class="hover-color" @click="goodsDetail(goods.skuId, goods.goodsId)">{{ goods.name }}</div>
                <div class="mt_10">
                  <span class="global_color">{{ $filters.unitPrice(goods.goodsPrice, "￥") }} </span>x {{ goods.num }}
                  <span style="margin-left: 10px;color: #ff9900;">{{refundPriceList(goods.isRefund)}}</span>
                </div>
                <el-button v-if="goods.commentStatus == 'UNFINISHED'" @click="comment(order.sn, goodsIndex)" size="small" type="success" class="fontsize_12" style="position:relative;top:-22px;left:190px;margin-right:10px">评价</el-button>
                <el-button v-if="goods.complainStatus == 'NO_APPLY'" @click="complain(order.sn, goodsIndex)" type="danger" class="fontsize_12" size="small" style="position:relative;top:-22px;left:190px">投诉</el-button>
              </div>
            </div>
          </div>
          <div>
            <span @click="shopPage(order.storeId)">{{ order.storeName }}</span>
          </div>
          <div class="order-actions">
            <!-- 订单基础操作 -->
            <el-button @click="orderDetail(order.sn)" type="warning" size="small">订单详情</el-button>
            <el-button @click="handleCancelOrder(order.sn)" type="danger" v-if="order.allowOperationVO.cancel" size="small">取消订单</el-button>
            <el-button @click="goPay(order.sn)" size="small" type="success" v-if="order.allowOperationVO.pay">去支付</el-button>
            <el-button @click="received(order.sn)" size="small" type="primary" v-if="order.allowOperationVO.rog">确认收货</el-button>
            <!-- 售后（E_COUPON 不支持买家售后 FR-B-04） -->
            <el-button v-if="order.orderType !== 'E_COUPON' && order.groupAfterSaleStatus && (order.groupAfterSaleStatus.includes('NOT_APPLIED')|| order.groupAfterSaleStatus.includes('PART_AFTER_SALE'))"
                    @click="applyAfterSale(order.orderItems)" size="small">申请售后</el-button>
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
import { orderStatusList } from '../enumeration.js'
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
        pageSize: 10,
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
      changeWay: ['全部订单', '待付款', '待收货', '已完成'], // 订单状态
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
    this.getList();
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
    // 切换订单状态
    change (index) {
      this.activeOrderTab = index;
      this.params.pageNumber = 1;
      switch (index) {
        case 0:
          this.params.tag = 'ALL'
          break;
        case 1:
          this.params.tag = 'WAIT_PAY'
          break;
        case 2:
          this.params.tag = 'WAIT_ROG'
          break;
        case 3:
          this.params.tag = 'COMPLETE'
          break;
      }
      this.getList()
    },
    // 跳转店铺首页
    shopPage (id) {
      let routeUrl = this.$router.resolve({
        path: '/merchant',
        query: { id: id }
      });
      window.open(routeUrl.href, '_blank');
    },
    orderDetail (sn) {
      // 跳转订单详情
      this.$router.push({ name: 'OrderDetail', query: {sn} });
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
    comment (sn, goodsIndex) { // 评价
      this.$router.push({path: '/home/addEval', query: {sn, index: goodsIndex}})
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
    getList () { // 获取订单列表
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
.order-list {
  border: 1px solid #ddd;
  border-radius: 3px;
  margin-bottom: 10px;

  &:hover{
    .del-btn{visibility: visible;}
  }
  .del-btn{
    visibility: hidden;
  }

  .order-header {
    display: flex;
    align-items: center;
    padding: 10px;
    justify-content: space-between;
    border-bottom: 1px solid #ddd;
    > div:nth-child(1) > div:nth-child(2) {
      font-size: 12px;
      color: #999;
      margin-top: 3px;
    }
  }
  .order-body {
    display: flex;
    justify-content: space-between;
    color: #999;
    padding: 10px;

    .goods-list > div {
      width: 500px;
      display: flex;
      margin-bottom: 10px;
      img {
        width: 60px;
        height: 60px;
        margin-right: 10px;
      }
      > div {
        flex: 1;
      }
    }

    > div:nth-child(2) {
      width: 150px;
      text-align: center;
      span {
        color: #438cde;
        cursor: pointer;
        &:hover {
          color: $theme_color;
        }
      }
      .el-icon {
        color: #ff8f23;
        cursor: pointer;
        &:hover {
          color: $theme_color;
        }
      }
    }

    .order-actions {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 8px;
      min-width: 100px;

      .el-button {
        margin: 0;
        min-width: 88px;
      }
    }
  }
}
</style>
