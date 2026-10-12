import { defineStore } from "pinia";
import storage from "@/plugins/storage.js";
import defaultLogo from "@/assets/images/logo2.png";

export const useAppStore = defineStore("app", {
  state: () => ({
    navList: [],
    cartNum: storage.getItem("cartNum") || 0,
    unreadMsg: 0,
    logoImg: storage.getItem("logoImg") || defaultLogo,
    siteName: storage.getItem("siteName") || "lilishop",
    hotWordsList: storage.getItem("hotWordsList"),
    category: (() => {
      try {
        const raw = localStorage.getItem("category");
        return raw ? JSON.parse(raw) : null;
      } catch {
        return null;
      }
    })(),
  }),
  actions: {
    setCategory(data) {
      this.category = data;
    },
    setNavList(data) {
      this.navList = data;
    },
    setCartNum(data) {
      this.cartNum = data;
    },
    setUnreadMsg(data) {
      this.unreadMsg = Number(data) || 0;
    },
    setHotWords(data) {
      this.hotWordsList = data;
    },
    setLogoImg(data) {
      this.logoImg = data;
    },
    setSiteName(data) {
      this.siteName = data;
    },
  },
});
