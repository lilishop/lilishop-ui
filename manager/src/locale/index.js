import { createI18n } from "vue-i18n";
import zhLocale from "./lang/zh-CN";
import enLocale from "./lang/en-US";

const navLang = navigator.language;
const localLang = navLang === "zh-CN" || navLang === "en-US" ? navLang : false;
const lang = window.localStorage.lang || localLang || "zh-CN";

const messages = {
  "zh-CN": zhLocale,
  "en-US": enLocale,
};

const i18n = createI18n({
  legacy: true,
  globalInjection: true,
  locale: lang,
  fallbackLocale: "zh-CN",
  messages,
});

export default i18n;
