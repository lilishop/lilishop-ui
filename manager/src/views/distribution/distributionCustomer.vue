<template>
  <div class="search">
    <el-tabs v-model="activeTab" @tab-change="handleTabChange">
      <el-tab-pane label="客户绑定" name="customer">
        <el-card>
          <el-form ref="searchFormRef" :model="searchForm" inline class="search-form" @keyup.enter="handleSearch">
            <el-form-item label="客户昵称">
              <el-input v-model="searchForm.memberName" clearable placeholder="客户昵称" style="width: 180px" />
            </el-form-item>
            <el-form-item label="手机号">
              <el-input v-model="searchForm.memberMobile" clearable placeholder="手机号" style="width: 180px" />
            </el-form-item>
            <el-form-item label="分销员">
              <el-input v-model="searchForm.distributionName" clearable placeholder="分销员名称" style="width: 180px" />
            </el-form-item>
            <el-form-item label="状态">
              <el-select v-model="searchForm.status" clearable style="width: 120px">
                <el-option v-for="item in bindStatusList" :key="item.value" :value="item.value" :label="item.label" />
              </el-select>
            </el-form-item>
            <el-form-item label="来源">
              <el-select v-model="searchForm.bindSource" clearable style="width: 140px">
                <el-option v-for="item in bindSourceList" :key="item.value" :value="item.value" :label="item.label" />
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="handleSearch">搜索</el-button>
            </el-form-item>
          </el-form>
        </el-card>

        <el-card>
          <el-table v-loading="loading" border :data="data" class="mt_10">
            <el-table-column prop="memberName" label="客户昵称" min-width="120" />
            <el-table-column prop="memberMobile" label="手机号" min-width="120" />
            <el-table-column prop="distributionName" label="归属分销员" min-width="120" />
            <el-table-column label="绑定来源" min-width="100">
              <template #default="{ row }">{{ bindSourceLabel(row.bindSource) }}</template>
            </el-table-column>
            <el-table-column label="绑定类型" min-width="90">
              <template #default="{ row }">
                {{ row.bindType === 'PERMANENT' ? '永久' : '短期' }}
              </template>
            </el-table-column>
            <el-table-column prop="bindStartTime" label="绑定时间" min-width="160" />
            <el-table-column prop="bindExpireTime" label="到期时间" min-width="160" />
            <el-table-column label="保护期剩余" min-width="100">
              <template #default="{ row }">
                <span v-if="row.protectRemainDays != null">{{ row.protectRemainDays }} 天</span>
                <span v-else>-</span>
              </template>
            </el-table-column>
            <el-table-column label="状态" width="90">
              <template #default="{ row }">
                <el-tag v-if="row.status === 'ACTIVE'" type="success">有效</el-tag>
                <el-tag v-else type="info">已过期</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="160" fixed="right" align="center">
              <template #default="{ row }">
                <a class="link-text" @click="openRebind(row)">换绑</a>
                <span class="split">|</span>
                <a class="link-text" @click="viewMemberLog(row)">日志</a>
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
              @current-change="getDataList"
              @size-change="handlePageSizeChange"
            />
          </div>
        </el-card>
      </el-tab-pane>

      <el-tab-pane label="绑定日志" name="log">
        <el-card>
          <el-form ref="logSearchFormRef" :model="logSearchForm" inline class="search-form" @keyup.enter="handleLogSearch">
            <el-form-item label="客户昵称">
              <el-input v-model="logSearchForm.memberName" clearable placeholder="客户昵称" style="width: 180px" />
            </el-form-item>
            <el-form-item label="变更类型">
              <el-select v-model="logSearchForm.changeType" clearable style="width: 140px">
                <el-option v-for="item in bindChangeTypeList" :key="item.value" :value="item.value" :label="item.label" />
              </el-select>
            </el-form-item>
            <el-form-item label="时间">
              <el-date-picker
                v-model="logDateRange"
                type="daterange"
                value-format="YYYY-MM-DD"
                start-placeholder="开始"
                end-placeholder="结束"
                style="width: 240px"
              />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="handleLogSearch">搜索</el-button>
            </el-form-item>
          </el-form>
        </el-card>

        <el-card>
          <el-table v-loading="logLoading" border :data="logData" class="mt_10">
            <el-table-column prop="createTime" label="时间" min-width="160" />
            <el-table-column prop="memberName" label="客户" min-width="100" />
            <el-table-column prop="fromDistributionName" label="原分销员" min-width="110" />
            <el-table-column prop="toDistributionName" label="新分销员" min-width="110" />
            <el-table-column label="变更类型" min-width="100">
              <template #default="{ row }">{{ bindChangeTypeLabel(row.changeType) }}</template>
            </el-table-column>
            <el-table-column prop="operatorType" label="操作方" width="90" />
            <el-table-column prop="remark" label="备注" min-width="160" show-overflow-tooltip />
          </el-table>
          <div class="mt_10 page padding-row" style="display: flex; justify-content: flex-end">
            <el-pagination
              v-model:current-page="logSearchForm.pageNumber"
              v-model:page-size="logSearchForm.pageSize"
              :page-sizes="[20, 50, 100]"
              :total="logTotal"
              layout="total, sizes, prev, pager, next, jumper"
              @current-change="getLogList"
              @size-change="handleLogPageSizeChange"
            />
          </div>
        </el-card>
      </el-tab-pane>
    </el-tabs>

    <el-dialog v-model="rebindVisible" title="手动换绑" width="520px">
      <el-form ref="rebindFormRef" :model="rebindForm" :rules="rebindRules" label-width="100px">
        <el-form-item label="客户">
          <el-input :model-value="rebindForm.memberLabel" disabled />
        </el-form-item>
        <el-form-item label="新分销员" prop="distributionId">
          <el-select
            v-model="rebindForm.distributionId"
            filterable
            remote
            reserve-keyword
            placeholder="输入分销员名称搜索"
            :remote-method="searchDistributor"
            :loading="distributorLoading"
            style="width: 100%"
          >
            <el-option
              v-for="item in distributorOptions"
              :key="item.id"
              :label="item.memberName"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="rebindForm.remark" type="textarea" :rows="3" maxlength="200" show-word-limit />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="rebindVisible = false">取消</el-button>
        <el-button type="primary" :loading="rebindSubmitting" @click="submitRebind">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from "vue";
