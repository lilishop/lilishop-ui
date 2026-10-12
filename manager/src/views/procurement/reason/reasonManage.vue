<template>
  <div class="search">
    <el-card>
      <el-form :model="searchForm" inline label-width="80px">
        <el-form-item label="原因">
          <el-input v-model="searchForm.reason" clearable style="width: 200px" />
        </el-form-item>
        <el-form-item label="类别">
          <el-select v-model="searchForm.category" clearable style="width: 160px">
            <el-option label="入库" value="INBOUND" />
            <el-option label="出库" value="OUTBOUND" />
            <el-option label="报损" value="DAMAGE" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
        </el-form-item>
      </el-form>
      <div class="operation padding-row">
        <el-button type="primary" @click="openAdd">添加</el-button>
      </div>
      <el-table v-loading="loading" :data="data" border class="mt_10" style="width: 100%">
        <el-table-column prop="reason" label="原因" width="240" show-overflow-tooltip />
        <el-table-column label="类别" width="120" align="center">
          <template #default="{ row }">{{ stockReasonCategoryText(row.category) }}</template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="170" />
        <el-table-column label="操作" width="150" align="center" fixed="right">
          <template #default="{ row }">
            <a class="link-text" @click="openEdit(row)">编辑</a>
            <span class="op-split">|</span>
            <a class="link-text" @click="handleDelete(row)">删除</a>
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

    <el-dialog v-model="modalVisible" :title="modalTitle" width="480px" append-to-body>
      <el-form ref="formRef" :model="form" label-width="80px">
        <el-form-item label="原因" required>
          <el-input v-model="form.reason" placeholder="出入库原因" />
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
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from "vue";
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

function handleSearch() {
  searchForm.pageNumber = 1;
  getDataList();
}

function getDataList() {
  loading.value = true;
  getStockReasonPage(searchForm)
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

function openAdd() {
  modalTitle.value = "添加原因";
  form.value = { id: "", reason: "", category: "INBOUND" };
  modalVisible.value = true;
}

function openEdit(row) {
  modalTitle.value = "编辑原因";
  form.value = { id: row.id, reason: row.reason, category: row.category };
  modalVisible.value = true;
}

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
.op-split {
  margin: 0 6px;
  color: #dcdfe6;
}
</style>
