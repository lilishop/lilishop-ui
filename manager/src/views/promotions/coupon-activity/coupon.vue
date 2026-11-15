<template>
  <div class="search">
    <el-card>
      <div class="operation padding-row">
        <el-button type="primary" plain @click="addRegistered">注册赠券</el-button>
        <el-button type="primary" plain @click="addSpecify">精准发券</el-button>
        <el-button type="primary" plain @click="addAutoCoupon">自动赠券</el-button>
        <el-button type="success" plain @click="addCouponPackage">创建券礼包</el-button>
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
              <template v-if="row.couponActivityType === 'COUPON_PACKAGE'">
                <span class="op-split">|</span>
                <a class="link-text" @click="openQrCode(row)">推广码</a>
              </template>
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
          <!-- 推广二维码弹窗 -->
      <el-dialog v-model="qrCodeDialogVisible" title="券礼包推广码" width="min(600px, 95vw)" align-center>
        <div style="text-align: center; padding: 10px 0;">
          <div v-if="qrCodeLoading" style="padding: 30px 0;">
            <div style="color: #999;">正在生成推广二维码...</div>
          </div>
          <div v-else-if="qrCodeInfo.qrCodeBase64">
            <div class="promotion-code-grid">
              <div>
                <div class="promotion-code-title">H5 二维码</div>
                <img :src="qrCodeInfo.qrCodeBase64" alt="H5推广二维码" class="promotion-code-image" />
              </div>
              <div>
                <div class="promotion-code-title">微信小程序葵花码</div>
                <img v-if="qrCodeInfo.miniProgramCodeBase64" :src="qrCodeInfo.miniProgramCodeBase64" alt="微信小程序葵花码" class="promotion-code-image" />
                <div v-else class="promotion-code-error">
                  <p>{{ qrCodeInfo.miniProgramCodeError || '暂未生成葵花码，请更新后端服务后重试' }}</p>
                  <el-button @click="openQrCode({ id: qrCodeInfo.activityId })">重新生成</el-button>
                </div>
              </div>
            </div>
            <div style="margin-top: 15px; font-size: 13px; color: #555; word-break: break-all; text-align: left; background: #f8f9fa; padding: 10px; border-radius: 6px;">
              <div style="font-weight: bold; margin-bottom: 4px;">H5 访问链接：</div>
              <div style="color: #409eff;">{{ qrCodeInfo.h5Url }}</div>
            </div>
            <el-button type="primary" style="margin-top: 15px; width: 100%;" @click="copyH5Url">复制 H5 访问链接</el-button>
          </div>
        </div>
      </el-dialog>
    </el-card>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref } from "vue";
import { useRouter } from "vue-router";
import { getCouponActivityList, closeActivity, getCouponPackageQrCode } from "@/api/promotion";
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
    COUPON_PACKAGE: "优惠券礼包",
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
const qrCodeDialogVisible = ref(false);
const qrCodeLoading = ref(false);
let qrCodeRequestId = 0;
const qrCodeInfo = reactive({
  activityId: "",
  h5Url: "",
  qrCodeBase64: "",
  miniProgramCodeBase64: "",
  miniProgramCodeError: "",
});

function addCouponPackage() {
  router.push({
    name: "add-coupon-activity",
    query: { couponActivityType: "COUPON_PACKAGE" },
  });
}

/** 生成当前礼包的H5二维码及葵花码，忽略切换礼包前的旧请求结果。 */
function openQrCode(row) {
  qrCodeDialogVisible.value = true;
  qrCodeLoading.value = true;
  qrCodeInfo.activityId = row.id;
  qrCodeInfo.h5Url = "";
  qrCodeInfo.qrCodeBase64 = "";
  qrCodeInfo.miniProgramCodeBase64 = "";
  qrCodeInfo.miniProgramCodeError = "";

  const requestId = ++qrCodeRequestId;
  getCouponPackageQrCode(row.id)
    .then((res) => {
      if (requestId !== qrCodeRequestId) return;
      if (res.success && res.result) {
        qrCodeInfo.h5Url = res.result.h5Url;
        qrCodeInfo.qrCodeBase64 = res.result.qrCodeBase64;
        qrCodeInfo.miniProgramCodeBase64 = res.result.miniProgramCodeBase64 || "";
        qrCodeInfo.miniProgramCodeError = res.result.miniProgramCodeError || "";
      } else {
        Message.error(res.message || "生成推广二维码失败");
      }
    })
    .catch(() => {
      if (requestId !== qrCodeRequestId) return;
      Message.error("获取二维码异常");
    })
    .finally(() => {
      if (requestId !== qrCodeRequestId) return;
      qrCodeLoading.value = false;
    });
}

function copyH5Url() {
  if (!qrCodeInfo.h5Url) return;
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(qrCodeInfo.h5Url).then(() => {
      Message.success("H5 访问链接已复制到剪贴板！");
    });
  } else {
    Message.success("链接：" + qrCodeInfo.h5Url);
  }
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
.promotion-code-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 20px;
}
.promotion-code-title {
  margin-bottom: 12px;
}
.promotion-code-image {
  width: 220px;
  height: 220px;
}
.promotion-code-error {
  max-width: 240px;
  margin: 0 auto;
  line-height: 1.6;
}
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
