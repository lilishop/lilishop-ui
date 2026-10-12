<template>
  <div class="search">
    <el-card>
      <el-row class="operation">
        <el-switch
          v-model="strict"
          active-text="级联"
          inactive-text="单选"
          style="margin-right: 5px"
        />
        <el-button @click="addRoot">添加部门</el-button>
        <el-button type="primary" @click="add">添加子部门</el-button>
        <el-button @click="delAll">批量删除</el-button>
        <el-button @click="getParentList">刷新</el-button>
      </el-row>
      <el-row type="flex" justify="start">
        <el-col :md="8" :lg="8" :xl="6">
          <el-alert type="info" show-icon :closable="false">
            当前选择编辑：
            <span class="select-title">{{ editTitle }}</span>
            <a v-if="form.id" class="select-clear" @click="cancelSelect">取消选择</a>
          </el-alert>
          <div v-loading="loading" class="tree-bar" :style="{ maxHeight: maxHeight }">
            <el-tree
              ref="treeRef"
              :data="data"
              :props="treeProps"
              node-key="id"
              show-checkbox
              highlight-current
              default-expand-all
              :check-strictly="!strict"
              :current-node-key="currentNodeKey"
              @node-click="onNodeClick"
              @check="onCheckChange"
            />
          </div>
        </el-col>
        <el-col :md="15" :lg="13" :xl="9" style="margin-left: 10px">
          <el-form ref="formRef" :model="form" label-width="100px" :rules="formValidate">
            <el-form-item label="部门名称" prop="title">
              <el-input v-model="form.title" />
            </el-form-item>
            <el-form-item label="选择角色">
              <el-select
                v-model="selectedRole"
                multiple
                :loading="userLoading"
                placeholder="请选择角色"
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
              <el-tooltip placement="right" content="值越小越靠前，支持小数">
                <el-input-number v-model="form.sortOrder" :max="1000" :min="0" />
              </el-tooltip>
            </el-form-item>
            <el-form-item>
              <el-button
                type="primary"
                style="margin-right: 5px"
                :loading="submitLoading"
                @click="submitEdit"
              >
                修改并保存
              </el-button>
              <el-button @click="handleReset">重置</el-button>
            </el-form-item>
          </el-form>
        </el-col>
      </el-row>
    </el-card>

    <el-dialog
      v-model="modalVisible"
      :title="modalTitle"
      width="500px"
      :close-on-click-modal="false"
    >
      <el-form ref="formAddRef" :model="formAdd" label-width="85px" :rules="formValidate">
        <div v-if="showParent">
          <el-form-item label="上级部门：">{{ form.title }}</el-form-item>
        </div>
        <el-form-item label="部门名称" prop="title">
          <el-input v-model="formAdd.title" />
        </el-form-item>
        <el-form-item label="排序值" prop="sortOrder">
          <el-tooltip placement="right" content="值越小越靠前，支持小数">
            <el-input-number v-model="formAdd.sortOrder" :max="1000" :min="0" />
          </el-tooltip>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="cancelAdd">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="submitAdd">提交</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
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
const maxHeight = ref("500px");
const strict = ref(true);
const userLoading = ref(false);
const loadingEdit = ref(false);
const modalVisible = ref(false);
const selectList = ref([]);
const selectCount = ref(0);
const showParent = ref(false);
const modalTitle = ref("");
const editTitle = ref("");
const selectedRole = ref([]);
const searchKey = ref("");
const currentNodeKey = ref(null);
const treeProps = reactive({
  label: "title",
  children: "children",
  isLeaf: "isLeaf",
});
const form = ref({
  id: "",
  title: "",
  parentId: "",
  parentTitle: "",
  sortOrder: 0,
  status: 0,
});
const formAdd = ref({});
const formValidate = reactive({
  title: [{ required: true, message: "名称不能为空", trigger: "blur" }],
  sortOrder: [
    {
      required: true,
      type: "number",
      message: "排序值不能为空",
      trigger: "blur",
    },
  ],
});
const submitLoading = ref(false);
const data = ref([]);
const dataEdit = ref([]);
const users = ref([]);

const treeRef = ref(null);
const formRef = ref(null);
const formAddRef = ref(null);

function init() {
  getParentList();
}

