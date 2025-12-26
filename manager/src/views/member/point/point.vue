<template>
  <div class="search">
    <Card class="points-statistics-card">
      <Row type="flex" justify="space-around" align="middle" class="points-statistics">
        <Col :xs="24" :sm="12" class="points-statistics-item">
          <div class="points-statistics-title">已发放积分数</div>
          <div class="points-statistics-subtitle">历史累计发放积分数</div>
          <div class="points-statistics-value">{{ formatNumber(pointsStatistics.totalPoint) }}</div>
        </Col>
        <Col :xs="24" :sm="12" class="points-statistics-item">
          <div class="points-statistics-title">未使用积分数</div>
          <div class="points-statistics-subtitle">会员账户未使用积分数</div>
          <div class="points-statistics-value">{{ formatNumber(pointsStatistics.unUsedPoint) }}</div>
        </Col>
      </Row>
    </Card>
    <Card >
      <Form
        @keydown.enter.native="handleSearch"
        ref="searchForm"
        :model="searchForm"
        inline
        
        :label-width="70"
        @submit.native.prevent
        class="search-form"
      >
        <Form-item label="会员名称" prop="username">
          <Input
            type="text"
            v-model="searchForm.memberName"
            placeholder="请输入会员名称"
            clearable
            style="width: 240px"
          />
          </Form-item>
        <Button @click="handleSearch" class="search-btn" type="primary" icon="ios-search">搜索</Button >
      </Form>
      </Card>
    <Card>
      <Table
        :loading="loading"
        border
        :columns="columns"
        :data="data"
        ref="table"
        class="mt_10 point-table"
      >
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

  import * as API_Member from "@/api/member.js";

  export default {
    // 积分历史页面
    name: "point",
    data() {
      return {
        loading: true, // 表单加载状态
        pointsStatistics: {
          totalPoint: 0,
          unUsedPoint: 0,
        },
        searchForm: { // 请求参数
          pageNumber: 1,
          pageSize: 20,
        },
        columns: [
          {
            title: "会员名称",
            key: "memberName",
            minWidth: 120,
            tooltip: true
          },
          {
            title: "操作内容",
            key: "content",
            minWidth: 200,
            tooltip: true
          },

          {
            title: "之前积分",
            key: "beforePoint",
            width: 200,
          },

          {
            title: "变动积分",
            key: "variablePoint",
            width: 200,
            render: (h, params) => {
              if (params.row.pointType == 'INCREASE') {
                return h("priceColorScheme", {props:{value:params.row.variablePoint,color:'green',unit:"+"}} );
              } else {
                return h("priceColorScheme", {props:{value:params.row.variablePoint,color:this.$mainColor,unit:"-"}} );
              }
            }
          },
          {
            title: "当前积分",
            key: "point",
            width: 200,
          },
          {
            title: "操作时间",
            key: "createTime",
            width: 200
          },

        ],
        data: [], // 表单数据
        total: 0, // 表单数据总数
      };
    },
    methods: {
      // 回调给父级
      callback(val) {
        this.$emit("callback", val);
      },
      // 初始化数据
      init() {
        this.getStatistics();
        this.getData();
      },
      getStatistics() {
        API_Member.queryMemberPointsStatistics().then((res) => {
          if (res && res.success && res.result) {
            this.pointsStatistics = {
              totalPoint: res.result.totalPoint || 0,
              unUsedPoint: res.result.unUsedPoint || 0,
            };
          }
        });
      },
      formatNumber(value) {
        const numericValue = Number(value || 0);
        if (!Number.isFinite(numericValue)) return "0";
        return numericValue.toLocaleString();
      },
      // 分页 改变页码
      changePage(v) {
        this.searchForm.pageNumber = v;
        this.getData();
      },
      // 分页 改变页数
      changePageSize(v) {
        this.searchForm.pageNumber = 1;
        this.searchForm.pageSize = v;
        this.getData();
      },
      // 搜索
      handleSearch() {
        this.searchForm.pageNumber = 1;
        this.searchForm.pageSize = 20;
        this.getData();
      },
      //查新积分列表
      getData() {
        this.loading = true;
        API_Member.getHistoryPointData(this.searchForm).then((res) => {
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
<style lang="scss" scoped>
  .points-statistics-card {
    margin-bottom: 10px;
  }

  .points-statistics {
    width: 100%;
  }

  .points-statistics-item {
    padding: 10px 0;
    text-align: center;
  }

  .points-statistics-title {
    font-size: 14px;
    color: #17233d;
    line-height: 20px;
  }

  .points-statistics-subtitle {
    font-size: 12px;
    color: #808695;
    line-height: 18px;
    margin-top: 4px;
  }

  .points-statistics-value {
    font-size: 18px;
    font-weight: 600;
    color: #fa6419;
    line-height: 26px;
    margin-top: 8px;
  }

  .point-table {
    ::v-deep .ivu-table-border th,
    ::v-deep .ivu-table-border td {
      border-right: 0;
    }
  }

  .face {
    width: 60px;
    height: 60px;
    border-radius: 50%;
  }
</style>