import {
  getDistributionCustomerPage,
  getDistributionBindLogPage,
  getDistributionListData,
  rebindDistributionCustomer,
} from "@/api/distribution";
import { bindStatusList, bindSourceList, bindChangeTypeList } from "./dataJson";
import { Message } from "@/utils/message";

defineOptions({ name: "distributionCustomer" });

// 模板 el-form 的 ref（原 ref="searchForm"/"logSearchForm"，与 data 同名会互相覆盖，改名为 searchFormRef/logSearchFormRef）
const searchFormRef = ref(null);
const logSearchFormRef = ref(null);
const rebindFormRef = ref(null);

const activeTab = ref("customer");
const loading = ref(false);
const data = ref([]);
const total = ref(0);
const searchForm = reactive({
  pageNumber: 1,
  pageSize: 20,
  sort: "bindStartTime",
  order: "desc",
  memberName: "",
  memberMobile: "",
  distributionName: "",
  status: "",
  bindSource: "",
});
const logLoading = ref(false);
const logData = ref([]);
const logTotal = ref(0);
const logDateRange = ref([]);
const logSearchForm = reactive({
  pageNumber: 1,
  pageSize: 20,
  sort: "createTime",
  order: "desc",
  memberName: "",
  memberId: "",
  changeType: "",
  startDate: "",
  endDate: "",
});
const rebindVisible = ref(false);
const rebindSubmitting = ref(false);
const distributorLoading = ref(false);
const distributorOptions = ref([]);
const rebindForm = ref({
  memberId: "",
  memberLabel: "",
  distributionId: "",
  remark: "",
});
const rebindRules = {
  distributionId: [{ required: true, message: "请选择分销员", trigger: "change" }],
};

function bindSourceLabel(value) {
  const item = bindSourceList.find((i) => i.value === value);
  return item ? item.label : value;
}
function bindChangeTypeLabel(value) {
  const item = bindChangeTypeList.find((i) => i.value === value);
  return item ? item.label : value;
}
function handleTabChange(name) {
  if (name === "log" && logData.value.length === 0) {
    getLogList();
  }
}
function handleSearch() {
  searchForm.pageNumber = 1;
  getDataList();
}
function handlePageSizeChange() {
  searchForm.pageNumber = 1;
  getDataList();
}
function getDataList() {
  loading.value = true;
  getDistributionCustomerPage(searchForm).then((res) => {
    loading.value = false;
    if (res.success) {
      data.value = res.result.records;
      total.value = res.result.total;
    }
  });
}
function handleLogSearch() {
  logSearchForm.pageNumber = 1;
  if (logDateRange.value && logDateRange.value.length === 2) {
    logSearchForm.startDate = logDateRange.value[0];
    logSearchForm.endDate = logDateRange.value[1];
  } else {
    logSearchForm.startDate = "";
    logSearchForm.endDate = "";
  }
  getLogList();
}
function handleLogPageSizeChange() {
  logSearchForm.pageNumber = 1;
  getLogList();
}
function getLogList() {
  logLoading.value = true;
  getDistributionBindLogPage(logSearchForm).then((res) => {
    logLoading.value = false;
    if (res.success) {
      logData.value = res.result.records;
      logTotal.value = res.result.total;
    }
  });
}
function openRebind(row) {
  rebindForm.value = {
    memberId: row.memberId,
    memberLabel: `${row.memberName || ""}${row.memberMobile ? " / " + row.memberMobile : ""}`,
    distributionId: "",
    remark: "",
  };
  distributorOptions.value = [];
  rebindVisible.value = true;
}
function searchDistributor(query) {
  if (!query) {
    distributorOptions.value = [];
    return;
  }
  distributorLoading.value = true;
  getDistributionListData({
    memberName: query,
    distributionStatus: "PASS",
    pageNumber: 1,
    pageSize: 20,
  }).then((res) => {
    distributorLoading.value = false;
    if (res.success) {
      distributorOptions.value = (res.result.records || []).filter((item) => item.id !== rebindForm.value.distributionId);
    }
  });
}
function submitRebind() {
  rebindFormRef.value.validate((valid) => {
    if (!valid) return;
    rebindSubmitting.value = true;
    rebindDistributionCustomer({
      memberId: rebindForm.value.memberId,
      distributionId: rebindForm.value.distributionId,
      remark: rebindForm.value.remark,
    }).then((res) => {
      rebindSubmitting.value = false;
      if (res.success) {
        Message.success("换绑成功");
        rebindVisible.value = false;
        getDataList();
      }
    }).catch(() => {
      rebindSubmitting.value = false;
    });
  });
}
function viewMemberLog(row) {
  activeTab.value = "log";
  logSearchForm.memberId = row.memberId;
  logSearchForm.memberName = "";
  logSearchForm.pageNumber = 1;
  getLogList();
}

onMounted(() => {
  getDataList();
});
</script>

<style lang="scss" scoped>
.link-text {
  color: #2d8cf0;
  cursor: pointer;
}
.split {
  margin: 0 8px;
  color: #dcdee2;
}
</style>
