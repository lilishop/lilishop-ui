<template>
  <div class="live-control-panel" v-loading="loading">
    <div class="control-top-bar">
      <div class="control-title">
        <span class="title-text">直播中控台</span>
        <span v-if="liveDetail.title" class="title-sub">{{ liveDetail.title }}</span>
        <el-tag :type="liveStatusTagType(liveStatus)" size="small">{{ liveStatusText(liveStatus) }}</el-tag>
      </div>
      <div class="control-actions">
        <el-button v-if="liveDetail.liveStatus === 'NEW'" type="primary" @click="handleStart">
          开始直播
        </el-button>
        <el-button v-if="liveDetail.liveStatus === 'LIVING'" type="warning" @click="handleEnd">
          结束直播
        </el-button>
        <el-button @click="handleShare">复制分享链接</el-button>
        <el-button @click="refreshAll">
          <el-icon><Refresh /></el-icon>
          刷新
        </el-button>
      </div>
    </div>

    <div class="control-grid">
      <div class="col-left">
        <div class="area-preview panel-box">
          <div class="panel-head">
            <span class="panel-title">直播预览</span>
            <div class="ratio-switch">

            </div>
          </div>
          <div class="player-box" :class="aspectRatio === '16:9' ? 'ratio-169' : 'ratio-43'">
            <div v-if="showPlayerCover" class="player-cover">
              <img
                v-if="liveDetail.coverImg"
                class="cover-img"
                :src="liveDetail.coverImg"
                alt="直播封面"
              />
              <div class="cover-mask">
                <el-tag :type="liveStatusTagType(liveStatus)" size="small">{{ liveStatusText(liveStatus) }}</el-tag>
                <span v-if="liveStatus === 'NEW' && liveDetail.startTime" class="cover-tip">
                  开播：{{ formatTime(liveDetail.startTime) }}
                </span>
                <span v-else-if="liveStatus === 'PAUSED'" class="cover-tip">主播暂时离开，请稍候</span>
                <span v-else-if="liveStatus === 'ENDED'" class="cover-tip">直播已结束</span>
                <span v-else-if="liveStatus === 'LIVING' && !videoUrl" class="cover-tip">等待拉流地址...</span>
              </div>
            </div>
            <div v-if="shouldPlayStream" ref="hlsContainer" class="player-inner" />
          </div>
        </div>

        <div class="area-basic panel-box">
          <div class="panel-head">
            <span class="panel-title">基本信息</span>
          </div>
          <el-descriptions :column="1" border size="small" label-width="100px" class="basic-desc">
            <el-descriptions-item label="店铺">
              {{ liveDetail.storeName || liveDetail.streamerName || "-" }}
            </el-descriptions-item>
            <el-descriptions-item label="状态">
              <el-tag :type="liveStatusTagType(liveStatus)" size="small">
                {{ liveStatusText(liveStatus) }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="开始时间">
              {{ formatTime(liveDetail.startTime) }}
            </el-descriptions-item>
            <el-descriptions-item label="结束时间">
              {{ formatTime(liveDetail.endTime) }}
            </el-descriptions-item>
            <el-descriptions-item label="推流服务器">
              <div class="copy-field">
                <span class="copy-field-text">{{ liveDetail.pushStreamServer || "-" }}</span>
                <el-button
                  v-if="liveDetail.pushStreamServer"
                  type="primary"
                  link
                  size="small"
                  @click="copyText(liveDetail.pushStreamServer, '推流服务器')"
                >
                  <el-icon><DocumentCopy /></el-icon>
                  复制
                </el-button>
              </div>
            </el-descriptions-item>
            <el-descriptions-item label="推流码">
              <div class="copy-field">
                <span class="copy-field-text">{{ liveDetail.pushStreamCode || "-" }}</span>
                <el-button
                  v-if="liveDetail.pushStreamCode"
                  type="primary"
                  link
                  size="small"
                  @click="copyText(liveDetail.pushStreamCode, '推流码')"
                >
                  <el-icon><DocumentCopy /></el-icon>
                  复制
                </el-button>
              </div>
            </el-descriptions-item>
          </el-descriptions>
        </div>
      </div>

      <div class="col-right">
        <div class="col-right-top">
          <div class="area-chat panel-box">
            <el-tabs v-model="chatTab" class="panel-tabs fill-tabs">
              <el-tab-pane label="互动聊天" name="chat">
                <div class="tab-body chat-tab-body">
                  <LiveChatPanel
                    :live-id="liveId"
                    :live-detail="liveDetail"
                    :active="chatTab === 'chat'"
                  />
                </div>
              </el-tab-pane>
              <el-tab-pane label="在线用户" name="online">
                <div class="tab-body online-tab-body">
                  <div class="online-table-wrap">
                    <el-table v-loading="onlineLoading" :data="onlineUserList" size="small" style="width: 100%">
                      <el-table-column prop="userName" label="用户" min-width="120" show-overflow-tooltip />
                      <el-table-column label="状态" width="80">
                        <template #default="{ row }">
                          <el-tag :type="row.muteFlag ? 'danger' : 'success'" size="small">
                            {{ row.muteFlag ? "禁言" : "正常" }}
                          </el-tag>
                        </template>
                      </el-table-column>
                    </el-table>
                  </div>
                  <div class="online-pager">
                    <el-pagination
                      v-model:current-page="onlinePagination.pageNumber"
                      v-model:page-size="onlinePagination.pageSize"
                      :total="onlinePagination.total"
                      layout="total, prev, pager, next"
                      size="small"
                      @current-change="loadOnlineUsers"
                    />
                  </div>
                </div>
              </el-tab-pane>
            </el-tabs>
          </div>

          <div class="area-stats panel-box">
            <el-tabs v-model="statsTab" class="panel-tabs fill-tabs">
              <el-tab-pane label="通用数据" name="general">
                <div class="tab-body stat-tab-body">
                  <div class="data-card">
                    <div class="data-card-hero">
                      <div class="data-label">当前观看人数</div>
                      <div class="data-hero-value">{{ currentViewers }}</div>
                    </div>
                    <div class="data-grid">
                      <div class="data-item">
                        <div class="data-label">评论人数</div>
                        <div class="data-value">{{ commentPeopleNumber }}</div>
                      </div>
                      <div class="data-item">
                        <div class="data-label">互动率</div>
                        <div class="data-value">{{ interactionRate }}</div>
                      </div>
                      <div class="data-item">
                        <div class="data-label">累计观看人数</div>
                        <div class="data-value">{{ cumulativeViewers }}</div>
                      </div>
                      <div class="data-item">
                        <div class="data-label">直播时长</div>
                        <div class="data-value">{{ liveDuration }}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </el-tab-pane>
              <el-tab-pane label="电商数据" name="commerce">
                <div class="tab-body stat-tab-body">
                  <div class="data-card">
                    <div class="data-card-hero">
                      <div class="data-label">下单GMV</div>
                      <div class="data-hero-value">¥{{ formatAmount(orderStats.totalAmount) }}</div>
                    </div>
                    <div class="data-grid">
                      <div class="data-item">
                        <div class="data-label">销量</div>
                        <div class="data-value">{{ orderStats.salesVolume ?? 0 }}</div>
                      </div>
                      <div class="data-item">
                        <div class="data-label">成交人数</div>
                        <div class="data-value">{{ orderStats.dealUserCount ?? 0 }}</div>
                      </div>
                      <div class="data-item">
                        <div class="data-label">客单价</div>
                        <div class="data-value">¥{{ formatAmount(orderStats.averageOrderValue) }}</div>
                      </div>
                      <div class="data-item">
                        <div class="data-label">成交转化率</div>
                        <div class="data-value">{{ dealConversionRate }}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </el-tab-pane>
              <el-tab-pane label="购买记录" name="purchase">
                <div class="tab-body purchase-tab-body">
                  <LivePurchaseRecords ref="purchaseRecords" :live-id="liveId" />
                </div>
              </el-tab-pane>
            </el-tabs>
          </div>
        </div>

        <div class="area-manage panel-box">
          <el-tabs v-model="manageTab" class="panel-tabs fill-tabs">
            <el-tab-pane label="评论审核" name="comment">
              <div class="tab-body manage-tab-body">
                <CommentReview :live-id="liveId" embedded />
              </div>
            </el-tab-pane>
            <el-tab-pane label="直播商品" name="goods">
              <div class="tab-body manage-tab-body">
                <LiveGoods :live-id="liveId" />
              </div>
            </el-tab-pane>
            <el-tab-pane label="直播优惠券" name="coupon">
              <div class="tab-body manage-tab-body">
                <Coupon :live-id="liveId" :live-room-name="liveDetail.title" />
              </div>
            </el-tab-pane>
          </el-tabs>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref, watch } from "vue";
