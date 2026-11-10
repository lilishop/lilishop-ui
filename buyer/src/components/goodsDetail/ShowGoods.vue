<template>
  <div class="wrapper">
    <div class="item-detail-show">
      <!-- 详情左侧展示数据、图片，收藏、举报 -->
      <div class="item-detail-left">
        <!-- 大图、放大镜（视频商品首项为视频） -->
        <div class="item-detail-big-img" v-if="mediaList[mediaIndex]">
          <el-image
            v-show="!isCurrentVideo"
            :src="currentImg"
            fit="cover"
            style="width: 100%; height: 100%"
          />
          <div v-show="isCurrentVideo" class="goods-video-wrap">
            <div class="goods-video-bg" :style="videoBgStyle"></div>
            <div
              v-show="hasVideo"
              id="goodsVideoPlayer"
              class="goods-video-player"
            ></div>
          </div>
        </div>

        <div class="item-detail-img-row">
          <div
            class="item-detail-img-small"
            :class="{ 'is-active': mediaIndex === index }"
            @mouseover="switchMedia(index)"
            v-for="(item, index) in mediaList"
            :key="index"
          >
            <video
              v-if="item.type === 'video'"
              class="video-thumb"
              :src="item.url"
              muted
              preload="metadata"
              playsinline
            ></video>
            <img v-else :src="mediaThumb(item)"/>
            <span v-if="item.type === 'video'" class="video-badge">
              <img :src="playIcon" alt="" />
            </span>
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
        <!-- 商品详细 价格 -->
        <div class="item-detail-price-row">
          <div class="item-price-left">
            <!-- 秒杀价格 -->
            <div
              class="item-price-row"
              v-if="skuDetail.promotionPrice && promotionMap['SECKILL']"
            >
              <p>
                <span class="item-price-title" v-if="promotionMap['SECKILL']"
                  >秒杀价</span>
                <span class="item-price">{{ $filters.unitPrice(skuDetail.promotionPrice, "￥") }}</span>
                <span class="item-price-old">{{ $filters.unitPrice(skuDetail.price, "￥") }}</span>
              </p>
            </div>
            <!-- 商品原价 -->
            <div class="item-price-row" v-else>
              <span class="item-price">{{ $filters.unitPrice(skuDetail.price, "￥") }}</span>
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

        <!-- 独立促销与优惠模块 -->
        <div class="goods-promotions-box" v-if="hasPromotions">
          <!-- 优惠券展示 -->
          <div class="promo-item-row" v-if="promotionMap['COUPON'] && promotionMap['COUPON'].length">
            <span class="promo-title">优惠券</span>
            <div class="coupon-tags">
              <span
                class="item-coupon"
                v-for="(item, index) in promotionMap['COUPON'].slice(0, 6)"
                :key="index"
                @click="handleReceiveCoupon(item.id)"
              >
                <span v-if="item.couponType == 'PRICE'"
                  >{{ item.consumeThreshold > 0 ? '满' + item.consumeThreshold + '减' + item.price : '无门槛，立减' + item.price + '元' }}</span>
                <span v-if="item.couponType == 'DISCOUNT'"
                  >满{{ item.consumeThreshold }}打{{
                    item.couponDiscount
                  }}折</span>
              </span>

              <div class="dropdown" v-if="promotionMap['COUPON'].length > 6">
                <span class="dropdown-more">展开更多 ▾</span>
                <div class="dropdown-content">
                  <span
                    class="item-coupon"
                    v-for="(item, index) in promotionMap['COUPON'].slice(6, promotionMap['COUPON'].length)"
                    :key="index"
                    @click="handleReceiveCoupon(item.id)"
                  >
                    <span v-if="item.couponType == 'PRICE'"
                      >{{ item.consumeThreshold > 0 ? '满' + item.consumeThreshold + '减' + item.price : '无门槛，立减' + item.price + '元' }}</span>
                    <span v-if="item.couponType == 'DISCOUNT'"
                      >满{{ item.consumeThreshold }}打{{
                        item.couponDiscount
                      }}折</span>
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- 促销活动行（满减/满折/满赠、拼团） -->
          <div class="promo-item-row" v-if="promotionMap['FULL_DISCOUNT'] || promotionMap['PINTUAN']">
            <span class="promo-title">促&emsp;销</span>
            <div class="promo-content-column">
              <!-- 满减/满折/满赠 -->
              <div class="promo-activity-entry" v-if="promotionMap['FULL_DISCOUNT']">
                <span class="promo-badge">{{ getFullDiscountTag(promotionMap['FULL_DISCOUNT']) }}</span>
                <span class="promo-desc">{{ formatFullDiscountDesc(promotionMap['FULL_DISCOUNT']) }}</span>
              </div>
              <!-- 拼团 -->
              <div class="promo-activity-entry" v-if="promotionMap['PINTUAN']">
                <span class="promo-badge">拼团</span>
                <span class="promo-desc">
                  拼团价
                  <span class="promo-price-text">{{ $filters.unitPrice(promotionMap["PINTUAN"].price, "￥") }}</span>
                  ，多人拼单更实惠
                </span>
              </div>
            </div>
          </div>
        </div>
        <!-- 选择颜色 -->
        <div
          class="item-select item-spec"
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
        <div class="add-buy-car-box">
          <div class="item-select item-spec">
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
                <span class="inventory">（库存：{{ displayStock }}）</span>
              </div>
            </div>
          </div>
          <div
            class="item-select add-buy-car-row"
            v-if="$route.query.way === 'POINT' && skuDetail.authFlag === 'PASS'"
          >
            <div class="item-select-column">
              <div class="add-buy-car">
                <el-button
                  class="goods-action-btn is-solid"
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
                  class="goods-action-btn is-solid"
                  v-if="promotionMap['PINTUAN']"
                  :loading="loadingPintuan"
                  :disabled="isOutOfStock"
                  @click="pintuanBuy"
                  >拼团购买</el-button
                >
                <el-button
                  class="goods-action-btn is-solid"
                  :loading="loading1"
                  :disabled="isOutOfStock"
                  @click="buyNow"
                  >立即购买</el-button
                >
                <el-alert
                  v-if="isECouponGoods"
                  class="e-coupon-after-sale-notice"
                  type="warning"
                  :closable="false"
                  show-icon
                  :title="eCouponAfterSaleHint()"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from "vue";
