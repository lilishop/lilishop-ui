<template>
  <div id="main" class="app-main">
    <router-view />
  </div>
</template>

<script>
import Cookies from "js-cookie";
import { getCategoryTree } from "@/api/goods.js";
import util from "@/libs/util";

export default {
  name: "App",
  updated() {
    if (!localStorage.getItem("category") && this.$route.path !== "/login") {
      getCategoryTree(0).then((res) => {
        if (res.success) {
          localStorage.setItem("category", JSON.stringify(res.result));
        }
      });
    }
  },
  mounted() {
    const loggedIn = this.getStore("accessToken") || Cookies.get("userInfoManager");
    if (loggedIn) {
      util.bootstrapDynamicRoutesFromCache();
      util.initRouter(this);
      this.$store.commit("setOpenedList");
      this.$store.commit("initCachePage");
    }
  },
};
</script>

<style>
html,
body {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
  background: #f0f0f0;
  font-size: 14px;
}

.app-main {
  width: 100%;
  height: 100%;
}

.br button {
  margin-right: 5px;
}

.operation button {
  margin-right: 5px;
}

.tox-notifications-container {
  display: none !important;
}
</style>
