<template>
  <div class="search">
    <el-card>
      <el-form :model="searchForm" inline label-width="80px">
        <el-form-item label="入库单号">
          <el-input v-model="searchForm.inboundSn" clearable style="width: 200px" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
        </el-form-item>
      </el-form>
      <el-table v-loading="loading" :data="data" border style="width: 100%">
        <el-table-column prop="inboundSn" label="入库单号" width="220" show-overflow-tooltip />
        <el-table-column prop="storeId" label="店铺ID" width="180" show-overflow-tooltip />
        <el-table-column prop="confirmedQuantity" label="已入库" width="90" align="center" />
        <el-table-column label="成本" width="110" align="right">
          <template #default="{ row }">￥{{ formatMoney(row.totalCost) }}</template>
        </el-table-column>
        <el-table-column prop="operatorName" label="操作人" width="120" show-overflow-tooltip />
        <el-table-column prop="inboundTime" label="入库时间" width="170" />
        <el-table-column label="操作" width="80" align="center" fixed="right">
          <template #default="{ row }">
            <a class="link-text" @click="goDetail(row)">详情</a>
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
          @current-change="getDataList"
          @size-change="getDataList"
        />
      </div>
    </el-card>
  </div>
</template>

<script>
import { getProcurementInboundPage } from "@/api/procurement";
import { formatMoney } from "../constants";

export default {
  name: "manager-procurement-inbound-list",
  data() {
    return {
      loading: false,
      data: [],
      total: 0,
      searchForm: { pageNumber: 1, pageSize: 10, inboundSn: "" },
    };
  },
  mounted() {
    this.getDataList();
  },
  methods: {
    formatMoney,
    handleSearch() {
      this.searchForm.pageNumber = 1;
      this.getDataList();
    },
    getDataList() {
      this.loading = true;
      getProcurementInboundPage(this.searchForm)
        .then((res) => {
          if (res.success) {
            this.data = res.result.records || [];
            this.total = res.result.total || 0;
          }
        })
        .finally(() => {
          this.loading = false;
        });
    },
    goDetail(row) {
      this.$router.push({ name: "manager-procurement-inbound-detail", query: { id: row.id } });
    },
  },
};
</script>
