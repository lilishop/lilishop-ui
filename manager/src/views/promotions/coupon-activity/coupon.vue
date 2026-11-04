<template>
  <div class="search">
    <el-card>
      <div class="operation padding-row">
        <el-button type="primary" plain @click="addRegistered">注册赠券</el-button>
        <el-button type="primary" plain @click="addSpecify">精准发券</el-button>
        <el-button type="primary" plain @click="addAutoCoupon">自动赠券</el-button>
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

<script setup>
import { onMounted, reactive, ref } from "vue";
import { useRouter } from "vue-router";
import { getCouponActivityList, closeActivity } from "@/api/promotion";
import { Message, Modal } from "@/utils/message";

defineOptions({ name: "coupon-activity" });

defineProps({
  checked: {
    type: Boolean,
    default: false,
  },
});

const router = useRouter();

const loading = ref(true);
const searchForm = reactive({
  pageNumber: 1,
  pageSize: 20,
  sort: "createTime",
  order: "desc",
});
const data = ref([]);
const total = ref(0);
const selectDate = ref([]);

function activityTypeText(type) {
  const map = {
    REGISTERED: "注册赠券",
    AUTO_COUPON: "自动发券",
  };
  return map[type] || "精准发券";
}
function activityScopeText(scope) {
  return scope === "DESIGNATED" ? "指定会员" : "全部会员";
}
function couponFrequencyText(freq) {
  const map = {
    DAY: "每日",
    WEEK: "每周",
    MONTH: "每月",
  };
  return map[freq] || "/";
}
function formatActivityTime(row) {
  if (row.startTime && row.endTime) {
    return `${row.startTime}<br/>${row.endTime}`;
  }
  return "/";
}
function promotionStatusText(status) {
  const map = {
    NEW: "未开始",
    START: "已开始",
    END: "已结束",
    CLOSE: "已关闭",
  };
  return map[status] || "未知";
}
function promotionStatusTagType(status) {
  const map = {
    NEW: "info",
    START: "success",
    END: "danger",
    CLOSE: "danger",
  };
  return map[status] || "danger";
}
function init() {
  getDataList();
}
function addRegistered() {
  router.push({
    name: "add-coupon-activity",
    query: { couponActivityType: "REGISTERED" },
  });
}
function addSpecify() {
  router.push({
    name: "add-coupon-activity",
    query: { couponActivityType: "SPECIFY" },
  });
}
function addAutoCoupon() {
  router.push({
    name: "add-coupon-activity",
    query: { couponActivityType: "AUTO_COUPON" },
  });
}
function info(v) {
  router.push({ name: "coupon-activity-info", query: { id: v.id } });
}
function changePage(v) {
  searchForm.pageNumber = v;
  getDataList();
}
function changePageSize(v) {
  searchForm.pageNumber = 1;
  searchForm.pageSize = v;
  getDataList();
}
function handleSearch() {
  searchForm.pageNumber = 1;
  searchForm.pageSize = 20;
  getDataList();
}
function getDataList() {
  loading.value = true;
  if (selectDate.value && selectDate.value[0] && selectDate.value[1]) {
    searchForm.startTime = new Date(selectDate.value[0]).getTime();
    searchForm.endTime = new Date(selectDate.value[1]).getTime();
  } else {
    searchForm.startTime = null;
    searchForm.endTime = null;
  }
  getCouponActivityList(searchForm)
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
function edit(v) {
  router.push({ name: "edit-platform-coupon", query: { id: v.id } });
}
function remove(v) {
  Modal.confirm({
    title: "确认关闭",
    content: "确认要关闭此优惠券活动么?关闭活动只能重新创建",
    loading: true,
    onOk: () => {
      closeActivity(v.id)
        .then((res) => {
          if (res.success) {
            Message.success("优惠券活动已关闭");
            getDataList();
          }
          Modal.remove();
        })
        .catch(() => {
          Modal.remove();
        });
    },
  });
}

onMounted(() => {
  init();
});
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
