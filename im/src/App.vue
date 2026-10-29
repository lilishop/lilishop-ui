<template>
  <div id="app">
    <router-view v-if="showView" />
  </div>
</template>
<script setup>
import { nextTick, onBeforeUnmount, onMounted, ref } from "vue";
import { setRefreshView } from "@/utils/app-bridge";

defineOptions({ name: 'App' });

// 用于点击当前页的router时，刷新当前页
const showView = ref(true);
let beforeUnload = '';
let Handler = '';

// 刷新当前路由方法
function refreshView () {
  showView.value = false
  nextTick(() => (showView.value = true))
}
function beforeunloadHandler () {
  beforeUnload = new Date().getTime();
}
// 页面关闭后 重置btnHide
function unloadHandler (e) {
  Handler = new Date().getTime() - beforeUnload;
  if (Handler <= 5) {
    var storage = window.localStorage;
    storage.clear()
    localStorage.setItem('btnHide', 1)
  }
}

onMounted(() => {
  setRefreshView(refreshView);
  window.addEventListener('beforeunload', beforeunloadHandler)
  // unload 事件已被 Chrome 弃用（Permissions-Policy 禁止），改用 pagehide
  window.addEventListener('pagehide', unloadHandler)
});
onBeforeUnmount(() => {
  window.removeEventListener('beforeunload', beforeunloadHandler)
  window.removeEventListener('pagehide', unloadHandler)
});
</script>
