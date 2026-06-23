<template>
  <div class="search">
    <el-card>
      <el-form
        ref="searchForm"
        :model="searchForm"
        inline
        label-width="90px"
        class="search-form mb_10"
        @keyup.enter="handleSearch"
      >
        <el-form-item label="优惠券名称" prop="couponName">
          <el-input
            v-model="searchForm.couponName"
            placeholder="请输入优惠券名称"
            clearable
            style="width: 240px"
          />
        </el-form-item>
        <el-form-item label="获取方式" prop="getType">
          <el-select v-model="searchForm.getType" placeholder="请选择" clearable style="width: 240px">
            <el-option label="免费获取" value="FREE" />
            <el-option label="活动获取" value="ACTIVITY" />
          </el-select>
        </el-form-item>
        <el-form-item label="活动状态" prop="promotionStatus">
          <el-select
            v-model="searchForm.promotionStatus"
            placeholder="请选择"
            clearable
            style="width: 240px"
          >
            <el-option label="未开始" value="NEW" />
            <el-option label="已开始/上架" value="START" />
            <el-option label="已结束/下架" value="END" />
            <el-option label="紧急关闭/作废" value="CLOSE" />
          </el-select>
        </el-form-item>
        <el-form-item label="活动时间">
          <el-date-picker
            v-model="selectDate"
            type="daterange"
            clearable
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            style="width: 240px"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" class="search-btn" @click="handleSearch">搜索</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card>
      <div class="operation padding-row" v-if="getType !== 'ACTIVITY'">
        <el-button type="primary" @click="add">添加优惠券</el-button>
        <el-button @click="delAll">批量关闭</el-button>
        <el-button type="warning" @click="receivePage()">优惠券领取记录</el-button>
      </div>

      <el-table
        ref="table"
        v-loading="loading"
        border
        :data="data"
        class="mt_10"
        style="width: 100%"
        row-key="id"
        @selection-change="changeSelect"
      >
        <el-table-column type="selection" width="52" align="center" />
        <el-table-column prop="couponName" label="优惠券名称" min-width="180" show-overflow-tooltip />
        <el-table-column label="面额/折扣" width="150">
          <template #default="{ row }">
            <span v-if="row">
              <span v-if="row.price" :style="{ color: $mainColor }">
                {{ $filters.unitPrice(row.price, "￥") }}</span>
              <span v-else>{{ row.couponDiscount }}折</span>
            </span>
          </template>
        </el-table-column>
        <el-table-column label="已领取数量/总数量" width="180">
          <template #default="{ row }">
            <span v-if="row">
              {{ row.receivedNum }}/{{ row.publishNum === 0 ? "不限制" : row.publishNum }}</span>
          </template>
        </el-table-column>
        <el-table-column label="已被使用的数量/已领取数量" width="200">
          <template #default="{ row }">
            <span v-if="row">{{ row.usedNum }}/{{ row.receivedNum }}</span>
          </template>
        </el-table-column>
        <el-table-column label="获取方式" width="120">
          <template #default="{ row }">
            <el-tag v-if="row" :type="getTypeTagType(row.getType)">{{ getTypeText(row.getType) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="优惠券类型" width="120">
          <template #default="{ row }">
            <el-tag v-if="row" :type="couponTypeTagType(row.couponType)">
              {{ couponTypeText(row.couponType) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="品类描述" width="120">
          <template #default="{ row }">
            <el-tag v-if="row" :type="scopeTypeTagType(row.scopeType)">
              {{ scopeTypeText(row.scopeType) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="活动时间" width="200">
          <template #default="{ row }">
            <div v-if="row" class="activity-time" v-html="formatActivityTime(row)"></div>
          </template>
        </el-table-column>
        <el-table-column
          v-if="showStatusColumn"
          label="状态"
          width="100"
          align="center"
          fixed="right"
        >
          <template #default="{ row }">
            <el-tag v-if="row" :type="promotionStatusTagType(row.promotionStatus)">
              {{ promotionStatusText(row.promotionStatus) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          v-if="showActionColumn"
          label="操作"
          width="250"
          align="center"
          fixed="right"
        >
          <template #default="{ row }">
            <template v-if="row">
              <a
                v-if="row.promotionStatus === 'CLOSE' || row.promotionStatus === 'NEW'"
                class="link-text"
                @click="see(row)"
              >
                编辑
              </a>
              <a v-else class="link-text" @click="see(row, 'onlyView')">查看</a>
              <span
                v-if="row.promotionStatus === 'START' || row.promotionStatus === 'NEW'"
                class="op-split"
              >
                |
              </span>
              <a
                v-if="row.promotionStatus === 'START' || row.promotionStatus === 'NEW'"
                class="link-text"
                @click="close(row)"
              >
                关闭
              </a>
              <span class="op-split">|</span>
              <a class="link-text" @click="receivePage(row.id)">领取记录</a>
            </template>
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
import {
  getShopCouponList,
  updateCouponStatus,
  deleteShopCoupon,
} from "@/api/promotion";
import { formatPromotionCouponValidityHtml } from "@/utils/promotions";

export default {
  name: "coupon",
  props: {
    getType: {
      type: String,
      default: "",
    },
    promotionStatus: {
      type: String,
      default: "",
    },
    selectedList: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      loading: true,
      searchForm: {
        pageNumber: 1,
        pageSize: 20,
        sort: "create_time",
        order: "desc",
        getType: "",
      },
      selectList: [],
      selectCount: 0,
      data: [],
      total: 0,
      selectDate: [],
      showActionColumn: true,
      showStatusColumn: true,
      isSyncingSelection: false,
    };
  },
  watch: {
    $route(to) {
      if (to.fullPath == "/promotions/manager-coupon") {
        this.init();
      }
    },
    selectedList: {
      handler(val) {
        if (this.isSyncingSelection) return;
        if (this.isSameSelection(val, this.selectList)) return;
        this.$nextTick(() => {
          this.syncTableSelection(val);
        });
      },
      deep: true,
    },
  },
  methods: {
    formatActivityTime(row) {
      return formatPromotionCouponValidityHtml(row);
    },
    promotionStatusText(status) {
      const map = {
        NEW: "未开始",
        START: "已开始",
        END: "已结束",
        CLOSE: "已关闭",
      };
      return map[status] || "未知";
    },
    promotionStatusTagType(status) {
      const map = {
        NEW: "info",
        START: "success",
        END: "danger",
        CLOSE: "danger",
      };
      return map[status] || "danger";
    },
    scopeTypeText(type) {
      const map = {
        ALL: "全品类",
        PORTION_GOODS_CATEGORY: "商品分类",
        PORTION_SHOP_CATEGORY: "店铺分类",
        PORTION_GOODS: "指定商品",
      };
      return map[type] || "未知";
    },
    scopeTypeTagType(type) {
      const map = {
        ALL: "info",
        PORTION_GOODS_CATEGORY: "warning",
        PORTION_SHOP_CATEGORY: "warning",
        PORTION_GOODS: "primary",
      };
      return map[type] || "danger";
    },
    getTypeText(type) {
      const map = {
        FREE: "免费获取",
        ACTIVITY: "活动获取",
        INSIDE: "内购",
        IGAME: "游戏人生",
      };
      return map[type] || "未知";
    },
    getTypeTagType(type) {
      const map = {
        FREE: "danger",
        ACTIVITY: "warning",
        INSIDE: "success",
        IGAME: "success",
      };
      return map[type] || "";
    },
    couponTypeText(type) {
      const map = {
        DISCOUNT: "打折",
        PRICE: "减免现金",
      };
      return map[type] || "未知";
    },
    couponTypeTagType(type) {
      const map = {
        DISCOUNT: "primary",
        PRICE: "info",
      };
      return map[type] || "";
    },
    isSameSelection(next, current) {
      const a = next || [];
      const b = current || [];
      if (a.length !== b.length) return false;
      const nextIds = a.map((item) => item.id).sort().join(",");
      const currentIds = b.map((item) => item.id).sort().join(",");
      return nextIds === currentIds;
    },
    syncTableSelection(selected) {
      const table = this.$refs.table;
      if (!table) return;
      const nextList = selected ? [...selected] : [];
      this.isSyncingSelection = true;
      table.clearSelection();
      if (nextList.length) {
        this.data.forEach((row) => {
          if (nextList.some((item) => item.id === row.id)) {
            table.toggleRowSelection(row, true);
          }
        });
      }
      this.selectList = nextList;
      this.selectCount = nextList.length;
      this.$nextTick(() => {
        this.isSyncingSelection = false;
      });
    },
    check() {
      this.$emit("selected", this.selectList);
    },
    receivePage(id) {
      if (id) {
        this.$router.push({ name: "coupon-receive", query: { couponId: id } });
      } else {
        this.$router.push({ name: "coupon-receive" });
      }
    },
    init() {
      this.getDataList();
    },
    add() {
      this.$router.push({ name: "add-coupon" });
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
    clearSelectAll() {
      this.$refs.table?.clearSelection();
    },
    changeSelect(e) {
      if (this.isSyncingSelection) return;
      this.selectList = e;
      this.selectCount = e.length;
      if (this.getType === "ACTIVITY") this.check();
    },
    getDataList() {
      this.loading = true;
      if (this.selectDate && this.selectDate[0] && this.selectDate[1]) {
        this.searchForm.startTime = new Date(this.selectDate[0]).getTime();
        this.searchForm.endTime = new Date(this.selectDate[1]).getTime();
      } else {
        this.searchForm.startTime = null;
        this.searchForm.endTime = null;
      }
      getShopCouponList(this.searchForm)
        .then((res) => {
          if (res.success) {
            this.data = res.result.records;
            this.total = res.result.total;
            this.$nextTick(() => {
              if (this.selectedList.length) {
                this.syncTableSelection(this.selectedList);
              }
            });
          }
        })
        .finally(() => {
          this.loading = false;
        });
    },
    see(v, only) {
      const data = only ? { onlyView: true, id: v.id } : { id: v.id };
      this.$router.push({ name: "add-coupon", query: data });
    },
    close(v) {
      this.$Modal.confirm({
        title: "确认关闭",
        content: "确认要关闭此优惠券么?",
        loading: true,
        onOk: () => {
          updateCouponStatus({
            couponIds: v.id,
            effectiveDays: 0,
          })
            .then((res) => {
              this.$Modal.remove();
              if (res.success) {
                this.$Message.success("优惠券已关闭");
                this.getDataList();
              }
            })
            .catch(() => {
              this.$Modal.remove();
            });
        },
      });
    },
    remove(v) {
      this.$Modal.confirm({
        title: "确认删除",
        content: "确认要删除此优惠券么?",
        loading: true,
        onOk: () => {
          deleteShopCoupon(v.id)
            .then((res) => {
              this.$Modal.remove();
              if (res.success) {
                this.$Message.success("优惠券已删除");
                this.getDataList();
              }
            })
            .catch(() => {
              this.$Modal.remove();
            });
        },
      });
    },
    delAll() {
      if (this.selectCount <= 0) {
        this.$Message.warning("您还未选择要下架的优惠券");
        return;
      }
      this.$Modal.confirm({
        title: "确认下架",
        content: "您确认要下架所选的 " + this.selectCount + " 条数据?",
        loading: true,
        onOk: () => {
          const ids = this.selectList.map((e) => e.id);
          updateCouponStatus({
            couponIds: ids.toString(),
            promotionStatus: "CLOSE",
          }).then((res) => {
            this.$Modal.remove();
            if (res.success) {
              this.$Message.success("下架成功");
              this.clearSelectAll();
              this.getDataList();
            }
          });
        },
      });
    },
  },
  mounted() {
    if (this.getType) {
      this.searchForm.getType = this.getType;
      this.showActionColumn = false;
    }
    if (this.promotionStatus) {
      this.searchForm.promotionStatus = this.promotionStatus;
      this.showStatusColumn = false;
    }
    this.init();
  },
};
</script>

<style scoped>
.link-text {
  color: #409eff;
  cursor: pointer;
  text-decoration: none;
}
.op-split {
  margin: 0 8px;
  color: #dcdee2;
}
.activity-time {
  line-height: 1.5;
  word-break: break-all;
}
.mb_10 {
  margin-bottom: 10px;
}
.mt_10 {
  margin-top: 10px;
}
.padding-row {
  margin-bottom: 10px;
}
</style>
