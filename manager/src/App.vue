<template>
  <div id="main" class="app-main">
    <router-view />
  </div>
</template>

<script setup>
import { onMounted, onUpdated } from "vue";
import { useRoute } from "vue-router";
import Cookies from "js-cookie";
import { getCategoryTree } from "@/api/goods.js";
import util from "@/libs/util";
import { getStore } from "@/libs/storage";
import { useAppStore } from "@/stores/app";

defineOptions({ name: "App" });

const route = useRoute();
const appStore = useAppStore();

onUpdated(() => {
  if (!localStorage.getItem("category") && route.path !== "/login") {
    getCategoryTree(0).then((res) => {
      if (res.success) {
        localStorage.setItem("category", JSON.stringify(res.result));
      }
    });
  }
});

onMounted(() => {
  const loggedIn = getStore("accessToken") || Cookies.get("userInfoManager");
  if (loggedIn) {
    util.bootstrapDynamicRoutesFromCache();
    util.initRouter();
    appStore.setOpenedList();
    appStore.initCachePage();
  }
});
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
