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
        <el-form-item label="关键字" prop="keywords">
          <el-input
            v-model="searchForm.keywords"
            placeholder="请输入商品名称、订单编号搜索"
            clearable
            style="width: 240px"
          />
        </el-form-item>
        <el-form-item label="订单编号" prop="orderSn">
          <el-input
            v-model="searchForm.orderSn"
            placeholder="请输入订单编号"
            clearable
            style="width: 240px"
          />
        </el-form-item>
        <el-form-item label="售后单号" prop="sn">
          <el-input
            v-model="searchForm.sn"
            placeholder="请输入售后单号"
            clearable
            style="width: 240px"
          />
        </el-form-item>
        <el-form-item label="会员名称" prop="memberName">
          <el-input
            v-model="searchForm.memberName"
            placeholder="请输入会员名称"
            clearable
            style="width: 240px"
          />
        </el-form-item>
        <el-form-item label="申请时间">
          <el-date-picker
            v-model="selectDate"
            type="datetimerange"
            value-format="YYYY-MM-DD HH:mm:ss"
            clearable
            start-placeholder="开始时间"
            end-placeholder="结束时间"
            style="width: 360px"
            @change="selectDateRange"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" class="search-btn" @click="handleSearch">搜索</el-button>
          <el-button class="search-btn" @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card>
      <div class="order-tab">
        <el-tabs v-model="currentStatus" @tab-click="onStatusTabClick">
          <el-tab-pane
            v-for="item in serviceStatusWithCount"
            :key="item.value"
            :label="item.title"
            :name="item.value"
          />
        </el-tabs>
      </div>

      <el-table
        ref="table"
        v-loading="loading"
        :data="data"
        class="mt_10"
        style="width: 100%"
      >
        <el-table-column prop="sn" label="售后服务单号" min-width="140" show-overflow-tooltip />
        <el-table-column prop="orderSn" label="订单编号" min-width="120" show-overflow-tooltip />
        <el-table-column label="商品" min-width="300">
          <template #default="{ row }">
            <div v-if="row" style="margin-top: 5px; height: 80px; display: flex">
              <div>
                <img
                  :src="row.goodsImage"
                  style="width: 60px; height: 60px; margin-top: 3px; object-fit: cover; border-radius: 4px"
                  alt=""
                />
              </div>
              <div style="margin-left: 13px">
                <div class="div-zoom">
                  <a class="link-text" @click="linkTo(row.goodsId, row.skuId)">{{ row.goodsName }}</a>
                </div>
                <div style="color: #999; font-size: 12px; margin-top: 5px">
                  商品ID: {{ row.goodsId }}
                </div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="memberId" label="会员ID" min-width="120" show-overflow-tooltip />
        <el-table-column prop="memberName" label="会员名称" width="140" />
        <el-table-column label="售后金额" width="110">
          <template #default="{ row }">
            <span v-if="row" :style="{ color: $mainColor }">
              {{ $filters.unitPrice(row.applyRefundPrice, "￥") }}</span>
          </template>
        </el-table-column>
        <el-table-column label="售后状态" width="180">
          <template #default="{ row }">
            <el-tag
              v-if="row"
              :type="serviceStatusTagType(row.serviceStatus)"
              effect="plain"
            >
              {{ serviceStatusText(row.serviceStatus) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="申请时间" width="180" />
        <el-table-column label="操作" fixed="right" align="center" width="100">
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
import * as API_Order from "@/api/order";

const createDefaultSearchForm = () => ({
  pageNumber: 1,
  pageSize: 20,
  sort: "createTime",
  order: "desc",
  startDate: "",
  endDate: "",
  serviceType: "RETURN_MONEY",
  orderSn: "",
  memberName: "",
  serviceStatus: "",
  sn: "",
  keywords: "",
});

export default {
  name: "returnMoneyOrder",
  data() {
    return {
      loading: true,
      searchForm: createDefaultSearchForm(),
      selectDate: null,
      data: [],
      total: 0,
      currentStatus: "",
      afterSaleNumData: {},
    };
  },
  computed: {
    serviceStatusWithCount() {
      return [
        { title: "全部", value: "" },
        {
          title: `申请售后${this.afterSaleNumData.applyNum ? "(" + this.afterSaleNumData.applyNum + ")" : ""}`,
          value: "APPLY",
        },
        {
          title: `通过售后${this.afterSaleNumData.passNum ? "(" + this.afterSaleNumData.passNum + ")" : ""}`,
          value: "PASS",
        },
        {
          title: `拒绝售后${this.afterSaleNumData.refuseNum ? "(" + this.afterSaleNumData.refuseNum + ")" : ""}`,
          value: "REFUSE",
        },
        {
          title: `完成售后${this.afterSaleNumData.completeNum ? "(" + this.afterSaleNumData.completeNum + ")" : ""}`,
          value: "COMPLETE",
        },
        {
          title: `卖家终止售后${this.afterSaleNumData.sellerTerminationNum ? "(" + this.afterSaleNumData.sellerTerminationNum + ")" : ""}`,
          value: "SELLER_TERMINATION",
        },
        {
          title: `买家取消售后${this.afterSaleNumData.buyerCancelNum ? "(" + this.afterSaleNumData.buyerCancelNum + ")" : ""}`,
          value: "BUYER_CANCEL",
        },
        {
          title: `等待平台退款${this.afterSaleNumData.waitRefundNum ? "(" + this.afterSaleNumData.waitRefundNum + ")" : ""}`,
          value: "WAIT_REFUND",
        },
      ];
    },
  },
  methods: {
    serviceStatusText(status) {
      const map = {
        APPLY: "申请中",
        PASS: "通过售后",
        REFUSE: "拒绝售后",
        BUYER_RETURN: "买家退货，待卖家收货",
        SELLER_CONFIRM: "卖家确认收货",
        SELLER_TERMINATION: "卖家终止售后",
        BUYER_CANCEL: "买家取消售后",
        COMPLETE: "完成售后",
        WAIT_REFUND: "待平台退款",
      };
      return map[status] || status || "-";
    },
    serviceStatusTagType(status) {
      const map = {
        APPLY: "primary",
        PASS: "info",
        REFUSE: "warning",
        BUYER_RETURN: "warning",
        SELLER_CONFIRM: "",
        SELLER_TERMINATION: "success",
        BUYER_CANCEL: "danger",
        COMPLETE: "success",
        WAIT_REFUND: "primary",
      };
      return map[status] || "info";
    },
    init() {
      this.getDataList();
      this.getAfterSaleNumData();
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
      this.getAfterSaleNumData();
    },
    handleReset() {
      this.searchForm = createDefaultSearchForm();
      this.selectDate = null;
      this.currentStatus = "";
      this.getDataList();
      this.getAfterSaleNumData();
    },
    selectDateRange(v) {
      if (v) {
        this.searchForm.startDate = v[0];
        this.searchForm.endDate = v[1];
      } else {
        this.searchForm.startDate = "";
        this.searchForm.endDate = "";
      }
    },
    getDataList() {
      this.loading = true;
      API_Order.getAfterSaleOrderPage(this.searchForm)
        .then((res) => {
          if (res.success) {
            this.data = res.result.records;
            this.total = res.result.total;
          }
        })
        .finally(() => {
          this.loading = false;
        });
    },
    getAfterSaleNumData() {
      const { serviceStatus, ...searchParams } = this.searchForm;
      API_Order.getAfterSaleNumVO(searchParams).then((res) => {
        if (res.success) {
          this.afterSaleNumData = res.result;
        }
      });
    },
    detail(v) {
      this.$filters.customRouterPush({
        name: "return-goods-order-detail",
        query: { sn: v.sn },
      });
    },
    onStatusTabClick(tab) {
      this.serviceStatusClick(tab.paneName);
    },
    serviceStatusClick(item) {
      this.currentStatus = item;
      if (item === "" || item === undefined) {
        delete this.searchForm.serviceStatus;
      } else {
        this.searchForm.serviceStatus = item;
      }
      this.getDataList();
      this.getAfterSaleNumData();
    },
  },
  mounted() {
    const status = this.$route.query.serviceStatus;
    if (status) {
      this.currentStatus = status;
      this.searchForm.serviceStatus = status;
    }
    this.init();
  },
};
</script>

<style lang="scss" scoped>
.order-tab {
  :deep(.el-tabs__item) {
    font-size: 14px;
  }
}

.link-text {
  color: #409eff;
  cursor: pointer;
  text-decoration: none;
}

.mt_10 {
  margin-top: 10px;
}
</style>
