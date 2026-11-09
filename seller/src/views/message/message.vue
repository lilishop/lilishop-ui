<template>
  <div class="message-page">
    <div class="message-panel">
      <div class="message-tabs">
        <div
          v-for="item in mesTypeList"
          :key="item.type"
          class="message-tab"
          :class="{ active: currentMessageType === item.type }"
          @click="setCurrentMesType(item.type)"
        >
          <el-icon class="message-tab-icon"><component :is="item.icon" /></el-icon>
          <span>{{ item.title }}</span>
          <span
            v-if="item.type === 'unread' && unReadCount > 0"
            class="message-tab-badge"
          >{{ unReadCount > 99 ? "99+" : unReadCount }}</span>
        </div>
      </div>

      <div v-loading="loading" class="message-list-wrap">
        <template v-if="currentMesList.length">
          <div
            v-for="row in currentMesList"
            :key="row.id"
            class="message-card"
            :class="{ expanded: expandedId === row.id }"
            @click="toggleMessage(row)"
          >
            <div class="message-card-icon" :class="currentMessageType">
              <el-icon :size="18"><component :is="currentTypeIcon" /></el-icon>
            </div>
            <div class="message-card-main">
              <div
                class="message-card-title"
                :class="{ unread: currentMessageType === 'unread' }"
              >{{ row.title }}</div>
              <div class="message-card-summary">{{ contentText(row.content) }}</div>
            </div>
            <div class="message-card-side">
              <span class="message-card-time">
                <el-icon><Clock /></el-icon>
                <span>{{ row.createTime }}</span>
              </span>
              <span class="message-card-ops" @click.stop>
                <template v-if="currentMessageType === 'unread'">
                  <a class="link-text" @click="markAsRead(row)">标为已读</a>
                </template>
                <template v-else-if="currentMessageType === 'read'">
                  <a class="link-text danger" @click="deleteMes(row)">删除</a>
                </template>
                <template v-else>
                  <a class="link-text" @click="restoreMes(row)">还原</a>
                  <span class="op-split">|</span>
                  <a class="link-text danger" @click="deleteReal(row)">彻底删除</a>
                </template>
              </span>
            </div>
            <div v-if="expandedId === row.id" class="message-card-content" @click.stop>
              <div class="message-card-content-inner" v-html="$filters.xssFilter(row.content)"></div>
            </div>
          </div>
        </template>
        <el-empty v-else-if="!loading" :description="noDataText" :image-size="110" />
        <div class="page-bar">
          <el-pagination
            v-model:current-page="params.pageNumber"
            v-model:page-size="params.pageSize"
            :page-sizes="[5, 10]"
            :total="total"
            layout="total, sizes, prev, pager, next, jumper"
            size="small"
            @current-change="changePage"
            @size-change="changePageSize"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from "vue";
import { useRoute } from "vue-router";
import { Bell, ChatDotRound, Clock, Delete } from "@element-plus/icons-vue";
import * as API_Index from "@/api/index";
import { useAppStore } from "@/stores/app";

defineOptions({ name: "message_index" });

const route = useRoute();
const appStore = useAppStore();

const loading = ref(true);
const mesTypeList = ref([
  { type: "unread", title: "未读消息", icon: Bell },
  { type: "read", title: "已读消息", icon: ChatDotRound },
  { type: "recycleBin", title: "回收站", icon: Delete },
]);
const params = reactive({
  status: "UN_READY",
  pageNumber: 1,
  pageSize: 10,
  sort: "createTime",
  order: "desc",
});
const total = ref(0);
const currentMesList = ref([]);
const currentMessageType = ref("unread");
const currentTypeIcon = computed(() => {
  const item = mesTypeList.value.find((i) => i.type === currentMessageType.value);
  return item ? item.icon : Bell;
});
const expandedId = ref("");
const unReadCount = ref(0);
const noDataText = ref("暂无未读消息");

onMounted(() => {
  getAll();
});

watch(() => route, (to) => {
  if (to.name == "message_index") getAll();
});

function contentText(html) {
  if (!html) return "";
  const div = document.createElement("div");
  div.innerHTML = html;
  const text = (div.textContent || "").replace(/\s+/g, " ").trim();
  return text.length > 80 ? text.slice(0, 80) + "…" : text;
}

function changePage() {
  refreshMessage();
}
function changePageSize() {
  refreshMessage();
}
function refreshMessage() {
  let status;
  const type = currentMessageType.value;
  if (type == "unread") status = "UN_READY";
  else if (type == "read") status = "ALREADY_READY";
  else status = "ALREADY_REMOVE";
  params.status = status;
  loading.value = true;
  API_Index.getMessageSendData(params).then((res) => {
    loading.value = false;
    if (res.success) {
      currentMesList.value = res.result.records;
      total.value = res.result.total;
    }
  });
}
function refreshUnreadCount() {
  API_Index.getAllMessage(params).then((res) => {
    if (res.success) {
      unReadCount.value = res.result.UN_READY.total;
      appStore.setUnreadMessageCount(unReadCount.value);
    }
  });
}
function getAll() {
  API_Index.getAllMessage(params).then((res) => {
    loading.value = false;
    if (res.success) {
      unReadCount.value = res.result.UN_READY.total;
      appStore.setUnreadMessageCount(unReadCount.value);
      currentMesList.value = res.result.UN_READY.records;
    }
  });
}
function setCurrentMesType(type) {
  if (currentMessageType.value !== type) {
    expandedId.value = "";
  }
  currentMessageType.value = type;
  if (type == "unread") noDataText.value = "暂无未读消息";
  else if (type == "read") noDataText.value = "暂无已读消息";
  else noDataText.value = "回收站无消息";
  params.pageNumber = 1;
  refreshMessage();
}
function toggleMessage(row) {
  if (expandedId.value === row.id) {
    expandedId.value = "";
    return;
  }
  expandedId.value = row.id;
  if (currentMessageType.value === "unread") {
    API_Index.read(row.id).then((res) => {
      if (res.success) {
        refreshMessage();
        refreshUnreadCount();
      }
    });
  }
}
function markAsRead(v) {
  loading.value = true;
  API_Index.read(v.id).then((res) => {
    loading.value = false;
    if (res.success) {
      refreshMessage();
      refreshUnreadCount();
    }
  });
}
function deleteMes(v) {
  loading.value = true;
  API_Index.deleteMessage(v.id).then((res) => {
    loading.value = false;
    if (res.success) refreshMessage();
  });
}
function restoreMes(v) {
  API_Index.reductionMessage(v.id).then((res) => {
    loading.value = false;
    if (res.success) refreshMessage();
  });
}
function deleteReal(v) {
  loading.value = true;
  API_Index.clearMessage(v.id).then(res => {
    loading.value = false;
    if (res.success) refreshMessage();
  });
}
</script>

<style lang="scss" scoped>
@import "./message.scss";
.link-text {
  color: #409eff;
  cursor: pointer;
  text-decoration: none;

  &.danger {
    color: var(--el-color-danger);
  }

  &:hover {
    text-decoration: underline;
  }
}
.op-split {
  margin: 0 8px;
  color: #dcdee2;
}
</style>
