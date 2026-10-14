<template>
  <div>
    <el-card>
      <template #header>
        <span>结算单详情</span>
      </template>
      <div class="flex flex_align_item">
        <div class="procedure">
          <div class="procedure_item" v-for="(item, index) in billStatusStep" :key="index">
            <div class="icon" :class="item.className">
              <span v-if="item.className === '' || bill.billStatus === 'COMPLETE'">✓</span>
              <span v-else>{{ index + 1 }}</span>
            </div>
            <div class="text">{{ item.title }}</div>
          </div>
        </div>
        <div>
          <el-button
            v-if="bill.billStatus == 'OUT'"
            type="success"
            @click="reconciliation()"
            style="margin-left: 10px"
          >
            对账
          </el-button>
          <el-button type="primary" @click="download()" style="margin-left: 10px">下载账单</el-button>
        </div>
      </div>
    </el-card>

    <el-card class="mt_10">
      <template #header>
        <span>账单详细</span>
      </template>
      <table>
        <tbody>
          <tr v-for="(item, index) in data" :key="index">
            <td>{{ item.name }}</td>
            <td>{{ item.value }}</td>
          </tr>
        </tbody>
      </table>
      <div>
        <h3 class="ml_10">结算详细</h3>
        <el-table :data="billData" border style="width: 100%">
          <el-table-column label="结算金额" prop="billPrice" align="center" width="200" fixed="left">
            <template #default="{ row }">
              <span v-if="row">{{ formatPrice(row.billPrice) }}</span>
            </template>
          </el-table-column>
          <el-table-column label="收入" align="center">
            <el-table-column label="用户实付" prop="orderPrice" align="center" width="200">
              <template #default="{ row }">
                <span v-if="row">{{ formatPrice(row.orderPrice) }}</span>
              </template>
            </el-table-column>
            <el-table-column label="平台优惠券补贴" prop="siteCouponCommission" align="center" width="200">
              <template #default="{ row }">
                <span v-if="row">{{ formatPrice(row.siteCouponCommission) }}</span>
              </template>
            </el-table-column>
            <el-table-column label="积分商品补贴" prop="pointSettlementPrice" align="center" width="200">
              <template #default="{ row }">
                <span v-if="row">{{ formatPrice(row.pointSettlementPrice) }}</span>
              </template>
            </el-table-column>
            <el-table-column label="砍价商品补贴" prop="kanjiaSettlementPrice" align="center" width="200">
              <template #default="{ row }">
                <span v-if="row">{{ formatPrice(row.kanjiaSettlementPrice) }}</span>
              </template>
            </el-table-column>
            <el-table-column label="礼品卡补贴" prop="giftCardSubsidy" align="center" width="200">
              <template #default="{ row }">
                <span v-if="row">{{ formatPrice(row.giftCardSubsidy) }}</span>
              </template>
            </el-table-column>
            <el-table-column label="分销佣金" prop="distributionCommission" align="center" width="200">
              <template #default="{ row }">
                <priceColorScheme
                  v-if="row"
                  :value="negate(row.distributionCommission)"
                  :color="$mainColor"
                />
              </template>
            </el-table-column>
            <el-table-column label="平台服务费" prop="commissionPrice" align="center" width="200">
              <template #default="{ row }">
                <priceColorScheme
                  v-if="row"
                  :value="negate(row.commissionPrice)"
                  :color="$mainColor"
                />
              </template>
            </el-table-column>
          </el-table-column>
          <el-table-column label="退款" align="center">
            <el-table-column label="退款金额" prop="refundPrice" align="center" width="200">
              <template #default="{ row }">
                <priceColorScheme v-if="row" :value="negate(row.refundPrice)" :color="$mainColor" />
              </template>
            </el-table-column>
            <el-table-column
              label="退单返还平台优惠券补贴"
              prop="siteCouponRefundCommission"
              align="center"
              width="200"
            >
              <template #default="{ row }">
                <priceColorScheme
                  v-if="row"
                  :value="negate(row.siteCouponRefundCommission)"
                  :color="$mainColor"
                />
              </template>
            </el-table-column>
            <el-table-column
              label="退单返还积分商品补贴"
              prop="pointRefundSettlementPrice"
              align="center"
              width="200"
            >
              <template #default="{ row }">
                <priceColorScheme
                  v-if="row"
                  :value="negate(row.pointRefundSettlementPrice)"
                  :color="$mainColor"
                />
              </template>
            </el-table-column>
            <el-table-column
              label="退单返还砍价商品补贴"
              prop="kanjiaRefundSettlementPrice"
              align="center"
              width="200"
            >
              <template #default="{ row }">
                <priceColorScheme
                  v-if="row"
                  :value="negate(row.kanjiaRefundSettlementPrice)"
                  :color="$mainColor"
                />
              </template>
            </el-table-column>
            <el-table-column label="礼品卡返还" prop="giftCardRefundSubsidy" align="center" width="200">
              <template #default="{ row }">
                <priceColorScheme
                  v-if="row"
                  :value="negate(row.giftCardRefundSubsidy)"
                  :color="$mainColor"
                />
              </template>
            </el-table-column>
            <el-table-column
              label="退单返还分销佣金"
              prop="distributionRefundCommission"
              align="center"
              width="200"
            >
              <template #default="{ row }">
                <span v-if="row">{{ formatPrice(row.distributionRefundCommission) }}</span>
              </template>
            </el-table-column>
            <el-table-column
              label="退单返还平台服务费"
              prop="refundCommissionPrice"
              align="center"
              width="200"
            >
              <template #default="{ row }">
                <span v-if="row">{{ formatPrice(row.refundCommissionPrice) }}</span>
              </template>
            </el-table-column>
          </el-table-column>
        </el-table>
        <div class="bill-detail-price">
          <div class="flex bill-item"></div>
        </div>
      </div>
    </el-card>

    <el-card class="mt_10">
      <el-tabs v-model="activeTab" type="card">
        <el-tab-pane label="结算单流水" name="order">
          <el-table
            ref="table"
            v-loading="loading"
            border
            :data="orderData"
            style="width: 100%"
          >
            <el-table-column label="结算信息" align="center">
              <el-table-column label="时间" prop="createTime" />
              <el-table-column label="订单编号" prop="orderSn" width="250" />
              <el-table-column label="子订单号" prop="orderItemSn" width="250" />
              <el-table-column label="类型" prop="flowType">
                <template #default="{ row }">
                  <template v-if="row">
                    <el-tag v-if="isPayFlow(row)" type="primary">收款</el-tag>
                    <el-tag v-else type="danger">退款</el-tag>
                  </template>
                </template>
              </el-table-column>
              <el-table-column label="结算金额" prop="billPrice">
                <template #default="{ row }">
                  <template v-if="row">
                    <span v-if="isPayFlow(row)">{{ formatPrice(row.billPrice) }}</span>
                    <priceColorScheme v-else :value="negate(row.billPrice)" :color="$mainColor" />
                  </template>
                </template>
              </el-table-column>
            </el-table-column>
            <el-table-column label="收入" align="center">
              <el-table-column label="补贴" prop="billPrice">
                <template #default="{ row }">
                  <template v-if="row">
                    <span v-if="orderSubsidyDisplay(row) === '-'">-</span>
                    <span v-else-if="isPayFlow(row)">{{ formatPrice(orderSubsidyDisplay(row)) }}</span>
                    <priceColorScheme v-else :value="negate(orderSubsidyDisplay(row))" />
                  </template>
                </template>
              </el-table-column>
              <el-table-column label="用户实付" prop="billPrice">
                <template #default="{ row }">
                  <template v-if="row">
                    <span v-if="isPayFlow(row)">{{ formatPrice(row.finalPrice) }}</span>
                    <priceColorScheme v-else :value="negate(row.finalPrice)" />
                  </template>
                </template>
              </el-table-column>
              <el-table-column label="合计" prop="billPrice">
                <template #default="{ row }">
                  <template v-if="row">
                    <span v-if="isPayFlow(row)">{{ formatPrice(row.finalPrice) }}</span>
                    <priceColorScheme v-else :value="negate(row.finalPrice)" />
                  </template>
                </template>
              </el-table-column>
            </el-table-column>
            <el-table-column label="支出" align="center">
              <el-table-column label="平台服务费" prop="billPrice">
                <template #default="{ row }">
                  <template v-if="row">
                    <span v-if="orderCommissionDisplay(row) === '-'">-</span>
                    <priceColorScheme
                      v-else-if="isPayFlow(row)"
                      :value="negate(row.commissionPrice)"
                    />
                    <span v-else>{{ formatPrice(row.commissionPrice) }}</span>
                  </template>
                </template>
              </el-table-column>
              <el-table-column label="分销佣金" prop="distributionRebate">
                <template #default="{ row }">
                  <template v-if="row">
                    <span v-if="orderDistributionRebateDisplay(row) === '-'">-</span>
                    <priceColorScheme
                      v-else-if="isPayFlow(row)"
                      :value="negate(row.distributionRebate)"
                    />
                    <span v-else>{{ formatPrice(row.distributionRebate) }}</span>
                  </template>
                </template>
              </el-table-column>
              <el-table-column label="合计" prop="billPrice">
                <template #default="{ row }">
                  <template v-if="row">
                    <priceColorScheme
                      v-if="isPayFlow(row)"
                      :value="negate(orderExpenseTotal(row))"
                    />
                    <span v-else>{{ formatPrice(orderExpenseTotal(row)) }}</span>
                  </template>
                </template>
              </el-table-column>
            </el-table-column>
          </el-table>
          <div class="mt_10" style="display: flex; justify-content: flex-end">
            <el-pagination
              v-model:current-page="orderParam.pageNumber"
              v-model:page-size="orderParam.pageSize"
              :page-sizes="[20, 50, 100]"
              :total="orderTotal"
              layout="total, sizes, prev, pager, next, jumper"
              size="small"
              @current-change="orderChangePage"
              @size-change="orderChangePageSize"
            />
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup>
import { onBeforeRouteLeave, useRoute } from "vue-router";
import { onMounted, reactive, ref, watch } from "vue";
import * as filters from "@/utils/filters";
import * as API_Shop from "@/api/shops";
import { Message, Modal } from "@/utils/message";

