<template>
  <div class="member-point-page search">
    <!-- 顶部数据统计概览看板 -->
    <el-card shadow="never" class="points-statistics-card">
      <el-row :gutter="24" class="points-statistics">
        <el-col :xs="24" :sm="12" class="points-statistics-item">
          <div class="stat-inner-box">
            <div class="points-statistics-title">已发放积分数</div>
            <div class="points-statistics-subtitle">平台历史累计发放积分总量</div>
            <div class="points-statistics-value">{{ formatNumber(pointsStatistics.totalPoint) }}</div>
          </div>
        </el-col>
        <el-col :xs="24" :sm="12" class="points-statistics-item">
          <div class="stat-inner-box">
            <div class="points-statistics-title">未使用积分数</div>
            <div class="points-statistics-subtitle">会员账户当前剩余未使用积分总量</div>
            <div class="points-statistics-value text-warning">{{ formatNumber(pointsStatistics.unUsedPoint) }}</div>
          </div>
        </el-col>
      </el-row>
    </el-card>

    <!-- 选项卡与数据主区域 -->
    <div class="point-tabs-wrap">
      <el-tabs v-model="activeTab" class="point-tabs">
        <!-- 选项卡 1：会员积分列表 -->
        <el-tab-pane label="会员积分列表" name="pointList">
          <!-- 筛选条件 -->
          <el-card shadow="never" class="point-filter-card">
            <el-form
              ref="memberSearchFormRef"
              :model="memberSearchForm"
              inline
              label-width="76px"
              class="search-form"
              @keyup.enter="handleMemberSearch"
            >
              <el-form-item label="客户ID" prop="id">
                <el-input
                  v-model="memberSearchForm.id"
                  placeholder="请输入客户ID"
                  clearable
                  style="width: 190px"
                />
              </el-form-item>
              <el-form-item label="客户名称" prop="nickName">
                <el-input
                  v-model="memberSearchForm.nickName"
                  placeholder="请输入客户名称"
                  clearable
                  style="width: 160px"
                />
              </el-form-item>
              <el-form-item label="客户账号" prop="username">
                <el-input
                  v-model="memberSearchForm.username"
                  placeholder="请输入客户账号"
                  clearable
                  style="width: 160px"
                />
              </el-form-item>
              <el-form-item label="账号状态" prop="disabled">
                <el-select
                  v-model="memberSearchForm.disabled"
                  clearable
                  placeholder="全部状态"
                  style="width: 130px"
                >
                  <el-option label="全部" value="" />
                  <el-option label="启用" value="OPEN" />
                  <el-option label="禁用" value="CLOSE" />
                </el-select>
              </el-form-item>
              <el-form-item label="积分区间">
                <el-input-number
                  v-model="memberSearchForm.minPoint"
                  :min="0"
                  :precision="0"
                  placeholder="最小"
                  controls-position="right"
                  style="width: 120px"
                />
                <span class="point-range-separator">-</span>
                <el-input-number
                  v-model="memberSearchForm.maxPoint"
                  :min="0"
                  :precision="0"
                  placeholder="最大"
                  controls-position="right"
                  style="width: 120px"
                />
              </el-form-item>
              <el-form-item class="form-actions">
                <el-button class="search-btn" type="primary" @click="handleMemberSearch">
                  搜索
                </el-button>
                <el-button @click="handleMemberReset">重置</el-button>
              </el-form-item>
            </el-form>
          </el-card>

          <!-- 会员积分表格 -->
          <el-card shadow="never" class="point-content-card member-list-card mt_10">
            <template #header>
              <div class="card-header-bar">
                <div class="header-title">
                  <span>会员积分信息</span>
                  <span class="total-badge">共 {{ memberTotal }} 位会员</span>
                </div>
                <div class="header-actions">
                  <el-button size="small" @click="getMemberList">刷新</el-button>
                </div>
              </div>
            </template>

            <el-table
              v-loading="memberLoading"
              border
              stripe
              :data="memberData"
              class="custom-point-table"
              style="width: 100%"
            >
              <!-- 客户ID -->
              <el-table-column label="客户ID" min-width="170">
                <template #default="{ row }">
                  <span v-if="row" class="font-mono text-dark">{{ row.id || "-" }}</span>
                </template>
              </el-table-column>

              <!-- 客户名称 -->
              <el-table-column label="客户名称" min-width="160" show-overflow-tooltip>
                <template #default="{ row }">
                  <span v-if="row" class="font-semibold text-dark">{{ row.nickName || "-" }}</span>
                </template>
              </el-table-column>

              <!-- 客户账号 -->
              <el-table-column label="客户账号" min-width="180" show-overflow-tooltip>
                <template #default="{ row }">
                  <span v-if="row" class="font-mono">{{ row.username || "-" }}</span>
                </template>
              </el-table-column>

              <!-- 账号状态 -->
              <el-table-column label="账号状态" width="110" align="center">
                <template #default="{ row }">
                  <el-tag
                    v-if="row"
                    :type="row.disabled === true ? 'success' : 'info'"
                    size="small"
                  >
                    {{ row.disabled === true ? "启用" : "禁用" }}
                  </el-tag>
                </template>
              </el-table-column>

              <!-- 积分余额 -->
              <el-table-column label="积分余额" width="130" align="right">
                <template #default="{ row }">
                  <span v-if="row" class="point-num-text">
                    {{ formatNumber(row.point == null ? 0 : row.point) }}
                  </span>
                </template>
              </el-table-column>

              <!-- 操作 -->
              <el-table-column label="操作" width="180" align="center" fixed="right">
                <template #default="{ row }">
                  <template v-if="row">
                    <a class="link-text" @click="detail(row)">客户详情</a>
                    <span class="op-split">|</span>
                    <a class="link-text" @click="viewMemberHistory(row)">变动明细</a>
                  </template>
                </template>
              </el-table-column>
            </el-table>

            <!-- 分页 -->
            <div class="pagination-wrap mt_10">
              <el-pagination
                v-model:current-page="memberSearchForm.pageNumber"
                v-model:page-size="memberSearchForm.pageSize"
                :page-sizes="[20, 50, 100]"
                :total="memberTotal"
                layout="total, sizes, prev, pager, next, jumper"
                size="small"
                @current-change="changeMemberPage"
                @size-change="changeMemberPageSize"
              />
            </div>
          </el-card>
        </el-tab-pane>

        <!-- 选项卡 2：积分增减记录 -->
        <el-tab-pane label="积分增减记录" name="pointChangeRecord">
          <!-- 筛选条件 -->
          <el-card shadow="never" class="point-filter-card">
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
                  style="width: 200px"
                />
              </el-form-item>
              <el-form-item label="会员名称" prop="memberName">
                <el-input
                  v-model="searchForm.memberName"
                  placeholder="请输入会员名称"
                  clearable
                  style="width: 180px"
                />
              </el-form-item>
              <el-form-item class="form-actions">
                <el-button class="search-btn" type="primary" @click="handleSearch">
                  搜索
                </el-button>
                <el-button @click="handleHistoryReset">重置</el-button>
              </el-form-item>
            </el-form>
          </el-card>

          <!-- 积分记录表格 -->
          <el-card shadow="never" class="point-content-card mt_10">
            <template #header>
              <div class="card-header-bar">
                <div class="header-title">
                  <span>积分流水记录</span>
                  <span class="total-badge">共 {{ total }} 条明细</span>
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
              ref="table"
              class="custom-point-table"
              style="width: 100%"
            >
              <!-- 客户ID -->
              <el-table-column label="客户ID" min-width="170">
                <template #default="{ row }">
                  <span v-if="row" class="font-mono text-dark">{{ row.memberId || "-" }}</span>
                </template>
              </el-table-column>

              <!-- 会员名称 -->
              <el-table-column prop="memberName" label="会员名称" min-width="140" show-overflow-tooltip>
                <template #default="{ row }">
                  <span v-if="row" class="font-semibold text-dark">{{ row.memberName || "-" }}</span>
                </template>
              </el-table-column>

              <!-- 操作内容/原因 -->
              <el-table-column prop="content" label="操作内容" min-width="200" show-overflow-tooltip>
                <template #default="{ row }">
                  <span>{{ row ? row.content || "-" : "-" }}</span>
                </template>
              </el-table-column>

              <!-- 变动前积分 -->
              <el-table-column label="变动前积分" width="130" align="right">
                <template #default="{ row }">
                  <span v-if="row">{{ formatNumber(row.beforePoint) }}</span>
                </template>
              </el-table-column>

              <!-- 变动积分 -->
              <el-table-column label="变动积分" width="130" align="right">
                <template #default="{ row }">
                  <template v-if="row">
                    <el-tag
                      v-if="row.pointType === 'INCREASE'"
                      type="success"
                      size="small"
                      effect="light"
                      class="point-change-tag"
                    >
                      +{{ formatNumber(row.variablePoint) }}
                    </el-tag>
                    <el-tag
                      v-else
                      type="danger"
                      size="small"
                      effect="light"
                      class="point-change-tag"
                    >
                      -{{ formatNumber(row.variablePoint) }}
                    </el-tag>
                  </template>
                </template>
              </el-table-column>

              <!-- 变动后积分 -->
              <el-table-column label="变动后积分" width="130" align="right">
                <template #default="{ row }">
                  <span v-if="row" class="point-num-text">
                    {{ formatNumber(row.point) }}
                  </span>
                </template>
              </el-table-column>

              <!-- 操作时间 -->
              <el-table-column prop="createTime" label="操作时间" width="170" align="center">
                <template #default="{ row }">
                  <span v-if="row" class="time-text">{{ row.createTime }}</span>
                </template>
              </el-table-column>
            </el-table>

            <!-- 分页 -->
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
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref } from "vue";
import * as API_Member from "@/api/member.js";
import { customRouterPush } from "@/utils/filters";
import { ElMessage } from "element-plus";

