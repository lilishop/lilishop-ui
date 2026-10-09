<template>
  <div class="goods-detail-page">
    <BaseHeader></BaseHeader>
    <Search></Search>
    <div class="shop-item-path">
      <div class="shop-nav-container">
        <el-breadcrumb>
          <el-breadcrumb-item to="/">首页</el-breadcrumb-item>
          <el-breadcrumb-item v-for="(item, index) in categoryBar" :to="goGoodsList(index)" :key="index">
            {{ item.name }}
          </el-breadcrumb-item>
        </el-breadcrumb>
      </div>
    </div>

    <!-- 商品信息展示 -->
    <ShowGoods @handleClickSku="targetClickSku" v-if="goodsMsg.data" :detail="goodsMsg"></ShowGoods>
    <!-- 商品详细展示 -->
    <ShowGoodsDetail v-if="goodsMsg.data" :detail="goodsMsg"></ShowGoodsDetail>

    <empty _Title='当前商品已下架' v-if="takeDownSale">
      <div class="sale-btn">
        <el-button size="small" class="mr_10" @click="target('/')">返回首页</el-button>
        <el-button size="small" @click="target('goodsList')">返回商品列表</el-button>
      </div>
    </empty>
    <el-skeleton size="large" fix v-if="isLoading"></el-skeleton>
    <BaseFooter></BaseFooter>
  </div>
</template>

<script>
import { Message } from "@/utils/message";
import Search from "@/components/Search";

import ShowGoods from "@/components/goodsDetail/ShowGoods";
import empty from "@/components/empty/Main";
import ShowGoodsDetail from "@/components/goodsDetail/ShowGoodsDetail";
import { goodsSkuDetail } from "@/api/goods";
import { getGoodsDistribution } from "@/api/member";
export default {
  name: "GoodsDetail",
  beforeRouteEnter (to, from, next) {
    window.scrollTo(0, 0);
    next();
  },
  created () {
    this.getGoodsDetail();
  },
  data () {
    return {
      goodsMsg: {}, // 商品信息
      isLoading: false, // 加载状态
      categoryBar: [], // 分类
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
            this["goodsMsg"] = res.result;
            if (!this.goodsMsg.data.intro) {
              this.goodsMsg.data.intro = ''
            }
          } else {
            Message.error(res.message);
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
      return {
        path: "/goodsList",
        query: { categoryId: arr.toString() },
      };
    },
  },
  watch: {},
  components: { Search,
    ShowGoods,
    ShowGoodsDetail,
    empty },
};
</script>
<style scoped lang="scss">
.goods-detail-page {
  background: #f5f5f5;
}

.shop-item-path {
  height: 44px;
  background: transparent;
  color: #666;
}

.shop-nav-container {
  width: 1200px;
  height: 100%;
  margin: 0 auto;
  position: relative;
  display: flex;
  align-items: center;

  :deep(.el-breadcrumb) {
    line-height: 1;
    font-size: 14px;
  }

  :deep(.el-breadcrumb__inner) {
    color: #666;
    font-weight: 400;
  }

  :deep(.el-breadcrumb__item:last-child .el-breadcrumb__inner) {
    color: #171A26;
  }
}
.sale-btn{
  margin:10px 0
}
</style>
