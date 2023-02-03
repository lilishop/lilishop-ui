import Base from "./base";
import Vue from "vue";
import router from "@/router";
import vm from "@/main";
import NewMessageNotify from "@/components/notify/NewMessageNotify";
import { ServeClearTalkUnreadNum, ServeCreateTalkList } from "@/api/chat";
import { formatTalkItem, findTalkIndex, toTalk } from "@/utils/talk";
import { parseTime } from "@/utils/functions";

import mixin from '@/mixins/main-mixin'
/**
 * 好友状态事件
 */
class Talk extends Base {
  /**
   * @var resource 资源
   */
  resource;

  /**
   * 发送者ID
   */
  sender_id = 0;

  /**
   * 接收者ID
   */
  receiver_id = 0;

  /**
   * 聊天类型[1:私聊;2:群聊;]
   */
  talk_type = 0;

  /**
   * 初始化构造方法
   *
   * @param {Object} resource Socket消息
   */
  constructor(resource) {
    super();
    this.sender_id = resource.fromUser; //发送
    this.receiver_id = resource.toUser; //接收
    this.talk_type = resource.messageType; //类型

    this.resource = resource;

    // 判断发送者消息是否在当前用户列表中 
    if (this.sender_id && !vm.$store.state.talks.items.find(item => {
      return item.userId == this.sender_id
    })) {
      // 没有当前用户，未在当前列表 进行重新加载
      vm.loadUserSetting('update')
    }
  }

  /**
   * 判断消息发送者是否来自于我
   * @returns
   */
  isCurrSender () {
    // console.log("sender_id", this.sender_id);
    return this.sender_id == this.getAccountId();
  }

  /**
   * 获取对话索引
   *
   * @return String
   */
  getIndexName () {
    if (this.talk_type == 2) {
      return `${this.talk_type}_${this.receiver_id}`;
    }

    let receiver_id = this.isCurrSender() ? this.receiver_id : this.sender_id;

    return `${this.talk_type}_${receiver_id}`;
  }

  /**
   * 消息浮动方式
   *
   * @returns
   */
  getFloatType () {
    let userId = this.resource.userId;

    if (userId == 0) return "center";

    return userId == this.getAccountId() ? "right" : "left";
  }

  /**
   * 获取聊天列表左侧的对话信息
   */
  getTalkText () {
    let text = this.resource.content || this.resource.text;
    switch (this.resource.msg_type) {
      case 'GOODS':
        text = "[商品链接]";
        break;
      case 'ORDERS':
        text = "[订单链接]";
        break;
    }

    return text;
  }

  handle () {
    let store = this.getStoreInstance();
    // console.log("触发handle");
    // 判断当前是否在聊天页面
    if (!this.isTalkPage()) {
      store.commit("INCR_UNREAD_NUM");

      // 判断消息是否来自于我自己，否则会提示消息通知
      return !this.isCurrSender() && this.showMessageNocice();
    }
    // console.log("this.receiver_id", this.receiver_id);
    // console.log("this.sender_id", this.sender_id);
    let isTrue = this.isTalk(1, this.receiver_id, this.sender_id);
    // console.log("判断当前是否正在和好友对话", isTrue);
    // 判断当前是否正在和好友对话
    if (isTrue) {
      this.insertTalkRecord();
    } else {
      this.updateTalkItem();
    }
  }

  /**
   * 显示消息提示
   * @returns
   */
  showMessageNocice () {
    let avatar = this.resource.avatar;
    let nickname = this.resource.nickname;
    let talk_type = this.resource.talk_type;
    let receiver_id = this.receiver_id;

    if (talk_type == 2) {
      avatar = this.resource.group_avatar;
      nickname += `【 ${this.resource.group_name} 】`;
    } else {
      receiver_id = this.sender_id;
    }

    this.$notify({
      message: vm.$createElement(NewMessageNotify, {
        props: {
          avatar,
          talk_type,
          nickname,
          content: this.getTalkText(),
          datetime: this.resource.created_at,
        },
      }),
      customClass: "im-notify",
      duration: 3000,
      position: "top-right",
      onClick: function () {
        this.close();
        toTalk(talk_type, receiver_id);
      },
    });
  }

  /**
   * 加载对接节点
   */
  addTalkItem () {
    let receiver_id = this.sender_id;
    let talk_type = this.talk_type;

    if (talk_type == 1 && this.receiver_id != this.getAccountId()) {
      receiver_id = this.receiver_id;
    } else if (talk_type == 2) {
      receiver_id = this.receiver_id;
    }
    // console.log("加载对接节点", this.resource);

    ServeCreateTalkList(receiver_id).then(({ code, data }) => {
      if (code == 200) {
        this.getStoreInstance().commit("PUSH_TALK_ITEM", formatTalkItem(data));
      }
    });
  }

  /**
   * 插入对话记录
   */
  insertTalkRecord () {
    let store = this.getStoreInstance();
    let record = this.resource;
    // console.log("插入谈话记录", record);

    record.float = this.getFloatType();

    store.commit("PUSH_DIALOGUE", record);

    // 获取聊天面板元素节点
    let el = document.getElementById("lumenChatPanel");

    // 判断的滚动条是否在底部
    let isBottom = Math.ceil(el.scrollTop) + el.clientHeight >= el.scrollHeight;

    if (
      isBottom ||
      record.userId == this.getAccountId() ||
      record.fromUser == this.getAccountId()
    ) {
      Vue.nextTick(() => {
        el.scrollTop = el.scrollHeight;
      });
    } else {
      // console.log("%c SET_TLAK_UNREAD_MESSAGE %c", "color:red");
      store.commit("SET_TLAK_UNREAD_MESSAGE", {
        content: this.getTalkText(),
        nickname: record.name,
      });
    }
    // console.log("%c 准备更新...UPDATE_TALK_ITEM ", "color:red");

    store.commit("UPDATE_TALK_ITEM", {
      index_name: this.getIndexName(),
      msg_text: this.getTalkText() || record.text,
      updated_at: parseTime(new Date()),
    });

    if (this.talk_type == 1 && this.getAccountId() !== this.sender_id) {
      // console.log("%c 清除 未读数...ServeClearTalkUnreadNum ", "color:blue");
      ServeClearTalkUnreadNum({
        talk_type: 1,
        receiver_id: this.sender_id,
      });
    }
  }

  /**
   * 更新对话列表记录
   */
  updateTalkItem () {
    let store = this.getStoreInstance();

    store.commit("INCR_UNREAD_NUM");

    store.commit("UPDATE_TALK_MESSAGE", {
      index_name: this.getIndexName(),
      msg_text: this.getTalkText(),
      updated_at: parseTime(new Date()),
    });
  }
}

export default Talk;
