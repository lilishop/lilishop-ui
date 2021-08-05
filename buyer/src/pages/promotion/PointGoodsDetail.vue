<template>
  <div style="background:#fff;">
    <BaseHeader></BaseHeader>
    <Search></Search>
    <!-- <drawer></drawer> -->
    <div class="base-width cate-container">
      <Breadcrumb>
        <BreadcrumbItem to="/">首页</BreadcrumbItem>
        <BreadcrumbItem v-for="(item, index) in categoryBar" :to="goGoodsList(index)" target="_blank" :key="index">{{item.name}}</BreadcrumbItem>
      </Breadcrumb>
    </div>
    <!-- 商品信息展示 -->
    <div class="item-detail-show">
      <!-- 详情左侧展示数据、图片，收藏、举报 -->
      <div class="item-detail-left">
        <!-- 大图、放大镜 -->
        <div class="item-detail-big-img">
          <pic-zoom :url="imgList[imgIndex].url" :scale="2"></pic-zoom>
        </div>
        <div class="item-detail-img-row">
          <div
            class="item-detail-img-small"
            @mouseover="imgIndex = index"
            v-for="(item, index) in imgList"
            :key="index"
          >
            <img :src="item.url" />
          </div>
        </div>

        <div class="goodsConfig mt_10">
          <span @click="collect" ><Icon type="ios-heart" :color="isCollected ? '#ed3f14' : '#666'" />{{isCollected?'已收藏':'收藏'}}</span>
        </div>
      </div>
      <!-- 右侧商品信息、活动信息、操作展示 -->
      <div class="item-detail-right">
        <div class="item-detail-title">
          <p>
            {{ skuDetail.goodsName }}
          </p>
        </div>
        <div class="sell-point">
          {{skuDetail.sellingPoint}}
        </div>
        <!-- 商品详细 价格、优惠券、促销 -->
        <div class="item-detail-price-row">
          <div class="item-price-left">
            <!-- 商品原价 -->
            <div class="item-price-row" v-if="!skuDetail.promotionPrice">
              <p>
                <span class="item-price-title">价 &nbsp;&nbsp;&nbsp;&nbsp;格</span>
                <span class="item-price">{{skuDetail.price | unitPrice("￥")}}</span>
              </p>
            </div>
        </div>
        <!-- 选择规格 -->
        <div class="item-select" v-for="(sku, index) in formatList" :key="sku.name">
          <div class="item-select-title">
            <p>{{ sku.name }}</p>
          </div>
          <div class="item-select-column">
            <div class="item-select-row" v-for="(item) in sku.values" :key="item.value">
              <div class="item-select-box" @click="select(index, item.value)"
                :class="{ 'item-select-box-active': item.value === currentSelceted[index] }"
              >
                <div class="item-select-intro">
                  <p>{{ item.value }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <br />
        <div class="add-buy-car-box">
          <div class="item-select">
            <div class="item-select-title">
              <p>数量</p>
            </div>
            <div class="item-select-row">
              <InputNumber :min="1" :disabled="skuDetail.quantity === 0" v-model="count"></InputNumber>
              <span class="inventory"> 库存{{skuDetail.quantity}}</span>
            </div>
          </div>
          <div class="item-select" v-if="skuDetail.goodsType !== 'VIRTUAL_GOODS' && skuDetail.weight !== 0">
            <div class="item-select-title">
              <p>重量</p>
            </div>
            <div class="item-select-row">
              <span class="inventory"> {{skuDetail.weight}}kg</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- 商品详情 -->
    <div class="base-width item-intro" ref="itemIntroGoods">
      <div>商品介绍</div>
      <div v-html="goodsSku.intro" v-if="goodsSku.intro"></div>
      <div v-else style="margin:20px;">暂无商品介绍</div>
    </div>
    <Spin size="large" fix v-if="isLoading"></Spin>
    <BaseFooter></BaseFooter>
  </div>
</template>

<script>
import Search from '@/components/Search';
import PicZoom from 'vue-piczoom'; 
import { pointGoodsDetail } from '@/api/promotion';
export default {
  name: 'PointGoodsDetail',
  beforeRouteEnter (to, from, next) {
    window.scrollTo(0, 0);
    next();
  },
  created () {
    this.getGoodsDetail();
  },
  mounted () {
    window.addEventListener('scroll', this.handleScroll)
  },
  data () {
    return {
      goodsMsg: {}, // 商品信息
      goodsSku: {}, // 商品sku
      isLoading: false, // 加载状态
      categoryBar: [], // 分类
      onceFlag: true // 只调用一次
    };
  },
  methods: {
    // 获取积分商品详情
    getGoodsDetail () {
      this.isLoading = true;
      pointGoodsDetail(this.$route.query.id).then((res) => {
        this.isLoading = false;
        if (res.success) {
          this.goodsMsg = res.result;
          this.goodsSku = res.result.goodsSku
        } else {
          this.$Message.error(res.message)
          // this.$router.push('/')
        }
      }).catch(() => {
        // this.$router.push('/')
      });
    },
    goGoodsList (currIndex) { // 跳转商品列表
      const arr = []
      this.categoryBar.forEach((e, index) => {
        if (index <= currIndex) {
          arr.push(e.id)
        }
      })
      return location.origin + '/goodsList?categoryId=' + arr.toString()
    },
    handleScroll () { // 监听页面滚动
      if (this.onceFlag) {
        this.$nextTick(() => {
          this.changeHeight('itemIntroGoods')
        });
        this.onceFlag = false
      }
    }
  },
  components: {
    Search, PicZoom
  }
};
</script>
<style scoped lang="scss">
.base-width{
  width: 1200px;
  margin: 0 auto;
  position: relative;
}
.cate-container {
  
}
.item-intro {
  margin-top: 10px;
  >div:nth-child(1) {
    height: 40px;
    line-height: 40px;
    background-color: #eee;
    padding-left: 20px;
  }
}
</style>
