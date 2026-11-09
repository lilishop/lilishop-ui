const explicitViews = {
  "shop/shopInfo": () => import("@/views/shop/shopInfo.vue"),
  "shop/addressManage": () => import("@/views/shop/addressManage.vue"),
};

export default (url) => explicitViews[url] || (() => import(`@/views/${url}.vue`));