import { useRoute } from "vue-router";
import {
  endLive,
  getLiveInfo,
  getLiveOrderStatistics,
  liveUserList,
  startLive,
} from "@/api/live";
import config from "@/config";
import { DocumentCopy, Refresh } from "@element-plus/icons-vue";
import { Message, Modal } from "@/utils/message";
import { unixToDate } from "@/utils/filters";
import CommentReview from "./components/CommentReview.vue";
import Coupon from "./components/Coupon.vue";
import LiveChatPanel from "./components/LiveChatPanel.vue";
import LiveGoods from "./components/LiveGoods.vue";
import LivePurchaseRecords from "./components/LivePurchaseRecords.vue";

defineOptions({ name: "live-control-panel" });

const route = useRoute();

const purchaseRecords = ref(null);
const hlsContainer = ref(null);

const loading = ref(false);
const liveId = ref("");
const videoUrl = ref("");
const wapUrl = ref("");
const aspectRatio = ref("16:9");
const chatTab = ref("chat");
const statsTab = ref("general");
const manageTab = ref("comment");
const liveDetail = ref({});
const orderStats = ref({});
const onlineUserList = ref([]);
const onlineLoading = ref(false);
const onlinePagination = reactive({
  pageNumber: 1,
  pageSize: 10,
  total: 0,
});
const nowTick = ref(Date.now());
const durationTimer = ref(null);
const pollTimer = ref(null);
const hlsHttpFallbackUsed = ref(false);
const lastHlsPullUrl = ref("");

