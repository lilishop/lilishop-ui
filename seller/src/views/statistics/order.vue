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
            <div id="overViewChart">
              <!-- 上 -->
              <div class="block">
                <div class="box">
                  <span>访客数</span>
                  <span>{{ overViewList.uvNum || 0 }}</span>
                </div>
              </div>
              <!-- 中 -->
              <div class="block">
                <div class="box">
                  <span>下单笔数</span>
                  <span>{{ overViewList.orderNum || 0 }}</span>
                </div>
              </div>
              <!-- 下 -->
              <div class="block">
                <div class="box">
                  <span>付款笔数</span>
                  <span>{{ overViewList.paymentOrderNum || 0 }}</span>
                </div>
              </div>

              <!-- 线 -->
              <div class="rightBorder"></div>
              <div class="leftTopBorder"></div>
              <div class="leftBottomBorder"></div>
              <!--数据 -->
              <div class="leftTopTips">
                <div>下单转化率</div>
                <div>{{ overViewList.orderConversionRate || "0%" }}</div>
              </div>
              <div class="leftBottomTips">
                <div>付款转化率</div>
                <div>{{ overViewList.paymentsConversionRate || "0%" }}</div>
              </div>
              <div class="rightTips">
                <div>整体转换率</div>
                <div>{{ overViewList.overallConversionRate || "0%" }}</div>
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
#overViewChart {
  display: flex;
  justify-content: center;
  flex-direction: column;
  align-items: center;
  position: relative;
  margin-left: 20px;
  > .leftTopTips {
    position: absolute;
    top: 68px;
    left: -2px;
    width: 85px;
    text-align: center;
    background: rgb(255, 255, 255);
    z-index: 1;
    padding: 5px 0px;
  }
  > .leftBottomTips {
    position: absolute;
    bottom: 100px;
    left: -2px;
    width: 85px;
    text-align: center;
    background: rgb(255, 255, 255);
    z-index: 1;
    padding: 5px 0px;
  }
  > .rightTips {
    position: absolute;
    bottom: 240px;
    right: 0px;
    width: 85px;
    text-align: center;
    background: rgb(255, 255, 255);
    z-index: 1;
    padding: 5px 0px;
  }
  > .rightBorder {
    width: 110px;
    position: absolute;
    top: 30px;
    right: 40px;
    border: 2px solid #d9d9d9;
    border-left: 0;
    height: 280px;
  }
  > .leftTopBorder {
    border: 2px solid #d9d9d9;
    height: 118px;
    width: 56px;
    position: absolute;
    left: 40px;
    top: 30px;
    border-right: 0;
  }
  > .leftBottomBorder {
    width: 108px;
    border: 2px solid #d9d9d9;
    height: 150px;
    position: absolute;
    bottom: 45px;
    left: 40px;
    border-right: 0;
  }
  > .block {
    height: 0px;
    border-left: 30px solid transparent;
    border-right: 30px solid transparent;
    position: relative;
    background: rgb(255, 255, 255);
    z-index: 1;
    position: relative;
  }
  > .block:nth-of-type(1) {
    width: 240px;
    border-top: 90px solid #ff4646;
    > .box {
      left: -30px;
      top: -90px;
      width: 240px;
      height: 90px;
    }
  }
  > .block:nth-of-type(2) {
    width: 172px;
    border-top: 100px solid #ff8585;
    margin-top: 10px;
    > .box {
      left: -29px;
      top: -100px;
      width: 172px;
      height: 100px;
    }
  }
  > .block:nth-of-type(3) {
    width: 100px;
    margin-top: 10px;
    border-top: 150px solid #ffb396;
    border-left: 50px solid transparent;
    border-right: 50px solid transparent;

    > .box {
      left: -50px;
      top: -150px;
      width: 100px;
      height: 120px;
      z-index: 2;
    }
  }
  :deep(.box){
    color: #fff;
    position: absolute;

    z-index: 2;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    > span {
      font-size: 16px;
      font-weight: bold;
    }
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
}
.shap {
  width: 400px;
  margin-left: 20px;
  margin-top: 50px;
}

.transaction-card {
  height: 120px;
  border-radius: 0.4em;
  display: flex;
  background: #f3f5f7;
}
.card-item-label {
  font-weight: bold;
  font-size: #666;
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
