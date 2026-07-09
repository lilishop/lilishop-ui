import { createRouter, createWebHistory } from "vue-router";
import NProgress from "nprogress";
import "nprogress/nprogress.css";
import Util from "../libs/util";
import Cookies from "js-cookie";
import store from "@/store";
import { routers } from "./router";

NProgress.configure({ showSpinner: false });

export const router = createRouter({
  history: createWebHistory(),
  routes: routers,
});

router.beforeEach((to, from, next) => {
  NProgress.start();
  Util.title(to.meta.title);

  const name = to.name;
  const hasToken = Cookies.get("userInfoSeller");

  if (!hasToken && name !== "login") {
    if (name === "forgetPassword") {
      Util.toDefaultPage([...routers], name, router, next);
      return;
    }
    next({ name: "login" });
    return;
  }

  if (hasToken && name === "login") {
    Util.title();
    next({ name: "home_index" });
    return;
  }

  if (hasToken) {
    Util.toDefaultPage([...routers], name, router, next);
    return;
  }

  next();
});

router.afterEach((to) => {
  Util.openNewPage({ $store: store }, to.name, to.params, to.query);
  NProgress.done();
  window.scrollTo(0, 0);
});
