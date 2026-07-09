<template>
  <div class="search">
    <el-card>
      <el-form ref="searchForm" :model="searchForm" inline label-width="70px" class="search-form">
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
        ref="table"
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

<script>
import {
  checkClerk,
  getUserListData,
  getAllRoleList,
  addUser,
  editOtherUser,
  enableClerk,
  deleteClerk,
  resetPassword,
  getClerk
} from "@/api/index";
import {validateMobile} from "@/libs/validate";
import { Search } from "@element-plus/icons-vue";
import departmentChoose from "@/views/my-components/lili/department-choose";
import departmentTreeChoose from "@/views/my-components/lili/department-tree-choose";
import uploadPicInput from "@/views/my-components/lili/upload-pic-input";

export default {
  name: "clerk-manage",
  components: {
    Search,
    departmentChoose,
    departmentTreeChoose,
    uploadPicInput,
  },
  data() {
    return {
      open:0,
      loading: true, // 加载状态
      selectCount: 0, // 已选数量
      selectList: [], // 已选数据列表
      searchForm: { // 请求参数
        clerkName: "",
        departmentId: "",
        pageNumber: 1,
        pageSize: 10,
        sort: "createTime",
        order: "desc"
      },
      modalType: 0, // 新增编辑标识
      userModalVisible: false, // 用户modal显隐
      userEditModalVisible:false,
      modalTitle: "", // modal标题
      form: { // 表单
        username: "",
        mobile: 0,
        sex: "",
        isSuper: 0,
        roles: [],
        departmentId: "",
        departmentTitle: ""
      },

      editForm: { // 表单
        isSuper: 0,
        roles: [],
        departmentId: "",
        departmentTitle: ""
      },
      mobile: "",
      clerkName: "",

      newMember: false,
      oldMember: false,
      memberCheck: false,
      roleList: [], // 角色列表
      errorPass: "", // 错误提示
      formValidate: { // 验证规则
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
      },
      submitLoading: false, // 提交状态
      data: [], // 用户数据
      total: 0, // 总数
    };
  },
  computed: {
    addFormRules() {
      const rules = {
        username: this.formValidate.username,
        mobile: this.formValidate.mobile,
      };
      if (this.newMember) {
        rules.password = this.formValidate.password;
      }
      return rules;
    },
  },
  methods: {
    // 初始化数据
    init() {
      this.getUserList();
    },
    checkClerks() {
      this.open = this.form.mobile.length;

      if(this.open == 11 ){
        this.checkClerk();
      }
      if(this.open < 11){
        this.checkAgainClerk()
      }
    },
    // 选择部门回调
    handleSelectDepTree(v) {
      if (v) {
        this.form.departmentId = v.departmentId;
        this.form.departmentTitle = v.departmentTitle;
      } else {
        this.form.departmentId = "";
        this.form.departmentTitle = "";
      }
    },
    // 选择部门回调
    handleEditSelectDepTree(v) {
      if (v) {
        this.editForm.departmentId = v.departmentId;
        this.editForm.departmentTitle = v.departmentTitle;
      } else {
        this.editForm.departmentId = "";
        this.editForm.departmentTitle = "";
      }
    },
    //重新校验会员
    checkAgainClerk() {
      this.memberCheck = false;
      this.newMember = false;
      this.oldMember = false;
      this.form.username = "";
      this.form.password = "";
      this.form.isSuper = 0;
      this.form.roles = [];
      this.errorPass = "";
    },
    // 检测当前手机号对应会员：无 id 为新建会员，有 id 为已有会员
    checkClerk() {
      if (!this.form.mobile) {
        return;
      }
      this.newMember = false;
      this.oldMember = false;
      this.form.username = "";
      this.form.password = "";
      this.errorPass = "";
      checkClerk(this.form.mobile).then((res) => {
        if (!res.success) {
          return;
        }
        if (!res.result || !res.result.id) {
          // 平台无此会员，需新建账号并设置密码
          this.newMember = true;
          this.oldMember = false;
        } else {
          // 已有会员，仅绑定为店员，不需要也不应展示/回填密码
          this.newMember = false;
          this.oldMember = true;
          this.form.username = res.result.username || "";
          this.form.password = "";
        }
        this.form.isSuper = 0;
        this.memberCheck = true;
      });
    },
    // 搜索项部门选择
    handleSelectDep(v) {
      this.searchForm.departmentId = v;
    },
    // 分页 修改页码
    changePage(v) {
      this.searchForm.pageNumber = v;
      this.getUserList();
      this.clearSelectAll();
    },
    // 分页 修改页数
    changePageSize(v) {
      this.searchForm.pageSize = v;
      this.searchForm.pageNumber = 1;
      this.getUserList();
    },
    getUserList() {
      // 多条件搜索用户列表
      this.loading = true;
      getUserListData(this.searchForm).then(res => {
        this.loading = false;
        if (res.success) {
          this.data = res.result.records;
          this.total = res.result.total;
        }
      });
    },
    // 搜索
    handleSearch() {
      this.searchForm.pageNumber = 1;
      this.searchForm.pageSize = 10;
      this.getUserList();
    },
    // 排序
    changeSort(e) {
      this.searchForm.sort = e.prop;
      this.searchForm.order =
        e.order === "ascending" ? "asc" : e.order === "descending" ? "desc" : "";
      this.getUserList();
    },
    // 获取角色列表
    getRoleList() {
      let params = {
        pageSize: 100
      }
      getAllRoleList(params).then(res => {
        if (res.success) {
          this.roleList = res.result.records;
        }
      });
    },
    // 重置密码
    resetPass() {
      if (this.selectCount == 0) {
        this.$Message.warning('请选中数据后重试!');
        return
      }
      this.$Modal.confirm({
        title: "确认重置",
        content:
          "您确认要重置所选的 " +
          this.selectCount +
          " 条用户数据密码为【123456】?",
        loading: true,
        onOk: () => {
          let ids = "";
          this.selectList.forEach(function (e) {
            ids += e.id + ",";
          });
          ids = ids.substring(0, ids.length - 1);

          resetPassword(ids).then(res => {
            this.$Modal.remove();
            if (res.success) {
              this.$Message.success("操作成功");
              this.clearSelectAll();
              this.getUserList();
            }
          });
        }
      });
    },
    updateSubmit(){
      this.submitLoading = true;

      editOtherUser(this.editForm.id,this.editForm).then(res => {
        this.submitLoading = false;
        if (res.success) {
          this.$Message.success("操作成功");
          this.getUserList();
          this.userEditModalVisible = false;
        }
      });
    },
    // 确认提交
    submitUser() {
      this.$refs.addForm?.validate(valid => {
        if (valid) {
          const params = JSON.parse(JSON.stringify(this.form));
          delete params.id;
          delete params.status;
          if (this.newMember) {
            if (params.password == "" || params.password == undefined) {
              this.errorPass = "密码不能为空";
              return;
            }
            if (params.password.length < 6) {
              this.errorPass = "密码长度不得少于6位";
              return;
            }
            params.password = this.md5(params.password);
          } else if (this.oldMember) {
            // 后端 ClerkAddDTO 对 username/password 有 @NotEmpty 校验；
            // 已有会员走 findByMobile 分支，不会使用该 password，仅用于通过参数校验
            params.username = this.form.username;
            params.password = params.password || "000000";
          }
          this.submitLoading = true;
          addUser(params).then(res => {
            this.submitLoading = false;
            if (res.success) {
              this.$Message.success("操作成功");
              this.getUserList();
              this.userModalVisible = false;
            }
          });
        }
      });
    },
    // 添加用户
    add() {
      this.modalType = 0;
      this.modalTitle = "添加店员";
      this.form = {
        username: "",
        mobile: "",
        password: "",
        isSuper: 0,
        roles: [],
        departmentId: "",
        departmentTitle: "",
      };
      this.oldMember = false;
      this.newMember = false;
      this.memberCheck = false;
      this.userModalVisible = true;
      this.$nextTick(() => {
        this.$refs.addForm?.resetFields();
        this.$refs.addDepTree?.clearSelect?.();
      });
    },
    // 编辑用户
    edit(v) {
      getClerk(v.id).then(res => {
        if (!res.success || !res.result) {
          return;
        }
        this.mobile = res.result.mobile;
        this.clerkName = res.result.clerkName;
        this.editForm.isSuper = res.result.isSuper ? 1 : 0;
        this.editForm.id = res.result.id;
        this.editForm.departmentId = res.result.departmentId;
        const selectRolesId = [];
        if (res.result.roles) {
          res.result.roles.forEach(function (e) {
            selectRolesId.push(e.id);
          });
        }
        this.editForm.roles = selectRolesId;
        this.modalTitle = "修改店员";
        this.userEditModalVisible = true;
        this.$nextTick(() => {
          this.$refs.editDepTree?.setData(
            res.result.departmentId,
            res.result.departmentTitle
          );
        });
      });
    },
    // 启用
    enable(v) {
      let params = {
        status: true
      }
      this.$Modal.confirm({
        title: "确认启用",
        content: "您确认要启用用户 " + v.clerkName + " ?",
        loading: true,
        onOk: () => {
          enableClerk(v.id, params).then(res => {
            this.$Modal.remove();
            if (res.success) {
              this.$Message.success("操作成功");
              this.getUserList();
            }
          });
        }
      });
    },
    // 禁用
    disable(v) {
      let params = {
        status: false
      }
      this.$Modal.confirm({
        title: "确认禁用",
        content: "您确认要禁用用户 " + v.clerkName + " ?",
        loading: true,
        onOk: () => {
          enableClerk(v.id, params).then(res => {
            this.$Modal.remove();
            if (res.success) {
              this.$Message.success("操作成功");
              this.getUserList();
            }
          });
        }
      });
    },
    // 删除用户
    remove(v) {
      this.$Modal.confirm({
        title: "确认删除",
        content: "您确认要删除用户 " + v.clerkName + " ?",
        loading: true,
        onOk: () => {
          deleteClerk(v.id).then(res => {
            this.$Modal.remove();
            if (res.success) {
              this.$Message.success("删除成功");
              this.getUserList();
            }
          });
        }
      });
    },
    // 选中状态
    showSelect(e) {
      this.selectList = e;
      this.selectCount = e.length;
    },
    // 清除选中状态
    clearSelectAll() {
      this.$refs.table?.clearSelection();
    },
    // 批量删除
    delAll() {
      if (this.selectCount <= 0) {
        this.$Message.warning("您还未选择要删除的数据");
        return;
      }
      this.$Modal.confirm({
        title: "确认删除",
        content: "您确认要删除所选的 " + this.selectCount + " 条店员?",
        loading: true,
        onOk: () => {
          let ids = "";
          this.selectList.forEach(function (e) {
            ids += e.id + ",";
          });
          ids = ids.substring(0, ids.length - 1);
          deleteClerk(ids).then(res => {
            this.$Modal.remove();
            if (res.success) {
              this.$Message.success("删除成功");
              this.clearSelectAll();
              this.getUserList();
            }
          });
        }
      });
    }
  },
  mounted() {
    this.init();
    this.getRoleList();
  }
};
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
