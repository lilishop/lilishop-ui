<template>
  <div class="box" @scroll="scrollBottom">
    <div class="tab">
      <el-tabs v-model="activeName" @tab-click="handleClick" type="card" :stretch=true>
        <el-tab-pane label="最近浏览" name="goods">
          <dl v-if='list.length' class='base-list'>
            <dd :key="index"  @click="linkToGoods(item.goodsId, item.id)" v-for="(item,index) in list">
              <div class="base">
                <div>
                  <img style="width: 60px; height: 60px;margin-left:20px;box-sizing: border-box;" :src="item.thumbnail"
                    :onerror="defaultAvatar" class="image" />
                </div>
                <div class="recent_views">
                  <a class="goods_name">{{ item.goodsName }}</a>
                  <div style="display: flex;">
                    <div style="margin-top: 20px;">
                      <span class='goods-price'>{{ $filters.unitPrice(item.price, "￥") }}</span>
                      <div class="goods_store_button">
                       
                      </div>
                    </div>
                  </div>
                </div>
                <div class="review"> <el-button  v-if="item.btnHide == 1 && toUser.storeFlag" size="small"
                          @click.stop="submitSendGoodsMessage(item)" plain>发送</el-button></div>
              </div>
            </dd>

          </dl>
          <div v-else class='no-more'>
              {{noMoreList.goods.title}}
          </div>
        </el-tab-pane>
        <el-tab-pane label="订单列表" name="orders">
          <dl class='base-order-list' v-if='orderList.length'>
            <dd  v-for="(item, index) in orderList" :key="index">
              <div class="order-list">
                <div class="order-head">
                  <span class="order-sn" :title="item.sn" @click="linkToOrders(item.sn)">订单号:{{ item.sn }}</span>
                  <el-tag  size="small" :type="col[item.orderStatus]">{{
                    item.orderStatus == 'STAY_PICKED_UP' ? '待自提'
                      : item.orderStatus == 'CANCELLED' ? '已取消' : item.orderStatus == 'UNPAID' ? '未付款' : item.orderStatus
                        ==
                        'PAID' ? '已付款' : item.orderStatus == 'UNDELIVERED' ? '待发货' : item.orderStatus == 'DELIVERED'
                          ? '已发货' : item.orderStatus == 'COMPLETED' ? '已完成' : item.orderStatus == 'TAKE' ? '待核销' :
                            ''
                  }}</el-tag>
                </div>
                <div class="order-items" v-for="(order,orderIndex) in item.orderItems" :key="orderIndex">
                  <img :src="order.image" :onerror="defaultAvatar" alt="">
                  <div class="order-item-info">
                    <span class="order-goods-name" :title="order.name" @click="linkToOrders(item.sn)">{{ order.name }}</span>
                    <span class="price">{{ $filters.unitPrice(order.goodsPrice, "￥") }}</span>
                  </div>
                </div>
                <div class="order-foot" v-if="item.btnHide == 1 && toUser.storeFlag">
                  <el-button class="store-button" size="small" @click="submitSendOrderMessage(item, index)" plain>发送</el-button>
                </div>
              </div>

            </dd>
          </dl>
          <div v-else class='no-more'>
              {{noMoreList.orders.title}}
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";
import { useTalkStore } from "@/stores/talk";
import { useUserStore } from "@/stores/user";
import { useAppStore } from "@/stores/app";

const talkStore = useTalkStore();
const userStore = useUserStore();
const appStore = useAppStore();

const emit = defineEmits(["loadMore", "sendMessage"]);

const props = defineProps({
  list: {
    type: Array,
    default: () => [],
  },
  orderList: {
    type: Array,
    default: () => [],
  },
});

const noMoreList = ref({
  'goods': { title: '暂无最近浏览', value: false },
  'orders': { title: '暂无订单信息', value: false },
});
const activeName = ref('goods');
const btnHide = ref(undefined);
const hide = ref(true);
const col = ref({
  CANCELLED: 'danger',
  PAID: 'danger',
  TAKE: '',
  COMPLETED: 'success',
  DELIVERED: 'danger',
  UNDELIVERED: 'warning',
  UNPAID: '',
  STAY_PICKED_UP: ''
});

const talkItems = computed(() => talkStore.talkItems);
const id = computed(() => userStore.id);
const toUser = computed(() => userStore.toUser);
// 图片加载失败时的默认图（onerror 属性值）
const defaultAvatar = computed(() => appStore.defaultAvatar);

//跳转订单列表

