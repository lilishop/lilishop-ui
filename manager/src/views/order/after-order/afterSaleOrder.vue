<template>
  <div class="search">
    <Card>
      <Row @keydown.enter.native="handleSearch">
        <Form
          ref="searchForm"
          :model="searchForm"
          inline
          :label-width="70"
          class="search-form"
        >
          <Form-item label="关键字" prop="keywords" style="display: block; width: 100%;">
            <Input
              type="text"
              v-model="searchForm.keywords"
              placeholder="请输入商品名称、订单编号搜索"
              clearable
              style="width: 240px"
            />
          </Form-item>
          <br>
          <Form-item label="订单编号" prop="orderSn">
            <Input
              type="text"
              v-model="searchForm.orderSn"
              placeholder="请输入订单编号"
              clearable
              style="width: 240px"
            />
          </Form-item>
          <Form-item label="售后单号" prop="sn">
            <Input
              type="text"
              v-model="searchForm.sn"
              placeholder="请输入售后单号"
              clearable
              style="width: 240px"
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
              style="width: 240px"
            ></DatePicker>
          </Form-item>
          <Form-item label="商家名称" prop="storeName">
            <Input
              type="text"
              v-model="searchForm.storeName"
              placeholder="请输入商家名称"
              clearable
              style="width: 240px"
            />
          </Form-item>
          <Form-item label="会员名称" prop="memberName">
            <Input
              type="text"
              v-model="searchForm.memberName"
              placeholder="请输入会员名称"
              clearable
              style="width: 240px"
            />
          </Form-item>
          <Form-item label="售后类型">
            <Select
              v-model="searchForm.serviceType"
              placeholder="全部"
              clearable
              style="width: 240px"
            >
              <Option value="RETURN_MONEY">退款</Option>
              <Option value="RETURN_GOODS">退货</Option>
            </Select>
          </Form-item>
          <Button
            @click="handleSearch"
            type="primary"
            icon="ios-search"
            class="search-btn"
            >搜索</Button
          >
        </Form>
      </Row>
    </Card>
    <Card>
      <div class="order-tab">
        <Tabs v-model="currentStatus" @on-click="serviceStatusClick">
          <TabPane v-for="item in serviceStatusWithCount" :key="item.value" :label="item.title" :name="item.value">
          </TabPane>
        </Tabs>
      </div>

      <Table
        :loading="loading"
        :columns="columns"
        :data="data"
        ref="table"
        class="mt_10"
      >
        <!-- 商品栏目格式化 -->
        <template slot="goodsSlot" slot-scope="{ row }">
          <div style="margin-top: 5px; height: 80px; display: flex">
            <div style="">
              <img :src="row.goodsImage" style="width: 60px; height: 60px; margin-top: 3px; object-fit: cover; border-radius: 4px;" />
            </div>

            <div style="margin-left: 13px">
              <div class="div-zoom">
                <a @click="linkTo(row.goodsId, row.skuId)">{{ row.goodsName }}</a>
              </div>
              <div style="color: #999; font-size: 12px; margin-top: 5px;">
                商品ID: {{ row.goodsId }}
              </div>
            </div>
          </div>
        </template>
      </Table>
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
import vueQr from "vue-qr";
export default {
  components: {
    "vue-qr": vueQr,
  },
  name: "after-sale-order",
  data() {
    return {
      loading: true, // 表单加载状态
      searchForm: {
        // 搜索框初始化对象
        pageNumber: 1, // 当前页数
        pageSize: 20, // 页面大小
        sort: "createTime", // 默认排序字段
        order: "desc", // 默认排序方式
        startDate: "", // 起始时间
        endDate: "", // 终止时间
        orderSn: "",
        memberName: "",
        serviceStatus: "",
        storeName: "",
        sn: "",
        keywords: "", // 新增关键字搜索字段
      },
      selectDate: null, // 选择时间段
      form: {
        // 添加或编辑表单对象初始化数据
        sn: "",
        storeName: "",
        startTime: "",
        endTime: "",
        billPrice: "",
      },
      columns: [
        {
          title: "售后服务单号",
          key: "sn",
          minWidth: 140,
          tooltip: true,
        },
        {
          title: "订单编号",
          key: "orderSn",
          minWidth: 120,
          tooltip: true,
        },
        // 移除这个独立的商品ID列
        // {
        //   title: "商品ID",
        //   key: "goodsId",
        //   minWidth: 120,
        //   tooltip: true,
        // },
        {
          title: "商品",
          key: "goodsName",
          minWidth: 300,
          tooltip: true,
          slot: "goodsSlot",
        },
        {
          title: "会员ID",
          key: "memberId",
          minWidth: 120,
          tooltip: true,
        },
        {
          title: "会员名称",
          key: "memberName",
          width: 140,
        },
        {
          title: "店铺名称",
          key: "storeName",
          width: 100,
          tooltip: true,
        },
        {
          title: "售后金额",
          key: "applyRefundPrice",
          width: 110,
          render: (h, params) => {
            return h("priceColorScheme", {props:{value:params.row.applyRefundPrice,color:this.$mainColor}} );
          },
        },
        {
          title: "售后类型",
          key: "serviceType",
          width: 100,
          render: (h, params) => {
            if (params.row.serviceType == "RETURN_MONEY") {
              return h("div", [h("tag", { props: { color: "blue" } }, "退款")]);
            } else if (params.row.serviceType == "RETURN_GOODS") {
              return h("div", [h("tag", { props: { color: "volcano" } }, "退货")]);
            } else if (params.row.serviceType == "EXCHANGE_GOODS") {
              return h("div", [h("tag", { props: { color: "green" } }, "换货")]);
            }
          },
        },

        {
          title: "售后状态",
          key: "serviceStatus",
          width: 180,
          render: (h, params) => {
            if (params.row.serviceStatus == "APPLY") {
              return h("div", [h("tag", { props: { color: "blue" } }, "申请中")]);
            } else if (params.row.serviceStatus == "PASS") {
              return h("div", [h("tag", { props: { color: "cyan" } }, "通过售后")]);
            } else if (params.row.serviceStatus == "REFUSE") {
              return h("div", [h("tag", { props: { color: "volcano" } }, "拒绝售后")]);
            } else if (params.row.serviceStatus == "BUYER_RETURN") {
              return h("div", [
                h("tag", { props: { color: "orange" } }, "买家退货，待卖家收货"),
              ]);
            } else if (params.row.serviceStatus == "SELLER_CONFIRM") {
              return h("div", [h("tag", { props: { color: "gold" } }, "卖家确认收货")]);
            } else if (params.row.serviceStatus == "SELLER_TERMINATION") {
              return h("div", [h("tag", { props: { color: "lime" } }, "卖家终止售后")]);
            } else if (params.row.serviceStatus == "BUYER_CANCEL") {
              return h("div", [h("tag", { props: { color: "purple" } }, "买家取消售后")]);
            } else if (params.row.serviceStatus == "COMPLETE") {
              return h("div", [h("tag", { props: { color: "green" } }, "完成售后")]);
            } else if (params.row.serviceStatus == "WAIT_REFUND") {
              return h("div", [h("tag", { props: { color: "geekblue" } }, "待平台退款")]);
            }
          },
        },
        {
          title: "申请时间",
          key: "createTime",
          width: 180,
        },
        {
          title: "操作",
          key: "action",
          fixed: "right",
          align: "center",
          width: 100,
          render: (h, params) => {
            return h("div", [
              h(
                "a",
                {
                  style: {
                    color: "#2d8cf0",
                    cursor: "pointer",
                    textDecoration: "none"
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
      serviceStatus: [
        {title: '全部', value: ''},
        {title: '申请售后', value: 'APPLY'},
        {title: '通过售后', value: 'PASS'},
        {title: '拒绝售后', value: 'REFUSE'},
        {title: '待收货', value: 'BUYER_RETURN'},
        {title: '确认收货', value: 'SELLER_CONFIRM'},
        {title: '完成售后', value: 'COMPLETE'},
        {title: '卖家终止售后', value: 'SELLER_TERMINATION'},
        {title: '买家取消售后', value: 'BUYER_CANCEL'}
      ],
      currentStatus: '',
       afterSaleNumData: {} // 售后数量统计数据
    };
  },
  methods: {
    // 初始化数据
    init() {
      this.getDataList();
      this.getAfterSaleNumData();
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
      this.getAfterSaleNumData();
    },
    // 开始结束时间分别赋值
    selectDateRange(v) {
      if (v) {
        this.searchForm.startDate = v[0];
        this.searchForm.endDate = v[1];
      }
    },
    // 获取列表数据
    getDataList() {
      this.loading = true;
      API_Order.getAfterSaleOrderPage(this.searchForm).then((res) => {
        this.loading = false;
        if (res.success) {
          this.data = res.result.records;
          this.total = res.result.total;
        }
      });
      // 获取售后状态数量
      this.total = this.data.length;
      this.loading = false;
    },
    // 获取售后数量统计
     getAfterSaleNumData() {
      const { serviceStatus, ...searchParams } = this.searchForm;
       API_Order.getAfterSaleNumVO(searchParams).then((res) => {
         if (res.success) {
           this.afterSaleNumData = res.result;
         }
       });
     },
    // 跳转售后详情
    detail(v) {
      let sn = v.sn;
      this.$options.filters.customRouterPush({
        name: "after-order-detail",
        query: { sn: sn },
      })
    },
    // 售后筛选
    serviceStatusClick(item) {
      this.currentStatus = item;
      // 如果是全部（空字符串），则删除serviceStatus字段
      if (item === 0) {
        delete this.searchForm.serviceStatus;
      } else {
        this.searchForm.serviceStatus = item;
      }
      this.getDataList();
      this.getAfterSaleNumData();
    },
  },
  mounted() {
    this.init();
  },
  computed: {
     // 带数量的售后状态
     serviceStatusWithCount() {
       return [
         {title: '全部', value: ''},
         {title: `申请售后${this.afterSaleNumData.applyNum ? '(' + this.afterSaleNumData.applyNum + ')' : ''}`, value: 'APPLY'},
         {title: `通过售后${this.afterSaleNumData.passNum ? '(' + this.afterSaleNumData.passNum + ')' : ''}`, value: 'PASS'},
         {title: `拒绝售后${this.afterSaleNumData.refuseNum ? '(' + this.afterSaleNumData.refuseNum + ')' : ''}`, value: 'REFUSE'},
         {title: `待收货${this.afterSaleNumData.buyerReturnNum ? '(' + this.afterSaleNumData.buyerReturnNum + ')' : ''}`, value: 'BUYER_RETURN'},
         {title: `确认收货${this.afterSaleNumData.sellerConfirmNum ? '(' + this.afterSaleNumData.sellerConfirmNum + ')' : ''}`, value: 'SELLER_CONFIRM'},
         {title: `完成售后${this.afterSaleNumData.completeNum ? '(' + this.afterSaleNumData.completeNum + ')' : ''}`, value: 'COMPLETE'},
         {title: `卖家终止售后${this.afterSaleNumData.sellerTerminationNum ? '(' + this.afterSaleNumData.sellerTerminationNum + ')' : ''}`, value: 'SELLER_TERMINATION'},
         {title: `买家取消售后${this.afterSaleNumData.buyerCancelNum ? '(' + this.afterSaleNumData.buyerCancelNum + ')' : ''}`, value: 'BUYER_CANCEL'},
         {title: `等待平台退款${this.afterSaleNumData.waitRefundNum ? '(' + this.afterSaleNumData.waitRefundNum + ')' : ''}`, value: 'WAIT_REFUND'}
       ];
     }
   }
  }
</script>
<style lang="scss" scoped>
// Tab组件样式
.order-tab {
  ::v-deep .ivu-tabs-tab {
    font-size: 14px;
  }
}
</style>
