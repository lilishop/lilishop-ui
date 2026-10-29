<template>
  <div class="current-preview">
    当前浏览
    <div class="base">
      <div>
        <img :src="goodsDetail.thumbnail" :onerror="defaultAvatar" class="image" />
      </div>
      <div style="margin-left: 13px">
        <a @click="linkToGoods(goodsDetail.goodsId, goodsDetail.id)"> {{ goodsDetail.goodsName }} </a>
        <div>
          <span style="color: red;">{{ $filters.unitPrice(goodsDetail.price, '￥') }}</span>
        </div>
        <div v-if="hide">
          <el-button class="store-button" type="danger" v-if="btnHide == 1 && toUser.storeFlag" size="small"
            @click="submitSendMessage()" plain>发送</el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, nextTick, ref } from "vue";
import SocketInstance from "@/im-server/socket-instance";
import { useUserStore } from "@/stores/user";
import { useAppStore } from "@/stores/app";
import { useDialogueStore } from "@/stores/dialogue";
import { useTalkStore } from "@/stores/talk";

const userStore = useUserStore();
const appStore = useAppStore();
const dialogueStore = useDialogueStore();
const talkStore = useTalkStore();

const props = defineProps({
  goodsDetail: {
    type: Object,
    default: null,
  },
});

const btnHide = ref(undefined);
const hide = ref(true);

const talkItems = computed(() => talkStore.talkItems);
const id = computed(() => userStore.id);
const index_name = computed(() => dialogueStore.index_name);
const toUser = computed(() => userStore.toUser);
// 图片加载失败时的默认图（onerror 属性值）
const defaultAvatar = computed(() => appStore.defaultAvatar);

onMounted(() => {
  console.log(props.goodsDetail)
  btnHide.value = localStorage.getItem('btnHide')
});

function toGoods () {
  alert("toGoods")
}
function toMessage () {
  alert(JSON.stringify(toUser.value))
  alert("toMessage")
}
// 回车键发送消息回调事件
function submitSendMessage () {
  console.log("发送");
  const context = props.goodsDetail
  const record = {
    operation_type: "MESSAGE",
    to: toUser.value.userId,
    from: id.value,
    message_type: "GOODS",
    context: context,
    talk_id: toUser.value.id,
  };
  SocketInstance.emit("event_talk", record);

  talkStore.UPDATE_TALK_ITEM({
    index_name: index_name.value,
    draft_text: "",
  });


  /**
   * 插入数据
   */
  const insterChat = {
    createTime: formateDateAndTimeToString(new Date()),
    fromUser: id.value,
    toUser: record.to,
    isRead: false,
    messageType: "GOODS",
    text: context,
    float: "right",
  };

  console.log("insterChat", insterChat);
  // console.log("插入对话记录",'')
  // 插入对话记录
  dialogueStore.PUSH_DIALOGUE(insterChat);
  // 获取聊天面板元素节点
  let el = document.getElementById("lumenChatPanel");
  // 判断的滚动条是否在底部
  let isBottom =
    Math.ceil(el.scrollTop) + el.clientHeight >= el.scrollHeight;

  if (isBottom || record.to == id.value) {
    nextTick(() => {
      el.scrollTop = el.scrollHeight;
    });
  } else {
    talkStore.SET_TLAK_UNREAD_MESSAGE({
      content: content,
      nickname: record.name,
    });
  }
  // 发送后隐藏按钮  0：隐藏 1：显示
  localStorage.setItem('btnHide', 0)
  hide.value = false
}

function formateDateAndTimeToString (date) {
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

function formatDateToString (date) {
  var year = date.getFullYear();
  var month = date.getMonth() + 1;
  var day = date.getDate();
  if (month < 10) month = "0" + month;
  if (day < 10) day = "0" + day;
  return year + "-" + month + "-" + day;
}
</script>

<style scoped lang="less">
.store-button {
  background-color: white;
  border-color: #F56C6C;
}
.current-preview{
  padding: 16px;
}

.base {
  margin-top: 5px;
  height: 120px;
  display: flex;

  div {
    overflow: hidden;
    text-overflow: ellipsis;
    margin-top: 8px;
    white-space: nowrap;
    margin-top: 8px;
  }

  .image {
    height: 100px;
    margin-top: 3px;
    width: 100px;
  }

}

.click-button {
  margin-top: 8px;
  background-color: white;
  border-color: #F56C6C;
}

.separate {
  margin-top: 8px;
}
</style>