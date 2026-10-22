<template>
  <div class="wrapper">
    <BaseHeader></BaseHeader>
    <Search @search="handleSearch"></Search>

    <div class="container">
      <!-- 商品筛选栏 -->
      <GoodsClassNav @getParams="getParams"></GoodsClassNav>

      <!-- 商品展示容器 -->
      <div class="goods-box">
        <!-- 商品列表 -->
        <div class="goods-list-box">
          <!-- 排序 -->
          <div class="goods-list-tool">
            <ul>
              <li
                v-for="(item, index) in goodsTool"
                :key="index"
                @click="orderBy(item.en, index)"
              >
                <span :class="{ 'goods-list-tool-active': index === sortIndex }">
                  {{ item.title }}
                  <el-icon v-if="index === sortIndex" class="sort-arrow"><ArrowDown /></el-icon>
                </span>
              </li>
              <li @click="orderBy('price', priceSortIndex)" class="price-sort">
                <span :class="{ 'goods-list-tool-active': priceSortIndex === sortIndex }">
                  价格
                  <span class="price-arrows">
                    <el-icon :class="{ 'is-on': priceSortIndex === sortIndex && sortPriceIndex === 'asc' }"><ArrowUp /></el-icon>
                    <el-icon :class="{ 'is-on': priceSortIndex === sortIndex && sortPriceIndex === 'desc' }"><ArrowDown /></el-icon>
                  </span>
                </span>
              </li>
            </ul>
          </div>
          <!-- 列表 -->
          <div v-if="searched && !loading && goodsList.length === 0" class="list-empty">
            <empty :_Title="emptyTitle" />
            <div v-if="recommendList.length" class="recommend-title">为你推荐</div>
          </div>
          <div class="goods-list" v-if="displayGoods.length">
            <div
              class="goods-show-info"
              v-for="(item, index) in displayGoods"
              :key="item.id || index"
              @click="goGoodsDetail(item.id, item.goodsId)"
            >
              <div class="goods-show-img">
                <GoodsThumb :src="item.thumbnail" :alt="item.goodsName" />
              </div>
              <div class="goods-show-price">
                <span>
                  <span class="seckill-price text-danger">{{ $filters.unitPrice(item.price, "￥") }}</span>
                </span>
              </div>
              <div class="goods-show-detail">
                <span>{{ item.goodsName }}</span>
              </div>
              <div class="goods-show-num">
                <span>{{ formatGrade(item.grade) }}%好评</span>
                <span class="goods-show-sales">销量 {{ item.buyCount || 0 }}</span>
              </div>
              <div class="goods-show-seller">
                <span
                  class="text-bottom hover-pointer"
                  @click.stop="goShopPage(item.storeId)"
                >{{ item.storeName }}</span>
              </div>

              <div class="goods-show-right">
                <el-tag
                  class="goods-show-tag goods-show-tag-self"
                  v-if="item.selfOperated"
                >
                  自营
                </el-tag>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="goods-page" v-if="total > 0">
        <el-pagination
          v-model:current-page="params.pageNumber"
          v-model:page-size="params.pageSize"
          @current-change="changePageNum"
          @size-change="changePageSize"
          :total="total"
          layout="total, prev, pager, next, sizes"
        ></el-pagination>
      </div>
    </div>
    <el-skeleton size="large" fix v-if="loading"></el-skeleton>
    <BaseFooter></BaseFooter>
  </div>
</template>

<script>
export default {
  name: "GoodsList",
  beforeRouteEnter(to, from, next) {
    window.scrollTo(0, 0);
    next();
  },
};
</script>

