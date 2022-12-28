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
            <dd v-for="item in list" v-infinite-scroll="loadMore">
              <div class="base">
                <div>
                  <img :src="item.thumbnail" class="image" />
                </div>
                <div style="margin-left: 13px">
                  <a class="goods_name" @click="linkToGoods(item.goodsId, item.id)">{{ item.goodsName }}</a>
                  <div style="margin-top: 10px;">
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
      console.log("发送");
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
      this.$emit('sendMessage', record, context);
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
  },
  mounted () {
    console.log(this.list, 'list');
    this.btnHide = localStorage.getItem('btnHide')
  }
}

</script>

<style scoped lang="less">
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

}

.base {
  margin-top: 5px;
  height: 120px;
  display: flex;

  div {
    // overflow: hidden;
    // text-overflow: ellipsis;
    // white-space: nowrap;
    // margin-top: 8px;
    // 
    // margin-top: 4px;
  }

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