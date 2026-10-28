<template>
  <div class="search">
    <el-card>
      <el-form ref="searchFormRef" :model="searchForm" inline label-width="70px" class="search-form" @keyup.enter="handleSearch">
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
        <el-table-column prop="nthNum" label="第N件" width="80" />
        <el-table-column label="优惠方式" width="100">
          <template #default="{ row }">{{ discountTypeText(row.discountType) }}</template>
        </el-table-column>
        <el-table-column prop="startTime" label="开始时间" width="170" />
        <el-table-column prop="endTime" label="结束时间" width="170" />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="statusType(row.promotionStatus)">{{ statusText(row.promotionStatus) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column align="right" label="操作" width="160" fixed="right">
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

<script setup>
import { ref } from "vue";
import { useTable } from "@/utils/useTable";
import { useRouter } from "vue-router";
import { getNthItemDiscountList, updateNthItemDiscountStatus } from "@/api/promotion.js";
import { Message } from "@/utils/message";

const router = useRouter();

const {
  loading,
  data,
  total,
  searchForm,
  getDataList,
  handleSearch,
} = useTable(getNthItemDiscountList, { pageSize: 20, sort: "createTime", order: "desc" });

// searchFormRef：模板 ref 改名避免与顶层变量 searchForm 互相覆盖
const searchFormRef = ref(null);

function statusText(s) {
  return { NEW: "未开始", START: "进行中", END: "已结束", CLOSE: "已关闭" }[s] || s;
}
function statusType(s) {
  return { NEW: "info", START: "success", END: "danger", CLOSE: "danger" }[s] || "info";
}
function discountTypeText(t) {
  return { HALF: "半价", FREE: "免单", RATE: "打折" }[t] || t;
}
function goAdd() {
  router.push({ name: "nth-item-discount-add" });
}
function goEdit(row) {
  router.push({ name: "nth-item-discount-add", query: { id: row.id } });
}
function toggleStatus(row) {
  updateNthItemDiscountStatus(row.id).then((res) => {
    if (res.success) {
      Message.success("操作成功");
      getDataList();
    }
  });
}
</script>

<style scoped>
.link-text { color: #409eff; cursor: pointer; }
.op-split { margin: 0 8px; color: #dcdfe6; }
.mt_10 { margin-top: 10px; }
</style>
