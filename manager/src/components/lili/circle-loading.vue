<template>
  <div style="display: inline-block">
    <el-icon class="spin-icon-load" :size="18" color="#ff5c58">
      <Loading />
    </el-icon>
  </div>
</template>

<script>
import { Loading } from "@element-plus/icons-vue";

export default {
  name: "circleLoading",
  components: { Loading },
};
</script>

<style lang="scss" scoped>
.spin-icon-load {
  animation: ani-demo-spin 1s linear infinite;
}
@keyframes ani-demo-spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
