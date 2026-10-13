<template>
  <div class="search">
    <el-card>
      <el-form inline>
        <el-form-item label="日期范围">
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            value-format="YYYY-MM-DD"
            start-placeholder="开始"
            end-placeholder="结束"
          />
        </el-form-item>
        <el-form-item label="粒度">
          <el-select v-model="params.granularity" style="width: 120px">
            <el-option label="按日" value="DAY" />
            <el-option label="按月" value="MONTH" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="loadData">查询</el-button>
          <el-button @click="handleExport">导出</el-button>
        </el-form-item>
      </el-form>
    </el-card>
    <el-card class="mt_10">
      <el-table v-loading="loading" border :data="data" style="width: 100%">
        <el-table-column prop="period" label="周期" width="120" />
        <el-table-column prop="gmv" label="GMV" width="110" />
        <el-table-column prop="refundAmount" label="退款" width="110" />
        <el-table-column prop="netGmv" label="净GMV" width="110" />
        <el-table-column prop="commissionIncome" label="佣金收入" width="110" />
        <el-table-column prop="couponSubsidy" label="券补贴" width="110" />
        <el-table-column prop="giftCardSubsidy" label="礼品卡补贴" width="120" />
        <el-table-column prop="distributionExpense" label="分销支出" width="110" />
        <el-table-column prop="storeSettlementTotal" label="商家应结" width="120" />
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { onMounted, ref } from "vue";
import * as API_Finance from "@/api/finance";
import { downloadBlob } from "@/utils/downloadBlob";

defineOptions({ name: "finance-platform-report" });

const loading = ref(false);
const dateRange = ref([]);
const params = ref({ granularity: "DAY" });
const data = ref([]);

onMounted(() => {
  loadData();
});

function buildParams() {
  const p = { ...params.value };
  if (dateRange.value && dateRange.value.length === 2) {
    p.startDate = dateRange.value[0];
    p.endDate = dateRange.value[1];
  }
  return p;
}
function loadData() {
  loading.value = true;
  API_Finance.getPlatformReport(buildParams()).then((res) => {
    loading.value = false;
    if (res.success) data.value = res.result || [];
  });
}
function handleExport() {
  API_Finance.exportPlatformReport(buildParams()).then((blob) => {
    downloadBlob(blob, "平台经营报表.xlsx");
  });
}
</script>
