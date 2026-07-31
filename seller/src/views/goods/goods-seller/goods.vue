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
        <el-form-item label="商品名称" prop="goodsName">
          <el-input
            v-model="searchForm.goodsName"
            placeholder="请输入商品名称"
            clearable
            style="width: 240px"
          />
        </el-form-item>
        <el-form-item label="商品编号" prop="id">
          <el-input
            v-model="searchForm.id"
            placeholder="请输入商品编号"
            clearable
            style="width: 240px"
          />
        </el-form-item>
        <el-form-item label="店铺名称" prop="storeName">
          <el-input
            v-model="searchForm.storeName"
            placeholder="请输入店铺名称"
            clearable
            style="width: 240px"
          />
        </el-form-item>
        <el-form-item label="销售模式" prop="salesModel">
          <el-select
            v-model="searchForm.salesModel"
            placeholder="请选择"
            clearable
            style="width: 240px"
          >
            <el-option label="零售" value="RETAIL" />
            <el-option label="批发" value="WHOLESALE" />
          </el-select>
        </el-form-item>
        <el-form-item label="商品类型" prop="goodsType">
          <el-select
            v-model="searchForm.goodsType"
            placeholder="请选择"
            clearable
            style="width: 240px"
          >
            <el-option label="实物商品" value="PHYSICAL_GOODS" />
            <el-option label="虚拟商品" value="VIRTUAL_GOODS" />
            <!-- E_COUPON：卡密商品，可跳转卡池管理 -->
            <el-option label="电子卡券" value="E_COUPON" />
          </el-select>
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
        <el-table-column label="商品名称" min-width="200" show-overflow-tooltip>
          <template #default="{ row }">
            <a class="link-text" @click="linkTo(row.id, row.skuId)">{{ row.goodsName }}</a>
          </template>
        </el-table-column>
        <el-table-column label="价格" width="200">
          <template #default="{ row }">
            <span :style="{ color: $mainColor }">{{ $filters.unitPrice(row.price, '￥') }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="buyCount" label="销量" width="150" />
        <el-table-column prop="quantity" label="库存" width="150" />
        <el-table-column label="销售模式" width="150">
          <template #default="{ row }">
            <span v-if="row">{{ salesModelText(row.salesModel) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="商品类型" width="150">
          <template #default="{ row }">
            <span v-if="row">{{ goodsTypeText(row.goodsType) }}</span>
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
        <el-table-column prop="storeName" label="店铺名称" width="200" show-overflow-tooltip />
        <el-table-column label="操作" width="260" align="center" fixed="right">
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
  getGoodsListData,
  getGoodsNumerData,
  getQueryGoodsIdGoodsList,
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
      searchForm: {
        // 搜索框初始化对象
        pageNumber: 1, // 当前页数
        pageSize: 20, // 页面大小
        sort: "create_time", // 默认排序字段
        order: "desc", // 默认排序方式
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
    salesModelText(v) {
      if (v === "RETAIL") return "零售";
      if (v === "WHOLESALE") return "批发";
      return "其他类型";
    },
    goodsTypeText(v) {
      if (v === "PHYSICAL_GOODS") return "实物商品";
      if (v === "VIRTUAL_GOODS") return "虚拟商品";
      if (v === "E_COUPON") return "电子卡券"; // 卡密商品
      return v || "—";
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
      this.getDataList();
      this.getNumberData();
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
      getGoodsListData(this.searchForm).then((res) => {
        this.loading = false;
        if (res.success) {
          this.data = res.result.records;
          this.total = res.result.total;
        }
      });
    },
    getNumberData() {
      // 创建一个不包含goodsStatus字段的搜索参数
      const { goodsStatus, ...searchParams } = this.searchForm;
      getGoodsNumerData(searchParams).then((res) => {
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
// Tab组件样式
.goods-tab {
  :deep(.el-tabs__item) {
    font-size: 14px;
  }
}
</style>
