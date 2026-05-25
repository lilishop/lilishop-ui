<template>
  <div>
    <el-row class="header">
      <img :src="domainLogo" class="logo" width="220px" />
    </el-row>
  </div>
</template>

<script>
import { getBaseSite } from "@/api/common.js";

export default {
  data() {
    return {
      domainLogo: require("@/assets/logo.png"),
    };
  },
  methods: {
    init() {
      if (
        !localStorage.getItem("icon") ||
        !localStorage.getItem("title") ||
        !localStorage.getItem("icontitle_expiration_time")
      ) {
        this.getSite();
      } else if (new Date() > localStorage.getItem("icontitle_expiration_time")) {
        this.getSite();
      } else {
        this.domainLogo = localStorage.getItem("icon");
        this.applyFavicon(localStorage.getItem("icon"));
        window.document.title = localStorage.getItem("title") + " - 运营后台";
      }
    },
    applyFavicon(href) {
      let link =
        document.querySelector("link[rel*='icon']") ||
        document.createElement("link");
      link.type = "image/x-icon";
      link.href = href;
      link.rel = "shortcut icon";
      document.getElementsByTagName("head")[0].appendChild(link);
    },
    getSite() {
      getBaseSite().then((res) => {
        const { domainLogo, domainIcon, siteName } = JSON.parse(
          res.result.settingValue
        );
        this.domainLogo = domainLogo;
        const expirationTime = new Date().setHours(new Date().getHours() + 1);
        localStorage.setItem("icontitle_expiration_time", expirationTime);
        localStorage.setItem("icon", domainLogo);
        localStorage.setItem("domainIcon", domainIcon);
        localStorage.setItem("title", siteName);
        this.applyFavicon(domainIcon || domainLogo);
        window.document.title = siteName + " - 运营后台";
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
