<template>
  <div class="flex">
    <el-container class="ov-hidden flex-10 full-height ">
      <PanelHeader ref="panelHeader" :data="params" :online="isOnline" :keyboard="inputEvent"
        @event="handleHeaderEvent" />
      <!-- 主体信息 -->
      <el-main class="main-box no-padding">
        <div id="lumenChatPanel" class="talks-container lum-scrollbar" @scroll="talkPanelScroll($event)">
          <!-- 数据加载状态栏 -->
          <div class="loading-toolbar">
            <span v-if="loadRecord.status == 0" class="color-blue">
              <legacy-el-icon name="el-icon-loading" /> 正在加载数据中...
            </span>
            <span v-if="loadRecord.status == 1" class="pointer color-blue" @click="loadChatRecords">
              <legacy-el-icon name="el-icon-bottom" /> 查看更多消息...
            </span>
            <span v-if="loadRecord.status == 2"> 没有更多消息了... </span>
          </div>

          <!-- 消息主体 -->
          <div v-for="(item, idx) in records" :key="idx">
            <!-- 群消息 -->
            <div v-if="item.messageType == 9" class="message-box">
              <invite-message @cat="catFriendDetail" :invite="item.invite" />
            </div>

            <!-- 撤回消息 -->
            <div v-else-if="item.is_revoke == 1" class="message-box">
              <revoke-message :item="item" />
            </div>

            <div v-else-if="item.messageType == 0" class="message-box">
              <system-text-message :content="item.content" />
            </div>

            <!-- 其它对话消息 -->
            <div v-else class="message-box record-box" :class="{
              'direction-rt': item.float == 'right',
              'checkbox-border': multiSelect.isOpen === true,
            }">
              <aside v-show="multiSelect.isOpen" class="checkbox-column">
                <legacy-el-icon name="el-icon-success" :class="{ selected: verifyMultiSelect(item.id) }" @click="triggerMultiSelect(item.id)" />
              </aside>
              <aside class="avatar-column">
                <div class="avatar-box" v-if="item.float == 'right'">
                  <face :text="userFace" v-if="userFace"></face>
                  <face-null :text="name" v-else></face-null>
                </div>
                <div class="avatar-box" v-if="item.float == 'left'">
                  <face :text="toUser.face" v-if="toUser.face"></face>
                  <face-null :text="toUser.name" v-else></face-null>
                </div>
              </aside>
              <main class="main-column">
                <div class="talk-content">
                  <div class="flex flex-a-c">
                    <legacy-el-icon name="el-icon-refresh-left" class="again main-color" @click="againSendMessage(item)" v-if="item.webSocketStatus" />
                    <!-- 文本消息 -->
                    <div v-if="item.messageType == 'MESSAGE'"
                      class="text-message" :class="{
                        left: item.float == 'left',
                        right: item.float == 'right',
                      }">
                      <div class="arrow"></div>
                      <pre v-if="!emojistwo.includes(item.text)" v-html="item.text" />
                      <pre v-if="emojistwo.includes(item.text)" v-html="textReplaceEmoji(item.text)" />
                    </div>
                   
                  </div>
                   <div v-if="item.webSocketStatus" class="tips">网络异常发送失败，请重新发送。</div>

                  <div v-if="item.messageType == 'GOODS' && item.text != null" class="goodsStyle " :class="{
                    left: item.float == 'left',
                    right: item.float == 'right',
                  }">
                    <div class="base" @click="linkToGoods(item.text.goodsId, item.text.id)">
                      <div>
                        <img :src="item.text.thumbnail" :onerror="defaultAvatar" class="image" />
                      </div>
                      <div>
                        <div class="goods_name">
                          <el-tooltip class="item" effect="dark" :content="item.text.goodsName" placement="top-start">
                            <a> {{ item.text.goodsName }} </a>
                          </el-tooltip>
                        </div>
                        <div class="price">
                          <span>{{ $filters.unitPrice(item.text.price, '￥') }}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div v-if="item.messageType == 'ORDER' && item.text != null" class="oderStyle" :class="{
                    left: item.float == 'left',
                    right: item.float == 'right',
                  }" @click="linkToOrders(item.text.sn)">
                  
                    <div class="oedersn">
                      <el-tooltip class="item" effect="dark" :content="item.text.sn" placement="top-start">
                        <a> 订单号:{{ item.text.sn }} </a>
                      </el-tooltip>
                    </div>
                    <div class="goods-shared-box">
                     
                      <div class="goods-item" v-for="(order,orderIndex) in item.text.orderItems" :key="orderIndex">
                        <img :src="order.image" :onerror="defaultAvatar" style="height: 100px;width: 100px;" />
                        <div>
                          <span class="orderGoodsName">{{ order.name }}</span>
                          <div class="goods-item-price">
                           <span>{{ $filters.unitPrice(order.goodsPrice, '￥') }}</span>
                          </div> 
                        </div>
                      </div>
                      <div class="shared-goods">
                      <div class="orderGoodsTime">{{ item.text.paymentTime }}</div>
                      <span class="orderFlowPrice">
                        订单金额：<span>{{ $filters.unitPrice(item.text.flowPrice, '￥') }}</span>
                      </span> 
                      <div class="order-status">
                        <el-tag 
                          size="small"
                          :type="item.text.orderStatus == 'CANCELLED' || item.text.orderStatus == 'UNPAID' || item.text.orderStatus == ' TAKE' ? 'info' : 'danger'">{{
                            item.text.orderStatus == 'CANCELLED' ? '已取消' : item.text.orderStatus == 'UNPAID' ? '未付款' :
                              item.text.orderStatus ==
                                'PAID' ? '已付款' : item.text.orderStatus == 'UNDELIVERED' ? '待发货' : item.text.orderStatus ==
                                  'DELIVERED'
                                  ? '已发货' : item.text.orderStatus == ' COMPLETED' ? '已完成' : item.text.orderStatus == ' TAKE' ?
                                    '待校验' : ''
                          }}</el-tag>
                      </div>
                        </div>
                    </div>
                  </div>
                </div>
              </main>
            </div>

            <!-- 消息时间 -->
            <div v-show="compareTime(idx, item.createTime)" class="datetime no-select"
              v-text="sendTime(unixToDate(item.createTime, 'yyyy-MM-dd hh:mm'))" />
          </div>
        </div>

        <!-- 置底按钮 -->
        <transition name="el-fade-in-linear">
          <div v-show="tipsBoard" class="tips-board pointer" @click="talkPanelScrollBottom">
            <!-- <SvgMentionDown class="svg" /> -->
            <span>回到底部</span>
          </div>
        </transition>

        <!-- 新消息气泡 -->
        <div v-show="tipsBoard && unreadMessage.num" class="talk-bubble pointer no-select"
          @click="talkPanelScrollBottom">
          <legacy-el-icon name="el-icon-chat-dot-round" />
          <span>新消息({{ unreadMessage.num }}条)</span>
          <span>
            &nbsp;#{{ unreadMessage.nickname }}#
            {{ unreadMessage.content }}
          </span>
        </div>
      </el-main>

      <!-- 页脚信息 -->
      <el-footer class="footer-box" height="180">
        <template v-if="multiSelect.isOpen === false">
          <MeEditor @send="submitSendMessage" @keyboard-event="onKeyboardEvent" />
        </template>
        <template v-else>
          <PanelToolbar v-model="multiSelect.items.length" @event="handleMultiMode" />
        </template>
      </el-footer>
      <el-aside width="200px">

      </el-aside>

    </el-container>

    <!-- 消息管理器 -->
    <transition name="el-fade-in-linear">
      <TalkSearchRecord v-if="findChatRecord" :params="{
        talk_type: params.talk_type,
        receiver_id: params.receiver_id,
        title: params.nickname,
      }" @close="findChatRecord = false" />
    </transition>

    <!-- 链接信息 -->
    <OtherLink :toUser="toUser" :id="id" :goodsParams="goodsParams" class="flex-4" />
  </div>
