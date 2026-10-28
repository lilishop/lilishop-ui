<template>
  <div class="search">
    <el-card>
      <el-form
        ref="searchFormRef"
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
        ref="tableRef"
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
                  SPU编码: {{ row.goodsId }}
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
        <el-table-column label="操作" fixed="right" align="right" width="100">
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

<script setup>
import { computed, onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import * as API_Order from "@/api/order";
import { customRouterPush } from "@/utils/filters";

defineOptions({ name: "returnMoneyOrder" });

const route = useRoute();

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

const loading = ref(true);
// searchForm 会被整体替换（handleReset），使用 ref
const searchForm = ref(createDefaultSearchForm());
const selectDate = ref(null);
const data = ref([]);
const total = ref(0);
const currentStatus = ref("");
const afterSaleNumData = ref({});

// searchFormRef / tableRef：模板 ref 改名避免与顶层变量互相覆盖
const searchFormRef = ref(null);
const tableRef = ref(null);

const serviceStatusWithCount = computed(() => {
  return [
    { title: "全部", value: "" },
    {
      title: `申请售后${afterSaleNumData.value.applyNum ? "(" + afterSaleNumData.value.applyNum + ")" : ""}`,
      value: "APPLY",
    },
    {
      title: `通过售后${afterSaleNumData.value.passNum ? "(" + afterSaleNumData.value.passNum + ")" : ""}`,
      value: "PASS",
    },
    {
      title: `拒绝售后${afterSaleNumData.value.refuseNum ? "(" + afterSaleNumData.value.refuseNum + ")" : ""}`,
      value: "REFUSE",
    },
    {
      title: `完成售后${afterSaleNumData.value.completeNum ? "(" + afterSaleNumData.value.completeNum + ")" : ""}`,
      value: "COMPLETE",
    },
    {
      title: `卖家终止售后${afterSaleNumData.value.sellerTerminationNum ? "(" + afterSaleNumData.value.sellerTerminationNum + ")" : ""}`,
      value: "SELLER_TERMINATION",
    },
    {
      title: `买家取消售后${afterSaleNumData.value.buyerCancelNum ? "(" + afterSaleNumData.value.buyerCancelNum + ")" : ""}`,
      value: "BUYER_CANCEL",
    },
    {
      title: `等待平台退款${afterSaleNumData.value.waitRefundNum ? "(" + afterSaleNumData.value.waitRefundNum + ")" : ""}`,
      value: "WAIT_REFUND",
    },
  ];
});

onMounted(() => {
  const status = route.query.serviceStatus;
  if (status) {
    currentStatus.value = status;
    searchForm.value.serviceStatus = status;
  }
  init();
});

function serviceStatusText(status) {
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
}
function serviceStatusTagType(status) {
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
}
function init() {
  getDataList();
  getAfterSaleNumData();
}
function changePage() {
  getDataList();
}
function changePageSize() {
  searchForm.value.pageNumber = 1;
  getDataList();
}
function handleSearch() {
  searchForm.value.pageNumber = 1;
  searchForm.value.pageSize = 20;
  getDataList();
  getAfterSaleNumData();
}
function handleReset() {
  searchForm.value = createDefaultSearchForm();
  selectDate.value = null;
  currentStatus.value = "";
  getDataList();
  getAfterSaleNumData();
}
function selectDateRange(v) {
  if (v) {
    searchForm.value.startDate = v[0];
    searchForm.value.endDate = v[1];
  } else {
    searchForm.value.startDate = "";
    searchForm.value.endDate = "";
  }
}
function getDataList() {
  loading.value = true;
  API_Order.getAfterSaleOrderPage(searchForm.value)
    .then((res) => {
      if (res.success) {
        data.value = res.result.records;
        total.value = res.result.total;
      }
    })
    .finally(() => {
      loading.value = false;
    });
}
function getAfterSaleNumData() {
  const { serviceStatus, ...searchParams } = searchForm.value;
  API_Order.getAfterSaleNumVO(searchParams).then((res) => {
    if (res.success) {
      afterSaleNumData.value = res.result;
    }
  });
}
function detail(v) {
  customRouterPush({
    name: "return-goods-order-detail",
    query: { sn: v.sn },
  });
}
function onStatusTabClick(tab) {
  serviceStatusClick(tab.paneName);
}
function serviceStatusClick(item) {
  currentStatus.value = item;
  if (item === "" || item === undefined) {
    delete searchForm.value.serviceStatus;
  } else {
    searchForm.value.serviceStatus = item;
  }
  getDataList();
  getAfterSaleNumData();
}
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
