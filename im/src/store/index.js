import { createStore } from "vuex";

import user from "./modules/user";
import talks from "./modules/talk";
import notify from "./modules/notify";
import settings from "./modules/settings";
import emoticon from "./modules/emoticon";
import dialogue from "./modules/dialogue";
import note from "./modules/note";

import state from "./state";
import getters from "./getters";
import mutations from "./mutations";

const store = createStore({
  modules: {
    user,
    notify,
    talks,
    settings,
    emoticon,
    dialogue,
    note,
  },
  state,
  getters,
  mutations,
});

export default store;