</template>
<script setup>
import {
  computed,
  getCurrentInstance,
  nextTick,
  reactive,
  ref,
  watch,
} from "vue";
import { textReplaceLink } from "@/utils/functions";
import { textReplaceEmoji, emojistwo } from "@/utils/emojis";
import OtherLink from "@/components/chat/panel/OtherLink.vue";
import TalkSearchRecord from "@/components/chat/TalkSearchRecord";
import MeEditor from "@/components/editor/MeEditor";
import PanelHeader from "./PanelHeader";
import PanelToolbar from "./PanelToolbar";
import SocketInstance from "@/im-server/socket-instance";
import { SvgMentionDown } from "@/core/icons";
import { formatTime, parseTime, copyTextToClipboard } from "@/utils/functions";
import { useUserStore } from "@/stores/user";
import { useAppStore } from "@/stores/app";
import { useTalkStore } from "@/stores/talk";
import { useNotifyStore } from "@/stores/notify";
import { useSettingsStore } from "@/stores/settings";
import { useDialogueStore } from "@/stores/dialogue";
import { useEmoticonStore } from "@/stores/emoticon";

import {
  ServeTalkRecords,
  ServeForwardRecords,
  ServeRemoveRecords,
  ServeRevokeRecords,
} from "@/api/chat";

