import { createApp } from "vue";
import { createPinia } from "pinia";
import "core-js/stable";
import "./assets/styles/global-layout.scss";
import "./assets/styles/theme.less";
import App from "./App.vue";
import { router } from "./router/index";
import { setupElementPlus } from "@/plugins/element";
import { setupLegacyMessage } from "@/utils/message";
import { registerGlobalComponents } from "@/components/global.js";
import * as filters from "./plugins/filters";
import storage from "@/plugins/storage";
import { fetchAndApplyTheme } from "@/utils/theme";
import { getThemeSetting } from "@/api/common.js";
import config from "@/config";
import { openLink } from "@/utils/buyerLogin";

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
app.use(createPinia());

app.config.globalProperties.$filters = filters;
app.config.globalProperties.Cookies = storage;
app.config.globalProperties.$inputMaxLength = inputMaxLength;

app.config.globalProperties.linkTo = function (url) {
  openLink(url, router);
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
