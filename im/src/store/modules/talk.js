import { getSort, getMutipSort } from "@/utils/functions";
import { formatTalkItem } from "@/utils/talk";
import { ServeGetTalkList } from "@/api/chat";
import store from '@/store/index.js'
import Vue from 'vue'
const Talk = {
  state: {
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
  },
  getters: {
    // 过滤所有置顶对话列表
    topItems: (state) => {
      return state.items.filter((item) => item.is_top == 1);
    },
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
  mutations: {
   
    // 设置对话列表
    SET_TALK_ITEMS (state, resource) {
      Vue.set(state, 'items', resource.items)
    },

    // 更新对话节点
    UPDATE_TALK_ITEM (state, resource) {
      // console.log("%c 更新对话节点", "color:#32c");
      // console.log("state", state);
      // console.log("resource", resource);

      // console.log("%c 更新对话节点结束", "color:#32c",state.items);
      let index = state.items.findIndex(
        (item) => item.userId === resource.index_name.split("_")[1]
      );
      if (index >= 0) {
        Object.assign(state.items[index], resource);
      }
    },

    // 新增对话节点
    PUSH_TALK_ITEM (state, resource) {
      // console.log(state)
      state.items.push(resource);
    },

    // 移除对话节点
    REMOVE_TALK_ITEM (state, index_name) {
      for (let i in state.items) {
        if (state.items[i].index_name === index_name) {
          state.items.splice(i, 1);
          break;
        }
      }
    },

    // async getTalkList() {
    //   let { code, result } = ServeGetTalkList();
    //   if (code !== 200) return false;

    //   store.commit("SET_TALK_ITEMS", {
    //     items: result.map((item) => formatTalkItem(item)),
    //   });
    // },

    // 更新对话消息
    UPDATE_TALK_MESSAGE (state, resource) {
      // console.log("%c 更新对话消息", "color:green");
      // console.log("state", state);
      // console.log("resource", resource);
      // console.log("%c 更新对话结束", "color:green",state.items);

      let enableGetTalkList = true
      state.items.forEach(item => {
        if (item.userId == resource.index_name.split("_")[1]) {
          item.unread++;
          item.msg_text = resource.msg_text;
          item.lastTalkTime = resource.updated_at;
          item.lastTalkMessage = resource.msg_text;
          item.updated_at = resource.updated_at;
          enableGetTalkList = false
        }
      })
      // 循环如果当前用户不在对话记录列表中 就重新请求对话列表接口
      enableGetTalkList ? this.commit('getTalkList') : ''
    },

    // 触发对话列表重新加载
    TRIGGER_TALK_ITEMS_LOAD (state, status = false) {
      state.heavyLoad = status;
    },

    SET_TLAK_UNREAD_MESSAGE (state, resource) {
      state.unreadMessage.num++;
      state.unreadMessage.nickname = resource.nickname;
      state.unreadMessage.content = resource.content;
    },

    // 清除最后一条未读消息
    CLEAR_TLAK_UNREAD_MESSAGE (state) {
      state.unreadMessage = {
        num: 0,
        nickname: "未知",
        content: "...",
      };
    },
  },
};

export default Talk;
