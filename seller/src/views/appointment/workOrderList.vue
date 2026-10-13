<template>
  <div class="search">
    <el-card>
      <el-form ref="searchFormRef" :model="searchForm" inline label-width="80px" @keyup.enter="handleSearch">
        <el-form-item label="工单编号" prop="workOrderSn">
          <el-input v-model="searchForm.workOrderSn" clearable style="width: 200px" />
        </el-form-item>
        <el-form-item label="订单编号" prop="orderSn">
          <el-input v-model="searchForm.orderSn" clearable style="width: 200px" />
        </el-form-item>
        <el-form-item label="预约类型" prop="serviceMode">
          <el-select v-model="searchForm.serviceMode" clearable style="width: 160px">
            <el-option label="到店" value="IN_STORE" />
            <el-option label="上门" value="ON_SITE" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card>
      <el-tabs v-model="statusTab" @tab-click="onTabClick">
        <el-tab-pane
          v-for="item in statusTabs"
          :key="item.value"
          :label="tabLabel(item)"
          :name="item.value"
        />
      </el-tabs>
      <el-table v-loading="loading" :data="data" border class="mt_10" style="width: 100%">
        <el-table-column prop="workOrderSn" label="工单编号" min-width="180" />
        <el-table-column prop="orderSn" label="订单编号" min-width="180" />
        <el-table-column label="预约类型" width="100">
          <template #default="{ row }">{{ serviceModeText(row.serviceMode) }}</template>
        </el-table-column>
        <el-table-column prop="appointmentTime" label="预约时间" min-width="170" />
        <el-table-column prop="staffName" label="服务人员" min-width="110" />
        <el-table-column label="服务状态" width="110">
          <template #default="{ row }">{{ statusText(row.serviceStatus) }}</template>
        </el-table-column>
        <el-table-column label="操作" width="160" fixed="right">
          <template #default="{ row }">
            <el-button
              v-if="row.serviceStatus === 'PENDING_CLAIM'"
              link
              type="primary"
              @click="handleClaim(row)"
            >
              领取
            </el-button>
            <el-button
              v-if="row.serviceStatus === 'IN_SERVICE' && row.serviceMode === 'IN_STORE'"
              link
              type="primary"
              @click="handleEnd(row)"
            >
              结束服务
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="mt_10" style="display: flex; justify-content: flex-end">
        <el-pagination
          v-model:current-page="searchForm.pageNumber"
          v-model:page-size="searchForm.pageSize"
          :total="total"
          layout="total, prev, pager, next"
          size="small"
          @current-change="loadData"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref } from "vue";
import { useRoute } from "vue-router";
import {
  getWorkOrderPage,
  getWorkOrderStatusCounts,
  claimWorkOrder,
  endWorkOrderService,
} from "@/api/appointment";
import { SERVICE_MODE_LABEL, WORK_ORDER_STATUS_LABEL } from "@/constants/appointment";
import { Message } from "@/utils/message";

defineOptions({ name: "appointmentWorkOrderList" });

const route = useRoute();

const loading = ref(false);
const data = ref([]);
const total = ref(0);
const statusTab = ref("ALL");
const statusCounts = ref({});
const searchForm = reactive({
  pageNumber: 1,
  pageSize: 20,
  serviceStatus: "",
  workOrderSn: "",
  orderSn: "",
  serviceMode: "",
});
const statusTabs = ref([
  { value: "ALL", label: "全部" },
  { value: "PENDING_CLAIM", label: "待领取" },
  { value: "WAIT_VERIFY", label: "待核销" },
  { value: "IN_SERVICE", label: "服务中" },
  { value: "SERVICE_ENDED", label: "服务结束" },
  { value: "REFUNDED", label: "已退款" },
]);

// searchFormRef：模板 ref 改名避免与顶层变量互相覆盖
const searchFormRef = ref(null);

onMounted(() => {
  if (route.query.tab) {
    statusTab.value = route.query.tab;
    searchForm.serviceStatus = route.query.tab === "ALL" ? "" : route.query.tab;
  }
  loadCounts();
  loadData();
});

function serviceModeText(v) {
  return SERVICE_MODE_LABEL[v] || v || "—";
}
function statusText(v) {
  return WORK_ORDER_STATUS_LABEL[v] || v || "—";
}
function tabLabel(item) {
  const count = statusCounts.value[item.value];
  return count != null ? `${item.label}(${count})` : item.label;
}
function onTabClick(tab) {
  searchForm.serviceStatus = tab.paneName === "ALL" ? "" : tab.paneName;
  searchForm.pageNumber = 1;
  loadData();
}
function handleSearch() {
  searchForm.pageNumber = 1;
  loadData();
}
function loadCounts() {
  getWorkOrderStatusCounts()
    .then((res) => {
      if (res.success && res.result) {
        statusCounts.value = res.result;
      }
    })
    .catch(() => {});
}
function loadData() {
  loading.value = true;
  getWorkOrderPage(searchForm)
    .then((res) => {
      if (res.success) {
        data.value = res.result?.records || [];
        total.value = res.result?.total || 0;
      }
    })
    .finally(() => {
      loading.value = false;
    });
}
function handleClaim(row) {
  claimWorkOrder(row.id).then((res) => {
    if (res.success) {
      Message.success("领取成功");
      loadCounts();
      loadData();
    }
  });
}
function handleEnd(row) {
  endWorkOrderService(row.id).then((res) => {
    if (res.success) {
      Message.success("已结束服务");
      loadCounts();
      loadData();
    }
  });
}
</script>
