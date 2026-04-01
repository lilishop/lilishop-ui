<template>
  <div class="search">
    <Card>
      <Form
        ref="searchForm"
        :model="searchForm"
        inline
        :label-width="70"
        class="search-form"
        @keydown.enter.native="handleSearch"
      >
        <Form-item label="商品名称" prop="goodsName">
          <Input
            v-model="searchForm.goodsName"
            placeholder="请输入商品名称"
            clearable
            style="width: 240px"
          />
        </Form-item>
        <Form-item label="商品ID" prop="goodsId">
          <Input
            v-model="searchForm.goodsId"
            placeholder="请输入商品ID"
            clearable
            style="width: 240px"
          />
        </Form-item>
        <Form-item label="SKU货号" prop="sn">
          <Input
            v-model="searchForm.sn"
            placeholder="请输入SKU货号"
            clearable
            style="width: 240px"
          />
        </Form-item>
        <Form-item label="店铺名称" prop="storeName">
          <Input
            v-model="searchForm.storeName"
            placeholder="请输入店铺名称"
            clearable
            style="width: 240px"
          />
        </Form-item>
        <Button
          @click="handleSearch"
          class="search-btn"
          type="primary"
          icon="ios-search"
        >
          搜索
        </Button>
        <Button @click="handleReset" style="margin-left: 8px">重置</Button>
      </Form>
    </Card>

    <Card class="mt_10">
      <Alert show-icon>
        支持按规格逐条设置虚拟销量，列表总销量 = 真实销量 + 虚拟销量。
      </Alert>

      <div class="batch-operations">
        <Button
          type="primary"
          :disabled="selectedRows.length === 0"
          @click="openBatchVirtualSalesModal"
        >
          批量设置虚拟销量
        </Button>
      </div>

      <Table
        :loading="loading"
        :columns="columns"
        :data="data"
        ref="table"
        class="mt_10"
        sortable="custom"
        @on-sort-change="changeSort"
        @on-selection-change="handleSelectionChange"
      >
        <template slot="goodsSlot" slot-scope="{ row }">
          <div class="goods-info">
            <img
              :src="row.thumbnail"
              class="goods-thumbnail"
            />
            <div class="goods-text">
              <div class="div-zoom">{{ row.goodsName }}</div>
              <div class="sub-title" v-if="row.simpleSpecs">
                规格：{{ row.simpleSpecs.trim() || "-" }}
              </div>
            </div>
          </div>
        </template>
      </Table>

      <Row type="flex" justify="end" class="mt_10">
        <Page
          :current="searchForm.pageNumber"
          :total="total"
          :page-size="searchForm.pageSize"
          :page-size-opts="[20, 50, 100]"
          size="small"
          show-total
          show-elevator
          show-sizer
          @on-change="changePage"
          @on-page-size-change="changePageSize"
        ></Page>
      </Row>
    </Card>

    <Modal
      v-model="editModalVisible"
      :title="modalMode === 'batch' ? '批量设置虚拟销量' : '设置虚拟销量'"
      :mask-closable="false"
      :closable="!modalSubmitting"
    >
      <div v-if="modalMode === 'single' && currentSku" class="virtual-sales-modal">
        <div class="sku-info-item">
          <span class="sku-info-label">商品名称：</span>
          <span>{{ currentSku.goodsName || "-" }}</span>
        </div>
        <div class="sku-info-item">
          <span class="sku-info-label">规格信息：</span>
          <span>{{ currentSku.simpleSpecs || "-" }}</span>
        </div>
        <div class="sku-info-item">
          <span class="sku-info-label">SKU ID：</span>
          <span>{{ currentSku.id || "-" }}</span>
        </div>

        <Form :label-width="90" class="mt_10">
          <Form-item label="虚拟销量">
            <InputNumber
              v-model="editForm.virtualSales"
              :min="0"
              :max="99999999"
              :precision="0"
              style="width: 200px"
            />
          </Form-item>
        </Form>
      </div>
      <div v-else-if="modalMode === 'batch'" class="virtual-sales-modal">
        <div class="sku-info-item">
          <span class="sku-info-label">已选规格：</span>
          <span>{{ selectedRows.length }} 个</span>
        </div>

        <Form :label-width="90" class="mt_10">
          <Form-item label="虚拟销量">
            <InputNumber
              v-model="editForm.virtualSales"
              :min="0"
              :max="99999999"
              :precision="0"
              style="width: 200px"
            />
          </Form-item>
        </Form>
      </div>
      <div slot="footer">
        <Button @click="handleCancelVirtualSales" :disabled="modalSubmitting">
          取消
        </Button>
        <Button
          type="primary"
          :loading="modalSubmitting"
          @click="handleSubmitVirtualSales"
        >
          提交
        </Button>
      </div>
    </Modal>
  </div>
