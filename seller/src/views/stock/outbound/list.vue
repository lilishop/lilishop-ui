<!--
  商家端出库单列表页面
  @author Bulbasaur
  @since 2026-11-12
-->
<template>
  <div class="search">
    <el-card shadow="never">
      <el-form ref="searchFormRef" :model="searchForm" inline label-width="80px">
        <el-form-item label="出库单号">
          <el-input
            v-model="searchForm.outboundSn"
            placeholder="请输入出库单号"
            clearable
            style="width: 200px"
          />
        </el-form-item>
        <el-form-item label="创建时间">
          <el-date-picker
            v-model="dateRange"
            type="datetimerange"
            value-format="YYYY-MM-DD HH:mm:ss"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
            style="width: 360px"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="mt_10" shadow="never">
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
        <el-button type="primary" @click="goCreate">新建出库单</el-button>
      </div>

      <el-table v-loading="loading" :data="data" border class="mt_10" style="width: 100%">
        <el-table-column prop="outboundSn" label="出库单号" min-width="180" show-overflow-tooltip />
        <el-table-column prop="reasonName" label="出库原因" min-width="120" show-overflow-tooltip />
        <el-table-column prop="totalQuantity" label="出库数量" width="100" align="center" />
        <el-table-column label="单据状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="statusTagType(row.status)">{{ statusText(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="remark" label="出库备注" min-width="160" show-overflow-tooltip />
        <el-table-column prop="auditBy" label="审核人" width="110" show-overflow-tooltip />
        <el-table-column prop="auditRemark" label="审核备注" min-width="140" show-overflow-tooltip />
        <el-table-column prop="createTime" label="创建时间" width="170" />
        <el-table-column label="操作" width="220" align="right" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="goDetail(row)">查看</el-button>
            <template v-if="['DRAFT', 'REJECTED'].includes(row.status)">
              <span class="op-split">|</span>
              <el-button link type="primary" @click="goEdit(row)">编辑</el-button>
              <span class="op-split">|</span>
              <el-button link type="primary" @click="handleSubmit(row)">提交</el-button>
            </template>
            <template v-if="row.status === 'AUDITING'">
              <span class="op-split">|</span>
              <el-button link type="success" @click="openAuditDialog(row)">审核</el-button>
            </template>
            <template v-if="['DRAFT', 'AUDITING', 'REJECTED'].includes(row.status)">
              <span class="op-split">|</span>
              <el-button link type="danger" @click="handleCancel(row)">作废</el-button>
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

    <!-- 审核弹窗 -->
    <el-dialog v-model="auditDialogVisible" title="出库单审核" width="460px" destroy-on-close>
      <el-form ref="auditFormRef" :model="auditForm" :rules="auditRules" label-width="90px">
        <el-form-item label="出库单号">
          <span>{{ currentOutbound?.outboundSn }}</span>
        </el-form-item>
        <el-form-item label="出库数量">
          <span>{{ currentOutbound?.totalQuantity }}</span>
        </el-form-item>
        <el-form-item label="审核结果" prop="pass">
          <el-radio-group v-model="auditForm.pass">
            <el-radio :label="true">通过（扣减库存）</el-radio>
            <el-radio :label="false">驳回</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="审核意见" prop="auditRemark">
          <el-input
            v-model="auditForm.auditRemark"
            type="textarea"
            :rows="3"
            maxlength="200"
            show-word-limit
            placeholder="请输入审核意见或驳回原因"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="auditDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="auditLoading" @click="confirmAudit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from "vue";
import { useTable } from "@/utils/useTable";
import { Message, Modal } from "@/utils/message";
import { customRouterPush } from "@/utils/filters";
import {
  getStockOutboundPage,
  submitStockOutbound,
  auditStockOutbound,
  cancelStockOutbound,
} from "@/api/stock";

defineOptions({ name: "StockOutboundList" });

const searchFormRef = ref(null);
const dateRange = ref([]);
const currentStatus = ref("ALL");

const STATUS_MAP = {
  DRAFT: { text: "草稿", tag: "info" },
  AUDITING: { text: "待审核", tag: "warning" },
  COMPLETED: { text: "已完成", tag: "success" },
  REJECTED: { text: "已驳回", tag: "danger" },
  CANCELLED: { text: "已作废", tag: "info" },
};

