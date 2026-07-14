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

<script>
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

export default {
  name: "CommentReview",
  components: { Refresh },
  props: {
    liveId: {
      type: String,
      required: true,
    },
    embedded: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      activeTab: "message",
      searchKeyword: "",
      messageLoading: false,
      userLoading: false,
      blockLoading: false,
      messageList: [],
      userList: [],
      blockList: [],
      messagePagination: {
        pageNumber: 1,
        pageSize: 10,
        total: 0,
      },
      userPagination: {
        pageNumber: 1,
        pageSize: 10,
        total: 0,
      },
      blockPagination: {
        pageNumber: 1,
        pageSize: 10,
        total: 0,
      },
      blockDialogVisible: false,
      blockTarget: null,
      blockReason: "",
      blockSubmitting: false,
    };
  },
  watch: {
    liveId() {
      this.loadMessages();
    },
  },
  mounted() {
    this.loadMessages();
  },
  methods: {
    formatTime(time) {
      if (!time) return "-";
      return this.$filters.unixToDate(time);
    },
    authStatusText(status) {
      const map = { PASS: "已通过", REFUSE: "已拒绝", TOBEAUDITED: "待审核" };
      return map[status] || status || "待审核";
    },
    authStatusTagType(status) {
      const map = { PASS: "success", REFUSE: "danger", TOBEAUDITED: "warning" };
      return map[status] || "info";
    },
    canPassAuth(row) {
      const status = row?.authStatus;
      return status === "TOBEAUDITED" || status === "REFUSE" || !status;
    },
    canRejectAuth(row) {
      const status = row?.authStatus;
      return status === "TOBEAUDITED" || status === "PASS" || !status;
    },
    parsePageResult(res) {
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
    },
    onTabChange(tab) {
      if (tab === "message") this.loadMessages();
      if (tab === "user") this.loadUsers();
      if (tab === "block") this.loadBlocks();
    },
    loadMessages() {
      if (!this.liveId) return;
      this.messageLoading = true;
      const params = {
        liveStreamId: this.liveId,
        pageNumber: this.messagePagination.pageNumber,
        pageSize: this.messagePagination.pageSize,
      };
      if (this.searchKeyword?.trim()) {
        params.keyword = this.searchKeyword.trim();
      }
      queryLiveMessagePage(params)
        .then((res) => {
          this.messageLoading = false;
          if (res.success) {
            const page = this.parsePageResult(res);
            this.messageList = page.records;
            this.messagePagination.total = page.total;
          }
        })
        .catch(() => {
          this.messageLoading = false;
        });
    },
    loadUsers() {
      if (!this.liveId) return;
      this.userLoading = true;
      liveUserList({
        liveRoomId: this.liveId,
        pageNumber: this.userPagination.pageNumber,
        pageSize: this.userPagination.pageSize,
      })
        .then((res) => {
          this.userLoading = false;
          if (res.success) {
            this.userList = res.result?.records || [];
            this.userPagination.total = res.result?.total || 0;
          }
        })
        .catch(() => {
          this.userLoading = false;
        });
    },
    loadBlocks() {
      if (!this.liveId) return;
      this.blockLoading = true;
      getLiveBlockPage({
        liveRoomId: this.liveId,
        pageNumber: this.blockPagination.pageNumber,
        pageSize: this.blockPagination.pageSize,
      })
        .then((res) => {
          this.blockLoading = false;
          const page = this.parsePageResult(res);
          this.blockList = page.records;
          this.blockPagination.total = page.total;
        })
        .catch(() => {
          this.blockLoading = false;
        });
    },
    handleAuth(record, authStatus) {
      authLiveMessage({
        ...record,
        authStatus,
      }).then((res) => {
        if (res.success) {
          this.$Message.success("操作成功");
          this.loadMessages();
        }
      });
    },
    handleToggleMute(record) {
      const muteFlag = !record.muteFlag;
      editLiveUserMute({
        liveUserid: record.id,
        muteFlag,
      }).then((res) => {
        if (res.success) {
          this.$Message.success(muteFlag ? "已禁言" : "已解除禁言");
          this.loadUsers();
        }
      });
    },
    handleBlock(record) {
      this.blockTarget = record;
      this.blockReason = "";
      this.blockDialogVisible = true;
    },
    confirmBlock() {
      if (!this.blockReason?.trim()) {
        this.$Message.warning("请输入拉黑原因");
        return;
      }
      this.blockSubmitting = true;
      blockUser({
        liveRoomId: this.liveId,
        userId: this.blockTarget?.userId || this.blockTarget?.id,
        reason: this.blockReason.trim(),
      })
        .then((res) => {
          this.blockSubmitting = false;
          if (res.success) {
            this.$Message.success("拉黑成功");
            this.blockDialogVisible = false;
            this.loadUsers();
            this.loadBlocks();
          }
        })
        .catch(() => {
          this.blockSubmitting = false;
        });
    },
    handleUnblock(record) {
      unblockUser({
        liveRoomId: this.liveId,
        userId: record.userId || record.id,
      }).then((res) => {
        if (res.success) {
          this.$Message.success("已解除拉黑");
          this.loadBlocks();
        }
      });
    },
    onMessagePageSizeChange() {
      this.messagePagination.pageNumber = 1;
      this.loadMessages();
    },
    onUserPageSizeChange() {
      this.userPagination.pageNumber = 1;
      this.loadUsers();
    },
    onBlockPageSizeChange() {
      this.blockPagination.pageNumber = 1;
      this.loadBlocks();
    },
    handleSearch() {
      this.messagePagination.pageNumber = 1;
      this.loadMessages();
    },
    handleRefresh() {
      this.loadMessages();
    },
  },
};
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