defineOptions({ name: "point" });

const emit = defineEmits(["callback"]);

const memberSearchFormRef = ref(null);
const searchFormRef = ref(null);
const table = ref(null);

const activeTab = ref("pointList");
const loading = ref(true);
const memberLoading = ref(false);
const pointsStatistics = ref({
  totalPoint: 0,
  unUsedPoint: 0,
});

const searchForm = reactive({
  pageNumber: 1,
  pageSize: 20,
  memberId: "",
  memberName: "",
});

const memberSearchForm = reactive({
  pageNumber: 1,
  pageSize: 20,
  id: "",
  nickName: "",
  username: "",
  disabled: "",
  minPoint: null,
  maxPoint: null,
});

const data = ref([]);
const memberData = ref([]);
const memberTotal = ref(0);
const total = ref(0);

function copyText(text, label = "客户ID") {
  if (!text) return;
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard
      .writeText(String(text))
      .then(() => ElMessage.success(`已复制${label}到剪贴板`))
      .catch(() => ElMessage.info(String(text)));
  } else {
    ElMessage.info(String(text));
  }
}

function detail(row) {
  customRouterPush({ name: "member-detail", query: { id: row.id } });
}

function viewMemberHistory(row) {
  activeTab.value = "pointChangeRecord";
  searchForm.memberId = row.id;
  searchForm.memberName = row.nickName || row.username || "";
  searchForm.pageNumber = 1;
  getData();
}

