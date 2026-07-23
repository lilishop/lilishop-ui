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
import {
  ServeGetStoreDetail,
  ServeGetFootPrint,
  ServeGetOrderPrint,
  ServeGetGoodsDetail,
  ServeStoreGetFootPrint,
  ServeStoreGetOrderPrint,
} from "@/api/user";
import StoreDetail from "@/components/chat/panel/template/storeDetail.vue";
import FootPrint from "@/components/chat/panel/template/footPrint.vue";
import GoodsLink from "@/components/chat/panel/template/goodsLink.vue";
import SocketInstance from "@/im-server/socket-instance";
import { mapState, mapGetters } from "vuex";
import { getToken } from "@/utils/auth";
import { isBuyerImMode } from "@/utils/im-mode";

const SIDE_REQUEST_OPTIONS = { skipAuthDialog: true };

export default {
  components: {
    StoreDetail,
    FootPrint,
    GoodsLink,
  },
  props: {
    toUser: {
      type: Object,
      default: null,
    },
    id: {
      type: String,
      default: "",
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
    isBuyerImMode() {
      return isBuyerImMode(this.$route);
    },
  },
  watch: {
    toUser() {
      this.syncStoreFlagCache();
      this.resetSidePanelData();
      if (this.toUser.storeFlag) {
        this.getStoreDetail();
      }
      this.getFootPrint();
      if (this.goodsParams && this.toUser.storeFlag) {
        this.getGoodsDetail();
      }
    },
  },
  data() {
    return {
      activeName: "history",
      storeInfo: {},
      memberInfo: {},
      footPrintParams: {
        pageSize: 20,
        pageNumber: 1,
        memberId: "",
        storeId: "",
      },
      goodsDetail: {},
      footPrintList: [],
      orderPrintList: [],
    };
  },
  mounted() {
    this.syncStoreFlagCache();
    if (this.toUser.storeFlag) {
      this.getStoreDetail();
    }
    this.getFootPrint();
    if (this.goodsParams && this.toUser.storeFlag) {
      this.getGoodsDetail();
    }
  },
  methods: {
    syncStoreFlagCache() {
      localStorage.setItem(
        "storeFlag",
        this.isBuyerImMode ? "true" : "false"
      );
    },
    resetSidePanelData() {
      this.footPrintList = [];
      this.orderPrintList = [];
      this.footPrintParams.pageNumber = 1;
    },
    getStoreDetail() {
      ServeGetStoreDetail(this.toUser.userId, SIDE_REQUEST_OPTIONS)
        .then((res) => {
          if (res.success) {
            this.storeInfo = res.result;
          }
        })
        .catch(() => {});
    },
    loadMoreFootPrint() {
      this.footPrintParams.pageNumber++;
      this.getFootPrint();
    },
    handleClick() {},
    getGoodsDetail() {
      if (!this.toUser.storeFlag) {
        return;
      }
      if (!this.goodsParams || !this.goodsParams.goodsId) {
        return;
      }
      ServeGetGoodsDetail(this.goodsParams, SIDE_REQUEST_OPTIONS)
        .then((res) => {
          if (res.success) {
            this.goodsDetail = res.result.data;
          }
        })
        .catch(() => {});
    },
    normalizeFootPrintRecords(records = []) {
      const goodsId = this.goodsParams?.goodsId;
      return records
        .filter((item) => item != null)
        .filter((item) => !goodsId || item.goodsId !== goodsId)
        .map((item) => ({
          ...item,
          btnHide: localStorage.getItem(item.goodsId) ? 0 : 1,
        }));
    },
    normalizeOrderRecords(records = []) {
      return records.map((item) => ({
        ...item,
        btnHide: 1,
      }));
    },
    getFootPrint() {
      if (!getToken()) {
        return;
      }
      if (!this.toUser?.userId || !this.id) {
        return;
      }

      if (this.isBuyerImMode) {
        this.footPrintParams.memberId = this.id;
        this.footPrintParams.storeId = this.toUser.userId;
        this.fetchBuyerSideData();
      } else {
        this.footPrintParams.memberId = this.toUser.userId;
        this.footPrintParams.storeId = this.id;
        this.fetchStoreSideData();
      }
    },
    fetchBuyerSideData() {
      ServeGetFootPrint(this.footPrintParams, SIDE_REQUEST_OPTIONS)
        .then((res) => {
          if (res?.result?.records) {
            this.footPrintList.push(
              ...this.normalizeFootPrintRecords(res.result.records)
            );
          }
        })
        .catch(() => {});

      ServeGetOrderPrint(this.footPrintParams, SIDE_REQUEST_OPTIONS)
        .then((res) => {
          if (res?.code === 200 && res?.result?.records) {
            this.orderPrintList.push(
              ...this.normalizeOrderRecords(res.result.records)
            );
          }
        })
        .catch(() => {});
    },
    fetchStoreSideData() {
      ServeStoreGetFootPrint(this.footPrintParams, SIDE_REQUEST_OPTIONS)
        .then((res) => {
          if (res?.result?.records) {
            this.footPrintList.push(
              ...this.normalizeFootPrintRecords(res.result.records)
            );
          }
        })
        .catch(() => {});

      ServeStoreGetOrderPrint(this.footPrintParams, SIDE_REQUEST_OPTIONS)
        .then((res) => {
          if (res?.code === 200 && res?.result?.records) {
            this.orderPrintList.push(
              ...this.normalizeOrderRecords(res.result.records)
            );
          }
        })
        .catch(() => {});
    },

    submitSendMessage(record, context, messageType) {
      SocketInstance.emit("event_talk", record);
      this.$store.commit("UPDATE_TALK_ITEM", {
        index_name: this.index_name,
        draft_text: "",
      });
      const insterChat = {
        createTime: this.formateDateAndTimeToString(new Date()),
        fromUser: this.id,
        toUser: record.to,
        isRead: false,
        messageType: messageType,
        text: context,
        float: "right",
      };

      this.$store.commit("PUSH_DIALOGUE", insterChat);
      let el = document.getElementById("lumenChatPanel");
      let isBottom =
        Math.ceil(el.scrollTop) + el.clientHeight >= el.scrollHeight;

      if (isBottom || record.to == this.id) {
        this.$nextTick(() => {
          el.scrollTop = el.scrollHeight;
        });
      } else {
        this.$store.commit("SET_TLAK_UNREAD_MESSAGE", {
          content: context,
          nickname: record.name,
        });
      }
    },

    formateDateAndTimeToString(date) {
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

    formatDateToString(date) {
      var year = date.getFullYear();
      var month = date.getMonth() + 1;
      var day = date.getDate();
      if (month < 10) month = "0" + month;
      if (day < 10) day = "0" + day;
      return year + "-" + month + "-" + day;
    },
  },
};
</script>

<style scoped lang="less">
:deep(.el-tabs__nav ) {
  height: 60px;
  line-height: 60px;
}

:deep(.el-tab-pane ) {
  // margin-left: 12px;
}
:deep(.el-tabs__nav-scroll) {
  min-width: 362px;
}
:deep(.el-tabs__item) {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}
:deep(.el-tabs__header) {
  margin-bottom: 0;
}
</style>
