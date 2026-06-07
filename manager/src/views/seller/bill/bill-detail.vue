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
            v-if="bill.billStatus == 'CHECK'"
            type="success"
            @click="pass()"
            style="margin-left: 10px"
          >
            付款
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

<script>
import * as filters from "@/utils/filters";
import * as API_Shop from "@/api/shops";

export default {
  name: "bill-detail",
  data() {
    return {
      activeTab: "order",
      loading: false,
      billData: [
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
      ],
      data: [
        { name: "计算中", value: 0 },
        { name: "计算中", value: 0 },
        { name: "计算中", value: 0 },
        { name: "计算中", value: 0 },
        { name: "计算中", value: 0 },
        { name: "计算中", value: 0 },
        { name: "计算中", value: 0 },
        { name: "计算中", value: 0 },
        { name: "计算中", value: 0 },
      ],
      id: "",
      bill: {},
      orderData: [],
      orderParam: {
        pageNumber: 1,
        pageSize: 20,
        sort: "id",
        order: "desc",
        startDate: null,
        endDate: null,
      },
      orderTotal: 0,
      refundTotal: 0,
      billStatusList: [
        { status: "OUT", value: "已出账", title: "生成账单" },
        { status: "CHECK", value: "已对账", title: "商家对账" },
        { status: "PAY", value: "已付款", title: "平台付款" },
        { status: "COMPLETE", value: "已完成", title: "结算完成" },
      ],
      billStatusStep: [],
    };
  },
  methods: {
    formatPrice(value) {
      return this.$filters.unitPrice(value, "￥");
    },
    negate(value) {
      return 0 - value;
    },
    isPayFlow(row) {
      return row.flowType === "PAY";
    },
    orderSubsidyTotal(row) {
      return (
        row.pointSettlementPrice + row.kanjiaSettlementPrice + row.siteCouponCommission
      );
    },
    orderSubsidyDisplay(row) {
      if (row.pointSettlementPrice == 0) {
        return "-";
      }
      return this.orderSubsidyTotal(row);
    },
    orderCommissionDisplay(row) {
      return row.commissionPrice == 0 ? "-" : row.commissionPrice;
    },
    orderDistributionRebateDisplay(row) {
      return row.distributionRebate == 0 ? "-" : row.distributionRebate;
    },
    orderExpenseTotal(row) {
      return row.commissionPrice + row.distributionRebate;
    },
    getBillStatusStep() {
      this.billStatusStep = [];
      let current = "";
      let myCur = false;
      let myIdx = 0;
      this.billStatusList.map((item, index) => {
        if (item.status === this.bill.billStatus) {
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
        this.billStatusStep.push({ ...item, className: current });
      });
      if (this.bill.billStatus === "COMPLETE") {
        this.billStatusStep[this.billStatusStep.length - 1].className = "current";
      }
    },
    orderChangePage(v) {
      this.orderParam.pageNumber = v;
      this.getOrder();
    },
    orderChangePageSize(v) {
      this.orderParam.pageNumber = 1;
      this.orderParam.pageSize = v;
      this.getOrder();
    },
    pass() {
      this.$Modal.confirm({
        title: "结算单付款",
        content: "确定结算单已付款?",
        loading: true,
        onOk: () => {
          API_Shop.pay(this.id).then((res) => {
            this.$Modal.remove();
            if (res.success) {
              this.$Message.success(res.message);
              this.init();
            }
          });
        },
      });
    },
    download() {
      API_Shop.downloadBill(this.id)
        .then((res) => {
          const blob = new Blob([res], {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          });
          if ("download" in document.createElement("a")) {
            const link = document.createElement("a");
            link.download = "结算单-" + this.id + ".xlsx";
            link.style.display = "none";
            link.href = URL.createObjectURL(blob);
            document.body.appendChild(link);
            link.click();
            URL.revokeObjectURL(link.href);
            document.body.removeChild(link);
          } else {
            navigator.msSaveBlob(blob, "结算单-" + this.id + ".xlsx");
          }
        })
        .catch((err) => {
          console.log(err);
        });
    },
    init() {
      this.id = this.$route.query.id;
      this.getDetail();
    },
    getDetail() {
      API_Shop.getBuyBillDetail(this.id).then((res) => {
        if (res.success) {
          this.bill = res.result;
          this.initTable();
          this.orderParam.startDate = this.bill.startTime;
          this.orderParam.endDate = this.bill.endTime;
          this.getOrder();
          this.getBillStatusStep();
        }
      });
    },
    initTable() {
      const bill = this.bill;
      const money = (val) => (val === null || val === undefined || val === "" ? 0 : val);

      this.data[0].name = "结算单状态";
      this.data[0].value = filters.unixSellerBillStatus(bill.billStatus);
      this.data[1].name = "结算单号";
      this.data[1].value = bill.sn;
      this.data[2].name = "店铺名称";
      this.data[2].value = bill.storeName;
      this.data[3].name = "起止日期";
      this.data[3].value = bill.startTime + "~" + bill.endTime;
      this.data[4].name = "银行开户名";
      this.data[4].value = bill.bankAccountName;
      this.data[5].name = "银行账号";
      this.data[5].value = bill.bankAccountNumber;
      this.data[6].name = "开户行支行名称";
      this.data[6].value = bill.bankName;
      this.data[7].name = "支行联行号";
      this.data[7].value = bill.bankCode;
      this.data[8].name = "支付时间";
      this.data[8].value = bill.payTime === null ? "未付款" : bill.payTime;

      this.billData[0].billPrice = money(this.bill.billPrice);
      this.billData[0].orderPrice = money(this.bill.orderPrice);
      this.billData[0].siteCouponCommission = money(this.bill.siteCouponCommission);
      this.billData[0].pointSettlementPrice = money(this.bill.pointSettlementPrice);
      this.billData[0].kanjiaSettlementPrice = money(this.bill.kanjiaSettlementPrice);
      this.billData[0].giftCardSubsidy = money(this.bill.giftCardSubsidy);
      this.billData[0].distributionCommission = money(this.bill.distributionCommission);
      this.billData[0].commissionPrice = money(this.bill.commissionPrice);
      this.billData[0].refundPrice = money(this.bill.refundPrice);
      this.billData[0].siteCouponRefundCommission = money(this.bill.siteCouponRefundCommission);
      this.billData[0].pointRefundSettlementPrice = money(this.bill.pointRefundSettlementPrice);
      this.billData[0].kanjiaRefundSettlementPrice = money(this.bill.kanjiaRefundSettlementPrice);
      this.billData[0].giftCardRefundSubsidy = money(this.bill.giftCardRefundSubsidy);
      this.billData[0].distributionRefundCommission = money(this.bill.distributionRefundCommission);
      this.billData[0].refundCommissionPrice = money(this.bill.refundCommissionPrice);
    },
    getOrder() {
      API_Shop.getStoreFlow(this.id, this.orderParam).then((res) => {
        if (res.result) {
          this.orderData = res.result.records;
          this.orderTotal = res.result.total;
        }
      });
      this.orderTotal = this.orderData.length;
    },
  },
  mounted() {
    this.init();
  },
};
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
