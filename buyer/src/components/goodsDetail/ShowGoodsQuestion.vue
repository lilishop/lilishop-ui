<template>
  <div class="wrapper">
    <div v-if="true" class="question-list">
      <div class="-item" v-for="index in 6" :key="index">
        <!-- 提问 -->
        <div class="-item-put -item-div">
          <div class="-item-div-l blod">
            <Tag color="warning">问</Tag>
            有屏幕调节亮度吗
          </div>
          <div class="-item-div-r">2020年10月21日17:03:35</div>
        </div>
        <!-- 解答 -->
        <div class="-item-reply -item-div">
          <div class="-item-div-l">
            <Tag color="success">答</Tag>
            能调节，点屏幕上方有一条调整带，可正负2调整。
          </div>
          <div class="-item-div-r">2020年10月21日17:03:35</div>
        </div>
      </div>
    </div>
    <div v-else class="question-empty">
      <empty></empty>
    </div>
  </div>
</template>
<script>
export default {};
</script>
<style scoped lang="scss">
.-item-div {
  padding: 10px 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 10px 0;
}
.-item-div-l {
  display: flex;
  @include content_color($light_content_color);
}
.-item-div-r {
  @include sub_color($light_content_color);
}
.blod {
  font-weight: bold;
}
.-item {
  margin: 10px 0;
  border-bottom: 1px solid $border_color;
}
</style>
