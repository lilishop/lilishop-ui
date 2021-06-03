<template>
  <div class="search">
    <Row>
      <Col>
        <Card>
          <Form
            label-position="left"
            ref="searchForm"
            :model="params"
            inline
            :label-width="100"
          >
            <Form-item label="选择时间类型" prop="sn">
              <Select v-model="params.timeType" style="width: 200px">
                <Option
                  v-for="item in typeList"
                  :value="item.value"
                  :key="item.value"
                >{{ item.label }}
                </Option
                >
              </Select>
            </Form-item>
            <Form-item label="按年查询" prop="year">
              <DatePicker
                type="year"
                style="width: 200px"
                v-model="year"
                @on-change="changeYear"
              ></DatePicker>
            </Form-item>
            <Form-item label="按月查询" v-if="params.timeType == 'MONTH'">
              <InputNumber :max="12" :min="1" v-model="params.month"></InputNumber>
            </Form-item>
          </Form>
        </Card>

        <Card style="margin-top: 2px;height: 130px">
          <h3>订单统计</h3>
          <div class="ant-row">
            <div class="ant-col-4">
              <p class="static-menu">
                <span style="font-size: 14px;">总数</span>
              </p>
              <p class="static-num">
                {{priceData.totalNum}}
              </p>
            </div>
            <div>
              <p class="static-menu">
                <span style="font-size: 14px;">总金额</span>
              </p>
              <p class="static-num">
                {{ priceData.price | unitPrice('￥') }}
              </p>
            </div>
          </div>
        </Card>


        <Card style="margin-top: 2px">
          <Table :loading="loading"
            border
            :columns="columns"
            :data="data" ref="table"
            sortable="custom"
            @on-sort-change="changeSort"
            @on-selection-change="changeSelect">
          </Table>
          <Row type="flex" justify="end" class="page">
            <Page :current="searchForm.pageNumber"
                  :total="total"
                  :page-size="searchForm.pageSize"
                  @on-change="changePage"
                  @on-page-size-change="changePageSize"
                  :page-size-opts="[10,20,50]"
                  size="small"
                  show-total
                  show-elevator
                  how-sizer></Page>
          </Row>
        </Card>
      </Col>
    </Row>
  </div>
</template>

<script>
  import * as API_Statistics from "@/api/statistics";

  export default {
    name: "goodsStatistics",
    components: {},
    data() {
      return {
        searchForm: [],
        params: {
          pageNumber: 1, // 当前页数
          pageSize: 10, // 页面大小
          type: "NUM",
          timeType: "YEAR",
          year:'',
        },
        year:'',

        priceData:{
          totalNum:0,
          price:0
        },
        loading: true, // 表单加载状态
        typeList: [
          {
            value: "YEAR",
            label: "年",
          },
          {
            value: "MONTH",
            label: "月",
          },
        ],
        columns: [
          {
            title: "店铺",
            key: "sellerName",
          },
          {
            title: "订单编号",
            key: "orderItemSn",
          },
          {
            title: "购买人",
            key: "memberName",
          },
          {
            title: "订单金额",
            key: "finalPrice",
          },
          {
            title: "创建时间",
            key: "createTime",
          },
        ],
        data: [],
        total: 0 // 表单数据总数
      };
    },
    watch: {
      params: {
        handler(val) {
          this.init();
        },
        deep: true,
      }
    },
    methods: {
      //初始化
      init() {
        this.getDataPage()
      },
      getDataPage() {
        this.loading = true;
        API_Statistics.getOrderStatistics(this.params).then((res) => {
          this.loading = false;
          this.data = res.result.records
          this.total = res.result.total
        });
        API_Statistics.getOrderStatisticsPrice(this.params).then((res) => {
          this.loading = false;
          this.priceData.totalNum  = res.result.num
          this.priceData.price  = res.result.price?res.result.price:0
        });
      },
      changeYear(item){
        this.params.year = item;
      }
    },
    mounted() {
      let nowDate = new Date();
      this.params.year = this.year = nowDate.getFullYear() + ''
      this.init();
    },

  };
</script>
<style lang="scss">
  // 建议引入通用样式 可删除下面样式代码
  @import "@/styles/table-common.scss";

  .ant-row {
    position: relative;
    height: auto;
    margin-right: 0;
    margin-left: 0;
    zoom: 1;
    display: block;
    box-sizing: border-box;
    margin-left: 30px;
    margin-top: 10px;
  }


  .ant-col-4 {
    display: block;
    box-sizing: border-box;
    width: 11%;
    flex: 0 0 auto;
    float: left;
  }

  .static-num {
    color: rgb(51, 51, 51);
    font-size: 16px;
    padding: 5px;
  }

  .static-menu {
    color: rgb(51, 51, 51);
    font-size: 16px;
    padding: 5px;
  }
</style>
