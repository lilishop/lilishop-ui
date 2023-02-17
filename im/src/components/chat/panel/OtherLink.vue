<template>
  <el-tabs v-model="activeName" @tab-click="handleClick" type="card" :stretch=true>
    <el-tab-pane :label="toUser.storeFlag ? '正在咨询' : '他的足迹'" name="history">
      <div>
        <GoodsLink :goodsDetail="goodsDetail" v-if="toUser.userId === goodsDetail.storeId"
          @sendMessage="submitSendMessage" />
        <FootPrint :list="footPrintList" @loadMore="loadMoreFootPrint()" :orderList="orderPrintList"
          @sendMessage="submitSendMessage" />
      </div>
    </el-tab-pane>
    <el-tab-pane label="店铺信息" name="UserInfo" v-if="toUser.storeFlag">
      <div v-if="toUser.storeFlag">
        <StoreDetail :storeInfo="storeInfo" />
      </div>
    </el-tab-pane>
  </el-tabs>
</template>

<script>
import { Tabs, TabPane } from 'element-ui'
import { ServeGetStoreDetail, ServeGetUserDetail, ServeGetFootPrint, ServeGetOrderPrint, ServeGetGoodsDetail, ServeStoreGetFootPrint,ServeStoreGetOrderPrint } from '@/api/user'
import StoreDetail from "@/components/chat/panel/template/storeDetail.vue";
import FootPrint from "@/components/chat/panel/template/footPrint.vue";
import GoodsLink from "@/components/chat/panel/template/goodsLink.vue";
import SocketInstance from "@/im-server/socket-instance";
import { mapState, mapGetters } from "vuex";
export default {
  components: {
    "el-tabs": Tabs,
    "el-tab-pane": TabPane,
    StoreDetail,
    FootPrint,
    GoodsLink
  },
  props: {
    toUser: {
      type: Object,
      default: null,
    },
    id: {
      type: String,
      default: '',
    },
    goodsParams: {
      type: Object,
      default: null,
    },
  },
  computed: {
    ...mapGetters(["talkItems"]),
    ...mapState({
      index_name: (state) => state.dialogue.index_name,
    }),
  },
  watch:{
    toUser(){
      localStorage.setItem('storeFlag', this.toUser.storeFlag)
      this.footPrintList = []
      this.orderPrintList = []
      this.footPrintParams.pageNumber = 1
      if (this.toUser.storeFlag) {
        this.getStoreDetail()
      } 
      // else {
      //   this.getMemberDetail()
      // }
      this.getFootPrint()
      if (this.goodsParams && this.toUser.storeFlag == true) {
        this.getGoodsDetail()
      }
    }
  },
  data () {
    return {
      activeName: 'history',
      storeInfo: {}, //店铺信息
      memberInfo: {}, //会员信息
      footPrintParams: {
        pageSize: 20,
        pageNumber: 1,
        memberId: '',
        storeId: '',
      },
      goodsDetail: {},
      footPrintList: [], // 商品
      orderPrintList: []// 订单
    }
  },
  mounted () {
    localStorage.setItem('storeFlag', this.toUser.storeFlag)
    if (this.toUser.storeFlag) {
      this.getStoreDetail()
    } 
    // else {
    //   this.getMemberDetail()
    // }
    this.getFootPrint()
    if (this.goodsParams && this.toUser.storeFlag == true) {
      this.getGoodsDetail()
    }
  },
  methods: {
    getStoreDetail () {
      ServeGetStoreDetail(this.toUser.userId).then(res => {
        if (res.success) {
          this.storeInfo = res.result
        }
      })
    },
    loadMoreFootPrint (e) {
      //触底再次调接口
      this.footPrintParams.pageNumber++
      this.getFootPrint()
    },
    handleClick () { },
    // getMemberDetail () {
    //   ServeGetUserDetail(this.toUser.userId).then(res => {
    //     if (res.success) {
    //       this.memberInfo = res.result
    //     }
    //   })
    // },
    getGoodsDetail () {
      if(this.toUser.storeFlag){
        ServeGetGoodsDetail(this.goodsParams).then(res => {
          if (res.success) {
            this.goodsDetail = res.result.data
          }
        })
      }
    },
    getFootPrint() {
      if (this.toUser.storeFlag) {
        this.footPrintParams.memberId = this.id
        this.footPrintParams.storeId = this.toUser.userId
        ServeGetFootPrint(this.footPrintParams).then(res => {
          res.result.records=res.result.records.filter((item)=>{
            return item!=null
          })
          res.result.records.forEach((item, index) => {
            if (localStorage.getItem(item.goodsId)) {
              item.btnHide = 0
            } else {
              item.btnHide = 1
            }
            if (item.goodsId === this.goodsParams.goodsId) {
              res.result.records.splice(index, 1)
            }
          });         
          this.footPrintList.push(...res.result.records)
        })
        // 订单列表
        ServeGetOrderPrint(this.footPrintParams).then((res) => {
          if (res.code == 200) {
            res.result.records.forEach((item) => {
              this.orderPrintList.push({
                ...item,
                btnHide: 1
              })
            })
          }
        })
      } else {
        this.footPrintParams.memberId = this.toUser.userId
        this.footPrintParams.storeId = this.id
        ServeStoreGetFootPrint(this.footPrintParams).then(res => {
          res.result.records=res.result.records.filter((item)=>{
            return item!=null
          })
          res.result.records.forEach((item, index) => {
            if (localStorage.getItem(item.goodsId)) {
              item.btnHide = 0
            } else {
              item.btnHide = 1
            }
            if (item.goodsId === this.goodsParams.goodsId) {
              res.result.records.splice(index, 1)
            }
          });
          this.footPrintList.push(...res.result.records)
        })
        ServeStoreGetOrderPrint(this.footPrintParams).then((res) => {
          if (res.code == 200) {
            res.result.records.forEach((item) => {
              this.orderPrintList.push({
                ...item,
                btnHide: 1
              })
            })
          }
        })
      }
    },

    // 发送消息回调事件
    submitSendMessage (record, context, messageType) {
      SocketInstance.emit("event_talk", record);
      this.$store.commit("UPDATE_TALK_ITEM", {
        index_name: this.index_name,
        draft_text: "",
      });
      /**
       * 插入数据
       */
      const insterChat = {
        createTime: this.formateDateAndTimeToString(new Date()),
        fromUser: this.id,
        toUser: record.to,
        isRead: false,
        messageType: messageType,
        text: context,
        float: "right",
      };

      // 插入对话记录
      this.$store.commit("PUSH_DIALOGUE", insterChat);
      // 获取聊天面板元素节点
      let el = document.getElementById("lumenChatPanel");
      // 判断的滚动条是否在底部
      let isBottom =
        Math.ceil(el.scrollTop) + el.clientHeight >= el.scrollHeight;

      if (isBottom || record.to == this.id) {
        this.$nextTick(() => {
          el.scrollTop = el.scrollHeight;
        });
      } else {
        this.$store.commit("SET_TLAK_UNREAD_MESSAGE", {
          content: content,
          nickname: record.name,
        });
      }

    },

    formateDateAndTimeToString (date) {
      var hours = date.getHours();
      var mins = date.getMinutes();
      var secs = date.getSeconds();
      var msecs = date.getMilliseconds();
      if (hours < 10) hours = "0" + hours;
      if (mins < 10) mins = "0" + mins;
      if (secs < 10) secs = "0" + secs;
      if (msecs < 10) secs = "0" + msecs;
      return (
        this.formatDateToString(date) + " " + hours + ":" + mins + ":" + secs
      );
    },

    formatDateToString (date) {
      var year = date.getFullYear();
      var month = date.getMonth() + 1;
      var day = date.getDate();
      if (month < 10) month = "0" + month;
      if (day < 10) day = "0" + day;
      return year + "-" + month + "-" + day;
    },
  }
}

</script>

<style scoped lang="less">
// /deep/ .el-tabs__nav.is-top {
// }

/deep/ .el-tabs__nav {
  height: 60px;
  line-height: 60px;
}

/deep/ .el-tab-pane {
  // margin-left: 12px;
}
/deep/.el-tabs__nav-scroll{
  min-width: 362px;
}
/deep/ .el-tabs__item{
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}
/deep/ .el-tabs__header{
  margin-bottom: 0;
}
</style>