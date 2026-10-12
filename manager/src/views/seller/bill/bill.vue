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
        <el-form-item label="账单号">
          <el-input
            v-model="searchForm.sn"
            placeholder="请输入账单号"
            clearable
            style="width: 240px"
          />
        </el-form-item>
        <el-form-item label="店铺名称">
          <el-input
            v-model="searchForm.storeName"
            placeholder="请输入店铺名称"
            clearable
            style="width: 240px"
          />
        </el-form-item>
        <el-form-item label="生成时间">
          <el-date-picker
            v-model="selectDate"
            type="daterange"
            clearable
            value-format="yyyy-MM-dd HH:mm:ss"
            :default-time="defaultTime"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            style="width: 260px"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" class="search-btn" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card>
      <el-tabs v-model="activeStatus" @tab-change="handleStatusChange">
        <el-tab-pane label="全部" name="" />
        <el-tab-pane label="已出账" name="OUT" />
        <el-tab-pane label="已对账" name="CHECK" />
        <el-tab-pane label="已付款" name="COMPLETE" />
      </el-tabs>
      <div class="mb_10">
        <el-button type="primary" @click="handleExportList">导出列表</el-button>
        <el-button :disabled="selectCount === 0" @click="handleBatchDownload">批量下载</el-button>
      </div>
      <el-table
        ref="tableRef"
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
import { ref, reactive, onMounted } from "vue";
import * as API_Shop from "@/api/shops";
import * as API_Finance from "@/api/finance";
import { downloadBlob } from "@/utils/downloadBlob";
import { customRouterPush } from "@/utils/filters";
import { Message, Modal } from "@/utils/message";
import { deleteRequest } from "@/libs/axios";

defineOptions({ name: "bill" });

const loading = ref(true);
const selectDate = ref([]);
const defaultTime = ref([new Date(2000, 0, 1, 0, 0, 0), new Date(2000, 0, 1, 23, 59, 59)]);
const activeStatus = ref("");
const searchForm = reactive({
  pageNumber: 1,
  pageSize: 20,
  sort: "createTime",
  order: "desc",
  sn: "",
  storeName: "",
  billStatus: "",
  startDate: null,
  endDate: null,
});
const selectList = ref([]);
const selectCount = ref(0);
const data = ref([]);
const total = ref(0);

// 模板 ref（原 script 未使用 $refs，仅保留占位避免模板 ref 与响应式数据同名互相覆盖）
const searchFormRef = ref(null);
const tableRef = ref(null);

function billStatusText(v) {
  const map = { OUT: "已出账", CHECK: "已对账", COMPLETE: "已付款" };
  return map[v] || v;
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
}

function changePageSize(v) {
  searchForm.pageSize = v;
  getDataList();
}

function changeSelect(e) {
  selectList.value = e;
  selectCount.value = e.length;
}

function handleStatusChange(name) {
  searchForm.billStatus = name;
  searchForm.pageNumber = 1;
  getDataList();
}

function handleSearch() {
  searchForm.pageNumber = 1;
  if (selectDate.value && selectDate.value[0] && selectDate.value[1]) {
    searchForm.startDate = selectDate.value[0];
    searchForm.endDate = selectDate.value[1];
  } else {
    searchForm.startDate = null;
    searchForm.endDate = null;
  }
  getDataList();
}

function handleReset() {
  selectDate.value = [];
  searchForm.sn = "";
  searchForm.storeName = "";
  searchForm.startDate = null;
  searchForm.endDate = null;
  handleSearch();
}

function getDataList() {
  loading.value = true;
  API_Shop.getBuyBillPage(searchForm).then((res) => {
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

function handleExportList() {
  API_Finance.exportBillList({ ...searchForm }).then((blob) => {
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

function remove(v) {
  Modal.confirm({
    title: "确认删除",
    content: "您确认要删除 " + v.name + " ?",
    loading: true,
    onOk: () => {
      deleteRequest("/bill/delByIds/" + v.id).then((res) => {
        Modal.remove();
        if (res.success) {
          Message.success("操作成功");
          getDataList();
        }
      });
    },
  });
}

function delAll() {
  if (selectCount.value <= 0) {
    Message.warning("您还未选择要删除的数据");
    return;
  }
  Modal.confirm({
    title: "确认删除",
    content: "您确认要删除所选的 " + selectCount.value + " 条数据?",
    loading: true,
    onOk: () => {
      let ids = "";
      selectList.value.forEach(function (e) {
        ids += e.id + ",";
      });
      ids = ids.substring(0, ids.length - 1);
      deleteRequest("/bill/delByIds/" + ids).then((res) => {
        Modal.remove();
        if (res.success) {
          Message.success("操作成功");
          getDataList();
        }
      });
    },
  });
}

onMounted(() => {
  init();
});
</script>
