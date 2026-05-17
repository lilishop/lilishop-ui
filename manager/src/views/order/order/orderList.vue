<template>
  <div>
    <Card>
      <Form
        ref="searchForm"
        @keydown.enter.native="handleSearch"
        :model="searchForm"
        inline
        :label-width="70"
        class="search-form"
      >
        <Form-item label="关键字" prop="keywords" style="display: block; width: 100%;">
          <Input
            type="text"
            v-model="searchForm.keywords"
            placeholder="请输入商品名称/收货人/收货人手机号/店铺名称"
            clearable
            style="width: 500px"
          />
        </Form-item>
        <Form-item label="订单号" prop="orderSn">
          <Input
            type="text"
            v-model="searchForm.orderSn"
            placeholder="请输入订单号"
            clearable
            style="width: 240px"
          />
        </Form-item>
        <Form-item label="会员名称" prop="buyerName">
          <Input
            type="text"
            v-model="searchForm.buyerName"
            placeholder="请输入会员名称"
            clearable
            style="width: 240px"
          />
        </Form-item>
        <Form-item label="商品名称" prop="goodsName">
          <Input
            type="text"
            v-model="searchForm.goodsName"
            placeholder="请输入商品名称"
            clearable
            style="width: 240px"
          />
        </Form-item>
        <Form-item label="收货人" prop="shipName">
          <Input
            type="text"
            v-model="searchForm.shipName"
            placeholder="请输入收货人姓名"
            clearable
            style="width: 240px"
          />
        </Form-item>
        <Form-item label="订单类型" prop="orderType">
          <Select
            v-model="searchForm.orderPromotionType"
            placeholder="请选择"
            clearable
            style="width: 240px"
          >
            <Option value="NORMAL">普通订单</Option>
            <Option value="PINTUAN">拼团订单</Option>
            <Option value="GIFT">赠品订单</Option>
            <Option value="POINTS">积分订单</Option>
            <Option value="KANJIA">砍价订单</Option>
          </Select>
        </Form-item>
        <Form-item label="支付方式" prop="paymentMethod">
          <Select
            v-model="searchForm.paymentMethod"
            placeholder="请选择支付方式"
            clearable
            style="width: 240px"
          >
            <Option value="WECHAT">微信支付</Option>
            <Option value="ALIPAY">支付宝</Option>
            <Option value="WALLET">余额支付</Option>
            <Option value="BANK_TRANSFER">线下转账</Option>
          </Select>
        </Form-item>
        <Form-item label="下单时间">
          <DatePicker
            v-model="selectDate"
            type="datetimerange"
            format="yyyy-MM-dd"
            clearable
            @on-change="selectDateRange"
            placeholder="选择起始时间"
            style="width: 240px"
          ></DatePicker>
        </Form-item>
        <Button
          @click="handleSearch"
          type="primary"
          icon="ios-search"
          class="search-btn"
          >搜索</Button
        >
      </Form>
    </Card>
    <Card>
      <div class="order-tab">
        <Tabs v-model="currentStatus" @on-click="orderStatusClick">
          <TabPane v-for="(item,index) in orderStatusWithCount" :key="index" :label="item.title" :name="item.value">
          </TabPane>
        </Tabs>
      </div>
      <div>
        <Button @click="exportOrder" type="info" class="export">导出订单</Button>
      </div>
      <Table
        :loading="loading"
        :columns="columns"
        :data="data"
        ref="table"
        sortable="custom"
      ></Table>

      <Row type="flex" justify="end" class="mt_10">
        <Page
          :current="searchForm.pageNumber"
          :total="total"
          :page-size="searchForm.pageSize"
          @on-change="changePage"
          @on-page-size-change="changePageSize"
          :page-size-opts="[20, 50, 100]"
          size="small"
          show-total
          show-elevator
          show-sizer
        ></Page>
      </Row>
    </Card>
  </div>
</template>

