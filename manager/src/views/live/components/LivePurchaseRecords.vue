<template>
  <div class="live-purchase-records" v-loading="loading">
    <div class="records-scroll">
      <div class="order-table-head">
        <div class="col-goods">订单详情</div>
        <div class="col-store">店铺名称</div>
        <div class="col-price">应付</div>
        <div class="col-member">买家/收货人</div>
        <div class="col-status">订单状态</div>
      </div>

      <template v-if="orderList.length">
        <div v-for="order in orderList" :key="order.sn" class="order-block">
          <div class="order-block-head">
            <span class="order-sn">
              订单编号：{{ order.sn }}
              <el-icon class="copy-icon" @click="copySn(order.sn)"><DocumentCopy /></el-icon>
            </span>
            <span class="order-time">下单时间：{{ formatTime(order.createTime) }}</span>
          </div>
          <div class="order-block-body">
            <div class="col-goods">
              <div v-for="(item, index) in getOrderItems(order)" :key="index" class="goods-item">
                <el-image :src="item.image" fit="cover" class="goods-img">
                  <template #error>
                    <div class="goods-img-fallback" />
                  </template>
                </el-image>
                <div class="goods-info">
                  <div class="goods-name" :title="item.name">{{ item.name || "-" }}</div>
                  <div class="goods-price">
                    {{ formatPrice(item.goodsPrice) }}
                    <span v-if="item.num">x{{ item.num }}</span>
                  </div>
                </div>
              </div>
            </div>
            <div class="col-source">
              <span class="status-dot" :class="clientTypeDotClass(order.clientType)" />
              {{ clientTypeText(order.clientType) }}
            </div>
            <div class="col-store">
              <span class="link-text">{{ order.storeName || "-" }}</span>
            </div>
            <div class="col-price">{{ formatPrice(order.flowPrice) }}</div>
            <div class="col-member-id">{{ order.memberId || "-" }}</div>
            <div class="col-member">
              <div class="link-text">{{ order.memberName || "-" }}</div>
            </div>
            <div class="col-promo">
              <span class="status-dot success" />
              {{ orderPromotionText(order.orderPromotionType) }}
            </div>
            <div class="col-status">
              <span class="status-dot" :class="orderStatusDotClass(order.orderStatus)" />
              {{ orderStatusText(order.orderStatus) }}
            </div>
          </div>
        </div>
      </template>
      <el-empty v-else :image-size="48" description="暂无购买记录" />
    </div>

    <div class="records-pager">
      <el-pagination
        v-model:current-page="pagination.pageNumber"
        v-model:page-size="pagination.pageSize"
        :page-sizes="[5, 10, 20]"
        :total="pagination.total"
        layout="total, sizes, prev, pager, next"
        size="small"
        @current-change="loadData"
        @size-change="onPageSizeChange"
      />
    </div>
  </div>
</template>

<script>
import { DocumentCopy } from "@element-plus/icons-vue";
import { queryLiveOrderPage } from "@/api/live";

export default {
  name: "LivePurchaseRecords",
  components: { DocumentCopy },
  props: {
    liveId: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      loading: false,
      orderList: [],
      pagination: {
        pageNumber: 1,
        pageSize: 5,
        total: 0,
      },
    };
  },
  watch: {
    liveId() {
      this.pagination.pageNumber = 1;
      this.loadData();
    },
  },
  mounted() {
    this.loadData();
  },
  methods: {
    refresh() {
      this.loadData();
    },
    formatTime(time) {
      if (!time) return "-";
      if (typeof time === "string" && time.includes("-")) return time;
      const ts = typeof time === "number" ? (time > 1e12 ? time / 1000 : time) : time;
      return this.$filters.unixToDate(ts);
    },
    formatPrice(val) {
      return this.$filters.unitPrice(val, "￥");
    },
    getOrderItems(order) {
      if (order.orderItems?.length) return order.orderItems;
      if (order.groupGoodsId) {
        return [
          {
            image: order.groupImages,
            name: order.groupName,
            goodsPrice: order.groupGoodsPrice,
            num: order.groupNum,
          },
        ];
      }
      return [];
    },
    clientTypeText(v) {
      const map = { H5: "移动端", PC: "PC端", WECHAT_MP: "小程序端", APP: "移动应用端" };
      return map[v] || v || "-";
    },
    clientTypeDotClass(v) {
      const map = { H5: "warning", PC: "primary", WECHAT_MP: "success", APP: "info" };
      return map[v] || "info";
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
        CANCELLED: "已取消",
      };
      return map[v] || v || "-";
    },
    orderStatusDotClass(v) {
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
    copySn(sn) {
      if (!sn) return;
      navigator.clipboard.writeText(sn);
      this.$Message.success("订单编号已复制");
    },
    onPageSizeChange() {
      this.pagination.pageNumber = 1;
      this.loadData();
    },
    loadData() {
      if (!this.liveId) return;
      this.loading = true;
      queryLiveOrderPage({
        liveRoomId: this.liveId,
        pageNumber: this.pagination.pageNumber,
        pageSize: this.pagination.pageSize,
      })
        .then((res) => {
          this.loading = false;
          if (res.success) {
            this.orderList = res.result?.records || [];
            this.pagination.total = res.result?.total || 0;
          }
        })
        .catch(() => {
          this.loading = false;
        });
    },
  },
};
</script>

<style lang="scss" scoped>
.live-purchase-records {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
}

.records-scroll {
  flex: 1;
  min-height: 0;
  overflow: auto;
}

.order-table-head,
.order-block-body {
  display: grid;
  grid-template-columns: minmax(220px, 2fr) 90px 100px 90px 120px 110px 100px 90px;
  min-width: 920px;
  align-items: center;
}

.order-table-head {
  padding: 8px 12px;
  background: #fafafa;
  border: 1px solid #ebeef5;
  border-bottom: none;
  font-size: 12px;
  color: #909399;
}

.order-block {
  border: 1px solid #ebeef5;
  border-top: none;

  &:first-of-type {
    border-top: 1px solid #ebeef5;
  }
}

.order-block-head {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  padding: 8px 12px;
  background: #f5f7fa;
  border-bottom: 1px solid #ebeef5;
  font-size: 12px;
  color: #606266;
}

.order-sn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.copy-icon {
  cursor: pointer;
  color: #909399;

  &:hover {
    color: $theme_color;
  }
}

.order-block-body {
  padding: 8px 12px;
  font-size: 12px;
  color: #303133;
}

.col-goods {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.goods-item {
  display: flex;
  gap: 8px;
  align-items: flex-start;
}

.goods-img,
.goods-img-fallback {
  width: 48px;
  height: 48px;
  flex-shrink: 0;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  background: #f5f7fa;
}

.goods-info {
  min-width: 0;
  flex: 1;
}

.goods-name {
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.goods-price {
  margin-top: 4px;
  color: #606266;
}

.col-source,
.col-store,
.col-price,
.col-member-id,
.col-member,
.col-promo,
.col-status {
  padding: 0 4px;
  word-break: break-all;
}

.col-price {
  font-weight: 600;
}

.link-text {
  color: #409eff;
  cursor: default;
}

.status-dot {
  display: inline-block;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  margin-right: 4px;
  vertical-align: middle;
  background: #909399;

  &.primary {
    background: #409eff;
  }
  &.success {
    background: #67c23a;
  }
  &.warning {
    background: #e6a23c;
  }
  &.danger {
    background: #f56c6c;
  }
  &.info {
    background: #909399;
  }
}

.records-pager {
  flex-shrink: 0;
  display: flex;
  justify-content: flex-end;
  padding-top: 12px;
  margin-top: auto;
}
</style>
