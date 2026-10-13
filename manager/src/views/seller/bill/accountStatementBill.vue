<template>
  <div class="search">
    <el-card>
      <el-form ref="searchFormRef" :model="searchForm" inline label-width="70px" class="search-form" @keyup.enter="handleSearch">
        <el-form-item label="账单编号" prop="sn">
          <el-input v-model="searchForm.sn" placeholder="请输入账单编号" clearable style="width: 240px" />
        </el-form-item>
        <el-form-item label="出帐时间" prop="createTime">
          <el-date-picker
            v-model="selectDate"
            type="daterange"
            value-format="YYYY-MM-DD HH:mm:ss"
            clearable
            start-placeholder="开始时间"
            end-placeholder="结束时间"
            style="width: 240px"
            @change="selectDateRange"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" class="search-btn" @click="handleSearch">搜索</el-button>
          <el-button class="search-btn" @click="handleExportList">导出列表</el-button>
          <el-button class="search-btn" :disabled="selectCount === 0" @click="handleBatchDownload">批量下载</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card>
      <el-table
        ref="table"
        v-loading="loading"
        border
        :data="data"
        class="mt_10"
        style="width: 100%"
        @selection-change="changeSelect"
      >
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column prop="sn" label="账单号" min-width="200" show-overflow-tooltip />
        <el-table-column prop="createTime" label="生成时间" width="120" />
        <el-table-column label="结算时间段" width="200">
          <template #default="{ row }">
            <span v-if="row">{{ row.startTime }}~{{ row.endTime }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="storeName" label="店铺名称" min-width="120" show-overflow-tooltip />
        <el-table-column label="结算金额" width="130">
          <template #default="{ row }">
            <priceColorScheme v-if="row" :value="row.billPrice" :color="$mainColor" />
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag v-if="row" :type="billStatusTagType(row.billStatus)">{{ billStatusText(row.billStatus) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120" align="center" fixed="right">
          <template #default="{ row }">
            <a v-if="row" class="link-text" @click="detail(row)">详细</a>
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

<script setup>
import { onMounted, reactive, ref } from "vue";
import { useRouter } from "vue-router";
import * as API_Shop from "@/api/shops";
import * as API_Finance from "@/api/finance";
import { downloadBlob } from "@/utils/downloadBlob";
import { Message } from "@/utils/message";
import { unixToDate } from "@/utils/filters";

defineOptions({ name: "bill" });

const router = useRouter();

const searchFormRef = ref(null);
const table = ref(null);

const loading = ref(true);
const searchForm = reactive({
  pageNumber: 1,
  pageSize: 20,
  sort: "createTime",
  order: "desc",
  startDate: "",
  endDate: "",
});
const selectDate = ref(null);
const selectList = ref([]);
const selectCount = ref(0);
const data = ref([]);
const total = ref(0);

function billStatusText(v) {
  const map = { OUT: "已出账", CHECK: "已对账", COMPLETE: "已付款" };
  return map[v] || "已付款";
}
function billStatusTagType(v) {
  const map = { OUT: "primary", CHECK: "warning", COMPLETE: "success" };
  return map[v] || "success";
}
function init() {
  getDataList();
}
function changePage(v) {
  searchForm.pageNumber = v;
  getDataList();
  clearSelectAll();
}
function changePageSize(v) {
  searchForm.pageNumber = 1;
  searchForm.pageSize = v;
  getDataList();
}
function handleSearch() {
  searchForm.pageNumber = 1;
  getDataList();
}
function clearSelectAll() {
  table.value?.clearSelection();
}
function changeSelect(e) {
  selectList.value = e;
  selectCount.value = e.length;
}
function selectDateRange(v) {
  if (v && v.length === 2) {
    searchForm.startDate = v[0];
    searchForm.endDate = v[1];
  } else {
    searchForm.startDate = "";
    searchForm.endDate = "";
  }
}
function getDataList() {
  loading.value = true;
  if (searchForm.startTime) {
    searchForm.startTime = unixToDate(searchForm.startTime / 1000);
  }
  if (searchForm.endTime) {
    searchForm.endTime = unixToDate(searchForm.endTime / 1000);
  }
  searchForm.billStatus = "CHECK";
  API_Shop.getBuyBillPage(searchForm).then((res) => {
    loading.value = false;
    if (res.success) {
      data.value = res.result.records;
      total.value = res.result.total;
    }
  });
}
function detail(v) {
  router.push({
    name: "bill-detail",
    query: { id: v.id },
  });
}
function handleExportList() {
  const params = { ...searchForm };
  delete params.billStatus;
  API_Finance.exportBillList(params).then((blob) => {
    downloadBlob(blob, "结算单列表.xlsx");
  });
}
function handleBatchDownload() {
  if (selectCount.value <= 0) {
    Message.warning("请先选择结算单");
    return;
  }
  const billIds = selectList.value.map((item) => item.id);
  API_Finance.batchDownloadBills(billIds).then((blob) => {
    downloadBlob(blob, "结算单批量下载.zip");
  });
}

onMounted(() => {
  init();
});
</script>
<style lang="scss" scoped>
.link-text {
  color: #2d8cf0;
  cursor: pointer;
  text-decoration: none;
}
</style>
