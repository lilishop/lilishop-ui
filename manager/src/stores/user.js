import { defineStore } from "pinia";
import Cookies from "js-cookie";
import util from "@/libs/util";

export const useUserStore = defineStore("user", {
  actions: {
    logout() {
      util.clearDynamicRoutes();
      Cookies.remove("userInfoManager");
      localStorage.clear();
    },
  },
});