import { useRoute, useRouter } from "vue-router";
import { Message } from "@/utils/message";
import { StarFilled } from '@element-plus/icons-vue';
import Promotion from "./Promotion.vue";
import DPlayer from "dplayer";
import storage from "@/plugins/storage.js";
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
  eCouponAfterSaleHint,
  E_COUPON_CART_BUY_NOW,
  E_COUPON_CART_PINTUAN,
  E_COUPON_CART_POINTS,
} from "@/constants/goodsType";

defineOptions({ name: "ShowGoods" });

const props = defineProps({
  // 商品数据
  detail: {
    type: Object,
    default: null,
  },
});

const emit = defineEmits(["handleClickSku"]);

const route = useRoute();
const router = useRouter();

const count = ref(1); // 商品数量
const mediaIndex = ref(0); // 展示媒体下标（相册图片/视频）
const currentSelceted = ref([]); // 当前商品sku
const mediaList = ref([]); // 媒体列表：视频项在前，其后为图片字符串
let dp = null; // DPlayer 实例，有视频时进页即创建（静音自动播放）
const skuDetail = ref({
  specList: [],
}); // sku详情
const goodsSpecList = ref(props.detail.specs); // 商品spec
const promotionMap = ref(createEmptyPromotionMap());
const formatList = ref([]); // 选择商品品类的数组
const loading = ref(false); // 立即购买loading
const loading1 = ref(false); // 加入购物车loading
const loadingPintuan = ref(false);
const isCollected = ref(false); // 是否收藏
const skuList = ref([]); // formatSku 中赋值（原 data 未声明）

