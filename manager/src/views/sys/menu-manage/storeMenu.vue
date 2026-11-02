<template>
  <div class="menu-manage-container">
    <el-card shadow="never" class="manage-card">
      <!-- 顶部操作工具栏 -->
      <div class="table-toolbar">
        <div class="toolbar-left">
          <el-button type="primary" @click="addRootMenu">添加顶级菜单</el-button>
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
          <el-button @click="getAllList">刷新</el-button>
        </div>

        <div class="toolbar-right">
          <el-input
            v-model="searchQuery"
            placeholder="按菜单名称筛选..."
            clearable
            :prefix-icon="Search"
            class="search-input"
          />
        </div>
      </div>

      <!-- 纯列表树形表格 -->
      <el-table
        ref="tableRef"
        v-loading="loading"
        :data="filteredData"
        row-key="id"
        default-expand-all
        :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
        border
        stripe
        class="menu-table"
        @selection-change="onSelectionChange"
      >
        <el-table-column type="selection" width="50" align="center" />

        <el-table-column prop="title" label="菜单名称" min-width="220" />

        <el-table-column prop="level" label="类型" width="100" align="center">
          <template #default="{ row }">
            <span v-if="row">{{ row.level === 0 ? "顶级菜单" : row.level === 1 ? "一级页面" : "二级页面" }}</span>
          </template>
        </el-table-column>

        <el-table-column prop="path" label="路由地址" min-width="160">
          <template #default="{ row }">
            <span>{{ row.path || "-" }}</span>
          </template>
        </el-table-column>

        <el-table-column prop="name" label="路由名称" min-width="150">
          <template #default="{ row }">
            <span>{{ row.name || "-" }}</span>
          </template>
        </el-table-column>

        <el-table-column prop="frontRoute" label="前端组件" min-width="180" show-overflow-tooltip>
          <template #default="{ row }">
            <span>{{ row.frontRoute || "-" }}</span>
          </template>
        </el-table-column>

        <el-table-column prop="sortOrder" label="排序值" width="90" align="center">
          <template #default="{ row }">
            <span>{{ row.sortOrder ?? 0 }}</span>
          </template>
        </el-table-column>

        <el-table-column label="操作" width="210" fixed="right" align="right">
          <template #default="{ row }">
            <div class="ops-row">
              <template v-if="row.level < 2">
                <a class="link-text" @click="addChildMenu(row)">添加子菜单</a>
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

    <!-- 菜单新建 / 编辑抽屉 -->
    <el-drawer
      v-model="modalVisible"
      :title="modalTitle"
      size="560px"
      append-to-body
      :close-on-click-modal="false"
      destroy-on-close
    >
      <el-form
        ref="formRef"
        :model="form"
        label-width="100px"
        :rules="formValidate"
      >
        <el-form-item v-if="parentTitle" label="上级菜单">
          <el-input :model-value="parentTitle" disabled />
        </el-form-item>

        <el-form-item label="菜单类型">
          <el-tag v-if="form.level === 0" type="primary">顶级菜单</el-tag>
          <el-tag v-else type="success">页面菜单 (Level {{ form.level }})</el-tag>
        </el-form-item>

        <el-form-item label="菜单名称" prop="title">
          <el-input v-model="form.title" placeholder="请输入菜单名称" />
        </el-form-item>

        <el-form-item v-if="form.level != 0" label="路由地址" prop="path">
          <el-input v-model="form.path" placeholder="英文唯一，如 /goods" />
        </el-form-item>

        <el-form-item label="路由名称" prop="name">
          <el-tooltip placement="right" content="英文唯一，用于路由跳转">
            <el-input v-model="form.name" placeholder="请输入路由名称" />
          </el-tooltip>
        </el-form-item>

        <el-form-item v-if="form.level != 0" label="前端组件" prop="frontRoute">
          <el-input v-model="form.frontRoute" placeholder="例如 Main 或 views/goods/index" />
        </el-form-item>

        <el-form-item v-if="form.level != 0" label="权限URL">
          <el-input
            v-model="form.permission"
            type="textarea"
            :rows="3"
            placeholder="支持 * 号模糊匹配，多个用英文逗号分割"
          />
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
  getStoreAllPermissionList,
  addStorePermission,
  editStorePermission,
  deleteStorePermission,
} from "@/api/index";
import util from "@/libs/util.js";
import { useAppStore } from "@/stores/app";

defineOptions({ name: "store-menu-manage" });

const appStore = useAppStore();

const loading = ref(true);
const submitLoading = ref(false);
const modalVisible = ref(false);
const modalTitle = ref("");
const isEditMode = ref(false);
const parentTitle = ref("");

const data = ref([]);
const selectList = ref([]);
const selectCount = ref(0);
const searchQuery = ref("");
const isAllExpanded = ref(true);

