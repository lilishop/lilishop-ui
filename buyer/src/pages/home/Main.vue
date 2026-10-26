<template>
  <div class="member-home">
    <div class="home-head">
      <div>
        <div class="home-hello">你好，{{ displayName }}</div>
        <div class="home-sub">查看订单进度、优惠券和账户余额</div>
      </div>
      <button type="button" class="msg-entry" @click="go('MsgList')">
        <el-icon :size="18"><Bell /></el-icon>
        <span>我的消息</span>
        <i v-if="unreadMsg > 0" class="msg-badge">{{ unreadLabel }}</i>
      </button>
    </div>

    <div class="status-grid">
      <button
        v-for="item in orderStats"
        :key="item.key"
        type="button"
        class="stat-card"
        @click="item.action()"
      >
        <span class="stat-count">{{ item.count }}</span>
        <span class="stat-label">{{ item.label }}</span>
      </button>
    </div>

    <div class="asset-grid">
      <button type="button" class="asset-card" @click="go('Coupons')">
        <div>
          <div class="asset-label">优惠券</div>
          <div class="asset-value">{{ couponCount }}<span>张可用</span></div>
        </div>
        <span class="asset-link">查看</span>
      </button>
      <button type="button" class="asset-card" @click="go('MoneyManagement')">
        <div>
          <div class="asset-label">账户余额</div>
          <div class="asset-value">￥{{ $filters.unitPrice(balance) }}</div>
        </div>
        <span class="asset-link">查看</span>
      </button>
      <button type="button" class="asset-card" @click="go('Point')">
        <div>
          <div class="asset-label">我的积分</div>
          <div class="asset-value">{{ point }}<span>积分</span></div>
        </div>
        <span class="asset-link">查看</span>
      </button>
      <button type="button" class="asset-card" @click="go('MemberGrade')">
        <div>
          <div class="asset-label">会员等级</div>
          <div class="asset-value grade-value">{{ gradeName }}</div>
        </div>
        <span class="asset-link">查看</span>
      </button>
    </div>

    <div class="panel">
      <div class="panel-head">
        <span class="panel-title">最近订单</span>
        <button type="button" class="panel-more" @click="go('MyOrder')">全部订单 ›</button>
      </div>
      <div v-if="recentOrders.length" class="order-list">
        <button
          v-for="order in recentOrders"
          :key="order.sn"
          type="button"
          class="order-row"
          @click="goOrderDetail(order.sn)"
        >
          <div class="order-thumb">
            <img
              :src="firstItem(order).image"
              :alt="firstItem(order).name"
              loading="lazy"
              decoding="async"
            />
          </div>
          <div class="order-info">
            <div class="order-name">
              {{ firstItem(order).name }}
              <span v-if="order.orderItems.length > 1" class="order-more">
                等{{ order.orderItems.length }}件
              </span>
            </div>
            <div class="order-meta">{{ order.createTime }} · {{ order.storeName }}</div>
          </div>
          <div class="order-side">
            <div class="order-amount">{{ $filters.unitPrice(order.flowPrice, "￥") }}</div>
            <div class="order-status">{{ orderStatusText(order.orderStatus) }}</div>
          </div>
        </button>
      </div>
      <div v-else-if="ordersLoaded" class="panel-empty">暂无订单</div>
    </div>

    <div class="panel">
      <div class="panel-head">
        <span class="panel-title">我的足迹</span>
        <button type="button" class="panel-more" @click="go('MyTracks')">查看更多 ›</button>
      </div>
      <div v-if="tracks.length" class="goods-strip">
        <button
          v-for="item in tracks"
          :key="item.id"
          type="button"
          class="goods-card"
          @click="openGoods(item.id, item.goodsId)"
        >
          <div class="goods-thumb">
            <img :src="item.thumbnail" :alt="item.goodsName" loading="lazy" decoding="async" />
          </div>
          <div class="goods-name">{{ item.goodsName }}</div>
          <div class="goods-price">{{ $filters.unitPrice(item.price, "￥") }}</div>
        </button>
      </div>
      <div v-else-if="tracksLoaded" class="panel-empty">暂无足迹</div>
    </div>

    <div class="panel">
      <div class="panel-head">
        <span class="panel-title">我的收藏</span>
        <button type="button" class="panel-more" @click="go('Favorites')">查看更多 ›</button>
      </div>
      <div v-if="favorites.length" class="goods-strip">
        <button
          v-for="item in favorites"
          :key="item.skuId"
          type="button"
          class="goods-card"
          @click="openGoods(item.skuId, item.goodsId)"
        >
          <div class="goods-thumb">
            <img :src="item.image" :alt="item.goodsName" loading="lazy" decoding="async" />
          </div>
          <div class="goods-name">{{ item.goodsName }}</div>
          <div class="goods-price">{{ $filters.unitPrice(item.price, "￥") }}</div>
        </button>
      </div>
      <div v-else-if="favoritesLoaded" class="panel-empty">暂无收藏</div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { Bell } from "@element-plus/icons-vue";
