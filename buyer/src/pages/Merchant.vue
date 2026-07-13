<template>
  <div class="merchant">
    <BaseHeader/>
    <!-- 搜索栏 -->
    <Search :storeId="storeMsg.storeId || $route.query.id" @search="search"></Search>
    <!-- 店铺logo -->
    <div class="shop-logo">
      <div class="shop-logo-inner">
        <div class="shop-info">
          <p class="shop-name">{{ storeMsg.storeName || '店铺' }}</p>
          <p
            v-if="storeMsg.storeDesc"
            :alt="storeMsg.storeDesc"
            class="shop-desc ellipsis"
            v-html="storeMsg.storeDesc"
          ></p>
        </div>
        <div class="shop-actions">
          <span class="hover-pointer store-collect-btn" @click="collect">
            <el-icon :color="storeCollected ? '#ffc107' : '#fff'">
              <StarFilled />
            </el-icon>
            <span>{{
              storeCollected ? '已收藏店铺' : '收藏店铺'
            }}</span>
          </span>
          <span
            class="hover-pointer store-service-btn"
            @click="IMService(storeMsg.storeId, null, null)"
          >
            <i class="icomoon icon-customer-service"></i>联系客服
          </span>
        </div>
      </div>
    </div>
    <div class="store-category">
      <ul class="cate-list">
        <li
          class="cate-item"
          @click="searchByCate({ id: '', labelName: '店铺推荐' })"
        >
          首页
        </li>
        <li v-for="(cate, index) in cateList" :key="index" class="cate-item">
          <el-dropdown v-if="cate.children.length" trigger="hover">
            <div @click.self="searchByCate(cate)">
              {{ cate.labelName }}
              <el-icon><ArrowDown /></el-icon>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item
                  v-for="sec in cate.children"
                  :key="sec.id"
                  @click="searchByCate(sec)"
                >{{ sec.labelName }}</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
          <span v-else @click.self="searchByCate(cate)">{{
              cate.labelName
            }}</span>
        </li>
      </ul>
    </div>


    <div v-if="showFloorView">
      <!-- 楼层装修部分 -->
      <model-form ref="modelForm" :data="modelForm"></model-form>
    </div>


    <div v-else class="store-goods-section">
      <div class="promotion-decorate">{{ cateName }}</div>
      <div class="goods-list">
        <empty v-if="goodsList.length === 0"/>
        <div
          v-for="(item, index) in goodsList"
          v-else
          :key="index"
          class="goods-show-info"
          @click="goGoodsDetail(item.id, item.goodsId)"
        >

          <div class="goods-show-img">
            <img :src="item.small" alt=""/>
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
            已有<span>{{ item.commentNum || 0 }}</span>人评价
          </div>
        </div>
      </div>
      <div class="goods-page">
        <el-pagination           v-model:current-page="params.pageNumber"
          v-model:page-size="params.pageSize"
          :total="total"
          @current-change="changePageNum"
          @size-change="changePageSize"
         layout="sizes, prev, pager, next"></el-pagination>
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
      this.cateName = cate.labelName;
      this.getGoodsList();
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
@import "../assets/styles/goodsList.scss";

.merchant {
  margin: 0 auto;
}

.shop-logo {
  position: relative;
  width: 100%;
  background-color: #666;
  padding: 4px;
  color: #fff;

  .shop-logo-inner {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
    width: 1200px;
    margin: 0 auto;
  }

  .shop-info {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 12px;
    min-width: 0;
  }

  .shop-name {
    margin: 0;
    font-size: 20px;
    flex-shrink: 0;
  }

  .shop-desc {
    margin: 0;
    font-size: 14px;
    max-height: 40px;
    max-width: 400px;
  }

  .shop-actions {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 16px;
    flex-shrink: 0;
  }

  .store-collect-btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }

  .store-service-btn {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    min-width: 80px;
  }
}

.store-category {
  background-color: #005aa0;
  color: #fff;

  .cate-list {
    width: 1200px;
    margin: 0 auto;
    clear: left;
    height: 30px;
    line-height: 30px;

    .cate-item {
      margin-right: 25px;
      float: left;
    }

    .cate-item:hover {
      cursor: pointer;
    }
  }
}

.promotion-decorate::before,
.promotion-decorate::after {
  background-image: url("/src/assets/images/sprite@2x.png");
}

.store-goods-section {
  width: 1200px;
  max-width: 100%;
  margin: 0 auto;
  padding: 0 10px;
  box-sizing: border-box;

  .goods-list {
    width: 100%;
    margin: 0;
    column-gap: 10px;
  }

  .goods-show-info {
    width: calc(20% - 8px);
    min-width: 0;
  }

  .seckill-price {
    font-size: 16px;
  }

  .goods-show-detail {
    height: 32px;
    line-height: 16px;
  }
}
</style>
