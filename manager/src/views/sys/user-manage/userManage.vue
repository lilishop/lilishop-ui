<template>
  <div class="search">
    <el-card>
      <el-form ref="searchFormRef" :model="searchForm" inline label-width="70px" class="search-form">
        <el-form-item label="用户名">
          <el-input
            v-model="searchForm.username"
            placeholder="请输入用户名"
            clearable
            style="width: 240px"
          />
        </el-form-item>
        <el-form-item label="联系方式">
          <el-input
            v-model="searchForm.mobile"
            placeholder="请输入联系方式"
            clearable
            style="width: 240px"
          />
        </el-form-item>
        <el-form-item label="部门">
          <department-choose @on-change="handleSelectDep" style="width: 240px" ref="depRef" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" class="search-btn" @click="handleSearch">搜索</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card>
      <div class="operation padding-row">
        <el-button type="primary" @click="add">添加</el-button>
        <el-button @click="delAll">批量删除</el-button>
        <el-button @click="resetPass">重置密码</el-button>
      </div>

      <el-table
        ref="tableRef"
        v-loading="loading"
        border
        :data="data"
        style="width: 100%"
        row-key="id"
        @sort-change="changeSort"
        @selection-change="showSelect"
      >
        <el-table-column type="selection" width="60" align="center" fixed="left" />
        <el-table-column prop="username" label="用户名" min-width="120" sortable="custom" fixed="left" />
        <el-table-column label="头像" width="80" align="center">
          <template #default="{ row }">
            <el-avatar v-if="row" :src="row.avatar" />
          </template>
        </el-table-column>
        <el-table-column prop="mobile" label="手机" width="125" />
        <el-table-column prop="email" label="邮箱" min-width="180" sortable="custom" />
        <el-table-column label="状态" width="110" align="center">
          <template #default="{ row }">
            <template v-if="row">
              <el-tag v-if="row.status == true" type="success">启用</el-tag>
              <el-tag v-else-if="row.status == false" type="danger">禁用</el-tag>
            </template>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" sortable="custom" width="180" />
        <el-table-column label="操作" width="200" align="center" fixed="right">
          <template #default="{ row }">
            <div v-if="row" class="ops">
              <a class="link-text" @click="edit(row)">编辑</a>
              <span class="op-split">|</span>
              <a class="link-text" v-if="row.status == true" @click="disable(row)">禁用</a>
              <a class="link-text" v-else @click="enable(row)">启用</a>
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

    <el-dialog
      v-model="userModalVisible"
      :title="modalTitle"
      width="500px"
      align-center
      append-to-body
      :close-on-click-modal="false"
      destroy-on-close
      class="user-manage-dialog"
    >
      <el-form ref="formRef" :model="form" label-width="70px" :rules="formValidate">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="form.username" autocomplete="off" />
        </el-form-item>
        <el-form-item label="昵称" prop="nickName">
          <el-input v-model="form.nickName" autocomplete="off" />
        </el-form-item>
        <el-form-item v-if="modalType == 0" label="密码" prop="password" :error="errorPass">
          <el-input v-model="form.password" type="password" show-password autocomplete="new-password" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="form.email" />
        </el-form-item>
        <el-form-item label="手机号" prop="mobile">
          <el-input v-model="form.mobile" />
        </el-form-item>
        <el-form-item label="头像" prop="avatar">
          <upload-pic-input v-model="form.avatar" />
        </el-form-item>
        <el-form-item label="所属部门">
          <department-tree-choose @on-change="handleSelectDepTree" ref="depTreeRef" />
        </el-form-item>
        <el-form-item label="角色" prop="roles">
          <el-select v-model="form.roles" multiple style="width: 100%">
            <el-option v-for="item in roleList" :key="item.id" :value="item.id" :label="item.name" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="userModalVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="submitUser">提交</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, nextTick, onMounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import {
  getUserListData,
  getAllRoleList,
  addUser,
  editOtherUser,
  enableUser,
  deleteUser,
  resetPassword,
} from "@/api/index";
import { validateMobile } from "@/libs/validate";
import { md5 } from "@/utils/md5.js";
import departmentChoose from "@/components/lili/department-choose";
import departmentTreeChoose from "@/components/lili/department-tree-choose";
import uploadPicInput from "@/components/lili/upload-pic-input";

defineOptions({ name: "user-manage" });

