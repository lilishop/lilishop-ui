<template>
  <div class="wrapper">
    <empty v-if="list.length==0" />
    <ul class="coupon-list" v-else>
      <li v-for="(item, index) in list" class="coupon-item" :key="index">
        <div class="c-left">
          <div>
            <span v-if="item.couponType === 'PRICE'" class="fontsize_12 global_color">￥<span class="price">{{item.price | unitPrice}}</span></span>
            <span v-if="item.couponType === 'DISCOUNT'" class="fontsize_12 global_color"><span class="price">{{item.couponDiscount}}</span>折</span>
            <span class="describe">满{{item.consumeThreshold}}元可用</span>
          </div>
          <p>使用范围：{{useScope(item.scopeType, item.storeName)}}</p>
          <p>有效期：{{item.endTime}}</p>
        </div>
        <b></b>
        <a class="c-right" @click="go(item)">立即使用</a>
        <i class="circle-top"></i>
        <i class="circle-bottom"></i>
      </li>
    </ul>
    <Page :total="total" @on-change="changePageNum"
      v-if="list.length && total > params.pageNumber"
      class="pageration"
      @on-page-size-change="changePageSize"
      :page-size="params.pageSize"
      show-sizer>
    </Page>
    <Spin v-if="loading" fix></Spin>
  </div>
</template>

<script>
import { memberCouponList } from '@/api/member.js';
export default {
  data () {
    return {
      loading: false, // 列表加载状态
      params: { // 请求参数
        pageNumber: 1,
        pageSize: 10
      },
      total: 0, // 优惠券总数
      list: [] // 优惠券列表
    };
  },
  methods: {
    getList () { // 获取优惠券列表
      this.loading = true
      memberCouponList(this.params).then(res => {
        this.loading = false
        if (res.success) {
          this.list = res.result.records
          this.total = res.result.total
        }
      })
    },

    go (item) { // 根据使用条件跳转商品列表页面
      if (item.storeId !== 'platform') {
        this.$router.push({path: '/merchant', query: {id: item.storeId}})
      } else {
        if (item.scopeType === 'PORTION_GOODS_CATEGORY') {
          this.$router.push({path: '/goodsList', query: {categoryId: item.scopeId}})
        } else {
          this.$router.push({path: '/goodsList'})
        }
      }
    },

    changePageNum (val) { // 分页改变页码
      this.params.pageNumber = val;
      this.getList()
    },

    changePageSize (val) { // 分页改变页数
      this.pageNumber = 1;
      this.params.pageSize = val;
      this.getList()
    },

    useScope (type, storeName) { // 根据字段返回 优惠券适用范围
      let shop = '平台';
      let goods = '全部商品'
      if (storeName !== 'platform') shop = storeName
      switch (type) {
        case 'ALL':
          goods = '全部商品'
          break;
        case 'PORTION_GOODS':
          goods = '部分商品'
          break;
        case 'PORTION_GOODS_CATEGORY':
          goods = '部分分类商品'
          break;
      }
      return `${shop}${goods}可用`
    }
  },
  mounted () {
    this.getList()
  }
};
</script>

<style scoped lang="scss">
@import '../../assets/styles/coupon.scss';
.pageration {
  text-align: right;
}
</style>
