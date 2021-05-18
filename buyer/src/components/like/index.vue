<template>
  <div class="wrapper">
    <card _Title="猜你喜欢" :_Size="16"> </card>

    <Row :gutter="12" class="likeList">
      <Col
        :span="4"
        class="likeItem"
        v-for="(item, index) in goodsData"
        :key="index"
      >
        <img :src="item.img" alt="" />
        <div class="likeTitle">{{ item.title }}</div>
        <div class="likePrice">{{ item.price | unitPrice }}</div>
      </Col>
    </Row>
  </div>
</template>

<script>
export default {
  name: 'like',
  data () {
  }
};
</script>

<style scoped lang="scss">
.wrapper {
  @include white_background_color();
}
.likeList {
  padding: 0 12px;
  display: flex;
  flex-wrap: wrap;

  > .likeItem {
    /*width: 210px;*/
    /*margin: 10px 5px;*/

    > img {
      display: block;
      width: 100%;
      height: auto;
    }

    > .likeTitle,
    .likePrice {
      margin: 6px 0;
      text-align: center;
      display: -webkit-box;

      -webkit-box-orient: vertical;

      -webkit-line-clamp: 2;

      overflow: hidden;
    }

    > .likePrice {
      color: $theme_color;
    }
  }
}
</style>