const loading = ref(true);
const selectCount = ref(0);
const selectList = ref([]);
// 未在 data 声明、原直接挂在 this 上的字段
let exportData = [];
const searchForm = reactive({
  username: "",
  departmentId: "",
  mobile: "",
  pageNumber: 1,
  pageSize: 20,
  sort: "createTime",
  order: "desc",
});
const modalType = ref(0);
const userModalVisible = ref(false);
const modalTitle = ref("");
const form = ref({
  username: "",
  nickName: "",
  password: "",
  mobile: "",
  email: "",
  avatar: "",
  description: "",
  roles: [],
  departmentId: 0,
  departmentTitle: "",
});
const roleList = ref([]);
const errorPass = ref("");
const formValidate = reactive({
  username: [{ required: true, message: "用户名不能为空", trigger: "blur" }],
  password: [{ required: true, message: "密码不能为空", trigger: "blur" }],
  mobile: [
    { required: true, message: "手机号不能为空", trigger: "blur" },
    { validator: validateMobile, trigger: "blur" },
  ],
  email: [
    { required: true, message: "请输入邮箱地址" },
    { type: "email", message: "邮箱格式不正确" },
  ],
});
const submitLoading = ref(false);
const data = ref([]);
const total = ref(0);

const searchFormRef = ref(null);
const depRef = ref(null);
const tableRef = ref(null);
const formRef = ref(null);
const depTreeRef = ref(null);

function init() {
  getUserList();
}

function handleSelectDepTree(v) {
  if (v) {
    form.value.departmentId = v.departmentId;
    form.value.departmentTitle = v.departmentTitle;
  } else {
    form.value.departmentId = 0;
    form.value.departmentTitle = "";
  }
}

function handleSelectDep(v) {
  searchForm.departmentId = v;
}

function changePage() {
  getUserList();
  clearSelectAll();
}

function changePageSize() {
  searchForm.pageNumber = 1;
  getUserList();
}

function getUserList() {
  loading.value = true;
  getUserListData(searchForm).then((res) => {
    loading.value = false;
    if (res.success) {
      data.value = res.result.records;
      total.value = res.result.total;
    }
  });
}

function handleSearch() {
  searchForm.pageNumber = 1;
  searchForm.pageSize = 20;
  getUserList();
}

function changeSort(e) {
  searchForm.sort = e.prop;
  searchForm.order = e.order === "ascending" ? "asc" : e.order === "descending" ? "desc" : "";
  if (!e.order) {
    searchForm.order = "";
  }
  getUserList();
}

function getRoleList() {
  let params = {
    pageSize: 100,
  };
  getAllRoleList(params).then((res) => {
    if (res.success) {
      roleList.value = res.result.records;
    }
  });
}

function resetPass() {
  if (selectCount.value == 0) {
    ElMessage.warning("请选中数据后重试!");
    return;
  }
  ElMessageBox.confirm("您确认要重置所选的 " + selectCount.value + " 条用户数据密码为【123456】?", "确认重置", { type: "warning" }).then(() => {
      let ids = "";
      selectList.value.forEach(function (e) {
        ids += e.id + ",";
      });
      ids = ids.substring(0, ids.length - 1);
      resetPassword(ids).then((res) => {
        if (res.success) {
          ElMessage.success("操作成功");
          clearSelectAll();
          getUserList();
        }
      });
  }).catch(() => {});
}

function submitUser() {
  formRef.value.validate((valid) => {
    if (valid) {
      if (modalType.value == 0) {
        if (form.value.password == "" || form.value.password == undefined) {
          errorPass.value = "密码不能为空";
          return;
        }
        if (form.value.password.length < 6) {
          errorPass.value = "密码长度不得少于6位";
          return;
        }
        if (Array.isArray(form.value.roles) && form.value.roles.length > 9) {
          ElMessage.warning("角色最多选择9个");
          return;
        }
        const params = {
          username: form.value.username,
          password: md5(form.value.password),
          nickName: form.value.nickName,
          mobile: form.value.mobile,
          email: form.value.email,
          avatar: form.value.avatar,
          description: form.value.description,
          departmentId: form.value.departmentId,
          roles: form.value.roles,
        };
        errorPass.value = "";
        submitLoading.value = true;
        addUser(params).then((res) => {
          submitLoading.value = false;
          if (res.success) {
            ElMessage.success("操作成功");
            getUserList();
            userModalVisible.value = false;
          }
        });
      } else {
        submitLoading.value = true;
        editOtherUser(form.value).then((res) => {
          submitLoading.value = false;
          if (res.success) {
            ElMessage.success("操作成功");
            getUserList();
            userModalVisible.value = false;
          }
        });
      }
    }
  });
}

