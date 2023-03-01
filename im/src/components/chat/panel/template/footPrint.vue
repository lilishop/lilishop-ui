<template>
  <div class="box" :style="{height:toUser.storeFlag ? '858px' : '815px'}" @scroll="scrollBottom">
    <div class="tab">
      <el-tabs v-model="activeName" @tab-click="handleClick" :stretch=true>
        <el-tab-pane label="最近浏览" name="goods">
          <dl v-if='list.length' class='base-list'>
            <dd :key="index"  @click="linkToGoods(item.goodsId, item.id)" v-for="(item,index) in list" v-infinite-scroll="loadMore">
              <div class="base">
                <div>
                  <img style="width: 60px; height: 60px;margin-left:20px;box-sizing: border-box;" :src="item.thumbnail"
                    class="image" />
                </div>
                <div class="recent_views">
                  <a class="goods_name">{{ item.goodsName }}</a>
                  <div style="display: flex;">
                    <div style="margin-top: 20px;">
                      <span class='goods-price'>{{ item.price | unitPrice("￥") }}</span>
                      <div class="goods_store_button">
                       
                      </div>
                    </div>
                  </div>
                </div>
                <div class="review"> <el-button  v-if="item.btnHide == 1 && toUser.storeFlag" size="mini"
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
            <dd  v-for="(item, index) in orderList" v-infinite-scroll="loadMore" :key="index">
              <div class="order-list">
                <div class="order-top order-padding">
                  <span class="order-sn" @click="linkToOrders(item.sn)">订单号:{{ item.sn }}</span>
                </div>
                <div class="order-section order-padding">
                  <div class="order-items" v-for="(order,orderIndex) in item.orderItems" :key="orderIndex">
                      <img :src="order.image" alt="">
                      <span class="order-goods-name" @click="linkToOrders(item.sn)"> {{ order.name }}</span>
                      <span class="price">{{order.goodsPrice | unitPrice("￥")}}</span>
                  </div>
                  <!-- <img  :src="item.groupImages" alt=""> -->
                 
                  <div class="order-btn ">
                    <el-button class="store-button" v-if="item.btnHide == 1 && toUser.storeFlag"
                      size="mini" @click="submitSendOrderMessage(item, index)" plain>发送</el-button>
                  </div>
                </div>
                <div class="order-footer order-padding">
                  <span></span>
                  <el-tag  size='mini' :type="col[item.orderStatus]">{{
                    item.orderStatus == 'STAY_PICKED_UP' ? '待自提'
                      : item.orderStatus == 'CANCELLED' ? '已取消' : item.orderStatus == 'UNPAID' ? '未付款' : item.orderStatus
                        ==
                        'PAID' ? '已付款' : item.orderStatus == 'UNDELIVERED' ? '待发货' : item.orderStatus == 'DELIVERED'
                          ? '已发货' : item.orderStatus == 'COMPLETED' ? '已完成' : item.orderStatus == 'TAKE' ? '待核销' :
                            ''
                  }}</el-tag>
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

<script>
import { Tag, button, Tabs, TabPane, InfiniteScroll } from 'element-ui'
import { mapState, mapGetters } from "vuex";
import { unitPrice } from '@/plugins/filters';

