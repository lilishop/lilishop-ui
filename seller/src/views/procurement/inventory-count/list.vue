<template>
  <div class="search">
    <el-card>
      <div class="operation padding-row">
        <el-button type="primary" :loading="creating" @click="handleCreate">生成盘点单</el-button>
        <span class="tip">将快照当前店铺全部 SKU 库存，不调整实际库存</span>
      </div>
      <el-table v-loading="loading" :data="data" border class="mt_10" style="width: 100%">
        <el-table-column prop="sn" label="盘点单号" width="220" show-overflow-tooltip />
        <el-table-column prop="itemTotal" label="商品数" width="90" align="center" />
        <el-table-column prop="makerName" label="制单人" width="120" show-overflow-tooltip />
        <el-table-column prop="countTime" label="盘点时间" width="170" />
        <el-table-column prop="createTime" label="创建时间" width="170" />
        <el-table-column label="操作" width="100" align="center" fixed="right">
          <template #default="{ row }">
            <a class="link-text" @click="goDetail(row)">查看明细</a>
          </template>
        </el-table-column>
      </el-table>
      <div class="mt_10" style="display: flex; justify-content: flex-end">
        <el-pagination
          v-model:current-page="searchForm.pageNumber"
          v-model:page-size="searchForm.pageSize"
          :page-sizes="[10, 20, 50]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          size="small"
          @current-change="getDataList"
          @size-change="getDataList"
        />
      </div>
    </el-card>
  </div>
</template>

<script>
import { createInventoryCount, getInventoryCountPage } from "@/api/procurement";

export default {
  name: "procurement-inventory-count-list",
  data() {
    return {
      loading: false,
      creating: false,
      data: [],
      total: 0,
      searchForm: {
        pageNumber: 1,
        pageSize: 10,
      },
    };
  },
  mounted() {
    this.getDataList();
  },
  methods: {
    getDataList() {
      this.loading = true;
      getInventoryCountPage(this.searchForm)
        .then((res) => {
          if (res.success) {
            this.data = res.result.records || [];
            this.total = res.result.total || 0;
          }
        })
        .finally(() => {
          this.loading = false;
        });
    },
    handleCreate() {
      this.$Modal.confirm({
        title: "生成盘点单",
        content: "将快照当前店铺全部 SKU 库存，是否继续？",
        onOk: () => {
          this.creating = true;
          createInventoryCount()
            .then((res) => {
              if (res.success) {
                this.$Message.success("盘点单已生成");
                this.getDataList();
              }
            })
            .finally(() => {
              this.creating = false;
            });
        },
      });
    },
    goDetail(row) {
      this.$filters.customRouterPush({
        name: "procurement-inventory-count-detail",
        query: { id: row.id, sn: row.sn },
      });
    },
  },
};
</script>

<style scoped>
.tip {
  margin-left: 12px;
  color: #909399;
  font-size: 13px;
}
</style>
