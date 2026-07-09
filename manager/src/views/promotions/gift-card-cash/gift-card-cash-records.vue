<template>
  <div class="search">
    <el-card>
      <div class="gcc-records-toolbar">
        <el-button type="primary" class="gcc-records-back" @click="closePage">返回</el-button>
      </div>
      <div v-if="giftCardName" class="gcc-records-meta mb_10">
        <strong>礼品卡：</strong>{{ giftCardName }}
      </div>
      <div v-else-if="activityId" class="gcc-records-meta mb_10">
        <strong>活动ID：</strong>{{ activityId }}
      </div>
      <el-alert v-if="!activityId" type="warning" show-icon :closable="false">
        缺少活动参数，请从礼品卡列表进入。
      </el-alert>
      <el-tabs v-else v-model="activeTab" @tab-click="onTabClick">
        <el-tab-pane label="制卡记录" name="createBatch">
          <el-card shadow="never">
            <el-form
              ref="createFilterForm"
              :model="createSearchForm"
              inline
              label-position="left"
              class="search-form mb_10 gcc-create-batch-search"
              label-width="100px"
            >
              <el-form-item label="卡号" prop="cardNo">
                <el-input v-model="createSearchForm.cardNo" clearable style="width: 150px" />
              </el-form-item>
              <el-form-item label="制卡批次ID" prop="createBatchId">
                <el-input v-model="createSearchForm.createBatchId" clearable style="width: 170px" />
              </el-form-item>
              <el-form-item label="卡名称" prop="giftCardName">
                <el-input v-model="createSearchForm.giftCardName" clearable style="width: 160px" />
              </el-form-item>
              <el-form-item label="制卡人名称" prop="createUserName">
                <el-input v-model="createSearchForm.createUserName" clearable style="width: 140px" />
              </el-form-item>
              <el-form-item label="制卡时间" prop="createTimeRange">
                <el-date-picker
                  v-model="createSearchForm.createTimeRange"
                  type="daterange"
                  clearable
                  value-format="YYYY-MM-DD"
                  style="width: 220px"
                />
              </el-form-item>
              <el-form-item label="过期时间" prop="expireTimeRange">
                <el-date-picker
                  v-model="createSearchForm.expireTimeRange"
                  type="daterange"
                  clearable
                  value-format="YYYY-MM-DD"
                  style="width: 220px"
                />
              </el-form-item>
              <el-form-item label-width="0">
                <el-button type="primary" class="search-btn" @click="handleCreateSearch">搜索</el-button>
              </el-form-item>
            </el-form>
            <el-table v-loading="createLoading" :data="createData" style="width: 100%">
              <el-table-column label="制卡批次ID" min-width="100" show-overflow-tooltip align="left">
                <template #default="{ row }">
                  <span v-if="row">{{ formatCreateBatchId(row) }}</span>
                </template>
              </el-table-column>
              <el-table-column label="卡号范围" min-width="160" show-overflow-tooltip align="left">
                <template #default="{ row }">
                  <span v-if="row">{{ formatText(row.cardNoRange) }}</span>
                </template>
              </el-table-column>
              <el-table-column label="面值" width="150" align="left">
                <template #default="{ row }">
                  <template v-if="row">
                    <priceColorScheme
                      v-if="hasValue(row.faceValue)"
                      :value="row.faceValue"
                      :color="$mainColor"
                    />
                    <span v-else>-</span>
                  </template>
                </template>
              </el-table-column>
              <el-table-column label="礼品卡名称" width="150" show-overflow-tooltip align="left">
                <template #default="{ row }">
                  <span v-if="row">{{ formatGiftCardName(row.giftCardName) }}</span>
                </template>
              </el-table-column>
              <el-table-column prop="createUserName" label="制卡人" width="150" show-overflow-tooltip align="left" />
              <el-table-column prop="createTime" label="制卡时间" width="200" align="left" />
              <el-table-column label="制卡数量" width="200" align="left">
                <template #default="{ row }">
                  <span v-if="row">{{ formatQuantity(row.quantity) }}</span>
                </template>
              </el-table-column>
              <el-table-column label="过期时间" width="200" align="left">
                <template #default="{ row }">
                  <span v-if="row">{{ formatExpireTime(row.expireTime) }}</span>
                </template>
              </el-table-column>
              <el-table-column label="操作" width="150" align="center" fixed="right">
                <template #default="{ row }">
                  <a v-if="row" class="link-text" @click="goBatchCredentials(row)">查看
                  </a>
                </template>
              </el-table-column>
            </el-table>
            <div class="mt_10" style="display: flex; justify-content: flex-end">
              <el-pagination
                v-model:current-page="createSearchForm.pageNumber"
                v-model:page-size="createSearchForm.pageSize"
                :page-sizes="[20, 50, 100]"
                :total="createTotal"
                layout="total, sizes, prev, pager, next, jumper"
                size="small"
                @current-change="createChangePage"
                @size-change="createChangePageSize"
              />
            </div>
          </el-card>
        </el-tab-pane>

        <el-tab-pane label="发卡记录" name="issue">
          <el-card shadow="never">
            <el-form
              ref="issueFilterForm"
              :model="issueSearchForm"
              inline
              label-position="left"
              class="search-form mb_10 gcc-create-batch-search"
              label-width="100px"
            >
              <el-form-item label="卡号" prop="cardNo">
                <el-input v-model="issueSearchForm.cardNo" clearable style="width: 150px" />
              </el-form-item>
              <el-form-item label="发卡批次ID" prop="issueBatchId">
                <el-input v-model="issueSearchForm.issueBatchId" clearable style="width: 170px" />
              </el-form-item>
              <el-form-item label="现金卡名称" prop="giftCardName">
                <el-input v-model="issueSearchForm.giftCardName" clearable style="width: 160px" />
              </el-form-item>
              <el-form-item label="发卡人名称" prop="issueUserName">
                <el-input v-model="issueSearchForm.issueUserName" clearable style="width: 140px" />
              </el-form-item>
              <el-form-item label="发卡时间" prop="createTimeRange">
                <el-date-picker
                  v-model="issueSearchForm.createTimeRange"
                  type="daterange"
                  clearable
                  value-format="YYYY-MM-DD"
                  style="width: 220px"
                />
              </el-form-item>
              <el-form-item label="过期时间" prop="expireTimeRange">
                <el-date-picker
                  v-model="issueSearchForm.expireTimeRange"
                  type="daterange"
                  clearable
                  value-format="YYYY-MM-DD"
                  style="width: 220px"
                />
              </el-form-item>
              <el-form-item label-width="0">
                <el-button type="primary" class="search-btn" @click="handleIssueSearch">搜索</el-button>
              </el-form-item>
            </el-form>
            <el-table v-loading="issueLoading" :data="issueData" style="width: 100%">
              <el-table-column label="发卡批次ID" min-width="160" show-overflow-tooltip>
                <template #default="{ row }">
                  <span v-if="row">{{ formatIssueBatchId(row) }}</span>
                </template>
              </el-table-column>
              <el-table-column label="卡号范围" min-width="160" show-overflow-tooltip>
                <template #default="{ row }">
                  <span v-if="row">{{ formatText(row.cardNoRange) }}</span>
                </template>
              </el-table-column>
              <el-table-column label="面值" width="120" align="right">
                <template #default="{ row }">
                  <template v-if="row">
                    <priceColorScheme
                      v-if="hasValue(row.faceValue)"
                      :value="row.faceValue"
                      :color="$mainColor"
                    />
                    <span v-else>-</span>
                  </template>
                </template>
              </el-table-column>
              <el-table-column label="卡名称" min-width="120" show-overflow-tooltip>
                <template #default="{ row }">
                  <span v-if="row">{{ formatGiftCardName(row.giftCardName) }}</span>
                </template>
              </el-table-column>
              <el-table-column label="发卡人" min-width="100" show-overflow-tooltip>
                <template #default="{ row }">
                  <span v-if="row">{{ formatText(row.issueUserName) }}</span>
                </template>
              </el-table-column>
              <el-table-column prop="createTime" label="发卡时间" width="170" />
              <el-table-column label="发卡数量" width="100" align="center">
                <template #default="{ row }">
                  <span v-if="row">{{ formatQuantity(row.totalCards) }}</span>
                </template>
              </el-table-column>
              <el-table-column label="过期时间" width="170">
                <template #default="{ row }">
                  <span v-if="row">{{ formatExpireTime(row.expireTime) }}</span>
                </template>
              </el-table-column>
              <el-table-column label="操作" width="150" align="center" fixed="right">
                <template #default="{ row }">
                  <a v-if="row" class="link-text" @click="goIssueBatchCredentials(row)">查看
                  </a>
                </template>
              </el-table-column>
            </el-table>
            <div class="mt_10" style="display: flex; justify-content: flex-end">
              <el-pagination
                v-model:current-page="issueSearchForm.pageNumber"
                v-model:page-size="issueSearchForm.pageSize"
                :page-sizes="[20, 50, 100]"
                :total="issueTotal"
                layout="total, sizes, prev, pager, next, jumper"
                size="small"
                @current-change="issueChangePage"
                @size-change="issueChangePageSize"
              />
            </div>
          </el-card>
        </el-tab-pane>

        <el-tab-pane label="使用记录" name="usage">
          <el-card shadow="never">
            <el-form
              ref="usageFilterForm"
              :model="usageSearchForm"
              inline
              label-position="left"
              class="search-form mb_10 gcc-create-batch-search"
              label-width="90px"
            >
              <el-form-item label="订单号" prop="orderSn">
                <el-input v-model="usageSearchForm.orderSn" clearable style="width: 160px" />
              </el-form-item>
              <el-form-item label="客户名称" prop="memberName">
                <el-input v-model="usageSearchForm.memberName" clearable style="width: 150px" />
              </el-form-item>
              <el-form-item label="卡号" prop="cardNo">
                <el-input v-model="usageSearchForm.cardNo" clearable style="width: 150px" />
              </el-form-item>
              <el-form-item label="交易时间" prop="transactionTimeRange">
                <el-date-picker
                  v-model="usageSearchForm.transactionTimeRange"
                  type="daterange"
                  clearable
                  value-format="YYYY-MM-DD"
                  style="width: 220px"
                />
              </el-form-item>
              <el-form-item label="交易类型" prop="transactionType">
                <el-select v-model="usageSearchForm.transactionType" clearable style="width: 150px">
                  <el-option label="订单抵扣" value="ORDER_DEDUCT" />
                  <el-option label="订单退款" value="ORDER_REFUND" />
                  <el-option label="订单取消" value="ORDER_CANCEL" />
                </el-select>
              </el-form-item>
              <el-form-item label-width="0">
                <el-button type="primary" class="search-btn" @click="handleUsageSearch">搜索</el-button>
              </el-form-item>
            </el-form>
            <el-table v-loading="usageLoading" :data="usageData" style="width: 100%">
              <el-table-column prop="orderSn" label="订单号" min-width="160" show-overflow-tooltip />
              <el-table-column label="交易类型" min-width="120">
                <template #default="{ row }">
                  <span v-if="row">{{ formatUsageBizType(row.transactionType || row.bizType) }}</span>
                </template>
              </el-table-column>
              <el-table-column prop="cardNo" label="卡号" min-width="150" show-overflow-tooltip />
              <el-table-column label="现金卡信息" min-width="180">
                <template #default="{ row }">
                  <template v-if="row">
                    <div>{{ formatUsageGiftCardName(row) }}</div>
                    <div class="gcc-sub-text">面额：{{ formatUsageFaceValue(row) }}</div>
                  </template>
                </template>
              </el-table-column>
              <el-table-column label="金额" width="130" align="right">
                <template #default="{ row }">
                  <template v-if="row">
                    <priceColorScheme
                      v-if="getUsageAmountDisplay(row)"
                      :value="getUsageAmountDisplay(row).amount"
                      :color="getUsageAmountDisplay(row).color"
                    />
                    <span v-else>-</span>
                  </template>
                </template>
              </el-table-column>
              <el-table-column label="余额" width="130" align="right">
                <template #default="{ row }">
                  <template v-if="row">
                    <priceColorScheme
                      v-if="hasValue(row.balanceAfter)"
                      :value="row.balanceAfter"
                      :color="$mainColor"
                    />
                    <span v-else>-</span>
                  </template>
                </template>
              </el-table-column>
              <el-table-column label="交易时间" width="170">
                <template #default="{ row }">
                  <span v-if="row">{{ formatTransactionTime(row) }}</span>
                </template>
              </el-table-column>
              <el-table-column label="客户信息" min-width="150">
                <template #default="{ row }">
                  <template v-if="row">
                    <div>{{ row.memberName || "-" }}</div>
                    <div class="gcc-sub-text">{{ row.memberMobile || "-" }}</div>
                  </template>
                </template>
              </el-table-column>
              <el-table-column label="操作" width="100" align="center" fixed="right">
                <template #default="{ row }">
                  <template v-if="row">
                    <span v-if="!row.orderSn" class="gcc-disabled-action">详情</span>
                    <a v-else class="link-text" @click="goOrderDetail(row.orderSn)">详情</a>
                  </template>
                </template>
              </el-table-column>
            </el-table>
            <div class="mt_10" style="display: flex; justify-content: flex-end">
              <el-pagination
                v-model:current-page="usageSearchForm.pageNumber"
                v-model:page-size="usageSearchForm.pageSize"
                :page-sizes="[20, 50, 100]"
                :total="usageTotal"
                layout="total, sizes, prev, pager, next, jumper"
                size="small"
                @current-change="usageChangePage"
                @size-change="usageChangePageSize"
              />
            </div>
          </el-card>
        </el-tab-pane>
      </el-tabs>
    </el-card>
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
    hasValue(v) {
      return v !== null && v !== undefined && v !== "";
    },
    formatText(v) {
      return this.hasValue(v) ? String(v) : "-";
    },
    formatCreateBatchId(row) {
      const id = row.createBatchId ?? row.id;
      return this.formatText(id);
    },
    formatIssueBatchId(row) {
      const id = row.issueBatchId ?? row.id;
      return this.formatText(id);
    },
    formatGiftCardName(name) {
      return this.formatText(name ?? this.giftCardName);
    },
    formatQuantity(v) {
      return this.hasValue(v) ? String(v) : "-";
    },
    formatExpireTime(v) {
      return this.hasValue(v) ? String(v) : "长期有效";
    },
    formatUsageGiftCardName(row) {
      return row.giftCardName || this.giftCardName || "-";
    },
    formatUsageFaceValue(row) {
      const faceValue = row.faceValue;
      return this.hasValue(faceValue) ? String(faceValue) : "-";
    },
    formatTransactionTime(row) {
      const t = row.transactionTime || row.createTime;
      return this.formatText(t);
    },
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
    onTabClick(tab) {
      const name = tab.paneName;
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
      ["cardNo", "issueBatchId", "giftCardName", "issueUserName"].forEach((key) => {
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
      ["orderSn", "memberName", "cardNo", "transactionType"].forEach((key) => {
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
.gcc-create-batch-search.search-form > .el-form-item:first-of-type {
  margin-left: 0 !important;
}
.gcc-create-batch-search.search-form :deep(.el-form-item__label) {
  text-align: left;
}
.gcc-sub-text {
  color: #808695;
  margin-top: 4px;
}
.gcc-disabled-action {
  color: #c5c8ce;
}
</style>
