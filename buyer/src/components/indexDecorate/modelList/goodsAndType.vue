<template>
  <div class="goods-type-wrapper">
    <div class="flex goods-type-line">
      <div class="goods-type-title">{{ paramData.options.title }}</div>
      <div class="flex goods-type-labels">
        <div
          :class="{ active: current === item.___index }"
          class="goods-type-item"
          v-for="(item, index) in paramData.options.labels"
          :key="index"
          @click="handleClickLabel(item, index)"
        >
          {{ item.label }}
        </div>
      </div>
    </div>
    <!-- 商品部分 -->
    <div class="only-goods-list flex-j-sb">
      <div
        v-if="paramData.options"
        class="only-goods-list-item "
        v-for="(item, index) in paramData.options.list.filter((client) => {
          return client.___index == current;
        })"
        :key="index"
        @click="linkTo(item.url)"
      >
        <div class="goods-img">
          <img :src="item.img" />
        </div>
        <div>
          <div class="goods-name wes-2">{{ item.title }}</div>
          <div class="goods-desc">{{ item.desc }}</div>
        </div>
        <div class="goods-price">
          {{ item.price | unitPrice("￥") }}
        </div>
        <!-- 查看 -->
        <div class="white-shadow">
          <div class="search">去查看</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "goods",
  props: {
    paramData: {
      type: Object,
      default: {},
    },
  },
  data() {
    return {
      current: "",
    };
  },
  watch: {},
  mounted() {
    this.current = this.paramData.options.labels[0].___index;
  },
  methods: {
    // 筛选出当前分类下的商品
    handleClickLabel(val, index) {
      this.current = index;
    },
  },
};
</script>

<style scoped lang="scss">
.white-shadow {
  width: 287px;
  height: 122px;
  border-radius: 0px 0px 10px 10px;
  opacity: 1;
  position: absolute;
  bottom: 0;
  left: 0;
  opacity: 0;
  display: flex;
  justify-content: center;
  transition: 0.35s;
  align-items: center;
  background: linear-gradient(
    180deg,
    rgba(252, 252, 252, 0.58) -50%,
    #ffffff 99%
  );
}
.search {
  width: 143px;
  height: 45px;
  border-radius: 22.5px;
  opacity: 1;
  font-size: 20px;
  font-weight: normal;
  text-align: center;
  letter-spacing: 0px;
  line-height: 45px;
  color: #ffffff;
  background: $theme_color;
}
.only-goods-list{
  display: flex;
  flex-wrap: wrap;

}
.only-goods-list-item {
  padding-top: 30px;
  width: 287px;
  height: 343.7px;
  border-radius: 9.8px;
  opacity: 1;
  margin-bottom: 14.3px;
  cursor: pointer;
  background: #ffffff;
  transition: all 0.4s ease;
  box-shadow: 0px 1px 13px 0px #e5e5e5;
  position: relative;
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0px 1px 14px 0px #c5c5c5;
    > .white-shadow {
      opacity: 1;
    }
    > .goods-img {
      > img {
        opacity: 0.8 !important;
      }
    }
  }
}
.goods-img {
  margin-bottom: 9.8px;
  text-align: center;
  > img {
    transition: all 0.4s ease;
    width: auto;
    max-height: 183px;
  }
}
.goods-name {
  font-size: 18px;

  font-weight: normal;
  line-height: 22px;
  text-align: center;
  letter-spacing: 0px;
  width: 200px;
  margin: 0 auto 12.4px auto;
  color: #333333;
  -webkit-text-stroke: #979797 0.7px; /* 浏览器可能不支持 */
}
.goods-desc {
  font-size: 14px;
  font-weight: normal;
  line-height: 17px;
  text-align: center;
  letter-spacing: 0px;
  margin-bottom: 12.4px;
  color: #666666;

  -webkit-text-stroke: #979797 0.7px; /* 浏览器可能不支持 */
}
.goods-price {
  font-size: 25.2px;
  font-weight: normal;
  line-height: 30px;
  text-align: center;
  letter-spacing: 0px;

  color: #f31947;
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
  color: #f31947;
}
.goods-type-labels {
  cursor: pointer;
  font-size: 21px;
  font-weight: normal;
  line-height: 25px;
  letter-spacing: 0px;
}
.goods-type-item {
  margin-left: 28px;
}
</style>
