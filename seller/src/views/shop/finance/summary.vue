<template>
  <div class="search">
    <el-card>
      <el-form inline>
        <el-form-item label="日期范围">
          <el-date-picker v-model="dateRange" type="daterange" value-format="YYYY-MM-DD" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="loadData">查询</el-button>
          <el-button @click="handleExport">导出</el-button>
          <el-button @click="exportFlow">导出流水</el-button>
        </el-form-item>
      </el-form>
    </el-card>
    <el-card class="mt_10" v-if="summary">
      <el-descriptions title="本店周期汇总" :column="2" border>
        <el-descriptions-item label="店铺">{{ summary.storeName }}</el-descriptions-item>
        <el-descriptions-item label="订单实付">{{ summary.orderPrice }}</el-descriptions-item>
        <el-descriptions-item label="退款">{{ summary.refundPrice }}</el-descriptions-item>
        <el-descriptions-item label="平台服务费">{{ summary.commissionPrice }}</el-descriptions-item>
        <el-descriptions-item label="分销佣金">{{ summary.distributionCommission }}</el-descriptions-item>
        <el-descriptions-item label="券补贴">{{ summary.siteCouponCommission }}</el-descriptions-item>
        <el-descriptions-item label="礼品卡补贴">{{ summary.giftCardSubsidy }}</el-descriptions-item>
        <el-descriptions-item label="应结金额">{{ summary.billPrice }}</el-descriptions-item>
      </el-descriptions>
    </el-card>
  </div>
</template>

<script setup>
import { onMounted, ref } from "vue";
import * as API_Finance from "@/api/finance";
import { downloadBlob } from "@/utils/downloadBlob";

defineOptions({ name: "shop-finance-summary" });

const dateRange = ref([]);
const summary = ref(null);

onMounted(() => {
  loadData();
});

function buildParams() {
  const p = {};
  if (dateRange.value?.length === 2) {
    p.startDate = dateRange.value[0];
    p.endDate = dateRange.value[1];
  }
  return p;
}

function loadData() {
  API_Finance.getStoreSummary(buildParams()).then((res) => {
    if (res.success) summary.value = res.result;
  });
}

function handleExport() {
  API_Finance.exportStoreSummary(buildParams()).then((blob) => {
    downloadBlob(blob, "店铺周期汇总.xlsx");
  });
}

function exportFlow() {
  API_Finance.exportStoreFlow(buildParams()).then((blob) => {
    downloadBlob(blob, "店铺流水.xlsx");
  });
}
</script>
