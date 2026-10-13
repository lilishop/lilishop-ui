<template>
  <div class="search">
    <el-card>
      <el-form
        ref="searchFormRef"
        :model="searchForm"
        inline
        label-width="70px"
        class="search-form"
        @keyup.enter="handleSearch"
      >
        <el-form-item label="客户名称" prop="memberName">
          <el-input
            v-model="searchForm.memberName"
            placeholder="请输入客户名称"
            clearable
            style="width: 240px"
          />
        </el-form-item>
        <el-form-item label="提现状态" prop="applyStatus">
          <el-select v-model="searchForm.applyStatus" clearable style="width: 240px">
            <el-option label="申请中" value="APPLY" />
            <el-option label="审核通过" value="VIA_AUDITING" />
            <el-option label="用户确认" value="WAIT_USER_CONFIRM" />
            <el-option label="审核拒绝" value="FAIL_AUDITING" />
            <el-option label="提现成功" value="SUCCESS" />
            <el-option label="提现失败" value="ERROR" />
          </el-select>
        </el-form-item>
        <el-form-item label="申请时间">
          <el-date-picker
            v-model="selectDate"
            type="datetimerange"
            value-format="YYYY-MM-DD HH:mm:ss"
            clearable
            start-placeholder="开始时间"
            end-placeholder="结束时间"
            placeholder="选择起始时间"
            style="width: 360px"
            @change="selectDateRange"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
        </el-form-item>
      </el-form>
    </el-card>
    <el-card>
      <el-table
        v-loading="loading"
        border
        :data="data"
        ref="table"
        class="mt_10"
        style="width: 100%"
        @sort-change="changeSort"
        @selection-change="changeSelect"
      >
        <el-table-column prop="sn" label="申请编号" min-width="160" show-overflow-tooltip />
        <el-table-column prop="memberName" label="客户名称" min-width="120" show-overflow-tooltip />
        <el-table-column label="申请金额" width="120">
          <template #default="{ row }">
            <priceColorScheme v-if="row" :value="row.applyMoney" :color="$mainColor" />
          </template>
        </el-table-column>
        <el-table-column label="提现状态" width="120">
          <template #default="{ row }">
            <el-tag v-if="row" :type="applyStatusTagType(row.applyStatus)">
              {{ applyStatusText(row.applyStatus) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="申请时间" width="170" sortable="custom" />
        <el-table-column prop="inspectTime" label="审核时间" width="170" />
        <el-table-column label="操作" width="120" align="center" fixed="right">
          <template #default="{ row }">
            <div v-if="row" class="ops">
              <a class="link-text" v-if="row.applyStatus === 'APPLY'" @click="openAudit(row)">审核</a>
              <a class="link-text" v-else @click="openQuery(row)">查看</a>
            </div>
          </template>
        </el-table-column>
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

    <el-dialog
      v-model="roleModalVisible"
      :title="modalTitle"
      width="500px"
      :close-on-click-modal="false"
    >
      <el-form label-width="80px">
        <el-form-item label="申请编号">
          <span>{{ showList.sn }}</span>
        </el-form-item>
        <el-form-item label="用户名称">
          <span>{{ showList.memberName }}</span>
        </el-form-item>
        <el-form-item label="申请金额">
          <priceColorScheme :value="showList.applyMoney" :color="$mainColor" />
        </el-form-item>
        <el-form-item label="提现状态">
          <span>{{ paramTypeFilter(showList.applyStatus) }}</span>
        </el-form-item>
        <el-form-item label="申请时间">
          <span>{{ showList.createTime }}</span>
        </el-form-item>
        <el-form-item label="审核备注">
          <el-input v-model="audit" type="textarea" />
        </el-form-item>
      </el-form>
      <template #footer>
        <template v-if="showList.applyStatus === 'APPLY'">
          <el-button @click="submitRole(false)">拒绝</el-button>
          <el-button type="primary" :loading="submitLoading" @click="submitRole(true)">通过</el-button>
        </template>
      </template>
    </el-dialog>

    <el-dialog
      v-model="queryModalVisible"
      :title="modalTitle"
      width="500px"
      :close-on-click-modal="false"
    >
      <el-form label-width="100px">
        <el-form-item label="申请编号：">
          <span>{{ showList.sn }}</span>
        </el-form-item>
        <el-form-item label="用户名称：">
          <span>{{ showList.memberName }}</span>
        </el-form-item>
        <el-form-item label="申请金额：">
          <priceColorScheme :value="showList.applyMoney" :color="$mainColor" />
        </el-form-item>
        <el-form-item label="提现状态：">
          <span>{{ paramTypeFilter(showList.applyStatus) }}</span>
        </el-form-item>
        <el-form-item label="申请时间：">
          <span>{{ showList.createTime }}</span>
        </el-form-item>
        <el-form-item label="审核时间：">
          <span>{{ showList.inspectTime }}</span>
        </el-form-item>
        <el-form-item label="审核备注：">
          <span>{{ showList.inspectRemark || "暂无备注" }}</span>
        </el-form-item>
      </el-form>
      <template #footer>
        <template v-if="showList.applyStatus === 'APPLY'">
          <el-button @click="submitRole(false)">拒绝</el-button>
          <el-button type="primary" :loading="submitLoading" @click="submitRole(true)">通过</el-button>
        </template>
        <el-button v-else @click="queryModalVisible = false">取消</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from "vue";
import { getUserWithdrawApply, withdrawApply } from "@/api/member";
import { ElMessage } from "element-plus";

defineOptions({ name: "withdrawApply" });

// 模板 el-form 的 ref（原 ref="searchForm"，与 data 同名会互相覆盖，改名为 searchFormRef）
const searchFormRef = ref(null);
// 模板 el-table 的 ref
const table = ref(null);

const modalTitle = ref("");
const loading = ref(true);
const audit = ref("");
const roleModalVisible = ref(false);
const queryModalVisible = ref(false);
const searchForm = reactive({
  pageNumber: 1,
  pageSize: 20,
  sort: "createTime",
  order: "desc",
  startDate: "",
  endDate: "",
  memberName: "",
  applyStatus: "",
});
const selectDate = ref(null);
const submitLoading = ref(false);
const selectList = ref([]);
const selectCount = ref(0);
const showList = ref({});
const data = ref([]);
const total = ref(0);

function paramTypeFilter(val) {
  if (val === "APPLY") return "申请中";
  if (val === "VIA_AUDITING") return "审核通过(提现成功)";
  if (val === "WAIT_USER_CONFIRM") return "用户确认";
  if (val === "FAIL_AUDITING") return "审核拒绝";
  if (val === "SUCCESS") return "提现成功";
  if (val === "ERROR") return "提现失败";
  return "未知状态";
}
function applyStatusText(status) {
  if (status === "APPLY") return "申请中";
  if (status === "VIA_AUDITING") return "审核通过";
  if (status === "WAIT_USER_CONFIRM") return "用户确认";
  if (status === "SUCCESS") return "提现成功";
  if (status === "ERROR") return "提现失败";
  return "审核拒绝";
}
function applyStatusTagType(status) {
  if (status === "APPLY") return "warning";
  if (status === "VIA_AUDITING") return "success";
  if (status === "WAIT_USER_CONFIRM") return "warning";
  if (status === "SUCCESS") return "primary";
  if (status === "ERROR") return "primary";
  return "danger";
}
function openAudit(row) {
  showList.value = { ...row };
  audit.value = "";
  roleModalVisible.value = true;
}
function openQuery(row) {
  showList.value = { ...row };
  modalTitle.value = "查看";
  queryModalVisible.value = true;
}
function submitRole(res) {
  const params = {};
  params.applyId = showList.value.id;
  params.result = res;
  params.remark = audit.value;
  if (res === false && params.remark === "") {
    ElMessage.error("审核备注不能为空");
    return;
  }
  submitLoading.value = true;
  withdrawApply(params)
    .then((result) => {
      const success = result === true || (result && result.success === true);
      if (success) {
        ElMessage.success("操作成功");
        roleModalVisible.value = false;
        queryModalVisible.value = false;
        audit.value = "";
        showList.value = {};
        getDataList();
      }
    })
    .finally(() => {
      submitLoading.value = false;
    });
}
function init() {
  getDataList();
}
function changePage(v) {
  searchForm.pageNumber = v;
  getDataList();
  clearSelectAll();
}
function changePageSize(v) {
  searchForm.pageSize = v;
  getDataList();
}
function handleSearch() {
  searchForm.pageNumber = 1;
  searchForm.pageSize = 20;
  getDataList();
}
function handleReset() {
  searchFormRef.value.resetFields();
  searchForm.pageNumber = 1;
  searchForm.pageSize = 20;
  selectDate.value = null;
  searchForm.startDate = "";
  searchForm.endDate = "";
  searchForm.memberName = "";
  getDataList();
}
function changeSort(e) {
  searchForm.sort = e.prop || e.key;
  searchForm.order = e.order === "ascending" ? "asc" : e.order === "descending" ? "desc" : "";
  if (!e.order) {
    searchForm.order = "";
  }
  getDataList();
}
function clearSelectAll() {
  if (table.value) {
    table.value.clearSelection();
  }
}
function changeSelect(e) {
  selectList.value = e;
  selectCount.value = e.length;
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
function getDataList() {
  loading.value = true;
  getUserWithdrawApply(searchForm).then((res) => {
    loading.value = false;
    if (res.success) {
      data.value = res.result.records;
      total.value = res.result.total;
    }
  });
}

onMounted(() => {
  init();
});
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
</style>