// startCheckout 通过字符串 key 操作对应 loading
const loadings = { loading, loading1, loadingPintuan };

const currentMedia = computed(() => mediaList.value[mediaIndex.value] || null);
const isCurrentVideo = computed(() => currentMedia.value?.type === "video");
const hasVideo = computed(() =>
  mediaList.value.some((item) => item.type === "video")
);
// 视频两侧用封面的高斯模糊填充，避免竖视频出现黑边
const videoBgStyle = computed(() => {
  const video = mediaList.value.find((item) => item.type === "video");
  return video && video.poster
    ? { backgroundImage: `url("${video.poster}")` }
    : {};
});

const currentImg = computed(() => {
  const item = currentMedia.value;
  if (!item) return "";
  return item.type === "video" ? item.poster : item.url || item;
});

/** 是否包含有效促销/优惠（优惠券、满减/满折/满赠、拼团） */
const hasPromotions = computed(() => {
  const hasCoupon = Array.isArray(promotionMap.value?.COUPON) && promotionMap.value.COUPON.length > 0;
  const hasFullDiscount = !!promotionMap.value?.FULL_DISCOUNT;
  const hasPintuan = !!promotionMap.value?.PINTUAN;
  return hasCoupon || hasFullDiscount || hasPintuan;
});


/** 卡密商品：禁加购，仅立即购买；库存读 quantity（M-02 起支持促销） */
const isECouponGoods = computed(() => {
  return isECoupon(skuDetail.value.goodsType);
});

const displayStock = computed(() => {
  if (isECouponGoods.value) {
    return getECouponStock(skuDetail.value);
  }
  return Number(skuDetail.value.quantity) || 0;
});

const quantityMax = computed(() => {
  if (isECouponGoods.value) {
    return getECouponMaxBuyNum(skuDetail.value);
  }
  const qty = Number(skuDetail.value.quantity) || 0;
  return qty > 0 ? qty : 1;
});

const isOutOfStock = computed(() => {
  if (isECouponGoods.value) {
    return getECouponStock(skuDetail.value) <= 0;
  }
  return (Number(skuDetail.value.quantity) || 0) <= 0;
});

watch(
  () => props.detail,
  (val) => {
    skuDetail.value = val.data;
    syncCountWithQuantity();
    promotion();
    swiperGoodsImg();
  },
  { deep: true, immediate: true }
);

// 天猫/淘宝风格：进页即在相册首位静音循环播放，用户可通过控制条开声音
function initVideoPlayer() {
  const video = mediaList.value[0];
  if (!video || video.type !== "video") return;
  nextTick(() => {
    if (dp) return;
    dp = new DPlayer({
      container: document.getElementById("goodsVideoPlayer"),
      autoplay: true,
      loop: true,
      muted: true,
      video: {
        url: video.url,
        pic: video.poster,
      },
    });
  });
}

// 悬停切换相册项：离开视频时暂停，回到视频时续播
function switchMedia(index) {
  if (index === mediaIndex.value) return;
  const leavingVideo = isCurrentVideo.value;
  mediaIndex.value = index;
  if (leavingVideo && dp) {
    dp.pause();
  } else if (isCurrentVideo.value && dp) {
    dp.play();
  }
}

// 缩略图：视频用封面，图片兼容字符串与 { url } 两种形态
function mediaThumb(item) {
  return item.type === "video" ? item.poster : item.url || item;
}

function destroyVideo() {
  if (dp) {
    dp.destroy();
    dp = null;
  }
}

function syncCountWithQuantity() {
  const qty = isECouponGoods.value
    ? getECouponStock(skuDetail.value)
    : Number(skuDetail.value.quantity) || 0;
  if (qty <= 0) {
    count.value = 1;
    return;
  }
  const max = isECouponGoods.value ? getECouponMaxBuyNum(skuDetail.value) : qty;
  if (count.value > max) {
    count.value = max;
  } else if (count.value < 1) {
    count.value = 1;
  }
}

function changeCount(val) {}

