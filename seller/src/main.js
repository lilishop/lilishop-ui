import { createApp } from "vue";
import "core-js/stable";
import "./styles/theme.less";
import App from "./App.vue";
import { router } from "./router/index";
import store from "./store";
import { setupElementPlus } from "@/plugins/element";
import { setupLegacyMessage } from "@/utils/message";
import liliDialog from "@/views/lili-dialog";
import PriceColorScheme from "@/components/price-color-scheme.vue";
import { install as installVueQr } from "vue-qr";
import VueLazyload from "vue-lazyload";
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
import config from "@/config/index";
import imgError from "./assets/img-error.png";
import loadingGif from "./assets/loading2.gif";

const { aMapSecurityJsCode, mainColor } = config;

if (aMapSecurityJsCode) {
  window._AMapSecurityConfig = {
    securityJsCode: aMapSecurityJsCode,
  };
}

const PC_URL = BASE.PC_URL;
const WAP_URL = BASE.WAP_URL;

util.bootstrapDynamicRoutesFromCache();

const app = createApp(App);

setupElementPlus(app);
setupLegacyMessage(app);
installVueQr(app);

app.use(VueLazyload, {
  error: imgError,
  loading: loadingGif,
});

app.use(router);
app.use(store);

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
  window.open(
    `${PC_URL}/goodsDetail?skuId=${skuId}&goodsId=${goodsId}`,
    "_blank"
  );
};

app.config.globalProperties.wapLinkTo = function (goodsId, skuId) {
  return `${WAP_URL}/pages/product/goods?id=${skuId}&goodsId=${goodsId}`;
};

router.isReady().then(() => {
  app.mount("#app");
});

export { app, util };
