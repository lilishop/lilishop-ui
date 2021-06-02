<template>
  <div class="search">
    <Row>
      <Col>
        <Card>
          <Row @keydown.enter.native="handleSearch">
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
                  style="width: 200px"
                />
              </Form-item>
              <Form-item label="会员名称" prop="memberName">
                <Input
                  type="text"
                  v-model="searchForm.memberName"
                  clearable
                  placeholder="请输入会员名称"
                  style="width: 200px"
                />
              </Form-item>
              <Form-item label="店铺名称" prop="storeName">
                <Input
                  type="text"
                  v-model="searchForm.storeName"
                  clearable
                  placeholder="请输入会员名称"
                  style="width: 200px"
                />
              </Form-item>
              <Form-item label="发票抬头" prop="receiptTitle">
                <Input
                  type="text"
                  v-model="searchForm.receiptTitle"
                  clearable
                  placeholder="请输入发票抬头"
                  style="width: 200px"
                />
              </Form-item>

              <Form-item label="状态" prop="receiptStatus">
                <Select v-model="searchForm.receiptStatus" placeholder="请选择" clearable style="width: 200px">
                  <Option value="0">未开票</Option>
                  <Option value="1">已开票</Option>
                </Select>
              </Form-item>
              <Button @click="handleSearch" type="primary" icon="ios-search" class="search-btn">搜索</Button>

            </Form>
          </Row>
          <Table
            :loading="loading"
            border
            :columns="columns"
            :data="data"
            ref="table"
            sortable="custom"
            @on-sort-change="changeSort"
            @on-selection-change="changeSelect"
          >
            <!-- 订单详情格式化 -->
            <template slot="orderSlot" slot-scope="scope">
              <a
                @click="$router.push({name: 'order-detail',query: {sn: scope.row.orderSn}})">{{scope.row.orderSn}}</a>
            </template>
          </Table>
          <Row type="flex" justify="end" class="page">
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
      </Col>
    </Row>
  </div>
</template>

<script>
  import * as API_Order from "@/api/order";
  import { getShopListData } from "@/api/shops.js";
  export default {
    name: "receipt",
    components: {},
    data() {
      return {
        loading: true, // 表单加载状态
        searchForm: {
          // 搜索框初始化对象
          pageNumber: 1, // 当前页数
          pageSize: 10, // 页面大小
          sort: "createTime", // 默认排序字段
          order: "desc", // 默认排序方式
          receiptStatus: "", // 起始时间
        },
        shopsData: [], // 店铺数据
        params: {
          pageNumber: 1,
          pageSize: 10,
        },
        submitLoading: false, // 添加或编辑提交状态
        selectList: [], // 多选数据
        selectCount: 0, // 多选计数
        columns: [
          {
            title: "订单号",
            key: "orderSn",
            minWidth: 120,
            slot: "orderSlot",
          },
          {
            title: "会员名称",
            key: "memberName",
            minWidth: 90,
            tooltip: true
          },

          {
            title: "发票抬头",
            key: "receiptTitle",
            minWidth: 90,
            tooltip: true
          },
          {
            title: "纳税人识别号",
            key: "taxpayerId",
            minWidth: 100,
            tooltip: true

          },
          {
            title: "发票内容",
            key: "receiptContent",
            minWidth: 120,
            tooltip: true
          },
          {
            title: "发票金额",
            key: "billPrice",
            width: 90,
            render: (h, params) => {
              return h(
                "div",
                this.$options.filters.unitPrice(params.row.receiptPrice, "￥")
              );
            },
          },
          {
            title: "发票状态",
            key: "receiptStatus",
            width: 90,
            tooltip: true,
            render: (h, params) => {
              if(params.row.receiptStatus == 0){
                return h(
                  "div",
                  "未开票"
                );
              }else{
                return h(
                  "div",
                  "已开票"
                );
              }

            },
          },
          {
            title: "订单状态",
            key: "orderStatus",
            width: 90,
            render: (h, params) => {
              if (params.row.orderStatus == "UNPAID") {
                return h('div', [h('span', { }, '未付款'),]);
              } else if (params.row.orderStatus == "PAID") {
                return h('div', [h('span', { }, '已付款'),]);
              } else if (params.row.orderStatus == "UNDELIVERED") {
                return h('div', [h('span', { }, '待发货'),]);
              }else if (params.row.orderStatus == "DELIVERED") {
                return h('div', [h('span', { }, '已发货'),]);
              }else if (params.row.orderStatus == "COMPLETED") {
                return h('div', [h('span', { }, '已完成'),]);
              }else if (params.row.orderStatus == "TAKE") {
                return h('div', [h('span', { }, '待核验'),]);
              }else if (params.row.orderStatus == "CANCELLED") {
                return h('div', [h('span', { }, '已取消'),]);
              }
            }
          },
        ],
        data: [], // 表单数据
        total: 0, // 表单数据总数
      };
    },
    methods: {
      init() {
        this.getData();
        this.getShopList();
      },
      handleReachBottom() {
        setTimeout(() => {
          if (this.params.pageNumber * this.params.pageSize <= this.total) {
            this.params.pageNumber++;
            this.getShopList();
          }
        }, 1500);
      },
      changePage(v) {
        this.searchForm.pageNumber = v;
        this.getData();
        this.clearSelectAll();
      },
      changePageSize(v) {
        this.searchForm.pageSize = v;
        this.getData();
      },
      handleSearch() {
        this.searchForm.pageNumber = 1;
        this.searchForm.pageSize = 10;
        this.getData();
      },
      changeSort(e) {
        this.searchForm.sort = e.key;
        this.searchForm.order = e.order;
        if (e.order === "normal") {
          this.searchForm.order = "";
        }
        this.getData();
      },
      clearSelectAll() {
        this.$refs.table.selectAll(false);
      },
      changeSelect(e) {
        this.selectList = e;
        this.selectCount = e.length;
      },
      selectDateRange(v) {
        if (v) {
          this.searchForm.startDate = v[0];
          this.searchForm.endDate = v[1];
        }
      },
      getShopList() {
        getShopListData(this.params).then((res) => {
          if (res.success) {
            /**
             * 解决数据请求中，滚动栏会一直上下跳动
             */
            this.shopTotal = res.result.total;
            this.shopsData.push(...res.result.records);
          }
        });
      },
      getData() {
        this.loading = true;
        API_Order.getReceiptPage(this.searchForm).then((res) => {
          this.loading = false;
          if (res.success) {
            this.data = res.result.records;
            this.total = res.result.total;
          }
        });
        this.total = this.data.length;
        this.loading = false;
      },
    },
    mounted() {
      this.init();
    },
  };
</script>
<style lang="scss" scoped>
  // 建议引入通用样式 可删除下面样式代码
   @import "../../../styles/table-common.scss";
</style>
