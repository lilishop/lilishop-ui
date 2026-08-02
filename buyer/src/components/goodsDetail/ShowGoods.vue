<template>
  <div class="wrapper">
    <div class="item-detail-show">
      <!-- 详情左侧展示数据、图片，收藏、举报 -->
      <div class="item-detail-left">
        <!-- 大图、放大镜 -->
        <!-- <div  id="dplayer"></div> -->
        <div class="item-detail-big-img" v-if="imgList[imgIndex]">
          <el-image
            :src="currentImg"
            :preview-src-list="previewList"
            fit="contain"
            style="width: 100%; height: 350px"
          />
        </div>

        <!-- <div  id="dplayer"></div> -->
        <div class="item-detail-img-row">

          <div
            class="item-detail-img-small"
            @mouseover="imgIndex = index"
            v-for="(item, index) in imgList"
            :key="index"
          >
            <img :src="item.url || item"/>
          </div>
        </div>

        <div class="goodsConfig mt_10">
          <span
            class="collect-btn"
            :class="{ 'is-collected': isCollected }"
            @click="collect"
          >
            <el-icon class="collect-icon"><StarFilled /></el-icon>
            <span class="collect-text">{{ isCollected ? '已收藏' : '收藏' }}</span>
          </span>
        </div>
      </div>
      <!-- 右侧商品信息、活动信息、操作展示 -->
      <div class="item-detail-right">
        <div class="item-detail-title">
          <div class="item-detail-title-row">
            <span class="item-detail-name">{{ skuDetail.goodsName }}</span>
            <el-tag
              v-if="isECouponGoods"
              class="goods-type-tag"
              size="small"
            >
              电子卡券
            </el-tag>
            <el-tag
              v-else-if="skuDetail.goodsType !== 'VIRTUAL_GOODS'"
              class="goods-type-tag"
              size="small"
            >
              实物商品
            </el-tag>
            <el-tag
              v-else-if="skuDetail.goodsType == 'VIRTUAL_GOODS'"
              class="goods-type-tag"
              size="small"
            >
              虚拟商品
            </el-tag>
          </div>
        </div>
        <div class="sell-point">
          {{ skuDetail.sellingPoint }}
        </div>
        <!-- 限时秒杀 -->
        <Promotion
          v-if="promotionMap['SECKILL']"
          :time="promotionMap['SECKILL'].endTime"
        ></Promotion>
        <!-- 商品详细 价格、优惠券、促销 -->
        <div class="item-detail-price-row">
          <div class="item-price-left">
            <!-- 秒杀价格 -->
            <div
              class="item-price-row"
              v-if="skuDetail.promotionPrice && promotionMap['SECKILL']"
            >
              <p>
                <span class="item-price-title" v-if="promotionMap['SECKILL']"
                  >秒 &nbsp;杀&nbsp;价</span>
                <span class="item-price">{{ $filters.unitPrice(skuDetail.promotionPrice, "￥") }}</span>
                <span class="item-price-old">{{ $filters.unitPrice(skuDetail.price, "￥") }}</span>
              </p>
            </div>
            <!-- 商品原价 -->
            <div class="item-price-row" v-else>
              <!-- 批发价格 -->
              <div v-if="!isECouponGoods && wholesaleNum && wholesaleNum.length">
                <div class="flex">
                  <div class="item-price-title">
                    价 &nbsp;&nbsp;&nbsp;&nbsp;格
                  </div>

                  <div
                    v-for="(item, index) in wholesalePrice"
                    :key="index"
                    class="item-price item-num"
                  >
                    {{ $filters.unitPrice(item, "￥") }}
                  </div>
                </div>
                <div class="flex">
                  <div class="item-price-title">起 批 量</div>
                  <div
                    v-for="(item, index) in wholesaleNum"
                    :key="index"
                    class="item-num item-price-num"
                  >
                    {{ item }}{{ skuDetail.goodsUnit }}
                  </div>
                </div>
              </div>

              <!-- 普通价格 -->
              <div v-else>
                <span class="item-price-title"
                  >价 &nbsp;&nbsp;&nbsp;&nbsp;格</span>
                <span class="item-price">{{ $filters.unitPrice(skuDetail.price, "￥") }}</span>
              </div>
            </div>
            <!-- 优惠券展示 -->
            <div class="item-price-coupon-row" v-if="promotionMap['COUPON'].length">
              <div class="Ellipsis">
                <span class="item-price-title">优 惠 券</span>
                <span>
                  <span
                    class="item-coupon"
                    v-for="(item, index) in promotionMap['COUPON'].slice(0, 6)"
                    :key="index"
                    @click="receiveCoupon(item.id)"
                  >
                    <span v-if="item.couponType == 'PRICE'"
                      >满{{ item.consumeThreshold }}减{{ item.price }}</span>
                    <span v-if="item.couponType == 'DISCOUNT'"
                      >满{{ item.consumeThreshold }}打{{
                        item.couponDiscount
                      }}折</span>
                  </span>
                </span>

                <div class="dropdown" v-if="promotionMap['COUPON'].length > 6">
                    <span>展开更多</span>
                    <div class="dropdown-content">
                      <span
                        class="item-coupon"
                        v-for="(item, index) in promotionMap['COUPON'].slice(6, promotionMap['COUPON'].length)"
                        :key="index"
                        @click="receiveCoupon(item.id)"
                      >
                        <span v-if="item.couponType == 'PRICE'"
                          >满{{ item.consumeThreshold }}减{{ item.price }}</span>
                        <span v-if="item.couponType == 'DISCOUNT'"
                          >满{{ item.consumeThreshold }}打{{
                            item.couponDiscount
                          }}折</span>
                      </span>
                    </div>
                  </div>
              </div>
            </div>
            <!-- 限时折扣 -->
            <div class="item-price-row" v-if="promotionMap['DISCOUNT']">
              <p>
                <span class="item-price-title">促&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;销</span>
                <span class="item-promotion">限时折扣</span>
                <span class="item-desc-pintuan" v-if="promotionMap['DISCOUNT'].discount">
                  享 {{ promotionMap["DISCOUNT"].discount }} 折
                </span>
              </p>
            </div>
            <!-- 第N件优惠 -->
            <div class="item-price-row" v-if="promotionMap['NTH']">
              <p>
                <span class="item-price-title">促&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;销</span>
                <span class="item-promotion">第N件</span>
                <span class="item-desc-pintuan">
                  第 {{ promotionMap["NTH"].nthNum || promotionMap["NTH"].num }} 件优惠
                </span>
              </p>
            </div>
            <!-- 拼团 -->
            <div class="item-price-row" v-if="promotionMap['PINTUAN']">
              <p>
                <span class="item-price-title">拼&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;团</span>
                <span class="item-promotion">拼团价</span>
                <span class="item-desc-pintuan" v-if="promotionMap['PINTUAN'].price">
                  {{ $filters.unitPrice(promotionMap["PINTUAN"].price, "￥") }}
                </span>
              </p>
            </div>
            <!-- 满减展示 -->
            <div class="item-price-row" v-if="promotionMap['FULL_DISCOUNT']">
              <p>
                <span class="item-price-title"
                  >促&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;销</span>
                <span class="item-promotion">满减</span>
                <span
                  class="item-desc-pintuan"
                  v-if="promotionMap['FULL_DISCOUNT'].fullMinus"
                  >满{{ promotionMap["FULL_DISCOUNT"].fullMoney }}元，立减现金{{
                    promotionMap["FULL_DISCOUNT"].fullMinus
                  }}元</span>
                <span
                  class="item-desc-pintuan"
                  v-if="
                    promotionMap['FULL_DISCOUNT'].fullRate &&
                    promotionMap['FULL_DISCOUNT'].fullRateFlag
                  "
                  >满{{ promotionMap["FULL_DISCOUNT"].fullMoney }}元，立享{{
                    promotionMap["FULL_DISCOUNT"].fullRate
                  }}折</span>
              </p>
            </div>
          </div>
          <div class="item-price-right">
            <div class="item-remarks-sum">
              <p>累计评价</p>
              <p>
                <span class="item-remarks-num"
                  >{{ skuDetail.commentNum || 0 }} 条</span>
              </p>
            </div>
          </div>
        </div>
        <!-- 选择颜色 -->
        <div
          class="item-select"
          v-for="(sku, index) in formatList"
          :key="sku.name"
        >
          <div class="item-select-title">
            <p>{{ sku.name }}</p>
          </div>
          <div class="item-select-column">
            <div
              class="item-select-row"
              v-for="item in sku.values"
              :key="item.value"
            >
              <div
                class="item-select-box"
                @click="select(index, item.value)"
                :class="{
                  'item-select-box-active':
                    item.value === currentSelceted[index],
                }"
              >
                <div class="item-select-intro">
                  <p>{{ item.value }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <br />
        <div class="add-buy-car-box">
          <div class="item-select">
            <div class="item-select-title">
              <p>数量</p>
            </div>
            <div class="item-select-column">
              <div class="item-select-row">
                <el-input-number
                  :min="1"
                  :max="quantityMax"
                  :disabled="isOutOfStock"
                  v-model="count"
                  :precision="0"
                  @blur="changeCount"
                ></el-input-number>
                <span class="inventory">&nbsp;&nbsp;库存{{ displayStock }}</span>
              </div>
            </div>
          </div>
          <div
            class="item-select"
            v-if="
              !isECouponGoods &&
              skuDetail.goodsType !== 'VIRTUAL_GOODS' &&
              skuDetail.weight !== 0
            "
          >
            <div class="item-select-title">
              <p>重量</p>
            </div>
            <div class="item-select-column">
              <span class="inventory">{{ skuDetail.weight }}kg</span>
            </div>
          </div>
          <div
            class="item-select add-buy-car-row"
            v-if="$route.query.way === 'POINT' && skuDetail.authFlag === 'PASS'"
          >
            <div class="item-select-column">
              <div class="add-buy-car">
                <el-button
                  type="danger"
                  :loading="loading"
                  :disabled="skuDetail.quantity === 0"
                  @click="pointPay"
                  >积分购买</el-button
                >
              </div>
            </div>
          </div>
          <div
            class="item-select add-buy-car-row"
            v-if="$route.query.way !== 'POINT' && skuDetail.authFlag === 'PASS'"
          >
            <div class="item-select-column">
              <div class="add-buy-car">
                <el-button
                  class="goods-action-btn"
                  v-if="!isECouponGoods && skuDetail.goodsType !== 'VIRTUAL_GOODS'"
                  :loading="loading"
                  :disabled="isOutOfStock"
                  @click="addShoppingCartBtn"
                  >加入购物车</el-button
                >
                <el-button
                  class="goods-action-btn"
                  v-if="promotionMap['PINTUAN']"
                  :loading="loadingPintuan"
                  :disabled="isOutOfStock"
                  @click="pintuanBuy"
                  >拼团购买</el-button
                >
                <el-button
                  class="goods-action-btn"
                  :loading="loading1"
                  :disabled="isOutOfStock"
                  @click="buyNow"
                  >立即购买</el-button
                >
                <el-tooltip content="观看视频" v-if="skuDetail.goodsVideo">
                  <img class="view-video" @click="showGoodsVideo = true" :src="playIcon" alt="">
                </el-tooltip>
              </div>
            </div>
          </div>
        </div>
      </div>
      <el-dialog title="浏览视频" v-model="showGoodsVideo">
          <div id="dplayer"></div>
        </el-dialog>
    </div>
  </div>
</template>

<script>
import { Message } from "@/utils/message";
import { StarFilled } from '@element-plus/icons-vue';
import Promotion from "./Promotion.vue";
import DPlayer from "dplayer";
import {
  collectGoods,
  isCollection,
  receiveCoupon,
  cancelCollect,
} from "@/api/member.js";
import { addCartGoods } from "@/api/cart.js";
import playIcon from "@/assets/iconfont/play.svg";
/** 卡密商品（E_COUPON）判定与库存工具，见 @/constants/goodsType */
import {
  isECoupon,
  getECouponStock,
  getECouponMaxBuyNum,
  createEmptyPromotionMap,
  resolveECouponCartType,
  E_COUPON_CART_BUY_NOW,
  E_COUPON_CART_PINTUAN,
  E_COUPON_CART_POINTS,
} from "@/constants/goodsType";

export default {
  name: "ShowGoods",
  props: {
    // 商品数据
    detail: {
      type: Object,
      default: null,
    },
  },
  watch: {
    detail: {
      handler(val) {
        this.skuDetail = val.data;
        this.wholesaleList = val.wholesaleList;
        this.syncCountWithQuantity();
        this.promotion();
        this.swiperGoodsImg();
      },
      deep: true,
      immediate: true,
    },
    showGoodsVideo(val){
      if(val){
        this.initVideo();
      }
    }
  },
  data() {
    return {
      playIcon,
      showGoodsVideo:false,
      goodsVideo:"",
      wholesaleList: [],
      count: 1, // 商品数量
      imgIndex: 0, // 展示图片下标
      currentSelceted: [], // 当前商品sku
      imgList: [], // 商品图片列表
      skuDetail: {
        specList: [],
      }, // sku详情
      goodsSpecList: this.detail.specs, // 商品spec
      promotionMap: createEmptyPromotionMap(),
      formatList: [], // 选择商品品类的数组
      loading: false, // 立即购买loading
      loading1: false, // 加入购物车loading
      loadingPintuan: false,
      isCollected: false, // 是否收藏
    };
  },
  components: { Promotion, StarFilled },
  computed: {
    currentImg() {
      const item = this.imgList[this.imgIndex];
      return item ? item.url || item : "";
    },
    previewList() {
      return this.imgList.map((item) => item.url || item);
    },
    wholesalePrice(key) {
      return this.wholesaleList.length
        ? this.wholesaleList.map((item) => {
            return item.price;
          })
        : [];
    },
    wholesaleNum(key) {
      return this.wholesaleList.length
        ? this.wholesaleList.map((item) => {
            return item.num;
          })
        : [];
    },
    /** 卡密商品：禁加购，仅立即购买；库存读 quantity（M-02 起支持促销） */
    isECouponGoods() {
      return isECoupon(this.skuDetail.goodsType);
    },
    displayStock() {
      if (this.isECouponGoods) {
        return getECouponStock(this.skuDetail);
      }
      return Number(this.skuDetail.quantity) || 0;
    },
    quantityMax() {
      if (this.isECouponGoods) {
        return getECouponMaxBuyNum(this.skuDetail);
      }
      const qty = Number(this.skuDetail.quantity) || 0;
      return qty > 0 ? qty : 1;
    },
    isOutOfStock() {
      if (this.isECouponGoods) {
        return getECouponStock(this.skuDetail) <= 0;
      }
      return (Number(this.skuDetail.quantity) || 0) <= 0;
    },
  },
  methods: {
    // 初始化video
    initVideo(){
      if(!this.goodsVideo ){
        setTimeout(()=>{
        this.goodsVideo = new DPlayer({
          container: document.getElementById('dplayer'),
          video: {
              url:this.skuDetail.goodsVideo,
          },
      });
      },100)
      }



    },


    syncCountWithQuantity() {
      const qty = this.isECouponGoods
        ? getECouponStock(this.skuDetail)
        : Number(this.skuDetail.quantity) || 0;
      if (qty <= 0) {
        this.count = 1;
        return;
      }
      if (!this.isECouponGoods && this.wholesaleList && this.wholesaleList.length > 0) {
        this.count = Math.min(Math.max(this.wholesaleList[0].num, 1), qty);
        return;
      }
      const max = this.isECouponGoods ? getECouponMaxBuyNum(this.skuDetail) : qty;
      if (this.count > max) {
        this.count = max;
      } else if (this.count < 1) {
        this.count = 1;
      }
    },
    changeCount(val) {
      if (this.wholesaleList && this.wholesaleList.length > 0) {
        if (this.count <= this.wholesaleList[0].num) {
          Message.warning("批发商品购买数量不能小于起批数量");
          this.count = this.wholesaleList[0].num;
        }
      }
    },
    select(index, value) {
      // 选择规格
      this.currentSelceted[index] = value;
      let selectedSkuId = this.goodsSpecList.find((i) => {
        let matched = true;
        let specValues = i.specValues.filter((j) => j.specName !== "images");
        for (let n = 0; n < specValues.length; n++) {
          if (specValues[n].specValue !== this.currentSelceted[n]) {
            matched = false;
            return;
          }
        }
        if (matched) {
          return i;
        }
      });
      this.$emit("handleClickSku", {
        skuId: selectedSkuId.skuId,
        goodsId: this.skuDetail.goodsId,
      });
    },

    addShoppingCartBtn() {
      // FR-B-01：E_COUPON 禁止加购物车（后端亦返回 CARD_KEY_E_COUPON_CART_FORBIDDEN）
      if (this.isECouponGoods) {
        Message.warning("电子卡券请使用立即购买");
        return;
      }
      // 添加购物车
      const params = {
        num: this.count,
        skuId: this.skuDetail.id,
      };
      this.loading = true;
      addCartGoods(params)
        .then((res) => {
          this.loading = false;
          if (res.success) {
            this.$router.push({
              path: "/shoppingCart",
              query: {
                skuId: this.skuDetail.id,
                goodsId: this.skuDetail.goodsId,
                thumbnail: this.skuDetail.thumbnail,
                goodsName: this.skuDetail.goodsName,
                count: this.count,
              },
            });
          } else {
            Message.warning(res.message);
          }
        })
        .catch(() => {
          this.loading = false;
        });
    },
    buyNow() {
      this.startCheckout(E_COUPON_CART_BUY_NOW, "loading1");
    },
    pintuanBuy() {
      this.startCheckout(E_COUPON_CART_PINTUAN, "loadingPintuan");
    },
    pointPay() {
      this.startCheckout(E_COUPON_CART_POINTS, "loading");
    },
    startCheckout(action, loadingKey) {
      const params = {
        num: this.count,
        skuId: this.skuDetail.id,
        cartType: "BUY_NOW",
      };
      if (this.skuDetail.goodsType === "VIRTUAL_GOODS") {
        params.cartType = "VIRTUAL";
      } else if (this.isECouponGoods) {
        params.cartType = resolveECouponCartType({
          routeWay: this.$route.query.way,
          action,
        });
      }
      this[loadingKey] = true;
      addCartGoods(params)
        .then((res) => {
          this[loadingKey] = false;
          if (res.success) {
            this.$router.push({
              path: "/pay",
              query: { way: params.cartType },
            });
          } else {
            Message.warning(res.message);
          }
        })
        .catch(() => {
          this[loadingKey] = false;
        });
    },
    async collect() {
      // 收藏商品
      if (this.isCollected) {
        let cancel = await cancelCollect("GOODS", this.skuDetail.id);
        if (cancel.success) {
          Message.success("取消收藏成功");
          this.isCollected = false;
        }
      } else {
        let collect = await collectGoods("GOODS", this.skuDetail.id);
        if (collect.code === 200) {
          this.isCollected = true;
          Message.success("收藏商品成功,可以前往个人中心我的收藏查看");
        }
      }
    },
    // 格式化数据
    formatSku(list) {
      let arr = [{}];
      list.forEach((item, index) => {
        item.specValues.forEach((spec, specIndex) => {
          let name = spec.specName;
          let values = {
            value: spec.specValue,
            quantity: item.quantity,
          };
          if (name === "images") {
            return;
          }

          arr.forEach((arrItem, arrIndex) => {
            if (
              arrItem.name === name &&
              arrItem.values &&
              !arrItem.values.find((i) => i.value === values.value)
            ) {
              arrItem.values.push(values);
            }

            let keys = arr.map((key) => {
              return key.name;
            });
            if (!keys.includes(name)) {
              arr.push({
                name: name,
                values: [values],
              });
            }
          });
        });
      });
      arr.shift();
      this.formatList = arr;

      let cur = list.filter((i) => i.skuId === this.$route.query.skuId)[0];
      if (cur) {
        cur.specValues
          .filter((i) => i.specName !== "images")
          .forEach((value, _index) => {
            this.currentSelceted[_index] = value.specValue;
          });
      }
      this.skuList = list;
    },
    receiveCoupon(id) {
      // 领取优惠券
      receiveCoupon(id).then((res) => {
        if (res.success) {
          Message.success("优惠券领取成功");
        } else {
          Message.warning(res.message);
        }
      });
    },
    promotion() {
      this.promotionMap = createEmptyPromotionMap();
      if (!this.detail || !this.detail.promotionMap) return false;
      const keysArr = Object.keys(this.detail.promotionMap);
      if (keysArr.length === 0) return false;

      for (let i = 0; i < keysArr.length; i++) {
        const key = keysArr[i].split("-")[0];
        if (key === "COUPON") {
          if (!Array.isArray(this.promotionMap.COUPON)) {
            this.promotionMap.COUPON = [];
          }
          this.promotionMap.COUPON.push(this.detail.promotionMap[keysArr[i]]);
        } else if (Object.prototype.hasOwnProperty.call(this.promotionMap, key)) {
          this.promotionMap[key] = this.detail.promotionMap[keysArr[i]];
        } else {
          this.promotionMap[key] = this.detail.promotionMap[keysArr[i]];
        }
      }
    },
    swiperGoodsImg() {
      this.skuDetail.specList.forEach((e) => {
        if (e.specName === "images") {
          this.imgList = this.skuDetail.goodsGalleryList.filter(i => i.indexOf("\"url\":") === -1 && i.indexOf("\"status\":") === -1);
        }
      });
      if (!this.imgList) {
        this.imgList = [this.skuDetail.original];
      }

    },
  },
  mounted() {
    // 用户登录才会判断是否收藏
    if (this.Cookies.getItem("userInfo")) {
      isCollection("GOODS", this.skuDetail.id).then((res) => {
        if (res.success && res.result) {
          this.isCollected = true;
        }
      });
    }

    this.formatSku(this.goodsSpecList);
    // this.promotion();
    document.title = this.skuDetail.goodsName;
  },
};
</script>

<style scoped lang="scss">
/******************商品图片及购买详情开始******************/
.item-detail-see {
  width: 175px;
  margin-left: 30px;
}
.flex {
  display: flex;
}
.inventory {
  padding-left: 4px;
}

.wrapper {
  @include white_background_color();
}

.item-num {
  text-align: center;
  width: 100px;
}
.item-price-num {
  font-size: 16px;
  color: #666;
}

.item-detail-show {
  width: 1200px;
  margin: 0 auto;
  padding: 30px;
  display: flex;
  flex-direction: row;
}

.item-detail-left {
  width: 350px;

  margin-right: 30px;
}

.item-detail-big-img {
  width: 350px;
  height: 350px;
  box-shadow: 0px 0px 8px $border_color;
  cursor: pointer;
  margin-bottom: 24px;
}
#dplayer{
    width: 100%;
    height: 100%;
  }
