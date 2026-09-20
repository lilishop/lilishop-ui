<template>
  <div class="search">
    <el-card>
      <el-form :model="searchForm" inline @keyup.enter="handleSearch">
        <el-form-item label="订单编号">
          <el-input v-model="searchForm.orderSn" clearable style="width: 200px" />
        </el-form-item>
        <el-form-item label="工单编号">
          <el-input v-model="searchForm.workOrderSn" clearable style="width: 200px" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
        </el-form-item>
      </el-form>
    </el-card>
    <el-card class="mt_10">
      <el-table v-loading="loading" :data="data" border>
        <el-table-column prop="workOrderSn" label="工单编号" min-width="180" />
        <el-table-column prop="orderSn" label="订单编号" min-width="180" />
        <el-table-column prop="storeName" label="店铺" min-width="140" />
        <el-table-column label="服务方式" width="100">
          <template #default="{ row }">{{ row.serviceMode === 'ON_SITE' ? '上门' : '到店' }}</template>
        </el-table-column>
        <el-table-column prop="appointmentTime" label="预约时间" min-width="170" />
        <el-table-column prop="serviceStatus" label="状态" width="120" />
      </el-table>
      <el-pagination
        class="mt_10"
        v-model:current-page="searchForm.pageNumber"
        v-model:page-size="searchForm.pageSize"
        :total="total"
        layout="total, prev, pager, next"
        @current-change="getData"
      />
    </el-card>
  </div>
</template>

<script>
import { getManagerWorkOrderPage } from "@/api/appointment";

export default {
  name: "managerAppointmentWorkOrders",
  data() {
    return {
      loading: false,
      data: [],
      total: 0,
      searchForm: {
        pageNumber: 1,
        pageSize: 10,
        orderSn: "",
        workOrderSn: "",
      },
    };
  },
  mounted() {
    this.getData();
  },
  methods: {
    handleSearch() {
      this.searchForm.pageNumber = 1;
      this.getData();
    },
    getData() {
      this.loading = true;
      getManagerWorkOrderPage(this.searchForm)
        .then((res) => {
          if (res.success) {
            this.data = res.result?.records || [];
            this.total = res.result?.total || 0;
          }
        })
        .finally(() => {
          this.loading = false;
        });
    },
  },
};
</script>
