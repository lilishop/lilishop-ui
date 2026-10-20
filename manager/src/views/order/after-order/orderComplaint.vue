<template>
  <div class="search">
    <el-card>
      <el-form
        ref="searchFormRef"
        :model="searchForm"
        inline
        label-width="70px"
        class="search-form"
        @keyup.enter="handleSearch"
      >
        <el-form-item label="订单编号" prop="orderSn">
          <el-input
            v-model="searchForm.orderSn"
            placeholder="请输入订单编号"
            clearable
            style="width: 240px"
          />
        </el-form-item>
        <el-form-item label="会员名称" prop="memberName">
          <el-input
            v-model="searchForm.memberName"
            placeholder="请输入会员名称"
            clearable
            style="width: 240px"
          />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="searchForm.status" placeholder="请选择" clearable style="width: 240px">
            <el-option label="新投诉" value="NEW" />
            <el-option label="已撤销" value="CANCEL" />
            <el-option label="待申诉" value="WAIT_APPEAL" />
            <el-option label="对话中" value="COMMUNICATION" />
            <el-option label="等待仲裁" value="WAIT_ARBITRATION" />
            <el-option label="已完成" value="COMPLETE" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" class="search-btn" @click="handleSearch">搜索</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="mt_10">
      <el-table
        ref="table"
        v-loading="loading"
        border
        :data="data"
        style="width: 100%"
      >
        <el-table-column prop="orderSn" label="订单编号" min-width="150" align="left" />
        <el-table-column prop="storeName" label="店铺名称" min-width="120" align="left" />
        <el-table-column prop="memberName" label="会员名称" min-width="120" align="left" />
        <el-table-column prop="complainTopic" label="投诉主题" min-width="130" align="left" />
        <el-table-column prop="complainStatus" label="投诉状态" width="120" align="center">
          <template #default="{ row }">
            <el-tag
              v-if="row && row.complainStatus"
              :type="complainStatusTagType(row.complainStatus)"
              size="small"
            >
              {{ complainStatusText(row.complainStatus) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="投诉时间" min-width="160" align="left" />
        <el-table-column label="操作" width="120" align="center" fixed="right">
          <template #default="{ row }">
            <a v-if="row" class="link-text" @click="detail(row)">
              {{ row.complainStatus === "COMPLETE" ? "详情" : "处理" }}
            </a>
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
          @current-change="getDataList"
          @size-change="() => { searchForm.pageNumber = 1; getDataList(); }"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { onMounted, ref, watch } from "vue";
import { useTable } from "@/utils/useTable";
import { useRoute } from "vue-router";
import * as API_Order from "@/api/order";
import { customRouterPush } from "@/utils/filters";

defineOptions({ name: "orderComplaint" });

const route = useRoute();
const searchFormRef = ref(null);
const table = ref(null);

const { loading, data, total, searchForm, getDataList, handleSearch, resetSearch } = useTable(
  API_Order.getOrderComplain,
  {
    pageSize: 20,
    immediate: false,
    form: {
      sort: "createTime",
      order: "desc",
      orderSn: "",
      memberName: "",
      status: "",
    },
    beforeRequest: (p) => {
      const params = { ...p };
      if (route.query.orderSn && !params.orderSn) params.orderSn = route.query.orderSn;
      if (route.query.status && !params.status) params.status = route.query.status;
      return params;
    },
  }
);

watch(
  () => route.query,
  () => {
    getDataList();
  }
);

function complainStatusText(v) {
  const map = {
    NEW: "新投诉",
    CANCEL: "已撤销",
    WAIT_APPEAL: "待申诉",
    COMMUNICATION: "对话中",
    WAIT_ARBITRATION: "等待仲裁",
    COMPLETE: "已完成",
  };
  return map[v] || v || "-";
}

function complainStatusTagType(v) {
  const map = {
    NEW: "primary",
    CANCEL: "info",
    WAIT_APPEAL: "warning",
    COMMUNICATION: "warning",
    WAIT_ARBITRATION: "",
    COMPLETE: "success",
  };
  return map[v] || "info";
}

function detail(v) {
  customRouterPush({
    name: "order-complaint-detail",
    query: { id: v.id },
  });
}

onMounted(() => {
  if (route.query.orderSn) searchForm.orderSn = route.query.orderSn;
  if (route.query.status) searchForm.status = route.query.status;
  getDataList();
});
</script>

<style scoped>
.link-text {
  color: #409eff;
  cursor: pointer;
  text-decoration: none;
}
</style>
