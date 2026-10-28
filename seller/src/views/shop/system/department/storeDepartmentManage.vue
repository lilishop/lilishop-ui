<template>
  <div class="search">
    <el-card>
      <div class="operation">
        <el-button type="primary" @click="openAdd('0')">添加部门</el-button>
        <el-button @click="delAll">批量删除</el-button>
        <el-button @click="getList">刷新</el-button>
      </div>
      <el-table
        v-loading="loading"
        :data="data"
        row-key="id"
        border
        default-expand-all
        @selection-change="onSelectionChange"
      >
        <el-table-column type="selection" width="50" align="center" />
        <el-table-column prop="title" label="部门名称" min-width="180" />
        <el-table-column label="上级部门" min-width="140">
          <template #default="{ row }">{{ parentTitle(row) }}</template>
        </el-table-column>
        <el-table-column prop="sortOrder" label="排序值" width="90" align="center" />
        <el-table-column prop="createTime" label="创建时间" width="170" align="center" />
        <el-table-column prop="updateTime" label="修改时间" width="170" align="center" />
        <el-table-column label="操作" width="200" align="right" fixed="right">
          <template #default="{ row }">
            <a class="link-text" @click="openAdd(row.id)">添加子级</a>
            <span class="op-split">|</span>
            <a class="link-text" @click="openEdit(row)">编辑</a>
            <span class="op-split">|</span>
            <a class="link-text" @click="delOne(row)">删除</a>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog
      v-model="modalVisible"
      :title="modalTitle"
      width="500px"
      :close-on-click-modal="false"
      destroy-on-close
    >
      <el-form ref="formRef" :model="form" label-width="85px" :rules="formValidate">
        <el-form-item label="上级部门">
          <el-tree-select
            v-model="form.parentId"
            :data="parentOptions"
            :props="{ label: 'title', children: 'children' }"
            node-key="id"
            check-strictly
            default-expand-all
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="部门名称" prop="title">
          <el-input v-model="form.title" placeholder="请输入部门名称" />
        </el-form-item>
        <el-form-item v-if="modalType === 1" label="选择角色">
          <el-select
            v-model="selectedRole"
            multiple
            :loading="roleLoading"
            placeholder="请选择角色"
            style="width: 100%"
          >
            <el-option
              v-for="item in roles"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="排序值" prop="sortOrder">
          <el-tooltip placement="right" content="值越小越靠前，支持小数">
            <el-input-number v-model="form.sortOrder" :max="1000" :min="0" />
          </el-tooltip>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="modalVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="handleSubmit">提交</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";
import {
  initDepartment,
  addDepartment,
  editDepartment,
  deleteDepartment,
  getUserByDepartmentId,
  getRoleList,
  updateDepartmentRole,
} from "@/api/index";
import { Message, Modal } from "@/utils/message";

defineOptions({ name: "store-department-manage" });

const formRef = ref(null);
const loading = ref(true);
const modalVisible = ref(false);
const modalType = ref(0); // 0 添加 1 编辑
const modalTitle = ref("");
const submitLoading = ref(false);
const roleLoading = ref(false);
const data = ref([]);
const roles = ref([]);
const selectedRole = ref([]);
const selectedRows = ref([]);
const form = ref({
  id: "",
  parentId: "0",
  title: "",
  sortOrder: 0,
  status: 0,
});
const formValidate = {
  title: [{ required: true, message: "名称不能为空", trigger: "blur" }],
  sortOrder: [
    {
      required: true,
      type: "number",
      message: "排序值不能为空",
      trigger: "blur",
    },
  ],
};

// id -> title 映射，用于展示上级部门名称
const titleMap = computed(() => {
  const map = {};
  const walk = (list) => {
    list.forEach((item) => {
      map[item.id] = item.title;
      if (item.children?.length) walk(item.children);
    });
  };
  walk(data.value);
  return map;
});

// 上级部门下拉树：根节点为“一级部门”；编辑时剔除自身及子级，防止循环挂级
const parentOptions = computed(() => {
  const tree =
    modalType.value === 1 ? pruneTree(data.value, form.value.id) : data.value;
  return [{ id: "0", title: "一级部门", children: tree }];
});

