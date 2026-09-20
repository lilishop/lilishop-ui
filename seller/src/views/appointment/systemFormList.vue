<template>
  <div class="search">
    <el-card>
      <el-form :model="searchForm" inline label-width="80px" @keyup.enter="handleSearch">
        <el-form-item label="表单名称">
          <el-input v-model="searchForm.formName" clearable placeholder="模糊匹配" style="width: 220px" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" clearable placeholder="全部" style="width: 160px">
            <el-option label="启用" value="ENABLED" />
            <el-option label="停用" value="DISABLED" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
          <el-button type="success" @click="goDesigner()">新建</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="mt_10">
      <el-table v-loading="loading" :data="data" border>
        <el-table-column prop="formName" label="表单名称" min-width="180" />
        <el-table-column label="状态" width="110">
          <template #default="{ row }">
            <el-switch
              :key="`${row.id}-${row.status}`"
              :model-value="row.status === 'ENABLED'"
              @change="(val) => toggleStatus(row, val)"
            />
          </template>
        </el-table-column>
        <el-table-column label="字段数" width="90">
          <template #default="{ row }">{{ fieldCount(row.formSchema) }}</template>
        </el-table-column>
        <el-table-column prop="updateTime" label="更新时间" min-width="170" />
        <el-table-column label="操作" width="160" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="goDesigner(row.id)">编辑</el-button>
            <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        class="mt_10"
        v-model:current-page="searchForm.pageNumber"
        v-model:page-size="searchForm.pageSize"
        :total="total"
        layout="total, prev, pager, next"
        @current-change="loadData"
      />
    </el-card>
  </div>
</template>

<script>
import { getRequest, postRequestWithNoForm, deleteRequest } from "@/libs/axios";
import { ElMessage, ElMessageBox } from "element-plus";
import { countFormFields } from "@/constants/systemForm";

export default {
  name: "appointmentSystemFormList",
  data() {
    return {
      loading: false,
      data: [],
      total: 0,
      searchForm: {
        formName: "",
        status: "",
        pageNumber: 1,
        pageSize: 10,
      },
    };
  },
  mounted() {
    this.loadData();
  },
  methods: {
    fieldCount: countFormFields,
    handleSearch() {
      this.searchForm.pageNumber = 1;
      this.loadData();
    },
    handleReset() {
      this.searchForm.formName = "";
      this.searchForm.status = "";
      this.searchForm.pageNumber = 1;
      this.loadData();
    },
    loadData() {
      this.loading = true;
      getRequest("/appointment/system-forms", this.searchForm)
        .then((res) => {
          if (res.success) {
            this.data = res.result?.records || [];
            this.total = res.result?.total || 0;
          }
        })
        .finally(() => {
          this.loading = false;
        });
    },
    goDesigner(id) {
      this.$router.push({
        name: "appointment-system-form-designer",
        query: id ? { id } : {},
      });
    },
    toggleStatus(row, enabled) {
      const status = enabled ? "ENABLED" : "DISABLED";
      postRequestWithNoForm("/appointment/system-forms", {
        id: row.id,
        formName: row.formName,
        formSchema: row.formSchema || "[]",
        status,
      }).then((res) => {
        if (res.success) {
          row.status = status;
          ElMessage.success(enabled ? "已启用" : "已停用");
        }
      });
    },
    handleDelete(row) {
      ElMessageBox.confirm("确认删除该表单？", "提示", { type: "warning" }).then(() => {
        deleteRequest(`/appointment/system-forms/${row.id}`).then((res) => {
          if (res.success) {
            ElMessage.success("已删除");
            this.loadData();
          }
        });
      });
    },
  },
};
</script>
