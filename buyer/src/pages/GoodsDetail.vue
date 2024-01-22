<template>
  <div style="background: #fff">
    <BaseHeader></BaseHeader>
    <Search></Search>
    <div class="shop-item-path">
      <div class="shop-nav-container">
        <Breadcrumb>
          <BreadcrumbItem to="/">首页</BreadcrumbItem>
          <BreadcrumbItem v-for="(item, index) in categoryBar" :to="goGoodsList(index)" target="_blank" :key="index">
            {{ item.name }}
          </BreadcrumbItem>
        </Breadcrumb>
        <div class="store-collect" v-if="!takeDownSale">
          <span class="mr_10" v-if="goodsMsg.data">
            <router-link :to="'Merchant?id=' + goodsMsg.data.storeId">{{
              goodsMsg.data.storeName
            }}</router-link>
          </span>
          <span @click="collect">
            <Icon type="ios-heart" :color="storeCollected ? '#ed3f14' : '#666'" />
            {{ storeCollected? "已收藏店铺": "收藏店铺" }}
          </span>
          <span class="ml_10" @click="IMService(goodsMsg.data.storeId,goodsMsg.data.goodsId,goodsMsg.data.id)">联系客服</span>
        </div>
      </div>
    </div>

    <!-- 商品信息展示 -->
    <ShowGoods @handleClickSku="targetClickSku" v-if="goodsMsg.data" :detail="goodsMsg"></ShowGoods>
    <!-- 商品详细展示 -->
    <ShowGoodsDetail v-if="goodsMsg.data" :detail="goodsMsg"></ShowGoodsDetail>

    <empty _Title='当前商品已下架' v-if="takeDownSale">
      <div class="sale-btn">
        <Button size="small" class="mr_10" @click="target('/')">返回首页</Button>
        <Button size="small" @click="target('goodsList')">返回商品列表</Button>
      </div>
    </empty>
    <Spin size="large" fix v-if="isLoading"></Spin>
    <BaseFooter></BaseFooter>
  </div>
</template>

<script>
import Search from "@/components/Search";

import ShowGoods from "@/components/goodsDetail/ShowGoods";
import empty from "@/components/empty/Main";
import ShowGoodsDetail from "@/components/goodsDetail/ShowGoodsDetail";
import { goodsSkuDetail } from "@/api/goods";
import {
  cancelStoreCollect,
  collectStore,
  isStoreCollection,
  getGoodsDistribution,
} from "@/api/member";
import { getDetailById } from "@/api/shopentry";
import imTalk from '@/components/mixes/talkIm'
export default {
  name: "GoodsDetail",
  beforeRouteEnter (to, from, next) {
    window.scrollTo(0, 0);
    next();
  },
  created () {
    this.getGoodsDetail();
  },
  mixins: [imTalk],
  data () {
    return {
      goodsMsg: {}, // 商品信息
      isLoading: false, // 加载状态
      categoryBar: [], // 分类
      storeCollected: false, // 商品收藏
      storeMsg: {}, // 店铺信息
      takeDownSale:false, // 是否下架

    };
  },
  methods: {
    // 跳转首页或商品页面
    target(url){
      this.$router.push({path: url})

    },
    // 点击规格
    targetClickSku (val) {
      this.getGoodsDetail(val);
    },
    // 获取商品详情
    getGoodsDetail (val) {
      this.isLoading = true;
      const params = val || this.$route.query;

      // 分销员id
      let distributionId =
        params && params.distributionId
          ? params.distributionId
          : this.Cookies.getItem("distributionId");
      // 如果有分销信息
      if (distributionId) {
        console.log(distributionId);
        // 先存储
        this.Cookies.setItem("distributionId", params.distributionId);
        let _this = this;
        // 绑定关系
        getGoodsDistribution(params.distributionId).then((res) => {
          // 绑定成功，则清除关系
          if (res.success) {
            _this.Cookies.removeItem("distributionId");
          }
        });
      }

      goodsSkuDetail(params)
        .then((res) => {
          this.isLoading = false;
          if (res.success) {

            const result = res.result;
            const cateName = res.result.categoryName;
            const cateId = result.data.categoryPath.split(",");
            const cateArr = [];
            cateId.forEach((e, index) => {
              // 插入分类id和name
              cateArr.push({
                id: e,
                name: cateName ? cateName[index] : "",
              });
            });
            this.categoryBar = cateArr;
            this.$set(this, "goodsMsg", res.result);
            if (!this.goodsMsg.data.intro) {
              this.goodsMsg.data.intro = ''
            }
            // 判断是否收藏
            if (this.Cookies.getItem("userInfo")) {
              isStoreCollection("STORE", this.goodsMsg.data.storeId).then((res) => {
                if (res.success && res.result) {
                  this.storeCollected = true;
                }
              });
            }

            if (!this.storeMsg) {
              // 获取店铺信息
              getDetailById(this.goodsMsg.data.storeId).then((res) => {
                if (res.success) {
                  this.storeMsg = res.result;

                }
              });
            }
          } else {
            this.$Message.error(res.message);
            this.isLoading = false
          }
        })
        .catch((e) => {
          this.isLoading = false
          if(e.code === 11001){
            this.takeDownSale = true
          }
        });
    },
    goGoodsList (currIndex) {
      // 跳转商品列表
      const arr = [];
      this.categoryBar.forEach((e, index) => {
        if (index <= currIndex) {
          arr.push(e.id);
        }
      });
      return location.origin + "/goodsList?categoryId=" + arr.toString();
    },
    async collect () {
      // 收藏店铺
      if (this.storeCollected) {
        let cancel = await cancelStoreCollect("STORE", this.goodsMsg.data.storeId);
        if (cancel.success) {
          this.$Message.success("已取消收藏");
          this.storeCollected = false;
        }
      } else {
        let collect = await collectStore("STORE", this.goodsMsg.data.storeId);
        if (collect.code === 200) {
          this.storeCollected = true;
          this.$Message.success("收藏店铺成功,可以前往个人中心我的收藏查看");
        }
      }
    },
  },
  watch: {},
  components: {
    Search,
    ShowGoods,
    ShowGoodsDetail,
    empty
  },
};
</script>
<style scoped lang="scss">
.shop-item-path {
  height: 38px;
  @include background_color($light_background_color);
  line-height: 38px;
  color: #2c2c2c;
}

.shop-nav-container {
  width: 1200px;
  margin: 0 auto;
  position: relative;

  .store-collect {
    position: absolute;
    right: 20px;
    top: 0;
    color: #999;

    span {
      &:hover {
        cursor: pointer;
        color: $theme_color;
      }
    }
  }
}
.sale-btn{
  margin:10px 0

}
</style>