// 原 created 中直接挂到 this 上的字段（未在 data 声明），保持非响应式
let hlsInstance = null;
let hlsVideoElement = null;
let _hlsVideoClickHandler = null;

const liveStatus = computed(() => {
  return liveDetail.value.liveStatus || liveDetail.value.status || "";
});
const isLiving = computed(() => {
  return liveStatus.value === "LIVING";
});
const shouldPlayStream = computed(() => {
  return isLiving.value && !!videoUrl.value;
});
const showPlayerCover = computed(() => {
  return !shouldPlayStream.value;
});
const cumulativeViewers = computed(() => {
  return Number(liveDetail.value.actualViewNumber ?? 0);
});
const currentViewers = computed(() => {
  return cumulativeViewers.value;
});
const commentPeopleNumber = computed(() => {
  return Number(liveDetail.value.commentPeopleNumber ?? 0);
});
const interactionRate = computed(() => {
  if (!cumulativeViewers.value) return "0.00%";
  return `${((commentPeopleNumber.value / cumulativeViewers.value) * 100).toFixed(2)}%`;
});
const dealConversionRate = computed(() => {
  if (!cumulativeViewers.value) return "0%";
  const dealCount = Number(orderStats.value.dealUserCount ?? 0);
  return `${((dealCount / cumulativeViewers.value) * 100).toFixed(0)}%`;
});
const liveDuration = computed(() => {
  void nowTick.value;
  const startMs = parseDateTime(liveDetail.value.startTime);
  if (!startMs || Date.now() < startMs) return "00:00:00";
  let endMs = Date.now();
  if (liveStatus.value === "ENDED") {
    const endTimeMs = parseDateTime(liveDetail.value.endTime);
    if (endTimeMs && endTimeMs > startMs) {
      endMs = endTimeMs;
    }
  }
  return formatDuration(endMs - startMs);
});

