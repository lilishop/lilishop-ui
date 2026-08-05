<template>
  <div>
    <el-card>
      <el-form
        ref="searchForm"
        :model="searchForm"
        inline
        label-width="70px"
        class="search-form"
        @keyup.enter.prevent="handleSearch"
      >
        <el-form-item label="商品名称" prop="goodsName">
          <el-input
            v-model="searchForm.goodsName"
            placeholder="请输入商品名称"
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
        <el-form-item label="平台类目" prop="categoryId">
          <el-cascader
            v-model="searchForm.categoryId"
            :options="categoryList"
            :props="categoryProps"
            clearable
            filterable
            placeholder="请选择平台类目"
            style="width: 240px"
          />
        </el-form-item>
        <el-form-item label="商品品牌" prop="brandId">
          <el-select
            v-model="searchForm.brandId"
            clearable
            filterable
            placeholder="请选择商品品牌"
            style="width: 240px"
          >
            <el-option
              v-for="item in brandList"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" class="search-btn" @click="handleSearch">搜索</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="list-card">
      <el-tabs v-model="currentAuthStatus" class="auth-tabs" @tab-change="onAuthStatusChange">
        <el-tab-pane label="全部" name="ALL" />
        <el-tab-pane label="待审核" name="TOBEAUDITED" />
        <el-tab-pane label="已审核" name="PASS" />
        <el-tab-pane label="审核未通过" name="REFUSE" />
      </el-tabs>

      <div class="operation" style="margin: 10px 0">
        <el-button type="primary" @click="openBatchAudit" :disabled="!hasPendingAuditSelection">批量审核</el-button>
        <el-button type="primary" style="margin-left: 10px" @click="delAll">批量下架</el-button>
      </div>

      <el-table
        ref="table"
        v-loading="loading"
        border
        :data="data"
        class="mt_10 distribution-goods-table"
        style="width: 100%"
        @selection-change="changeSelect"
      >
        <el-table-column type="selection" width="55" align="center" fixed="left" />
        <el-table-column label="商品图片" width="80" align="center" fixed="left">
          <template #default="{ row }">
            <img
              v-if="row?.thumbnail"
              :src="row.thumbnail"
              alt="商品图"
              class="goods-thumbnail"
            />
            <span v-else class="goods-thumbnail-empty">无图</span>
          </template>
        </el-table-column>
        <el-table-column label="商品名称" min-width="200" show-overflow-tooltip fixed="left">
          <template #default="{ row }">
            <span v-if="row">{{ row.goodsName }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="goodsId" label="商品编号" min-width="200" show-overflow-tooltip />
        <el-table-column label="商品类型" min-width="110">
          <template #default="{ row }">
            <span v-if="row">{{ goodsTypeText(row.goodsType) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="平台类目" min-width="120" show-overflow-tooltip>
          <template #default="{ row }">
            <span v-if="row">{{ row.platformCategoryName || "-" }}</span>
          </template>
        </el-table-column>
        <el-table-column label="品牌" min-width="120" show-overflow-tooltip>
          <template #default="{ row }">
            <span v-if="row">{{ row.brandName || "-" }}</span>
          </template>
        </el-table-column>
        <el-table-column label="商品价格" min-width="110">
          <template #default="{ row }">
            <span v-if="row" :style="{ color: $mainColor }">{{ $filters.unitPrice(row.price, "￥") }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="storeName" label="店铺名称" min-width="120" show-overflow-tooltip />
        <el-table-column label="佣金金额" min-width="110">
          <template #default="{ row }">
            <span v-if="row" :style="{ color: $mainColor }">{{ $filters.unitPrice(row.commission, "￥") }}</span>
          </template>
        </el-table-column>
        <el-table-column label="审核状态" min-width="110" align="center">
          <template #default="{ row }">
            <el-tag v-if="row" :type="authStatusTagType(row.authStatus)" size="small">
              {{ authStatusText(row.authStatus) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" min-width="120" align="center" fixed="right">
          <template #default="{ row }">
            <template v-if="row">
              <a v-if="row.authStatus === 'TOBEAUDITED'" class="link-text" @click.prevent="openAudit(row)">审核</a>
              <span v-if="row.authStatus === 'TOBEAUDITED'" class="op-split">|</span>
              <a class="link-text" @click.prevent="remove(row)">下架</a>
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

    <el-dialog
      v-model="auditModalVisible"
      :title="auditTargetIds.length > 1 ? '批量审核分销商品' : '审核分销商品'"
      width="500px"
      :close-on-click-modal="false"
      destroy-on-close
    >
      <el-form :model="auditForm" label-width="90px">
        <el-form-item label="审核结果">
          <el-radio-group v-model="auditForm.authStatus">
            <el-radio value="PASS">通过</el-radio>
            <el-radio value="REFUSE">驳回</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item v-if="auditForm.authStatus === 'REFUSE'" label="审核备注">
          <el-input
            v-model="auditForm.authRemark"
            type="textarea"
            :rows="3"
            maxlength="255"
            show-word-limit
            placeholder="请输入驳回原因"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="auditModalVisible = false">取消</el-button>
        <el-button type="primary" :loading="auditLoading" @click="submitAudit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { auditDistributionGoods, delDistributionGoods, getDistributionGoods } from "@/api/distribution";
import { getBrandListData, getCategoryTree } from "@/api/goods";

export default {
  name: "distributionGoods",
  data() {
    return {
      loading: true,
      currentAuthStatus: "ALL",
      auditModalVisible: false,
      auditLoading: false,
      auditTargetIds: [],
      auditForm: {
        authStatus: "PASS",
        authRemark: "",
      },
      searchForm: {
        pageNumber: 1,
        pageSize: 20,
        sort: "createTime",
        order: "desc",
        goodsName: "",
        storeName: "",
        categoryId: "",
        brandId: "",
        authStatus: "",
      },
      categoryList: [],
      categoryProps: {
        value: "id",
        label: "name",
        children: "children",
        checkStrictly: true,
        emitPath: false,
      },
      brandList: [],
      selectList: [],
      selectCount: 0,
      data: [],
      total: 0,
    };
  },
  computed: {
    hasPendingAuditSelection() {
      return this.selectList.some((item) => item.authStatus === "TOBEAUDITED");
    },
  },
  methods: {
    authStatusText(value) {
      if (value === "TOBEAUDITED") return "待审核";
      if (value === "REFUSE") return "审核未通过";
      return "已审核";
    },
    authStatusTagType(value) {
      if (value === "TOBEAUDITED") return "warning";
      if (value === "REFUSE") return "danger";
      return "success";
    },
    onAuthStatusChange(name) {
      this.searchForm.authStatus = name === "ALL" ? "" : name;
      this.searchForm.pageNumber = 1;
      this.getDataList();
      this.clearSelectAll();
    },
    openAudit(row) {
      this.auditTargetIds = [row.id];
      this.auditForm = { authStatus: "PASS", authRemark: "" };
      this.auditModalVisible = true;
    },
    openBatchAudit() {
      const pendingRows = this.selectList.filter((item) => item.authStatus === "TOBEAUDITED");
      if (!pendingRows.length) {
        this.$Message.warning("请选择待审核的分销商品");
        return;
      }
      this.auditTargetIds = pendingRows.map((item) => item.id);
      this.auditForm = { authStatus: "PASS", authRemark: "" };
      this.auditModalVisible = true;
    },
    submitAudit() {
      if (this.auditForm.authStatus === "REFUSE" && !this.auditForm.authRemark.trim()) {
        this.$Message.warning("请填写驳回原因");
        return;
      }
      this.auditLoading = true;
      auditDistributionGoods({
        ids: this.auditTargetIds,
        authStatus: this.auditForm.authStatus,
        authRemark: this.auditForm.authRemark.trim(),
      })
        .then((res) => {
          if (res.success) {
            this.$Message.success("审核成功");
            this.auditModalVisible = false;
            this.clearSelectAll();
            this.getDataList();
          }
        })
        .finally(() => {
          this.auditLoading = false;
        });
    },
    goodsTypeText(value) {
      if (value === "PHYSICAL_GOODS") return "实物商品";
      if (value === "VIRTUAL_GOODS") return "虚拟商品";
      if (value === "E_COUPON") return "电子卡券";
      return "-";
    },
    init() {
      this.loadFilterOptions();
      this.getDataList();
    },
    loadFilterOptions() {
      getCategoryTree().then((res) => {
        if (res.success) {
          this.categoryList = res.result || [];
        }
      });
      getBrandListData().then((res) => {
        this.brandList = Array.isArray(res) ? res : res.result || [];
      });
    },
    changePage(v) {
      this.searchForm.pageNumber = v;
      this.getDataList();
      this.clearSelectAll();
    },
    changePageSize(v) {
      this.searchForm.pageSize = v;
      this.getDataList();
    },
    handleSearch() {
      this.searchForm.pageNumber = 1;
      this.searchForm.pageSize = 20;
      this.getDataList();
    },
    clearSelectAll() {
      this.$refs.table?.clearSelection();
    },
    changeSelect(e) {
      this.selectList = e;
      this.selectCount = e.length;
    },
    getDataList() {
      this.loading = true;
      getDistributionGoods(this.searchForm)
        .then((res) => {
          if (res.success) {
            this.data = res.result.records;
            this.total = res.result.total;
          }
        })
        .finally(() => {
          this.loading = false;
        });
    },
    remove(v) {
      this.$Modal.confirm({
        title: "确认下架",
        content: "您确认要下架么?",
        loading: true,
        onOk: () => {
          delDistributionGoods(v.id).then((res) => {
            this.$Modal.remove();
            if (res.success) {
              this.$Message.success("下架成功");
              this.getDataList();
            }
          });
        },
      });
    },
    delAll() {
      if (this.selectCount <= 0) {
        this.$Message.warning("您还未选择要下架的数据");
        return;
      }
      this.$Modal.confirm({
        title: "确认下架",
        content: "您确认要下架所选的 " + this.selectCount + " 条数据?",
        loading: true,
        onOk: () => {
          const ids = this.selectList.map((item) => item.id);
          delDistributionGoods(ids.toString()).then((res) => {
            this.$Modal.remove();
            if (res.success) {
              this.$Message.success("下架成功");
              this.clearSelectAll();
              this.getDataList();
            }
          });
        },
      });
    },
  },
  mounted() {
    this.init();
  },
};
</script>

<style lang="scss" scoped>
.link-text {
  color: #409eff;
  cursor: pointer;
  text-decoration: none;
}

.goods-thumbnail {
  width: 50px;
  height: 50px;
  object-fit: cover;
  vertical-align: middle;
}

.goods-thumbnail-empty {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 50px;
  height: 50px;
  background: #f5f7fa;
  color: #909399;
  font-size: 12px;
}

.mt_10 {
  margin-top: 10px;
}

.auth-tabs {
  margin-bottom: 4px;
}

.list-card {
  margin-top: 16px;
}

.op-split {
  margin: 0 6px;
  color: #dcdfe6;
}
</style>
