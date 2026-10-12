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
        <el-table-column prop="startTime" label="开始" width="170" />
        <el-table-column prop="endTime" label="结束" width="170" />
        <el-table-column prop="promotionStatus" label="状态" width="100" />
      </el-table>
      <el-pagination class="mt_10" v-model:current-page="query.pageNumber" :total="total" @current-change="load" />
    </el-card>
  </div>
</template>
<script setup>
import { onMounted, ref } from "vue";
import { getFlashDiscountList } from "@/api/promotion.js";

const loading = ref(false);
const rows = ref([]);
const total = ref(0);
const query = ref({ pageNumber: 1, pageSize: 20 });

onMounted(() => { load(); });

function load() {
  loading.value = true;
  getFlashDiscountList(query.value).then((res) => {
    loading.value = false;
    if (res.success) { rows.value = res.result.records; total.value = res.result.total; }
  });
}
</script>
