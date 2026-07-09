<template>
  <div>
    <el-drawer v-model="drawer" title="页面配置" size="300px">
      <div class="config-empty">暂无可配置项</div>
    </el-drawer>
  </div>
</template>

<script>
export default {
  name: "configDrawer",
  data() {
    return {
      drawer: false,
    };
  },
  methods: {
    open() {
      this.drawer = true;
    },
    close() {
      this.drawer = false;
    },
  },
};
</script>

<style scoped>
.config-empty {
  color: #909399;
  text-align: center;
  padding: 20px 0;
}
</style>
