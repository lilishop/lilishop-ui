<template>
  <div class="layout">
    <div class="background">
      <div class="title" :style="{ color: res.list[0].color }">
        {{ res.list[0].title }}
      </div>
    </div>
  </div>
</template>

<script>
export default {
  title: "标题栏",
  props: ["res"]
};
</script>
<style lang="scss" scoped>
@import "./tpl.scss";
.background {
  background: url("../../../../assets/title.png") no-repeat;
  position: absolute;
  z-index: 2;
  width: 100%;

  height: 42px;
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
  font-size: 15px;
  font-weight: bold;
}
</style>
