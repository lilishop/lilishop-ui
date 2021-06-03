<style lang="scss">
@import "@/styles/table-common.scss";
@import "./roleManage.scss";
</style>
<template>
  <div class="search">
    <Card>
      <Row class="operation">
        <Button @click="addRole" type="primary">添加角色</Button>
        <Button @click="delAll">批量删除</Button>
      </Row>
      <Table
        :loading="loading"
        border
        :columns="columns"
        :data="data"
        ref="table"
        sortable="custom"
        @on-sort-change="changeSort"
        @on-selection-change="changeSelect"
      ></Table>
      <Row type="flex" justify="end" class="page">
        <Page
          :current="pageNumber"
          :total="total"
          :page-size="pageSize"
          @on-change="changePage"
          @on-page-size-change="changePageSize"
          :page-size-opts="[10, 20, 50]"
          size="small"
          show-total
          show-elevator
          show-sizer
        ></Page>
      </Row>
    </Card>

    <!-- 编辑 -->
    <Modal
      :title="modalTitle"
      v-model="roleModalVisible"
      :mask-closable="false"
      :width="500"
    >
      <Form
        ref="roleForm"
        :model="roleForm"
        :label-width="80"
        :rules="roleFormValidate"
      >
        <FormItem label="角色名称" prop="name">
          <Input v-model="roleForm.name"/>
        </FormItem>
        <FormItem label="备注" prop="description">
          <Input v-model="roleForm.description"/>
        </FormItem>
      </Form>
      <div slot="footer">
        <Button type="text" @click="cancelRole">取消</Button>
        <Button type="primary" :loading="submitLoading" @click="submitRole"
        >提交
        </Button
        >
      </div>
    </Modal>
    <!-- 菜单权限 -->
    <Modal
      :title="modalTitle"
      v-model="permModalVisible"
      :mask-closable="false"
      :width="500"
      :styles="{ top: '30px' }"
      class="permModal"
    >
      <div style="position: relative">
        <Tree
          ref="tree"
          :data="permData"
          show-checkbox
          :render="renderContent"
          :check-strictly="true"
        >
        </Tree>
        <Spin size="large" fix v-if="treeLoading"></Spin>
      </div>
      <div slot="footer">
        <Button type="text" @click="cancelPermEdit">取消</Button>
        <Select
          v-model="openLevel"
          @on-change="changeOpen"
          style="width: 110px; text-align: left; margin-right: 10px"
        >
          <Option value="0">展开所有</Option>
          <Option value="1">收合所有</Option>
          <Option value="2">仅展开一级</Option>
          <Option value="3">仅展开两级</Option>
        </Select>
        <Button
          type="primary"
          :loading="submitPermLoading"
          @click="submitPermEdit(true)"
        >编辑
        </Button
        >
      </div>
    </Modal>
    <!-- 数据权限 -->
    <Modal
      :title="modalTitle"
      v-model="depModalVisible"
      :mask-closable="false"
      :width="500"
      class="depModal"
    >
      <Alert show-icon
      >默认可查看全部数据，自定义数据范围时请勾选下方数据
      </Alert
      >
      <Form :label-width="85">
        <FormItem label="数据范围">
          <Select v-model="dataType" transfer>
            <Option :value="0">全部数据权限</Option>
            <Option :value="1">自定义数据权限</Option>
            <Option :value="2">本部门及以下数据权限</Option>
            <Option :value="3">本部门数据权限</Option>
          </Select>
        </FormItem>
      </Form>
      <div v-show="dataType == 1" style="margin-top: 15px">
        <div style="position: relative">
          <Tree
            ref="depTree"
            :data="depData"
            :load-data="loadData"
            @on-toggle-expand="expandCheckDep"
            multiple
            style="margin-top: 15px"
          ></Tree>
          <Spin size="large" fix v-if="depTreeLoading"></Spin>
        </div>
      </div>
      <div slot="footer">
        <Button type="text" @click="depModalVisible = false">取消</Button>
        <Button
          type="primary"
          :loading="submitDepLoading"
          @click="submitDepEdit"
        >提交
        </Button
        >
      </div>
    </Modal>

    <!-- 保存权限弹出选择权限 -->
    <Modal
      v-model="selectIsSuperModel"
      title="选择菜单权限"
      :loading="superModelLoading"
      @on-ok="saveRole"
    >
      <div v-for="(item, index) in saveRoleWay" :key="index">
        <span class="title">{{ item.title }}</span>
        <RadioGroup type="button" button-style="solid" v-model="item.isSuper">
          <Radio :label="true">
            <span>操作数据权限</span>
          </Radio>
          <Radio :label="false">
            <span>查看权限</span>
          </Radio>
        </RadioGroup>
      </div>
    </Modal>
  </div>
