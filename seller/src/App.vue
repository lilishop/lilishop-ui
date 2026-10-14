<template>
  <div id="main" class="app-main">
    <router-view />
  </div>
</template>

<script setup>
import { onMounted } from "vue";
import Cookies from "js-cookie";
import util from "@/libs/util";
import { getStore } from "@/libs/storage";
import { getCategoryTree } from "@/api/goods.js";
import { useAppStore } from "@/stores/app";

defineOptions({ name: "App" });

const appStore = useAppStore();

onMounted(() => {
  const loggedIn = getStore("accessToken") || Cookies.get("userInfoSeller");
  if (loggedIn) {
    util.bootstrapDynamicRoutesFromCache();
    util.initRouter();
    appStore.setOpenedList();
    if (!localStorage.getItem("category")) {
      getCategoryTree()
        .then((res) => {
          if (res.success && Array.isArray(res.result)) {
            localStorage.setItem("category", JSON.stringify(res.result));
          }
        })
        .catch(() => {});
    }
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
