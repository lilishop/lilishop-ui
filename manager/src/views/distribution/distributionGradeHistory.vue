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
        <el-form-item label="分销员昵称" prop="memberName">
          <el-input
            v-model="searchForm.memberName"
            placeholder="请输入分销员昵称"
            clearable
            style="width: 200px"
          />
        </el-form-item>

        <el-form-item label="分销员手机号" prop="distributionMobile">
          <el-input
            v-model="searchForm.distributionMobile"
            placeholder="请输入分销员手机号"
            clearable
            style="width: 200px"
          />
        </el-form-item>

        <el-form-item label="变更后等级" prop="gradeId">
          <el-select v-model="searchForm.gradeId" clearable placeholder="全部" style="width: 200px">
            <el-option
              v-for="item in gradeOptions"
              :key="item.value"
              :value="item.value"
              :label="item.label"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="升级时间">
          <el-date-picker
            v-model="upgradeTimeRange"
            type="daterange"
            value-format="YYYY-MM-DD"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            placeholder="选择时间"
            style="width: 240px"
          />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" class="search-btn" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="mt_10">
      <el-table ref="table" v-loading="loading" border :data="data" style="width: 100%">
        <el-table-column prop="memberName" label="分销员昵称" min-width="120" />
        <el-table-column prop="distributionMobile" label="手机号" min-width="130" />
        <el-table-column label="变更前等级" min-width="120">
          <template #default="{ row }">
            {{ formatGrade(row.beforeGradeName, row.beforeGradeId) }}
          </template>
        </el-table-column>
        <el-table-column label="变更后等级" min-width="120">
          <template #default="{ row }">
            {{ formatGrade(row.afterGradeName, row.afterGradeId) }}
          </template>
        </el-table-column>
        <el-table-column label="佣金比例" min-width="110">
          <template #default="{ row }">
            {{ formatRate(row.commissionRate) }}
          </template>
        </el-table-column>
        <el-table-column prop="upgradeRuleDesc" label="升级原因" min-width="200" show-overflow-tooltip />
        <el-table-column prop="upgradeTime" label="升级时间" min-width="170" />
      </el-table>

      <div class="mt_10" style="display: flex; justify-content: flex-end">
        <el-pagination
          v-model:current-page="searchForm.pageNumber"
          v-model:page-size="searchForm.pageSize"
          :page-sizes="[20, 50, 100]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          size="small"
          @current-change="getDataList"
          @size-change="() => { searchForm.pageNumber = 1; getDataList(); }"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useTable } from "@/utils/useTable";
import { getDistributionGradeHistoryPage, getDistributionGrades } from "@/api/distribution";

defineOptions({ name: "distributionGradeHistory" });

const searchFormRef = ref(null);
const upgradeTimeRange = ref([]);
const gradeOptions = ref([]);

const { loading, data, total, searchForm, getDataList, handleSearch, resetSearch } = useTable(
  getDistributionGradeHistoryPage,
  {
    pageSize: 20,
    form: {
      memberName: "",
      distributionMobile: "",
      gradeId: "",
    },
    beforeRequest: (p) => {
      const params = { ...p };
      if (upgradeTimeRange.value && upgradeTimeRange.value.length === 2) {
        params.upgradeTimeStart = `${upgradeTimeRange.value[0]} 00:00:00`;
        params.upgradeTimeEnd = `${upgradeTimeRange.value[1]} 23:59:59`;
      } else {
        delete params.upgradeTimeStart;
        delete params.upgradeTimeEnd;
      }
      return params;
    },
  }
);

function handleReset() {
  upgradeTimeRange.value = [];
  resetSearch();
}

function loadGradeOptions() {
  getDistributionGrades()
    .then((res) => {
      if (!res.success) {
        return;
      }
      gradeOptions.value = (res.result || [])
        .slice()
        .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
        .map((item) => ({
          value: String(item.sortOrder),
          label: item.gradeName || `等级值${item.sortOrder}`,
        }));
    });
}

function formatGrade(name, gradeId) {
  if (name) {
    return name;
  }
  if (gradeId) {
    return `等级值${gradeId}`;
  }
  return "-";
}

function formatRate(value) {
  const num = Number(value);
  if (!Number.isFinite(num)) {
    return "-";
  }
  return `${(num * 100).toFixed(2).replace(/\.?0+$/, "") || "0"}%`;
}

onMounted(() => {
  loadGradeOptions();
});
</script>

<style scoped>
.search-form {
  margin-bottom: 0;
}
</style>
