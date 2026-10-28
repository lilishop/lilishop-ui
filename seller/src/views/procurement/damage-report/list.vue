<template>
  <div class="search">
    <el-card>
      <el-form ref="searchFormRef" :model="searchForm" inline label-width="80px">
        <el-form-item label="创建时间">
          <el-date-picker
            v-model="dateRange"
            type="datetimerange"
            value-format="YYYY-MM-DD HH:mm:ss"
            start-placeholder="开始"
            end-placeholder="结束"
            style="width: 360px"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="mt_10">
      <div class="order-tab">
        <el-tabs v-model="currentStatus" @tab-click="onStatusTabClick">
          <el-tab-pane
            v-for="item in statusTabs"
            :key="item.value"
            :label="item.title"
            :name="item.value"
          />
        </el-tabs>
      </div>
      <div class="operation padding-row">
        <el-button type="primary" @click="goCreate">新建报损单</el-button>
      </div>
      <el-table v-loading="loading" :data="data" border class="mt_10" style="width: 100%">
        <el-table-column prop="sn" label="报损单号" width="220" show-overflow-tooltip />
        <el-table-column prop="totalQuantity" label="报损数量" width="90" align="center" />
        <el-table-column label="报损金额" width="110" align="right">
          <template #default="{ row }">￥{{ formatMoney(row.totalAmount) }}</template>
        </el-table-column>
        <el-table-column prop="damageDate" label="报损日期" width="120" />
        <el-table-column label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="damageStatusTag(row.status)">{{ damageStatusText(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="170" />
        <el-table-column label="操作" width="260" align="right" fixed="right">
          <template #default="{ row }">
            <a class="link-text" @click="goDetail(row)">查看</a>
            <template v-if="row.status === 'DRAFT'">
              <span class="op-split">|</span>
              <a class="link-text" @click="handleSubmit(row)">提交</a>
            </template>
            <template v-if="row.status === 'SUBMITTED'">
              <span class="op-split">|</span>
              <a class="link-text" @click="handleApprove(row)">通过</a>
              <span class="op-split">|</span>
              <a class="link-text" @click="handleReject(row)">驳回</a>
            </template>
            <template v-if="row.status === 'APPROVED'">
              <span class="op-split">|</span>
              <a class="link-text" @click="handleComplete(row)">完成报损</a>
            </template>
            <template v-if="['DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED'].includes(row.status)">
              <span class="op-split">|</span>
              <a class="link-text" @click="handleCancel(row)">作废</a>
            </template>
          </template>
        </el-table-column>
      </el-table>
      <div class="mt_10" style="display: flex; justify-content: flex-end">
        <el-pagination
          v-model:current-page="searchForm.pageNumber"
          v-model:page-size="searchForm.pageSize"
          :page-sizes="[10, 20, 50]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          size="small"
          @current-change="getDataList"
          @size-change="getDataList"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";
import { useTable } from "@/utils/useTable";
import { ElMessageBox } from "element-plus";
import {
  getDamageReportPage,
  getDamageReportStatusCount,
  submitDamageReport,
  approveDamageReport,
  rejectDamageReport,
  cancelDamageReport,
  completeDamageReport,
} from "@/api/procurement";
import {
  DAMAGE_STATUS,
  damageStatusText,
  damageStatusTag,
  formatMoney,
} from "../constants";
import { Message, Modal } from "@/utils/message";
import { customRouterPush } from "@/utils/filters";

defineOptions({ name: "procurement-damage-report-list" });

// searchFormRef：模板 ref 改名避免与顶层变量互相覆盖
const searchFormRef = ref(null);

const dateRange = ref([]);
const currentStatus = ref("ALL");
const statusCountData = ref({});
const {
  loading,
  data,
  total,
  searchForm,
  getDataList,
  handleSearch: search,
  resetSearch: reset,
} = useTable(getDamageReportPage, {
  form: { status: "" },
  immediate: false,
  beforeRequest: (p) => buildSearchParams(true, p),
});

const statusTabs = computed(() => {
  const tabs = [{ title: "全部", value: "ALL" }];
  Object.keys(DAMAGE_STATUS).forEach((key) => {
    const count = statusCountData.value[key];
    const label = DAMAGE_STATUS[key];
    tabs.push({
      title: count ? `${label}（${count}）` : label,
      value: key,
    });
  });
  return tabs;
});

onMounted(() => {
  init();
});

function init() {
  getStatusCount();
  getDataList();
}

function buildSearchParams(includeStatus = true, base = searchForm) {
  const params = { ...base };
  if (!includeStatus) {
    delete params.status;
  }
  if (dateRange.value && dateRange.value.length === 2) {
    params.startDate = dateRange.value[0];
    params.endDate = dateRange.value[1];
  }
  return params;
}

function handleSearch() {
  getStatusCount();
  search();
}

function resetSearch() {
  dateRange.value = [];
  currentStatus.value = "ALL";
  getStatusCount();
  reset();
}

function onStatusTabClick(tab) {
  statusClick(tab.paneName);
}

function statusClick(name) {
  if (name === "ALL" || name === "" || name === undefined) {
    searchForm.status = "";
    currentStatus.value = "ALL";
  } else {
    searchForm.status = name;
    currentStatus.value = name;
  }
  searchForm.pageNumber = 1;
  getDataList();
}

function getStatusCount() {
  getDamageReportStatusCount(buildSearchParams(false)).then((res) => {
    if (res.success) {
      statusCountData.value = res.result || {};
    }
  });
}

function refreshList() {
  getStatusCount();
  getDataList();
}

function goCreate() {
  customRouterPush({ name: "procurement-damage-report-operation" });
}

function goDetail(row) {
  customRouterPush({
    name: "procurement-damage-report-operation",
    query: { id: row.id, readonly: 1 },
  });
}

function handleSubmit(row) {
  Modal.confirm({
    title: "提交报损单",
    content: "确认提交该报损单？",
    onOk: () => {
      submitDamageReport(row.id).then((res) => {
        if (res.success) {
          Message.success("提交成功");
          refreshList();
        }
      });
    },
  });
}

function handleApprove(row) {
  Modal.confirm({
    title: "审核通过",
    content: "确认通过该报损单？",
    onOk: () => {
      approveDamageReport(row.id).then((res) => {
        if (res.success) {
          Message.success("审核通过");
          refreshList();
        }
      });
    },
  });
}

function handleReject(row) {
  ElMessageBox.prompt("请输入驳回原因", "驳回报损单", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    inputPlaceholder: "驳回原因",
  })
    .then(({ value }) => {
      rejectDamageReport(row.id, value || "驳回").then((res) => {
        if (res.success) {
          Message.success("已驳回");
          refreshList();
        }
      });
    })
    .catch(() => {});
}

function handleCancel(row) {
  Modal.confirm({
    title: "作废报损单",
    content: "确认作废该报损单？",
    onOk: () => {
      cancelDamageReport(row.id).then((res) => {
        if (res.success) {
          Message.success("已作废");
          refreshList();
        }
      });
    },
  });
}

function handleComplete(row) {
  Modal.confirm({
    title: "完成报损",
    content: "完成后将扣减库存，是否继续？",
    onOk: () => {
      completeDamageReport(row.id).then((res) => {
        if (res.success) {
          Message.success("报损完成，库存已扣减");
          refreshList();
        }
      });
    },
  });
}
</script>

<style scoped>
.op-split {
  margin: 0 6px;
  color: #dcdfe6;
}
.order-tab :deep(.el-tabs__item) {
  font-size: 14px;
}
</style>
