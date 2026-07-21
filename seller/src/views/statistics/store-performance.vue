<template>
  <div class="search">
    <el-card>
      <el-form inline>
        <el-form-item label="日期范围">
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            value-format="YYYY-MM-DD HH:mm:ss"
            :default-time="defaultTime"
            start-placeholder="开始"
            end-placeholder="结束"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="handleExport">导出</el-button>
        </el-form-item>
      </el-form>
    </el-card>
    <el-card class="mt_10">
      <el-table v-loading="loading" border :data="data" style="width: 100%">
        <el-table-column label="序号" width="60" align="center">
          <template #default="{ $index }">
            {{ (params.pageNumber - 1) * params.pageSize + $index + 1 }}
          </template>
        </el-table-column>
        <el-table-column prop="storeName" label="店铺名称" min-width="140" />
        <el-table-column prop="payOrderCount" label="订单支付笔数" width="120" align="right" />
        <el-table-column label="支付金额" width="110" align="right">
          <template #default="{ row }">{{ formatMoney(row.payAmount) }}</template>
        </el-table-column>
        <el-table-column label="营业额" width="110" align="right">
          <template #default="{ row }">{{ formatMoney(row.turnover) }}</template>
        </el-table-column>
        <el-table-column label="优惠金额" width="110" align="right">
          <template #default="{ row }">{{ formatMoney(row.discountAmount) }}</template>
        </el-table-column>
        <el-table-column label="折扣率" width="90" align="right">
          <template #default="{ row }">{{ formatPercent(row.discountRate) }}</template>
        </el-table-column>
        <el-table-column label="营业收入" width="110" align="right">
          <template #default="{ row }">{{ formatMoney(row.operatingIncome) }}</template>
        </el-table-column>
        <el-table-column label="营业收入占比" width="120" align="right">
          <template #default="{ row }">{{ formatPercent(row.operatingIncomePercent) }}</template>
        </el-table-column>
        <el-table-column label="笔单价" width="100" align="right">
          <template #default="{ row }">{{ formatMoney(row.avgOrderPrice) }}</template>
        </el-table-column>
        <el-table-column prop="refundCount" label="退款笔数" width="100" align="right" />
        <el-table-column label="订单退款金额" width="120" align="right">
          <template #default="{ row }">{{ formatMoney(row.refundAmount) }}</template>
        </el-table-column>
        <el-table-column prop="orderConversionRate" label="下单转化率" width="110" align="right" />
        <el-table-column prop="payConversionRate" label="支付转化率" width="110" align="right" />
        <el-table-column label="环比差额" width="110" align="right">
          <template #default="{ row }">{{ formatMoney(row.momDiff) }}</template>
        </el-table-column>
        <el-table-column label="环比增长率" width="110" align="right">
          <template #default="{ row }">
            <span :class="rateClass(row.momRate)">{{ row.momRate || "0%" }}</span>
          </template>
        </el-table-column>
        <el-table-column label="同比差额" width="110" align="right">
          <template #default="{ row }">{{ formatMoney(row.yoyDiff) }}</template>
        </el-table-column>
        <el-table-column label="同比增长率" width="110" align="right">
          <template #default="{ row }">
            <span :class="rateClass(row.yoyRate)">{{ row.yoyRate || "0%" }}</span>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        v-model:current-page="params.pageNumber"
        v-model:page-size="params.pageSize"
        class="mt_10"
        :total="total"
        :page-sizes="[20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        @current-change="loadData"
        @size-change="loadData"
      />
    </el-card>
  </div>
</template>

<script>
import * as API_Statistics from "@/api/statistics";
import { downloadBlob } from "@/utils/downloadBlob";

export default {
  name: "seller-store-performance-report",
  data() {
    return {
      loading: false,
      dateRange: [],
      defaultTime: [new Date(2000, 0, 1, 0, 0, 0), new Date(2000, 0, 1, 23, 59, 59)],
      params: { pageNumber: 1, pageSize: 20 },
      data: [],
      total: 0,
    };
  },
  mounted() {
    this.initDefaultRange();
    this.loadData();
  },
  methods: {
    initDefaultRange() {
      const end = new Date();
      const start = new Date();
      start.setDate(start.getDate() - 6);
      this.dateRange = [this.formatDate(start, true), this.formatDate(end, false)];
    },
    formatDate(date, startOfDay) {
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, "0");
      const d = String(date.getDate()).padStart(2, "0");
      return startOfDay ? `${y}-${m}-${d} 00:00:00` : `${y}-${m}-${d} 23:59:59`;
    },
    buildParams() {
      const p = { ...this.params };
      if (this.dateRange && this.dateRange.length === 2) {
        p.startTime = this.dateRange[0];
        p.endTime = this.dateRange[1];
      }
      return p;
    },
    handleSearch() {
      this.params.pageNumber = 1;
      this.loadData();
    },
    loadData() {
      this.loading = true;
      API_Statistics.getStorePerformanceReport(this.buildParams()).then((res) => {
        this.loading = false;
        if (res.success) {
          this.data = res.result.records || [];
          this.total = res.result.total || 0;
        }
      });
    },
    handleExport() {
      API_Statistics.exportStorePerformanceReport(this.buildParams()).then((blob) => {
        downloadBlob(blob, "店铺业绩报表.xlsx");
      });
    },
    formatMoney(val) {
      return this.$filters.unitPrice(val, "￥");
    },
    formatPercent(val) {
      if (val == null || val === "") return "0%";
      return `${Number(val).toFixed(2)}%`;
    },
    rateClass(rate) {
      if (!rate) return "";
      if (rate.startsWith("+")) return "trend-up";
      if (rate.startsWith("-") && rate !== "0%") return "trend-down";
      return "";
    },
  },
};
</script>

<style scoped>
.trend-up {
  color: #f56c6c;
}
.trend-down {
  color: #67c23a;
}
</style>