import storage from "@/plugins/storage";
import { getOrderList } from "@/api/order";
import {
  afterSaleList,
  collectList,
  getMembersWallet,
  memberCouponList,
  memberGradeCurrent,
  memberPoint,
  tracksList,
} from "@/api/member";
import { refreshUnreadMessage } from "@/utils/unreadMessage";
import { useAppStore } from "@/stores/app";
import { orderStatusList } from "./enumeration.js";

defineOptions({ name: "UserCenterHome" });

const router = useRouter();
const appStore = useAppStore();

function totalOf(res) {
  return res && res.success ? Number(res.result && res.result.total) || 0 : 0;
}

function recordsOf(res) {
  return res && res.success && res.result && Array.isArray(res.result.records)
    ? res.result.records.filter((item) => item != null)
    : [];
}

const displayName = ref("会员");
const waitPay = ref(0);
const waitShip = ref(0);
const waitReceive = ref(0);
const afterSale = ref(0);
const couponCount = ref(0);
const balance = ref(0);
const point = ref(0);
const gradeName = ref("-");
const recentOrders = ref([]);
const tracks = ref([]);
const favorites = ref([]);
const ordersLoaded = ref(false);
const tracksLoaded = ref(false);
const favoritesLoaded = ref(false);

const unreadMsg = computed(() => appStore.unreadMsg);
const unreadLabel = computed(() => (unreadMsg.value > 99 ? "99+" : String(unreadMsg.value)));
const orderStats = computed(() => [
  { key: "pay", label: "待付款", count: waitPay.value, action: () => goOrder("WAIT_PAY") },
  { key: "ship", label: "待发货", count: waitShip.value, action: () => goOrder("WAIT_SHIP") },
  { key: "receive", label: "待收货", count: waitReceive.value, action: () => goOrder("WAIT_USE") },
  { key: "after", label: "售后", count: afterSale.value, action: () => go("AfterSale") },
]);

function readUser() {
  try {
    const raw = storage.getItem("userInfo");
    const user = raw ? JSON.parse(raw) : {};
    displayName.value = user.nickName || user.username || "会员";
  } catch {
    displayName.value = "会员";
  }
}

function firstItem(order) {
  return (order.orderItems && order.orderItems[0]) || {};
}

function orderStatusText(status) {
  const hit = orderStatusList.find((e) => e.status === status);
  return hit ? hit.name : status;
}

function loadSummary() {
  const page = { pageNumber: 1, pageSize: 1 };
  Promise.all([
    getOrderList({ ...page, tag: "WAIT_PAY" }).catch(() => null),
    getOrderList({ ...page, tag: "WAIT_SHIP" }).catch(() => null),
    getOrderList({ ...page, tag: "WAIT_USE" }).catch(() => null),
    afterSaleList({ ...page, sort: "createTime", order: "desc" }).catch(() => null),
    memberCouponList({ ...page, memberCouponStatus: "NEW" }).catch(() => null),
    getMembersWallet().catch(() => null),
    refreshUnreadMessage(),
    getOrderList({ pageNumber: 1, pageSize: 3 }).catch(() => null),
    tracksList({ pageNumber: 1, pageSize: 10, order: "desc", sort: "updateTime" }).catch(() => null),
    collectList({ pageNumber: 1, pageSize: 10, type: "GOODS" }).catch(() => null),
    memberPoint().catch(() => null),
    memberGradeCurrent({ pageNumber: 1, pageSize: 10 }).catch(() => null),
  ]).then(
    ([
      pay,
      ship,
      receive,
      afterSaleRes,
      coupon,
      wallet,
      ,
      recent,
      tracksRes,
      favoritesRes,
      pointRes,
      gradeRes,
    ]) => {
      waitPay.value = totalOf(pay);
      waitShip.value = totalOf(ship);
      waitReceive.value = totalOf(receive);
      afterSale.value = totalOf(afterSaleRes);
      couponCount.value = totalOf(coupon);
      balance.value = wallet && wallet.success ? wallet.result.memberWallet || 0 : 0;

      recentOrders.value = recordsOf(recent).filter((order) => order && order.sn);
      ordersLoaded.value = true;
      tracks.value = recordsOf(tracksRes);
      tracksLoaded.value = true;
      favorites.value = recordsOf(favoritesRes);
      favoritesLoaded.value = true;

      point.value = pointRes && pointRes.success && pointRes.result ? pointRes.result.point || 0 : 0;
      const grade = gradeRes && gradeRes.success && gradeRes.result ? gradeRes.result.grade : null;
      gradeName.value = grade && grade.gradeName ? grade.gradeName : "暂无等级";
    }
  );
}

function go(name) {
  router.push({ name });
}

function goOrder(tag) {
  router.push({ name: "MyOrder", query: { tag } });
}

function goOrderDetail(sn) {
  router.push({ name: "OrderDetail", query: { sn } });
}

