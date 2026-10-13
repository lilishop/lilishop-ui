import { defineStore } from "pinia";
import { setUserInfo, getUserInfo, getToken } from "@/utils/auth";
import { defaultAvatar, defaultUserBanner } from "@/assets/images";

// 判断用户是否登录（模块加载时初始化，与原 vuex user 模块行为一致）
function initState() {
  const state = {
    // 用户ID
    id: 0,
    // 用户昵称
    name: "",
    // 个性头像
    face: defaultAvatar,
    // 名片背景
    visitCardBag: defaultUserBanner,
    // 当前登录状态
    loginStatus: false,
    toUser: "",
  };
  if (getToken()) {
    let userInfo = getUserInfo();
    state.name = userInfo.name;
    state.id = userInfo.id;
    // 原代码如此：state.avatar 并不存在（恒为 undefined）
    state.face = userInfo.face ? userInfo.face : state.avatar;
    state.loginStatus = true;
  }
  return state;
}

export const useUserStore = defineStore("user", {
  state: initState,
  actions: {
    // 用户退出登录
    USER_LOGOUT() {
      this.id = 0;
      this.face = "";
      this.name = "";
      this.loginStatus = false;
    },

    // 设置用户登录状态
    UPDATE_LOGIN_STATUS() {
      this.loginStatus = true;
    },

    // 更新用户信息
    UPDATE_USER_INFO(data) {
      for (const key in data) {
        if (Object.prototype.hasOwnProperty.call(this.$state, key)) {
          this[key] = data[key];
        }
      }

      // 保存用户信息到缓存
      setUserInfo({
        id: this.id,
        face: this.face,
        name: this.name,
      });
    },

    // 退出登录处理操作（原 vuex action ACT_USER_LOGOUT）
    ACT_USER_LOGOUT() {
      this.USER_LOGOUT();
    },
  },
});
