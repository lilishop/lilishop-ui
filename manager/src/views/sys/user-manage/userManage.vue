<template>
  <div class="search">
    <el-card>
      <el-form ref="searchForm" :model="searchForm" inline label-width="70px" class="search-form">
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
          <department-choose @on-change="handleSelectDep" style="width: 240px" ref="dep" />
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
        ref="table"
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
      <el-form ref="form" :model="form" label-width="70px" :rules="formValidate">
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
          <department-tree-choose @on-change="handleSelectDepTree" ref="depTree" />
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

<script>
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
import departmentChoose from "@/components/lili/department-choose";
import departmentTreeChoose from "@/components/lili/department-tree-choose";
import uploadPicInput from "@/components/lili/upload-pic-input";

export default {
  name: "user-manage",
  components: {
    departmentChoose,
    departmentTreeChoose,
    uploadPicInput,
  },
  data() {
    return {
      loading: true,
      selectCount: 0,
      selectList: [],
      searchForm: {
        username: "",
        departmentId: "",
        mobile: "",
        pageNumber: 1,
        pageSize: 20,
        sort: "createTime",
        order: "desc",
      },
      modalType: 0,
      userModalVisible: false,
      modalTitle: "",
      form: {
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
      },
      roleList: [],
      errorPass: "",
      formValidate: {
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
      },
      submitLoading: false,
      data: [],
      total: 0,
    };
  },
  methods: {
    init() {
      this.getUserList();
    },
    handleSelectDepTree(v) {
      if (v) {
        this.form.departmentId = v.departmentId;
        this.form.departmentTitle = v.departmentTitle;
      } else {
        this.form.departmentId = 0;
        this.form.departmentTitle = "";
      }
    },
    handleSelectDep(v) {
      this.searchForm.departmentId = v;
    },
    changePage() {
      this.getUserList();
      this.clearSelectAll();
    },
    changePageSize() {
      this.searchForm.pageNumber = 1;
      this.getUserList();
    },
    getUserList() {
      this.loading = true;
      getUserListData(this.searchForm).then((res) => {
        this.loading = false;
        if (res.success) {
          this.data = res.result.records;
          this.total = res.result.total;
        }
      });
    },
    handleSearch() {
      this.searchForm.pageNumber = 1;
      this.searchForm.pageSize = 20;
      this.getUserList();
    },
    changeSort(e) {
      this.searchForm.sort = e.prop;
      this.searchForm.order = e.order === "ascending" ? "asc" : e.order === "descending" ? "desc" : "";
      if (!e.order) {
        this.searchForm.order = "";
      }
      this.getUserList();
    },
    getRoleList() {
      let params = {
        pageSize: 100,
      };
      getAllRoleList(params).then((res) => {
        if (res.success) {
          this.roleList = res.result.records;
        }
      });
    },
    resetPass() {
      if (this.selectCount == 0) {
        ElMessage.warning("请选中数据后重试!");
        return;
      }
      ElMessageBox.confirm("您确认要重置所选的 " + this.selectCount + " 条用户数据密码为【123456】?", "确认重置", { type: "warning" }).then(() => {
          let ids = "";
          this.selectList.forEach(function (e) {
            ids += e.id + ",";
          });
          ids = ids.substring(0, ids.length - 1);
          resetPassword(ids).then((res) => {
            if (res.success) {
              ElMessage.success("操作成功");
              this.clearSelectAll();
              this.getUserList();
            }
          });
      }).catch(() => {});
    },
    submitUser() {
      this.$refs.form.validate((valid) => {
        if (valid) {
          if (this.modalType == 0) {
            if (this.form.password == "" || this.form.password == undefined) {
              this.errorPass = "密码不能为空";
              return;
            }
            if (this.form.password.length < 6) {
              this.errorPass = "密码长度不得少于6位";
              return;
            }
            if (Array.isArray(this.form.roles) && this.form.roles.length > 9) {
              ElMessage.warning("角色最多选择9个");
              return;
            }
            const params = {
              username: this.form.username,
              password: this.form.password,
              nickName: this.form.nickName,
              mobile: this.form.mobile,
              email: this.form.email,
              avatar: this.form.avatar,
              description: this.form.description,
              departmentId: this.form.departmentId,
              roles: this.form.roles,
            };
            this.errorPass = "";
            this.submitLoading = true;
            addUser(params).then((res) => {
              this.submitLoading = false;
              if (res.success) {
                ElMessage.success("操作成功");
                this.getUserList();
                this.userModalVisible = false;
              }
            });
          } else {
            this.submitLoading = true;
            editOtherUser(this.form).then((res) => {
              this.submitLoading = false;
              if (res.success) {
                ElMessage.success("操作成功");
                this.getUserList();
                this.userModalVisible = false;
              }
            });
          }
        }
      });
    },
    add() {
      this.modalType = 0;
      this.modalTitle = "添加用户";
      this.form = {
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
      this.userModalVisible = true;
      this.$nextTick(() => {
        this.$refs.form?.resetFields();
        this.$refs.depTree?.setData("", "");
      });
    },
    edit(v) {
      this.form = JSON.parse(JSON.stringify(v));
      this.modalType = 1;
      this.modalTitle = "编辑用户";
      for (let attr in this.form) {
        if (this.form[attr] == null) {
          this.form[attr] = "";
        }
      }
      const departmentId = this.form.departmentId;
      const departmentTitle = this.form.departmentTitle;
      let selectRolesId = [];
      if (this.form.roles) {
        this.form.roles.forEach(function (e) {
          selectRolesId.push(e.id);
        });
      }
      this.form.roles = selectRolesId;
      this.userModalVisible = true;
      this.$nextTick(() => {
        this.$refs.form?.resetFields();
        this.$refs.depTree?.setData(departmentId, departmentTitle);
      });
    },
    enable(v) {
      let params = { status: true };
      ElMessageBox.confirm("您确认要启用用户 " + v.username + " ?", "确认启用", { type: "warning" }).then(() => {
          enableUser(v.id, params).then((res) => {
            if (res.success) {
              ElMessage.success("操作成功");
              this.getUserList();
            }
          });
      }).catch(() => {});
    },
    disable(v) {
      let params = { status: false };
      ElMessageBox.confirm("您确认要禁用用户 " + v.username + " ?", "确认禁用", { type: "warning" }).then(() => {
          enableUser(v.id, params).then((res) => {
            if (res.success) {
              ElMessage.success("操作成功");
              this.getUserList();
            }
          });
      }).catch(() => {});
    },
    remove(v) {
      ElMessageBox.confirm("您确认要删除用户 " + v.username + " ?", "确认删除", { type: "warning" }).then(() => {
          deleteUser(v.id).then((res) => {
            if (res.success) {
              ElMessage.success("删除成功");
              this.getUserList();
            }
          });
      }).catch(() => {});
    },
    showSelect(e) {
      this.exportData = e;
      this.selectList = e;
      this.selectCount = e.length;
    },
    clearSelectAll() {
      this.$refs.table?.clearSelection();
    },
    delAll() {
      if (this.selectCount <= 0) {
        ElMessage.warning("您还未选择要删除的数据");
        return;
      }
      ElMessageBox.confirm("您确认要删除所选的 " + this.selectCount + " 条数据?", "确认删除", { type: "warning" }).then(() => {
          let ids = "";
          this.selectList.forEach(function (e) {
            ids += e.id + ",";
          });
          ids = ids.substring(0, ids.length - 1);
          deleteUser(ids).then((res) => {
            if (res.success) {
              ElMessage.success("删除成功");
              this.clearSelectAll();
              this.getUserList();
            }
          });
      }).catch(() => {});
    },
  },
  mounted() {
    this.init();
    this.getRoleList();
  },
};
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
