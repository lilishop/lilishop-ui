<template>
  <div class="live-detail">
    <el-card v-loading="loading">
      <template #header>
        <div class="card-header">
          <span>直播详情</span>
          <el-button @click="handleBack">返回列表</el-button>
        </div>
      </template>

      <el-descriptions :column="2" border>
        <el-descriptions-item label="直播标题">{{ detail.title || "-" }}</el-descriptions-item>
        <el-descriptions-item label="直播状态">
          <el-tag :type="liveStatusTagType(liveStatus)">{{ liveStatusText(liveStatus) }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="店铺名称">
          {{ detail.storeName || detail.streamerName || "-" }}
        </el-descriptions-item>
        <el-descriptions-item label="开始时间">{{ formatTime(detail.startTime) }}</el-descriptions-item>
        <el-descriptions-item label="结束时间">{{ formatTime(detail.endTime) }}</el-descriptions-item>
        <el-descriptions-item label="推流服务器">{{ detail.pushStreamServer || "-" }}</el-descriptions-item>
        <el-descriptions-item label="推流码">{{ detail.pushStreamCode || "-" }}</el-descriptions-item>
        <el-descriptions-item label="拉流地址">
          {{ detail.pullStreamUrl || detail.streamUrl || "-" }}
        </el-descriptions-item>
        <el-descriptions-item label="直播封面" :span="2">
          <el-image
            v-if="detail.coverImg"
            :src="detail.coverImg"
            style="width: 200px"
            fit="contain"
          />
          <span v-else class="text-muted">暂无封面</span>
        </el-descriptions-item>
      </el-descriptions>

      <div class="goods-section">
        <h4>直播商品</h4>
        <LiveGoods :live-id="liveId" readonly />
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { getLiveInfo } from "@/api/live";
import { Message } from "@/utils/message";
import { unixToDate } from "@/utils/filters";
import LiveGoods from "./components/LiveGoods.vue";

defineOptions({ name: "live-detail" });

const route = useRoute();
const router = useRouter();

const loading = ref(false);
const liveId = ref("");
const detail = ref({});

const liveStatus = computed(() => {
  return detail.value.liveStatus || detail.value.status || "";
});

onMounted(() => {
  liveId.value = String(route.query.id || "");
  if (!liveId.value) {
    Message.error("缺少直播ID");
    handleBack();
    return;
  }
  loadDetail();
});

function formatTime(time) {
  if (!time) return "-";
  return unixToDate(time);
}
function liveStatusText(status) {
  const map = { NEW: "未开始", LIVING: "直播中", ENDED: "已结束" };
  return map[status] || "未知";
}
function liveStatusTagType(status) {
  const map = { NEW: "info", LIVING: "success", ENDED: "warning" };
  return map[status] || "info";
}
function loadDetail() {
  loading.value = true;
  getLiveInfo(liveId.value)
    .then((res) => {
      loading.value = false;
      if (res.success) {
        detail.value = res.result || {};
      }
    })
    .catch(() => {
      loading.value = false;
      handleBack();
    });
}
function handleBack() {
  router.push({ path: "/live-list" });
}
</script>

<style lang="scss" scoped>
.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.goods-section {
  margin-top: 24px;
  h4 {
    margin: 0 0 12px;
    font-size: 16px;
  }
}
.text-muted {
  color: #909399;
}
</style>