defineOptions({ name: "TalkEditorPanel" });

const props = defineProps({
  // 对话相关参数
  params: {
    type: Object,
    default: function () {
      return {
        // 消息来源（1：好友私信 2:群聊）
        talk_type: 0,
        // 消息接收者ID（好友ID或者群聊ID）
        receiver_id: 0,
        nickname: "",
      };
    },
  },
  goodsParams: {
    type: Object,
    default: null,
  },

  // 用户是否在线
  isOnline: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["close-talk"]);

// 全局属性（$notify/$contacts/$user/$contextmenu）通过实例代理访问，行为与原 this.$xxx 一致
const { proxy } = getCurrentInstance();

const userStore = useUserStore();
const appStore = useAppStore();
const talkStore = useTalkStore();
const notifyStore = useNotifyStore();
const settingsStore = useSettingsStore();
const dialogueStore = useDialogueStore();
const emoticonStore = useEmoticonStore();

// 记录加载相关参数
const loadRecord = reactive({
  status: 0,
  minRecord: 0,
  pageSize: 10,
  pageNumber: 0,
});

// 多选相关操作
const multiSelect = ref({
  isOpen: false,
  items: [],
  mode: 0,
});

// 群组Box
const group = reactive({
  panel: false,
  notice: false,
});

// 键盘输入事件
const keyboardEvent = reactive({
  isShow: false,
  time: 0,
});

// 聊天记录管理器数据
const findChatRecord = ref(false);

// 置底按钮是否显示
const tipsBoard = ref(false);

// 防止并发请求导致 loading 状态错乱
let recordsRequestId = 0;

// PanelHeader 组件实例（模板 ref="panelHeader"）
const panelHeader = ref(null);

const talkItems = computed(() => talkStore.talkItems);
const name = computed(() => userStore.name);
// 不能命名为 face：会遮蔽 <face> 组件解析，头像 URL 会被当作标签名渲染
const userFace = computed(() => userStore.face);
const unreadMessage = computed(() => talkStore.unreadMessage);
const inputEvent = computed(() => notifyStore.inputEvent);
const id = computed(() => userStore.id);
const records = computed(() => dialogueStore.records);
const index_name = computed(() => dialogueStore.index_name);
const toUser = computed(() => userStore.toUser);
// 商品/订单图片加载失败时的默认图（onerror 属性值）
const defaultAvatar = computed(() => appStore.defaultAvatar);

const sendTime = formatTime;

// 监听面板传递参数（含首次挂载）
watch(
  () => props.params,
  () => {
    resetRecordState();
    loadChatRecords();
  },
  { immediate: true }
);

// 处理 Header 组件事件
function handleHeaderEvent(event_name) {
  switch (event_name) {
    case "history":
      findChatRecord.value = true;
      break;
    case "notice":
      group.notice = true;
      break;
    case "setting":
      group.panel = true;
      break;
  }
}
// linkTo(type,val){
//   if(type === 'GOODS'){
//     let routeUrl = this.$router.resolve({
//       path: '/goodsDetail',
//       query: { skuId:val.id, goodsId:val.goodsId }
//     });
//   window.open(routeUrl.href, '_blank');
//   }
// },
// #TODO 冗余代码

function formatDateToString(date) {
  var year = date.getFullYear();
  var month = date.getMonth() + 1;
  var day = date.getDate();
  if (month < 10) month = "0" + month;
  if (day < 10) day = "0" + day;
  return year + "-" + month + "-" + day;
}

/**
 * 将unix时间戳转换为指定格式
 * @param unix   时间戳【秒】
 * @param format 转换格式
 * @returns {*|string}
 */
function unixToDate(unix, format) {
  if (!unix) return unix;
  let _format = format || "yyyy-MM-dd hh:mm:ss";
  const d = new Date(unix);
  const o = {
    "M+": d.getMonth() + 1,
    "d+": d.getDate(),
    "h+": d.getHours(),
    "m+": d.getMinutes(),
    "s+": d.getSeconds(),
    "q+": Math.floor((d.getMonth() + 3) / 3),
    S: d.getMilliseconds(),
  };
  if (/(y+)/.test(_format))
    _format = _format.replace(
      RegExp.$1,
      (d.getFullYear() + "").substr(4 - RegExp.$1.length)
    );
  for (const k in o)
    if (new RegExp("(" + k + ")").test(_format))
      _format = _format.replace(
        RegExp.$1,
        RegExp.$1.length === 1
          ? o[k]
          : ("00" + o[k]).substr(("" + o[k]).length)
      );
  return _format;
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
// #冗余代码结束

// 重新发送消息
function againSendMessage(val) {

  submitSendMessage(val.text)
}

// 回车键发送消息回调事件
function submitSendMessage(content) {
  const record = {
    operation_type: "MESSAGE",
    to: props.params.receiver_id,
    from: id.value,
    message_type: "MESSAGE",
    context: content,
    talk_id: props.params.talkId,
  };
  // if (record.messageType == 'MESSAGE"') {
  //   record.text = textReplaceEmoji(record.content)
  // }
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
    messageType: "MESSAGE",
    text: content,
    float: "right",
  };
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
}

// 推送编辑事件消息
function onKeyboardEvent(text) {
  talkStore.UPDATE_TALK_ITEM({
    index_name: index_name.value,
    draft_text: text,
  });

  // 判断当前对话是否属于私聊信息
  if (props.params.talk_type == 2 || !props.isOnline) return;

  // 判断是否推送键盘输入事件消息
  if (!settingsStore.keyboardEventNotify) {
    return false;
  }

  let time = new Date().getTime();
  // 判断在两秒内是否已推送事件
  if (keyboardEvent.time != 0 && time - keyboardEvent.time < 2000)
    return;

  keyboardEvent.time = time;

  // 调用父类Websocket组件发送消息
  SocketInstance.emit("event_keyboard", {
    sender_id: id.value,
    receiver_id: props.params.receiver_id,
  });
}



function resetRecordState() {
  loadRecord.minRecord = 0;
  loadRecord.pageNumber = 0;
  tipsBoard.value = false;
  multiSelect.value = {
    isOpen: false,
    items: [],
    mode: 0,
  };
}

// 加载用户聊天详情信息
function loadChatRecords() {
  if (!props.params.talkId) {
    loadRecord.status = 2;
    return;
  }

  const isFirstPage = loadRecord.pageNumber === 0;
  if (isFirstPage) {
    loadRecord.pageNumber = 1;
  } else {
    loadRecord.pageNumber = loadRecord.pageNumber + 1;
  }

  const user_id = id.value;
  const data = {
    pageNumber: loadRecord.pageNumber,
    pageSize: loadRecord.pageSize,
    talkId: props.params.talkId,
  };
  loadRecord.status = 0;

  const requestId = ++recordsRequestId;
  let el = document.getElementById('lumenChatPanel');
  let scrollHeight = el ? el.scrollHeight : 0;

  ServeTalkRecords(data).then((res) => {
    if (requestId !== recordsRequestId) return;
    if (res.code !== 200 || !Array.isArray(res.result)) {
      loadRecord.status = 2;
      return;
    }
    const records = res.result.map((item) => {
      let key = new Date().getTime();
      item.float = "center";
      if (item.toUser > 0) {
        item.float = item.fromUser == user_id ? "right" : "left";
      }
      if (item.messageType == 'GOODS') {
        item.text = JSON.parse(item.text);
      }
      if (item.messageType == 'ORDER') {
        item.text = JSON.parse(item.text);
      }
      return { ...item, [key]: key };
    });
    dialogueStore.UNSHIFT_DIALOGUE(records);
    loadRecord.status = records.length ? 1 : 2;
    nextTick(() => {
      if (!el) return;
      if (isFirstPage) {
        el.scrollTop = el.scrollHeight;
      } else {
        el.scrollTop = el.scrollHeight - scrollHeight;
      }
    });
  }).catch(() => {
    if (requestId !== recordsRequestId) return;
    loadRecord.status = 2;
  });
}

// 多选处理方式
function handleMultiMode(value) {
  if (value == "close") {
    closeMultiSelect();
    return false;
  }

  if (multiSelect.value.items.length <= 1) {
    return false;
  }

  if (value == "forward" || value == "merge_forward") {
    multiSelect.value.mode = value == "forward" ? 1 : 2;
    if (verifyMultiSelectType(3)) {
      proxy.$notify({
        title: "消息转发",
        message: "会话记录不支持合并转发",
      });
      return false;
    }

    proxy.$contacts({
      confirm: confirmSelectContacts,
    });
  } else if (value == "delete") {
    multiSelect.value.mode = 3;

    // 批量删除
    let ids = multiSelect.value.items;
    ServeRemoveRecords({
      talk_type: props.params.talk_type,
      receiver_id: props.params.receiver_id,
      record_id: ids.join(","),
    }).then((res) => {
      if (res.code == 200) {
        delRecords(ids).closeMultiSelect();
      }
    });
  }
}

// 确认消息转发联系人事件
function confirmSelectContacts(data) {
  let user_ids = [];
  let group_ids = [];
  data.forEach((item) => {
    if (item.type == 1) {
      user_ids.push(item.id);
    } else {
      group_ids.push(item.id);
    }
  });

  ServeForwardRecords({
    forward_mode: multiSelect.value.mode,
    talk_type: props.params.talk_type,
    receiver_id: props.params.receiver_id,
    records_ids: multiSelect.value.items,
    receive_user_ids: user_ids,
    receive_group_ids: group_ids,
  }).then((res) => {
    if (res.code == 200) {
      closeMultiSelect();
      proxy.$notify({
        title: "消息转发",
        message: "消息转发成功...",
        type: "success",
      });
    }
  });
}

// 处理消息时间是否显示
function compareTime(index, datetime) {
  if (datetime == undefined) {
    return false;
  }
  if (typeof datetime == "number") {
    datetime = unixToDate(datetime, "yyyy-MM-dd hh:mm");
  }

  if (records.value[index].is_revoke == 1) {
    return false;
  }

  datetime = datetime.replace(/-/g, "/");
  let time = Math.floor(Date.parse(datetime) / 1000);
  let currTime = Math.floor(new Date().getTime() / 1000);

  // 当前时间5分钟内时间不显示
  if (currTime - time < 300) return false;

  // 判断是否是最后一条消息,最后一条消息默认显示时间
  if (index == records.value.length - 1) {
    return true;
  }

  let nextDate = records.value[index + 1].createTime.replace(/-/g, "/");

  return !(
    parseTime(new Date(datetime), "{y}-{m}-{d} {h}:{i}") ==
    parseTime(new Date(nextDate), "{y}-{m}-{d} {h}:{i}")
  );
}

// 查看好友用户信息
function catFriendDetail(value) {
  proxy.$user(value);
}

// 撤回消息
function revokeRecords(index, item) {
  ServeRevokeRecords({
    record_id: item.id,
  }).then((res) => {
    if (res.code == 200) {
      dialogueStore.UPDATE_DIALOGUE({ id: item.id, is_revoke: 1 });
    }
  });
}

// 删除消息
function removeRecords(index, item) {
  let receiver_id = item.receiver_id;
  if (item.talk_type == 1 && item.user_id != id.value) {
    receiver_id = item.user_id;
  }

  ServeRemoveRecords({
    talk_type: item.talk_type,
    receiver_id: receiver_id,
    record_id: item.id.toString(),
  }).then((res) => {
    if (res.code == 200) {
      dialogueStore.DELETE_DIALOGUE(index);
    }
  });
}

// 从列表中删除记录
function delRecords(arr) {
  dialogueStore.BATCH_DELETE_DIALOGUE(arr);
  // 原代码 return this 供链式调用 closeMultiSelect
  return { closeMultiSelect };
}

// 开启多选模式
function openMultiSelect() {
  multiSelect.value.isOpen = true;
}

// 关闭多选模式
function closeMultiSelect() {
  multiSelect.value.isOpen = false;
  multiSelect.value.items = [];
}

// 判断记录是否选中
function verifyMultiSelect(records_id) {
  return multiSelect.value.items.indexOf(records_id) >= 0;
}

// 触发多选事件
function triggerMultiSelect(records_id) {
  let i = multiSelect.value.items.indexOf(records_id);
  if (i >= 0) {
    multiSelect.value.items.splice(i, 1);
  } else {
    if (multiSelect.value.items.length >= 30) {
      proxy.$notify({
        title: "温馨提示",
        message: "批量操作最大支持30条数据...",
      });
      return false;
    }
    multiSelect.value.items.push(records_id);
  }
}

// 验证是否存在选择的指定类型的消息
function verifyMultiSelectType(type) {
  return records.value.some((item) => {
    return verifyMultiSelect(item.id) && item.messageType == type;
  });
}

// 消息点击右键触发自定义菜单
function onCopy(idx, item, event) {
  let menus = [];
  let content = "";
  if (document.getElementById("copy_class_" + item.id)) {
    content = document.getElementById("copy_class_" + item.id).innerText;
  }

  if (content) {
    menus.push({
      label: "复制",
      icon: "el-icon-document-copy",
      customClass: "cus-contextmenu-item",
      onClick: () => {
        copyTextToClipboard(content);
      },
    });
  }

  if (item.user_id == id.value) {
    let time =
      new Date().getTime() - Date.parse(item.createTime.replace(/-/g, "/"));
    if (Math.floor(time / 1000 / 60) < 2) {
      menus.push({
        label: "撤回",
        icon: "el-icon-s-flag",
        customClass: "cus-contextmenu-item",
        onClick: () => {
          revokeRecords(idx, item);
        },
      });
    }
  }

  menus.push({
    label: "删除",
    icon: "el-icon-delete",
    customClass: "cus-contextmenu-item",
    onClick: () => {
      removeRecords(idx, item);
    },
  });

  menus.push({
    label: "引用",
    icon: "el-icon-connection",
    customClass: "cus-contextmenu-item",
    onClick: () => { },
  });

  menus.push({
    label: "多选",
    icon: "el-icon-finished",
    customClass: "cus-contextmenu-item",
    onClick: () => {
      openMultiSelect();
    },
  });

  // 判断是否是图片消息
  if (item.messageType == 2 && item.file.file_type == 1) {
    menus.push({
      label: "收藏",
      icon: "el-icon-picture",
      customClass: "cus-contextmenu-item",
      onClick: () => {
        emoticonStore.SAVE_USER_EMOTICON({
          record_id: item.id,
        });
      },
    });
  }

  proxy.$contextmenu({
    items: menus,
    event,
    customClass: "cus-contextmenu",
    zIndex: 3,
    minWidth: 120,
  });

  closeMultiSelect();
  event.preventDefault();
}

function hideChatGroup() {
  group.panel = false;
}

// 修改群聊免打扰状态
function disturbChange(detail) {
  talkStore.UPDATE_TALK_ITEM({
    index_name: `2_${props.params.receiver_id}`,
    is_disturb: parseInt(detail.status),
  });
}

// 退出群聊回调事件
function quitGroupSuccess() {
  emit("close-talk");
}

// 同步群信息
function syncGroupInfo(groupInfo) {
  panelHeader.value.setGroupNum(groupInfo.members_num);
}

// 对话面板滚动事件
function talkPanelScroll(e) {
  if (e.target.scrollTop == 0 && loadRecord.status == 1) {
    loadChatRecords();
    return;
  }

  const height = e.target.scrollTop + e.target.clientHeight + 5;
  tipsBoard.value = height < e.target.scrollHeight;
  if (tipsBoard.value == false && unreadMessage.value.num > 0) {
    talkStore.CLEAR_TLAK_UNREAD_MESSAGE();
  }
}

// 聊天版本滚动到底部
function talkPanelScrollBottom() {
  let el = document.getElementById("lumenChatPanel");
  el.scrollTop = el.scrollHeight;
}
</script>
<style lang="less" scoped>
.flex-a-c{
  align-items: center;
  >div{
    margin-left: 10px;
  }
}
.tips{
  margin-top:10px;
  color: #999;
  font-size: 12px;
}
.again{
  margin-top: 5px;
  cursor: pointer;
}

.oderStyle {
  border: 1px solid #f2f2f2;
  width: 330px;
  border-radius: 4px;
  padding: 8px;

  .oedersn {
    margin: 10px 0 10px 0;
    width: 300px;
    font-size: 12px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.goodsStyle {
  cursor: pointer;
  border: 1px solid #f2f2f2;
  width: 300px;
  height: 120px;
  display: flex;
  border-radius: 4px;

  .goods_name {
    color: black;
    width: 150px;
    font-size: 15px;
    color: #333333;
    margin-top: 30px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .image {
    height: 70px;
    margin-top: 3px;
    width: 70px;
    background-size: cover;
    margin: 20px;
  }

  .price {
    color: red;
    margin-top: 20px;
  }

  .base {
    display: flex;
  }
}

.orderSn {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap
}

.orderGoodsName {
  width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  // white-space: nowrap;

  font-size: 14px;
 
}

.orderGoodsTime {
  font-size: 12px;
  color: #999;
}

.orderFlowPrice {
  color: #999;
  
  font-size: 12px;
  >span{
    color: red;
    font-size: 18px;
  }
}
.goods-item-price{
  margin-top: 10px;
  font-size: 13px;
   color: red;
}

.main-box {
  position: relative;
}

/* 面板页脚 */
.footer-box {
  height: 160px !important;
  padding: 0;
  border-top: 1px solid #f5f5f5;
}

/* 侧边栏css */
.sidebar-box {
  position: absolute;
  width: 350px;
  height: 100%;
  top: 0px;
  right: -350px;
  z-index: 1;
  background: white;
  transition: all 0.5s ease-in-out;
  -moz-transition: all 0.5s ease-in-out;
  -webkit-transition: all 0.5s ease-in-out;
  -o-transition: all 0.5s ease-in-out;

  &.show {
    right: 0;
    box-shadow: 0 0 14px #e2e1e1;
  }
}

.tips-board {
  display: flex;
  justify-content: center;
  align-items: center;
  position: absolute;
  left: 0;
  right: 0;
  margin: 0 auto;
  bottom: 20px;
  height: 30px;
  width: 100px;
  border-radius: 20px;
  font-size: 12px;
  background-color: #fff;
  box-shadow: 0 2.5px 10px 0 rgba(31, 35, 41, 0.1);
  color: #1f2329;

  span {
    margin-left: 5px;
    margin-top: -2px;
  }

  .svg {
    width: 10px;
    height: 10px;
    color: black;
  }
}


// .base {
//   margin-top: 5px;
//   height: 120px;
//   display: flex;

//   div {
//     width: 100px;
//     // overflow: hidden;
//     // text-overflow: ellipsis;
//     margin-top: 8px;
//     // white-space: nowrap;
//   }

//   .image {
//     height: 100px;
//     margin-top: 3px;
//     width: 100px
//   }

// }

.talk-bubble {
  position: absolute;
  left: 0px;
  bottom: 20px;
  max-width: 300px;
  height: 40px;
  line-height: 40px;
  border-radius: 0 20px 20px 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: white;
  padding: 0 15px 0 30px;
  font-size: 13px;
  background: #409eff;

  i {
    font-size: 22px;
    position: absolute;
    left: 5px;
    top: 9px;
  }
}

.talks-container {
  height: 100%;
  width: 100%;
  box-sizing: border-box;
  padding: 10px 15px 30px;
  overflow-y: auto;

  .message-box {
    width: 100%;
    min-height: 30px;
    margin-bottom: 5px;
  }

  .loading-toolbar {
    height: 30px;
    line-height: 30px;
    margin: 5px 0;
    text-align: center;
    user-select: none;
    font-size: 13px;
    color: #cec4c4;

    .color-blue {
      color: #409eff;
    }
  }

  .datetime {
    height: 30px;
    line-height: 30px;
    color: #ccc9c9;
    font-size: 12px;
    text-align: center;
    margin: 5px 0;
  }

  .record-box {
    display: flex;
    flex-direction: row;
    transition: 0.5s ease;

    .checkbox-column {
      display: flex;
      justify-content: center;
      flex-basis: 40px;
      flex-shrink: 0;
      order: 1;
      user-select: none;
      padding-top: 8px;

      i {
        color: #ccc;
        cursor: pointer;
        font-size: 22px;

        &.selected {
          color: #409eff !important;
        }
      }
    }

    .avatar-column {
      width: 40px;
      flex-basis: 40px;
      flex-shrink: 0;
      display: flex;
      align-items: center;
      order: 2;
      user-select: none;
      padding-top: 5px;
      flex-direction: column;
    }

    .main-column {
      flex: 1 auto;
      order: 3;
      position: relative;
      box-sizing: border-box;
      padding: 5px;
      overflow: hidden;

      .talk-title {
        display: flex;
        align-items: center;
        height: 15px;
        margin-bottom: 2px;
        font-size: 10px;
        user-select: none;
        color: #a7a0a0;
        opacity: 0;
        transition: 0.5s ease;

        &.show {
          opacity: 1 !important;
        }

        span {
          transform: scale(0.9);
        }
      }

      .talk-content {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        box-sizing: border-box;
        width: 100%;
      }

      &:hover {
        .talk-title {
          opacity: 1;
        }
      }
    }

    &.direction-rt {
      .avatar-column {
        order: 3;
      }

      .main-column {
        order: 2;

        .talk-title {
          justify-content: flex-end;
        }

        .talk-content {
          align-items: flex-end;
        }
      }
    }

    &.checkbox-border {
      border: 1px dashed #c4c4ec;

      &:hover {
        border-color: #409eff;
      }
    }
  }
}

@bg-left-color: #f2f2f2;
@bg-right-color: #409eff;

.text-message {
  position: relative;
  min-width: 30px;
  min-height: 30px;
  border-radius: 5px;
  padding: 5px;

  .arrow {
    position: absolute;
    width: 0;
    height: 0;
    font-size: 0;
    border: 5px solid;
    top: 6px;
    left: -10px;
  }

  &.max-width {
    max-width: calc(100% - 50px);
  }

  &.left {
    color: #3a3a3a;
    background: @bg-left-color;

    .arrow {
      border-color: transparent @bg-left-color transparent transparent;
    }
  }

  &.right {
    color: #fff;
    background: @bg-right-color;

    .arrow {
      right: -10px;
      left: unset;
      border-color: transparent transparent transparent @bg-right-color;
    }
  }

  pre {
    white-space: pre-wrap;
    overflow: hidden;
    word-break: break-word;
    word-wrap: break-word;
    font-size: 15px;
    padding: 3px 10px;
    font-family: "Microsoft YaHei";
    line-height: 25px;
  }
}
.goods-shared-box{
   cursor: pointer;
  >.goods-item{
   
    margin: 10px 0;
    display: flex;
    border-bottom: 1px solid #ededed;
    align-items: center;
  }
  >.shared-goods{
    padding-left: 10px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }
}
.order-status{
  text-align: right;
}
</style>
