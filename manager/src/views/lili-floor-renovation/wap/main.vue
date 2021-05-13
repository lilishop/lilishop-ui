<template>
  <div class="box">
    <!-- 顶部栏 -->
    <navbar @selected="selected" />

    <component :is="layout[name]"></component>
  </div>
</template>
<script>
import layout from "./index";
import navbar from "./navbar";
export default {
  components: {
    navbar,
  },
  data() {
    return {
      layout, // 装修模块
      name: "index", // 装修的页面
    };
  },
  mounted() {

  },
  methods: {
    selected(val) {
      this.name = val;
    },


  },
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
