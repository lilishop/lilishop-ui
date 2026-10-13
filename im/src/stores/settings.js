import { defineStore } from "pinia";
import {
  getToken,
  getUserSettingCache,
  setUserSettingCache,
} from "@/utils/auth";

// 模块加载时合并本地缓存的设置（与原 vuex settings 模块行为一致）
function initState() {
  const state = {
    // 主题模式 true:全屏模式 false:居中模式
    themeMode: true,

    // 主题模式为居中模式下，body 的背景图片
    themeBagImg: "bag003",

    // 主题颜色
    themeColor: "",

    // 消息提示音
    notifyCueTone: true,

    // 键盘输入事件消息推送开关
    keyboardEventNotify: true,
  };
  if (getToken()) {
    Object.assign(state, getUserSettingCache());
  }
  return state;
}

/**
 * 用户相关设置
 */
export const useSettingsStore = defineStore("settings", {
  state: initState,
  actions: {
    // 设置主题模式
    SET_THEME_MODE(mode) {
      this.themeMode = mode;
      setUserSettingCache(this.$state);
    },

    // 设置主题的背景图片
    SET_THEME_BAGIMG(bagName) {
      this.themeBagImg = bagName;
      setUserSettingCache(this.$state);
    },

    // 主题颜色
    SET_THEME_COLOR(color) {
      this.themeColor = color;
      setUserSettingCache(this.$state);
    },

    // 设置消息提示音状态
    SET_NOTIFY_CUE_TONE(isTrue) {
      this.notifyCueTone = isTrue;
      setUserSettingCache(this.$state);
    },

    // 设置键盘输入事件消息推送状态
    SET_KEYBOARD_EVENT_NOTIFY(isTrue) {
      this.keyboardEventNotify = isTrue;
      setUserSettingCache(this.$state);
    },
  },
});