</template>

<script>
import {
  getRoleList,
  getAllPermissionList,
  addRole,
  editRole,
  deleteRole,
  loadDepartment,
  editRoleDep,
  selectRoleMenu,
  saveRoleMenu,
} from "@/api/index";
import util from "@/libs/util.js";

export default {
  name: "role-manage",
  data() {
    return {
      superModelLoading: false, //保存权限弹出选择权限保存
      selectIsSuperModel: false, //保存权限弹出选择权限
      rolePermsWay: [], //查询角色权限集合
      openLevel: "0", // 展开的级别
      loading: true, // 加载状态
      treeLoading: true, // 树加载
      depTreeLoading: true, // 部门树加载
      submitPermLoading: false, // 权限提交加载
      submitDepLoading: false, // 部门提交加载
      searchKey: "", // 搜索关键字
      sortColumn: "", // 排序
      sortType: "desc", // 排序类型
      modalType: 0, // 0 添加 1 编辑
      roleModalVisible: false, // 角色modal
      permModalVisible: false, // 菜单权限modal
      depModalVisible: false, // 部门modal
      modalTitle: "", // modal标题
      roleForm: { // 角色表单
        name: "",
        description: "",
      },
      roleFormValidate: { // 验证规则
        name: [
          {required: true, message: "角色名称不能为空", trigger: "blur"},
        ],
      },
      submitLoading: false, // 提交loading
      selectList: [], // 已选列表
      selectCount: 0, // 已选总数
      columns: [ // 表头
        {
          type: "selection",
          width: 60,
          align: "center",
        },
        {
          title: "角色名称",
          key: "name",
          minWidth: 150,
        },
        {
          title: "备注",
          key: "description",
          minWidth: 150,
          tooltip: true
        },
        {
          title: "创建时间",
          key: "createTime",
          width: 170,
          sortable: true,
          sortType: "desc",
        },
        {
          title: "更新时间",
          key: "updateTime",
          width: 170,
          sortable: true,
        },
        {
          title: "最后操作人",
          key: "createBy",
          width: 150,
        },
        {
          title: "操作",
          key: "action",
          align: "center",
          fixed: "right",
          width: 230,
          render: (h, params) => {
            return h("div", [
              h(
                "Button",
                {
                  props: {
                    type: "warning",
                    size: "small",
                  },
                  style: {
                    marginRight: "5px",
                  },
                  on: {
                    click: () => {
                      this.editPerm(params.row);
                    },
                  },
                },
                "菜单权限"
              ),
              h(
                "Button",
                {
                  props: {
                    size: "small",
                    type: "info"
                  },
                  style: {
                    marginRight: "5px",
                  },
                  on: {
                    click: () => {
                      this.edit(params.row);
                    },
                  },
                },
                "编辑"
              ),
              h(
                "Button",
                {
                  props: {
                    type: "error",
                    size: "small",
                  },
                  on: {
                    click: () => {
                      this.remove(params.row);
                    },
                  },
                },
                "删除"
              ),
            ]);
          },
        },
      ],
      data: [], // 角色数据
      pageNumber: 1, // 页数
      pageSize: 10, // 每页数量
      total: 0, // 总数
      permData: [], // 菜单权限数据
      editRolePermId: "", // 编辑权限id
      selectAllFlag: false, // 全选标识
      depData: [], // 部门数据
      dataType: 0, // 数据类型
      editDepartments: [], // 编辑部门

      saveRoleWay: [], //用户保存用户点击的菜单
    };
  },
  methods: {
    init() {
      this.getRoleList();
      // 获取所有菜单权限树
      this.getPermList();
    },

    handleContextMenu(val) {
      console.log(val);
    },

    renderContent(h, {root, node, data}) {
      let icon = "";

      if (data.level == 0) {
        icon = "ios-navigate";
      } else if (data.level == 1) {
        icon = "md-list-box";
      } else if (data.level == 2) {
        icon = "md-list";
      } else if (data.level == 3) {
        icon = "md-radio-button-on";
      } else {
        icon = "md-radio-button-off";
      }
      return h(
        "span",
        {
          style: {
            display: "inline-block",
            cursor: "pointer",
          },
          on: {
            click: () => {
              data.checked = !data.checked;
            },
          },
        },
        [
          h("span", [
            h("Icon", {
              props: {
                type: icon,
                size: "16",
              },
              style: {
                "margin-right": "8px",
                "margin-bottom": "3px",
              },
            }),
            h("span", data.title),
            h(
              "span",
              {class: {tips: true}},
              data.isSuper ? "操作权限" : "查看权限"
            ),
          ]),
        ]
      );
    },
    changePage(v) {
      this.pageNumber = v;
      this.getRoleList();
      this.clearSelectAll();
    },
    changePageSize(v) {
      this.pageSize = v;
      this.getRoleList();
    },
    changeSort(e) {
      this.sortColumn = e.key;
      this.sortType = e.order;
      if (e.order == "normal") {
        this.sortType = "";
      }
      this.getRoleList();
    },

    /**
     * 查询所有角色
     */
    getRoleList() {
      this.loading = true;
      let params = {
        pageNumber: this.pageNumber,
        pageSize: this.pageSize,
        sort: this.sortColumn,
        order: this.sort,
      };
      getRoleList(params).then((res) => {
        this.loading = false;
        if (res.success) {
          this.data = res.result.records;
          this.total = res.result.total;
        }
      });
    },

    /**
     * 查询菜单
     */
    getPermList() {
      this.treeLoading = true;
      getAllPermissionList().then((res) => {
        if (res.success) {
          this.deleteDisableNode(res.result);
          this.permData = res.result;
          this.treeLoading = false;
        }
        this.treeLoading = false;
      });
    },
    // 递归标记禁用节点
    deleteDisableNode(permData) {
      let that = this;
      permData.forEach(function (e) {
        if (e.status == -1) {
          e.title = "[已禁用] " + e.title;
          e.disabled = true;
        }
        if (e.children && e.children.length > 0) {
          that.deleteDisableNode(e.children);
        }
      });
    },
    cancelRole() {
      this.roleModalVisible = false;
    },
    submitRole() {
      this.$refs.roleForm.validate((valid) => {
        if (valid) {
          if (this.modalType == 0) {
            // 添加
            this.submitLoading = true;

            addRole(this.roleForm).then((res) => {
              this.submitLoading = false;
              if (res.success) {
                this.$Message.success("操作成功");
                this.getRoleList();
                this.roleModalVisible = false;
              }
            });
          } else {
            this.submitLoading = true;
            this.roleForm.roleId = this.roleForm.id;

            editRole(this.roleForm).then((res) => {
              this.submitLoading = false;
              if (res.success) {
                this.$Message.success("操作成功");
                this.getRoleList();
                this.roleModalVisible = false;
              }
            });
          }
        }
      });
    },

    /**
     * 点击添加按钮
     */
    addRole() {
      this.modalType = 0;
      this.modalTitle = "添加角色";
      this.$refs.roleForm.resetFields();
      delete this.roleForm.id;
      this.roleModalVisible = true;
    },
    edit(v) {
      this.modalType = 1;
      this.modalTitle = "编辑角色";
      this.$refs.roleForm.resetFields();
      // 转换null为""
      for (let attr in v) {
        if (v[attr] == null) {
          v[attr] = "";
        }
      }
      let str = JSON.stringify(v);
      let roleInfo = JSON.parse(str);
      this.roleForm = roleInfo;
      this.roleModalVisible = true;
    },
    remove(v) {
      this.$Modal.confirm({
        title: "确认删除",
        content: "您确认要删除角色 " + v.name + " ?",
        loading: true,
        onOk: () => {
          deleteRole(v.id).then((res) => {
            this.$Modal.remove();
            if (res.success) {
              this.$Message.success("删除成功");
              this.getRoleList();
            }
          });
        },
      });
    },
    clearSelectAll() {
      this.$refs.table.selectAll(false);
    },
    changeSelect(e) {
      this.selectList = e;
      this.selectCount = e.length;
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
          deleteRole(ids).then((res) => {
            this.$Modal.remove();
            if (res.success) {
              this.$Message.success("删除成功");
              this.clearSelectAll();
              this.getRoleList();
            }
          });
        },
      });
    },

    // 菜单权限
    async editPerm(v) {
      if (this.treeLoading) {
        this.$Message.warning("菜单权限数据加载中，请稍后点击查看");
        return;
      }
      this.editRolePermId = v.id;
      this.modalTitle = "分配 " + v.name + " 的菜单权限";
      // 匹配勾选
      let rolePerms;

      // 当前角色的菜单权限

      let res = await selectRoleMenu(v.id);
      if (res.result) {
        rolePerms = res.result;
        this.rolePermsWay = res.result;
      }

      // 递归判断子节点
      this.checkPermTree(this.permData, rolePerms);
      console.warn(this.permData);
      this.permModalVisible = true;
    },
    // 递归判断子节点
    checkPermTree(permData, rolePerms) {
      let that = this;

      permData.forEach((p) => {
        if (that.hasPerm(p, rolePerms) && p.status != -1) {
          this.$set(p, "checked", true);
        } else {
          this.$set(p, "checked", false);
        }
        if (p.children && p.children.length > 0) {
          that.checkPermTree(p.children, rolePerms);
        }
      });
    },
    // 判断角色拥有的权限节点勾选
    hasPerm(p, rolePerms) {
      console.log(p, rolePerms);
      if (!rolePerms) return false;
      let flag = false;
      for (let i = 0; i < rolePerms.length; i++) {
        if (p.id == rolePerms[i].menuId) {
          this.$set(p, "isSuper", rolePerms[i].isSuper);
          flag = true;
          break;
        }
      }
      if (flag) {
        return true;
      }
      return false;
    },

    // 递归全选节点
    selectedTreeAll(permData, select) {
      let that = this;
      permData.forEach(function (e) {
        e.checked = select;
        if (e.children && e.children.length > 0) {
          that.selectedTreeAll(e.children, select);
        }
      });
    },

    /**分配菜单权限 */
    submitPermEdit() {
      this.saveRoleWay = [];

      this.selectIsSuperModel = true; //打开选择权限

      let selectedNodes = this.$refs.tree.getCheckedNodes();

      let way = [];

      selectedNodes.forEach((e) => {
        console.log(e);
        let perm = {
          title: e.title,
          isSuper: e.isSuper,
          menuId: e.id,
          roleId: this.editRolePermId,
        };
        way.push(perm);
        this.saveRoleWay = way;
      });

    },

    /**保存权限 */
    saveRole() {
      this.superModelLoading = true;
      saveRoleMenu(this.editRolePermId, this.saveRoleWay).then((res) => {
        this.superModelLoading = false;
        if (res.success) {
          this.$Message.success("操作成功");
          // 标记重新获取菜单数据
          this.$store.commit("setAdded", false);
          util.initRouter(this);
          this.getRoleList();
          this.permModalVisible = false;
        }
      });
    },

    cancelPermEdit() {
      this.permModalVisible = false;
    },
    loadData(item, callback) {
      loadDepartment(item.id, {openDataFilter: false}).then((res) => {
        if (res.success) {
          res.result.forEach(function (e) {
            e.selected = false;
            if (e.isParent) {
              e.loading = false;
              e.children = [];
            }
            if (e.status == -1) {
              e.title = "[已禁用] " + e.title;
              e.disabled = true;
            }
          });
          callback(res.result);
        }
      });
    },

    expandCheckDep(v) {
      // 判断展开子节点
      this.checkDepTree(v.children, this.editDepartments);
    },
    // 判断子节点
    checkDepTree(depData, roleDepIds) {
      let that = this;
      depData.forEach(function (p) {
        if (that.hasDepPerm(p, roleDepIds)) {
          p.selected = true;
        } else {
          p.selected = false;
        }
      });
    },

    changeOpen(v) {
      if (v == "0") {
        this.permData.forEach((e) => {
          e.expand = true;
          if (e.children && e.children.length > 0) {
            e.children.forEach((c) => {
              c.expand = true;
              if (c.children && c.children.length > 0) {
                c.children.forEach(function (b) {
                  b.expand = true;
                });
              }
            });
          }
        });
      } else if (v == "1") {
        this.permData.forEach((e) => {
          e.expand = false;
          if (e.children && e.children.length > 0) {
            e.children.forEach((c) => {
              c.expand = false;
              if (c.children && c.children.length > 0) {
                c.children.forEach(function (b) {
                  b.expand = false;
                });
              }
            });
          }
        });
      } else if (v == "2") {
        this.permData.forEach((e) => {
          e.expand = true;
          if (e.children && e.children.length > 0) {
            e.children.forEach((c) => {
              c.expand = false;
              if (c.children && c.children.length > 0) {
                c.children.forEach(function (b) {
                  b.expand = false;
                });
              }
            });
          }
        });
      } else if (v == "3") {
        this.permData.forEach((e) => {
          e.expand = true;
          if (e.children && e.children.length > 0) {
            e.children.forEach((c) => {
              c.expand = true;
              if (c.children && c.children.length > 0) {
                c.children.forEach(function (b) {
                  b.expand = false;
                });
              }
            });
          }
        });
      }
    },
  },
  mounted() {
    this.init();
  },
};
</script>
