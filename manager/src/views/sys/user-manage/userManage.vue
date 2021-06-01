<style lang="scss">
@import "@/styles/table-common.scss";
</style>
<template>
  <div class="search">
    <Card>
      <Row @keydown.enter.native="handleSearch">
        <Form ref="searchForm" :model="searchForm" inline :label-width="70" class="search-form">
          <Form-item label="用户名" prop="username">
            <Input
              type="text"
              v-model="searchForm.username"
              placeholder="请输入用户名"
              clearable
              style="width: 200px"
            />
          </Form-item>
          <Form-item label="联系方式" prop="mobile">
            <Input
              type="text"
              v-model="searchForm.mobile"
              placeholder="请输入联系方式"
              clearable
              style="width: 200px"
            />
          </Form-item>

          <Form-item label="部门" prop="department" >
            <department-choose @on-change="handleSelectDep" style="width: 150px;" ref="dep"></department-choose>
          </Form-item>

          <Form-item label="用户状态" prop="status">
            <Select v-model="searchForm.status" placeholder="请选择" clearable style="width: 150px">
              <Option value="true">启用</Option>
              <Option value="false">禁用</Option>
            </Select>
          </Form-item>
          <Button @click="handleSearch" type="primary" icon="ios-search" class="search-btn">搜索</Button>
        </Form>
      </Row>
      <Row class="operation padding-row">
        <Button @click="add" type="primary">添加</Button>
        <Button @click="delAll">批量删除</Button>
        <Button @click="resetPass">重置密码</Button>
      </Row>
      <Table
        :loading="loading"
        border
        :columns="columns"
        :data="data"
        sortable="custom"
        @on-sort-change="changeSort"
        @on-selection-change="showSelect"
        ref="table"
      ></Table>
      <Row type="flex" justify="end" class="page">
        <Page
          :current="searchForm.pageNumber"
          :total="total"
          :page-size="searchForm.pageSize"
          @on-change="changePage"
          @on-page-size-change="changePageSize"
          :page-size-opts="[10,20,50]"
          size="small"
          show-total
          show-elevator
          show-sizer
        ></Page>
      </Row>
    </Card>

    <Modal
      :title="modalTitle"
      v-model="userModalVisible"
      :mask-closable="false"
      :width="500"
      :styles="{top: '30px'}"
    >
      <Form ref="form" :model="form" :label-width="70" :rules="formValidate">
        <FormItem label="用户名" prop="username">
          <Input v-model="form.username" autocomplete="off"/>
        </FormItem>
        <FormItem label="昵称" prop="username">
          <Input v-model="form.nickName" autocomplete="off"/>
        </FormItem>
        <FormItem label="密码" prop="password" v-if="modalType==0" :error="errorPass">
          <Input type="password" password v-model="form.password" autocomplete="off"/>
        </FormItem>
        <FormItem label="邮箱" prop="email">
          <Input v-model="form.email"/>
        </FormItem>
        <FormItem label="手机号" prop="mobile">
          <Input v-model="form.mobile"/>
        </FormItem>
        <Form-item label="头像" prop="avatar">
          <upload-pic-input v-model="form.avatar"></upload-pic-input>
        </Form-item>
        <Form-item label="所属部门">
          <department-tree-choose @on-change="handleSelectDepTree" ref="depTree"></department-tree-choose>
        </Form-item>
        <FormItem label="角色" prop="roles">
          <Select v-model="form.roles" multiple>
            <Option v-for="item in roleList" :value="item.id" :key="item.id" :label="item.name">

            </Option>
          </Select>
        </FormItem>
      </Form>
      <div slot="footer">
        <Button type="text" @click="cancelUser">取消</Button>
        <Button type="primary" :loading="submitLoading" @click="submitUser">提交</Button>
      </div>
    </Modal>
    <check-password ref="checkPass" @on-success="resetPass"/>
  </div>
</template>

<script>
import {
  getUserListData,
  getAllRoleList,
  addUser,
  editOtherUser,
  enableUser,
  deleteUser,
  resetPassword
} from "@/api/index";
import {validateMobile} from "@/libs/validate";
import departmentChoose from "@/views/my-components/lili/department-choose";
import departmentTreeChoose from "@/views/my-components/lili/department-tree-choose";
import uploadPicInput from "@/views/my-components/lili/upload-pic-input";

