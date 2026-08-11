<template>
  <div class="cart" @click="couponAvailable = false">
    <BaseHeader></BaseHeader>
    <!-- LOGO 搜索 -->
    <div class="width_1200 logo">
      <div>
        <router-link to="/"><img :src="$store.state.logoImg" /></router-link>
        <div>
          购物车(<span>{{ goodsTotal }}</span>)
        </div>
      </div>

    </div>
    <el-divider />
    <!-- 购物车主体 -->
    <div class="cart-content width_1200 center">
      <div class="available-area">
        <div class="cart-steps">
          <span :class="stepIndex == 0 ? 'active' : ''">1.我的购物车</span>
          <i class="icomoon icon-next" :class="stepIndex == 0 ? 'active-arrow' : ''"></i>
          <span :class="stepIndex == 1 ? 'active' : ''">2.填写订单信息</span>
          <i class="icomoon icon-next" :class="stepIndex == 1 ? 'active-arrow' : ''"></i>
          <span :class="stepIndex == 2 ? 'active' : ''">3.成功提交订单</span>
        </div>
      </div>
      <!-- 购物车商品列表 -->
      <div class="cart-goods">
        <div class="cart-goods-table">
        <div class="cart-goods-title">
          <div class="width_60 cart-col-check">
            <el-checkbox
              v-model="allChecked"
              @change="changeChecked(allChecked, 'all')"
              >全选</el-checkbox
            >
          </div>
          <div class="goods-title">商品</div>
          <div class="width_150">单价（元）</div>
          <div class="width_100">数量</div>
          <div class="width_150">小计</div>
          <div class="cart-ops-col">操作</div>
        </div>
        <div v-if="cartList.length === 0" class="cart-empty">
          <p>购物车空空如也</p>
          <router-link to="/">去选购&gt;</router-link>
        </div>
        <div v-else class="cart-goods-list-box">
          <div
            class="cart-shop-group"
            v-for="(shop, index) in cartList"
            :key="index"
          >
            <div class="shop-name">
              <div class="width_60 cart-col-check">
                <el-checkbox
                  v-model="shop.checked"
                  @change="changeChecked(shop.checked, 'shop', shop.storeId)"
                ></el-checkbox>
              </div>
              <div class="shop-info">
                <span class="go-shop-page" @click="goShopPage(shop.storeId)">{{
                  shop.storeName
                }}</span>
              <span
                class="shop-coupon"
                v-if="shop.couponList.length"
                :class="couponAvailable === index ? 'shop-coupon-show' : ''"
                @click.stop="showCoupon(shop.id, index)"
              >
                <!-- 优惠券模态框 -->
                <div v-if="couponAvailable === index">
                  <div
                    class="coupon-item"
                    v-for="(item, couponIndex) in shop.couponList"
                    :key="couponIndex"
                  >
                    <span v-if="item.couponType === 'PRICE'"
                      >￥{{ item.price }}</span>
                    <span v-if="item.couponType === 'DISCOUNT'"
                      >{{ item.couponDiscount }}折</span>
                    <span>满{{ item.consumeThreshold }}元可用</span>
                    <el-button
                      class="coupon-btn"
                      size="small"
                      type="primary"
                      @click="receiveShopCoupon(item)"
                      :disabled="item.disabled"
                      >{{ item.disabled ? "已领取" : "领取" }}</el-button
                    >
                  </div>
                </div>
              </span>
              <div class="promotion-notice">{{ shop.promotionNotice }}</div>
              </div>
            </div>
            <template v-for="(goods, goodsIndex) in shop.skuList" :key="goods.goodsSku?.id || goodsIndex">
              <div class="goods-item">
              <div class="width_60 cart-col-check">
                <el-checkbox
                  v-model="goods.checked"
                  @change="
                    changeChecked(goods.checked, 'goods', goods.goodsSku.id)
                  "
                ></el-checkbox>
              </div>
              <div
                class="goods-title"
                @click="
                  goGoodsDetail(goods.goodsSku.id, goods.goodsSku.goodsId)
                "
              >
                <img
                  :src="
                    goods.goodsSku.thumbnail ||
                    '../assets/images/goodsDetail/item-detail-1.jpg'
                  "
                />
                <div>
                  <p>
                    {{ goods.goodsSku.goodsName }}
                  </p>
                  <p><el-tag
                    v-if="goods.goodsSku.salesModel === 'WHOLESALE'"
                    class="goods-show-tag"
                    color="purple"
                  >
                    批发商品
                  </el-tag></p>
                  <template
                    v-for="(promotion, promotionIndex) in goods.promotions"
                  >
                    <div
                      class="promotion"
                      :key="promotionIndex"
                      v-if="promotion.promotionType === 'SECKILL'"
                    >
                      <span>秒杀</span>
                      <promotion
                        :time="promotion.endTime"
                        type="cart"
                      ></promotion>
                    </div>
                  </template>
                  <template
                    v-for="(promotion, promotionIndex) in goods.promotions"
                  >
                    <div
                      class="promotion"
                      :key="promotionIndex"
                      v-if="promotion.promotionType === 'FULL_DISCOUNT'"
                    >
                      <span>满优惠活动</span>
                      <promotion
                        :time="promotion.endTime"
                        type="cart"
                      ></promotion>
                    </div>
                  </template>
                </div>
              </div>
              <div class="width_150 cart-col-price">
                {{ $filters.unitPrice(goods.purchasePrice, "￥") }}
              </div>
              <div class="width_100 cart-col-qty">
                <el-input-number
                  :min="1"
                  size="small"
                  v-model="goods.num"
                  @change="changeNum(goods.num, goods.goodsSku.id)"
                ></el-input-number>
                <div class="fontsize_12 cart-qty-stock">
                  {{ goods.goodsSku.quantity > 0 ? "有货" : "无货" }}
                </div>
              </div>
              <div class="width_150 cart-col-subtotal">
                {{ $filters.unitPrice(goods.subTotal, "￥") }}
              </div>
              <div class="cart-ops-col">
                <div v-if="!goods.errorMessage" class="cart-ops">
                  <el-button
                    size="small"
                    class="cart-del-btn"
                    @click="delGoods(goods.goodsSku.id)"
                    >删除</el-button
                  >
                  <el-button
                    size="small"
                    class="cart-collect-btn"
                    :class="{ 'is-collected': goods.isCollected }"
                    @click="handleCollect(goods)"
                    >{{ goods.isCollected ? "已收藏" : "收藏" }}</el-button
                  >
                </div>
              </div>
              <div class="error-goods" v-if="goods.errorMessage">
                <div>{{ goods.errorMessage }}</div>
                <el-button type="primary" @click="delGoods(goods.goodsSku.id)"
                  >删除</el-button
                >
              </div>
            </div>
            </template>
          </div>
        </div>
        </div>
        <!-- 底部支付栏 -->
        <div class="cart-goods-footer">
          <div>
            <div class="width_60 cart-col-check">
              <el-checkbox
                v-model="allChecked"
                @change="changeChecked(allChecked, 'all')"
                >全选</el-checkbox
              >
            </div>
            <div class="width_100 handle-btn" @click="delGoods()">
              删除选中商品
            </div>
            <!-- <div class="width_100 handle-btn" @click="collectGoods">移到我的收藏</div> -->
            <div class="width_100 handle-btn" @click="clearCart">
              清空购物车
            </div>
          </div>
          <div>
            <div class="selected-count">
              已选择<span>{{ checkedNum }}</span>件商品
            </div>
            <div class="ml_20 save-price">
              已节省<span>{{ $filters.unitPrice(priceDetailDTO.discountPrice, "￥") }}</span>
            </div>
            <div class="ml_20 total-price">
              总价（不含运费）:
              <div>{{ $filters.unitPrice(priceDetailDTO.flowPrice, "￥") }}</div>
            </div>
            <div class="pay ml_20" @click="pay">去结算</div>
          </div>
        </div>
      </div>
      <el-skeleton size="large" fix v-if="loading"></el-skeleton>
    </div>
    <BaseFooter class="footer"></BaseFooter>
  </div>
