<template>
  <div class="point-mall">
    <BaseHeader></BaseHeader>
    <Search></Search>
    <cateNav></cateNav>
    <ul class="category">
      <li @click="selectCate(cate.id)" :class="{'selected-cate': cate.id === params.pointsGoodsCategoryId}" v-for="(cate, index) in cateList" :key="index">{{cate.name}}</li>
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
    <div class="page-size">
      <Page :total="total" @on-change="changePageNum"
        @on-page-size-change="changePageSize"
        :page-size="params.pageSize"
        show-sizer>
      </Page>
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
      cateList: [{ // 商品分类
        name: '全部分类',
        id: ''
      }], // 积分分类列表
      params: { // 商品列表请求参数
        pageNumber: 1,
        pageSize: 20,
        pointsGoodsCategoryId: ''
      },
      total: 0 // 商品总数
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
          this.total = res.result.total
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
    selectCate (id) { // 选择商品分类
      this.params.pointsGoodsCategoryId = id
      this.getList()
      this.$router.push({query: {categoryId: id}})
    },
    goGoodsDetail (skuId, goodsId) { // 跳转商品详情
      let routerUrl = this.$router.resolve({
        path: '/goodsDetail',
        query: {skuId, goodsId, way: 'POINT'}
      })
      window.open(routerUrl.href, '_blank')
    },
    changePageNum (val) { // 修改页码
      this.params.pageNumber = val;
      this.getList()
    },
    changePageSize (val) { // 修改页数
      this.pageNumber = 1;
      this.params.pageSize = val;
      this.getList()
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
      color: $theme_color;
    }
  }

  .selected-cate{
    color: $theme_color;
  }
}
.page-size {
  width: 1200px;
  margin: 10px auto;
  display: flex;
  justify-content: flex-end;
}
.promotion-decorate::before,.promotion-decorate::after{
  background-image: url('../../static/sprite@2x.png');
}
</style>
