<template>
  <div class="search gcc-batch-credentials">
    <Card>
      <div class="gcc-records-toolbar">
        <Button type="primary" class="gcc-records-back" @click="closePage">
          返回
        </Button>
      </div>
      <div v-if="giftCardName" class="gcc-records-meta mb_10">
        <strong>礼品卡：</strong>{{ giftCardName }}
      </div>
      <div class="gcc-records-meta mb_10">
        <strong>{{ batchTypeLabel }}：</strong>{{ batchIdDisplay || "—" }}
        <span v-if="batchRemark" style="margin-left: 12px"><strong>本批备注：</strong>{{ batchRemark }}</span>
      </div>
      <Alert v-if="!activityId || !hasBatchId" type="warning">
        缺少活动或批次参数，请从{{ batchSourceLabel }}进入。
      </Alert>
      <template v-else>
        <div class="gcc-status-tabs">
          <span
            v-for="t in statusTabList"
            :key="t.key"
            :class="{ active: lifecycleTab === t.key }"
            @click="onLifecycleTab(t.key)"
            >{{ t.label }}</span
          >
        </div>
        <Form ref="searchForm" :model="searchForm" inline class="search-form mb_10 gcc-filter-form">
          <FormItem label="卡号" prop="cardNo" :label-width="60">
            <Input v-model="searchForm.cardNo" placeholder="请输入卡号" clearable style="width: 160px" />
          </FormItem>
          <FormItem :label-width="0" class="gcc-combo-item">
            <span class="gcc-combo-label">兑换会员</span>
            <Select v-model="searchForm.redeemMemberField" style="width: 130px">
              <Option value="nickName">兑换会员昵称</Option>
              <Option value="mobile">兑换会员手机</Option>
            </Select>
            <Input
              v-model="searchForm.redeemMemberKeyword"
              placeholder="请输入"
              clearable
              style="width: 140px; margin-left: 4px"
            />
          </FormItem>
          <FormItem label="兑换时间" prop="redeemDateRange" :label-width="72">
            <DatePicker
              v-model="redeemDateRange"
              type="daterange"
              clearable
              format="yyyy-MM-dd"
              placeholder="开始日期"
              style="width: 240px"
            />
          </FormItem>
          <FormItem :label-width="0" class="gcc-combo-item">
            <span class="gcc-combo-label">激活会员</span>
            <Select v-model="searchForm.activateMemberField" style="width: 130px">
              <Option value="nickName">激活会员昵称</Option>
              <Option value="mobile">激活会员手机</Option>
            </Select>
            <Input
              v-model="searchForm.activateMemberKeyword"
              placeholder="请输入"
              clearable
              style="width: 140px; margin-left: 4px"
            />
          </FormItem>
          <FormItem label="激活时间" prop="activateDateRange" :label-width="72">
            <DatePicker
              v-model="activateDateRange"
              type="daterange"
              clearable
              format="yyyy-MM-dd"
              placeholder="开始日期"
              style="width: 240px"
            />
          </FormItem>
          <Button type="primary" icon="ios-search" class="search-btn" @click="handleSearch">搜索</Button>
        </Form>
        <Table :loading="loading" :columns="tableColumns" :data="data" />
        <Row type="flex" justify="end" class="mt_10">
          <Page
            :current="searchForm.pageNumber"
            :total="total"
            :page-size="searchForm.pageSize"
            :page-size-opts="[20, 50, 100]"
            size="small"
            show-total
            show-elevator
            show-sizer
            @on-change="changePage"
            @on-page-size-change="changePageSize"
          />
        </Row>
      </template>
    </Card>
  </div>
</template>

<script>
import { getGiftCardCashCredentialPage } from "@/api/promotion";

const STATUS_LABEL = {
  UNISSUED: "未兑换",
  UNREDEEMED: "未兑换",
  UNACTIVATED: "未激活",
  BOUND: "已激活",
  ACTIVATED: "已激活",
  VOIDED: "已销卡",
  EXPIRED: "已过期",
};

