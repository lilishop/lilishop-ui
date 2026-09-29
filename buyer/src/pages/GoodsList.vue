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
                  <el-icon><ArrowDown /></el-icon>
                </span>
              </li>
              <li @click="orderBy('price', 5, 'up')" class="price-sort">
                <span :class="{ 'goods-list-tool-active': 5 === sortIndex }">
                  价格
                  <span class="price-arrows">
                    <el-icon :class="{ 'price-color': sortPriceIndex == 'desc' }"><ArrowUp /></el-icon>
                    <el-icon :class="{ 'price-color': sortPriceIndex == 'asc' }"><ArrowDown /></el-icon>
                  </span>
                </span>
              </li>
            </ul>
          </div>
          <!-- 列表 -->
          <div class="goods-list">
            <empty v-if="goodsList.length === 0" />
            <div
              v-else
              class="goods-show-info"
              v-for="(item, index) in goodsList"
              :key="index"
              @click="goGoodsDetail(item.id, item.goodsId)"
            >
              <div class="goods-show-img">
                <img :src="item.thumbnail" />
              </div>
              <div class="goods-show-price">
                <span>
                  <span class="seckill-price text-danger">{{ $filters.unitPrice(item.price, "￥") }}</span>
                </span>
              </div>
              <div class="goods-show-detail">
                <el-tag
                  v-if="item.salesModel === 'WHOLESALE'"
                  class="goods-show-tag goods-show-tag-wholesale"
                >
                  批发
                </el-tag>
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
      <div class="goods-page">
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
import { Message } from "@/utils/message";
import { ArrowDown, ArrowUp } from '@element-plus/icons-vue';
import GoodsClassNav from "@/components/nav/GoodsClassNav";
import * as apiGoods from "@/api/goods";
export default {
  name: "GoodsList",
  beforeRouteEnter(to, from, next) {
    window.scrollTo(0, 0);
    next();
  },
  data() {
    return {
      sortIndex: 0, // 排序状态
      sortPriceIndex: false, // 判断价格升序还是降序
      goodsTool: [
        // 排序类型
        { title: "综合", en: "" },
        { title: "销量", en: "buyCount" },
        { title: "评论数", en: "commentNum" },
        { title: "新品", en: "releaseTime" },
      ],
      goodsList: [], // 商品列表
      loading: false, // 加载状态
      total: 0, // 列表总数
      params: {
        // 请求参数
        pageNumber: 1,
        pageSize: 20,
        categoryId: "",
      },
    };
  },
  watch: {
    $route() {
      const keyword = this.$route.query.keyword;
      if (keyword) {
        this.handleSearch(keyword);
      }
      if (this.$route.query.categoryId) {
        let cateId = this.$route.query.categoryId.split(",");
        Object.assign(this.params, this.$route.query);
        this.params.categoryId = cateId[cateId.length - 1];
      }
      if (this.$route.query.promotionType) {
        this.params.promotionType = this.$route.query.promotionType;
      }
      if (this.$route.query.promotionsId) {
        this.params.promotionsId = this.$route.query.promotionsId;
      }
      this.getGoodsList();
    },
  },
  methods: {
    // 搜索
    handleSearch(key) {
      this.params.keyword = key;
      this.$route.query.keyword = key
      this.params.pageNumber = 1;
      this.getGoodsList();
    },
    orderBy(data, index) {
      // 排序
      this.sortIndex = index;
      this.params.sort = data;
      this.params.order = "desc";
      if (data === "price") {
        if (!this.sortPriceIndex) {
          this.sortPriceIndex = "asc";
        } else {
          this.sortPriceIndex === "desc"
            ? (this.sortPriceIndex = "asc")
            : (this.sortPriceIndex = "desc");
        }
        this.params.order = this.sortPriceIndex;
      } else {
        this.sortPriceIndex = false;
      }
      this.getGoodsList();
    },
    formatGrade(grade) {
      if (grade === null || grade === undefined || grade === "") {
        return 100;
      }
      const num = Number(grade);
      if (Number.isNaN(num)) {
        return 100;
      }
      const fixed = Number(num.toFixed(1));
      return fixed % 1 === 0 ? fixed.toFixed(0) : String(fixed);
    },
    goGoodsDetail(skuId, goodsId) {
      const location = {
        path: "/goodsDetail",
        query: { skuId, goodsId },
      };
      window.open(this.$router.resolve(location).href, "_blank");
    },
    goShopPage(id) {
      if (!id) {
        Message.warning("店铺信息不存在");
        return;
      }
      const routeUrl = this.$router.resolve({
        path: "/merchant",
        query: { id },
      });
      window.open(routeUrl.href, "_blank");
    },
    // 分页 修改页码
    changePageNum(val) {
      this.params.pageNumber = val;
      this.getGoodsList();
    },
    // 分页 修改页数
    changePageSize(val) {
      this.params.pageNumber = 1;
      this.params.pageSize = val;
      this.getGoodsList();
    },

    // 获取商品列表
    getGoodsList() {
      this.loading = true;
      apiGoods
        .goodsList(this.params)
        .then((res) => {
          this.loading = false;
          if (res.success) {
            this.goodsList = res.result.records;
            this.total = res.result.total;
          }
        })
        .catch(() => {
          this.loading = false;
        });
    },
    getParams(val) {
      // 筛选条件回显
      Object.assign(this.params, val);
      this.getGoodsList();
    },
  },
  created() {
    if (this.$route.query.categoryId) {
      let cateId = this.$route.query.categoryId.split(",");
      Object.assign(this.params, this.$route.query);
      this.params.categoryId = cateId[cateId.length - 1];
    } else {
      Object.assign(this.params, this.$route.query);
    }
    this.getGoodsList();
  },
  components: {
    GoodsClassNav,
    ArrowDown,
    ArrowUp,
  },
};
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

.goods-show-tag-wholesale {
  margin-right: 5px;
  background-color: #f9f0ff;
  border-color: #d3adf7;
  color: #9254de;

  :deep(.el-tag__content) {
    color: #9254de;
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

      .price-color {
        color: #b3b3b3;
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

  .price-color {
    color: $theme_color !important;
  }
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
