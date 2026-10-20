<template>
  <div class="wrapper">
    <el-affix :offset="100">
      <el-card class="card fixed-bottom">
        <affixTime :closeShop="true" @selected="clickBreadcrumb" />
      </el-card>
    </el-affix>

    <el-card class="card">
      <div>
        <h4>交易概况</h4>
        <div class="flex">
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
                <div class="card-item highlight">
                  <div class="card-item-label">下单转化率</div>
                  <div class="card-item-value">
                    {{ overViewList.orderConversionRate || "0%" }}
                  </div>
                </div>
                <div class="card-item highlight">
                  <div class="card-item-label">付款转化率</div>
                  <div class="card-item-value">
                    {{ overViewList.paymentsConversionRate || "0%" }}
                  </div>
                </div>
                <div class="card-item highlight">
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
                <div class="card-item highlight">
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
                <div class="card-item highlight">
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
                <div class="card-item highlight">
                  <div class="card-item-label">退单金额</div>
                  <div class="card-item-value">
                    {{ $filters.unitPrice(overViewList.refundOrderPrice || 0, "￥") }}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="shap">
            <div class="funnel">
              <div class="funnel-layer funnel-layer-uv">
                <span class="layer-name">访客数</span>
                <span class="layer-val">{{ overViewList.uvNum || 0 }}</span>
              </div>
              <div class="funnel-gap">
                <span class="funnel-tag">
                  <span class="funnel-tag-arrow">↓</span>
                  下单转化率 <b>{{ overViewList.orderConversionRate || "0%" }}</b>
                </span>
              </div>
              <div class="funnel-layer funnel-layer-order">
                <span class="layer-name">下单笔数</span>
                <span class="layer-val">{{ overViewList.orderNum || 0 }}</span>
              </div>
              <div class="funnel-gap">
                <span class="funnel-tag">
                  <span class="funnel-tag-arrow">↓</span>
                  付款转化率 <b>{{ overViewList.paymentsConversionRate || "0%" }}</b>
                </span>
              </div>
              <div class="funnel-layer funnel-layer-pay">
                <span class="layer-name">付款笔数</span>
                <span class="layer-val">{{ overViewList.paymentOrderNum || 0 }}</span>
              </div>
              <div class="funnel-total">
                <span class="funnel-total-label">整体转化率</span>
                <span class="funnel-total-val">{{ overViewList.overallConversionRate || "0%" }}</span>
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
import * as API_Goods from "@/api/goods";
import orderRow from "./order/orderDetail";
import refundRow from "./order/refundOrder";
import affixTime from "@/views/lili-components/affix-time";

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
// G2 图表实例（原 data 中初始化为 ""）
const orderChart = ref(""); //订单图表

const overViewList = ref({}); // 绘制订单统计概览

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
      const { Chart } = await import("@antv/g2");
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
  width: 420px;
  margin: 0 10px;
  align-self: center;
  flex-shrink: 0;
}
.funnel {
  display: flex;
  flex-direction: column;
  align-items: center;

  .funnel-layer {
    height: 84px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: #fff;
    filter: drop-shadow(0 4px 8px rgba(243, 25, 71, 0.18));
    .layer-name {
      font-size: 14px;
      font-weight: 600;
      opacity: 0.95;
    }
    .layer-val {
      font-size: 22px;
      font-weight: 700;
      margin-top: 2px;
    }
  }
  .funnel-layer-uv {
    width: 400px;
    background: linear-gradient(135deg, #ff5f4d 0%, #f3223e 100%);
    clip-path: polygon(0 0, 100% 0, 90% 100%, 10% 100%);
  }
  .funnel-layer-order {
    width: 320px;
    background: linear-gradient(135deg, #ff8a76 0%, #ff6252 100%);
    clip-path: polygon(0 0, 100% 0, 87.5% 100%, 12.5% 100%);
  }
  .funnel-layer-pay {
    width: 240px;
    background: linear-gradient(135deg, #ffb28f 0%, #ff8f66 100%);
    clip-path: polygon(0 0, 100% 0, 83.3% 100%, 16.7% 100%);
  }

  // 层间转化率标签
  .funnel-gap {
    height: 34px;
    margin: -1px 0;
    display: flex;
    align-items: center;
    position: relative;
    &::before {
      content: "";
      position: absolute;
      left: 50%;
      top: 0;
      bottom: 0;
      border-left: 2px dashed #f3c6ce;
    }
  }
  .funnel-tag {
    position: relative;
    z-index: 1;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: #fff;
    border: 1px solid #f0d5da;
    border-radius: 999px;
    padding: 4px 14px;
    font-size: 12px;
    color: #666;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.06);
    .funnel-tag-arrow {
      color: $theme_color;
      font-weight: 700;
    }
    b {
      color: $theme_color;
      font-weight: 700;
      font-size: 13px;
    }
  }

  // 整体转化率
  .funnel-total {
    margin-top: 20px;
    display: flex;
    align-items: center;
    gap: 10px;
    background: linear-gradient(135deg, #fff1f3, #ffe4e9);
    border: 1px solid #ffd3db;
    border-radius: 10px;
    padding: 12px 24px;
  }
  .funnel-total-label {
    font-size: 13px;
    color: #a0505e;
  }
  .funnel-total-val {
    font-size: 22px;
    font-weight: 700;
    color: $theme_color;
  }
}

.transaction-item {
  margin: 10px 0;
}
h4 {
  margin: 0 0 20px 0;
}
.transactionList {
  flex: 7;
  padding: 0 20px;
  min-width: 0;
}

.transaction-card {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}
.card-item {
  position: relative;
  flex: 1 1 150px;
  min-width: 0;
  overflow: hidden;
  background: #fff;
  border: 1px solid #eceff3;
  border-radius: 8px;
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  transition: all 0.2s;
  &::before {
    content: "";
    position: absolute;
    left: 0;
    top: 14px;
    bottom: 14px;
    width: 3px;
    border-radius: 2px;
    background: linear-gradient(180deg, #ff5f4d, $theme_color);
  }
  &:hover {
    box-shadow: 0 4px 14px rgba(0, 0, 0, 0.08);
  }
  &.highlight .card-item-value {
    color: $theme_color;
  }
}
.card-item-label {
  color: #999;
  font-size: 12px;
  margin-bottom: 6px;
  padding-left: 8px;
}
.card-item-value {
  font-size: 20px;
  font-weight: 700;
  color: #333;
  line-height: 1.2;
  padding-left: 8px;
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
