<template>
  <div style="background: #fff">
    <BaseHeader></BaseHeader>
    <Search></Search>
    <div class="shop-item-path">
      <div class="shop-nav-container">
        <el-breadcrumb>
          <el-breadcrumb-item to="/">首页</el-breadcrumb-item>
          <el-breadcrumb-item v-for="(item, index) in categoryBar" :to="goGoodsList(index)" target="_blank" :key="index">
            {{ item.name }}
          </el-breadcrumb-item>
        </el-breadcrumb>
        <div class="store-collect" v-if="!takeDownSale && goodsMsg.data">
          <span class="mr_10" v-if="goodsMsg.data">
            <router-link
              class="store-name-link"
              :to="{ path: '/merchant', query: { id: goodsMsg.data.storeId } }"
            >{{ goodsMsg.data.storeName }}</router-link>
          </span>
          <span
            class="store-collect-btn"
            :class="{ 'is-collected': storeCollected }"
            @click="collect"
          >
            <el-icon class="store-collect-icon"><StarFilled /></el-icon>
            {{ storeCollected? "已收藏店铺": "收藏店铺" }}
          </span>
          <span class="ml_10 contact-service-btn" @click="IMService(goodsMsg.data.storeId,goodsMsg.data.goodsId,goodsMsg.data.id)">联系客服</span>
        </div>
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
import { StarFilled } from '@element-plus/icons-vue';
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
            this["goodsMsg"] = res.result;
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
      return location.origin + "/goodsList?categoryId=" + arr.toString();
    },
    async collect () {
      // 收藏店铺
      const storeId = this.goodsMsg.data && this.goodsMsg.data.storeId;
      if (!storeId) {
        return;
      }
      if (!this.Cookies.getItem("userInfo")) {
        Message.warning("请先登录");
        this.$router.push("/login");
        return;
      }
      if (this.storeCollected) {
        let cancel = await cancelStoreCollect("STORE", storeId);
        if (cancel.success) {
          Message.success("已取消收藏");
          this.storeCollected = false;
        }
      } else {
        let collect = await collectStore("STORE", storeId);
        if (collect.code === 200) {
          this.storeCollected = true;
          Message.success("收藏店铺成功,可以前往个人中心我的收藏查看");
        }
      }
    },
  },
  watch: {},
  components: { Search,
    ShowGoods,
    ShowGoodsDetail,
    empty, StarFilled },
};
</script>
<style scoped lang="scss">
.shop-item-path {
  height: 38px;
  @include background_color($light_background_color);
  color: #2c2c2c;
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
  }

  .store-collect {
    position: absolute;
    right: 20px;
    top: 50%;
    transform: translateY(-50%);
    color: #999;

    span:not(.store-collect-btn):not(.contact-service-btn) {
      &:hover {
        cursor: pointer;
        color: $theme_color;
      }
    }

    .store-collect-btn,
    .contact-service-btn {
      cursor: pointer;
    }

    .store-collect-btn {
      .store-collect-icon {
        color: #666;
        vertical-align: middle;
      }

      &.is-collected .store-collect-icon {
        color: $theme_color;
      }
    }

    .store-name-link {
      color: $theme_color;
      text-decoration: none;

      &:hover {
        color: $theme_color;
        text-decoration: none;
      }
    }
  }
}
.sale-btn{
  margin:10px 0

}
</style>
