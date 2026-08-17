<template>
  <div class="search">
    <el-card>
      <el-form
        ref="searchForm"
        :model="searchForm"
        class="search-form"
        @keyup.enter="handleSearch"
      >
        <el-form-item label="分销员名称" class="flex" prop="memberName">
          <el-input
            v-model="searchForm.memberName"
            placeholder="请输入分销员名称"
            clearable
            style="width: 240px"
          />
        </el-form-item>
        <el-form-item label="编号" class="flex">
          <el-input
            v-model="searchForm.sn"
            placeholder="请输入编号"
            clearable
            style="width: 240px"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card>
      <el-tabs v-model="tabStatus" @tab-change="handleTabChange">
        <el-tab-pane label="全部" name="" />
        <el-tab-pane :label="applyCountLabel" name="APPLY" />
        <el-tab-pane label="已通过" name="VIA_AUDITING" />
        <el-tab-pane label="已拒绝" name="FAIL_AUDITING" />
      </el-tabs>

      <el-table
        ref="table"
        v-loading="loading"
        border
        :data="data"
        class="mt_10"
        style="width: 100%"
      >
        <el-table-column prop="sn" label="编号" min-width="200" />
        <el-table-column prop="distributionId" label="分销员ID" min-width="180" />
        <el-table-column prop="distributionName" label="分销员名称" min-width="120" />
        <el-table-column label="申请金额" min-width="90">
          <template #default="{ row }">
            <priceColorScheme v-if="row" :value="row.price" :color="$mainColor" />
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="申请时间" min-width="130" />
        <el-table-column prop="updateTime" label="处理时间" min-width="130" />
        <el-table-column label="状态" min-width="100">
          <template #default="{ row }">
            <span v-if="row">
              <span v-if="row.distributionCashStatus == 'APPLY'">待处理</span>
              <span v-else-if="row.distributionCashStatus == 'VIA_AUDITING'">通过</span>
              <span v-else-if="row.distributionCashStatus == 'FAIL_AUDITING'">审核拒绝</span>
            </span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="130" align="center" fixed="right">
          <template #default="{ row }">
            <div v-if="row" class="ops">
              <a class="link-text" v-if="row.distributionCashStatus != 'APPLY'" @click="view(row)">查看</a>
              <a class="link-text" v-else @click="edit(row)">审核</a>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <div class="mt_10 page padding-row" style="display: flex; justify-content: flex-end">
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

    <el-drawer
      v-model="drawerVisible"
      :title="drawerTitle"
      size="560px"
      direction="rtl"
      :close-on-click-modal="true"
      append-to-body
      destroy-on-close
      class="cash-detail-drawer"
    >
      <div class="detail-body">
        <div class="detail-section-title">申请信息</div>
        <div class="detail-meta">
          <div class="detail-meta-row">
            <span class="detail-meta-label">编号</span>
            <span class="detail-meta-value">{{ form.sn || '-' }}</span>
          </div>
          <div class="detail-meta-row">
            <span class="detail-meta-label">分销员ID</span>
            <span class="detail-meta-value">{{ form.distributionId || '-' }}</span>
          </div>
          <div class="detail-meta-row">
            <span class="detail-meta-label">分销员名称</span>
            <span class="detail-meta-value">{{ form.distributionName || '-' }}</span>
          </div>
          <div class="detail-meta-row">
            <span class="detail-meta-label">申请金额(元)</span>
            <span class="detail-meta-value detail-meta-price">{{ form.price != null ? Number(form.price).toFixed(2) : '-' }}</span>
          </div>
          <div class="detail-meta-row">
            <span class="detail-meta-label">状态</span>
            <span class="detail-meta-value">
              <span v-if="form.distributionCashStatus === 'APPLY'">待处理</span>
              <span v-else-if="form.distributionCashStatus === 'VIA_AUDITING'">已通过</span>
              <span v-else-if="form.distributionCashStatus === 'FAIL_AUDITING'">已拒绝</span>
              <span v-else>-</span>
            </span>
          </div>
          <div class="detail-meta-row">
            <span class="detail-meta-label">申请时间</span>
            <span class="detail-meta-value">{{ form.createTime || '-' }}</span>
          </div>
          <div v-if="form.updateTime && form.distributionCashStatus !== 'APPLY'" class="detail-meta-row">
            <span class="detail-meta-label">处理时间</span>
            <span class="detail-meta-value">{{ form.updateTime || '-' }}</span>
          </div>
        </div>

        <div class="detail-section-title">银行卡信息</div>
        <div class="detail-meta">
          <div class="detail-meta-row">
            <span class="detail-meta-label">持卡人</span>
            <span class="detail-meta-value">{{ form.name || '-' }}</span>
          </div>
          <div class="detail-meta-row">
            <span class="detail-meta-label">银行</span>
            <span class="detail-meta-value">{{ form.settlementBankAccountName || '-' }}</span>
          </div>
          <div class="detail-meta-row">
            <span class="detail-meta-label">银行卡号</span>
            <span class="detail-meta-value">{{ form.settlementBankAccountNum || '-' }}</span>
          </div>
        </div>

        <template v-if="handleStatus === 'edit'">
          <div class="detail-section-title">审核操作</div>
          <div class="audit-action">
            <el-radio-group v-model="result">
              <el-radio-button value="VIA_AUDITING">通过</el-radio-button>
              <el-radio-button value="FAIL_AUDITING">拒绝</el-radio-button>
            </el-radio-group>
          </div>
        </template>
      </div>

      <template v-if="handleStatus === 'edit'" #footer>
        <div class="drawer-footer">
          <el-button @click="drawerVisible = false">取消</el-button>
          <el-button type="primary" :loading="submitLoading" @click="handleSubmit">提交审核</el-button>
        </div>
      </template>
    </el-drawer>
  </div>
