<template>
  <div class="search">
    <el-card>
      <el-form :model="searchForm" inline @keyup.enter="handleSearch">
        <el-form-item label="订单编号">
          <el-input v-model="searchForm.orderSn" clearable style="width: 200px" />
        </el-form-item>
        <el-form-item label="工单编号">
          <el-input v-model="searchForm.workOrderSn" clearable style="width: 200px" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.serviceStatus" clearable placeholder="全部" style="width: 160px">
            <el-option v-for="item in statusOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
        </el-form-item>
      </el-form>
    </el-card>
    <el-card class="mt_10">
      <el-table v-loading="loading" :data="data" border>
        <el-table-column prop="workOrderSn" label="工单编号" min-width="180" />
        <el-table-column prop="orderSn" label="订单编号" min-width="180" />
        <el-table-column prop="storeName" label="店铺" min-width="140" />
        <el-table-column label="服务方式" width="100">
          <template #default="{ row }">{{ row.serviceMode === 'ON_SITE' ? '上门' : '到店' }}</template>
        </el-table-column>
        <el-table-column prop="appointmentTime" label="预约时间" min-width="170" />
        <el-table-column label="状态" width="120">
          <template #default="{ row }">{{ statusText(row.serviceStatus) }}</template>
        </el-table-column>
      </el-table>
      <el-pagination
        class="mt_10"
        v-model:current-page="searchForm.pageNumber"
        v-model:page-size="searchForm.pageSize"
        :total="total"
        layout="total, prev, pager, next"
        @current-change="getData"
      />
    </el-card>
  </div>
</template>

<script setup>
import { onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import { getManagerWorkOrderPage } from "@/api/appointment";

defineOptions({ name: "managerAppointmentWorkOrders" });

const route = useRoute();

const STATUS_OPTIONS = [
  { label: "未完成", value: "OPEN" },
  { label: "待领取", value: "PENDING_CLAIM" },
  { label: "已领取", value: "CLAIMED" },
  { label: "待核销", value: "WAIT_VERIFY" },
  { label: "服务中", value: "IN_SERVICE" },
  { label: "服务结束", value: "SERVICE_ENDED" },
  { label: "已退款", value: "REFUNDED" },
  { label: "逾期未到店", value: "NO_SHOW" },
];

const loading = ref(false);
const data = ref([]);
const total = ref(0);
const statusOptions = ref(STATUS_OPTIONS);
const searchForm = ref({
  pageNumber: 1,
  pageSize: 10,
  orderSn: "",
  workOrderSn: "",
  serviceStatus: "",
});

onMounted(() => {
  const status = route.query.serviceStatus;
  if (status) {
    searchForm.value.serviceStatus = status;
  }
  getData();
});

function statusText(value) {
  const found = STATUS_OPTIONS.find((item) => item.value === value);
  return found ? found.label : value || "—";
}
function handleSearch() {
  searchForm.value.pageNumber = 1;
  getData();
}
function getData() {
  loading.value = true;
  getManagerWorkOrderPage(searchForm.value)
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
</script>
