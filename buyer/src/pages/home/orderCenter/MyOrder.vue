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
      <el-skeleton v-if="spinShow" :rows="5" animated />
    <el-empty v-else-if="queryFailed" description="加载失败，请重试"><el-button type="primary" @click="getList">重新加载</el-button></el-empty>
    <empty v-else-if="orderList.length === 0" />
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
            <div class="order-status">
              <el-tag size="small" :type="statusTagType(order.isAfterSale ? order.serviceStatus : order.orderStatus)">
                {{ order.isAfterSale ? filterAfterSaleStatus(order.serviceStatus) : filterOrderStatus(order.orderStatus) }}
              </el-tag>
            </div>
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
                    loading="lazy"
                    decoding="async"
                    alt=""
                    @error="$event.target.style.visibility = 'hidden'"
                  />
                </div>
                <div class="goods-info">
                  <div class="goods-name hover-color" @click="goodsDetail(goods.skuId, goods.goodsId)">{{ goods.name }}</div>
                  <div class="goods-num">共{{ goods.num }}件</div>
                  <div class="goods-extra">
                    <el-tag v-if="refundPriceList(goods.isRefund) && !isUnpaid(order)" type="warning" size="small">{{ refundPriceList(goods.isRefund) }}</el-tag>
                  </div>
                </div>
              </div>
            </div>
            <div class="col-amount">
              <div class="order-amount">{{ $filters.unitPrice(order.flowPrice, "￥") }}</div>
              <div v-if="paymentLabel(order)" class="pay-method">{{ paymentLabel(order) }}</div>
            </div>
            <div class="col-ops">
              <template v-if="order.isAfterSale">
                <el-button link type="primary" @click="goAfterSaleDetail(order.serviceSn)">售后详情</el-button>
              </template>
              <template v-else>
                <el-button v-if="order.allowOperationVO && order.allowOperationVO.pay" type="primary" size="small" @click="goPay(order.sn)">去支付</el-button>
                <el-button v-if="order.allowOperationVO && order.allowOperationVO.rog" type="primary" size="small" @click="received(order.sn)">确认收货</el-button>
                <el-button link type="primary" @click="orderDetail(order.sn)">订单详情</el-button>
                <el-button v-if="order.allowOperationVO && order.allowOperationVO.cancel" link type="info" @click="handleCancelOrder(order.sn)">取消订单</el-button>
                <el-button v-if="order.orderStatus === 'COMPLETED'" link type="info" @click="delOrder(order.sn)">删除订单</el-button>
              </template>
            </div>
          </div>
        </div>

      </div>

      <!-- 分页 -->
      <div class="page-size">
        <el-pagination v-model:current-page="params.pageNumber" v-model:page-size="params.pageSize"
          :total="total" :page-sizes="[20, 50, 100]" @current-change="changePageNum"
          @size-change="changePageSize" layout="total, sizes, prev, pager, next, jumper"></el-pagination>
      </div>
    </UserCenterLayout>

    <!-- 个人中心首页订单列表 -->
    <el-skeleton v-if="homePage && spinShow" :rows="5" animated />
    <el-empty v-else-if="homePage && queryFailed" description="加载失败，请重试"><el-button type="primary" @click="getList">重新加载</el-button></el-empty>
    <empty v-else-if="homePage && orderList.length === 0" />
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
          <div class="order-status">
            <el-tag size="small" :type="statusTagType(order.isAfterSale ? order.serviceStatus : order.orderStatus)">
              {{ order.isAfterSale ? filterAfterSaleStatus(order.serviceStatus) : filterOrderStatus(order.orderStatus) }}
            </el-tag>
          </div>
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
                  loading="lazy"
                  decoding="async"
                  alt=""
                  @error="$event.target.style.visibility = 'hidden'"
                />
              </div>
              <div class="goods-info">
                <div class="goods-name hover-color" @click="goodsDetail(goods.skuId, goods.goodsId)">{{ goods.name }}</div>
                <div class="goods-num">共{{ goods.num }}件</div>
                <div class="goods-extra">
                  <el-tag v-if="refundPriceList(goods.isRefund) && !isUnpaid(order)" type="warning" size="small">{{ refundPriceList(goods.isRefund) }}</el-tag>
                </div>
              </div>
            </div>
          </div>
          <div class="col-amount">
            <div class="order-amount">{{ $filters.unitPrice(order.flowPrice, "￥") }}</div>
            <div v-if="paymentLabel(order)" class="pay-method">{{ paymentLabel(order) }}</div>
          </div>
          <div class="col-ops">
            <template v-if="order.isAfterSale">
              <el-button link type="primary" @click="goAfterSaleDetail(order.serviceSn)">售后详情</el-button>
            </template>
            <template v-else>
              <el-button v-if="order.allowOperationVO && order.allowOperationVO.pay" type="primary" size="small" @click="goPay(order.sn)">去支付</el-button>
              <el-button v-if="order.allowOperationVO && order.allowOperationVO.rog" type="primary" size="small" @click="received(order.sn)">确认收货</el-button>
              <el-button link type="primary" @click="orderDetail(order.sn)">订单详情</el-button>
              <el-button v-if="order.allowOperationVO && order.allowOperationVO.cancel" link type="info" @click="handleCancelOrder(order.sn)">取消订单</el-button>
              <el-button v-if="order.orderStatus === 'COMPLETED'" link type="info" @click="delOrder(order.sn)">删除订单</el-button>
            </template>
          </div>
        </div>
      </div>

    </div>
    <el-dialog v-model="cancelAvail" title="请选择取消订单原因">
      <el-alert v-if="cancelIsPickup" title="此订单使用提货卡兑换，取消不退还提货权益，无法再次兑换。" type="warning" :closable="false" style="margin-bottom:16px" />
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