watch(videoUrl, () => {
  syncH5Player();
});
watch(isLiving, () => {
  syncH5Player();
  if (isLiving.value) {
    startPolling();
  } else {
    stopPolling();
  }
});
watch(aspectRatio, () => {
  lastHlsPullUrl.value = "";
  nextTick(() => syncH5Player());
});
watch(chatTab, (tab) => {
  if (tab === "online") loadOnlineUsers();
});
watch(statsTab, (tab) => {
  if (tab === "purchase") purchaseRecords.value?.refresh();
});

onMounted(() => {
  liveId.value = String(route.query.id || "");
  if (!liveId.value) {
    Message.error("缺少直播ID");
    return;
  }
  refreshAll();
  startDurationTimer();
});

onBeforeUnmount(() => {
  destroyH5HlsPlayer();
  stopPolling();
  stopDurationTimer();
});

function parseDateTime(value) {
  if (!value) return null;
  if (typeof value === "string" && value.includes("-")) {
    return new Date(value.replace(/-/g, "/")).getTime();
  }
  if (typeof value === "number") {
    return value > 1e12 ? value : value * 1000;
  }
  return null;
}
function formatDuration(ms) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const pad = (n) => String(n).padStart(2, "0");
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}
function startDurationTimer() {
  stopDurationTimer();
  durationTimer.value = setInterval(() => {
    nowTick.value = Date.now();
  }, 1000);
}
function stopDurationTimer() {
  if (durationTimer.value) {
    clearInterval(durationTimer.value);
    durationTimer.value = null;
  }
}
function formatTime(time) {
  if (!time) return "-";
  if (typeof time === "string" && time.includes("-")) return time;
  const ts = typeof time === "number" ? (time > 1e12 ? time / 1000 : time) : time;
  return unixToDate(ts);
}
function formatAmount(val) {
  return Number(val || 0).toFixed(2);
}
function liveStatusText(status) {
  const map = { NEW: "未开始", LIVING: "直播中", PAUSED: "已暂停", ENDED: "已结束" };
  return map[status] || "未知";
}
function liveStatusTagType(status) {
  const map = { NEW: "info", LIVING: "success", PAUSED: "warning", ENDED: "warning" };
  return map[status] || "info";
}
function startPolling() {
  stopPolling();
  if (!isLiving.value) return;
  pollTimer.value = setInterval(() => {
    loadDetail(false);
  }, 5000);
}
function stopPolling() {
  if (pollTimer.value) {
    clearInterval(pollTimer.value);
    pollTimer.value = null;
  }
}
function refreshAll() {
  loadDetail();
  loadOrderStats();
  purchaseRecords.value?.refresh();
  if (chatTab.value === "online") loadOnlineUsers();
}
function buildHlsPlayUrl(url, useHttpFallback = false) {
  if (!url) return "";
  const httpUrl =
    useHttpFallback && url.startsWith("https://")
      ? url.replace("https://", "http://")
      : url;
  return httpUrl.replace(".flv", ".m3u8");
}
function syncH5Player(retry = 0) {
  const shouldPlay = shouldPlayStream.value;
  if (!shouldPlay) {
    destroyH5HlsPlayer();
    lastHlsPullUrl.value = "";
    return;
  }
  if (
    videoUrl.value === lastHlsPullUrl.value &&
    hlsInstance &&
    hlsVideoElement &&
    !hlsVideoElement.paused
  ) {
    return;
  }
  if (videoUrl.value === lastHlsPullUrl.value && hlsInstance) {
    ensureH5VideoPlaying(hlsVideoElement);
    return;
  }
  lastHlsPullUrl.value = videoUrl.value;
  hlsHttpFallbackUsed.value = false;
  nextTick(() => {
    const container = hlsContainer.value;
    if (!container) {
      if (retry < 8) {
        setTimeout(() => syncH5Player(retry + 1), 80);
      }
      return;
    }
    initH5HlsPlayer();
  });
}
function ensureH5VideoPlaying(video) {
  if (!video) return Promise.resolve();
  const tryPlay = (muted) => {
    video.muted = muted;
    return video.play().catch(() => Promise.reject());
  };
  return tryPlay(false)
    .catch(() => tryPlay(true))
    .catch(() => {
      console.warn("[HLS] 自动播放被阻止，请点击画面播放");
    });
}
async function initH5HlsPlayer(useHttpFallback = false) {
  const originalUrl = videoUrl.value;
  const container = hlsContainer.value;
  if (!originalUrl || !container) return;

  const url = buildHlsPlayUrl(originalUrl, useHttpFallback);
  destroyH5HlsPlayer();

  const video = document.createElement("video");
  video.style.cssText = "width:100%;height:100%;object-fit:cover;background:#000;";
  video.autoplay = true;
  video.muted = true;
  video.defaultMuted = true;
  video.playsInline = true;
  video.setAttribute("autoplay", "");
  video.setAttribute("muted", "");
  video.setAttribute("playsinline", "");
  video.setAttribute("webkit-playsinline", "");
  video.controls = false;

  const onVideoClick = () => {
    if (video.muted) {
      video.muted = false;
    }
    video.play().catch(() => {});
  };
  video.addEventListener("click", onVideoClick);
  container.appendChild(video);
  hlsVideoElement = video;
  _hlsVideoClickHandler = onVideoClick;

  const onReadyPlay = () => {
    ensureH5VideoPlaying(video);
  };

  let Hls = null;
  try {
    const hlsModule = await import("hls.js");
    Hls = hlsModule.default;
  } catch (error) {
    console.error("[HLS] 加载播放器失败:", error);
    Message.error("直播播放器加载失败，请刷新页面重试");
    return;
  }

  if (Hls.isSupported()) {
    const hls = new Hls({
      enableWorker: true,
      lowLatencyMode: true,
      liveSyncDurationCount: 3,
      liveMaxLatencyDurationCount: 6,
      maxBufferLength: 10,
      maxMaxBufferLength: 30,
    });
    hlsInstance = hls;
    hls.on(Hls.Events.MEDIA_ATTACHED, onReadyPlay);
    hls.on(Hls.Events.MANIFEST_PARSED, onReadyPlay);
    hls.attachMedia(video);
    hls.loadSource(url);
    hls.on(Hls.Events.ERROR, (_event, data) => {
      if (!data.fatal) return;
      switch (data.type) {
        case Hls.ErrorTypes.NETWORK_ERROR:
          if (!hlsHttpFallbackUsed.value && originalUrl.startsWith("https://")) {
            console.warn("[HLS] HTTPS 加载失败，尝试 HTTP 降级...");
            hlsHttpFallbackUsed.value = true;
            destroyH5HlsPlayer();
            nextTick(() => initH5HlsPlayer(true));
          } else {
            console.error("[HLS] 网络错误，尝试重连...");
            hls.startLoad();
          }
          break;
        case Hls.ErrorTypes.MEDIA_ERROR:
          console.error("[HLS] 媒体错误，尝试恢复...");
          hls.recoverMediaError();
          break;
        default:
          console.error("[HLS] 致命错误:", data);
          destroyH5HlsPlayer();
          Message.error("直播加载失败");
          break;
      }
    });
  } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
    video.src = url;
    video.addEventListener("loadedmetadata", onReadyPlay);
    video.addEventListener("canplay", onReadyPlay);
  } else {
    Message.error("当前浏览器不支持 HLS 播放");
  }
}
function destroyH5HlsPlayer() {
  if (hlsInstance) {
    hlsInstance.destroy();
    hlsInstance = null;
  }
  if (hlsVideoElement) {
    if (_hlsVideoClickHandler) {
      hlsVideoElement.removeEventListener("click", _hlsVideoClickHandler);
      _hlsVideoClickHandler = null;
    }
    hlsVideoElement.remove();
    hlsVideoElement = null;
  }
  const container = hlsContainer.value;
  if (container) {
    container.innerHTML = "";
  }
}
function loadDetail(showLoading = true) {
  if (showLoading) loading.value = true;
  getLiveInfo(liveId.value)
    .then((res) => {
      if (showLoading) loading.value = false;
      if (res.success) {
        const data = res.result || {};
        liveDetail.value = data;
        videoUrl.value = data.pullStreamUrl || data.streamUrl || "";
        syncH5Player();
      }
    })
    .catch(() => {
      if (showLoading) loading.value = false;
    });
}
function loadOrderStats() {
  getLiveOrderStatistics(liveId.value).then((res) => {
    if (res.success) {
      orderStats.value = res.result || {};
    }
  });
}
function loadOnlineUsers() {
  onlineLoading.value = true;
  liveUserList({
    liveRoomId: liveId.value,
    pageNumber: onlinePagination.pageNumber,
    pageSize: onlinePagination.pageSize,
  })
    .then((res) => {
      onlineLoading.value = false;
      if (res.success) {
        onlineUserList.value = res.result?.records || [];
        onlinePagination.total = res.result?.total || 0;
      }
    })
    .catch(() => {
      onlineLoading.value = false;
    });
}
function buildShareUrl() {
  const base = (wapUrl.value || BASE?.WAP_URL || localStorage.getItem("website") || config.website || "").replace(/\/?$/, "/");
  return `${base}pages/promotion/live/room?id=${liveId.value}`;
}
function handleShare() {
  const url = buildShareUrl();
  if (!url) {
    Message.warning("未配置移动端地址");
    return;
  }
  copyText(url, "分享链接");
}
function copyText(text, label = "内容") {
  if (!text) {
    Message.warning(`${label}为空，无法复制`);
    return;
  }
  navigator.clipboard.writeText(text);
  Message.success(`${label}已复制`);
}
function handleStart() {
  Modal.confirm({
    title: "确认开播",
    content: "确定要开始该直播吗？",
    onOk: () => {
      return startLive(liveId.value).then((res) => {
        if (res.success) {
          Message.success("开播成功");
          refreshAll();
        }
      });
    },
  });
}
function handleEnd() {
  Modal.confirm({
    title: "确认结束",
    content: "确定要结束该直播吗？",
    onOk: () => {
      return endLive(liveId.value).then((res) => {
        if (res.success) {
          Message.success("直播已结束");
          destroyH5HlsPlayer();
          stopPolling();
          refreshAll();
        }
      });
    },
  });
}
</script>

