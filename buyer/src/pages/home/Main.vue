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
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { Bell } from "@element-plus/icons-vue";
import storage from "@/plugins/storage";
import { getOrderList } from "@/api/order";
import { afterSaleList, getMembersWallet, memberCouponList } from "@/api/member";
import { refreshUnreadMessage } from "@/utils/unreadMessage";
import { useAppStore } from "@/stores/app";

defineOptions({ name: "UserCenterHome" });

const router = useRouter();
const appStore = useAppStore();

function totalOf(res) {
  return res && res.success ? Number(res.result && res.result.total) || 0 : 0;
}

const displayName = ref("会员");
const waitPay = ref(0);
const waitShip = ref(0);
const waitReceive = ref(0);
const afterSale = ref(0);
const couponCount = ref(0);
const balance = ref(0);

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
  ]).then(([pay, ship, receive, afterSaleRes, coupon, wallet]) => {
    waitPay.value = totalOf(pay);
    waitShip.value = totalOf(ship);
    waitReceive.value = totalOf(receive);
    afterSale.value = totalOf(afterSaleRes);
    couponCount.value = totalOf(coupon);
    balance.value = wallet && wallet.success ? wallet.result.memberWallet || 0 : 0;
  });
}

function go(name) {
  router.push({ name });
}

function goOrder(tag) {
  router.push({ name: "MyOrder", query: { tag } });
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
  grid-template-columns: repeat(2, minmax(0, 1fr));
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
  padding: 18px 20px;
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

  span {
    margin-left: 4px;
    color: #999;
    font-size: 14px;
    font-weight: 400;
  }
}

.asset-link {
  color: $theme_color;
  font-size: 14px;
}
</style>
