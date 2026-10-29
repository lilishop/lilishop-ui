<template>
  <el-tabs v-model="activeName" @tab-click="handleClick" :stretch=true>
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

<script setup>
import { computed, nextTick, onMounted, reactive, ref, watch } from "vue";
import { useRoute } from "vue-router";
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
import { useTalkStore } from "@/stores/talk";
import { useDialogueStore } from "@/stores/dialogue";
import { getToken } from "@/utils/auth";
// 与 computed 属性同名，改用别名导入
import { isBuyerImMode as isBuyerImModeFn } from "@/utils/im-mode";

const SIDE_REQUEST_OPTIONS = { skipAuthDialog: true };

const props = defineProps({
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
});

const talkStore = useTalkStore();
const dialogueStore = useDialogueStore();
const route = useRoute();

const activeName = ref("history");
const storeInfo = ref({});
const memberInfo = ref({});
const footPrintParams = reactive({
  pageSize: 20,
  pageNumber: 1,
  memberId: "",
  storeId: "",
});
const goodsDetail = ref({});
const footPrintList = ref([]);
const orderPrintList = ref([]);

const talkItems = computed(() => talkStore.talkItems);
const index_name = computed(() => dialogueStore.index_name);
const isBuyerImMode = computed(() => isBuyerImModeFn(route));

watch(
  () => props.toUser,
  () => {
    syncStoreFlagCache();
    resetSidePanelData();
    if (props.toUser.storeFlag) {
      getStoreDetail();
    }
    getFootPrint();
    if (props.goodsParams && props.toUser.storeFlag) {
      getGoodsDetail();
    }
  }
);

onMounted(() => {
  syncStoreFlagCache();
  if (props.toUser.storeFlag) {
    getStoreDetail();
  }
  getFootPrint();
  if (props.goodsParams && props.toUser.storeFlag) {
    getGoodsDetail();
  }
});

function syncStoreFlagCache() {
  localStorage.setItem(
    "storeFlag",
    isBuyerImMode.value ? "true" : "false"
  );
}

function resetSidePanelData() {
  footPrintList.value = [];
  orderPrintList.value = [];
  footPrintParams.pageNumber = 1;
}

function getStoreDetail() {
  ServeGetStoreDetail(props.toUser.userId, SIDE_REQUEST_OPTIONS)
    .then((res) => {
      if (res.success) {
        storeInfo.value = res.result;
      }
    })
    .catch(() => {});
}

function loadMoreFootPrint() {
  footPrintParams.pageNumber++;
  getFootPrint();
}

function handleClick() {}

function getGoodsDetail() {
  if (!props.toUser.storeFlag) {
    return;
  }
  if (!props.goodsParams || !props.goodsParams.goodsId) {
    return;
  }
  ServeGetGoodsDetail(props.goodsParams, SIDE_REQUEST_OPTIONS)
    .then((res) => {
      if (res.success) {
        goodsDetail.value = res.result.data;
      }
    })
    .catch(() => {});
}

function normalizeFootPrintRecords(records = []) {
  const goodsId = props.goodsParams?.goodsId;
  return records
    .filter((item) => item != null)
    .filter((item) => !goodsId || item.goodsId !== goodsId)
    .map((item) => ({
      ...item,
      btnHide: localStorage.getItem(item.goodsId) ? 0 : 1,
    }));
}

function normalizeOrderRecords(records = []) {
  return records.map((item) => ({
    ...item,
    btnHide: 1,
  }));
}

function getFootPrint() {
  if (!getToken()) {
    return;
  }
  if (!props.toUser?.userId || !props.id) {
    return;
  }

  if (isBuyerImMode.value) {
    footPrintParams.memberId = props.id;
    footPrintParams.storeId = props.toUser.userId;
    fetchBuyerSideData();
  } else {
    footPrintParams.memberId = props.toUser.userId;
    footPrintParams.storeId = props.id;
    fetchStoreSideData();
  }
}

function fetchBuyerSideData() {
  ServeGetFootPrint(footPrintParams, SIDE_REQUEST_OPTIONS)
    .then((res) => {
      if (res?.result?.records) {
        footPrintList.value.push(
          ...normalizeFootPrintRecords(res.result.records)
        );
      }
    })
    .catch(() => {});

  ServeGetOrderPrint(footPrintParams, SIDE_REQUEST_OPTIONS)
    .then((res) => {
      if (res?.code === 200 && res?.result?.records) {
        orderPrintList.value.push(
          ...normalizeOrderRecords(res.result.records)
        );
      }
    })
    .catch(() => {});
}

function fetchStoreSideData() {
  ServeStoreGetFootPrint(footPrintParams, SIDE_REQUEST_OPTIONS)
    .then((res) => {
      if (res?.result?.records) {
        footPrintList.value.push(
          ...normalizeFootPrintRecords(res.result.records)
        );
      }
    })
    .catch(() => {});

  ServeStoreGetOrderPrint(footPrintParams, SIDE_REQUEST_OPTIONS)
    .then((res) => {
      if (res?.code === 200 && res?.result?.records) {
        orderPrintList.value.push(
          ...normalizeOrderRecords(res.result.records)
        );
      }
    })
    .catch(() => {});
}

function submitSendMessage(record, context, messageType) {
  SocketInstance.emit("event_talk", record);
  talkStore.UPDATE_TALK_ITEM({
    index_name: index_name.value,
    draft_text: "",
  });
  const insterChat = {
    createTime: formateDateAndTimeToString(new Date()),
    fromUser: props.id,
    toUser: record.to,
    isRead: false,
    messageType: messageType,
    text: context,
    float: "right",
  };

  dialogueStore.PUSH_DIALOGUE(insterChat);
  let el = document.getElementById("lumenChatPanel");
  let isBottom =
    Math.ceil(el.scrollTop) + el.clientHeight >= el.scrollHeight;

  if (isBottom || record.to == props.id) {
    nextTick(() => {
      el.scrollTop = el.scrollHeight;
    });
  } else {
    talkStore.SET_TLAK_UNREAD_MESSAGE({
      content: context,
      nickname: record.name,
    });
  }
}

function formateDateAndTimeToString(date) {
  var hours = date.getHours();
  var mins = date.getMinutes();
  var secs = date.getSeconds();
  var msecs = date.getMilliseconds();
  if (hours < 10) hours = "0" + hours;
  if (mins < 10) mins = "0" + mins;
  if (secs < 10) secs = "0" + secs;
  if (msecs < 10) secs = "0" + msecs;
  return (
    formatDateToString(date) + " " + hours + ":" + mins + ":" + secs
  );
}

function formatDateToString(date) {
  var year = date.getFullYear();
  var month = date.getMonth() + 1;
  var day = date.getDate();
  if (month < 10) month = "0" + month;
  if (day < 10) day = "0" + day;
  return year + "-" + month + "-" + day;
}
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

/* 高度链：tabs 撑满面板，pane 高度传递给内部滚动容器 */
:deep(.el-tabs) {
  height: 100%;
  display: flex;
  flex-direction: column;
}

:deep(.el-tabs__content) {
  flex: 1;
  min-height: 0;
}

:deep(.el-tab-pane) {
  height: 100%;
}
</style>
