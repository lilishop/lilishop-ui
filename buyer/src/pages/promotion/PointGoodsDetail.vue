<template>
  <div style="background:#fff;">
    <BaseHeader></BaseHeader>
    <Search style="border-bottom:2px solid red;"></Search>
    <div class="base-width cate-container">
      <el-breadcrumb>
        <el-breadcrumb-item to="/">首页</el-breadcrumb-item>
        <el-breadcrumb-item>{{ goodsMsg.pointsGoodsCategoryName }}</el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    <div class="item-detail-show">
      <div class="item-detail-left">
        <div class="item-detail-big-img">
          <el-image
            v-if="goodsSku.thumbnail"
            :src="goodsSku.thumbnail"
            :preview-src-list="[goodsSku.thumbnail]"
            fit="contain"
            style="width: 100%; height: 400px"
          />
        </div>
        <div class="item-detail-img-row">
          <div class="item-detail-img-small">
            <img :src="goodsSku.thumbnail" />
          </div>
        </div>
      </div>
      <div class="item-detail-right">
        <div class="item-detail-title">
          <div class="item-detail-title-row">
            <p>{{ goodsSku.goodsName }}</p>
            <el-tag v-if="isECouponSku" class="goods-type-tag" size="small">电子卡券</el-tag>
          </div>
        </div>
        <div class="sell-point">
          {{ goodsSku.sellingPoint }}
        </div>
        <div class="item-detail-price-row">
          <div class="item-price-left">
            <div class="item-price-row">
              <p>
                <span class="item-price-title">积 &nbsp;&nbsp;&nbsp;&nbsp;分</span>
                <span class="item-price">{{ goodsMsg.points }}</span>
              </p>
            </div>
          </div>
        </div>
        <div class="add-buy-car-box">
          <div class="item-select">
            <div class="item-select-title">
              <p>数量</p>
            </div>
            <div class="item-select-row">
              <el-input-number
                :min="1"
                :max="quantityMax"
                :disabled="isOutOfStock"
                v-model="count"
              />
              <span class="inventory"> 库存{{ displayStock }}</span>
            </div>
          </div>
          <div
            class="item-select"
            v-if="!isECouponSku && goodsSku.goodsType !== 'VIRTUAL_GOODS' && goodsSku.weight !== 0"
          >
            <div class="item-select-title">
              <p>重量</p>
            </div>
            <div class="item-select-row">
              <span class="inventory"> {{ goodsSku.weight }}kg</span>
            </div>
          </div>
          <div class="add-buy-car">
            <el-button
              type="danger"
              :loading="loading"
              :disabled="isOutOfStock"
              @click="pointBuy"
            >积分购买</el-button>
          </div>
        </div>
      </div>
    </div>
    <div class="base-width item-intro" ref="itemIntroGoods">
      <div>商品介绍</div>
      <div v-html="goodsSku.intro" class="mt_10 ml_10" v-if="goodsSku.intro"></div>
      <div v-else style="margin:20px;">暂无商品介绍</div>
    </div>
    <el-skeleton size="large" fix v-if="isLoading"></el-skeleton>
    <BaseFooter></BaseFooter>
  </div>
</template>

<script>
import { Message } from "@/utils/message";
import Search from "@/components/Search";
import { addCartGoods } from "@/api/cart.js";
import { pointGoodsDetail } from "@/api/promotion";
import {
  isECoupon,
  getECouponStock,
  getECouponMaxBuyNum,
  E_COUPON_CART_POINTS,
} from "@/constants/goodsType";