function init() {
  getStatistics();
  getMemberList();
  getData();
}

function getStatistics() {
  API_Member.queryMemberPointsStatistics().then((res) => {
    if (res && res.success && res.result) {
      pointsStatistics.value = {
        totalPoint: res.result.totalPoint || 0,
        unUsedPoint: res.result.unUsedPoint || 0,
      };
    }
  });
}

function formatNumber(value) {
  const numericValue = Number(value || 0);
  if (!Number.isFinite(numericValue)) return "0";
  return numericValue.toLocaleString();
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

function handleSearch() {
  searchForm.pageNumber = 1;
  getData();
}

function handleHistoryReset() {
  searchForm.memberId = "";
  searchForm.memberName = "";
  searchForm.pageNumber = 1;
  getData();
}

function handleMemberSearch() {
  memberSearchForm.pageNumber = 1;
  getMemberList();
}

function handleMemberReset() {
  memberSearchForm.id = "";
  memberSearchForm.nickName = "";
  memberSearchForm.username = "";
  memberSearchForm.disabled = "";
  memberSearchForm.minPoint = null;
  memberSearchForm.maxPoint = null;
  memberSearchForm.pageNumber = 1;
  getMemberList();
}

function changeMemberPage(v) {
  memberSearchForm.pageNumber = v;
  getMemberList();
}

function changeMemberPageSize(v) {
  memberSearchForm.pageNumber = 1;
  memberSearchForm.pageSize = v;
  getMemberList();
}

function getMemberList() {
  memberLoading.value = true;
  const params = {
    pageNumber: memberSearchForm.pageNumber,
    pageSize: memberSearchForm.pageSize,
    id: memberSearchForm.id ? memberSearchForm.id.trim() : undefined,
    nickName: memberSearchForm.nickName ? memberSearchForm.nickName.trim() : undefined,
    username: memberSearchForm.username ? memberSearchForm.username.trim() : undefined,
    disabled: memberSearchForm.disabled || undefined,
    minPoint: memberSearchForm.minPoint,
    maxPoint: memberSearchForm.maxPoint,
  };
  API_Member.getMemberListData(params)
    .then((res) => {
      memberLoading.value = false;
      if (res && res.success && res.result && res.result.records) {
        memberData.value = res.result.records;
        memberTotal.value = res.result.total;
      }
    })
    .catch(() => {
      memberLoading.value = false;
    });
}

function getData() {
  loading.value = true;
  const params = {
    pageNumber: searchForm.pageNumber,
    pageSize: searchForm.pageSize,
    memberId: searchForm.memberId ? searchForm.memberId.trim() : undefined,
    memberName: searchForm.memberName ? searchForm.memberName.trim() : undefined,
  };
  API_Member.getHistoryPointData(params)
    .then((res) => {
      loading.value = false;
      if (res && res.success && res.result) {
        data.value = res.result.records || [];
        total.value = res.result.total || 0;
      }
    })
    .catch(() => {
      loading.value = false;
    });
}

onMounted(() => {
  init();
});
</script>

<style lang="scss" scoped>
.member-point-page {
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

.text-warning {
  color: #e6a23c;
}

/* 顶部统计卡片 */
.points-statistics-card {
  margin-bottom: 14px;
  border-radius: 8px;
  border: 1px solid #ebeef5;

  :deep(.el-card__body) {
    padding: 16px 24px;
  }

  .points-statistics {
    width: 100%;

    .points-statistics-item {
      padding: 6px 0;

      .stat-inner-box {
        text-align: center;
        padding: 12px 16px;
        background: #fbfbfc;
        border-radius: 6px;
        border: 1px solid #f2f3f5;

        .points-statistics-title {
          font-size: 14px;
          font-weight: 600;
          color: #303133;
          line-height: 20px;
        }

        .points-statistics-subtitle {
          font-size: 12px;
          color: #909399;
          line-height: 18px;
          margin-top: 4px;
        }

        .points-statistics-value {
          font-size: 22px;
          font-weight: 700;
          color: #f56c6c;
          line-height: 30px;
          margin-top: 8px;
        }
      }
    }
  }
}

/* 选项卡容器 */
.point-tabs-wrap {
  padding: 14px 18px 18px;
  background: #fff;
  border-radius: 8px;
  border: 1px solid #ebeef5;
}

.point-tabs {
  :deep(.el-tabs__header) {
    margin-bottom: 16px;
  }

  :deep(.el-tabs__item) {
    padding: 8px 18px;
    font-size: 14px;
    color: #606266;
    transition: all 0.2s ease;
  }

  :deep(.el-tabs__item.is-active) {
    color: #409eff;
    font-weight: 600;
  }
}

/* 筛选表单 */
.point-filter-card {
  border-radius: 6px;
  border: 1px solid #ebeef5;
  background-color: #fafbfe;

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

.point-range-separator {
  display: inline-block;
  margin: 0 6px;
  color: #909399;
}

/* 表格区域卡片 */
.point-content-card {
  border-radius: 6px;
  border: 1px solid #ebeef5;

  .card-header-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .header-title {
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 15px;
      font-weight: 600;
      color: #303133;

      .total-badge {
        font-size: 12px;
        font-weight: normal;
        color: #909399;
      }
    }
  }
}

/* 表格单元格 */
.custom-point-table {
  .id-cell {
    display: flex;
    align-items: center;
    gap: 8px;

    .copy-btn {
      padding: 0;
      font-size: 12px;
    }
  }

  .point-num-text {
    font-weight: 600;
    color: #f56c6c;
  }

  .point-change-tag {
    font-weight: 600;
    font-family: SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  }

  .time-text {
    font-size: 12px;
    color: #909399;
  }
}

.pagination-wrap {
  display: flex;
  justify-content: flex-end;
  padding-top: 6px;
}
</style>
