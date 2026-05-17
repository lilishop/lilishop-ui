<template>
  <div class="search">
    <Card>
      <Form
        ref="searchForm"
        :model="searchForm"
        inline
        :label-width="90"
        @keydown.enter.native="handleSearch"
        @submit.native.prevent
        class="search-form"
      >
        <FormItem label="客户手机号" prop="mobile">
          <Input
            v-model="searchForm.memberMobile"
            clearable
            placeholder="请输入客户手机号"
            style="width: 220px"
          />
        </FormItem>
        <FormItem label="规则" prop="ruleKey">
          <Select v-model="searchForm.ruleKey" clearable filterable style="width: 220px">
            <Option v-for="item in ruleOptions" :key="item.value" :value="item.value">
              {{ item.label }}
            </Option>
          </Select>
        </FormItem>
        <Button type="primary" icon="ios-search" @click="handleSearch">搜索</Button>
      </Form>
    </Card>

    <Card>
      <Table
        :loading="loading"
        border
        :columns="columns"
        :data="data"
        class="mt_10"
      ></Table>
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
import * as API_Member from "@/api/member";

const RULE_OPTIONS = [
  { value: "CONSUME", label: "消费" },
  { value: "REGISTER", label: "注册" },
  { value: "SIGN_IN", label: "签到" },
  { value: "COMMENT", label: "评价" },
  { value: "SHARE", label: "分享商城" },
  { value: "PROFILE", label: "完善信息" },
  { value: "FOLLOW_STORE", label: "关注店铺" },
  { value: "BIND_WECHAT", label: "绑定微信" },
  { value: "ADD_ADDRESS", label: "添加收货地址" },
  { value: "SHARE_REGISTER", label: "分享注册" },
  { value: "SHARE_BUY", label: "分享购买" },
];

export default {
  name: "memberGradeExperienceLog",
  data() {
    return {
      loading: false,
      total: 0,
      data: [],
      ruleOptions: RULE_OPTIONS,
      searchForm: {
        pageNumber: 1,
        pageSize: 20,
        memberMobile: "",
        ruleKey: "",
      },
      columns: [
        {
          title: "客户手机号",
          key: "memberMobile",
          width: 140,
          tooltip: true,
          render: (h, params) => {
            const v = params.row.memberMobile || params.row.mobile || "-";
            return h("span", v);
          },
        },
        {
          title: "规则名称",
          key: "ruleName",
          width: 150,
          tooltip: true,
          render: (h, params) => {
            const text = params.row.ruleName || this.findRuleName(params.row.ruleKey) || "-";
            return h("span", text);
          },
        },
        {
          title: "变化经验值",
          key: "value",
          width: 120,
          render: (h, params) => {
            const v =
              params.row.value ??
              params.row.variableExperience ??
              params.row.experience ??
              params.row.variableValue;
            return h("span", v == null ? "-" : v);
          },
        },
        {
          title: "经验值限额",
          key: "maxValue",
          width: 120,
          render: (h, params) => {
            const v = params.row.maxValue ?? params.row.maxExperience ?? params.row.limitValue;
            return h("span", v == null ? "-" : v);
          },
        },
        {
          title: "操作说明",
          key: "content",
          minWidth: 200,
          tooltip: true,
          render: (h, params) => {
            const text = params.row.content || params.row.remark || params.row.description || "-";
            return h("span", text);
          },
        },
        { title: "创建时间", key: "createTime", width: 170 },
      ],
    };
  },
  mounted() {
    this.init();
  },
  methods: {
    findRuleName(ruleKey) {
      const hit = this.ruleOptions.find((item) => item.value === ruleKey);
      return hit ? hit.label : "";
    },
    init() {
      this.getData();
    },
    buildParams() {
      const params = {
        pageNumber: this.searchForm.pageNumber,
        pageSize: this.searchForm.pageSize,
      };
      if (this.searchForm.memberMobile) params.mobile = this.searchForm.memberMobile;
      if (this.searchForm.ruleKey) params.ruleKey = this.searchForm.ruleKey;
      return params;
    },
    getData() {
      this.loading = true;
      API_Member.getMemberExperienceByPage(this.buildParams())
        .then((res) => {
          if (res && res.success && res.result) {
            this.data = res.result.records || [];
            this.total = res.result.total || 0;
          } else {
            this.data = [];
            this.total = 0;
          }
        })
        .finally(() => {
          this.loading = false;
        });
    },
    handleSearch() {
      this.searchForm.pageNumber = 1;
      this.getData();
    },
    changePage(v) {
      this.searchForm.pageNumber = v;
      this.getData();
    },
    changePageSize(v) {
      this.searchForm.pageNumber = 1;
      this.searchForm.pageSize = v;
      this.getData();
    },
  },
};
</script>
