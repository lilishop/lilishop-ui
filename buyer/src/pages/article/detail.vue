<template>
  <div class="box">
    <div class="wrapper">
      <div class="nav" @click="back">
        <img src="@/assets/images/logo2.png" alt="" class="logo" />
        <div class="title">{{ detail.title }}</div>
      </div>
      <div v-html="detail.content"></div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { articleDetail } from "@/api/common.js";
import config from "@/config/index";

const route = useRoute();
const router = useRouter();

const configData = ref(config);
const detail = ref("");

function back() {
  router.push("/");
}

// 初始化文章
function init() {
  const id = route.query.id;

  articleDetail(id).then((res) => {
    if (res.success) {
      detail.value = res.result;
    }
  });
}

onMounted(() => {
  init();
});
</script>

<style lang="scss" scoped>
.logo {
  max-width: 200px;
}
.box {
  min-height: 100vh;
  width: 1200px;
  overflow: hidden;
  margin: 0 auto;
  padding: 32px;
}
.wrapper {
  width: 1200px;
  min-height: 600px;
  padding: 32px;
  background: #fff;
}
.nav {
  text-align: center;
  font-size: 21px;
  font-weight: bold;
}
.title {
  text-align: center;

  font-size: 21px;
  margin: 20px 0;
}

// iphone
@media screen and (max-width: 767px) {
  .box {
    min-height: 100vh;
    width: 100%;
    padding: 0;
    margin: 0 auto;
  }
  .wrapper {
    width: 100%;
    min-height: 600px;
    padding: 0 16px;
    background: #fff;
  }
}
</style>
