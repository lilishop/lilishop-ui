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
               <Form-item label="二级商户号" prop="subMchid">
                 <Input
                   type="text"
                   v-model="searchForm.subMchid"
                   placeholder="二级商户号"
                   clearable
                   style="width: 200px"
                 />
               </Form-item>
               <Form-item label="状态">
                 <Select
                   v-model="searchForm.status"
                   placeholder="请选择"
                   clearable
                   style="width: 200px"
                 >
                <Option value="CREATE_SUCCESS">受理成功</Option>
                <Option value="SUCCESS">提现成功</Option>
                <Option value="FAIL">提现失败</Option>
                <Option value="REFUND">提现退票</Option>
                <Option value="CLOSE">关单</Option>
                <Option value="INIT">业务单创建</Option>
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
                 >搜索</Button>

             </Form>
           </Row>
      <Table ref="table" :columns="columns" :data="data" :loading="loading" border class="mt_10">
      </Table>
      <Row class="mt_10" justify="end" type="flex">
        <Page :current="searchForm.pageNumber" :page-size="searchForm.pageSize" :page-size-opts="[10, 20, 50]"
          :total="total" show-elevator show-sizer show-total size="small" @on-change="changePage"
          @on-page-size-change="changePageSize"></Page>
      </Row>
    </Card>
  </div>
</template>

<script>
import * as API_Order from "@/api/order";

export default {
  name: "withdrawLog",
  data () {
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
          title: "商户预约提现单号",
          key: "outRequestNo",
          width: 200,
          tooltip: true,
        },
        {
          title: "提现" +
            "金额",
          key: "amount",
          width: 90,
          render: (h, params) => {
            return h(
              "div",
              this.$options.filters.unitPrice(params.row.amount, "￥")
            );
          },
        },
        {
          title: "账单状态",
          key: "status",
          width: 120,
          render: (h, params) => {
            let status = "";
            switch (params.row.status) {
              case "CREATE_SUCCESS":
                status = "受理成功";
                break;
              case "SUCCESS":
                status = "提现成功";
                break;
                case "FAIL":
                status = "提现失败";
                break;
              case "REFUND":
                status = "提现退票";
                break;
                case "CLOSE":
                status = "关单";
                break;
              case "INIT":
                status = "业务单已创建";
                break;
              default:
                status = "未知状态";
                break;
            }
            return h(
              "div",
              status
            );
          },
        },
        {
          title: "二级商户号",
          key: "subMchid",
          width: 120,
          tooltip: true,
        },
        {
          title: "微信支付预约提现单号",
          key: "withdrawId",
          width: 120,
        },
        {
          title: "创建时间",
          key: "createTime",
          width: 120
        },
      ],
      data: [], // 表单数据
      total: 0, // 表单数据总数
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
      API_Order.withdrawLog(this.searchForm).then((res) => {
        this.loading = false;
        if (res.success) {
          this.data = res.result.records;
          this.total = res.result.total;
        }
      });
      this.loading = false;
    },
  },
  mounted () {
    this.init();
  },
};
</script>
