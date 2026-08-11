<template>
  <div class="wrapper">
    <div class="wap-content">
      <div class="goods-filter-panel">
      <el-form :model="filterForm" inline label-width="72px" class="goods-filter-form" @keyup.enter="onSearchGoods">
        <el-form-item label-width="0" class="filter-row-item">
          <div class="filter-row">
            <div class="filter-row-field">
              <span class="filter-row-label">商品名称</span>
              <el-input
                v-model="filterForm.goodsName"
                placeholder="请输入商品名称"
                clearable
                class="filter-control"
              />
            </div>
            <div class="filter-row-field">
              <span class="filter-row-label">商品ID</span>
              <el-input
                v-model="filterForm.goodsId"
                placeholder="请输入商品ID"
                clearable
                class="filter-control"
              />
            </div>
            <div class="filter-row-field">
              <span class="filter-row-label">商品类型</span>
              <el-select v-model="filterForm.goodsType" placeholder="请选择" clearable class="filter-control">
                <el-option label="实物商品" value="PHYSICAL_GOODS" />
                <el-option label="虚拟商品" value="VIRTUAL_GOODS" />
                <el-option label="电子卡券" value="E_COUPON" />
              </el-select>
            </div>
          </div>
        </el-form-item>
        <el-form-item label-width="0" class="filter-row-item">
          <div class="filter-row">
            <div class="filter-row-field">
              <span class="filter-row-label">品牌</span>
              <el-select
                v-model="filterForm.brandId"
                placeholder="请选择品牌"
                clearable
                filterable
                class="filter-control"
              >
                <el-option v-for="item in brandList" :key="item.id" :label="item.name" :value="item.id" />
              </el-select>
            </div>
            <div class="filter-row-field">
              <span class="filter-row-label">店铺分类</span>
              <el-cascader
                v-model="filterForm.storeCategoryPath"
                :options="shopCategoryList"
                :props="shopCategoryProps"
                placeholder="请选择店铺分类"
                clearable
                filterable
                class="filter-control"
              />
            </div>
            <div class="filter-row-field">
              <span class="filter-row-label">平台类目</span>
              <el-cascader
                v-model="filterForm.categoryPath"
                :options="platformCategoryList"
                :props="platformCategoryProps"
                placeholder="请选择平台类目"
                popper-class="goods-dialog-cascader-popper"
                clearable
                filterable
                class="filter-control"
              />
            </div>
          </div>
        </el-form-item>
        <el-form-item label-width="0" class="range-form-item range-filter-row-item">
          <div class="range-filter-row">
            <div class="range-group">
              <span class="filter-row-label">价格</span>
              <div class="range-group-inputs">
                <el-input v-model="filterForm.priceMin" placeholder="≥" clearable />
                <span class="range-sep">~</span>
                <el-input v-model="filterForm.priceMax" placeholder="≤" clearable />
              </div>
            </div>
            <div class="range-group">
              <span class="filter-row-label">销量</span>
              <div class="range-group-inputs">
                <el-input v-model="filterForm.salesMin" placeholder="≥" clearable />
                <span class="range-sep">~</span>
                <el-input v-model="filterForm.salesMax" placeholder="≤" clearable />
              </div>
            </div>
            <div class="range-group">
              <span class="filter-row-label">库存</span>
              <div class="range-group-inputs">
                <el-input v-model="filterForm.stockMin" placeholder="≥" clearable />
                <span class="range-sep">~</span>
                <el-input v-model="filterForm.stockMax" placeholder="≤" clearable />
              </div>
            </div>
          </div>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="onSearchGoods">搜索</el-button>
          <el-button @click="resetFilter">重置</el-button>
        </el-form-item>
      </el-form>
      </div>

      <div ref="tableWrap" class="goods-table-wrap">
        <el-table
          ref="goodsTable"
          v-loading="loading"
          :data="goodsData"
          border
          :height="tableHeight"
          :highlight-current-row="type !== 'multiple'"
          class="goods-sku-table"
          row-key="id"
          @row-click="handleRowClick"
          @selection-change="handleSelectionChange"
        >
        <el-table-column
          v-if="type === 'multiple'"
          type="selection"
          width="48"
          align="center"
          :reserve-selection="true"
        />
        <el-table-column prop="id" label="ID" min-width="150" show-overflow-tooltip />
        <el-table-column label="商品图片" width="90" align="center">
          <template #default="{ row }">
            <img v-if="row" :src="row.thumbnail" class="goods-thumb" alt="" />
          </template>
        </el-table-column>
        <el-table-column label="商品名称" min-width="160" class-name="goods-name-column">
          <template #default="{ row }">
            <span v-if="row" class="goods-name-text">{{ row.goodsName }}</span>
          </template>
        </el-table-column>
        <el-table-column label="规格" min-width="120" show-overflow-tooltip>
          <template #default="{ row }">
            {{ row?.simpleSpecs || "-" }}
          </template>
        </el-table-column>
        <el-table-column label="商品类型" width="100" show-overflow-tooltip>
          <template #default="{ row }">
            {{ goodsTypeText(row?.goodsType) }}
          </template>
        </el-table-column>
        <el-table-column label="店铺分类" min-width="120" show-overflow-tooltip>
          <template #default="{ row }">
            {{ storeCategoryText(row?.storeCategoryPath) }}
          </template>
        </el-table-column>
        <el-table-column label="平台类目" min-width="120" show-overflow-tooltip>
          <template #default="{ row }">
            {{ platformCategoryText(row?.categoryPath) }}
          </template>
        </el-table-column>
        <el-table-column label="品牌" min-width="100" show-overflow-tooltip>
          <template #default="{ row }">
            {{ brandText(row?.brandId) }}
          </template>
        </el-table-column>
        <el-table-column label="价格" width="100" align="right">
          <template #default="{ row }">
            <span v-if="row" class="goods-price">{{ $filters.unitPrice(row.price, "￥") }}</span>
          </template>
        </el-table-column>
        <el-table-column label="销量" width="80" align="center">
          <template #default="{ row }">
            {{ row?.buyCount ?? 0 }}
          </template>
        </el-table-column>
        <el-table-column prop="quantity" label="库存" width="80" align="center" />
        <template #empty>
          <div class="empty">{{ loading ? "" : "暂无商品信息" }}</div>
        </template>
      </el-table>
      </div>

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
</template>
<script>
import * as API_Goods from "@/api/goods";

