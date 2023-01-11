<template>
  <div class="box" @scroll="scrollBottom">
    <div class="tab">
      <el-tabs v-model="activeName" @tab-click="handleClick" :stretch=true>
        <el-tab-pane label="最近浏览" name="goods">
          <dl>
            <dd v-for="item in list" v-infinite-scroll="loadMore">
              <div class="base">
                <div>
                  <img style="width: 60px; height: 60px;margin-left: 40px;box-sizing: border-box;" :src="item.thumbnail"
                    class="image" />
                </div>
                <div class="recent_views">
                  <el-tooltip class="item" effect="dark" :content="item.goodsName" placement="top-start">
                    <a class="goods_name" @click="linkToGoods(item.goodsId, item.id)">{{ item.goodsName }}</a>
                  </el-tooltip>

                  <div style="display: flex;">
                    <div style="margin-top: 20px;">
                      <span style="color: red;">￥{{ item.price }}</span>
                      <div class="goods_store_button">
                        <el-button type="danger" v-if="item.btnHide == 1 && toUser.storeFlag" size="mini"
                          @click="submitSendGoodsMessage(item)" plain>发送</el-button>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
              <div class="Underline"></div>
            </dd>

          </dl>
        </el-tab-pane>
        <el-tab-pane label="订单列表" name="orders">
          <dl>
            <dd v-for="(item, index) in orderList" v-infinite-scroll="loadMore" :key="index">
              <div class="orderlist">
                <div class="order_top">
                  <span class="order_sn">订单号:{{ item.sn }}</span>
                </div>
                <div class="order_section">
                  <img :src="item.groupImages" alt="">
                  <el-tooltip class="item" effect="dark" :content="item.groupName" placement="top-start">
                    <span class="orderGoodsName" @click="linkToOrders(item.sn)"> {{ item.groupName }}</span>
                  </el-tooltip>
                  <div class="orderBtn">
                    <el-button type="danger" class="store-button" v-if="item.btnHide == 1 && toUser.storeFlag"
                      size="mini" @click="submitSendOrderMessage(item, index)" plain>发送</el-button>
                  </div>
                </div>
                <div class="order_footer">
                  <span> 订单金额： <span style="color: red;">￥{{ item.orderItems[0].goodsPrice }}</span></span>
                  <span class="order_status"
                    :style="{ 'color': item.orderStatus == 'CANCELLED' || item.orderStatus == 'UNPAID' || item.orderStatus == ' TAKE' ? '#5a606b' : '#f23030' }">{{
  item.orderStatus == 'CANCELLED' ? '已取消' : item.orderStatus == 'UNPAID' ? '未付款' : item.orderStatus ==
    'PAID' ? '已付款' : item.orderStatus == 'UNDELIVERED' ? '待发货' : item.orderStatus == 'DELIVERED'
      ? '已发货' : item.orderStatus == ' COMPLETED' ? '已完成' : item.orderStatus == ' TAKE' ? '待校验' : ''
                    }}</span>
                </div>

              </div>
              <div class="Underline"></div>
            </dd>
          </dl>
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<script>
import { Tag, button, Tabs, TabPane, InfiniteScroll } from 'element-ui'
import { mapState, mapGetters } from "vuex";
export default {
  directives: {
    "infinite-scroll": InfiniteScroll,
  },
  data () {
    return {
      activeName: 'goods',
      btnHide: undefined,
      hide: true
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
      console.log(tab, event);
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
    console.log(this.$store.state.user.toUser, '  this.$store.state.user.toUser  this.$store.state.user.toUser  this.$store.state.user.toUser');
    this.btnHide = localStorage.getItem('btnHide')
  }
}

</script>

<style scoped lang="less">
.order_status {
  height: 25px;
  width: 60px;
  background: #ffeded;
  margin-right: 20px;
  text-align: center;
  line-height: 25px;
}

.Underline {
  border: 1px solid silver;
  width: 90%;
  margin: 0 auto;
}

.recent_views {
  margin-left: 13px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  width: 260px;
}

.box {
  width: 400px;

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
    margin: 4px;
  }

  .left .el-tooltip__popper,
  .right .el-tooltip__popper {
    padding: 8px 10px;
  }
}

.Underline {
  // border: 5px solid red;
}

.orderlist {
  margin-bottom: 10px;
  background: #fff;
  color: #5a606b;
}

.order_top {
  border-bottom: 1px solid #f2f2f2;

  .order_sn {}
}

.order_section {
  border-bottom: 1px solid #f2f2f2;
  height: 100px;

  img {
    width: 80px;
    height: 80px;
    margin-top: 20px;
  }
}

.order_footer {
  border-bottom: 1px solid #f2f2f2;
  display: flex;
  justify-content: space-between;
}

.orderGoodsName {
  width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  position: absolute;
  margin-left: 10px;
  margin-top: 10px;
  font-weight: 500;
}

.orderSn {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap
}

.orderBtn {
  display: flex;
  justify-content: flex-end;
  margin-right: 15px;
  position: relative;
  bottom: 55px;
}

.goods_name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap
}

/deep/ .el-tabs__item.is-top:last-child {
  color: black;
}

/deep/.el-tabs__active-bar {
  background-color: #f23030;
}

/deep/ .el-tabs__nav.is-top {
  height: 50px;
}

.tab {
  display: flex;
  justify-content: center;
  align-items: center;
}

.box {
  height: 500px;
  overflow: auto;
  width: 350px;
}

.store-button {
  background-color: white;
  border-color: #F56C6C;
  margin-top: 10px;
}

.goods_store_button {
  display: inline;
  background-color: white;
  border-color: #F56C6C;
  position: absolute;
  left: 70%;
}

.base {
  margin-top: 5px;
  height: 80px;
  display: flex;

  .price {
    color: red;
    margin-top: 15px;
  }

  .image {
    height: 100px;
    margin-top: 3px;
    width: 100px;
  }

}

.separate {
  margin-top: 8px;
}
</style>