defineOptions({ name: "bill-detail" });

const route = useRoute();

const activeTab = ref("order");
const loading = ref(false);
const billData = ref([
  {
    billPrice: 0,
    orderPrice: 0,
    siteCouponCommission: 0,
    pointSettlementPrice: 0,
    kanjiaSettlementPrice: 0,
    giftCardSubsidy: 0,
    distributionCommission: 0,
    commissionPrice: 0,
    refundPrice: 0,
    siteCouponRefundCommission: 0,
    pointRefundSettlementPrice: 0,
    kanjiaRefundSettlementPrice: 0,
    giftCardRefundSubsidy: 0,
    distributionRefundCommission: 0,
    refundCommissionPrice: 0,
  },
]);
const data = ref([
  { name: "计算中", value: 0 },
  { name: "计算中", value: 0 },
  { name: "计算中", value: 0 },
  { name: "计算中", value: 0 },
  { name: "计算中", value: 0 },
  { name: "计算中", value: 0 },
  { name: "计算中", value: 0 },
  { name: "计算中", value: 0 },
  { name: "计算中", value: 0 },
]);
const id = ref("");
const bill = ref({});
const orderData = ref([]);
const orderParam = reactive({
  pageNumber: 1,
  pageSize: 20,
  sort: "id",
  order: "desc",
  startDate: null,
  endDate: null,
});
const orderTotal = ref(0);
const billStatusList = ref([
  { status: "OUT", value: "已出账", title: "生成账单" },
  { status: "CHECK", value: "已对账", title: "商家对账" },
  { status: "PAY", value: "已付款", title: "平台付款" },
  { status: "COMPLETE", value: "已完成", title: "结算完成" },
]);
const billStatusStep = ref([]);

