<template>
  <div class="model-item" v-if="element && element.key">
    <!-- 轮播图模块，包括个人信息，快捷导航模块 -->
    <template v-if="element.type == 'carousel'">
      <div class="carousel-wrap mb_20">
        <model-carousel :key="element.key" :data="element"></model-carousel>
      </div>
    </template>
    <template v-if="element.type == 'carousel1'">
      <model-carousel1 :data="element" class="mb_20"></model-carousel1>
    </template>
    <template v-if="element.type == 'carousel2'">
      <model-carousel2
        :data="element"
        class="mb_20 width_1200_auto"
      ></model-carousel2>
    </template>
    <!-- 热门广告 -->
    <template v-if="element.type == 'hotAdvert'">
      <div class="hot-advert mb_20 width_1200_auto">
        <div class="hot-advert-banner">
          <img
            class="hover-pointer"
            :src="element.options.list[0].img"
            @click="linkTo(element.options.list[0].url)"
            alt=""
          />
        </div>
        <ul class="advert-list">
          <template v-for="(item, index) in element.options.list" :key="index">
            <li
              v-if="index !== 0"
              @click="linkTo(item.url)"
              class="hover-pointer"
            >
              <img :src="item.img" alt="" />
            </li>
          </template>
        </ul>
      </div>
    </template>
    <!-- 限时秒杀 待完善 -->
    <template v-if="element.type == 'seckill' && element.options?.list?.length">
      <seckill :data="element" class="mb_20 width_1200_auto"></seckill>
    </template>
    <!-- 折扣广告 -->
    <template v-if="element.type == 'discountAdvert'">
      <div class="discountAdvert-wrap width_1200_auto mb_20">
        <div
          class="discountAdvert"
          :style="{
            backgroundImage: 'url(' + decorateImg + ')',
          }"
        >
          <div>
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
          </div>
          <div>
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
        </div>
      </div>
    </template>

    <!-- 好货推荐 -->
    <template v-if="element.type == 'recommend'">
      <recommend :data="element" class="mb_20 width_1200_auto"></recommend>
    </template>

    <!-- 一行三列 -->
    <template v-if="element.type == 'oneRowThreeColumns'">
      <oneRowThreeColumns :data="element" class="mb_20 width_1200_auto"></oneRowThreeColumns>
    </template>
    <!-- 商品模块 -->
    <template v-if="element.type == 'goodsType'">
      <goodsAndType :paramData="element" class="mb_20 width_1200_auto"></goodsAndType>
    </template>
    <!-- 商品模块 -->
    <template v-if="element.type == 'onlyGoodsModel'">
      <onlyGoodsModel :data="element" class="mb_20 width_1200_auto"></onlyGoodsModel>
    </template>
    <!-- 混合模块 -->
    <template v-if="element.type == 'mixModel'">
      <mixModel :data="element" class="mb_20 width_1200_auto"></mixModel>
    </template>
    <!-- 混合模块 -->
    <template v-if="element.type == 'forYour'">
      <forYour :data="element" class="mb_20 width_1200_auto"></forYour>
    </template>
    <!-- 新品排行 -->
    <template v-if="element.type == 'newGoodsSort'">
      <new-goods-sort
        :data="element"
        class="mb_20 width_1200_auto"
      ></new-goods-sort>
    </template>
    <!-- 首页广告 -->
    <template v-if="element.type == 'firstAdvert'">
      <first-page-advert
        :data="element"
        class="mb_20 width_1200_auto"
      ></first-page-advert>
    </template>
    <!-- 横幅广告 -->
    <template v-if="element.type == 'bannerAdvert' && element.options.img">
      <div
        class="horizontal-advert width_1200_auto mb_20 hover-pointer"
        @click="linkTo(element.options.url)"
      >
        <img class="bannerAd" :src="element.options.img" alt="" />
      </div>
    </template>
    <template v-if="element.type == 'notEnough'"
        >
      <not-enough
        :data="element"
        class="mb_20 width_1200_auto"
      ></not-enough>
    </template>
  </div>
