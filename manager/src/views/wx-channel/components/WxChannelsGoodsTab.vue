<template>
  <div class="wx-channel-goods">
    <el-form :model="searchForm" inline label-width="70px" class="search-form">
      <el-form-item label="商品名称" prop="goodsName">
        <el-input
          v-model="searchForm.goodsName"
          placeholder="请输入商品名称"
          clearable
          style="width: 220px"
        />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="searchForm.status" clearable style="width: 180px" placeholder="全部">
          <el-option v-for="item in statusList" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" class="search-btn" :loading="loading" @click="handleSearch">搜索</el-button>
      </el-form-item>
    </el-form>

    <el-table v-loading="loading" border :data="data" class="mt_10" style="width: 100%">
      <el-table-column label="商品图片" width="90" align="center">
        <template #default="{ row }">
          <img
            v-if="row"
            :src="row.goodsImage || ''"
            alt="加载图片失败"
            style="width: 50px; height: 50px; object-fit: cover; border-radius: 4px"
          />
        </template>
      </el-table-column>
      <el-table-column prop="goodsName" label="商品名称" min-width="220" show-overflow-tooltip />
      <el-table-column prop="storeName" label="店铺" min-width="160" show-overflow-tooltip />
      <el-table-column prop="categoryName" label="分类" min-width="160" show-overflow-tooltip />
      <el-table-column prop="costPrice" label="销售价" width="100" />
      <el-table-column prop="channelPrice" label="视频号价" width="100" />
      <el-table-column prop="stock" label="库存" width="90" />
      <el-table-column label="状态" width="110">
        <template #default="{ row }">
          <el-tag v-if="row" :type="statusTagType(row.status)">{{ statusLabel(row.status) }}</el-tag>
        </template>
      </el-table-column>
    </el-table>

    <div class="mt_10" style="display: flex; justify-content: flex-end">
      <el-pagination
        v-model:current-page="searchForm.pageNumber"
        v-model:page-size="searchForm.pageSize"
        :page-sizes="[20, 50, 100]"
        :total="total"
        layout="total, sizes, prev, pager, next, jumper"
        size="small"
        @current-change="changePage"
        @size-change="changePageSize"
      />
    </div>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref } from "vue";
import { getWxChannelsGoodsPage } from "@/api/index";

defineOptions({ name: "WxChannelsGoodsTab" });

const statusList = ref([
  { label: "已通过", value: "APPROVED" },
  { label: "审核中", value: "PENDING" },
  { label: "已拒绝", value: "REJECTED" },
]);
const loading = ref(false);
const total = ref(0);
const data = ref([]);
const searchForm = reactive({
  goodsName: "",
  status: "",
  pageNumber: 1,
  pageSize: 20,
});

function statusLabel(val) {
  const map = { APPROVED: "已通过", PENDING: "审核中", REJECTED: "已拒绝" };
  return map[val] || val || "-";
}
function statusTagType(val) {
  const map = { APPROVED: "success", PENDING: "warning", REJECTED: "danger" };
  return map[val] || "info";
}
function handleSearch() {
  searchForm.pageNumber = 1;
  loadPage();
}
function changePage(pageNumber) {
  searchForm.pageNumber = pageNumber;
  loadPage();
}
function changePageSize(pageSize) {
  searchForm.pageSize = pageSize;
  searchForm.pageNumber = 1;
  loadPage();
}
function loadPage() {
  loading.value = true;
  getWxChannelsGoodsPage({ ...searchForm })
    .then((res) => {
      if (res && res.success) {
        const page = res.result || {};
        data.value = Array.isArray(page.records) ? page.records : [];
        total.value = Number(page.total || 0);
      }
    })
    .finally(() => {
      loading.value = false;
    });
}

onMounted(() => {
  loadPage();
});
</script>
