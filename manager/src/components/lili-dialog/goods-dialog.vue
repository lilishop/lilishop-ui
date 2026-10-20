<template>
  <div class="wrapper">
    <div class="wap-content">
      <div class="query-wrapper">
        <div class="query-item">
          <div>搜索范围</div>
          <el-input
            v-model="goodsParams.goodsName"
            placeholder="商品名称"
            clearable
            style="width: 150px"
            @clear="onSearchGoods"
            @keyup.enter="onSearchGoods"
          />
        </div>
        <div class="query-item">
          <el-cascader
            v-model="category"
            :options="skuList"
            placeholder="请选择商品分类"
            popper-class="goods-dialog-cascader-popper"
            style="width: 250px"
            clearable
          />
        </div>
        <div class="query-item">
          <el-button type="primary" @click="onSearchGoods">搜索</el-button>
        </div>
      </div>
      <div>
        <el-table
          ref="tableRef"
          v-loading="loading"
          class="goods-select-table"
          :data="goodsData"
          row-key="id"
          height="340"
          empty-text="暂无商品信息"
          @selection-change="onSelectionChange"
        >
          <el-table-column
            type="selection"
            label="选择"
            width="60"
            align="center"
            reserve-selection
          />
          <el-table-column label="商品图片" width="90" align="center">
            <template #default="{ row }">
              <img class="goods-thumb" :src="row.thumbnail" alt="" />
            </template>
          </el-table-column>
          <el-table-column
            prop="goodsName"
            label="商品名称"
            min-width="200"
            show-overflow-tooltip
          />
          <el-table-column label="商品规格" min-width="140" show-overflow-tooltip>
            <template #default="{ row }">
              {{ row.simpleSpecs || "默认规格" }}
            </template>
          </el-table-column>
          <el-table-column label="价格" width="110">
            <template #default="{ row }">
              <span class="goods-price">￥{{ $filters.unitPrice(row.price) }}</span>
            </template>
          </el-table-column>
          <el-table-column label="库存" width="90">
            <template #default="{ row }">
              {{ row.quantity != null ? row.quantity : "—" }}
            </template>
          </el-table-column>
          <el-table-column label="销量" width="90">
            <template #default="{ row }">
              {{ row.buyCount != null ? row.buyCount : 0 }}
            </template>
          </el-table-column>
          <el-table-column label="商品类型" width="110">
            <template #default="{ row }">
              {{ goodsTypeLabel(row.goodsType) }}
            </template>
          </el-table-column>
        </el-table>
        <el-pagination
          v-model:current-page="goodsParams.pageNumber"
          class="pageration"
          :total="total"
          :page-size="goodsParams.pageSize"
          layout="total, prev, pager, next"
          size="small"
          @current-change="changePageSize"
        />
      </div>
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
function changePageSize(v) {
  goodsParams.pageNumber = v;
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
    const selected = selectedList.value.some((e) => e.id && e.id === item.id);
    table.toggleRowSelection(item, selected);
  });
}
function emitSelected(list) {
  selectedList.value = list;
  emit("selected", selectedList.value);
}
function onSelectionChange(rows) {
  // 选择链接时为单选：保留最后勾选的一项，多选框交互不变
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
  API_Goods.getGoodsSkuData(goodsParams).then((res) => {
    initGoods(res);
  });
  API_Goods.getCategoryTree({ deleteFlag: false }).then((res) => {
    if (res.success) {
      deepGroup(res.result);
    }
  });
}
function deepGroup(val) {
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

// 父组件 lili-dialog/index.vue 通过 $refs.goodsDialog.type = "single" 切换单选；
// expose 的 ref 外部读写等价于原 data 字段
defineExpose({ type });
</script>
<style scoped lang="scss">
@import "./style.scss";
.wap-content {
  width: 100%;
  flex: 1;
  padding: 0;
}
.goods-thumb {
  display: block;
  width: 48px;
  height: 48px;
  margin: 0 auto;
  border-radius: 4px;
  object-fit: cover;
}
.goods-price {
  color: $theme_color;
}
.pageration {
  display: flex;
  justify-content: flex-end;
  width: 100%;
  margin-top: 16px;
  padding-right: 8px;
  box-sizing: border-box;
}
</style>
