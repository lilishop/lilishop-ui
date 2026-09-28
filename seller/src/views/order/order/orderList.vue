<template>
  <div class="search">
    <el-card>
      <el-form
        ref="searchForm"
        :model="searchForm"
        label-width="70px"
        class="search-form order-search-form"
        @keyup.enter="handleSearch"
      >
        <el-form-item label="关键字" prop="keywords">
          <el-input
            v-model="searchForm.keywords"
            placeholder="商品名称/收货人/手机号/店铺名称"
            clearable
          />
        </el-form-item>
        <el-form-item label="订单号" prop="orderSn">
          <el-input v-model="searchForm.orderSn" placeholder="请输入订单号" clearable />
        </el-form-item>
        <el-form-item label="商品名称" prop="goodsName">
          <el-input v-model="searchForm.goodsName" placeholder="请输入商品名称" clearable />
        </el-form-item>
        <el-form-item label="商品类型" prop="goodsType">
          <el-select v-model="searchForm.goodsType" placeholder="请选择商品类型" clearable>
            <el-option label="实物商品" value="PHYSICAL_GOODS" />
            <el-option label="虚拟商品" value="VIRTUAL_GOODS" />
            <el-option label="卡密商品" value="E_COUPON" />
            <el-option label="预约商品" value="APPOINTMENT_GOODS" />
          </el-select>
        </el-form-item>
        <el-form-item label="收货人" prop="shipName">
          <el-input v-model="searchForm.shipName" placeholder="请输入收货人姓名" clearable />
        </el-form-item>
        <el-form-item label="订单类型" prop="orderType">
          <el-select v-model="searchForm.orderPromotionType" placeholder="请选择" clearable>
            <el-option label="普通订单" value="NORMAL" />
            <el-option label="拼团订单" value="PINTUAN" />
            <el-option label="赠品订单" value="GIFT" />
            <el-option label="积分订单" value="POINTS" />
            <el-option label="砍价订单" value="KANJIA" />
          </el-select>
        </el-form-item>
        <el-form-item label="支付方式" prop="paymentMethod">
          <el-select v-model="searchForm.paymentMethod" placeholder="请选择支付方式" clearable>
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
            @change="selectDateRange"
          />
        </el-form-item>
        <el-form-item class="order-search-action">
          <el-button type="primary" @click="handleSearch">搜索</el-button>
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
        <el-button type="info" class="export" @click="exportOrder">导出订单</el-button>
      </div>

      <div v-loading="loading" class="doudian-list mt_10">
        <div class="doudian-head">
          <div>商品信息</div>
          <div>单价/数量</div>
          <div>售后状态</div>
          <div>应付</div>
          <div>买家/收货人</div>
          <div>订单状态</div>
          <div>操作</div>
        </div>
        <div v-if="!data.length && !loading" class="doudian-empty">暂无订单</div>
        <div v-for="row in data" :key="row.sn" class="doudian-order">
          <div class="doudian-bar">
            <span>下单时间：{{ row.createTime || "—" }}</span>
            <span class="doudian-sn">
              订单编号：{{ row.sn }}
              <a class="copy-icon" title="复制订单编号" @click="copyText(row.sn)">
                <el-icon><CopyDocument /></el-icon>
              </a>
            </span>
            <span class="doudian-bar-extra">
              {{ orderPromotionText(row.orderPromotionType) }}
              · {{ clientTypeText(row.clientType) }}
              · {{ paymentMethodText(row.paymentMethod) }}
            </span>
          </div>
          <div class="doudian-body">
            <div class="goods-stack">
              <div
                v-for="(item, index) in orderGoods(row)"
                :key="item.sn || index"
                class="goods-row"
              >
                <div class="goods-info">
                  <img class="goods-img" :src="item.image" alt="" />
                  <div class="goods-text">
                    <div class="goods-name">{{ item.name || "—" }}</div>
                    <div v-if="item.specs" class="goods-spec">{{ item.specs }}</div>
                  </div>
                </div>
                <div class="goods-price">
                  <div>{{ item.goodsPrice != null ? $filters.unitPrice(item.goodsPrice, "￥") : "—" }}</div>
                  <div class="goods-num">x{{ item.num || 0 }}</div>
                </div>
                <div class="goods-after">{{ afterSaleText(item.afterSaleStatus) }}</div>
              </div>
            </div>
            <div class="merge-cell pay-cell">{{ $filters.unitPrice(row.flowPrice, "￥") }}</div>
            <div class="merge-cell buyer-cell">
              <div>{{ row.memberName || "—" }}</div>
              <div v-if="row.consigneeName">{{ row.consigneeName }}</div>
              <div v-if="row.consigneeMobile" class="buyer-mobile">{{ row.consigneeMobile }}</div>
            </div>
            <div class="merge-cell">
              <el-tag :type="orderStatusTagType(row.orderStatus)">{{ orderStatusText(row.orderStatus) }}</el-tag>
            </div>
            <div class="merge-cell action-cell">
              <a class="link-text" @click="detail(row)">详情</a>
              <a v-if="canShip(row)" class="link-text" @click="detail(row, true)">
                {{ row.orderStatus === "PARTS_DELIVERED" ? "继续发货" : "发货" }}
              </a>
            </div>
          </div>
        </div>
      </div>

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
import { CopyDocument } from "@element-plus/icons-vue";
import * as API_Order from "@/api/order";
import { canShowShipButton, isNonShippableOrder } from "@/utils/orderFulfill";
export default {
  name: "orderList",
  components: { CopyDocument },
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
        goodsName: "",
        goodsType: "",
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
    onStatusTabClick(tab) {
      this.orderStatusClick(tab.paneName);
    },
    orderGoods(row) {
      const items = row && row.orderItems;
      return items && items.length ? items : [{}];
    },
    afterSaleText(status) {
      const map = {
        NOT_APPLIED: "—",
        NEW: "—",
        PART_AFTER_SALE: "部分售后",
        ALREADY_APPLIED: "售后中",
        EXPIRED: "不可售后",
      };
      return map[status] || "—";
    },
    copyText(text) {
      if (!text) {
        return;
      }
      const done = () => this.$Message.success("已复制订单编号");
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(done).catch(() => this.copyTextFallback(text, done));
        return;
      }
      this.copyTextFallback(text, done);
    },
    copyTextFallback(text, done) {
      const input = document.createElement("textarea");
      input.value = text;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
      done();
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
    detail(v, openFulfill = false) {
      this.$filters.customRouterPush({
        name: "order-detail",
        query: {
          sn: v.sn,
          ...(openFulfill ? { openFulfill: "1" } : {}),
          ...(openFulfill && v.orderStatus === "PARTS_DELIVERED" ? { fulfillMode: "SPLIT" } : {}),
        },
      });
    },
    canShip(row) {
      if (!row) return false;
      if (row.allowOperationVO) {
        return canShowShipButton(row.allowOperationVO, row);
      }
      if (isNonShippableOrder(row)) return false;
      return row.orderStatus === "UNDELIVERED" || row.orderStatus === "PARTS_DELIVERED";
    },
    async exportOrder() {
      if (!this.searchForm.startDate || !this.searchForm.endDate) {
        this.$Message.error("必须选择时间范围，搜索后进行导出！");
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
      // orderNum 接口仅查 li_order；keywords/goodsName 会引用 oi 字段。goodsType 用 EXISTS，可以带上。
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
    const orderStatus = this.$route.query.orderStatus;
    if (orderStatus) {
      this.currentStatus = orderStatus;
      this.searchForm.orderStatus = orderStatus;
    }
    this.init();
  },
};
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
.export {
  margin: 10px 20px 10px 0;
}
.order-tab {
  :deep(.el-tabs__item) {
    font-size: 14px;
  }
}
.link-text {
  color: #1966ff;
  cursor: pointer;
  text-decoration: none;
}
.doudian-list {
  min-height: 120px;
}
.doudian-head,
.doudian-body {
  display: grid;
  grid-template-columns:
    minmax(240px, 2.4fr)
    minmax(108px, 1fr)
    minmax(96px, 0.95fr)
    minmax(108px, 1fr)
    minmax(148px, 1.2fr)
    minmax(100px, 0.9fr)
    88px;
}
.doudian-head {
  background: #f7f8fa;
  color: #86909c;
  font-size: 13px;
  line-height: 40px;
}
.doudian-head > div:nth-child(n + 6) {
  text-align: center;
}
.doudian-head > div,
.goods-row > div,
.merge-cell {
  padding: 0 12px;
  box-sizing: border-box;
}
.doudian-empty {
  padding: 48px 0;
  text-align: center;
  color: #909399;
}
.doudian-order {
  margin-top: 12px;
  border: 1px solid #eeeff0;
}
.doudian-bar {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 8px 12px;
  background: #f7f8fa;
  color: #565960;
  font-size: 12px;
}
.doudian-sn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}
.copy-icon {
  display: inline-flex;
  color: #86909c;
  cursor: pointer;
  font-size: 14px;
}
.copy-icon:hover {
  color: #1966ff;
}
.doudian-bar-extra {
  margin-left: auto;
  color: #86909c;
}
.doudian-body {
  align-items: stretch;
}
.goods-stack {
  grid-column: 1 / 4;
  display: grid;
  grid-template-columns: subgrid;
  min-width: 0;
}
.goods-row {
  display: grid;
  grid-column: 1 / -1;
  grid-template-columns: subgrid;
  min-height: 84px;
  align-items: center;
  border-bottom: 1px solid #f2f3f5;
}
.goods-row:last-child {
  border-bottom: none;
}
.goods-info {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 12px;
  min-width: 0;
}
.goods-img {
  width: 64px;
  height: 64px;
  object-fit: cover;
  border-radius: 4px;
  background: #f5f7fa;
  flex: none;
}
.goods-text {
  min-width: 0;
}
.goods-name {
  color: #252931;
  line-height: 20px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.goods-spec,
.goods-num,
.buyer-mobile {
  margin-top: 4px;
  color: #86909c;
  font-size: 12px;
  line-height: 18px;
}
.goods-price,
.goods-after,
.merge-cell {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  text-align: left;
  color: #252931;
  font-size: 13px;
}
.doudian-body > .merge-cell:nth-child(n + 4) {
  align-items: center;
  text-align: center;
}
.goods-price,
.goods-after {
  min-height: 84px;
  border-left: 1px solid #f2f3f5;
}
.merge-cell {
  border-left: 1px solid #f2f3f5;
  padding: 12px;
}
.pay-cell {
  color: #252931;
  font-weight: 500;
}
.buyer-cell {
  align-items: flex-start;
  text-align: left;
}
.action-cell .link-text {
  line-height: 24px;
}
</style>
