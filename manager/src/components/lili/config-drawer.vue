<template>
  <div>
    <el-drawer v-model="drawer" title="页面配置" size="300px">
      <div class="config-empty">暂无可配置项</div>
    </el-drawer>
  </div>
</template>

<script setup>
import { ref } from "vue";

defineOptions({ name: "configDrawer" });

const drawer = ref(false);

function open() {
  drawer.value = true;
}

function close() {
  drawer.value = false;
}

defineExpose({ open, close });
</script>

<style scoped>
.config-empty {
  color: #909399;
  text-align: center;
  padding: 20px 0;
}
</style>
