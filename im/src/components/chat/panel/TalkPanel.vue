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
              <i class="el-icon-loading" /> 正在加载数据中...
            </span>
            <span v-if="loadRecord.status == 1" class="pointer color-blue" @click="loadChatRecords">
              <i class="el-icon-bottom" /> 查看更多消息...
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
                <i class="el-icon-success" :class="{ selected: verifyMultiSelect(item.id) }"
                  @click="triggerMultiSelect(item.id)" />
              </aside>
              <aside class="avatar-column">
                <div class="avatar-box" v-if="item.float == 'right'">
                  <face :text="face" v-if="face"></face>
                  <face-null :text="name" v-else></face-null>
                </div>
                <div class="avatar-box" v-if="item.float == 'left'">
                  <face :text="toUser.face" v-if="toUser.face"></face>
                  <face-null :text="toUser.name" v-else></face-null>
                </div>
              </aside>
              <main class="main-column">
                <div class="talk-content">
                  <span class="nickname">
                    {{ item.float == "right" ? name : toUser.name }} |
                    {{ unixToDate(item.createTime, "MM月dd日 hh:mm") }}
                  </span>
                  <div class="flex flex-a-c">
                    <i @click="againSendMessage(item)" v-if="item.webSocketStatus" class="el-icon-refresh-left again main-color"></i>
                    <!-- 文本消息 -->
                    <div v-if="item.messageType == 'MESSAGE'" style="background-color: #d0e9ff;color: black;"
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
                        <img :src="item.text.thumbnail" class="image" />
                      </div>
                      <div>
                        <div class="goods_name">
                          <el-tooltip class="item" effect="dark" :content="item.text.goodsName" placement="top-start">
                            <a> {{ item.text.goodsName }} </a>
                          </el-tooltip>
                        </div>
                        <div class="price">
                          <span>{{ item.text.price | unitPrice('￥') }}</span>
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
                        <img :src="order.image" style="height: 100px;width: 100px;" />
                        <div>
                          <span class="orderGoodsName">{{ order.name }}</span>
                          <div class="goods-item-price">
                           <span>{{ order.goodsPrice | unitPrice('￥') }}</span>
                          </div> 
                        </div>
                      </div>
                      <div class="shared-goods">
                      <div class="orderGoodsTime">{{ item.text.paymentTime }}</div>
                      <span class="orderFlowPrice">
                        订单金额：<span>{{ item.text.flowPrice | unitPrice('￥') }}</span>
                      </span> 
                      <div class="order-status">
                        <el-tag 
                          size="mini"
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
          <i class="el-icon-chat-dot-round" />
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
<script>
import { textReplaceLink } from "@/utils/functions";
import { textReplaceEmoji, emojistwo } from "@/utils/emojis";
import OtherLink from "@/components/chat/panel/OtherLink.vue";
import { mapState, mapGetters } from "vuex";
import TalkSearchRecord from "@/components/chat/TalkSearchRecord";
import MeEditor from "@/components/editor/MeEditor";
import PanelHeader from "./PanelHeader";
import PanelToolbar from "./PanelToolbar";
import SocketInstance from "@/im-server/socket-instance";
import { SvgMentionDown } from "@/core/icons";
import { formatTime, parseTime, copyTextToClipboard } from "@/utils/functions";
import { unitPrice } from '@/plugins/filters';

import {
  ServeTalkRecords,
  ServeForwardRecords,
  ServeRemoveRecords,
  ServeRevokeRecords,
} from "@/api/chat";