<script>
import * as API_Order from "@/api/order";
import JsonExcel from "vue-json-excel";
export default {
  name: "orderList",
  components: {
    "download-excel": JsonExcel,
  },
  data() {
    return {
      // 表格的表头以及内容
      fields: {
        订单编号: "sn",
        下单时间: "createTime",
        客户名称: "memberName",
        支付方式: {
          field: "clientType",
          callback: (value) => {
            if (value == "H5") {
              return "移动端";
            } else if (value == "PC") {
              return "PC端";
            } else if (value == "WECHAT_MP") {
              return "小程序端";
            } else if (value == "APP") {
              return "移动应用端";
            } else {
              return value;
            }
          },
        },
        商品数量: "groupNum",
        付款状态: {
          field: "payStatus",
          callback: (value) => {
            return value == "UNPAID"
              ? "未付款"
              : value == "PAID"
              ? "已付款"
              : "";
          },
        },
        店铺: "storeName",
      },
      loading: true, // 表单加载状态
      searchForm: {
        // 搜索框初始化对象
        pageNumber: 1, // 当前页数
        pageSize: 20, // 页面大小
        sort: "createTime", // 默认排序字段
        order: "desc", // 默认排序方式
        startDate: "", // 起始时间
        endDate: "", // 终止时间
        orderType: "",
        orderSn: "",
        keywords: "", // 新增关键字搜索字段
        buyerName: "",
        goodsName: "", // 新增商品名称筛选字段
        shipName: "", // 新增收货人筛选字段
        orderStatus: "",
        paymentMethod: "", // 新增支付方式筛选字段
      },
      selectDate: null,
      columns: [
        {
          title: "订单号",
          key: "sn",
          minWidth: 240,
          tooltip: true,
        },
        {
          title: "订单来源",
          key: "clientType",
          width: 120,
          render: (h, params) => {
            if (params.row.clientType == "H5") {
              return h("div", {}, "移动端");
            } else if (params.row.clientType == "PC") {
              return h("div", {}, "PC端");
            } else if (params.row.clientType == "WECHAT_MP") {
              return h("div", {}, "小程序端");
            } else if (params.row.clientType == "APP") {
              return h("div", {}, "移动应用端");
            } else {
              return h("div", {}, params.row.clientType);
            }
          },
        },
        {
          title: "订单类型",
          key: "orderPromotionType",
          width: 120,
          render: (h, params) => {
            if (params.row.orderPromotionType == "NORMAL") {
              return h("div", [
                h("tag", { props: { color: "blue" } }, "普通订单"),
              ]);
            } else if (params.row.orderPromotionType == "PINTUAN") {
              return h("div", [
                h("tag", { props: { color: "volcano" } }, "拼团订单"),
              ]);
            } else if (params.row.orderPromotionType == "GIFT") {
              return h("div", [
                h("tag", { props: { color: "green" } }, "赠品订单"),
              ]);
            } else if (params.row.orderPromotionType == "POINTS") {
              return h("div", [
                h("tag", { props: { color: "geekblue" } }, "积分订单"),
              ]);
            } else if (params.row.orderPromotionType == "KANJIA") {
              return h("div", [
                h("tag", { props: { color: "pink" } }, "砍价订单"),
              ]);
            }
          },
        },
        {
          title: "买家名称",
          key: "memberName",
          minWidth: 130,
          tooltip: true,
        },
        
        {
          title: "会员ID",
          key: "memberId",
          minWidth: 120,
          tooltip: true,
        },
        {
          title: "店铺名称",
          key: "storeName",
          minWidth: 150,
          tooltip: true,
        },

        {
          title: "订单金额",
          key: "flowPrice",
          minWidth: 100,
          tooltip: true,
          render: (h, params) => {
            return h("priceColorScheme", {props:{value:params.row.flowPrice,color:this.$mainColor}} );
          },

        },
        {
          title: "支付方式",
          key: "paymentMethod",
          width: 120,
          render: (h, params) => {
            if (params.row.paymentMethod == "WECHAT") {
              return h("div", {}, "微信支付");
            } else if (params.row.paymentMethod == "ALIPAY") {
              return h("div", {}, "支付宝");
            } else if (params.row.paymentMethod == "WALLET") {
              return h("div", {}, "余额支付");
            } else if (params.row.paymentMethod == "BANK_TRANSFER") {
              return h("div", {}, "线下转账");
            } else {
              return h("div", {}, params.row.paymentMethod || "-");
            }
          },
        },
        {
          title: "订单状态",
          key: "orderStatus",
          minWidth: 100,
          render: (h, params) => {
            if (params.row.orderStatus == "UNPAID") {
              return h("div", [
                h("tag", { props: { color: "magenta" } }, "未付款"),
              ]);
            } else if (params.row.orderStatus == "PAID") {
              return h("div", [
                h("tag", { props: { color: "blue" } }, "已付款"),
              ]);
            } else if (params.row.orderStatus == "UNDELIVERED") {
              return h("div", [
                h("tag", { props: { color: "geekblue" } }, "待发货"),
              ]);
            } else if (params.row.orderStatus == "STAY_PICKED_UP") {
              return h("div", [
                h("tag", { props: { color: "geekblue" } }, "待自提"),
              ]);
            } else if (params.row.orderStatus == "PARTS_DELIVERED") {
              return h("div", [
                h("tag", { props: { color: "cyan" } }, "部分发货"),
              ]);
            } else if (params.row.orderStatus == "DELIVERED") {
              return h("div", [
                h("tag", { props: { color: "cyan" } }, "已发货"),
              ]);
            } else if (params.row.orderStatus == "COMPLETED") {
              return h("div", [
                h("tag", { props: { color: "green" } }, "已完成"),
              ]);
            } else if (params.row.orderStatus == "TAKE") {
              return h("div", [
                h("tag", { props: { color: "volcano" } }, "待核验"),
              ]);
            } else if (params.row.orderStatus == "CANCELLED") {
              return h("div", [
                h("tag", { props: { color: "red" } }, "已关闭"),
              ]);
            }
          },
        },
        {
          title: "下单时间",
          key: "createTime",
          width: 170,
        },
        {
          title: "操作",
          key: "action",
          align: "center",
          width: 100,
          render: (h, params) => {
            return h(
              "div",
              { class: "ops" },
              [
                h(
                  "a",
                  {
                    style: {
                      color: "#2d8cf0",
                      cursor: "pointer",
                      textDecoration: "none",
                    },
                    on: {
                      click: () => {
                        this.detail(params.row);
                      },
                    },
                  },
                  "查看"
                ),
              ]
            );
          },
        },
      ],
      data: [], // 表单数据
      total: 0, // 表单数据总数
      orderNumData: {}, // 新增：订单数量统计数据
      orderStatus: [
        {title: '全部', value: ''},
        {title: '未付款', value: 'UNPAID'},
        {title: '已付款', value: 'PAID'},
        {title: '待发货', value: 'UNDELIVERED'},
        {title: '部分发货', value: 'PARTS_DELIVERED'},
        {title: '已发货', value: 'DELIVERED'},
        {title: '待核验', value: 'TAKE'},
        {title: '待自提', value: 'STAY_PICKED_UP'},
        {title: '已完成', value: 'COMPLETED'},
        {title: '已关闭', value: 'CANCELLED'},
      ],
      currentStatus: ''
    };
  },
  computed: {
    // 新增：带数量的订单状态选项
    orderStatusWithCount() {
      return [
        {title: '全部', value: ''},
        {title: `未付款${this.orderNumData.waitPayNum ? '(' + this.orderNumData.waitPayNum + ')' : ''}`, value: 'UNPAID'},
        {title: `已付款${this.orderNumData.waitDeliveryNum ? '(' + this.orderNumData.waitDeliveryNum + ')' : ''}`, value: 'PAID'},
        {title: `待发货${this.orderNumData.waitShipNum ? '(' + this.orderNumData.waitShipNum + ')' : ''}`, value: 'UNDELIVERED'},
        {title: `部分发货${this.orderNumData.partsDeliveredNumNum ? '(' + this.orderNumData.partsDeliveredNumNum + ')' : ''}`, value: 'PARTS_DELIVERED'},
        {title: `待收货${this.orderNumData.deliveredNum ? '(' + this.orderNumData.deliveredNum + ')' : ''}`, value: 'DELIVERED'},
        {title: `待核验${this.orderNumData.waitCheckNum ? '(' + this.orderNumData.waitCheckNum + ')' : ''}`, value: 'TAKE'},
        {title: `待自提${this.orderNumData.waitSelfPickNum ? '(' + this.orderNumData.waitSelfPickNum + ')' : ''}`, value: 'STAY_PICKED_UP'},
        {title: `已完成${this.orderNumData.finishNum ? '(' + this.orderNumData.finishNum + ')' : ''}`, value: 'COMPLETED'},
        {title: `已关闭${this.orderNumData.closeNum ? '(' + this.orderNumData.closeNum + ')' : ''}`, value: 'CANCELLED'},
      ];
    }
  },
  methods: {
    // 初始化数据
    init() {
      this.getDataList();
      this.getOrderNumData(); // 新增：获取订单数量统计
    },
    // 分页 改变页码
    changePage(v) {
      this.searchForm.pageNumber = v;
      this.getDataList();
    },
    // 分页 改变页数
    changePageSize(v) {
      this.searchForm.pageNumber = 1;
      this.searchForm.pageSize = v;
      this.getDataList();
    },
    // 搜索
    handleSearch() {
      this.searchForm.pageNumber = 1;
      this.searchForm.pageSize = 20;
      this.getDataList();
      this.getOrderNumData(); // 新增：搜索时也更新数量统计
    },
    // 起止时间从新赋值
    selectDateRange(v) {
      if (v) {
        this.searchForm.startDate = v[0];
        this.searchForm.endDate = v[1];
      }
    },
    // 获取列表数据
    getDataList() {
      this.loading = true;
      API_Order.getOrderList(this.searchForm).then((res) => {
        this.loading = false;
        if (res.success) {
          this.data = res.result.records;
          this.total = res.result.total;
        }
      });
      this.total = this.data.length;
      this.loading = false;
    },
    // 跳转详情页面
    detail(v) {
      let sn = v.sn;
      this.$options.filters.customRouterPush({
        name: "order-detail",
        query: { sn: sn },
      })

    },
    // 导出订单
    async exportOrder() {
      if(this.searchForm.startDate==""||this.searchForm.endDate==""){
        this.$Message.error("必须选择时间范围，搜索后进行导出！");
      }else{
        API_Order.exportOrder(this.searchForm)
          .then((res) => {
            const blob = new Blob([res], {
              type: "application/vnd.ms-excel;charset=utf-8",
            });
            //对于<a>标签，只有 Firefox 和 Chrome（内核） 支持 download 属性
            //IE10以上支持blob但是依然不支持download
            if ("download" in document.createElement("a")) {
              //支持a标签download的浏览器
              const link = document.createElement("a"); //创建a标签
              link.download = "订单列表.xlsx"; //a标签添加属性
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
      }

    },
    // 订单筛选
    orderStatusClick(name) {
      if (name === 0) {
        // 点击"全部"时，设置为空字符串，在getDataList中会被过滤掉
        this.searchForm.orderStatus = '';
      } else {
        // 其他状态正常赋值
        this.searchForm.orderStatus = name;
      }
      this.currentStatus = name;
     
      this.getDataList();
    },
    getOrderNumData() {
      // 创建一个不包含orderStatus字段的搜索参数
      const { orderStatus, ...searchParams } = this.searchForm;
      API_Order.getOrderNum(searchParams).then((res) => {
        if (res.success) {
          this.orderNumData = res.result;
        }
      }).catch((err) => {
        console.error('获取订单数量统计失败:', err);
      });
    },
  },
  mounted() {
    this.init();
  },
};
</script>
<style lang="scss" scoped>
.export {
  margin: 10px 20px 10px 0;
}
.export-excel-wrapper {
  display: inline;
}

// Tab组件样式
.order-tab {
  ::v-deep .ivu-tabs-tab {
    font-size: 14px;
  }
}
.ops a {
  color: #2d8cf0;
  cursor: pointer;
  text-decoration: none;
}
.ops span {
  display: inline-block;
  margin: 0 8px;
  color: #dcdee2;
}
</style>
