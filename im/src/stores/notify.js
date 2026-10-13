import { defineStore } from "pinia";

// 原 vuex notify 模块
export const useNotifyStore = defineStore("notify", {
  state: () => ({
    // 聊天消息未读数
    unreadNum: 0,

    // 好友申请未读数
    applyNum: 0,

    // 好友键盘事件监听
    inputEvent: 0,

    // 好友登录状态监听
    friendStatus: {
      // 登录状态[0:下线;1:在线;]
      status: 0,
      // 好友ID
      friend_id: 0,
    },
  }),
  actions: {
    // 消息未读数自增
    INCR_UNREAD_NUM() {
      console.log("触发消息未读");
      this.unreadNum++;
    },

    // 好友申请事件监听
    INCR_APPLY_NUM() {
      this.applyNum++;
    },

    // 设置消息未读数
    SET_UNREAD_NUM(value) {
      this.unreadNum = value;
    },

    // 好友申请事件监听
    SET_APPLY_NUM(value) {
      this.applyNum = value;
    },

    // 自增好友键盘输入事件
    UPDATE_KEYBOARD_EVENT() {
      this.inputEvent++;
    },

    // 更新好友登录状态
    UPDATE_FRIEND_STATUS(value) {
      this.friendStatus = value;
    },

    // 原 vuex action ACT_UPDATE_FRIEND_STATUS
    ACT_UPDATE_FRIEND_STATUS(value) {
      return new Promise((resolve) => {
        setTimeout(() => {
          this.UPDATE_FRIEND_STATUS(value);
          resolve();
        }, 0);
      });
    },
  },
});