<script setup>
import { computed, reactive, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { Message } from "@/utils/message";
import { ArrowDown, ArrowUp } from '@element-plus/icons-vue';
import GoodsClassNav from "@/components/nav/GoodsClassNav";
import GoodsThumb from "@/components/goods/GoodsThumb.vue";
import * as apiGoods from "@/api/goods";

const route = useRoute();
const router = useRouter();

const sortIndex = ref(0); // 排序状态
const priceSortIndex = ref(4);
const sortPriceIndex = ref(false); // 判断价格升序还是降序
const searched = ref(false);
const recommendList = ref([]);
// 排序类型
const goodsTool = [
  { title: "综合", en: "" },
  { title: "销量", en: "buyCount" },
  { title: "评论数", en: "commentNum" },
  { title: "新品", en: "releaseTime" },
];
const goodsList = ref([]); // 商品列表
const loading = ref(false); // 加载状态
const total = ref(0); // 列表总数
// 请求参数
const params = reactive({
  pageNumber: 1,
  pageSize: 20,
  categoryId: "",
});

const displayGoods = computed(() => {
  if (goodsList.value.length) return goodsList.value;
  return searched.value && !loading.value ? recommendList.value : [];
});

const emptyTitle = computed(() => {
  const keyword = params.keyword;
  return keyword ? `没有找到与“${keyword}”相关的商品` : "暂无商品";
});

watch(
  () => route.query,
  (query) => {
    const { keyword, categoryId, promotionType, promotionsId } = query;
    if (categoryId) {
      const cateId = categoryId.split(",");
      Object.assign(params, query);
      params.categoryId = cateId[cateId.length - 1];
    }
    if (promotionType) {
      params.promotionType = promotionType;
    }
    if (promotionsId) {
      params.promotionsId = promotionsId;
    }
    if (keyword) {
      // handleSearch 内部会调 getGoodsList，此处不再重复请求
      handleSearch(keyword);
    } else {
      params.keyword = "";
      getGoodsList();
    }
  }
);

// 搜索
function handleSearch(key) {
  params.keyword = key;
  route.query.keyword = key;
  params.pageNumber = 1;
  getGoodsList();
}

// 排序
function orderBy(data, index) {
  sortIndex.value = index;
  params.sort = data;
  params.order = "desc";
  if (data === "price") {
    if (!sortPriceIndex.value) {
      sortPriceIndex.value = "asc";
    } else {
      sortPriceIndex.value === "desc"
        ? (sortPriceIndex.value = "asc")
        : (sortPriceIndex.value = "desc");
    }
    params.order = sortPriceIndex.value;
  } else {
    sortPriceIndex.value = false;
  }
  getGoodsList();
}

function formatGrade(grade) {
  if (grade === null || grade === undefined || grade === "") {
    return 100;
  }
  const num = Number(grade);
  if (Number.isNaN(num)) {
    return 100;
  }
  const fixed = Number(num.toFixed(1));
  return fixed % 1 === 0 ? fixed.toFixed(0) : String(fixed);
}

function goGoodsDetail(skuId, goodsId) {
  const location = {
    path: "/goodsDetail",
    query: { skuId, goodsId },
  };
  window.open(router.resolve(location).href, "_blank");
}

function goShopPage(id) {
  if (!id) {
    Message.warning("店铺信息不存在");
    return;
  }
  router.push({
    path: "/merchant",
    query: { id },
  });
}

// 分页 修改页码
function changePageNum(val) {
  params.pageNumber = val;
  getGoodsList();
}

// 分页 修改页数
function changePageSize(val) {
  params.pageNumber = 1;
  params.pageSize = val;
  getGoodsList();
}

// 获取商品列表
function getGoodsList() {
  loading.value = true;
  apiGoods
    .goodsList(params)
    .then((res) => {
      loading.value = false;
      if (res.success) {
        goodsList.value = res.result.records || [];
        total.value = res.result.total;
        if (!goodsList.value.length) loadRecommend();
      }
    })
    .catch(() => {
      goodsList.value = [];
    })
    .finally(() => {
      loading.value = false;
      searched.value = true;
    });
}

function loadRecommend() {
  if (recommendList.value.length) return;
  apiGoods
    .goodsList({ pageNumber: 1, pageSize: 10, sort: "buyCount", order: "desc" })
    .then((res) => {
      if (res.success) recommendList.value = res.result.records || [];
    })
    .catch(() => {
      // 推荐列表为可选数据，加载失败不阻塞搜索页
    });
}

// 筛选条件回显
function getParams(val) {
  Object.assign(params, val);
  getGoodsList();
}

// 初始化（原 created 钩子逻辑）
if (route.query.categoryId) {
  const cateId = route.query.categoryId.split(",");
  Object.assign(params, route.query);
  params.categoryId = cateId[cateId.length - 1];
} else {
  Object.assign(params, route.query);
}
getGoodsList();
</script>

<style scoped lang="scss">
@import "../assets/styles/goodsList.scss";
.cate-nav{
  margin-top: 10px;
}
.goods-show-info > .goods-show-seller > .goods-show-buyer {
  width: 35px;
  height: 17px;
  white-space: nowrap;
  line-height: 17px;
  text-align: center;
  align-content: center;
  padding: 0 3px;
  background-color: #e23a3a;
}

.goods-show-tag {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 18px;
  min-width: 32px;
  width: auto;
  line-height: 1;
  white-space: nowrap;
  padding: 0 4px;
  box-sizing: border-box;

  :deep(.el-tag__content) {
    line-height: 1;
  }
}

.goods-show-tag-self {
  --el-tag-bg-color: #fa2c19;
  --el-tag-border-color: #fa2c19;
  --el-tag-text-color: #fff;
  background-color: #fa2c19;
  border-color: #fa2c19;
  color: #fff;

  :deep(.el-tag__content) {
    color: #fff;
  }
}

}

