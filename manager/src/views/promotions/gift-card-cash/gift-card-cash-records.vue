<template>
  <div class="search">
    <Card>
      <div class="gcc-records-toolbar">
        <Button type="primary" class="gcc-records-back" @click="closePage">
          返回
        </Button>
      </div>
      <div v-if="giftCardName" class="gcc-records-meta mb_10">
        <strong>礼品卡：</strong>{{ giftCardName }}
      </div>
      <div v-else-if="activityId" class="gcc-records-meta mb_10">
        <strong>活动ID：</strong>{{ activityId }}
      </div>
      <Alert v-if="!activityId" type="warning">缺少活动参数，请从礼品卡列表进入。</Alert>
      <Tabs v-else v-model="activeTab" @on-click="onTabClick">
        <TabPane label="制卡记录" name="createBatch">
          <Card :bordered="false" dis-hover>
            <Form
              ref="createFilterForm"
              :model="createSearchForm"
              inline
              label-position="left"
              class="search-form mb_10 gcc-create-batch-search"
              :label-width="100"
            >
              <FormItem label="卡号" prop="cardNo">
                <Input
                  v-model="createSearchForm.cardNo"
                  clearable
                  style="width: 150px"
                />
              </FormItem>
              <FormItem label="制卡批次ID" prop="createBatchId">
                <Input
                  v-model="createSearchForm.createBatchId"
                  clearable
                  style="width: 170px"
                />
              </FormItem>
              <FormItem label="卡名称" prop="giftCardName">
                <Input
                  v-model="createSearchForm.giftCardName"
                  clearable
                  style="width: 160px"
                />
              </FormItem>
              <FormItem label="制卡人名称" prop="createUserName">
                <Input
                  v-model="createSearchForm.createUserName"
                  clearable
                  style="width: 140px"
                />
              </FormItem>
              <FormItem label="制卡时间" prop="createTimeRange">
                <DatePicker
                  v-model="createSearchForm.createTimeRange"
                  type="daterange"
                  clearable
                  format="yyyy-MM-dd"
                  style="width: 220px"
                />
              </FormItem>
              <FormItem label="过期时间" prop="expireTimeRange">
                <DatePicker
                  v-model="createSearchForm.expireTimeRange"
                  type="daterange"
                  clearable
                  format="yyyy-MM-dd"
                  style="width: 220px"
                />
              </FormItem>
              <FormItem :label-width="0">
                <Button type="primary" icon="ios-search" class="search-btn" @click="handleCreateSearch">
                  搜索
                </Button>
              </FormItem>
            </Form>
            <Table :loading="createLoading" :columns="createColumns" :data="createData" />
            <Row type="flex" justify="end" class="mt_10">
              <Page
                :current="createSearchForm.pageNumber"
                :total="createTotal"
                :page-size="createSearchForm.pageSize"
                :page-size-opts="[20, 50, 100]"
                size="small"
                show-total
                show-elevator
                show-sizer
                @on-change="createChangePage"
                @on-page-size-change="createChangePageSize"
              />
            </Row>
          </Card>
        </TabPane>
        <TabPane label="发卡记录" name="issue">
          <Card :bordered="false" dis-hover>
            <Form
              ref="issueFilterForm"
              :model="issueSearchForm"
              inline
              label-position="left"
              class="search-form mb_10 gcc-create-batch-search"
              :label-width="100"
            >
              <FormItem label="卡号" prop="cardNo">
                <Input
                  v-model="issueSearchForm.cardNo"
                  clearable
                  style="width: 150px"
                />
              </FormItem>
              <FormItem label="发卡批次ID" prop="issueBatchId">
                <Input
                  v-model="issueSearchForm.issueBatchId"
                  clearable
                  style="width: 170px"
                />
              </FormItem>
              <FormItem label="现金卡名称" prop="giftCardName">
                <Input
                  v-model="issueSearchForm.giftCardName"
                  clearable
                  style="width: 160px"
                />
              </FormItem>
              <FormItem label="发卡人名称" prop="issueUserName">
                <Input
                  v-model="issueSearchForm.issueUserName"
                  clearable
                  style="width: 140px"
                />
              </FormItem>
              <FormItem label="发卡时间" prop="createTimeRange">
                <DatePicker
                  v-model="issueSearchForm.createTimeRange"
                  type="daterange"
                  clearable
                  format="yyyy-MM-dd"
                  style="width: 220px"
                />
              </FormItem>
              <FormItem label="过期时间" prop="expireTimeRange">
                <DatePicker
                  v-model="issueSearchForm.expireTimeRange"
                  type="daterange"
                  clearable
                  format="yyyy-MM-dd"
                  style="width: 220px"
                />
              </FormItem>
              <FormItem :label-width="0">
                <Button type="primary" icon="ios-search" class="search-btn" @click="handleIssueSearch">
                  搜索
                </Button>
              </FormItem>
            </Form>
            <Table :loading="issueLoading" :columns="issueColumns" :data="issueData" />
            <Row type="flex" justify="end" class="mt_10">
              <Page
                :current="issueSearchForm.pageNumber"
                :total="issueTotal"
                :page-size="issueSearchForm.pageSize"
                :page-size-opts="[20, 50, 100]"
                size="small"
                show-total
                show-elevator
                show-sizer
                @on-change="issueChangePage"
                @on-page-size-change="issueChangePageSize"
              />
            </Row>
          </Card>
        </TabPane>
        <TabPane label="使用记录" name="usage">
          <Card :bordered="false" dis-hover>
            <Form
              ref="usageFilterForm"
              :model="usageSearchForm"
              inline
              label-position="left"
              class="search-form mb_10 gcc-create-batch-search"
              :label-width="90"
            >
              <FormItem label="订单号" prop="orderSn">
                <Input
                  v-model="usageSearchForm.orderSn"
                  clearable
                  style="width: 160px"
                />
              </FormItem>
              <FormItem label="客户名称" prop="memberName">
                <Input
                  v-model="usageSearchForm.memberName"
                  clearable
                  style="width: 150px"
                />
              </FormItem>
              <FormItem label="卡号" prop="cardNo">
                <Input
                  v-model="usageSearchForm.cardNo"
                  clearable
                  style="width: 150px"
                />
              </FormItem>
              <FormItem label="交易时间" prop="transactionTimeRange">
                <DatePicker
                  v-model="usageSearchForm.transactionTimeRange"
                  type="daterange"
                  clearable
                  format="yyyy-MM-dd"
                  style="width: 220px"
                />
              </FormItem>
              <FormItem label="交易类型" prop="transactionType">
                <Select
                  v-model="usageSearchForm.transactionType"
                  clearable
                  style="width: 150px"
                >
                  <Option value="ORDER_DEDUCT">订单抵扣</Option>
                  <Option value="ORDER_REFUND">订单退款</Option>
                  <Option value="ORDER_CANCEL">订单取消</Option>
                </Select>
              </FormItem>
              <FormItem :label-width="0">
                <Button type="primary" icon="ios-search" class="search-btn" @click="handleUsageSearch">
                  搜索
                </Button>
              </FormItem>
            </Form>
            <Table :loading="usageLoading" :columns="usageColumns" :data="usageData" />
            <Row type="flex" justify="end" class="mt_10">
              <Page
                :current="usageSearchForm.pageNumber"
                :total="usageTotal"
                :page-size="usageSearchForm.pageSize"
                :page-size-opts="[20, 50, 100]"
                size="small"
                show-total
                show-elevator
                show-sizer
                @on-change="usageChangePage"
                @on-page-size-change="usageChangePageSize"
              />
            </Row>
          </Card>
        </TabPane>
      </Tabs>
    </Card>
  </div>
