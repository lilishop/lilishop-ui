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

<script>
import { initDepartment } from "@/api/index";

export default {
  name: "departmentChoose",
  data() {
    return {
      selectDep: [],
      department: [],
      cascaderProps: {
        value: "value",
        label: "label",
        children: "children",
        checkStrictly: true,
        emitPath: true,
      },
    };
  },
  methods: {
    initDepartmentData() {
      initDepartment().then((res) => {
        if (res.success) {
          const arr = res.result;
          this.filterData(arr);
          this.department = arr;
        }
      });
    },
    handleChangeDep(value) {
      let departmentId = "";
      if (value && value.length > 0) {
        departmentId = value[value.length - 1];
      }
      this.$emit("on-change", departmentId);
    },
    clearSelect() {
      this.selectDep = [];
    },
    filterData(data) {
      data.forEach((e) => {
        e.value = e.id;
        e.label = e.title;
        if (e.children) {
          this.filterData(e.children);
        }
      });
    },
  },
  created() {
    this.initDepartmentData();
  },
};
</script>
