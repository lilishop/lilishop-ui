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
        <el-form-item label="订单号" prop="sn">
          <el-input
            v-model="searchForm.sn"
            placeholder="订单/交易号"
            clearable
            style="width: 240px"
          />
        </el-form-item>
        <el-form-item label="付款状态" prop="orderStatus">
          <el-select v-model="searchForm.payStatus" placeholder="请选择" clearable style="width: 240px">
            <el-option label="未付款" value="UNPAID" />
            <el-option label="已付款" value="PAID" />
          </el-select>
        </el-form-item>
        <el-form-item label="支付方式" prop="orderStatus">
          <el-select v-model="searchForm.paymentMethod" placeholder="请选择" clearable style="width: 240px">
            <el-option label="全部" value="" />
            <el-option label="微信" value="WECHAT" />
            <el-option label="支付宝" value="ALIPAY" />
            <el-option label="余额" value="WALLET" />
            <el-option label="银行转账" value="BANK_TRANSFER" />
          </el-select>
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
        <el-table-column prop="sn" label="订单/交易编号" min-width="180" show-overflow-tooltip />
        <el-table-column prop="storeName" label="店铺名称" min-width="100" show-overflow-tooltip />
        <el-table-column label="支付方式" width="120" align="center">
          <template #default="{ row }">
            <template v-if="row">
              <el-tag v-if="row.paymentMethod === 'WECHAT'" type="success">微信</el-tag>
              <el-tag v-else-if="row.paymentMethod === 'ALIPAY'" type="primary">支付宝</el-tag>
              <el-tag v-else-if="row.paymentMethod === 'WALLET'" type="info">余额支付</el-tag>
              <el-tag v-else-if="row.paymentMethod === 'BANK_TRANSFER'" type="warning">银行转帐</el-tag>
              <el-tag v-else>暂未付款</el-tag>
            </template>
          </template>
        </el-table-column>
        <el-table-column label="第三方流水" min-width="130">
          <template #default="{ row }">
            <span v-if="row">{{ row.receivableNo || "暂无流水号" }}</span>
          </template>
        </el-table-column>
        <el-table-column label="客户端" width="130">
          <template #default="{ row }">
            <span v-if="row">
              <span v-if="row.clientType === 'WECHAT_MP' || row.clientType === '小程序'">小程序</span>
              <span v-else-if="row.clientType === 'APP'">APP</span>
              <span v-else-if="row.clientType === 'PC'">PC网页</span>
              <span v-else-if="row.clientType === 'H5' || row.clientType === 'wap'">移动端</span>
            </span>
          </template>
        </el-table-column>
        <el-table-column label="支付时间" width="200">
          <template #default="{ row }">
            <span v-if="row">{{ row.paymentTime || "暂无支付时间" }}</span>
          </template>
        </el-table-column>
        <el-table-column label="订单金额" min-width="80" fixed="right">
          <template #default="{ row }">
            <priceColorScheme v-if="row" :value="row.flowPrice" :color="$mainColor" />
          </template>
        </el-table-column>
        <el-table-column label="支付状态" width="95" fixed="right">
          <template #default="{ row }">
            <template v-if="row">
              <el-tag v-if="row.payStatus == 'PAID'" type="success">已付款</el-tag>
              <el-tag v-else type="danger">未付款</el-tag>
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

export default {
  name: "paymentLog",
  data() {
    return {
      loading: true,
      searchForm: {
        pageNumber: 1,
        pageSize: 20,
        sort: "createTime",
        order: "desc",
        sn: "",
        payStatus: "",
        startDate: "",
        endDate: "",
      },
      times: [],
      data: [],
      total: 0,
    };
  },
  methods: {
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
      this.searchForm.pageSize = 20;
      this.getDataList();
    },
    changeDate(val) {
      this.searchForm.startDate = val[0];
      this.searchForm.endDate = val[1];
    },
    getDataList() {
      this.loading = true;
      API_Order.paymentLog(this.searchForm).then((res) => {
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