function select(index, value) {
  // 选择规格
  currentSelceted.value[index] = value;
  let selectedSkuId = goodsSpecList.value.find((i) => {
    let matched = true;
    let specValues = i.specValues.filter((j) => j.specName !== "images");
    for (let n = 0; n < specValues.length; n++) {
      if (specValues[n].specValue !== currentSelceted.value[n]) {
        matched = false;
        return;
      }
    }
    if (matched) {
      return i;
    }
  });
  emit("handleClickSku", {
    skuId: selectedSkuId.skuId,
    goodsId: skuDetail.value.goodsId,
  });
}

function addShoppingCartBtn() {
  // FR-B-01：E_COUPON 禁止加购物车（后端亦返回 CARD_KEY_E_COUPON_CART_FORBIDDEN）
  if (isECouponGoods.value) {
    Message.warning("电子卡券请使用立即购买");
    return;
  }
  // 添加购物车
  const params = {
    num: count.value,
    skuId: skuDetail.value.id,
  };
  loading.value = true;
  addCartGoods(params)
    .then((res) => {
      loading.value = false;
      if (res.success) {
        router.push({
          path: "/shoppingCart",
          query: {
            skuId: skuDetail.value.id,
            goodsId: skuDetail.value.goodsId,
            thumbnail: skuDetail.value.thumbnail,
            goodsName: skuDetail.value.goodsName,
            count: count.value,
          },
        });
      } else {
        Message.warning(res.message);
      }
    })
    .catch(() => {
      loading.value = false;
    });
}

function buyNow() {
  startCheckout(E_COUPON_CART_BUY_NOW, "loading1");
}

function pintuanBuy() {
  startCheckout(E_COUPON_CART_PINTUAN, "loadingPintuan");
}

function pointPay() {
  startCheckout(E_COUPON_CART_POINTS, "loading");
}

function getFullDiscountTag(fd) {
  if (!fd) return "满优惠";
  if (fd.activityType === "FULL_RATE") return "满折";
  if (fd.activityType === "FULL_GIFT") return "满赠";
  if (fd.activityType === "FULL_MINUS") return "满减";
  if (fd.fullRateFlag) return "满折";
  if (fd.giftFlag) return "满赠";
  return "满减";
}

function formatFullDiscountDesc(fd) {
  if (!fd) return "";
  let rules = fd.ruleList;
  if (!rules && fd.rulesJson) {
    try {
      rules = JSON.parse(fd.rulesJson);
    } catch (e) {
      rules = null;
    }
  }
  if (Array.isArray(rules) && rules.length > 0) {
    return rules
      .map((rule) => {
        if (fd.activityType === "FULL_RATE") {
          return `满${rule.fullMoney}元打${rule.fullRate}折`;
        }
        if (fd.activityType === "FULL_GIFT") {
          const gifts = Array.isArray(rule.giftItems)
            ? rule.giftItems
                .map((g) => `${g.goodsName || "赠品"}x${g.num || 1}`)
                .join("、")
            : "赠品";
          return `满${rule.fullMoney}元送${gifts}`;
        }
        return `满${rule.fullMoney}元减${rule.fullMinus}元`;
      })
      .join("；");
  }
  if (fd.fullMinusFlag && fd.fullMinus) {
    return `满${fd.fullMoney}元，立减现金${fd.fullMinus}元`;
  }
  if (fd.fullRateFlag && fd.fullRate) {
    return `满${fd.fullMoney}元，立享${fd.fullRate}折`;
  }
  return fd.title || "";
}

function startCheckout(action, loadingKey) {
  const params = {
    num: count.value,
    skuId: skuDetail.value.id,
    cartType: "BUY_NOW",
  };
  if (skuDetail.value.goodsType === "VIRTUAL_GOODS") {
    params.cartType = "VIRTUAL";
  } else if (isECouponGoods.value) {
    params.cartType = resolveECouponCartType({
      routeWay: route.query.way,
      action,
    });
  }
  loadings[loadingKey].value = true;
  addCartGoods(params)
    .then((res) => {
      loadings[loadingKey].value = false;
      if (res.success) {
        router.push({
          path: "/pay",
          query: { way: params.cartType },
        });
      } else {
        Message.warning(res.message);
      }
    })
    .catch(() => {
      loadings[loadingKey].value = false;
    });
}

