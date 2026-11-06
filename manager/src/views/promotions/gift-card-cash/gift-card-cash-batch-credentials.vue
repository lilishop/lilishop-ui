<template>
  <div class="search gcc-batch-credentials">
    <el-card>
      <div class="gcc-records-toolbar">
        <div class="gcc-batch-heading">
          <h3>{{ giftCardName || "批次凭证" }}</h3>
          <div class="gcc-records-meta">
            <span>{{ batchTypeLabel }}：{{ batchIdDisplay || "—" }}</span>
            <span v-if="batchRemark">本批备注：{{ batchRemark }}</span>
          </div>
        </div>
        <div class="gcc-batch-actions">
          <el-button
            v-if="activityId && createBatchId && !isIssueBatchMode"
            type="primary"
            :loading="exporting"
            title="导出当前制卡批次全部卡号、卡密，不受筛选和分页限制"
            @click="handleExport"
          >导出卡密</el-button>
          <el-button @click="closePage">返回</el-button>
        </div>
      </div>
      <el-alert v-if="!activityId || !hasBatchId" type="warning" show-icon :closable="false">
        缺少活动或批次参数，请从{{ batchSourceLabel }}进入。
      </el-alert>
      <template v-else>
        <el-tabs :model-value="lifecycleTab" class="gcc-status-tabs" @tab-change="onLifecycleTab">
          <el-tab-pane
            v-for="t in statusTabList"
            :key="t.key"
            :name="t.key"
            :label="t.label"
          />
        </el-tabs>
        <el-form ref="searchFormRef" :model="searchForm" label-width="72px" class="gcc-filter-form">
          <el-form-item label="卡号" prop="cardNo">
            <el-input
              v-model="searchForm.cardNo"
              placeholder="请输入卡号"
              clearable
            />
          </el-form-item>
          <el-form-item label="兑换会员" class="gcc-combo-item">
            <el-select v-model="searchForm.redeemMemberField" aria-label="兑换会员查询方式">
              <el-option label="昵称" value="nickName" />
              <el-option label="手机号" value="mobile" />
            </el-select>
            <el-input
              v-model="searchForm.redeemMemberKeyword"
              placeholder="请输入"
              clearable
            />
          </el-form-item>
          <el-form-item label="兑换时间" prop="redeemDateRange">
            <el-date-picker
              v-model="redeemDateRange"
              type="daterange"
              clearable
              value-format="YYYY-MM-DD"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
            />
          </el-form-item>
          <el-form-item label="激活会员" class="gcc-combo-item">
            <el-select v-model="searchForm.activateMemberField" aria-label="激活会员查询方式">
              <el-option label="昵称" value="nickName" />
              <el-option label="手机号" value="mobile" />
            </el-select>
            <el-input
              v-model="searchForm.activateMemberKeyword"
              placeholder="请输入"
              clearable
            />
          </el-form-item>
          <el-form-item label="激活时间" prop="activateDateRange">
            <el-date-picker
              v-model="activateDateRange"
              type="daterange"
              clearable
              value-format="YYYY-MM-DD"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
            />
          </el-form-item>
          <el-form-item label-width="0" class="gcc-filter-actions">
            <el-button type="primary" @click="handleSearch">搜索</el-button>
          </el-form-item>
        </el-form>

        <el-table v-if="!isIssueBatchMode" v-loading="loading" :data="data" style="width: 100%">
          <el-table-column prop="cardNo" label="卡号" min-width="140" show-overflow-tooltip />
          <el-table-column prop="cardSecret" label="卡密" min-width="120" show-overflow-tooltip />
          <el-table-column label="面额" prop="faceValue" width="90" align="right">
            <template #default="{ row }">
              <template v-if="row">
                <span v-if="row.cardType === 'PICKUP'">提货权益</span>
                <priceColorScheme v-else-if="hasValue(row.faceValue)" :value="row.faceValue" :color="$mainColor" />
                <span v-else>—</span>
              </template>
            </template>
          </el-table-column>
          <el-table-column label="余额" prop="balance" width="90" align="right">
            <template #default="{ row }">
              <template v-if="row">
                <priceColorScheme v-if="row.cardType !== 'PICKUP' && hasValue(row.balance)" :value="row.balance" :color="$mainColor" />
                <span v-else>—</span>
              </template>
            </template>
          </el-table-column>
          <el-table-column label="状态" prop="status" width="90" align="center">
            <template #default="{ row }">
              <span v-if="row">{{ formatStatus(row.status) }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="memberMobile" label="会员手机" width="120" show-overflow-tooltip />
          <el-table-column prop="memberNickName" label="会员昵称" min-width="100" show-overflow-tooltip />
          <el-table-column prop="bindTime" label="绑定时间" width="165" />
          <el-table-column prop="expireTime" label="到期时间" width="165" />
          <el-table-column prop="createTime" label="创建时间" width="165" />
        </el-table>
        <el-table v-else v-loading="loading" :data="data" style="width: 100%">
          <el-table-column prop="cardNo" label="卡号" min-width="140" show-overflow-tooltip />
          <el-table-column label="发卡批次ID" min-width="160" show-overflow-tooltip>
            <template #default="{ row }">
              <span v-if="row">{{ formatIssueBatchId(row) }}</span>
            </template>
          </el-table-column>
          <el-table-column label="发卡会员" min-width="150">
            <template #default="{ row }">
              <span v-if="row">{{ formatIssueMember(row) }}</span>
            </template>
          </el-table-column>
          <el-table-column label="发卡状态" width="110" align="center">
            <template #default="{ row }">
              <span v-if="row">{{ formatIssueStatus(row.issueStatus) }}</span>
            </template>
          </el-table-column>
          <el-table-column label="激活会员" min-width="150">
            <template #default="{ row }">
              <span v-if="row">{{ formatActivationMember(row) }}</span>
            </template>
          </el-table-column>
          <el-table-column label="激活时间" width="165">
            <template #default="{ row }">
              <span v-if="row">{{ formatActivationTime(row) }}</span>
            </template>
          </el-table-column>
          <el-table-column label="状态" width="90" align="center">
            <template #default="{ row }">
              <span v-if="row">{{ formatStatus(row.status) }}</span>
            </template>
          </el-table-column>
        </el-table>

        <div class="gcc-pagination">
          <el-pagination
            v-model:current-page="searchForm.pageNumber"
            v-model:page-size="searchForm.pageSize"
            :page-sizes="[20, 50, 100]"
            :total="total"
            layout="total, sizes, prev, pager, next, jumper"
            @current-change="changePage"
            @size-change="changePageSize"
          />
        </div>
      </template>
    </el-card>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { exportGiftCardCashCreateBatch, getGiftCardCashCredentialPage } from "@/api/promotion";
import { downloadBlob } from "@/utils/downloadBlob";
import { Message } from "@/utils/message";
import { useAppStore } from "@/stores/app";

const route = useRoute();
const router = useRouter();
const appStore = useAppStore();

const STATUS_LABEL = {
  UNISSUED: "未兑换",
  UNREDEEMED: "未兑换",
  UNACTIVATED: "未激活",
  BOUND: "已激活",
  ACTIVATED: "已激活",
  REDEEMED: "已提货",
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

defineOptions({ name: "GiftCardCashBatchCredentials" });

const activityId = ref("");
const createBatchId = ref("");
const issueBatchId = ref("");
const giftCardName = ref("");
const batchRemark = ref("");
const lifecycleTab = ref("all");
const statusTabList = ref([
  { key: "all", label: "全部", status: "" },
  { key: "unredeemed", label: "未兑换", status: "UNISSUED" },
  { key: "unactivated", label: "未激活", status: "UNACTIVATED" },
  { key: "activated", label: "已激活", status: "BOUND" },
  { key: "cancelled", label: "已销卡", status: "VOIDED" },
  { key: "expired", label: "已过期", status: "EXPIRED" },
  { key: "redeemed", label: "已提货", status: "REDEEMED" },
]);
const redeemDateRange = ref([]);
const activateDateRange = ref([]);
const loading = ref(false);
const exporting = ref(false);
const total = ref(0);
const data = ref([]);
const searchForm = reactive({
  pageNumber: 1,
  pageSize: 20,
  sort: "createTime",
  order: "desc",
  cardNo: "",
  redeemMemberField: "nickName",
  redeemMemberKeyword: "",
  activateMemberField: "nickName",
  activateMemberKeyword: "",
});
const searchFormRef = ref(null);

const isIssueBatchMode = computed(() => {
  return !!issueBatchId.value;
});
const hasBatchId = computed(() => {
  return !!(createBatchId.value || issueBatchId.value);
});
const batchTypeLabel = computed(() => {
  return isIssueBatchMode.value ? "发卡批次" : "制卡批次";
});
const batchSourceLabel = computed(() => {
  return isIssueBatchMode.value ? "发卡记录" : "制卡记录";
});
const batchIdDisplay = computed(() => {
  return isIssueBatchMode.value ? issueBatchId.value : createBatchId.value;
});

onMounted(() => {
  initFromRoute();
  if (activityId.value && hasBatchId.value) {
    loadList();
  }
});

watch(
  () => route.query.createBatchId,
  () => {
    onRouteQueryChange();
  }
);
watch(
  () => route.query.issueBatchId,
  () => {
    onRouteQueryChange();
  }
);
watch(
  () => route.query.activityId,
  () => {
    onRouteQueryChange();
  }
);

/** 判断金额是否存在，保留零金额的有效展示。 */
function hasValue(value) {
  return value !== null && value !== undefined && value !== "";
}
function formatStatus(status) {
  return STATUS_LABEL[status] || status || "—";
}
function formatIssueStatus(status) {
  return ISSUE_STATUS_LABEL[status] || status || "—";
}
function formatIssueBatchId(row) {
  const id = row.issueBatchId ?? issueBatchId.value;
  return id != null && id !== "" ? String(id) : "—";
}
function formatActivationTime(row) {
  const t = row.activationTime || row.activateTime || row.bindTime;
  return t != null && t !== "" ? String(t) : "—";
}
function onRouteQueryChange() {
  initFromRoute();
  if (activityId.value && hasBatchId.value) {
    searchForm.pageNumber = 1;
    loadList();
  }
}
function initFromRoute() {
  const q = route.query || {};
  activityId.value = (q.activityId && String(q.activityId)) || "";
  createBatchId.value = (q.createBatchId && String(q.createBatchId)) || "";
  issueBatchId.value = (q.issueBatchId && String(q.issueBatchId)) || "";
  giftCardName.value = (q.giftCardName && String(q.giftCardName)) || "";
  batchRemark.value = (q.batchRemark && String(q.batchRemark)) || "";
}
function closePage() {
  appStore.removeTag("gift-card-cash-batch-credentials");
  localStorage.pageOpenedList = JSON.stringify(appStore.pageOpenedList);
  router.go(-1);
}
/** 导出当前制卡批次全部凭证，复用后端 Excel 接口；错误响应不保存为文件。 */
async function handleExport() {
  if (exporting.value || !activityId.value || !createBatchId.value || isIssueBatchMode.value) return;
  const batchId = createBatchId.value;
  exporting.value = true;
  try {
    const blob = await exportGiftCardCashCreateBatch(batchId);
    if (!(blob instanceof Blob) || !blob.size) {
      Message.error(blob?.message || "导出失败，请重试");
      return;
    }
    if (blob.type.includes("json")) {
      const result = JSON.parse(await blob.text());
      Message.error(result.message || "导出失败，请重试");
      return;
    }
    downloadBlob(blob, `制卡导出_${batchId}.xlsx`);
    Message.success("已开始下载");
  } catch {
    Message.error("导出失败，请重试");
  } finally {
    exporting.value = false;
  }
}
function formatMemberText(name, mobile) {
  const n = name != null && name !== "" ? String(name) : "";
  const m = mobile != null && mobile !== "" ? String(mobile) : "";
  if (n && m) {
    return `${n} / ${m}`;
  }
  return n || m || "—";
}
function formatIssueMember(row) {
  return formatMemberText(
    row.issueMemberNickName ||
      row.issueMemberName ||
      row.exchangeMemberNickName ||
      row.exchangeMemberName ||
      row.memberNickName,
    row.issueMemberMobile || row.exchangeMemberMobile || row.memberMobile
  );
}
function formatActivationMember(row) {
  return formatMemberText(
    row.activationMemberNickName ||
      row.activationMemberName ||
      row.activateMemberNickName ||
      row.activateMemberName,
    row.activationMemberMobile || row.activateMemberMobile
  );
}
function onLifecycleTab(key) {
  if (lifecycleTab.value === key) {
    return;
  }
  lifecycleTab.value = key;
  searchForm.pageNumber = 1;
  loadList();
}
function handleSearch() {
  searchForm.pageNumber = 1;
  loadList();
}
function changePage(v) {
  searchForm.pageNumber = v;
  loadList();
}
function changePageSize(v) {
  searchForm.pageNumber = 1;
  searchForm.pageSize = v;
  loadList();
}
function formatDayStart(d) {
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
}
function formatDayEnd(d) {
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
}
function appendMemberSearch(params, kind, field, keyword) {
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
  } else if (field === "mobile") {
    params.activationMemberMobile = kw;
  } else {
    params.activationMemberNickName = kw;
  }
}
function appendDateRange(params, kind, range) {
  if (!range || !range[0] || !range[1]) {
    return;
  }
  const start = formatDayStart(range[0]);
  const end = formatDayEnd(range[1]);
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
}
function loadList() {
  if (!activityId.value || !hasBatchId.value) {
    return;
  }
  loading.value = true;
  const params = {
    activityId: activityId.value,
    pageNumber: searchForm.pageNumber,
    pageSize: searchForm.pageSize,
    sort: searchForm.sort,
    order: searchForm.order,
  };
  if (isIssueBatchMode.value) {
    params.issueBatchId = issueBatchId.value;
  } else {
    params.createBatchId = createBatchId.value;
  }
  const tabCfg = statusTabList.value.find((t) => t.key === lifecycleTab.value);
  if (tabCfg && tabCfg.status) {
    params.status = tabCfg.status;
  }
  const cardNo = (searchForm.cardNo || "").trim();
  if (cardNo) {
    params.cardNo = cardNo;
  }
  appendMemberSearch(
    params,
    "exchange",
    searchForm.redeemMemberField,
    searchForm.redeemMemberKeyword
  );
  appendMemberSearch(
    params,
    "activation",
    searchForm.activateMemberField,
    searchForm.activateMemberKeyword
  );
  appendDateRange(params, "exchange", redeemDateRange.value);
  appendDateRange(params, "activation", activateDateRange.value);
  getGiftCardCashCredentialPage(params)
    .then((res) => {
      loading.value = false;
      if (res.success && res.result) {
        data.value = res.result.records || [];
        total.value = res.result.total || 0;
      }
    })
    .catch(() => {
      loading.value = false;
    });
}
</script>

<style scoped>
.gcc-records-toolbar {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 16px;
}
.gcc-batch-heading {
  min-width: 0;
}
.gcc-batch-actions {
  display: flex;
  flex-shrink: 0;
  align-items: center;
}
.gcc-batch-heading h3 {
  margin: 0 0 10px;
  color: #303133;
  font-size: 16px;
  font-weight: 600;
  overflow-wrap: anywhere;
}
.gcc-records-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 24px;
  color: #909399;
  font-size: 13px;
  line-height: 1.6;
  overflow-wrap: anywhere;
}
.gcc-status-tabs {
  margin-bottom: 16px;
}
.gcc-status-tabs :deep(.el-tabs__header) {
  margin-bottom: 0;
}
.gcc-filter-form {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  align-items: start;
  gap: 16px 24px;
  margin-bottom: 20px;
}
.gcc-filter-form :deep(.el-form-item) {
  margin: 0;
  min-width: 0;
}
.gcc-filter-form :deep(.el-form-item__content) {
  flex-wrap: nowrap;
  min-width: 0;
  gap: 8px;
}
.gcc-filter-form :deep(.el-input),
.gcc-filter-form :deep(.el-date-editor) {
  width: 100%;
  min-width: 0;
}
.gcc-combo-item :deep(.el-select) {
  flex: 0 0 88px;
  width: 88px;
}
.gcc-combo-item :deep(.el-input) {
  flex: 1;
}
.gcc-filter-actions :deep(.el-form-item__content) {
  padding-left: 72px;
}
.gcc-pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
  overflow-x: auto;
}
@media (max-width: 600px) {
  .gcc-filter-form {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
