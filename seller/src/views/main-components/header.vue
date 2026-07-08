<template>
  <div>
    <el-row class="header">
      <img class="logo" :src="storeSideLogo" />
    </el-row>
  </div>
</template>

<script>
import defaultLogo from "@/assets/logo.png";
import { getBaseSite } from "@/api/common.js";

export default {
  data() {
    return {
      storeSideLogo: require("@/assets/logo-lilishop.png"),
    };
  },
  methods: {
    init() {
      if (
        !localStorage.getItem("sellersiteName") ||
        !localStorage.getItem("sellerlogoImg") ||
        !localStorage.getItem("sellerIconImg") ||
        !localStorage.getItem("seller_expiration_time")
      ) {
        this.getSite();
      } else if (new Date() > localStorage.getItem("seller_expiration_time")) {
        this.getSite();
      } else {
        this.storeSideLogo = localStorage.getItem("sellerlogoImg");
        window.document.title = localStorage.getItem("sellersiteName");
        this.applyFavicon(localStorage.getItem("sellerIconImg"));
      }
    },
    applyFavicon(href) {
      const link =
        document.querySelector("link[rel*='icon']") ||
        document.createElement("link");
      link.type = "image/x-icon";
      link.href = href;
      link.rel = "shortcut icon";
      document.getElementsByTagName("head")[0].appendChild(link);
    },
    getSite() {
      getBaseSite().then((res) => {
        if (res.success && res.result.settingValue) {
          const data = JSON.parse(res.result.settingValue);
          const expirationTime = new Date().setHours(new Date().getHours() + 1);
          localStorage.setItem("seller_expiration_time", expirationTime);
          localStorage.setItem("sellersiteName", data.siteName);
          localStorage.setItem("sellerlogoImg", data.storeSideLogo);
          localStorage.setItem("sellerIconImg", data.storeSideIcon);
          this.storeSideLogo = data.storeSideLogo;
          window.document.title = data.siteName;
          this.applyFavicon(data.storeSideIcon);
        }
      });
    },
  },
  mounted() {
    this.init();
  },
};
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