export default {
  name: "TalkEditorPanel",
  components: {
    MeEditor,
    OtherLink,
    TalkSearchRecord,
    SvgMentionDown,
    PanelToolbar,
    PanelHeader,
  },
  props: {
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
  },
  data () {
    return {
      // 记录加载相关参数
      textReplaceEmoji,
      emojistwo,
      textReplaceLink,
      loadRecord: {
        status: 0,
        minRecord: 0,
        pageSize: 10,
        pageNumber: 0,
      },

      // 多选相关操作
      multiSelect: {
        isOpen: false,
        items: [],
        mode: 0,
      },

      // 群组Box
      group: {
        panel: false,
        notice: false,
      },

      // 键盘输入事件
      keyboardEvent: {
        isShow: false,
        time: 0,
      },

      // 聊天记录管理器数据
      findChatRecord: false,

      // 置底按钮是否显示
      tipsBoard: false,
    };
  },

  computed: {
    ...mapGetters(["talkItems"]),
    ...mapState({
      name: (state) => state.user.name,
      face: (state) => state.user.face,
      unreadMessage: (state) => state.talks.unreadMessage,
      inputEvent: (state) => state.notify.inputEvent,
      id: (state) => state.user.id,
      records: (state) => state.dialogue.records,
      index_name: (state) => state.dialogue.index_name,
      toUser: (state) => state.user.toUser,
    }),
  },
  watch: {
    // 监听面板传递参数
    params () {
      this.loadRecord.minRecord = 0;
      this.tipsBoard = false;
      this.multiSelect = {
        isOpen: false,
        items: [],
        mode: 0,
      };
      this.loadChatRecords();

    },
  },
  mounted () {
    this.loadChatRecords();
  },
  methods: {
    parseTime,
    sendTime: formatTime,

    // 处理 Header 组件事件
    handleHeaderEvent (event_name) {
      switch (event_name) {
        case "history":
          this.findChatRecord = true;
          break;
        case "notice":
          this.group.notice = true;
          break;
        case "setting":
          this.group.panel = true;
          break;
      }
    },
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

    formatDateToString (date) {
      var year = date.getFullYear();
      var month = date.getMonth() + 1;
      var day = date.getDate();
      if (month < 10) month = "0" + month;
      if (day < 10) day = "0" + day;
      return year + "-" + month + "-" + day;
    },

    /**
     * 将unix时间戳转换为指定格式
     * @param unix   时间戳【秒】
     * @param format 转换格式
     * @returns {*|string}
     */
    unixToDate (unix, format) {
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
    // #冗余代码结束

    // 重新发送消息
    againSendMessage(val){
     
      this.submitSendMessage(val.text)
    },

    // 回车键发送消息回调事件
    submitSendMessage (content) {
      const record = {
        operation_type: "MESSAGE",
        to: this.params.receiver_id,
        from: this.id,
        message_type: "MESSAGE",
        context: content,
        talk_id: this.params.talkId,
      };
      // if (record.messageType == 'MESSAGE"') {
      //   record.text = this.textReplaceEmoji(record.content)
      // }
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
        messageType: "MESSAGE",
        text: content,
        float: "right",
      };
      // console.log("插入对话记录",'')
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

    // 推送编辑事件消息
    onKeyboardEvent (text) {
      this.$store.commit("UPDATE_TALK_ITEM", {
        index_name: this.index_name,
        draft_text: text,
      });

      // 判断当前对话是否属于私聊信息
      if (this.params.talk_type == 2 || !this.isOnline) return;

      // 判断是否推送键盘输入事件消息
      if (!this.$store.state.settings.keyboardEventNotify) {
        return false;
      }

      let time = new Date().getTime();
      // 判断在两秒内是否已推送事件
      if (this.keyboardEvent.time != 0 && time - this.keyboardEvent.time < 2000)
        return;

      this.keyboardEvent.time = time;

      // 调用父类Websocket组件发送消息
      SocketInstance.emit("event_keyboard", {
        sender_id: this.id,
        receiver_id: this.params.receiver_id,
      });
    },



    // 加载用户聊天详情信息
    loadChatRecords () {
      if (this.loadRecord.pageNumber === 0 || this.params.clickFlag) {
        this.loadRecord.pageNumber = 1
        this.params.clickFlag = false
      } else {
        this.loadRecord.pageNumber = this.loadRecord.pageNumber + 1
      }
      const user_id = this.id;
      const data = {
        pageNumber: this.loadRecord.pageNumber,
        pageSize: this.loadChatRecords.pageSize,
        talkId: this.params.talkId,
      };
      this.loadRecord.status = 0;

      let el = document.getElementById('lumenChatPanel')
      let scrollHeight = el.scrollHeight
      ServeTalkRecords(data).then((res) => {
        // 防止点击切换过快消息返回延迟，导致信息错误
        // console.log("读取历史数据", res);
        const records = res.result.map((item) => {
          let key = new Date().getTime();
          item.float = "center";
          if (item.toUser > 0) {
            item.float = item.fromUser == user_id ? "right" : "left";
          }
          if (item.messageType == 'GOODS') {
            item.text = JSON.parse(item.text)
          }
          // if (item.messageType == 'MESSAGE"') {
          //   item.text = this.textReplaceEmoji(item.text)
          // }
          if (item.messageType == 'ORDER') {
            item.text = JSON.parse(item.text)
          }
          return { ...item, [key]: key };
        });
        this.$store.commit("UNSHIFT_DIALOGUE", records);
        records.length
          ? (this.loadRecord.status = 1)
          : (this.loadRecord.status = 2);
        this.$nextTick(() => {
          // if (data.record_id == 0 || !data.record_id) {
          if (data.record_id == 0 || data.pageNumber == 1) {
            el.scrollTop = el.scrollHeight
          } else {
            el.scrollTop = el.scrollHeight - scrollHeight
          }
        })
      });
    },

    // 多选处理方式
    handleMultiMode (value) {
      if (value == "close") {
        this.closeMultiSelect();
        return false;
      }

      if (this.multiSelect.items.length <= 1) {
        return false;
      }

      if (value == "forward" || value == "merge_forward") {
        this.multiSelect.mode = value == "forward" ? 1 : 2;
        if (this.verifyMultiSelectType(3)) {
          this.$notify({
            title: "消息转发",
            message: "会话记录不支持合并转发",
          });
          return false;
        }

        this.$contacts({
          confirm: this.confirmSelectContacts,
        });
      } else if (value == "delete") {
        this.multiSelect.mode = 3;

        // 批量删除
        let ids = this.multiSelect.items;
        ServeRemoveRecords({
          talk_type: this.params.talk_type,
          receiver_id: this.params.receiver_id,
          record_id: ids.join(","),
        }).then((res) => {
          if (res.code == 200) {
            this.delRecords(ids).closeMultiSelect();
          }
        });
      }
    },

    // 确认消息转发联系人事件
    confirmSelectContacts (data) {
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
        forward_mode: this.multiSelect.mode,
        talk_type: this.params.talk_type,
        receiver_id: this.params.receiver_id,
        records_ids: this.multiSelect.items,
        receive_user_ids: user_ids,
        receive_group_ids: group_ids,
      }).then((res) => {
        if (res.code == 200) {
          this.closeMultiSelect();
          this.$notify({
            title: "消息转发",
            message: "消息转发成功...",
            type: "success",
          });
        }
      });
    },

    // 处理消息时间是否显示
    compareTime (index, datetime) {
      if (datetime == undefined) {
        return false;
      }
      if (typeof datetime == "number") {
        datetime = this.unixToDate(datetime, "yyyy-MM-dd hh:mm");
      }

      if (this.records[index].is_revoke == 1) {
        return false;
      }

      datetime = datetime.replace(/-/g, "/");
      let time = Math.floor(Date.parse(datetime) / 1000);
      let currTime = Math.floor(new Date().getTime() / 1000);

      // 当前时间5分钟内时间不显示
      if (currTime - time < 300) return false;

      // 判断是否是最后一条消息,最后一条消息默认显示时间
      if (index == this.records.length - 1) {
        return true;
      }

      let nextDate = this.records[index + 1].createTime.replace(/-/g, "/");

      return !(
        parseTime(new Date(datetime), "{y}-{m}-{d} {h}:{i}") ==
        parseTime(new Date(nextDate), "{y}-{m}-{d} {h}:{i}")
      );
    },

    // 查看好友用户信息
    catFriendDetail (value) {
      this.$user(value);
    },

    // 撤回消息
    revokeRecords (index, item) {
      ServeRevokeRecords({
        record_id: item.id,
      }).then((res) => {
        if (res.code == 200) {
          this.$store.commit("UPDATE_DIALOGUE", { id: item.id, is_revoke: 1 });
        }
      });
    },

    // 删除消息
    removeRecords (index, item) {
      let receiver_id = item.receiver_id;
      if (item.talk_type == 1 && item.user_id != this.id) {
        receiver_id = item.user_id;
      }

      ServeRemoveRecords({
        talk_type: item.talk_type,
        receiver_id: receiver_id,
        record_id: item.id.toString(),
      }).then((res) => {
        if (res.code == 200) {
          this.$store.commit("DELETE_DIALOGUE", index);
        }
      });
    },

    // 从列表中删除记录
    delRecords (arr) {
      this.$store.commit("BATCH_DELETE_DIALOGUE", arr);
      return this;
    },

    // 开启多选模式
    openMultiSelect () {
      this.multiSelect.isOpen = true;
    },

    // 关闭多选模式
    closeMultiSelect () {
      this.multiSelect.isOpen = false;
      this.multiSelect.items = [];
    },

    // 判断记录是否选中
    verifyMultiSelect (records_id) {
      return this.multiSelect.items.indexOf(records_id) >= 0;
    },

    // 触发多选事件
    triggerMultiSelect (records_id) {
      let i = this.multiSelect.items.indexOf(records_id);
      if (i >= 0) {
        this.multiSelect.items.splice(i, 1);
      } else {
        if (this.multiSelect.items.length >= 30) {
          this.$notify({
            title: "温馨提示",
            message: "批量操作最大支持30条数据...",
          });
          return false;
        }
        this.multiSelect.items.push(records_id);
      }
    },

    // 验证是否存在选择的指定类型的消息
    verifyMultiSelectType (type) {
      return this.records.some((item) => {
        return this.verifyMultiSelect(item.id) && item.messageType == type;
      });
    },

    // 消息点击右键触发自定义菜单
    onCopy (idx, item, event) {
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

      if (item.user_id == this.id) {
        let time =
          new Date().getTime() - Date.parse(item.createTime.replace(/-/g, "/"));
        if (Math.floor(time / 1000 / 60) < 2) {
          menus.push({
            label: "撤回",
            icon: "el-icon-s-flag",
            customClass: "cus-contextmenu-item",
            onClick: () => {
              this.revokeRecords(idx, item);
            },
          });
        }
      }

      menus.push({
        label: "删除",
        icon: "el-icon-delete",
        customClass: "cus-contextmenu-item",
        onClick: () => {
          this.removeRecords(idx, item);
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
          this.openMultiSelect();
        },
      });

      // 判断是否是图片消息
      if (item.messageType == 2 && item.file.file_type == 1) {
        menus.push({
          label: "收藏",
          icon: "el-icon-picture",
          customClass: "cus-contextmenu-item",
          onClick: () => {
            this.$store.commit("SAVE_USER_EMOTICON", {
              record_id: item.id,
            });
          },
        });
      }

      this.$contextmenu({
        items: menus,
        event,
        customClass: "cus-contextmenu",
        zIndex: 3,
        minWidth: 120,
      });

      this.closeMultiSelect();
      event.preventDefault();
    },

    hideChatGroup () {
      this.group.panel = false;
    },

    // 修改群聊免打扰状态
    disturbChange (detail) {
      this.$store.commit("UPDATE_TALK_ITEM", {
        index_name: `2_${this.params.receiver_id}`,
        is_disturb: parseInt(detail.status),
      });
    },

    // 退出群聊回调事件
    quitGroupSuccess () {
      this.$emit("close-talk");
    },

    // 同步群信息
    syncGroupInfo (groupInfo) {
      this.$refs.panelHeader.setGroupNum(groupInfo.members_num);
    },

    // 对话面板滚动事件
    talkPanelScroll (e) {
      if (e.target.scrollTop == 0 && this.loadRecord.status == 1) {
        this.loadChatRecords();
        return;
      }

      const height = e.target.scrollTop + e.target.clientHeight + 5;
      this.tipsBoard = height < e.target.scrollHeight;
      if (this.tipsBoard == false && this.unreadMessage.num > 0) {
        this.$store.commit("CLEAR_TLAK_UNREAD_MESSAGE");
      }
    },

    // 聊天版本滚动到底部
    talkPanelScrollBottom () {
      let el = document.getElementById("lumenChatPanel");
      el.scrollTop = el.scrollHeight;
    },
  },
};
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
      padding-top: 25px;

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
      padding-top: 22px;
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

        .nickname {
          font-size: 12px;
          color: #a7a0a0;
          margin: -4px 0 4px -8px;
          transform: scale(0.9);
        }
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

@bg-left-color: #f5f5f5;
@bg-right-color: #ffffff;

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
