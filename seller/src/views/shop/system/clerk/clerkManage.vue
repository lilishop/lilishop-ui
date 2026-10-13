<template>
  <div class="search">
    <el-card>
      <el-form ref="searchFormRef" :model="searchForm" inline label-width="70px" class="search-form">
        <el-form-item label="店员名称">
          <el-input
            type="text"
            v-model="searchForm.clerkName"
            placeholder="请输入店员名称"
            clearable
            style="width: 240px"
          />
        </el-form-item>
        <el-form-item label="联系方式">
          <el-input
            type="text"
            v-model="searchForm.mobile"
            placeholder="请输入联系方式"
            clearable
            style="width: 240px"
          />
        </el-form-item>
        <el-form-item label="部门">
          <department-choose @change="handleSelectDep" style="width: 150px;" ref="dep"></department-choose>
        </el-form-item>
        <el-button type="primary" class="search-btn" @click="handleSearch">
          <el-icon><Search /></el-icon>
          搜索
        </el-button>
      </el-form>
      </el-card>
        <el-card>
      <div class="operation padding-row">
        <el-button @click="add" type="primary">添加</el-button>
        <el-button @click="delAll">批量删除</el-button>
        <el-button @click="resetPass">重置密码</el-button>
      </div>
      <br>
      <el-table
        ref="tableRef"
        v-loading="loading"
        border
        :data="data"
        style="width: 100%"
        @selection-change="showSelect"
        @sort-change="changeSort"
      >
        <el-table-column type="selection" width="60" align="center" fixed="left" />
        <el-table-column prop="clerkName" label="店员名称" min-width="100" sortable="custom" fixed="left" />
        <el-table-column prop="mobile" label="手机号码" min-width="100" fixed="left" />
        <el-table-column label="店主" width="130" align="center">
          <template #default="{ row }">
            <el-tag :type="row.shopkeeper ? 'success' : 'danger'">{{ row.shopkeeper ? "是" : "否" }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="超级管理员" width="130" align="center">
          <template #default="{ row }">
            <el-tag :type="row.isSuper ? 'success' : 'danger'">{{ row.isSuper ? "是" : "否" }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="130" align="center">
          <template #default="{ row }">
            <el-tag :type="row.status ? 'success' : 'danger'">{{ row.status ? "启用" : "禁用" }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="180" sortable="custom" />
        <el-table-column label="操作" width="200" align="center" fixed="right">
          <template #default="{ row }">
            <a class="link-text" @click="edit(row)">编辑</a>
            <span class="op-split">|</span>
            <a class="link-text" @click="row.status ? disable(row) : enable(row)">
              {{ row.status ? "禁用" : "启用" }}
            </a>
            <span class="op-split">|</span>
            <a class="link-text" @click="remove(row)">删除</a>
          </template>
        </el-table-column>
      </el-table>
      <div class="mt_10" style="display: flex; justify-content: flex-end">
        <el-pagination
          v-model:current-page="searchForm.pageNumber"
          v-model:page-size="searchForm.pageSize"
          :page-sizes="[10, 20, 50]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          size="small"
          @current-change="changePage"
          @size-change="changePageSize"
        />
      </div>
    </el-card>

    <el-dialog
      :title="modalTitle"
      v-model="userEditModalVisible"
      :close-on-click-modal="false"
      width="500px"
      align-center
      append-to-body
    >
      <el-form ref="editFormRef" :model="editForm" label-width="100px" :rules="formValidate" class="clerk-form">
        <el-form-item label="手机号">
          <el-input v-model="mobile" disabled/>
        </el-form-item>
        <el-form-item label="店员名称">
          <el-input v-model="clerkName" disabled/>
        </el-form-item>
        <el-form-item label="超级管理员" prop="isSuper">
          <el-radio-group v-model="editForm.isSuper">
            <el-radio-button :value="1">是</el-radio-button>
            <el-radio-button :value="0">否</el-radio-button>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="角色" prop="roles" v-if="editForm.isSuper === 0">
          <el-select v-model="editForm.roles" multiple>
            <el-option v-for="item in roleList" :key="item.id" :label="item.name" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="所属部门">
          <department-tree-choose @on-change="handleEditSelectDepTree" ref="editDepTree"></department-tree-choose>
        </el-form-item>

      </el-form>
      <template #footer>
        <el-button @click="userEditModalVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="updateSubmit">提交</el-button>
      </template>
    </el-dialog>

    <el-dialog
      :title="modalTitle"
      v-model="userModalVisible"
      :close-on-click-modal="false"
      width="500px"
      align-center
      append-to-body
    >
      <el-form ref="addForm" :model="form" label-width="100px" :rules="addFormRules" class="clerk-form">
        <el-form-item label="手机号" prop="mobile">
          <el-input placeholder="请输入要添加的会员手机号码" maxlength="11" style="width: 75%" v-model="form.mobile"
                 autocomplete="off" @change="checkClerks"/>
          &nbsp;<el-button v-if="!memberCheck" @click="checkClerk">校验</el-button>
          <el-button v-if="memberCheck" @click="checkAgainClerk">重新校验</el-button>
        </el-form-item>
        <el-form-item v-if="newMember" label="用户名" prop="username">
          <el-input v-model="form.username" autocomplete="off"/>
        </el-form-item>
        <el-form-item v-if="oldMember" label="用户名" prop="username">
          <el-input v-model="form.username" autocomplete="off" disabled/>
          <div class="form-tip">该手机号已注册为平台会员，提交后将直接添加为店员</div>
        </el-form-item>

        <el-form-item label="密码" prop="password" v-if="newMember" :error="errorPass">
          <el-input v-model="form.password" type="password" show-password autocomplete="off" />
        </el-form-item>
        <el-form-item label="超级管理员" prop="isSuper" v-if="newMember || oldMember">
          <el-radio-group v-model="form.isSuper">
            <el-radio-button :value="1">是</el-radio-button>
            <el-radio-button :value="0">否</el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="角色" prop="roles" v-if="(oldMember || newMember) && form.isSuper === 0">
          <el-select v-model="form.roles" multiple>
            <el-option v-for="item in roleList" :key="item.id" :label="item.name" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="所属部门" v-if="oldMember || newMember">
          <department-tree-choose @on-change="handleSelectDepTree" ref="addDepTree"></department-tree-choose>
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
import { computed, nextTick, onMounted, reactive, ref } from "vue";
import {
  checkClerk as fetchCheckClerk,
  getUserListData,
  getAllRoleList,
  addUser,
  editOtherUser,
  enableClerk,
  deleteClerk,
  resetPassword,
  getClerk
} from "@/api/index";
import { validateMobile } from "@/libs/validate";
import { Search } from "@element-plus/icons-vue";
import { Message, Modal } from "@/utils/message";
import { md5 } from "@/utils/md5.js";
import departmentChoose from "@/views/my-components/lili/department-choose";
import departmentTreeChoose from "@/views/my-components/lili/department-tree-choose";

defineOptions({ name: "clerk-manage" });

const searchFormRef = ref(null);
const tableRef = ref(null);
const dep = ref(null);
const editFormRef = ref(null);
const editDepTree = ref(null);
const addForm = ref(null);
const addDepTree = ref(null);

const open = ref(0);
const loading = ref(true); // 加载状态
const selectCount = ref(0); // 已选数量
const selectList = ref([]); // 已选数据列表
const searchForm = reactive({ // 请求参数
  clerkName: "",
  departmentId: "",
  pageNumber: 1,
  pageSize: 10,
  sort: "createTime",
  order: "desc"
});
const modalType = ref(0); // 新增编辑标识
const userModalVisible = ref(false); // 用户modal显隐
const userEditModalVisible = ref(false);
const modalTitle = ref(""); // modal标题
const form = ref({ // 表单
  username: "",
  mobile: 0,
  sex: "",
  isSuper: 0,
  roles: [],
  departmentId: "",
  departmentTitle: ""
});

const editForm = reactive({ // 表单
  isSuper: 0,
  roles: [],
  departmentId: "",
  departmentTitle: ""
});
const mobile = ref("");
const clerkName = ref("");

const newMember = ref(false);
const oldMember = ref(false);
const memberCheck = ref(false);
const roleList = ref([]); // 角色列表
const errorPass = ref(""); // 错误提示
const formValidate = { // 验证规则
  username: [
    {required: true, message: "用户名不能为空", trigger: "blur"}
  ],
  password: [
    {required: true, message: "密码不能为空", trigger: "blur"}
  ],
  mobile: [
    {required: true, message: "手机号不能为空", trigger: "blur"},
    {validator: validateMobile, trigger: "blur"}
  ]
};
const submitLoading = ref(false); // 提交状态
const data = ref([]); // 用户数据
const total = ref(0); // 总数

const addFormRules = computed(() => {
  const rules = {
    username: formValidate.username,
    mobile: formValidate.mobile,
  };
  if (newMember.value) {
    rules.password = formValidate.password;
  }
  return rules;
});

// 初始化数据
function init() {
  getUserList();
}
function checkClerks() {
  open.value = form.value.mobile.length;

  if (open.value == 11) {
    checkClerk();
  }
  if (open.value < 11) {
    checkAgainClerk();
  }
}
// 选择部门回调
function handleSelectDepTree(v) {
  if (v) {
    form.value.departmentId = v.departmentId;
    form.value.departmentTitle = v.departmentTitle;
  } else {
    form.value.departmentId = "";
    form.value.departmentTitle = "";
  }
}
// 选择部门回调
function handleEditSelectDepTree(v) {
  if (v) {
    editForm.departmentId = v.departmentId;
    editForm.departmentTitle = v.departmentTitle;
  } else {
    editForm.departmentId = "";
    editForm.departmentTitle = "";
  }
}
//重新校验会员
function checkAgainClerk() {
  memberCheck.value = false;
  newMember.value = false;
  oldMember.value = false;
  form.value.username = "";
  form.value.password = "";
  form.value.isSuper = 0;
  form.value.roles = [];
  errorPass.value = "";
}
// 检测当前手机号对应会员：无 id 为新建会员，有 id 为已有会员
function checkClerk() {
  if (!form.value.mobile) {
    return;
  }
  newMember.value = false;
  oldMember.value = false;
  form.value.username = "";
  form.value.password = "";
  errorPass.value = "";
  fetchCheckClerk(form.value.mobile).then((res) => {
    if (!res.success) {
      return;
    }
    if (!res.result || !res.result.id) {
      // 平台无此会员，需新建账号并设置密码
      newMember.value = true;
      oldMember.value = false;
    } else {
      // 已有会员，仅绑定为店员，不需要也不应展示/回填密码
      newMember.value = false;
      oldMember.value = true;
      form.value.username = res.result.username || "";
      form.value.password = "";
    }
    form.value.isSuper = 0;
    memberCheck.value = true;
  });
}
// 搜索项部门选择
function handleSelectDep(v) {
  searchForm.departmentId = v;
}
// 分页 修改页码
function changePage(v) {
  searchForm.pageNumber = v;
  getUserList();
  clearSelectAll();
}
// 分页 修改页数
function changePageSize(v) {
  searchForm.pageSize = v;
  searchForm.pageNumber = 1;
  getUserList();
}
function getUserList() {
  // 多条件搜索用户列表
  loading.value = true;
  getUserListData(searchForm).then(res => {
    loading.value = false;
    if (res.success) {
      data.value = res.result.records;
      total.value = res.result.total;
    }
  });
}
// 搜索
function handleSearch() {
  searchForm.pageNumber = 1;
  searchForm.pageSize = 10;
  getUserList();
}
// 排序
function changeSort(e) {
  searchForm.sort = e.prop;
  searchForm.order =
    e.order === "ascending" ? "asc" : e.order === "descending" ? "desc" : "";
  getUserList();
}
// 获取角色列表
function getRoleList() {
  let params = {
    pageSize: 100
  }
  getAllRoleList(params).then(res => {
    if (res.success) {
      roleList.value = res.result.records;
    }
  });
}
// 重置密码
function resetPass() {
  if (selectCount.value == 0) {
    Message.warning('请选中数据后重试!');
    return
  }
  Modal.confirm({
    title: "确认重置",
    content:
      "您确认要重置所选的 " +
      selectCount.value +
      " 条用户数据密码为【123456】?",
    loading: true,
    onOk: () => {
      let ids = "";
      selectList.value.forEach(function (e) {
        ids += e.id + ",";
      });
      ids = ids.substring(0, ids.length - 1);

      resetPassword(ids).then(res => {
        Modal.remove();
        if (res.success) {
          Message.success("操作成功");
          clearSelectAll();
          getUserList();
        }
      });
    }
  });
}
function updateSubmit() {
  submitLoading.value = true;

  editOtherUser(editForm.id, editForm).then(res => {
    submitLoading.value = false;
    if (res.success) {
      Message.success("操作成功");
      getUserList();
      userEditModalVisible.value = false;
    }
  });
}
// 确认提交
function submitUser() {
  addForm.value?.validate(valid => {
    if (valid) {
      const params = JSON.parse(JSON.stringify(form.value));
      delete params.id;
      delete params.status;
      if (newMember.value) {
        if (params.password == "" || params.password == undefined) {
          errorPass.value = "密码不能为空";
          return;
        }
        if (params.password.length < 6) {
          errorPass.value = "密码长度不得少于6位";
          return;
        }
        params.password = md5(params.password);
      } else if (oldMember.value) {
        // 后端 ClerkAddDTO 对 username/password 有 @NotEmpty 校验；
        // 已有会员走 findByMobile 分支，不会使用该 password，仅用于通过参数校验
        params.username = form.value.username;
        params.password = params.password || "000000";
      }
      submitLoading.value = true;
      addUser(params).then(res => {
        submitLoading.value = false;
        if (res.success) {
          Message.success("操作成功");
          getUserList();
          userModalVisible.value = false;
        }
      });
    }
  });
}
// 添加用户
function add() {
  modalType.value = 0;
  modalTitle.value = "添加店员";
  form.value = {
    username: "",
    mobile: "",
    password: "",
    isSuper: 0,
    roles: [],
    departmentId: "",
    departmentTitle: "",
  };
  oldMember.value = false;
  newMember.value = false;
  memberCheck.value = false;
  userModalVisible.value = true;
  nextTick(() => {
    addForm.value?.resetFields();
    addDepTree.value?.clearSelect?.();
  });
}
// 编辑用户
function edit(v) {
  getClerk(v.id).then(res => {
    if (!res.success || !res.result) {
      return;
    }
    mobile.value = res.result.mobile;
    clerkName.value = res.result.clerkName;
    editForm.isSuper = res.result.isSuper ? 1 : 0;
    editForm.id = res.result.id;
    editForm.departmentId = res.result.departmentId;
    const selectRolesId = [];
    if (res.result.roles) {
      res.result.roles.forEach(function (e) {
        selectRolesId.push(e.id);
      });
    }
    editForm.roles = selectRolesId;
    modalTitle.value = "修改店员";
    userEditModalVisible.value = true;
    nextTick(() => {
      editDepTree.value?.setData(
        res.result.departmentId,
        res.result.departmentTitle
      );
    });
  });
}
// 启用
function enable(v) {
  let params = {
    status: true
  }
  Modal.confirm({
    title: "确认启用",
    content: "您确认要启用用户 " + v.clerkName + " ?",
    loading: true,
    onOk: () => {
      enableClerk(v.id, params).then(res => {
        Modal.remove();
        if (res.success) {
          Message.success("操作成功");
          getUserList();
        }
      });
    }
  });
}
// 禁用
function disable(v) {
  let params = {
    status: false
  }
  Modal.confirm({
    title: "确认禁用",
    content: "您确认要禁用用户 " + v.clerkName + " ?",
    loading: true,
    onOk: () => {
      enableClerk(v.id, params).then(res => {
        Modal.remove();
        if (res.success) {
          Message.success("操作成功");
          getUserList();
        }
      });
    }
  });
}
// 删除用户
function remove(v) {
  Modal.confirm({
    title: "确认删除",
    content: "您确认要删除用户 " + v.clerkName + " ?",
    loading: true,
    onOk: () => {
      deleteClerk(v.id).then(res => {
        Modal.remove();
        if (res.success) {
          Message.success("删除成功");
          getUserList();
        }
      });
    }
  });
}
// 选中状态
function showSelect(e) {
  selectList.value = e;
  selectCount.value = e.length;
}
// 清除选中状态
function clearSelectAll() {
  tableRef.value?.clearSelection();
}
// 批量删除
function delAll() {
  if (selectCount.value <= 0) {
    Message.warning("您还未选择要删除的数据");
    return;
  }
  Modal.confirm({
    title: "确认删除",
    content: "您确认要删除所选的 " + selectCount.value + " 条店员?",
    loading: true,
    onOk: () => {
      let ids = "";
      selectList.value.forEach(function (e) {
        ids += e.id + ",";
      });
      ids = ids.substring(0, ids.length - 1);
      deleteClerk(ids).then(res => {
        Modal.remove();
        if (res.success) {
          Message.success("删除成功");
          clearSelectAll();
          getUserList();
        }
      });
    }
  });
}

onMounted(() => {
  init();
  getRoleList();
});
</script>

<style scoped lang="scss">
.clerk-form {
  :deep(.el-form-item__label) {
    white-space: nowrap;
  }
}
.form-tip {
  margin-top: 4px;
  font-size: 12px;
  color: #909399;
  line-height: 1.4;
}
</style>
