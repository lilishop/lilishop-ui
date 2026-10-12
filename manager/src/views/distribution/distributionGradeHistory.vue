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

    <el-card>
      <el-table v-loading="loading" border :data="data" class="mt_10" style="width: 100%">
        <el-table-column prop="distributionId" label="分销员ID" min-width="200" class-name="id-column" show-overflow-tooltip />
        <el-table-column prop="memberName" label="分销员昵称" min-width="120" show-overflow-tooltip />
        <el-table-column prop="memberMobile" label="分销员手机号" min-width="130" />
        <el-table-column label="变更前等级" min-width="140" show-overflow-tooltip>
          <template #default="{ row }">
            <span v-if="row">{{ formatGrade(row.previousGradeName, row.previousGradeId) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="变更后等级" min-width="140" show-overflow-tooltip>
          <template #default="{ row }">
            <span v-if="row">{{ formatGrade(row.gradeName, row.gradeId) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="商品佣金比例" width="130" align="right">
          <template #default="{ row }">
            <span v-if="row">{{ formatRate(row.goodsCommissionRate) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="邀请佣金比例" width="130" align="right">
          <template #default="{ row }">
            <span v-if="row">{{ formatRate(row.inviteCommissionRate) }}</span>
          </template>
        </el-table-column>
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
          @current-change="changePage"
          @size-change="changePageSize"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { getDistributionGradeHistoryPage, getDistributionGrades } from "@/api/distribution";

defineOptions({ name: "distributionGradeHistory" });

// 模板 el-form 的 ref（原 ref="searchForm"，与 data 同名会互相覆盖，改名为 searchFormRef）
const searchFormRef = ref(null);

const loading = ref(false);
const searchForm = ref({
  pageNumber: 1,
  pageSize: 20,
  memberName: "",
  distributionMobile: "",
  gradeId: "",
  upgradeTimeStart: "",
  upgradeTimeEnd: "",
});
const upgradeTimeRange = ref([]);
const gradeOptions = ref([]);
const data = ref([]);
const total = ref(0);

onMounted(() => {
  loadGradeOptions();
  getDataList();
});

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
function applyUpgradeTimeRange() {
  if (upgradeTimeRange.value && upgradeTimeRange.value.length === 2) {
    searchForm.value.upgradeTimeStart = `${upgradeTimeRange.value[0]} 00:00:00`;
    searchForm.value.upgradeTimeEnd = `${upgradeTimeRange.value[1]} 23:59:59`;
  } else {
    searchForm.value.upgradeTimeStart = "";
    searchForm.value.upgradeTimeEnd = "";
  }
}
function handleSearch() {
  searchForm.value.pageNumber = 1;
  getDataList();
}
function handleReset() {
  searchForm.value = {
    pageNumber: 1,
    pageSize: 20,
    memberName: "",
    distributionMobile: "",
    gradeId: "",
    upgradeTimeStart: "",
    upgradeTimeEnd: "",
  };
  upgradeTimeRange.value = [];
  getDataList();
}
function changePage() {
  getDataList();
}
function changePageSize() {
  searchForm.value.pageNumber = 1;
  getDataList();
}
function getDataList() {
  applyUpgradeTimeRange();
  loading.value = true;
  getDistributionGradeHistoryPage(searchForm.value)
    .then((res) => {
      loading.value = false;
      if (res.success) {
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
.search-form {
  margin-bottom: 0;
}
</style>
