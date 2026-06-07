<template>
  <div class="search">
    <el-card>
      <div class="mb_10">
        <el-button type="primary" @click="handleExportList">导出列表</el-button>
        <el-button :disabled="selectCount === 0" @click="handleBatchDownload">批量下载</el-button>
      </div>
      <el-table
        ref="table"
        v-loading="loading"
        border
        :data="data"
        class="mt_10"
        style="width: 100%"
        @selection-change="changeSelect"
      >
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column prop="sn" label="账单号" min-width="200" show-overflow-tooltip />
        <el-table-column prop="createTime" label="生成时间" width="120" />
        <el-table-column label="结算时间段" width="200">
          <template #default="{ row }">
            <span v-if="row">{{ row.startTime }}~{{ row.endTime }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="storeName" label="店铺名称" min-width="120" show-overflow-tooltip />
        <el-table-column label="结算金额" width="130">
          <template #default="{ row }">
            <priceColorScheme v-if="row" :value="row.billPrice" :color="$mainColor" />
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag v-if="row" :type="billStatusTagType(row.billStatus)">{{ billStatusText(row.billStatus) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120" align="center" fixed="right">
          <template #default="{ row }">
            <a v-if="row" class="link-text" @click="detail(row)">详细</a>
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
  </div>
</template>

<script>
import * as API_Shop from "@/api/shops";
import * as API_Finance from "@/api/finance";
import { downloadBlob } from "@/utils/downloadBlob";

export default {
  name: "bill",
  data() {
    return {
      loading: true,
      searchForm: {
        pageNumber: 1,
        pageSize: 20,
        sort: "createTime",
        order: "desc",
      },
      selectList: [],
      selectCount: 0,
      data: [],
      total: 0,
    };
  },
  methods: {
    billStatusText(v) {
      const map = { OUT: "已出账", CHECK: "已对账", COMPLETE: "已付款" };
      return map[v] || v;
    },
    billStatusTagType(v) {
      const map = { OUT: "primary", CHECK: "warning", COMPLETE: "success" };
      return map[v] || "success";
    },
    init() {
      this.getDataList();
    },
    changePage(v) {
      this.searchForm.pageNumber = v;
      this.getDataList();
    },
    changePageSize(v) {
      this.searchForm.pageSize = v;
      this.getDataList();
    },
    changeSelect(e) {
      this.selectList = e;
      this.selectCount = e.length;
    },
    getDataList() {
      this.loading = true;
      if (this.searchForm.startTime) {
        this.searchForm.startTime = this.$filters.unixToDate(this.searchForm.startTime / 1000);
      }
      if (this.searchForm.endTime) {
        this.searchForm.endTime = this.$filters.unixToDate(this.searchForm.endTime / 1000);
      }
      API_Shop.getBuyBillPage(this.searchForm).then((res) => {
        this.loading = false;
        if (res.success) {
          this.data = res.result.records;
          this.total = res.result.total;
        }
      });
    },
    detail(v) {
      this.$filters.customRouterPush({
        name: "bill-detail",
        query: { id: v.id },
      });
    },
    handleExportList() {
      API_Finance.exportBillList({ ...this.searchForm }).then((blob) => {
        downloadBlob(blob, "结算单列表.xlsx");
      });
    },
    handleBatchDownload() {
      if (this.selectCount <= 0) {
        this.$Message.warning("请先选择结算单");
        return;
      }
      const billIds = this.selectList.map((item) => item.id);
      API_Finance.batchDownloadBills(billIds).then((blob) => {
        downloadBlob(blob, "结算单批量下载.zip");
      });
    },
    remove(v) {
      this.$Modal.confirm({
        title: "确认删除",
        content: "您确认要删除 " + v.name + " ?",
        loading: true,
        onOk: () => {
          this.deleteRequest("/bill/delByIds/" + v.id).then((res) => {
            this.$Modal.remove();
            if (res.success) {
              this.$Message.success("操作成功");
              this.getDataList();
            }
          });
        },
      });
    },
    delAll() {
      if (this.selectCount <= 0) {
        this.$Message.warning("您还未选择要删除的数据");
        return;
      }
      this.$Modal.confirm({
        title: "确认删除",
        content: "您确认要删除所选的 " + this.selectCount + " 条数据?",
        loading: true,
        onOk: () => {
          let ids = "";
          this.selectList.forEach(function (e) {
            ids += e.id + ",";
          });
          ids = ids.substring(0, ids.length - 1);
          this.deleteRequest("/bill/delByIds/" + ids).then((res) => {
            this.$Modal.remove();
            if (res.success) {
              this.$Message.success("操作成功");
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
