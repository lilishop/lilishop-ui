<template>
  <div>
    <el-dialog v-model="noticeFlage" :title="noticesDetail.title">
      <div v-if="noticesDetail" class="noticesDetail" v-html="noticesDetail.content"></div>
    </el-dialog>
    <div class="box flex">
      <div class="box-left">
        <div class="card shop flex">
          <div>
            <h4>Hi,<span style="margin-left: 5px">{{ userData.nickName }}</span></h4>
            <img
              class="shop-logo"
              :src="userData.storeLogo || defaultLogo"
              alt=""
            />
          </div>
          <div class="shop-box">
            <div class="box-item">
              <div>店铺名称：{{ userData.storeName || "暂无" }}</div>
            </div>
            <div class="box-item">
              <div>店铺状态：{{ userData.storeDisable == "OPEN" ? "开启中" : "关闭" }}</div>
            </div>
            <div class="box-item" @click="im()">
              <el-button type="warning" :loading="load">点击登录客服</el-button>
            </div>
          </div>

          <div class="rate-box">
            <div>
              <el-progress
                type="circle"
                :width="120"
                :stroke-width="5"
                :percentage="userData.serviceScore * 20"
                color="#fecb89"
              >
                <template #default>
                  <p class="bold">{{ userData.serviceScore }}分</p>
                </template>
              </el-progress>
              <h5>服务得分</h5>
            </div>
            <div>
              <el-progress
                type="circle"
                :width="120"
                :stroke-width="5"
                :percentage="userData.deliveryScore * 20"
                color="#a7c5eb"
              >
                <template #default>
                  <p class="bold">{{ userData.deliveryScore }}分</p>
                </template>
              </el-progress>
              <h5>交货得分</h5>
            </div>
            <div>
              <el-progress
                type="circle"
                :width="120"
                :stroke-width="5"
                :percentage="userData.descriptionScore * 20"
                color="#848ccf"
              >
                <template #default>
                  <p class="bold">{{ userData.descriptionScore }}分</p>
                </template>
              </el-progress>
              <h5>评价得分</h5>
            </div>
          </div>
        </div>
        <div class="card">
          <h4>待办事项</h4>
          <div class="todo-group-list">
            <div class="todo-group">
              <div class="todo-item" @click="navigateTo('orderList', { orderStatus: 'UNPAID' })">
                <div class="todo-item-label">待付款订单</div>
                <span>{{ homeData.unPaidOrder || 0 }}</span>
              </div>
              <div class="todo-item" @click="navigateTo('orderList', { orderStatus: 'UNDELIVERED' })">
                <div class="todo-item-label">待发货订单</div>
                <span>{{ homeData.unDeliveredOrder || 0 }}</span>
              </div>
              <div class="todo-item" @click="navigateTo('orderList', { orderStatus: 'DELIVERED' })">
                <div class="todo-item-label">待收货订单</div>
                <span>{{ homeData.deliveredOrder || 0 }}</span>
              </div>
              <div class="todo-item" @click="navigateTo('orderList', { orderStatus: 'TAKE' })">
                <div class="todo-item-label">待核验订单</div>
                <span>{{ homeData.waitCheckOrder || 0 }}</span>
              </div>
            </div>
            <div class="todo-group">
              <div class="todo-item" @click="navigateAfterSale('APPLY')">
                <div class="todo-item-label">待审核退单</div>
                <span>{{ afterSaleNumData.applyNum || 0 }}</span>
              </div>
              <div class="todo-item" @click="navigateAfterSale('PASS')">
                <div class="todo-item-label">待填写物流退单</div>
                <span>{{ afterSaleNumData.passNum || 0 }}</span>
              </div>
              <div class="todo-item" @click="navigateAfterSale('BUYER_RETURN')">
                <div class="todo-item-label">待收货退单</div>
                <span>{{ afterSaleNumData.buyerReturnNum || 0 }}</span>
              </div>
              <div class="todo-item" @click="navigateAfterSale('WAIT_REFUND')">
                <div class="todo-item-label">待退款退单</div>
                <span>{{ afterSaleNumData.waitRefundNum || 0 }}</span>
              </div>
            </div>
            <div class="todo-group">
              <div class="todo-item" @click="navigateTo('alertQuantityWarnList')">
                <div class="todo-item-label">库存预警商品</div>
                <span>{{ homeData.alertQuantityNum || 0 }}</span>
              </div>
              <div class="todo-item" @click="navigateToProcurementAudit()">
                <div class="todo-item-label">待审核采购单</div>
                <span>{{ procurementStatusCount.SUBMITTED || 0 }}</span>
              </div>
              <div class="todo-item" @click="navigateTo('goods', { goodsStatus: 'TOBEAUDITED' })">
                <div class="todo-item-label">待审核商品</div>
                <span>{{ homeData.waitAuth || 0 }}</span>
              </div>
              <div class="todo-item" @click="navigateTo('storeBill', { billStatus: 'OUT' })">
                <div class="todo-item-label">待结算账单</div>
                <span>{{ homeData.waitPayBill || 0 }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="card box-right">
        <h4>平台公告</h4>
        <div>
          <div class="notice-title" v-for="(item, index) in notices" :key="index">
            <a @click="clickLinkNotices(item)">{{ item.title }}</a>
          </div>
        </div>
      </div>
    </div>

    <div class="card">
      <h4>经营概览</h4>
      <div class="overview-list flex">
        <div class="overview-item" @click="navigateTo('orderStatistics')">
          <div class="overview-label">今日销售额</div>
          <div class="overview-value">
            {{ $filters.unitPrice(overviewToday.paymentAmount || 0, "￥") }}
          </div>
          <div class="overview-sub">
            昨日 {{ $filters.unitPrice(overviewYesterday.paymentAmount || 0, "￥") }}
            <span :class="compareClass(overviewToday.paymentAmount, overviewYesterday.paymentAmount)">
              {{ compareText(overviewToday.paymentAmount, overviewYesterday.paymentAmount) }}
            </span>
          </div>
        </div>
        <div class="overview-item" @click="navigateTo('orderList')">
          <div class="overview-label">今日订单量</div>
          <div class="overview-value">{{ overviewToday.orderNum || 0 }}</div>
          <div class="overview-sub">
            昨日 {{ overviewYesterday.orderNum || 0 }}
            <span :class="compareClass(overviewToday.orderNum, overviewYesterday.orderNum)">
              {{ compareText(overviewToday.orderNum, overviewYesterday.orderNum) }}
            </span>
          </div>
        </div>
        <div class="overview-item" @click="navigateTo('trafficStatistics')">
          <div class="overview-label">今日访客数</div>
          <div class="overview-value">{{ overviewToday.uvNum || 0 }}</div>
          <div class="overview-sub">
            昨日 {{ overviewYesterday.uvNum || 0 }}
            <span :class="compareClass(overviewToday.uvNum, overviewYesterday.uvNum)">
              {{ compareText(overviewToday.uvNum, overviewYesterday.uvNum) }}
            </span>
          </div>
        </div>
        <div class="overview-item" @click="navigateTo('goods')">
          <div class="overview-label">在售商品</div>
          <div class="overview-value">{{ homeData.goodsNum || 0 }}</div>
        </div>
        <div class="overview-item" @click="navigateTo('goods', { goodsStatus: 'TOBEAUDITED' })">
          <div class="overview-label">待审核商品</div>
          <div class="overview-value">{{ homeData.waitAuth || 0 }}</div>
        </div>
      </div>
    </div>

    <div class="card">
      <h4>商品销售排行 TOP10</h4>
      <div class="rank-tip">统计区间：近7天</div>
      <el-table stripe :data="topGoodsData" style="width: 100%">
        <el-table-column type="index" label="排名" width="80" align="center" />
        <el-table-column prop="goodsName" label="商品名称" min-width="200" show-overflow-tooltip />
        <el-table-column prop="goodsId" label="商品编码" min-width="160" show-overflow-tooltip />
        <el-table-column prop="orderNum" label="下单笔数" width="120" align="center" />
        <el-table-column label="下单金额" width="140" align="right">
          <template #default="{ row }">
            <span :style="{ color: $mainColor }">
              {{ $filters.unitPrice(row.price || 0, "￥") }}
            </span>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script>
import defaultLogo from "@/assets/logo1.png";
import { getSellerHomeData, getHomeNotice } from "@/api/index";
import { getOrderOverView, goodsStatistics } from "@/api/goods";
import { getAfterSaleNumVO } from "@/api/order";
import { getProcurementOrderStatusCount } from "@/api/procurement";
import { getIMDetail } from "@/api/common";
import { seeArticle } from "@/api/pages";
import Cookies from "js-cookie";
import { userMsg } from "@/api/index";

const HOME_ROUTE_TARGETS = {
  orderList: { name: "orderList", path: "/order/orderList" },
  returnMoneyOrder: { name: "returnMoneyOrder", path: "/order/returnMoneyOrder" },
  returnGoodsOrder: { name: "returnGoodsOrder", path: "/order/returnGoodsOrder" },
  memberComment: { name: "memberComment", path: "/order/memberComment" },
  goods: { name: "goods", path: "/goods" },
  alertQuantityWarnList: { name: "alertQuantityWarnList", path: "/alertQuantityWarnList" },
  orderStatistics: { name: "orderStatistics", path: "/statistics/orderStatistics" },
  trafficStatistics: { name: "trafficStatistics", path: "/statistics/trafficStatistics" },
  accountStatementBill: { name: "accountStatementBill", path: "/bill/accountStatementBill" },
  storeBill: { name: "storeBill", path: "/bill/storeBill" },
  procurementPurchaseOrderList: {
    name: "procurementPurchaseOrderList",
    path: "/procurement/purchase-order/list",
  },
};

const AFTER_SALE_RETURN_GOODS_STATUSES = ["PASS", "BUYER_RETURN"];

export default {
  name: "home",
  data() {
    return {
      defaultLogo,
      noticeFlage: false,
      homeData: {},
      overviewToday: {},
      overviewYesterday: {},
      topGoodsData: [],
      afterSaleNumData: {},
      procurementStatusCount: {},
      userData: "",
      notices: "",
      noticesDetail: {
        title: "",
      },
      IMLink: "",
      load: false,
    };
  },
  methods: {
    navigateAfterSale(serviceStatus) {
      const routeKey = AFTER_SALE_RETURN_GOODS_STATUSES.includes(serviceStatus)
        ? "returnGoodsOrder"
        : "returnMoneyOrder";
      this.navigateTo(routeKey, { serviceStatus });
    },
    navigateToProcurementAudit() {
      this.navigateTo("procurementPurchaseOrderList", { status: "SUBMITTED" });
    },
    navigateTo(key, query) {
      const target = HOME_ROUTE_TARGETS[key] || { name: key };
      if (target.name && this.$router.hasRoute(target.name)) {
        this.$router.push({ name: target.name, query });
        return;
      }
      if (target.path) {
        const resolved = this.$router.resolve({ path: target.path, query });
        if (resolved.matched.length > 0) {
          this.$router.push({ path: target.path, query });
          return;
        }
      }
      this.$Message.warning("暂无权限访问该页面");
    },
    compareText(today, yesterday) {
      const t = Number(today) || 0;
      const y = Number(yesterday) || 0;
      if (y === 0) {
        return t > 0 ? "↑ --" : "—";
      }
      const rate = (((t - y) / y) * 100).toFixed(1);
      if (t > y) return `↑ ${rate}%`;
      if (t < y) return `↓ ${Math.abs(rate)}%`;
      return "—";
    },
    compareClass(today, yesterday) {
      const t = Number(today) || 0;
      const y = Number(yesterday) || 0;
      if (t > y) return "compare-up";
      if (t < y) return "compare-down";
      return "compare-flat";
    },
    async init() {
      const userInfo = JSON.parse(Cookies.get("userInfoSeller"));
      this.userData = userInfo;

      const res = await getHomeNotice();
      if (res.success) {
        this.notices = res.result.records;
      }
    },
    async clickLinkNotices(val) {
      const res = await seeArticle(val.id);
      if (res.success) {
        this.noticesDetail = res.result;
        this.noticeFlage = true;
      }
    },
    async im() {
      const accessToken = this.getStore("accessToken");
      this.load = true;
      await this.getIMDetailMethods();
      const userInfo = await userMsg();
      this.load = false;
      if (userInfo.success && this.IMLink) {
        window.open(`${this.IMLink}?token=` + accessToken);
      } else {
        this.$Message.error("请登录后再联系客服");
      }
    },
    async getIMDetailMethods() {
      const res = await getIMDetail();
      if (res.success) {
        this.IMLink = res.result;
      }
    },
    async getHomeData() {
      const res = await getSellerHomeData();
      if (res.success) {
        this.homeData = res.result;
      }
    },
    async loadOverview() {
      const year = new Date().getFullYear();
      const [todayRes, yesterdayRes] = await Promise.all([
        getOrderOverView({ searchType: "TODAY", year }),
        getOrderOverView({ searchType: "YESTERDAY", year }),
      ]);
      if (todayRes.success) {
        this.overviewToday = todayRes.result || {};
      }
      if (yesterdayRes.success) {
        this.overviewYesterday = yesterdayRes.result || {};
      }
    },
    async loadSalesRank() {
      const year = new Date().getFullYear();
      const res = await goodsStatistics({
        searchType: "LAST_SEVEN",
        year,
        type: "NUM",
      });
      if (res.success && res.result) {
        this.topGoodsData = res.result.slice(0, 10);
      }
    },
    async loadAfterSaleNum() {
      const res = await getAfterSaleNumVO({});
      if (res.success) {
        this.afterSaleNumData = res.result || {};
      }
    },
    async loadProcurementStatusCount() {
      const res = await getProcurementOrderStatusCount({});
      if (res.success) {
        this.procurementStatusCount = res.result || {};
      }
    },
  },
  mounted() {
    this.init();
    this.getHomeData();
    this.loadOverview();
    this.loadSalesRank();
    this.loadAfterSaleNum();
    this.loadProcurementStatusCount();
  },
};
</script>

<style lang="scss" scoped>
@import "./home.scss";
.noticesDetail {
  font-size: 14px;
  line-height: 1.6;
  color: #333;

  :deep(img) {
    max-width: 100%;
    max-height: 200px;
  }
}
</style>
