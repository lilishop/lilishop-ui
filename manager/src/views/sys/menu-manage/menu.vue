<template>
  <div class="search">
    <el-card>
      <el-row class="operation">
        <el-switch
          v-model="strict"
          class="selectModel"
          active-text="级联"
          inactive-text="单选"
          style="margin-right: 5px"
        />
        <el-button @click="addRootMenu">添加顶级菜单</el-button>
        <el-button type="primary" @click="addMenu">添加子菜单</el-button>
        <el-button @click="delAll">批量删除</el-button>
        <el-dropdown @command="handleDropdown">
          <el-button>
            更多操作
            <el-icon class="el-icon--right"><ArrowDown /></el-icon>
          </el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="refresh">刷新</el-dropdown-item>
              <el-dropdown-item command="expandOne">收合所有</el-dropdown-item>
              <el-dropdown-item command="expandTwo">展开一级</el-dropdown-item>
              <el-dropdown-item command="expandThree">展开两级</el-dropdown-item>
              <el-dropdown-item command="expandAll">展开所有</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </el-row>
      <el-row type="flex" justify="start">
        <el-col :md="8" :lg="8" :xl="6">
          <el-alert type="info" show-icon :closable="false">
            当前选择编辑：
            <span class="select-title">{{ editTitle }}</span>
            <a class="select-clear" v-if="form.id" @click="cancelEdit">取消选择</a>
          </el-alert>
          <el-input
            v-model="searchKey"
            clearable
            placeholder="输入菜单名搜索"
            @input="search"
            @clear="search"
          />
          <div v-loading="loading" class="tree-bar" :style="{ maxHeight: maxHeight }">
            <el-tree
              :key="treeKey"
              ref="treeRef"
              :data="data"
              :props="treeProps"
              node-key="id"
              show-checkbox
              highlight-current
              :check-strictly="!strict"
              :default-expanded-keys="expandedKeys"
              :current-node-key="currentNodeKey"
              @node-click="onNodeClick"
              @check="onCheckChange"
            >
              <template #default="{ data: nodeData }">
                <span class="tree-node-label">
                  <el-icon v-if="nodeData.level == 0" class="tree-node-icon"><Menu /></el-icon>
                  <el-icon v-else class="tree-node-icon"><List /></el-icon>
                  <span>{{ nodeData.title }}</span>
                </span>
              </template>
            </el-tree>
          </div>
        </el-col>
        <el-col :md="15" :lg="13" :xl="9" style="margin-left: 10px">
          <el-form ref="formRef" :model="form" label-width="110px" :rules="formValidate">
            <el-form-item label="类型" prop="type">
              <div v-show="form.level == 0">
                <el-icon :size="16" style="margin-right: 5px"><Menu /></el-icon>
                <span>顶级菜单</span>
              </div>
              <div v-show="form.level == 1 || form.level == 2">
                <el-icon :size="16" style="margin-right: 5px"><List /></el-icon>
                <span>页面菜单</span>
              </div>
            </el-form-item>
            <el-form-item label="菜单名称" prop="title">
              <el-input class="menu-input" v-model="form.title" />
            </el-form-item>
            <el-form-item
              v-if="form.level != 0"
              label="路由地址"
              prop="path"
              class="block-tool"
            >
              <el-tooltip placement="right" content="路由地址，英文唯一，跳转页面，路径展示用 ">
                <el-input class="menu-input" v-model="form.path" />
              </el-tooltip>
            </el-form-item>
            <el-form-item label="路由名称" prop="name" class="block-tool">
              <el-tooltip placement="right" content="路由name，需英文唯一，跳转页面用">
                <el-input class="menu-input" v-model="form.name" />
              </el-tooltip>
            </el-form-item>
            <el-form-item v-if="form.level != 0" label="文件路径" prop="frontRoute">
              <el-input class="menu-input" v-model="form.frontRoute" />
            </el-form-item>
            <el-form-item v-if="form.level != 0" label="权限url" class="block-tool">
              <el-tooltip placement="right" content="*号模糊匹配，逗号分割">
                <el-input
                  class="menu-input"
                  v-model="form.permission"
                  type="textarea"
                  maxlength="1000"
                />
              </el-tooltip>
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
                保存
              </el-button>
              <el-button @click="handleReset">重置</el-button>
            </el-form-item>
          </el-form>
        </el-col>
      </el-row>
    </el-card>

    <el-dialog
      v-model="menuModalVisible"
      :title="modalTitle"
      width="500px"
      align-center
      append-to-body
      :close-on-click-modal="false"
      class="menu-manage-dialog"
    >
      <el-form ref="formAddRef" :model="formAdd" label-width="100px" :rules="formValidate">
        <div v-if="showParent">
          <el-form-item label="上级节点：">{{ parentTitle }}</el-form-item>
        </div>
        <el-form-item label="类型" prop="type">
          <div v-show="formAdd.level == 0">
            <el-icon :size="16" style="margin-right: 5px"><Menu /></el-icon>
            <span>顶级菜单</span>
          </div>
          <div v-show="formAdd.level != 0">
            <el-icon :size="16" style="margin-right: 5px"><List /></el-icon>
            <span>页面菜单</span>
          </div>
        </el-form-item>
        <el-form-item label="菜单名称" prop="title">
          <el-input class="menu-input" v-model="formAdd.title" />
        </el-form-item>
        <el-form-item v-if="formAdd.level != 0" label="路由地址" prop="path">
          <el-input v-model="formAdd.path" />
        </el-form-item>
        <el-form-item label="路由名称" prop="name" class="block-tool">
          <el-tooltip placement="right" content="路由name，需英文唯一，跳转页面用">
            <el-input v-model="formAdd.name" />
          </el-tooltip>
        </el-form-item>
        <el-form-item v-if="formAdd.level != 0" label="文件路径" prop="frontRoute">
          <el-input v-model="formAdd.frontRoute" />
        </el-form-item>
        <el-form-item v-if="formAdd.level != 0" label="权限url">
          <el-input v-model="formAdd.permission" type="textarea" />
          <div class="desc">*号模糊匹配，逗号分割</div>
        </el-form-item>
        <el-form-item label="排序值" prop="sortOrder">
          <el-tooltip placement="right" content="值越小越靠前，支持小数">
            <el-input-number v-model="formAdd.sortOrder" :max="1000" :min="0" />
          </el-tooltip>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="menuModalVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="submitAdd">提交</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { Menu, List, ArrowDown } from "@element-plus/icons-vue";