.item-detail-big-img img {
  width: 100%;
}

.item-detail-img-row {
  margin-top: 0;
  display: flex;
}

.item-detail-img-small {
  width: 68px;
  height: 68px;
  box-shadow: 0px 0px 8px #ccc;
  cursor: pointer;
  margin-left: 5px;
}

.item-detail-img-small img {
  height: 100%;
  width: 100%;
}

/*商品选购详情*/
.item-detail-right {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.item-detail-title-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  padding: 8px 0;
}

.item-detail-name {
  @include content_color($light_content_color);
  font-weight: bold;
  font-size: 20px;
  line-height: 1.4;
}

.goods-type-tag {
  flex-shrink: 0;
}

.item-detail-express {
  font-size: 14px;
  padding: 2px 3px;
  border-radius: 3px;
  background-color: $theme_color;
  color: #fff;
}

/*商品标签*/
.item-detail-tag {
  padding: 8px 0;
  font-size: 12px;
  color: $theme_color;
}

/*价格详情等*/
.item-detail-price-row {
  padding: 10px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  background: url("../../assets/images/goodsDetail/price-bg.png");
}

.item-price-left {
  display: flex;
  flex-direction: column;
}

.item-price-title {
  color: #999999;
  font-size: 14px;
  margin-right: 15px;
}