</template>

<script>
import {
  getGiftCardCashCreateBatchPage,
  getGiftCardCashIssueBatchPage,
  getGiftCardCashUsageRecordPage,
} from "@/api/promotion";

export default {
  name: "GiftCardCashRecords",
  data() {
    return {
      activeTab: "createBatch",
      activityId: "",
      giftCardName: "",
      createLoading: false,
      createTotal: 0,
      createData: [],
      createSearchForm: {
        pageNumber: 1,
        pageSize: 20,
        sort: "createTime",
        order: "desc",
        cardNo: "",
        createBatchId: "",
        giftCardName: "",
        createUserName: "",
        createTimeRange: [],
        expireTimeRange: [],
      },
      issueLoading: false,
      issueTotal: 0,
      issueData: [],
      issueSearchForm: {
        pageNumber: 1,
        pageSize: 20,
        sort: "createTime",
        order: "desc",
        cardNo: "",
        issueBatchId: "",
        giftCardName: "",
        issueUserName: "",
        createTimeRange: [],
        expireTimeRange: [],
      },
      usageLoading: false,
      usageTotal: 0,
      usageData: [],
      usageSearchForm: {
        pageNumber: 1,
        pageSize: 20,
        sort: "createTime",
        order: "desc",
        orderSn: "",
        memberName: "",
        cardNo: "",
        transactionType: "",
        transactionTimeRange: [],
      },
    };
  },
  computed: {
    createColumns() {
      return [
        {
          title: "制卡批次ID",
          key: "createBatchId",
          minWidth: 100,
          tooltip: true,
          align: "left",
          render: (h, p) => {
            const id = p.row.createBatchId ?? p.row.id;
            return h("span", id != null && id !== "" ? String(id) : "-");
          },
        },
        {
          title: "卡号范围",
          key: "cardNoRange",
          minWidth: 160,
          tooltip: true,
          align: "left",
          render: (h, p) => {
            const t = p.row.cardNoRange;
            return h("span", t != null && t !== "" ? String(t) : "-");
          },
        },
        {
          title: "面值",
          key: "faceValue",
          width: 150,
          align: "left",
          render: (h, p) => {
            const v = p.row.faceValue;
            if (v === null || v === undefined || v === "") {
              return h("span", "-");
            }
            return h("priceColorScheme", {
              props: { value: v, color: this.$mainColor },
            });
          },
        },
        {
          title: "礼品卡名称",
          key: "giftCardName",
          width: 150,
          tooltip: true,
          align: "left",
          render: (h, p) => {
            const t = p.row.giftCardName ?? this.giftCardName;
            return h("span", t != null && t !== "" ? String(t) : "-");
          },
        },
        { title: "制卡人", key: "createUserName", width: 150, tooltip: true ,align: "left"},
        { title: "制卡时间", key: "createTime", width: 200,align: "left" },
        {
          title: "制卡数量",
          key: "quantity",
          width: 200,
          align: "left",
          render: (h, p) => {
            const v = p.row.quantity;
            if (v === null || v === undefined || v === "") {
              return h("span", "-");
            }
            return h("span", String(v));
          },
        },
        {
          title: "过期时间",
          key: "expireTime",
          width: 200,
          align: "left",
          render: (h, p) => {
            const t = p.row.expireTime;
            return h("span", t != null && t !== "" ? String(t) : "长期有效");
          },
        },
        {
          title: "操作",
          key: "action",
          width: 150,
          align: "center",
          fixed: "right",
          render: (h, params) => {
            return h(
              "Button",
              {
                props: { type: "primary", size: "small" },
                on: { click: () => this.goBatchCredentials(params.row) },
              },
              "查看"
            );
          },
        },
      ];
    },
    issueColumns() {
      return [
        {
          title: "发卡批次ID",
          key: "issueBatchId",
          minWidth: 160,
          tooltip: true,
          render: (h, p) => {
            const id = p.row.issueBatchId ?? p.row.id;
            return h("span", id != null && id !== "" ? String(id) : "-");
          },
        },
        {
          title: "卡号范围",
          key: "cardNoRange",
          minWidth: 160,
          tooltip: true,
          render: (h, p) => {
            const t = p.row.cardNoRange;
            return h("span", t != null && t !== "" ? String(t) : "-");
          },
        },
        {
          title: "面值",
          key: "faceValue",
          width: 120,
          align: "right",
          render: (h, p) => {
            const v = p.row.faceValue;
            if (v === null || v === undefined || v === "") {
              return h("span", "-");
            }
            return h("priceColorScheme", {
              props: { value: v, color: this.$mainColor },
            });
          },
        },
        {
          title: "卡名称",
          key: "giftCardName",
          minWidth: 120,
          tooltip: true,
          render: (h, p) => {
            const t = p.row.giftCardName ?? this.giftCardName;
            return h("span", t != null && t !== "" ? String(t) : "-");
          },
        },
        {
          title: "发卡人",
          key: "issueUserName",
          minWidth: 100,
          tooltip: true,
          render: (h, p) => {
            const t = p.row.issueUserName;
            return h("span", t != null && t !== "" ? String(t) : "-");
          },
        },
        { title: "发卡时间", key: "createTime", width: 170 },
        {
          title: "发卡数量",
          key: "totalCards",
          width: 100,
          align: "center",
          render: (h, p) => {
            const v = p.row.totalCards;
            if (v === null || v === undefined || v === "") {
              return h("span", "-");
            }
            return h("span", String(v));
          },
        },
        {
          title: "过期时间",
          key: "expireTime",
          width: 170,
          render: (h, p) => {
            const t = p.row.expireTime;
            return h("span", t != null && t !== "" ? String(t) : "长期有效");
          },
        },
        {
          title: "操作",
          key: "action",
          width: 150,
          align: "center",
          fixed: "right",
          render: (h, params) => {
            return h(
              "Button",
              {
                props: { type: "primary", size: "small" },
                on: { click: () => this.goIssueBatchCredentials(params.row) },
              },
              "查看"
            );
          },
        },
      ];
    },
    usageColumns() {
      return [
        { title: "订单号", key: "orderSn", minWidth: 160, tooltip: true },
        {
          title: "交易类型",
          key: "transactionType",
          minWidth: 120,
          render: (h, p) => h("span", this.formatUsageBizType(p.row.transactionType || p.row.bizType)),
        },
        { title: "卡号", key: "cardNo", minWidth: 150, tooltip: true },
        {
          title: "现金卡信息",
          key: "giftCardName",
          minWidth: 180,
          render: (h, p) => {
            const name = p.row.giftCardName || this.giftCardName || "-";
            const faceValue = p.row.faceValue;
            return h("div", [
              h("div", String(name)),
              h(
                "div",
                { style: { color: "#808695", marginTop: "4px" } },
                `面额：${faceValue != null && faceValue !== "" ? faceValue : "-"}`
              ),
            ]);
          },
        },
        {
          title: "金额",
          key: "changeAmount",
          width: 130,
          align: "right",
          render: (h, p) => {
            const display = this.getUsageAmountDisplay(p.row);
            if (!display) {
              return h("span", "-");
            }
            return h("priceColorScheme", {
              props: { value: display.amount, color: display.color },
            });
          },
        },
        {
          title: "余额",
          key: "balanceAfter",
          width: 130,
          align: "right",
          render: (h, p) => {
            const v = p.row.balanceAfter;
            if (v === null || v === undefined || v === "") {
              return h("span", "-");
            }
            return h("priceColorScheme", {
              props: { value: v, color: this.$mainColor },
            });
          },
        },
        {
          title: "交易时间",
          key: "transactionTime",
          width: 170,
          render: (h, p) => {
            const t = p.row.transactionTime || p.row.createTime;
            return h("span", t != null && t !== "" ? String(t) : "-");
          },
        },
        {
          title: "客户信息",
          key: "memberName",
          minWidth: 150,
          render: (h, p) => {
            const name = p.row.memberName || "-";
            const mobile = p.row.memberMobile || "-";
            return h("div", [
              h("div", String(name)),
              h("div", { style: { color: "#808695", marginTop: "4px" } }, String(mobile)),
            ]);
          },
        },
        {
          title: "操作",
          key: "action",
          width: 100,
          align: "center",
          fixed: "right",
          render: (h, p) => {
            const orderSn = p.row.orderSn;
            if (!orderSn) {
              return h("span", { style: { color: "#c5c8ce" } }, "详情");
            }
            return h(
              "Button",
              {
                props: { type: "primary", size: "small" },
                on: { click: () => this.goOrderDetail(orderSn) },
              },
              "详情"
            );
          },
        },
      ];
    },
  },
  mounted() {
    this.initFromRoute();
    if (this.activityId) {
      this.loadCreateBatchList();
    }
  },
  watch: {
    "$route.query.activityId"(id) {
      this.initFromRoute();
      if (id && this.activeTab === "createBatch") {
        this.loadCreateBatchList();
      }
      if (id && this.activeTab === "issue") {
        this.issueSearchForm.pageNumber = 1;
        this.loadIssueBatchList();
      }
      if (id && this.activeTab === "usage") {
        this.usageSearchForm.pageNumber = 1;
        this.loadUsageRecordList();
      }
    },
  },
  methods: {
    initFromRoute() {
      this.activityId = (this.$route.query.activityId && String(this.$route.query.activityId)) || "";
      this.giftCardName = (this.$route.query.giftCardName && String(this.$route.query.giftCardName)) || "";
    },
    closePage() {
      this.$store.commit("removeTag", "gift-card-cash-records");
      localStorage.pageOpenedList = JSON.stringify(this.$store.state.app.pageOpenedList);
      this.$router.go(-1);
    },
    goBatchCredentials(row) {
      const batchId = row.createBatchId != null && row.createBatchId !== "" ? row.createBatchId : row.id;
      this.$router.push({
        name: "gift-card-cash-batch-credentials",
        query: {
          activityId: this.activityId,
          createBatchId: batchId,
          giftCardName: row.giftCardName || this.giftCardName || "",
          batchRemark: row.batchRemark || "",
        },
      });
    },
    goIssueBatchCredentials(row) {
      const batchId = row.issueBatchId != null && row.issueBatchId !== "" ? row.issueBatchId : row.id;
      this.$router.push({
        name: "gift-card-cash-batch-credentials",
        query: {
          activityId: this.activityId,
          issueBatchId: batchId,
          giftCardName: row.giftCardName || this.giftCardName || "",
        },
      });
    },
    goOrderDetail(orderSn) {
      this.$router.push({
        name: "order-detail",
        query: { sn: orderSn },
      });
    },
    onTabClick(name) {
      if (name === "createBatch" && this.activityId) {
        this.loadCreateBatchList();
      }
      if (name === "issue" && this.activityId) {
        this.loadIssueBatchList();
      }
      if (name === "usage" && this.activityId) {
        this.loadUsageRecordList();
      }
    },
    handleCreateSearch() {
      this.createSearchForm.pageNumber = 1;
      this.loadCreateBatchList();
    },
    /** 日期区间 → yyyy-MM-dd HH:mm:ss，供 Spring 绑定 Date */
    toApiDateTimeBoundary(val, endOfDay) {
      const dt = val instanceof Date ? val : new Date(val);
      if (Number.isNaN(dt.getTime())) {
        return null;
      }
      const y = dt.getFullYear();
      const m = String(dt.getMonth() + 1).padStart(2, "0");
      const d = String(dt.getDate()).padStart(2, "0");
      return endOfDay ? `${y}-${m}-${d} 23:59:59` : `${y}-${m}-${d} 00:00:00`;
    },
    appendDateRangeToParams(params, range, startKey, endKey) {
      if (!Array.isArray(range) || range.length < 2 || !range[0] || !range[1]) {
        return;
      }
      const start = this.toApiDateTimeBoundary(range[0], false);
      const end = this.toApiDateTimeBoundary(range[1], true);
      if (start) {
        params[startKey] = start;
      }
      if (end) {
        params[endKey] = end;
      }
    },
    appendTrimmedParam(params, key, value) {
      const text = (value || "").trim();
      if (text) {
        params[key] = text;
      }
    },
    createChangePage(v) {
      this.createSearchForm.pageNumber = v;
      this.loadCreateBatchList();
    },
    createChangePageSize(v) {
      this.createSearchForm.pageNumber = 1;
      this.createSearchForm.pageSize = v;
      this.loadCreateBatchList();
    },
    loadCreateBatchList() {
      if (!this.activityId) {
        return;
      }
      this.createLoading = true;
      const params = {
        activityId: this.activityId,
        pageNumber: this.createSearchForm.pageNumber,
        pageSize: this.createSearchForm.pageSize,
        sort: this.createSearchForm.sort,
        order: this.createSearchForm.order,
      };
      const cardNo = (this.createSearchForm.cardNo || "").trim();
      if (cardNo) {
        params.cardNo = cardNo;
      }
      const createBatchId = (this.createSearchForm.createBatchId || "").trim();
      if (createBatchId) {
        params.createBatchId = createBatchId;
      }
      const giftCardName = (this.createSearchForm.giftCardName || "").trim();
      if (giftCardName) {
        params.giftCardName = giftCardName;
      }
      const createUserName = (this.createSearchForm.createUserName || "").trim();
      if (createUserName) {
        params.createUserName = createUserName;
      }
      this.appendDateRangeToParams(
        params,
        this.createSearchForm.createTimeRange,
        "createTimeStart",
        "createTimeEnd"
      );
      this.appendDateRangeToParams(
        params,
        this.createSearchForm.expireTimeRange,
        "expireTimeStart",
        "expireTimeEnd"
      );
      getGiftCardCashCreateBatchPage(params)
        .then((res) => {
          this.createLoading = false;
          if (res.success && res.result) {
            this.createData = res.result.records || [];
            this.createTotal = res.result.total || 0;
          }
        })
        .catch(() => {
          this.createLoading = false;
        });
    },
    issueChangePage(v) {
      this.issueSearchForm.pageNumber = v;
      this.loadIssueBatchList();
    },
    issueChangePageSize(v) {
      this.issueSearchForm.pageNumber = 1;
      this.issueSearchForm.pageSize = v;
      this.loadIssueBatchList();
    },
    handleIssueSearch() {
      this.issueSearchForm.pageNumber = 1;
      this.loadIssueBatchList();
    },
    loadIssueBatchList() {
      if (!this.activityId) {
        return;
      }
      this.issueLoading = true;
      const params = {
        activityId: this.activityId,
        pageNumber: this.issueSearchForm.pageNumber,
        pageSize: this.issueSearchForm.pageSize,
        sort: this.issueSearchForm.sort,
        order: this.issueSearchForm.order,
      };
      [
        "cardNo",
        "issueBatchId",
        "giftCardName",
        "issueUserName",
      ].forEach((key) => {
        this.appendTrimmedParam(params, key, this.issueSearchForm[key]);
      });
      this.appendDateRangeToParams(
        params,
        this.issueSearchForm.createTimeRange,
        "createTimeStart",
        "createTimeEnd"
      );
      this.appendDateRangeToParams(
        params,
        this.issueSearchForm.expireTimeRange,
        "expireTimeStart",
        "expireTimeEnd"
      );
      getGiftCardCashIssueBatchPage(params)
        .then((res) => {
          this.issueLoading = false;
          if (res.success && res.result) {
            const r = res.result;
            this.issueData = r.records || r.list || r.recordsList || [];
            this.issueTotal = r.total != null ? r.total : r.totalCount || 0;
          }
        })
        .catch(() => {
          this.issueLoading = false;
        });
    },
    handleUsageSearch() {
      this.usageSearchForm.pageNumber = 1;
      this.loadUsageRecordList();
    },
    usageChangePage(v) {
      this.usageSearchForm.pageNumber = v;
      this.loadUsageRecordList();
    },
    usageChangePageSize(v) {
      this.usageSearchForm.pageNumber = 1;
      this.usageSearchForm.pageSize = v;
      this.loadUsageRecordList();
    },
    formatUsageFlowType(type) {
      const map = {
        INCREASE: "增加",
        DECREASE: "减少",
      };
      return map[type] || type || "-";
    },
    formatUsageBizType(type) {
      const map = {
        ORDER_DEDUCT: "订单抵扣",
        ORDER_REFUND: "订单退款",
        ORDER_CANCEL: "订单取消",
        CARD_ACTIVATE: "卡激活",
      };
      return map[type] || type || "-";
    },
    getUsageAmountDisplay(row) {
      const raw =
        row.changeAmount != null && row.changeAmount !== "" ? row.changeAmount : row.deductAmount;
      if (raw === null || raw === undefined || raw === "") {
        return null;
      }
      const num = Number(raw);
      if (Number.isNaN(num)) {
        return null;
      }
      const txType = row.transactionType || row.bizType;
      let color = this.$mainColor;
      if (txType === "ORDER_DEDUCT") {
        color = "red";
      } else if (txType === "ORDER_REFUND") {
        color = "green";
      }
      return { amount: Math.abs(num), color };
    },
    loadUsageRecordList() {
      if (!this.activityId) {
        return;
      }
      this.usageLoading = true;
      const params = {
        pageNumber: this.usageSearchForm.pageNumber,
        pageSize: this.usageSearchForm.pageSize,
        sort: this.usageSearchForm.sort,
        order: this.usageSearchForm.order,
      };
      [
        "orderSn",
        "memberName",
        "cardNo",
        "transactionType",
      ].forEach((key) => {
        this.appendTrimmedParam(params, key, this.usageSearchForm[key]);
      });
      this.appendDateRangeToParams(
        params,
        this.usageSearchForm.transactionTimeRange,
        "transactionTimeStart",
        "transactionTimeEnd"
      );
      getGiftCardCashUsageRecordPage(params)
        .then((res) => {
          this.usageLoading = false;
          if (res.success && res.result) {
            const r = res.result;
            this.usageData = r.records || r.list || [];
            this.usageTotal = r.total != null ? r.total : r.totalCount || 0;
          }
        })
        .catch(() => {
          this.usageLoading = false;
        });
    },
  },
};
</script>

<style scoped lang="scss">
.gcc-records-toolbar {
  margin-bottom: 22px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e8eaec;
}
.gcc-records-back {
  font-weight: 500;
}
.gcc-records-meta {
  line-height: 1.6;
  color: #515a6e;
}
.gcc-create-batch-search.search-form {
  justify-content: flex-start;
  align-items: flex-end;
  flex-wrap: wrap;
  text-align: left;
}
/* 与全局 .search-form > .ivu-form-item 的 margin-left:10px 对齐到表格左缘 */
.gcc-create-batch-search.search-form > .ivu-form-item:first-of-type {
  margin-left: 0 !important;
}
.gcc-create-batch-search.search-form ::v-deep .ivu-form-item-label {
  text-align: left;
}
</style>
