<template>
  <div class="search">
    <el-card>
      <el-form :model="searchForm" inline label-width="80px">
        <el-form-item label="店铺ID">
          <el-input v-model="searchForm.storeId" clearable style="width: 200px" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" clearable style="width: 160px">
            <el-option v-for="(label, value) in DAMAGE_STATUS" :key="value" :label="label" :value="value" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
        </el-form-item>
      </el-form>
      <el-table v-loading="loading" :data="data" border style="width: 100%">
        <el-table-column prop="sn" label="报损单号" width="220" show-overflow-tooltip />
        <el-table-column prop="storeId" label="店铺ID" width="180" show-overflow-tooltip />
        <el-table-column prop="totalQuantity" label="数量" width="90" align="center" />
        <el-table-column label="金额" width="110" align="right">
          <template #default="{ row }">￥{{ formatMoney(row.totalAmount) }}</template>
        </el-table-column>
        <el-table-column label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="damageStatusTag(row.status)">{{ damageStatusText(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="170" />
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
import { getDamageReportPage } from "@/api/procurement";
import { DAMAGE_STATUS, damageStatusText, damageStatusTag, formatMoney } from "../constants";

export default {
  name: "manager-damage-report-list",
  data() {
    return {
      DAMAGE_STATUS,
      loading: false,
      data: [],
      total: 0,
      searchForm: { pageNumber: 1, pageSize: 10, storeId: "", status: "" },
    };
  },
  mounted() {
    this.getDataList();
  },
  methods: {
    damageStatusText,
    damageStatusTag,
    formatMoney,
    handleSearch() {
      this.searchForm.pageNumber = 1;
      this.getDataList();
    },
    getDataList() {
      this.loading = true;
      getDamageReportPage(this.searchForm)
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
      this.$router.push({ name: "manager-damage-report-detail", query: { id: row.id } });
    },
  },
};
</script>