.item-price-row {
  margin: 5px 0px;
}

.item-price {
  color: $theme_color;
  font-size: 20px;
  cursor: pointer;
}
.item-price-old {
  color: gray;
  text-decoration: line-through;
  font-size: 14px;
  margin-left: 5px;
}

.item-price-coupon-row {
  display: flex;
  align-items: center;
  margin: 5px 0px;
}

.Ellipsis {
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2; //控制显示几行
  -webkit-box-orient: vertical; //webbox方向
}

.dropdown {
  position: relative;
  display: inline-block;
  cursor: pointer;
  z-index: 999;
}

.dropdown .item-coupon {
  display: flex;
  align-content: center;
  align-items: center;
  color: $theme_color;
  margin: 5px 0;
  font-size: 12px;
  background-color: var(--theme-tint-12, #ffdedf);
  border: 1px dotted $theme_color;
  cursor: pointer;

  span {
    padding: 3px;
  }
}
.dropdown-content {
  display: none;
  position: absolute;
  background-color: #f9f9f9;
  min-width: 160px;
  box-shadow: 0px 8px 16px 0px rgba(0, 0, 0, 0.2);
  padding: 12px 16px;
}
.dropdown:hover .dropdown-content {
  display: block;
}

.item-coupon {
  margin-right: 5px;
  padding: 0 5px;
  color: $theme_color;
  font-size: 12px;
  background-color: var(--theme-tint-12, #ffdedf);
  border: 1px dotted $theme_color;
  cursor: pointer;

  span {
    padding: 3px;
  }
}
.item-promotion {
  margin-right: 5px;
  padding: 3px;
  color: $theme_color;
  font-size: 12px;
  border: 1px solid $theme_color;
}

.item-price-right {
  display: flex;
  align-content: center;
  align-items: center;
}

.item-remarks-sum {
  width: 70px;
  text-align: center;
  padding: 0 10px;
  border-left: 1px solid $border_color;
}

.item-remarks-sum p {
  color: #999999;
  font-size: 12px;
  line-height: 10px;
  text-align: center;
}

.item-remarks-num {
  line-height: 18px;
  color: #005eb7;
}

.item-select {
  display: flex;
  flex-direction: row;
  align-items: center;
  margin-top: 15px;
}

.item-select-title {
  @include content_color($light_content_color);
  font-size: 14px;
  margin-right: 15px;
  width: 60px;
  flex-shrink: 0;
  display: flex;
  align-items: center;

  p {
    margin: 0;
  }
}

.item-select-column {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  flex: 1;
}

.item-select-row {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.item-select-box {
  display: flex;
  flex-direction: row;
  align-items: center;
}

.item-select-box {
  padding: 5px;
  margin-right: 8px;
  @include background_color($light_background_color);
  border: 0.5px solid $border_color;
  cursor: pointer;
  @include content_color($light_content_color);
}

.item-select-box:hover {
  border: 0.5px solid $theme_color;
}

.item-select-box-active {
  border: 0.5px solid $theme_color;
}

.item-select-intro p {
  margin: 0px;
  padding: 5px;
}

.add-buy-car-box {
  width: 100%;

  margin-top: 15px;
  border-top: 1px dotted $border_color;
}

.add-buy-car-row {
  margin-top: 25px;

  &.item-select {
    margin-top: 25px;
  }

  .item-select-column {
    flex: none;
    width: 100%;
  }
}

.add-buy-car {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  margin-top: 0;
  padding-left: 0;
  margin-left: 0;

  > * {
    margin: 0 8px 0 0;
  }

  > *:last-child {
    margin-right: 0;
  }

  .goods-action-btn {
    background-color: #ff475d !important;
    border-color: #ff475d !important;
    color: #fff !important;

    &:hover,
    &:focus {
      background-color: #e63e52 !important;
      border-color: #e63e52 !important;
      color: #fff !important;
    }

    &.is-disabled,
    &.is-disabled:hover,
    &.is-disabled:focus {
      background-color: #ff475d !important;
      border-color: #ff475d !important;
      color: #fff !important;
      opacity: 0.5;
    }
  }
}

.goodsConfig {
  display: flex;
  justify-content: space-between;

  .collect-btn {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding-right: 10px;
    color: #666;
    cursor: pointer;
    line-height: 1;

    &.is-collected {
      .collect-icon {
        color: $theme_color;
      }
    }
  }

  .collect-icon {
    display: inline-flex;
    align-items: center;
    font-size: 16px;
  }

  .collect-text {
    line-height: 1;
  }
}
.sell-point {
  font-size: 12px;
  color: red;
  margin-bottom: 5px;
}
.view-video{
  cursor: pointer;
}
/******************商品图片及购买详情结束******************/
</style>
