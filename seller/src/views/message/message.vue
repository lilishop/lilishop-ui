<template>
  <div class="message-main-con">
    <div class="message-mainlist-con">
      <div
        v-for="item in mesTypeList"
        :key="item.type"
        class="mes-type-item"
        :class="{ active: currentMessageType === item.type }"
        @click="setCurrentMesType(item.type)"
      >
        <span class="mes-type-btn-text">{{ item.title }}</span>
        <el-badge
          v-if="item.type === 'unread' && unReadCount > 0"
          :value="unReadCount"
          class="message-count-badge-outer"
        />
      </div>
    </div>
    <div class="message-content-con">
      <div v-if="showMesTitleList" class="message-title-list-con">
        <el-table
          ref="messageList"
          v-loading="loading"
          :data="currentMesList"
          :empty-text="noDataText"
          :show-header="false"
          style="width: 100%"
        >
          <el-table-column min-width="300">
            <template #default="{ row }">
              <a class="link-text mes-title-link" @click="openMessage(row)">{{ row.title }}</a>
            </template>
          </el-table-column>
          <el-table-column width="200" align="center">
            <template #default="{ row }">
              <el-icon class="mes-time-icon"><Clock /></el-icon>
              <span>{{ row.createTime }}</span>
            </template>
          </el-table-column>
          <el-table-column width="180" align="center">
            <template #default="{ row }">
              <template v-if="currentMessageType == 'unread'">
                <a class="link-text" @click="markAsRead(row)">标为已读</a>
              </template>
              <template v-else-if="currentMessageType == 'read'">
                <a class="link-text" @click="deleteMes(row)">删除</a>
              </template>
              <template v-else>
                <a class="link-text" @click="restoreMes(row)">还原</a>
                <span class="op-split">|</span>
                <a class="link-text" @click="deleteReal(row)">彻底删除</a>
              </template>
            </template>
          </el-table-column>
        </el-table>
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
      <div v-else class="message-view-content-con">
        <div class="message-content-top-bar">
          <el-button type="primary" link @click="backMesTitleList">
            <el-icon><ArrowLeft /></el-icon>返回
          </el-button>
          <h3 class="mes-title">{{ mes.title }}</h3>
        </div>
        <p class="mes-time-con">
          <el-icon class="mes-time-icon"><Clock /></el-icon>{{ mes.time }}
        </p>
        <div class="message-content-body">
          <p class="message-content" v-html="$filters.xssFilter(mes.content)"></p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref, watch } from "vue";
import { useRoute } from "vue-router";
import { Clock, ArrowLeft } from "@element-plus/icons-vue";
import * as API_Index from "@/api/index";

defineOptions({ name: "message_index" });

const route = useRoute();

const loading = ref(true);
const mesTypeList = ref([
  { type: "unread", title: "未读消息" },
  { type: "read", title: "已读消息" },
  { type: "recycleBin", title: "回收站" },
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
const showMesTitleList = ref(true);
const unReadCount = ref(0);
const noDataText = ref("暂无未读消息");
const mes = reactive({
  title: "",
  time: "",
  content: "",
});

// messageList：模板 ref 对应声明（原 Options API 中未在 script 内使用，仅保留绑定）
const messageList = ref(null);

onMounted(() => {
  getAll();
});

watch(() => route, (to) => {
  if (to.name == "message_index") getAll();
});

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
function getAll() {
  API_Index.getAllMessage(params).then((res) => {
    loading.value = false;
    if (res.success) {
      unReadCount.value = res.result.UN_READY.total;
      currentMesList.value = res.result.UN_READY.records;
    }
  });
}
function backMesTitleList() {
  showMesTitleList.value = true;
}
function setCurrentMesType(type) {
  if (currentMessageType.value !== type) {
    showMesTitleList.value = true;
  }
  currentMessageType.value = type;
  if (type == "unread") noDataText.value = "暂无未读消息";
  else if (type == "read") noDataText.value = "暂无已读消息";
  else noDataText.value = "回收站无消息";
  params.pageNumber = 1;
  refreshMessage();
}
function openMessage(row) {
  showMesTitleList.value = false;
  mes.title = row.title;
  mes.time = row.createTime;
  getContent(row);
}
function markAsRead(v) {
  loading.value = true;
  API_Index.read(v.id).then((res) => {
    loading.value = false;
    if (res.success) getAll();
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
  API_Index.clearMessage(v.id).then((res) => {
    loading.value = false;
    if (res.success) refreshMessage();
  });
}
function getContent(v) {
  mes.content = v.content;
  API_Index.read(v.id).then((res) => {
    loading.value = false;
    if (res.success) getAll();
  });
}
</script>

<style lang="scss" scoped>
@import "./message.scss";
.link-text {
  color: #409eff;
  cursor: pointer;
  text-decoration: none;
}
.op-split {
  margin: 0 8px;
  color: #dcdee2;
}
.mes-title-link {
  margin-right: 30px;
}
</style>
