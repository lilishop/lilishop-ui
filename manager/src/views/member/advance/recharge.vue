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
        <el-form-item label="会员名称" prop="memberName">
          <el-input
            v-model="searchForm.memberName"
            placeholder="请输入会员名称"
            clearable
            style="width: 240px"
          />
        </el-form-item>
        <el-form-item label="充值单号" prop="rechargeSn">
          <el-input
            v-model="searchForm.rechargeSn"
            placeholder="请输入充值单号"
            clearable
            style="width: 240px"
          />
        </el-form-item>
        <el-form-item label="支付时间">
          <el-date-picker
            v-model="selectDate"
            type="datetimerange"
            value-format="YYYY-MM-DD HH:mm:ss"
            clearable
            start-placeholder="开始时间"
            end-placeholder="结束时间"
            placeholder="选择起始时间"
            style="width: 360px"
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
        v-loading="loading"
        border
        :data="data"
        ref="table"
        class="mt_10"
        style="width: 100%"
      >
        <el-table-column prop="memberName" label="会员名称" min-width="120" show-overflow-tooltip />
        <el-table-column prop="rechargeSn" label="订单号" min-width="180" show-overflow-tooltip />
        <el-table-column label="充值金额" width="160" sortable>
          <template #default="{ row }">
            <priceColorScheme v-if="row" :value="row.rechargeMoney" :color="$mainColor" unit="+" />
          </template>
        </el-table-column>
        <el-table-column label="充值方式" width="120">
          <template #default="{ row }">
            <span v-if="row">{{ rechargeWayText(row.rechargeWay) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="支付状态" width="120">
          <template #default="{ row }">
            <el-tag v-if="row" :type="row.payStatus === 'PAID' ? 'success' : 'danger'">
              {{ row.payStatus === "PAID" ? "已付款" : "未付款" }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="充值时间" width="190" />
        <el-table-column prop="payTime" label="支付时间" width="190" />
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
import { getUserRecharge } from "@/api/member";

export default {
  name: "recharge",
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
        memberName: "",
      },
      selectDate: null,
      data: [],
      total: 0,
    };
  },
  methods: {
    rechargeWayText(way) {
      if (way === "ALIPAY") return "支付宝";
      if (way === "WECHAT") return "微信";
      if (way === "BANK_TRANSFER") return "线下转账";
      return "";
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
      this.searchForm.pageSize = 20;
      this.getDataList();
    },
    selectDateRange(v) {
      if (v && v.length === 2) {
        this.searchForm.startDate = v[0];
        this.searchForm.endDate = v[1];
      } else {
        this.searchForm.startDate = "";
        this.searchForm.endDate = "";
      }
    },
    getDataList() {
      this.loading = true;
      getUserRecharge(this.searchForm).then((res) => {
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
