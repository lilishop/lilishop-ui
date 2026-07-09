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
        </el-form-item>
      </el-form>
    </el-card>

    <el-card>
      <el-table
        ref="table"
        v-loading="loading"
        border
        :data="data"
        class="mt_10"
        style="width: 100%"
      >
        <el-table-column prop="sn" label="账单号" min-width="250" show-overflow-tooltip />
        <el-table-column prop="createTime" label="生成时间" min-width="120" />
        <el-table-column label="结算时间段" width="200">
          <template #default="{ row }">
            <span v-if="row">{{ row.startTime }}~{{ row.endTime }}</span>
          </template>
        </el-table-column>
        <el-table-column label="结算金额" min-width="100">
          <template #default="{ row }">
            <priceColorScheme v-if="row" :value="row.billPrice" :color="$mainColor" />
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag v-if="row" :type="billStatusTagType(row.billStatus)">
              {{ billStatusText(row.billStatus) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120" align="center" fixed="right">
          <template #default="{ row }">
            <a v-if="row" class="link-text" @click="detail(row)">查看</a>
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

export default {
  name: "accountStatementBill",
  data() {
    return {
      loading: true,
      searchForm: {
        pageNumber: 1,
        pageSize: 20,
        sort: "createTime",
        order: "desc",
        startDate: "",
        endDate: "",
      },
      data: [],
      total: 0,
    };
  },
  methods: {
    billStatusText(v) {
      const map = { OUT: "已出账", CHECK: "已对账", COMPLETE: "已付款" };
      return map[v] || "已付款";
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
        sort: "createTime",
        order: "desc",
        startDate: "",
        endDate: "",
      };
      this.getDataList();
    },
    getDataList() {
      this.loading = true;
      this.searchForm.billStatus = "OUT";
      API_Shop.getBillPage(this.searchForm).then((res) => {
        this.loading = false;
        if (res.success) {
          this.data = res.result.records;
          this.total = res.result.total;
        }
      });
    },
    detail(v) {
      this.$router.push({
        name: "bill-detail",
        query: { id: v.id },
      });
    },
  },
  mounted() {
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
.link-text {
  color: #2d8cf0;
  cursor: pointer;
  text-decoration: none;
}
</style>
