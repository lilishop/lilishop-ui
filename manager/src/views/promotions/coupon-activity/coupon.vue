<template>
  <div class="search">
    <el-card>
      <div class="operation padding-row">
        <el-button type="primary" @click="add">添加活动</el-button>
      </div>

      <el-table
        ref="table"
        v-loading="loading"
        border
        :data="data"
        class="mt_10"
        style="width: 100%"
      >
        <el-table-column prop="promotionName" label="活动名称" min-width="140" show-overflow-tooltip />
        <el-table-column label="活动类型" min-width="120">
          <template #default="{ row }">
            <span v-if="row">{{ activityTypeText(row.couponActivityType) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="活动范围" min-width="120">
          <template #default="{ row }">
            <span v-if="row">{{ activityScopeText(row.activityScope) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="领取频率" min-width="120">
          <template #default="{ row }">
            <span v-if="row">{{ couponFrequencyText(row.couponFrequencyEnum) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="活动时间" min-width="160">
          <template #default="{ row }">
            <div v-if="row" class="activity-time" v-html="formatActivityTime(row)"></div>
          </template>
        </el-table-column>
        <el-table-column label="状态" min-width="100" fixed="right" align="center">
          <template #default="{ row }">
            <el-tag v-if="row" :type="promotionStatusTagType(row.promotionStatus)">
              {{ promotionStatusText(row.promotionStatus) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" min-width="120" align="center" fixed="right">
          <template #default="{ row }">
            <template v-if="row">
              <a class="link-text" @click="info(row)">查看</a>
              <template
                v-if="(!checked && row.promotionStatus === 'START') || row.promotionStatus === 'NEW'"
              >
                <span class="op-split">|</span>
                <a class="link-text" @click="remove(row)">关闭</a>
              </template>
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
import { getCouponActivityList, closeActivity } from "@/api/promotion";

export default {
  name: "coupon-activity",
  props: {
    checked: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      loading: true,
      searchForm: {
        pageNumber: 1,
        pageSize: 20,
        sort: "createTime",
        order: "desc",
      },
      data: [],
      total: 0,
      selectDate: [],
    };
  },
  methods: {
    activityTypeText(type) {
      const map = {
        REGISTERED: "注册赠券",
        AUTO_COUPON: "自动发券",
      };
      return map[type] || "精确发券";
    },
    activityScopeText(scope) {
      return scope === "DESIGNATED" ? "指定会员" : "全部会员";
    },
    couponFrequencyText(freq) {
      const map = {
        DAY: "每日",
        WEEK: "每周",
        MONTH: "每月",
      };
      return map[freq] || "/";
    },
    formatActivityTime(row) {
      if (row.startTime && row.endTime) {
        return `${row.startTime}<br/>${row.endTime}`;
      }
      return "/";
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
    init() {
      this.getDataList();
    },
    add() {
      this.$router.push({ name: "add-coupon-activity" });
    },
    info(v) {
      this.$router.push({ name: "coupon-activity-info", query: { id: v.id } });
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
    getDataList() {
      this.loading = true;
      if (this.selectDate && this.selectDate[0] && this.selectDate[1]) {
        this.searchForm.startTime = new Date(this.selectDate[0]).getTime();
        this.searchForm.endTime = new Date(this.selectDate[1]).getTime();
      } else {
        this.searchForm.startTime = null;
        this.searchForm.endTime = null;
      }
      getCouponActivityList(this.searchForm)
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
    edit(v) {
      this.$router.push({ name: "edit-platform-coupon", query: { id: v.id } });
    },
    remove(v) {
      this.$Modal.confirm({
        title: "确认关闭",
        content: "确认要关闭此优惠券活动么?关闭活动只能重新创建",
        loading: true,
        onOk: () => {
          closeActivity(v.id)
            .then((res) => {
              if (res.success) {
                this.$Message.success("优惠券活动已关闭");
                this.getDataList();
              }
              this.$Modal.remove();
            })
            .catch(() => {
              this.$Modal.remove();
            });
        },
      });
    },
  },
  mounted() {
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
}
.padding-row {
  margin-bottom: 10px;
}
.mt_10 {
  margin-top: 10px;
}
</style>
