<template>
  <div class="search">
    <el-card>
      <div class="operation padding-row">
        <el-button type="primary" @click="addRole">添加角色</el-button>
        <el-button @click="delAll">批量删除</el-button>
      </div>

      <el-table
        ref="tableRef"
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
        <el-table-column label="操作" width="230" align="right" fixed="right">
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
      <el-form ref="roleFormRef" :model="roleForm" label-width="80px" :rules="roleFormValidate">
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
          ref="permTreeRef"
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

<script setup>
import { nextTick, onMounted, ref } from "vue";
import {
  getRoleList as fetchRoleList,
  getAllPermissionList,
  addRole as addRoleReq,
  editRole,
  deleteRole,
  selectRoleMenu,
  saveRoleMenu,
} from "@/api/index";
import { Message, Modal } from "@/utils/message";
import util from "@/libs/util.js";
import { useAppStore } from "@/stores/app";

defineOptions({ name: "role-manage" });

const appStore = useAppStore();

const tableRef = ref(null);
const roleFormRef = ref(null);
const permTreeRef = ref(null);

const superModelLoading = ref(false);
const selectIsSuperModel = ref(false);
const rolePermsWay = ref([]);
const openLevel = ref("0");
const loading = ref(true);
const treeLoading = ref(true);
const submitPermLoading = ref(false);
const sortColumn = ref("");
const sortType = ref("desc");
const modalType = ref(0);
const roleModalVisible = ref(false);
const permModalVisible = ref(false);
const modalTitle = ref("");
const roleForm = ref({
  name: "",
  description: "",
});
const roleFormValidate = {
  name: [{ required: true, message: "角色名称不能为空", trigger: "blur" }],
};
const submitLoading = ref(false);
const selectList = ref([]);
const selectCount = ref(0);
const data = ref([]);
const pageNumber = ref(1);
const pageSize = ref(20);
const total = ref(0);
const permData = ref([]);
const editRolePermId = ref("");
const saveRoleWay = ref([]);
const permTreeKey = ref(0);
const permCheckedKeys = ref([]);
const permExpandedKeys = ref([]);

