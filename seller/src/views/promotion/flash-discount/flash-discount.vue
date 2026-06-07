<template>
  <div class="search">
    <el-card>
      <el-form ref="searchForm" :model="searchForm" inline label-width="70px" class="search-form" @keyup.enter="handleSearch">
        <el-form-item label="活动名称" prop="promotionName">
          <el-input v-model="searchForm.promotionName" placeholder="请输入活动名称" clearable style="width: 240px" />
        </el-form-item>
        <el-form-item label="活动状态" prop="promotionStatus">
          <el-select v-model="searchForm.promotionStatus" placeholder="请选择" clearable style="width: 240px">
            <el-option label="未开始" value="NEW" />
            <el-option label="已开始" value="START" />
            <el-option label="已结束" value="END" />
            <el-option label="已关闭" value="CLOSE" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button type="primary" @click="goAdd">新建活动</el-button>
        </el-form-item>
      </el-form>
    </el-card>
    <el-card>
      <el-table v-loading="loading" border :data="data" class="mt_10">
        <el-table-column prop="promotionName" label="活动名称" min-width="140" />
        <el-table-column prop="startTime" label="开始时间" width="170" />
        <el-table-column prop="endTime" label="结束时间" width="170" />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="statusType(row.promotionStatus)">{{ statusText(row.promotionStatus) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="160" fixed="right">
          <template #default="{ row }">
            <a class="link-text" @click="goEdit(row)">编辑</a>
            <span class="op-split">|</span>
            <a class="link-text" @click="toggleStatus(row)">关闭</a>
          </template>
        </el-table-column>
      </el-table>
      <div class="mt_10" style="display: flex; justify-content: flex-end">
        <el-pagination
          v-model:current-page="searchForm.pageNumber"
          v-model:page-size="searchForm.pageSize"
          :total="total"
          layout="total, prev, pager, next"
          @current-change="getDataList"
        />
      </div>
    </el-card>
  </div>
</template>

<script>
import { getFlashDiscountList, updateFlashDiscountStatus, getFlashDiscountDetail, saveFlashDiscount, editFlashDiscount } from "@/api/promotion.js";

export default {
  data() {
    return {
      loading: false,
      total: 0,
      data: [],
      searchForm: { pageNumber: 1, pageSize: 20, sort: "createTime", order: "desc" },
    };
  },
  mounted() {
    this.getDataList();
  },
  methods: {
    statusText(s) {
      return { NEW: "未开始", START: "进行中", END: "已结束", CLOSE: "已关闭" }[s] || s;
    },
    statusType(s) {
      return { NEW: "info", START: "success", END: "danger", CLOSE: "danger" }[s] || "info";
    },
    handleSearch() {
      this.searchForm.pageNumber = 1;
      this.getDataList();
    },
    getDataList() {
      this.loading = true;
      getFlashDiscountList(this.searchForm).then((res) => {
        this.loading = false;
        if (res.success) {
          this.data = res.result.records;
          this.total = res.result.total;
        }
      });
    },
    goAdd() {
      this.$router.push({ name: "flash-discount-add" });
    },
    goEdit(row) {
      this.$router.push({ name: "flash-discount-add", query: { id: row.id } });
    },
    toggleStatus(row) {
      updateFlashDiscountStatus(row.id).then((res) => {
        if (res.success) {
          this.$Message.success("操作成功");
          this.getDataList();
        }
      });
    },
  },
};
</script>

<style scoped>
.link-text { color: #409eff; cursor: pointer; }
.op-split { margin: 0 8px; color: #dcdfe6; }
.mt_10 { margin-top: 10px; }
</style>
