import { h } from "vue";
import router from "@/router";
import MainMixin from "@/mixins/main-mixin";
import { useTalkStore } from "@/stores/talk";

let refreshViewFn = null;

// vuex → pinia 兼容门面：外部（im-server/event/talk.js）仍以
// $store.state.talks.items 的旧 vuex 形态访问，这里用惰性 getter 返回
// 对应的 pinia store（store 实例上直接暴露 state 属性），
// getter 内调用 useTalkStore() 以保证 pinia 已激活
const store = {
  get state() {
    return {
      talks: useTalkStore(),
    };
  },
};

const mixinCtx = {
  get $store() {
    return store;
  },
  get $router() {
    return router;
  },
  get $route() {
    return router.currentRoute.value;
  },
};
mixinCtx.loadChatListInJs = MainMixin.methods.loadChatListInJs.bind(mixinCtx);
mixinCtx.loadStoreChatList = MainMixin.methods.loadStoreChatList.bind(mixinCtx);

export function setRefreshView(fn) {
  refreshViewFn = fn;
}

export function refreshView() {
  refreshViewFn?.();
}

export function getAppBridge() {
  return {
    $store: store,
    $router: router,
    $route: router.currentRoute.value,
    $createElement: h,
    loadUserSetting: MainMixin.methods.loadUserSetting.bind(mixinCtx),
    refreshView,
  };
}
