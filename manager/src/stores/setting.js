import { defineStore } from "pinia";
import config from "@/config";

const { setting } = config;

const localSetting = window.localStorage.getItem("admin-setting");

export const useSettingStore = defineStore("setting", {
  state: () => ({
    setting: localSetting ? JSON.parse(localSetting) : setting,
  }),
  actions: {
    updateSetting(data) {
      this.setting = data;
    },
  },
});