<style lang="scss" scoped>
.live-control-panel {
  min-height: 100vh;
  padding: 16px;
  box-sizing: border-box;
  background: #f0f2f5;
}

.control-top-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 16px;
  padding: 12px 16px;
  background: #fff;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
}

.control-title {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;

  .title-text {
    font-size: 16px;
    font-weight: 600;
    color: #303133;
  }

  .title-sub {
    font-size: 14px;
    color: #606266;
  }
}

.control-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.control-grid {
  display: grid;
  grid-template-columns: minmax(0, 40fr) minmax(0, 60fr);
  gap: 16px;
  height: calc(100vh - 120px);
  min-height: 640px;
}

.col-left {
  display: grid;
  grid-template-rows: minmax(0, 7fr) minmax(0, 3fr);
  gap: 16px;
  min-height: 0;
}

.col-right {
  display: grid;
  grid-template-rows: minmax(0, 2fr) minmax(0, 3fr);
  gap: 16px;
  min-height: 0;
}

.col-right-top {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: 16px;
  min-height: 0;
}

.area-preview {
  min-height: 0;
}

.area-basic {
  min-height: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.area-chat,
.area-stats {
  min-height: 0;
  height: 100%;
  overflow: hidden;
}

.area-chat {
  display: flex;
  flex-direction: column;
}

.area-manage {
  min-height: 0;
}

.panel-box {
  background: #fff;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.area-basic,
.area-manage {
  align-self: stretch;
}

.area-preview {
  display: flex;
  flex-direction: column;
}

.panel-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid #ebeef5;
}

.panel-title {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
}

.ratio-switch {
  display: flex;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  overflow: hidden;
}

.ratio-btn {
  padding: 4px 12px;
  border: none;
  background: #fff;
  color: #606266;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;

  & + & {
    border-left: 1px solid #dcdfe6;
  }

  &.active {
    background: $theme_color;
    color: #fff;
  }
}

.player-box {
  flex: 1;
  min-height: 0;
  background: #000;
  position: relative;
}

.player-inner {
  width: 100%;
  height: 100%;
  position: relative;
  z-index: 1;
}

.player-cover {
  position: absolute;
  inset: 0;
  z-index: 2;
  background: #000;

  .cover-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
}

.cover-mask {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  background: rgba(0, 0, 0, 0.45);
}

.cover-tip {
  color: #fff;
  font-size: 13px;
}

.basic-panel .basic-desc,
.area-basic .basic-desc {
  padding: 0;
  flex: 1;
  overflow: auto;

  :deep(.el-descriptions__body) {
    width: 100%;
  }

  :deep(.el-descriptions__label) {
    width: 100px;
    color: #909399;
  }

  :deep(.el-descriptions__content) {
    word-break: break-all;
  }
}

.copy-field {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
}

.copy-field-text {
  flex: 1;
  min-width: 0;
  word-break: break-all;
}

.fill-tabs {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  height: 100%;

  :deep(.el-tabs__header) {
    margin: 0;
    padding: 0 16px;
    border-bottom: 1px solid #ebeef5;
    flex-shrink: 0;
  }

  :deep(.el-tabs__item.is-active) {
    color: $theme_color;
  }

  :deep(.el-tabs__active-bar) {
    background-color: $theme_color;
  }

  :deep(.el-tabs__content) {
    flex: 1;
    min-height: 0;
    padding: 0;
  }

  :deep(.el-tab-pane) {
    height: 100%;
  }
}

.tab-body {
  padding: 12px 16px 16px;
  box-sizing: border-box;
}

.area-chat .tab-body,
.area-stats .tab-body {
  min-height: 0;
  height: 100%;
}

.online-tab-body {
  display: flex;
  flex-direction: column;
  min-height: 0;
  height: 100%;
  padding-bottom: 12px;
}

.online-table-wrap {
  flex: 1;
  min-height: 0;
  overflow: auto;
}

.online-pager {
  flex-shrink: 0;
  display: flex;
  justify-content: flex-end;
  padding-top: 12px;
  margin-top: auto;
}

.stat-tab-body {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  justify-content: center;
  min-height: 0;
  height: 100%;
  padding: 16px 20px;
  overflow: auto;
}

.area-stats .data-card {
  width: 100%;
}

.area-stats .data-card-hero {
  margin-bottom: 24px;
}

.area-stats .data-label {
  font-size: 14px;
  color: #606266;
  line-height: 1.5;
  margin-bottom: 8px;
}

.area-stats .data-hero-value {
  font-size: 36px;
  font-weight: 600;
  color: #67c23a;
  line-height: 1.2;
}

.area-stats .data-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 24px 20px;
}

.area-stats .data-item {
  min-width: 0;
  padding: 12px 14px;
  background: #f8faf9;
  border-radius: 6px;
}

.area-stats .data-value {
  font-size: 22px;
  font-weight: 600;
  color: #303133;
  line-height: 1.3;
}

.purchase-tab-body {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  justify-content: flex-start;
  padding: 8px 12px 12px;
  min-height: 0;
  height: 100%;
  overflow: hidden;
}

.manage-tab-body {
  min-height: 0;
  height: 100%;
  overflow: auto;
}

.area-manage .fill-tabs {
  min-height: 100%;
}

.chat-tab-body {
  display: flex;
  flex-direction: column;
  min-height: 0;
  height: 100%;
  overflow: hidden;
  padding: 12px 16px 12px;
  box-sizing: border-box;
}

@media (max-width: 1200px) {
  .control-grid {
    grid-template-columns: 1fr;
    height: auto;
    min-height: auto;
  }

  .col-left,
  .col-right {
    grid-template-rows: auto;
  }

  .col-right-top {
    grid-template-columns: 1fr;
  }

  .player-box {
    min-height: 240px;
  }
}
</style>
