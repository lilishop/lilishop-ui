<template>
  <div class="search">
    <el-card>
      <el-form
        ref="searchForm"
        :model="searchForm"
        inline
        label-width="70px"
        class="search-form"
        @keyup.enter="handleSearch"
      >
        <div class="search-form-row">
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
          <el-form-item label="SKU货号" prop="skuSn">
            <el-input
              v-model="searchForm.skuSn"
              placeholder="请输入SKU货号"
              clearable
            />
          </el-form-item>
          <el-form-item label="商品ID" prop="id">
            <el-input
              v-model="searchForm.id"
              placeholder="请输入商品ID"
              clearable
            />
          </el-form-item>
        </div>
        <div class="search-form-row">
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
          <el-form-item label="商品品牌" prop="brandId">
            <el-select
              v-model="searchForm.brandId"
              placeholder="请选择商品品牌"
              clearable
              filterable
            >
              <el-option
                v-for="item in brandList"
                :key="item.id"
                :label="item.name"
                :value="item.id"
              />
            </el-select>
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
        </div>
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
        <el-form-item label="库存状态" prop="stockStatus">
          <el-select
            v-model="searchForm.stockStatus"
            placeholder="全部"
            clearable
            style="width: 240px"
            @change="onStockStatusChange"
          >
            <el-option label="有货" value="IN_STOCK" />
            <el-option label="无货" value="OUT_OF_STOCK" />
          </el-select>
        </el-form-item>
        <el-form-item v-if="searchForm.stockStatus === 'IN_STOCK'" label="库存区间">
          <el-input
            v-model="searchForm.stockMin"
            placeholder="≥"
            clearable
            style="width: 110px"
          />
          <span style="margin: 0 6px">~</span>
          <el-input
            v-model="searchForm.stockMax"
            placeholder="≤"
            clearable
            style="width: 110px"
          />
        </el-form-item>
        <el-form-item label="售价区间">
          <el-input
            v-model="searchForm.priceMin"
            placeholder="≥"
            clearable
            style="width: 110px"
          />
          <span style="margin: 0 6px">~</span>
          <el-input
            v-model="searchForm.priceMax"
            placeholder="≤"
            clearable
            style="width: 110px"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" class="search-btn" @click="handleSearch">搜索</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card>
      <div class="goods-tab">
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
        ref="table"
        v-loading="loading"
        :data="data"
        class="mt_10"
        row-key="id"
        @selection-change="onSelectionChange"
      >
        <el-table-column type="selection" width="100" align="center" />
        <el-table-column prop="id" label="商品ID" width="200" show-overflow-tooltip />
        <el-table-column label="商品图片" width="100" align="center">
          <template #default="{ row }">
            <img
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
        <el-table-column label="操作" width="320" align="center" fixed="right">
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
      <el-form ref="underForm" :model="underForm" label-width="100px">
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