export default {
  directives: {
    "infinite-scroll": InfiniteScroll,
  },
  data () {
    return {
      noMoreList:{
        'goods':{title:'暂无最近浏览',value:false},
        'orders':{title:'暂无订单信息',value:false},
      },
      activeName: 'goods',
      btnHide: undefined,
      hide: true,
      col: {
        CANCELLED: 'danger',
        PAID: 'danger',
        TAKE: '',
        COMPLETED: 'success',
        DELIVERED: 'danger',
        UNDELIVERED: 'warning',
        UNPAID: '',
        STAY_PICKED_UP: ''
      },
    }
  },
  computed: {
    ...mapGetters(["talkItems"]),
    ...mapState({
      id: (state) => state.user.id,
      toUser: (state) => state.user.toUser,
    }),
  },
  components: {
    "el-tag": Tag,
    "el-button": button,
    "el-tabs": Tabs,
    "el-tab-pane": TabPane,
  },
  methods: {
    //跳转订单列表

    scrollBottom (e) {
      const { scrollTop, scrollHeight, clientHeight } = e.srcElement
      if (scrollTop + clientHeight >= scrollHeight) {
        this.$emit('loadMore')
      }
    },
    loadMore () {

    },
    // 发送消息回调事件
    submitSendGoodsMessage (item) {
      const context = {
        id: item.id,
        goodsId: item.goodsId,
        thumbnail: item.thumbnail,
        price: item.price,
        goodsName: item.goodsName
      }
      const record = {
        operation_type: "MESSAGE",
        to: this.toUser.userId,
        from: this.id,
        message_type: "GOODS",
        context: context,
        talk_id: this.toUser.id,
      };
      this.$emit('sendMessage', record, context, 'GOODS');
      localStorage.setItem(item.goodsId, 0)
      item.btnHide = 0
    },
    // 发送订单列表
    submitSendOrderMessage (item, index) {
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
        to: this.toUser.userId,
        from: this.id,
        message_type: "ORDER",
        context: context,
        talk_id: this.toUser.id,
      };
      this.$emit('sendMessage', record, context, 'ORDER');
      localStorage.setItem(item.goodsId, 0)
      item.btnHide = 0
    },
    handleClick (tab, event) {
      
    }
  },
  props: {
    list: {
      type: Array,
      default: [],
    },
    orderList: {
      type: Array,
      default: []
    },
  },
  mounted () {
    //  state.user.toUser
    // console.log(this.orderList, '  this.$store.state.user.toUser  this.$store.state.user.toUser  this.$store.state.user.toUser');
    this.btnHide = localStorage.getItem('btnHide')
  }
}

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
  max-width: 362px;

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
  padding: 9px;
  transition: 0.35s;
  cursor: pointer;
  margin-bottom: 10px;
  background: #fff;
  color: #5a606b;
  box-sizing: border-box;
}


.box::-webkit-scrollbar {
  width: 0px !important;
}
.order-section {
  margin: 10px 0;
  font-size: 12px;
  img {
    width: 60px;
    height: 60px;
  }
}

.order-footer {
  font-size: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.order-goods-name {
  width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  position: absolute;
  margin-left: 10px;

  font-weight: 500;
}

.orderSn {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap
}

.order-btn {
  display: flex;
  justify-content: flex-end;
  position: relative;
  bottom: 55px;
}

.goods_name {
  transition: .35s;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size:12px;
}

/deep/ .el-tabs__header {
  position: absolute;
  width: 362px;
  height: 50px;
  left: 0;
  z-index: 2;
  background: #ffffff;
}
/deep/ .el-tabs__nav.is-top {
  height: 50px;
}

.tab {
  display: flex;
  justify-content: center;
  align-items: center;
}

/deep/.el-tabs__content {
  margin-top: 50px;
}
/deep/ .el-tabs{
  width: 100%;
}

.box {
  overflow: auto;
  // margin-top: 50px;
  // width: 350px;
}

.order-padding {
  padding: 0 10px;
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
.base:hover,.order-list:hover{
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
.order-sn{
  font-size: 12px;
}
// .el-tabs--card {
//   height: calc(100vh - 110px);
//   overflow-y: auto; 
// }
// /deep/.el-tab-pane {
//   height: calc(100vh - 110px);
//   overflow-y: auto;
// }
.base-list{
  padding-bottom: 120px;
}
.base-order-list{
  padding-bottom: 100px;
}
.price{
  color: red;
  margin-left: 10px;
  margin-bottom: 10px;
}
.order-items{
  margin-bottom: 10px;
}
</style>