<template>
  <div class="member-wallet-log-page search">
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
        <el-form-item label="变动时间">
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

    <!-- 变动记录表格 -->
    <el-card shadow="never" class="table-card mt_10">
      <template #header>
        <div class="card-header-bar">
          <div class="header-title">
            <span>预存款变动明细</span>
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
      >
        <!-- 客户ID -->
        <el-table-column prop="memberId" label="客户ID" min-width="190" show-overflow-tooltip />

        <!-- 客户名称 -->
        <el-table-column prop="memberName" label="客户名称" min-width="140" show-overflow-tooltip />

        <!-- 变动金额 -->
        <el-table-column label="变动金额" width="140" align="right" sortable prop="money">
          <template #default="{ row }">
            <template v-if="row">
              <span v-if="row.money > 0" class="money-increase">
                +¥ {{ formatMoney(row.money) }}
              </span>
              <span v-else-if="row.money < 0" class="money-decrease">
                -¥ {{ formatMoney(Math.abs(row.money)) }}
              </span>
              <span v-else class="money-zero">
                ¥ 0.00
              </span>
            </template>
          </template>
        </el-table-column>

        <!-- 业务类型 -->
        <el-table-column label="业务类型" width="120" align="center">
          <template #default="{ row }">
            {{ row ? serviceTypeText(row.serviceType) : "-" }}
          </template>
        </el-table-column>

        <!-- 日志详细说明 -->
        <el-table-column prop="detail" label="变动说明" min-width="260" show-overflow-tooltip />

        <!-- 变动时间 -->
        <el-table-column prop="createTime" label="变动时间" width="170" align="center" />

        <!-- 操作 -->
        <el-table-column label="操作" width="110" align="center" fixed="right">
          <template #default="{ row }">
            <template v-if="row">
              <a v-if="row.memberId" class="link-text" @click="viewMemberDetail(row)">客户详情</a>
              <span v-else>-</span>
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
  </div>
</template>

<script setup>
import { onMounted, ref } from "vue";
import { useTable } from "@/utils/useTable";
import { getUserWallet } from "@/api/member";
import { customRouterPush } from "@/utils/filters";
import { ElMessage } from "element-plus";

defineOptions({ name: "walletLog" });

const searchFormRef = ref(null);
const table = ref(null);
const selectDate = ref(null);

const { loading, data, total, searchForm, getDataList, handleSearch, resetSearch } = useTable(
  getUserWallet,
  {
    pageSize: 20,
    immediate: false,
    form: {
      sort: "createTime",
      order: "desc",
      memberId: "",
      memberName: "",
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

function serviceTypeText(type) {
  if (type === "WALLET_WITHDRAWAL") return "余额提现";
  if (type === "WALLET_PAY") return "余额支付";
  if (type === "WALLET_REFUND") return "余额退款";
  if (type === "WALLET_RECHARGE") return "余额充值";
  return "佣金提成";
}

function getServiceTagType(type) {
  if (type === "WALLET_RECHARGE") return "success";
  if (type === "WALLET_REFUND") return "primary";
  if (type === "WALLET_PAY") return "warning";
  if (type === "WALLET_WITHDRAWAL") return "danger";
  return "info";
}

function formatMoney(val) {
  const num = Number(val || 0);
  return num.toFixed(2);
}

function viewMemberDetail(row) {
  if (!row || !row.memberId) return;
  customRouterPush({ name: "member-detail", query: { id: row.memberId } });
}

function handleReset() {
  selectDate.value = null;
  searchForm.memberId = "";
  searchForm.memberName = "";
  searchForm.startDate = "";
  searchForm.endDate = "";
  searchForm.pageNumber = 1;
  resetSearch();
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
  getDataList();
});
</script>

<style lang="scss" scoped>
.member-wallet-log-page {
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

.money-increase {
  font-size: 14px;
  color: #67c23a;
}

.money-decrease {
  font-size: 14px;
  color: #f56c6c;
}

.money-zero {
  font-size: 14px;
}

.pagination-wrap {
  display: flex;
  justify-content: flex-end;
  padding-top: 6px;
}
</style>
