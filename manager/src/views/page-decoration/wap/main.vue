<template>
  <div class="box">
    <!-- 顶部栏 -->
    <navbar @selected="selected" :pagetype="pagetype" />

    <component :is="layout[name]"></component>
  </div>
</template>
<script setup>
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import layout from "./index";
import navbar from "./navbar";

const route = useRoute();

// layout 为 import 常量（装修模块），模板中直接使用
const name = ref("index"); // 装修的页面
const pagetype = ref("INDEX");

onMounted(() => {
  if (route.query.pagetype == "ALERT") {
    name.value = "alertAdvertising";
  }
  if (route.query.pagetype == "OPEN_SCREEN_ANIMATION") {
    name.value = "advertising";
  }
  pagetype.value = route.query.pagetype;
});

// 顶部栏点击切换
function selected(val) {
  name.value = val;
}
</script>
<style scoped lang="scss">
.box {
  height: calc(100vh - 120px);
  width: 98%;
  margin: 0 auto;
  padding: 0 20px;
  background: #fff;
  border-radius: 0.4em;
  overflow: hidden;
}
</style>
