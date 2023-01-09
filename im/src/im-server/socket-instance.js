import store from "@/store";
import config from "@/config/config";
import WsSocket from "@/plugins/ws-socket";
import { getToken } from "@/utils/auth";
import { Notification } from "element-ui";

// 引入消息处理类
import KeyboardEvent from "@/im-server/event/keyboard";
import LoginEvent from "@/im-server/event/login";
import TalkEvent from "@/im-server/event/talk";
import RevokeEvent from "@/im-server/event/revoke";
import GroupJoinEvent from "@/im-server/event/group-join";
import FriendApplyEvent from "@/im-server/event/friend-apply";

/**
 * SocketInstance 连接实例
 *
 * 注释: 所有 WebSocket 消息接收处理在此实例中处理
 */
class SocketInstance {
  /**
   * WsSocket 实例
   */
  socket;

  /**
   * SocketInstance 初始化实例
   */
  constructor() {
    this.socket = new WsSocket(
      () => {
        return `${config.BASE_WS_URL}/` + getToken();
      },
      {
        onError: (evt) => {
          console.log("Websocket 连接失败回调方法");
        },
        // Websocket 连接成功回调方法
        onOpen: (evt) => {
          this.updateSocketStatus(true);
        },
        // Websocket 断开连接回调方法
        onClose: (evt) => {
          this.updateSocketStatus(false);
        },
      }
    );

    this.registerEvents();
  }

  // 连接 WebSocket 服务
  connect () {
    console.log("🔗连接 WebSocket");
    this.socket.connection();
  }

  /**
   * 注册回调消息处理事件
   */
  registerEvents () {
    this.socket.on("event_talk", (data) => {
      console.log("接收到消息,event_talk", data);
      new TalkEvent(data).handle();
    });

    this.socket.on("event_online_status", (data) => {
      new LoginEvent(data).handle();
    });

    this.socket.on("event_keyboard", (data) => {
      console.log("推送", data);
      new KeyboardEvent(data).handle();
    });

    this.socket.on("event_revoke_talk", (data) => {
      new RevokeEvent(data).handle();
    });

    this.socket.on("event_friend_apply", (data) => {
      new FriendApplyEvent(data).handle();
    });

    this.socket.on("join_group", (data) => {
      new GroupJoinEvent(data).handle();
    });

    this.socket.on("event_error", (data) => {
      Notification({
        title: "友情提示",
        message: data.message,
        type: "warning",
      });
    });
  }

  /**
   * 更新 WebSocket 连接状态
   *
   * @param {Boolean} status 连接状态
   */
  updateSocketStatus (status) {
    store.commit("UPDATE_SOCKET_STATUS", status);
  }

  /**
   * 推送消息
   *
   * @param {String} event 事件名
   * @param {Object} data 数据
   */
  emit (event, data) {
    this.socket.emit(event, data);
  }
}

export default new SocketInstance();
