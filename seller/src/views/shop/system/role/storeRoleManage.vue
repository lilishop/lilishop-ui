<template>
  <div class="search">
    <el-card>
      <div class="operation padding-row">
        <el-button type="primary" @click="addRole">添加角色</el-button>
        <el-button @click="delAll">批量删除</el-button>
      </div>

      <el-table
        ref="table"
        v-loading="loading"
        border
        :data="data"
        style="width: 100%"
        row-key="id"
        @selection-change="changeSelect"
        @sort-change="changeSort"
      >
        <el-table-column type="selection" width="60" align="center" />
        <el-table-column prop="name" label="角色名称" min-width="150" />
        <el-table-column prop="description" label="备注" min-width="150" show-overflow-tooltip />
        <el-table-column prop="createTime" label="创建时间" width="170" sortable="custom" />
        <el-table-column prop="updateTime" label="更新时间" width="170" sortable="custom" />
        <el-table-column prop="createBy" label="最后操作人" width="150" />
        <el-table-column label="操作" width="230" align="center" fixed="right">
          <template #default="{ row }">
            <div v-if="row" class="ops">
              <a class="link-text" @click="editPerm(row)">菜单权限</a>
              <span class="op-split">|</span>
              <a class="link-text" @click="edit(row)">编辑</a>
              <span class="op-split">|</span>
              <a class="link-text" @click="remove(row)">删除</a>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <div class="mt_10" style="display: flex; justify-content: flex-end">
        <el-pagination
          v-model:current-page="pageNumber"
          v-model:page-size="pageSize"
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
      v-model="roleModalVisible"
      :title="modalTitle"
      width="500px"
      :close-on-click-modal="false"
      destroy-on-close
    >
      <el-form ref="roleForm" :model="roleForm" label-width="80px" :rules="roleFormValidate">
        <el-form-item label="角色名称" prop="name">
          <el-input v-model="roleForm.name" />
        </el-form-item>
        <el-form-item label="备注" prop="description">
          <el-input v-model="roleForm.description" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="roleModalVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="submitRole">提交</el-button>
      </template>
    </el-dialog>

    <el-dialog
      v-model="permModalVisible"
      :title="modalTitle"
      width="500px"
      :close-on-click-modal="false"
      align-center
      append-to-body
      class="permModal"
    >
      <div v-loading="treeLoading" style="position: relative; max-height: 560px; overflow: auto">
        <el-tree
          ref="permTree"
          :key="permTreeKey"
          :data="permData"
          :props="{ label: 'title', children: 'children', disabled: 'disabled' }"
          node-key="id"
          show-checkbox
          :default-expand-all="openLevel === '0'"
          :default-expanded-keys="permExpandedKeys"
          :default-checked-keys="permCheckedKeys"
        >
          <template #default="{ data }">
            <span>{{ data.title }}</span>
            <el-tag
              v-if="data.isSuper == 1 || data.isSuper == 0"
              :type="data.isSuper == 1 ? 'danger' : 'info'"
              size="small"
              style="margin-left: 10px"
            >
              {{ data.isSuper == 1 ? "操作权限" : "查看权限" }}
            </el-tag>
          </template>
        </el-tree>
      </div>
      <template #footer>
        <el-button @click="permModalVisible = false">取消</el-button>
        <el-select v-model="openLevel" style="width: 110px; margin-right: 10px" @change="changeOpen">
          <el-option value="0" label="展开所有" />
          <el-option value="1" label="收合所有" />
          <el-option value="2" label="仅展开一级" />
          <el-option value="3" label="仅展开两级" />
        </el-select>
        <el-button type="primary" :loading="submitPermLoading" @click="submitPermEdit()">编辑</el-button>
      </template>
    </el-dialog>

    <el-dialog
      v-model="selectIsSuperModel"
      title="选择菜单权限"
      width="800px"
      append-to-body
      align-center
      :close-on-click-modal="false"
      :z-index="3500"
    >
      <div class="btns">
        <el-button type="primary" class="btn-item" @click="setRole()">一键选中·数据权限</el-button>
        <el-button class="btn-item" @click="setRole('onlyView')">一键选中·查看权限</el-button>
      </div>
      <div class="role-list">
        <div class="role-item" v-for="(item, index) in saveRoleWay" :key="index">
          <div class="title">{{ item.title }}</div>
          <div class="content">
            <el-radio-group v-model="item.isSuper">
              <el-radio-button :value="1">操作数据权限</el-radio-button>
              <el-radio-button :value="0">查看权限</el-radio-button>
            </el-radio-group>
          </div>
        </div>
      </div>
      <template #footer>
        <el-button @click="selectIsSuperModel = false">取消</el-button>
        <el-button type="primary" :loading="superModelLoading" @click="saveRole">确定</el-button>
      </template>
    </el-dialog>
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
  selectRoleMenu,
  saveRoleMenu,
} from "@/api/index";
import util from "@/libs/util.js";

