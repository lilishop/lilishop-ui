<template>
  <div class="search">
    <el-card>
      <el-form
        ref="searchFormRef"
        :model="searchForm"
        inline
        label-width="70px"
        class="search-form goods-search-form"
        @keyup.enter="handleSearch"
      >
        <el-form-item label="商品名称" prop="goodsName">
          <el-input
            v-model="searchForm.goodsName"
            placeholder="请输入商品名称"
            clearable
          />
        </el-form-item>
        <el-form-item label="SKU名称" prop="skuName">
          <el-input
            v-model="searchForm.skuName"
            placeholder="请输入SKU名称"
            clearable
          />
        </el-form-item>
        <el-form-item label="SKU编码" prop="skuSn">
          <el-input
            v-model="searchForm.skuSn"
            placeholder="请输入SKU编码"
            clearable
          />
        </el-form-item>
        <el-form-item label="SPU编码" prop="id">
          <el-input
            v-model="searchForm.id"
            placeholder="请输入SPU编码"
            clearable
          />
        </el-form-item>
        <el-form-item label="店铺分类" prop="storeCategoryPath">
          <el-cascader
            v-model="searchForm.storeCategoryPath"
            :options="shopCategoryList"
            :props="shopCategoryProps"
            clearable
            filterable
            placeholder="请选择店铺分类"
          />
        </el-form-item>
        <el-form-item label="平台分类" prop="categoryPath">
          <el-cascader
            v-model="searchForm.categoryPath"
            :options="platformCategoryList"
            :props="platformCategoryProps"
            clearable
            filterable
            placeholder="请选择平台商品分类"
          />
        </el-form-item>
        <el-form-item label="商品类型" prop="goodsType">
          <el-select
            v-model="searchForm.goodsType"
            placeholder="请选择"
            clearable
          >
            <el-option label="实物商品" value="PHYSICAL_GOODS" />
            <el-option label="虚拟商品" value="VIRTUAL_GOODS" />
            <!-- E_COUPON：卡密商品，可跳转卡池管理 -->
            <el-option label="电子卡券" value="E_COUPON" />
            <el-option label="预约商品" value="APPOINTMENT_GOODS" />
          </el-select>
        </el-form-item>
        <el-form-item label="创建时间">
          <el-date-picker
            v-model="createRange"
            type="datetimerange"
            value-format="YYYY-MM-DD HH:mm:ss"
            start-placeholder="开始"
            end-placeholder="结束"
          />
        </el-form-item>
        <el-form-item label="库存状态" prop="stockStatus">
          <el-select
            v-model="searchForm.stockStatus"
            placeholder="全部"
            clearable
            @change="onStockStatusChange"
          >
            <el-option label="有货" value="IN_STOCK" />
            <el-option label="无货" value="OUT_OF_STOCK" />
          </el-select>
        </el-form-item>
        <el-form-item v-if="searchForm.stockStatus === 'IN_STOCK'" label="库存区间">
          <div class="range-inputs">
            <el-input v-model="searchForm.stockMin" placeholder="≥" clearable />
            <span class="range-sep">~</span>
            <el-input v-model="searchForm.stockMax" placeholder="≤" clearable />
          </div>
        </el-form-item>
        <el-form-item label="售价区间">
          <div class="range-inputs">
            <el-input v-model="searchForm.priceMin" placeholder="≥" clearable />
            <span class="range-sep">~</span>
            <el-input v-model="searchForm.priceMax" placeholder="≤" clearable />
          </div>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" class="search-btn" @click="handleSearch">搜索</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card>
      <div v-if="!scheduledOnly" class="goods-tab">
        <el-tabs v-model="currentStatus" @tab-click="onStatusTabClick">
          <el-tab-pane
            v-for="(item, index) in goodsStatusWithCount"
            :key="index"
            :label="item.title"
            :name="item.value"
          />
        </el-tabs>
      </div>

      <div class="batch-operations" style="margin: 10px 0">
        <el-button
          type="success"
          :disabled="selectedRows.length === 0"
          style="margin-right: 10px"
          @click="batchUpper"
        >
          批量上架
        </el-button>
        <el-button
          type="warning"
          :disabled="selectedRows.length === 0"
          style="margin-right: 10px"
          @click="batchLower"
        >
          批量下架
        </el-button>
      </div>

      <el-table
        ref="tableRef"
        v-loading="loading"
        :data="data"
        class="mt_10"
        row-key="id"
        @selection-change="onSelectionChange"
      >
        <el-table-column type="selection" width="100" align="center" />
        <el-table-column prop="id" label="SPU编码" width="200" show-overflow-tooltip />
        <el-table-column label="商品图片" width="100" align="center">
          <template #default="{ row }">
            <img alt="商品图片"
              v-if="row && row.original"
              :src="row.original"
              style="height: 50px; width: 50px; object-fit: cover"
            />
          </template>
        </el-table-column>
        <el-table-column label="商品名称" min-width="220" class-name="goods-name-column">
          <template #default="{ row }">
            <a
              v-if="row"
              class="link-text goods-name-text"
              @click="linkTo(row.id, row.skuId)"
            >{{ row.goodsName }}</a>
          </template>
        </el-table-column>
        <el-table-column v-if="currentStatus === 'SCHEDULED_UPPER'" prop="scheduledUpperTime" label="计划上架时间" width="190" />
        <el-table-column label="价格" width="120">
          <template #default="{ row }">
            <span :style="{ color: $mainColor }">{{ $filters.unitPrice(row.price, '￥') }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="buyCount" label="销量" width="90" />
        <el-table-column prop="quantity" label="库存" width="90" />
        <el-table-column label="商品类型" width="150">
          <template #default="{ row }">
            <span v-if="row">{{ goodsTypeText(row.goodsType) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="商品分类" min-width="200" show-overflow-tooltip>
          <template #default="{ row }">
            {{ platformCategoryText(row?.categoryPath) }}
          </template>
        </el-table-column>
        <el-table-column label="状态" width="150">
          <template #default="{ row }">
            <span v-if="row">{{ marketEnableText(row.marketEnable) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="审核状态" width="150">
          <template #default="{ row }">
            <span v-if="row">{{ authFlagText(row.authFlag) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="170" show-overflow-tooltip />
        <el-table-column label="操作" width="320" align="right" fixed="right">
          <template #default="{ row }">
            <template v-if="row.marketEnable === 'DOWN'">
              <a class="link-text" @click="upper(row)">上架</a>
              <span class="op-split">|</span>
              <a class="link-text" @click="editGoods(row)">编辑</a>
            </template>
            <template v-else>
              <a class="link-text" @click="edit(row)">下架</a>
              <span class="op-split">|</span>
              <a class="link-text" @click="editGoods(row)">编辑</a>
            </template>
            <span class="op-split">|</span>
            <a class="link-text" @click="copyGoods(row)">复制商品</a>
            <!-- E_COUPON 专属：卡池管理入口（原型 P-03） -->
            <template v-if="row.goodsType === 'E_COUPON'">
              <span class="op-split">|</span>
              <a class="link-text" @click="goCardKeyPool(row)">卡池管理</a>
            </template>
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

    <el-dialog v-model="modalVisible" title="下架操作" width="500px" :close-on-click-modal="false">
      <el-form ref="underFormRef" :model="underForm" label-width="100px">
        <el-form-item label="下架原因" prop="reason">
          <el-input v-model="underForm.reason" clearable />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="modalVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="lower">提交</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import {
  getCategoryTree,
  getGoodsListData,
  getGoodsNumerData,
  getQueryGoodsIdGoodsList,
  getShopGoodsLabelListSeller,
  upGoods,
  lowGoods,
} from "@/api/goods";
import { Message, Modal } from "@/utils/message";
import { customRouterPush } from "@/utils/filters";

defineOptions({ name: "goods" });

const props = defineProps({ scheduledOnly: { type: Boolean, default: false } });

const route = useRoute();
const router = useRouter();

const searchFormRef = ref(null);
const tableRef = ref(null);
const underFormRef = ref(null);

const id = ref(""); //要操作的id
const loading = ref(true); // 表单加载状态
const modalVisible = ref(false); // 添加或编辑显示
const createRange = ref([]);
const searchForm = ref({
  // 搜索框初始化对象
  pageNumber: 1, // 当前页数
  pageSize: 20, // 页面大小
  sort: "create_time", // 默认排序字段
  order: "desc", // 默认排序方式
  storeCategoryPath: "",
  categoryPath: "",
  skuName: "",
  skuSn: "",
  stockStatus: "",
  stockMin: "",
  stockMax: "",
  priceMin: "",
  priceMax: "",
});
const platformCategoryList = ref([]);
const shopCategoryList = ref([]);
const platformCategoryProps = {
  value: "id",
  label: "name",
  children: "children",
  checkStrictly: true,
  emitPath: false,
};
const shopCategoryProps = {
  value: "value",
  label: "label",
  children: "children",
  checkStrictly: true,
  emitPath: false,
};
const underForm = ref({
  // 下架原因
  reason: "",
});
const submitLoading = ref(false); // 添加或编辑提交状态
const data = ref([]); // 表单数据
const total = ref(0); // 表单数据总数
const currentStatus = ref(props.scheduledOnly ? "SCHEDULED_UPPER" : "ALL");
const goodsNumerData = ref({});
const selectedRows = ref([]); // 选中的行数据
const selectAll = ref(false); // 全选状态

const goodsStatusWithCount = computed(() => {
  return [
    {title: '全部', value: 'ALL'},
    {title: `出售中${goodsNumerData.value.upperGoodsNum ? '(' + goodsNumerData.value.upperGoodsNum + ')' : ''}`, value: 'UPPER'},
    {title: `仓库中${goodsNumerData.value.downGoodsNum ? '(' + goodsNumerData.value.downGoodsNum + ')' : ''}`, value: 'DOWN'},
    {title: `待审核${goodsNumerData.value.auditGoodsNum ? '(' + goodsNumerData.value.auditGoodsNum + ')' : ''}`, value: 'TOBEAUDITED'},
    {title: `审核未通过${goodsNumerData.value.refuseGoodsNum ? '(' + goodsNumerData.value.refuseGoodsNum + ')' : ''}`, value: 'REFUSE'}
  ];
});

function clearTableSelection() {
  tableRef.value?.clearSelection?.();
}
function onStatusTabClick(tab) {
  goodsStatusClick(tab.paneName);
}
function goodsTypeText(v) {
  if (v === "PHYSICAL_GOODS") return "实物商品";
  if (v === "VIRTUAL_GOODS") return "虚拟商品";
  if (v === "E_COUPON") return "电子卡券"; // 卡密商品
  if (v === "APPOINTMENT_GOODS") return "预约商品";
  return v || "—";
}
function findTreeNodeLabel(tree, targetId, valueKey, labelKey) {
  for (const node of tree || []) {
    if (String(node[valueKey]) === String(targetId)) {
      return node[labelKey];
    }
    const childLabel = findTreeNodeLabel(node.children, targetId, valueKey, labelKey);
    if (childLabel) return childLabel;
  }
  return "";
}
function platformCategoryText(path) {
  if (!path) return "—";
  const ids = String(path).split(",").filter(Boolean);
  if (!ids.length) return "—";
  const labels = ids
    .map((id) => findTreeNodeLabel(platformCategoryList.value, id, "id", "name"))
    .filter(Boolean);
  return labels.length ? labels.join(" / ") : "—";
}
/** 跳转卡池管理；单 SKU 商品默认取第一个 SKU（card-key-pool 需 skuId） */
async function goCardKeyPool(row) {
  let skuId = row.skuId;
  if (!skuId) {
    try {
      const res = await getQueryGoodsIdGoodsList(row.id);
      if (res.success && res.result?.length) {
        skuId = res.result[0].id;
      } else {
        Message.warning("该商品暂无 SKU，请先完善商品规格");
        return;
      }
    } catch {
      Message.error("获取商品规格失败");
      return;
    }
  }
  router.push({
    path: "/card-key-pool",
    query: {
      skuId,
      goodsId: row.id,
      goodsName: row.goodsName,
    },
  });
}
function marketEnableText(v) {
  if (v === "DOWN") return "下架";
  if (v === "UPPER") return "上架";
  return "";
}
function authFlagText(v) {
  if (v === "TOBEAUDITED") return "待审核";
  if (v === "PASS") return "通过";
  if (v === "REFUSE") return "拒绝";
  return "";
}
// 初始化数据
function init() {
  loadFilterOptions();
  getDataList();
  getNumberData();
}
function loadFilterOptions() {
  getShopGoodsLabelListSeller()
    .then((res) => {
      if (res?.success) {
        shopCategoryList.value = formatShopCategory(res.result || []);
      }
    })
    .catch(() => {});
  getCategoryTree()
    .then((res) => {
      if (res?.success) {
        platformCategoryList.value = res.result || [];
      }
    })
    .catch(() => {});
}
function onStockStatusChange(value) {
  if (value !== "IN_STOCK") {
    searchForm.value.stockMin = "";
    searchForm.value.stockMax = "";
  }
}
function buildSearchParams(includeGoodsStatus = true) {
  const { stockStatus, stockMin, stockMax, priceMin, priceMax, ...rest } = searchForm.value;
  const params = { ...rest };

  if (!includeGoodsStatus) {
    delete params.goodsStatus;
  } else if (props.scheduledOnly) {
    params.goodsStatus = "SCHEDULED_UPPER";
  }
  if (includeGoodsStatus && currentStatus.value === "SCHEDULED_UPPER") {
    params.sort = "scheduled_upper_time";
    params.order = "asc";
  }

  if (createRange.value && createRange.value.length === 2) {
    params.startDate = createRange.value[0];
    params.endDate = createRange.value[1];
  }

  if (stockStatus === "IN_STOCK") {
    params.geQuantity = stockMin !== "" && stockMin != null ? Number(stockMin) : 1;
    if (stockMax !== "" && stockMax != null) {
      params.leQuantity = Number(stockMax);
    }
  } else if (stockStatus === "OUT_OF_STOCK") {
    params.geQuantity = 0;
    params.leQuantity = 0;
  } else {
    if (stockMin !== "" && stockMin != null) params.geQuantity = Number(stockMin);
    if (stockMax !== "" && stockMax != null) params.leQuantity = Number(stockMax);
  }

  if (priceMin !== "" && priceMax !== "") {
    params.price = `${priceMin}_${priceMax}`;
  } else if (priceMin !== "") {
    params.price = String(priceMin);
  } else if (priceMax !== "") {
    params.price = `0_${priceMax}`;
  }

  return params;
}
function formatShopCategory(list) {
  return (list || []).map((item) => ({
    value: item.id,
    label: item.labelName,
    children:
      item.children && item.children.length
        ? formatShopCategory(item.children)
        : undefined,
  }));
}
// 分页 改变页码
function changePage(v) {
  searchForm.value.pageNumber = v;
  getDataList();
}
// 分页 改变页数
function changePageSize(v) {
  searchForm.value.pageSize = v;
  getDataList();
}
// 搜索
function handleSearch() {
  searchForm.value.pageNumber = 1;
  searchForm.value.pageSize = 20;
  getDataList();
  getNumberData();
}
// 获取数据
function getDataList() {
  loading.value = true;
  getGoodsListData(buildSearchParams()).then((res) => {
    loading.value = false;
    if (res.success) {
      data.value = res.result.records;
      total.value = res.result.total;
    }
  });
}
function getNumberData() {
  if (props.scheduledOnly) return;
  getGoodsNumerData(buildSearchParams(false)).then((res) => {
    if (res.success) {
      goodsNumerData.value = res.result;
    }
  })
}
// 编辑
function edit(v) {
  id.value = v.id;
  if (v.underMessage) {
    underForm.value.reason = v.underMessage;
  } else {
    underForm.value.reason = "";
  }
  modalVisible.value = true;
}
// 下架
function lower() {
  let params = {
    goodsId: id.value,
    reason: underForm.value.reason
  };
  lowGoods(params).then((res) => {
    Modal.remove();
    if (res.success) {
      Message.success("操作成功");
      modalVisible.value = false;
      getDataList();
      getNumberData(); // 添加这行
    }
  });
}
// 上架
function upper(v) {
  Modal.confirm({
    title: "确认上架",
    content: "您确认要上架 " + v.goodsName + " ?",
    loading: true,
    onOk: () => {
       let params = {
        goodsId: v.id
      };
      upGoods(params).then((res) => {
        Modal.remove();
        if (res.success) {
          Message.success("上架成功");
          getDataList();
          getNumberData(); // 添加这行
        }
      });
    },
  });
}

// 编辑商品
function editGoods(v) {
  customRouterPush({
    name: "goods-operation-edit",
    query: { id: v.id },
  });
}

// 复制商品
function copyGoods(v) {
  customRouterPush({
    name: "goods-operation",
    query: { copyId: v.id },
  });
}

// 商品状态筛选
function goodsStatusClick(name) {
  if (name === "ALL" || name === "" || name === undefined || name === null) {
    delete searchForm.value.goodsStatus;
    currentStatus.value = "ALL";
  } else {
    searchForm.value.goodsStatus = name;
    currentStatus.value = name;
  }
  selectedRows.value = [];
  clearTableSelection();
  searchForm.value.pageNumber = 1;
  getDataList();
}

function onSelectionChange(selection) {
  selectedRows.value = selection;
}

// 批量上架
function batchUpper() {
  if (selectedRows.value.length === 0) {
    Message.warning('请先选择要上架的商品');
    return;
  }

  const goodsNames = selectedRows.value.map(item => item.goodsName).join('、');
  Modal.confirm({
    title: '确认批量上架',
    content: `您确认要上架以下商品吗？\n${goodsNames}`,
    loading: true,
    onOk: () => {
      // 提取所有选中商品的ID
      const goodsIds = selectedRows.value.map(item => item.id);
      const params = {
        goodsId: goodsIds // 传递ID数组
      };

      upGoods(params).then((res) => {
        Modal.remove();
        if (res.success) {
          Message.success('批量上架成功');
          selectedRows.value = [];
          selectAll.value = false;
          getDataList();
          getNumberData();
        }
      }).catch(() => {
        Modal.remove();
      });
    }
  });
}

// 批量下架
function batchLower() {
  if (selectedRows.value.length === 0) {
    Message.warning('请先选择要下架的商品');
    return;
  }

  const goodsNames = selectedRows.value.map(item => item.goodsName).join('、');
  Modal.confirm({
    title: '确认批量下架',
    content: `您确认要下架以下商品吗？\n${goodsNames}`,
    loading: true,
    onOk: () => {
      // 提取所有选中商品的ID
      const goodsIds = selectedRows.value.map(item => item.id);
      const params = {
        goodsId: goodsIds, // 传递ID数组
        reason: '批量下架操作' // 可以设置默认下架原因
      };

      lowGoods(params).then((res) => {
        Modal.remove();
        if (res.success) {
          Message.success('批量下架成功');
          selectedRows.value = [];
          selectAll.value = false;
          getDataList();
          getNumberData();
        }
      }).catch(() => {
        Modal.remove();
      });
    }
  });
}

onMounted(() => {
  const goodsStatus = route.query.goodsStatus;
  if (goodsStatus && !props.scheduledOnly && goodsStatus !== "SCHEDULED_UPPER") {
    currentStatus.value = goodsStatus;
    searchForm.value.goodsStatus = goodsStatus;
  }
  init();
});
</script>
<style lang="scss" scoped>
.goods-search-form {
  display: grid !important;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  column-gap: 16px;
  align-items: start;

  > :deep(.el-form-item) {
    display: flex;
    width: auto;
    min-width: 0;
    margin: 8px 0 !important;
  }

  :deep(.el-form-item__content) {
    flex: 1;
    min-width: 0;
  }

  :deep(.el-input),
  :deep(.el-select),
  :deep(.el-cascader),
  :deep(.el-date-editor) {
    width: 100% !important;
    max-width: 100%;
    min-width: 0;
    box-sizing: border-box;
  }

  .range-inputs {
    display: flex;
    align-items: center;
    width: 100%;

    :deep(.el-input) {
      flex: 1;
      min-width: 0;
    }

    .range-sep {
      margin: 0 6px;
      flex-shrink: 0;
    }
  }
}

// Tab组件样式
.goods-tab {
  :deep(.el-tabs__item) {
    font-size: 14px;
  }
}
.goods-name-text {
  white-space: normal;
  word-break: break-word;
  line-height: 1.5;
  display: inline-block;
}
:deep(.goods-name-column .cell) {
  white-space: normal;
  line-height: 1.5;
}
.link-text {
  color: #409eff;
  cursor: pointer;
  text-decoration: none;
}
</style>
