import { createStore } from "vuex";
import * as actions from "./actions";
import * as mutations from "./mutations";
import storage from "@/plugins/storage.js";
import defaultLogo from "@/assets/images/logo2.png";

export default createStore({
  state: {
    navList: [],
    cartNum: storage.getItem("cartNum") || 0,
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
  },
  actions,
  mutations,
});