function getParentList() {
  loading.value = true;
  initDepartment().then((res) => {
    loading.value = false;
    if (res.success) {
      const list = Array.isArray(res.result) ? res.result : [];
      data.value = bubbleSort(normalizeDepartmentTree(list));
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

function onNodeClick(data) {
  if (!data) {
    cancelSelect();
    return;
  }
  const row = JSON.parse(JSON.stringify(data));
  for (const attr in row) {
    if (row[attr] == null) {
      row[attr] = "";
    }
  }
  editTitle.value = row.title;
  currentNodeKey.value = row.id;
  userLoading.value = true;

  getUserByDepartmentId(row.id).then((res) => {
    const way = [];
    res.result &&
      res.result.forEach((item) => {
        way.push(item.roleId);
      });
    selectedRole.value = way;
  });

  getRoleList({
    pageNumber: 1,
    pageSize: 10000,
  }).then((res) => {
    userLoading.value = false;
    if (res.success) {
      users.value = res.result.records;
      form.value = row;
    }
  });
}

function onCheckChange(_data, { checkedNodes }) {
  selectList.value = checkedNodes;
  selectCount.value = checkedNodes.length;
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

function cancelSelect() {
  treeRef.value?.setCurrentKey(null);
  currentNodeKey.value = null;
  formRef.value.resetFields();
  delete form.value.id;
  editTitle.value = "";
  selectedRole.value = [];
}

function selectTreeEdit(v) {
  if (v.length > 0) {
    for (const attr in v[0]) {
      if (v[0][attr] == null) {
        v[0][attr] = "";
      }
    }
    const data = JSON.parse(JSON.stringify(v[0]));
    form.value.parentId = data.id;
    form.value.parentTitle = data.title;
  }
}

function cancelAdd() {
  modalVisible.value = false;
}

function handleReset() {
  formRef.value.resetFields();
  form.value.status = 0;
}

function submitEdit() {
  formRef.value.validate((valid) => {
    if (valid) {
      if (!form.value.id) {
        ElMessage.warning("请先点击选择要修改的部门");
        return;
      }
      const roleWay = [];
      selectedRole.value.forEach((item) => {
        roleWay.push({
          departmentId: form.value.id,
          roleId: item,
        });
      });

      Promise.all([
        editDepartment(form.value.id, form.value),
        updateDepartmentRole(form.value.id, roleWay),
      ]).then((res) => {
        submitLoading.value = false;
        if (res[0].success) {
          ElMessage.success("编辑成功");
          init();
          modalVisible.value = false;
        }
      });
    }
  });
}

function submitAdd() {
  formAddRef.value.validate((valid) => {
    if (valid) {
      submitLoading.value = true;
      addDepartment(formAdd.value).then((res) => {
        submitLoading.value = false;
        if (res.success) {
          ElMessage.success("添加成功");
          init();
          modalVisible.value = false;
        }
      });
    }
  });
}

function add() {
  if (form.value.id == "" || form.value.id == null) {
    ElMessage.warning("请先点击选择一个部门");
    return;
  }
  modalTitle.value = "添加子部门";
  showParent.value = true;
  formAdd.value = {
    parentId: form.value.id,
    sortOrder: 0,
    status: 0,
  };
  modalVisible.value = true;
}

function addRoot() {
  modalTitle.value = "添加一级部门";
  showParent.value = false;
  formAdd.value = {
    parentId: 0,
    sortOrder: 0,
    status: 0,
  };
  modalVisible.value = true;
}

function delAll() {
  if (selectCount.value <= 0) {
    ElMessage.warning("您还未勾选要删除的数据");
    return;
  }
  ElMessageBox.confirm("您确认要删除所选的 " + selectCount.value + " 条数据及其下级所有数据?", "确认删除", { type: "warning" }).then(() => {
      let ids = "";
      selectList.value.forEach(function (e) {
        ids += e.id + ",";
      });
      ids = ids.substring(0, ids.length - 1);
      deleteDepartment(ids).then((res) => {
        if (res.success) {
          ElMessage.success("删除成功");
          selectList.value = [];
          selectCount.value = 0;
          cancelSelect();
          init();
        }
      });
  }).catch(() => {});
}

onMounted(() => {
  const height = document.documentElement.clientHeight;
  maxHeight.value = Number(height - 287) + "px";
  init();
});
</script>

<style lang="scss" scoped>
@import "@/styles/tree-common.scss";
</style>
