<template>
  <div class="pay-order">
    <BaseHeader></BaseHeader>
    <!-- LOGO 步骤条 -->
    <div class="width_1200 logo">
      <div>
        <router-link to="/"><img :src="$store.state.logoImg" /></router-link>
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
                  goGoodsDetail(goods.goodsSku.id, goods.goodsSku.goodsId)
                ">
                  <img :src="goods.goodsSku.thumbnail" alt="" />
                  <span class="goods-name">{{ goods.goodsSku.goodsName }}</span>
                </span>
                <span class="goods-price">{{ $filters.unitPrice(goods.purchasePrice, "￥") }}</span>
                <span>{{ goods.num }}</span>
                <span>{{ goods.goodsSku.quantity > 0 ? "有货" : "无货" }}</span>
                <span class="goods-price">{{ $filters.unitPrice(goods.subTotal, "￥") }}</span>
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
              <p>满{{ item.consumeThreshold }}元可用</p>
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

<script>
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

export default {
  name: "Pay",
  components: { invoiceModal, addressManage },
  computed: {
    hasInvoiceInfo() {
      const title =
        this.invoiceData.personalName ||
        this.invoiceData.companyName ||
        this.invoiceData.receiptTitle;
      const content = this.invoiceData.receiptContent;
      if (content && String(content).trim() === "不开发票") return false;
      return Boolean(
        (title && String(title).trim()) ||
        (content && String(content).trim())
      );
    },
    invoiceDisplayTitle() {
      return (
        this.invoiceData.personalName ||
        this.invoiceData.companyName ||
        this.invoiceData.receiptTitle ||
        ""
      );
    },
    giftCardDeductAmount() {
      if (this.tradeGiftCardDeductTotal != null && Number(this.tradeGiftCardDeductTotal) > 0) {
        return Number(this.tradeGiftCardDeductTotal);
      }
      const items = this.giftCardDeductItems || [];
      let sum = 0;
      items.forEach((it) => {
        sum += Number(it.deductAmount || 0);
      });
      if (sum > 0) {
        return sum;
      }
      const p = this.priceDetailDTO || {};
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
    },
    /** 电子卡券结算：免地址、隐藏发票；优惠券/礼品卡/促销明细可用（M-02） */
    isECouponCheckout() {
      return isECoupon(this.goodsType);
    },
    /** 虚拟型结算（核销虚拟 + 电子卡券）：均不需要收货地址 */
    isVirtualLikeCheckout() {
      return this.goodsType === "VIRTUAL_GOODS" || this.isECouponCheckout;
    },
  },
  data() {
    return {
      selectedStoreAddress: 'm',
      selectMethod: '',
      stepIndex: 1, // 顶部步骤条状态
      invoiceAvailable: false, // 发票编辑按钮
      showEditBtn: "", // 鼠标移入显示编辑按钮
      orderMark: "", // 订单备注
      remarkEditing: {}, // 正在填写备注的店铺
      goodsType: "", // 商品类型
      storeMoreAddr: false,
      invoiceData: {
        // 发票数据
        //receiptContent: "不开发票",
      },
      searchForm: {
        pageNumber: 1,
        pageSize: 100
      },
      shippingMethod: [],
      storeAddressList: [],
      shippingWay: [
        {
          value: "LOGISTICS",
          label: "物流",
        },
        {
          value: "SELF_PICK_UP",
          label: "自提",
        },
      ],
      selectedDeliverMethod: 'LOGISTICS',
      addressList: [], // 地址列表
      selectedAddress: {}, // 所选地址
      goodsList: [], // 商品列表
      priceDetailDTO: {}, // 商品价格
      totalNum: 0, // 购买数量
      addrId: "", // 编辑地址传入的id
      moreAddr: false, // 更多地址
      canUseCouponNum: 0, // 可用优惠券数量
      couponList: [], // 可用优惠券列表
      usedCouponId: [], // 已使用优惠券id
      selectedCoupon: {}, // 已选优惠券对象
      storeId: '', //店铺Id
      giftCardList: [], // TradeDTO.canUseGiftCards
      giftCardNoticeModal: false,
      giftCardDeductItems: [], // 已选礼品卡抵扣明细（TradeDTO.giftCardDeductItems）
      tradeGiftCardDeductTotal: null, // TradeDTO.giftCardDeductTotal
      selectedGiftCardCredentialIds: [], // 已选凭证 id，与 deductItems 同步
    };
  },
  mounted() {
    this.init();
  },
  methods: {
    // 初始化数据
    init() {
      this.getGoodsDetail();
      this.getDistribution();
    },
    goAddressManage() {
      // 跳转地址管理页面
      this.$router.push("/home/MyAddress");
    },
    getAddress() {
      // 获取收货地址列表
      memberAddress(this.searchForm).then((res) => {
        if (res.success) {
          this.addressList = res.result.records;
          this.addressList.forEach((e, index) => {
            if (e.id === this.selectedAddress.id && index > 2) {
              this.moreAddr = true;
            }
          });
        }
      });
    },
    // 获取配送方式列表
    async getDistribution() {
      let shopRes = await shippingMethodList({ way: this.$route.query.way });
      let shopList;
      if (shopRes.success) {
        shopList = shopRes.result;
        let way = [];
        console.log(shopList)
        this.shippingWay.forEach((item) => {
          shopList.forEach((child) => {
            if (item.value == child) {
              way.push(item);
            }
          });
        });
        this.shippingMethod = way;
        console.log(this.shippingMethod)
      }
    },

    async getStoreAddressList() {
      getStoreAddress(this.storeId,this.searchForm).then(res => {
        if (res.success) {
          this.storeAddressList = res.result.records
          this.storeAddressList.forEach((e, index) => {
            if (e.id === this.selectedAddress.id && index > 2) {
              this.storeMoreAddr = true;
            }
          });
        }
      })
    },
    getGoodsDetail() {
      // 订单商品详情
      Spin.show();
      cartGoodsPay({ way: this.$route.query.way })
        .then((res) => {
          Spin.hide();
          if (res.success) {
            if (
              !res.result.checkedSkuList ||
              res.result.checkedSkuList.length === 0
            ) {
              if (res.result.skuList && res.result.skuList[0]) {
                Modal.warning({
                  title: "购物车存在无效商品！",
                  content:
                    "[" +
                    res.result.skuList[0].goodsSku.goodsName +
                    "]" +
                    res.result.skuList[0].errorMessage,
                });
              }
              this.$router.push({
                path: "/cart",
                replace: true,
              });
            }
            this.goodsList = res.result.cartList;
            this.priceDetailDTO = res.result.priceDetailDTO;
            this.skuList = res.result.skuList;
            if (res.result.skuList[0] && res.result.skuList[0].goodsSku) {
              this.goodsType = res.result.skuList[0].goodsSku.goodsType;
            }
            this.storeId = this.goodsList[0].storeId
            if (res.result.receiptVO) {
              this.invoiceData = res.result.receiptVO;
            }
            let notSupArea = res.result.notSupportFreight;
            this.selectedCoupon = {};
            if (res.result.platformCoupon)
              this.selectedCoupon[res.result.platformCoupon.memberCoupon.id] =
                res.result.platformCoupon;
            if (
              res.result.storeCoupons &&
              Object.keys(res.result.storeCoupons)[0]
            ) {
              let storeMemberCouponsId = Object.keys(
                res.result.storeCoupons
              )[0];
              let storeCouponId =
                res.result.storeCoupons[storeMemberCouponsId].memberCoupon.id;
              this.selectedCoupon[storeCouponId] =
                res.result.storeCoupons[storeMemberCouponsId];
            }
            if (notSupArea) {
              let content = [];
              let title = "";
              notSupArea.forEach((e) => {
                title = e.errorMessage;
                content.push(e.goodsSku.goodsName);
              });
              Modal.warning({
                title: "以下商品超出配送区域" || title,
                content: content.toString(),
              });
            }
            if (res.result.memberAddress) {
              this.selectedAddress = res.result.memberAddress;
            }
            this.getAddress();
            this.getStoreAddressList();
            this.totalNum = 0;
            for (let i = 0; i < this.skuList.length; i++) {
              this.totalNum += this.skuList[i].num;
            }
            this.usedCouponId = [];
            this.couponList = res.result.canUseCoupons;
            const couponKeys = Object.keys(this.selectedCoupon);
            if (couponKeys.length) {
              this.couponList.forEach((e) => {
                if (
                  this.selectedCoupon[e.id] &&
                  e.id === this.selectedCoupon[e.id].memberCoupon.id
                ) {
                  this.usedCouponId.push(e.id);
                }
              });
              this.$nextTick(() => {
                this.$forceUpdate();
              });
            }
            this.giftCardDeductItems = Array.isArray(res.result.giftCardDeductItems)
              ? res.result.giftCardDeductItems
              : [];
            this.tradeGiftCardDeductTotal =
              res.result.giftCardDeductTotal != null && res.result.giftCardDeductTotal !== ""
                ? Number(res.result.giftCardDeductTotal)
                : null;
            this.giftCardList = Array.isArray(res.result.canUseGiftCards) ? res.result.canUseGiftCards : [];
            this.syncGiftCardSelectionFromCart(res.result);
          }
        })
        .catch(() => {
          Spin.hide();
        });
    },
    syncGiftCardSelectionFromCart(result) {
      if (!result) {
        this.selectedGiftCardCredentialIds = [];
        return;
      }
      const selectedIds = result.selectedGiftCardIds;
      if (Array.isArray(selectedIds) && selectedIds.length) {
        this.selectedGiftCardCredentialIds = selectedIds
          .map((id) => (id != null && id !== "" ? String(id) : ""))
          .filter(Boolean);
        return;
      }
      const items = Array.isArray(result.giftCardDeductItems) ? result.giftCardDeductItems : [];
      if (items.length) {
        this.selectedGiftCardCredentialIds = items
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
      this.selectedGiftCardCredentialIds =
        id != null && id !== "" ? [String(id)] : [];
    },
    formatGiftFaceValue(val) {
      if (val == null || val === "") {
        return "—";
      }
      const n = Number(val);
      if (Number.isNaN(n)) {
        return String(val);
      }
      return Number.isInteger(n) ? String(n) : n.toFixed(2).replace(/\.?0+$/, "");
    },
    formatGiftExpire(row) {
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
    },
    toggleGiftCard(item) {
      if (!item || item.id == null || item.id === "") {
        return;
      }
      if (this.isGiftCardSelected(item)) {
        this.useGiftCard(item.id, false);
      } else {
        this.useGiftCard(item.id, true);
      }
    },
    isGiftCardSelected(item) {
      if (!item || !this.selectedGiftCardCredentialIds.length) {
        return false;
      }
      const id = item.id != null ? String(item.id) : "";
      return id && this.selectedGiftCardCredentialIds.includes(id);
    },
    useGiftCard(credentialId, used) {
      const params = {
        way: this.$route.query.way,
        used,
      };
      if (credentialId != null && credentialId !== "") {
        params.credentialId = String(credentialId);
      }
      selectGiftCard(params).then((res) => {
        if (res.success) {
          this.init();
        }
      });
    },
    getCouponNum() {
      // 获取可用优惠券数量
      couponNum({ way: this.$route.query.way }).then((res) => {
        this.canUseCouponNum = res.result;
        if (res.result) {
          let storeArr = [];
          let skuArr = [];
          this.goodsList.forEach((e) => {
            storeArr.push(e.storeId);
            e.skuList.forEach((i) => {
              skuArr.push(i.goodsSku.id);
            });
          });
          let params = {
            pageNumber: 1,
            pageSize: 100,
            memberCouponStatus: "NEW",
            scopeId: skuArr.toString(),
            storeId: storeArr.toString(),
            totalPrice: this.priceDetailDTO.goodsPrice,
          };
          canUseCouponList(params).then((res) => {
            // 可用优惠券列表
            if (res.success) this.couponList = res.result.records;
            const couponKeys = Object.keys(this.selectedCoupon);
            this.usedCouponId = [];
            if (couponKeys.length) {
              this.couponList.forEach((e) => {
                if (e.id === this.selectedCoupon[couponKeys].memberCoupon.id) {
                  this.usedCouponId.push(e.id);
                }
              });
              this.$nextTick(() => {
                this.$forceUpdate();
              });
            }
          });
        }
      });
    },
    remarkKey(shop) {
      return shop.storeId || shop.storeName;
    },
    remarkInputRef(shop) {
      return "remarkInput" + this.remarkKey(shop);
    },
    isRemarkOpen(shop) {
      return !!this.remarkEditing[this.remarkKey(shop)];
    },
    openRemark(shop) {
      const key = this.remarkKey(shop);
      this.remarkEditing = { ...this.remarkEditing, [key]: true };
      this.$nextTick(() => {
        const input = this.$refs[this.remarkInputRef(shop)];
        const target = Array.isArray(input) ? input[0] : input;
        target?.focus?.();
      });
    },
    closeRemark(shop) {
      if (shop.remark) {
        shop.remark = String(shop.remark).trim();
      }
      const key = this.remarkKey(shop);
      this.remarkEditing = { ...this.remarkEditing, [key]: false };
    },
    selectAddress(item) {
      // 选择地址
      let params = {
        way: this.$route.query.way,
        shippingAddressId: item.id,
      };
      selectAddr(params).then((res) => {
        if (res.success) {
          Message.success("选择收货地址成功");
          this.selectMethod = item;
          this.getGoodsDetail();
        }
      });
    },
    selectStoreAddress(item) {
      console.log(item.id)
      console.log(this.$route.query.way)
      // 选择自提地址
      setStoreAddressId(item.id,this.$route.query.way).then((res) => {
        if (res.success) {
          Message.success("选择自提地址成功");
          this.selectedStoreAddress = item;
          this.getGoodsDetail();
        }
      });
    },
    selectDeliverMethod(item) {
      let params = {
        way: this.$route.query.way,
        shippingMethod: item.value,
      };
      setShipMethod(params).then((res) => {
        if (res.success) {
          this.selectedDeliverMethod = item.value;
          this.getGoodsDetail();
        }
      });
    },
    editAddress(id) {
      // 编辑地址
      this.addrId = id;
      this.$refs.address.show();
    },
    addrChange() {
      // 添加，编辑地址回显
      this.getAddress();
    },
    delAddress(item) {
      // 删除地址
      Modal.confirm({
        title: "提示",
        content: "你确定删除这个收货地址",
        onOk: () => {
          delMemberAddress(item.id).then((res) => {
            if (res.success) {
              Message.success("删除成功");
              this.getAddress();
            }
          });
        },
        onCancel: () => { },
      });
    },
    goGoodsDetail(skuId, goodsId) {
      // 跳转商品详情
      let routeUrl = this.$router.resolve({
        path: "/goodsDetail",
        query: { skuId, goodsId },
      });
      window.open(routeUrl.href, "_blank");
    },
    // 跳转店铺首页
    goShopPage(id) {
      this.$router.push({
        path: "/merchant",
        query: { id: id },
      });
    },
    useCoupon(id, used) {
      // 使用优惠券
      let params = {
        way: this.$route.query.way,
        memberCouponId: id,
        used: used, // true 为使用， false为弃用
      };
      selectCoupon(params).then((res) => {
        if (res.success) this.init();
      });
    },
    editInvoice() {
      // 编辑发票信息
      this.$refs.invModal.invoiceAvailable = true;
    },
    getInvMsg(item) {
      // 获取发票信息
      if (item) {
        this.init();
        this.$refs.invModal.invoiceAvailable = false;
      }
    },

    pay() {
      // 结算
      const params = {
        client: "PC",
        remark: [],
        way: this.$route.query.way,
      };
      this.goodsList.forEach((e) => {
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
              this.$router.push("/payDone");
              return;
            }
            this.$router.push({
              path: "/payment",
              query: { orderType: "TRADE", sn: res.result.sn },
            });
          } else if (res.message) {
            Message.warning(res.message);
          }
        })
        .catch((err) => {
          Spin.hide();
          if (err?.message && !err?.data?.message) {
            Message.error(err.message);
          }
        });
    },
    // 优惠券可用范围
    useScope(type, storeName) {
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
    },
  },
};
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
</style>
