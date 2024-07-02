<template>
  <div>
    <Card>
      <p slot="title">结算单详情</p>
      <div class="flex flex_align_item">
        <div class="procedure">
          <div class="procedure_item" v-for="(item, index) in billStatusStep">
            <div class="icon" :class="item.className">
              <Icon type="md-checkmark" size="14" v-if="item.className==='' || bill.billStatus === 'COMPLETE'" />
              <span v-else>{{index + 1}}</span>
            </div>
            <div class="text">{{item.title}}</div>
          </div>
        </div>
        <div>
          <Button v-if="bill.billStatus == 'CHECK'" type="success" @click="pass()" style="margin-left: 10px;">付款</Button>
          <Button type="info" @click="download()" style="margin-left: 10px;">下载账单</Button>
        </div>
      </div>
    </Card>
    <Card class="mt_10">
      <p slot="title">账单详细</p>
      <table>
        <tbody>
        <tr v-for="(item,index) in data" :key="index">
          <td>{{ item.name }}</td>
          <td>{{ item.value }}</td>
        </tr>
        </tbody>
      </table>
      <div>
        <h3 class="ml_10">结算详细</h3>
        <Table :columns="billColumns" :data="billData"></Table>
        <div class="bill-detail-price">
          <div class="flex bill-item">
          </div>
        </div>
      </div>
    </Card>
    <Card class="mt_10">
      <Tabs active-key="tab" type="card">
        <Tab-pane label="结算单流水" name="order">
          <Table :loading="loading" border :columns="orderColumns" :data="orderData" ref="table"></Table>
          <Row type="flex" justify="end" class="mt_10">
            <Page :current="orderParam.pageNumber" :total="orderTotal" :page-size="orderParam.pageSize"
                  @on-change="orderChangePage" @on-page-size-change="orderChangePageSize" size="small" show-total
                  show-elevator></Page>
          </Row>
        </Tab-pane>
      </Tabs>
    </Card>
  </div>
</template>
<script>
import * as filters from "@/utils/filters";
import * as API_Shop from "@/api/shops";