function scrollBottom (e) {
  const { scrollTop, scrollHeight, clientHeight } = e.srcElement
  if (scrollTop + clientHeight >= scrollHeight) {
    emit('loadMore')
  }
}
function loadMore () {

}
// 发送消息回调事件
function submitSendGoodsMessage (item) {
  const context = {
    id: item.id,
    goodsId: item.goodsId,
    thumbnail: item.thumbnail,
    price: item.price,
    goodsName: item.goodsName
  }
  const record = {
    operation_type: "MESSAGE",
    to: toUser.value.userId,
    from: id.value,
    message_type: "GOODS",
    context: context,
    talk_id: toUser.value.id,
  };
  emit('sendMessage', record, context, 'GOODS');
  localStorage.setItem(item.goodsId, 0)
  item.btnHide = 0
}
// 发送订单列表
function submitSendOrderMessage (item, index) {
  console.log(item, 'item');

  const context = {
    sn: item.sn,
    groupImages: item.groupImages,
    paymentTime: item.paymentTime,
    groupName: item.groupName,
    flowPrice: item.flowPrice,
    orderItems:item.orderItems,
    orderStatus: item.orderStatus
  }
  const record = {
    operation_type: "MESSAGE",
    to: toUser.value.userId,
    from: id.value,
    message_type: "ORDER",
    context: context,
    talk_id: toUser.value.id,
  };
  emit('sendMessage', record, context, 'ORDER');
  localStorage.setItem(item.goodsId, 0)
  item.btnHide = 0
}
function handleClick (tab, event) {

}

onMounted(() => {
  //  state.user.toUser
  // console.log(this.orderList, '  this.$store.state.user.toUser  this.$store.state.user.toUser  this.$store.state.user.toUser');
  btnHide.value = localStorage.getItem('btnHide')
});

</script>

<style scoped lang="less">
.recent_views {
  margin-left: 13px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  width: 200px;
}
.no-more{
  font-size: 12px;
  color: #999;
  text-align: center;
  margin-top: 20px;
}

.box {
  width: 100%;
  height: 100%;
  box-sizing: border-box;

  .top {
    text-align: center;
  }

  .left {
    float: left;
    width: 60px;
  }

  .right {
    float: right;
    width: 60px;
  }

  .bottom {
    clear: both;
    text-align: center;
  }

  .item {
    // margin: 4px;
    margin-top: 16px
  }

  .left .el-tooltip__popper,
  .right .el-tooltip__popper {
    padding: 8px 10px;
  }
}

.order-list {
  border: 1px solid #eee;
  border-radius: 6px;
  padding: 10px;
  margin-bottom: 10px;
  background: #fff;
  transition: border-color .2s;

  &:hover {
    border-color: #b3d3f9;
  }
}

.order-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding-bottom: 8px;
  margin-bottom: 8px;
  border-bottom: 1px solid #f5f5f5;
}

.order-sn {
  flex: 1;
  min-width: 0;
  font-size: 12px;
  color: #666;
  cursor: pointer;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  &:hover {
    color: #409eff;
  }
}

.box::-webkit-scrollbar {
  width: 0px !important;
}

.order-foot {
  display: flex;
  justify-content: flex-end;
  margin-top: 8px;
}

.goods_name {
  transition: .35s;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size:12px;
}

:deep(.el-tabs__header ) {
  position: absolute;
  width: 100%;
  height: 50px;
  left: 0;
  z-index: 2;
  background: #ffffff;
}
:deep(.el-tabs__nav.is-top ) {
  height: 50px;
}

.tab {
  display: flex;
  justify-content: center;
  align-items: center;
}

:deep(.el-tabs__content ) {
  margin-top: 50px;
}
:deep(.el-tabs) {
  width: 100%;
}

.box {
  overflow: auto;
  // margin-top: 50px;
  // width: 350px;
}

.base {
  padding: 8px;
  cursor: pointer;
  transition: .35s;
  height: 80px;
  display: flex;
  
  .image {
    height: 100px;
    margin-top: 3px;
    width: 100px;
  }
  >.review{
    font-size: 12px;
    display: flex;
    align-items: center;
    transition: 0.35s;
    opacity: 0;
   
  }
}
.base:hover{
  background: #ededed;
  padding-left: 14px;
  >.review{
    opacity: 1;

  }
}
.goods-price{
  transition: .35s;
  font-size: 14px;
  color:#f23030;

}
.separate {
  margin-top: 8px;
}
// .el-tabs--card {
//   height: calc(100vh - 110px);
//   overflow-y: auto; 
// }
// :deep(.el-tab-pane ) {
//   height: calc(100vh - 110px);
//   overflow-y: auto;
// }
.base-list{
  padding: 10px 10px 12px;
}
.base-order-list{
  padding: 10px 10px 12px;
}
.order-items{
  display: flex;
  align-items: center;
  margin-bottom: 8px;

  &:last-of-type {
    margin-bottom: 0;
  }

  img {
    width: 48px;
    height: 48px;
    flex-shrink: 0;
    border-radius: 4px;
    object-fit: cover;
    background: #fafafa;
  }

  .order-item-info {
    flex: 1;
    min-width: 0;
    margin-left: 10px;
    display: flex;
    flex-direction: column;
  }

  .order-goods-name {
    font-size: 12px;
    color: #333;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    cursor: pointer;

    &:hover {
      color: #409eff;
    }
  }

  .price {
    margin-top: 4px;
    font-size: 13px;
    color: #f23030;
  }
}
</style>