<template>
  <div class="search">
    <el-card>
      <el-form ref="searchForm" :model="searchForm" inline label-width="80px">
        <el-form-item label="入库单号">
          <el-input v-model="searchForm.inboundSn" placeholder="入库单号" clearable style="width: 200px" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="mt_10">
      <div class="operation padding-row">
        <el-button type="primary" @click="goCreate">新建入库单</el-button>
      </div>
      <el-table v-loading="loading" :data="data" border class="mt_10" style="width: 100%">
        <el-table-column prop="inboundSn" label="入库单号" width="220" show-overflow-tooltip />
        <el-table-column prop="procurementOrderId" label="采购单ID" width="180" show-overflow-tooltip />
        <el-table-column prop="confirmedQuantity" label="已入库量" width="90" align="center" />
        <el-table-column prop="pendingQuantity" label="待入库量" width="90" align="center" />
        <el-table-column label="入库成本" width="110" align="right">
          <template #default="{ row }">￥{{ formatMoney(row.totalCost) }}</template>
        </el-table-column>
        <el-table-column prop="operatorName" label="操作人" width="120" show-overflow-tooltip />
        <el-table-column prop="inboundTime" label="入库时间" width="170" />
        <el-table-column label="操作" width="100" align="center" fixed="right">
          <template #default="{ row }">
            <a class="link-text" @click="goDetail(row)">查看</a>
          </template>
        </el-table-column>
      </el-table>
      <div class="mt_10" style="display: flex; justify-content: flex-end">
        <el-pagination
          v-model:current-page="searchForm.pageNumber"
          v-model:page-size="searchForm.pageSize"
          :page-sizes="[10, 20, 50]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
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
  name: "procurement-inbound-list",
  data() {
    return {
      loading: false,
      data: [],
      total: 0,
      searchForm: {
        pageNumber: 1,
        pageSize: 10,
        inboundSn: "",
        sort: "createTime",
        order: "desc",
      },
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
    resetSearch() {
      this.searchForm.inboundSn = "";
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
    goCreate() {
      this.$filters.customRouterPush({ name: "procurement-inbound-operation" });
    },
    goDetail(row) {
      this.$filters.customRouterPush({
        name: "procurement-inbound-operation",
        query: { id: row.id, readonly: 1 },
      });
    },
  },
};
</script>
