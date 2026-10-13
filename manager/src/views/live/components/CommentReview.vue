<template>
  <div class="comment-review" :class="{ embedded }">
    <div v-if="embedded" class="embedded-toolbar">
      <el-input
        v-model="searchKeyword"
        placeholder="搜索用户ID/昵称/内容"
        clearable
        class="search-input"
        @keyup.enter="handleSearch"
      />
      <el-button type="primary" @click="handleSearch">搜索</el-button>
      <el-button @click="handleRefresh">
        <el-icon><Refresh /></el-icon>
        刷新
      </el-button>
    </div>

    <template v-if="embedded">
      <el-table v-loading="messageLoading" border :data="messageList" style="width: 100%">
        <el-table-column label="用户" width="160">
          <template #default="{ row }">
            <div class="user-cell">
              <el-avatar v-if="row.userFace" :src="row.userFace" :size="28" />
              <span>{{ row.userName || "-" }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="message" label="评论内容" min-width="180" show-overflow-tooltip />
        <el-table-column label="审核状态" width="100">
          <template #default="{ row }">
            <el-tag :type="authStatusTagType(row.authStatus)">
              {{ authStatusText(row.authStatus) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="发送时间" width="170">
          <template #default="{ row }">{{ row.createTime }}</template>
        </el-table-column>
        <el-table-column label="操作" width="160" fixed="right" align="center">
          <template #default="{ row }">
            <template v-if="canPassAuth(row)">
              <a class="link-text" @click="handleAuth(row, 'PASS')">通过</a>
            </template>
            <template v-if="canPassAuth(row) && canRejectAuth(row)">
              <span class="op-split">|</span>
            </template>
            <a v-if="canRejectAuth(row)" class="link-text" @click="handleAuth(row, 'REFUSE')">拒绝</a>
          </template>
        </el-table-column>
      </el-table>
      <div class="mt_10 pager-wrap">
        <el-pagination
          v-model:current-page="messagePagination.pageNumber"
          v-model:page-size="messagePagination.pageSize"
          :page-sizes="[10, 20, 50]"
          :total="messagePagination.total"
          layout="total, sizes, prev, pager, next"
          size="small"
          @current-change="loadMessages"
          @size-change="onMessagePageSizeChange"
        />
      </div>
    </template>

    <el-tabs v-else v-model="activeTab" @tab-change="onTabChange">
      <el-tab-pane label="评论审核" name="message">
        <el-table v-loading="messageLoading" border :data="messageList" style="width: 100%">
          <el-table-column label="用户" width="160">
            <template #default="{ row }">
              <div class="user-cell">
                <el-avatar v-if="row.userFace" :src="row.userFace" :size="28" />
                <span>{{ row.userName || "-" }}</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="message" label="评论内容" min-width="180" show-overflow-tooltip />
          <el-table-column label="状态" width="100">
            <template #default="{ row }">
              <el-tag :type="authStatusTagType(row.authStatus)">
                {{ authStatusText(row.authStatus) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="时间" width="170">
            <template #default="{ row }">{{row.createTime }}</template>
          </el-table-column>
          <el-table-column label="操作" width="160" fixed="right" align="center">
            <template #default="{ row }">
              <template v-if="canPassAuth(row)">
                <a class="link-text" @click="handleAuth(row, 'PASS')">通过</a>
              </template>
              <template v-if="canPassAuth(row) && canRejectAuth(row)">
                <span class="op-split">|</span>
              </template>
              <a v-if="canRejectAuth(row)" class="link-text" @click="handleAuth(row, 'REFUSE')">拒绝</a>
            </template>
          </el-table-column>
        </el-table>
        <div class="mt_10 pager-wrap">
          <el-pagination
            v-model:current-page="messagePagination.pageNumber"
            v-model:page-size="messagePagination.pageSize"
            :page-sizes="[10, 20, 50]"
            :total="messagePagination.total"
            layout="total, sizes, prev, pager, next"
            size="small"
            @current-change="loadMessages"
            @size-change="onMessagePageSizeChange"
          />
        </div>
      </el-tab-pane>

      <el-tab-pane label="观众管理" name="user">
        <el-table v-loading="userLoading" border :data="userList" style="width: 100%">
          <el-table-column prop="userName" label="用户" min-width="160" show-overflow-tooltip />
          <el-table-column label="禁言状态" width="100">
            <template #default="{ row }">
              <el-tag :type="row.muteFlag ? 'danger' : 'success'">
                {{ row.muteFlag ? "已禁言" : "正常" }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="200" fixed="right" align="center">
            <template #default="{ row }">
              <a class="link-text" @click="handleToggleMute(row)">
                {{ row.muteFlag ? "解除禁言" : "禁言" }}
              </a>
              <span class="op-split">|</span>
              <a class="link-text" @click="handleBlock(row)">拉黑</a>
            </template>
          </el-table-column>
        </el-table>
        <div class="mt_10" style="display: flex; justify-content: flex-end">
          <el-pagination
            v-model:current-page="userPagination.pageNumber"
            v-model:page-size="userPagination.pageSize"
            :page-sizes="[10, 20, 50]"
            :total="userPagination.total"
            layout="total, sizes, prev, pager, next"
            size="small"
            @current-change="loadUsers"
            @size-change="onUserPageSizeChange"
          />
        </div>
      </el-tab-pane>

      <el-tab-pane label="黑名单" name="block">
        <el-table v-loading="blockLoading" border :data="blockList" style="width: 100%">
          <el-table-column prop="userName" label="用户" min-width="160" show-overflow-tooltip />
          <el-table-column label="拉黑时间" width="170">
            <template #default="{ row }">{{ formatTime(row.createTime) }}</template>
          </el-table-column>
          <el-table-column label="操作" width="120" fixed="right" align="center">
            <template #default="{ row }">
              <a class="link-text" @click="handleUnblock(row)">解除拉黑</a>
            </template>
          </el-table-column>
        </el-table>
        <div class="mt_10" style="display: flex; justify-content: flex-end">
          <el-pagination
            v-model:current-page="blockPagination.pageNumber"
            v-model:page-size="blockPagination.pageSize"
            :page-sizes="[10, 20, 50]"
            :total="blockPagination.total"
            layout="total, sizes, prev, pager, next"
            size="small"
            @current-change="loadBlocks"
            @size-change="onBlockPageSizeChange"
          />
        </div>
      </el-tab-pane>
    </el-tabs>

    <el-dialog v-model="blockDialogVisible" title="拉黑用户" width="420px" append-to-body>
      <p class="block-tip">确定要拉黑用户「{{ blockTarget?.userName || "" }}」吗？</p>
      <el-form label-width="80px">
        <el-form-item label="拉黑原因" required>
          <el-input
            v-model="blockReason"
            type="textarea"
            :rows="3"
            placeholder="请输入拉黑原因"
            maxlength="200"
            show-word-limit
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="blockDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="blockSubmitting" @click="confirmBlock">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, watch, onMounted } from "vue";
import { Refresh } from "@element-plus/icons-vue";
import {
  authLiveMessage,
  blockUser,
  editLiveUserMute,
  getLiveBlockPage,
  liveUserList,
  queryLiveMessagePage,
  unblockUser,
} from "@/api/live";
import { Message } from "@/utils/message";
import { unixToDate } from "@/utils/filters";

defineOptions({ name: "CommentReview" });

const props = defineProps({
  liveId: {
    type: String,
    required: true,
  },
  embedded: {
    type: Boolean,
    default: false,
  },
});

const activeTab = ref("message");
const searchKeyword = ref("");
const messageLoading = ref(false);
const userLoading = ref(false);
const blockLoading = ref(false);
const messageList = ref([]);
const userList = ref([]);
const blockList = ref([]);
const messagePagination = reactive({
  pageNumber: 1,
  pageSize: 10,
  total: 0,
});
const userPagination = reactive({
  pageNumber: 1,
  pageSize: 10,
  total: 0,
});
const blockPagination = reactive({
  pageNumber: 1,
  pageSize: 10,
  total: 0,
});
const blockDialogVisible = ref(false);
const blockTarget = ref(null);
const blockReason = ref("");
const blockSubmitting = ref(false);

watch(
  () => props.liveId,
  () => {
    loadMessages();
  }
);

function formatTime(time) {
  if (!time) return "-";
  return unixToDate(time);
}

function authStatusText(status) {
  const map = { PASS: "已通过", REFUSE: "已拒绝", TOBEAUDITED: "待审核" };
  return map[status] || status || "待审核";
}

function authStatusTagType(status) {
  const map = { PASS: "success", REFUSE: "danger", TOBEAUDITED: "warning" };
  return map[status] || "info";
}

function canPassAuth(row) {
  const status = row?.authStatus;
  return status === "TOBEAUDITED" || status === "REFUSE" || !status;
}

function canRejectAuth(row) {
  const status = row?.authStatus;
  return status === "TOBEAUDITED" || status === "PASS" || !status;
}

function parsePageResult(res) {
  if (!res) return { records: [], total: 0 };
  if (res.records) {
    return { records: res.records || [], total: res.total || 0 };
  }
  if (res.result?.records) {
    return { records: res.result.records || [], total: res.result.total || 0 };
  }
  if (res.success && res.result) {
    return { records: res.result.records || [], total: res.result.total || 0 };
  }
  return { records: [], total: 0 };
}

function onTabChange(tab) {
  if (tab === "message") loadMessages();
  if (tab === "user") loadUsers();
  if (tab === "block") loadBlocks();
}

function loadMessages() {
  if (!props.liveId) return;
  messageLoading.value = true;
  const params = {
    liveStreamId: props.liveId,
    pageNumber: messagePagination.pageNumber,
    pageSize: messagePagination.pageSize,
  };
  if (searchKeyword.value?.trim()) {
    params.keyword = searchKeyword.value.trim();
  }
  queryLiveMessagePage(params)
    .then((res) => {
      messageLoading.value = false;
      if (res.success) {
        const page = parsePageResult(res);
        messageList.value = page.records;
        messagePagination.total = page.total;
      }
    })
    .catch(() => {
      messageLoading.value = false;
    });
}

function loadUsers() {
  if (!props.liveId) return;
  userLoading.value = true;
  liveUserList({
    liveRoomId: props.liveId,
    pageNumber: userPagination.pageNumber,
    pageSize: userPagination.pageSize,
  })
    .then((res) => {
      userLoading.value = false;
      if (res.success) {
        userList.value = res.result?.records || [];
        userPagination.total = res.result?.total || 0;
      }
    })
    .catch(() => {
      userLoading.value = false;
    });
}

function loadBlocks() {
  if (!props.liveId) return;
  blockLoading.value = true;
  getLiveBlockPage({
    liveRoomId: props.liveId,
    pageNumber: blockPagination.pageNumber,
    pageSize: blockPagination.pageSize,
  })
    .then((res) => {
      blockLoading.value = false;
      const page = parsePageResult(res);
      blockList.value = page.records;
      blockPagination.total = page.total;
    })
    .catch(() => {
      blockLoading.value = false;
    });
}

function handleAuth(record, authStatus) {
  authLiveMessage({
    ...record,
    authStatus,
  }).then((res) => {
    if (res.success) {
      Message.success("操作成功");
      loadMessages();
    }
  });
}

function handleToggleMute(record) {
  const muteFlag = !record.muteFlag;
  editLiveUserMute({
    liveUserid: record.id,
    muteFlag,
  }).then((res) => {
    if (res.success) {
      Message.success(muteFlag ? "已禁言" : "已解除禁言");
      loadUsers();
    }
  });
}

function handleBlock(record) {
  blockTarget.value = record;
  blockReason.value = "";
  blockDialogVisible.value = true;
}

function confirmBlock() {
  if (!blockReason.value?.trim()) {
    Message.warning("请输入拉黑原因");
    return;
  }
  blockSubmitting.value = true;
  blockUser({
    liveRoomId: props.liveId,
    userId: blockTarget.value?.userId || blockTarget.value?.id,
    reason: blockReason.value.trim(),
  })
    .then((res) => {
      blockSubmitting.value = false;
      if (res.success) {
        Message.success("拉黑成功");
        blockDialogVisible.value = false;
        loadUsers();
        loadBlocks();
      }
    })
    .catch(() => {
      blockSubmitting.value = false;
    });
}

function handleUnblock(record) {
  unblockUser({
    liveRoomId: props.liveId,
    userId: record.userId || record.id,
  }).then((res) => {
    if (res.success) {
      Message.success("已解除拉黑");
      loadBlocks();
    }
  });
}

function onMessagePageSizeChange() {
  messagePagination.pageNumber = 1;
  loadMessages();
}

function onUserPageSizeChange() {
  userPagination.pageNumber = 1;
  loadUsers();
}

function onBlockPageSizeChange() {
  blockPagination.pageNumber = 1;
  loadBlocks();
}

function handleSearch() {
  messagePagination.pageNumber = 1;
  loadMessages();
}

function handleRefresh() {
  loadMessages();
}

onMounted(() => {
  loadMessages();
});
</script>

<style lang="scss" scoped>
.comment-review {
  min-height: 320px;

  &.embedded {
    min-height: 0;
  }
}
.embedded-toolbar {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  flex-wrap: wrap;

  .search-input {
    width: 220px;
  }
}
.pager-wrap {
  display: flex;
  justify-content: flex-end;
}
.user-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}
.block-tip {
  margin: 0 0 12px;
  color: #606266;
}
</style>
