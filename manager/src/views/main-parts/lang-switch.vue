<template>
  <div class="lang-icon">
    <el-dropdown @command="langChange">
      <el-icon :size="26"><Platform /></el-icon>
      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item command="zh-CN">简体中文</el-dropdown-item>
          <el-dropdown-item command="en-US">English</el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
  </div>
</template>

<script>
import { Platform } from "@element-plus/icons-vue";

export default {
  name: "langSwitch",
  components: { Platform },
  methods: {
    langChange(v) {
      this.$i18n.locale = v;
      this.$store.commit("switchLang", v);
    },
  },
};
</script>

<style lang="scss" scoped>
.lang-icon {
  position: fixed;
  top: 2vh;
  right: 1.5vw;
  cursor: pointer;
}
</style>
