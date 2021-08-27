<template>
  <div class="foot">
    <Row type="flex" justify="space-around" class="help">
      <a class="item" href="https://pickmall.cn/" target="_blank">帮助</a>
      <a class="item" href="https://pickmall.cn/" target="_blank">隐私</a>
      <a class="item" href="https://pickmall.cn/" target="_blank">条款</a>
    </Row>
    <Row type="flex" justify="center" class="copyright">
      Copyright © {{year}} - Present
      <a href="https://pickmall.cn/" target="_blank" style="margin:0 5px;">lili-shop</a>
    </Row>
  </div>
</template>

<script>
export default {
  name: "footer",
  data() {
    return {
      year: new Date().getFullYear(), // 年
    };
  },
};
</script>

<style lang="scss" scoped>
.foot {
  position: fixed;
  bottom: 4vh;
  width: 368px;
  color: rgba(0, 0, 0, 0.45);
  font-size: 14px;
  .help {
    margin: 0 auto;
    margin-bottom: 1vh;
    width: 60%;
    .item {
      color: rgba(0, 0, 0, 0.45);
    }
    :hover {
      color: rgba(0, 0, 0, 0.65);
    }
  }
}
</style>
