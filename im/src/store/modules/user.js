import { setUserInfo, getUserInfo, getToken } from "@/utils/auth";

// import { ServeLogout } from "@/api/user";

let state = {
  // 用户ID
  id: 0,
  // 用户昵称
  name: "",
  // 个性头像
  face: require("@/assets/image/detault-avatar.jpg"),
  // 名片背景
  visitCardBag: require("@/assets/image/default-user-banner.png"),
  // 当前登录状态
  loginStatus: false,
  toUser:""
};

// 判断用户是否登录
if (getToken()) {
  let userInfo = getUserInfo();
  state.name = userInfo.name;
  state.id = userInfo.id;
  state.face = userInfo.face ? userInfo.face : state.avatar;
  state.loginStatus = true;
}

const User = {
  state,
  mutations: {
    // 用户退出登录
    USER_LOGOUT(state) {
      state.id = 0;
      state.face = "";
      state.name = "";
      state.loginStatus = false;
    },

    // 设置用户登录状态
    UPDATE_LOGIN_STATUS(state) {
      state.loginStatus = true;
    },

    // 更新用户信息
    UPDATE_USER_INFO(state, data) {
      for (const key in data) {
        if (state.hasOwnProperty(key)) {
          state[key] = data[key];
        }
      }

      // 保存用户信息到缓存
      setUserInfo({
        id: state.id,
        face: state.face,
        name: state.name,
      });
    },
  },
  actions: {
    // 退出登录处理操作
    ACT_USER_LOGOUT({ commit }) {
      commit("USER_LOGOUT");
      // ServeLogout().finally(() => {
      //   removeAll();
      //   location.reload();
      // });
    },
  },
};

export default User;
