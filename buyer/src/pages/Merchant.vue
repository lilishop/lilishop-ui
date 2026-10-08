<template>
  <div class="merchant">
    <BaseHeader/>
    <!-- 搜索栏 -->
    <Search :storeId="storeMsg.storeId || $route.query.id" @search="search"></Search>
    <div class="store-head">
      <div class="store-head-main">
        <div class="shop-info">
          <p class="shop-name">{{ storeMsg.storeName || '店铺' }}</p>
          <p
            v-if="storeMsg.storeDesc"
            class="shop-desc ellipsis"
            v-html="storeMsg.storeDesc"
          ></p>
        </div>
        <div class="shop-actions">
          <span
            class="store-collect-btn"
            :class="{ 'is-collected': storeCollected }"
            @click="collect"
          >
            <el-icon><StarFilled /></el-icon>
            <span>{{ storeCollected ? '已收藏店铺' : '收藏店铺' }}</span>
          </span>
          <span class="store-service-btn" @click="IMService(storeMsg.storeId, null, null)">联系客服</span>
        </div>
      </div>
      <div class="store-category">
        <ul class="cate-list">
          <li
            class="cate-item"
            :class="{ active: !params.storeCatId }"
            @click="searchByCate({ id: '', labelName: '店铺推荐' })"
          >
            首页
          </li>
          <li
            v-for="(cate, index) in cateList"
            :key="index"
            class="cate-item"
            :class="{ active: isCateActive(cate) }"
            @click="searchByCate(cate)"
          >
            <el-dropdown v-if="cate.children && cate.children.length" trigger="hover">
              <div class="cate-label">
                {{ cate.labelName }}
                <el-icon><ArrowDown /></el-icon>
              </div>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item
                    v-for="sec in cate.children"
                    :key="sec.id"
                    @click.stop="searchByCate(sec)"
                  >{{ sec.labelName }}</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
            <span v-else>{{ cate.labelName }}</span>
          </li>
        </ul>
      </div>
    </div>


    <div v-if="showFloorView">
      <!-- 楼层装修部分 -->
      <model-form ref="modelForm" :data="modelForm"></model-form>
    </div>


    <div v-else class="store-goods-section">
      <div class="store-goods-hd">{{ cateName }}</div>
      <div class="goods-list">
        <empty v-if="goodsList.length === 0"/>
        <template v-else>
        <div
          v-for="(item, index) in goodsList"
          :key="index"
          class="goods-show-info"
          @click="goGoodsDetail(item.id, item.goodsId)"
        >
          <div class="goods-show-img">
            <img :src="item.thumbnail || item.small" loading="lazy" decoding="async" alt=""/>
          </div>
          <div class="goods-show-price">
            <span class="seckill-price text-danger">{{ $filters.unitPrice(item.price, "￥") }}</span>
          </div>
          <div class="goods-show-detail">
            <el-tag
              v-if="item.salesModel === 'WHOLESALE'"
              class="goods-show-tag goods-show-tag-wholesale"
            >批发</el-tag>
            <span>{{ item.goodsName }}</span>
          </div>
          <div class="goods-show-num">
            <span>{{ formatGrade(item.grade) }}%好评</span>
            <span class="goods-show-sales">销量 {{ item.buyCount || 0 }}</span>
          </div>
          <div class="goods-show-right" v-if="item.selfOperated">
            <el-tag class="goods-show-tag goods-show-tag-self">自营</el-tag>
          </div>
        </div>
        </template>
      </div>
      <div class="goods-page" v-if="total > 0">
        <el-pagination
          v-model:current-page="params.pageNumber"
          v-model:page-size="params.pageSize"
          :total="total"
          @current-change="changePageNum"
          @size-change="changePageSize"
          layout="total, prev, pager, next, sizes"
        ></el-pagination>
      </div>
    </div>

    <BaseFooter/>

  </div>
</template>

<script>