const tableRef = ref(null);
const formRef = ref(null);

const form = ref({
  id: "",
  title: "",
  name: "",
  path: "",
  frontRoute: "",
  parentId: "0",
  sortOrder: 0,
  level: 0,
  permission: "",
});

const formValidate = reactive({
  title: [{ required: true, message: "菜单名称不能为空", trigger: "blur" }],
  name: [{ required: true, message: "路由名称不能为空", trigger: "blur" }],
  path: [{ required: true, message: "路由地址不能为空", trigger: "blur" }],
  frontRoute: [{ required: true, message: "前端组件路径不能为空", trigger: "blur" }],
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
        const matches =
          (node.title && node.title.toLowerCase().includes(query)) ||
          (node.name && node.name.toLowerCase().includes(query)) ||
          (node.path && node.path.toLowerCase().includes(query));
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
  getAllList();
}

function getAllList() {
  loading.value = true;
  getStoreAllPermissionList()
    .then((res) => {
      loading.value = false;
      if (res.success) {
        data.value = Array.isArray(res.result) ? res.result : [];
      }
    })
    .catch(() => {
      loading.value = false;
    });
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

// 添加顶级菜单
function addRootMenu() {
  isEditMode.value = false;
  parentTitle.value = "";
  modalTitle.value = "添加顶级菜单";
  form.value = {
    id: "",
    title: "",
    name: "",
    path: "/",
    frontRoute: "Main",
    parentId: 0,
    level: 0,
    sortOrder: 0,
    permission: "",
  };
  modalVisible.value = true;
}

// 添加子菜单
function addChildMenu(row) {
  if (row.level >= 2) {
    ElMessageBox.alert("仅支持2级菜单目录，不能再添加子菜单", "提示", {
      type: "warning",
    });
    return;
  }
  isEditMode.value = false;
  parentTitle.value = row.title;
  modalTitle.value = `添加子菜单 (上级: ${row.title})`;
  form.value = {
    id: "",
    title: "",
    name: "",
    path: "",
    frontRoute: "",
    parentId: row.id,
    level: Number(row.level) + 1,
    sortOrder: 0,
    permission: "",
  };
  if (row.level === 0) {
    form.value.path = "/";
    form.value.frontRoute = "Main";
  }
  modalVisible.value = true;
}

// 编辑当前菜单
function editRow(row) {
  isEditMode.value = true;
  parentTitle.value = "";
  modalTitle.value = `编辑菜单 - ${row.title}`;
  form.value = {
    id: row.id,
    title: row.title,
    name: row.name,
    path: row.path,
    frontRoute: row.frontRoute,
    parentId: row.parentId,
    level: row.level,
    sortOrder: row.sortOrder ?? 0,
    permission: row.permission || "",
  };
  modalVisible.value = true;
}

// 提交保存
function submitForm() {
  formRef.value.validate((valid) => {
    if (valid) {
      submitLoading.value = true;
      const payload = { ...form.value };
      if (payload.sortOrder == null) {
        payload.sortOrder = 0;
      }
      delete payload.children;
      delete payload.icon;
      delete payload.frontComponent;
      delete payload.buttonType;
      delete payload.updateTime;
      delete payload.selected;
      delete payload.description;

      const request = isEditMode.value
        ? editStorePermission(payload)
        : addStorePermission(payload);

      request
        .then((res) => {
          submitLoading.value = false;
          if (res.success) {
            ElMessage.success(isEditMode.value ? "编辑成功" : "添加成功");
            appStore.setAdded(false);
            util.initRouter();
            modalVisible.value = false;
            getAllList();
          }
        })
        .catch(() => {
          submitLoading.value = false;
        });
    }
  });
}

// 删除单个
function deleteRow(row) {
  ElMessageBox.confirm(
    `您确认要删除菜单 "${row.title}" 及其下级所有数据?`,
    "确认删除",
    {
      type: "warning",
      confirmButtonText: "确定删除",
      cancelButtonText: "取消",
    }
  )
    .then(() => {
      deleteStorePermission(row.id).then((res) => {
        if (res.success) {
          ElMessage.success("删除成功");
          appStore.setAdded(false);
          util.initRouter();
          getAllList();
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
    `您确认要删除所选的 ${selectCount.value} 条数据?`,
    "确认删除",
    {
      type: "warning",
      confirmButtonText: "确定删除",
      cancelButtonText: "取消",
    }
  )
    .then(() => {
      const ids = selectList.value.map((e) => e.id).join(",");
      deleteStorePermission(ids).then((res) => {
        if (res.success) {
          ElMessage.success("删除成功");
          appStore.setAdded(false);
          util.initRouter();
          selectList.value = [];
          selectCount.value = 0;
          getAllList();
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
.menu-manage-container {
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

  .menu-table {
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
