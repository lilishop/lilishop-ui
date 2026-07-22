<template>
  <div class="search">
    <el-card>
      <div @keyup.enter="handleSearch">
        <el-form ref="searchForm" :model="searchForm" inline label-width="70px" class="search-form">
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

<script>
import {
  getGoodsCategoryAll,
  getGoodsListDataByStockSeller,
  getGoodsSkuListDataSeller,
  updateGoodsAlertStocks,
  updateGoodsSkuStocks,
} from "@/api/goods";

const ROUTE_TAB_MAP = {
  alertQuantityWarn: "warnList",
  alertQuantityWarnList: "warnList",
  alertQuantityWarnSetting: "warnSetting",
};

export default {
  name: "alertQuantityWarn",
  data() {
    return {
      loading: true,
      updateStockModalVisible: false,
      activeTab: "warnList",
      searchForm: {
        pageNumber: 1,
        pageSize: 20,
        sort: "create_time",
        order: "desc",
      },
      checkFlag: false,
      stockList: [],
      warnData: [],
      skuAllData: [],
      total: 0,
      categoryList: [],
      category: [],
      selectedSku: {},
    };
  },
  watch: {
    "$route.name"(name) {
      this.applyRouteTab(name);
      this.handleReset();
    },
  },
  mounted() {
    this.applyRouteTab();
    this.init();
  },
  methods: {
    applyRouteTab(name = this.$route.name) {
      this.activeTab = ROUTE_TAB_MAP[name] || "warnList";
    },
    init() {
      this.getDataList();
      this.deepGroup();
    },
    openUpdataStockModal(row) {
      this.stockList = [];
      this.selectedSku = JSON.parse(JSON.stringify(row));
      this.stockList.push(this.selectedSku);
      this.updateStockModalVisible = true;
    },
    updateStock() {
      const updateStockList = this.stockList.map((i) => ({
        skuId: i.id,
        quantity: i.quantity,
      }));
      updateGoodsSkuStocks(updateStockList).then((res) => {
        if (res.success) {
          this.updateStockModalVisible = false;
          this.$Message.success("更新库存成功");
          this.getDataList();
        }
      });
    },
    updateWarnStock(row) {
      if (this.checkFlag) {
        updateGoodsAlertStocks({ skuId: row.id, alertQuantity: row.alertQuantity }).then((res) => {
          if (res.success) {
            this.$Message.success("更新成功");
          }
        });
      }
    },
    checkVal(row) {
      if (
        !/^[+]{0,1}(\d+)$|^[+]{0,1}(\d+\.\d+)$/.test(row.alertQuantity) ||
        parseInt(row.alertQuantity) < 0 ||
        parseInt(row.alertQuantity) > 99999999
      ) {
        this.$Message.error("请输入0~99999999之间的数字值");
        row.alertQuantity = 0;
        this.checkFlag = false;
        return;
      }
      this.checkFlag = true;
    },
    switchTabs() {
      this.handleReset();
    },
    changePageSize(v) {
      this.searchForm.pageSize = v;
      this.getDataList();
    },
    changePage(v) {
      this.searchForm.pageNumber = v;
      this.getDataList();
    },
    handleSearch() {
      this.searchForm.pageNumber = 1;
      this.searchForm.categoryPath = this.category?.length ? this.category.join(",") : null;
      this.getDataList();
    },
    handleReset() {
      this.searchForm = {
        pageNumber: 1,
        pageSize: 20,
        sort: "create_time",
        order: "desc",
      };
      this.category = [];
      this.getDataList();
    },
    getDataList() {
      this.loading = true;
      if (this.activeTab === "warnList") {
        getGoodsListDataByStockSeller(this.searchForm).then((res) => {
          if (res.success) {
            this.warnData = res.result.records;
            this.total = res.result.total;
          }
          this.loading = false;
        });
      } else {
        getGoodsSkuListDataSeller(this.searchForm).then((res) => {
          if (res.success) {
            this.skuAllData = res.result.records;
            this.total = res.result.total;
          }
          this.loading = false;
        });
      }
    },
    deepGroup() {
      getGoodsCategoryAll().then((res) => {
        if (res.success) {
          this.categoryList = res.result.map((item) => ({
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
    },
  },
};
</script>

<style lang="scss" scoped>
@import "@/styles/table-common.scss";
.link-text {
  color: #2d8cf0;
  cursor: pointer;
  text-decoration: none;
}
</style>
