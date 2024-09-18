<template>
  <div class="search">
    <Card>
      <Form
        ref="searchForm"
        :model="searchForm"
        inline
        :label-width="70"
        class="search-form"
      >
        <Form-item label="订单编号" prop="orderSn">
          <Input
            type="text"
            v-model="searchForm.orderSn"
            clearable
            placeholder="请输入订单编号"
            style="width: 160px"
          />
        </Form-item>
        <Form-item label="会员名称" prop="buyerName">
          <Input
            type="text"
            v-model="searchForm.buyerName"
            clearable
            placeholder="请输入会员名称"
            style="width: 160px"
          />
        </Form-item>
        <Form-item label="订单状态" prop="orderStatus">
          <Select
            v-model="searchForm.orderStatus"
            placeholder="请选择"
            clearable
            style="width: 160px"
          >
            <Option value="UNPAID">未付款</Option>
            <Option value="PAID">已付款</Option>
            <Option value="UNDELIVERED">待发货</Option>
            <Option value="PARTS_DELIVERED">部分发货</Option>
            <Option value="DELIVERED">已发货</Option>
            <Option value="COMPLETED">已完成</Option>
            <Option value="CANCELLED">已取消</Option>
            <Option value="STAY_PICKED_UP">待自提</Option>
          </Select>
        </Form-item>
        <Form-item label="订单类型" prop="orderType">
          <Select
            v-model="searchForm.orderPromotionType"
            placeholder="请选择"
            clearable
            style="width: 160px"
          >
            <Option value="NORMAL">普通订单</Option>
            <Option value="PINTUAN">拼团订单</Option>
            <Option value="GIFT">赠品订单</Option>
            <Option value="POINTS">积分订单</Option>
            <Option value="KANJIA">砍价订单</Option>
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
            style="width: 160px"
          ></DatePicker>
        </Form-item>
        <Button @click="handleSearch" type="primary" class="search-btn"
          >搜索</Button
        >
        <Button @click="handleReset" class="search-btn">重置</Button>
      </Form>
      <div class="export">
        <Button type="primary" class="mr_10" @click="expressOrderDeliver">批量发货</Button>
        <Button @click="exportOrder" type="info" class="export">导出订单</Button>
        <Poptip @keydown.enter.native="orderVerification" placement="bottom-start" width="400">
          <Button class="export">
            核验订单
          </Button>
          <div class="api" slot="content">
            <h2>核验码</h2>
            <div style="margin:10px 0;">
              <Input v-model="orderCode" style="width:300px; margin-right:10px;" />
              <Button style="primary" @click="orderVerification">核验</Button>
            </div>
          </div>
        </Poptip>
      </div>
      <Table
        :loading="loading"
        border
        :columns="columns"
        :data="data"
        ref="table"
      ></Table>
      <Row type="flex" justify="end" class="mt_10">
        <Page
          :current="searchForm.pageNumber"
          :total="total"
          :page-size="searchForm.pageSize"
          @on-change="changePage"
          @on-page-size-change="changePageSize"
          :page-size-opts="[10, 20, 50]"
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
import Cookies from "js-cookie";
import {verificationCode} from "@/api/order";
export default {
  name: "orderList",
  components: {
    "download-excel": JsonExcel,
  },
  data() {
    return {
      loading: true, // 表单加载状态
      searchForm: {
        // 搜索框初始化对象
        pageNumber: 1, // 当前页数
        pageSize: 10, // 页面大小
        sort: "", // 默认排序字段
        order: "", // 默认排序方式
        startDate: "", // 起始时间
        endDate: "", // 终止时间
        orderSn: "",
        buyerName: "",
        orderStatus: "",
        orderType: "NORMAL",
      },
      selectDate: null,
      columns: [
        {
          title: "订单号",
          key: "sn",
          minWidth: 200,
          tooltip: true,
          render: (h, params) => {
            if (params.row.sellerRemark) {
              return h("div", {}, params.row.sellerRemark + " ("+params.row.sn+")");
            } else {
              return h("div", {}, params.row.sn);
            }
          },
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
              return h("div", {}, "APP端");
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
          title: "订单金额",
          key: "flowPrice",
          minWidth: 100,
          tooltip: true,
          render: (h, params) => {
            return h("priceColorScheme", {props:{value:params.row.flowPrice,color:this.$mainColor}} );
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
                h("tag", { props: { color: "red" } }, "已取消"),
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
            return h("div", [
              h(
                "Button",
                {
                  props: {
                    type: "info",
                    size: "small",
                  },
                  style: {
                    marginRight: "5px",
                  },
                  on: {
                    click: () => {
                      this.detail(params.row);
                    },
                  },
                },
                "查看"
              ),
            ]);
          },
        },
      ],
      data: [], // 表单数据
      total: 0, // 表单数据总数
      excelColumns: {
        // 导出excel的参数
        编号: "index",
        订单号: "sn",
        收货人: "consigneeName",
        收货人联系电话: "consigneeMobile",
        收货地址: "consigneeAddress",
        商品名称: "goodsName",
        商品价格: "goodsPrice",
        订单金额: "flowPrice",
        商品数量: "num",
        店铺名称: "storeName",
        创建时间: "createTime",
      },
    };
  },
  methods: {
    /**
     * 核验订单
     */
    async orderVerification() {
      let result = await verificationCode(this.orderCode);

      if (result.success) {
        this.$router.push({
          name: "order-detail",
          query: { sn: result.result.sn || this.orderCode },
        });
      }
    },
    /**
     * 批量发货
     */
    expressOrderDeliver() {
      this.$router.push({
        path: "/export-order-deliver",
      });
    },
    // 初始化数据
    init() {
      this.getDataList();
    },
    // 改变页码
    changePage(v) {
      this.searchForm.pageNumber = v;
      this.getDataList();
    },
    // 改变页数
    changePageSize(v) {
      this.searchForm.pageSize = v;
      this.getDataList();
    },
    // 搜索订单
    handleSearch() {
      this.searchForm.pageNumber = 1;
      this.searchForm.pageSize = 10;
      this.getDataList();
    },
    // 重置
    handleReset() {
      this.searchForm = {};
      this.searchForm.pageNumber = 1;
      this.searchForm.pageSize = 10;
      this.selectDate = null;
      this.searchForm.startDate = "";
      this.searchForm.endDate = "";
      this.searchForm.orderType = "NORMAL",
      // 重新加载数据
      this.getDataList();
    },
    // 起始时间处理
    selectDateRange(v) {
      if (v) {
        this.searchForm.startDate = v[0];
        this.searchForm.endDate = v[1];
      }
    },
    // 获取表格数据
    getDataList() {
      this.loading = true;
      API_Order.getOrderList(this.searchForm).then((res) => {
        this.loading = false;
        if (res.success) {
          this.data = res.result.records;
          this.total = res.result.total;
        }
      });
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
    // 查看订单详情
    detail(v) {
      let sn = v.sn;
      this.$options.filters.customRouterPush({
        name: "order-detail",
        query: { sn: sn },
      })

    },
  },
  mounted() {
    this.init();
  },
  // 页面缓存处理，从该页面离开时，修改KeepAlive为false，保证进入该页面是刷新
  beforeRouteLeave(to, from, next) {
    from.meta.keepAlive = false;
    next();
  },
};
</script>
<style lang="scss">
// 建议引入通用样式 可删除下面样式代码
@import "@/styles/table-common.scss";
.export {
  margin: 10px 20px 10px 0;
}
</style>
