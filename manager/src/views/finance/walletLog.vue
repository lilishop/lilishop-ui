<template>
  <div class="finance-wallet-log-page search">
    <el-card shadow="never" class="filter-card">
      <el-form inline class="search-form" @keyup.enter="handleSearch">
        <el-form-item label="客户ID">
          <el-input v-model="searchForm.memberId" placeholder="请输入客户ID" clearable style="width: 180px" />
        </el-form-item>
        <el-form-item label="会员名称">
          <el-input v-model="searchForm.memberName" placeholder="请输入会员名称" clearable style="width: 160px" />
        </el-form-item>
        <el-form-item label="日期范围">
          <el-date-picker v-model="dateRange" type="daterange" value-format="YYYY-MM-DD" style="width: 240px" />
        </el-form-item>
        <el-form-item class="form-actions">
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
          <el-button @click="handleExport">导出</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card shadow="never" class="table-card mt_10">
      <template #header>
        <div class="card-header-bar">
          <div class="header-title">
            <span>钱包流水明细</span>
          </div>
          <div class="header-actions">
            <el-button size="small" @click="getDataList">刷新</el-button>
          </div>
        </div>
      </template>

      <el-table v-loading="loading" border stripe :data="data">
        <el-table-column prop="memberId" label="客户ID" min-width="190" show-overflow-tooltip />
        <el-table-column prop="memberName" label="会员名称" min-width="140" show-overflow-tooltip />
        <el-table-column prop="money" label="金额" width="130" align="right">
          <template #default="{ row }">
            <span v-if="row" :class="row.money >= 0 ? 'money-increase' : 'money-decrease'">
              {{ row.money >= 0 ? '+' : '' }}¥ {{ Number(row.money || 0).toFixed(2) }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="serviceType" label="业务类型" width="130" align="center">
          <template #default="{ row }">
            {{ row ? row.serviceType || "-" : "-" }}
          </template>
        </el-table-column>
        <el-table-column prop="detail" label="明细" min-width="240" show-overflow-tooltip />
        <el-table-column prop="createTime" label="时间" width="170" align="center" />
      </el-table>

      <div class="pagination-wrap mt_10">
        <el-pagination
          v-model:current-page="searchForm.pageNumber"
          v-model:page-size="searchForm.pageSize"
          :total="total"
          layout="total, prev, pager, next"
          size="small"
          @current-change="getDataList"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useTable } from "@/utils/useTable";
import * as API_Finance from "@/api/finance";
import { getRequest } from "@/libs/axios";
import { downloadBlob } from "@/utils/downloadBlob";
import { ElMessage } from "element-plus";

defineOptions({ name: "finance-wallet-log" });

const dateRange = ref([]);
const { loading, data, total, searchForm, getDataList, handleSearch, resetSearch } = useTable(
  (p) => getRequest("/wallet/log", p),
  {
    pageSize: 20,
    form: { memberId: "", memberName: "" },
    beforeRequest: (p) => {
      const params = { ...p };
      if (dateRange.value?.length === 2) {
        params.startDate = dateRange.value[0];
        params.endDate = dateRange.value[1];
      }
      return params;
    },
  }
);

function handleReset() {
  dateRange.value = [];
  searchForm.memberId = "";
  searchForm.memberName = "";
  resetSearch();
}

function handleExport() {
  const params = {
    memberId: searchForm.memberId || undefined,
    memberName: searchForm.memberName || undefined,
  };
  if (dateRange.value?.length === 2) {
    params.startDate = dateRange.value[0];
    params.endDate = dateRange.value[1];
  }
  API_Finance.exportWalletLog(params).then((blob) => {
    downloadBlob(blob, "钱包流水.xlsx");
  });
}
</script>

<style lang="scss" scoped>
.finance-wallet-log-page {
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
  color: #67c23a;
}

.money-decrease {
  color: #f56c6c;
}

.pagination-wrap {
  display: flex;
  justify-content: flex-end;
  padding-top: 6px;
}
</style>
