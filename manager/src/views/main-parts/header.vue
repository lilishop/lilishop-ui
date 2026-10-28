<template>
  <div>
    <el-row class="header">
      <img alt="平台 Logo" v-if="domainLogo" :src="domainLogo" class="logo" width="220px" />
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { getBaseSite } from "@/api/common.js";

const domainLogo = ref("");

function applyFavicon(href) {
  if (!href) return;
  let link =
    document.querySelector("link[rel*='icon']") ||
    document.createElement("link");
  link.type = "image/x-icon";
  link.href = href;
  link.rel = "shortcut icon";
  document.getElementsByTagName("head")[0].appendChild(link);
}

function getSite() {
  getBaseSite().then((res) => {
    if (res.success && res.result && res.result.settingValue) {
      const { domainLogo: logo, domainIcon, siteName, website } = JSON.parse(
        res.result.settingValue
      );
      domainLogo.value = logo || "";
      const expirationTime = new Date().setHours(new Date().getHours() + 1);
      localStorage.setItem("icontitle_expiration_time", expirationTime);
      localStorage.setItem("icon", logo || "");
      localStorage.setItem("domainIcon", domainIcon || "");
      localStorage.setItem("title", siteName || "");
      localStorage.setItem("website", website || "");
      applyFavicon(domainIcon || logo);
      if (siteName) {
        window.document.title = siteName + " - 运营后台";
      }
    }
  });
}

onMounted(() => {
  getSite();
});
</script>

<style lang="scss" scoped>
.header {
  margin-bottom: 6vh;
  text-align: center;
  display: flex;
  justify-content: center !important;
}
.logo {
  width: 440px;
  height: 158px;
}
</style>
