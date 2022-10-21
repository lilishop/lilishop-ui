<template>
  <div class="box">
    <!-- 顶部栏 -->
    <navbar @selected="selected" :pagetype="pagetype" />

    <component :is="layout[name]"></component>
  </div>
</template>
<script>
import layout from "./index";
import navbar from "./navbar";
export default {
  components: {
    navbar
  },
  mounted() {
    this.pagetype = this.$route.query.pagetype;
  },
  data() {
    return {
      layout, // 装修模块
      name: "index", // 装修的页面
      pagetype: "INDEX",
    };
  },
  mounted() {
    if (this.$route.query.pagetype == "ALERT") {
      this.name = "alertAdvertising";
    }
    if (this.$route.query.pagetype == "OPEN_SCREEN_ANIMATION") {
      this.name = "advertising";
    }
    this.pagetype = this.$route.query.pagetype;
  },
  methods: {
    selected(val) {
      // 顶部栏点击切换
      this.name = val;
    }
  }
};
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
