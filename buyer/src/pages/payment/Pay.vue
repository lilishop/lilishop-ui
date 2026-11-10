<template>
  <div class="pay-order">
    <BaseHeader></BaseHeader>
    <!-- LOGO 步骤条 -->
    <div class="width_1200 logo">
      <div>
        <router-link to="/"><img :src="logoImg" /></router-link>
        <div>结算页</div>
      </div>
      <div class="cart-steps">
        <span :class="stepIndex == 1 ? 'active' : ''">1.我的购物车</span>
        <i class="icomoon icon-next" :class="stepIndex == 1 ? 'active-arrow' : ''"></i>
        <span :class="stepIndex == 1 ? 'active' : ''">2.填写订单信息</span>
        <i class="icomoon icon-next" :class="stepIndex == 1 ? 'active-arrow' : ''"></i>
        <span :class="stepIndex == 2 ? 'active' : ''">3.成功提交订单</span>
      </div>
    </div>
    <el-divider />
    <div class="content width_1200_auto">
      <!-- 收货地址 -->
      <!-- 收货地址（E_COUPON / VIRTUAL 免地址，见 isVirtualLikeCheckout） -->
      <div class="address" v-if="selectedDeliverMethod === 'LOGISTICS' && !isVirtualLikeCheckout">
        <div class="card-head">
          <span>收货人信息</span>
          <div class="card-head-links">
            <span @click="editAddress('')">新增</span>
            <span @click="goAddressManage">管理</span>
          </div>
        </div>
        <div class="address-manage">
          <div class="address-item" v-show="moreAddr ? true : index < 3"
            :class="selectedAddress.id === item.id ? 'border-red' : ''" @mouseenter="showEditBtn = index"
            @mouseleave="showEditBtn = ''" @click="selectAddress(item)" v-for="(item, index) in addressList"
            :key="index">
            <div>
              <span>{{ item.name }}</span>
              <el-tag class="ml_10 address-default-tag" v-if="item.isDefault" type="danger" effect="dark">默认</el-tag>
              <el-tag
                class="ml_10 address-alias-tag"
                v-if="item.alias"
                type="warning"
                effect="dark"
              >{{ item.alias }}
              </el-tag>
            </div>
            <div>{{ item.mobile }}</div>
            <div>
              {{ $filters.unitAddress(item.consigneeAddressPath) }} {{ item.detail }}
            </div>
            <div class="edit-btn" v-show="showEditBtn === index">
              <span @click.stop="editAddress(item.id)">修改</span>
              <span class="ml_10" v-if="!item.isDefault" @click.stop="delAddress(item)">删除</span>
            </div>
            <div class="corner-icon" v-show="selectedAddress.id === item.id">
              <div></div>
              <el-icon><Check /></el-icon>
            </div>
          </div>
        </div>
        <div class="more-addr" @click="moreAddr = !moreAddr" v-if="addressList.length > 3">
          {{ moreAddr ? "收起地址" : "更多地址" }}
          <el-icon v-show="!moreAddr"><ArrowDown /></el-icon>
          <el-icon v-show="moreAddr"><ArrowUp /></el-icon>
        </div>
      </div>

      <div class="address" v-if="selectedDeliverMethod === 'SELF_PICK_UP'">
        <div class="card-head">
          <span>自提点信息</span>
        </div>
        <div class="address-manage">
          <div class="address-item" v-show="storeMoreAddr ? true : index < 3"
            :class="selectedAddress.id === item.id ? 'border-red' : ''" @mouseenter="showEditBtn = index"
            @mouseleave="showEditBtn = ''" @click="selectStoreAddress(item)" v-for="(item, index) in storeAddressList"
            :key="index">
            <div>
              <span>{{ item.addressName }}</span>
            </div>
            <div>{{ item.mobile }}</div>
            <div>
              {{ $filters.unitAddress(item.address) }} {{ item.detail }}
            </div>
            <div class="corner-icon" v-show="selectedStoreAddress.id === item.id">
              <div></div>
              <el-icon><Check /></el-icon>
            </div>
          </div>
        </div>
        <div class="more-addr" @click="storeMoreAddr = !storeMoreAddr" v-if="storeAddressList.length > 3">
          {{ storeMoreAddr ? "收起地址" : "更多地址" }}
          <el-icon v-show="!storeMoreAddr"><ArrowDown /></el-icon>
          <el-icon v-show="storeMoreAddr"><ArrowUp /></el-icon>
        </div>
      </div>
      <div>
      </div>
      <div class="goods-content" v-if="!isVirtualLikeCheckout">
        <div class="card-head mt_20 mb_20">
          <span>配送方式</span>
        </div>
        <div class="delivery-method">

          <div class="method-item" v-show="moreAddr ? true : index < 3"
            :class="selectedDeliverMethod === item.value ? 'border-red' : ''" @mouseenter="showEditBtn = item.value"
            @mouseleave="showEditBtn = ''" @click="selectDeliverMethod(item)" v-for="(item, index) in shippingMethod"
            :key="index">
            <div>{{ item.label }}</div>
            <div class="corner-icon" v-show="selectedDeliverMethod === item.value">
              <div></div>
              <el-icon><Check /></el-icon>
            </div>
          </div>
        </div>
      </div>
      <!-- 商品信息 -->
      <div class="goods-content">
        <div class="card-head mt_20 mb_20">
          <span>商品信息</span>
          <span @click="$router.push('/cart')">返回购物车</span>
        </div>
        <div class="goods-msg" v-for="(shop, shopIndex) in goodsList" :key="shopIndex">
          <div v-if="shop.checked">
            <div class="shop-name">
              <span>
                <span class="hover-color" @click="goShopPage(shop.storeId)">{{
                    shop.storeName
                }}</span>&nbsp;&nbsp;
              </span>
            </div>
            <div class="goods-head">
              <span>商品</span>
              <span>单价</span>
              <span>数量</span>
              <span>库存</span>
              <span>小计</span>
            </div>
            <div class="goods-list">
              <div class="goods-item" v-for="(goods, goodsIndex) in shop.checkedSkuList" :key="goodsIndex">
                <span class="goods-main hover-color" @click="
                  goGoodsDetail(goods.goodsSku?.id, goods.goodsSku?.goodsId)
                ">
                  <img :src="goods.goodsSku?.thumbnail" alt="" />
                  <span class="goods-name">{{ goods.goodsSku?.goodsName }}</span>
                </span>
                <span class="goods-price">{{ $filters.unitPrice(goods.purchasePrice, "￥") }}</span>
                <span>{{ goods.num }}</span>
                <span>{{ goods.goodsSku?.quantity > 0 ? "有货" : "无货" }}</span>
                <span class="goods-price">{{ $filters.unitPrice(goods.subTotal, "￥") }}</span>
              </div>
              <!-- 随单实物赠品行 -->
              <div
                class="goods-item gift-item"
                v-for="(gift, giftIndex) in getShopGifts(shop)"
                :key="'gift-' + (gift.skuId || giftIndex)"
              >
                <span class="goods-main hover-color" @click="goGoodsDetail(gift.skuId, gift.goodsId)">
                  <img :src="gift.thumbnail || gift.image" alt="" />
                  <span class="goods-name">
                    <el-tag size="small" type="danger" effect="plain" class="mr_5">赠品</el-tag>
                    {{ gift.goodsName || gift.name || '随单实物赠品' }}
                  </span>
                </span>
                <span class="goods-price gift-zero-price">¥0.00</span>
                <span>{{ gift.num || 1 }}</span>
                <span>有货</span>
                <span class="goods-price gift-zero-price">¥0.00</span>
              </div>
            </div>
            <div class="order-mark">
              <div v-if="isRemarkOpen(shop)" class="mark-field">
                <el-input
                  :ref="remarkInputRef(shop)"
                  v-model="shop.remark"
                  maxlength="60"
                  show-word-limit
                  placeholder="选填，请先和商家协商一致"
                  @blur="closeRemark(shop)"
                />
                <span class="mark-tip">请勿填写有关支付、收货、发票方面的信息</span>
              </div>
              <button v-else-if="shop.remark" type="button" class="mark-link" @click="openRemark(shop)">
                <span class="mark-label">订单备注</span>
                <span class="mark-text">{{ shop.remark }}</span>
              </button>
              <button v-else type="button" class="mark-link" @click="openRemark(shop)">添加订单备注</button>
            </div>
          </div>
        </div>
      </div>
      <!-- 发票信息（E_COUPON 虚拟型结算不开发票） -->
      <div class="invoice" v-if="!isECouponCheckout">
        <div class="card-head mt_20 mb_20">
          <span>发票信息</span>
        </div>
        <div class="inovice-content">
          <template v-if="hasInvoiceInfo">
            <span>{{ invoiceDisplayTitle }}</span>
            <span>{{ invoiceData.receiptContent }}</span>
          </template>
          <span v-else>不开发票</span>
          <span @click="editInvoice">编辑</span>
        </div>
      </div>
      <!-- 优惠券 -->
      <div class="invoice">
        <div class="card-head mt_20 mb_20">
          <span class="relative">优惠券</span>
        </div>
        <div v-if="couponList.length === 0" class="pay-empty">无可用优惠券</div>
        <ul v-else class="pay-coupon-list">
          <li
            v-for="(item, index) in couponList"
            class="pay-coupon"
            :class="{ 'is-used': usedCouponId.includes(item.id) }"
            :key="index"
            @click="useCoupon(item.id, !usedCouponId.includes(item.id))"
          >
            <div class="pay-coupon-price">
              <template v-if="item.couponType === 'PRICE'">￥{{ $filters.unitPrice(item.price) }}</template>
              <template v-else>{{ item.discount }}折</template>
            </div>
            <div class="pay-coupon-info">
              <p>{{ item.consumeThreshold > 0 ? '满' + item.consumeThreshold + '元可用' : '无门槛使用' }}</p>
              <p>使用范围：{{ useScope(item.scopeType, item.storeName) }}</p>
              <p>有效期：{{ item.endTime }}</p>
            </div>
          </li>
        </ul>
      </div>
      <!-- 礼品卡 -->
      <div class="invoice">
        <div class="card-head mt_20 mb_20">
          <span>
            礼品卡
            <span class="pay-gcc-deduct">
              (已抵扣 <span class="pay-gcc-deduct-num">{{ $filters.unitPrice(giftCardDeductAmount, "¥") }}</span>)
            </span>
          </span>
          <a href="javascript:void(0)" class="pay-gcc-help" @click.prevent="giftCardNoticeModal = true">
            使用说明 <el-icon><Help /></el-icon>
          </a>
        </div>
        <div class="pay-gcc-body">
          <div class="pay-gcc-panel">
            <div class="pay-gcc-grid-wrap">
              <div v-if="giftCardList.length === 0" class="pay-gcc-empty">暂无可用礼品卡</div>
              <div v-else class="pay-gcc-cards">
                <div
                  v-for="(item, index) in giftCardList"
                  :key="item.id || index"
                  class="pay-gcc-item"
                  :class="{ 'is-selected': isGiftCardSelected(item) }"
                  @click="toggleGiftCard(item)"
                >
                  <div class="pay-gcc-item-inner">
                    <div class="pay-gcc-pattern" aria-hidden="true" />
                    <div class="pay-gcc-item-main">
                      <div class="pay-gcc-top-row">
                        <div class="pay-gcc-left">
                          <div class="pay-gcc-name">{{ item.giftCardName || "礼品卡" }}</div>
                          <div class="pay-gcc-face">面值{{ formatGiftFaceValue(item.faceValue) }}元</div>
                        </div>
                        <div class="pay-gcc-right-meta">
                          <div class="pay-gcc-type">现金卡</div>
                          <div class="pay-gcc-valid">{{ formatGiftExpire(item) }}</div>
                        </div>
                      </div>
                      <div class="pay-gcc-balance-row">
                        <span class="pay-gcc-amt">¥{{ item.balance != null ? $filters.unitPrice(item.balance) : "0.00" }}</span>
                        <span class="pay-gcc-bal-label">余额</span>
                      </div>
                      <div class="pay-gcc-no">{{ item.cardNo }}</div>
                    </div>
                  </div>
                  <div v-if="isGiftCardSelected(item)" class="pay-gcc-corner">
                    <el-icon><Check /></el-icon>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <!-- 订单价格 -->
      <div class="order-price">
        <div>
          <span>{{ totalNum }}件商品，总商品金额：</span><span>{{ $filters.unitPrice(priceDetailDTO.goodsPrice, "￥") }}</span>
        </div>
        <div v-if="priceDetailDTO.freightPrice > 0">
          <span>运费：</span><span>{{ $filters.unitPrice(priceDetailDTO.freightPrice, "￥") }}</span>
        </div>
        <div v-if="priceDetailDTO.discountPrice > 0">
          <span>优惠金额：</span><span>-{{ $filters.unitPrice(priceDetailDTO.discountPrice, "￥") }}</span>
        </div>
        <div v-if="priceDetailDTO.couponPrice > 0">
          <span>优惠券金额：</span><span>-{{ $filters.unitPrice(priceDetailDTO.couponPrice, "￥") }}</span>
        </div>
        <div v-if="giftCardDeductAmount > 0">
          <span>礼品卡抵扣：</span><span>-{{ $filters.unitPrice(giftCardDeductAmount, "￥") }}</span>
        </div>

        <div v-if="$route.query.way === 'POINTS'">
          <span>应付积分：</span><span class="actrual-price">{{ priceDetailDTO.payPoint }}</span>
        </div>
        <div v-else>
          <span>应付金额：</span><span class="actrual-price">{{ $filters.unitPrice(priceDetailDTO.flowPrice, "￥") }}</span>
        </div>
      </div>
      <!-- 底部支付栏 -->
      <div class="order-footer">
        <div class="pay ml_20" @click="pay">提交订单</div>
        <div class="pay-address" v-if="!isVirtualLikeCheckout && addressList.length && selectedDeliverMethod === 'LOGISTICS'">
          配送至：{{ $filters.unitAddress(selectedAddress.consigneeAddressPath) }}
          {{ selectedAddress.detail }}&nbsp;&nbsp;收货人：{{
              selectedAddress.name
          }}&nbsp;&nbsp;{{ selectedAddress.mobile }}
        </div>
        <div class="pay-address" v-if="!isVirtualLikeCheckout && addressList.length && selectedDeliverMethod === 'SELF_PICK_UP'">
          自提地点：{{selectedStoreAddress.address}} &nbsp;&nbsp;联系方式：{{ selectedStoreAddress.mobile }}
        </div>
      </div>
    </div>
    <BaseFooter></BaseFooter>
    <!-- 添加发票模态框 -->
    <invoice-modal ref="invModal" :invoiceData="invoiceData" @change="getInvMsg" />
    <!-- 选择地址模态框 -->
    <address-manage ref="address" :id="addrId" @change="addrChange"></address-manage>
    <el-dialog v-model="giftCardNoticeModal" title="礼品卡使用说明" width="520">
      <p class="pay-gcc-notice-p">
        请在礼品卡有效期内使用；结算时勾选礼品卡即可按规则抵扣订单金额，可与优惠券等活动叠加规则以平台说明为准。放弃勾选或取消抵扣将恢复对应余额。
      </p>
      <div class="pay-gcc-notice-foot">
        <el-button type="primary" @click="giftCardNoticeModal = false">我知道了</el-button>
      </div></el-dialog>
  </div>
