<template>
  <div class="box" @scroll="scrollBottom">
    <div class="tab">
      <el-tabs v-model="activeName" @tab-click="handleClick" :stretch=true>
        <el-tab-pane label="最近浏览" name="goods">
          <dl>
            <dd v-for="item in list" v-infinite-scroll="loadMore">
              <div class="base">
                <div>
                  <img :src="item.thumbnail" class="image" />
                </div>
                <div style="margin-left: 13px">
                  <a class="goods_name" @click="linkToGoods(item.goodsId, item.id)">{{ item.goodsName }}</a>
                  <div style="margin-top: 8px;">
                    <span style="color: red;">￥{{ item.price }}</span>
                  </div>
                  <div>
                    <el-button class="store-button" type="danger" v-if="item.btnHide == 1" size="mini"
                      @click="submitSendGoodsMessage(item)" plain>发送</el-button>
                  </div>
                </div>
              </div>
            </dd>
          </dl>
        </el-tab-pane>
        <el-tab-pane label="订单列表" name="orders">
          <dl>
            <dd v-for="(item, index) in orderList" v-infinite-scroll="loadMore" :key="index">
              <div style="margin-bottom: 20px;">
                <span class="orderSn">订单号：{{ item.sn }}</span>
                <img :src="item.groupImages" alt="暂无图片"
                  style="height: 100px; width: 100px;margin-top: 10px; vertical-align: middle; ">
                <span class="orderGoodsName" @click="linkToOrders(item.sn)"> {{ item.groupName }}</span>
                <span style="margin-left: 10px; color: red;">{{ item.paymentTime }}</span>
                <div class="orderBtn">
                  <el-button type="danger" class="store-button" v-if="item.btnHide == 1" size="mini"
                    @click="submitSendOrderMessage(item, index)" plain>发送</el-button>
                </div>
              </div>

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
      const context = {
        sn: item.sn,
        groupImages: item.groupImages,
        paymentTime: item.paymentTime,
        groupName: item.groupName,
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
    }
  },
  mounted () {
    console.log(this.orderList, 'orderList');
    this.btnHide = localStorage.getItem('btnHide')
  }
}

</script>

<style scoped lang="less">
.orderGoodsName {
  width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  position: absolute;
  margin-left: 10px;
  margin-top: 10px;
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
  bottom: 30px;
}

.goods_name {
  text-overflow: -o-ellipsis-lastline;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;

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

.base {
  margin-top: 5px;
  height: 120px;
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