<script>
import {
  getBrandListData,
  getCategoryTree,
  getGoodsListData,
  getGoodsNumerData,
  getQueryGoodsIdGoodsList,
  getShopGoodsLabelListSeller,
  upGoods,
  lowGoods,
} from "@/api/goods";
export default {
  name: "goods",
  data() {
    return {
      id: "", //要操作的id
      loading: true, // 表单加载状态
      modalVisible: false, // 添加或编辑显示
      createRange: [],
      searchForm: {
        // 搜索框初始化对象
        pageNumber: 1, // 当前页数
        pageSize: 20, // 页面大小
        sort: "create_time", // 默认排序字段
        order: "desc", // 默认排序方式
        storeCategoryPath: "",
        categoryPath: "",
        skuName: "",
        skuSn: "",
        brandId: "",
        stockStatus: "",
        stockMin: "",
        stockMax: "",
        priceMin: "",
        priceMax: "",
      },
      brandList: [],
      platformCategoryList: [],
      shopCategoryList: [],
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
      underForm: {
        // 下架原因
        reason: "",
      },
      submitLoading: false, // 添加或编辑提交状态
      data: [], // 表单数据
      total: 0, // 表单数据总数
      currentStatus: "ALL",
      goodsNumerData: {},
      selectedRows: [], // 选中的行数据
      selectAll: false, // 全选状态
    };
  },
  computed: {
    goodsStatusWithCount() {
      return [
        {title: '全部', value: 'ALL'},
        {title: `出售中${this.goodsNumerData.upperGoodsNum ? '(' + this.goodsNumerData.upperGoodsNum + ')' : ''}`, value: 'UPPER'},
        {title: `仓库中${this.goodsNumerData.downGoodsNum ? '(' + this.goodsNumerData.downGoodsNum + ')' : ''}`, value: 'DOWN'},
        {title: `待审核${this.goodsNumerData.auditGoodsNum ? '(' + this.goodsNumerData.auditGoodsNum + ')' : ''}`, value: 'TOBEAUDITED'},
        {title: `审核未通过${this.goodsNumerData.refuseGoodsNum ? '(' + this.goodsNumerData.refuseGoodsNum + ')' : ''}`, value: 'REFUSE'}
      ];
    }
  },
  methods: {
    clearTableSelection() {
      this.$refs.table?.clearSelection?.();
    },
    onStatusTabClick(tab) {
      this.goodsStatusClick(tab.paneName);
    },
    goodsTypeText(v) {
      if (v === "PHYSICAL_GOODS") return "实物商品";
      if (v === "VIRTUAL_GOODS") return "虚拟商品";
      if (v === "E_COUPON") return "电子卡券"; // 卡密商品
      if (v === "APPOINTMENT_GOODS") return "预约商品";
      return v || "—";
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
    platformCategoryText(path) {
      if (!path) return "—";
      const ids = String(path).split(",").filter(Boolean);
      if (!ids.length) return "—";
      const labels = ids
        .map((id) => this.findTreeNodeLabel(this.platformCategoryList, id, "id", "name"))
        .filter(Boolean);
      return labels.length ? labels.join(" / ") : "—";
    },
    /** 跳转卡池管理；单 SKU 商品默认取第一个 SKU（card-key-pool 需 skuId） */
    async goCardKeyPool(row) {
      let skuId = row.skuId;
      if (!skuId) {
        try {
          const res = await getQueryGoodsIdGoodsList(row.id);
          if (res.success && res.result?.length) {
            skuId = res.result[0].id;
          } else {
            this.$message.warning("该商品暂无 SKU，请先完善商品规格");
            return;
          }
        } catch {
          this.$message.error("获取商品规格失败");
          return;
        }
      }
      this.$router.push({
        path: "/card-key-pool",
        query: {
          skuId,
          goodsId: row.id,
          goodsName: row.goodsName,
        },
      });
    },
    marketEnableText(v) {
      if (v === "DOWN") return "下架";
      if (v === "UPPER") return "上架";
      return "";
    },
    authFlagText(v) {
      if (v === "TOBEAUDITED") return "待审核";
      if (v === "PASS") return "通过";
      if (v === "REFUSE") return "拒绝";
      return "";
    },
    // 初始化数据
    init() {
      this.loadFilterOptions();
      this.getDataList();
      this.getNumberData();
    },
    loadFilterOptions() {
      getBrandListData().then((res) => {
        this.brandList = Array.isArray(res) ? res : res?.result || [];
      });
      getShopGoodsLabelListSeller().then((res) => {
        if (res?.success) {
          this.shopCategoryList = this.formatShopCategory(res.result || []);
        }
      });
      getCategoryTree().then((res) => {
        if (res?.success) {
          this.platformCategoryList = res.result || [];
        }
      });
    },
    onStockStatusChange(value) {
      if (value !== "IN_STOCK") {
        this.searchForm.stockMin = "";
        this.searchForm.stockMax = "";
      }
    },
    buildSearchParams(includeGoodsStatus = true) {
      const { stockStatus, stockMin, stockMax, priceMin, priceMax, ...rest } = this.searchForm;
      const params = { ...rest };

      if (!includeGoodsStatus) {
        delete params.goodsStatus;
      }

      if (this.createRange && this.createRange.length === 2) {
        params.startDate = this.createRange[0];
        params.endDate = this.createRange[1];
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
    },
    formatShopCategory(list) {
      return (list || []).map((item) => ({
        value: item.id,
        label: item.labelName,
        children:
          item.children && item.children.length
            ? this.formatShopCategory(item.children)
            : undefined,
      }));
    },
    // 分页 改变页码
    changePage(v) {
      this.searchForm.pageNumber = v;
      this.getDataList();
    },
    // 分页 改变页数
    changePageSize(v) {
      this.searchForm.pageSize = v;
      this.getDataList();
    },
    // 搜索
    handleSearch() {
      this.searchForm.pageNumber = 1;
      this.searchForm.pageSize = 20;
      this.getDataList();
      this.getNumberData();
    },
    // 获取数据
    getDataList() {
      this.loading = true;
      getGoodsListData(this.buildSearchParams()).then((res) => {
        this.loading = false;
        if (res.success) {
          this.data = res.result.records;
          this.total = res.result.total;
        }
      });
    },
    getNumberData() {
      getGoodsNumerData(this.buildSearchParams(false)).then((res) => {
        if (res.success) {
          this.goodsNumerData = res.result;
        }
      })
    },
    // 编辑
    edit(v) {
      this.id = v.id;
      if (v.underMessage) {
        this.underForm.reason = v.underMessage;
      } else {
        this.underForm.reason = "";
      }
      this.modalVisible = true;
    },
    // 下架
    lower() {
      let params = {
        goodsId: this.id,
        reason:this.underForm.reason
      };
      lowGoods(params).then((res) => {
        this.$Modal.remove();
        if (res.success) {
          this.$Message.success("操作成功");
          this.modalVisible = false;
          this.getDataList();
          this.getNumberData(); // 添加这行
        }
      });
    },
    // 上架
    upper(v) {
      this.$Modal.confirm({
        title: "确认上架",
        content: "您确认要上架 " + v.goodsName + " ?",
        loading: true,
        onOk: () => {
           let params = {
            goodsId: v.id
          };
          upGoods(params).then((res) => {
            this.$Modal.remove();
            if (res.success) {
              this.$Message.success("上架成功");
              this.getDataList();
              this.getNumberData(); // 添加这行
            }
          });
        },
      });
    },

    // 编辑商品
    editGoods(v) {
      this.$filters.customRouterPush({
        name: "goods-operation-edit",
        query: { id: v.id },
      });
    },

    // 复制商品
    copyGoods(v) {
      this.$filters.customRouterPush({
        name: "goods-operation",
        query: { copyId: v.id },
      });
    },

    // 商品状态筛选
    goodsStatusClick(name) {
      if (name === "ALL" || name === "" || name === undefined || name === null) {
        delete this.searchForm.goodsStatus;
        this.currentStatus = "ALL";
      } else {
        this.searchForm.goodsStatus = name;
        this.currentStatus = name;
      }
      this.selectedRows = [];
      this.clearTableSelection();
      this.getDataList();
    },

    onSelectionChange(selection) {
      this.selectedRows = selection;
    },

    // 批量上架
    batchUpper() {
      if (this.selectedRows.length === 0) {
        this.$Message.warning('请先选择要上架的商品');
        return;
      }

      const goodsNames = this.selectedRows.map(item => item.goodsName).join('、');
      this.$Modal.confirm({
        title: '确认批量上架',
        content: `您确认要上架以下商品吗？\n${goodsNames}`,
        loading: true,
        onOk: () => {
          // 提取所有选中商品的ID
          const goodsIds = this.selectedRows.map(item => item.id);
          const params = {
            goodsId: goodsIds // 传递ID数组
          };

          upGoods(params).then((res) => {
            this.$Modal.remove();
            if (res.success) {
              this.$Message.success('批量上架成功');
              this.selectedRows = [];
              this.selectAll = false;
              this.getDataList();
              this.getNumberData();
            }
          }).catch(() => {
            this.$Modal.remove();
          });
        }
      });
    },

    // 批量下架
    batchLower() {
      if (this.selectedRows.length === 0) {
        this.$Message.warning('请先选择要下架的商品');
        return;
      }

      const goodsNames = this.selectedRows.map(item => item.goodsName).join('、');
      this.$Modal.confirm({
        title: '确认批量下架',
        content: `您确认要下架以下商品吗？\n${goodsNames}`,
        loading: true,
        onOk: () => {
          // 提取所有选中商品的ID
          const goodsIds = this.selectedRows.map(item => item.id);
          const params = {
            goodsId: goodsIds, // 传递ID数组
            reason: '批量下架操作' // 可以设置默认下架原因
          };

          lowGoods(params).then((res) => {
            this.$Modal.remove();
            if (res.success) {
              this.$Message.success('批量下架成功');
              this.selectedRows = [];
              this.selectAll = false;
              this.getDataList();
              this.getNumberData();
            }
          }).catch(() => {
            this.$Modal.remove();
          });
        }
      });
    },
  },
  mounted() {
    const goodsStatus = this.$route.query.goodsStatus;
    if (goodsStatus) {
      this.currentStatus = goodsStatus;
      this.searchForm.goodsStatus = goodsStatus;
    }
    this.init();
  },
};
</script>
<style lang="scss" scoped>
.search-form-row {
  display: flex;
  flex-wrap: nowrap;
  align-items: flex-start;
  width: 100%;
  margin-bottom: 18px;

  :deep(.el-form-item) {
    flex: 1;
    min-width: 0;
    margin-right: 12px;
    margin-bottom: 0;
  }

  :deep(.el-form-item:last-child) {
    margin-right: 0;
  }

  :deep(.el-input),
  :deep(.el-select),
  :deep(.el-cascader) {
    width: 100%;
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