</template>

<script setup>
import { computed, getCurrentInstance, nextTick, onMounted, reactive, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { Message, Modal, Spin } from "@/utils/message";
import { ArrowDown, ArrowUp, Check, Help } from '@element-plus/icons-vue';
import invoiceModal from "@/components/invoiceModal";
import addressManage from "@/components/addressManage";
import { memberAddress, delMemberAddress } from "@/api/address";
import {
  cartGoodsPay,
  createTrade,
  selectAddr,
  selectCoupon,
  selectGiftCard,
  setShipMethod,
  setStoreAddressId,
  shippingMethodList,
  couponNum,
} from "@/api/cart";
import { getStoreAddress } from "@/api/shopentry.js"
import { canUseCouponList } from "@/api/member.js";
import { isECoupon, shouldSkipPaymentPage } from "@/constants/goodsType";
import { useAppStore } from "@/stores/app";

defineOptions({ name: "Pay" });

const route = useRoute();
const router = useRouter();
const appStore = useAppStore();
const instance = getCurrentInstance();

const logoImg = computed(() => appStore.logoImg);

const invModal = ref(null);
const address = ref(null);

const selectedStoreAddress = ref('m');
const selectMethod = ref('');
const stepIndex = ref(1); // 顶部步骤条状态
const invoiceAvailable = ref(false); // 发票编辑按钮
const showEditBtn = ref(""); // 鼠标移入显示编辑按钮
const orderMark = ref(""); // 订单备注
const remarkEditing = ref({}); // 正在填写备注的店铺
const goodsType = ref(""); // 商品类型
const storeMoreAddr = ref(false);
const invoiceData = ref({
  // 发票数据
  //receiptContent: "不开发票",
});
const searchForm = reactive({
  pageNumber: 1,
  pageSize: 100
});
const shippingMethod = ref([]);
const storeAddressList = ref([]);
const shippingWay = [
  {
    value: "LOGISTICS",
    label: "物流",
  },
  {
    value: "SELF_PICK_UP",
    label: "自提",
  },
];
const selectedDeliverMethod = ref('LOGISTICS');
const addressList = ref([]); // 地址列表
const selectedAddress = ref({}); // 所选地址
const goodsList = ref([]); // 商品列表
const skuList = ref([]); // 商品sku列表
const priceDetailDTO = ref({}); // 商品价格
const totalNum = ref(0); // 购买数量
const addrId = ref(""); // 编辑地址传入的id
const moreAddr = ref(false); // 更多地址
const canUseCouponNum = ref(0); // 可用优惠券数量
const couponList = ref([]); // 可用优惠券列表
const usedCouponId = ref([]); // 已使用优惠券id
const selectedCoupon = ref({}); // 已选优惠券对象
const storeId = ref(''); //店铺Id
const giftCardList = ref([]); // TradeDTO.canUseGiftCards
const giftCardNoticeModal = ref(false);
const giftCardDeductItems = ref([]); // 已选礼品卡抵扣明细（TradeDTO.giftCardDeductItems）
const tradeGiftCardDeductTotal = ref(null); // TradeDTO.giftCardDeductTotal
const selectedGiftCardCredentialIds = ref([]); // 已选凭证 id，与 deductItems 同步
// 各店铺备注输入框组件实例，key 为 remarkKey(shop)
const remarkInputRefs = {};

const hasInvoiceInfo = computed(() => {
  const title =
    invoiceData.value.personalName ||
    invoiceData.value.companyName ||
    invoiceData.value.receiptTitle;
  const content = invoiceData.value.receiptContent;
  if (content && String(content).trim() === "不开发票") return false;
  return Boolean(
    (title && String(title).trim()) ||
    (content && String(content).trim())
  );
});
const invoiceDisplayTitle = computed(() => {
  return (
    invoiceData.value.personalName ||
    invoiceData.value.companyName ||
    invoiceData.value.receiptTitle ||
    ""
  );
});
const giftCardDeductAmount = computed(() => {
  if (tradeGiftCardDeductTotal.value != null && Number(tradeGiftCardDeductTotal.value) > 0) {
    return Number(tradeGiftCardDeductTotal.value);
  }
  const items = giftCardDeductItems.value || [];
  let sum = 0;
  items.forEach((it) => {
    sum += Number(it.deductAmount || 0);
  });
  if (sum > 0) {
    return sum;
  }
  const p = priceDetailDTO.value || {};
  const n = Number(
    p.giftCardPrice != null
      ? p.giftCardPrice
      : p.giftCardDiscountPrice != null
        ? p.giftCardDiscountPrice
        : p.memberCardPrice != null
          ? p.memberCardPrice
          : 0
  );
  return Number.isFinite(n) ? n : 0;
});
/** 电子卡券结算：免地址、隐藏发票；优惠券/礼品卡/促销明细可用（M-02） */
const isECouponCheckout = computed(() => {
  return isECoupon(goodsType.value);
});
/** 虚拟型结算（核销虚拟 + 电子卡券）：均不需要收货地址 */
const isVirtualLikeCheckout = computed(() => {
  return goodsType.value === "VIRTUAL_GOODS" || isECouponCheckout.value;
});

onMounted(() => {
  init();
});

// 初始化数据
function init() {
  getGoodsDetail();
  getDistribution();
}
function goAddressManage() {
  // 跳转地址管理页面
  router.push("/home/MyAddress");
}
function getAddress() {
  // 获取收货地址列表
  memberAddress(searchForm).then((res) => {
    if (res.success) {
      addressList.value = res.result?.records || [];
      addressList.value.forEach((e, index) => {
        if (e.id === selectedAddress.value.id && index > 2) {
          moreAddr.value = true;
        }
      });
    }
  }).catch((err) => {
    // 网络/登录异常已由 request 层统一提示，地址列表保持为空，可正常新增地址
    console.warn("获取收货地址列表失败", err);
  });
}
// 获取配送方式列表
async function getDistribution() {
  try {
    let shopRes = await shippingMethodList({ way: route.query.way });
    let shopList;
    if (shopRes.success) {
      shopList = shopRes.result || [];
      let way = [];
      shippingWay.forEach((item) => {
        shopList.forEach((child) => {
          if (item.value == child) {
            way.push(item);
          }
        });
      });
      shippingMethod.value = way;
    }
  } catch (err) {
    // 网络/登录异常已由 request 层统一提示，配送方式保持为空不影响页面其余模块
    console.warn("获取配送方式列表失败", err);
  }
}

async function getStoreAddressList() {
  getStoreAddress(storeId.value, searchForm).then(res => {
    if (res.success) {
      storeAddressList.value = res.result?.records || []
      storeAddressList.value.forEach((e, index) => {
        if (e.id === selectedAddress.value.id && index > 2) {
          storeMoreAddr.value = true;
        }
      });
    }
  }).catch((err) => {
    // 网络/登录异常已由 request 层统一提示，自提点列表保持为空
    console.warn("获取自提点列表失败", err);
  })
}
function getGoodsDetail() {
  // 订单商品详情
  Spin.show();
  cartGoodsPay({ way: route.query.way })
    .then((res) => {
      Spin.hide();
      if (res.success) {
        const result = res.result || {};
        if (
          !result.checkedSkuList ||
          result.checkedSkuList.length === 0
        ) {
          const firstSku = result.skuList?.[0];
          if (firstSku) {
            Modal.warning({
              title: "购物车存在无效商品！",
              content:
                "[" +
                (firstSku.goodsSku?.goodsName || "") +
                "]" +
                (firstSku.errorMessage || ""),
            });
          }
          router.push({
            path: "/cart",
            replace: true,
          });
          return;
        }
        goodsList.value = result.cartList || [];
        priceDetailDTO.value = result.priceDetailDTO || {};
        skuList.value = result.skuList || [];
        if (skuList.value[0]?.goodsSku) {
          goodsType.value = skuList.value[0].goodsSku.goodsType;
        }
        storeId.value = goodsList.value[0]?.storeId || ''
        if (result.receiptVO) {
          invoiceData.value = result.receiptVO;
        }
        let notSupArea = result.notSupportFreight;
        selectedCoupon.value = {};
        const platformCouponId = result.platformCoupon?.memberCoupon?.id;
        if (platformCouponId)
          selectedCoupon.value[platformCouponId] = result.platformCoupon;
        if (
          result.storeCoupons &&
          Object.keys(result.storeCoupons)[0]
        ) {
          let storeMemberCouponsId = Object.keys(
            result.storeCoupons
          )[0];
          let storeCouponId =
            result.storeCoupons[storeMemberCouponsId]?.memberCoupon?.id;
          if (storeCouponId)
            selectedCoupon.value[storeCouponId] =
              result.storeCoupons[storeMemberCouponsId];
        }
        if (notSupArea) {
          let content = [];
          let title = "";
          notSupArea.forEach((e) => {
            title = e.errorMessage;
            content.push(e.goodsSku?.goodsName || "");
          });
          Modal.warning({
            title: "以下商品超出配送区域" || title,
            content: content.toString(),
          });
        }
        if (result.memberAddress) {
          selectedAddress.value = result.memberAddress;
        }
        getAddress();
        getStoreAddressList();
        totalNum.value = 0;
        for (let i = 0; i < skuList.value.length; i++) {
          totalNum.value += skuList.value[i].num || 0;
        }
        usedCouponId.value = [];
        couponList.value = result.canUseCoupons || [];
        const couponKeys = Object.keys(selectedCoupon.value);
        if (couponKeys.length) {
          couponList.value.forEach((e) => {
            if (
              selectedCoupon.value[e.id] &&
              e.id === selectedCoupon.value[e.id]?.memberCoupon?.id
            ) {
              usedCouponId.value.push(e.id);
            }
          });
          nextTick(() => {
            instance.proxy.$forceUpdate();
          });
        }
        giftCardDeductItems.value = Array.isArray(result.giftCardDeductItems)
          ? result.giftCardDeductItems
          : [];
        tradeGiftCardDeductTotal.value =
          result.giftCardDeductTotal != null && result.giftCardDeductTotal !== ""
            ? Number(result.giftCardDeductTotal)
            : null;
        giftCardList.value = Array.isArray(result.canUseGiftCards) ? result.canUseGiftCards : [];
        syncGiftCardSelectionFromCart(result);
      }
    })
    .catch((err) => {
      Spin.hide();
      // 网络/登录异常已由 request 层统一提示；这里兜底 404 与返回数据结构异常
      if (!err?.data || err?.data?.message) {
        Message.error(err?.data?.message || "结算数据加载失败，请稍后重试");
      }
      console.warn("获取结算数据失败", err);
    });
}
function syncGiftCardSelectionFromCart(result) {
  if (!result) {
    selectedGiftCardCredentialIds.value = [];
    return;
  }
  const selectedIds = result.selectedGiftCardIds;
  if (Array.isArray(selectedIds) && selectedIds.length) {
    selectedGiftCardCredentialIds.value = selectedIds
      .map((id) => (id != null && id !== "" ? String(id) : ""))
      .filter(Boolean);
    return;
  }
  const items = Array.isArray(result.giftCardDeductItems) ? result.giftCardDeductItems : [];
  if (items.length) {
    selectedGiftCardCredentialIds.value = items
      .map((it) => (it.credentialId != null && it.credentialId !== "" ? String(it.credentialId) : ""))
      .filter(Boolean);
    return;
  }
  const pd = result.priceDetailDTO || {};
  const id =
    result.selectedGiftCardCredentialId ||
    result.usedGiftCardCredentialId ||
    pd.selectedGiftCardCredentialId ||
    pd.usedGiftCardCredentialId ||
    (result.selectedGiftCard && (result.selectedGiftCard.id || result.selectedGiftCard.credentialId)) ||
    (result.giftCardCashSelected && result.giftCardCashSelected.id) ||
    null;
  selectedGiftCardCredentialIds.value =
    id != null && id !== "" ? [String(id)] : [];
}
function formatGiftFaceValue(val) {
  if (val == null || val === "") {
    return "—";
  }
  const n = Number(val);
  if (Number.isNaN(n)) {
    return String(val);
  }
  return Number.isInteger(n) ? String(n) : n.toFixed(2).replace(/\.?0+$/, "");
}
function formatGiftExpire(row) {
  const t = row && row.expireTime;
  if (!t) {
    return "长期有效";
  }
  const d = new Date(t);
  if (Number.isNaN(d.getTime())) {
    return "长期有效";
  }
  if (d.getFullYear() >= 2099) {
    return "长期有效";
  }
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day} 到期`;
}
function toggleGiftCard(item) {
  if (!item || item.id == null || item.id === "") {
    return;
  }
  if (isGiftCardSelected(item)) {
    useGiftCard(item.id, false);
  } else {
    useGiftCard(item.id, true);
  }
}
function isGiftCardSelected(item) {
  if (!item || !selectedGiftCardCredentialIds.value.length) {
    return false;
  }
  const id = item.id != null ? String(item.id) : "";
  return id && selectedGiftCardCredentialIds.value.includes(id);
}
function useGiftCard(credentialId, used) {
  const params = {
    way: route.query.way,
    used,
  };
  if (credentialId != null && credentialId !== "") {
    params.credentialId = String(credentialId);
  }
  selectGiftCard(params).then((res) => {
    if (res.success) {
      init();
    }
  }).catch((err) => {
    // 网络/登录异常已由 request 层统一提示
    console.warn("选择礼品卡失败", err);
  });
}
function getCouponNum() {
  // 获取可用优惠券数量
  couponNum({ way: route.query.way }).then((res) => {
    canUseCouponNum.value = res.result;
    if (res.result) {
      let storeArr = [];
      let skuArr = [];
      goodsList.value.forEach((e) => {
        storeArr.push(e.storeId);
        e.skuList?.forEach((i) => {
          skuArr.push(i.goodsSku?.id);
        });
      });
      let params = {
        pageNumber: 1,
        pageSize: 100,
        memberCouponStatus: "NEW",
        scopeId: skuArr.toString(),
        storeId: storeArr.toString(),
        totalPrice: priceDetailDTO.value.goodsPrice,
      };
      canUseCouponList(params).then((res) => {
        // 可用优惠券列表
        if (res.success) couponList.value = res.result?.records || [];
        const couponKeys = Object.keys(selectedCoupon.value);
        usedCouponId.value = [];
        if (couponKeys.length) {
          couponList.value.forEach((e) => {
            if (e.id === selectedCoupon.value[couponKeys]?.memberCoupon?.id) {
              usedCouponId.value.push(e.id);
            }
          });
          nextTick(() => {
            instance.proxy.$forceUpdate();
          });
        }
      }).catch((err) => {
        // 网络/登录异常已由 request 层统一提示
        console.warn("获取可用优惠券列表失败", err);
      });
    }
  }).catch((err) => {
    // 网络/登录异常已由 request 层统一提示
    console.warn("获取可用优惠券数量失败", err);
  });
}
function remarkKey(shop) {
  return shop.storeId || shop.storeName;
}
function remarkInputRef(shop) {
  return (el) => {
    remarkInputRefs[remarkKey(shop)] = el;
  };
}
function isRemarkOpen(shop) {
  return !!remarkEditing.value[remarkKey(shop)];
}
function openRemark(shop) {
  const key = remarkKey(shop);
  remarkEditing.value = { ...remarkEditing.value, [key]: true };
  nextTick(() => {
    const input = remarkInputRefs[remarkKey(shop)];
    const target = Array.isArray(input) ? input[0] : input;
    target?.focus?.();
  });
}
function closeRemark(shop) {
  if (shop.remark) {
    shop.remark = String(shop.remark).trim();
  }
  const key = remarkKey(shop);
  remarkEditing.value = { ...remarkEditing.value, [key]: false };
}
function selectAddress(item) {
  // 选择地址
  let params = {
    way: route.query.way,
    shippingAddressId: item.id,
  };
  selectAddr(params).then((res) => {
    if (res.success) {
      Message.success("选择收货地址成功");
      selectMethod.value = item;
      getGoodsDetail();
    }
  }).catch((err) => {
    // 网络/登录异常已由 request 层统一提示
    console.warn("选择收货地址失败", err);
  });
}
function selectStoreAddress(item) {
  // 选择自提地址
  setStoreAddressId(item.id, route.query.way).then((res) => {
    if (res.success) {
      Message.success("选择自提地址成功");
      selectedStoreAddress.value = item;
      getGoodsDetail();
    }
  }).catch((err) => {
    // 网络/登录异常已由 request 层统一提示
    console.warn("选择自提地址失败", err);
  });
}
function selectDeliverMethod(item) {
  let params = {
    way: route.query.way,
    shippingMethod: item.value,
  };
  setShipMethod(params).then((res) => {
    if (res.success) {
      selectedDeliverMethod.value = item.value;
      getGoodsDetail();
    }
  }).catch((err) => {
    // 网络/登录异常已由 request 层统一提示
    console.warn("切换配送方式失败", err);
  });
}
function editAddress(id) {
  // 编辑地址
  addrId.value = id;
  address.value.show();
}
function addrChange() {
  // 添加，编辑地址回显
  getAddress();
}
function delAddress(item) {
  // 删除地址
  Modal.confirm({
    title: "提示",
    content: "你确定删除这个收货地址",
    onOk: () => {
      delMemberAddress(item.id).then((res) => {
        if (res.success) {
          Message.success("删除成功");
          getAddress();
        }
      }).catch((err) => {
        // 网络/登录异常已由 request 层统一提示
        console.warn("删除收货地址失败", err);
      });
    },
    onCancel: () => { },
  });
}
function getShopGifts(shop) {
  if (!shop) return [];
  if (Array.isArray(shop.giftItemList) && shop.giftItemList.length > 0) {
    return shop.giftItemList;
  }
  return [];
}
function goGoodsDetail(skuId, goodsId) {
  // 跳转商品详情
  let routeUrl = router.resolve({
    path: "/goodsDetail",
    query: { skuId, goodsId },
  });
  window.open(routeUrl.href, "_blank");
}
// 跳转店铺首页
function goShopPage(id) {
  router.push({
    path: "/merchant",
    query: { id: id },
  });
}
function useCoupon(id, used) {
  // 使用优惠券
  let params = {
    way: route.query.way,
    memberCouponId: id,
    used: used, // true 为使用， false为弃用
  };
  selectCoupon(params).then((res) => {
    if (res.success) init();
  }).catch((err) => {
    // 网络/登录异常已由 request 层统一提示
    console.warn("使用优惠券失败", err);
  });
}
function editInvoice() {
  // 编辑发票信息
  invModal.value.invoiceAvailable = true;
}
function getInvMsg(item) {
  // 获取发票信息
  if (item) {
    init();
    invModal.value.invoiceAvailable = false;
  }
}

function pay() {
  // 结算
  const params = {
    client: "PC",
    remark: [],
    way: route.query.way,
  };
  goodsList.value.forEach((e) => {
    if (e.remark) {
      params.remark.push({
        remark: e.remark,
        storeId: e.storeId,
      });
    }
  });

  if (!params.remark.length) delete params.remark;

  Spin.show();
  createTrade(params)
    .then((res) => {
      Spin.hide();
      if (res.success) {
        const way = params.way;
        if (shouldSkipPaymentPage(res.result, way)) {
          router.push("/payDone");
          return;
        }
        router.push({
          path: "/payment",
          query: { orderType: "TRADE", sn: res.result.sn },
        });
      } else if (res.message) {
        Message.warning(res.message);
      }
    })
    .catch((err) => {
      Spin.hide();
      // 网络错误已由 request 层统一提示，这里兜底 404 与返回结构异常等未被提示的错误
      if (!err?.data || err?.data?.message) {
        Message.error(err?.data?.message || err?.message || "提交订单失败，请稍后重试");
      }
      console.warn("提交订单失败", err);
    });
}
// 优惠券可用范围
function useScope(type, storeName) {
  let shop = "平台";
  let goods = "全部商品";
  if (storeName !== "platform") shop = storeName;
  switch (type) {
    case "ALL":
      goods = "全部商品";
      break;
    case "PORTION_GOODS":
      goods = "部分商品";
      break;
    case "PORTION_GOODS_CATEGORY":
      goods = "部分分类商品";
      break;
  }
  return `${shop}${goods}可用`;
}
</script>

<style scoped lang="scss">

.goods-msg {
  overflow: hidden;
}

/** logo start */
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

.cart-steps {
  height: 30px;
  display: flex;
  align-items: center;
  gap: 12px;

  span {
    @include content_color($light_content_color);
    height: 30px;
    text-align: center;
    line-height: 30px;
    display: inline-block;
    padding: 0 15px;
    flex-shrink: 0;
  }

  .icon-next {
    flex-shrink: 0;
    font-size: 14px;
  }

  .el-icon {
    @include content_color($light_content_color);
    font-size: 20px;
    margin: 0 15px;
  }

  .active {
    border-radius: 50px;
    background-color: $theme_color;
    color: #fff;
  }

  .active-arrow {
    color: $theme_color;
  }
}

/** logo end */
/** content start */
.content {
  margin: 20px auto;
  background-color: #fff;
  min-height: 200px;
  padding: 8px 28px 0;
  box-sizing: border-box;
}

.delivery-method {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 16px;

  .method-item {
    position: relative;
    min-width: 108px;
    height: 44px;
    margin: 0;
    padding: 0 20px;
    border: 1px solid #e5e5e5;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    color: #171A26;
    font-size: 15px;
    box-sizing: border-box;
  }

  .border-red {
    border-color: $theme_color;
    background: #fff5f4;
    color: $theme_color;
  }

  .corner-icon {
    position: absolute;
    right: -1px;
    bottom: -1px;

    div {
      width: 0;
      border-top: 18px solid transparent;
      border-right: 18px solid $theme_color;
    }

    .el-icon {
      font-size: 12px;
      position: absolute;
      bottom: 0;
      right: 0;
      color: #fff;
    }
  }
}

/** 地址管理 */
.address-manage {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
  margin-top: 16px;

  :deep(.address-default-tag) {
    --el-tag-bg-color: var(--el-color-danger);
    --el-tag-border-color: var(--el-color-danger);
    --el-tag-text-color: #fff;
    color: #fff;
  }

  :deep(.address-alias-tag) {
    --el-tag-bg-color: var(--el-color-warning);
    --el-tag-border-color: var(--el-color-warning);
    --el-tag-text-color: #fff;
    color: #fff;
  }

  >div {
    border: 1px solid #e5e5e5;
    border-radius: 4px;
    width: auto;
    min-height: 128px;
    height: auto;
    margin: 0;
    padding: 14px 16px;
    cursor: pointer;
    color: #666;
    box-sizing: border-box;
  }

  .address-item {
    position: relative;
    font-size: 14px;
    line-height: 22px;

    >div:nth-child(1) {
      margin-bottom: 8px;
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 6px;

      span {
        margin-right: 0;
      }

      >span:nth-child(1) {
        color: #171A26;
        font-size: 16px;
        font-weight: 600;
      }
    }

    >div:nth-child(2),
    >div:nth-child(3) {
      color: #666;
    }

    .edit-btn {
      font-size: 14px;
      position: absolute;
      top: 14px;
      right: 14px;
      color: $theme_color;

      span:hover {
        border-bottom: 1px solid $theme_color;
      }
    }

    .corner-icon {
      position: absolute;
      right: -1px;
      bottom: -1px;

      div {
        width: 0;
        border-top: 20px solid transparent;
        border-right: 20px solid $theme_color;
      }

      .el-icon {
        font-size: 12px;
        position: absolute;
        bottom: 0;
        right: 1px;
        transform: rotate(-15deg);
        color: #fff;
      }
    }
  }

  .border-red {
    border-color: $theme_color;
    background: #fff5f4;
  }
}

/** 购买商品列表 start */
.shop-name {
  display: flex;
  justify-content: space-between;
  margin-top: 16px;
  color: #171A26;
  font-size: 15px;

  >span:nth-child(1) {
    font-weight: 600;

    .el-icon {
      color: #ff8f23;

      &:hover {
        color: $theme_color;
      }
    }
  }

  >span:nth-child(2) {
    color: #999;
    position: relative;
    display: flex;
    width: 200px;
  }

  .delivery-list {
    position: absolute;
    right: 0;
    top: 20px;
    background-color: #f3fafe;
    box-shadow: 0px 0px 5px #b9b2b2;
    display: flex;
    flex-wrap: wrap;
    width: 200px;
    min-height: 100px;
    padding: 10px;

    li {
      width: 90px;
      height: 30px;
      text-align: center;

      &:hover {
        cursor: pointer;
      }
    }
  }
}

.goods-head,
.goods-item {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 110px 72px 72px 120px;
  column-gap: 12px;
  align-items: center;
}

.goods-head {
  margin-top: 12px;
  padding: 0 8px 8px;
  color: #999;
  font-size: 13px;

  span:not(:first-child) {
    text-align: center;
  }

  span:last-child {
    text-align: right;
  }
}

.goods-list {
  display: block;
  width: 100%;
  margin: 0 0 16px;
  background: transparent;

  .goods-item {
    width: auto;
    margin: 0;
    padding: 14px 8px;
    border-top: 1px solid #f0f0f0;
    justify-content: initial;

    >span {
      width: auto;
      text-align: center;
      color: #171A26;
      font-size: 14px;
    }

    >span:last-child {
      text-align: right;
      color: $theme_color;
      font-weight: 600;
    }
  }

  .goods-main {
    display: flex;
    align-items: center;
    gap: 12px;
    min-width: 0;
    text-align: left;
  }

  img {
    width: 72px;
    height: 72px;
    border-radius: 4px;
    object-fit: cover;
    flex-shrink: 0;
    background: #f5f5f5;
  }

  .goods-name {
    color: #171A26;
    font-size: 15px;
    line-height: 22px;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    overflow: hidden;
  }

  .goods-price {
    font-size: 15px;
  }
}

.order-mark {
  margin-top: 12px;
}

.mark-link {
  display: inline-flex;
  align-items: flex-start;
  gap: 8px;
  max-width: 100%;
  padding: 0;
  border: none;
  background: none;
  color: #438cde;
  font-family: inherit;
  font-size: 14px;
  line-height: 22px;
  text-align: left;
  cursor: pointer;

  &:hover {
    color: $theme_color;
  }
}

.mark-label {
  flex-shrink: 0;
  color: #666;
}

.mark-text {
  color: #171A26;
  word-break: break-all;
}

.mark-field {
  max-width: 640px;

  :deep(.el-input__wrapper) {
    min-height: 40px;
  }

  :deep(.el-input__inner) {
    color: #171A26;
    font-size: 14px;
  }
}

.mark-tip {
  display: block;
  margin-top: 8px;
  color: #999;
  font-size: 13px;
  line-height: 20px;
}

/** 购买商品列表 end */
/** 发票信息 start */
.invoice {
  .inovice-content {
    margin-top: 12px;
    color: #171A26;
    font-size: 14px;
    line-height: 22px;

    >span {
      margin-right: 16px;
    }

    >span:last-child {
      color: $theme_color;
      cursor: pointer;

      &:hover {
        border-bottom: 1px solid $theme_color;
      }
    }
  }
}

/** 发票信息 end */

/** 订单价格 */
.order-price {
  text-align: right;
  margin-top: 24px;
  font-size: 14px;
  color: #666;
  line-height: 22px;

  >div>span:nth-child(2) {
    width: 140px;
    text-align: right;
    display: inline-block;
    margin-top: 8px;
    color: #171A26;
  }

  .actrual-price {
    color: $theme_color;
    font-weight: 600;
    font-size: 22px;
  }
}

/** content end */
/** 底部支付栏 */
.order-footer {
  z-index: 20;
  position: sticky;
  bottom: 0;
  height: 64px;
  display: flex;
  align-items: center;
  flex-direction: row-reverse;
  border-top: 1px solid #f0f0f0;
  margin: 16px -28px 0;
  padding-left: 28px;
  width: calc(100% + 56px);
  box-sizing: border-box;
  background: #fff;

  div {
    text-align: center;
  }

  .pay {
    background-color: $theme_color;
    width: 160px;
    font-size: 16px;
    color: #fff;
    height: 100%;
    line-height: 64px;
    cursor: pointer;

    &:hover {
      opacity: 0.92;
    }
  }
}

/** 公共表头 */
.card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #dddddd;
  height: 40px;

  > span:first-child {
    font-size: 16px;
    font-weight: 600;
    color: #171A26;
  }

  > span:nth-child(2) {
    font-size: 14px;
    font-weight: 400;
    color: #438cde;
    cursor: pointer;

    &:hover {
      color: $theme_color;
    }
  }
}

.card-head-links {
  display: flex;
  align-items: center;
  gap: 16px;

  span {
    font-size: 14px;
    font-weight: 400;
    color: #438cde;
    cursor: pointer;

    &:hover {
      color: $theme_color;
    }
  }
}

.el-divider {
  background: $theme_color;
  height: 2px;
}

.order-footer .pay-address {
  flex: 1;
  padding-right: 20px;
  font-size: 14px;
  line-height: 22px;
  color: #666;
  text-align: right;
}

.more-addr {
  cursor: pointer;
  margin-top: 12px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: #438cde;
  font-size: 14px;
}

.pay-empty {
  margin-top: 12px;
  color: #999;
  font-size: 14px;
  line-height: 22px;
}

.pay-coupon-list {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin: 16px 0 0;
  padding: 0;
  list-style: none;
}

.pay-coupon {
  width: 360px;
  min-height: 108px;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 14px 14px 16px;
  border: 1px solid #f0d0cc;
  border-radius: 8px;
  background: #fff;
  box-sizing: border-box;
  cursor: pointer;

  &.is-used {
    border-color: $theme_color;
    background: #fff5f4;
  }
}

.pay-coupon-price {
  flex-shrink: 0;
  width: 88px;
  color: $theme_color;
  font-size: 22px;
  font-weight: 600;
  line-height: 1.2;
}

.pay-coupon-info {
  flex: 1;
  min-width: 0;

  p {
    margin: 0;
    color: #666;
    font-size: 13px;
    line-height: 20px;
    word-break: break-all;
  }

  p:first-child {
    color: #171A26;
    font-size: 14px;
    font-weight: 600;
  }
}

.pay-gcc-deduct {
  margin-left: 8px;
  font-size: 14px;
  font-weight: normal;
  color: #666;
}
.pay-gcc-deduct-num {
  color: #e54d42;
  font-weight: 600;
}
.pay-gcc-help {
  font-size: 14px;
  font-weight: 400;
  color: #438cde;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 2px;
  text-decoration: none;
}
.pay-gcc-help:hover {
  color: $theme_color;
}
.pay-gcc-body {
  min-height: 120px;
  margin-top: 16px;
}
.pay-gcc-panel {
  position: relative;
}
.pay-gcc-grid-wrap {
  position: relative;
  min-height: 100px;
}
.pay-gcc-empty {
  padding: 24px 0;
  text-align: center;
  color: #999;
  font-size: 14px;
}
.pay-gcc-cards {
  display: flex;
  flex-wrap: wrap;
  gap: 16px 18px;
}
.pay-gcc-item {
  position: relative;
  width: 280px;
  max-width: 100%;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: transform 0.15s, box-shadow 0.15s;
  outline: 2px solid transparent;
  outline-offset: 0;

  &.is-selected {
    outline-color: $theme_color;
  }
}
.pay-gcc-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12);
}
.pay-gcc-item-inner {
  position: relative;
  min-height: 150px;
  background: linear-gradient(135deg, #ff9a4a 0%, #ff7729 48%, #e86a1f 100%);
}
.pay-gcc-pattern {
  position: absolute;
  inset: 0;
  opacity: 0.2;
  pointer-events: none;
  background-image: repeating-linear-gradient(
    -32deg,
    transparent,
    transparent 5px,
    rgba(255, 255, 255, 0.45) 5px,
    rgba(255, 255, 255, 0.45) 6px
  );
}
.pay-gcc-item-main {
  position: relative;
  z-index: 1;
  padding: 14px 14px 12px;
  color: #fff;
}
.pay-gcc-top-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 10px;
}
.pay-gcc-name {
  font-size: 16px;
  font-weight: 700;
  line-height: 1.3;
}
.pay-gcc-face {
  margin-top: 6px;
  font-size: 14px;
  opacity: 0.92;
}
.pay-gcc-right-meta {
  text-align: right;
  flex-shrink: 0;
}
.pay-gcc-type {
  font-size: 15px;
  font-weight: 700;
}
.pay-gcc-valid {
  margin-top: 6px;
  font-size: 14px;
  opacity: 0.9;
  white-space: nowrap;
}
.pay-gcc-balance-row {
  margin-top: 14px;
  display: flex;
  align-items: baseline;
  gap: 6px;
}
.pay-gcc-amt {
  font-size: 22px;
  font-weight: 700;
  letter-spacing: 0.02em;
}
.pay-gcc-bal-label {
  font-size: 13px;
  opacity: 0.9;
}
.pay-gcc-no {
  margin-top: 10px;
  font-size: 14px;
  opacity: 0.75;
  word-break: break-all;
  line-height: 1.4;
}
.pay-gcc-corner {
  position: absolute;
  right: 0;
  bottom: 0;
  z-index: 2;
  width: 44px;
  height: 44px;
  overflow: hidden;
  pointer-events: none;
}
.pay-gcc-corner::before {
  content: "";
  position: absolute;
  right: -22px;
  bottom: -22px;
  width: 44px;
  height: 44px;
  background: #e54d42;
  transform: rotate(45deg);
}
.pay-gcc-corner .el-icon {
  position: absolute;
  right: 3px;
  bottom: 3px;
  color: #fff;
  font-size: 15px;
  z-index: 1;
}
.pay-gcc-notice-p {
  line-height: 1.75;
  color: #515a6e;
  margin-bottom: 16px;
}
.pay-gcc-notice-foot {
  text-align: right;
}
.gift-zero-price {
  color: #e4393c !important;
  font-weight: 500;
}
</style>
