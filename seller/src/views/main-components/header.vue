<template>
  <div>
    <el-row class="header">
      <img alt="店铺 Logo" class="logo" :src="storeSideLogo" />
    </el-row>
  </div>
</template>

<script setup>
import { onMounted, ref } from "vue";
import { loadSiteSettings } from "@/composables/useSiteSettings";

const storeSideLogo = ref(require("@/assets/logo-lilishop.png"));

function init() {
  getSite();
}
function applyFavicon(href) {
  if (!href) return;
  const link =
    document.querySelector("link[rel*='icon']") ||
    document.createElement("link");
  link.type = "image/x-icon";
  link.href = href;
  link.rel = "shortcut icon";
  document.getElementsByTagName("head")[0].appendChild(link);
}
function getSite() {
  loadSiteSettings()
    .then((data) => {
      if (data) {
        const expirationTime = new Date().setHours(new Date().getHours() + 1);
        localStorage.setItem("seller_expiration_time", expirationTime);
        localStorage.setItem("sellersiteName", data.siteName);
        localStorage.setItem("sellerlogoImg", data.storeSideLogo);
        localStorage.setItem("sellerIconImg", data.storeSideIcon);
        localStorage.setItem("sellerCompanyName", data.companyName || "");
        localStorage.setItem("sellerCompanyUrl", data.companyUrl || "");
        storeSideLogo.value = data.storeSideLogo || storeSideLogo.value;
        if (data.siteName) window.document.title = data.siteName;
        applyFavicon(data.storeSideIcon);
      }
    })
    .catch(() => {});
}

onMounted(() => {
  init();
});
</script>

<style lang="scss" scoped>
.header {
  margin-bottom: 0;
  align-items: center;
  display: flex;
  justify-content: center !important;
}
.logo {
  width: 168px;
  height: auto;
}
</style>