</template>

<script>
import { Message, Modal } from "@/utils/message";
import Promotion from "@/components/goodsDetail/Promotion";
import Search from "@/components/Search";
import * as APICart from "@/api/cart";
import * as APIMember from "@/api/member";
import { isECoupon } from "@/constants/goodsType";
export default {
  name: "Cart",
  beforeRouteEnter(to, from, next) {
    window.scrollTo(0, 0);
    next();
  },
  components: {
    Search,
    Promotion,
  },
  data() {
    return {
      couponAvailable: false, // 展示优惠券
      stepIndex: 0, // 当前处于哪一步，购物车==0，填写订单信息==1，成功提交订单==2
      goodsTotal: 0, // 商品数量
      checkedNum: 0, // 选中数量
      allChecked: false, // 全选
      loading: false, // 加载状态
      cartList: [], // 购物车列表
      couponList: [], // 优惠券列表
      priceDetailDTO: {}, // 价格明细
      skuList: [], // sku列表
    };
  },
  methods: {
    // 跳转商品详情
    goGoodsDetail(skuId, goodsId) {
      let routeUrl = this.$router.resolve({
        path: "/goodsDetail",
        query: { skuId, goodsId },
      });
      window.open(routeUrl.href, "_blank");
    },
    // 跳转店铺首页
    goShopPage(id) {
      let routeUrl = this.$router.resolve({
        path: "/merchant",
        query: { id },
      });
      window.open(routeUrl.href, "_blank");
    },
    // 同步购物车商品收藏状态
    async syncCartCollectionStatus() {
      if (!this.Cookies.getItem("userInfo") || !this.cartList.length) return;
      const skuIds = [];
      this.cartList.forEach((shop) => {
        (shop.skuList || []).forEach((goods) => {
          goods.isCollected = false;
          if (goods.goodsSku && goods.goodsSku.id) {
            skuIds.push(goods.goodsSku.id);
          }
        });
      });
      const uniqueSkuIds = [...new Set(skuIds)];
      await Promise.all(
        uniqueSkuIds.map(async (skuId) => {
          try {
            const res = await APIMember.isCollection("GOODS", skuId);
            if (res.success && res.result) {
              this.cartList.forEach((shop) => {
                (shop.skuList || []).forEach((goods) => {
                  if (goods.goodsSku && goods.goodsSku.id === skuId) {
                    goods.isCollected = true;
                  }
                });
              });
            }
          } catch (e) {
            // 单个查询失败不影响其他商品
          }
        })
      );
      this.$forceUpdate();
    },
    // 收藏 / 取消收藏商品
    handleCollect(goods) {
      const skuId = goods.goodsSku && goods.goodsSku.id;
      if (!skuId) return;
      if (goods.isCollected) {
        Modal.confirm({
          title: "取消收藏",
          content: "确定取消收藏该商品吗？",
          onOk: () => {
            return APIMember.cancelCollect("GOODS", skuId).then((res) => {
              if (res.success) {
                goods.isCollected = false;
                Message.success("取消收藏成功");
                this.$forceUpdate();
              }
            });
          },
          onCancel: () => {},
        });
        return;
      }
      Modal.confirm({
        title: "收藏",
        content: "商品收藏后可在个人中心我的收藏查看",
        onOk: () => {
          return APIMember.collectGoods("GOODS", skuId).then((res) => {
            if (res.success) {
              goods.isCollected = true;
              Message.success("收藏商品成功");
              this.$forceUpdate();
            }
          });
        },
        onCancel: () => {},
      });
    },
    // 删除商品
    delGoods(id) {
      const idArr = [];
      if (!id) {
        const list = this.cartList;
        list.forEach((shop) => {
          shop.skuList.forEach((goods) => {
            if (goods.checked) {
              idArr.push(goods.goodsSku.id);
            }
          });
        });
      } else {
        idArr.push(id);
      }
      Modal.confirm({
        title: "删除",
        content: "确定要删除该商品吗？",
        onOk: () => {
          APICart.delCartGoods({ skuIds: idArr.toString() }).then((res) => {
            if (res.success) {
              Message.success("删除成功");
              this.getCartList();
            } else {
              Message.error(res.message);
            }
          });
        },
      });
    },
    // 清空购物车
    clearCart() {
      Modal.confirm({
        title: "提示",
        content: "确定要清空购物车吗？清空后不可恢复",
        onOk: () => {
          APICart.clearCart().then((res) => {
            if (res.success) {
              Message.success("清空购物车成功");
              this.getCartList();
            } else {
              Message.error(res.message);
            }
          });
        },
      });
    },
    // 跳转支付页面
    pay() {
      if (!this.checkedNum) {
        Message.warning("请至少选择一件商品");
        return;
      }
      const hasECoupon = this.cartList.some((shop) =>
        (shop.skuList || []).some(
          (goods) => goods.checked && isECoupon(goods.goodsSku && goods.goodsSku.goodsType)
        )
      );
      if (hasECoupon) {
        Message.warning("电子卡券请使用立即购买，不可通过购物车结算");
        return;
      }
      this.$router.push({ path: "/pay", query: { way: "CART" } });
    },
    // 展示优惠券
    showCoupon(storeId, index) {
      this.couponAvailable = index;
    },
    // 设置购买数量
    changeNum(val, id) {
      if (val) {
        APICart.setCartGoodsNum({ skuId: id, num: val }).then((res) => {
          if (res.success) {
            this.getCartList();
          }
        });
      }
    },
    // 设置商品选中状态
    async changeChecked(status, type, id) {
      const check = status ? 1 : 0;
      if (type === "all") {
        // 全选
        await APICart.setCheckedAll({ checked: check });
      } else if (type === "shop") {
        // 选中店铺所有商品
        await APICart.setCheckedSeller({ checked: check, storeId: id });
      } else {
        // 单个商品
        await APICart.setCheckedGoods({ checked: check, skuId: id });
      }

      this.getCartList();
    },
    // 领取优惠券
    async receiveShopCoupon(item) {
      let res = await APIMember.receiveCoupon(item.id);
      if (res.success) {
        item["disabled"] = true;
        Message.success("领取成功");
      } else {
        Message.error(res.message);
      }
    },
    // 购物车列表
    async getCartList() {
      this.loading = true;
      try {
        let res = await APICart.cartGoodsAll();
        this.loading = false;
        if (res.success) {
          this.cartList = res.result.cartList;
          this.priceDetailDTO = res.result.priceDetailDTO;
          this.skuList = res.result.skuList;
          this.checkedNum = 0;
          let allChecked = true;
          for (let k = 0; k < this.cartList.length; k++) {
            let shop = this.cartList[k];
            let list = await APIMember.couponList({ storeId: shop.storeId });
            shop.couponList.push(...list.result.records);
          }
          for (let i = 0; i < this.skuList.length; i++) {
            if (this.skuList[i].checked) {
              this.checkedNum += this.skuList[i].num;
            } else {
              allChecked = false;
            }
          }
          this.$forceUpdate();
          this.allChecked = allChecked;
          this.syncCartCollectionStatus();
        }
      } catch (error) {
        this.loading = false;
      }
    },
  },
  mounted() {
    this.getCartList();
    APICart.cartCount().then((res) => {
      // 购物车商品数量
      if (res.success) this.goodsTotal = res.result;
    });
  },
};
</script>

