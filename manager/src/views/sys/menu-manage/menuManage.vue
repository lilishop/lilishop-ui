<template>
  <el-tabs v-model="activeTab">
    <el-tab-pane label="平台菜单" name="platform">
      <managerMenu />
    </el-tab-pane>
    <el-tab-pane label="店铺菜单" name="store">
      <storeMenu />
    </el-tab-pane>
  </el-tabs>
</template>

<script setup>
import { ref } from "vue";
import managerMenu from "./menu";
import storeMenu from "./storeMenu";

const activeTab = ref("platform");
</script>
