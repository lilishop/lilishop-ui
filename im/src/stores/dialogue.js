import { defineStore } from "pinia";

// 原 vuex dialogue 模块
export const useDialogueStore = defineStore("dialogue", {
  state: () => ({
    // 对话来源[1:私聊;2:群聊]
    talk_type: 0,

    // 接收者ID
    receiver_id: 0,

    is_robot: 0,

    // 聊天记录
    records: [
      {
        id: "",
        createTime: "",
        toUser: "",
        isRead: false,
        messageType: "",
        talkId: "",
        text: "",
        float: "",
      },
    ],
    webSocketWithOut: false, // ws 是否是掉线 无输出状态
    // 对话索引（聊天对话的唯一索引）
    index_name: null,
  }),
  actions: {
    // 设置ws状态
    SET_WS_STATUS(resource) {
      this.webSocketWithOut = resource;
    },

    // 更新对话
    UPDATE_DIALOGUE_MESSAGE(resource) {
      this.records = [];
      this.talk_type = parseInt(resource.talk_type);
      this.receiver_id = parseInt(resource.receiver_id);
      this.is_robot = parseInt(resource.is_robot);

      /**
       * receiver_id 就是 好友id
       * 比如 a 和 b 聊天  receiver_id = b的id
       */
      this.index_name = (resource.talk_type || 1) + "_" + resource.receiver_id;
    },

    // 数组头部压入对话记录
    UNSHIFT_DIALOGUE(records) {
      if (this.records.length > 0) {
        this.records.unshift(...records);
      } else {
        this.records.push(...records);
      }
    },

    // 推送对话记录
    PUSH_DIALOGUE(record) {
      record = { ...record, webSocketStatus: this.webSocketWithOut };
      console.log("推送对话");
      this.records.push(record);
    },

    // 更新对话记录
    UPDATE_DIALOGUE(resource) {
      for (let i in this.records) {
        if (this.records[i].id === resource.id) {
          Object.assign(this.records[i], resource);
          break;
        }
      }
    },

    // 删除对话记录
    DELETE_DIALOGUE(index) {
      this.records.splice(index, 1);
    },

    BATCH_DELETE_DIALOGUE(ids) {
      ids.forEach((record_id) => {
        let index = this.records.findIndex((item) => item.id == record_id);
        if (index >= 0) this.records.splice(index, 1);
      });
    },

    // 数组头部压入对话记录
    SET_DIALOGUE(records) {
      this.records = records;
    },
  },
});