function init() {
  getRoleList();
  getPermList();
}
function changePage() {
  getRoleList();
  clearSelectAll();
}
function changePageSize() {
  pageNumber.value = 1;
  getRoleList();
}
function changeSort(e) {
  sortColumn.value = e.prop;
  sortType.value = e.order === "ascending" ? "asc" : e.order === "descending" ? "desc" : "";
  if (!e.order) {
    sortType.value = "";
  }
  getRoleList();
}
function setRole(val) {
  let enable;
  val == "onlyView" ? (enable = 0) : (enable = 1);
  saveRoleWay.value.map((item) => {
    item.isSuper = enable;
  });
}
function getRoleList() {
  loading.value = true;
  let params = {
    pageNumber: pageNumber.value,
    pageSize: pageSize.value,
    sort: sortColumn.value,
    order: sortType.value,
  };
  fetchRoleList(params).then((res) => {
    loading.value = false;
    if (res.success) {
      data.value = res.result.records;
      total.value = res.result.total;
    }
  });
}
function getPermList() {
  treeLoading.value = true;
  getAllPermissionList().then((res) => {
    if (res.success) {
      deleteDisableNode(res.result);
      permData.value = res.result;
    }
    treeLoading.value = false;
  });
}
function deleteDisableNode(permData) {
  permData.forEach(function (e) {
    if (e.status == -1) {
      e.title = "[已禁用] " + e.title;
      e.disabled = true;
    }
    if (e.children && e.children.length > 0) {
      deleteDisableNode(e.children);
    }
  });
}
function submitRole() {
  roleFormRef.value.validate((valid) => {
    if (valid) {
      if (modalType.value == 0) {
        submitLoading.value = true;
        addRoleReq(roleForm.value).then((res) => {
          submitLoading.value = false;
          if (res.success) {
            Message.success("操作成功");
            getRoleList();
            roleModalVisible.value = false;
          }
        });
      } else {
        submitLoading.value = true;
        roleForm.value.roleId = roleForm.value.id;
        editRole(roleForm.value).then((res) => {
          submitLoading.value = false;
          if (res.success) {
            Message.success("操作成功");
            getRoleList();
            roleModalVisible.value = false;
          }
        });
      }
    }
  });
}
function addRole() {
  modalType.value = 0;
  modalTitle.value = "添加角色";
  roleForm.value = {
    name: "",
    description: "",
  };
  roleModalVisible.value = true;
  nextTick(() => {
    roleFormRef.value?.clearValidate();
  });
}
function edit(v) {
  modalType.value = 1;
  modalTitle.value = "编辑角色";
  roleFormRef.value?.resetFields();
  for (let attr in v) {
    if (v[attr] == null) {
      v[attr] = "";
    }
  }
  let str = JSON.stringify(v);
  let roleInfo = JSON.parse(str);
  roleForm.value = roleInfo;
  roleModalVisible.value = true;
}
function remove(v) {
  Modal.confirm({
    title: "确认删除",
    content: "您确认要删除角色 " + v.name + " ?",
    loading: true,
    onOk: () => {
      deleteRole(v.id).then((res) => {
        Modal.remove();
        if (res.success) {
          Message.success("删除成功");
          getRoleList();
        }
      });
    },
  });
}
function clearSelectAll() {
  tableRef.value?.clearSelection();
}
function changeSelect(e) {
  selectList.value = e;
  selectCount.value = e.length;
}
function delAll() {
  if (selectCount.value <= 0) {
    Message.warning("您还未选择要删除的数据");
    return;
  }
  Modal.confirm({
    title: "确认删除",
    content: "您确认要删除所选的 " + selectCount.value + " 条数据?",
    loading: true,
    onOk: () => {
      let ids = "";
      selectList.value.forEach(function (e) {
        ids += e.id + ",";
      });
      ids = ids.substring(0, ids.length - 1);
      deleteRole(ids).then((res) => {
        Modal.remove();
        if (res.success) {
          Message.success("删除成功");
          clearSelectAll();
          getRoleList();
        }
      });
    },
  });
}
async function editPerm(v) {
  permData.value.map((item) => {
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

  if (treeLoading.value) {
    Message.warning("菜单权限数据加载中，请稍后点击查看");
    return;
  }
  editRolePermId.value = v.id;
  modalTitle.value = "分配 " + v.name + " 的菜单权限";
  let rolePerms;
  let res = await selectRoleMenu(v.id);
  if (res.result) {
    rolePerms = res.result;
    rolePermsWay.value = res.result;
  }
  permCheckedKeys.value = collectCheckedKeys(permData.value, rolePerms);
  permExpandedKeys.value = computeExpandedKeys(openLevel.value);
  permTreeKey.value += 1;
  permModalVisible.value = true;
}
function collectCheckedKeys(permData, rolePerms) {
  const keys = [];
  const walk = (nodes) => {
    nodes.forEach((p) => {
      if (hasPerm(p, rolePerms) && p.status != -1) {
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
}
function hasPerm(p, rolePerms) {
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
}
function submitPermEdit() {
  saveRoleWay.value = [];
  selectIsSuperModel.value = true;
  const tree = permTreeRef.value;
  const selectedNodes = [
    ...tree.getCheckedNodes(false, true),
  ];
  let way = [];
  selectedNodes.forEach((e) => {
    let perm = {
      title: e.title,
      isSuper: e.isSuper ? 1 : 0,
      menuId: e.id,
      roleId: editRolePermId.value,
    };
    way.push(perm);
    saveRoleWay.value = way;
  });
}
function saveRole() {
  superModelLoading.value = true;
  saveRoleMenu(editRolePermId.value, saveRoleWay.value).then((res) => {
    superModelLoading.value = false;
    if (res.success) {
      Message.success("操作成功");
      appStore.setAdded(false);
      util.initRouter();
      getRoleList();
      permModalVisible.value = false;
      selectIsSuperModel.value = false;
    }
  });
}
function computeExpandedKeys(level) {
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
    walk(permData.value, 0);
  }
  return keys;
}
function changeOpen(v) {
  permExpandedKeys.value = computeExpandedKeys(v);
  permTreeKey.value += 1;
}

onMounted(() => {
  init();
});
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
