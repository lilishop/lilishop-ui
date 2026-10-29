<template>
  <div class="wrapper">
    <el-affix :offset="100">
      <el-card class="card fixed-bottom">
        <affixTime @selected="clickBreadcrumb" />
      </el-card>
    </el-affix>

    <el-card class="card">
      <div>
        <h4>交易概况</h4>
        <div class="flex" style="align-items: flex-start;">
          <div class="transactionList">
            <div
              class="transaction-item"
              v-for="(item, index) in transactionList"
              :key="index"
            >
              <h4>{{ item.label }}</h4>
              <div class="transaction-card" v-if="item.label == '转换'">
                <div class="card-item">
                  <div class="card-item-label">访客数UV</div>
                  <div class="card-item-value">
                    {{ overViewList.uvNum || 0 }}
                  </div>
                </div>
                <div class="card-item">
                  <div class="card-item-label">下单转化率</div>
                  <div class="card-item-value">
                    {{ overViewList.orderConversionRate || "0%" }}
                  </div>
                </div>
                <div class="card-item">
                  <div class="card-item-label">付款转化率</div>
                  <div class="card-item-value">
                    {{ overViewList.paymentsConversionRate || "0%" }}
                  </div>
                </div>
                <div class="card-item">
                  <div class="card-item-label">全店转化率</div>
                  <div class="card-item-value">
                    {{ overViewList.overallConversionRate || "0%" }}
                  </div>
                </div>
              </div>
              <div class="transaction-card" v-if="item.label == '订单'">
                <div class="card-item">
                  <div class="card-item-label">下单笔数</div>
                  <div class="card-item-value">
                    {{ overViewList.orderNum || 0 }}
                  </div>
                </div>
                <div class="card-item">
                  <div class="card-item-label">下单人数</div>
                  <div class="card-item-value">
                    {{ overViewList.orderMemberNum || 0 }}
                  </div>
                </div>
                <div class="card-item">
                  <div class="card-item-label">下单金额</div>
                  <div class="card-item-value">
                    {{ $filters.unitPrice(overViewList.orderAmount || 0, "￥") }}
                  </div>
                </div>
                <div class="card-item">
                  <div class="card-item-label">付款笔数</div>
                  <div class="card-item-value">
                    {{ overViewList.paymentOrderNum || 0 }}
                  </div>
                </div>
                <div class="card-item">
                  <div class="card-item-label">付款人数</div>
                  <div class="card-item-value">
                    {{ overViewList.paymentsNum || 0 }}
                  </div>
                </div>
                <div class="card-item">
                  <div class="card-item-label">付款金额</div>
                  <div class="card-item-value">
                    {{ $filters.unitPrice(overViewList.paymentAmount || 0, "￥") }}
                  </div>
                </div>
              </div>
              <div class="transaction-card" v-if="item.label == '退单'">
                <div class="card-item">
                  <div class="card-item-label">退单笔数</div>
                  <div class="card-item-value">
                    {{ overViewList.refundOrderNum || 0 }}
                  </div>
                </div>
                <div class="card-item">
                  <div class="card-item-label">退单金额</div>
                  <div class="card-item-value">
                    {{ $filters.unitPrice(overViewList.refundOrderPrice || 0, "￥") }}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="shap">
            <div class="funnel-card">
              <div class="funnel-header">
                <h4>交易转化漏斗</h4>
                <span class="funnel-sub">全链路转化分析</span>
              </div>
              <div class="funnel-body">
                <svg
                  class="funnel-svg"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 460 236"
                  width="460"
                  height="236"
                >
                  <defs>
                    <linearGradient id="gradTier1" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stop-color="#FF5C58" />
                      <stop offset="100%" stop-color="#E83D39" />
                    </linearGradient>
                    <linearGradient id="gradTier2" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stop-color="#FF8259" />
                      <stop offset="100%" stop-color="#F25B30" />
                    </linearGradient>
                    <linearGradient id="gradTier3" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stop-color="#FFA454" />
                      <stop offset="100%" stop-color="#F28528" />
                    </linearGradient>

                    <filter id="funnelShadow" x="-10%" y="-10%" width="120%" height="130%">
                      <feDropShadow dx="0" dy="2" stdDeviation="2.5" flood-opacity="0.12" />
                    </filter>
                    <filter id="badgeShadow" x="-10%" y="-10%" width="120%" height="130%">
                      <feDropShadow dx="0" dy="1" stdDeviation="2" flood-opacity="0.06" />
                    </filter>
                  </defs>

                  <!-- 连线：左侧 访客 -> 下单 -->
                  <path
                    class="bracket-line"
                    d="M 138 42 L 98 42 Q 90 42 90 50 L 90 102 Q 90 110 98 110 L 161 110"
                  />

                  <!-- 连线：左侧 下单 -> 付款 -->
                  <path
                    class="bracket-line"
                    d="M 161 110 L 98 110 Q 90 110 90 118 L 90 170 Q 90 178 98 178 L 182 178"
                  />

                  <!-- 连线：右侧 全店转化率 -->
                  <path
                    class="bracket-line"
                    d="M 322 42 L 362 42 Q 370 42 370 50 L 370 170 Q 370 178 362 178 L 278 178"
                  />

                  <!-- 漏斗层级 1：访客数 -->
                  <g class="funnel-tier">
                    <polygon
                      points="128,14 332,14 312,70 148,70"
                      fill="url(#gradTier1)"
                      stroke="url(#gradTier1)"
                      stroke-width="6"
                      stroke-linejoin="round"
                      filter="url(#funnelShadow)"
                    />
                    <text x="230" y="37" text-anchor="middle" class="funnel-label">访客数 UV</text>
                    <text x="230" y="59" text-anchor="middle" class="funnel-value">
                      {{ overViewList.uvNum || 0 }}
                    </text>
                  </g>

                  <!-- 漏斗层级 2：下单笔数 -->
                  <g class="funnel-tier">
                    <polygon
                      points="152,82 308,82 290,138 170,138"
                      fill="url(#gradTier2)"
                      stroke="url(#gradTier2)"
                      stroke-width="6"
                      stroke-linejoin="round"
                      filter="url(#funnelShadow)"
                    />
                    <text x="230" y="105" text-anchor="middle" class="funnel-label">下单笔数</text>
                    <text x="230" y="127" text-anchor="middle" class="funnel-value">
                      {{ overViewList.orderNum || 0 }}
                    </text>
                  </g>

                  <!-- 漏斗层级 3：付款笔数 -->
                  <g class="funnel-tier">
                    <polygon
                      points="174,150 286,150 270,206 190,206"
                      fill="url(#gradTier3)"
                      stroke="url(#gradTier3)"
                      stroke-width="6"
                      stroke-linejoin="round"
                      filter="url(#funnelShadow)"
                    />
                    <text x="230" y="173" text-anchor="middle" class="funnel-label">付款笔数</text>
                    <text x="230" y="195" text-anchor="middle" class="funnel-value">
                      {{ overViewList.paymentOrderNum || 0 }}
                    </text>
                  </g>

                  <!-- 左侧卡片 1：下单转化率 -->
                  <g transform="translate(6, 57)" filter="url(#badgeShadow)">
                    <rect width="80" height="38" class="badge-bg" />
                    <text x="40" y="16" text-anchor="middle" class="badge-title">下单转化率</text>
                    <text x="40" y="31" text-anchor="middle" class="badge-value">
                      {{ overViewList.orderConversionRate || "0%" }}
                    </text>
                  </g>

                  <!-- 左侧卡片 2：付款转化率 -->
                  <g transform="translate(6, 125)" filter="url(#badgeShadow)">
                    <rect width="80" height="38" class="badge-bg" />
                    <text x="40" y="16" text-anchor="middle" class="badge-title">付款转化率</text>
                    <text x="40" y="31" text-anchor="middle" class="badge-value">
                      {{ overViewList.paymentsConversionRate || "0%" }}
                    </text>
                  </g>

                  <!-- 右侧卡片：全店转化率 -->
                  <g transform="translate(374, 91)" filter="url(#badgeShadow)">
                    <rect width="80" height="38" class="badge-bg-highlight" />
                    <text x="40" y="16" text-anchor="middle" class="badge-title">全店转化率</text>
                    <text x="40" y="31" text-anchor="middle" class="badge-value-highlight">
                      {{ overViewList.overallConversionRate || "0%" }}
                    </text>
                  </g>
                </svg>
              </div>
              <div class="funnel-summary">
                <div class="summary-col">
                  <div class="dot dot-tier1"></div>
                  <div class="summary-text">
                    <span class="label">访客UV</span>
                    <span class="val">{{ overViewList.uvNum || 0 }}</span>
                  </div>
                </div>
                <div class="summary-arrow">➔</div>
                <div class="summary-col">
                  <div class="dot dot-tier2"></div>
                  <div class="summary-text">
                    <span class="label">下单笔数</span>
                    <span class="val">{{ overViewList.orderNum || 0 }}</span>
                  </div>
                </div>
                <div class="summary-arrow">➔</div>
                <div class="summary-col">
                  <div class="dot dot-tier3"></div>
                  <div class="summary-text">
                    <span class="label">付款笔数</span>
                    <span class="val">{{ overViewList.paymentOrderNum || 0 }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </el-card>

    <el-card class="card">
      <div>
        <h4>交易趋势</h4>
        <div></div>
      </div>

      <div>
        <div id="orderChart"></div>
      </div>
    </el-card>

    <el-card class="card">
      <el-tabs v-model="orderOrRefund">
        <el-tab-pane label="订单" name="order">
          <el-table stripe :data="data" style="width: 100%">
            <el-table-column type="expand" width="50">
              <template #default="{ row }">
                <orderRow v-if="row" :res="row" />
              </template>
            </el-table-column>
            <el-table-column prop="storeName" label="商家名称" min-width="120" />
            <el-table-column prop="memberName" label="用户名" min-width="100" />
            <el-table-column label="订单状态" min-width="100">
              <template #default="{ row }">
                <span v-if="row">{{ orderStatusList[row.orderStatus] }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="createTime" label="创建时间" min-width="160" />
            <el-table-column label="支付时间" min-width="160">
              <template #default="{ row }">
                <span v-if="row">{{ row.paymentTime || "暂无" }}</span>
              </template>
            </el-table-column>
            <el-table-column label="价格" min-width="110">
              <template #default="{ row }">
                <span v-if="row" :style="{ color: $mainColor }">
                  {{ $filters.unitPrice(row.flowPrice, "￥") }}</span>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="80" align="center">
              <template #default="{ row }">
                <a v-if="row" class="link-text" @click="goDetail(row)">查看</a>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <el-tab-pane label="退单" name="refund">
          <el-table stripe :data="data" style="width: 100%">
            <el-table-column type="expand" width="50">
              <template #default="{ row }">
                <refundRow v-if="row" :res="row" />
              </template>
            </el-table-column>
            <el-table-column label="商品图片" width="90" align="center">
              <template #default="{ row }">
                <img
                  v-if="row && row.goodsImage"
                  :src="row.goodsImage"
                  style="width: 60px; vertical-align: middle"
                  alt=""
                />
              </template>
            </el-table-column>
            <el-table-column prop="goodsName" label="商品名称" min-width="140" show-overflow-tooltip />
            <el-table-column prop="storeName" label="商家名称" min-width="120" />
            <el-table-column label="售后单类型" min-width="100">
              <template #default="{ row }">
                <span v-if="row">{{ serviceTypeList[row.serviceType] }}</span>
              </template>
            </el-table-column>
            <el-table-column label="售后单状态" min-width="120">
              <template #default="{ row }">
                <span v-if="row">{{ serviceStatusList[row.serviceStatus] }}</span>
              </template>
            </el-table-column>
            <el-table-column label="退款时间" min-width="160">
              <template #default="{ row }">
                <span v-if="row">{{ row.refundTime || "暂无" }}</span>
              </template>
            </el-table-column>
            <el-table-column label="申请退款金额" min-width="120">
              <template #default="{ row }">
                <span v-if="row" :style="{ color: $mainColor }">
                  {{ $filters.unitPrice(row.applyRefundPrice, "￥") }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="reason" label="申请原因" min-width="120" show-overflow-tooltip />
            <el-table-column label="实际金额" min-width="110">
              <template #default="{ row }">
                <span v-if="row">{{ $filters.unitPrice(row.flowPrice || 0, "￥") }}</span>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="90" align="center">
              <template #default="{ row }">
                <a v-if="row" class="link-text" @click="goDetail(row)">查看</a>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
      <el-pagination
        v-if="showRecords"
        v-model:current-page="refundParams.pageNumber"
        v-model:page-size="refundParams.pageSize"
        class="mt_10"
        :total="total"
        :page-sizes="[20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        size="small"
      />
    </el-card>
  </div>
</template>
<script setup>
import { onMounted, ref, watch } from "vue";
import { useRouter } from "vue-router";
import * as API_Goods from "@/api/goods";
import { Chart } from "@antv/g2";
import orderRow from "./order/orderDetail";
import refundRow from "./order/refundOrder";
import affixTime from "@/components/affix-time";

const router = useRouter();

const orderOrRefund = ref("order"); // order | refund
const total = ref(0); // 总数
// 订单状态
const orderStatusList = ref({
  UNDELIVERED: "待发货",
  UNPAID: "未付款",
  PAID: "已付款",
  DELIVERED: "已发货",
  CANCELLED: "已关闭",
  COMPLETED: "已完成",
  TAKE: "已完成",
});

const serviceTypeList = ref({
  // 服务类型
  CANCEL: "取消",
  RETURN_GOODS: "退货",
  EXCHANGE_GOODS: "换货",
  RETURN_MONEY: "退款",
});
const serviceStatusList = ref({
  // 服务状态
  APPLY: "申请售后",
  PASS: "通过售后",
  REFUSE: "拒绝售后",
  BUYER_RETURN: "买家退货，待卖家收货",
  SELLER_RE_DELIVERY: "商家换货/补发",
  SELLER_CONFIRM: "卖家确认收货",
  SELLER_TERMINATION: "卖家终止售后",
  BUYER_CONFIRM: "买家确认收货",
  BUYER_CANCEL: "买家取消售后",
  WAIT_REFUND: "等待平台退款",
  COMPLETE: "完成售后",
});
//

const data = ref([]);

// 交易概况
const transactionList = ref([
  {
    label: "转换",
    value: "",
  },
  {
    label: "订单",
    value: "",
  },
  {
    label: "退单",
    value: "",
  },
]);

const chartList = ref([]); // 绘制订单图表数据
const orderChart = ref(""); //订单图表

const overViewList = ref({}); // 绘制订单统计概览
const overViewChart = ref(""); //订单订单统计概览图标

// 时间
const dateList = ref([
  {
    title: "今天",
    selected: false,
    value: "TODAY",
  },
  {
    title: "昨天",
    selected: false,
    value: "YESTERDAY",
  },
  {
    title: "过去7天",
    selected: true,
    value: "LAST_SEVEN",
  },
  {
    title: "过去30天",
    selected: false,
    value: "LAST_THIRTY",
  },
]);
// 订单传参
const orderParams = ref({
  searchType: "LAST_SEVEN", // TODAY ,  YESTERDAY , LAST_SEVEN , LAST_THIRTY
  year: "",
  shopId: "",
  memberId: "",
});
// 订单概念
const overViewParams = ref({
  month: "",
  searchType: "LAST_SEVEN", // TODAY ,  YESTERDAY , LAST_SEVEN , LAST_THIRTY
  storeId: "",
  year: "",
});
const defaultParams = ref({
  month: "",
  searchType: "LAST_SEVEN", // TODAY ,  YESTERDAY , LAST_SEVEN , LAST_THIRTY
  storeId: "",
  year: "",
});
// 退单订单
const refundParams = ref({
  pageNumber: 1,
  pageSize: 20,
  searchType: "LAST_SEVEN",
  storeId: "",
  year: "",
});
const showRecords = ref(false);

//
//

watch(
  refundParams,
  (val) => {
    getOrderList();
  },
  { deep: true, immediate: true }
);
watch(orderOrRefund, () => {
  showRecords.value = false;
  refundParams.value.pageNumber = 1;
  getOrderList();
});
watch(
  orderParams,
  () => {
    initOrderChartList();
  },
  { deep: true }
);
watch(
  overViewParams,
  () => {
    initOrderOverViewList();
  },
  { deep: true }
);

function goDetail(row) {
  const sn = row.sn;
  const path = orderOrRefund.value === "order" ? "order-detail" : "after-order-detail";
  router.push({ path, query: { sn } });
}
// 订单图
function initOrderChart() {
  // 默认已经加载 legend-filter 交互
  let data = chartList.value;

  data.forEach((item) => {
    item.createTime = item.createTime.split(" ")[0];
    item.title = "交易额";
  });
  orderChart.value.data(data);

  orderChart.value.tooltip({
    showCrosshairs: true,
    shared: true,
  });

  orderChart.value
    .line()
    .position("createTime*price")
    .label("price")
    .color("title")
    .shape("smooth");

  orderChart.value
    .point()
    .position("createTime*price")
    .label("price")
    .color("title")
    .shape("circle")
    .style({
      stroke: "#fff",
      lineWidth: 1,
    });
  orderChart.value.area().position("createTime*price").color("title").shape("smooth");

  orderChart.value.render();
}

function clickBreadcrumb(item, index) {
  let callback = JSON.parse(JSON.stringify(item));
  orderParams.value = callback;

  overViewParams.value = callback;
  refundParams.value = callback;
  refundParams.value.pageNumber = 1;
  refundParams.value.pageSize = 20;
}

// 实例化订单概览
async function initOrderOverViewList() {
  const res = await API_Goods.getOrderOverView(overViewParams.value);
  if (res.success) {
    overViewList.value = res.result;
  }
}
// 实例化订单图表
async function initOrderChartList(name) {
  orderChart.value ? orderChart.value.clear() : "";
  const res = await API_Goods.getOrderChart(orderParams.value);
  if (res.success) {
    chartList.value = res.result;

    if (!orderChart.value) {
      const container = document.getElementById("orderChart");
      if (!container) return;
      orderChart.value = new Chart({
        container: "orderChart",
        autoFit: true,
        height: 500,
        padding: [70, 70, 70, 70],
      });
    }

    initOrderChart(); //订单表
  }
}
// 统计相关订单统计
async function getOrderList() {
  let res;
  if (orderOrRefund.value === "order") {
    // 订单
    res = await API_Goods.statisticsOrderList(refundParams.value);
  } else {
    // 退单
    res = await API_Goods.statisticsOrderRefundList(refundParams.value);
  }
  if (res.success) {
    showRecords.value = true;
    data.value = res.result.records;
    total.value = res.result.total;
  }
}

// 实例化初始值
function initBaseParams() {
  let data = new Date();
  getOrderList();
  orderParams.value.year = data.getFullYear();
  overViewParams.value.year = data.getFullYear();
}

onMounted(() => {
  initBaseParams();
});
</script>
<style scoped lang="scss">
.active {
  color: $theme_color;
  position: relative;

  &::before {
    content: "";
    position: absolute;
    width: 100%;
    height: 3px;
    bottom: -5px;
    left: 0;
    background: $theme_color;
  }
}
.breadcrumb {
  span {
    cursor: pointer;
  }
}

.page-col {
  text-align: right;
  margin: 10px 0;
}
.wrapper {
  padding-bottom: 200px;
}
.page {
  text-align: right;
  margin: 20px 0;
}
.shap {
  width: 480px;
  flex-shrink: 0;
  margin-left: 10px;
}

.funnel-card {
  background: #fbfcfe;
  border: 1px solid #ebedf0;
  border-radius: 8px;
  padding: 16px 14px 14px;
  display: flex;
  flex-direction: column;
}

.funnel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
  padding: 0 6px;

  h4 {
    margin: 0;
    font-size: 15px;
    font-weight: 600;
    color: #303133;
  }

  .funnel-sub {
    font-size: 12px;
    color: #909399;
  }
}

.funnel-body {
  width: 100%;
  display: flex;
  justify-content: center;
}

.funnel-svg {
  display: block;
  max-width: 100%;
  height: auto;

  .funnel-label {
    font-size: 13px;
    fill: rgba(255, 255, 255, 0.94);
    font-weight: 500;
  }

  .funnel-value {
    font-size: 17px;
    font-weight: 700;
    fill: #ffffff;
    letter-spacing: 0.5px;
  }

  .bracket-line {
    fill: none;
    stroke: #cbd5e1;
    stroke-width: 1.5;
    stroke-dasharray: 4, 3;
  }

  .badge-bg {
    fill: #ffffff;
    stroke: #e2e8f0;
    stroke-width: 1;
    rx: 6px;
  }

  .badge-bg-highlight {
    fill: #fff7f6;
    stroke: #ffccc7;
    stroke-width: 1;
    rx: 6px;
  }

  .badge-title {
    font-size: 12px;
    fill: #64748b;
    font-weight: 400;
  }

  .badge-value {
    font-size: 13px;
    font-weight: 700;
    fill: #1e293b;
  }

  .badge-value-highlight {
    font-size: 13px;
    font-weight: 700;
    fill: #e83d39;
  }
}

.funnel-tier {
  cursor: pointer;
  transition: transform 0.2s ease, filter 0.2s ease;

  &:hover {
    filter: brightness(1.04);
  }
}

.funnel-summary {
  display: flex;
  align-items: center;
  justify-content: space-around;
  margin-top: 12px;
  padding: 10px 14px;
  background: #ffffff;
  border-radius: 6px;
  border: 1px solid #f0f2f5;

  .summary-col {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    flex-shrink: 0;

    &.dot-tier1 {
      background: #ff5c58;
    }
    &.dot-tier2 {
      background: #ff8259;
    }
    &.dot-tier3 {
      background: #ffa454;
    }
  }

  .summary-text {
    display: flex;
    flex-direction: column;

    .label {
      font-size: 11px;
      color: #909399;
      line-height: 1.2;
    }

    .val {
      font-size: 13px;
      font-weight: 600;
      color: #303133;
      line-height: 1.3;
    }
  }

  .summary-arrow {
    color: #dcdfe6;
    font-size: 12px;
  }
}

.transaction-item {
  margin: 10px 0;
}
h4 {
  margin: 0 0 20px 0;
}
.transactionList {
  flex: 1;
  min-width: 0;
  padding-right: 20px;
}

.transaction-card {
  height: 120px;
  border-radius: 0.4em;
  display: flex;
  background: #f3f5f7;
}
.card-item-label {
  font-weight: bold;
  color: #666;
  font-size: 15px;
  margin-bottom: 10px;
}
.card-item-value {
  font-size: 15px;
  font-weight: bold;
  color: $theme_color;
}
.card-item {
  height: 100%;

  width: 20%;
  align-items: center;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
}

.order-col {
  display: flex;
  > div {
    margin-right: 8px;
    padding: 16px;
    font-size: 15px;
  }
}
.order-list {
  display: flex;
}
.tips {
  margin: 0 8px;
}
.card {
  margin-bottom: 10px;
}
.link-text {
  color: #409eff;
  cursor: pointer;
  text-decoration: none;
}
.mt_10 {
  margin-top: 10px;
}
</style>
