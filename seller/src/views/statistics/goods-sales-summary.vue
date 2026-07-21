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
        <el-form-item label="商品关键词">
          <el-input v-model="params.keyword" clearable placeholder="商品名称" style="width: 180px" />
        </el-form-item>
        <el-form-item label="排序">
          <el-select v-model="params.sortType" style="width: 120px">
            <el-option label="按销售额" value="PRICE" />
            <el-option label="按销量" value="NUM" />
          </el-select>
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
        <el-table-column prop="goodsName" label="销售商品" min-width="160" />
        <el-table-column prop="goodsId" label="商品ID" width="140" />
        <el-table-column prop="salesNum" label="商品销售数量" width="110" />
        <el-table-column prop="salesAmount" label="商品销售金额" width="120">
          <template #default="{ row }">{{ formatMoney(row.salesAmount) }}</template>
        </el-table-column>
        <el-table-column prop="refundNum" label="商品退货数量" width="110" />
        <el-table-column prop="refundAmount" label="商品退款金额" width="120">
          <template #default="{ row }">{{ formatMoney(row.refundAmount) }}</template>
        </el-table-column>
        <el-table-column prop="netNum" label="商品净销售数量" width="140" />
        <el-table-column prop="netAmount" label="商品净销售金额" width="145">
          <template #default="{ row }">{{ formatMoney(row.netAmount) }}</template>
        </el-table-column>
        <el-table-column prop="netAmountPercent" label="占净销售金额百分比" width="150">
          <template #default="{ row }">{{ formatPercent(row.netAmountPercent) }}</template>
        </el-table-column>
        <el-table-column prop="avgPrice" label="商品平均单价" width="120">
          <template #default="{ row }">{{ formatMoney(row.avgPrice) }}</template>
        </el-table-column>
        <el-table-column prop="salePriceAmount" label="商品售价金额" width="120">
          <template #default="{ row }">{{ formatMoney(row.salePriceAmount) }}</template>
        </el-table-column>
        <el-table-column prop="discountAmount" label="商品优惠金额" width="120">
          <template #default="{ row }">{{ formatMoney(row.discountAmount) }}</template>
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
  name: "seller-goods-sales-summary-report",
  data() {
    return {
      loading: false,
      dateRange: [],
      defaultTime: [new Date(2000, 0, 1, 0, 0, 0), new Date(2000, 0, 1, 23, 59, 59)],
      params: { pageNumber: 1, pageSize: 20, keyword: "", sortType: "PRICE" },
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
      API_Statistics.getGoodsSalesSummaryReport(this.buildParams()).then((res) => {
        this.loading = false;
        if (res.success) {
          this.data = res.result.records || [];
          this.total = res.result.total || 0;
        }
      });
    },
    handleExport() {
      API_Statistics.exportGoodsSalesSummaryReport(this.buildParams()).then((blob) => {
        downloadBlob(blob, "商品销售汇总报表.xlsx");
      });
    },
    formatMoney(val) {
      return this.$filters.unitPrice(val, "￥");
    },
    formatPercent(val) {
      if (val == null || val === "") return "0%";
      return `${Number(val).toFixed(2)}%`;
    },
  },
};
</script>
