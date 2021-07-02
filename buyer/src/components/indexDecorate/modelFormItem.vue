<template>
  <div class="model-item" v-if="element && element.key">
    <!-- 轮播图模块，包括个人信息，快捷导航模块 -->
    <template v-if="element.type == 'carousel'">
      <model-carousel :data="element" class="mb_20"></model-carousel>
    </template>
    <!-- 热门广告 -->
    <template v-if="element.type == 'hotAdvert'">
      <div class="mb_20">
        <img
          style="display: block"
          class="hover-pointer"
          :src="element.options.list[0].img"
          @click="linkTo(element.options.list[0].url)"
          width="1200"
          alt=""
        />
      </div>
      <ul class="advert-list">
        <template v-for="(item, index) in element.options.list">
          <li
            v-if="index !== 0"
            @click="linkTo(item.url)"
            class="hover-pointer"
            :key="index"
          >
            <img :src="item.img" width="230" height="190" alt="" />
          </li>
        </template>
      </ul>
    </template>
    <!-- 限时秒杀 待完善 -->
    <!-- <template v-if="element.type == 'seckill'">
      <seckill :data="element"></seckill>
    </template> -->
    <!-- 折扣广告 -->
    <template v-if="element.type == 'discountAdvert'">
      <div
        class="discountAdvert mb_20"
        :style="{
          'background-image': 'url(' + element.options.bgImg.img + ')',
        }"
      >
        <img
          @click="linkTo(item.url)"
          class="hover-pointer"
          v-for="(item, index) in element.options.classification"
          :key="index"
          :src="item.img"
          width="190"
          height="210"
          alt=""
        />
        <img
          @click="linkTo(item.url)"
          class="hover-pointer"
          v-for="(item, index) in element.options.brandList"
          :key="'discount' + index"
          :src="item.img"
          width="240"
          height="105"
          alt=""
        />
      </div>
    </template>

    <!-- 好货推荐 -->
    <template v-if="element.type == 'recommend'">
      <recommend :data="element" class="mb_20"></recommend>
    </template>
    <!-- 新品排行 -->
    <template v-if="element.type == 'newGoodsSort'">
      <new-goods-sort :data="element" class="mb_20"></new-goods-sort>
    </template>
    <!-- 首页广告 -->
    <template v-if="element.type == 'firstAdvert'">
      <first-page-advert :data="element" class="mb_20"></first-page-advert>
    </template>
    <!-- 横幅广告 -->
    <template v-if="element.type == 'bannerAdvert'">
      <img
        width="1200"
        class="hover-pointer mb_20"
        @click="linkTo(element.options.url)"
        :src="element.options.img"
        alt=""
      />
    </template>
    <template v-if="element.type == 'notEnough'">
      <not-enough :data="element" class="mb_20"></not-enough>
    </template>
  </div>
</template>

<script>
import ModelCarousel from './modelList/carousel.vue';
import FirstPageAdvert from './modelList/firstPageAdvert.vue';
import NewGoodsSort from './modelList/newGoodsSort.vue';
import Recommend from './modelList/recommend.vue';
import NotEnough from './modelList/notEnough.vue';
import Seckill from './modelList/seckill.vue';

export default {
  name: 'modelFormItem',
  props: ['element', 'select', 'index', 'data'],
  components: {
    ModelCarousel,
    Recommend,
    NewGoodsSort,
    FirstPageAdvert,
    NotEnough,
    Seckill
  },
  data () {
    return {
      showModal: false, // 控制模态框显隐
      selected: {} // 已选数据
    };
  }
};
</script>
<style lang="scss" scoped>
.model-item {
  position: relative;
  background-color: #fff;
}

/** 热门广告 */
.advert-list {
  background: $theme_color;
  height: 200px;
  display: flex;
  justify-content: space-around;
  padding: 3px 10px;
  > li {
    img {
      cursor: pointer;
      border-radius: 10px;
      transition: all 150ms ease-in-out;
      &:hover {
        transform: translateY(-3px);
        box-shadow: rgba(0, 0, 0, 0.4) 0px 5px 20px 0px;
      }
    }
  }
}
/** 限时秒杀 */
.limit-img {
  display: flex;
  flex-direction: row;
  img {
    width: 300px;
    height: 100px;
  }
}
/** 折扣广告 */
.discountAdvert {
  height: 566px;
  background-repeat: no-repeat;
  margin-left: -97px;
  position: relative;
  padding-left: 295px;
  display: flex;
  flex-wrap: wrap;
  align-items: start;
  img {
    margin-top: 10px;
    margin-right: 10px;
    transition: all 150ms ease-in-out;
    &:hover {
      box-shadow: 0 5px 12px 0 rgba(0, 0, 0, 0.4);
      transform: translateY(-2px);
    }
  }
}
/** 首页品牌 */
.brand {
  .brand-view {
    display: flex;
    margin-top: 10px;
    .brand-view-content {
      width: 470px;
      margin-left: 10px;
      img {
        width: 100%;
        height: 316px;
      }
      .brand-view-title {
        height: 50px;
        padding: 0 5px;
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
    }
    .brand-view-content:first-child {
      width: 240px;
      margin-left: 0;
    }
  }
  .brand-list {
    margin-top: 10px;
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    li {
      width: 121px;
      height: 112px;
      position: relative;
      overflow: hidden;
      border: 1px solid #f5f5f5;
      margin: -1px -1px 0 0;
      &:hover {
        .brand-mash {
          display: flex;
        }
      }
      .brand-img {
        text-align: center;
        margin-top: 30px;
        img {
          width: 100px;
          height: auto;
        }
      }
      .brand-mash {
        display: none;
        position: absolute;
        top: 0;
        left: 0;
        background: rgba(0, 0, 0, 0.5);
        width: inherit;
        height: inherit;
        font-size: 12px;
        font-weight: bold;
        .ivu-icon {
          position: absolute;
          right: 10px;
          top: 10px;
          font-size: 15px;
        }
        align-items: center;
        justify-content: center;
        flex-direction: column;
        color: #fff;
        cursor: pointer;
        div:last-child {
          background-color: $theme_color;
          border-radius: 9px;
          padding: 0 10px;
          margin-top: 5px;
        }
      }
    }
    .refresh {
      display: flex;
      align-items: center;
      flex-direction: column;
      justify-content: center;
      .ivu-icon {
        font-size: 18px;
        transition: all 0.3s ease-out;
      }
      &:hover {
        background-color: $theme_color;
        color: #fff;
        .ivu-icon {
          transform: rotateZ(360deg);
        }
      }
    }
  }
}

/** 装修模态框 内部样式start */
.modal-top-advert {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  > * {
    margin-bottom: 10px;
  }
}
</style>