async function collect() {
  if (!storage.getItem("accessToken") || !storage.getItem("userInfo")) {
    router.push({
      path: "/login",
      query: {
        rePath: route.path,
        query: JSON.stringify(route.query || {}),
      },
    });
    return;
  }
  // 收藏商品
  if (isCollected.value) {
    let cancel = await cancelCollect("GOODS", skuDetail.value.id);
    if (cancel.success) {
      Message.success("取消收藏成功");
      isCollected.value = false;
    }
  } else {
    let collect = await collectGoods("GOODS", skuDetail.value.id);
    if (collect.code === 200) {
      isCollected.value = true;
      Message.success("收藏商品成功,可以前往个人中心我的收藏查看");
    }
  }
}

// 格式化数据
function formatSku(list) {
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
  formatList.value = arr;

  let cur = list.filter((i) => i.skuId === route.query.skuId)[0];
  if (cur) {
    cur.specValues
      .filter((i) => i.specName !== "images")
      .forEach((value, _index) => {
        currentSelceted.value[_index] = value.specValue;
      });
  }
  skuList.value = list;
}

function handleReceiveCoupon(id) {
  // 领取优惠券
  receiveCoupon(id).then((res) => {
    if (res.success) {
      Message.success("优惠券领取成功");
    } else {
      Message.warning(res.message);
    }
  });
}

function promotion() {
  promotionMap.value = createEmptyPromotionMap();
  if (!props.detail || !props.detail.promotionMap) return false;
  const keysArr = Object.keys(props.detail.promotionMap);
  if (keysArr.length === 0) return false;

  for (let i = 0; i < keysArr.length; i++) {
    const key = keysArr[i].split("-")[0];
    if (key === "COUPON") {
      if (!Array.isArray(promotionMap.value.COUPON)) {
        promotionMap.value.COUPON = [];
      }
      promotionMap.value.COUPON.push(props.detail.promotionMap[keysArr[i]]);
    } else if (Object.prototype.hasOwnProperty.call(promotionMap.value, key)) {
      promotionMap.value[key] = props.detail.promotionMap[keysArr[i]];
    } else {
      promotionMap.value[key] = props.detail.promotionMap[keysArr[i]];
    }
  }
}

// 相册里会混进规格 JSON，只留图片地址；没有相册时用主图。有视频时视频排在相册第一项
function swiperGoodsImg() {
  destroyVideo();
  mediaIndex.value = 0;
  const source = skuDetail.value.goodsGalleryList || [];
  const gallery = Array.from(source).filter((item) => {
    if (typeof item !== "string") return false;
    return item.indexOf('"url":') === -1 && item.indexOf('"status":') === -1;
  });
  const images = gallery.length
    ? gallery
    : skuDetail.value.original
      ? [skuDetail.value.original]
      : [];
  mediaList.value = [...images];
  if (skuDetail.value.goodsVideo) {
    mediaList.value.unshift({
      type: "video",
      url: skuDetail.value.goodsVideo,
      poster: images[0] || "",
    });
    initVideoPlayer();
  }
}

onMounted(() => {
  // 用户登录才会判断是否收藏（须同时有 token，避免残留 userInfo 触发 401 跳转登录）
  if (storage.getItem("accessToken") && storage.getItem("userInfo")) {
    isCollection("GOODS", skuDetail.value.id).then((res) => {
      if (res.success && res.result) {
        isCollected.value = true;
      }
    }).catch(() => {
      // 收藏状态为可选数据，失败时静默
    });
  }

  formatSku(goodsSpecList.value);
  // promotion();
  document.title = skuDetail.value.goodsName;
});

onBeforeUnmount(() => {
  destroyVideo();
});
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
  padding: 24px;
  display: flex;
  flex-direction: row;
  background: #fff;
  border-radius: 4px;
  box-sizing: border-box;
}

