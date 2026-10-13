<template>
  <div class="layout">
    <div class="background" :style="{ backgroundColor: res.list[0].bk_color }">
      <img :src="res.list[0].img" alt="" style="float:left;width: 20px;height: 20px;margin-top: 10px;margin-left: 10px;margin-right: 10px">
      <div class="title" :style="{ color: res.list[0].color }">
        {{ context }}
      </div>
    </div>
  </div>
</template>

<script setup>
  import { ref, onMounted } from "vue";

  defineOptions({ title: "公告" });
  const props = defineProps(["res"]);

  const index = ref(0);
  const context = ref("");

  onMounted(() => {
    context.value = props.res.list[0].title[index.value].context;
    // 历史遗留：定时器未在卸载时清理，保持原行为
    setInterval(() => {
      context.value = props.res.list[0].title[index.value].context;
      if (index.value < props.res.list[0].title.length - 1) {
        index.value++;
      } else {
        index.value = 0;
      }
    }, 3000);
  });
</script>
<style lang="scss" scoped>
  @import "./tpl.scss";
  .background {
    position: absolute;
    z-index: 2;
    width: 100%;
    height: 42px;
    text-align: left;
    font-size: 10px;
    background-size: cover;
  }
  .layout {
    text-align: center;
    position: relative;
    height: 42px;
    display: flex;
    align-items: center;
    justify-content: center;

    background: #ffffff;
  }
  .title {
    line-height: 42px;
    font-size: 10px;
    font-weight: bold;
  }
</style>
