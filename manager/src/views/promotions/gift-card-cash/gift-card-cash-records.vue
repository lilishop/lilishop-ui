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

<script setup>
import { onMounted, reactive, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import {
  getGiftCardCashCreateBatchPage,
  getGiftCardCashIssueBatchPage,
  getGiftCardCashUsageRecordPage,
} from "@/api/promotion";
import config from "@/config";
import { useAppStore } from "@/stores/app";

defineOptions({ name: "GiftCardCashRecords" });

const route = useRoute();
const router = useRouter();
const appStore = useAppStore();

const activeTab = ref("createBatch");
const activityId = ref("");
const giftCardName = ref("");
const createLoading = ref(false);
const createTotal = ref(0);
const createData = ref([]);
const createSearchForm = reactive({
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
});
const issueLoading = ref(false);
const issueTotal = ref(0);
const issueData = ref([]);
const issueSearchForm = reactive({
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
});
const usageLoading = ref(false);
const usageTotal = ref(0);
const usageData = ref([]);
const usageSearchForm = reactive({
  pageNumber: 1,
  pageSize: 20,
  sort: "createTime",
  order: "desc",
  orderSn: "",
  memberName: "",
  cardNo: "",
  transactionType: "",
  transactionTimeRange: [],
});

function hasValue(v) {
  return v !== null && v !== undefined && v !== "";
}

function formatText(v) {
  return hasValue(v) ? String(v) : "-";
}

function formatCreateBatchId(row) {
  const id = row.createBatchId ?? row.id;
  return formatText(id);
}

function formatIssueBatchId(row) {
  const id = row.issueBatchId ?? row.id;
  return formatText(id);
}

function formatGiftCardName(name) {
  return formatText(name ?? giftCardName.value);
}

function formatQuantity(v) {
  return hasValue(v) ? String(v) : "-";
}

function formatExpireTime(v) {
  return hasValue(v) ? String(v) : "长期有效";
}

function formatUsageGiftCardName(row) {
  return row.giftCardName || giftCardName.value || "-";
}

function formatUsageFaceValue(row) {
  const faceValue = row.faceValue;
  return hasValue(faceValue) ? String(faceValue) : "-";
}

function formatTransactionTime(row) {
  const t = row.transactionTime || row.createTime;
  return formatText(t);
}

function initFromRoute() {
  activityId.value = (route.query.activityId && String(route.query.activityId)) || "";
  giftCardName.value = (route.query.giftCardName && String(route.query.giftCardName)) || "";
}

function closePage() {
  appStore.removeTag("gift-card-cash-records");
  localStorage.pageOpenedList = JSON.stringify(appStore.pageOpenedList);
  router.go(-1);
}

function goBatchCredentials(row) {
  const batchId = row.createBatchId != null && row.createBatchId !== "" ? row.createBatchId : row.id;
  router.push({
    name: "gift-card-cash-batch-credentials",
    query: {
      activityId: activityId.value,
      createBatchId: batchId,
      giftCardName: row.giftCardName || giftCardName.value || "",
      batchRemark: row.batchRemark || "",
    },
  });
}

function goIssueBatchCredentials(row) {
  const batchId = row.issueBatchId != null && row.issueBatchId !== "" ? row.issueBatchId : row.id;
  router.push({
    name: "gift-card-cash-batch-credentials",
    query: {
      activityId: activityId.value,
      issueBatchId: batchId,
      giftCardName: row.giftCardName || giftCardName.value || "",
    },
  });
}

function goOrderDetail(orderSn) {
  router.push({
    name: "order-detail",
    query: { sn: orderSn },
  });
}

function onTabClick(tab) {
  const name = tab.paneName;
  if (name === "createBatch" && activityId.value) {
    loadCreateBatchList();
  }
  if (name === "issue" && activityId.value) {
    loadIssueBatchList();
  }
  if (name === "usage" && activityId.value) {
    loadUsageRecordList();
  }
}

function handleCreateSearch() {
  createSearchForm.pageNumber = 1;
  loadCreateBatchList();
}

function toApiDateTimeBoundary(val, endOfDay) {
  const dt = val instanceof Date ? val : new Date(val);
  if (Number.isNaN(dt.getTime())) {
    return null;
  }
  const y = dt.getFullYear();
  const m = String(dt.getMonth() + 1).padStart(2, "0");
  const d = String(dt.getDate()).padStart(2, "0");
  return endOfDay ? `${y}-${m}-${d} 23:59:59` : `${y}-${m}-${d} 00:00:00`;
}

function appendDateRangeToParams(params, range, startKey, endKey) {
  if (!Array.isArray(range) || range.length < 2 || !range[0] || !range[1]) {
    return;
  }
  const start = toApiDateTimeBoundary(range[0], false);
  const end = toApiDateTimeBoundary(range[1], true);
  if (start) {
    params[startKey] = start;
  }
  if (end) {
    params[endKey] = end;
  }
}

function appendTrimmedParam(params, key, value) {
  const text = (value || "").trim();
  if (text) {
    params[key] = text;
  }
}

function createChangePage(v) {
  createSearchForm.pageNumber = v;
  loadCreateBatchList();
}

function createChangePageSize(v) {
  createSearchForm.pageNumber = 1;
  createSearchForm.pageSize = v;
  loadCreateBatchList();
}

function loadCreateBatchList() {
  if (!activityId.value) {
    return;
  }
  createLoading.value = true;
  const params = {
    activityId: activityId.value,
    pageNumber: createSearchForm.pageNumber,
    pageSize: createSearchForm.pageSize,
    sort: createSearchForm.sort,
    order: createSearchForm.order,
  };
  const cardNo = (createSearchForm.cardNo || "").trim();
  if (cardNo) {
    params.cardNo = cardNo;
  }
  const createBatchId = (createSearchForm.createBatchId || "").trim();
  if (createBatchId) {
    params.createBatchId = createBatchId;
  }
  const giftCardNameParam = (createSearchForm.giftCardName || "").trim();
  if (giftCardNameParam) {
    params.giftCardName = giftCardNameParam;
  }
  const createUserName = (createSearchForm.createUserName || "").trim();
  if (createUserName) {
    params.createUserName = createUserName;
  }
  appendDateRangeToParams(
    params,
    createSearchForm.createTimeRange,
    "createTimeStart",
    "createTimeEnd"
  );
  appendDateRangeToParams(
    params,
    createSearchForm.expireTimeRange,
    "expireTimeStart",
    "expireTimeEnd"
  );
  getGiftCardCashCreateBatchPage(params)
    .then((res) => {
      createLoading.value = false;
      if (res.success && res.result) {
        createData.value = res.result.records || [];
        createTotal.value = res.result.total || 0;
      }
    })
    .catch(() => {
      createLoading.value = false;
    });
}

function issueChangePage(v) {
  issueSearchForm.pageNumber = v;
  loadIssueBatchList();
}

function issueChangePageSize(v) {
  issueSearchForm.pageNumber = 1;
  issueSearchForm.pageSize = v;
  loadIssueBatchList();
}

function handleIssueSearch() {
  issueSearchForm.pageNumber = 1;
  loadIssueBatchList();
}

function loadIssueBatchList() {
  if (!activityId.value) {
    return;
  }
  issueLoading.value = true;
  const params = {
    activityId: activityId.value,
    pageNumber: issueSearchForm.pageNumber,
    pageSize: issueSearchForm.pageSize,
    sort: issueSearchForm.sort,
    order: issueSearchForm.order,
  };
  ["cardNo", "issueBatchId", "giftCardName", "issueUserName"].forEach((key) => {
    appendTrimmedParam(params, key, issueSearchForm[key]);
  });
  appendDateRangeToParams(
    params,
    issueSearchForm.createTimeRange,
    "createTimeStart",
    "createTimeEnd"
  );
  appendDateRangeToParams(
    params,
    issueSearchForm.expireTimeRange,
    "expireTimeStart",
    "expireTimeEnd"
  );
  getGiftCardCashIssueBatchPage(params)
    .then((res) => {
      issueLoading.value = false;
      if (res.success && res.result) {
        const r = res.result;
        issueData.value = r.records || r.list || r.recordsList || [];
        issueTotal.value = r.total != null ? r.total : r.totalCount || 0;
      }
    })
    .catch(() => {
      issueLoading.value = false;
    });
}

function handleUsageSearch() {
  usageSearchForm.pageNumber = 1;
  loadUsageRecordList();
}

function usageChangePage(v) {
  usageSearchForm.pageNumber = v;
  loadUsageRecordList();
}

function usageChangePageSize(v) {
  usageSearchForm.pageNumber = 1;
  usageSearchForm.pageSize = v;
  loadUsageRecordList();
}

function formatUsageFlowType(type) {
  const map = {
    INCREASE: "增加",
    DECREASE: "减少",
  };
  return map[type] || type || "-";
}

function formatUsageBizType(type) {
  const map = {
    ORDER_DEDUCT: "订单抵扣",
    ORDER_REFUND: "订单退款",
    ORDER_CANCEL: "订单取消",
    CARD_ACTIVATE: "卡激活",
  };
  return map[type] || type || "-";
}

function getUsageAmountDisplay(row) {
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
  let color = config.mainColor;
  if (txType === "ORDER_DEDUCT") {
    color = "red";
  } else if (txType === "ORDER_REFUND") {
    color = "green";
  }
  return { amount: Math.abs(num), color };
}

function loadUsageRecordList() {
  if (!activityId.value) {
    return;
  }
  usageLoading.value = true;
  const params = {
    pageNumber: usageSearchForm.pageNumber,
    pageSize: usageSearchForm.pageSize,
    sort: usageSearchForm.sort,
    order: usageSearchForm.order,
  };
  ["orderSn", "memberName", "cardNo", "transactionType"].forEach((key) => {
    appendTrimmedParam(params, key, usageSearchForm[key]);
  });
  appendDateRangeToParams(
    params,
    usageSearchForm.transactionTimeRange,
    "transactionTimeStart",
    "transactionTimeEnd"
  );
  getGiftCardCashUsageRecordPage(params)
    .then((res) => {
      usageLoading.value = false;
      if (res.success && res.result) {
        const r = res.result;
        usageData.value = r.records || r.list || [];
        usageTotal.value = r.total != null ? r.total : r.totalCount || 0;
      }
    })
    .catch(() => {
      usageLoading.value = false;
    });
}

onMounted(() => {
  initFromRoute();
  if (activityId.value) {
    loadCreateBatchList();
  }
});

watch(
  () => route.query.activityId,
  (id) => {
    initFromRoute();
    if (id && activeTab.value === "createBatch") {
      loadCreateBatchList();
    }
    if (id && activeTab.value === "issue") {
      issueSearchForm.pageNumber = 1;
      loadIssueBatchList();
    }
    if (id && activeTab.value === "usage") {
      usageSearchForm.pageNumber = 1;
      loadUsageRecordList();
    }
  }
);
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
