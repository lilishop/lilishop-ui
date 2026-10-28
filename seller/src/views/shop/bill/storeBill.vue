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
        <el-form-item label="开始时间" prop="startDate">
          <el-date-picker
            v-model="searchForm.startDate"
            type="date"
            value-format="YYYY-MM-DD HH:mm:ss"
            placeholder="请选择"
            clearable
            style="width: 240px"
          />
        </el-form-item>
        <el-form-item label="结束时间" prop="endDate">
          <el-date-picker
            v-model="searchForm.endDate"
            type="date"
            value-format="YYYY-MM-DD HH:mm:ss"
            placeholder="请选择"
            clearable
            style="width: 240px"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" class="search-btn" @click="handleSearch">搜索</el-button>
          <el-button class="search-btn" @click="handleReset">重置</el-button>
          <el-button class="search-btn" @click="handleExport">导出列表</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card>
      <div class="bill-tab">
        <el-tabs v-model="currentStatus" @tab-click="onStatusTabClick">
          <el-tab-pane
            v-for="(item, index) in billStatusTabs"
            :key="index"
            :label="item.title"
            :name="item.value"
          />
        </el-tabs>
      </div>

      <el-table v-loading="loading" border :data="data" ref="table" class="mt_10" style="width: 100%">
        <el-table-column prop="sn" label="账单号" min-width="250" show-overflow-tooltip />
        <el-table-column prop="createTime" label="生成时间" min-width="120" />
        <el-table-column label="结算时间段" width="200" show-overflow-tooltip>
          <template #default="{ row }">{{ row.startTime }}~{{ row.endTime }}</template>
        </el-table-column>
        <el-table-column label="结算金额" min-width="100">
          <template #default="{ row }">
            <priceColorScheme :value="row.billPrice" :color="$mainColor" />
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag v-if="row.billStatus === 'OUT'" type="primary">已出账</el-tag>
            <el-tag v-else-if="row.billStatus === 'CHECK'" type="info">已对账</el-tag>
            <el-tag v-else type="success">已付款</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="right" fixed="right" width="100">
          <template #default="{ row }">
            <a class="link-text" @click="detail(row)">查看</a>
          </template>
        </el-table-column>
      </el-table>

      <div class="mt_10" style="display: flex; justify-content: flex-end">
        <el-pagination
          v-model:current-page="searchForm.pageNumber"
          v-model:page-size="searchForm.pageSize"
          :page-sizes="[10, 20, 50]"
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

<script setup>
import { computed, onMounted, ref } from "vue";
import { onBeforeRouteLeave, useRoute } from "vue-router";
import * as API_Shop from "@/api/shops";
import * as API_Finance from "@/api/finance";
import { downloadBlob } from "@/utils/downloadBlob";
import { customRouterPush } from "@/utils/filters";

defineOptions({ name: "storeBill" });

const route = useRoute();

const searchFormRef = ref(null);

const loading = ref(true);
const searchForm = ref({
  pageNumber: 1,
  pageSize: 10,
  sort: "createTime",
  order: "desc",
  startDate: "",
  endDate: "",
});
const data = ref([]);
const total = ref(0);
const currentStatus = ref("ALL");

const billStatusTabs = computed(() => {
  return [
    { title: "全部", value: "ALL" },
    { title: "已出账", value: "OUT" },
    { title: "已对账", value: "CHECK" },
    { title: "已完成", value: "COMPLETE" },
  ];
});

function onStatusTabClick(tab) {
  billStatusClick(tab.paneName);
}
function billStatusClick(name) {
  if (name === "ALL" || name === "" || name === undefined || name === null) {
    delete searchForm.value.billStatus;
    currentStatus.value = "ALL";
  } else {
    searchForm.value.billStatus = name;
    currentStatus.value = name;
  }
  searchForm.value.pageNumber = 1;
  getDataList();
}
function init() {
  getDataList();
}
function changePage() {
  getDataList();
}
function changePageSize() {
  searchForm.value.pageNumber = 1;
  getDataList();
}
function handleSearch() {
  searchForm.value.pageNumber = 1;
  searchForm.value.pageSize = 10;
  getDataList();
}
function handleReset() {
  const { billStatus } = searchForm.value;
  searchForm.value = {
    pageNumber: 1,
    pageSize: 10,
    sort: "createTime",
    order: "desc",
    startDate: "",
    endDate: "",
  };
  if (currentStatus.value !== "ALL") {
    searchForm.value.billStatus = billStatus;
  }
  getDataList();
}
function getDataList() {
  loading.value = true;
  API_Shop.getBillPage(searchForm.value).then((res) => {
    loading.value = false;
    if (res.success) {
      data.value = res.result.records;
      total.value = res.result.total;
    }
  });
}
function detail(v) {
  customRouterPush({
    name: "bill-detail",
    query: { id: v.id },
  });
}
function handleExport() {
  const params = { ...searchForm.value };
  API_Finance.exportBillList(params).then((blob) => {
    downloadBlob(blob, "结算单列表.xlsx");
  });
}

onMounted(() => {
  const billStatus = route.query.billStatus;
  if (billStatus) {
    currentStatus.value = billStatus;
    searchForm.value.billStatus = billStatus;
  }
  init();
});

onBeforeRouteLeave((to, from) => {
  from.meta.keepAlive = false;
});
</script>

<style lang="scss" scoped>
@import "@/styles/table-common.scss";
.search > .el-card + .el-card {
  margin-top: 16px;
}
.bill-tab {
  :deep(.el-tabs__item) {
    font-size: 14px;
  }
}
.link-text {
  color: #409eff;
  cursor: pointer;
  text-decoration: none;
}
</style>
