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
        <el-table-column prop="memberName" label="会员名称" min-width="100" />
        <el-table-column label="变动金额" width="150">
          <template #default="{ row }">
            <template v-if="row">
              <priceColorScheme
                v-if="row.money > 0"
                :value="row.money"
                color="green"
              />
              <priceColorScheme
                v-else-if="row.money < 0"
                :value="row.money"
                :color="$mainColor"
              />
            </template>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="变更时间" width="200" />
        <el-table-column label="业务类型" width="200">
          <template #default="{ row }">
            <span v-if="row">{{ serviceTypeText(row.serviceType) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="detail" label="详细" min-width="300" show-overflow-tooltip />
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
import { getUserWallet } from "@/api/member";

export default {
  name: "walletLog",
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
    serviceTypeText(type) {
      if (type === "WALLET_WITHDRAWAL") return "余额提现";
      if (type === "WALLET_PAY") return "余额支付";
      if (type === "WALLET_REFUND") return "余额退款";
      if (type === "WALLET_RECHARGE") return "余额充值";
      return "佣金提成";
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
      getUserWallet(this.searchForm).then((res) => {
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
