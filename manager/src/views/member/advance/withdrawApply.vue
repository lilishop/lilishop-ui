<template>
  <div class="member-withdraw-apply-page search">
    <!-- 顶部筛选表单 -->
    <el-card shadow="never" class="filter-card">
      <el-form
        ref="searchFormRef"
        :model="searchForm"
        inline
        label-width="76px"
        class="search-form"
        @keyup.enter="handleSearch"
      >
        <el-form-item label="客户ID" prop="memberId">
          <el-input
            v-model="searchForm.memberId"
            placeholder="请输入客户ID"
            clearable
            style="width: 180px"
          />
        </el-form-item>
        <el-form-item label="客户名称" prop="memberName">
          <el-input
            v-model="searchForm.memberName"
            placeholder="请输入客户名称"
            clearable
            style="width: 160px"
          />
        </el-form-item>
        <el-form-item label="申请编号" prop="sn">
          <el-input
            v-model="searchForm.sn"
            placeholder="请输入申请编号"
            clearable
            style="width: 180px"
          />
        </el-form-item>
        <el-form-item label="提现状态" prop="applyStatus">
          <el-select
            v-model="searchForm.applyStatus"
            placeholder="全部状态"
            clearable
            style="width: 130px"
          >
            <el-option label="全部" value="" />
            <el-option label="申请中" value="APPLY" />
            <el-option label="审核通过" value="VIA_AUDITING" />
            <el-option label="提现成功" value="SUCCESS" />
            <el-option label="用户确认" value="WAIT_USER_CONFIRM" />
            <el-option label="审核拒绝" value="FAIL_AUDITING" />
            <el-option label="提现失败" value="ERROR" />
          </el-select>
        </el-form-item>
        <el-form-item label="申请时间">
          <el-date-picker
            v-model="selectDate"
            type="datetimerange"
            value-format="YYYY-MM-DD HH:mm:ss"
            clearable
            range-separator="至"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
            style="width: 320px"
            @change="selectDateRange"
          />
        </el-form-item>
        <el-form-item class="form-actions">
          <el-button type="primary" class="search-btn" @click="handleSearch">
            搜索
          </el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 提现申请数据表格 -->
    <el-card shadow="never" class="table-card mt_10">
      <template #header>
        <div class="card-header-bar">
          <div class="header-title">
            <span>会员提现申请</span>
          </div>
          <div class="header-actions">
            <el-button size="small" @click="getDataList">刷新</el-button>
          </div>
        </div>
      </template>

      <el-table
        ref="table"
        v-loading="loading"
        border
        stripe
        :data="data"
        style="width: 100%"
        @sort-change="changeSort"
      >
        <!-- 客户ID -->
        <el-table-column prop="memberId" label="客户ID" min-width="170" show-overflow-tooltip />

        <!-- 客户名称 -->
        <el-table-column prop="memberName" label="客户名称" min-width="140" show-overflow-tooltip />

        <!-- 申请编号 -->
        <el-table-column prop="sn" label="申请编号" min-width="180" show-overflow-tooltip />

        <!-- 申请提现金额 -->
        <el-table-column label="申请金额" width="130" align="right" sortable="custom" prop="applyMoney">
          <template #default="{ row }">
            <span v-if="row">¥ {{ formatMoney(row.applyMoney) }}</span>
          </template>
        </el-table-column>

        <!-- 提现状态 -->
        <el-table-column label="提现状态" width="120" align="center">
          <template #default="{ row }">
            {{ row ? applyStatusText(row.applyStatus) : "-" }}
          </template>
        </el-table-column>

        <!-- 申请时间 -->
        <el-table-column prop="createTime" label="申请时间" width="170" align="center" sortable="custom" />

        <!-- 审核时间 -->
        <el-table-column prop="inspectTime" label="审核时间" width="170" align="center" />

        <!-- 操作 -->
        <el-table-column label="操作" width="160" align="center" fixed="right">
          <template #default="{ row }">
            <template v-if="row">
              <a v-if="row.applyStatus === 'APPLY'" class="link-text" @click="openAudit(row)">审核</a>
              <a v-else class="link-text" @click="openQuery(row)">查看</a>
              <template v-if="row.memberId">
                <span class="op-split">|</span>
                <a class="link-text" @click="viewMemberDetail(row)">客户详情</a>
              </template>
            </template>
          </template>
        </el-table-column>
      </el-table>

      <!-- 底部分页 -->
      <div class="pagination-wrap mt_10">
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

    <!-- 审核弹窗 -->
    <el-dialog
      v-model="roleModalVisible"
      title="提现申请审核"
      width="520px"
      :close-on-click-modal="false"
      destroy-on-close
    >
      <div class="dialog-body">
        <el-descriptions :column="1" border size="small" class="custom-dialog-descriptions">
          <el-descriptions-item label="申请编号">
            <span class="font-mono">{{ showList.sn }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="客户ID">
            <span class="font-mono">{{ showList.memberId || "-" }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="客户名称">
            <span class="font-semibold">{{ showList.memberName }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="申请金额">
            <span class="money-text font-semibold">¥ {{ formatMoney(showList.applyMoney) }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="申请时间">
            <span>{{ showList.createTime }}</span>
          </el-descriptions-item>
        </el-descriptions>

        <div class="remark-form-item" style="margin-top: 14px">
          <div class="remark-label" style="font-size: 13px; color: #606266; margin-bottom: 6px">
            审核备注说明（拒绝时必填）：
          </div>
          <el-input
            v-model="audit"
            type="textarea"
            :rows="3"
            maxlength="200"
            show-word-limit
            placeholder="请输入审核备注说明..."
          />
        </div>
      </div>
      <template #footer>
        <el-button @click="roleModalVisible = false">取消</el-button>
        <el-button
          type="danger"
          :loading="submitLoading"
          @click="submitRole(false)"
        >
          拒绝
        </el-button>
        <el-button
          type="primary"
          :loading="submitLoading"
          @click="submitRole(true)"
        >
          通过
        </el-button>
      </template>
    </el-dialog>

    <!-- 查看详情弹窗 -->
    <el-dialog
      v-model="queryModalVisible"
      title="提现申请详情"
      width="520px"
      :close-on-click-modal="false"
      destroy-on-close
    >
      <div class="dialog-body">
        <el-descriptions :column="1" border size="small" class="custom-dialog-descriptions">
          <el-descriptions-item label="申请编号">
            <span class="font-mono">{{ showList.sn }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="客户ID">
            <span class="font-mono">{{ showList.memberId || "-" }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="客户名称">
            <span class="font-semibold">{{ showList.memberName }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="申请金额">
            <span class="money-text font-semibold">¥ {{ formatMoney(showList.applyMoney) }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="提现状态">
            <el-tag :type="applyStatusTagType(showList.applyStatus)" size="small">
              {{ paramTypeFilter(showList.applyStatus) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="申请时间">
            <span>{{ showList.createTime }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="审核时间">
            <span>{{ showList.inspectTime || "-" }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="审核备注">
            <span>{{ showList.inspectRemark || "暂无备注" }}</span>
          </el-descriptions-item>
        </el-descriptions>
      </div>
      <template #footer>
        <el-button @click="queryModalVisible = false">关 闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import { useTable } from "@/utils/useTable";
import { getUserWithdrawApply, withdrawApply } from "@/api/member";
import { customRouterPush } from "@/utils/filters";
import { ElMessage } from "element-plus";

defineOptions({ name: "withdrawApply" });

const route = useRoute();
const searchFormRef = ref(null);
const table = ref(null);
const selectDate = ref(null);

const audit = ref("");
const roleModalVisible = ref(false);
const queryModalVisible = ref(false);
const submitLoading = ref(false);
const showList = ref({});

const { loading, data, total, searchForm, getDataList, handleSearch, resetSearch } = useTable(
  getUserWithdrawApply,
  {
    pageSize: 20,
    immediate: false,
    form: {
      sort: "createTime",
      order: "desc",
      memberId: "",
      memberName: "",
      sn: "",
      applyStatus: "",
      startDate: "",
      endDate: "",
    },
    beforeRequest: (p) => {
      const params = { ...p };
      if (selectDate.value && selectDate.value.length === 2) {
        params.startDate = selectDate.value[0];
        params.endDate = selectDate.value[1];
      } else {
        params.startDate = "";
        params.endDate = "";
      }
      return params;
    },
  }
);

function formatMoney(val) {
  const num = Number(val || 0);
  return num.toFixed(2);
}

function viewMemberDetail(row) {
  if (!row || !row.memberId) return;
  customRouterPush({ name: "member-detail", query: { id: row.memberId } });
}

function paramTypeFilter(val) {
  if (val === "APPLY") return "申请中";
  if (val === "VIA_AUDITING") return "审核通过(提现成功)";
  if (val === "WAIT_USER_CONFIRM") return "用户确认";
  if (val === "FAIL_AUDITING") return "审核拒绝";
  if (val === "SUCCESS") return "提现成功";
  if (val === "ERROR") return "提现失败";
  return val || "未知状态";
}

function applyStatusText(status) {
  if (status === "APPLY") return "申请中";
  if (status === "VIA_AUDITING") return "审核通过";
  if (status === "WAIT_USER_CONFIRM") return "用户确认";
  if (status === "SUCCESS") return "提现成功";
  if (status === "ERROR") return "提现失败";
  if (status === "FAIL_AUDITING") return "审核拒绝";
  return status || "-";
}

function applyStatusTagType(status) {
  if (status === "APPLY") return "warning";
  if (status === "VIA_AUDITING") return "success";
  if (status === "WAIT_USER_CONFIRM") return "warning";
  if (status === "SUCCESS") return "primary";
  if (status === "ERROR") return "danger";
  return "danger";
}

function openAudit(row) {
  showList.value = { ...row };
  audit.value = "";
  roleModalVisible.value = true;
}

function openQuery(row) {
  showList.value = { ...row };
  queryModalVisible.value = true;
}

function submitRole(res) {
  const params = {
    applyId: showList.value.id,
    result: res,
    remark: audit.value ? audit.value.trim() : "",
  };
  if (res === false && !params.remark) {
    ElMessage.error("审核拒绝时备注说明不能为空");
    return;
  }
  submitLoading.value = true;
  withdrawApply(params)
    .then((result) => {
      const success = result === true || (result && result.success === true);
      if (success) {
        ElMessage.success("操作成功");
        roleModalVisible.value = false;
        queryModalVisible.value = false;
        audit.value = "";
        showList.value = {};
        getDataList();
      }
    })
    .finally(() => {
      submitLoading.value = false;
    });
}

function handleReset() {
  selectDate.value = null;
  searchForm.memberId = "";
  searchForm.memberName = "";
  searchForm.sn = "";
  searchForm.applyStatus = "";
  searchForm.startDate = "";
  searchForm.endDate = "";
  searchForm.pageNumber = 1;
  resetSearch();
}

function changeSort(e) {
  searchForm.sort = e.prop || e.key || "createTime";
  searchForm.order = e.order === "ascending" ? "asc" : e.order === "descending" ? "desc" : "";
  getDataList();
}

function changePage(v) {
  searchForm.pageNumber = v;
  getDataList();
}

function changePageSize(v) {
  searchForm.pageNumber = 1;
  searchForm.pageSize = v;
  getDataList();
}

function selectDateRange(v) {
  if (v && v.length === 2) {
    searchForm.startDate = v[0];
    searchForm.endDate = v[1];
  } else {
    searchForm.startDate = "";
    searchForm.endDate = "";
  }
}

onMounted(() => {
  if (route.query && route.query.applyStatus) {
    searchForm.applyStatus = route.query.applyStatus;
  }
  getDataList();
});
</script>

<style lang="scss" scoped>
.member-withdraw-apply-page {
  padding: 16px 20px;
  background-color: #f6f8fa;
  min-height: calc(100vh - 110px);
}

.font-mono {
  font-family: SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
}

.font-semibold {
  font-weight: 600;
}

.text-dark {
  color: #303133;
}

.text-muted {
  color: #909399;
}

/* 筛选卡片 */
.filter-card {
  border-radius: 8px;
  border: 1px solid #ebeef5;

  :deep(.el-card__body) {
    padding: 16px 16px 2px;
  }

  .search-form {
    display: flex;
    flex-wrap: wrap;
    align-items: center;

    .el-form-item {
      margin-bottom: 14px;
      margin-right: 16px;
    }

    .form-actions {
      margin-left: auto;
    }
  }
}

/* 表格卡片 */
.table-card {
  border-radius: 8px;
  border: 1px solid #ebeef5;

  .card-header-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .header-title {
      font-size: 15px;
      font-weight: 600;
      color: #303133;
    }
  }
}

.custom-dialog-descriptions {
  :deep(.el-descriptions__label) {
    width: 100px;
    background-color: #fafafa;
    color: #606266;
  }

  .money-text {
    font-size: 15px;
    color: #f56c6c;
  }
}

.pagination-wrap {
  display: flex;
  justify-content: flex-end;
  padding-top: 6px;
}
</style>