function add() {
  modalType.value = 0;
  modalTitle.value = "添加用户";
  form.value = {
    username: "",
    nickName: "",
    password: "",
    mobile: "",
    email: "",
    avatar: "",
    description: "",
    roles: [],
    departmentId: 0,
    departmentTitle: "",
  };
  userModalVisible.value = true;
  nextTick(() => {
    formRef.value?.resetFields();
    depTreeRef.value?.setData("", "");
  });
}

function edit(v) {
  form.value = JSON.parse(JSON.stringify(v));
  modalType.value = 1;
  modalTitle.value = "编辑用户";
  for (let attr in form.value) {
    if (form.value[attr] == null) {
      form.value[attr] = "";
    }
  }
  const departmentId = form.value.departmentId;
  const departmentTitle = form.value.departmentTitle;
  let selectRolesId = [];
  if (form.value.roles) {
    form.value.roles.forEach(function (e) {
      selectRolesId.push(e.id);
    });
  }
  form.value.roles = selectRolesId;
  userModalVisible.value = true;
  nextTick(() => {
    formRef.value?.resetFields();
    depTreeRef.value?.setData(departmentId, departmentTitle);
  });
}

function enable(v) {
  let params = { status: true };
  ElMessageBox.confirm("您确认要启用用户 " + v.username + " ?", "确认启用", { type: "warning" }).then(() => {
      enableUser(v.id, params).then((res) => {
        if (res.success) {
          ElMessage.success("操作成功");
          getUserList();
        }
      });
  }).catch(() => {});
}

function disable(v) {
  let params = { status: false };
  ElMessageBox.confirm("您确认要禁用用户 " + v.username + " ?", "确认禁用", { type: "warning" }).then(() => {
      enableUser(v.id, params).then((res) => {
        if (res.success) {
          ElMessage.success("操作成功");
          getUserList();
        }
      });
  }).catch(() => {});
}

function remove(v) {
  ElMessageBox.confirm("您确认要删除用户 " + v.username + " ?", "确认删除", { type: "warning" }).then(() => {
      deleteUser(v.id).then((res) => {
        if (res.success) {
          ElMessage.success("删除成功");
          getUserList();
        }
      });
  }).catch(() => {});
}

function showSelect(e) {
  exportData = e;
  selectList.value = e;
  selectCount.value = e.length;
}

function clearSelectAll() {
  tableRef.value?.clearSelection();
}

function delAll() {
  if (selectCount.value <= 0) {
    ElMessage.warning("您还未选择要删除的数据");
    return;
  }
  ElMessageBox.confirm("您确认要删除所选的 " + selectCount.value + " 条数据?", "确认删除", { type: "warning" }).then(() => {
      let ids = "";
      selectList.value.forEach(function (e) {
        ids += e.id + ",";
      });
      ids = ids.substring(0, ids.length - 1);
      deleteUser(ids).then((res) => {
        if (res.success) {
          ElMessage.success("删除成功");
          clearSelectAll();
          getUserList();
        }
      });
  }).catch(() => {});
}

onMounted(() => {
  init();
  getRoleList();
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

<style lang="scss">
.user-manage-dialog {
  .el-dialog__body {
    max-height: calc(100vh - 220px);
    overflow-y: auto;
  }

  .el-input__wrapper {
    background-color: #fff !important;
    box-shadow: 0 0 0 1px var(--el-border-color) inset !important;

    &.is-focus {
      box-shadow: 0 0 0 1px var(--el-border-color) inset !important;
    }
  }

  .el-input__inner {
    background-color: transparent !important;

    &:-webkit-autofill,
    &:-webkit-autofill:hover,
    &:-webkit-autofill:focus,
    &:-webkit-autofill:active {
      -webkit-box-shadow: 0 0 0 1000px #fff inset !important;
      box-shadow: 0 0 0 1000px #fff inset !important;
      -webkit-text-fill-color: #606266 !important;
      caret-color: #606266;
      transition: background-color 99999s ease-out;
    }
  }
}
</style>
