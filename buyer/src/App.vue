<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script>
import storage from "@/plugins/storage";
import { getBaseSite, getThemeSetting } from "@/api/common.js";
import { fetchAndApplyTheme } from "@/utils/theme";

export default {
  name: "App",
  mounted() {
    this.init();
  },
  methods: {
    applySiteInfo(data) {
      const expirationTime = new Date().setHours(new Date().getHours() + 1);
      storage.setItem("sitelogo_expiration_time", expirationTime);
      storage.setItem("siteName", data.siteName);
      storage.setItem("logoImg", data.buyerSideLogo);
      storage.setItem("siteIcon", data.buyerSideIcon);
      this.$store.commit("SET_SITENAME", data.siteName);
      this.$store.commit("SET_LOGOIMG", data.buyerSideLogo);
      if (this.$route.meta.title === undefined) {
        window.document.title = data.siteName;
      }
      let link =
        document.querySelector("link[rel*='icon']") ||
        document.createElement("link");
      link.type = "image/x-icon";
      link.href = data.buyerSideIcon;
      link.rel = "shortcut icon";
      document.getElementsByTagName("head")[0].appendChild(link);
    },
    init() {
      const expirationTime = storage.getItem("sitelogo_expiration_time");
      const cacheValid =
        expirationTime && new Date() <= new Date(Number(expirationTime));
      if (cacheValid) {
        this.applySiteInfo({
          siteName: storage.getItem("siteName"),
          buyerSideLogo: storage.getItem("logoImg"),
          buyerSideIcon: storage.getItem("siteIcon"),
        });
      }
      this.getSite();
      this.getTheme();
    },
    getSite() {
      getBaseSite().then((res) => {
        if (res.success && res.result.settingValue) {
          try {
            const data = JSON.parse(res.result.settingValue);
            this.applySiteInfo(data);
          } catch {
            // 站点配置解析失败时使用缓存
          }
        }
      }).catch((err) => {
        console.warn('获取站点配置失败', err);
      });
    },
    getTheme() {
      fetchAndApplyTheme(getThemeSetting).catch((err) => {
        console.warn('获取主题配置失败', err);
      });
    },
  },
};
</script>
<style lang="scss">
#app {
  @include background_color($light_background_color);
}
</style>