function pruneTree(list, excludeId) {
  return list
    .filter((item) => item.id !== excludeId)
    .map((item) => ({
      ...item,
      children: item.children?.length
        ? pruneTree(item.children, excludeId)
        : undefined,
    }));
}

function parentTitle(row) {
  if (row.parentId === "0" || row.parentId == null) return "-";
  return titleMap.value[row.parentId] || "-";
}

function getList() {
  loading.value = true;
  initDepartment()
    .then((res) => {
      if (res.success) {
        const list = Array.isArray(res.result) ? res.result : [];
        data.value = sortTree(normalizeDepartmentTree(list));
      }
    })
    .finally(() => {
      loading.value = false;
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

function sortTree(list) {
  list.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
  list.forEach((item) => {
    if (item.children?.length) sortTree(item.children);
  });
  return list;
}

function onSelectionChange(rows) {
  selectedRows.value = rows;
}

function openAdd(parentId) {
  modalType.value = 0;
  modalTitle.value = parentId === "0" ? "添加部门" : "添加子部门";
  form.value = { id: "", parentId, title: "", sortOrder: 0, status: 0 };
  modalVisible.value = true;
}

function openEdit(row) {
  modalType.value = 1;
  modalTitle.value = "编辑部门";
  form.value = {
    id: row.id,
    parentId: row.parentId ?? "0",
    title: row.title,
    sortOrder: row.sortOrder ?? 0,
    status: 0,
  };
  selectedRole.value = [];
  roleLoading.value = true;
  modalVisible.value = true;
  Promise.all([
    getUserByDepartmentId(row.id),
    getRoleList({ pageNumber: 1, pageSize: 10000 }),
  ]).then(([bindRes, roleRes]) => {
    roleLoading.value = false;
    if (bindRes.result) {
      selectedRole.value = bindRes.result.map((item) => item.roleId);
    }
    if (roleRes.success) {
      roles.value = roleRes.result.records;
    }
  });
}

function handleSubmit() {
  formRef.value.validate((valid) => {
    if (!valid) return;
    submitLoading.value = true;
    if (modalType.value === 0) {
      addDepartment(form.value).then((res) => {
        submitLoading.value = false;
        if (res.success) {
          Message.success("添加成功");
          modalVisible.value = false;
          getList();
        }
      });
    } else {
      const roleWay = selectedRole.value.map((roleId) => ({
        departmentId: form.value.id,
        roleId,
      }));
      Promise.all([
        editDepartment(form.value.id, form.value),
        updateDepartmentRole(form.value.id, roleWay),
      ]).then((res) => {
        submitLoading.value = false;
        if (res[0].success) {
          Message.success("编辑成功");
          modalVisible.value = false;
          getList();
        }
      });
    }
  });
}

function delOne(row) {
  Modal.confirm({
    title: "确认删除",
    content: "删除该部门将同时删除其下级所有部门，确认删除？",
    loading: true,
    onOk: () => {
      deleteDepartment(row.id).then((res) => {
        Modal.remove();
        if (res.success) {
          Message.success("删除成功");
          getList();
        }
      });
    },
  });
}

function delAll() {
  if (selectedRows.value.length === 0) {
    Message.warning("您还未勾选要删除的数据");
    return;
  }
  Modal.confirm({
    title: "确认删除",
    content: `您确认要删除所选的 ${selectedRows.value.length} 条数据及其下级所有数据?`,
    loading: true,
    onOk: () => {
      const ids = selectedRows.value.map((e) => e.id).join(",");
      deleteDepartment(ids).then((res) => {
        Modal.remove();
        if (res.success) {
          Message.success("删除成功");
          selectedRows.value = [];
          getList();
        }
      });
    },
  });
}

onMounted(() => {
  getList();
});
</script>

<style lang="scss" scoped>
.operation {
  margin-bottom: 12px;
}
.link-text {
  color: #2d8cf0;
  cursor: pointer;
  text-decoration: none;
}
.op-split {
  margin: 0 8px;
  color: #dcdee2;
}
</style>
