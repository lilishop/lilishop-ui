<template>
  <div class="goods-type-wrapper">
    <!-- 商品部分 -->
    <div class="only-goods-list flex" >
      <div
        class="only-goods-list-item"
        v-for="(item, index) in data.options.list"
        :key="index"
        @click="handleClick(item)"
      >
        <div>
          <div class="goods-name wes-2">{{ item.title }}</div>
          <div class="goods-desc">{{ item.desc }}</div>
        </div>
        <div class="goods-img">
          <img :src="item.img" />
        </div>
      </div>
    </div>

  </div>
</template>

<script>

export default {
  name: "onlyGoodsList",
  props: {
    data: {
      type: Object,
      default: {},
    },
  },
  data() {
    return {
      flag:false,
      tabIndex:0,
      current: 0,
      showModal: false,
      selected: {}, // 已选数据
      picModelFlag: false,
    };
  },
  mounted(){

  },
  methods: {
    handleClick(val){
      this.linkTo(val.url)
    },
  },
};
</script>

<style scoped lang="scss">

.goods-type-wrapper {
  position: relative;
}
.del-btn{
  margin-left:10px;
}
.tab-bar {
  margin-bottom: 20px;
}
.draggable {
  padding: 10px;
  border-bottom: 1px solid #ededed;
  transition: 0.35s;

  &:hover {
    background-color: #ededed;
  }
}
.column-config {
  margin-left: 10px;
  > * {
    margin: 4px;
  }
}
.column-img {
  width: 100px;
  height: 100px;
}
.add-goods {
  margin-left: 20px;
  margin-bottom: 10px;
}
.only-goods-list {
  position: relative;
  flex-wrap: wrap;
  justify-content: space-between;
  &:hover {
    > .setup-box {
      display: block;
    }
  }
}
.column-goods-config {
  flex: 2;
  align-items: center;
  justify-content: space-between;
}
.only-goods-list-item {
  padding-top: 34.8px;
  margin-bottom: 14.3px;
  width: 287px;
  height: 343.7px;
  border-radius: 9.8px;
  opacity: 1;
  cursor: pointer;
  background: #ffffff;
  transition: 0.35s;
  box-shadow: 0px 1px 13px 0px #e5e5e5;
  &:hover {
    box-shadow: 0px 1px 14px 0px #c5c5c5;
    transform: translateY(-2px);
  }
}
.goods-img {
  text-align: center;
  > img {
    width: auto;
    max-height: 183px;
  }
}
.goods-name {
  margin-bottom: 11.9px;
  font-size: 25px;
  font-weight: normal;
  line-height: 30px;
  text-align: center;
  letter-spacing: 0px;

  color: #333333;

  -webkit-text-stroke: #979797 0.7px; /* 浏览器可能不支持 */
}
.goods-desc {
  margin-bottom: 30px;
  font-size: 16px;
  font-weight: normal;
  line-height: 19px;
  text-align: center;
  letter-spacing: 0px;

  color: #666666;

  -webkit-text-stroke: #979797 0.7px; /* 浏览器可能不支持 */
}
.goods-price {
  font-size: 25.2px;
  font-weight: normal;
  line-height: 30px;
  text-align: center;
  letter-spacing: 0px;

  color: $theme_color;
  -webkit-text-stroke: #979797 0.7px; /* 浏览器可能不支持 */
}
.goods-type-line {
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
}
.goods-type-title {
  font-size: 31px;
  font-weight: normal;
  line-height: 37px;
  letter-spacing: 0px;

  color: #333333;
}
.active {
  color: $theme_color;
}
.goods-type-labels {
  font-size: 21px;
  font-weight: normal;
  line-height: 25px;
  letter-spacing: 0px;
}
.goods-type-item {
  margin-left: 28px;
}
</style>
