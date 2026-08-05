<template>
  <el-dialog
    :model-value="modelValue"
    title="选择分销员"
    width="900px"
    :close-on-click-modal="false"
    destroy-on-close
    append-to-body
    @close="handleClose"
  >
    <el-form inline label-width="70px" class="search-form" @keyup.enter="handleSearch">
      <el-form-item label="手机号">
        <el-input v-model="searchForm.mobile" placeholder="请输入手机号" clearable style="width: 180px" />
      </el-form-item>
      <el-form-item label="昵称">
        <el-input v-model="searchForm.nickname" placeholder="请输入昵称" clearable style="width: 180px" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleSearch">搜索</el-button>
      </el-form-item>
    </el-form>

    <el-table
      v-loading="loading"
      border
      :data="data"
      row-key="id"
      highlight-current-row
      max-height="420"
      @row-click="handleRowClick"
      @current-change="handleCurrentChange"
    >
      <el-table-column width="55" align="center">
        <template #default="{ row }">
          <el-radio v-model="selectedId" :label="row.id" @click.stop @change="handleRadioChange(row)">
            <span />
          </el-radio>
        </template>
      </el-table-column>
      <el-table-column prop="mobile" label="手机号" min-width="120" />
      <el-table-column prop="nickname" label="昵称" min-width="120" show-overflow-tooltip />
      <el-table-column prop="gradeName" label="等级" min-width="100" />
      <el-table-column prop="joinTime" label="加入时间" min-width="160" />
    </el-table>

    <div class="pagination-wrap">
      <el-pagination
        v-model:current-page="searchForm.pageNumber"
        v-model:page-size="searchForm.pageSize"
        :page-sizes="[10, 20, 50]"
        :total="total"
        layout="total, sizes, prev, pager, next"
        size="small"
        @current-change="getDataList"
        @size-change="changePageSize"
      />
    </div>

    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" :disabled="!selectedRow" @click="handleConfirm">确定</el-button>
    </template>
  </el-dialog>
</template>

<script>
import { getDistributionMemberPage } from "@/api/distribution";

export default {
  name: "distributionSelector",
  props: {
    modelValue: {
      type: Boolean,
      default: false,
    },
    excludeId: {
      type: String,
      default: "",
    },
  },
  emits: ["update:modelValue", "confirm"],
  data() {
    return {
      loading: false,
      searchForm: {
        pageNumber: 1,
        pageSize: 10,
        mobile: "",
        nickname: "",
      },
      data: [],
      total: 0,
      selectedId: "",
      selectedRow: null,
    };
  },
  watch: {
    modelValue(val) {
      if (val) {
        this.resetState();
        this.getDataList();
      }
    },
  },
  methods: {
    resetState() {
      this.searchForm = {
        pageNumber: 1,
        pageSize: 10,
        mobile: "",
        nickname: "",
      };
      this.selectedId = "";
      this.selectedRow = null;
    },
    buildParams() {
      const params = {
        pageNumber: this.searchForm.pageNumber,
        pageSize: this.searchForm.pageSize,
        distributionStatus: "PASS",
      };
      if (this.searchForm.mobile) params.mobile = this.searchForm.mobile;
      if (this.searchForm.nickname) params.nickname = this.searchForm.nickname;
      return params;
    },
    getDataList() {
      this.loading = true;
      getDistributionMemberPage(this.buildParams())
        .then((res) => {
          this.loading = false;
          if (!res.success) return;
          const result = res.result || {};
          let records = result.records || [];
          const beforeCount = records.length;
          if (this.excludeId) {
            records = records.filter((item) => item.id !== this.excludeId);
          }
          this.data = records;
          const excludedCount = beforeCount - records.length;
          this.total = Math.max(0, (result.total || 0) - excludedCount);
        })
        .catch(() => {
          this.loading = false;
        });
    },
    handleSearch() {
      this.searchForm.pageNumber = 1;
      this.getDataList();
    },
    changePageSize() {
      this.searchForm.pageNumber = 1;
      this.getDataList();
    },
    handleRowClick(row) {
      if (!row) return;
      this.selectedRow = row;
      this.selectedId = row.id;
    },
    handleCurrentChange(row) {
      if (!row) return;
      this.selectedRow = row;
      this.selectedId = row.id;
    },
    handleRadioChange(row) {
      this.selectedRow = row;
    },
    handleClose() {
      this.$emit("update:modelValue", false);
    },
    handleConfirm() {
      if (!this.selectedRow) {
        this.$Message.warning("请选择分销员");
        return;
      }
      this.$emit("confirm", this.selectedRow);
      this.handleClose();
    },
  },
};
</script>

<style scoped lang="scss">
.pagination-wrap {
  display: flex;
  justify-content: flex-end;
  margin-top: 12px;
}
</style>
