<template>
  <div class="search">
    <el-card>
      <el-form
        ref="searchFormRef"
        :model="searchForm"
        inline
        label-width="110px"
        class="search-form"
        @keyup.enter="handleSearch"
      >
        <el-form-item label="客户手机号" prop="memberMobile">
          <el-input v-model="searchForm.memberMobile" placeholder="请输入客户手机号" clearable style="width: 200px" />
        </el-form-item>
        <el-form-item label="分销员手机号" prop="distributionMobile">
          <el-input v-model="searchForm.distributionMobile" placeholder="请输入分销员手机号" clearable style="width: 200px" />
        </el-form-item>
        <el-form-item label="绑定时间">
          <el-date-picker
            v-model="bindTimeRange"
            type="daterange"
            value-format="YYYY-MM-DD"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            placeholder="选择时间"
            style="width: 240px"
          />
        </el-form-item>
        <el-form-item label="当前关系">
          <el-select v-model="searchForm.relationEffective" clearable placeholder="全部" style="width: 200px">
            <el-option
              v-for="item in relationEffectiveList"
              :key="item.value"
              :value="item.value"
              :label="item.label"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="是否有截止时间">
          <el-select v-model="searchForm.hasDeadline" clearable placeholder="全部" style="width: 200px">
            <el-option
              v-for="item in hasDeadlineList"
              :key="item.value"
              :value="item.value"
              :label="item.label"
            />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" class="search-btn" @click="handleSearch">搜索</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card>
      <el-table v-loading="loading" border :data="data" class="mt_10" style="width: 100%">
        <el-table-column prop="memberId" label="客户ID" min-width="200" class-name="id-column" show-overflow-tooltip />
        <el-table-column prop="memberNickname" label="客户昵称" min-width="120" show-overflow-tooltip />
        <el-table-column prop="memberMobile" label="客户手机号" min-width="120" />
        <el-table-column prop="distributionNickname" label="分销员昵称" min-width="120" show-overflow-tooltip />
        <el-table-column prop="distributionMobile" label="分销员手机号" min-width="120" />
        <el-table-column label="当前关系" width="120">
          <template #default="{ row }">
            <div v-if="row" class="relation-status-cell">
              <span :class="isRelationEffective(row) ? 'relation-effective' : 'relation-invalid'">
                {{ isRelationEffective(row) ? "有效" : "失效" }}
              </span>
              <el-tooltip v-if="!isRelationEffective(row)" placement="top">
                <template #content>
                  <div>失效时间：{{ formatInvalidTime(row) }}</div>
                  <div>失效原因：{{ row.invalidReason || "-" }}</div>
                </template>
                <el-icon class="relation-tip-icon"><QuestionFilled /></el-icon>
              </el-tooltip>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="bindTime" label="绑定时间" min-width="160" />
        <el-table-column label="是否有截止日期" width="150" align="center">
          <template #default="{ row }">
            <span v-if="row">{{ row.hasDeadline ? "是" : "否" }}</span>
          </template>
        </el-table-column>
        <el-table-column label="有效截止日期" min-width="160">
          <template #default="{ row }">
            <span v-if="row">{{ row.hasDeadline && row.expireAt ? row.expireAt : "-" }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="260" align="center" fixed="right">
          <template #default="{ row }">
            <div v-if="row" class="ops">
              <a class="link-text" @click="openDetail(row)">详情</a>
              <span class="op-split">|</span>
              <a class="link-text" @click="openLogs(row)">变更记录</a>
              <span class="op-split">|</span>
              <a class="link-text" @click="openRebind(row)">换绑</a>
              <span class="op-split">|</span>
              <a class="link-text" @click="openUnbind(row)">解绑</a>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <div class="mt_10" style="display: flex; justify-content: flex-end">
        <el-pagination
          v-model:current-page="searchForm.pageNumber"
          v-model:page-size="searchForm.pageSize"
          :page-sizes="[20, 50, 100]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          size="small"
          @current-change="changePage"
          @size-change="changePageSize"
        />
      </div>
    </el-card>

    <el-drawer
      v-model="detailVisible"
      title="客户关系详情"
      size="640px"
      direction="rtl"
      :close-on-click-modal="false"
      append-to-body
      destroy-on-close
    >
      <div v-loading="detailLoading" class="detail-body">
        <template v-if="detail">
          <div class="detail-meta">
            <div class="detail-meta-row">
              <span class="detail-meta-label">关系ID</span>
              <span class="detail-meta-value">{{ detail.id || "-" }}</span>
            </div>
            <div class="detail-meta-row">
              <span class="detail-meta-label">客户ID</span>
              <span class="detail-meta-value">{{ detail.memberId || "-" }}</span>
            </div>
            <div class="detail-meta-row">
              <span class="detail-meta-label">客户手机号</span>
              <span class="detail-meta-value">{{ detail.memberMobile || "-" }}</span>
            </div>
            <div class="detail-meta-row">
              <span class="detail-meta-label">客户昵称</span>
              <span class="detail-meta-value">{{ detail.memberNickname || "-" }}</span>
            </div>
            <div class="detail-meta-row">
              <span class="detail-meta-label">分销员ID</span>
              <span class="detail-meta-value">{{ detail.distributionId || "-" }}</span>
            </div>
            <div class="detail-meta-row">
              <span class="detail-meta-label">分销员手机号</span>
              <span class="detail-meta-value">{{ detail.distributionMobile || "-" }}</span>
            </div>
            <div class="detail-meta-row">
              <span class="detail-meta-label">分销员昵称</span>
              <span class="detail-meta-value">{{ detail.distributionNickname || "-" }}</span>
            </div>
            <div class="detail-meta-row">
              <span class="detail-meta-label">绑定时间</span>
              <span class="detail-meta-value">{{ detail.bindTime || "-" }}</span>
            </div>
            <div class="detail-meta-row">
              <span class="detail-meta-label">当前关系</span>
              <span
                class="detail-meta-value"
                :class="isRelationEffective(detail) ? 'relation-effective' : 'relation-invalid'"
              >
                {{ isRelationEffective(detail) ? "有效" : "失效" }}
              </span>
            </div>
            <div class="detail-meta-row">
              <span class="detail-meta-label">失效时间</span>
              <span class="detail-meta-value">{{ formatDetailInvalidTime(detail) }}</span>
            </div>
            <div class="detail-meta-row">
              <span class="detail-meta-label">失效原因</span>
              <span class="detail-meta-value">{{ formatDetailInvalidReason(detail) }}</span>
            </div>
            <div class="detail-meta-row">
              <span class="detail-meta-label">是否有截止日期</span>
              <span class="detail-meta-value">{{ detail.hasDeadline ? "是" : "否" }}</span>
            </div>
            <div class="detail-meta-row">
              <span class="detail-meta-label">有效截止日期</span>
              <span class="detail-meta-value">{{ detail.hasDeadline && detail.expireAt ? detail.expireAt : "-" }}</span>
            </div>
          </div>
        </template>
      </div>
    </el-drawer>

    <el-drawer
      v-model="logVisible"
      title="变更记录"
      size="1100px"
      direction="rtl"
      :close-on-click-modal="false"
      append-to-body
      destroy-on-close
      class="relation-log-drawer"
    >
      <div v-loading="logLoading" class="log-body">
        <el-table
          v-if="logList.length || logLoading"
          border
          :data="logList"
          style="width: 100%"
          empty-text="暂无变更记录"
        >
          <el-table-column label="客户名称" min-width="120" show-overflow-tooltip>
            <template #default="{ row }">
              {{ row.memberNickname || logTarget?.memberNickname || "-" }}
            </template>
          </el-table-column>
          <el-table-column label="客户手机号" min-width="120">
            <template #default="{ row }">
              {{ row.memberMobile || logTarget?.memberMobile || "-" }}
            </template>
          </el-table-column>
          <el-table-column label="变更前分销员" min-width="140">
            <template #default="{ row }">
              <div class="log-distributor-cell">
                {{ formatDistributorCell(row.beforeDistributionNickname, row.beforeDistributionMobile, row.beforeDistributionId) }}
              </div>
            </template>
          </el-table-column>
          <el-table-column label="变更后分销员" min-width="140">
            <template #default="{ row }">
              <div class="log-distributor-cell">
                {{ formatDistributorCell(row.afterDistributionNickname, row.afterDistributionMobile, row.afterDistributionId) }}
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="createTime" label="变更时间" min-width="160" />
          <el-table-column prop="changeTypeLabel" label="变更类型" width="90" align="center" />
          <el-table-column label="原因" min-width="160">
            <template #default="{ row }">
              <div class="log-reason-cell">{{ row.reason || "-" }}</div>
            </template>
          </el-table-column>
        </el-table>
        <el-empty v-else-if="!logLoading" description="暂无变更记录" />
      </div>
    </el-drawer>

    <el-drawer
      v-model="rebindVisible"
      title="换绑客户关系"
      size="520px"
      :close-on-click-modal="false"
      destroy-on-close
      append-to-body
    >
      <el-form ref="rebindFormRef" :model="rebindForm" :rules="rebindRules" label-width="110px">
        <el-form-item label="客户">
          <span>{{ rebindForm.memberNickname || rebindForm.memberMobile || rebindForm.memberId }}</span>
        </el-form-item>
        <el-form-item label="新分销员" prop="distributionId">
          <div class="distributor-picker">
            <el-input
              :model-value="selectedDistributorLabel"
              placeholder="请选择分销员"
              readonly
            />
            <el-button type="primary" plain @click="distributorSelectorVisible = true">选择分销员</el-button>
            <el-button v-if="rebindForm.distributionId" link type="primary" @click="clearSelectedDistributor">清除</el-button>
          </div>
        </el-form-item>
        <el-form-item label="换绑原因" prop="reason">
          <el-input v-model="rebindForm.reason" type="textarea" :rows="3" placeholder="请输入换绑原因" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="rebindVisible = false">取消</el-button>
        <el-button type="primary" :loading="rebindLoading" @click="submitRebind">确定</el-button>
      </template>
    </el-drawer>

    <distribution-selector
      v-model="distributorSelectorVisible"
      :exclude-id="rebindForm.currentDistributionId"
      @confirm="onDistributorSelected"
    />

    <el-drawer
      v-model="unbindVisible"
      title="解绑客户关系"
      size="520px"
      :close-on-click-modal="false"
      destroy-on-close
      append-to-body
    >
      <el-form ref="unbindFormRef" :model="unbindForm" label-width="110px">
        <el-form-item label="客户">
          <span>{{ unbindForm.memberNickname || unbindForm.memberMobile || unbindForm.memberId }}</span>
        </el-form-item>
        <el-form-item label="解绑原因">
          <el-input v-model="unbindForm.reason" type="textarea" :rows="3" placeholder="请输入解绑原因" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="unbindVisible = false">取消</el-button>
        <el-button type="primary" :loading="unbindLoading" @click="submitUnbind">确定</el-button>
      </template>
    </el-drawer>
  </div>
</template>

<script setup>
import { computed, nextTick, onMounted, reactive, ref, watch } from "vue";
import { useRoute } from "vue-router";
import {
  getCustomerRelationDetail,
  getCustomerRelationLogs,
  getCustomerRelations,
  rebindCustomerRelation,
  unbindCustomerRelation,
} from "@/api/distribution";
import { relationEffectiveList, hasDeadlineList } from "./dataJson.js";
import DistributionSelector from "@/components/distribution/distribution-selector.vue";
import { QuestionFilled } from "@element-plus/icons-vue";
import { Message } from "@/utils/message";
import { unixToDate } from "@/utils/filters";

defineOptions({ name: "distributionCustomerRelation" });

const route = useRoute();

const searchFormRef = ref(null);
const rebindFormRef = ref(null);
const unbindFormRef = ref(null);

const bindTimeRange = ref([]);
const loading = ref(true);
const searchForm = reactive({
  pageNumber: 1,
  pageSize: 20,
  memberMobile: "",
  distributionMobile: "",
  distributionId: "",
  relationEffective: "",
  hasDeadline: "",
});
const data = ref([]);
const total = ref(0);
const detailVisible = ref(false);
const detailLoading = ref(false);
const detail = ref(null);
const logVisible = ref(false);
const logLoading = ref(false);
const logList = ref([]);
const logTarget = ref(null);
const rebindVisible = ref(false);
const distributorSelectorVisible = ref(false);
const unbindVisible = ref(false);
const rebindLoading = ref(false);
const unbindLoading = ref(false);
const rebindForm = ref({
  memberId: "",
  memberNickname: "",
  memberMobile: "",
  currentDistributionId: "",
  distributionId: "",
  distributionNickname: "",
  distributionMobile: "",
  reason: "",
});
const unbindForm = ref({
  memberId: "",
  memberNickname: "",
  memberMobile: "",
  reason: "",
});
const rebindRules = reactive({
  distributionId: [{
    required: true,
    message: "请选择分销员",
    trigger: "change",
  }],
});

const selectedDistributorLabel = computed(() => {
  if (!rebindForm.value.distributionId) return "";
  const name = rebindForm.value.distributionNickname || "-";
  const mobile = rebindForm.value.distributionMobile || "-";
  return `${name}（${mobile}）`;
});

watch(
  () => route.query,
  () => {
    applyRouteQuery();
    getDataList();
  }
);

onMounted(() => {
  applyRouteQuery();
  getDataList();
});

function applyRouteQuery() {
  const query = route.query || {};
  searchForm.distributionId = query.distributionId ? String(query.distributionId) : "";
  searchForm.distributionMobile = query.distributionMobile ? String(query.distributionMobile) : "";
}
function formatInvalidTime(row) {
  return row?.invalidTime || "-";
}
function formatDetailInvalidTime(detail) {
  if (!detail || isRelationEffective(detail)) return "-";
  return detail.invalidTime || "-";
}
function formatDetailInvalidReason(detail) {
  if (!detail || isRelationEffective(detail)) return "-";
  return detail.invalidReason || "客户关系失效";
}
function isRelationEffective(row) {
  if (!row) return false;
  if (row.relationEffective === true) return true;
  if (row.relationEffective === false) return false;
  return !["EXPIRED", "UNBOUND"].includes(row.relationStatus);
}
function changePage() {
  getDataList();
}
function changePageSize() {
  searchForm.pageNumber = 1;
  getDataList();
}
function handleSearch() {
  searchForm.pageNumber = 1;
  getDataList();
}
function getDataList() {
  loading.value = true;
  const params = { ...searchForm };
  if (!params.memberMobile) delete params.memberMobile;
  if (!params.distributionMobile) delete params.distributionMobile;
  if (!params.distributionId) delete params.distributionId;
  if (params.relationEffective === "" || params.relationEffective === null || params.relationEffective === undefined) {
    delete params.relationEffective;
  } else {
    params.relationEffective = params.relationEffective === true || params.relationEffective === "true";
  }
  if (params.hasDeadline === "" || params.hasDeadline === null || params.hasDeadline === undefined) {
    delete params.hasDeadline;
  } else {
    params.hasDeadline = params.hasDeadline === true || params.hasDeadline === "true";
  }
  if (bindTimeRange.value && bindTimeRange.value[0] && bindTimeRange.value[1]) {
    const startTime = new Date(bindTimeRange.value[0]).getTime();
    const endTime = new Date(bindTimeRange.value[1]).getTime();
    params.bindTimeStart = unixToDate(startTime / 1000);
    params.bindTimeEnd = unixToDate(endTime / 1000);
  }
  getCustomerRelations(params).then((res) => {
    loading.value = false;
    if (res.success) {
      data.value = res.result.records;
      total.value = res.result.total;
    }
  });
}
function openDetail(row) {
  detailVisible.value = true;
  detailLoading.value = true;
  detail.value = null;
  getCustomerRelationDetail(row.id).then((res) => {
    detailLoading.value = false;
    if (res.success) {
      detail.value = res.result;
    }
  }).catch(() => {
    detailLoading.value = false;
  });
}
function openLogs(row) {
  logVisible.value = true;
  logTarget.value = row;
  logLoading.value = true;
  logList.value = [];
  getCustomerRelationLogs(row.id).then((res) => {
    logLoading.value = false;
    if (res.success) {
      logList.value = res.result || [];
    }
  }).catch(() => {
    logLoading.value = false;
  });
}
function formatDistributorCell(nickname, mobile, id) {
  if ((!nickname || nickname === "-") && !id) return "-";
  const name = nickname && nickname !== "-" ? nickname : id;
  if (mobile) return `${name}\n${mobile}`;
  return name;
}
function openRebind(row) {
  rebindForm.value = {
    memberId: row.memberId,
    memberNickname: row.memberNickname,
    memberMobile: row.memberMobile,
    currentDistributionId: row.distributionId || "",
    distributionId: "",
    distributionNickname: "",
    distributionMobile: "",
    reason: "",
  };
  rebindVisible.value = true;
}
function onDistributorSelected(row) {
  rebindForm.value.distributionId = row.id;
  rebindForm.value.distributionNickname = row.nickname;
  rebindForm.value.distributionMobile = row.mobile;
  nextTick(() => {
    rebindFormRef.value?.validateField("distributionId");
  });
}
function clearSelectedDistributor() {
  rebindForm.value.distributionId = "";
  rebindForm.value.distributionNickname = "";
  rebindForm.value.distributionMobile = "";
  nextTick(() => {
    rebindFormRef.value?.validateField("distributionId");
  });
}
function openUnbind(row) {
  unbindForm.value = {
    memberId: row.memberId,
    memberNickname: row.memberNickname,
    memberMobile: row.memberMobile,
    reason: "",
  };
  unbindVisible.value = true;
}
function submitRebind() {
  rebindFormRef.value.validate((valid) => {
    if (!valid) return;
    if (rebindForm.value.distributionId === rebindForm.value.currentDistributionId) {
      Message.warning("新分销员不能与当前分销员相同");
      return;
    }
    rebindLoading.value = true;
    rebindCustomerRelation({
      memberId: rebindForm.value.memberId,
      distributionId: rebindForm.value.distributionId,
      reason: rebindForm.value.reason,
    }).then((res) => {
      rebindLoading.value = false;
      if (res.success) {
        Message.success("操作成功");
        rebindVisible.value = false;
        getDataList();
      }
    }).catch(() => {
      rebindLoading.value = false;
    });
  });
}
function submitUnbind() {
  unbindLoading.value = true;
  unbindCustomerRelation({
    memberId: unbindForm.value.memberId,
    reason: unbindForm.value.reason,
  }).then((res) => {
    unbindLoading.value = false;
    if (res.success) {
      Message.success("操作成功");
      unbindVisible.value = false;
      getDataList();
    }
  }).catch(() => {
    unbindLoading.value = false;
  });
}
</script>

<style scoped lang="scss">
.ops a {
  color: #2d8cf0;
  cursor: pointer;
  text-decoration: none;
}

.ops .op-split {
  display: inline-block;
  margin: 0 6px;
  color: #dcdee2;
}

.distributor-picker {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
}

.distributor-picker .el-input {
  flex: 1;
}

.relation-status-cell {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.relation-effective {
  color: #19be6b;
}

.relation-invalid {
  color: #999;
}

.relation-tip-icon {
  color: #909399;
  font-size: 14px;
  cursor: pointer;
}

.detail-body {
  padding: 0 8px 16px;
}

.detail-meta-row {
  display: flex;
  margin-bottom: 10px;
  line-height: 22px;
}

.detail-meta-label {
  flex: 0 0 120px;
  color: #909399;
}

.detail-meta-value {
  flex: 1;
  color: #303133;
  word-break: break-all;
}

.log-body {
  padding: 0 8px 16px;
}

.log-distributor-cell,
.log-reason-cell {
  white-space: pre-wrap;
  word-break: break-word;
  line-height: 22px;
}
</style>
