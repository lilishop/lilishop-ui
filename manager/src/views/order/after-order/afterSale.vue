<template>
  <div class="search">
    <el-card>
      <el-tabs v-model="activeTab" @tab-click="onTabClick">
        <el-tab-pane label="退款" name="RETURN_MONEY">
          <div class="operation" style="margin-bottom: 10px">
            <el-button type="primary" @click="add">添加</el-button>
          </div>
        </el-tab-pane>
        <el-tab-pane label="取消" name="CANCEL">
          <div class="operation" style="margin-bottom: 10px">
            <el-button type="primary" @click="add">添加</el-button>
          </div>
        </el-tab-pane>
        <el-tab-pane label="退货" name="RETURN_GOODS">
          <div class="operation" style="margin-bottom: 10px">
            <el-button type="primary" @click="add">添加</el-button>
          </div>
        </el-tab-pane>
        <el-tab-pane label="投诉" name="COMPLAIN">
          <div class="operation" style="margin-bottom: 10px">
            <el-button type="primary" @click="add">添加</el-button>
            <el-button @click="getDataList">刷新</el-button>
          </div>
        </el-tab-pane>
      </el-tabs>

      <el-table v-loading="loading" border :data="data" ref="table" style="width: 100%">
        <el-table-column prop="createBy" label="创建人" min-width="120" />
        <el-table-column prop="reason" label="原因" min-width="400" />
        <el-table-column prop="createTime" label="时间" min-width="100" />
        <el-table-column label="操作" width="200" align="center">
          <template #default="{ row }">
            <template v-if="row">
              <a class="link-text" @click="edit(row)">编辑</a>
              <span class="op-split">|</span>
              <a class="link-text" @click="remove(row)">删除</a>
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

    <el-dialog v-model="modalVisible" :title="modalTitle" width="500px" :close-on-click-modal="false">
      <el-form ref="formRef" :model="form" label-width="100px" :rules="formValidate">
        <el-form-item label="售后原因" prop="reason">
          <el-input v-model="form.reason" maxlength="20" clearable style="width: 100%" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="modalVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="handleSubmit">提交</el-button>
      </template>
    </el-dialog>
  </div>
</template>
<script setup>
import { onMounted, reactive, ref } from "vue";
import * as API_Order from "@/api/order";
import { ElMessage, ElMessageBox } from "element-plus";

const activeTab = ref("RETURN_MONEY");
const modalVisible = ref(false);
const modalTitle = ref("");
const loading = ref(true);
const submitLoading = ref(false);
const form = reactive({ reason: "" });
const formValidate = reactive({
  reason: [{ required: true, message: "请输入售后原因", trigger: "blur" }],
});
const searchForm = reactive({
  pageNumber: 1,
  pageSize: 20,
  sort: "createTime",
  order: "desc",
  serviceType: "RETURN_MONEY",
});
const data = ref([]);
const total = ref(0);

const formRef = ref(null);

function onTabClick(tab) {
  handleClickType(tab.paneName);
}
function changePage(v) {
  searchForm.pageNumber = v;
  getDataList();
}
function changePageSize(v) {
  searchForm.pageNumber = 1;
  searchForm.pageSize = v;
  getDataList();
}
function handleClickType(v) {
  searchForm.pageNumber = 1;
  searchForm.pageSize = 20;
  searchForm.serviceType = v;
  getDataList();
}
function getDataList() {
  loading.value = true;
  API_Order.getAfterSaleReasonPage(searchForm).then((res) => {
    loading.value = false;
    if (res.success) {
      data.value = res.result.records;
      total.value = res.result.total;
    }
  });
}
function add() {
  form.reason = "";
  modalVisible.value = true;
  modalTitle.value = "添加售后原因";
}
function edit(v) {
  form.reason = v.reason;
  form.id = v.id;
  modalVisible.value = true;
  modalTitle.value = "修改售后原因";
}
function handleSubmit() {
  form.serviceType = searchForm.serviceType;
  formRef.value.validate((valid) => {
    if (valid) {
      submitLoading.value = true;
      if (modalTitle.value == "添加售后原因") {
        delete form.id;
        API_Order.addAfterSaleReason(form).then((res) => {
          submitLoading.value = false;
          if (res.success) {
            ElMessage.success("添加成功");
            getDataList();
            modalVisible.value = false;
          }
        });
      } else {
        API_Order.editAfterSaleReason(form.id, form).then((res) => {
          submitLoading.value = false;
          if (res.success) {
            ElMessage.success("修改成功");
            getDataList();
            modalVisible.value = false;
          }
        });
      }
    }
  });
}
function remove(v) {
  ElMessageBox.confirm("确认要删除此售后原因?", "确认删除", { type: "warning" }).then(() => {
    API_Order.delAfterSaleReason(v.id).then((res) => {
      if (res.success) {
        ElMessage.success("售后原因已删除");
        getDataList();
      }
    });
  }).catch(() => {});
}

onMounted(() => {
  getDataList();
});
</script>
<style scoped>
.link-text {
  color: #2d8cf0;
  cursor: pointer;
  text-decoration: none;
}
.op-split {
  display: inline-block;
  margin: 0 8px;
  color: #dcdee2;
}
</style>