onMounted(() => {
  init();
});

watch(
  () => route.query.id,
  (val) => {
    id.value = val;
    getDetail();
  }
);

onBeforeRouteLeave((to, from, next) => {
  if (to.name === "accountStatementBill" || to.name === "storeBill") {
    to.meta.keepAlive = true;
  }
  next();
});

function formatPrice(value) {
  return filters.unitPrice(value, "￥");
}
function negate(value) {
  return 0 - value;
}
function isPayFlow(row) {
  return row.flowType === "PAY";
}
function orderSubsidyTotal(row) {
  return (
    row.pointSettlementPrice + row.kanjiaSettlementPrice + row.siteCouponCommission
  );
}
function orderSubsidyDisplay(row) {
  if (row.pointSettlementPrice == 0) {
    return "-";
  }
  return orderSubsidyTotal(row);
}
function orderCommissionDisplay(row) {
  return row.commissionPrice == 0 ? "-" : row.commissionPrice;
}
function orderDistributionRebateDisplay(row) {
  return row.distributionRebate == 0 ? "-" : row.distributionRebate;
}
function orderExpenseTotal(row) {
  return row.commissionPrice + row.distributionRebate;
}
function getBillStatusStep() {
  billStatusStep.value = [];
  let current = "";
  let myCur = false;
  let myIdx = 0;
  billStatusList.value.map((item, index) => {
    if (item.status === bill.value.billStatus) {
      myCur = true;
      myIdx = index;
      current = "";
    } else if (!myCur) {
      current = "";
    } else if (myIdx + 1 === index) {
      current = "current";
    } else {
      current = "future";
    }
    billStatusStep.value.push({ ...item, className: current });
  });
  if (bill.value.billStatus === "COMPLETE") {
    billStatusStep.value[billStatusStep.value.length - 1].className = "current";
  }
}
function orderChangePage(v) {
  orderParam.pageNumber = v;
  getOrder();
}
function orderChangePageSize(v) {
  orderParam.pageNumber = 1;
  orderParam.pageSize = v;
  getOrder();
}
function reconciliation() {
  Modal.confirm({
    title: "确认核对结算单",
    content: "您确认要核对此结算单么?",
    loading: true,
    onOk: () => {
      API_Shop.reconciliation(id.value).then((res) => {
        Modal.remove();
        if (res.success) {
          Message.success("账单核对成功");
          init();
        }
      });
    },
  });
}
function download() {
  API_Shop.downloadBill(id.value)
    .then((res) => {
      const blob = new Blob([res], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      if ("download" in document.createElement("a")) {
        const link = document.createElement("a");
        link.download = "结算单-" + id.value + ".xlsx";
        link.style.display = "none";
        link.href = URL.createObjectURL(blob);
        document.body.appendChild(link);
        link.click();
        URL.revokeObjectURL(link.href);
        document.body.removeChild(link);
      } else {
        navigator.msSaveBlob(blob, "结算单-" + id.value + ".xlsx");
      }
    })
    .catch((err) => {});
}
function init() {
  id.value = route.query.id;
  getDetail();
}
function getDetail() {
  API_Shop.getBillDetail(id.value).then((res) => {
    if (res.success) {
      bill.value = res.result;
      initTable();
      getOrder();
      getBillStatusStep();
    }
  });
}
function initTable() {
  const billVal = bill.value;
  const money = (val) => (val === null || val === undefined || val === "" ? 0 : val);

  data.value[0].name = "结算单状态";
  data.value[0].value = filters.unixSellerBillStatus(billVal.billStatus);
  data.value[1].name = "结算单号";
  data.value[1].value = billVal.sn;
  data.value[2].name = "店铺名称";
  data.value[2].value = billVal.storeName;
  data.value[3].name = "起止日期";
  data.value[3].value = billVal.startTime + "~" + billVal.endTime;
  data.value[4].name = "银行开户名";
  data.value[4].value = billVal.bankAccountName;
  data.value[5].name = "银行账号";
  data.value[5].value = billVal.bankAccountNumber;
  data.value[6].name = "开户行支行名称";
  data.value[6].value = billVal.bankName;
  data.value[7].name = "支行联行号";
  data.value[7].value = billVal.bankCode;
  data.value[8].name = "支付时间";
  data.value[8].value = billVal.payTime === null ? "未付款" : billVal.payTime;

  billData.value[0].billPrice = money(billVal.billPrice);
  billData.value[0].orderPrice = money(billVal.orderPrice);
  billData.value[0].siteCouponCommission = money(billVal.siteCouponCommission);
  billData.value[0].pointSettlementPrice = money(billVal.pointSettlementPrice);
  billData.value[0].kanjiaSettlementPrice = money(billVal.kanjiaSettlementPrice);
  billData.value[0].giftCardSubsidy = money(billVal.giftCardSubsidy);
  billData.value[0].distributionCommission = money(billVal.distributionCommission);
  billData.value[0].commissionPrice = money(billVal.commissionPrice);
  billData.value[0].refundPrice = money(billVal.refundPrice);
  billData.value[0].siteCouponRefundCommission = money(billVal.siteCouponRefundCommission);
  billData.value[0].pointRefundSettlementPrice = money(billVal.pointRefundSettlementPrice);
  billData.value[0].kanjiaRefundSettlementPrice = money(billVal.kanjiaRefundSettlementPrice);
  billData.value[0].giftCardRefundSubsidy = money(billVal.giftCardRefundSubsidy);
  billData.value[0].distributionRefundCommission = money(billVal.distributionRefundCommission);
  billData.value[0].refundCommissionPrice = money(billVal.refundCommissionPrice);
}
function getOrder() {
  loading.value = true;
  API_Shop.getSellerFlow(id.value, orderParam).then((res) => {
    loading.value = false;
    if (res.success) {
      orderData.value = res.result.records;
      orderTotal.value = res.result.total;
    }
  });
}
</script>

<style scoped lang="scss">
.flex {
  justify-content: space-between;
  flex-wrap: wrap;

  > p {
    width: 50%;
    margin: 15px 0;
  }
}

.tips-status {
  padding: 10px;
  font-size: 14px;

  > span {
    font-weight: bold;
    margin-right: 8px;
  }

  > span:nth-of-type(2) {
    color: $theme_color;
  }
}

table {
  font-size: 14px;
  margin-left: 40px;

  tr {
    font-size: 12px;
    height: 40px;
    padding: 10px;

    td:nth-child(1) {
      width: 120px;
    }
  }
}

.bill-detail-price {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  padding: 10px;

  > span {
    font-size: 14px;
    text-align: center;
    width: 200px;
    margin-bottom: 20px;
  }

  .increase-color {
    color: green;
    margin-top: 5px;
  }

  .theme_color {
    margin-top: 5px;
  }
}

.procedure {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  font-size: 14px;
  font-weight: bold;
  margin: 12px 0 12px 20px;
  .procedure_item {
    width: 160px;
    display: flex;
    align-items: center;
    justify-content: center;
    .icon {
      width: 24px;
      height: 24px;
      text-align: center;
      line-height: 24px;
      border-radius: 50%;
      margin-right: 14px;
      font-weight: normal;
      background-color: #e6f7ff;
      color: #1890ff;
    }
    .current {
      background-color: #2d8cf0;
      color: #ffffff;
    }
    .future {
      background-color: #f7f7f7;
      color: #515a6e;
    }
  }
}
</style>
