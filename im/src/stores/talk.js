import { defineStore } from "pinia";
import { getSort, getMutipSort } from "@/utils/functions";

// 原 vuex talks 模块
export const useTalkStore = defineStore("talks", {
  state: () => ({
    // 用户对话列表
    items: [],

    // 最后一条消息
    unreadMessage: {
      num: 0,
      nickname: "未知",
      content: "...",
    },

    // 对话列表重载状态
    heavyLoad: false,
  }),
  getters: {
    // 过滤所有置顶对话列表
    topItems: (state) => {
      return state.items.filter((item) => item.is_top == 1);
    },
    // 原 vuex getter，注意：sort 会原地修改 items 数组（历史行为，原样保留）
    talkItems: (state) => {
      return state.items.sort(
        getMutipSort([getSort((a, b) => a.lastTalkTime > b.lastTalkTime)])
      );
    },
    // 消息未读数总计
    unreadNum: (state) => {
      return state.items.reduce((total, item) => {
        return total + parseInt(item.unread);
      }, 0);
    },
    talkNum: (state) => state.items.length,
  },
  actions: {
    // 设置对话列表
    SET_TALK_ITEMS(resource) {
      this.items = resource.items;
    },

    // 更新对话节点
    UPDATE_TALK_ITEM(resource) {
      let index = this.items.findIndex(
        (item) => item.userId === resource.index_name.split("_")[1]
      );
      if (index >= 0) {
        Object.assign(this.items[index], resource);
      }
    },

    // 新增对话节点
    PUSH_TALK_ITEM(resource) {
      this.items.push(resource);
    },

    // 移除对话节点
    REMOVE_TALK_ITEM(index_name) {
      for (let i in this.items) {
        if (this.items[i].index_name === index_name) {
          this.items.splice(i, 1);
          break;
        }
      }
    },

    // 更新对话消息
    UPDATE_TALK_MESSAGE(resource) {
      let enableGetTalkList = true;
      this.items.forEach((item) => {
        if (
          item.index_name === resource.index_name ||
          item.userId == resource.index_name.split("_")[1]
        ) {
          item.unread++;
          item.msg_text = resource.msg_text;
          item.lastTalkTime = resource.updated_at;
          item.lastTalkMessage = resource.msg_text;
          if (resource.lastMessageType) {
            item.lastMessageType = resource.lastMessageType;
          }
          item.updated_at = resource.updated_at;
          enableGetTalkList = false;
        }
      });
      // 循环如果当前用户不在对话记录列表中 就重新请求对话列表接口
      // 原代码此处为 this.commit('getTalkList')，目标 action 早已被原作者注释删除，
      // vuex 对未知 mutation 仅告警不中断，此处保留为空操作
      if (enableGetTalkList) {
        /* noop */
      }
    },

    // 触发对话列表重新加载
    TRIGGER_TALK_ITEMS_LOAD(status = false) {
      this.heavyLoad = status;
    },

    SET_TLAK_UNREAD_MESSAGE(resource) {
      this.unreadMessage.num++;
      this.unreadMessage.nickname = resource.nickname;
      this.unreadMessage.content = resource.content;
    },

    // 清除最后一条未读消息
    CLEAR_TLAK_UNREAD_MESSAGE() {
      this.unreadMessage = {
        num: 0,
        nickname: "未知",
        content: "...",
      };
    },
  },
});