const defaultFilterForm = () => ({
  goodsName: "",
  goodsId: "",
  storeCategoryPath: "",
  categoryPath: "",
  goodsType: "",
  brandId: "",
  priceMin: "",
  priceMax: "",
  salesMin: "",
  salesMax: "",
  stockMin: "",
  stockMax: "",
});

export default {
  props: {
    selectedWay: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      type: "multiple",
      selectedList: [],
      platformCategoryList: [],
      shopCategoryList: [],
      brandList: [],
      platformCategoryProps: {
        value: "id",
        label: "name",
        children: "children",
        checkStrictly: true,
        emitPath: false,
      },
      shopCategoryProps: {
        value: "value",
        label: "label",
        children: "children",
        checkStrictly: true,
        emitPath: false,
      },
      filterForm: defaultFilterForm(),
      total: 0,
      goodsParams: {
        pageNumber: 1,
        pageSize: 20,
        order: "desc",
        marketEnable: "UPPER",
        authFlag: "PASS",
        sort: "createTime",
      },
      goodsData: [],
      loading: false,
      tableHeight: 400,
      syncingSelection: false,
    };
  },
  watch: {
    selectedWay: {
      handler(val) {
        this.selectedList = Array.isArray(val) ? val.slice() : [];
      },
      deep: true,
      immediate: true,
    },
  },
  mounted() {
    this.init();
    this.$nextTick(this.calcTableHeight);
    window.addEventListener("resize", this.calcTableHeight);
  },
  beforeUnmount() {
    window.removeEventListener("resize", this.calcTableHeight);
  },
  methods: {
    calcTableHeight() {
      this.$nextTick(() => {
        const wrap = this.$refs.tableWrap;
        if (wrap) {
          this.tableHeight = Math.max(wrap.clientHeight, 320);
        }
      });
    },
    onSearchGoods() {
      this.goodsParams.pageNumber = 1;
      this.getQueryGoodsList();
    },
    resetFilter() {
      this.filterForm = defaultFilterForm();
      this.onSearchGoods();
    },
    changePageSize(v) {
      this.goodsParams.pageNumber = v;
      this.getQueryGoodsList();
    },
    buildQueryParams() {
      const params = {
        ...this.goodsParams,
        goodsName: this.filterForm.goodsName || undefined,
        goodsId: this.filterForm.goodsId || undefined,
        goodsType: this.filterForm.goodsType || undefined,
        brandId: this.filterForm.brandId || undefined,
        storeCategoryPath: this.filterForm.storeCategoryPath || undefined,
        categoryPath: this.filterForm.categoryPath || undefined,
        geQuantity: undefined,
        leQuantity: undefined,
        geBuyCount: undefined,
        leBuyCount: undefined,
        price: undefined,
      };

      const { priceMin, priceMax, salesMin, salesMax, stockMin, stockMax } = this.filterForm;
      if (priceMin !== "" && priceMax !== "") {
        params.price = `${priceMin}_${priceMax}`;
      } else if (priceMin !== "") {
        params.price = String(priceMin);
      } else if (priceMax !== "") {
        params.price = `0_${priceMax}`;
      }

      if (stockMin !== "" && stockMin != null) params.geQuantity = Number(stockMin);
      if (stockMax !== "" && stockMax != null) params.leQuantity = Number(stockMax);
      if (salesMin !== "" && salesMin != null) params.geBuyCount = Number(salesMin);
      if (salesMax !== "" && salesMax != null) params.leBuyCount = Number(salesMax);

      return params;
    },
    getQueryGoodsList() {
      this.loading = true;
      API_Goods.getGoodsSkuData(this.buildQueryParams())
        .then((res) => {
          this.initGoods(res);
        })
        .finally(() => {
          this.loading = false;
          this.calcTableHeight();
        });
    },
    initGoods(res) {
      const records = res?.result?.records || [];
      this.total = res?.result?.total || 0;
      const selectedIds = new Set(
        (this.selectedList || [])
          .map((e) => e.id || e.skuId)
          .filter((id) => id != null)
          .map(String)
      );
      records.forEach((item) => {
        item.___type = "goods";
        item.selected = selectedIds.has(String(item.id));
      });
      this.goodsData = records;
      this.syncTableSelection();
    },
    syncTableSelection() {
      this.$nextTick(() => {
        const table = this.$refs.goodsTable;
        if (!table) return;
        if (this.type === "multiple") {
          // clearSelection/toggleRowSelection 都会触发 selection-change，
          // 同步期间忽略，避免把已选状态清掉
          this.syncingSelection = true;
          table.clearSelection();
          this.goodsData.forEach((row) => {
            if (row.selected) {
              table.toggleRowSelection(row, true);
            }
          });
          this.$nextTick(() => {
            this.syncingSelection = false;
          });
          return;
        }
        const selected = this.goodsData.find((item) => item.selected);
        table.setCurrentRow(selected || null);
      });
    },
    emitSelected(list) {
      this.selectedList = list;
      this.$emit("selected", this.selectedList);
    },
    handleRowClick(row) {
      if (this.type === "multiple") return;
      this.goodsData.forEach((item) => {
        item.selected = false;
      });
      row.selected = true;
      this.emitSelected([row]);
      this.$refs.goodsTable?.setCurrentRow(row);
    },
    handleSelectionChange(selection) {
      if (this.type !== "multiple" || this.syncingSelection) return;
      const selectedIds = new Set(selection.map((item) => String(item.id)));
      this.goodsData.forEach((item) => {
        item.selected = selectedIds.has(String(item.id));
      });
      const currentPageIds = new Set(this.goodsData.map((item) => String(item.id)));
      const otherPages = this.selectedList.filter((item) => {
        const id = item.id || item.skuId;
        return id != null && !currentPageIds.has(String(id));
      });
      this.emitSelected([...otherPages, ...selection]);
    },
    formatShopCategory(list) {
      return (list || []).map((item) => ({
        value: item.id,
        label: item.labelName,
        children:
          item.children && item.children.length ? this.formatShopCategory(item.children) : undefined,
      }));
    },
    goodsTypeText(value) {
      if (value === "PHYSICAL_GOODS") return "实物商品";
      if (value === "VIRTUAL_GOODS") return "虚拟商品";
      if (value === "E_COUPON") return "电子卡券";
      return "-";
    },
    brandText(brandId) {
      if (!brandId) return "-";
      const brand = this.brandList.find((item) => String(item.id) === String(brandId));
      return brand?.name || "-";
    },
    findTreeNodeLabel(tree, targetId, valueKey, labelKey) {
      for (const node of tree || []) {
        if (String(node[valueKey]) === String(targetId)) {
          return node[labelKey];
        }
        const childLabel = this.findTreeNodeLabel(node.children, targetId, valueKey, labelKey);
        if (childLabel) return childLabel;
      }
      return "";
    },
    categoryPathText(path, tree, valueKey, labelKey) {
      if (!path) return "-";
      const ids = String(path).split(",").filter(Boolean);
      if (!ids.length) return "-";
      const labels = ids
        .map((id) => this.findTreeNodeLabel(tree, id, valueKey, labelKey))
        .filter(Boolean);
      return labels.length ? labels.join(" / ") : "-";
    },
    storeCategoryText(path) {
      return this.categoryPathText(path, this.shopCategoryList, "value", "label");
    },
    platformCategoryText(path) {
      if (!path) return "-";
      const ids = String(path).split(",").filter(Boolean);
      if (!ids.length) return "-";
      const targetId = ids.length >= 3 ? ids[2] : ids[ids.length - 1];
      const label = this.findTreeNodeLabel(this.platformCategoryList, targetId, "id", "name");
      return label || "-";
    },
    init() {
      this.getQueryGoodsList();
      API_Goods.getCategoryTree().then((res) => {
        if (res?.success) {
          this.platformCategoryList = res.result || [];
        }
      });
      API_Goods.getShopGoodsLabelListSeller().then((res) => {
        if (res?.success) {
          this.shopCategoryList = this.formatShopCategory(res.result || []);
        }
      });
      API_Goods.getBrandListData().then((res) => {
        this.brandList = Array.isArray(res) ? res : res?.result || [];
      });
    },
  },
};
</script>
<style scoped lang="scss">
@import "./style.scss";

