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
          <el-form ref="form" :model="form" label-width="100px" :rules="formValidate">
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
      <el-form ref="formAdd" :model="formAdd" label-width="85px" :rules="formValidate">
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

<script>
import {
  initDepartment,
  addDepartment,
  editDepartment,
  deleteDepartment,
  getUserByDepartmentId,
  getRoleList,
  updateDepartmentRole,
} from "@/api/index";

export default {
  name: "store-department-manage",
  data() {
    return {
      loading: true,
      maxHeight: "500px",
      strict: true,
      userLoading: false,
      loadingEdit: false,
      modalVisible: false,
      selectList: [],
      selectCount: 0,
      showParent: false,
      modalTitle: "",
      editTitle: "",
      selectedRole: [],
      searchKey: "",
      currentNodeKey: null,
      treeProps: {
        label: "title",
        children: "children",
        isLeaf: "isLeaf",
      },
      form: {
        id: "",
        title: "",
        parentId: "",
        parentTitle: "",
        sortOrder: 0,
        status: 0,
      },
      formAdd: {},
      formValidate: {
        title: [{ required: true, message: "名称不能为空", trigger: "blur" }],
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
      dataEdit: [],
      users: [],
    };
  },
  methods: {
    init() {
      this.getParentList();
    },
    getParentList() {
      this.loading = true;
      initDepartment().then((res) => {
        this.loading = false;
        if (res.success) {
          const list = Array.isArray(res.result) ? res.result : [];
          this.data = this.bubbleSort(this.normalizeDepartmentTree(list));
        }
      });
    },
    normalizeDepartmentTree(list) {
      return list.map((item) => {
        const node = { ...item };
        if (Array.isArray(node.children) && node.children.length > 0) {
          node.children = this.normalizeDepartmentTree(node.children);
        } else {
          delete node.children;
        }
        return node;
      });
    },
    onNodeClick(data) {
      if (!data) {
        this.cancelSelect();
        return;
      }
      const row = JSON.parse(JSON.stringify(data));
      for (const attr in row) {
        if (row[attr] == null) {
          row[attr] = "";
        }
      }
      this.editTitle = row.title;
      this.currentNodeKey = row.id;
      this.userLoading = true;

      getUserByDepartmentId(row.id).then((res) => {
        const way = [];
        res.result &&
          res.result.forEach((item) => {
            way.push(item.roleId);
          });
        this.selectedRole = way;
      });

      getRoleList({
        pageNumber: 1,
        pageSize: 10000,
      }).then((res) => {
        this.userLoading = false;
        if (res.success) {
          this.users = res.result.records;
          this.form = row;
        }
      });
    },
    onCheckChange(_data, { checkedNodes }) {
      this.selectList = checkedNodes;
      this.selectCount = checkedNodes.length;
    },
    bubbleSort(array) {
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
    },
    cancelSelect() {
      this.$refs.treeRef?.setCurrentKey(null);
      this.currentNodeKey = null;
      this.$refs.form.resetFields();
      delete this.form.id;
      this.editTitle = "";
      this.selectedRole = [];
    },
    selectTreeEdit(v) {
      if (v.length > 0) {
        for (const attr in v[0]) {
          if (v[0][attr] == null) {
            v[0][attr] = "";
          }
        }
        const data = JSON.parse(JSON.stringify(v[0]));
        this.form.parentId = data.id;
        this.form.parentTitle = data.title;
      }
    },
    cancelAdd() {
      this.modalVisible = false;
    },
    handleReset() {
      this.$refs.form.resetFields();
      this.form.status = 0;
    },
    submitEdit() {
      this.$refs.form.validate((valid) => {
        if (valid) {
          if (!this.form.id) {
            this.$Message.warning("请先点击选择要修改的部门");
            return;
          }
          const roleWay = [];
          this.selectedRole.forEach((item) => {
            roleWay.push({
              departmentId: this.form.id,
              roleId: item,
            });
          });

          Promise.all([
            editDepartment(this.form.id, this.form),
            updateDepartmentRole(this.form.id, roleWay),
          ]).then((res) => {
            this.submitLoading = false;
            if (res[0].success) {
              this.$Message.success("编辑成功");
              this.init();
              this.modalVisible = false;
            }
          });
        }
      });
    },
    submitAdd() {
      this.$refs.formAdd.validate((valid) => {
        if (valid) {
          this.submitLoading = true;
          addDepartment(this.formAdd).then((res) => {
            this.submitLoading = false;
            if (res.success) {
              this.$Message.success("添加成功");
              this.init();
              this.modalVisible = false;
            }
          });
        }
      });
    },
    add() {
      if (this.form.id == "" || this.form.id == null) {
        this.$Message.warning("请先点击选择一个部门");
        return;
      }
      this.modalTitle = "添加子部门";
      this.showParent = true;
      this.formAdd = {
        parentId: this.form.id,
        sortOrder: 0,
        status: 0,
      };
      this.modalVisible = true;
    },
    addRoot() {
      this.modalTitle = "添加一级部门";
      this.showParent = false;
      this.formAdd = {
        parentId: 0,
        sortOrder: 0,
        status: 0,
      };
      this.modalVisible = true;
    },
    delAll() {
      if (this.selectCount <= 0) {
        this.$Message.warning("您还未勾选要删除的数据");
        return;
      }
      this.$Modal.confirm({
        title: "确认删除",
        content:
          "您确认要删除所选的 " + this.selectCount + " 条数据及其下级所有数据?",
        loading: true,
        onOk: () => {
          let ids = "";
          this.selectList.forEach(function (e) {
            ids += e.id + ",";
          });
          ids = ids.substring(0, ids.length - 1);
          deleteDepartment(ids).then((res) => {
            this.$Modal.remove();
            if (res.success) {
              this.$Message.success("删除成功");
              this.selectList = [];
              this.selectCount = 0;
              this.cancelSelect();
              this.init();
            }
          });
        },
      });
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
</style>
