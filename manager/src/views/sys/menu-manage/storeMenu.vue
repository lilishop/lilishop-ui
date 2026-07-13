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
          <el-form ref="form" :model="form" label-width="110px" :rules="formValidate">
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
      <el-form ref="formAdd" :model="formAdd" label-width="100px" :rules="formValidate">
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

<script>
import { ElMessage, ElMessageBox } from "element-plus";
import { Menu, List, ArrowDown } from "@element-plus/icons-vue";
import {
  getStoreAllPermissionList,
  addStorePermission,
  editStorePermission,
  deleteStorePermission,
  searchStorePermission,
} from "@/api/index";
import util from "@/libs/util.js";

export default {
  name: "store-menu-manage",
  components: {
    Menu,
    List,
    ArrowDown,
  },
  data() {
    return {
      loading: true,
      strict: true,
      maxHeight: "500px",
      expandLevel: 1,
      menuModalVisible: false,
      selectList: [],
      selectCount: 0,
      showParent: false,
      searchKey: "",
      parentTitle: "",
      editTitle: "",
      modalTitle: "",
      expandedKeys: [],
      currentNodeKey: null,
      treeKey: 0,
      treeProps: {
        label: "title",
        children: "children",
      },
      form: {
        id: "",
        title: "",
        name: "",
        path: "",
        frontRoute: "",
        parentId: "",
        sortOrder: 0,
        level: 0,
        permission: "",
      },
      formAdd: {},
      formValidate: {
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
      },
      submitLoading: false,
      data: [],
    };
  },
  methods: {
    init() {
      this.getAllList();
    },
    collectExpandedKeys(nodes, keys = []) {
      if (!nodes) return keys;
      nodes.forEach((node) => {
        if (node.expand === true) {
          keys.push(node.id);
        }
        if (node.children && node.children.length > 0) {
          this.collectExpandedKeys(node.children, keys);
        }
      });
      return keys;
    },
    handleDropdown(name) {
      if (name == "expandOne") {
        this.expandLevel = 1;
        this.getAllList();
      } else if (name == "expandTwo") {
        this.expandLevel = 2;
        this.getAllList();
      } else if (name == "expandThree") {
        this.expandLevel = 3;
        this.getAllList();
      }
      if (name == "expandAll") {
        this.expandLevel = 4;
        this.getAllList();
      } else if (name == "refresh") {
        this.getAllList();
      }
    },
    getAllList() {
      this.loading = true;
      getStoreAllPermissionList().then((res) => {
        this.loading = false;
        if (res.success) {
          const expandLevel = this.expandLevel;
          res.result.forEach(function (e) {
            if (expandLevel == 1) {
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
            } else if (expandLevel == 2) {
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
            } else if (expandLevel == 3) {
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
            } else if (expandLevel == 4) {
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
          this.data = res.result;
          this.expandedKeys = this.collectExpandedKeys(res.result);
          this.treeKey += 1;
        }
      });
    },
    onNodeClick(data) {
      if (data) {
        const menu = JSON.parse(JSON.stringify(data));
        this.form = menu;
        this.editTitle = menu.title;
        this.currentNodeKey = menu.id;
      } else {
        this.cancelEdit();
      }
    },
    onCheckChange(_data, { checkedNodes }) {
      this.selectList = checkedNodes;
      this.selectCount = checkedNodes.length;
    },
    search() {
      if (this.searchKey) {
        this.loading = true;
        searchStorePermission({ title: this.searchKey }).then((res) => {
          this.loading = false;
          if (res.success) {
            this.data = res.result;
            this.expandedKeys = [];
            this.treeKey += 1;
          }
        });
      } else {
        this.getAllList();
      }
    },
    cancelEdit() {
      this.$refs.treeRef?.setCurrentKey(null);
      this.currentNodeKey = null;
      this.$refs.form.resetFields();
      this.form.id = "";
      this.editTitle = "";
    },
    handleReset() {
      this.$refs.form.resetFields();
      this.form.frontRoute = "";
    },
    submitEdit() {
      this.$refs.form.validate((valid) => {
        if (valid) {
          if (!this.form.id) {
            ElMessage.warning("请先点击选择要修改的菜单节点");
            return;
          }
          this.submitLoading = true;
          if (this.form.sortOrder == null) {
            this.form.sortOrder = 0;
          }
          delete this.form.icon;
          delete this.form.frontComponent;
          delete this.form.buttonType;
          delete this.form.updateTime;
          delete this.form.selected;
          delete this.form.description;
          delete this.form.children;

          editStorePermission(this.form).then((res) => {
            this.submitLoading = false;
            if (res.success) {
              ElMessage.success("编辑成功");
              this.$store.commit("setAdded", false);
              util.initRouter(this);
              this.init();
              this.menuModalVisible = false;
            }
          });
        }
      });
    },
    submitAdd() {
      this.$refs.formAdd.validate((valid) => {
        if (valid) {
          this.submitLoading = true;

          addStorePermission(this.formAdd).then((res) => {
            this.submitLoading = false;
            if (res.success) {
              ElMessage.success("添加成功");
              this.$store.commit("setAdded", false);
              util.initRouter(this);
              this.init();
              this.menuModalVisible = false;
            }
          });
        }
      });
    },
    addMenu() {
      if (!this.form.id) {
        ElMessage.warning("请先点击选择一个菜单权限节点");
        return;
      }
      this.parentTitle = this.form.title;
      this.modalTitle = "添加子节点";
      this.showParent = true;
      if (this.form.level == 2) {
        ElMessageBox.alert("仅支持2级菜单目录", "抱歉，不能添加啦", { type: "warning" });
        return;
      }
      this.formAdd = {
        parentId: this.form.id,
        level: Number(this.form.level) + 1,
        sortOrder: 0,
        permission: "",
      };
      if (this.form.level == 0) {
        this.formAdd.path = "/";
        this.formAdd.frontRoute = "Main";
      }
      this.menuModalVisible = true;
    },
    addRootMenu() {
      this.modalTitle = "添加顶级菜单";
      this.showParent = false;
      this.formAdd = {
        level: 0,
        sortOrder: 0,
      };
      this.menuModalVisible = true;
    },
    delAll() {
      if (this.selectCount <= 0) {
        ElMessage.warning("您还未勾选要删除的数据");
        return;
      }
      ElMessageBox.confirm("您确认要删除所选的 " + this.selectCount + " 条数据?", "确认删除", { type: "warning" }).then(() => {
          let ids = "";
          this.selectList.forEach(function (e) {
            ids += e.id + ",";
          });
          ids = ids.substring(0, ids.length - 1);
          deleteStorePermission(ids).then((res) => {
            if (res.success) {
              ElMessage.success("删除成功");
              this.$store.commit("setAdded", false);
              util.initRouter(this);
              this.selectList = [];
              this.selectCount = 0;
              this.cancelEdit();
              this.init();
            }
          });
      }).catch(() => {});
    },
  },
  mounted() {
    const height = document.documentElement.clientHeight;
    this.maxHeight = Number(height - 287) + "px";
    this.init();
  },
};
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
