<template>
  <div class="live-coupon">
    <div class="toolbar">
      <el-button type="primary" @click="openCouponSelector">添加优惠券</el-button>
      <el-button type="danger" :disabled="!selectedIds.length" @click="handleBatchRemove">
        批量移除
      </el-button>
    </div>

    <el-table
      ref="table"
      v-loading="loading"
      border
      :data="couponList"
      row-key="id"
      style="width: 100%"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="52" align="center" />
      <el-table-column prop="couponName" label="优惠券名称" min-width="200" show-overflow-tooltip />
      <el-table-column label="面额" width="120">
        <template #default="{ row }">{{ formatPrice(row.couponPrice) }}</template>
      </el-table-column>
      <el-table-column label="推荐" width="90">
        <template #default="{ row }">
          <el-tag :type="row.recommend ? 'success' : 'info'">
            {{ row.recommend ? "是" : "否" }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="200" fixed="right" align="center">
        <template #default="{ row }">
          <a v-if="!row.recommend" class="link-text" @click="handleRecommend(row)">推荐</a>
          <a v-else class="link-text" @click="handleCancelRecommend(row)">取消推荐</a>
          <span class="op-split">|</span>
          <a class="link-text" @click="handleRemove(row)">移除</a>
        </template>
      </el-table-column>
    </el-table>

    <el-empty v-if="!loading && !couponList.length" description="暂无直播优惠券" />

    <el-dialog v-model="pickerVisible" title="选择优惠券" width="800px" append-to-body destroy-on-close>
      <el-form inline class="mb_10">
        <el-form-item label="优惠券名称">
          <el-input
            v-model="pickerSearch.couponName"
            placeholder="请输入优惠券名称"
            clearable
            style="width: 200px"
            @keyup.enter="loadPickerCoupons"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="loadPickerCoupons">搜索</el-button>
        </el-form-item>
      </el-form>
      <el-table
        ref="pickerTable"
        v-loading="pickerLoading"
        border
        :data="pickerList"
        row-key="id"
        max-height="400"
        @selection-change="handlePickerSelectionChange"
      >
        <el-table-column type="selection" width="52" align="center" />
        <el-table-column prop="couponName" label="优惠券名称" min-width="160" show-overflow-tooltip />
        <el-table-column label="面额/折扣" width="120">
          <template #default="{ row }">
            <span v-if="row.price">{{ formatPrice(row.price) }}</span>
            <span v-else>{{ row.couponDiscount }}折</span>
          </template>
        </el-table-column>
        <el-table-column label="已领取/总量" width="140">
          <template #default="{ row }">
            {{ row.receivedNum }}/{{ row.publishNum === 0 ? "不限制" : row.publishNum }}
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="promotionStatusTagType(row.promotionStatus)">
              {{ promotionStatusText(row.promotionStatus) }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>
      <div class="mt_10" style="display: flex; justify-content: flex-end">
        <el-pagination
          v-model:current-page="pickerSearch.pageNumber"
          v-model:page-size="pickerSearch.pageSize"
          :page-sizes="[10, 20, 50]"
          :total="pickerTotal"
          layout="total, prev, pager, next"
          size="small"
          @current-change="loadPickerCoupons"
          @size-change="onPickerPageSizeChange"
        />
      </div>
      <template #footer>
        <el-button @click="pickerVisible = false">取消</el-button>
        <el-button type="primary" :loading="pickerSubmitting" @click="confirmPicker">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import {
  cancelRecommendLiveCoupon,
  getLiveCouponList,
  removeBatchLiveCoupon,
  saveBatchLiveCoupon,
  setRecommendLiveCoupon,
} from "@/api/live";
import { getPlatformCouponList } from "@/api/promotion";

export default {
  name: "LiveCoupon",
  props: {
    liveId: {
      type: String,
      required: true,
    },
    liveRoomName: {
      type: String,
      default: "",
    },
  },
  data() {
    return {
      loading: false,
      couponList: [],
      selectedIds: [],
      pickerVisible: false,
      pickerLoading: false,
      pickerSubmitting: false,
      pickerList: [],
      pickerTotal: 0,
      pickerSelected: [],
      pickerSearch: {
        pageNumber: 1,
        pageSize: 10,
        couponName: "",
        promotionStatus: "START",
        sort: "create_time",
        order: "desc",
      },
    };
  },
  watch: {
    liveId() {
      this.loadCoupons();
    },
  },
  mounted() {
    this.loadCoupons();
  },
  methods: {
    formatPrice(price) {
      return this.$filters.unitPrice(price, "￥");
    },
    promotionStatusText(status) {
      const map = { NEW: "未开始", START: "已开始", END: "已结束", CLOSE: "已关闭" };
      return map[status] || "未知";
    },
    promotionStatusTagType(status) {
      const map = { NEW: "info", START: "success", END: "warning", CLOSE: "danger" };
      return map[status] || "info";
    },
    loadCoupons() {
      if (!this.liveId) return;
      this.loading = true;
      getLiveCouponList(this.liveId)
        .then((res) => {
          this.loading = false;
          if (res.success) {
            this.couponList = res.result || [];
          }
        })
        .catch(() => {
          this.loading = false;
        });
    },
    handleSelectionChange(rows) {
      this.selectedIds = (rows || []).map((r) => r.id);
    },
    openCouponSelector() {
      this.pickerVisible = true;
      this.pickerSelected = [];
      this.pickerSearch.pageNumber = 1;
      this.loadPickerCoupons();
    },
    loadPickerCoupons() {
      this.pickerLoading = true;
      getPlatformCouponList(this.pickerSearch)
        .then((res) => {
          this.pickerLoading = false;
          if (res.success) {
            this.pickerList = res.result?.records || [];
            this.pickerTotal = res.result?.total || 0;
          }
        })
        .catch(() => {
          this.pickerLoading = false;
        });
    },
    onPickerPageSizeChange() {
      this.pickerSearch.pageNumber = 1;
      this.loadPickerCoupons();
    },
    handlePickerSelectionChange(rows) {
      this.pickerSelected = rows || [];
    },
    buildLiveCouponPayload(item) {
      return {
        couponId: item.id,
        couponPrice: Number(item.price ?? 0),
        couponName: item.couponName || "",
        liveRoomId: this.liveId,
        liveRoomName: this.liveRoomName || "",
        hideFlag: false,
        recommend: false,
      };
    },
    confirmPicker() {
      if (!this.pickerSelected.length) {
        this.$Message.warning("请选择优惠券");
        return;
      }
      const existingCouponIds = new Set(this.couponList.map((c) => String(c.couponId)));
      const payload = this.pickerSelected
        .filter((item) => !existingCouponIds.has(String(item.id)))
        .map((item) => this.buildLiveCouponPayload(item));
      if (!payload.length) {
        this.$Message.warning("所选优惠券均已添加");
        return;
      }
      this.pickerSubmitting = true;
      saveBatchLiveCoupon(payload)
        .then((res) => {
          this.pickerSubmitting = false;
          if (res.success) {
            this.$Message.success("添加成功");
            this.pickerVisible = false;
            this.loadCoupons();
          }
        })
        .catch(() => {
          this.pickerSubmitting = false;
        });
    },
    handleRemove(record) {
      this.$Modal.confirm({
        title: "确认移除",
        content: "确定要移除该优惠券吗？",
        onOk: () => {
          return removeBatchLiveCoupon([record.id]).then((res) => {
            if (res.success) {
              this.$Message.success("移除成功");
              this.loadCoupons();
            }
          });
        },
      });
    },
    handleBatchRemove() {
      this.$Modal.confirm({
        title: "确认批量移除",
        content: `确定要移除选中的 ${this.selectedIds.length} 个优惠券吗？`,
        onOk: () => {
          return removeBatchLiveCoupon(this.selectedIds).then((res) => {
            if (res.success) {
              this.$Message.success("移除成功");
              this.selectedIds = [];
              this.loadCoupons();
            }
          });
        },
      });
    },
    handleRecommend(record) {
      setRecommendLiveCoupon(record.id).then((res) => {
        if (res.success) {
          this.$Message.success("已设为推荐");
          this.loadCoupons();
        }
      });
    },
    handleCancelRecommend(record) {
      cancelRecommendLiveCoupon(record.id).then((res) => {
        if (res.success) {
          this.$Message.success("已取消推荐");
          this.loadCoupons();
        }
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.toolbar {
  margin-bottom: 12px;
}
</style>
