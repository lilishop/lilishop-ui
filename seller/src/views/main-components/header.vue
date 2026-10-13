<template>
  <div>
    <el-row class="header">
      <img class="logo" :src="storeSideLogo" />
    </el-row>
  </div>
</template>

<script setup>
import { onMounted, ref } from "vue";
import { getBaseSite } from "@/api/common.js";

const storeSideLogo = ref(require("@/assets/logo-lilishop.png"));

function init() {
  if (
    !localStorage.getItem("sellersiteName") ||
    !localStorage.getItem("sellerlogoImg") ||
    !localStorage.getItem("sellerIconImg") ||
    !localStorage.getItem("seller_expiration_time")
  ) {
    getSite();
  } else if (new Date() > localStorage.getItem("seller_expiration_time")) {
    getSite();
  } else {
    storeSideLogo.value = localStorage.getItem("sellerlogoImg");
    window.document.title = localStorage.getItem("sellersiteName");
    applyFavicon(localStorage.getItem("sellerIconImg"));
  }
}
function applyFavicon(href) {
  const link =
    document.querySelector("link[rel*='icon']") ||
    document.createElement("link");
  link.type = "image/x-icon";
  link.href = href;
  link.rel = "shortcut icon";
  document.getElementsByTagName("head")[0].appendChild(link);
}
function getSite() {
  getBaseSite()
    .then((res) => {
      if (res.success && res.result.settingValue) {
        const data = JSON.parse(res.result.settingValue);
        const expirationTime = new Date().setHours(new Date().getHours() + 1);
        localStorage.setItem("seller_expiration_time", expirationTime);
        localStorage.setItem("sellersiteName", data.siteName);
        localStorage.setItem("sellerlogoImg", data.storeSideLogo);
        localStorage.setItem("sellerIconImg", data.storeSideIcon);
        storeSideLogo.value = data.storeSideLogo;
        window.document.title = data.siteName;
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