</template>

<script>
import { auditDistributionCash, getDistributionCash } from "@/api/distribution";

export default {
  name: "distributionCash",
  data() {
    return {
      tabStatus: "",
      applyCount: 0,
      loading: true,
      drawerVisible: false,
      drawerTitle: "",
      result: "VIA_AUDITING",
      searchForm: {
        pageNumber: 1,
        pageSize: 20,
        sort: "createTime",
        order: "desc",
      },
      handleStatus: "edit",
      form: {
        sn: "",
        distributionId: "",
        distributionName: "",
        price: "",
        name: "",
        settlementBankAccountName: "",
        settlementBankAccountNum: "",
      },
      submitLoading: false,
      data: [],
      total: 0,
    };
  },
  computed: {
    applyCountLabel() {
      return this.applyCount > 0 ? `待处理(${this.applyCount})` : "待处理";
    },
  },
  methods: {
    init() {
      this.getDataList();
      this.loadApplyCount();
    },
    loadApplyCount() {
      getDistributionCash({
        distributionCashStatus: "APPLY",
        pageSize: 1,
        pageNumber: 1,
      }).then((res) => {
        if (res.success) {
          this.applyCount = res.result.total || 0;
        }
      });
    },
    changePage() {
      this.getDataList();
    },
    changePageSize() {
      this.searchForm.pageNumber = 1;
      this.getDataList();
    },
    handleSearch() {
      this.searchForm.pageNumber = 1;
      this.searchForm.pageSize = 20;
      this.getDataList();
    },
    getDataList() {
      this.loading = true;
      const params = { ...this.searchForm };
      if (this.tabStatus) {
        params.distributionCashStatus = this.tabStatus;
      }
      getDistributionCash(params).then((res) => {
        this.loading = false;
        if (res.success) {
          this.data = res.result.records;
          this.total = res.result.total;
        }
      });
    },
    handleTabChange(name) {
      this.tabStatus = name;
      this.searchForm.pageNumber = 1;
      this.getDataList();
    },
    handleSubmit() {
      let result = this.result == "VIA_AUDITING" ? "通过" : "拒绝";
      this.$Modal.confirm({
        title: "确认审核",
        content: "您确认要审核" + result + "么?",
        loading: true,
        onOk: () => {
          auditDistributionCash(this.form.id, { result: this.result }).then((res) => {
            if (res.success) {
              this.$Modal.remove();
              this.$Message.success("审核成功");
              this.drawerVisible = false;
              this.getDataList();
              this.loadApplyCount();
            } else {
              this.$Modal.remove();
            }
          });
        },
      });
    },
    edit(v) {
      this.drawerTitle = "审核";
      this.handleStatus = "edit";
      this.result = "VIA_AUDITING";
      const data = {};
      for (let attr in v) {
        data[attr] = v[attr] === null ? "" : v[attr];
      }
      this.form = data;
      this.drawerVisible = true;
    },
    view(v) {
      this.drawerTitle = "查看";
      this.handleStatus = "view";
      const data = {};
      for (let attr in v) {
        data[attr] = v[attr] === null ? "" : v[attr];
      }
      this.form = data;
      this.drawerVisible = true;
    },
  },
  mounted() {
    // 处理路由参数，自动跳转到指定标签页
    const tabStatus = this.$route.query.tabStatus;
    if (tabStatus) {
      this.tabStatus = tabStatus;
    }
    this.init();
  },
};
</script>
<style lang="scss" scoped>
.ops a {
  color: #2d8cf0;
  cursor: pointer;
  text-decoration: none;
}
.ops span {
  display: inline-block;
  margin: 0 8px;
  color: #dcdee2;
}
.audit-action {
  margin-top: 4px;
}
.drawer-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>

<style lang="scss">
.cash-detail-drawer {
  .el-drawer__header {
    margin-bottom: 0;
    padding: 16px 24px;
    border-bottom: 1px solid #e8eaec;
  }
  .el-drawer__body {
    padding: 20px 24px 0;
    overflow-x: hidden;
    overflow-y: auto;
  }
  .el-drawer__footer {
    padding: 12px 24px;
    border-top: 1px solid #e8eaec;
  }
}
.cash-detail-drawer .detail-body {
  min-height: 200px;
}
.cash-detail-drawer .detail-section-title {
  font-size: 14px;
  font-weight: 600;
  color: #17233d;
  margin: 20px 0 12px;
  &:first-child { margin-top: 0; }
}
.cash-detail-drawer .detail-meta {
  display: flex;
  flex-direction: column;
  gap: 10px;
  background: #f8f8f9;
  border: 1px solid #e8eaec;
  border-radius: 8px;
  padding: 14px 16px;
}
.cash-detail-drawer .detail-meta-row {
  display: flex;
  align-items: flex-start;
  font-size: 14px;
  line-height: 22px;
}
.cash-detail-drawer .detail-meta-label {
  color: #808695;
  min-width: 110px;
  flex-shrink: 0;
}
.cash-detail-drawer .detail-meta-value {
  color: #515a6e;
  flex: 1;
  word-break: break-all;
}
.cash-detail-drawer .detail-meta-price {
  font-weight: 600;
  color: #f56c6c;
  font-size: 15px;
}
</style>
