import { createApp } from "vue";
import "core-js/stable";
import "./styles/theme.less";
import App from "./App.vue";
import { router } from "./router/index";
import store from "./store";
import i18n from "@/locale";
import { setupElementPlus } from "@/plugins/element";
import { setupLegacyMessage } from "@/utils/message";
import liliDialog from "@/components/lili-dialog";
import PriceColorScheme from "@/components/price-color-scheme.vue";
import { install as installVueQr } from "vue-qr";
import {
  getRequest,
  postRequest,
  putRequest,
  deleteRequest,
  importRequest,
  uploadFileRequest,
} from "@/libs/axios";
import { setStore, getStore, removeStore } from "@/libs/storage";
import util from "@/libs/util";
import { md5 } from "@/utils/md5.js";
import * as filters from "@/utils/filters";
import config from "@/config";

const { aMapSecurityJsCode, mainColor } = config;

if (aMapSecurityJsCode) {
  window._AMapSecurityConfig = {
    securityJsCode: aMapSecurityJsCode,
  };
}

const PC_URL = BASE.PC_URL;
const WAP_URL = BASE.WAP_URL;

// 刷新深链（如 /member/user-manage）前先从缓存注册动态路由
util.bootstrapDynamicRoutesFromCache();

const app = createApp(App);

setupElementPlus(app);
setupLegacyMessage(app);
installVueQr(app);

app.use(router);
app.use(store);
app.use(i18n);

app.component("liliDialog", liliDialog);
app.component("priceColorScheme", PriceColorScheme);

app.config.globalProperties.getRequest = getRequest;
app.config.globalProperties.postRequest = postRequest;
app.config.globalProperties.putRequest = putRequest;
app.config.globalProperties.deleteRequest = deleteRequest;
app.config.globalProperties.importRequest = importRequest;
app.config.globalProperties.uploadFileRequest = uploadFileRequest;
app.config.globalProperties.setStore = setStore;
app.config.globalProperties.getStore = getStore;
app.config.globalProperties.removeStore = removeStore;
app.config.globalProperties.$mainColor = mainColor;
app.config.globalProperties.md5 = md5;
app.config.globalProperties.$filters = filters;

app.config.globalProperties.linkTo = function (goodsId, skuId) {
  let src;
  if (skuId) {
    src = `${PC_URL}/goodsDetail?skuId=${skuId}&goodsId=${goodsId}`;
  } else {
    src = `${PC_URL}/goodsDetail?goodsId=${goodsId}`;
  }
  window.open(src, "_blank");
};

app.config.globalProperties.wapLinkTo = function (goodsId, skuId) {
  if (skuId) {
    return `${WAP_URL}/pages/product/goods?id=${skuId}&goodsId=${goodsId}`;
  }
  return `${WAP_URL}/pages/product/goods?goodsId=${goodsId}`;
};

router.isReady().then(() => {
  app.mount("#app");
});

// 登录后由 App.vue 触发 initRouter 拉取/更新菜单
export { app, util };
