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

<script setup>
import { ref } from "vue";
import { initDepartment, searchDepartment } from "@/api/index";

defineOptions({ name: "departmentTreeChoose" });

const props = defineProps({
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
});
const emit = defineEmits(["on-change", "on-clear"]);

const depLoading = ref(false);
const departmentTitle = ref("");
const searchKey = ref("");
const dataDep = ref([]);
const cloneDep = ref([]);
const departmentId = ref([]);
const treeProps = {
  label: "title",
  children: "children",
};

function initDepartmentData() {
  depLoading.value = true;
  initDepartment()
    .then((res) => {
      if (res.success) {
        dataDep.value = res.result;
        cloneDep.value = JSON.parse(JSON.stringify(dataDep.value));
      }
    })
    .finally(() => {
      depLoading.value = false;
    });
}
function searchDep() {
  if (searchKey.value) {
    depLoading.value = true;
    searchDepartment({ title: searchKey.value })
      .then((res) => {
        if (res.success) {
          res.result.forEach((e) => {
            if (e.status == -1) {
              e.title = "[已禁用] " + e.title;
              e.disabled = true;
            }
          });
          dataDep.value = res.result;
        }
      })
      .finally(() => {
        depLoading.value = false;
      });
  } else {
    dataDep.value = JSON.parse(JSON.stringify(cloneDep.value));
  }
}
function selectTree(node) {
  if (!node) {
    emit("on-change", null);
    departmentId.value = "";
    departmentTitle.value = "";
    return;
  }
  departmentId.value = node.id;
  departmentTitle.value = node.title;
  emit("on-change", {
    departmentId: departmentId.value,
    departmentTitle: departmentTitle.value,
  });
}
function clearSelect() {
  departmentId.value = [];
  departmentTitle.value = "";
  initDepartmentData();
  if (props.multiple) {
    emit("on-change", []);
  } else {
    emit("on-change", "");
  }
  emit("on-clear");
}
function setData(ids, title) {
  departmentTitle.value = title;
  if (props.multiple) {
    departmentId.value = ids;
  } else {
    departmentId.value = [];
    departmentId.value.push(ids);
  }
}

initDepartmentData();

// 父组件（clerkManage）通过 ref 调用 setData / clearSelect
defineExpose({ setData, clearSelect });
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
