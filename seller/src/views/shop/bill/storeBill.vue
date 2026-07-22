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
        <el-form-item label="开始时间" prop="startDate">
          <el-date-picker
            v-model="searchForm.startDate"
            type="date"
            value-format="YYYY-MM-DD HH:mm:ss"
            placeholder="请选择"
            clearable
            style="width: 240px"
          />
        </el-form-item>
        <el-form-item label="结束时间" prop="endDate">
          <el-date-picker
            v-model="searchForm.endDate"
            type="date"
            value-format="YYYY-MM-DD HH:mm:ss"
            placeholder="请选择"
            clearable
            style="width: 240px"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" class="search-btn" @click="handleSearch">搜索</el-button>
          <el-button class="search-btn" @click="handleReset">重置</el-button>
          <el-button class="search-btn" @click="handleExport">导出列表</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card>
      <div class="bill-tab">
        <el-tabs v-model="currentStatus" @tab-click="onStatusTabClick">
          <el-tab-pane
            v-for="(item, index) in billStatusTabs"
            :key="index"
            :label="item.title"
            :name="item.value"
          />
        </el-tabs>
      </div>

      <el-table v-loading="loading" border :data="data" ref="table" class="mt_10" style="width: 100%">
        <el-table-column prop="sn" label="账单号" min-width="250" show-overflow-tooltip />
        <el-table-column prop="createTime" label="生成时间" min-width="120" />
        <el-table-column label="结算时间段" width="200" show-overflow-tooltip>
          <template #default="{ row }">{{ row.startTime }}~{{ row.endTime }}</template>
        </el-table-column>
        <el-table-column label="结算金额" min-width="100">
          <template #default="{ row }">
            <priceColorScheme :value="row.billPrice" :color="$mainColor" />
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag v-if="row.billStatus === 'OUT'" type="primary">已出账</el-tag>
            <el-tag v-else-if="row.billStatus === 'CHECK'" type="info">已对账</el-tag>
            <el-tag v-else type="success">已付款</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" fixed="right" width="100">
          <template #default="{ row }">
            <a class="link-text" @click="detail(row)">查看</a>
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
  name: "storeBill",
  data() {
    return {
      loading: true,
      searchForm: {
        pageNumber: 1,
        pageSize: 10,
        sort: "createTime",
        order: "desc",
        startDate: "",
        endDate: "",
      },
      data: [],
      total: 0,
      currentStatus: "ALL",
    };
  },
  computed: {
    billStatusTabs() {
      return [
        { title: "全部", value: "ALL" },
        { title: "已出账", value: "OUT" },
        { title: "已对账", value: "CHECK" },
        { title: "已完成", value: "COMPLETE" },
      ];
    },
  },
  methods: {
    onStatusTabClick(tab) {
      this.billStatusClick(tab.paneName);
    },
    billStatusClick(name) {
      if (name === "ALL" || name === "" || name === undefined || name === null) {
        delete this.searchForm.billStatus;
        this.currentStatus = "ALL";
      } else {
        this.searchForm.billStatus = name;
        this.currentStatus = name;
      }
      this.searchForm.pageNumber = 1;
      this.getDataList();
    },
    init() {
      this.getDataList();
    },
    changePage() {
      this.getDataList();
    },
    changePageSize() {
      this.searchForm.pageNumber = 1;
      this.getDataList();
    },
    handleSearch() {
      this.searchForm.pageNumber = 1;
      this.searchForm.pageSize = 10;
      this.getDataList();
    },
    handleReset() {
      const { billStatus } = this.searchForm;
      this.searchForm = {
        pageNumber: 1,
        pageSize: 10,
        sort: "createTime",
        order: "desc",
        startDate: "",
        endDate: "",
      };
      if (this.currentStatus !== "ALL") {
        this.searchForm.billStatus = billStatus;
      }
      this.getDataList();
    },
    getDataList() {
      this.loading = true;
      API_Shop.getBillPage(this.searchForm).then((res) => {
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
    handleExport() {
      const params = { ...this.searchForm };
      API_Finance.exportBillList(params).then((blob) => {
        downloadBlob(blob, "结算单列表.xlsx");
      });
    },
  },
  mounted() {
    const billStatus = this.$route.query.billStatus;
    if (billStatus) {
      this.currentStatus = billStatus;
      this.searchForm.billStatus = billStatus;
    }
    this.init();
  },
  beforeRouteLeave(to, from, next) {
    from.meta.keepAlive = false;
    next();
  },
};
</script>

<style lang="scss" scoped>
@import "@/styles/table-common.scss";
.search > .el-card + .el-card {
  margin-top: 16px;
}
.bill-tab {
  :deep(.el-tabs__item) {
    font-size: 14px;
  }
}
.link-text {
  color: #409eff;
  cursor: pointer;
  text-decoration: none;
}
</style>