const statusTabs = computed(() => [
  { title: "全部", value: "ALL" },
  { title: "草稿", value: "DRAFT" },
  { title: "待审核", value: "AUDITING" },
  { title: "已完成", value: "COMPLETED" },
  { title: "已驳回", value: "REJECTED" },
  { title: "已作废", value: "CANCELLED" },
]);

function statusText(status) {
  return STATUS_MAP[status]?.text || status || "-";
}

function statusTagType(status) {
  return STATUS_MAP[status]?.tag || "info";
}

const {
  loading,
  data,
  total,
  searchForm,
  getDataList,
  handleSearch: search,
  resetSearch: reset,
} = useTable(getStockOutboundPage, {
  form: { outboundSn: "", status: "" },
  immediate: false,
  beforeRequest: (p) => {
    const params = { ...p };
    if (params.status === "ALL") {
      delete params.status;
    }
    if (dateRange.value && dateRange.value.length === 2) {
      params.startDate = dateRange.value[0];
      params.endDate = dateRange.value[1];
    }
    return params;
  },
});

onMounted(() => {
  getDataList();
});

function handleSearch() {
  search();
}

function resetSearch() {
  dateRange.value = [];
  currentStatus.value = "ALL";
  searchForm.outboundSn = "";
  searchForm.status = "";
  reset();
}

function onStatusTabClick(tab) {
  const name = tab.paneName;
  if (name === "ALL") {
    searchForm.status = "";
  } else {
    searchForm.status = name;
  }
  searchForm.pageNumber = 1;
  getDataList();
}

function goCreate() {
  customRouterPush({ name: "stock-outbound-operation" });
}

function goEdit(row) {
  customRouterPush({
    name: "stock-outbound-operation",
    query: { id: row.id },
  });
}

function goDetail(row) {
  customRouterPush({
    name: "stock-outbound-operation",
    query: { id: row.id, readonly: 1 },
  });
}

function handleSubmit(row) {
  Modal.confirm({
    title: "提交审核",
    content: `确认提交出库单 [${row.outboundSn}] 进行审核？`,
    onOk: () => {
      submitStockOutbound(row.id).then((res) => {
        if (res.success) {
          Message.success("提交审核成功");
          getDataList();
        }
      });
    },
  });
}

function handleCancel(row) {
  Modal.confirm({
    title: "作废出库单",
    content: `确认作废出库单 [${row.outboundSn}]？作废后不可恢复。`,
    onOk: () => {
      cancelStockOutbound(row.id).then((res) => {
        if (res.success) {
          Message.success("作废成功");
          getDataList();
        }
      });
    },
  });
}

// ========== 审核弹窗相关 ==========
const auditDialogVisible = ref(false);
const auditLoading = ref(false);
const auditFormRef = ref(null);
const currentOutbound = ref(null);
const auditForm = reactive({
  pass: true,
  auditRemark: "",
});

const auditRules = {
  pass: [{ required: true, message: "请选择审核结果", trigger: "change" }],
  auditRemark: [
    {
      validator: (rule, value, callback) => {
        if (auditForm.pass === false && (!value || !value.trim())) {
          callback(new Error("驳回时必须填写审核意见"));
        } else {
          callback();
        }
      },
      trigger: "blur",
    },
  ],
};

function openAuditDialog(row) {
  currentOutbound.value = row;
  auditForm.pass = true;
  auditForm.auditRemark = "";
  auditDialogVisible.value = true;
}

function confirmAudit() {
  if (!auditFormRef.value) return;
  auditFormRef.value.validate((valid) => {
    if (!valid) return;
    auditLoading.value = true;
    auditStockOutbound(currentOutbound.value.id, {
      pass: auditForm.pass,
      auditRemark: auditForm.auditRemark,
    })
      .then((res) => {
        if (res.success) {
          Message.success(auditForm.pass ? "审核通过，库存已扣减" : "已驳回出库单");
          auditDialogVisible.value = false;
          getDataList();
        }
      })
      .finally(() => {
        auditLoading.value = false;
      });
  });
}
</script>

<style scoped>
.op-split {
  margin: 0 4px;
  color: #dcdfe6;
}
.order-tab :deep(.el-tabs__item) {
  font-size: 14px;
}
</style>
