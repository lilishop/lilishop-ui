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
        <el-form-item label="订单号" prop="orderSn">
          <el-input
            v-model="searchForm.orderSn"
            placeholder="订单/交易号"
            clearable
            style="width: 240px"
          />
        </el-form-item>
        <el-form-item label="退款状态">
          <el-select
            v-model="searchForm.isRefund"
            placeholder="请选择"
            clearable
            style="width: 240px"
          >
            <el-option label="未退款" value="false" />
            <el-option label="已退款" value="true" />
          </el-select>
        </el-form-item>
        <el-form-item label="退款时间">
          <el-date-picker
            v-model="selectDate"
            type="daterange"
            clearable
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            style="width: 240px"
            @change="selectDateRange"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" class="search-btn" @click="handleSearch">搜索</el-button>
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
        <el-table-column prop="afterSaleNo" label="售后单号" min-width="150" show-overflow-tooltip />
        <el-table-column prop="orderSn" label="订单号" min-width="150" show-overflow-tooltip />
        <el-table-column prop="paymentReceivableNo" label="第三方付款流水" min-width="150" show-overflow-tooltip />
        <el-table-column prop="receivableNo" label="第三方退款流水" min-width="130" show-overflow-tooltip />
        <el-table-column label="退款金额" min-width="120">
          <template #default="{ row }">
            <span v-if="row" :style="{ color: $mainColor }">
              {{ unitPrice(row.totalAmount, "￥") }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="申请时间" min-width="120" show-overflow-tooltip />
        <el-table-column label="退款状态" width="200" align="center">
          <template #default="{ row }">
            <template v-if="row">
              <el-tag v-if="row.isRefund" type="success">已退款</el-tag>
              <div v-else>
                <el-tag v-if="!row.errorMessage" type="danger">未退款</el-tag>
                <el-tooltip v-else placement="left">
                  <template #content>
                    <div
                      v-if="row.paymentName == 'WECHAT'"
                      style="white-space: normal"
                    >
                      {{ row.errorMessage ? JSON.parse(row.errorMessage).message : "" }}
                    </div>
                    <div
                      v-if="row.paymentName == 'ALIPAY'"
                      style="white-space: normal"
                    >
                      {{ row.errorMessage || "" }}
                    </div>
                  </template>
                  <el-tag type="danger">未退款</el-tag>
                </el-tooltip>
              </div>
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
  </div>
</template>

<script>
import * as API_Order from "@/api/order";
import { unitPrice } from "@/utils/filters";

export default {
  name: "refundLog",
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
        orderSn: "",
        isRefund: "",
      },
      selectDate: null,
      data: [],
      total: 0,
    };
  },
  methods: {
    unitPrice,
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
      this.searchForm.pageSize = 20;
      this.getDataList();
    },
    selectDateRange(v) {
      if (v && v[0] && v[1]) {
        this.searchForm.startDate = v[0];
        this.searchForm.endDate = v[1];
      } else {
        this.searchForm.startDate = "";
        this.searchForm.endDate = "";
      }
    },
    getDataList() {
      this.loading = true;
      API_Order.refundLog(this.searchForm).then((res) => {
        this.loading = false;
        if (res.success) {
          this.data = res.result.records;
          this.total = res.result.total;
        }
      });
    },
  },
  mounted() {
    this.init();
  },
};
</script>
