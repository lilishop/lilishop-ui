<template>
  <div class="point-mall">
    <BaseHeader></BaseHeader>
    <Search></Search>
    <cateNav></cateNav>
    <ul class="category">
      <li @click="selectCate(cate.id)" v-for="(cate, index) in cateList" :key="index">{{cate.name}}</li>
    </ul>
    <h3 class="promotion-decorate">积分商品</h3>
    <!-- 列表 -->
    <div class="goods-list">
      <empty v-if="goodsList.length === 0" />
      <div
        v-else
        class="goods-show-info"
        v-for="(item, index) in goodsList"
        :key="index"
        @click="goGoodsDetail(item.skuId, item.goodsSku.goodsId)"
      >
        <div class="goods-show-img">
          <img width="220" height="220" :src="item.goodsSku.thumbnail" />
        </div>
        <div class="goods-show-price">
          <span>
            <span class="seckill-price text-danger">{{
              item.settlementPrice | unitPrice("￥")
            }} + {{item.points}}积分</span>
          </span>
        </div>
        <div class="goods-show-detail">
          <span>{{ item.goodsSku.goodsName }}</span>
        </div>
        <div class="goods-show-num">
          已有<span>{{ item.commentNum || 0 }}</span
          >人评价
        </div>
        <div class="goods-show-seller">
          <span>{{ item.storeName }}</span>
        </div>
      </div>
    </div>
    <BaseFooter></BaseFooter>
  </div>
</template>
<script>
import {pointGoods, pointGoodsCategory} from '@/api/promotion.js'
export default {
  data () {
    return {
      goodsList: [], // 积分商品列表
      cateList: [{
        name: '全部分类',
        id: ''
      }], // 积分分类列表
      params: { // 商品列表请求参数
        pageNumber: 1,
        pageSize: 20,
        pointsGoodsCategoryId: ''
      }
    }
  },
  mounted () {
    this.params.pointsGoodsCategoryId = this.$route.query.categoryId || ''
    this.getList()
    this.getCate()
  },
  methods: {
    getList () { // 获取列表
      pointGoods(this.params).then(res => {
        if (res.success) {
          this.goodsList = res.result.records
        }
      })
    },
    getCate () { // 获取分类
      pointGoodsCategory(this.params).then(res => {
        if (res.success) {
          this.cateList.push(...res.result.records)
        }
      })
    },
    selectCate (id) {
      this.params.pointsGoodsCategoryId = id
      this.getList()
      this.$router.push({query: {categoryId: id}})
    }
  }
}
</script>
<style lang="scss" scoped>
@import '../assets/styles/goodsList.scss';
.seckill-price {
  font-size: 18px;
}
.category {
  width: 1200px;
  margin: 0 auto;
  display: flex;
  height: 30px;
  line-height: 30px;
  background-color:#005aa0;
  color: #fff;
  li{
    margin: 0 10px;
    &:hover{
      cursor: pointer;
    }
  }
}
.promotion-decorate::before,.promotion-decorate::after{
  background-image: url('../../static/sprite@2x.png');
}
</style>
