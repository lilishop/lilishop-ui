<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script setup>
import { onMounted } from "vue";
import { useRoute } from "vue-router";
import storage from "@/plugins/storage";
import { loadSiteSettings } from "@/composables/useSiteSettings";
import { useAppStore } from "@/stores/app";

defineOptions({ name: "App" });

const route = useRoute();
const appStore = useAppStore();

function applySiteInfo(data) {
  const expirationTime = new Date().setHours(new Date().getHours() + 1);
  storage.setItem("sitelogo_expiration_time", expirationTime);
  storage.setItem("siteName", data.siteName);
  storage.setItem("logoImg", data.buyerSideLogo);
  storage.setItem("siteIcon", data.buyerSideIcon);
  appStore.setSiteName(data.siteName);
  appStore.setLogoImg(data.buyerSideLogo);
  if (route.meta.title === undefined) {
    window.document.title = data.siteName;
  }
  let link =
    document.querySelector("link[rel*='icon']") ||
    document.createElement("link");
  link.type = "image/x-icon";
  link.href = data.buyerSideIcon;
  link.rel = "shortcut icon";
  document.getElementsByTagName("head")[0].appendChild(link);
}

function init() {
  const expirationTime = storage.getItem("sitelogo_expiration_time");
  const cacheValid =
    expirationTime && new Date() <= new Date(Number(expirationTime));
  if (cacheValid) {
    applySiteInfo({
      siteName: storage.getItem("siteName"),
      buyerSideLogo: storage.getItem("logoImg"),
      buyerSideIcon: storage.getItem("siteIcon"),
    });
  }
  getSite();
}

function getSite() {
  loadSiteSettings().then((data) => {
    if (data) {
      applySiteInfo(data);
    }
  }).catch((err) => {
    console.warn("获取站点配置失败", err);
  });
}

onMounted(() => {
  init();
});
</script>
<style lang="scss">
#app {
  @include background_color($light_background_color);
}
</style>
