import { defineStore } from "pinia";
import Cookies from "js-cookie";
import { removeStore } from "@/libs/storage";
import { useAppStore } from "@/stores/app";

// 退出登录时需要清除的会话/店铺数据
// 保留 uuid（设备标识）、setting（主题）、category（缓存）、saveLogin（记住登录状态）等无关键
const LOGOUT_KEYS = [
  "accessToken",
  "refreshToken",
  "menuData",
  "currNav",
  "storeOpenedList",
  "seller_expiration_time",
  "sellersiteName",
  "sellerlogoImg",
  "sellerIconImg",
];

export const useUserStore = defineStore("user", {
  actions: {
    logout() {
      Cookies.remove("userInfoSeller");
      // 精确清除会话相关键，不再 localStorage.clear() 误删无关数据
      LOGOUT_KEYS.forEach((key) => removeStore(key));
      // 导航和已打开标签属于当前账号，退出时同步清理内存，避免下一账号复用旧权限菜单。
      const appStore = useAppStore();
      appStore.navigationMenus = [];
      appStore.setNavList([]);
      appStore.updateMenulist([]);
      appStore.setCurrNav("");
      appStore.setAdded(false);
      appStore.setUnreadMessageCount(0);
      appStore.resetNavigationRoutes();
      appStore.storeOpenedList = [{ title: "首页", path: "", name: "home_index" }];
    },
  },
});
