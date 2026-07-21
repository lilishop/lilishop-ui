<template>
  <div class="search">
    <el-card>
      <el-form inline class="goods-comparison-form">
        <div class="filter-row">
          <el-form-item label="时间类型">
            <el-radio-group v-model="dateType" @change="onDateTypeChange">
              <el-radio value="DAY">日</el-radio>
              <el-radio value="PERIOD">指定周期</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item v-if="dateType === 'DAY'" label="日期">
            <el-date-picker
              v-model="queryDate"
              type="date"
              value-format="YYYY-MM-DD"
              placeholder="选择日期"
              style="width: 160px"
            />
          </el-form-item>
          <el-form-item v-else label="日期范围">
            <el-date-picker
              v-model="dateRange"
              type="daterange"
              value-format="YYYY-MM-DD HH:mm:ss"
              :default-time="defaultTime"
              start-placeholder="开始"
              end-placeholder="结束"
            />
          </el-form-item>
        </div>
        <div class="filter-row">
          <el-form-item label="商品分类">
            <el-cascader
              v-model="params.categoryId"
              :options="categoryList"
              :props="categoryProps"
              clearable
              filterable
              placeholder="全部分类"
              style="width: 200px"
            />
          </el-form-item>
          <el-form-item label="品牌">
            <el-select v-model="params.brandId" clearable filterable placeholder="全部品牌" style="width: 160px">
              <el-option v-for="item in brandList" :key="item.id" :label="item.name" :value="item.id" />
            </el-select>
          </el-form-item>
          <el-form-item label="商品名称">
            <el-input v-model="params.keyword" clearable placeholder="商品名称" style="width: 160px" />
          </el-form-item>
        </div>
        <div class="filter-row">
          <el-form-item label="订单来源">
            <el-select v-model="params.clientType" clearable placeholder="全部来源" style="width: 140px">
              <el-option v-for="item in clientTypeOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
        </div>
        <div class="filter-row">
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
        </div>
      </el-form>
    </el-card>
    <el-card class="mt_10">
      <el-table v-loading="loading" border :data="data" style="width: 100%">
        <el-table-column label="序号" width="60" align="center">
          <template #default="{ $index }">
            {{ (params.pageNumber - 1) * params.pageSize + $index + 1 }}
          </template>
        </el-table-column>
        <el-table-column prop="goodsName" label="商品名称" min-width="160" />
        <el-table-column prop="reportTime" label="时间" width="200" />
        <el-table-column label="商品销售金额" width="120" align="right">
          <template #default="{ row }">{{ formatMoney(row.salesAmount) }}</template>
        </el-table-column>
        <el-table-column label="商品销售总金额" width="130" align="right">
          <template #default="{ row }">{{ formatMoney(row.totalSalesAmount) }}</template>
        </el-table-column>
        <el-table-column label="占比" width="90" align="right">
          <template #default="{ row }">{{ formatPercent(row.amountPercent) }}</template>
        </el-table-column>
        <el-table-column label="环比" width="110" align="right">
          <template #default="{ row }">{{ formatMoney(row.momAmount) }}</template>
        </el-table-column>
        <el-table-column label="环比率" width="90" align="right">
          <template #default="{ row }">
            <span :class="rateClass(row.momRate)">{{ row.momRate || "0%" }}</span>
          </template>
        </el-table-column>
        <el-table-column label="环比差额" width="110" align="right">
          <template #default="{ row }">{{ formatMoney(row.momDiff) }}</template>
        </el-table-column>
        <el-table-column label="同比" width="110" align="right">
          <template #default="{ row }">{{ formatMoney(row.yoyAmount) }}</template>
        </el-table-column>
        <el-table-column label="同比率" width="90" align="right">
          <template #default="{ row }">
            <span :class="rateClass(row.yoyRate)">{{ row.yoyRate || "0%" }}</span>
          </template>
        </el-table-column>
        <el-table-column label="同比差额" width="110" align="right">
          <template #default="{ row }">{{ formatMoney(row.yoyDiff) }}</template>
        </el-table-column>
        <el-table-column prop="salesNum" label="商品销售数" width="110" align="right" />
        <el-table-column label="销售占比" width="90" align="right">
          <template #default="{ row }">{{ formatPercent(row.salesNumPercent) }}</template>
        </el-table-column>
        <el-table-column prop="storeName" label="店铺名称" width="140" />
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
import { getBrandListData, getCategoryTree } from "@/api/goods";
import { downloadBlob } from "@/utils/downloadBlob";

const CLIENT_TYPE_OPTIONS = [
  { label: "移动端", value: "H5" },
  { label: "PC端", value: "PC" },
  { label: "小程序", value: "WECHAT_MP" },
  { label: "移动应用端", value: "APP" },
  { label: "未知", value: "UNKNOWN" },
];

export default {
  name: "seller-goods-comparison-report",
  data() {
    return {
      loading: false,
      dateType: "DAY",
      queryDate: "",
      dateRange: [],
      defaultTime: [new Date(2000, 0, 1, 0, 0, 0), new Date(2000, 0, 1, 23, 59, 59)],
      params: {
        pageNumber: 1,
        pageSize: 20,
        categoryId: "",
        brandId: "",
        clientType: "",
        keyword: "",
        sortType: "PRICE",
      },
      categoryList: [],
      categoryProps: { value: "id", label: "name", children: "children", checkStrictly: true, emitPath: false },
      brandList: [],
      clientTypeOptions: CLIENT_TYPE_OPTIONS,
      data: [],
      total: 0,
    };
  },
  mounted() {
    this.initDefaultRange();
    this.loadOptions();
    this.loadData();
  },
  methods: {
    initDefaultRange() {
      const today = new Date();
      this.queryDate = this.formatDay(today);
      const end = new Date();
      const start = new Date();
      start.setDate(start.getDate() - 6);
      this.dateRange = [this.formatDate(start, true), this.formatDate(end, false)];
    },
    formatDay(date) {
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, "0");
      const d = String(date.getDate()).padStart(2, "0");
      return `${y}-${m}-${d}`;
    },
    onDateTypeChange() {
      if (this.dateType === "DAY" && !this.queryDate) {
        this.queryDate = this.formatDay(new Date());
      }
    },
    loadOptions() {
      getCategoryTree().then((res) => {
        if (res.success) this.categoryList = res.result || [];
      });
      getBrandListData().then((res) => {
        if (res.success) this.brandList = res.result || [];
      });
    },
    formatDate(date, startOfDay) {
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, "0");
      const d = String(date.getDate()).padStart(2, "0");
      return startOfDay ? `${y}-${m}-${d} 00:00:00` : `${y}-${m}-${d} 23:59:59`;
    },
    buildParams() {
      const p = { ...this.params, reportDateType: this.dateType };
      if (this.dateType === "DAY") {
        if (this.queryDate) {
          p.queryDate = `${this.queryDate} 00:00:00`;
        }
      } else if (this.dateRange && this.dateRange.length === 2) {
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
      API_Statistics.getGoodsComparisonReport(this.buildParams()).then((res) => {
        this.loading = false;
        if (res.success) {
          this.data = res.result.records || [];
          this.total = res.result.total || 0;
        }
      });
    },
    handleExport() {
      API_Statistics.exportGoodsComparisonReport(this.buildParams()).then((blob) => {
        downloadBlob(blob, "商品同比环比报表.xlsx");
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
.goods-comparison-form .filter-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  width: 100%;
}
.goods-comparison-form .filter-row + .filter-row {
  margin-top: 8px;
}
.trend-up {
  color: #f56c6c;
}
.trend-down {
  color: #67c23a;
}
</style>
