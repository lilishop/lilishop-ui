<template>
  <div class="goods-detail-page">
    <TopBar></TopBar>
    <SearchHeader></SearchHeader>
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
export default {
  name: "GoodsDetail",
  beforeRouteEnter (to, from, next) {
    window.scrollTo(0, 0);
    next();
  },
};
</script>

<script setup>
import { ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { Message } from "@/utils/message";
import storage from "@/plugins/storage.js";
import TopBar from '@/components/indexDecorate/components/TopBar.vue';
import SearchHeader from '@/components/indexDecorate/components/SearchHeader.vue';
import ShowGoods from "@/components/goodsDetail/ShowGoods";
import empty from "@/components/empty/Main";
import ShowGoodsDetail from "@/components/goodsDetail/ShowGoodsDetail";
import { goodsSkuDetail } from "@/api/goods";
import { getGoodsDistribution } from "@/api/member";

const route = useRoute();
const router = useRouter();

const goodsMsg = ref({}); // 商品信息
const isLoading = ref(false); // 加载状态
const categoryBar = ref([]); // 分类
const takeDownSale = ref(false); // 是否下架

// 跳转首页或商品页面
function target(url){
  router.push({path: url})

}

// 点击规格
function targetClickSku (val) {
  getGoodsDetail(val);
}

// 获取商品详情
function getGoodsDetail (val) {
  isLoading.value = true;
  const params = val || route.query;

  // 分销员id
  let distributionId =
    params && params.distributionId
      ? params.distributionId
      : storage.getItem("distributionId");
  // 如果有分销信息
  if (distributionId) {
    // 先存储
    storage.setItem("distributionId", params.distributionId);
    // 绑定关系
    getGoodsDistribution(params.distributionId).then((res) => {
      // 绑定成功，则清除关系
      if (res.success) {
        storage.removeItem("distributionId");
      }
    });
  }

  goodsSkuDetail(params)
    .then((res) => {
      isLoading.value = false;
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
        categoryBar.value = cateArr;
        goodsMsg.value = res.result;
        if (!goodsMsg.value.data.intro) {
          goodsMsg.value.data.intro = ''
        }
      } else {
        Message.error(res.message);
        isLoading.value = false
      }
    })
    .catch((e) => {
      isLoading.value = false
      if(e.code === 11001){
        takeDownSale.value = true
      }
    });
}

function goGoodsList (currIndex) {
  // 跳转商品列表
  const arr = [];
  categoryBar.value.forEach((e, index) => {
    if (index <= currIndex) {
      arr.push(e.id);
    }
  });
  return {
    path: "/goodsList",
    query: { categoryId: arr.toString() },
  };
}

// 初始化（原 created 钩子逻辑）
getGoodsDetail();
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
