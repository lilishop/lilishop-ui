<template>
  <div class="search">
    <el-card>
      <el-table v-loading="loading" border :data="data" class="mt_10" style="width: 100%">
        <el-table-column prop="id" label="ID" min-width="200" class-name="id-column" show-overflow-tooltip />
        <el-table-column prop="totalCount" label="导入总数" width="110" />
        <el-table-column prop="successCount" label="成功数" width="100" />
        <el-table-column prop="failCount" label="失败数" width="100" />
        <el-table-column label="导入状态" width="120">
          <template #default="{ row }">
            <span v-if="row">{{ statusLabel(row.status) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="operatorName" label="操作人" min-width="120" show-overflow-tooltip />
        <el-table-column prop="createTime" label="导入时间" min-width="170" />
        <el-table-column label="操作" width="140" align="center" fixed="right">
          <template #default="{ row }">
            <template v-if="row">
              <a
                v-if="row.failCount > 0"
                class="link-text"
                @click="downloadFailList(row)"
              >下载失败列表</a>
              <span v-else>-</span>
            </template>
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
    </el-card>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref } from "vue";
import {
  downloadDistributionImportFailItems,
  getDistributionImportBatches,
} from "@/api/distribution";
import { downloadBlob } from "@/utils/downloadBlob";
import { Message } from "@/utils/message";

defineOptions({ name: "distributionImportRecord" });

const loading = ref(false);
const searchForm = reactive({
  pageNumber: 1,
  pageSize: 20,
});
const data = ref([]);
const total = ref(0);

onMounted(() => {
  getDataList();
});

function statusLabel(status) {
  const map = {
    PROCESSING: "处理中",
    DONE: "已完成",
    FAILED: "失败",
  };
  return map[status] || status || "-";
}
function changePage() {
  getDataList();
}
function changePageSize() {
  searchForm.pageNumber = 1;
  getDataList();
}
function getDataList() {
  loading.value = true;
  getDistributionImportBatches(searchForm)
    .then((res) => {
      loading.value = false;
      if (res.success) {
        data.value = res.result.records || [];
        total.value = res.result.total || 0;
      }
    })
    .catch(() => {
      loading.value = false;
    });
}
function downloadFailList(row) {
  if (!row || !row.failCount) return;
  downloadDistributionImportFailItems(row.id)
    .then((blob) => {
      if (blob && blob.type && blob.type.includes("application/json")) {
        const reader = new FileReader();
        reader.onload = () => {
          try {
            const result = JSON.parse(reader.result);
            Message.error(result.message || "下载失败");
          } catch (e) {
            Message.error("下载失败");
          }
        };
        reader.readAsText(blob);
        return;
      }
      downloadBlob(blob, `分销员导入失败列表_${row.id}.xlsx`);
      Message.success("下载成功");
    })
    .catch(() => {
      Message.error("下载失败");
    });
}
</script>

<style scoped lang="scss">
.link-text {
  color: #2d8cf0;
  cursor: pointer;
  text-decoration: none;
}
.mt_10 {
  margin-top: 10px;
}
</style>
