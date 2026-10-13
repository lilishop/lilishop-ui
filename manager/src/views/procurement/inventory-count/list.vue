<template>
  <div class="search">
    <el-card>
      <el-table v-loading="loading" :data="data" border style="width: 100%">
        <el-table-column prop="sn" label="盘点单号" width="220" show-overflow-tooltip />
        <el-table-column prop="storeId" label="店铺ID" width="180" show-overflow-tooltip />
        <el-table-column prop="itemTotal" label="商品数" width="90" align="center" />
        <el-table-column prop="makerName" label="制单人" width="120" show-overflow-tooltip />
        <el-table-column prop="countTime" label="盘点时间" width="170" />
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

<script setup>
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { getInventoryCountPage } from "@/api/procurement";

defineOptions({ name: "manager-inventory-count-list" });

const router = useRouter();

const loading = ref(false);
const data = ref([]);
const total = ref(0);
const searchForm = ref({ pageNumber: 1, pageSize: 10 });

onMounted(() => {
  getDataList();
});

function getDataList() {
  loading.value = true;
  getInventoryCountPage(searchForm.value)
    .then((res) => {
      if (res.success) {
        data.value = res.result.records || [];
        total.value = res.result.total || 0;
      }
    })
    .finally(() => {
      loading.value = false;
    });
}
function goDetail(row) {
  router.push({ name: "manager-inventory-count-detail", query: { id: row.id, sn: row.sn } });
}
</script>