.goods-show-seller {
  // padding:3px 0;
  vertical-align: middle;
}
.container {
  margin: 20px auto 24px;
  width: 1200px;
  min-width: 1000px;
  position: relative;
}
.price-sort:hover {
  color: $theme_color;
}
.goods-box {
  display: flex;
}
/* ---------------侧边广告栏开始------------------- */

.goods-show-right {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 6px;
  margin-top: 5px;
}



/* ---------------商品栏开始------------------- */
.goods-list-box {
  position: relative;
  width: 100%;
  // margin-left: 15px;
  // width: calc(100% - 215px);
}
.goods-list-tool {
  width: 100%;
  height: 48px;
  border: 1px solid #eee;
  background-color: #fff;
}
.goods-list-tool ul {
  display: flex;
  align-items: center;
  height: 100%;
  padding-left: 15px;
  font-size: 14px;
  margin: 0;
  list-style: none;

  .price-sort {
    .price-arrows {
      display: inline-flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      width: 12px;
      height: 12px;
      flex-shrink: 0;
      padding: 0;
      border: none;
      margin: 0;
      background: transparent;
      line-height: 0;

      .el-icon {
        font-size: 8px;
        line-height: 1;
        height: 6px;

        :deep(svg) {
          width: 8px;
          height: 8px;
        }
      }

      .el-icon {
        color: #c8c8c8;
      }

      .el-icon.is-on {
        color: $theme_color;
      }
    }
  }
}
.goods-list-tool li {
  cursor: pointer;
}
.goods-list-tool li > span {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  height: 48px;
  padding: 0 16px;
  border: none;
  margin-left: 0;
  background-color: transparent;
  color: #666;
  line-height: 1;
  white-space: nowrap;
  box-sizing: border-box;
}
.goods-list-tool li > span:hover {
  color: $theme_color;
  position: relative;
  text-decoration: none;
  z-index: 1;
}
.goods-list-tool li > span .el-icon {
  font-size: 14px;
  line-height: 1;
}
.goods-list-tool-active {
  color: $theme_color !important;
  background-color: transparent !important;
  font-weight: 600;

  .sort-arrow {
    color: $theme_color;
  }

  .price-arrows .el-icon {
    color: #c8c8c8;
  }

  .price-arrows .el-icon.is-on {
    color: $theme_color;
  }
}

.list-empty {
  background: #fff;
  border: 1px solid #eee;
  border-top: none;
}

.recommend-title {
  padding: 4px 16px 12px;
  color: #333;
  font-size: 16px;
  font-weight: 600;
}

.goods-list {
  column-gap: 12px;
  padding: 4px 12px 16px;
  background: #fff;
  border: 1px solid #eee;
  border-top: none;
  box-sizing: border-box;
}

.goods-show-info {
  width: calc(20% - 10px);
  margin: 12px 0 0;
  padding: 12px;
  border: 1px solid #f0f0f0;
  border-radius: 4px;
}

.goods-show-info:hover {
  border-color: #f0d0cc;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
}

.seckill-price {
  font-size: 20px;
  font-weight: 600;
}

.goods-show-detail {
  height: 44px;
  margin: 8px 0 6px;
  color: #171A26;
  font-size: 15px;
  line-height: 22px;
}

.goods-show-num {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 6px;
  color: #999;
  font-size: 13px;
  font-weight: 400;
  line-height: 20px;
}

.goods-show-num span {
  color: #999;
  font-size: 13px;
  font-weight: 400;
}

.goods-show-sales {
  flex-shrink: 0;
}

.goods-show-seller {
  color: #438cde;
  font-size: 14px;

  span:hover {
    color: $theme_color;
  }
}

.goods-page {
  margin: 16px 0 8px;
}

/* ---------------商品栏结束------------------- */
</style>