<style scoped lang="scss">
.footer{
  margin-top: 10px;
}
/** logo 搜索 start **/
.logo {
  height: 40px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 20px auto 0;
  div:nth-child(1) {
    display: flex;
    justify-content: space-between;
    align-items: center;
    img {
      width: 150px;
      height: auto;
      cursor: pointer;
    }
    div:nth-child(2) {
      width: 200px;
      color: #999;
      font-size: 16px;
      margin: 0 20px;
      span {
        color: $theme_color;
      }
    }
  }
}
.cart-content {
  margin: 0 auto;
  width: 1200px;
  position: relative;
}
/** logo end */
/** step步骤条 */
.cart-steps {
  height: 30px;
  display: flex;
  align-items: center;
  margin-bottom: 15px;
  span {
    @include content_color($light_content_color);
    height: 30px;
    text-align: center;
    line-height: 30px;
    display: inline-block;
    padding: 0 15px;
  }

  .el-icon {
    @include content_color($light_content_color);
    font-size: 20px;
    margin: 0 15px;
  }

  .active {
    border-radius: 50px;
    background-color: #ff8f23;
    color: #fff;
  }

  .active-arrow {
    color: #ff8f23;
  }
}
/** 步骤条和配送区域总体 */
.available-area {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 15px;
}
/** 商品列表 */
.cart-goods {
  .cart-goods-table {
    border: 1px solid #e0e0e0;
    @include background_color($light_white_background_color);
  }
  &-title {
    height: 50px;
    @include background_color($light_white_background_color);
    @include title_color($title_color);
    display: flex;
    align-items: center;
    padding: 0 20px;
    border-bottom: 1px solid #e0e0e0;
    div:not(.cart-col-check) {
      text-align: center;
    }
    .goods-title {
      flex: 1;
    }
  }
  .cart-empty {
    width: 100%;
    text-align: center;
    height: 300px;
    padding-top: 100px;
  }
  .cart-goods-list-box {
    @include background_color($light_white_background_color);
  }
  .cart-col-check {
    width: 60px;
    min-width: 60px;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: flex-start;
    text-align: left;

    :deep(.el-checkbox) {
      margin-right: 0;
    }
  }
  .cart-shop-group {
    &:not(:last-child) {
      border-bottom: 1px solid #e0e0e0;
    }
    .shop-name {
      height: 50px;
      display: flex;
      align-items: center;
      padding: 0 20px;
      position: relative;
      @include title_color($light_title_color);
      .shop-info {
        flex: 1;
        min-width: 0;
        display: flex;
        align-items: center;
        .promotion-notice {
          margin-left: auto;
        }
      }
      .go-shop-page:hover {
        color: $theme_color;
        cursor: pointer;
      }
      .customer-service {
        margin-left: 5px;
        color: #fcc217;
        cursor: pointer;
        &:hover {
          color: $theme_color;
        }
      }
      /** 优惠券 */
      .shop-coupon {
        width: 80px;
        height: 24px;
        flex-shrink: 0;
        position: relative;
        background: url(../assets/images/cart-coupon-icons02.png) 0 0 no-repeat;
        > div {
          position: absolute;
          top: 35px;
          left: 0;
          width: 300px;
          height: 300px;
          background-color: #fff;
          border: 1px solid $theme_color;
          z-index: 1;
          padding: 10px 20px;
          &::before {
            content: "";
            display: block;
            background: url(../assets/images/cart-coupon-icons02.png) 0 -58px no-repeat;
            width: 80px;
            height: 12px;
            position: absolute;
            top: -12px;
            left: 0;
          }
          .coupon-item {
            margin-bottom: 10px;
            span:nth-child(1) {
              border: 1px solid #e33937;
              display: inline-block;
              padding: 3px 10px;
              color: $theme_color;
              border-radius: 3px;
            }
            span:nth-child(2) {
              font-size: 12px;
              margin-left: 5px;
              color: #999;
            }
            .coupon-btn {
              height: 26px;
              float: right;
              font-size: 12px;
            }
            &::after {
              display: block;
              content: "";
              clear: right;
            }
          }
        }
      }
      .promotion-notice {
        text-align: right;
        font-size: 12px;
        flex-shrink: 0;
        margin-left: 10px;
      }
      .shop-coupon-show {
        background-position-y: -34px;
      }
    }
    .goods-item {
      position: relative;
      @extend .cart-goods-title;
      background: transparent;
      border-top: 1px solid #f0f0f0;
      padding: 10px 20px;
      height: auto;
      .cart-col-check {
        padding-left: 20px;
        box-sizing: border-box;
      }
      > div:nth-child(1) {
        width: 60px;
      }
      > div:nth-child(2) {
        cursor: pointer;
        display: flex;
        box-sizing: border-box;
        padding-left: 20px;
        position: relative;
        img {
          width: 70px;
          height: 70px;
        }
        > div > p {
          @include content_color($light_content_color);
          font-size: 13px;
          text-align: left;
          margin-left: 10px;
          &:hover {
            color: $theme_color;
          }
        }
      }
      .cart-col-price,
      .cart-col-subtotal {
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        text-align: center;
      }
      .cart-col-subtotal {
        font-weight: bold;
      }
      .cart-col-qty {
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;

        :deep(.el-input-number) {
          width: 100%;
        }

        .cart-qty-stock {
          position: absolute;
          top: calc(100% + 4px);
          left: 50%;
          transform: translateX(-50%);
          white-space: nowrap;
          line-height: 1.2;
          color: #999;
        }
      }
      .num-input {
        width: 60px;
        border: 1px solid #999;
        border-radius: 5px;
        padding: 0 5px;
        &:focus {
          outline-color: $theme_color;
        }
      }
      .error-goods {
        position: absolute;
        inset: 0;
        background-color: rgba($color: #999, $alpha: 0.5);
        z-index: 10;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 30px 0 150px;
        box-sizing: border-box;
        color: #000;
      }
    }
  }
  &-footer {
    @extend .cart-goods-title;
    position: sticky;
    bottom: 0;
    border-top: 1px solid #ddd;
    margin-top: 10px;
    padding: 0 0 0 20px;
    line-height: 50px;
    justify-content: space-between;
    > div {
      display: flex;
    }
    .selected-count {
      span {
        color: $theme_color;
      }
    }

    .save-price span {
      color: #000;
    }
    .total-price div {
      color: $theme_color;
      font-size: 20px;
    }
    .pay {
      background-color: $theme_color;
      width: 150px;
      font-size: 20px;
      color: #fff;
      height: 100%;
      line-height: 50px;
      cursor: pointer;
    }
  }
  .handle-btn {
    font-size: 12px;
    color: $handle-btn-color;
    cursor: pointer;
    &:hover {
      color: $theme_color;
    }
  }
}
.like {
  width: 1200px;
  margin: 10px auto;
  // padding: 20px 0;
  @include white_background_color();
}
.likeGoods,
.shop-nav-container {
  width: 1200px;
  margin: 0 auto;
}
.el-divider {
  background: $theme_color;
  height: 2px;
}
.width_150 {
  width: 150px;
}
.width_60 {
  width: 60px;
}
.promotion {
  display: flex;
  margin-top: 5px;
  margin-left: 5px;
  > span {
    border: 1px solid $theme_color;
    color: $theme_color;
    font-size: 12px;
    border-radius: 2px;
    padding: 0 2px;
  }
  > p {
    font-size: 12px;
    margin-left: 10px;
    color: #999;
  }
}
.cart-goods-footer > div {
  display: flex;
  align-items: center;
  overflow: hidden;
}
.total-price {
  display: flex;
  align-items: center;
}

.cart-ops-col {
  width: 130px;
  min-width: 130px;
  flex-shrink: 0;
}

.cart-ops {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  flex-wrap: nowrap;
}

.cart-del-btn {
  background-color: #ff7d79 !important;
  border-color: #ff7d79 !important;
  color: #fff !important;
  margin: 0 !important;

  &:hover,
  &:focus {
    background-color: #ff6b66 !important;
    border-color: #ff6b66 !important;
    color: #fff !important;
  }
}

.cart-collect-btn {
  background-color: #fa6419 !important;
  border-color: #fa6419 !important;
  color: #fff !important;
  margin: 0 !important;

  &:hover,
  &:focus {
    background-color: #e55a15 !important;
    border-color: #e55a15 !important;
    color: #fff !important;
  }

  &.is-collected {
    background-color: $theme_color !important;
    border-color: $theme_color !important;

    &:hover,
    &:focus {
      background-color: $theme_color !important;
      border-color: $theme_color !important;
      opacity: 0.9;
    }
  }
}
</style>
<style>
.el-input-number .el-input__inner {
  text-align: center;
}

</style>
