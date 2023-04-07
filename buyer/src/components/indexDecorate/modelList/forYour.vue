<template>
  <div class="model" v-if="data">
    <div class="for-your">{{ data.options.title }}</div>
    <div class="flex card">
      <div class="left">
        <img :src="data.options.data.image.src" alt="" />
      </div>
      <div class="right flex">
        <!-- 商品区 -->
        <div class="goods-list">
          <div
            class="goods-item"
            :key="index"
            v-for="(item, index) in data.options.data.list"
            @click="linkTo(item.url)"
          >
            <div>
              <div class="goods-name">{{ item.title }}</div>
              <div class="goods-desc">{{ item.desc }}</div>
            </div>
            <img class="goods-img" :src="item.img" alt="" />
          </div>
        </div>
        <!-- 热卖区 -->
        <div class="hot-list">
          <div class="hot-title">{{ data.options.data.hot.title }}</div>
          <div
            class="hot-item flex flex-a-c"
            v-for="(item, index) in data.options.data.hot.list"
            :key="index"
            @click="linkTo(item.url)"
          >
            <img :src="item.img" alt="" />
            <div class="hot-goods">
              <div class="hot-goods-title">{{ item.title }}</div>
              <div>
                <div class="hot-price">￥{{ item.price | unitPrice }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "forYour",
  data() {
    return {
      current: "",
    };
  },
  props: {
    data: {
      type: Object,
      default: {},
    },
  },

  mounted() {},
  methods: {},
};
</script>

<style scoped lang="scss">
.goods-list {
  display: flex;
  width: 558px;
  flex-wrap: wrap;
}
.goods-item {
  width: 278px;
  height: 277px;
  text-align: center;
  box-sizing: border-box;
  cursor: pointer;
  border-right: 1.4px solid #e2e2e2;
  &:nth-of-type(3) {
    border-top: 1.4px solid #e2e2e2;
  }
  &:nth-of-type(4) {
    border-top: 1.4px solid #e2e2e2;
  }
  &:hover {
    /deep/ .goods-name {
      color: $theme_color;
    }
    /deep/ .goods-desc {
      color: $theme_color;
    }
  }
}


.goods-name {
  margin-top: 23px;
  font-size: 25px;
  font-weight: normal;
  line-height: 30px;
  text-align: center;
  letter-spacing: 0px;

  color: #333333;
}
.goods-img {
  width: 190px;
  height: 156px;
  margin-top: 19px;
  border-radius: 10px;
}
.goods-desc {
  font-size: 14px;
  font-weight: normal;
  line-height: 17px;
  text-align: center;
  margin-top: 11px;
  letter-spacing: 0px;

  color: #333333;
}
.for-your {
  font-size: 35px;
  font-weight: normal;
  line-height: 42px;
  text-align: center;
  letter-spacing: 0px;
  margin-bottom: 32px;

  color: #333333;
}

.card,
.right-card {
  opacity: 1;
  background: #ffffff;
  border-radius: 10px;
  position: relative;
  box-shadow: 0px 1px 13px 0px #E5E5E5;

  &:hover {
    .setup-box {
      display: block;
    }
  }
}

.modal-tab-bar {
  > .flex {
    align-items: center;
    margin: 10px 0;
  }
}

.draggable {
  > .flex {
    align-items: center;
  }
}
.left {
  width: 346px;
  height: 554px;
  border-radius: 9.8px 0px 0px 9.8px;
  > img {
    max-width: 100%;
    height: 100%;
  }
}
.right {
  width: 839px;
  height: 554px;
  border-radius: 0px 9.8px 9.8px 0px;
}
.hot-list {
  width: 279px;
}
.hot-title {
  margin-left: 25px;
  line-height: 63px;
  font-size: 17px;
  font-weight: normal;

  letter-spacing: 0px;
  color: #333333;
  height: 63px;
}
.hot-item {
  cursor: pointer;
  box-sizing: border-box;
  border-top: 1.4px solid #e2e2e2;
  height: 122px;
  padding:0 14px;
  align-items: center;
  &:hover {
    > .hot-goods {
      > .hot-goods-title {
        color: $theme_color;
      }
    }
  }

  > img {
    width: 76.3px;
    height: 77.7px;
  }
}
.hot-goods {
  margin-left: 14px;
}
.hot-goods-title {
  font-size: 13px;
  font-weight: normal;
  line-height: 16px;
  letter-spacing: 0px;

  color: #333333;
}
.hot-price {
  margin-top: 10.3px;
  font-size: 24px;
  font-weight: normal;
  line-height: 29px;
  letter-spacing: 0px;

  color: $theme_color;
}
</style>
