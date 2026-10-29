<template>
  <div class="member-recharge-page search">
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
        <el-form-item label="充值单号" prop="rechargeSn">
          <el-input
            v-model="searchForm.rechargeSn"
            placeholder="请输入充值单号"
            clearable
            style="width: 190px"
          />
        </el-form-item>
        <el-form-item label="充值时间">
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

    <!-- 充值数据表格 -->
    <el-card shadow="never" class="table-card mt_10">
      <template #header>
        <div class="card-header-bar">
          <div class="header-title">
            <span>会员充值记录</span>
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
        <el-table-column prop="memberId" label="客户ID" min-width="170" show-overflow-tooltip />

        <!-- 客户名称 -->
        <el-table-column prop="memberName" label="客户名称" min-width="140" show-overflow-tooltip />

        <!-- 充值单号 -->
        <el-table-column prop="rechargeSn" label="充值单号" min-width="180" show-overflow-tooltip />

        <!-- 充值金额 -->
        <el-table-column label="充值金额" width="140" align="right" sortable prop="rechargeMoney">
          <template #default="{ row }">
            <span v-if="row" class="recharge-money-text">
              +¥ {{ formatMoney(row.rechargeMoney) }}
            </span>
          </template>
        </el-table-column>

        <!-- 充值方式 -->
        <el-table-column label="充值方式" width="120" align="center">
          <template #default="{ row }">
            {{ row ? rechargeWayText(row.rechargeWay) : "-" }}
          </template>
        </el-table-column>

        <!-- 支付状态 -->
        <el-table-column label="支付状态" width="110" align="center">
          <template #default="{ row }">
            {{ row ? (row.payStatus === "PAID" ? "已付款" : "未付款") : "-" }}
          </template>
        </el-table-column>

        <!-- 第三方流水号 -->
        <el-table-column prop="receivableNo" label="第三方流水号" min-width="180" show-overflow-tooltip />

        <!-- 充值时间 -->
        <el-table-column prop="createTime" label="充值时间" width="170" align="center" />

        <!-- 支付时间 -->
        <el-table-column prop="payTime" label="支付时间" width="170" align="center" />

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
import { getUserRecharge } from "@/api/member";
import { customRouterPush } from "@/utils/filters";
import { ElMessage } from "element-plus";

defineOptions({ name: "recharge" });

const searchFormRef = ref(null);
const table = ref(null);
const selectDate = ref(null);

const { loading, data, total, searchForm, getDataList, handleSearch, resetSearch } = useTable(
  getUserRecharge,
  {
    pageSize: 20,
    immediate: false,
    form: {
      sort: "createTime",
      order: "desc",
      memberId: "",
      memberName: "",
      rechargeSn: "",
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

function rechargeWayText(way) {
  if (way === "ALIPAY") return "支付宝";
  if (way === "WECHAT") return "微信支付";
  if (way === "BANK_TRANSFER") return "线下转账";
  return way || "-";
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
  searchForm.rechargeSn = "";
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
.member-recharge-page {
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

.recharge-money-text {
  font-size: 14px;
  color: #67c23a;
}

.pagination-wrap {
  display: flex;
  justify-content: flex-end;
  padding-top: 6px;
}
</style>
