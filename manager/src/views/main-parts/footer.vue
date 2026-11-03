<template>
  <div class="foot">
    <el-row v-if="website" justify="space-around" class="help">
      <a class="item" :href="website" target="_blank">帮助</a>
      <a class="item" :href="website" target="_blank">隐私</a>
      <a class="item" :href="website" target="_blank">条款</a>
    </el-row>
    <el-row justify="center" class="copyright">
      Copyright © {{ year }}
      <a :href="website || undefined" class="href" target="_blank" style="margin: 0 5px">{{ copyrightOwner }}</a>
    </el-row>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useSiteSettings } from "@/composables/useSiteSettings";

const year = ref(new Date().getFullYear());
const { website, copyrightOwner } = useSiteSettings();
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
