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
        </el-form-item>
      </el-form>
    </el-card>
    <el-card class="mt_10">
      <el-table v-loading="loading" border :data="data">
        <el-table-column prop="period" label="日期" width="120" />
        <el-table-column prop="paymentName" label="支付方式" width="140" />
        <el-table-column prop="payCount" label="支付笔数" width="100" />
        <el-table-column prop="payAmount" label="支付金额" width="120" />
        <el-table-column prop="refundCount" label="退款笔数" width="100" />
        <el-table-column prop="refundAmount" label="退款金额" width="120" />
      </el-table>
    </el-card>
  </div>
</template>

<script>
import * as API_Finance from "@/api/finance";
import { downloadBlob } from "@/utils/downloadBlob";

export default {
  name: "finance-payment-method",
  data() {
    return { loading: false, dateRange: [], data: [] };
  },
  mounted() {
    this.loadData();
  },
  methods: {
    buildParams() {
      const p = {};
      if (this.dateRange?.length === 2) {
        p.startDate = this.dateRange[0];
        p.endDate = this.dateRange[1];
      }
      return p;
    },
    loadData() {
      this.loading = true;
      API_Finance.getPaymentMethodReport(this.buildParams()).then((res) => {
        this.loading = false;
        if (res.success) this.data = res.result || [];
      });
    },
    handleExport() {
      API_Finance.exportPaymentMethodReport(this.buildParams()).then((blob) => {
        downloadBlob(blob, "支付方式汇总.xlsx");
      });
    },
  },
};
</script>
