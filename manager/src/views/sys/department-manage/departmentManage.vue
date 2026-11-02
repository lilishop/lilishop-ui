<template>
  <div class="department-manage">
    <el-card shadow="never" class="manage-card">
      <!-- 顶部操作工具栏 -->
      <div class="table-toolbar">
        <div class="toolbar-left">
          <el-button type="primary" @click="addRoot">添加一级部门</el-button>
          <el-button
            type="danger"
            plain
            :disabled="selectCount === 0"
            @click="delAll"
          >
            批量删除 {{ selectCount > 0 ? `(${selectCount})` : "" }}
          </el-button>
          <el-button @click="toggleExpandAll">
            {{ isAllExpanded ? "折叠全部" : "展开全部" }}
          </el-button>
          <el-button @click="getParentList">刷新</el-button>
        </div>

        <div class="toolbar-right">
          <el-input
            v-model="searchQuery"
            placeholder="按部门名称筛选..."
            clearable
            :prefix-icon="Search"
            class="search-input"
          />
        </div>
      </div>

      <!-- 纯表格展示：树形表格 -->
      <el-table
        ref="tableRef"
        v-loading="loading"
        :data="filteredData"
        row-key="id"
        default-expand-all
        :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
        border
        stripe
        class="dept-table"
        @selection-change="onSelectionChange"
      >
        <el-table-column type="selection" width="50" align="center" />

        <el-table-column prop="title" label="部门名称" min-width="260" />

        <el-table-column prop="sortOrder" label="排序值" width="100" align="center">
          <template #default="{ row }">
            <span v-if="row">{{ row.sortOrder ?? 0 }}</span>
          </template>
        </el-table-column>

        <el-table-column prop="createTime" label="创建时间" width="180" align="center">
          <template #default="{ row }">
            <span>{{ row.createTime || "-" }}</span>
          </template>
        </el-table-column>

        <el-table-column label="操作" width="210" fixed="right" align="center">
          <template #default="{ row }">
            <div class="ops-row">
              <template v-if="row.parentId === 0 || row.parentId === '0'">
                <a class="link-text" @click="addChild(row)">添加子部门</a>
                <span class="op-split">|</span>
              </template>
              <a class="link-text" @click="editRow(row)">编辑</a>
              <span class="op-split">|</span>
              <a class="link-text error-text" @click="deleteRow(row)">删除</a>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 部门新建 / 编辑抽屉 -->
    <el-drawer
      v-model="modalVisible"
      :title="modalTitle"
      size="540px"
      append-to-body
      :close-on-click-modal="false"
      destroy-on-close
    >
      <el-form
        ref="formRef"
        :model="form"
        label-width="95px"
        :rules="formValidate"
      >
        <el-form-item v-if="form.parentTitle" label="上级部门">
          <el-input :model-value="form.parentTitle" disabled />
        </el-form-item>

        <el-form-item label="部门名称" prop="title">
          <el-input v-model="form.title" placeholder="请输入部门名称" />
        </el-form-item>

        <el-form-item label="选择角色">
          <el-select
            v-model="selectedRole"
            multiple
            :loading="userLoading"
            placeholder="请选择部门关联角色"
            style="width: 100%"
          >
            <el-option
              v-for="item in users"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="排序值" prop="sortOrder">
          <el-tooltip placement="right" content="值越小越靠前">
            <el-input-number v-model="form.sortOrder" :min="0" :max="1000" />
          </el-tooltip>
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="modalVisible = false">取消</el-button>
          <el-button type="primary" :loading="submitLoading" @click="submitForm">
            确定
          </el-button>
        </div>
      </template>
    </el-drawer>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { Search } from "@element-plus/icons-vue";
import {
  initDepartment,
  addDepartment,
  editDepartment,
  deleteDepartment,
  getUserByDepartmentId,
  getRoleList,
  updateDepartmentRole,
} from "@/api/index";

defineOptions({ name: "department-manage" });

const loading = ref(true);
const submitLoading = ref(false);
const userLoading = ref(false);
const modalVisible = ref(false);
const modalTitle = ref("");
const isEditMode = ref(false);

