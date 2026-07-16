<template>
  <div class="search">
    <el-card>
      <el-form
        ref="searchForm"
        :model="searchForm"
        inline
        label-width="70px"
        class="search-form"
        @keyup.enter="handleSearch"
      >
        <el-form-item label="参数名称">
          <el-input
            v-model="searchForm.paramName"
            placeholder="请输入参数名称"
            clearable
            style="width: 240px"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card>
      <div class="operation padding-row">
        <el-button type="primary" @click="goAdd">添加</el-button>
      </div>
      <el-table v-loading="loading" border :data="data" ref="table" style="width: 100%">
        <el-table-column prop="paramName" label="参数名称" width="300" />
        <el-table-column prop="options" label="参数值" min-width="260" show-overflow-tooltip />
        <el-table-column label="必填" width="300" align="center">
          <template #default="{ row }">
            <span v-if="row">{{ isTruthyFlag(row.required) ? "是" : "否" }}</span>
          </template>
        </el-table-column>
        <el-table-column label="可索引" width="300" align="center">
          <template #default="{ row }">
            <span v-if="row">{{ isTruthyFlag(row.isIndex) ? "是" : "否" }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="300" align="center" fixed="right">
          <template #default="{ row }">
            <div v-if="row">
              <a class="link-text" @click="goEdit(row)">编辑</a>
              <span class="op-split">|</span>
              <a class="link-text" @click="remove(row)">删除</a>
            </div>
          </template>
        </el-table-column>
      </el-table>
      <div class="mt_10" style="display: flex; justify-content: flex-end">
        <el-pagination
          v-model:current-page="searchForm.pageNumber"
          v-model:page-size="searchForm.pageSize"
          :page-sizes="[20, 50, 100]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          size="small"
          @current-change="changePage"
          @size-change="changePageSize"
        />
      </div>
    </el-card>
  </div>
</template>
<script>
import { deleteParams, getGoodsParamsPage } from "@/api/goods";
import { ElMessage, ElMessageBox } from "element-plus";

export default {
  name: "categoryParams",
  data() {
    return {
      submitLoading: false,
      loading: true,
      total: 0,
      searchForm: {
        pageNumber: 1,
        pageSize: 20,
        sort: "createTime",
        order: "desc",
        paramName: "",
      },
      data: [],
    };
  },
  methods: {
    isTruthyFlag(val) {
      return val === 1 || val === "1" || val === true;
    },
    init() {
      this.getDataList();
    },
    changePage(v) {
      this.searchForm.pageNumber = v;
      this.getDataList();
    },
    changePageSize(v) {
      this.searchForm.pageNumber = 1;
      this.searchForm.pageSize = v;
      this.getDataList();
    },
    handleSearch() {
      this.searchForm.pageNumber = 1;
      this.searchForm.pageSize = 20;
      this.getDataList();
    },
    getDataList() {
      this.loading = true;
      getGoodsParamsPage(this.searchForm).then((res) => {
        this.loading = false;
        if (res && res.success) {
          this.data = (res.result && res.result.records) || [];
          this.total = (res.result && res.result.total) || 0;
        }
      });
    },
    goAdd() {
      this.$router.push({ name: "goods-parameter-edit" });
    },
    goEdit(row) {
      if (!row || !row.id) return;
      try {
        window.sessionStorage.setItem(`goods-parameter-edit:${row.id}`, JSON.stringify(row));
      } catch (e) {}
      this.$router.push({ name: "goods-parameter-edit", query: { id: row.id } });
    },
    remove(row) {
      ElMessageBox.confirm("您确认要删除 " + (row.paramName || "") + " ?", "确认删除", { type: "warning" }).then(() => {
        return deleteParams(row.id).then((res) => {
          if (res && res.success) {
            ElMessage.success("删除成功");
            this.getDataList();
          }
        });
      }).catch(() => {});
    },
  },
  mounted() {
    this.init();
  },
};
</script>
<style lang="scss">
.link-text {
  color: #409eff;
  cursor: pointer;
  text-decoration: none;
}
</style>
