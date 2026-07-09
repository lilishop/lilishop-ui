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
            placeholder="请输入商品名称/收货人/收货人手机号/店铺名称"
            clearable
            style="width: 380px"
          />
        </el-form-item>
        <el-form-item label="订单号" prop="orderSn">
          <el-input v-model="searchForm.orderSn" placeholder="请输入订单号" clearable style="width: 240px" />
        </el-form-item>
        <el-form-item label="会员名称" prop="buyerName">
          <el-input v-model="searchForm.buyerName" placeholder="请输入会员名称" clearable style="width: 240px" />
        </el-form-item>
        <el-form-item label="商品名称" prop="goodsName">
          <el-input v-model="searchForm.goodsName" placeholder="请输入商品名称" clearable style="width: 240px" />
        </el-form-item>
        <el-form-item label="收货人" prop="shipName">
          <el-input v-model="searchForm.shipName" placeholder="请输入收货人姓名" clearable style="width: 240px" />
        </el-form-item>
        <el-form-item label="订单类型" prop="orderType">
          <el-select v-model="searchForm.orderPromotionType" placeholder="请选择" clearable style="width: 240px">
            <el-option label="普通订单" value="NORMAL" />
            <el-option label="拼团订单" value="PINTUAN" />
            <el-option label="赠品订单" value="GIFT" />
            <el-option label="积分订单" value="POINTS" />
            <el-option label="砍价订单" value="KANJIA" />
          </el-select>
        </el-form-item>
        <el-form-item label="支付方式" prop="paymentMethod">
          <el-select v-model="searchForm.paymentMethod" placeholder="请选择支付方式" clearable style="width: 240px">
            <el-option label="微信支付" value="WECHAT" />
            <el-option label="支付宝" value="ALIPAY" />
            <el-option label="余额支付" value="WALLET" />
            <el-option label="线下转账" value="BANK_TRANSFER" />
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
      <div class="order-tab">
        <el-tabs v-model="currentStatus" @tab-click="onStatusTabClick">
          <el-tab-pane
            v-for="(item, index) in orderStatusWithCount"
            :key="index"
            :label="item.title"
            :name="item.value"
          />
        </el-tabs>
      </div>
      <div>
        <el-button type="warning" class="export" @click="exportOrder">导出订单</el-button>
      </div>

      <el-table v-loading="loading" :data="data" ref="table" class="mt_10" style="width: 100%">
        <el-table-column prop="sn" label="订单号" min-width="240" show-overflow-tooltip />
        <el-table-column label="订单来源" width="120">
          <template #default="{ row }">{{ clientTypeText(row.clientType) }}</template>
        </el-table-column>
        <el-table-column label="订单类型" width="120">
          <template #default="{ row }">
            <el-tag :type="orderPromotionTagType(row.orderPromotionType)">
              {{ orderPromotionText(row.orderPromotionType) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="memberName" label="买家名称" min-width="130" show-overflow-tooltip />
        <el-table-column prop="memberId" label="会员ID" min-width="120" show-overflow-tooltip />
        <el-table-column prop="storeName" label="店铺名称" min-width="150" show-overflow-tooltip />
        <el-table-column label="订单金额" min-width="100">
          <template #default="{ row }">
            <span :style="{ color: $mainColor }">{{ unitPrice(row.flowPrice, '￥') }}</span>
          </template>
        </el-table-column>
        <el-table-column label="支付方式" width="120">
          <template #default="{ row }">{{ paymentMethodText(row.paymentMethod) }}</template>
        </el-table-column>
        <el-table-column label="订单状态" min-width="100">
          <template #default="{ row }">
            <el-tag :type="orderStatusTagType(row.orderStatus)">{{ orderStatusText(row.orderStatus) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="下单时间" width="170" />
        <el-table-column label="操作" width="100" align="center" fixed="right">
          <template #default="{ row }">
            <a class="link-text" @click="detail(row)">查看</a>
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
import { ElMessage } from "element-plus";
import { unitPrice, customRouterPush } from "@/utils/filters";

export default {
  name: "orderList",
  data() {
    return {
      fields: {
        订单编号: "sn",
        下单时间: "createTime",
        客户名称: "memberName",
        支付方式: {
          field: "clientType",
          callback: (value) => {
            if (value == "H5") return "移动端";
            if (value == "PC") return "PC端";
            if (value == "WECHAT_MP") return "小程序端";
            if (value == "APP") return "移动应用端";
            return value;
          },
        },
        商品数量: "groupNum",
        付款状态: {
          field: "payStatus",
          callback: (value) =>
            value == "UNPAID" ? "未付款" : value == "PAID" ? "已付款" : "",
        },
        店铺: "storeName",
      },
      loading: true,
      searchForm: {
        pageNumber: 1,
        pageSize: 20,
        sort: "createTime",
        order: "desc",
        startDate: "",
        endDate: "",
        orderType: "",
        orderSn: "",
        keywords: "",
        buyerName: "",
        goodsName: "",
        shipName: "",
        orderStatus: "",
        paymentMethod: "",
        orderPromotionType: "",
      },
      selectDate: null,
      data: [],
      total: 0,
      orderNumData: {},
      currentStatus: "ALL",
    };
  },
  computed: {
    orderStatusWithCount() {
      return [
        { title: "全部", value: "ALL" },
        {
          title: `未付款${this.orderNumData.waitPayNum ? "(" + this.orderNumData.waitPayNum + ")" : ""}`,
          value: "UNPAID",
        },
        {
          title: `已付款${this.orderNumData.waitDeliveryNum ? "(" + this.orderNumData.waitDeliveryNum + ")" : ""}`,
          value: "PAID",
        },
        {
          title: `待发货${this.orderNumData.waitShipNum ? "(" + this.orderNumData.waitShipNum + ")" : ""}`,
          value: "UNDELIVERED",
        },
        {
          title: `部分发货${this.orderNumData.partsDeliveredNumNum ? "(" + this.orderNumData.partsDeliveredNumNum + ")" : ""}`,
          value: "PARTS_DELIVERED",
        },
        {
          title: `待收货${this.orderNumData.deliveredNum ? "(" + this.orderNumData.deliveredNum + ")" : ""}`,
          value: "DELIVERED",
        },
        {
          title: `待核验${this.orderNumData.waitCheckNum ? "(" + this.orderNumData.waitCheckNum + ")" : ""}`,
          value: "TAKE",
        },
        {
          title: `待自提${this.orderNumData.waitSelfPickNum ? "(" + this.orderNumData.waitSelfPickNum + ")" : ""}`,
          value: "STAY_PICKED_UP",
        },
        {
          title: `已完成${this.orderNumData.finishNum ? "(" + this.orderNumData.finishNum + ")" : ""}`,
          value: "COMPLETED",
        },
        {
          title: `已关闭${this.orderNumData.closeNum ? "(" + this.orderNumData.closeNum + ")" : ""}`,
          value: "CANCELLED",
        },
      ];
    },
  },
  methods: {
    unitPrice,
    onStatusTabClick(tab) {
      this.orderStatusClick(tab.paneName);
    },
    clientTypeText(v) {
      const map = { H5: "移动端", PC: "PC端", WECHAT_MP: "小程序端", APP: "移动应用端" };
      return map[v] || v || "-";
    },
    orderPromotionText(v) {
      const map = {
        NORMAL: "普通订单",
        PINTUAN: "拼团订单",
        GIFT: "赠品订单",
        POINTS: "积分订单",
        KANJIA: "砍价订单",
      };
      return map[v] || v || "-";
    },
    orderPromotionTagType(v) {
      const map = {
        NORMAL: "primary",
        PINTUAN: "danger",
        GIFT: "success",
        POINTS: "info",
        KANJIA: "warning",
      };
      return map[v] || "info";
    },
    paymentMethodText(v) {
      const map = {
        NOT_ACTUALLY_PAID: "-",
        WECHAT: "微信支付",
        ALIPAY: "支付宝",
        WALLET: "余额支付",
        BANK_TRANSFER: "线下转账",
      };
      return map[v] || v || "-";
    },
    orderStatusText(v) {
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
      return map[v] || v || "-";
    },
    orderStatusTagType(v) {
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
    },
    init() {
      this.getDataList();
      this.getOrderNumData();
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
      this.getOrderNumData();
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
      API_Order.getOrderList(this.searchForm)
        .then((res) => {
          this.loading = false;
          if (res.success) {
            this.data = res.result.records;
            this.total = res.result.total;
          }
        })
        .catch(() => {
          this.loading = false;
        });
    },
    detail(v) {
      customRouterPush({
        name: "order-detail",
        query: { sn: v.sn },
      });
    },
    async exportOrder() {
      if (!this.searchForm.startDate || !this.searchForm.endDate) {
        ElMessage.error("必须选择时间范围，搜索后进行导出！");
        return;
      }
      API_Order.exportOrder(this.searchForm)
        .then((res) => {
          const blob = new Blob([res], {
            type: "application/vnd.ms-excel;charset=utf-8",
          });
          if ("download" in document.createElement("a")) {
            const link = document.createElement("a");
            link.download = "订单列表.xlsx";
            link.style.display = "none";
            link.href = URL.createObjectURL(blob);
            document.body.appendChild(link);
            link.click();
            URL.revokeObjectURL(link.href);
            document.body.removeChild(link);
          } else {
            navigator.msSaveBlob(blob, "订单列表.xlsx");
          }
        })
        .catch((err) => {
          console.log(err);
        });
    },
    orderStatusClick(name) {
      if (name === "ALL" || name === "" || name === undefined) {
        this.searchForm.orderStatus = "";
        this.currentStatus = "ALL";
      } else {
        this.searchForm.orderStatus = name;
        this.currentStatus = name;
      }
      this.getDataList();
    },
    getOrderNumData() {
      // orderNum 接口仅查 li_order，不含 order_item 关联；keywords/goodsName 会引用 oi 字段导致 SQL 报错
      const { orderStatus, keywords, goodsName, ...searchParams } = this.searchForm;
      API_Order.getOrderNum(searchParams)
        .then((res) => {
          if (res.success) {
            this.orderNumData = res.result;
          }
        })
        .catch((err) => {
          console.error("获取订单数量统计失败:", err);
        });
    },
  },
  mounted() {
    this.init();
  },
};
</script>

<style lang="scss" scoped>
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
</style>
