<template>
  <div class="search">
    <el-card>
      <el-form
        ref="searchFormRef"
        :model="searchForm"
        label-width="70px"
        class="search-form order-search-form"
        @keyup.enter="handleSearch"
      >
        <el-form-item label="订单号" prop="orderSn">
          <el-input v-model="searchForm.orderSn" placeholder="请输入订单号" clearable />
        </el-form-item>
        <el-form-item label="会员名称" prop="buyerName">
          <el-input v-model="searchForm.buyerName" placeholder="请输入会员名称" clearable />
        </el-form-item>
        <el-form-item label="商品名称" prop="goodsName">
          <el-input v-model="searchForm.goodsName" placeholder="请输入商品名称" clearable />
        </el-form-item>
        <el-form-item label="店铺名称" prop="storeName">
          <el-input v-model="searchForm.storeName" placeholder="请输入店铺名称" clearable />
        </el-form-item>
        <el-form-item label="收货人" prop="shipName">
          <el-input v-model="searchForm.shipName" placeholder="请输入收货人姓名" clearable />
        </el-form-item>
        <el-form-item label="收货手机" prop="consigneeMobile">
          <el-input v-model="searchForm.consigneeMobile" placeholder="请输入收货人手机号" clearable />
        </el-form-item>
        <el-form-item label="促销类型" prop="orderPromotionType">
          <el-select v-model="searchForm.orderPromotionType" placeholder="请选择" clearable>
            <el-option v-for="item in promotionOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="订单类型" prop="orderType">
          <el-select v-model="searchForm.orderType" placeholder="请选择" clearable>
            <el-option v-for="item in orderTypeOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="支付方式" prop="paymentMethod">
          <el-select v-model="searchForm.paymentMethod" placeholder="请选择支付方式" :disabled="!!fixedPaymentMethod" :clearable="!fixedPaymentMethod">
            <el-option v-for="item in paymentOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="下单时间">
          <el-date-picker
            v-model="selectDate"
            type="datetimerange"
            value-format="YYYY-MM-DD HH:mm:ss"
            clearable
            start-placeholder="开始时间"
            end-placeholder="结束时间"
            @change="selectDateRange"
          />
        </el-form-item>
        <el-form-item class="order-search-action">
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card>
      <div class="order-tab">
        <el-tabs v-model="currentStatus" @tab-click="onStatusTabClick">
          <el-tab-pane
            v-for="item in orderStatusWithCount"
            :key="item.value"
            :label="item.title"
            :name="item.value"
          />
        </el-tabs>
      </div>
      <div v-if="allowExport">
        <el-button type="warning" class="export" :loading="exporting" @click="exportOrder">导出订单</el-button>
      </div>

      <el-table v-loading="loading" :data="data" ref="tableRef" class="mt_10" style="width: 100%">
        <el-table-column prop="sn" label="订单号" min-width="200" show-overflow-tooltip />
        <el-table-column label="商品" min-width="280">
          <template #default="{ row }">
            <div v-if="orderGoods(row).length" class="goods-cell">
              <div v-for="(item, index) in orderGoods(row)" :key="item.sn || index" class="goods-line">
                <img v-if="item.image" class="goods-img" :src="item.image" alt="" />
                <div class="goods-text">
                  <div class="goods-name">{{ item.name || "—" }}</div>
                  <div class="goods-meta">
                    <span v-if="item.specs">{{ item.specs }}</span>
                    <span>x{{ item.num || 0 }}</span>
                  </div>
                </div>
              </div>
            </div>
            <span v-else>—</span>
          </template>
        </el-table-column>
        <el-table-column label="订单来源" width="110">
          <template #default="{ row }">{{ clientTypeText(row.clientType) }}</template>
        </el-table-column>
        <el-table-column label="订单类型" width="110">
          <template #default="{ row }">{{ orderTypeText(row.orderType) }}</template>
        </el-table-column>
        <el-table-column label="促销类型" width="110">
          <template #default="{ row }">
            <el-tag :type="orderPromotionTagType(row.orderPromotionType)">
              {{ orderPromotionText(row.orderPromotionType) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="memberName" label="买家名称" min-width="120" show-overflow-tooltip />
        <el-table-column prop="memberId" label="会员ID" min-width="185" show-overflow-tooltip />
        <el-table-column prop="storeName" label="店铺名称" min-width="140" show-overflow-tooltip />
        <el-table-column label="配送方式" width="110">
          <template #default="{ row }">{{ deliveryMethodText(row.deliveryMethod) }}</template>
        </el-table-column>
        <el-table-column label="订单金额" min-width="100">
          <template #default="{ row }">
            <span :style="{ color: $mainColor }">{{ unitPrice(row.flowPrice, "￥") }}</span>
          </template>
        </el-table-column>
        <el-table-column label="支付方式" width="110">
          <template #default="{ row }">{{ paymentMethodText(row.paymentMethod) }}</template>
        </el-table-column>
        <el-table-column label="订单状态" min-width="100">
          <template #default="{ row }">
            <el-tag :type="orderStatusTagType(row.orderStatus)">{{ orderStatusText(row.orderStatus) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="下单时间" width="170" />
        <el-table-column label="操作" width="80" align="center" fixed="right">
          <template #default="{ row }">
            <a class="link-text" @click="detail(row)">查看</a>
          </template>
        </el-table-column>
      </el-table>

      <div class="mt_10" style="display: flex; justify-content: flex-end">
        <el-pagination
          v-model:current-page="searchForm.pageNumber"
          v-model:page-size="searchForm.pageSize"
          :page-sizes="pageSizes"
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
import { computed, onMounted, ref, watch } from "vue";
import { useRoute } from "vue-router";
import * as API_Order from "@/api/order";
import { ElMessage, ElMessageBox } from "element-plus";
import { unitPrice, customRouterPush } from "@/utils/filters";
const PAGE_SIZES = [20, 50, 100];

// 独立渠道页面复用列表，来源限制不从地址栏或可重置表单中读取。
const props = defineProps({
  fixedClientType: { type: String, default: "" },
  fixedPaymentMethod: { type: String, default: "" },
  allowExport: { type: Boolean, default: true },
});

const PROMOTION_OPTIONS = [
  { label: "普通订单", value: "NORMAL" },
  { label: "拼团订单", value: "PINTUAN" },
  { label: "赠品订单", value: "GIFT" },
  { label: "积分订单", value: "POINTS" },
  { label: "砍价订单", value: "KANJIA" },
];

const ORDER_TYPE_OPTIONS = [
  { label: "普通订单", value: "NORMAL" },
  { label: "虚拟订单", value: "VIRTUAL" },
  { label: "电子卡券", value: "E_COUPON" },
  { label: "预约订单", value: "APPOINTMENT" },
];

const PAYMENT_OPTIONS = [
  { label: "微信支付", value: "WECHAT" },
  { label: "支付宝", value: "ALIPAY" },
  { label: "余额支付", value: "WALLET" },
  { label: "线下转账", value: "BANK_TRANSFER" },
];

function emptySearchForm(pageSize = 20) {
  return {
    pageNumber: 1,
    pageSize,
    sort: "createTime",
    order: "desc",
    startDate: "",
    endDate: "",
    orderType: "",
    orderSn: "",
    buyerName: "",
    goodsName: "",
    shipName: "",
    consigneeMobile: "",
    storeName: "",
    orderStatus: "",
    paymentMethod: props.fixedPaymentMethod,
    orderPromotionType: "",
  };
}


defineOptions({ name: "orderList" });

const route = useRoute();

const searchFormRef = ref(null);
const tableRef = ref(null);

const loading = ref(true);
const exporting = ref(false);
const pageSizes = ref(PAGE_SIZES);
const promotionOptions = ref(PROMOTION_OPTIONS);
const orderTypeOptions = ref(ORDER_TYPE_OPTIONS);
const paymentOptions = ref(PAYMENT_OPTIONS);
const searchForm = ref(emptySearchForm());
const selectDate = ref(null);
const data = ref([]);
const total = ref(0);
const orderNumData = ref({});
const currentStatus = ref("ALL");

function applyRouteQuery() {
  const q = route.query;
  if (!q) return;
  if (q.orderSn) searchForm.value.orderSn = String(q.orderSn);
  if (q.buyerName) searchForm.value.buyerName = String(q.buyerName);
  if (q.goodsName) searchForm.value.goodsName = String(q.goodsName);
  if (q.storeName) searchForm.value.storeName = String(q.storeName);
  if (q.orderType) searchForm.value.orderType = String(q.orderType);
  if (q.orderStatus) {
    searchForm.value.orderStatus = String(q.orderStatus);
    currentStatus.value = String(q.orderStatus);
  }
  if (q.startDate && q.endDate) {
    searchForm.value.startDate = String(q.startDate);
    searchForm.value.endDate = String(q.endDate);
    selectDate.value = [String(q.startDate), String(q.endDate)];
  }
}

const orderStatusWithCount = computed(() => {
  const count = (value) => (value ? `(${value})` : "");
  return [
    { title: "全部", value: "ALL" },
    { title: `未付款${count(orderNumData.value.waitPayNum)}`, value: "UNPAID" },
    { title: `已付款${count(orderNumData.value.waitDeliveryNum)}`, value: "PAID" },
    { title: `待发货${count(orderNumData.value.waitShipNum)}`, value: "UNDELIVERED" },
    { title: `部分发货${count(orderNumData.value.partsDeliveredNumNum)}`, value: "PARTS_DELIVERED" },
    { title: `待收货${count(orderNumData.value.deliveredNum)}`, value: "DELIVERED" },
    { title: `待核验${count(orderNumData.value.waitCheckNum)}`, value: "TAKE" },
    { title: `待自提${count(orderNumData.value.waitSelfPickNum)}`, value: "STAY_PICKED_UP" },
    { title: `已完成${count(orderNumData.value.finishNum)}`, value: "COMPLETED" },
    { title: `已关闭${count(orderNumData.value.closeNum)}`, value: "CANCELLED" },
  ];
});

function onStatusTabClick(tab) {
  orderStatusClick(tab.paneName);
}
function orderGoods(row) {
  const items = row && row.orderItems;
  return items && items.length ? items : [];
}
function clientTypeText(v) {
  const map = { H5: "移动端", PC: "PC端", WECHAT_MP: "小程序端", APP: "移动应用端" };
  return map[v] || v || "—";
}
function orderTypeText(v) {
  const found = ORDER_TYPE_OPTIONS.find((item) => item.value === v);
  return found ? found.label : v || "—";
}
function orderPromotionText(v) {
  const found = PROMOTION_OPTIONS.find((item) => item.value === v);
  return found ? found.label : v || "—";
}
function orderPromotionTagType(v) {
  const map = {
    NORMAL: "primary",
    PINTUAN: "danger",
    GIFT: "success",
    POINTS: "info",
    KANJIA: "warning",
  };
  return map[v] || "info";
}
function deliveryMethodText(v) {
  const map = {
    SELF_PICK_UP: "自提",
    LOCAL_TOWN_DELIVERY: "同城配送",
    LOGISTICS: "物流",
    VIRTUAL: "虚拟发货",
  };
  return map[v] || v || "—";
}
function paymentMethodText(v) {
  const map = {
    NOT_ACTUALLY_PAID: "—",
    WECHAT: "微信支付",
    ALIPAY: "支付宝",
    WALLET: "余额支付",
    BANK_TRANSFER: "线下转账",
  };
  return map[v] || v || "—";
}
function orderStatusText(v) {
  const map = {
    UNPAID: "未付款",
    PAID: "已付款",
    UNDELIVERED: "待发货",
    STAY_PICKED_UP: "待自提",
    PARTS_DELIVERED: "部分发货",
    DELIVERED: "已发货",
    COMPLETED: "已完成",
    TAKE: "待核验",
    CANCELLED: "已关闭",
  };
  return map[v] || v || "—";
}
function orderStatusTagType(v) {
  const map = {
    UNPAID: "danger",
    PAID: "primary",
    UNDELIVERED: "info",
    STAY_PICKED_UP: "info",
    PARTS_DELIVERED: "warning",
    DELIVERED: "warning",
    COMPLETED: "success",
    TAKE: "warning",
    CANCELLED: "danger",
  };
  return map[v] || "info";
}
function init() {
  getDataList();
  getOrderNumData();
}
function changePage(v) {
  searchForm.value.pageNumber = v;
  getDataList();
}
function changePageSize(v) {
  searchForm.value.pageNumber = 1;
  searchForm.value.pageSize = v;
  getDataList();
}
function handleSearch() {
  searchForm.value.pageNumber = 1;
  getDataList();
  getOrderNumData();
}
function handleReset() {
  const pageSize = searchForm.value.pageSize;
  searchForm.value = emptySearchForm(pageSize);
  selectDate.value = null;
  currentStatus.value = "ALL";
  init();
}
function selectDateRange(v) {
  if (v && v.length === 2) {
    searchForm.value.startDate = v[0];
    searchForm.value.endDate = v[1];
  } else {
    searchForm.value.startDate = "";
    searchForm.value.endDate = "";
  }
}
function countParams() {
  const params = listParams();
  delete params.orderStatus;
  delete params.pageNumber;
  delete params.pageSize;
  delete params.sort;
  delete params.order;
  return params;
}
function listParams() {
  const params = { ...searchForm.value };
  if (props.fixedClientType) params.clientType = props.fixedClientType;
  if (props.fixedPaymentMethod) params.paymentMethod = props.fixedPaymentMethod;
  return params;
}
function getDataList() {
  loading.value = true;
  API_Order.getOrderList(listParams())
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
function detail(v) {
  customRouterPush({
    name: "order-detail",
    query: { sn: v.sn },
  });
}
async function exportOrder() {
  if (!props.allowExport) return;
  if (!searchForm.value.startDate || !searchForm.value.endDate) {
    try {
      await ElMessageBox.confirm(
        "未选择下单时间，将按当前筛选条件导出全部匹配订单。",
        "导出订单",
        { type: "warning", confirmButtonText: "继续导出", cancelButtonText: "取消" }
      );
    } catch (e) {
      return;
    }
  }
  exporting.value = true;
  API_Order.exportOrder(listParams())
    .then((res) => {
      const blob = new Blob([res], {
        type: "application/vnd.ms-excel;charset=utf-8",
      });
      const link = document.createElement("a");
      link.download = "订单列表.xlsx";
      link.style.display = "none";
      link.href = URL.createObjectURL(blob);
      document.body.appendChild(link);
      link.click();
      URL.revokeObjectURL(link.href);
      document.body.removeChild(link);
    })
    .catch(() => {
      ElMessage.error("导出失败");
    })
    .finally(() => {
      exporting.value = false;
    });
}
function orderStatusClick(name) {
  if (name === "ALL" || name === "" || name === undefined) {
    searchForm.value.orderStatus = "";
    currentStatus.value = "ALL";
  } else {
    searchForm.value.orderStatus = name;
    currentStatus.value = name;
  }
  searchForm.value.pageNumber = 1;
  getDataList();
}
function getOrderNumData() {
  API_Order.getOrderNum(countParams())
    .then((res) => {
      if (res.success) {
        orderNumData.value = res.result;
      }
    })
    .catch(() => {
      orderNumData.value = {};
    });
}

watch(
  () => route.query,
  (newQuery) => {
    if (newQuery && Object.keys(newQuery).length > 0) {
      applyRouteQuery();
      searchForm.value.pageNumber = 1;
      init();
    }
  }
);

onMounted(() => {
  try {
    sessionStorage.removeItem("manager-order-list-query");
  } catch (e) {
    // ignore
  }
  applyRouteQuery();
  init();
});
</script>

<style lang="scss" scoped>
.order-search-form {
  display: grid !important;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  column-gap: 16px;
  align-items: start;

  > :deep(.el-form-item) {
    display: flex;
    width: auto;
    min-width: 0;
    margin: 8px 0 !important;
  }

  :deep(.el-form-item__content) {
    flex: 1;
    min-width: 0;
  }

  :deep(.el-input),
  :deep(.el-select),
  :deep(.el-date-editor) {
    width: 100% !important;
    max-width: 100%;
    min-width: 0;
    box-sizing: border-box;
  }
}
.order-search-action :deep(.el-form-item__content) {
  display: flex;
  gap: 8px;
}
.export {
  margin: 10px 20px 10px 0;
}
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
.goods-cell {
  max-height: 168px;
  overflow: auto;
}
.goods-line {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 6px 0;
}
.goods-line + .goods-line {
  border-top: 1px solid #f2f3f5;
}
.goods-img {
  width: 48px;
  height: 48px;
  object-fit: cover;
  border-radius: 4px;
  background: #f5f7fa;
  flex: none;
}
.goods-text {
  min-width: 0;
}
.goods-name {
  line-height: 20px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.goods-meta {
  margin-top: 2px;
  color: #909399;
  font-size: 12px;
  line-height: 18px;
  display: flex;
  gap: 8px;
}
</style>