import {
  getAllPermissionList,
  addPermission,
  editPermission,
  deletePermission,
  searchPermission,
} from "@/api/index";
import util from "@/libs/util.js";
import { useAppStore } from "@/stores/app";

defineOptions({ name: "menu-manage" });

const appStore = useAppStore();

const loading = ref(true);
const strict = ref(true);
const maxHeight = ref("500px");
const expandLevel = ref(1);
const menuModalVisible = ref(false);
const selectList = ref([]);
const selectCount = ref(0);
const showParent = ref(false);
const searchKey = ref("");
const parentTitle = ref("");
const editTitle = ref("");
const modalTitle = ref("");
const expandedKeys = ref([]);
const currentNodeKey = ref(null);
const treeKey = ref(0);
const treeProps = reactive({
  label: "title",
  children: "children",
});
const form = ref({
  id: "",
  title: "",
  name: "",
  path: "",
  frontRoute: "",
  parentId: "",
  sortOrder: 0,
  level: 0,
  permission: "",
});
const formAdd = ref({});
const formValidate = reactive({
  title: [{ required: true, message: "菜单名称名称不能为空", trigger: "blur" }],
  name: [{ required: true, message: "路由名称不能为空", trigger: "blur" }],
  path: [{ required: true, message: "路由地址不能为空", trigger: "blur" }],
  frontRoute: [{ required: true, message: "文件地址不能为空", trigger: "blur" }],
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

const treeRef = ref(null);
const formRef = ref(null);
const formAddRef = ref(null);

function init() {
  getAllList();
}

function collectExpandedKeys(nodes, keys = []) {
  if (!nodes) return keys;
  nodes.forEach((node) => {
    if (node.expand === true) {
      keys.push(node.id);
    }
    if (node.children && node.children.length > 0) {
      collectExpandedKeys(node.children, keys);
    }
  });
  return keys;
}

function handleDropdown(name) {
  if (name == "expandOne") {
    expandLevel.value = 1;
    getAllList();
  } else if (name == "expandTwo") {
    expandLevel.value = 2;
    getAllList();
  } else if (name == "expandThree") {
    expandLevel.value = 3;
    getAllList();
  }
  if (name == "expandAll") {
    expandLevel.value = 4;
    getAllList();
  } else if (name == "refresh") {
    getAllList();
  }
}

function getAllList() {
  loading.value = true;
  getAllPermissionList().then((res) => {
    loading.value = false;
    if (res.success) {
      const level = expandLevel.value;
      res.result.forEach(function (e) {
        if (level == 1) {
          if (e.level == 0) {
            e.expand = false;
          }
          if (e.children && e.children.length > 0) {
            e.children.forEach(function (c) {
              if (c.level == 1) {
                c.expand = false;
              }
              if (c.children && c.children.length > 0) {
                c.children.forEach(function (b) {
                  if (b.level == 2) {
                    b.expand = false;
                  }
                });
              }
            });
          }
        } else if (level == 2) {
          if (e.level == 0) {
            e.expand = true;
          }
          if (e.children && e.children.length > 0) {
            e.children.forEach(function (c) {
              if (c.level == 1) {
                c.expand = false;
              }
              if (c.children && c.children.length > 0) {
                c.children.forEach(function (b) {
                  if (b.level == 2) {
                    b.expand = false;
                  }
                });
              }
            });
          }
        } else if (level == 3) {
          if (e.level == 0) {
            e.expand = true;
          }
          if (e.children && e.children.length > 0) {
            e.children.forEach(function (c) {
              if (c.level == 1) {
                c.expand = true;
              }
              if (c.children && c.children.length > 0) {
                c.children.forEach(function (b) {
                  if (b.level == 2) {
                    b.expand = false;
                  }
                });
              }
            });
          }
        } else if (level == 4) {
          if (e.level == 0) {
            e.expand = true;
          }
          if (e.children && e.children.length > 0) {
            e.children.forEach(function (c) {
              if (c.level == 1) {
                c.expand = true;
              }
              if (c.children && c.children.length > 0) {
                c.children.forEach(function (b) {
                  if (b.level == 2) {
                    b.expand = true;
                  }
                });
              }
            });
          }
        }
      });
      data.value = res.result;
      expandedKeys.value = collectExpandedKeys(res.result);
      treeKey.value += 1;
    }
  });
}

function onNodeClick(nodeData) {
  if (nodeData) {
    const menu = JSON.parse(JSON.stringify(nodeData));
    form.value = menu;
    editTitle.value = menu.title;
    currentNodeKey.value = menu.id;
  } else {
    cancelEdit();
  }
}

function onCheckChange(_data, { checkedNodes }) {
  selectList.value = checkedNodes;
  selectCount.value = checkedNodes.length;
}

function search() {
  if (searchKey.value) {
    loading.value = true;
    searchPermission({ title: searchKey.value }).then((res) => {
      loading.value = false;
      if (res.success) {
        data.value = res.result;
        expandedKeys.value = [];
        treeKey.value += 1;
      }
    });
  } else {
    getAllList();
  }
}

function cancelEdit() {
  treeRef.value?.setCurrentKey(null);
  currentNodeKey.value = null;
  formRef.value.resetFields();
  form.value.id = "";
  editTitle.value = "";
}

function handleReset() {
  formRef.value.resetFields();
  form.value.frontRoute = "";
}

function submitEdit() {
  formRef.value.validate((valid) => {
    if (valid) {
      if (!form.value.id) {
        ElMessage.warning("请先点击选择要修改的菜单节点");
        return;
      }
      submitLoading.value = true;
      if (form.value.sortOrder == null) {
        form.value.sortOrder = 0;
      }
      delete form.value.icon;
      delete form.value.frontComponent;
      delete form.value.buttonType;
      delete form.value.updateTime;
      delete form.value.selected;
      delete form.value.description;
      delete form.value.children;

      editPermission(form.value).then((res) => {
        submitLoading.value = false;
        if (res.success) {
          ElMessage.success("编辑成功");
          appStore.setAdded(false);
          util.initRouter();
          init();
          menuModalVisible.value = false;
        }
      });
    }
  });
}

function submitAdd() {
  formAddRef.value.validate((valid) => {
    if (valid) {
      submitLoading.value = true;

      addPermission(formAdd.value).then((res) => {
        submitLoading.value = false;
        if (res.success) {
          ElMessage.success("添加成功");
          appStore.setAdded(false);
          util.initRouter();
          init();
          menuModalVisible.value = false;
        }
      });
    }
  });
}

function addMenu() {
  if (!form.value.id) {
    ElMessage.warning("请先点击选择一个菜单权限节点");
    return;
  }
  parentTitle.value = form.value.title;
  modalTitle.value = "添加子节点";
  showParent.value = true;
  if (form.value.level == 2) {
    ElMessageBox.alert("仅支持2级菜单目录", "抱歉，不能添加啦", { type: "warning" });
    return;
  }
  formAdd.value = {
    parentId: form.value.id,
    level: Number(form.value.level) + 1,
    sortOrder: 0,
    permission: "",
  };
  if (form.value.level == 0) {
    formAdd.value.path = "/";
    formAdd.value.frontRoute = "Main";
  }
  menuModalVisible.value = true;
}

function addRootMenu() {
  modalTitle.value = "添加顶级菜单";
  showParent.value = false;
  formAdd.value = {
    level: 0,
    sortOrder: 0,
  };
  menuModalVisible.value = true;
}

function delAll() {
  if (selectCount.value <= 0) {
    ElMessage.warning("您还未勾选要删除的数据");
    return;
  }
  ElMessageBox.confirm("您确认要删除所选的 " + selectCount.value + " 条数据?", "确认删除", { type: "warning" }).then(() => {
      let ids = "";
      selectList.value.forEach(function (e) {
        ids += e.id + ",";
      });
      ids = ids.substring(0, ids.length - 1);
      deletePermission(ids).then((res) => {
        if (res.success) {
          ElMessage.success("删除成功");
          appStore.setAdded(false);
          util.initRouter();
          selectList.value = [];
          selectCount.value = 0;
          cancelEdit();
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
.desc {
  font-size: 12px;
  color: #999;
}
.menu-input {
  width: 362px;
}
.tree-node-icon {
  margin-right: 8px;
  vertical-align: middle;
}
.tree-node-label {
  display: inline-flex;
  align-items: center;
}
</style>

<style lang="scss">
.menu-manage-dialog .el-dialog__body {
  max-height: calc(100vh - 220px);
  overflow-y: auto;
}
</style>
