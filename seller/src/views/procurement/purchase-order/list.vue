<template>
  <div class="search">
    <el-card>
      <el-form ref="searchFormRef" :model="searchForm" inline label-width="80px" class="search-form">
        <el-form-item label="单据编号">
          <el-input v-model="searchForm.orderSn" placeholder="采购单号" clearable style="width: 200px" />
        </el-form-item>
        <el-form-item label="商品名称">
          <el-input v-model="searchForm.goodsName" placeholder="商品名称" clearable style="width: 200px" />
        </el-form-item>
        <el-form-item label="创建时间">
          <el-date-picker
            v-model="createRange"
            type="datetimerange"
            value-format="YYYY-MM-DD HH:mm:ss"
            start-placeholder="开始"
            end-placeholder="结束"
            style="width: 360px"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="mt_10">
      <div class="order-tab">
        <el-tabs v-model="currentStatus" @tab-click="onStatusTabClick">
          <el-tab-pane
            v-for="item in statusTabs"
            :key="item.value"
            :label="item.title"
            :name="item.value"
          />
        </el-tabs>
      </div>
      <div class="operation padding-row">
        <el-button type="primary" @click="goCreate">新建采购单</el-button>
      </div>
      <el-table v-loading="loading" :data="data" border class="mt_10" style="width: 100%">
        <el-table-column prop="orderSn" label="采购单号" width="220" show-overflow-tooltip />
        <el-table-column prop="totalQuantity" label="采购数量" width="90" align="center" />
        <el-table-column label="采购金额" width="110" align="right">
          <template #default="{ row }">￥{{ formatMoney(row.totalAmount) }}</template>
        </el-table-column>
        <el-table-column prop="makerName" label="制单人" width="120" show-overflow-tooltip />
        <el-table-column label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="procurementStatusTag(row.status)">{{ procurementStatusText(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="170" />
        <el-table-column prop="auditTime" label="审核时间" width="170" />
        <el-table-column prop="auditorName" label="审核人" width="120" show-overflow-tooltip />
        <el-table-column label="操作" width="220" align="center" fixed="right">
          <template #default="{ row }">
            <a class="link-text" @click="goDetail(row)">查看</a>
            <template v-if="row.status === 'DRAFT'">
              <span class="op-split">|</span>
              <a class="link-text" @click="handleSubmit(row)">提交</a>
            </template>
            <template v-if="row.status === 'SUBMITTED'">
              <span class="op-split">|</span>
              <a class="link-text" @click="handleAudit(row, true)">通过</a>
              <span class="op-split">|</span>
              <a class="link-text" @click="handleAudit(row, false)">驳回</a>
            </template>
            <template v-if="['DRAFT', 'SUBMITTED', 'PENDING_INBOUND', 'PARTIAL_INBOUND', 'REJECTED'].includes(row.status)">
              <span class="op-split">|</span>
              <a class="link-text" @click="handleClose(row)">关闭</a>
            </template>
            <template v-if="['PENDING_INBOUND', 'PARTIAL_INBOUND'].includes(row.status)">
              <span class="op-split">|</span>
              <a class="link-text" @click="goInbound(row)">入库</a>
            </template>
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
          @current-change="getDataList"
          @size-change="getDataList"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";
import { useTable } from "@/utils/useTable";
import { useRoute } from "vue-router";
import {
  getProcurementOrderPage,
  getProcurementOrderStatusCount,
  submitProcurementOrder,
  auditProcurementOrder,
  closeProcurementOrder,
} from "@/api/procurement";
import {
  PROCUREMENT_STATUS,
  procurementStatusText,
  procurementStatusTag,
  formatMoney,
} from "../constants";
import { customRouterPush } from "@/utils/filters";
import { Message, Modal } from "@/utils/message";

defineOptions({ name: "procurement-purchase-order-list" });

const route = useRoute();

const createRange = ref([]);
const currentStatus = ref("ALL");
const statusCountData = ref({});
const {
  loading,
  data,
  total,
  searchForm,
  getDataList,
  handleSearch: search,
  resetSearch: reset,
} = useTable(getProcurementOrderPage, {
  form: { orderSn: "", goodsName: "", status: "" }, sort: "createTime", order: "desc",
  immediate: false,
  beforeRequest: (p) => buildSearchParams(true, p),
});

// searchFormRef：模板 ref 改名避免与顶层变量互相覆盖
const searchFormRef = ref(null);

const statusTabs = computed(() => {
  const tabs = [{ title: "全部", value: "ALL" }];
  Object.keys(PROCUREMENT_STATUS).forEach((key) => {
    const count = statusCountData.value[key];
    const label = PROCUREMENT_STATUS[key];
    tabs.push({
      title: count ? `${label}（${count}）` : label,
      value: key,
    });
  });
  return tabs;
});

onMounted(() => {
  const status = route.query.status;
  if (status) {
    currentStatus.value = status;
    searchForm.status = status;
  }
  init();
});

function init() {
  getStatusCount();
  getDataList();
}

function buildSearchParams(includeStatus = true, base = searchForm) {
  const params = { ...base };
  if (!includeStatus) {
    delete params.status;
  }
  if (createRange.value && createRange.value.length === 2) {
    params.startCreateTime = createRange.value[0];
    params.endCreateTime = createRange.value[1];
  }
  return params;
}

function handleSearch() {
  getStatusCount();
  search();
}

function resetSearch() {
  createRange.value = [];
  currentStatus.value = "ALL";
  getStatusCount();
  reset();
}

function onStatusTabClick(tab) {
  statusClick(tab.paneName);
}

function statusClick(name) {
  if (name === "ALL" || name === "" || name === undefined) {
    searchForm.status = "";
    currentStatus.value = "ALL";
  } else {
    searchForm.status = name;
    currentStatus.value = name;
  }
  searchForm.pageNumber = 1;
  getDataList();
}

function getStatusCount() {
  getProcurementOrderStatusCount(buildSearchParams(false)).then((res) => {
    if (res.success) {
      statusCountData.value = res.result || {};
    }
  });
}

function refreshList() {
  getStatusCount();
  getDataList();
}

function goCreate() {
  customRouterPush({ name: "procurement-purchase-order-operation" });
}

function goDetail(row) {
  customRouterPush({
    name: "procurement-purchase-order-operation",
    query: { id: row.id, readonly: 1 },
  });
}

function goInbound(row) {
  customRouterPush({
    name: "procurement-inbound-operation",
    query: { procurementOrderId: row.id },
  });
}

function handleSubmit(row) {
  Modal.confirm({
    title: "确认提交",
    content: "提交后采购单将进入审核流程，是否继续？",
    onOk: () => {
      submitProcurementOrder(row.id).then((res) => {
        if (res.success) {
          Message.success("提交成功");
          refreshList();
        }
      });
    },
  });
}

function handleAudit(row, pass) {
  const title = pass ? "审核通过" : "审核驳回";
  Modal.confirm({
    title,
    content: pass ? "确认通过该采购单？" : "确认驳回该采购单？",
    onOk: () => {
      auditProcurementOrder(row.id, { pass, remark: "" }).then((res) => {
        if (res.success) {
          Message.success("操作成功");
          refreshList();
        }
      });
    },
  });
}

function handleClose(row) {
  Modal.confirm({
    title: "关闭采购单",
    content: "关闭后不可继续入库，是否继续？",
    onOk: () => {
      closeProcurementOrder(row.id).then((res) => {
        if (res.success) {
          Message.success("已关闭");
          refreshList();
        }
      });
    },
  });
}
</script>

<style scoped>
.op-split {
  margin: 0 6px;
  color: #dcdfe6;
}
.order-tab :deep(.el-tabs__item) {
  font-size: 14px;
}
</style>
