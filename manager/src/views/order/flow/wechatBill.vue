<template>
  <div class="search">
    <Card>
      <Row @keydown.enter.native="handleSearch">
        <Form
          ref="searchForm"
          :model="searchForm"
          inline
          :label-width="90"
          class="search-form"
        >
          <Form-item label="资金账户类型">
            <Select
              v-model="searchForm.accountType"
              placeholder="请选择"
              clearable
              style="width: 200px"
            >
              <Option value="BASIC">基本账户</Option>
              <Option value="OPERATION">运营账户</Option>
              <Option value="FEES">手续费账户</Option>
            </Select>
          </Form-item>
          <Form-item label="账单类型">
            <Select
              v-model="searchForm.billType"
              placeholder="请选择"
              clearable
              style="width: 200px"
            >
              <Option value="TRADE_BILL">交易账单</Option>
              <Option value="FUNDFLOW_BILL">资金账单</Option>
              <Option value="PROFITSHARING">分账账单</Option>
            </Select>
          </Form-item>

          <Form-item label="创建时间">
            <DatePicker
              v-model="selectDate"
              type="datetimerange"
              format="yyyy-MM-dd"
              clearable
              @on-change="selectDateRange"
              placeholder="选择起始时间"
              style="width: 200px"
            ></DatePicker>
          </Form-item>
          <Button
            @click="handleSearch"
            type="primary"
            icon="ios-search"
            class="search-btn"
            >搜索</Button
          >
          <Button @click="handleReset" class="search-btn" icon="md-refresh"
            >重置</Button
          >
        </Form>
      </Row>
      <Table
        ref="table"
        :columns="columns"
        :data="data"
        :loading="loading"
        border
        class="mt_10"
      >
      </Table>
      <Row class="mt_10" justify="end" type="flex">
        <Page
          :current="searchForm.pageNumber"
          :page-size="searchForm.pageSize"
          :page-size-opts="[10, 20, 50]"
          :total="total"
          show-elevator
          show-sizer
          show-total
          size="small"
          @on-change="changePage"
          @on-page-size-change="changePageSize"
        ></Page>
      </Row>
    </Card>
  </div>
</template>

<script>
import * as API_Order from "@/api/order";

export default {
  name: "withdrawLog",
  data() {
    return {
      loading: true, // 表单加载状态
      searchForm: {
        // 搜索框初始化对象
        pageNumber: 1, // 当前页数
        pageSize: 10, // 页面大小
        sort: "createTime", // 默认排序字段
        order: "desc", // 默认排序方式
      },
      // 退款起止时间
      selectDate: null,
      columns: [
        {
          title: "账单类型",
          key: "billType",
          width: 150,
          render: (h, params) => {
            if (params.row.billType === "PROFITSHARING") {
              return h("div", [
                h("Tag", { props: { color: "geekblue" } }, "分账账单"),
              ]);
            } else if (params.row.billType === "FUNDFLOW_BILL") {
              return h("div", [
                h("Tag", { props: { color: "orange" } }, "资金账单"),
              ]);
            } else if (params.row.billType === "TRADE_BILL") {
              return h("div", [
                h("Tag", { props: { color: "blue" } }, "交易账单"),
              ]);
            }
          },
        },
        {
          title: "资金账户类型",
          key: "accountType",
          width: 120,
          render: (h, params) => {
            if (params.row.accountType == "BASIC") {
              return h("div", [h("span", {}, "基本账户")]);
            } else if (params.row.accountType == "OPERATION") {
              return h("div", [h("span", {}, "运营账户")]);
            } else if (params.row.accountType == "FEES") {
              return h("div", [h("span", {}, "手续费账户")]);
            } else {
              return h("div", [h("span", {}, "-")]);
            }
          },
        },

        {
          title: "账单日期",
          key: "billDate",
          width: 100,
          tooltip: true,
          render: (h, params) => {
            return h("div", [
              h(
                "span",
                {},
                this.formatTime(new Date(params.row.billDate).getTime())
              ),
            ]);
          },
        },
        {
          title: "操作",
          key: "action",
          align: "center",
          width: 100,
          render: (h, params) => {
            return h(
              "Button",
              {
                props: { type: "info", size: "small" },
                style: { marginRight: "5px" },
                on: {
                  click: () => {
                    this.download(params.row);
                  },
                },
              },
              "下载账单"
            );
          },
        },
      ],
      data: [], // 表单数据
      total: 0, // 表单数据总数
    };
  },
  methods: {
    handleReset() {
      this.searchForm = {
        // 搜索框初始化对象
        pageNumber: 1, // 当前页数
        pageSize: 10, // 页面大小
        sort: "createTime", // 默认排序字段
        order: "desc", // 默认排序方式
      };
      this.selectDate = "";
      this.init();
    },
    formatTime(params) {
      let date = new Date(params);
      return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
    },
    // 初始化数据
    init() {
      this.getDataList();
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
      this.searchForm.pageSize = 10;
      this.getDataList();
    },
    // 起止时间从新赋值
    selectDateRange(v) {
      if (v) {
        this.searchForm.startDate = v[0];
        this.searchForm.endDate = v[1];
      }
    },
    //下单账单
    download(e) {
      window.open(e.downloadUrl);
    },
    // 获取列表数据
    getDataList() {
      this.loading = true;
      API_Order.wechatBill(this.searchForm).then((res) => {
        this.loading = false;
        if (res.success) {
          this.data = res.result.records;
          this.total = res.result.total;
        }
      });
      this.loading = false;
    },
  },
  mounted() {
    this.init();
  },
};
</script>