export default {
  name: "bill-detail",
  data() {
    return {
      loading: false,
      billColumns: [
        {
          title: '结算金额',
          key: 'billPrice',
          align: 'center',
          width: 200,
          fixed: 'left',
          render: (h, params) => {
            return h(
              "div",
              this.$options.filters.unitPrice(params.row.billPrice, "￥")
            );
          },
        },
        {
          title: '收入',
          key: 'pay',
          align: 'center',
          children: [
            {
              title: '用户实付',
              key: 'orderPrice',
              align: 'center',
              width: 200,
              render: (h, params) => {
                return h(
                  "div",
                  this.$options.filters.unitPrice(params.row.orderPrice, "￥")
                );
              },
            }, {
              title: '平台优惠券补贴',
              key: 'siteCouponCommission',
              align: 'center',
              width: 200,
              render: (h, params) => {
                return h(
                  "div",
                  this.$options.filters.unitPrice(params.row.siteCouponCommission, "￥")
                );
              },
            }, {
              title: '积分商品补贴',
              key: 'pointSettlementPrice',
              align: 'center',
              width: 200,
              render: (h, params) => {
                return h(
                  "div",
                  this.$options.filters.unitPrice(params.row.pointSettlementPrice, "￥")
                );
              },
            }, {
              title: '砍价商品补贴',
              key: 'kanjiaSettlementPrice',
              align: 'center',
              width: 200,
              render: (h, params) => {
                return h(
                  "div",
                  this.$options.filters.unitPrice(params.row.kanjiaSettlementPrice, "￥")
                );
              },
            }, {
              title: '分销佣金',
              key: 'distributionCommission',
              align: 'center',
              width: 200,
              render: (h, params) => {
                return h("priceColorScheme", {
                  props: {
                    value: (0 - params.row.distributionCommission),
                    color: this.$mainColor
                  }
                });
              },
            }, {
              title: '平台服务费',
              key: 'commissionPrice',
              align: 'center',
              width: 200,
              render: (h, params) => {
                return h("priceColorScheme", {
                  props: {
                    value: (0 - params.row.commissionPrice),
                    color: this.$mainColor
                  }
                });
              },
            },
          ]
        },
        {
          title: '退款',
          key: 'refund',
          align: 'center',
          children: [
            {
              title: '退款金额',
              key: 'refundPrice',
              align: 'center',
              width: 200,
              render: (h, params) => {
                return h("priceColorScheme", {props: {value: (0 - params.row.refundPrice), color: this.$mainColor}});
              },
            }, {
              title: '退单返还平台优惠券补贴',
              key: 'siteCouponRefundCommission',
              align: 'center',
              width: 200,
              render: (h, params) => {
                return h("priceColorScheme", {
                  props: {
                    value: (0 - params.row.siteCouponRefundCommission),
                    color: this.$mainColor
                  }
                });
              },
            }, {
              title: '退单返还积分商品补贴',
              key: 'pointRefundSettlementPrice',
              align: 'center',
              width: 200,
              render: (h, params) => {
                return h("priceColorScheme", {
                  props: {
                    value: (0 - params.row.pointRefundSettlementPrice),
                    color: this.$mainColor
                  }
                });
              },
            }, {
              title: '退单返还砍价商品补贴',
              key: 'kanjiaRefundSettlementPrice',
              align: 'center',
              width: 200,
              render: (h, params) => {
                return h("priceColorScheme", {
                  props: {
                    value: (0 - params.row.kanjiaRefundSettlementPrice),
                    color: this.$mainColor
                  }
                });
              },
            }, {
              title: '退单返还分销佣金',
              key: 'distributionRefundCommission',
              align: 'center',
              width: 200,
              render: (h, params) => {
                return h(
                  "div",
                  this.$options.filters.unitPrice(params.row.distributionRefundCommission, "￥")
                );
              },
            }, {
              title: '退单返还平台服务费',
              key: 'refundCommissionPrice',
              align: 'center',
              width: 200,
              render: (h, params) => {
                return h(
                  "div",
                  this.$options.filters.unitPrice(params.row.refundCommissionPrice, "￥")
                );
              },
            },
          ]
        },
      ],
      billData: [
        {
          billPrice: 0,
          orderPrice: 0,
          siteCouponCommission: 0,
          pointSettlementPrice: 0,
          kanjiaSettlementPrice: 0,
          distributionCommission: 0,
          commissionPrice: 0,
          refundPrice: 0,
          siteCouponRefundCommission: 0,
          pointRefundSettlementPrice: 0,
          kanjiaRefundSettlementPrice: 0,
          distributionRefundCommission: 0,
          refundCommissionPrice: 0
        },
      ],
      columns: [
        // 表头
        {
          title: "项目",
          key: "name",
          width: 250,
        },
        {
          title: "值",
          key: "value",
        },
      ],
      data: [
        // 数据
        {
          name: "计算中",
          value: 0,
        },
        {
          name: "计算中",
          value: 0,
        },
        {
          name: "计算中",
          value: 0,
        },
        {
          name: "计算中",
          value: 0,
        },
        {
          name: "计算中",
          value: 0,
        },
        {
          name: "计算中",
          value: 0,
        },
        {
          name: "计算中",
          value: 0,
        },
        {
          name: "计算中",
          value: 0,
        },
        {
          name: "计算中",
          value: 0,
        },
      ],
      id: "", // 账单id
      bill: {}, // 账单详情
      orderData: [], // 订单列表
      orderParam: {
        // 请求参数
        pageNumber: 1, // 当前页数
        pageSize: 10, // 页面大小
        sort: "id", // 默认排序字段
        order: "desc", // 默认排序方式
        // flowType: "PAY",
        startDate: null,
        endDate: null,
      },
      orderColumns: [
        {
          title: '结算信息',
          key: 'pay',
          align: 'center',
          children: [
            {
              title: "时间",
              key: "createTime",
            },
            {
              title: "订单编号",
              key: "orderSn",
              width: 250,
            },
            {
              title: "子订单号",
              key: "orderItemSn",
              width: 250,
            },
            {
              title: "类型",
              key: "flowType",
              render: (h, params) => {
                if (params.row.flowType == "PAY") {
                  return h("div", [
                    h("tag", {props: {color: "blue"}}, "收款"),
                  ]);
                } else {
                  return h("div", [
                    h("tag", {props: {color: "magenta"}}, "退款"),
                  ]);
                }
              }
            },
            {
              title: "结算金额",
              key: "billPrice",
              render: (h, params) => {
                if (params.row.flowType == "PAY") {
                  return h("div", this.$options.filters.unitPrice(params.row.billPrice, "￥")
                  );
                } else {
                  return h("priceColorScheme", {props: {value: (0 - params.row.billPrice), color: this.$mainColor}});
                }
              },
            },
          ]
        },
        {
          title: '收入',
          key: 'pay',
          align: 'center',
          children: [{
            title: "补贴",
            key: "billPrice",
            render: (h, params) => {
              if (params.row.pointSettlementPrice == 0) {
                return h("div", "-");
              } else if (params.row.flowType == "PAY") {
                return h("div", this.$options.filters.unitPrice((params.row.pointSettlementPrice + params.row.kanjiaSettlementPrice + params.row.siteCouponCommission), "￥")
                );
              } else {
                return h("priceColorScheme", {props: {value: (0 - (params.row.pointSettlementPrice + params.row.kanjiaSettlementPrice + params.row.siteCouponCommission))}});
              }
            },
          },
            {
              title: "用户实付",
              key: "billPrice",
              render: (h, params) => {
                if (params.row.flowType == "PAY") {
                  return h("div", this.$options.filters.unitPrice(params.row.finalPrice, "￥")
                  );
                } else {
                  return h("priceColorScheme", {props: {value: (0 - params.row.finalPrice)}});
                }
              },
            },
            {
              title: "合计",
              key: "billPrice",
              render: (h, params) => {
                if (params.row.flowType == "PAY") {
                  return h("div", this.$options.filters.unitPrice(params.row.finalPrice, "￥")
                  );
                } else {
                  return h("priceColorScheme", {props: {value: (0 - params.row.finalPrice)}});
                }
              },
            },
          ]
        },
        {
          title: '支出',
          key: 'pay',
          align: 'center',
          children: [{
            title: "平台服务费",
            key: "billPrice",
            render: (h, params) => {
              if (params.row.commissionPrice == 0) {
                return h("div", "-");
              } else if (params.row.flowType == "PAY") {
                return h("priceColorScheme", {props: {value: (0 - params.row.commissionPrice)}});

              } else {
                return h("div", this.$options.filters.unitPrice(params.row.commissionPrice, "￥"));
              }
            },
          },
            {
              title: "分销佣金",
              key: "distributionRebate",
              render: (h, params) => {
                if (params.row.distributionRebate == 0) {
                  return h("div", "-");
                } else if (params.row.flowType == "PAY") {
                  return h("priceColorScheme", {props: {value: (0 - params.row.distributionRebate)}});
                } else {
                  return h("div", this.$options.filters.unitPrice(params.row.distributionRebate, "￥"));
                }
              },
            },
            {
              title: "合计",
              key: "billPrice",
              render: (h, params) => {
                if (params.row.flowType == "PAY") {
                  return h("priceColorScheme", {props: {value: (0 - (params.row.commissionPrice + params.row.distributionRebate))}});
                } else {
                  return h("div", this.$options.filters.unitPrice((params.row.commissionPrice + params.row.distributionRebate), "￥"));
                }
              },
            }]
        }

      ],
      orderTotal: 0, // 订单总数
      refundTotal: 0, // 退款单总数
      // 结算单状态枚举模拟数据
      billStatusList: [
        { status: 'OUT', value: '已出账', title: '生成账单' },
        { status: 'CHECK', value: '已对账', title: '商家对账' },
        { status: 'PAY', value: '已付款', title: '平台付款' },
        { status: 'COMPLETE', value: '已完成', title: '结算完成' },
      ],
      // 结算单状态步骤
      billStatusStep: []
    };
  },
  methods: {
    // 结算单状态
    getBillStatusStep() {
      this.billStatusStep = [];
      let current = '', myCur = false, myIdx = 0;
      this.billStatusList.map((item, index) => {
        if (item.status === this.bill.billStatus) {
          myCur = true; myIdx = index; current = '';
        } else {
          if (!myCur) {
            current = '';
          } else {
            if (myIdx+1 === index) {
              current = 'current';
            } else {
              current = 'future';
            }
          }
        }
        let temp = { ...item, className: current };
        this.billStatusStep.push (temp);
      });
      if (this.bill.billStatus === 'COMPLETE') {
        this.billStatusStep[this.billStatusStep.length-1].className = 'current';
      }
    },
    //订单页数发生变化
    orderChangePage(v) {
      this.orderParam.pageNumber = v;
      this.getOrder();
    },
    //订单每页条数变化
    orderChangePageSize(v) {
      this.orderParam.pageNumber = 1;
      this.orderParam.pageSize = v;
      this.getOrder();
    },
    //平台审核通过（审核通过及付款)
    pass() {
      this.$Modal.confirm({
        title: "结算单付款",
        // 记得确认修改此处
        content: "确定结算单已付款?",
        loading: true,
        onOk: () => {
          API_Shop.pay(this.id).then((res) => {
            if (res.success) {
              this.$Message.success(res.message);
              this.init();
            }
          });
        },
      });


    },
    //下载账单
    download() {
      API_Shop.downloadBill(this.id).then((res) => {
        const blob = new Blob([res], {
          type: "application/vnd.ms-excel;charset=utf-8",
        });
        //对于<a>标签，只有 Firefox 和 Chrome（内核） 支持 download 属性
        //IE10以上支持blob但是依然不支持download
        if ("download" in document.createElement("a")) {
          //支持a标签download的浏览器
          const link = document.createElement("a"); //创建a标签
          link.download = "结算单-"+this.id+".xls"; //a标签添加属性
          link.style.display = "none";
          link.href = URL.createObjectURL(blob);
          document.body.appendChild(link);
          link.click(); //执行下载
          URL.revokeObjectURL(link.href); //释放url
          document.body.removeChild(link); //释放标签
        } else {
          navigator.msSaveBlob(blob, fileName);
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
          //初始化表格
          this.initTable();
          //初始化订单信息
          this.orderParam.startDate = this.bill.startTime;
          this.orderParam.endDate = this.bill.endTime;
          this.getOrder();
          // 结算单状态步骤
          this.getBillStatusStep();
        }
      });
    },
    // 账单详细
    initTable() {
      let bill = this.bill;

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

      this.billData[0].billPrice = this.bill.billPrice;
      this.billData[0].orderPrice = this.bill.orderPrice;
      this.billData[0].siteCouponCommission = this.bill.siteCouponCommission;
      this.billData[0].pointSettlementPrice = this.bill.pointSettlementPrice;
      this.billData[0].kanjiaSettlementPrice = this.bill.kanjiaSettlementPrice;
      this.billData[0].distributionCommission = this.bill.distributionCommission;
      this.billData[0].commissionPrice = this.bill.commissionPrice;
      this.billData[0].refundPrice = this.bill.refundPrice;
      this.billData[0].siteCouponRefundCommission = this.bill.siteCouponRefundCommission;
      this.billData[0].pointRefundSettlementPrice = this.bill.pointRefundSettlementPrice;
      this.billData[0].kanjiaRefundSettlementPrice = this.bill.kanjiaRefundSettlementPrice;
      this.billData[0].distributionRefundCommission = this.bill.distributionRefundCommission;
      this.billData[0].refundCommissionPrice = this.bill.refundCommissionPrice;
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
    margin-top: 5px
  }

  .theme_color {
    margin-top: 5px
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
    .text {

    }
  }
}
</style>