const data = ref([]);
const users = ref([]);
const selectedRole = ref([]);
const selectList = ref([]);
const selectCount = ref(0);
const searchQuery = ref("");
const isAllExpanded = ref(true);

const tableRef = ref(null);
const formRef = ref(null);

const form = ref({
  id: "",
  title: "",
  parentId: "0",
  parentTitle: "",
  sortOrder: 0,
  status: 0,
});

const formValidate = reactive({
  title: [{ required: true, message: "部门名称不能为空", trigger: "blur" }],
  sortOrder: [
    {
      required: true,
      type: "number",
      message: "排序值不能为空",
      trigger: "blur",
    },
  ],
});

// 前端树形过滤
const filteredData = computed(() => {
  const query = searchQuery.value.trim().toLowerCase();
  if (!query) {
    return data.value;
  }
  const filterTree = (nodes) => {
    return nodes
      .map((node) => {
        const matches = node.title && node.title.toLowerCase().includes(query);
        const filteredChildren = node.children ? filterTree(node.children) : [];
        if (matches || filteredChildren.length > 0) {
          return {
            ...node,
            children: filteredChildren.length > 0 ? filteredChildren : undefined,
          };
        }
        return null;
      })
      .filter(Boolean);
  };
  return filterTree(data.value);
});

function init() {
  getParentList();
  loadRoles();
}

function getParentList() {
  loading.value = true;
  initDepartment()
    .then((res) => {
      loading.value = false;
      if (res.success) {
        const list = Array.isArray(res.result) ? res.result : [];
        data.value = bubbleSort(normalizeDepartmentTree(list));
      }
    })
    .catch(() => {
      loading.value = false;
    });
}

function loadRoles() {
  getRoleList({
    pageNumber: 1,
    pageSize: 10000,
  }).then((res) => {
    if (res.success) {
      users.value = res.result.records || [];
    }
  });
}

function normalizeDepartmentTree(list) {
  return list.map((item) => {
    const node = { ...item };
    if (Array.isArray(node.children) && node.children.length > 0) {
      node.children = normalizeDepartmentTree(node.children);
    } else {
      delete node.children;
    }
    return node;
  });
}

function bubbleSort(array) {
  if (!Array.isArray(array)) return [];
  const len = array.length;
  if (len < 2) return array;
  for (let i = 0; i < len; i++) {
    for (let j = 0; j < i; j++) {
      if (array[j].sortOrder > array[i].sortOrder) {
        const temp = array[j];
        array[j] = array[i];
        array[i] = temp;
      }
    }
  }
  return array;
}

function onSelectionChange(selection) {
  selectList.value = selection;
  selectCount.value = selection.length;
}

function toggleExpandAll() {
  isAllExpanded.value = !isAllExpanded.value;
  const toggleRows = (rows) => {
    rows.forEach((row) => {
      tableRef.value?.toggleRowExpansion(row, isAllExpanded.value);
      if (row.children && row.children.length) {
        toggleRows(row.children);
      }
    });
  };
  toggleRows(data.value);
}

// 添加一级部门
function addRoot() {
  isEditMode.value = false;
  modalTitle.value = "添加一级部门";
  form.value = {
    id: "",
    title: "",
    parentId: 0,
    parentTitle: "",
    sortOrder: 0,
    status: 0,
  };
  selectedRole.value = [];
  modalVisible.value = true;
}

// 添加子部门
function addChild(row) {
  isEditMode.value = false;
  modalTitle.value = `添加子部门 (上级: ${row.title})`;
  form.value = {
    id: "",
    title: "",
    parentId: row.id,
    parentTitle: row.title,
    sortOrder: 0,
    status: 0,
  };
  selectedRole.value = [];
  modalVisible.value = true;
}

