<!-- 卡密商品 · 卡池管理（原型 P-04；API-S-01~S-07）
  @author Mike
  @date 2026-07-31
-->
<template>
  <div class="search card-key-pool">
    <el-card>
      <div v-if="goodsName || skuOptions.length" class="pool-header">
        <el-button @click="goBack">返回</el-button>
        <span v-if="goodsName" class="pool-meta">
          <strong>商品：</strong>{{ goodsName }}
        </span>
        <div v-if="skuOptions.length" class="pool-sku-select">
          <span class="pool-sku-label">规格 SKU</span>
          <el-select
            v-model="skuId"
            :loading="skuLoading"
            placeholder="请选择规格"
            filterable
            style="width: 320px"
            @change="onSkuChange"
          >
            <el-option
              v-for="item in skuOptions"
              :key="item.id"
              :label="formatSkuOptionLabel(item)"
              :value="item.id"
            />
          </el-select>
        </div>
      </div>

      <el-alert
        v-if="!skuId"
        type="warning"
        show-icon
        :closable="false"
        class="mb_10"
      >
        缺少 SKU 参数，请从商品列表「卡池管理」进入。
      </el-alert>

      <el-form
        v-else
        ref="searchFormRef"
        :model="searchForm"
        inline
        label-width="70px"
        class="search-form"
        @keyup.enter="handleSearch"
      >
        <el-form-item label="卡号" prop="cardNo">
          <el-input
            v-model="searchForm.cardNo"
            placeholder="卡号模糊搜索"
            clearable
            style="width: 240px"
          />
        </el-form-item>
        <el-form-item label="导入时间" prop="importRange">
          <el-date-picker
            v-model="importRange"
            type="datetimerange"
            value-format="YYYY-MM-DD HH:mm:ss"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
            style="width: 360px"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" class="search-btn" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card v-if="skuId">
      <div class="goods-tab">
        <el-tabs v-model="statusTab" @tab-click="onStatusTabClick">
          <el-tab-pane
            v-for="tab in statusTabsWithCount"
            :key="tab.value"
            :label="tab.title"
            :name="tab.value"
          />
        </el-tabs>
      </div>

      <el-alert
        v-if="poolLocked"
        type="warning"
        show-icon
        :closable="false"
        class="mb_10"
        title="当前商品不可管理卡池（审核拒绝、商品已删除或店铺已关店）"
      />

      <div class="operation" style="margin: 10px 0">
        <el-button type="primary" :disabled="poolLocked" @click="importModal = true">
          批量导入
        </el-button>
        <el-button :disabled="poolLocked" @click="openAddDialog">单条新增</el-button>
        <el-button :loading="exportLoading" :disabled="poolLocked" @click="handleExport">
          导出
        </el-button>
      </div>

      <el-table v-loading="loading" :data="data" class="mt_10" style="width: 100%">
        <el-table-column label="序号" width="60" align="center">
          <template #default="{ $index }">
            {{ (searchForm.pageNumber - 1) * searchForm.pageSize + $index + 1 }}
          </template>
        </el-table-column>
        <el-table-column prop="cardNo" label="卡号" min-width="140" show-overflow-tooltip />
        <el-table-column prop="cardSecret" label="卡密" min-width="120" show-overflow-tooltip />
        <el-table-column label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag v-if="row" :type="statusTag(row.status)" size="small">
              {{ formatStatus(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="导入时间" width="170" />
        <el-table-column prop="allocatedTime" label="发卡时间" width="170" />
        <el-table-column prop="orderSn" label="订单号" min-width="160" show-overflow-tooltip />
        <el-table-column label="操作" width="100" align="right" fixed="right">
          <template #default="{ row }">
            <el-button
              v-if="row && row.status === 'UNUSED'"
              link
              type="danger"
              :disabled="poolLocked"
              @click="handleVoid(row)"
            >
              作废
            </el-button>
            <span v-else-if="row && row.status === 'RESERVED'" class="text-muted">预占中</span>
            <span v-else>—</span>
          </template>
        </el-table-column>
      </el-table>

      <div class="mt_10" style="display: flex; justify-content: flex-end">
        <el-pagination
          v-model:current-page="searchForm.pageNumber"
          v-model:page-size="searchForm.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          size="small"
          @current-change="getList"
          @size-change="onPageSizeChange"
        />
      </div>
    </el-card>

    <!-- 批量导入 -->
    <el-dialog v-model="importModal" title="批量导入卡密" width="520px" :close-on-click-modal="false">
      <p class="import-tip">
        Excel 模板：第 1 行表头，第 2 行起为数据；列 A 卡号、列 B 卡密；单次最多 10,000 行。
      </p>
      <el-button
        type="primary"
        link
        class="mb_10"
        :loading="templateLoading"
        @click="handleDownloadTemplate"
      >
        下载导入模板
      </el-button>
      <el-upload drag :show-file-list="false" accept=".xlsx" :before-upload="handleImportUpload">
        <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
      </el-upload>
      <template #footer>
        <el-button @click="importModal = false">关闭</el-button>
      </template>
    </el-dialog>

    <!-- 导入结果 -->
    <el-dialog v-model="importResultVisible" title="导入结果" width="560px">
      <p>成功 {{ importResult.successCount || 0 }} 条，失败 {{ importResult.failCount || 0 }} 条</p>
      <el-table
        v-if="importResult.failRows && importResult.failRows.length"
        :data="importResult.failRows"
        max-height="320"
        border
      >
        <el-table-column label="行号" width="80" align="center">
          <template #default="{ row: failItem }">
            <span v-if="failItem">{{ failItem.row }}</span>
          </template>
        </el-table-column>
        <el-table-column label="卡号" min-width="120">
          <template #default="{ row: failItem }">
            <span v-if="failItem">{{ failItem.cardNo || "—" }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="reason" label="失败原因" min-width="200" show-overflow-tooltip />
      </el-table>
      <template #footer>
        <el-button type="primary" @click="importResultVisible = false">确定</el-button>
      </template>
    </el-dialog>

    <!-- 单条新增 -->
    <el-dialog v-model="addVisible" title="单条新增卡密" width="480px" :close-on-click-modal="false">
      <el-form ref="addFormRef" :model="addForm" :rules="addRules" label-width="80px">
        <el-form-item label="卡号" prop="cardNo">
          <el-input v-model="addForm.cardNo" placeholder="请输入卡号" clearable />
        </el-form-item>
        <el-form-item label="卡密" prop="cardSecret">
          <el-input v-model="addForm.cardSecret" placeholder="请输入卡密" clearable />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="addVisible = false">取消</el-button>
        <el-button type="primary" :loading="addLoading" @click="submitAdd">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import {
  importCardKey,
  addCardKey,
  getCardKeyList,
  voidCardKey,
  getCardKeyStats,
  exportCardKey,
  downloadImportTemplate,
} from "@/api/cardKey";
import { getQueryGoodsIdGoodsList } from "@/api/goods";
import {
  formatCardKeyStatus,
  CARD_KEY_STATUS_TAG,
} from "@/constants/cardKey";
import { Message, Modal } from "@/utils/message";

/**
 * 商家卡池管理页：导入/新增/作废/导出，列表展示明文卡密（仅商家授权上下文）。
 * 入口：商品列表「卡池管理」，路由 query 须带 skuId；审核拒绝/删 SKU/关店时 poolLocked。
 *
 * @author Mike
 * @date 2026-07-31
 */
defineOptions({ name: "cardKeyPool" });

const route = useRoute();
const router = useRouter();

const skuId = ref("");
const goodsId = ref("");
const goodsName = ref("");
const skuOptions = ref([]);
const skuLoading = ref(false);
const statusTab = ref("ALL");
const stats = ref(null);
const poolLocked = ref(false);
const loading = ref(false);
const exportLoading = ref(false);
const templateLoading = ref(false);
const data = ref([]);
const total = ref(0);
const importRange = ref([]);
const searchForm = reactive({
  cardNo: "",
  pageNumber: 1,
  pageSize: 20,
});
const importModal = ref(false);
const importResultVisible = ref(false);
const importResult = ref({});
const addVisible = ref(false);
const addLoading = ref(false);
const addForm = ref({
  cardNo: "",
  cardSecret: "",
});
const addRules = {
  cardNo: [{ required: true, message: "卡号不能为空", trigger: "blur" }],
  cardSecret: [{ required: true, message: "卡密不能为空", trigger: "blur" }],
};

const searchFormRef = ref(null);
const addFormRef = ref(null);

const statusTabsWithCount = computed(() => {
  const s = stats.value || {};
  const withCount = (label, count) =>
    count != null && stats.value ? `${label}(${count})` : label;
  const totalCount =
    (s.unusedCount || 0) +
    (s.reservedCount || 0) +
    (s.allocatedCount || 0) +
    (s.voidedCount || 0);
  return [
    { title: withCount("全部", totalCount), value: "ALL" },
    { title: withCount("未使用", s.unusedCount || 0), value: "UNUSED" },
    { title: withCount("已预占", s.reservedCount || 0), value: "RESERVED" },
    { title: withCount("已分配", s.allocatedCount || 0), value: "ALLOCATED" },
    { title: withCount("已作废", s.voidedCount || 0), value: "VOIDED" },
  ];
});

watch(
  () => route.query,
  () => {
    const prevSkuId = skuId.value;
    initFromRoute();
    if (skuId.value && skuId.value !== prevSkuId) {
      resetPoolViewState();
      loadStats();
      getList();
    }
  },
  { deep: true }
);

const formatStatus = formatCardKeyStatus;

function statusTag(status) {
  return CARD_KEY_STATUS_TAG[status] || "info";
}

function goBack() {
  router.back();
}

function initFromRoute() {
  const q = route.query;
  skuId.value = q.skuId || "";
  goodsId.value = q.goodsId || "";
  goodsName.value = q.goodsName || "";
}

function formatSkuOptionLabel(sku) {
  if (!sku) return "";
  const spec = sku.simpleSpecs || sku.sn || sku.id;
  const qty =
    sku.poolStock != null && sku.poolStock !== ""
      ? sku.poolStock
      : sku.quantity != null
        ? sku.quantity
        : "—";
  return `${spec}（库存 ${qty}）`;
}

function resetPoolViewState() {
  statusTab.value = "ALL";
  searchForm.pageNumber = 1;
  searchForm.cardNo = "";
  importRange.value = [];
  poolLocked.value = false;
  stats.value = null;
  data.value = [];
  total.value = 0;
}

/** 卡池变更后刷新 SKU 选择器中的可售库存（后端 syncSkuStock → quantity） */
function refreshSkuOptionStock() {
  if (!goodsId.value) return Promise.resolve();
  return loadSkuOptions();
}

async function loadSkuOptions() {
  if (!goodsId.value) {
    skuOptions.value = [];
    return;
  }
  skuLoading.value = true;
  try {
    const res = await getQueryGoodsIdGoodsList(goodsId.value);
    if (res.success) {
      skuOptions.value = (res.result || []).filter((s) => !s.deleteFlag);
    }
  } catch {
    skuOptions.value = [];
  } finally {
    skuLoading.value = false;
  }
}

function onSkuChange(newSkuId) {
  if (!newSkuId) return;
  skuId.value = newSkuId;
  resetPoolViewState();
  router.replace({
    path: route.path,
    query: {
      ...route.query,
      skuId: newSkuId,
      goodsId: goodsId.value,
      goodsName: goodsName.value,
    },
  });
  loadStats();
  getList();
}

function onStatusTabClick(tab) {
  statusTab.value = tab.paneName;
  searchForm.pageNumber = 1;
  getList();
}

function buildListParams() {
  const params = {
    skuId: skuId.value,
    pageNumber: searchForm.pageNumber,
    pageSize: searchForm.pageSize,
  };
  if (goodsId.value) params.goodsId = goodsId.value;
  if (searchForm.cardNo) params.cardNo = searchForm.cardNo;
  if (statusTab.value && statusTab.value !== "ALL") {
    params.status = statusTab.value;
  }
  if (importRange.value && importRange.value.length === 2) {
    params.createTimeStart = importRange.value[0];
    params.createTimeEnd = importRange.value[1];
  }
  return params;
}

function loadStats() {
  if (!skuId.value) return;
  getCardKeyStats(skuId.value).then((res) => {
    if (res.success) {
      stats.value = res.result;
    }
  });
}

function getList() {
  if (!skuId.value) return;
  loading.value = true;
  getCardKeyList(buildListParams())
    .then((res) => {
      loading.value = false;
      if (res.success) {
        data.value = res.result.records || [];
        total.value = res.result.total || 0;
        poolLocked.value = false;
      } else {
        checkPoolLocked(res);
      }
    })
    .catch(() => {
      loading.value = false;
    });
}

/** 审核拒绝 / SKU 删除 / 关店时禁用卡池操作（S-06 / S-07 / EC-21~23） */
function checkPoolLocked(res) {
  const lockedCodes = [
    "CARD_KEY_GOODS_AUTH_REFUSE",
    "CARD_KEY_SKU_DELETED",
    "CARD_KEY_STORE_CLOSED",
  ];
  if (res.code && lockedCodes.includes(String(res.code))) {
    poolLocked.value = true;
  }
}

function handleSearch() {
  searchForm.pageNumber = 1;
  getList();
}

function handleReset() {
  searchForm.cardNo = "";
  importRange.value = [];
  searchForm.pageNumber = 1;
  getList();
}

function onPageSizeChange() {
  searchForm.pageNumber = 1;
  getList();
}

function handleImportUpload(file) {
  if (!/\.xlsx$/i.test(file.name)) {
    Message.error("请上传 .xlsx 文件");
    return false;
  }
  importCardKey(skuId.value, file).then((res) => {
    if (res.success) {
      importModal.value = false;
      importResult.value = res.result || {};
      importResultVisible.value = true;
      loadStats();
      getList();
      refreshSkuOptionStock();
    } else {
      checkPoolLocked(res);
    }
  });
  return false;
}

function handleDownloadTemplate() {
  templateLoading.value = true;
  downloadImportTemplate()
    .then(() => {
      Message.success("模板下载成功");
    })
    .catch(() => {})
    .finally(() => {
      templateLoading.value = false;
    });
}

function openAddDialog() {
  addForm.value = { cardNo: "", cardSecret: "" };
  addVisible.value = true;
}

function submitAdd() {
  addFormRef.value.validate((valid) => {
    if (!valid) return;
    addLoading.value = true;
    addCardKey({
      skuId: skuId.value,
      cardNo: addForm.value.cardNo.trim(),
      cardSecret: addForm.value.cardSecret.trim(),
    })
      .then((res) => {
        addLoading.value = false;
        if (res.success) {
          Message.success("新增成功");
          addVisible.value = false;
          loadStats();
          getList();
          refreshSkuOptionStock();
        } else {
          checkPoolLocked(res);
        }
      })
      .catch(() => {
        addLoading.value = false;
      });
  });
}

function handleVoid(row) {
  Modal.confirm({
    title: "确认作废",
    content: `确定作废卡号「${row.cardNo}」？作废后不可恢复。`,
    onOk: () => {
      voidCardKey(row.id).then((res) => {
        if (res.success) {
          Message.success("作废成功");
          loadStats();
          getList();
          refreshSkuOptionStock();
        }
      });
    },
  });
}

function handleExport() {
  exportLoading.value = true;
  const params = { ...buildListParams() };
  delete params.pageNumber;
  delete params.pageSize;
  exportCardKey(params, skuId.value)
    .then(() => {
      Message.success("导出成功");
    })
    .catch(() => {})
    .finally(() => {
      exportLoading.value = false;
    });
}

async function init() {
  initFromRoute();
  if (goodsId.value) {
    await loadSkuOptions();
  }
  if (!skuId.value && skuOptions.value.length) {
    onSkuChange(skuOptions.value[0].id);
    return;
  }
  if (skuId.value) {
    loadStats();
    getList();
  }
}

onMounted(() => {
  init();
});
</script>

<style lang="scss" scoped>
@import "@/styles/table-common.scss";

.pool-header {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
  margin-bottom: 10px;
}

.pool-meta {
  color: #606266;
  font-size: 14px;
}

.pool-sku-select {
  display: flex;
  align-items: center;
  gap: 8px;
}

.pool-sku-label {
  color: #606266;
  font-size: 14px;
  white-space: nowrap;
}

.goods-tab {
  :deep(.el-tabs__item) {
    font-size: 14px;
  }
}

.import-tip {
  margin: 0 0 12px;
  font-size: 13px;
  color: #909399;
  line-height: 1.5;
}

.text-muted {
  color: #909399;
  font-size: 12px;
}
</style>
