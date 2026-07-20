<template>
  <div class="search">
    <el-card>
      <el-form inline>
        <el-form-item label="发生日期">
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            value-format="YYYY-MM-DD HH:mm:ss"
            :default-time="defaultTime"
            start-placeholder="开始"
            end-placeholder="结束"
          />
        </el-form-item>
        <el-form-item label="订单号">
          <el-input v-model="params.orderSn" clearable placeholder="订单编号" style="width: 160px" />
        </el-form-item>
        <el-form-item label="买家">
          <el-input v-model="params.memberName" clearable placeholder="买家名称" style="width: 140px" />
        </el-form-item>
        <el-form-item label="商品关键词">
          <el-input v-model="params.keyword" clearable placeholder="商品名称" style="width: 160px" />
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
        <el-table-column prop="orderRefundSn" label="订单编号|售后单号" min-width="200" show-overflow-tooltip />
        <el-table-column prop="occurTime" label="发生时间" width="160" />
        <el-table-column prop="flowTypeName" label="交易类型" width="90" />
        <el-table-column prop="num" label="成交数量" width="90" align="right" />
        <el-table-column label="成交金额" width="110" align="right">
          <template #default="{ row }">{{ formatMoney(row.transactionAmount) }}</template>
        </el-table-column>
        <el-table-column label="售价金额" width="110" align="right">
          <template #default="{ row }">{{ formatMoney(row.salePriceAmount) }}</template>
        </el-table-column>
        <el-table-column label="优惠金额" width="110" align="right">
          <template #default="{ row }">{{ formatMoney(row.discountAmount) }}</template>
        </el-table-column>
        <el-table-column prop="paymentDetail" label="收款明细" width="120" show-overflow-tooltip />
        <el-table-column prop="discountDetail" label="优惠明细" min-width="160" show-overflow-tooltip />
        <el-table-column label="订单来源" width="100">
          <template #default="{ row }">{{ clientTypeText(row.clientType) }}</template>
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
  name: "seller-sales-order-detail-report",
  data() {
    return {
      loading: false,
      dateRange: [],
      defaultTime: [new Date(2000, 0, 1, 0, 0, 0), new Date(2000, 0, 1, 23, 59, 59)],
      params: {
        pageNumber: 1,
        pageSize: 20,
        orderSn: "",
        memberName: "",
        keyword: "",
      },
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
      API_Statistics.getSalesOrderDetailReport(this.buildParams()).then((res) => {
        this.loading = false;
        if (res.success) {
          this.data = res.result.records || [];
          this.total = res.result.total || 0;
        }
      });
    },
    handleExport() {
      API_Statistics.exportSalesOrderDetailReport(this.buildParams()).then((blob) => {
        downloadBlob(blob, "销售订单明细报表.xlsx");
      });
    },
    formatMoney(val) {
      return this.$filters.unitPrice(val, "￥");
    },
    clientTypeText(val) {
      const map = {
        H5: "移动端",
        PC: "PC端",
        WECHAT_MP: "小程序",
        APP: "移动应用端",
        UNKNOWN: "未知",
      };
      return map[val] || val || "";
    },
  },
};
</script>
