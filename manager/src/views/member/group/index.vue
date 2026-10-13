<template>
  <div class="search">
    <el-card>
      <div class="operation padding-row">
        <el-button type="primary" @click="openAdd">添加分组</el-button>
      </div>
    </el-card>

    <el-card>
      <el-table ref="table" v-loading="loading" :data="data" border class="mt_10" style="width: 100%">
        <el-table-column prop="groupName" label="分组名称" min-width="160" show-overflow-tooltip />
        <el-table-column prop="description" label="分组描述" min-width="240" show-overflow-tooltip />
        <el-table-column prop="createTime" label="创建时间" min-width="180" />
        <el-table-column prop="updateTime" label="更新时间" min-width="180" />
        <el-table-column label="操作" width="200" align="center" fixed="right">
          <template #default="{ row }">
            <div v-if="row" class="ops" style="display: flex; justify-content: center">
              <a class="link-text" @click="openEdit(row)">编辑</a>
              <span class="op-split">|</span>
              <a class="link-text" @click="remove(row)">删除</a>
            </div>
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

    <el-dialog v-model="addFlag" title="添加分组" width="500px" :close-on-click-modal="false" destroy-on-close>
      <el-form ref="addForm" :model="formAdd" :rules="rulesAdd" label-width="90px">
        <el-form-item label="分组名称" prop="groupName" style="width: 90%">
          <el-input v-model="formAdd.groupName" maxlength="30" placeholder="请输入分组名称" />
        </el-form-item>
        <el-form-item label="分组描述" prop="description" style="width: 90%">
          <el-input v-model="formAdd.description" maxlength="200" placeholder="请输入分组描述" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="addFlag = false">取消</el-button>
        <el-button type="primary" :loading="submitAddLoading" @click="submitAdd">确定</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="editFlag" title="编辑分组" width="500px" :close-on-click-modal="false" destroy-on-close>
      <el-form ref="editForm" :model="formEdit" :rules="rulesEdit" label-width="90px">
        <el-input v-model="formEdit.id" style="display: none" />
        <el-form-item label="分组名称" prop="groupName" style="width: 90%">
          <el-input v-model="formEdit.groupName" maxlength="30" placeholder="请输入分组名称" />
        </el-form-item>
        <el-form-item label="分组描述" prop="description" style="width: 90%">
          <el-input v-model="formEdit.description" maxlength="200" placeholder="请输入分组描述" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editFlag = false">取消</el-button>
        <el-button type="primary" :loading="submitEditLoading" @click="submitEdit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { nextTick, onMounted, reactive, ref } from "vue";
import * as API_Member from "@/api/member.js";
import { ElMessage, ElMessageBox } from "element-plus";

defineOptions({ name: "memberGroup" });

const addForm = ref(null);
const editForm = ref(null);

const loading = ref(true);
const searchForm = reactive({
  pageNumber: 1,
  pageSize: 20,
});
const data = ref([]);
const total = ref(0);
const addFlag = ref(false);
const editFlag = ref(false);
const submitAddLoading = ref(false);
const submitEditLoading = ref(false);
const formAdd = ref({
  groupName: "",
  description: "",
});
const formEdit = ref({
  id: "",
  groupName: "",
  description: "",
});
const rulesAdd = reactive({
  groupName: [{ required: true, message: "请输入分组名称", trigger: "blur" }],
});
const rulesEdit = reactive({
  groupName: [{ required: true, message: "请输入分组名称", trigger: "blur" }],
});

function init() {
  getData();
}
function changePage(v) {
  searchForm.pageNumber = v;
  getData();
}
function changePageSize(v) {
  searchForm.pageNumber = 1;
  searchForm.pageSize = v;
  getData();
}
function getData() {
  loading.value = true;
  API_Member.getMemberGroupByPage(searchForm).then((res) => {
    loading.value = false;
    if (res && res.success && res.result) {
      data.value = res.result.records || [];
      total.value = res.result.total || 0;
    }
  });
}
function openAdd() {
  addFlag.value = true;
  nextTick(() => {
    if (addForm.value) addForm.value.resetFields();
    formAdd.value = { groupName: "", description: "" };
  });
}
function submitAdd() {
  addForm.value.validate((valid) => {
    if (!valid) return;
    submitAddLoading.value = true;
    API_Member.addMemberGroup(formAdd.value).then((res) => {
      submitAddLoading.value = false;
      if (res && res.success) {
        ElMessage.success("添加成功");
        addFlag.value = false;
        getData();
      }
    });
  });
}
function openEdit(row) {
  editFlag.value = true;
  submitEditLoading.value = false;
  API_Member.getMemberGroup(row.id).then((res) => {
    if (res && res.success && res.result) {
      formEdit.value = {
        id: res.result.id,
        groupName: res.result.groupName || "",
        description: res.result.description || "",
      };
    } else {
      formEdit.value = {
        id: row.id,
        groupName: row.groupName || "",
        description: row.description || "",
      };
    }
  });
}
function submitEdit() {
  editForm.value.validate((valid) => {
    if (!valid) return;
    submitEditLoading.value = true;
    const { id, groupName, description } = formEdit.value;
    API_Member.updateMemberGroup(id, { groupName, description }).then((res) => {
      submitEditLoading.value = false;
      if (res && res.success) {
        ElMessage.success("修改成功");
        editFlag.value = false;
        getData();
      }
    });
  });
}
function remove(row) {
  ElMessageBox.confirm("确定删除该分组？", "提示", { type: "warning" }).then(() => {
    API_Member.deleteMemberGroup(row.id).then((res) => {
      if (res && res.success) {
        ElMessage.success("删除成功");
        getData();
      } else if (res && res.message) {
        ElMessage.error(res.message);
      }
    });
  }).catch(() => {});
}

onMounted(() => {
  init();
});
</script>

<style scoped>
.ops a {
  color: #2d8cf0;
  cursor: pointer;
  text-decoration: none;
}
.ops span {
  display: inline-block;
  margin: 0 8px;
  color: #dcdee2;
}
</style>
