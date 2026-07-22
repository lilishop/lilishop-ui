import "core-js/stable";

import { createApp } from "vue";
import App from "@/App.vue";
import store from "@/store";
import router from "@/router";
import MainMixin from "./mixins/main-mixin";
import face from "@/components/face";
import faceNull from "@/components/face-null";
import config from "@/config/config";
import { setupElementPlus } from "@/plugins/element";
import { setupLegacyMessage } from "@/utils/message";
import { registerDirectives } from "./core/directives";
import { registerGlobalComponents } from "./core/global-component";
import { registerIcons } from "@/icons";
import * as filters from "./plugins/filters";

import VueVirtualScroller from "vue-virtual-scroller";
import "vue-virtual-scroller/dist/vue-virtual-scroller.css";

import { setupContextmenu } from "@/plugins/contextmenu";
import "@/permission";
import "@/assets/css/global.less";

const app = createApp(App);

setupElementPlus(app);
setupLegacyMessage(app);
registerDirectives(app);
registerGlobalComponents(app);
registerIcons(app);

app.use(store);
app.use(router);
setupContextmenu(app);
app.use(VueVirtualScroller);
app.mixin(MainMixin);

app.component("face", face);
app.component("face-null", faceNull);
app.component("RecycleScroller", VueVirtualScroller.RecycleScroller);

app.config.globalProperties.$filters = filters;
app.config.globalProperties.linkToGoods = function (goodsId, skuId) {
  window.open(
    `${config.PC_URL}goodsDetail?skuId=${skuId}&goodsId=${goodsId}`,
    "_blank"
  );
};
app.config.globalProperties.linkToStore = function (storeId) {
  window.open(`${config.PC_URL}merchant?id=${storeId}`, "_blank");
};
app.config.globalProperties.linkToOrders = function (sn) {
  if (localStorage.getItem("storeFlag") == "false") {
    window.open(`${config.PC_STORE}order-detail?sn=${sn}`, "_blank");
  } else {
    window.open(`${config.PC_URL}home/OrderDetail?sn=${sn}`, "_blank");
  }
};

router.isReady().then(() => {
  app.mount("#app");
});

export default app;