function openGoods(skuId, goodsId) {
  const routeUrl = router.resolve({ path: "/goodsDetail", query: { skuId, goodsId } });
  window.open(routeUrl.href, "_blank");
}

onMounted(() => {
  readUser();
  loadSummary();
});
</script>

<style scoped lang="scss">
.member-home {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.home-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 4px 4px 8px;
}

.home-hello {
  color: #333;
  font-size: 18px;
  font-weight: 600;
  line-height: 26px;
}

.home-sub {
  margin-top: 4px;
  color: #999;
  font-size: 14px;
  line-height: 22px;
}

.msg-entry {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 36px;
  padding: 0 14px;
  border: 1px solid #eee;
  border-radius: 18px;
  background: #fff;
  color: #333;
  font-size: 14px;
  cursor: pointer;

  &:hover {
    color: $theme_color;
    border-color: $theme_color;
  }
}

.msg-badge {
  min-width: 16px;
  height: 16px;
  padding: 0 4px;
  border-radius: 8px;
  background: $theme_color;
  color: #fff;
  font-size: 12px;
  font-style: normal;
  line-height: 16px;
  text-align: center;
}

.status-grid,
.asset-grid {
  display: grid;
  gap: 12px;
}

.status-grid {
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

.asset-grid {
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

.stat-card,
.asset-card {
  border: 1px solid #eee;
  border-radius: 8px;
  background: #fff;
  cursor: pointer;
  text-align: left;

  &:hover {
    border-color: $theme_color;
  }
}

.stat-card {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 18px 16px;
}

.stat-count {
  color: $theme_color;
  font-size: 24px;
  font-weight: 600;
  line-height: 32px;
}

.stat-label {
  color: #666;
  font-size: 14px;
  line-height: 22px;
}

.asset-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 18px 20px;

  > div {
    min-width: 0;
  }
}

.asset-label {
  color: #999;
  font-size: 14px;
  line-height: 22px;
}

.asset-value {
  margin-top: 4px;
  color: #333;
  font-size: 20px;
  font-weight: 600;
  line-height: 28px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  span {
    margin-left: 4px;
    color: #999;
    font-size: 14px;
    font-weight: 400;
  }
}

.grade-value {
  font-size: 16px;
}

.asset-link {
  flex: 0 0 auto;
  color: $theme_color;
  font-size: 14px;
  white-space: nowrap;
}

.panel {
  border: 1px solid #eee;
  border-radius: 8px;
  background: #fff;
  padding: 16px 20px 20px;
}

.panel-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.panel-title {
  color: #333;
  font-size: 16px;
  font-weight: 600;
  line-height: 24px;
}

.panel-more {
  border: none;
  background: none;
  color: #999;
  font-size: 14px;
  cursor: pointer;
  padding: 0;

  &:hover {
    color: $theme_color;
  }
}

.panel-empty {
  padding: 32px 0;
  color: #999;
  font-size: 14px;
  text-align: center;
}

.order-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.order-row {
  display: flex;
  align-items: center;
  gap: 14px;
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #f0f0f0;
  border-radius: 8px;
  background: #fff;
  cursor: pointer;
  text-align: left;

  &:hover {
    border-color: $theme_color;
  }
}

.order-thumb {
  flex: 0 0 56px;
  width: 56px;
  height: 56px;
  border-radius: 6px;
  background: #f5f5f5;
  overflow: hidden;

  img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.order-info {
  flex: 1;
  min-width: 0;
}

.order-name {
  color: #333;
  font-size: 14px;
  line-height: 22px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.order-more {
  color: #999;
  font-size: 13px;
}

.order-meta {
  margin-top: 4px;
  color: #999;
  font-size: 13px;
  line-height: 20px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.order-side {
  flex: 0 0 auto;
  text-align: right;
}

.order-amount {
  color: #333;
  font-size: 15px;
  font-weight: 600;
  line-height: 22px;
}

.order-status {
  margin-top: 4px;
  color: $theme_color;
  font-size: 13px;
  line-height: 20px;
}

.goods-strip {
  display: flex;
  gap: 12px;
  overflow-x: auto;
  padding-bottom: 4px;
}

.goods-card {
  flex: 0 0 140px;
  display: flex;
  flex-direction: column;
  border: 1px solid #f0f0f0;
  border-radius: 8px;
  background: #fff;
  overflow: hidden;
  cursor: pointer;
  text-align: left;
  padding: 0;

  &:hover {
    border-color: $theme_color;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  }
}

.goods-thumb {
  width: 100%;
  aspect-ratio: 1;
  background: #f5f5f5;
  overflow: hidden;

  img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.goods-name {
  margin: 8px 10px 0;
  color: #333;
  font-size: 13px;
  line-height: 1.4;
  height: 36px;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
}

.goods-price {
  margin: 6px 10px 10px;
  color: $theme_color;
  font-size: 14px;
  font-weight: 600;
  line-height: 1.2;
}
</style>
