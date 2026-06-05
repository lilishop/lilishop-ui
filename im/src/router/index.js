import { createRouter, createWebHistory } from "vue-router";

const routes = [
  {
    path: "/",
    name: "home",
    component: () => import("@/views/message/index"),
    meta: {
      title: "",
      needLogin: true,
    },
  },
  {
    path: "/message",
    name: "message",
    component: () => import("@/views/message/index"),
    meta: {
      title: "消息通知",
      needLogin: true,
    },
  },
  {
    path: "/:pathMatch(.*)*",
    name: "404 NotFound",
    component: () => import("@/views/other/404"),
    meta: {
      title: "404 NotFound",
      needLogin: false,
    },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