const ISSUE_STATUS_LABEL = {
  ISSUED: "已发卡",
  UNISSUED: "未发卡",
  PENDING: "待处理",
  PENDING_ACTIVATION: "待激活",
  ACTIVATED: "已激活",
  FAILED: "发卡失败",
  SUCCESS: "发卡成功",
};

export default {
  name: "GiftCardCashBatchCredentials",
  data() {
    return {
      activityId: "",
      createBatchId: "",
      issueBatchId: "",
      giftCardName: "",
      batchRemark: "",
      lifecycleTab: "all",
      statusTabList: [
        { key: "all", label: "全部", status: "" },
        { key: "unredeemed", label: "未兑换", status: "UNISSUED" },
        { key: "unactivated", label: "未激活", status: "UNACTIVATED" },
        { key: "activated", label: "已激活", status: "BOUND" },
        { key: "cancelled", label: "已销卡", status: "VOIDED" },
        { key: "expired", label: "已过期", status: "EXPIRED" },
      ],
      redeemDateRange: [],
      activateDateRange: [],
      loading: false,
      total: 0,
      data: [],
      searchForm: {
        pageNumber: 1,
        pageSize: 20,
        sort: "createTime",
        order: "desc",
        cardNo: "",
        redeemMemberField: "nickName",
        redeemMemberKeyword: "",
        activateMemberField: "nickName",
        activateMemberKeyword: "",
      },
    };
  },
  computed: {
    isIssueBatchMode() {
      return !!this.issueBatchId;
    },
    hasBatchId() {
      return !!(this.createBatchId || this.issueBatchId);
    },
    batchTypeLabel() {
      return this.isIssueBatchMode ? "发卡批次" : "制卡批次";
    },
    batchSourceLabel() {
      return this.isIssueBatchMode ? "发卡记录" : "制卡记录";
    },
    batchIdDisplay() {
      return this.isIssueBatchMode ? this.issueBatchId : this.createBatchId;
    },
    createBatchColumns() {
      return [
        { title: "卡号", key: "cardNo", minWidth: 140, tooltip: true },
        { title: "卡密", key: "cardSecret", minWidth: 120, tooltip: true },
        { title: "面额", key: "faceValue", width: 90, align: "right" },
        { title: "余额", key: "balance", width: 90, align: "right" },
        {
          title: "状态",
          key: "status",
          width: 90,
          align: "center",
          render: (h, params) => {
            const s = params.row.status;
            return h("span", STATUS_LABEL[s] || s || "—");
          },
        },
        { title: "会员手机", key: "memberMobile", width: 120, tooltip: true },
        { title: "会员昵称", key: "memberNickName", minWidth: 100, tooltip: true },
        { title: "绑定时间", key: "bindTime", width: 165 },
        { title: "到期时间", key: "expireTime", width: 165 },
        { title: "创建时间", key: "createTime", width: 165 },
      ];
    },
    issueBatchColumns() {
      return [
        { title: "卡号", key: "cardNo", minWidth: 140, tooltip: true },
        {
          title: "发卡批次ID",
          key: "issueBatchId",
          minWidth: 160,
          tooltip: true,
          render: (h, params) => {
            const id = params.row.issueBatchId ?? this.issueBatchId;
            return h("span", id != null && id !== "" ? String(id) : "—");
          },
        },
        {
          title: "发卡会员",
          key: "issueMember",
          minWidth: 150,
          render: (h, params) => h("span", this.formatIssueMember(params.row)),
        },
        {
          title: "发卡状态",
          key: "issueStatus",
          width: 110,
          align: "center",
          render: (h, params) => {
            const s = params.row.issueStatus;
            return h("span", ISSUE_STATUS_LABEL[s] || s || "—");
          },
        },
        {
          title: "激活会员",
          key: "activationMember",
          minWidth: 150,
          render: (h, params) => h("span", this.formatActivationMember(params.row)),
        },
        {
          title: "激活时间",
          key: "activationTime",
          width: 165,
          render: (h, params) => {
            const t =
              params.row.activationTime ||
              params.row.activateTime ||
              params.row.bindTime;
            return h("span", t != null && t !== "" ? String(t) : "—");
          },
        },
        {
          title: "状态",
          key: "status",
          width: 90,
          align: "center",
          render: (h, params) => {
            const s = params.row.status;
            return h("span", STATUS_LABEL[s] || s || "—");
          },
        },
      ];
    },
    tableColumns() {
      return this.isIssueBatchMode ? this.issueBatchColumns : this.createBatchColumns;
    },
  },
  mounted() {
    this.initFromRoute();
    if (this.activityId && this.hasBatchId) {
      this.loadList();
    }
  },
  watch: {
    "$route.query.createBatchId"() {
      this.onRouteQueryChange();
    },
    "$route.query.issueBatchId"() {
      this.onRouteQueryChange();
    },
    "$route.query.activityId"() {
      this.onRouteQueryChange();
    },
  },
  methods: {
    onRouteQueryChange() {
      this.initFromRoute();
      if (this.activityId && this.hasBatchId) {
        this.searchForm.pageNumber = 1;
        this.loadList();
      }
    },
    initFromRoute() {
      const q = this.$route.query || {};
      this.activityId = (q.activityId && String(q.activityId)) || "";
      this.createBatchId = (q.createBatchId && String(q.createBatchId)) || "";
      this.issueBatchId = (q.issueBatchId && String(q.issueBatchId)) || "";
      this.giftCardName = (q.giftCardName && String(q.giftCardName)) || "";
      this.batchRemark = (q.batchRemark && String(q.batchRemark)) || "";
    },
    closePage() {
      this.$store.commit("removeTag", "gift-card-cash-batch-credentials");
      localStorage.pageOpenedList = JSON.stringify(this.$store.state.app.pageOpenedList);
      this.$router.go(-1);
    },
    formatMemberText(name, mobile) {
      const n = name != null && name !== "" ? String(name) : "";
      const m = mobile != null && mobile !== "" ? String(mobile) : "";
      if (n && m) {
        return `${n} / ${m}`;
      }
      return n || m || "—";
    },
    formatIssueMember(row) {
      return this.formatMemberText(
        row.issueMemberNickName ||
          row.issueMemberName ||
          row.exchangeMemberNickName ||
          row.exchangeMemberName ||
          row.memberNickName,
        row.issueMemberMobile || row.exchangeMemberMobile || row.memberMobile
      );
    },
    formatActivationMember(row) {
      return this.formatMemberText(
        row.activationMemberNickName ||
          row.activationMemberName ||
          row.activateMemberNickName ||
          row.activateMemberName,
        row.activationMemberMobile || row.activateMemberMobile
      );
    },
    onLifecycleTab(key) {
      if (this.lifecycleTab === key) {
        return;
      }
      this.lifecycleTab = key;
      this.searchForm.pageNumber = 1;
      this.loadList();
    },
    handleSearch() {
      this.searchForm.pageNumber = 1;
      this.loadList();
    },
    changePage(v) {
      this.searchForm.pageNumber = v;
      this.loadList();
    },
    changePageSize(v) {
      this.searchForm.pageNumber = 1;
      this.searchForm.pageSize = v;
      this.loadList();
    },
    formatDayStart(d) {
      if (!d) {
        return "";
      }
      const x = d instanceof Date ? d : new Date(d);
      if (Number.isNaN(x.getTime())) {
        return "";
      }
      const y = x.getFullYear();
      const m = String(x.getMonth() + 1).padStart(2, "0");
      const day = String(x.getDate()).padStart(2, "0");
      return `${y}-${m}-${day} 00:00:00`;
    },
    formatDayEnd(d) {
      if (!d) {
        return "";
      }
      const x = d instanceof Date ? d : new Date(d);
      if (Number.isNaN(x.getTime())) {
        return "";
      }
      const y = x.getFullYear();
      const m = String(x.getMonth() + 1).padStart(2, "0");
      const day = String(x.getDate()).padStart(2, "0");
      return `${y}-${m}-${day} 23:59:59`;
    },
    appendMemberSearch(params, kind, field, keyword) {
      const kw = (keyword || "").trim();
      if (!kw) {
        return;
      }
      if (kind === "exchange") {
        if (field === "mobile") {
          params.exchangeMemberMobile = kw;
        } else {
          params.exchangeMemberNickName = kw;
        }
      } else {
        if (field === "mobile") {
          params.activationMemberMobile = kw;
        } else {
          params.activationMemberNickName = kw;
        }
      }
    },
    appendDateRange(params, kind, range) {
      if (!range || !range[0] || !range[1]) {
        return;
      }
      const start = this.formatDayStart(range[0]);
      const end = this.formatDayEnd(range[1]);
      if (kind === "exchange") {
        if (start) {
          params.exchangeTimeStart = start;
        }
        if (end) {
          params.exchangeTimeEnd = end;
        }
      } else {
        if (start) {
          params.activationTimeStart = start;
        }
        if (end) {
          params.activationTimeEnd = end;
        }
      }
    },
    loadList() {
      if (!this.activityId || !this.hasBatchId) {
        return;
      }
      this.loading = true;
      const params = {
        activityId: this.activityId,
        pageNumber: this.searchForm.pageNumber,
        pageSize: this.searchForm.pageSize,
        sort: this.searchForm.sort,
        order: this.searchForm.order,
      };
      if (this.isIssueBatchMode) {
        params.issueBatchId = this.issueBatchId;
      } else {
        params.createBatchId = this.createBatchId;
      }
      const tabCfg = this.statusTabList.find((t) => t.key === this.lifecycleTab);
      if (tabCfg && tabCfg.status) {
        params.status = tabCfg.status;
      }
      const cardNo = (this.searchForm.cardNo || "").trim();
      if (cardNo) {
        params.cardNo = cardNo;
      }
      this.appendMemberSearch(
        params,
        "exchange",
        this.searchForm.redeemMemberField,
        this.searchForm.redeemMemberKeyword
      );
      this.appendMemberSearch(
        params,
        "activation",
        this.searchForm.activateMemberField,
        this.searchForm.activateMemberKeyword
      );
      this.appendDateRange(params, "exchange", this.redeemDateRange);
      this.appendDateRange(params, "activation", this.activateDateRange);
      getGiftCardCashCredentialPage(params)
        .then((res) => {
          this.loading = false;
          if (res.success && res.result) {
            this.data = res.result.records || [];
            this.total = res.result.total || 0;
          }
        })
        .catch(() => {
          this.loading = false;
        });
    },
  },
};
</script>

