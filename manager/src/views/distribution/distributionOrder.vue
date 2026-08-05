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
        <el-form-item label="订单编号" prop="orderSn">
          <el-input
            v-model="searchForm.orderSn"
            placeholder="请输入订单编号"
            clearable
            style="width: 240px"
          />
        </el-form-item>
        <el-form-item label="分销员" prop="distributionName">
          <el-input
            v-model="searchForm.distributionName"
            placeholder="请输入分销员名称"
            clearable
            style="width: 240px"
          />
        </el-form-item>
        <el-form-item label="店铺名称">
          <el-select
            v-model="searchForm.storeId"
            placeholder="请选择"
            filterable
            remote
            :remote-method="searchChange"
            clearable
            style="width: 240px"
          >
            <el-option
              v-for="item in shopList"
              :key="item.id"
              :label="item.storeName"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="订单时间">
          <el-date-picker
            v-model="timeRange"
            type="daterange"
            value-format="YYYY-MM-DD"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            placeholder="选择时间"
            style="width: 240px"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" class="search-btn" @click="handleSearch">搜索</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="list-card">
      <el-tabs v-model="currentStatus" class="status-tabs" @tab-change="onStatusTabChange">
        <el-tab-pane label="全部" name="ALL" />
        <el-tab-pane label="未完成" name="NO_COMPLETED" />
        <el-tab-pane label="完成" name="COMPLETE" />
        <el-tab-pane label="退款" name="REFUND" />
      </el-tabs>
      <el-table
        ref="table"
        v-loading="loading"
        border
        :data="data"
        class="mt_10"
        style="width: 100%"
      >
        <el-table-column
          prop="orderSn"
          label="订单编号"
          min-width="180"
          fixed="left"
          show-overflow-tooltip
        />
        <el-table-column label="客户信息" min-width="180">
          <template #default="{ row }">
            <div v-if="row" class="member-cell">
              <div class="member-name">{{ row.memberName || "-" }}</div>
              <div class="member-id">客户ID：{{ row.memberId || "-" }}</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="商品信息" min-width="200">
          <template #default="{ row }">
            <div v-if="row" class="goods-msg">
              <img v-if="row.image" :src="row.image" class="goods-thumb" alt="" />
              <span v-else class="goods-thumb-empty">无图</span>
              <div class="goods-info">
                <div class="goods-name">{{ row.goodsName }}</div>
                <div class="goods-num">数量：x{{ row.num }}</div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="一级分销员" min-width="180">
          <template #default="{ row }">
            <div v-if="row" class="member-cell">
              <div class="member-name">{{ row.distributionName || "-" }}</div>
              <div class="member-id">分销员ID：{{ row.distributionId || "-" }}</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="二级分销员" min-width="180">
          <template #default="{ row }">
            <div v-if="row" class="member-cell">
              <div class="member-name">{{ row.inviteDistributionName || "-" }}</div>
              <div class="member-id">分销员ID：{{ row.inviteDistributionId || "-" }}</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="storeName" label="店铺名称" min-width="100" show-overflow-tooltip />
        <el-table-column label="状态" min-width="90">
          <template #default="{ row }">
            <el-tag v-if="row" :type="filterStatusTagType(row.distributionOrderStatus)">
              {{ filterStatus(row.distributionOrderStatus) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="一级佣金" min-width="100">
          <template #default="{ row }">
            <span v-if="row" :style="{ color: $mainColor }">
              {{ formatCommission(row.directCommission) }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="二级佣金" min-width="100">
          <template #default="{ row }">
            <span v-if="row" :style="{ color: $mainColor }">
              {{ formatCommission(row.inviteCommission) }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" min-width="160" fixed="right" />
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
import { getDistributionOrder } from "@/api/distribution";
import { orderStatusList } from "./dataJson";
import { getShopListData } from "@/api/shops";

export default {
  name: "distributionOrder",
  data() {
    return {
      timeRange: [],
      orderStatusList,
      shopList: [],
      distributionId: this.$route.query.id,
      currentStatus: "ALL",
      loading: true,
      searchForm: {
        pageNumber: 1,
        pageSize: 20,
        sort: "create_time",
        order: "desc",
        distributionOrderStatus: "",
      },
      data: [],
      total: 0,
    };
  },
  watch: {
    $route(e) {
      this.distributionId = e.query.id ? e.query.id : undefined;
      this.getDataList();
    },
  },
  methods: {
    init() {
      this.getDataList();
      this.getShopList();
    },
    onStatusTabChange(name) {
      this.currentStatus = name;
      this.searchForm.distributionOrderStatus = name === "ALL" ? "" : name;
      this.searchForm.pageNumber = 1;
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
    getDataList() {
      if (this.distributionId) {
        this.searchForm.distributionId = this.distributionId;
      } else {
        delete this.searchForm.distributionId;
      }
      this.loading = true;
      if (this.timeRange && this.timeRange[0] && this.timeRange[1]) {
        const startTime = new Date(this.timeRange[0]).getTime();
        const endTime = new Date(this.timeRange[1]).getTime();
        this.searchForm.startTime = this.$filters.unixToDate(startTime / 1000);
        this.searchForm.endTime = this.$filters.unixToDate(endTime / 1000);
      } else {
        this.searchForm.startTime = null;
        this.searchForm.endTime = null;
      }
      getDistributionOrder(this.searchForm).then((res) => {
        this.loading = false;
        if (res.success) {
          this.data = res.result.records;
          this.total = res.result.total;
        }
      });
    },
    getShopList(val) {
      const params = {
        pageNumber: 1,
        pageSize: 20,
        storeName: val || "",
      };
      getShopListData(params).then((res) => {
        this.shopList = res.result.records;
      });
    },
    searchChange(val) {
      this.getShopList(val);
    },
    filterStatus(status) {
      const arr = [
        { status: "NO_COMPLETED", title: "未完成" },
        { status: "COMPLETE", title: "完成" },
        { status: "REFUND", title: "退款" },
      ];
      for (let i = 0; i < arr.length; i++) {
        if (arr[i].status === status) {
          return arr[i].title;
        }
      }
      return "未完成";
    },
    filterStatusTagType(status) {
      const arr = [
        { status: "NO_COMPLETED", type: "warning" },
        { status: "COMPLETE", type: "success" },
        { status: "REFUND", type: "danger" },
      ];
      for (let i = 0; i < arr.length; i++) {
        if (arr[i].status === status) {
          return arr[i].type;
        }
      }
      return "warning";
    },
    formatCommission(amount) {
      if (amount === null || amount === undefined || amount === "") {
        return "-";
      }
      return this.$filters.unitPrice(amount, "￥");
    },
  },
  mounted() {
    this.init();
  },
};
</script>

<style scoped lang="scss">
.member-cell {
  line-height: 1.4;
}
.member-name {
  color: #303133;
}
.member-id {
  margin-top: 2px;
  color: #909399;
  font-size: 12px;
  word-break: break-all;
}
.goods-msg {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 2px 0;
}
.goods-thumb {
  width: 50px;
  height: 50px;
  object-fit: cover;
  flex-shrink: 0;
}
.goods-thumb-empty {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 50px;
  height: 50px;
  flex-shrink: 0;
  background: #f5f7fa;
  color: #909399;
  font-size: 12px;
}
.goods-info {
  min-width: 0;
}
.goods-name {
  line-height: 1.4;
  word-break: break-word;
}
.goods-num {
  color: #999;
  font-size: 12px;
  margin-top: 2px;
}

.mt_10 {
  margin-top: 10px;
}

.list-card {
  margin-top: 16px;
}

.status-tabs {
  margin-bottom: 4px;

  :deep(.el-tabs__content) {
    display: none;
  }

  :deep(.el-tabs__header) {
    margin-bottom: 0;
  }
}
</style>
