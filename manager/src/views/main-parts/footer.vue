<template>
  <div class="foot">
    <el-row justify="space-around" class="help">
      <a class="item" :href="website" target="_blank">帮助</a>
      <a class="item" :href="website" target="_blank">隐私</a>
      <a class="item" :href="website" target="_blank">条款</a>
    </el-row>
    <el-row justify="center" class="copyright">
      Copyright © {{ year }} - Present
      <a :href="website" class="href" target="_blank" style="margin: 0 5px">{{ config.title }}</a>
    </el-row>
  </div>
</template>

<script setup>
import { ref } from "vue";
import config from "@/config/index";

const year = ref(new Date().getFullYear());
// 官网地址优先取接口下发缓存，兜底用本地配置
const website = ref(localStorage.getItem("website") || config.website);
</script>

<style lang="scss" scoped>
.foot {
  position: fixed;
  bottom: 4vh;
  width: 368px;
  color: rgba(0, 0, 0, 0.45);
  font-size: 14px;
  .help {
    margin: 0 auto;
    margin-bottom: 1vh;
    width: 60%;
    .item {
      color: rgba(0, 0, 0, 0.45);
    }
    :hover {
      color: rgba(0, 0, 0, 0.65);
    }
  }
}
</style>
