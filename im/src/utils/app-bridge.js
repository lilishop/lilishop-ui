import { h } from "vue";
import store from "@/store";
import router from "@/router";
import MainMixin from "@/mixins/main-mixin";

let refreshViewFn = null;

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
