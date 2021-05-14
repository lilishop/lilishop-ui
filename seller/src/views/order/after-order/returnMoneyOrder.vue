<template>
  <div class="search">
    <Row>
      <Col>
        <Card>
          <Row @keydown.enter.native="handleSearch">
            <Form ref="searchForm" :model="searchForm" inline :label-width="70" class="search-form">
              <Form-item label="商品" prop="goodsName">
                <Input
                  type="text"
                  v-model="searchForm.goodsName"
                  clearable
                  placeholder="请输入商品名称"
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
              <Form-item label="订单编号" prop="orderSn">
                <Input
                  type="text"
                  v-model="searchForm.orderSn"
                  clearable
                  placeholder="请输入订单编号"
                  style="width: 200px"
                />
              </Form-item>

              <Form-item label="申请时间">
                <DatePicker
                  v-model="selectDate"
                  type="datetimerange"
                  format="yyyy-MM-dd HH:mm:ss"
                  clearable
                  @on-change="selectDateRange"
                  placeholder="选择起始时间"
                  style="width: 200px"
                ></DatePicker>
              </Form-item>
              <Button @click="handleSearch" type="primary" icon="ios-search" class="search-btn">搜索</Button>
              <Button @click="handleReset" class="search-btn">重置</Button>
            </Form>
          </Row>
          <Row class="padding-row">
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

              <!-- 商品栏目格式化 -->
              <template slot="goodsSlot" slot-scope="scope">
                <div style="margin-top: 5px;height: 90px; display: flex;">
                  <div style="">
                    <img :src="scope.row.goodsImage" style="height: 80px;margin-top: 3px">
                  </div>

                  <div style="margin-left: 13px;margin-top: 3px;">
                    <div class="div-zoom" >
                      <a>{{scope.row.goodsName}}</a>
                    </div>
                  </div>
                </div>

              </template>
            </Table>
          </Row>
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

  export default {
    name: "returnMoneyOrder",
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
          startDate: "", // 起始时间
          endDate: "", // 终止时间
          serviceType:"RETURN_MONEY",
          orderSn:"",
          memberName:"",
          goodsName:""
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
        // 表单验证规则
        formValidate: {},
        submitLoading: false, // 添加或编辑提交状态
        selectList: [], // 多选数据
        selectCount: 0, // 多选计数
        columns: [
          // 表头
          {
            title: "退款编号",
            key: "sn",
            minWidth: 150,
          },
          {
            title: "订单号",
            key: "orderSn",
            minWidth: 150,
          },

          {
            title: "商品",
            key: "sn",
            minWidth: 250,
            sortable: false,
            slot: "goodsSlot",
          },
          {
            title: "申请退款金额",
            key: "applyRefundPrice",
            width: 130,
            sortType: "desc",
            render: (h, params) => {
              return h(
                "div",
                this.$options.filters.unitPrice(params.row.applyRefundPrice, "￥")
              );
            },
          },
          {
            title: "会员",
            key: "memberName",
            minWidth: 130,
            tooltip: true
          },
          {
            title: "申请时间",
            key: "createTime",
            width: 170
          },
          {
            title: "售后状态",
            key: "serviceStatus",
            minWidth: 120,
            render: (h, params) => {
              if (params.row.serviceStatus == "APPLY") {
                return h('div', [h('span', { }, '申请售后'),]);
              } else if (params.row.serviceStatus == "PASS") {
                return h('div', [h('span', { }, '审核通过'),]);
              } else if (params.row.serviceStatus == "REFUSE") {
                return h('div', [h('span', { }, '审核拒绝'),]);
              } else if (params.row.serviceStatus == "BUYER_RETURN") {
                return h('div', [h('span', { }, '买家退货，待卖家收货'),]);
              }else if (params.row.serviceStatus == "SELLER_RE_DELIVERY") {
                return h('div', [h('span', { }, '商家换货/补发'),]);
              }else if (params.row.serviceStatus == "SELLER_CONFIRM") {
                return h('div', [h('span', { }, '卖家确认收货'),]);
              }else if (params.row.serviceStatus == "SELLER_TERMINATION") {
                return h('div', [h('span', { }, '卖家终止售后'),]);
              }else if (params.row.serviceStatus == "BUYER_CONFIRM") {
                return h('div', [h('span', { }, '买家确认收货'),]);
              }else if (params.row.serviceStatus == "BUYER_CANCEL") {
                return h('div', [h('span', { }, '买家取消售后'),]);
              }else if (params.row.serviceStatus == "WAIT_REFUND") {
                return h('div', [h('span', { }, '等待平台退款'),]);
              }else if (params.row.serviceStatus == "COMPLETE") {
                return h('div', [h('span', { }, '完成'),]);
              }
            }
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
      };
    },
    methods: {

      init() {
        this.getDataList();
      },
      changePage(v) {
        this.searchForm.pageNumber = v;
        this.getDataList();
        this.clearSelectAll();
      },
      changePageSize(v) {
        this.searchForm.pageSize = v;
        this.getDataList();
      },
      handleSearch() {
        this.searchForm.pageNumber = 1;
        this.searchForm.pageSize = 10;
        this.getDataList();
      },
      handleReset() {
        this.selectDate = ''
        this.searchForm = {}
        this.searchForm.pageNumber = 1;
        this.searchForm.pageSize = 10;
        this.getDataList();
      },
      changeSort(e) {
        this.searchForm.sort = e.key;
        this.searchForm.order = e.order;
        if (e.order === "normal") {
          this.searchForm.order = "";
        }
        this.getDataList();
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
      getDataList() {
        this.loading = true;
        API_Order.afterSaleOrderPage(this.searchForm).then((res) => {
          this.loading = false;
          if (res.success) {
            this.data = res.result.records;
            this.total = res.result.total;
          }
        });
        this.total = this.data.length;
        this.loading = false;
      },

      detail(v) {
        let sn = v.sn;
        this.$router.push({
          name: "return-goods-order-detail",
          query: { sn: sn },
        });

      },
    },
    activated() {
      this.init();
    },
  };
</script>
<style lang="scss">
  // 建议引入通用样式 可删除下面样式代码
   @import "@/styles/table-common.scss";
</style>
