<template>
  <div class="layout">
    <el-carousel class="carousel" v-if="res" autoplay :interval="5000" height="150px">
      <el-carousel-item v-for="(item, index) in res.list" :key="index">
        <div>
          <img class="image-mode" :src="item.img" />
        </div>
      </el-carousel-item>
    </el-carousel>
  </div>
</template>
<script>
export default {
  title: "导航栏",
  props: ["res"],
};
</script>
<style lang="scss" scoped>
@import "./tpl.scss";
.carousel,
.image-mode {
  height: 150px;
}
</style>