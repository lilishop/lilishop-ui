<template>
  <div class="stock-reason-page search">
    <el-card shadow="never" class="filter-card">
      <el-form :model="searchForm" inline class="filter-form" @submit.prevent @keyup.enter="handleSearch">
        <el-form-item label="原因">
          <el-input v-model="searchForm.reason" placeholder="请输入原因" clearable style="width: 220px" />
        </el-form-item>
        <el-form-item label="类别">
          <el-select v-model="searchForm.category" placeholder="全部类别" clearable style="width: 160px">
            <el-option label="入库" value="INBOUND" />
            <el-option label="出库" value="OUTBOUND" />
            <el-option label="报损" value="DAMAGE" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card shadow="never" class="table-card mt_10">
      <list-action-bar>
        <el-button type="primary" @click="openAdd">添加原因</el-button>
      </list-action-bar>
      <el-table v-loading="loading" :data="data" row-key="id" border stripe empty-text="暂无数据" style="width: 100%">
        <el-table-column prop="reason" label="原因" min-width="240" show-overflow-tooltip />
        <el-table-column label="类别" width="120" align="center">
          <template #default="{ row }">{{ stockReasonCategoryText(row.category) }}</template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" min-width="170" align="center" />
        <el-table-column label="操作" width="150" align="center" fixed="right">
          <template #default="{ row }">
            <a class="link-text" @click="openEdit(row)">编辑</a>
            <span class="op-split">|</span>
            <a class="link-text" @click="handleDelete(row)">删除</a>
          </template>
        </el-table-column>
      </el-table>
      <div class="pagination-wrap mt_10">
        <el-pagination
          v-model:current-page="searchForm.pageNumber"
          v-model:page-size="searchForm.pageSize"
          :total="total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          size="small"
          @current-change="getDataList"
          @size-change="handleSearch"
        />
      </div>
    </el-card>

    <el-drawer v-model="modalVisible" :title="modalTitle" size="min(480px, 100vw)" append-to-body :close-on-click-modal="false" destroy-on-close>
      <el-form ref="formRef" :model="form" label-width="80px">
        <el-form-item label="原因" required>
          <el-input v-model="form.reason" placeholder="请输入出入库原因" />
        </el-form-item>
        <el-form-item label="类别" required>
          <el-select v-model="form.category" style="width: 100%">
            <el-option label="入库" value="INBOUND" />
            <el-option label="出库" value="OUTBOUND" />
            <el-option label="报损" value="DAMAGE" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="modalVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="handleSubmit">确定</el-button>
      </template>
    </el-drawer>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from "vue";
import ListActionBar from "@/components/list-action-bar.vue";
import {
  getStockReasonPage,
  addStockReason,
  updateStockReason,
  deleteStockReason,
} from "@/api/procurement";
import { stockReasonCategoryText } from "../constants";
import { Message, Modal } from "@/utils/message";

defineOptions({ name: "manager-stock-reason-manage" });

const loading = ref(false);
const submitLoading = ref(false);
const modalVisible = ref(false);
const modalTitle = ref("添加原因");
const data = ref([]);
const total = ref(0);
const searchForm = reactive({ pageNumber: 1, pageSize: 10, reason: "", category: "" });
const form = ref({ id: "", reason: "", category: "INBOUND" });

const formRef = ref(null);

/** 按当前筛选条件从第一页查询原因。 */
function handleSearch() {
  searchForm.pageNumber = 1;
  getDataList();
}

/** 清空原因和类别筛选并重新查询。 */
function handleReset() {
  searchForm.reason = "";
  searchForm.category = "";
  handleSearch();
}

/** 加载当前分页，失败时保留列表并允许通过刷新重试。 */
function getDataList() {
  loading.value = true;
  getStockReasonPage(searchForm)
    .then((res) => {
      if (res.success) {
        data.value = res.result.records || [];
        total.value = res.result.total || 0;
      }
    })
    .catch(() => {
      Message.error("获取出入库原因失败，请重试");
    })
    .finally(() => {
      loading.value = false;
    });
}

/** 打开新增抽屉并清空上次表单。 */
function openAdd() {
  modalTitle.value = "添加原因";
  form.value = { id: "", reason: "", category: "INBOUND" };
  modalVisible.value = true;
}

/** 将所选原因回显到编辑抽屉。 */
function openEdit(row) {
  modalTitle.value = "编辑原因";
  form.value = { id: row.id, reason: row.reason, category: row.category };
  modalVisible.value = true;
}

/** 保存原因，成功后关闭抽屉并刷新当前列表。 */
function handleSubmit() {
  if (!form.value.reason || !form.value.category) {
    Message.warning("请填写完整信息");
    return;
  }
  submitLoading.value = true;
  const req = form.value.id
    ? updateStockReason(form.value)
    : addStockReason({ reason: form.value.reason, category: form.value.category });
  req
    .then((res) => {
      if (res.success) {
        Message.success("保存成功");
        modalVisible.value = false;
        getDataList();
      }
    })
    .finally(() => {
      submitLoading.value = false;
    });
}

/** 用户确认后删除所选原因并刷新列表。 */
function handleDelete(row) {
  Modal.confirm({
    title: "删除确认",
    content: `确认删除原因「${row.reason}」？`,
    onOk: () => {
      deleteStockReason(row.id).then((res) => {
        if (res.success) {
          Message.success("删除成功");
          getDataList();
        }
      });
    },
  });
}

onMounted(() => {
  getDataList();
});
</script>

<style scoped>
.filter-form {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px 16px;
}

.filter-form :deep(.el-form-item) {
  margin: 0;
}

.pagination-wrap {
  display: flex;
  justify-content: flex-end;
  overflow-x: auto;
}

.op-split {
  margin: 0 6px;
  color: #dcdfe6;
}
</style>