export default {
  name: "PointGoodsDetail",
  components: { Search },
  beforeRouteEnter(to, from, next) {
    window.scrollTo(0, 0);
    next();
  },
  created() {
    this.getGoodsDetail();
  },
  mounted() {
    window.addEventListener("scroll", this.handleScroll);
  },
  data() {
    return {
      goodsMsg: {},
      goodsSku: {},
      isLoading: false,
      onceFlag: true,
      count: 1,
      loading: false,
    };
  },
  computed: {
    isECouponSku() {
      return isECoupon(this.goodsSku.goodsType);
    },
    displayStock() {
      if (this.isECouponSku) {
        return getECouponStock(this.goodsSku);
      }
      return Number(this.goodsSku.quantity) || 0;
    },
    quantityMax() {
      if (this.isECouponSku) {
        return getECouponMaxBuyNum(this.goodsSku);
      }
      const qty = Number(this.goodsSku.quantity) || 0;
      return qty > 0 ? qty : 1;
    },
    isOutOfStock() {
      return this.displayStock <= 0;
    },
  },
  methods: {
    getGoodsDetail() {
      this.isLoading = true;
      pointGoodsDetail(this.$route.query.id)
        .then((res) => {
          this.isLoading = false;
          if (res.success) {
            this.goodsMsg = res.result;
            this.goodsSku = res.result.goodsSku || {};
            this.syncCountWithQuantity();
          } else {
            Message.error(res.message);
            this.$router.push("/");
          }
        })
        .catch(() => {
          this.$router.push("/");
        });
    },
    syncCountWithQuantity() {
      const max = this.quantityMax;
      if (max <= 0) {
        this.count = 1;
        return;
      }
      if (this.count > max) this.count = max;
      if (this.count < 1) this.count = 1;
    },
    pointBuy() {
      const params = {
        num: this.count,
        skuId: this.goodsMsg.skuId,
        cartType: E_COUPON_CART_POINTS,
      };
      this.loading = true;
      addCartGoods(params)
        .then((res) => {
          this.loading = false;
          if (res.success) {
            this.$router.push({ path: "/pay", query: { way: params.cartType } });
          } else {
            Message.warning(res.message);
          }
        })
        .catch(() => {
          this.loading = false;
        });
    },
    handleScroll() {
      if (this.onceFlag) {
        this.$nextTick(() => {
          this.changeHeight();
        });
        this.onceFlag = false;
      }
    },
    changeHeight() {
      const goodsDetailCon = document.querySelector(".item-intro");
      if (!goodsDetailCon || !this.$refs.itemIntroGoods) return;
      let heightCss = window.getComputedStyle(goodsDetailCon).height;
      heightCss = parseInt(heightCss.substr(0, heightCss.length - 2), 10) + 89;
      this.$refs.itemIntroGoods.style.height = heightCss + "px";
    },
  },
};
</script>

<style scoped lang="scss">
.base-width {
  width: 1200px;
  margin: 0 auto;
  position: relative;
}
.cate-container {
  background-color: #eee;
  height: 30px;
  line-height: 30px;
  padding-left: 10px;
  margin-top: 10px;
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
  img {
    width: 100%;
  }
}
.item-detail-img-row {
  margin-top: 15px;
  display: flex;
}
.item-detail-img-small {
  width: 68px;
  height: 68px;
  box-shadow: 0px 0px 8px #ccc;
  cursor: pointer;
  margin-left: 5px;
  img {
    height: 100%;
    width: 100%;
  }
}
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
}
.item-detail-title p {
  @include content_color($light_content_color);
  font-weight: bold;
  font-size: 20px;
  padding: 8px 0;
  margin: 0;
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
.add-buy-car-box {
  width: 100%;
  margin-top: 15px;
  border-top: 1px dotted $border_color;
}
.add-buy-car {
  margin-top: 15px;
  > * {
    margin: 0 4px;
  }
}
.item-select {
  display: flex;
  flex-direction: row;
  margin-top: 15px;
}
.item-select-title {
  @include content_color($light_content_color);
  font-size: 14px;
  margin-right: 15px;
  width: 60px;
}
.item-select-row {
  margin-bottom: 8px;
}
.sell-point {
  font-size: 12px;
  color: red;
  margin-bottom: 5px;
}
.item-intro {
  margin-top: 10px;
  > div:nth-child(1) {
    height: 40px;
    line-height: 40px;
    background-color: #eee;
    padding-left: 20px;
  }
}
</style>
