<template>
  <div class="member-experience-log-page search">
    <!-- 顶部筛选表单 -->
    <el-card shadow="never" class="filter-card">
      <el-form
        ref="searchFormRef"
        :model="searchForm"
        inline
        label-width="84px"
        class="search-form"
        @keyup.enter="handleSearch"
      >
        <el-form-item label="客户手机号" prop="memberMobile">
          <el-input
            v-model="searchForm.memberMobile"
            clearable
            placeholder="请输入客户手机号"
            style="width: 200px"
          />
        </el-form-item>
        <el-form-item label="规则类型" prop="ruleKey">
          <el-select
            v-model="searchForm.ruleKey"
            clearable
            filterable
            placeholder="全部规则"
            style="width: 180px"
          >
            <el-option label="全部规则" value="" />
            <el-option
              v-for="item in ruleOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item class="form-actions">
          <el-button type="primary" class="search-btn" @click="handleSearch">
            搜索
          </el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 经验值记录表格 -->
    <el-card shadow="never" class="table-card mt_10">
      <template #header>
        <div class="card-header-bar">
          <div class="header-title">
            <span>客户经验值流水</span>
          </div>
          <div class="header-actions">
            <el-button size="small" @click="getData">刷新</el-button>
          </div>
        </div>
      </template>

      <el-table
        v-loading="loading"
        border
        stripe
        :data="data"
        style="width: 100%"
      >
        <!-- 客户ID -->
        <el-table-column prop="memberId" label="客户ID" min-width="190" show-overflow-tooltip />

        <!-- 客户名称 -->
        <el-table-column prop="memberName" label="客户名称" min-width="130" show-overflow-tooltip />

        <!-- 客户手机号 -->
        <el-table-column label="客户手机号" width="130" align="center">
          <template #default="{ row }">
            {{ row ? (row.memberMobile || row.mobile || "-") : "-" }}
          </template>
        </el-table-column>

        <!-- 规则名称 -->
        <el-table-column label="规则名称" width="130" align="center">
          <template #default="{ row }">
            {{ row ? (row.ruleName || findRuleName(row.ruleKey) || "-") : "-" }}
          </template>
        </el-table-column>

        <!-- 变动前经验值 -->
        <el-table-column label="变动前经验值" width="120" align="right">
          <template #default="{ row }">
            <span v-if="row">{{ row.beforeExperience != null ? formatNumber(row.beforeExperience) : "-" }}</span>
          </template>
        </el-table-column>

        <!-- 变动经验值 -->
        <el-table-column label="变动经验值" width="120" align="right">
          <template #default="{ row }">
            <span v-if="row" class="experience-increase">
              +{{ formatNumber(row.variableExperience ?? row.value ?? 0) }}
            </span>
          </template>
        </el-table-column>

        <!-- 当前经验值 -->
        <el-table-column label="变动后经验值" width="120" align="right">
          <template #default="{ row }">
            <span v-if="row" class="experience-after">
              {{ formatNumber(row.experience ?? 0) }}
            </span>
          </template>
        </el-table-column>

        <!-- 操作说明 / 备注 -->
        <el-table-column label="操作说明" min-width="200" show-overflow-tooltip>
          <template #default="{ row }">
            <span>{{ row ? row.content || row.remark || row.description || "-" : "-" }}</span>
          </template>
        </el-table-column>

        <!-- 创建时间 -->
        <el-table-column prop="createTime" label="创建时间" width="170" align="center" />

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
import * as API_Member from "@/api/member";
import { customRouterPush } from "@/utils/filters";
import { ElMessage } from "element-plus";

const ruleOptions = [
  { value: "CONSUME", label: "消费" },
  { value: "REGISTER", label: "注册" },
  { value: "SIGN_IN", label: "签到" },
  { value: "COMMENT", label: "评价" },
  { value: "SHARE", label: "分享商城" },
  { value: "PROFILE", label: "完善信息" },
  { value: "FOLLOW_STORE", label: "关注店铺" },
  { value: "BIND_WECHAT", label: "绑定微信" },
  { value: "ADD_ADDRESS", label: "添加收货地址" },
  { value: "SHARE_REGISTER", label: "分享注册" },
  { value: "SHARE_BUY", label: "分享购买" },
];

defineOptions({ name: "memberGradeExperienceLog" });

const searchFormRef = ref(null);

const { loading, data, total, searchForm, getDataList: getData, resetSearch } = useTable(
  API_Member.getMemberExperienceByPage,
  {
    pageSize: 20,
    immediate: false,
    form: { memberMobile: "", ruleKey: "" },
    beforeRequest: buildParams,
  }
);

function formatNumber(val) {
  const num = Number(val || 0);
  return num.toLocaleString();
}

function findRuleName(ruleKey) {
  const hit = ruleOptions.find((item) => item.value === ruleKey);
  return hit ? hit.label : ruleKey || "";
}

function viewMemberDetail(row) {
  if (!row || !row.memberId) return;
  customRouterPush({ name: "member-detail", query: { id: row.memberId } });
}

function buildParams(base = searchForm) {
  const params = {
    pageNumber: base.pageNumber,
    pageSize: base.pageSize,
  };
  if (base.memberMobile) params.mobile = base.memberMobile.trim();
  if (base.ruleKey) params.ruleKey = base.ruleKey;
  return params;
}

function handleSearch() {
  searchForm.pageNumber = 1;
  getData();
}

function handleReset() {
  searchForm.memberMobile = "";
  searchForm.ruleKey = "";
  searchForm.pageNumber = 1;
  resetSearch();
}

function changePage(v) {
  searchForm.pageNumber = v;
  getData();
}

function changePageSize(v) {
  searchForm.pageNumber = 1;
  searchForm.pageSize = v;
  getData();
}

onMounted(() => {
  getData();
});
</script>

<style lang="scss" scoped>
.member-experience-log-page {
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

.experience-increase {
  font-size: 13px;
  color: #67c23a;
}

.experience-after {
  font-size: 13px;
  color: #e6a23c;
}

.pagination-wrap {
  display: flex;
  justify-content: flex-end;
  padding-top: 6px;
}
</style>