import { Message } from "@/utils/message";
import { ArrowDown, StarFilled } from '@element-plus/icons-vue';
import {getCateById, getDetailById} from "@/api/shopentry";
import {
  cancelStoreCollect,
  collectStore,
  isStoreCollection,
} from "@/api/member";
import {goodsList} from "@/api/goods";
import Search from "@/components/Search";
import ModelForm from "@/components/indexDecorate/ModelForm";
import HoverSearch from "@/components/header/hoverSearch";
import storage from "@/plugins/storage";
import {getFloorStoreData} from "@/api/index.js";
import { seckillByDay } from "@/api/promotion";
import imTalk from '@/components/mixes/talkIm'

export default {
  name: "Merchant",
  components: { Search, ModelForm, HoverSearch, StarFilled, ArrowDown },
  mixins: [imTalk],
  data() {
    return {
      // 店铺装修的内容
      modelForm: {list: []}, // 楼层装修数据
      topAdvert: {}, // 顶部广告
      showNav: false, // 是否展示分类栏
      topSearchShow: false, // 滚动后顶部搜索栏展示
      carouselLarge: false, // 不同轮播分类尺寸
      carouselOpacity: false, // 不同轮播分类样式,
      enablePageData: false, //是否显示楼层装修内容
      basePageData: false, //基础店铺信息
      showFloorView: false, // 是否展示楼层装修（有有效装修数据时为 true）
      storeMsg: {}, // 店铺信息
      cateList: [], // 店铺分裂
      goodsList: [], // 商品列表
      total: 0, // 商品数量
      params: {
        // 请求参数
        pageNumber: 1,
        pageSize: 20,
        keyword: "",
        storeId: this.$route.query.id,
        storeCatId: "",
      },
      cateName: "店铺推荐", // 分类名称
      storeCollected: false, // 是否收藏
    };
  },
  created() {
    this.getStoreMsg();
    window.onscroll = () => {
      const top =
        document.documentElement.scrollTop || document.body.scrollTop;
      this.topSearchShow = top > 300;
    };
  },
  methods: {
    isFloorEnabled() {
      const pageShow = this.storeMsg && this.storeMsg.pageShow;
      return pageShow === "1" || pageShow === 1 || pageShow === "OPEN" || pageShow === true;
    },
    loadStoreGoodsView() {
      this.showFloorView = false;
      this.getGoodsList();
      this.getCateList();
    },
    getIndexData() {
      getFloorStoreData({
        clientType: "PC",
        num: this.$route.query.id,
        pageType: "STORE",
      })
        .then(async (res) => {
          if (res.success && res.result?.pageData) {
            try {
              await this.parsePageData(res.result.pageData);
              this.showFloorView = true;
            } catch {
              this.loadStoreGoodsView();
            }
          } else {
            this.loadStoreGoodsView();
          }
        })
        .catch(() => {
          this.loadStoreGoodsView();
        });
    },
    async parsePageData(pageData) {
      const dataJson = JSON.parse(pageData);
      for (let i = 0; i < dataJson.list.length; i++) {
        const type = dataJson.list[i].type;
        if (type === "carousel2") {
          this.carouselLarge = true;
        } else if (type === "carousel1") {
          this.carouselLarge = true;
          this.carouselOpacity = true;
        } else if (type === "seckill") {
          dataJson.list[i].options.list = await this.getListByDay();
        }
      }
      this.modelForm = dataJson;
      storage.setItem("navList", dataJson.list[1]);
      this.showNav = true;
      this.topAdvert = dataJson.list[0];
    },
    async getListByDay() {
      const res = await seckillByDay();
      if (res.success && res.result?.length) {
        return res.result;
      }
      return [];
    },


    checkStoreCollectionStatus() {
      const storeId = this.storeMsg && this.storeMsg.storeId;
      if (!storeId || !this.Cookies.getItem("userInfo")) {
        return;
      }
      isStoreCollection("STORE", storeId)
        .then((res) => {
          if (res.success && res.result) {
            this.storeCollected = true;
          }
        })
        .catch(() => {});
    },
    getStoreMsg() {
      const storeId = this.$route.query.id;
      if (!storeId) {
        Message.warning("店铺不存在");
        return;
      }
      getDetailById(storeId)
        .then((res) => {
          if (res.success && res.result) {
            this.storeMsg = res.result;
            document.title = this.storeMsg.storeName || "店铺";
            this.checkStoreCollectionStatus();
            if (this.isFloorEnabled()) {
              this.getIndexData();
            } else {
              this.loadStoreGoodsView();
            }
          } else {
            this.storeMsg = { storeId };
            this.loadStoreGoodsView();
          }
        })
        .catch(() => {
          this.storeMsg = { storeId };
          this.loadStoreGoodsView();
        });
    },
    getCateList() {
      // 店铺分类
      getCateById(this.$route.query.id).then((res) => {
        if (res.success) {
          this.cateList = res.result;
          console.log(this.cateList,'cateList')
        }
      });
    },
    getGoodsList() {
      // 商品信息
      goodsList(this.params)
        .then((res) => {
          if (res.success) {
            this.goodsList = res.result.records;
            this.total = res.result.total;
          }
        })
        .catch(() => {
        });
    },
    goGoodsDetail(skuId, goodsId) {
      // 跳转商品详情
      let routeUrl = this.$router.resolve({
        path: "/goodsDetail",
        query: {skuId, goodsId},
      });
      window.open(routeUrl.href, "_blank");
    },
    search(val) {
      // 搜索本店商品
      console.log(val);
      this.params.keyword = val;
      this.getGoodsList();
    },
    searchByCate(cate) {
      // 搜索同分类下商品
      this.params.storeCatId = cate.id;
      this.params.pageNumber = 1;
      this.cateName = cate.labelName;
      this.getGoodsList();
    },
    isCateActive(cate) {
      if (!cate || !this.params.storeCatId) return false;
      if (this.params.storeCatId === cate.id) return true;
      return Array.isArray(cate.children) && cate.children.some((sec) => sec.id === this.params.storeCatId);
    },
    formatGrade(grade) {
      if (grade === null || grade === undefined || grade === "") return 100;
      const num = Number(grade);
      if (Number.isNaN(num)) return 100;
      const fixed = Number(num.toFixed(1));
      return fixed % 1 === 0 ? fixed.toFixed(0) : String(fixed);
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
    async collect() {
      // 收藏店铺
      const storeId = this.storeMsg && this.storeMsg.storeId;
      if (!storeId) {
        return;
      }
      if (!this.Cookies.getItem("userInfo")) {
        Message.warning("请先登录");
        this.$router.push("/login");
        return;
      }
      try {
        if (this.storeCollected) {
          const cancel = await cancelStoreCollect("STORE", storeId);
          if (cancel.success) {
            Message.success("已取消收藏");
            this.storeCollected = false;
          }
        } else {
          const collect = await collectStore("STORE", storeId);
          if (collect.success || collect.code === 200) {
            this.storeCollected = true;
            Message.success(
              "收藏店铺成功,可以前往个人中心我的收藏查看"
            );
          }
        }
      } catch (err) {
        const msg = err?.message || err?.data?.message || "";
        if (msg.includes("重复收藏")) {
          this.storeCollected = true;
        }
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.merchant {
  min-height: 100%;
  background: #f5f5f5;
}

.store-head {
  width: 1200px;
  margin: 0 auto;
  background: #fff;
  border-radius: 4px;
}

.store-head-main {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  padding: 20px 24px 16px;
}

.shop-info {
  min-width: 0;
}

.shop-name {
  margin: 0;
  color: #171A26;
  font-size: 20px;
  font-weight: 600;
  line-height: 28px;
}

.shop-desc {
  margin: 6px 0 0;
  max-width: 760px;
  color: #999;
  font-size: 13px;
  line-height: 20px;
}

.shop-actions {
  display: flex;
  align-items: center;
  flex-shrink: 0;
  gap: 20px;
  color: #171A26;
  font-size: 14px;
}

.store-collect-btn,
.store-service-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;

  &:hover {
    color: $theme_color;
  }
}

.store-collect-btn {
  .el-icon {
    color: #999;
    font-size: 16px;
  }

  &.is-collected,
  &.is-collected .el-icon {
    color: $theme_color;
  }
}

.store-category {
  border-top: 1px solid #f0f0f0;
}

.cate-list {
  display: flex;
  align-items: stretch;
  width: 100%;
  height: 48px;
  margin: 0;
  padding: 0 8px;
  list-style: none;
  box-sizing: border-box;
}

.cate-item {
  position: relative;
  height: 48px;
  padding: 0 18px;
  color: #666;
  font-size: 15px;
  line-height: 48px;
  cursor: pointer;

  &:hover {
    color: #171A26;
  }

  &.active {
    color: #171A26;
    font-weight: 600;

    &::after {
      content: "";
      position: absolute;
      left: 18px;
      right: 18px;
      bottom: 0;
      height: 2px;
      border-radius: 1px;
      background: $theme_color;
    }
  }

  :deep(.el-dropdown) {
    color: inherit;
    font-size: inherit;
    line-height: inherit;
    vertical-align: top;
    outline: none;
  }

  :deep(.el-tooltip__trigger) {
    outline: none;
  }
}

.cate-label {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  color: inherit;
  line-height: 48px;

  .el-icon {
    font-size: 12px;
  }
}

.store-goods-section {
  width: 1200px;
  margin: 16px auto 24px;
  background: #fff;
  border-radius: 4px;
  box-sizing: border-box;
  overflow: hidden;
}

.store-goods-hd {
  padding: 16px 24px 0;
  color: #171A26;
  font-size: 16px;
  font-weight: 600;
  line-height: 24px;
}

.goods-list {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 12px;
  width: 100%;
  margin: 0;
  padding: 12px 16px 4px;
  box-sizing: border-box;
}

.goods-show-info {
  width: auto;
  min-width: 0;
  margin: 0;
  padding: 12px;
  border: 1px solid #f0f0f0;
  border-radius: 4px;
  background: #fff;
  box-sizing: border-box;
  cursor: pointer;

  &:hover {
    border-color: #f0d0cc;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
  }
}

.goods-show-img img {
  display: block;
  width: 100%;
  aspect-ratio: 1;
  object-fit: cover;
}

.goods-show-price {
  margin-top: 8px;
}

.seckill-price {
  color: $theme_color;
  font-size: 20px;
  font-weight: 600;
  line-height: 28px;
}

.goods-show-detail {
  height: 44px;
  margin: 6px 0;
  overflow: hidden;
  color: #171A26;
  font-size: 14px;
  line-height: 22px;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
}

.goods-show-num {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin: 0;
  color: #999;
  font-size: 13px;
  font-weight: 400;
  line-height: 20px;

  span {
    color: #999;
    font-size: 13px;
    font-weight: 400;
  }
}

.goods-show-sales {
  flex-shrink: 0;
}

.goods-show-right {
  display: flex;
  margin-top: 6px;
}

.goods-show-tag {
  display: inline-flex;
  align-items: center;
  height: 18px;
  margin-right: 4px;
  padding: 0 4px;
  line-height: 1;
  vertical-align: 1px;
}

.goods-show-tag-self {
  --el-tag-bg-color: #fa2c19;
  --el-tag-border-color: #fa2c19;
  --el-tag-text-color: #fff;
  background-color: #fa2c19;
  border-color: #fa2c19;
  color: #fff;
}

.goods-show-tag-wholesale {
  --el-tag-bg-color: #f9f0ff;
  --el-tag-border-color: #d3adf7;
  --el-tag-text-color: #9254de;
  background-color: #f9f0ff;
  border-color: #d3adf7;
  color: #9254de;
}

.goods-page {
  display: flex;
  justify-content: flex-end;
  width: 100%;
  margin: 0;
  padding: 16px;
  box-sizing: border-box;
}
</style>
