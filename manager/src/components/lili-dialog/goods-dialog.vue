<template>
  <div class="goods-dialog-wrapper">
    <!-- 顶部搜索筛选栏 -->
    <div class="goods-query-bar">
      <div class="query-item">
        <span class="query-label">商品名称：</span>
        <el-input
          v-model="goodsParams.goodsName"
          placeholder="请输入商品名称"
          clearable
          style="width: 220px"
          @clear="onSearchGoods"
          @keyup.enter="onSearchGoods"
        />
      </div>
      <div class="query-item">
        <span class="query-label">商品编号：</span>
        <el-input
          v-model="goodsParams.sn"
          placeholder="请输入商品编号/货号"
          clearable
          style="width: 190px"
          @clear="onSearchGoods"
          @keyup.enter="onSearchGoods"
        />
      </div>
      <div class="query-item">
        <span class="query-label">商品分类：</span>
        <el-cascader
          v-model="category"
          :options="skuList"
          placeholder="请选择商品分类"
          popper-class="goods-dialog-cascader-popper"
          style="width: 240px"
          clearable
        />
      </div>
      <div class="query-item query-actions">
        <el-button type="primary" @click="onSearchGoods">搜索</el-button>
        <el-button @click="onResetGoods">重置</el-button>
      </div>
    </div>

    <!-- 表格展示区域 (自适应填充剩余高度) -->
    <div class="goods-table-wrap">
      <el-table
        ref="tableRef"
        v-loading="loading"
        class="goods-select-table"
        :data="goodsData"
        row-key="id"
        height="100%"
        stripe
        border
        empty-text="暂无匹配商品信息"
        @selection-change="onSelectionChange"
      >
        <el-table-column
          type="selection"
          width="50"
          align="center"
          reserve-selection
        />
        <el-table-column label="图片" width="76" align="center">
          <template #default="{ row }">
            <el-image
              class="goods-thumb"
              :src="row.thumbnail"
              fit="cover"
              preview-teleported
              :preview-src-list="row.thumbnail ? [row.thumbnail] : []"
            >
              <template #error>
                <div class="thumb-slot">无图</div>
              </template>
            </el-image>
          </template>
        </el-table-column>
        <el-table-column
          prop="goodsName"
          label="商品名称"
          min-width="260"
          show-overflow-tooltip
        >
          <template #default="{ row }">
            <div class="goods-title-line">{{ row.goodsName || "-" }}</div>
            <div v-if="row.sn" class="goods-sn-line font-mono">货号: {{ row.sn }}</div>
          </template>
        </el-table-column>
        <el-table-column label="商品规格" min-width="140" show-overflow-tooltip>
          <template #default="{ row }">
            <span>{{ row.simpleSpecs || "默认规格" }}</span>
          </template>
        </el-table-column>
        <el-table-column label="销售价" width="120" align="right">
          <template #default="{ row }">
            <span class="goods-price font-semibold">
              ¥ {{ Number(row.price || 0).toFixed(2) }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="可用库存" width="100" align="right">
          <template #default="{ row }">
            <span>{{ row.quantity != null ? row.quantity : "—" }}</span>
          </template>
        </el-table-column>
        <el-table-column label="累计销量" width="100" align="right">
          <template #default="{ row }">
            <span>{{ row.buyCount != null ? row.buyCount : 0 }}</span>
          </template>
        </el-table-column>
        <el-table-column label="商品类型" width="100" align="center">
          <template #default="{ row }">
            <el-tag size="small" type="info">{{ goodsTypeLabel(row.goodsType) }}</el-tag>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 底部翻页栏 -->
    <div class="goods-pagination-bar">
      <el-pagination
        v-model:current-page="goodsParams.pageNumber"
        v-model:page-size="goodsParams.pageSize"
        :total="total"
        :page-sizes="[15, 30, 50, 100]"
        popper-class="goods-dialog-pagination-popper"
        :teleported="true"
        layout="total, sizes, prev, pager, next, jumper"
        size="small"
        @current-change="changePage"
        @size-change="onPageSizeChange"
      />
    </div>
  </div>
</template>

<script setup>
import { nextTick, onMounted, reactive, ref, watch } from "vue";
import * as API_Goods from "@/api/goods";
import { goodsTypeLabel } from "@/constants/goodsType";

const props = defineProps({
  selectedWay: {
    type: Array,
    default: () => [],
  },
});
const emit = defineEmits(["selected"]);

const type = ref("multiple");
const selectedList = ref([]);
const skuList = ref([]);
const total = ref(0);
const goodsParams = reactive({
  pageNumber: 1,
  pageSize: 15,
  order: "desc",
  goodsName: "",
  sn: "",
  categoryPath: "",
  marketEnable: "UPPER",
  authFlag: "PASS",
  sort: "createTime",
});
const category = ref([]);
const goodsData = ref([]);
const loading = ref(false);
const tableRef = ref(null);

watch(category, (val) => {
  goodsParams.categoryPath = val && val.length ? val[2] : "";
});

watch(
  () => props.selectedWay,
  (val) => {
    selectedList.value = Array.isArray(val) ? val.slice() : [];
    nextTick(syncTableSelection);
  },
  { deep: true, immediate: true }
);

watch(
  () => goodsParams.categoryPath,
  () => {
    goodsData.value = [];
    goodsParams.pageNumber = 1;
    getQueryGoodsList();
  },
  { deep: true }
);

onMounted(() => {
  init();
});

function onSearchGoods() {
  goodsData.value = [];
  goodsParams.pageNumber = 1;
  getQueryGoodsList();
}

function onResetGoods() {
  goodsParams.goodsName = "";
  goodsParams.sn = "";
  category.value = [];
  goodsParams.categoryPath = "";
  goodsParams.pageNumber = 1;
  getQueryGoodsList();
}

function changePage(v) {
  goodsParams.pageNumber = v;
  getQueryGoodsList();
}

function onPageSizeChange(val) {
  goodsParams.pageSize = val;
  goodsParams.pageNumber = 1;
  getQueryGoodsList();
}

function getQueryGoodsList() {
  loading.value = true;
  API_Goods.getGoodsSkuData(goodsParams)
    .then((res) => {
      initGoods(res);
    })
    .finally(() => {
      loading.value = false;
    });
}

function initGoods(res) {
  const records = res?.result?.records || [];
  records.forEach((item) => {
    item.___type = "goods";
  });
  total.value = res?.result?.total || 0;
  goodsData.value = records;
  nextTick(syncTableSelection);
}

function syncTableSelection() {
  const table = tableRef.value;
  if (!table) return;
  if (!selectedList.value.length) {
    table.clearSelection();
    return;
  }
  goodsData.value.forEach((item) => {
    const selected = selectedList.value.some(
      (e) => (e.id || e.skuId) && String(e.id || e.skuId) === String(item.id || item.skuId)
    );
    table.toggleRowSelection(item, selected);
  });
}

function emitSelected(list) {
  selectedList.value = list;
  emit("selected", selectedList.value);
}

function onSelectionChange(rows) {
  if (type.value !== "multiple") {
    if (!rows.length) {
      emitSelected([]);
      return;
    }
    const row = rows[rows.length - 1];
    if (rows.length > 1) {
      tableRef.value?.clearSelection();
      tableRef.value?.toggleRowSelection(row, true);
    }
    emitSelected([row]);
    return;
  }
  emitSelected(rows);
}

function init() {
  getQueryGoodsList();
  API_Goods.getCategoryTree({ deleteFlag: false }).then((res) => {
    if (res.success && res.result) {
      deepGroup(res.result);
    }
  });
}

function deepGroup(val) {
  skuList.value = [];
  val.forEach((item) => {
    let childWay = [];
    if (item.children) {
      item.children.forEach((child) => {
        if (child.children) {
          child.children.forEach((grandson, index, arr) => {
            arr[index] = {
              value: grandson.id,
              label: grandson.name,
            };
          });
        }
        childWay.push({
          value: child.id,
          label: child.name,
          children: child.children,
        });
      });
    }
    skuList.value.push({
      value: item.id,
      label: item.name,
      children: childWay,
    });
  });
}

defineExpose({ type });
</script>

<style scoped lang="scss">
.goods-dialog-wrapper {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.font-mono {
  font-family: SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
}

.font-semibold {
  font-weight: 600;
}

/* 顶部搜索栏 */
.goods-query-bar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
  padding: 0 0 12px;
  flex-shrink: 0;

  .query-item {
    display: flex;
    align-items: center;

    .query-label {
      font-size: 13px;
      color: #606266;
      white-space: nowrap;
      margin-right: 4px;
    }
  }

  .query-actions {
    margin-left: auto;
    display: flex;
    gap: 8px;
  }
}

/* 表格容器 */
.goods-table-wrap {
  flex: 1;
  min-height: 0;
  width: 100%;
  overflow: hidden;
}

.goods-thumb {
  display: block;
  width: 48px;
  height: 48px;
  margin: 0 auto;
  border-radius: 4px;
  border: 1px solid #ebeef5;
}

.thumb-slot {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  font-size: 12px;
  color: #c0c4cc;
}

.goods-title-line {
  font-size: 13px;
  color: #303133;
  line-height: 1.4;
}

.goods-sn-line {
  font-size: 12px;
  color: #909399;
  margin-top: 2px;
}

.goods-price {
  color: #f56c6c;
}

/* 底部翻页栏 */
.goods-pagination-bar {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding-top: 12px;
  flex-shrink: 0;
}
</style>