</template>

<script>
import ModelCarousel from "./modelList/Carousel.vue";
import ModelCarousel1 from "./modelList/Carousel1.vue";
import ModelCarousel2 from "./modelList/Carousel2.vue";
import FirstPageAdvert from "./modelList/FirstPageAdvert.vue";
import NewGoodsSort from "./modelList/NewGoodsSort.vue";
import Recommend from "./modelList/Recommend.vue";
import NotEnough from "./modelList/NotEnough.vue";
import Seckill from "./modelList/Seckill.vue";
import oneRowThreeColumns from "./modelList/oneRowThreeColumns.vue";
import goodsAndType from "./modelList/goodsAndType.vue";
import onlyGoodsModel from "./modelList/onlyGoodsModel.vue";
import mixModel from "./modelList/mixModel.vue";
import forYour from "./modelList/forYour.vue";
import decorateImg from "@/assets/images/decorate.png";

export default {
  name: "modelFormItem",
  props: ["element", "select", "index", "data"],
  components: {
    ModelCarousel,
    ModelCarousel1,
    ModelCarousel2,
    Recommend,
    NewGoodsSort,
    FirstPageAdvert,
    NotEnough,
    Seckill,
    oneRowThreeColumns,
    goodsAndType,
    onlyGoodsModel,
    mixModel,
    forYour
  },
  data() {
    return {
      decorateImg,
      showModal: false, // 控制模态框显隐
      selected: {}, // 已选数据
    };
  },
};
</script>
<style lang="scss" scoped>
.model-item {
  position: relative;
  margin-bottom: 10px;
  width: 100%;
  box-sizing: border-box;
}
.carousel-wrap {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  box-sizing: border-box;
  overflow: hidden;
}
/** 横幅广告 */
.horizontal-advert {
  width: 100%;
  max-width: 1200px;
  overflow: hidden;
  border-radius: 10px;
  line-height: 0;
}
.bannerAd {
  display: block;
  width: 100%;
  height: auto;
  max-height: 166px;
  object-fit: cover;
}
/** 热门广告 */
.hot-advert {
  width: 1200px;
  max-width: 100%;
  overflow: hidden;

  .hot-advert-banner {
    line-height: 0;

    img {
      display: block;
      width: 100%;
      height: auto;
    }
  }
}
.advert-list {
  width: 100%;
  margin: 0;
  padding: 10px;
  list-style: none;
  box-sizing: border-box;
  background: $theme_color;
  height: 210px;
  display: flex;
  gap: 10px;
  align-items: center;
  > li {
    flex: 1 1 0;
    min-width: 0;
    img {
      display: block;
      width: 100%;
      height: 190px;
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

/** 折扣广告 */
.discountAdvert-wrap {
  width: 1200px;
  position: relative;
  overflow: visible;
}
.discountAdvert {
  width: 1300px;
  height: 585px;
  margin-left: -100px;
  box-sizing: border-box;
  background-repeat: no-repeat;
  background-size: 1300px 585px;
  background-position: left top;
  position: relative;
  > div {
    padding-left: 295px;
    display: flex;
    flex-wrap: wrap;
    box-sizing: border-box;
    &:nth-child(1) img {
      margin: 10px 10px 0 0;
      transition: all 150ms ease-in-out;
      &:hover {
        box-shadow: 0 5px 12px 0 rgba(0, 0, 0, 0.4);
        transform: translateY(-2px);
      }
    }
    &:nth-child(2) {
      margin-top: 10px;
      img {
        margin: 0 10px 0 0;
        transition: all 150ms ease-in-out;
        &:hover {
          box-shadow: 0 5px 12px 0 rgba(0, 0, 0, 0.4);
          transform: translateY(-2px);
        }
      }
    }
  }
}

</style>
