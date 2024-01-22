<template>
  <div class="search">
    <Card>
      <Row @keydown.enter.native="handleSearch">
        <Form ref="searchForm" :model="searchForm" inline :label-width="70" class="search-form">
          <Form-item label="订单号" prop="orderSn">
            <Input type="text" v-model="searchForm.orderSn" placeholder="请输入订单号" clearable style="width: 200px" />
          </Form-item>
          <Form-item label="会员名称" prop="buyerName">
            <Input type="text" v-model="searchForm.buyerName" placeholder="请输入会员名称" clearable style="width: 200px" />
          </Form-item>
<!--          <Form-item label="订单状态" prop="orderStatus">-->
<!--            <Select v-model="searchForm.orderStatus" placeholder="请选择" clearable style="width: 200px">-->
<!--              <Option value="NEW">新订单</Option>-->
<!--              <Option value="CONFIRM">已确认</Option>-->
<!--              <Option value="TAKE">待核验</Option>-->
<!--              <Option value="COMPLETE">已完成</Option>-->
<!--              <Option value="WAIT_PINTUAN">待成团</Option>-->
<!--              <Option value="CANCELLED">已关闭</Option>-->
<!--            </Select>-->
<!--          </Form-item>-->
          <Form-item label="下单时间">
            <DatePicker v-model="selectDate" type="datetimerange" format="yyyy-MM-dd" clearable
              @on-change="selectDateRange" placeholder="选择起始时间" style="width: 200px"></DatePicker>
          </Form-item>
          <Button @click="handleSearch" type="primary" icon="ios-search" class="search-btn">搜索</Button>

        </Form>
      </Row>

      <div class="order-tab">
        <div v-for="(item,index) in orderStatus" :key="index" :class="{'current': currentStatus === item.value}" @click="orderStatusClick(item)">
          {{item.title}}
        </div>
      </div>

      <Table :loading="loading" border :columns="columns" :data="data" ref="table" class="mt_10" sortable="custom"
        @on-sort-change="changeSort"></Table>
      <Row type="flex" justify="end" class="mt_10">
        <Page :current="searchForm.pageNumber" :total="total" :page-size="searchForm.pageSize" @on-change="changePage"
          @on-page-size-change="changePageSize" :page-size-opts="[10, 20, 50]" size="small" show-total show-elevator
          show-sizer></Page>
      </Row>
    </Card>
  </div>
</template>

<script>
import * as API_Order from "@/api/order";

export default {
  name: "fictitiousOrderList",
  data () {
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
        orderType: "VIRTUAL",
        orderSn: "",
        buyerName: "",
        orderStatus: ""
      },

      selectDate: null, // 下单时间
      columns: [
        {
          title: "订单号",
          key: "sn",
          minWidth: 230,
          tooltip: true
        },
        {
          title: "下单时间",
          key: "createTime",
          width: 200,
        },
        {
          title: "订单来源",
          key: "clientType",
          width: 95,
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
          title: "买家名称",
          key: "memberName",
          width: 130,
        },
        {
          title: "订单金额",
          key: "flowPrice",
          minWidth: 120,
          sortable: true,
          render: (h, params) => {
            return h("priceColorScheme", {props:{value:params.row.flowPrice,color:this.$mainColor}} );
          },
        },

        {
          title: "订单状态",
          key: "orderStatus",
          width: 95,
          render: (h, params) => {
            if (params.row.orderStatus == "UNPAID") {
              return h("div", [h("tag", { props: { color: "magenta" } }, "未付款")]);
            } else if (params.row.orderStatus == "PAID") {
              return h("div", [h("tag", { props: { color: "blue" } }, "已付款")]);
            } else if (params.row.orderStatus == "COMPLETED") {
              return h("div", [h("tag", { props: { color: "green" } }, "已完成")]);
            } else if (params.row.orderStatus == "TAKE") {
              return h("div", [h("tag", { props: { color: "volcano" } }, "待核验")]);
            } else if (params.row.orderStatus == "CANCELLED") {
              return h("div", [h("tag", { props: { color: "red" } }, "已关闭")]);
            }
          }
        },

        {
          title: "操作",
          key: "action",
          align: "center",
          width: 200,
          render: (h, params) => {
            return h("div", [
              h(
                "Button",

                {
                  props: {
                    type: "primary",
                    size: "small",
                  },
                  attrs: {
                    disabled: params.row.orderStatus == "UNPAID" ? false : true,
                  },
                  style: {
                    marginRight: "5px",
                  },
                  on: {
                    click: () => {
                      this.confirmPrice(params.row);
                    },
                  },
                },
                "收款"
              ),
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
      orderStatus: [
        {title: '全部', value: ''},
        {title: '未付款', value: 'UNPAID'},
        {title: '已付款', value: 'PAID'},
        {title: '待核验', value: 'TAKE'},
        {title: '已完成', value: 'COMPLETED'},
        {title: '已关闭', value: 'CANCELLED'},
      ],
      currentStatus: ''
    };
  },
  methods: {
    // 初始化数据
    init () {
      this.getDataList();
    },
    // 分页 改变页码
    changePage (v) {
      this.searchForm.pageNumber = v;
      this.getDataList();
    },
    // 分页 改变页数
    changePageSize (v) {
      this.searchForm.pageNumber = 1;
      this.searchForm.pageSize = v;
      this.getDataList();
    },
    // 搜索
    handleSearch () {
      this.searchForm.pageNumber = 1;
      this.searchForm.pageSize = 10;
      this.getDataList();
    },
    // 列表排序
    changeSort (e) {
      this.searchForm.sort = e.key;
      this.searchForm.order = e.order;
      if (e.order === "normal") {
        this.searchForm.order = "";
      }
      this.getDataList();
    },
    // 起止时间从新赋值
    selectDateRange (v) {
      if (v) {
        this.searchForm.startDate = v[0];
        this.searchForm.endDate = v[1];
      }
    },
    // 获取列表数据
    getDataList () {
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
    //确认收款
    confirmPrice (v) {
      this.$Modal.confirm({
        title: "确认收款",
        content: "您确定要收款吗？",
        loading: true,
        onOk: () => {
          API_Order.orderPay(v.sn).then(res => {
            if (res.success) {
              this.$Message.success("收款成功")
              this.getDataList()
            }
            this.$Modal.remove();
          })
        },
      });

    },
    // 订单详情
    detail (v) {
      let sn = v.sn;
      this.$options.filters.customRouterPush({
        name: "order-detail",
        query: { sn: sn, orderType: v.orderType },
      })
    },
    // 订单筛选
    orderStatusClick(item) {
      this.currentStatus = item.value;
      this.searchForm.orderStatus = item.value;
      this.getDataList();
    },
  },
  mounted () {
    this.init();
  },
};
</script>


<style lang="scss" scoped>
.order-tab {
  margin: 10px 20px 10px 0;
  width: 950px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: #f0f0f0;
  padding: 0 10px;
  div {
    text-align: center;
    padding: 4px 12px;
    border-radius: 4px;
    cursor: pointer;
  }
  .current {
    background-color: #ffffff;
  }
}
</style>
