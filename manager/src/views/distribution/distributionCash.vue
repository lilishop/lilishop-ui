<template>
  <div class="search">
    <el-card>
      <el-form
        ref="searchFormRef"
        :model="searchForm"
        inline
        class="search-form"
        @keyup.enter="handleSearch"
      >
        <el-form-item label="分销员名称" prop="memberName">
          <el-input
            v-model="searchForm.memberName"
            placeholder="请输入分销员名称"
            clearable
            style="width: 240px"
          />
        </el-form-item>
        <el-form-item label="编号" prop="sn">
          <el-input
            v-model="searchForm.sn"
            placeholder="请输入编号"
            clearable
            style="width: 240px"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="mt_10">
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
          @current-change="getDataList"
          @size-change="() => { searchForm.pageNumber = 1; getDataList(); }"
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

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRoute } from "vue-router";
import { useTable } from "@/utils/useTable";
import { auditDistributionCash, getDistributionCash } from "@/api/distribution";
import { Message, Modal } from "@/utils/message";

defineOptions({ name: "distributionCash" });

const route = useRoute();
const searchFormRef = ref(null);
const table = ref(null);

const tabStatus = ref("");
const applyCount = ref(0);
const drawerVisible = ref(false);
const drawerTitle = ref("");
const result = ref("VIA_AUDITING");
const handleStatus = ref("edit");
const form = ref({
  sn: "",
  distributionId: "",
  distributionName: "",
  price: "",
  name: "",
  settlementBankAccountName: "",
  settlementBankAccountNum: "",
});
const submitLoading = ref(false);

const applyCountLabel = computed(() => {
  return applyCount.value > 0 ? `待处理(${applyCount.value})` : "待处理";
});

const { loading, data, total, searchForm, getDataList, handleSearch, resetSearch } = useTable(
  getDistributionCash,
  {
    pageSize: 20,
    immediate: false,
    sort: "createTime",
    order: "desc",
    form: {
      memberName: "",
      sn: "",
    },
    beforeRequest: (p) => {
      const params = { ...p };
      if (tabStatus.value) {
        params.distributionCashStatus = tabStatus.value;
      }
      return params;
    },
    onSuccess: () => {
      loadApplyCount();
    },
  }
);

function handleTabChange(name) {
  tabStatus.value = name;
  handleSearch();
}

function handleReset() {
  tabStatus.value = "";
  resetSearch();
}

function loadApplyCount() {
  getDistributionCash({
    distributionCashStatus: "APPLY",
    pageSize: 1,
    pageNumber: 1,
  }).then((res) => {
    if (res.success) {
      applyCount.value = res.result?.total || 0;
    }
  });
}

function handleSubmit() {
  const resultText = result.value === "VIA_AUDITING" ? "通过" : "拒绝";
  Modal.confirm({
    title: "确认审核",
    content: "您确认要审核" + resultText + "么?",
    loading: true,
    onOk: () => {
      auditDistributionCash(form.value.id, { result: result.value }).then((res) => {
        Modal.remove();
        if (res.success) {
          Message.success("审核成功");
          drawerVisible.value = false;
          getDataList();
          loadApplyCount();
        }
      });
    },
  });
}

function edit(v) {
  drawerTitle.value = "审核";
  handleStatus.value = "edit";
  result.value = "VIA_AUDITING";
  const formData = {};
  for (const attr in v) {
    formData[attr] = v[attr] === null ? "" : v[attr];
  }
  form.value = formData;
  drawerVisible.value = true;
}

function view(v) {
  drawerTitle.value = "查看";
  handleStatus.value = "view";
  const formData = {};
  for (const attr in v) {
    formData[attr] = v[attr] === null ? "" : v[attr];
  }
  form.value = formData;
  drawerVisible.value = true;
}

onMounted(() => {
  const queryTabStatus = route.query.tabStatus;
  if (queryTabStatus) {
    tabStatus.value = queryTabStatus;
  }
  getDataList();
  loadApplyCount();
});
</script>

<style lang="scss" scoped>
.ops a {
  color: #409eff;
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
.cash-detail-drawer {
  :deep(.el-drawer__body) {
    padding: 20px;
    background: #f7f8fa;
  }
}
.detail-body {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.detail-section-title {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  padding-left: 8px;
  border-left: 3px solid var(--el-color-primary, #409eff);
  margin-top: 8px;
}
.detail-meta {
  background: #fff;
  border-radius: 6px;
  padding: 12px 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  border: 1px solid #ebeef5;
}
.detail-meta-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13px;
}
.detail-meta-label {
  color: #909399;
}
.detail-meta-value {
  color: #303133;
  font-weight: 500;
  word-break: break-all;
  max-width: 340px;
  text-align: right;
}
.detail-meta-price {
  color: #f56c6c;
  font-size: 16px;
  font-weight: 600;
}
.drawer-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>