<style scoped>
.gcc-batch-credentials .gcc-records-toolbar {
  margin-bottom: 22px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e8eaec;
}
.gcc-batch-credentials .gcc-records-back {
  font-weight: 500;
}
.gcc-batch-credentials .gcc-records-meta {
  line-height: 1.6;
  color: #515a6e;
}
.gcc-batch-credentials .gcc-status-tabs {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  border-bottom: 1px solid #e8eaec;
  margin-bottom: 16px;
  gap: 4px 8px;
}
.gcc-batch-credentials .gcc-status-tabs span {
  padding: 10px 14px 12px;
  cursor: pointer;
  color: #808695;
  font-size: 14px;
  position: relative;
  user-select: none;
}
.gcc-batch-credentials .gcc-status-tabs span:hover {
  color: #515a6e;
}
.gcc-batch-credentials .gcc-status-tabs span.active {
  color: #ff6600;
  font-weight: 500;
}
.gcc-batch-credentials .gcc-status-tabs span.active::after {
  content: "";
  position: absolute;
  left: 10px;
  right: 10px;
  bottom: 0;
  height: 3px;
  background: #ff6600;
  border-radius: 2px 2px 0 0;
}
.gcc-batch-credentials .gcc-filter-form {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
}
.gcc-batch-credentials .gcc-combo-item {
  margin-right: 12px;
}
.gcc-batch-credentials .gcc-combo-label {
  display: inline-block;
  margin-right: 6px;
  color: #515a6e;
  font-size: 14px;
  vertical-align: middle;
}
</style>
