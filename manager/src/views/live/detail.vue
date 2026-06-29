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

<script>
import { getLiveInfo } from "@/api/live";
import LiveGoods from "./components/LiveGoods.vue";

export default {
  name: "live-detail",
  components: { LiveGoods },
  data() {
    return {
      loading: false,
      liveId: "",
      detail: {},
    };
  },
  computed: {
    liveStatus() {
      return this.detail.liveStatus || this.detail.status || "";
    },
  },
  mounted() {
    this.liveId = String(this.$route.query.id || "");
    if (!this.liveId) {
      this.$Message.error("缺少直播ID");
      this.handleBack();
      return;
    }
    this.loadDetail();
  },
  methods: {
    formatTime(time) {
      if (!time) return "-";
      return this.$filters.unixToDate(time);
    },
    liveStatusText(status) {
      const map = { NEW: "未开始", LIVING: "直播中", ENDED: "已结束" };
      return map[status] || "未知";
    },
    liveStatusTagType(status) {
      const map = { NEW: "info", LIVING: "success", ENDED: "warning" };
      return map[status] || "info";
    },
    loadDetail() {
      this.loading = true;
      getLiveInfo(this.liveId)
        .then((res) => {
          this.loading = false;
          if (res.success) {
            this.detail = res.result || {};
          }
        })
        .catch(() => {
          this.loading = false;
          this.handleBack();
        });
    },
    handleBack() {
      this.$router.push({ path: "/live-list" });
    },
  },
};
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
