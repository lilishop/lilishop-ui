<template>
  <div class="search">
    <el-card>
      <div @keyup.enter="handleSearch">
        <el-form ref="searchFormRef" :model="searchForm" inline label-width="70px" class="search-form">
          <el-form-item label="商品名称" prop="goodsName">
            <el-input v-model="searchForm.goodsName" placeholder="请输入商品名称" clearable style="width: 200px" />
          </el-form-item>
          <el-form-item label="商品编号" prop="goodsId">
            <el-input v-model="searchForm.goodsId" placeholder="请输入商品编号" clearable style="width: 200px" />
          </el-form-item>
          <el-form-item label="状态" prop="status">
            <el-select v-model="searchForm.marketEnable" placeholder="请选择" clearable style="width: 200px">
              <el-option label="下架" value="DOWN" />
              <el-option label="上架" value="UPPER" />
            </el-select>
          </el-form-item>
          <el-form-item label="商品分类" prop="category">
            <el-cascader
              v-model="category"
              :options="categoryList"
              placeholder="请选择商品分类"
              clearable
              style="width: 200px"
            />
          </el-form-item>
          <el-form-item label="货号" prop="sn">
            <el-input v-model="searchForm.sn" placeholder="请输入货号" clearable style="width: 200px" />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" class="search-btn" @click="handleSearch">搜索</el-button>
            <el-button class="search-btn" @click="handleReset">重置</el-button>
          </el-form-item>
        </el-form>
      </div>

      <el-tabs v-model="activeTab" @tab-click="switchTabs">
        <el-tab-pane label="预警商品" name="warnList">
          <el-table v-loading="loading" border :data="warnData" class="mt_10" style="width: 100%">
            <el-table-column prop="goodsName" label="商品名称" min-width="400" show-overflow-tooltip />
            <el-table-column label="库存" min-width="120">
              <template #default="{ row }">{{ row.quantity || 0 }}</template>
            </el-table-column>
            <el-table-column label="预警值" min-width="120">
              <template #default="{ row }">{{ row.alertQuantity || 0 }}</template>
            </el-table-column>
            <el-table-column label="操作" width="120" align="center" fixed="right">
              <template #default="{ row }">
                <a class="link-text" @click="openUpdataStockModal(row)">库存</a>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <el-tab-pane label="设置预警" name="warnSetting">
          <el-table v-loading="loading" border :data="skuAllData" class="mt_10" style="width: 100%">
            <el-table-column prop="goodsName" label="商品名称" />
            <el-table-column label="库存" width="200">
              <template #default="{ row }">{{ row.quantity || 0 }}</template>
            </el-table-column>
            <el-table-column label="预警值" width="200">
              <template #default="{ row }">
                <el-input
                  v-model="row.alertQuantity"
                  type="number"
                  clearable
                  placeholder="请输入预警库存"
                  @blur="updateWarnStock(row)"
                  @change="checkVal(row)"
                />
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>

      <div class="mt_10" style="display: flex; justify-content: flex-end">
        <el-pagination
          v-model:current-page="searchForm.pageNumber"
          v-model:page-size="searchForm.pageSize"
          :page-sizes="[20, 50]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          size="small"
          @current-change="changePage"
          @size-change="changePageSize"
        />
      </div>
    </el-card>

    <el-dialog v-model="updateStockModalVisible" title="更新库存" width="610px" :close-on-click-modal="false">
      <el-table :data="stockList" border class="mt_10" style="width: 100%">
        <el-table-column label="sku规格" min-width="120">
          <template #default="{ row }">{{ row.simpleSpecs }}</template>
        </el-table-column>
        <el-table-column label="审核状态" width="130">
          <template #default="{ row }">
            <el-tag
              :type="
                row.authFlag === 'PASS' ? 'success' : row.authFlag === 'TOBEAUDITED' ? 'primary' : 'danger'
              "
            >
              {{
                row.authFlag === "TOBEAUDITED" ? "待审核" : row.authFlag === "PASS" ? "通过" : "审核拒绝"
              }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" align="center">
          <template #default="{ row }">
            <el-input-number v-model="row.quantity" :min="0" />
          </template>
        </el-table-column>
      </el-table>
      <template #footer>
        <el-button @click="updateStockModalVisible = false">取消</el-button>
        <el-button type="primary" @click="updateStock">更新</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { onMounted, ref, watch } from "vue";
import { useRoute } from "vue-router";
import {
  getGoodsCategoryAll,
  getGoodsListDataByStockSeller,
  getGoodsSkuListDataSeller,
  updateGoodsAlertStocks,
  updateGoodsSkuStocks,
} from "@/api/goods";
import { Message } from "@/utils/message";

defineOptions({ name: "alertQuantityWarn" });

const ROUTE_TAB_MAP = {
  alertQuantityWarn: "warnList",
  alertQuantityWarnList: "warnList",
  alertQuantityWarnSetting: "warnSetting",
};

const route = useRoute();

const loading = ref(true);
const updateStockModalVisible = ref(false);
const activeTab = ref("warnList");
const searchForm = ref({
  pageNumber: 1,
  pageSize: 20,
  sort: "create_time",
  order: "desc",
});
const checkFlag = ref(false);
const stockList = ref([]);
const warnData = ref([]);
const skuAllData = ref([]);
const total = ref(0);
const categoryList = ref([]);
const category = ref([]);
const selectedSku = ref({});

const searchFormRef = ref(null);

watch(
  () => route.name,
  (name) => {
    applyRouteTab(name);
    handleReset();
  }
);

onMounted(() => {
  applyRouteTab();
  init();
});

function applyRouteTab(name = route.name) {
  activeTab.value = ROUTE_TAB_MAP[name] || "warnList";
}

function init() {
  getDataList();
  deepGroup();
}

function openUpdataStockModal(row) {
  stockList.value = [];
  selectedSku.value = JSON.parse(JSON.stringify(row));
  stockList.value.push(selectedSku.value);
  updateStockModalVisible.value = true;
}

function updateStock() {
  const updateStockList = stockList.value.map((i) => ({
    skuId: i.id,
    quantity: i.quantity,
  }));
  updateGoodsSkuStocks(updateStockList).then((res) => {
    if (res.success) {
      updateStockModalVisible.value = false;
      Message.success("更新库存成功");
      getDataList();
    }
  });
}

function updateWarnStock(row) {
  if (checkFlag.value) {
    updateGoodsAlertStocks({ skuId: row.id, alertQuantity: row.alertQuantity }).then((res) => {
      if (res.success) {
        Message.success("更新成功");
      }
    });
  }
}

function checkVal(row) {
  if (
    !/^[+]{0,1}(\d+)$|^[+]{0,1}(\d+\.\d+)$/.test(row.alertQuantity) ||
    parseInt(row.alertQuantity) < 0 ||
    parseInt(row.alertQuantity) > 99999999
  ) {
    Message.error("请输入0~99999999之间的数字值");
    row.alertQuantity = 0;
    checkFlag.value = false;
    return;
  }
  checkFlag.value = true;
}

function switchTabs() {
  handleReset();
}

function changePageSize(v) {
  searchForm.value.pageSize = v;
  getDataList();
}

function changePage(v) {
  searchForm.value.pageNumber = v;
  getDataList();
}

function handleSearch() {
  searchForm.value.pageNumber = 1;
  searchForm.value.categoryPath = category.value?.length ? category.value.join(",") : null;
  getDataList();
}

function handleReset() {
  searchForm.value = {
    pageNumber: 1,
    pageSize: 20,
    sort: "create_time",
    order: "desc",
  };
  category.value = [];
  getDataList();
}

function getDataList() {
  loading.value = true;
  if (activeTab.value === "warnList") {
    getGoodsListDataByStockSeller(searchForm.value).then((res) => {
      if (res.success) {
        warnData.value = res.result.records;
        total.value = res.result.total;
      }
      loading.value = false;
    });
  } else {
    getGoodsSkuListDataSeller(searchForm.value).then((res) => {
      if (res.success) {
        skuAllData.value = res.result.records;
        total.value = res.result.total;
      }
      loading.value = false;
    });
  }
}

function deepGroup() {
  getGoodsCategoryAll().then((res) => {
    if (res.success) {
      categoryList.value = res.result.map((item) => ({
        value: item.id,
        label: item.name,
        children: (item.children || []).map((child) => ({
          value: child.id,
          label: child.name,
          children: (child.children || []).map((grandson) => ({
            value: grandson.id,
            label: grandson.name,
          })),
        })),
      }));
    }
  });
}
</script>

<style lang="scss" scoped>
@import "@/styles/table-common.scss";
.link-text {
  color: #2d8cf0;
  cursor: pointer;
  text-decoration: none;
}
</style>