export default {
  name: "user-manage",
  components: {
    departmentChoose,
    departmentTreeChoose,
    uploadPicInput,
  },
  data() {
    return {
      height: 510, // 高度
      loading: true, // 加载状态
      selectCount: 0, // 已选数量
      selectList: [], // 已选数据列表
      searchForm: { // 请求参数
        username: "",
        departmentId: "",
        mobile: "",
        type: "",
        status: "",
        pageNumber: 1,
        pageSize: 10,
        sort: "createTime",
        order: "desc"
      },
      modalType: 0, // 新增编辑标识
      userModalVisible: false, // 用户modal显隐
      modalTitle: "", // modal标题
      form: { // 表单
        username: "",
        mobile: "",
        email: "",
        sex: "",
        type: 0,
        roles: [],
        departmentId: "",
        departmentTitle: ""
      },
      roleList: [], // 角色列表
      errorPass: "", // 错误提示
      formValidate: { // 验证规则
        username: [
          {required: true, message: "用户名不能为空", trigger: "blur"}
        ],
        mobile: [
          {required: true, message: "手机号不能为空", trigger: "blur"},
          {validator: validateMobile, trigger: "blur"}
        ],
        email: [
          {required: true, message: "请输入邮箱地址"},
          {type: "email", message: "邮箱格式不正确"}
        ]
      },
      submitLoading: false, // 提交状态
      columns: [ // 表头
        {
          type: "selection",
          width: 60,
          align: "center",
          fixed: "left"
        },
        {
          title: "用户名",
          key: "username",
          minWidth: 120,
          sortable: true,
          fixed: "left"
        },
        {
          title: "头像",
          key: "avatar",
          width: 80,
          align: "center",
          render: (h, params) => {
            return h("Avatar", {
              props: {
                src: params.row.avatar
              }
            });
          }
        },
        {
          title: "手机",
          key: "mobile",
          width: 125
        },
        {
          title: "邮箱",
          key: "email",
          minWidth: 180,
          sortable: true
        },
        {
          title: "状态",
          key: "status",
          align: "center",
          width: 110,
          render: (h, params) => {
            if (params.row.status == true) {
              return h("div", [
                h("Badge", {
                  props: {
                    status: "success",
                    text: "启用"
                  }
                })
              ]);
            } else if (params.row.status == false) {
              return h("div", [
                h("Badge", {
                  props: {
                    status: "error",
                    text: "禁用"
                  }
                })
              ]);
            }
          },
          filters: [
            {
              label: "启用",
              value: true
            },
            {
              label: "禁用",
              value: false
            }
          ],
          filterMultiple: false,
          filterMethod(value, row) {
            return row.status == value;
          }
        },
        {
          title: "创建时间",
          key: "createTime",
          sortable: true,
          sortType: "desc",
          width: 180
        },
        {
          title: "操作",
          key: "action",
          width: 200,
          align: "center",
          fixed: "right",
          render: (h, params) => {
            let enableOrDisable = "";
            if (params.row.status == true) {
              enableOrDisable = h(
                "Button",
                {
                  props: {
                    size: "small"
                  },
                  style: {
                    marginRight: "5px"
                  },
                  on: {
                    click: () => {
                      this.disable(params.row);
                    }
                  }
                },
                "禁用"
              );
            } else {
              enableOrDisable = h(
                "Button",
                {
                  props: {
                    type: "success",
                    size: "small"
                  },
                  style: {
                    marginRight: "5px"
                  },
                  on: {
                    click: () => {
                      this.enable(params.row);
                    }
                  }
                },
                "启用"
              );
            }
            return h("div", [
              h(
                "Button",
                {
                  props: {
                    type: "info",
                    size: "small"
                  },
                  style: {
                    marginRight: "5px"
                  },
                  on: {
                    click: () => {
                      this.edit(params.row);
                    }
                  }
                },
                "编辑"
              ),
              enableOrDisable,
              h(
                "Button",
                {
                  props: {
                    type: "error",
                    size: "small"
                  },
                  on: {
                    click: () => {
                      this.remove(params.row);
                    }
                  }
                },
                "删除"
              )
            ]);
          }
        }
      ],
      data: [], // 用户数据
      total: 0, // 总数
      departments: [] // 部门
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
        this.form.departmentId = "";
        this.form.departmentTitle = "";
      }
    },
    handleSelectDep(v) {
      this.searchForm.departmentId = v;
    },
    changePage(v) {
      this.searchForm.pageNumber = v;
      this.getUserList();
      this.clearSelectAll();
    },
    changePageSize(v) {
      this.searchForm.pageSize = v;
      this.getUserList();
    },
    selectDateRange(v) {
      if (v) {
        this.searchForm.startDate = v[0];
        this.searchForm.endDate = v[1];
      }
    },
    getUserList() {
      // 多条件搜索用户列表
      this.loading = true;
      // 避免后台默认值
      if (!this.searchForm.type) {
        this.searchForm.type = "";
      }
      if (!this.searchForm.status) {
        this.searchForm.status = "";
      }
      getUserListData(this.searchForm).then(res => {
        this.loading = false;
        if (res.success) {
          this.data = res.result.records;
          this.total = res.result.total;
        }
      });
    },
    handleSearch() {
      this.searchForm.pageNumber = 1;
      this.searchForm.pageSize = 10;
      this.getUserList();
    },
    changeSort(e) {
      this.searchForm.sort = e.key;
      this.searchForm.order = e.order;
      if (e.order == "normal") {
        this.searchForm.order = "";
      }
      this.getUserList();
    },
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
    resetPass() {
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
    cancelUser() {
      this.userModalVisible = false;
    },
    submitUser() {
      this.$refs.form.validate(valid => {
        if (valid) {
          if (this.modalType == 0) {
            // 添加用户 避免编辑后传入id
            delete this.form.id;
            delete this.form.status;
            if (this.form.password == "" || this.form.password == undefined) {
              this.errorPass = "密码不能为空";
              return;
            }
            if (this.form.password.length < 6) {
              this.errorPass = "密码长度不得少于6位";
              return;
            }
            //todo
            this.form.password = this.md5(this.form.password)

            this.submitLoading = true;
            addUser(this.form).then(res => {
              this.submitLoading = false;
              if (res.success) {
                this.$Message.success("操作成功");
                this.getUserList();
                this.userModalVisible = false;
              }
            });
          } else {
            // 编辑
            this.submitLoading = true;
            editOtherUser(this.form).then(res => {
              this.submitLoading = false;
              if (res.success) {
                this.$Message.success("操作成功");
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
      this.$refs.form.resetFields();
      this.$refs.depTree.setData("", "");
      this.userModalVisible = true;
    },
    edit(v) {
      this.form = JSON.parse(JSON.stringify(v));
      this.modalType = 1;
      this.modalTitle = "编辑用户";
      this.$refs.form.resetFields();
      // 转换null为""

      for (let attr in this.form) {
        if (this.form[attr] == null) {
          this.form[attr] = "";
        }
      }


      this.$refs.depTree.setData(this.form.departmentId, this.form.departmentTitle);
      let selectRolesId = [];
      if (this.form.roles) {
        this.form.roles.forEach(function (e) {
          selectRolesId.push(e.id);
        });
      }
      this.form.roles = selectRolesId;
      this.userModalVisible = true;
    },
    enable(v) {
      let params = {
        status: true
      }
      this.$Modal.confirm({
        title: "确认启用",
        content: "您确认要启用用户 " + v.username + " ?",
        loading: true,
        onOk: () => {
          enableUser(v.id, params).then(res => {
            this.$Modal.remove();
            if (res.success) {
              this.$Message.success("操作成功");
              this.getUserList();
            }
          });
        }
      });
    },
    disable(v) {
      let params = {
        status: false
      }
      this.$Modal.confirm({
        title: "确认禁用",
        content: "您确认要禁用用户 " + v.username + " ?",
        loading: true,
        onOk: () => {
          enableUser(v.id, params).then(res => {
            this.$Modal.remove();
            if (res.success) {
              this.$Message.success("操作成功");
              this.getUserList();
            }
          });
        }
      });
    },
    remove(v) {
      this.$Modal.confirm({
        title: "确认删除",
        content: "您确认要删除用户 " + v.username + " ?",
        loading: true,
        onOk: () => {
          deleteUser(v.id).then(res => {
            this.$Modal.remove();
            if (res.success) {
              this.$Message.success("删除成功");
              this.getUserList();
            }
          });
        }
      });
    },
    showSelect(e) {
      this.exportData = e;
      this.selectList = e;
      this.selectCount = e.length;
    },
    clearSelectAll() {
      this.$refs.table.selectAll(false);
    },
    delAll() {
      if (this.selectCount <= 0) {
        this.$Message.warning("您还未选择要删除的数据");
        return;
      }
      this.$Modal.confirm({
        title: "确认删除",
        content: "您确认要删除所选的 " + this.selectCount + " 条数据?",
        loading: true,
        onOk: () => {
          let ids = "";
          this.selectList.forEach(function (e) {
            ids += e.id + ",";
          });
          ids = ids.substring(0, ids.length - 1);
          deleteUser(ids).then(res => {
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
    // 计算高度
    this.height = Number(document.documentElement.clientHeight - 230);
    this.init();
    this.getRoleList();
  }
};
</script>

<style lang="scss">
// 建议引入通用样式 可删除下面样式代码
@import "@/styles/table-common.scss";
</style>