.item-detail-left {
  width: 500px;
  margin-right: 32px;
  flex-shrink: 0;
}

.item-detail-big-img {
  width: 500px;
  height: 500px;
  border-radius: 16px;
  overflow: hidden;
  margin-bottom: 16px;
  background: #f5f5f5;

  :deep(.el-image),
  :deep(.el-image__inner) {
    width: 100%;
    height: 100%;
  }

  :deep(.el-image__inner) {
    object-fit: cover;
  }
}
.goods-video-wrap {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.goods-video-bg {
  position: absolute;
  inset: 0;
  background-size: cover;
  background-position: center;
  filter: blur(28px) brightness(0.85);
  transform: scale(1.4);
}

.goods-video-player {
  position: relative;
  z-index: 1;
  width: 100%;
  height: 100%;

  /* 播放器默认黑底改为透明，露出毛玻璃背景 */
  :deep(.dplayer),
  :deep(.dplayer-video-wrap) {
    background: transparent;
  }
}

.video-badge {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: transparent;

  img {
    width: 22px;
    height: 22px;
    filter: drop-shadow(0 1px 3px rgba(0, 0, 0, 0.6));
  }
}

.video-thumb {
  width: 100%;
  height: 100%;
  object-fit: cover;
  pointer-events: none;
}

.item-detail-img-row {
  margin-top: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.item-detail-img-small {
  position: relative;
  width: 86px;
  height: 86px;
  border: 2px solid transparent;
  border-radius: 6px;
  overflow: hidden;
  cursor: pointer;
  box-sizing: border-box;
  background: #f5f5f5;

  &.is-active {
    border-color: $theme_color;
  }
}

.item-detail-img-small img {
  height: 100%;
  width: 100%;
  object-fit: cover;
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
  color: #171A26;
  font-weight: 400;
  font-size: 20px;
  line-height: 28px;
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
  font-size: 14px;
  color: $theme_color;
}

/*价格详情等*/
.item-detail-price-row {
  padding: 16px 20px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  background: #fafafa;
  border-radius: 4px;
}

.item-price-left {
  display: flex;
  flex-direction: column;
}

.item-price-title {
  display: inline-block;
  width: 56px;
  margin-right: 12px;
  color: #666;
  font-size: 14px;
  text-align: left;
}

.item-price-row {
  margin: 4px 0;

  > div,
  > p {
    display: flex;
    align-items: center;
    margin: 0;
  }
}

.item-price {
  color: $theme_color;
  font-size: 28px;
  font-weight: 600;
  line-height: 1;
}
.item-price-old {
  color: gray;
  text-decoration: line-through;
  font-size: 14px;
  margin-left: 5px;
}

/* 促销与优惠独立展示模块 */
.goods-promotions-box {
  margin-top: 12px;
  padding: 12px 20px;
  background: #fafafa;
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.promo-item-row {
  display: flex;
  align-items: flex-start;
  line-height: 24px;
}

.promo-title {
  flex-shrink: 0;
  width: 56px;
  margin-right: 12px;
  color: #666;
  font-size: 14px;
  line-height: 24px;
  text-align: left;
}

.promo-content-column {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.promo-activity-entry {
  display: flex;
  align-items: baseline;
  flex-wrap: wrap;
  gap: 8px;
  line-height: 22px;
}

.promo-badge {
  display: inline-block;
  padding: 1px 6px;
  font-size: 12px;
  line-height: 18px;
  color: $theme_color;
  background: rgba(235, 69, 73, 0.08);
  border: 1px solid $theme_color;
  border-radius: 2px;
  white-space: nowrap;
}

.promo-desc {
  font-size: 13px;
  color: #333;
  line-height: 22px;
  word-break: break-all;
}

.promo-price-text {
  color: $theme_color;
  font-weight: 600;
}

.coupon-tags {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
}

.dropdown {
  position: relative;
  display: inline-flex;
  align-items: center;
  cursor: pointer;
  z-index: 999;
}

.dropdown-more {
  font-size: 12px;
  color: #999;
  line-height: 22px;
  white-space: nowrap;

  &:hover {
    color: $theme_color;
  }
}

.dropdown-content {
  display: none;
  position: absolute;
  top: 24px;
  left: 0;
  background-color: #fff;
  min-width: 220px;
  max-width: 320px;
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  padding: 12px;
  flex-wrap: wrap;
  gap: 6px;
}
.dropdown:hover .dropdown-content {
  display: flex;
}

.item-coupon {
  position: relative;
  padding: 2px 10px;
  color: $theme_color;
  font-size: 12px;
  line-height: 18px;
  background-color: #fff;
  border: 1px solid $theme_color;
  border-radius: 3px;
  cursor: pointer;
  transition: background-color 0.2s, color 0.2s;
  white-space: nowrap;

  &:hover {
    background-color: $theme_color;
    color: #fff;
  }
}
.item-promotion {
  margin-right: 5px;
  padding: 3px;
  color: $theme_color;
  font-size: 14px;
  border: 1px solid $theme_color;
}

.item-price-right {
  display: flex;
  align-content: center;
  align-items: center;
}

.item-remarks-sum {
  min-width: 72px;
  text-align: center;
  padding: 0 4px 0 16px;
  border-left: 1px solid #eee;
}

.item-remarks-sum p {
  color: #999;
  font-size: 13px;
  line-height: 20px;
  text-align: center;
  margin: 0;
}

.item-remarks-num {
  line-height: 24px;
  color: #171A26;
  font-size: 16px;
  font-weight: 600;
}

.item-select {
  display: flex;
  flex-direction: row;
  align-items: center;
  margin-top: 15px;
}

.item-spec {
  flex-direction: column;
  align-items: flex-start;
  width: 100%;

  .item-select-title {
    width: auto;
    margin-right: 0;
    margin-bottom: 16px;
  }

  .item-select-column {
    width: 100%;
  }
}

.item-select-title {
  color: #666;
  font-size: 14px;
  margin-right: 16px;
  width: 56px;
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
  min-height: 36px;
  padding: 0 16px;
  margin-right: 8px;
  background: #fff;
  border: 1px solid #e5e5e5;
  border-radius: 4px;
  cursor: pointer;
  color: #171A26;
  box-sizing: border-box;
}

.item-select-box:hover {
  border-color: $theme_color;
  color: $theme_color;
}

.item-select-box-active {
  border-color: $theme_color;
  background: #fff5f4;
  color: $theme_color;
}

.item-select-intro p {
  margin: 0;
  padding: 8px 0;
  font-size: 14px;
  line-height: 20px;
}

.add-buy-car-box {
  width: 100%;
  margin-top: 8px;
  border-top: 1px solid #f0f0f0;
}

.e-coupon-after-sale-notice {
  width: fit-content;
  max-width: 420px;
  flex: 0 0 auto;
  padding: 4px 10px;

  :deep(.el-alert__content) {
    padding: 0;
  }

  :deep(.el-alert__title) {
    font-size: 14px;
    line-height: 1.5;
  }
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
    height: 40px;
    min-width: 140px;
    padding: 0 24px;
    border-radius: 4px;
    font-size: 16px;
    background: #fff !important;
    border: 1px solid $theme_color !important;
    color: $theme_color !important;

    &:hover,
    &:focus {
      background: #fff5f4 !important;
      border-color: $theme_color !important;
      color: $theme_color !important;
    }

    &.is-solid {
      background: $theme_color !important;
      color: #fff !important;

      &:hover,
      &:focus {
        background: $theme_color !important;
        color: #fff !important;
      }
    }

    &.is-disabled,
    &.is-disabled:hover,
    &.is-disabled:focus {
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
  font-size: 14px;
  line-height: 22px;
  color: #999;
  margin-bottom: 12px;
}

.inventory {
  padding-left: 8px;
  color: #666;
  font-size: 15px;
  line-height: 22px;
}
/******************商品图片及购买详情结束******************/
</style>
