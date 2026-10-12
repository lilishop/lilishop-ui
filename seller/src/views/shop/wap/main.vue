<template>
  <div class="box">
    <!-- 顶部栏 -->
    <navbar @selected="selected" :pagetype="pagetype" />

    <component :is="layout[name]"></component>
  </div>
</template>
<script setup>
import { onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import layout from "./index"; // 装修模块
import navbar from "./navbar";

const route = useRoute();

const name = ref("index"); // 装修的页面
const pagetype = ref("INDEX");

onMounted(() => {
  pagetype.value = route.query.pagetype || "INDEX";
});

function selected(val) {
  // 顶部栏点击切换
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
