import { createStore } from "vuex";
import app from "./modules/app";
import setting from "./modules/setting";
import user from "./modules/user";
import dict from "./modules/dict";

const store = createStore({
  state: {},
  mutations: {},
  actions: {},
  modules: {
    app,
    user,
    setting,
    dict,
  },
});

export default store;
