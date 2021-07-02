<template>
  <div class="search">
    <Card>
      <Row @keydown.enter.native="handleSearch">
        <Form ref="searchForm" :model="searchForm" inline :label-width="70" class="search-form">
          <Form-item label="订单编号" prop="orderSn">
            <Input type="text" v-model="searchForm.orderSn" clearable placeholder="请输入订单编号" style="width: 160px" />
          </Form-item>
          <Form-item label="会员名称" prop="buyerName">
            <Input type="text" v-model="searchForm.buyerName" clearable placeholder="请输入会员名称" style="width: 160px" />
          </Form-item>
          <Form-item label="订单状态" prop="orderStatus">
            <Select v-model="searchForm.orderStatus" placeholder="请选择" clearable style="width: 160px">
              <Option value="UNPAID">未付款</Option>
              <Option value="PAID">已付款</Option>
              <Option value="UNDELIVERED">待发货</Option>
              <Option value="DELIVERED">已发货</Option>
              <Option value="COMPLETED">已完成</Option>
              <Option value="CANCELLED">已取消</Option>
            </Select>
          </Form-item>
          <Form-item label="下单时间">
            <DatePicker v-model="selectDate" type="datetimerange" format="yyyy-MM-dd" clearable @on-change="selectDateRange" placeholder="选择起始时间" style="width: 160px"></DatePicker>
          </Form-item>
          <Button @click="handleSearch" type="primary" icon="ios-search" class="search-btn">搜索</Button>
          <Button @click="handleReset" class="search-btn">重置</Button>
        </Form>
      </Row>
      <div>
        <Button type="primary" class="export" @click="expressOrderDeliver">
          批量发货
        </Button>
        <download-excel
          style="display:inline-block;"
          :data="data"
          :fields="excelColumns"
          :fetch="exportOrder"
          name="待发货订单.xls"
        >
          <Button type="success">
            导出待发货订单
          </Button>
        </download-excel>
      </div>
      <Table :loading="loading" border :columns="columns" :data="data" ref="table" sortable="custom"></Table>
      <Row type="flex" justify="end" class="page">
        <Page :current="searchForm.pageNumber" :total="total" :page-size="searchForm.pageSize" @on-change="changePage" @on-page-size-change="changePageSize" :page-size-opts="[10, 20, 50]" size="small"
          show-total show-elevator show-sizer></Page>
      </Row>
    </Card>
  </div>
</template>

<script>
import * as API_Order from "@/api/order";
import { verificationCode } from "@/api/order";
import JsonExcel from "vue-json-excel";
import Cookies from "js-cookie";
export default {
  name: "orderList",
  components: {
    "download-excel": JsonExcel,
  },
  data() {
    return {
      orderCode: "", // 虚拟订单核验码
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
      form: {
        // 添加或编辑表单对象初始化数据
        sn: "",
        sellerName: "",
        startTime: "",
        endTime: "",
        billPrice: "",
      },
      submitLoading: false, // 添加或编辑提交状态
      columns: [
        {
          title: "订单号",
          key: "sn",
          minWidth: 200,
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
              return h("div", {}, "APP端");
            } else {
              return h("div", {}, params.row.clientType);
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
            return h(
              "div",
              this.$options.filters.unitPrice(params.row.flowPrice, "￥")
            );
          },
        },

        {
          title: "订单状态",
          key: "orderStatus",
          minWidth: 100,
          render: (h, params) => {
            if (params.row.orderStatus == "UNPAID") {
              return h("div", [h("tag", {props: {color: "magenta"}}, "未付款")]);
            } else if (params.row.orderStatus == "PAID") {
              return h("div", [h("tag", {props: {color: "blue"}}, "已付款")]);
            } else if (params.row.orderStatus == "UNDELIVERED") {
              return h("div", [h("tag", {props: {color: "geekblue"}}, "待发货")]);
            } else if (params.row.orderStatus == "DELIVERED") {
              return h("div", [h("tag", {props: {color: "cyan"}}, "已发货")]);
            } else if (params.row.orderStatus == "COMPLETED") {
              return h("div", [h("tag", {props: {color: "green"}}, "已完成")]);
            } else if (params.row.orderStatus == "TAKE") {
              return h("div", [h("tag", {props: {color: "volcano"}}, "待核验")]);
            } else if (params.row.orderStatus == "CANCELLED") {
              return h("div", [h("tag", {props: {color: "red"}}, "已取消")]);
            }
          },
        },
        {
          title: "下单时间",
          key: "createTime",
          width: 170
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
      excelColumns: { // 导出excel的参数
        '编号': 'index',
        '订单号': 'sn',
        '收货人': 'consigneeName',
        '收货人联系电话': 'consigneeMobile',
        '收货地址': 'consigneeAddress',
      }
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
    // 导出的待发货订单数据
    async exportOrder () {
      let userInfo = JSON.parse(Cookies.get("userInfo"));
      console.log(userInfo);
      const params = {
        // 搜索框初始化对象
        pageNumber: 1, // 当前页数
        pageSize: 100, // 页面大小
        sort: "startDate", // 默认排序字段
        order: "desc", // 默认排序方式
        startDate: "", // 起始时间
        endDate: "", // 终止时间
        orderSn: "",
        buyerName: "",
        tag: "WAIT_SHIP",
        orderType: "NORMAL",
        storeId: userInfo.id
      }
      const res = await API_Order.queryExportOrder(params)
      if (res.success) {
        if (res.result.length === 0) {
          this.$Message.warning('暂无待发货订单')
          return []
        }
        for (let i=0; i<res.result.length; i++) {
          res.result[i].index = i+1;
          res.result[i].consigneeAddress = 
            res.result[i].consigneeAddressPath.replace(/,/g, "") + res.result[i].consigneeDetail
        }
        return res.result
      }
      
    },
    // 查看订单详情
    detail(v) {
      let sn = v.sn;
      this.$router.push({
        name: "order-detail",
        query: { sn: sn },
      });
    },
  },
  mounted() {
    this.init();
  },
  activated() {
    this.init();
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
