import { createApp } from "vue";
import "core-js/stable";
import "./assets/styles/global-layout.scss";
import "./assets/styles/theme.less";
import App from "./App.vue";
import { router } from "./router/index";
import store from "@/vuex/store";
import { setupElementPlus } from "@/plugins/element";
import { setupLegacyMessage } from "@/utils/message";
import { registerGlobalComponents } from "@/components/global.js";
import * as filters from "./plugins/filters";
import storage from "@/plugins/storage";
import { fetchAndApplyTheme } from "@/utils/theme";
import { getThemeSetting } from "@/api/common.js";
import config from "@/config";

const { aMapSecurityJsCode, inputMaxLength } = config;

if (aMapSecurityJsCode) {
  window._AMapSecurityConfig = {
    securityJsCode: aMapSecurityJsCode,
  };
}

const app = createApp(App);

setupElementPlus(app);
setupLegacyMessage(app);
registerGlobalComponents(app);

app.use(router);
app.use(store);

app.config.globalProperties.$filters = filters;
app.config.globalProperties.Cookies = storage;
app.config.globalProperties.$inputMaxLength = inputMaxLength;

app.config.globalProperties.linkTo = function (url) {
  if (!url) return;
  if (url.substr(0, 1) === "/") {
    window.open(location.origin + url, "_blank");
  } else {
    window.open(url, "_blank");
  }
};

app.config.globalProperties.connectCs = function (
  sign = "37ef9b97807d03c6741298ed4eb5b536d2d238e08a3c00fb01fe48f03a569974c99ad767e72c04b3165ef29aca2c488b505fe4ca"
) {
  const url =
    "https://yzf.qq.com/xv/web/static/chat/index.html?sign=" + sign;
  window.open(url, "_blank");
};

router.isReady().then(async () => {
  await fetchAndApplyTheme(getThemeSetting);
  app.mount("#app");
});
