<template>
  <div class="search">
    <el-card>
      <el-form inline>
        <el-form-item label="会员">
          <el-input v-model="searchForm.memberName" clearable style="width: 160px" />
        </el-form-item>
        <el-form-item label="日期">
          <el-date-picker v-model="dateRange" type="daterange" value-format="YYYY-MM-DD" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleExport">导出</el-button>
        </el-form-item>
      </el-form>
    </el-card>
    <el-card class="mt_10">
      <el-table v-loading="loading" border :data="data">
        <el-table-column prop="memberName" label="会员" width="140" />
        <el-table-column prop="money" label="金额" width="110" />
        <el-table-column prop="serviceType" label="业务类型" width="140" />
        <el-table-column prop="detail" label="明细" min-width="200" show-overflow-tooltip />
        <el-table-column prop="createTime" label="时间" width="170" />
      </el-table>
      <div class="mt_10" style="display: flex; justify-content: flex-end">
        <el-pagination
          v-model:current-page="pageNumber"
          v-model:page-size="pageSize"
          :total="total"
          layout="total, prev, pager, next"
          size="small"
          @current-change="getDataList"
        />
      </div>
    </el-card>
  </div>
</template>

<script>
import * as API_Finance from "@/api/finance";
import { getRequest } from "@/libs/axios";
import { downloadBlob } from "@/utils/downloadBlob";

export default {
  name: "finance-wallet-log",
  data() {
    return {
      loading: false,
      searchForm: { memberName: "" },
      dateRange: [],
      pageNumber: 1,
      pageSize: 20,
      data: [],
      total: 0,
    };
  },
  mounted() {
    this.getDataList();
  },
  methods: {
    handleSearch() {
      this.pageNumber = 1;
      this.getDataList();
    },
    getDataList() {
      this.loading = true;
      const params = {
        pageNumber: this.pageNumber,
        pageSize: this.pageSize,
        memberName: this.searchForm.memberName,
      };
      getRequest("/wallet/log", params).then((res) => {
        this.loading = false;
        if (res.success) {
          this.data = res.result.records;
          this.total = res.result.total;
        }
      }).catch(() => {
        this.loading = false;
      });
    },
    handleExport() {
      const params = { memberName: this.searchForm.memberName };
      if (this.dateRange?.length === 2) {
        params.startDate = this.dateRange[0];
        params.endDate = this.dateRange[1];
      }
      API_Finance.exportWalletLog(params).then((blob) => {
        downloadBlob(blob, "钱包流水.xlsx");
      });
    },
  },
};
</script>
