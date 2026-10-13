<template>
  <div>
    <el-cascader
      v-model="selectDep"
      :options="department"
      :props="cascaderProps"
      filterable
      clearable
      placeholder="请选择"
      style="width: 100%"
      @change="handleChangeDep"
    />
  </div>
</template>

<script setup>
import { ref } from "vue";
import { initDepartment } from "@/api/index";

defineOptions({ name: "departmentChoose" });

const emit = defineEmits(["on-change"]);

const selectDep = ref([]);
const department = ref([]);
const cascaderProps = ref({
  value: "value",
  label: "label",
  children: "children",
  checkStrictly: true,
  emitPath: true,
});

function initDepartmentData() {
  initDepartment().then((res) => {
    if (res.success) {
      const arr = Array.isArray(res.result) ? res.result : [];
      filterData(arr);
      department.value = arr;
    }
  });
}
function handleChangeDep(value) {
  let departmentId = "";
  if (value && value.length > 0) {
    departmentId = value[value.length - 1];
  }
  emit("on-change", departmentId);
}
function clearSelect() {
  selectDep.value = [];
}
function filterData(data) {
  data.forEach((e) => {
    e.value = e.id;
    e.label = e.title;
    if (e.children) {
      filterData(e.children);
    }
  });
}

initDepartmentData();

// 供父组件通过 ref 清空选择/读取选中项（当前引用方 clerkManage 未使用，作为公共组件 API 保留）
defineExpose({ clearSelect, selectDep });
</script>