</template>

<script>
import {
  batchUpdateGoodsSkuVirtualSales,
  getGoodsSkuData,
  updateGoodsSkuVirtualSales,
} from "@/api/goods";

const VIRTUAL_SALES_FIELDS = [
  "virtualSales",
  "fictitiousSales",
  "fakeBuyCount",
  "fictitiousBuyCount",
  "mockBuyCount",
  "salesVolume",
];

export default {
  name: "goodsVirtualSales",
  data() {
    return {
      loading: true,
      editModalVisible: false,
      modalSubmitting: false,
      modalMode: "single",
      currentSku: null,
      currentIndex: -1,
      selectedRows: [],
      editForm: {
        virtualSales: 0,
      },
      searchForm: {
        pageNumber: 1,
        pageSize: 20,
        sort: "create_time",
        order: "desc",
        goodsName: "",
        goodsId: "",
        sn: "",
        storeName: "",
      },
      columns: [
        {
          type: "selection",
          width: 60,
          align: "center",
        },
        {
          title: "SKU ID",
          key: "id",
          width: 180,
          tooltip: true,
        },
        {
          title: "商品ID",
          key: "goodsId",
          width: 180,
          tooltip: true,
        },
        {
          title: "商品信息",
          key: "goodsName",
          minWidth: 360,
          slot: "goodsSlot",
        },
        {
          title: "真实销量",
          key: "buyCount",
          width: 110,
          render: (h, params) => h("span", params.row.buyCount || 0),
        },
        {
          title: "虚拟销量",
          key: "virtualSalesInput",
          width: 110,
          render: (h, params) => h("span", params.row.virtualSalesInput || 0),
        },
        {
          title: "总销量",
          key: "totalSalesDisplay",
          width: 110,
          render: (h, params) => h("span", this.getTotalSales(params.row)),
        },
        {
          title: "状态",
          key: "marketEnable",
          width: 100,
          render: (h, params) => {
            const isUpper = params.row.marketEnable === "UPPER";
            return h(
              "Tag",
              { props: { color: isUpper ? "green" : "volcano" } },
              isUpper ? "上架" : "下架"
            );
          },
        },
        {
          title: "操作",
          key: "action",
          width: 100,
          align: "center",
          render: (h, params) => {
            return h(
              "Button",
              {
                props: {
                  type: "primary",
                  size: "small",
                  loading: !!params.row.saving,
                },
                on: {
                  click: () => this.openVirtualSalesModal(params.row, params.index),
                },
              },
              "设置"
            );
          },
        },
      ],
      data: [],
      total: 0,
    };
  },
  methods: {
    init() {
      this.getDataList();
    },
    changePage(v) {
      this.searchForm.pageNumber = v;
      this.getDataList();
    },
    changePageSize(v) {
      this.searchForm.pageNumber = 1;
      this.searchForm.pageSize = v;
      this.getDataList();
    },
    handleSearch() {
      this.searchForm.pageNumber = 1;
      this.getDataList();
    },
    handleReset() {
      this.searchForm = {
        pageNumber: 1,
        pageSize: 20,
        sort: "create_time",
        order: "desc",
        goodsName: "",
        goodsId: "",
        sn: "",
        storeName: "",
      };
      this.getDataList();
    },
    changeSort(e) {
      this.searchForm.sort = e.key;
      this.searchForm.order = e.order;
      if (e.order === "normal") {
        this.searchForm.sort = "create_time";
        this.searchForm.order = "desc";
      }
      this.getDataList();
    },
    handleSelectionChange(selection) {
      this.selectedRows = selection;
    },
    getDataList() {
      this.loading = true;
      getGoodsSkuData(this.searchForm)
        .then((res) => {
          if (res && res.success && res.result) {
            this.data = (res.result.records || []).map((item) => ({
              ...item,
              virtualSalesInput: this.getVirtualSalesValue(item),
              saving: false,
            }));
            this.total = res.result.total || 0;
            this.selectedRows = [];
          } else {
            this.data = [];
            this.total = 0;
            this.selectedRows = [];
            this.$Message.error((res && res.message) || "加载规格列表失败");
          }
        })
        .catch(() => {
          this.data = [];
          this.total = 0;
          this.selectedRows = [];
          this.$Message.error("加载规格列表失败");
        })
        .finally(() => {
          this.loading = false;
        });
    },
    getVirtualSalesValue(row) {
      const field = VIRTUAL_SALES_FIELDS.find(
        (item) => row[item] !== undefined && row[item] !== null && row[item] !== ""
      );
      return field ? Number(row[field]) || 0 : 0;
    },
    openVirtualSalesModal(row, index) {
      this.modalMode = "single";
      this.currentSku = { ...row };
      this.currentIndex = index;
      this.editForm.virtualSales = this.getVirtualSalesValue(row);
      this.editModalVisible = true;
    },
    openBatchVirtualSalesModal() {
      if (!this.selectedRows.length) {
        this.$Message.warning("请先选择要设置的商品规格");
        return;
      }
      this.modalMode = "batch";
      this.currentSku = null;
      this.currentIndex = -1;
      this.editForm.virtualSales = 0;
      this.editModalVisible = true;
    },
    handleCancelVirtualSales() {
      if (this.modalSubmitting) {
        return;
      }
      this.resetVirtualSalesModal();
    },
    resetVirtualSalesModal() {
      this.editModalVisible = false;
      this.modalMode = "single";
      this.currentSku = null;
      this.currentIndex = -1;
      this.editForm.virtualSales = 0;
    },
    handleSubmitVirtualSales() {
      const virtualSales = Number(this.editForm.virtualSales);
      if (!Number.isInteger(virtualSales) || virtualSales < 0) {
        this.$Message.warning("请输入大于等于 0 的整数虚拟销量");
        return;
      }
      if (this.modalMode === "batch") {
        this.handleBatchSubmitVirtualSales(virtualSales);
        return;
      }
      if (!this.currentSku || this.currentIndex < 0) {
        return;
      }
      const currentIndex = this.currentIndex;
      const currentSkuId = this.currentSku.id;
      this.modalSubmitting = true;
      this.$set(this.data[currentIndex], "saving", true);
      updateGoodsSkuVirtualSales(currentSkuId, { virtualSales })
        .then((res) => {
          if (res && res.success) {
            this.$set(this.data[currentIndex], "virtualSales", virtualSales);
            this.$set(this.data[currentIndex], "virtualSalesInput", virtualSales);
            this.$Message.success("虚拟销量设置成功");
            this.resetVirtualSalesModal();
          } else {
            this.$Message.error((res && res.message) || "规格虚拟销量设置失败");
          }
        })
        .catch(() => {
          this.$Message.error("规格虚拟销量设置失败");
        })
        .finally(() => {
          if (this.data[currentIndex]) {
            this.$set(this.data[currentIndex], "saving", false);
          }
          this.modalSubmitting = false;
        });
    },
    handleBatchSubmitVirtualSales(virtualSales) {
      const skuIds = this.selectedRows.map((item) => item.id).filter(Boolean);
      if (!skuIds.length) {
        this.$Message.warning("请先选择要设置的商品规格");
        return;
      }
      this.modalSubmitting = true;
      batchUpdateGoodsSkuVirtualSales({ skuIds, virtualSales })
        .then((res) => {
          if (res && res.success) {
            this.data = this.data.map((item) => {
              if (!skuIds.includes(item.id)) {
                return item;
              }
              return {
                ...item,
                virtualSales,
                virtualSalesInput: virtualSales,
              };
            });
            this.selectedRows = [];
            if (this.$refs.table) {
              this.$refs.table.selectAll(false);
            }
            this.$Message.success("虚拟销量设置成功");
            this.resetVirtualSalesModal();
          } else {
            this.$Message.error((res && res.message) || "虚拟销量设置失败");
          }
        })
        .catch(() => {
          this.$Message.error("虚拟销量设置失败");
        })
        .finally(() => {
          this.modalSubmitting = false;
        });
    },
    getTotalSales(row) {
      return (Number(row.buyCount) || 0) + (Number(row.virtualSalesInput) || 0);
    },
  },
  mounted() {
    this.init();
  },
};
</script>

<style lang="scss" scoped>
.sub-title {
  margin-top: 6px;
  color: #808695;
  font-size: 12px;
}

.goods-info {
  display: flex;
  align-items: center;
  margin: 5px 0;
  padding: 10px 0;
}

.goods-thumbnail {
  width: 50px;
  height: 50px;
  margin-right: 12px;
  object-fit: cover;
  flex-shrink: 0;
}

.goods-text {
  min-width: 0;
}

.batch-operations {
  margin-top: 10px;
}

.virtual-sales-modal {
  padding-top: 8px;
}

.sku-info-item {
  display: flex;
  line-height: 24px;
  margin-bottom: 8px;
  word-break: break-all;
}

.sku-info-label {
  width: 90px;
  color: #808695;
  flex-shrink: 0;
}
</style>
