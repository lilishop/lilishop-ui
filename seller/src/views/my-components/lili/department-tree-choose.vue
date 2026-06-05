<template>
  <div>
    <div style="display: flex">
      <el-input
        v-model="departmentTitle"
        readonly
        style="margin-right: 10px; flex: 1"
        :placeholder="placeholder"
        :clearable="clearable"
        @clear="clearSelect"
      />
      <el-popover trigger="click" placement="right" title="选择部门" :width="280">
        <template #reference>
          <el-button>选择部门</el-button>
        </template>
        <el-input
          v-model="searchKey"
          placeholder="输入部门名搜索"
          clearable
          style="margin-bottom: 8px"
          @input="searchDep"
        />
        <div v-loading="depLoading" class="dep-tree-bar">
          <el-tree
            :data="dataDep"
            :props="treeProps"
            node-key="id"
            highlight-current
            default-expand-all
            @node-click="selectTree"
          />
        </div>
      </el-popover>
    </div>
  </div>
</template>

<script>
import { initDepartment, searchDepartment } from "@/api/index";

export default {
  name: "departmentTreeChoose",
  props: {
    multiple: {
      type: Boolean,
      default: false,
    },
    clearable: {
      type: Boolean,
      default: true,
    },
    placeholder: {
      type: String,
      default: "点击选择部门",
    },
  },
  data() {
    return {
      depLoading: false,
      departmentTitle: "",
      searchKey: "",
      dataDep: [],
      cloneDep: [],
      departmentId: [],
      treeProps: {
        label: "title",
        children: "children",
      },
    };
  },
  methods: {
    initDepartmentData() {
      this.depLoading = true;
      initDepartment()
        .then((res) => {
          if (res.success) {
            this.dataDep = res.result;
            this.cloneDep = JSON.parse(JSON.stringify(this.dataDep));
          }
        })
        .finally(() => {
          this.depLoading = false;
        });
    },
    searchDep() {
      if (this.searchKey) {
        this.depLoading = true;
        searchDepartment({ title: this.searchKey })
          .then((res) => {
            if (res.success) {
              res.result.forEach((e) => {
                if (e.status == -1) {
                  e.title = "[已禁用] " + e.title;
                  e.disabled = true;
                }
              });
              this.dataDep = res.result;
            }
          })
          .finally(() => {
            this.depLoading = false;
          });
      } else {
        this.dataDep = JSON.parse(JSON.stringify(this.cloneDep));
      }
    },
    selectTree(node) {
      if (!node) {
        this.$emit("on-change", null);
        this.departmentId = "";
        this.departmentTitle = "";
        return;
      }
      this.departmentId = node.id;
      this.departmentTitle = node.title;
      this.$emit("on-change", {
        departmentId: this.departmentId,
        departmentTitle: this.departmentTitle,
      });
    },
    clearSelect() {
      this.departmentId = [];
      this.departmentTitle = "";
      this.initDepartmentData();
      if (this.multiple) {
        this.$emit("on-change", []);
      } else {
        this.$emit("on-change", "");
      }
      this.$emit("on-clear");
    },
    setData(ids, title) {
      this.departmentTitle = title;
      if (this.multiple) {
        this.departmentId = ids;
      } else {
        this.departmentId = [];
        this.departmentId.push(ids);
      }
    },
  },
  created() {
    this.initDepartmentData();
  },
};
</script>

<style lang="scss" scoped>
.dep-tree-bar {
  position: relative;
  min-height: 80px;
  max-height: 500px;
  overflow: auto;
  margin-top: 5px;
}

.dep-tree-bar::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

.dep-tree-bar::-webkit-scrollbar-thumb {
  border-radius: 4px;
  background: #e4e4e4;
}
</style>
