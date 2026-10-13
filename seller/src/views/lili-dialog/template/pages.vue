<template>
  <div class="wrapper">
    <!-- TODO 目前数据少暂且不用 -->
    <!-- <div class="list">
      <div class="list-item active">
        文章页
      </div>
    </div> -->
    <div class="content">
      <!-- <Article @callbacked="callbackArticle" :selected="true" /> -->
    </div>

  </div>
</template>
<script setup>
// import Article from "@/views/page/article-manage/articleList.vue";

const emit = defineEmits(["selected"]);

// 无 defineExpose：grep seller/src 全量确认无外部 ref/$refs/$parent 访问本组件成员
// （link-dialog.vue 的 $refs["lili-component"][0].type 写入指向首个 tab 的 goods-dialog，与本组件无关）
function callbackArticle(val) {
  val.___type = "pages";

  val.___path = "/pages/passport/article";

  emit("selected", [val]);
}
</script>
<style lang="scss" scoped>
:deep(.el-card__body) {
  height: 414px;
  overflow: auto;
}
.list {
  margin: 0 1.5%;
  height: 400px;
  overflow: auto;
  > .list-item {
    padding: 10px;
    transition: 0.35s;
    cursor: pointer;
  }
  .list-item:hover {
    background: #ededed;
  }
}
.list {
  flex: 2;
  width: auto;
}
.content {
  overflow: hidden;
  flex: 8;
  height: 431px;
}
.active {
  background: #ededed;
}
.wrapper {
  height: 416px;
  overflow: hidden;
}
:deep(.el-table) {
  height: 300px !important;
  overflow: auto;
}
:deep(.el-card__body) {
  padding: 0;
  height: auto;
}
</style>