// 编辑当前部门
function editRow(row) {
  isEditMode.value = true;
  modalTitle.value = `编辑部门 - ${row.title}`;
  form.value = {
    id: row.id,
    title: row.title,
    parentId: row.parentId,
    parentTitle: "",
    sortOrder: row.sortOrder ?? 0,
    status: row.status ?? 0,
  };
  selectedRole.value = [];
  userLoading.value = true;
  modalVisible.value = true;

  getUserByDepartmentId(row.id)
    .then((res) => {
      userLoading.value = false;
      if (res && res.result) {
        selectedRole.value = res.result.map((item) => item.roleId);
      }
    })
    .catch(() => {
      userLoading.value = false;
    });
}

// 提交表单（统一处理新增与修改）
function submitForm() {
  formRef.value.validate((valid) => {
    if (valid) {
      submitLoading.value = true;
      if (isEditMode.value) {
        // 编辑模式
        const roleWay = selectedRole.value.map((roleId) => ({
          departmentId: form.value.id,
          roleId,
        }));
        Promise.all([
          editDepartment(form.value.id, form.value),
          updateDepartmentRole(form.value.id, roleWay),
        ])
          .then((res) => {
            submitLoading.value = false;
            if (res[0].success) {
              ElMessage.success("编辑部门成功");
              modalVisible.value = false;
              getParentList();
            }
          })
          .catch(() => {
            submitLoading.value = false;
          });
      } else {
        // 新增模式
        addDepartment(form.value)
          .then((res) => {
            submitLoading.value = false;
            if (res.success) {
              ElMessage.success("添加部门成功");
              modalVisible.value = false;
              getParentList();
            }
          })
          .catch(() => {
            submitLoading.value = false;
          });
      }
    }
  });
}

// 单个删除
function deleteRow(row) {
  ElMessageBox.confirm(
    `您确认要删除部门 "${row.title}" 及其下级所有数据?`,
    "确认删除",
    {
      type: "warning",
      confirmButtonText: "确定删除",
      cancelButtonText: "取消",
    }
  )
    .then(() => {
      deleteDepartment(row.id).then((res) => {
        if (res.success) {
          ElMessage.success("删除成功");
          getParentList();
        }
      });
    })
    .catch(() => {});
}

// 批量删除
function delAll() {
  if (selectCount.value <= 0) {
    ElMessage.warning("您还未勾选要删除的数据");
    return;
  }
  ElMessageBox.confirm(
    `您确认要删除所选的 ${selectCount.value} 条部门数据及其下级所有数据?`,
    "确认删除",
    {
      type: "warning",
      confirmButtonText: "确定删除",
      cancelButtonText: "取消",
    }
  )
    .then(() => {
      const ids = selectList.value.map((e) => e.id).join(",");
      deleteDepartment(ids).then((res) => {
        if (res.success) {
          ElMessage.success("删除成功");
          selectList.value = [];
          selectCount.value = 0;
          getParentList();
        }
      });
    })
    .catch(() => {});
}

onMounted(() => {
  init();
});
</script>

<style lang="scss" scoped>
.department-manage {
  width: 100%;

  .manage-card {
    border-radius: 8px;
    border: 1px solid #ebeef5;
    background: #fff;

    :deep(.el-card__body) {
      padding: 18px 20px 24px;
    }
  }

  .table-toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 12px;
    margin-bottom: 16px;

    .toolbar-left {
      display: flex;
      align-items: center;
      gap: 10px;
      flex-wrap: wrap;
    }

    .toolbar-right {
      display: flex;
      align-items: center;

      .search-input {
        width: 240px;
      }
    }
  }

  .dept-table {
    width: 100%;

    :deep(.el-table__row) {
      transition: background-color 0.2s ease;
    }
  }

  .dialog-footer {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
  }
}

.link-text {
  color: #2d8cf0;
  cursor: pointer;
  text-decoration: none;
  font-size: 14px;
  line-height: 1;
  display: inline-block;

  &:hover {
    color: #57a3f3;
  }

  &.error-text {
    color: #ed4014;

    &:hover {
      color: #f16643;
    }
  }
}

.ops-row {
  white-space: nowrap;
}

.op-split {
  margin: 0 8px;
  color: #dcdee2;
  font-size: 14px;
}
</style>