export default {
  name: "role-manage",
  data() {
    return {
      superModelLoading: false,
      selectIsSuperModel: false,
      rolePermsWay: [],
      openLevel: "0",
      loading: true,
      treeLoading: true,
      depTreeLoading: true,
      submitPermLoading: false,
      submitDepLoading: false,
      sortColumn: "",
      sortType: "desc",
      modalType: 0,
      roleModalVisible: false,
      permModalVisible: false,
      depModalVisible: false,
      modalTitle: "",
      roleForm: {
        name: "",
        description: "",
      },
      roleFormValidate: {
        name: [{ required: true, message: "角色名称不能为空", trigger: "blur" }],
      },
      submitLoading: false,
      selectList: [],
      selectCount: 0,
      data: [],
      pageNumber: 1,
      pageSize: 20,
      total: 0,
      permData: [],
      editRolePermId: "",
      selectAllFlag: false,
      depData: [],
      dataType: 0,
      editDepartments: [],
      saveRoleWay: [],
      permTreeKey: 0,
      permCheckedKeys: [],
      permExpandedKeys: [],
    };
  },
  methods: {
    init() {
      this.getRoleList();
      this.getPermList();
    },
    changePage() {
      this.getRoleList();
      this.clearSelectAll();
    },
    changePageSize() {
      this.pageNumber = 1;
      this.getRoleList();
    },
    changeSort(e) {
      this.sortColumn = e.prop;
      this.sortType = e.order === "ascending" ? "asc" : e.order === "descending" ? "desc" : "";
      if (!e.order) {
        this.sortType = "";
      }
      this.getRoleList();
    },
    setRole(val) {
      let enable;
      val == "onlyView" ? (enable = 0) : (enable = 1);
      this.saveRoleWay.map((item) => {
        item.isSuper = enable;
      });
    },
    getRoleList() {
      this.loading = true;
      let params = {
        pageNumber: this.pageNumber,
        pageSize: this.pageSize,
        sort: this.sortColumn,
        order: this.sortType,
      };
      getRoleList(params).then((res) => {
        this.loading = false;
        if (res.success) {
          this.data = res.result.records;
          this.total = res.result.total;
        }
      });
    },
    getPermList() {
      this.treeLoading = true;
      getAllPermissionList().then((res) => {
        if (res.success) {
          this.deleteDisableNode(res.result);
          this.permData = res.result;
        }
        this.treeLoading = false;
      });
    },
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
    submitRole() {
      this.$refs.roleForm.validate((valid) => {
        if (valid) {
          if (this.modalType == 0) {
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
    addRole() {
      this.modalType = 0;
      this.modalTitle = "添加角色";
      this.roleForm = {
        name: "",
        description: "",
      };
      this.roleModalVisible = true;
      this.$nextTick(() => {
        this.$refs.roleForm?.clearValidate();
      });
    },
    edit(v) {
      this.modalType = 1;
      this.modalTitle = "编辑角色";
      this.$refs.roleForm?.resetFields();
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
      this.$refs.table?.clearSelection();
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
    async editPerm(v) {
      this.permData.map((item) => {
        item.children.length != 0
          ? item.children.map((child) => {
              child.children.length != 0
                ? child.children.map((kid) => {
                    delete kid.isSuper;
                  })
                : "";
              delete child.isSuper;
            })
          : "";
        delete item.isSuper;
      });

      if (this.treeLoading) {
        this.$Message.warning("菜单权限数据加载中，请稍后点击查看");
        return;
      }
      this.editRolePermId = v.id;
      this.modalTitle = "分配 " + v.name + " 的菜单权限";
      let rolePerms;
      let res = await selectRoleMenu(v.id);
      if (res.result) {
        rolePerms = res.result;
        this.rolePermsWay = res.result;
      }
      this.permCheckedKeys = this.collectCheckedKeys(this.permData, rolePerms);
      this.permExpandedKeys = this.computeExpandedKeys(this.openLevel);
      this.permTreeKey += 1;
      this.permModalVisible = true;
    },
    collectCheckedKeys(permData, rolePerms) {
      const keys = [];
      const walk = (nodes) => {
        nodes.forEach((p) => {
          if (this.hasPerm(p, rolePerms) && p.status != -1) {
            if (p.children && p.children.length === 0) {
              keys.push(p.id);
            }
          }
          if (p.children && p.children.length > 0) {
            walk(p.children);
          }
        });
      };
      walk(permData);
      return keys;
    },
    hasPerm(p, rolePerms) {
      if (!rolePerms) return false;
      let flag = false;
      for (let i = 0; i < rolePerms.length; i++) {
        if (p.id == rolePerms[i].menuId) {
          p.isSuper = rolePerms[i].isSuper;
          flag = true;
          break;
        }
      }
      return flag;
    },
    submitPermEdit() {
      this.saveRoleWay = [];
      this.selectIsSuperModel = true;
      const tree = this.$refs.permTree;
      const selectedNodes = [
        ...tree.getCheckedNodes(false, true),
      ];
      let way = [];
      selectedNodes.forEach((e) => {
        let perm = {
          title: e.title,
          isSuper: e.isSuper ? (e.isSuper = 1) : (e.isSuper = 0) || 0,
          menuId: e.id,
          roleId: this.editRolePermId,
        };
        way.push(perm);
        this.saveRoleWay = way;
      });
    },
    saveRole() {
      this.superModelLoading = true;
      saveRoleMenu(this.editRolePermId, this.saveRoleWay).then((res) => {
        this.superModelLoading = false;
        if (res.success) {
          this.$Message.success("操作成功");
          this.$store.commit("setAdded", false);
          util.initRouter(this);
          this.getRoleList();
          this.permModalVisible = false;
          this.selectIsSuperModel = false;
        }
      });
    },
    loadData(item, callback) {
      loadDepartment(item.id, { openDataFilter: false }).then((res) => {
        if (res.success) {
          res.result.forEach(function (e) {
            e.checked = false;
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
    computeExpandedKeys(level) {
      const keys = [];
      const walk = (nodes, depth) => {
        nodes.forEach((n) => {
          if (level === "0") {
            keys.push(n.id);
          } else if (level === "2" && depth < 1) {
            keys.push(n.id);
          } else if (level === "3" && depth < 2) {
            keys.push(n.id);
          }
          if (n.children && n.children.length) {
            walk(n.children, depth + 1);
          }
        });
      };
      if (level !== "1") {
        walk(this.permData, 0);
      }
      return keys;
    },
    changeOpen(v) {
      this.permExpandedKeys = this.computeExpandedKeys(v);
      this.permTreeKey += 1;
    },
  },
  mounted() {
    this.init();
  },
};
</script>
<style lang="scss" scoped>
.role-list {
  height: 500px;
  overflow-y: auto;
  display: flex;
  flex-wrap: wrap;
}
.role-item {
  width: 50%;
  display: flex;
  padding: 20px 0;
  align-items: center;
  > .title {
    flex: 2;
    text-align: right;
  }
  > .content {
    flex: 10;
  }
}
.btns {
  display: flex;
  align-items: center;
  justify-content: center;
}
.btn-item {
  margin-right: 20px;
}
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
.tips {
  font-size: 12px;
  color: #999;
  margin-left: 8px;
}
.title {
  font-weight: bold;
  margin-right: 20px;
}
</style>
