import { defineStore } from "pinia";
import config from "@/config/index";

const { setting } = config;

const localSetting = window.localStorage.getItem("setting");

export const useSettingStore = defineStore("setting", {
  state: () => ({
    // 兼容已保存的其他偏好，旧浏览器中的多标签开启状态统一归为关闭。
    setting: { ...setting, ...(localSetting ? JSON.parse(localSetting) : {}), isUseTabsRouter: false },
  }),
  actions: {
    /** 更新其他页面偏好时，仍保持商家多标签模式关闭。 */
    updateSetting(data) {
      this.setting = { ...data, isUseTabsRouter: false };
    },
  },
});
