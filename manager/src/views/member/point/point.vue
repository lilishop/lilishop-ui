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
    <div class="point-tabs-wrap">
      <Tabs v-model="activeTab" class="point-tabs">
      <TabPane label="积分列表" name="pointList">
        <Card class="point-content-card">
          <Form
            @keydown.enter.native="handleMemberSearch"
            ref="memberSearchForm"
            :model="memberSearchForm"
            inline
            :label-width="70"
            @submit.native.prevent
            class="search-form"
          >
            <Form-item label="客户名称" prop="nickName">
              <Input
                v-model="memberSearchForm.nickName"
                placeholder="请输入客户名称"
                clearable
                style="width: 180px"
              />
            </Form-item>
            <Form-item label="客户账号" prop="username">
              <Input
                v-model="memberSearchForm.username"
                placeholder="请输入客户账号"
                clearable
                style="width: 180px"
              />
            </Form-item>
            <Form-item label="账号状态" prop="disabled">
              <Select
                v-model="memberSearchForm.disabled"
                clearable
                placeholder="请选择账号状态"
                style="width: 160px"
              >
                <Option value="OPEN">启用</Option>
                <Option value="CLOSE">禁用</Option>
              </Select>
            </Form-item>
            <Form-item label="积分值">
              <InputNumber
                v-model="memberSearchForm.minPoint"
                :min="0"
                :precision="0"
                placeholder="最小积分值"
                style="width: 140px"
              />
              <span class="point-range-separator">-</span>
              <InputNumber
                v-model="memberSearchForm.maxPoint"
                :min="0"
                :precision="0"
                placeholder="最大积分值"
                style="width: 140px"
              />
            </Form-item>
            <Button @click="handleMemberSearch" class="search-btn" type="primary" icon="ios-search">搜索</Button>
          </Form>
        </Card>
        <Card class="point-content-card member-list-card">
          <div slot="title" class="card-title">用户列表</div>
          <Table
            :loading="memberLoading"
            :columns="memberColumns"
            :data="memberData"
            class="member-table"
          >
          </Table>
        </Card>
      </TabPane>
      <TabPane label="积分增减记录" name="pointChangeRecord">
        <Card class="point-content-card">
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
            <Button @click="handleSearch" class="search-btn" type="primary" icon="ios-search">搜索</Button>
          </Form>
        </Card>
        <Card class="point-content-card">
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
      </TabPane>
      </Tabs>
    </div>
  </div>
</template>

<script>

  import * as API_Member from "@/api/member.js";

  export default {
    // 积分历史页面
    name: "point",
    data() {
      return {
        activeTab: "pointList",
        loading: true, // 表单加载状态
        memberLoading: false,
        pointsStatistics: {
          totalPoint: 0,
          unUsedPoint: 0,
        },
        searchForm: { // 请求参数
          pageNumber: 1,
          pageSize: 20,
        },
        memberSearchForm: {
          pageNumber: 1,
          pageSize: 10,
          nickName: "",
          username: "",
          disabled: "",
          minPoint: null,
          maxPoint: null,
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
        memberColumns: [
          {
            title: "客户名称",
            key: "nickName",
            width: 180,
            tooltip: true,
            render: (h, params) => {
              return h("span", params.row.nickName || "-");
            },
          },
          {
            title: "客户账号",
            key: "username",
            width: 180,
            tooltip: true,
            render: (h, params) => {
              return h("span", params.row.username || "-");
            },
          },
          {
            title: "账号状态",
            key: "disabled",
            width: 180,
            render: (h, params) => {
              const enabled = params.row.disabled === true;
              return h(
                "Tag",
                {
                  props: {
                    color: enabled ? "success" : "default",
                  },
                },
                enabled ? "启用" : "禁用"
              );
            },
          },
          {
            title: "积分余额",
            key: "point",
            width: 180,
            render: (h, params) => {
              const point = params.row.point == null ? 0 : params.row.point;
              return h("span", point);
            },
          },
          {
            title: "操作",
            key: "action",
            width: 100,
            align: "center",
            render: (h, params) => {
              return h(
                "a",
                {
                  style: {
                    color: "#2d8cf0",
                    cursor: "pointer",
                    textDecoration: "none",
                  },
                  on: {
                    click: () => {
                      this.detail(params.row);
                    },
                  },
                },
                "详情"
              );
            },
          },
        ],
        data: [], // 表单数据
        memberData: [],
        total: 0, // 表单数据总数
      };
    },
    methods: {
      // 回调给父级
      callback(val) {
        this.$emit("callback", val);
      },
      // 查看会员详情
      detail(row) {
        this.$options.filters.customRouterPush({ name: "member-detail", query: { id: row.id } });
      },
      // 初始化数据
      init() {
        this.getStatistics();
        this.getMemberList();
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
      handleMemberSearch() {
        this.memberSearchForm.pageNumber = 1;
        this.getMemberList();
      },
      getMemberList() {
        this.memberLoading = true;
        const params = {
          pageNumber: this.memberSearchForm.pageNumber,
          pageSize: this.memberSearchForm.pageSize,
          nickName: this.memberSearchForm.nickName || undefined,
          username: this.memberSearchForm.username || undefined,
          disabled: this.memberSearchForm.disabled || undefined,
          minPoint: this.memberSearchForm.minPoint,
          maxPoint: this.memberSearchForm.maxPoint,
        };
        API_Member.getMemberListData(params).then((res) => {
          this.memberLoading = false;
          if (res && res.success && res.result && res.result.records) {
            this.memberData = res.result.records;
          }
        }).catch(() => {
          this.memberLoading = false;
        });
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

  .point-tabs-wrap {
    padding: 12px 16px 16px;
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(23, 35, 61, 0.04);
  }

  .point-tabs {
    ::v-deep .ivu-tabs-bar {
      margin-bottom: 16px;
      border-bottom: 1px solid #f0f0f0;
    }

    ::v-deep .ivu-tabs-nav .ivu-tabs-tab {
      padding: 8px 18px;
      color: #515a6e;
      background: #fff;
      transition: all 0.2s ease;
    }

    ::v-deep .ivu-tabs-nav .ivu-tabs-tab-active {
      color: #2d8cf0;
      font-weight: 500;
    }

    ::v-deep .ivu-tabs-ink-bar {
      height: 2px;
      border-radius: 2px;
    }
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

  .point-content-card {
    margin-bottom: 12px;

    ::v-deep .ivu-card-body {
      padding: 18px 20px;
    }
  }

  .member-list-card {
    ::v-deep .ivu-card-head {
      border-bottom: 1px solid #f5f5f5;
    }
  }

  .card-title {
    font-size: 14px;
    font-weight: 500;
    color: #17233d;
  }

  .member-table {
    ::v-deep .ivu-table-header th {
      background: #fafafa;
    }

    ::v-deep .ivu-tag {
      margin-right: 0;
    }
  }

  .point-range-separator {
    display: inline-block;
    margin: 0 8px;
    color: #808695;
  }

  .face {
    width: 60px;
    height: 60px;
    border-radius: 50%;
  }
</style>
