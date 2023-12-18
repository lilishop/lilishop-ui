<template>
  <div class="merchant">
    <BaseHeader/>
    <!-- 搜索栏 -->
    <Search  :storeId="storeMsg.storeId" @search="search"></Search>
    <!-- 店铺logo -->
    <div class="shop-logo">
      <div>
        <p>{{ storeMsg.storeName || '店铺' }}</p>
        <p :alt="storeMsg.storeDesc" class="ellipsis" v-html="storeMsg.storeDesc"></p>
      </div>
      <div>
        <span class="hover-pointer" @click="collect"><Icon :color="storeCollected ? '#ed3f14' : '#fff'"
                                                           type="ios-heart"/>{{
            storeCollected ? '已收藏店铺' : '收藏店铺'
          }}</span>
        <span class="hover-pointer ml_10" style="width:80px" @click="IMService(storeMsg.storeId,null,null)"><Icon
          custom="icomoon icon-customer-service"/>联系客服</span>
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
          <Dropdown v-if="cate.children.length">
            <div @click.self="searchByCate(cate)">
              {{ cate.labelName }}
              <Icon type="ios-arrow-down"></Icon>
            </div>
            <DropdownMenu slot="list">
              <DropdownItem
                v-for="sec in cate.children"
                :key="sec.id"
                :name="sec.id"
                @click.native="searchByCate(sec)"
              >{{ sec.labelName }}
              </DropdownItem
              >
            </DropdownMenu>
          </Dropdown>
          <span v-else @click.self="searchByCate(cate)">{{
              cate.labelName
            }}</span>
        </li>
      </ul>
    </div>


    <div v-if="storeMsg.pageShow&&storeMsg.pageShow==='1'">
      <!-- 楼层装修部分 -->
      <model-form ref="modelForm" :data="modelForm"></model-form>
    </div>


    <div v-else>
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
            <img :src="item.small" height="220" width="220" alt=""/>
          </div>
          <div class="goods-show-price">
            <span>
              <span class="seckill-price text-danger">{{
                  item.price | unitPrice("￥")
                }}</span>
            </span>
          </div>
          <div class="goods-show-detail">
            <span>{{ item.goodsName }}</span>
          </div>
          <div class="goods-show-num">
            已有<span>{{ item.commentNum || 0 }}</span
          >人评价
          </div>
        </div>
      </div>
      <div class="goods-page">
        <Page
          :page-size="params.pageSize"
          :total="total"
          show-sizer
          @on-change="changePageNum"
          @on-page-size-change="changePageSize"
        ></Page>
      </div>

    </div>

    <BaseFooter/>

  </div>
</template>

<script>

import {getCateById, getDetailById} from "@/api/shopentry";
import {cancelStoreCollect, collectStore} from "@/api/member";
import {goodsList} from "@/api/goods";
import Search from "@/components/Search";
import ModelForm from "@/components/indexDecorate/ModelForm";
import HoverSearch from "@/components/header/hoverSearch";
import storage from "@/plugins/storage";
import {getFloorStoreData} from "@/api/index.js";
import imTalk from '@/components/mixes/talkIm'

export default {
  name: "Merchant",
  components: {
    Search,
    ModelForm,
    HoverSearch,
  },
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
  },
  methods: {
    getIndexData() {
      // 获取首页装修数据
      getFloorStoreData({clientType: "PC", num: this.$route.query.id, pageType: 'STORE'}).then(
        (res) => {
          if (res.success) {
            let dataJson = JSON.parse(res.result.pageData);
            // 秒杀活动不是装修的数据，需要调用接口判断是否有秒杀商品
            // 轮播图根据不同轮播，样式不同
            for (const element of dataJson.list) {
              let type = element.type;
              if (type === "carousel2") {
                this.carouselLarge = true;
              } else if (type === "carousel1") {
                this.carouselLarge = true;
                this.carouselOpacity = true;
              }

              // else if (type === "seckill") {
              //   let seckill = this.getListByDay();
              //   dataJson.list[i].options.list = seckill;
              // }
            }
            this.modelForm = dataJson;
            storage.setItem("navList", dataJson.list[1]);
            this.showNav = true;
            this.topAdvert = dataJson.list[0];
          }
        }
      );
    },


    // getStoreMsg () { // 店铺信息
    //   getDetailById(this.$route.query.id).then(res => {
    //     if (res.success) {
    //       this.storeMsg = res.result
    //       document.title = this.storeMsg.storeName
    //       if (this.Cookies.getItem('userInfo')) {
    //         isCollection('STORE', this.storeMsg.storeId).then(res => {
    //           if (res.success && res.result) {
    //             this.storeCollected = true;
    //           }
    //         })
    //       }
    //     }
    //   })
    // },
    // async getListByDay() {
    //   // 当天秒杀活动
    //   const res = await seckillByDay();
    //   if (res.success && res.result.length) {
    //     return res.result;
    //   } else {
    //     return [];
    //   }
    // },

    getStoreMsg() {
      // 店铺信息
      getDetailById(this.$route.query.id).then((res) => {
        if (res.success) {

          this.storeMsg = res.result;
          console.log(this.storeMsg)

          //判定如果开启楼层展示，则获取页面信息 否则读取商品信息
          if (this.storeMsg.pageShow && this.storeMsg.pageShow === '1') {

            this.getIndexData();
          } else {
            this.getGoodsList();
            this.getCateList();
          }
          let that = this;
          window.onscroll = function () {
            let top =
              document.documentElement.scrollTop || document.body.scrollTop;
            if (top > 300) {
              that.topSearchShow = true;
            } else {
              that.topSearchShow = false;
            }
          };
        }
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
      if (this.storeCollected) {
        let cancel = await cancelStoreCollect("STORE", this.storeMsg.storeId);
        if (cancel.success) {
          this.$Message.success("已取消收藏");
          this.storeCollected = false;
        }
      } else {
        let collect = await collectStore("STORE", this.storeMsg.storeId);
        if (collect.code === 200) {
          this.storeCollected = true;
          this.$Message.success("收藏店铺成功,可以前往个人中心我的收藏查看");
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

  > div {
    display: flex;
    width: 1200px;
    margin: 0 auto;
    align-items: center;

    > div:nth-child(2) {
      margin-left: 10px;
      flex: 1;
    }

    > div:nth-child(3) {
      width: 200px;
    }
  }

  p:nth-child(1) {
    font-size: 20px;
  }

  p:nth-child(2) {
    font-size: 14px;
    max-height: 40px;
    max-width: 400px;
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
</style>
