<template>
  <div class="search">
    <el-card>
      <el-form
        ref="searchForm"
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

<script>
import { getDistributionGradeHistoryPage, getDistributionGrades } from "@/api/distribution";

export default {
  name: "distributionGradeHistory",
  data() {
    return {
      loading: false,
      searchForm: {
        pageNumber: 1,
        pageSize: 20,
        memberName: "",
        distributionMobile: "",
        gradeId: "",
        upgradeTimeStart: "",
        upgradeTimeEnd: "",
      },
      upgradeTimeRange: [],
      gradeOptions: [],
      data: [],
      total: 0,
    };
  },
  mounted() {
    this.loadGradeOptions();
    this.getDataList();
  },
  methods: {
    loadGradeOptions() {
      getDistributionGrades()
        .then((res) => {
          if (!res.success) {
            return;
          }
          this.gradeOptions = (res.result || [])
            .slice()
            .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
            .map((item) => ({
              value: String(item.sortOrder),
              label: item.gradeName || `等级值${item.sortOrder}`,
            }));
        });
    },
    formatGrade(name, gradeId) {
      if (name) {
        return name;
      }
      if (gradeId) {
        return `等级值${gradeId}`;
      }
      return "-";
    },
    formatRate(value) {
      const num = Number(value);
      if (!Number.isFinite(num)) {
        return "-";
      }
      return `${(num * 100).toFixed(2).replace(/\.?0+$/, "") || "0"}%`;
    },
    applyUpgradeTimeRange() {
      if (this.upgradeTimeRange && this.upgradeTimeRange.length === 2) {
        this.searchForm.upgradeTimeStart = `${this.upgradeTimeRange[0]} 00:00:00`;
        this.searchForm.upgradeTimeEnd = `${this.upgradeTimeRange[1]} 23:59:59`;
      } else {
        this.searchForm.upgradeTimeStart = "";
        this.searchForm.upgradeTimeEnd = "";
      }
    },
    handleSearch() {
      this.searchForm.pageNumber = 1;
      this.getDataList();
    },
    handleReset() {
      this.searchForm = {
        pageNumber: 1,
        pageSize: 20,
        memberName: "",
        distributionMobile: "",
        gradeId: "",
        upgradeTimeStart: "",
        upgradeTimeEnd: "",
      };
      this.upgradeTimeRange = [];
      this.getDataList();
    },
    changePage() {
      this.getDataList();
    },
    changePageSize() {
      this.searchForm.pageNumber = 1;
      this.getDataList();
    },
    getDataList() {
      this.applyUpgradeTimeRange();
      this.loading = true;
      getDistributionGradeHistoryPage(this.searchForm)
        .then((res) => {
          this.loading = false;
          if (res.success) {
            this.data = res.result.records || [];
            this.total = res.result.total || 0;
          }
        })
        .catch(() => {
          this.loading = false;
        });
    },
  },
};
</script>

<style scoped>
.search-form {
  margin-bottom: 0;
}
</style>
