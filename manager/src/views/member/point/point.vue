<template>
  <div class="search">
    <el-card class="points-statistics-card">
      <el-row type="flex" justify="space-around" align="middle" class="points-statistics">
        <el-col :xs="24" :sm="12" class="points-statistics-item">
          <div class="points-statistics-title">已发放积分数</div>
          <div class="points-statistics-subtitle">历史累计发放积分数</div>
          <div class="points-statistics-value">{{ formatNumber(pointsStatistics.totalPoint) }}</div>
        </el-col>
        <el-col :xs="24" :sm="12" class="points-statistics-item">
          <div class="points-statistics-title">未使用积分数</div>
          <div class="points-statistics-subtitle">会员账户未使用积分数</div>
          <div class="points-statistics-value">{{ formatNumber(pointsStatistics.unUsedPoint) }}</div>
        </el-col>
      </el-row>
    </el-card>
    <div class="point-tabs-wrap">
      <el-tabs v-model="activeTab" class="point-tabs">
        <el-tab-pane label="积分列表" name="pointList">
          <el-card class="point-content-card">
            <el-form
              ref="memberSearchForm"
              :model="memberSearchForm"
              inline
              label-width="70px"
              class="search-form"
              @keyup.enter="handleMemberSearch"
            >
              <el-form-item label="客户名称" prop="nickName">
                <el-input
                  v-model="memberSearchForm.nickName"
                  placeholder="请输入客户名称"
                  clearable
                  style="width: 180px"
                />
              </el-form-item>
              <el-form-item label="客户账号" prop="username">
                <el-input
                  v-model="memberSearchForm.username"
                  placeholder="请输入客户账号"
                  clearable
                  style="width: 180px"
                />
              </el-form-item>
              <el-form-item label="账号状态" prop="disabled">
                <el-select
                  v-model="memberSearchForm.disabled"
                  clearable
                  placeholder="请选择账号状态"
                  style="width: 160px"
                >
                  <el-option label="启用" value="OPEN" />
                  <el-option label="禁用" value="CLOSE" />
                </el-select>
              </el-form-item>
              <el-form-item label="积分值">
                <el-input-number
                  v-model="memberSearchForm.minPoint"
                  :min="0"
                  :precision="0"
                  placeholder="最小积分值"
                  style="width: 140px"
                />
                <span class="point-range-separator">-</span>
                <el-input-number
                  v-model="memberSearchForm.maxPoint"
                  :min="0"
                  :precision="0"
                  placeholder="最大积分值"
                  style="width: 140px"
                />
              </el-form-item>
              <el-form-item>
                <el-button class="search-btn" type="primary" @click="handleMemberSearch">搜索</el-button>
              </el-form-item>
            </el-form>
          </el-card>
          <el-card class="point-content-card member-list-card">
            <template #header>
              <div class="card-title">用户列表</div>
            </template>
            <el-table
              v-loading="memberLoading"
              border
              :data="memberData"
              class="member-table"
              style="width: 100%"
            >
              <el-table-column label="客户名称" min-width="160" show-overflow-tooltip>
                <template #default="{ row }">
                  <span v-if="row">{{ row.nickName || "-" }}</span>
                </template>
              </el-table-column>
              <el-table-column label="客户账号" min-width="260" show-overflow-tooltip>
                <template #default="{ row }">
                  <span v-if="row">{{ row.username || "-" }}</span>
                </template>
              </el-table-column>
              <el-table-column label="账号状态" min-width="120" align="center">
                <template #default="{ row }">
                  <el-tag v-if="row" :type="row.disabled === true ? 'success' : 'info'">
                    {{ row.disabled === true ? "启用" : "禁用" }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column label="积分余额" min-width="120" align="center">
                <template #default="{ row }">
                  <span v-if="row">{{ row.point == null ? 0 : row.point }}</span>
                </template>
              </el-table-column>
              <el-table-column label="操作" width="120" align="center" fixed="right">
                <template #default="{ row }">
                  <a v-if="row" class="link-text" @click="detail(row)">详情</a>
                </template>
              </el-table-column>
            </el-table>
            <div class="mt_10" style="display: flex; justify-content: flex-end">
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
        <el-tab-pane label="积分增减记录" name="pointChangeRecord">
          <el-card class="point-content-card">
            <el-form
              ref="searchForm"
              :model="searchForm"
              inline
              label-width="70px"
              class="search-form"
              @keyup.enter="handleSearch"
            >
              <el-form-item label="会员名称" prop="username">
                <el-input
                  v-model="searchForm.memberName"
                  placeholder="请输入会员名称"
                  clearable
                  style="width: 240px"
                />
              </el-form-item>
              <el-form-item>
                <el-button class="search-btn" type="primary" @click="handleSearch">搜索</el-button>
              </el-form-item>
            </el-form>
          </el-card>
          <el-card class="point-content-card">
            <el-table
              v-loading="loading"
              border
              :data="data"
              ref="table"
              class="mt_10 point-table"
              style="width: 100%"
            >
              <el-table-column prop="memberName" label="会员名称" min-width="120" show-overflow-tooltip />
              <el-table-column prop="content" label="操作内容" min-width="200" show-overflow-tooltip />
              <el-table-column prop="beforePoint" label="之前积分" width="200" />
              <el-table-column label="变动积分" width="200">
                <template #default="{ row }">
                  <template v-if="row">
                    <priceColorScheme
                      v-if="row.pointType === 'INCREASE'"
                      :value="row.variablePoint"
                      color="green"
                      unit="+"
                    />
                    <priceColorScheme
                      v-else
                      :value="row.variablePoint"
                      :color="$mainColor"
                      unit="-"
                    />
                  </template>
                </template>
              </el-table-column>
              <el-table-column prop="point" label="当前积分" width="200" />
              <el-table-column prop="createTime" label="操作时间" width="200" />
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
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<script>
import * as API_Member from "@/api/member.js";
import { customRouterPush } from "@/utils/filters";

export default {
  name: "point",
  data() {
    return {
      activeTab: "pointList",
      loading: true,
      memberLoading: false,
      pointsStatistics: {
        totalPoint: 0,
        unUsedPoint: 0,
      },
      searchForm: {
        pageNumber: 1,
        pageSize: 20,
      },
      memberSearchForm: {
        pageNumber: 1,
        pageSize: 20,
        nickName: "",
        username: "",
        disabled: "",
        minPoint: null,
        maxPoint: null,
      },
      data: [],
      memberData: [],
      memberTotal: 0,
      total: 0,
    };
  },
  methods: {
    callback(val) {
      this.$emit("callback", val);
    },
    detail(row) {
      customRouterPush({ name: "member-detail", query: { id: row.id } });
    },
    init() {
      this.getStatistics();
      this.getMemberList();
      this.getData();
    },
    getStatistics() {
      API_Member.queryMemberPointsStatistics().then((res) => {
        if (res && res.success && res.result) {
          this.pointsStatistics = {
            totalPoint: res.result.totalPoint || 0,
            unUsedPoint: res.result.unUsedPoint || 0,
          };
        }
      });
    },
    formatNumber(value) {
      const numericValue = Number(value || 0);
      if (!Number.isFinite(numericValue)) return "0";
      return numericValue.toLocaleString();
    },
    changePage(v) {
      this.searchForm.pageNumber = v;
      this.getData();
    },
    changePageSize(v) {
      this.searchForm.pageNumber = 1;
      this.searchForm.pageSize = v;
      this.getData();
    },
    handleSearch() {
      this.searchForm.pageNumber = 1;
      this.searchForm.pageSize = 20;
      this.getData();
    },
    handleMemberSearch() {
      this.memberSearchForm.pageNumber = 1;
      this.getMemberList();
    },
    changeMemberPage(v) {
      this.memberSearchForm.pageNumber = v;
      this.getMemberList();
    },
    changeMemberPageSize(v) {
      this.memberSearchForm.pageNumber = 1;
      this.memberSearchForm.pageSize = v;
      this.getMemberList();
    },
    getMemberList() {
      this.memberLoading = true;
      const params = {
        pageNumber: this.memberSearchForm.pageNumber,
        pageSize: this.memberSearchForm.pageSize,
        nickName: this.memberSearchForm.nickName || undefined,
        username: this.memberSearchForm.username || undefined,
        disabled: this.memberSearchForm.disabled || undefined,
        minPoint: this.memberSearchForm.minPoint,
        maxPoint: this.memberSearchForm.maxPoint,
      };
      API_Member.getMemberListData(params)
        .then((res) => {
          this.memberLoading = false;
          if (res && res.success && res.result && res.result.records) {
            this.memberData = res.result.records;
            this.memberTotal = res.result.total;
          }
        })
        .catch(() => {
          this.memberLoading = false;
        });
    },
    getData() {
      this.loading = true;
      API_Member.getHistoryPointData(this.searchForm).then((res) => {
        this.loading = false;
        if (res.success) {
          this.data = res.result.records;
          this.total = res.result.total;
        }
      });
    },
  },
  mounted() {
    this.init();
  },
};
</script>
<style lang="scss" scoped>
.points-statistics-card {
  margin-bottom: 10px;
}

.point-tabs-wrap {
  padding: 12px 16px 16px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(23, 35, 61, 0.04);
}

.point-tabs {
  :deep(.el-tabs__header) {
    margin-bottom: 16px;
  }

  :deep(.el-tabs__item) {
    padding: 8px 18px;
    color: #515a6e;
    transition: all 0.2s ease;
  }

  :deep(.el-tabs__item.is-active) {
    color: #409eff;
    font-weight: 500;
  }

  :deep(.el-tabs__active-bar) {
    height: 2px;
    border-radius: 2px;
  }
}

.points-statistics {
  width: 100%;
}

.points-statistics-item {
  padding: 10px 0;
  text-align: center;
}

.points-statistics-title {
  font-size: 14px;
  color: #17233d;
  line-height: 20px;
}

.points-statistics-subtitle {
  font-size: 12px;
  color: #808695;
  line-height: 18px;
  margin-top: 4px;
}

.points-statistics-value {
  font-size: 18px;
  font-weight: 600;
  color: #fa6419;
  line-height: 26px;
  margin-top: 8px;
}

.point-content-card {
  margin-bottom: 12px;
}

.member-list-card {
  :deep(.el-card__header) {
    border-bottom: 1px solid #f5f5f5;
  }
}

.card-title {
  font-size: 14px;
  font-weight: 500;
  color: #17233d;
}

.member-table {
  width: 100%;

  :deep(.el-table__header th.el-table__cell) {
    background: #fafafa;
    padding: 14px 0;
    font-size: 14px;
    color: #17233d;
  }

  :deep(.el-table__header .cell) {
    padding: 0 16px;
    line-height: 22px;
  }

  :deep(.el-table__body td.el-table__cell) {
    padding: 12px 0;
  }

  :deep(.el-table__body .cell) {
    padding: 0 16px;
    line-height: 22px;
  }
}

.point-range-separator {
  display: inline-block;
  margin: 0 8px;
  color: #808695;
}

.link-text {
  color: #409eff;
  cursor: pointer;
  text-decoration: none;
}

.face {
  width: 60px;
  height: 60px;
  border-radius: 50%;
}
</style>