.wrapper {
  height: 100%;
  flex-direction: column;
}

.wap-content {
  width: 100%;
  flex: 1;
  min-height: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.goods-table-wrap {
  flex: 1;
  min-height: 0;
}

.goods-filter-panel {
  background: #f5f7fa;
  padding: 12px 16px 4px;
  border-radius: 4px;
  margin-bottom: 12px;
}

.goods-filter-form {
  margin-bottom: 0;

  :deep(.el-form-item) {
    margin-right: 8px;
    margin-bottom: 8px;
  }
}

.range-form-item {
  :deep(.el-form-item__content) {
    margin-left: 0 !important;
  }
}

.range-filter-row-item {
  display: block;
  width: 100%;

  :deep(.el-form-item__content) {
    width: 100%;
  }
}

.filter-row-item {
  display: block;
  width: 100%;

  :deep(.el-form-item__content) {
    width: 100%;
    margin-left: 0 !important;
  }
}

.filter-row {
  display: flex;
  flex-wrap: nowrap;
  align-items: center;
  gap: 16px;
}

.filter-row-field {
  display: inline-flex;
  align-items: center;
  flex: 0 0 244px;
  min-width: 244px;
}

.filter-control {
  width: 160px;
}

.filter-row-label {
  display: inline-flex;
  align-items: center;
  justify-content: flex-end;
  flex: 0 0 72px;
  padding-right: 12px;
  color: #606266;
  font-size: 14px;
  white-space: nowrap;
  box-sizing: border-box;
}

.range-filter-row {
  display: flex;
  flex-wrap: nowrap;
  align-items: center;
  gap: 16px;
}

.range-group {
  display: inline-flex;
  align-items: center;
  flex: 0 0 244px;
  min-width: 244px;
}

.range-group-inputs {
  display: inline-flex;
  align-items: center;

  :deep(.el-input) {
    width: 72px;
  }
}

.range-sep {
  margin: 0 4px;
  color: #909399;
  user-select: none;
}

.goods-sku-table {
  width: 100%;
}

.goods-name-text {
  white-space: normal;
  word-break: break-word;
  line-height: 1.5;
}

:deep(.goods-name-column .cell) {
  white-space: normal;
  word-break: break-word;
  line-height: 1.5;
}

.goods-thumb {
  width: 48px;
  height: 48px;
  object-fit: contain;
  vertical-align: middle;
}

.goods-price {
  color: $theme_color;
}

.empty {
  text-align: center;
  padding: 24px 0;
  color: #909399;
}

.pageration {
  margin-top: 12px;
  justify-content: flex-end;
}

:deep(.el-table__body tr) {
  cursor: pointer;
}
</style>
<style lang="scss">
.goods-dialog-cascader-popper {
  z-index: 10001 !important;
}
</style>
