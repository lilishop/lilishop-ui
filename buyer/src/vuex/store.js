import { createStore } from "vuex";
import * as actions from "./actions";
import * as mutations from "./mutations";
import * as getters from "./getters";
import storage from "@/plugins/storage.js";

export default createStore({
  state: {
    navList: [],
    cartNum: storage.getItem("cartNum") || 0,
    logoImg:
      storage.getItem("logoImg") || require("@/assets/images/logo2.png"),
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
  },
  getters,
  actions,
  mutations,
});
