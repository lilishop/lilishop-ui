<template>
  <div>
    <el-card>
      <el-form inline @keyup.enter="load">
        <el-form-item label="活动名称"><el-input v-model="query.promotionName" clearable /></el-form-item>
        <el-form-item><el-button type="primary" @click="load">搜索</el-button></el-form-item>
      </el-form>
    </el-card>
    <el-card class="mt_10">
      <el-table v-loading="loading" :data="rows" border>
        <el-table-column prop="promotionName" label="活动名称" />
        <el-table-column prop="storeName" label="店铺" />
        <el-table-column prop="nthNum" label="第N件" width="80" />
        <el-table-column prop="discountType" label="优惠方式" width="100" />
        <el-table-column prop="startTime" label="开始" width="170" />
        <el-table-column prop="endTime" label="结束" width="170" />
        <el-table-column prop="promotionStatus" label="状态" width="100" />
      </el-table>
      <el-pagination class="mt_10" v-model:current-page="query.pageNumber" :total="total" @current-change="load" />
    </el-card>
  </div>
</template>
<script>
import { getNthItemDiscountList } from "@/api/promotion.js";
export default {
  data() { return { loading: false, rows: [], total: 0, query: { pageNumber: 1, pageSize: 20 } }; },
  mounted() { this.load(); },
  methods: {
    load() {
      this.loading = true;
      getNthItemDiscountList(this.query).then((res) => {
        this.loading = false;
        if (res.success) { this.rows = res.result.records; this.total = res.result.total; }
      });
    },
  },
};
</script>