<script setup>
import { catchHandledRequestError } from "@/utils/requestError";
import { onMounted, reactive, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { Message, Modal } from "@/utils/message";
import { getOrderList, sureReceived, cancelOrder, delOrder as deleteOrder } from '@/api/order';
import { afterSaleReason } from '@/api/member';
import { orderStatusList, afterSaleStatusList } from '../enumeration.js'

defineOptions({ name: 'MyOrder' });

const props = defineProps({
  homePage: { // 判断是否个人中心首页展示内容
    type: Boolean,
    default: false
  }
});

const route = useRoute();
const router = useRouter();

const orderList = ref([]); // 订单列表
const params = reactive({ // 请求参数
  pageNumber: 1,
  pageSize: 20,
  // orderStatus: 'ALL',
  keywords: '',
  tag: 'ALL'
});
const cancelParams = reactive({ // 取消售后参数
  orderSn: '',
  reason: ''
});
const changeWay = ref(['全部', '待付款', '待发货', '待收货/使用']);
const activeOrderTab = ref(0);
const total = ref(0); // 数据总数
const queryFailed = ref(false); // 区分加载失败与暂无记录，支持重新查询
let listRequestVersion = 0; // 仅允许最后一次查询更新列表与加载状态
const spinShow = ref(false); // 加载状态
const cancelIsPickup = ref(false);
const cancelAvail = ref(false); // 取消订单modal控制
const cancelReason = ref([]); // 取消订单原因

// 退款状态枚举
function refundPriceList(status) {
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
}
function goodsDetail (skuId, goodsId) {
  // 跳转商品详情
  let routeUrl = router.resolve({
    path: '/goodsDetail',
    query: { skuId, goodsId }
  });
  window.open(routeUrl.href, '_blank');
}
function orderTags () {
  return ['ALL', 'WAIT_PAY', 'WAIT_SHIP', 'WAIT_USE'];
}
function applyRouteTag () {
  const tags = orderTags();
  const tag = route.query.tag;
  const index = tags.indexOf(tag);
  activeOrderTab.value = index > -1 ? index : 0;
  params.tag = tags[activeOrderTab.value];
  params.pageNumber = 1;
}
// 切换订单状态
function change (index) {
  activeOrderTab.value = index;
  params.pageNumber = 1;
  delete params.commentStatus;
  const tags = orderTags();
  params.tag = tags[index] || 'ALL';
  const query = { ...route.query };
  if (index === 0) delete query.tag;
  else query.tag = params.tag;
  const current = route.query.tag || 'ALL';
  if (current !== params.tag) {
    router.replace({ name: 'MyOrder', query });
  }
  getList()
}
// 跳转店铺首页
function shopPage (id) {
  router.push({
    path: '/merchant',
    query: { id: id }
  });
}
function orderDetail (sn) {
  router.push({ name: 'OrderDetail', query: {sn} });
}
function goAfterSaleDetail (sn) {
  router.push({ name: 'AfterSaleDetail', query: { sn } });
}
function received (sn) { // 确认收货
  sureReceived(sn).then(res => {
    if (res.success) {
      Message.success('确认收货成功')
      getList()
    }
  })
}
function goPay (sn) { // 去支付
  router.push({path: '/payment', query: {orderType: 'ORDER', sn}});
}
function delOrder (sn) { // 删除订单
  Modal.confirm({
    title: '删除订单',
    content: '<p>确认删除当前订单吗？</p>',
    onOk: () => {
      deleteOrder(sn).then(res => {
        if (res.success) {
          Message.success('删除成功');
          getList()
        }
      })
    },
    onCancel: () => {}
  });
}
function getList () {
  const version = ++listRequestVersion;
  queryFailed.value = false;
  spinShow.value = true;
  let _params = JSON.parse(JSON.stringify(params))
  if (_params.orderStatus === 'ALL') {
    delete _params.orderStatus
  }
  getOrderList(_params).then(res => {
    if (version !== listRequestVersion) return;
    if (res.success) {
      orderList.value = res.result.records;
      total.value = res.result.total;
    }
  }).catch((error) => {
    if (version !== listRequestVersion) {
      catchHandledRequestError(error);
      return;
    }
    queryFailed.value = true;
    orderList.value = [];
    total.value = 0;
    catchHandledRequestError(error);
  }).finally(() => {
    if (version === listRequestVersion) spinShow.value = false;
  });
}
function mapAfterSaleOrder (item) {
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
}
function changePageNum (val) { // 修改页码
  params.pageNumber = val;
  getList()
}
function changePageSize (val) { // 修改页数
  params.pageNumber = 1;
  params.pageSize = val;
  getList()
}
function handleCancelOrder (sn) {
  // 取消订单
  cancelIsPickup.value = !!orderList.value.find(order => order.sn === sn)?.pickupCardId;
  cancelParams.orderSn = sn;
  afterSaleReason('CANCEL').then(res => {
    if (res.success) {
      cancelReason.value = res.result;
      cancelAvail.value = true
      cancelParams.reason = cancelReason.value[0].reason
    }
  })
}
function sureCancel () { // 确定取消
  cancelOrder(cancelParams).then(res => {
    if (res.success) {
      Message.success('取消订单成功')
      getList()
      cancelAvail.value = false
    }
  })
}
function filterOrderStatus (status) { // 获取订单状态中文
  const ob = orderStatusList.filter(e => { return e.status === status });
  return ob && ob[0] ? ob[0].name : status
}
function filterAfterSaleStatus (status) {
  const ob = afterSaleStatusList.filter(e => e.status === status);
  return ob && ob[0] ? ob[0].name : status
}
function statusTagType (status) { // 订单/售后状态对应标签类型
  const map = {
    UNPAID: 'warning', WAIT_PAY: 'warning', PAID: 'warning',
    UNDELIVERED: 'warning', PARTS_DELIVERED: 'warning', DELIVERED: 'warning',
    WAIT_SHIP: 'warning', WAIT_USE: 'warning', TAKE: 'warning', STAY_PICKED_UP: 'warning',
    APPLY: 'warning', APPLYING: 'warning',
    COMPLETED: 'success', COMPLETE: 'success',
    CANCELLED: 'info', CANCEL: 'info'
  }
  return map[status] || 'info'
}
function paymentLabel (order) {
  const map = {
    WECHAT: '微信支付',
    ALIPAY: '支付宝',
    WALLET: '余额支付',
    BANK_TRANSFER: '线下转账'
  }
  if (order.paymentMethod && map[order.paymentMethod]) {
    return map[order.paymentMethod]
  }
  if (isUnpaid(order)) {
    return '待支付'
  }
  return ''
}
function isUnpaid (order) {
  return order.payStatus === 'UNPAID' || order.orderStatus === 'UNPAID'
}

watch(() => route.query.tag, () => {
  if (props.homePage || route.name !== 'MyOrder') return;
  const next = route.query.tag || 'ALL';
  if (params.tag === next) return;
  applyRouteTag();
  getList();
});

onMounted(() => {
  if (props.homePage) params.pageSize = 5;
  if (!props.homePage) applyRouteTag();
  getList();
});
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
    color: #333;
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

    :deep(.el-button + .el-button) {
      margin-left: 0;
    }
  }
}
</style>
