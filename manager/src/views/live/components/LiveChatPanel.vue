<template>
  <div class="live-chat-panel">
    <div v-if="initError" class="chat-error">
      <el-alert :title="initError" type="warning" :closable="false" show-icon />
    </div>

    <div ref="chatListRef" class="chat-list" @scroll="onScroll">
      <div v-if="isLoadingHistory" class="chat-loading">加载历史消息...</div>
      <div
        v-for="msg in messageList"
        :key="msg.messageId"
        class="chat-item"
        :class="{ 'is-system': msg.isSystem }"
      >
        <el-avatar v-if="!msg.isSystem" :src="msg.avatar" :size="28">
          {{ (msg.username || "用").charAt(0) }}
        </el-avatar>
        <div class="chat-bubble">
          <div v-if="!msg.isSystem" class="chat-user">{{ msg.username }}</div>
          <div class="chat-text">{{ msg.message }}</div>
        </div>
      </div>
      <el-empty v-if="!messageList.length && !initError && !initializing" :image-size="64" description="暂无聊天消息" />
      <div ref="bottomAnchorRef" class="chat-bottom-anchor" />
    </div>

    <div v-if="unreadCount > 0" class="chat-unread" @click="scrollToBottomAndClearUnread">
      {{ unreadCount }} 条新消息
    </div>
  </div>
</template>

<script>
import Cookies from "js-cookie";
import { toRef } from "vue";
import { useChat } from "../composables/useChat";
import { resolveImConfigFromDetail } from "../composables/useLiveSetting";

export default {
  name: "LiveChatPanel",
  props: {
    liveId: {
      type: String,
      required: true,
    },
    liveDetail: {
      type: Object,
      default: () => ({}),
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  setup(props) {
    let userInfo = {};
    try {
      userInfo = JSON.parse(Cookies.get("userInfoManager") || "{}");
    } catch {
      userInfo = {};
    }

    return useChat(toRef(props, "liveId"), userInfo, toRef(props, "liveDetail"));
  },
  data() {
    return {
      initializing: false,
      chatInited: false,
    };
  },
  computed: {
    /** 腾讯云 IM 群组：优先后端字段，否则用直播间 ID（与旧版中控台一致） */
    imGroupId() {
      return this.liveDetail?.imGroupId || this.liveDetail?.groupId || this.liveId || "";
    },
    imSdkAppId() {
      return resolveImConfigFromDetail(this.liveDetail).sdkAppId;
    },
    canInitChat() {
      const { sdkAppId, secretKey, userSig } = resolveImConfigFromDetail(this.liveDetail);
      return !!(this.imGroupId && sdkAppId && (userSig || secretKey));
    },
  },
  watch: {
    canInitChat: {
      immediate: true,
      handler(ready) {
        if (!ready) return;
        this.setGroupID(this.imGroupId);
        if (this.active) {
          this.bootstrapChat();
        }
      },
    },
    imGroupId(id) {
      if (!id) return;
      this.setGroupID(id);
    },
    active(val) {
      if (val && this.canInitChat && !this.chatInited) {
        this.bootstrapChat();
      }
    },
    liveId() {
      this.chatInited = false;
      this.cleanup();
      if (this.active && this.canInitChat) {
        this.bootstrapChat();
      }
    },
    liveDetail: {
      deep: true,
      handler(detail, oldDetail) {
        const nextConfig = resolveImConfigFromDetail(detail);
        const prevConfig = resolveImConfigFromDetail(oldDetail);
        if (
          nextConfig.sdkAppId &&
          (nextConfig.sdkAppId !== prevConfig.sdkAppId ||
            nextConfig.secretKey !== prevConfig.secretKey ||
            nextConfig.userSig !== prevConfig.userSig)
        ) {
          this.chatInited = false;
          this.cleanup();
          if (this.active && this.canInitChat) {
            this.bootstrapChat();
          }
        }
      },
    },
  },
  beforeUnmount() {
    this.cleanup();
  },
  methods: {
    async bootstrapChat() {
      if (!this.liveId || this.chatInited || this.initializing || !this.canInitChat) {
        return;
      }

      const groupId = this.imGroupId;
      if (!groupId) {
        this.initError = "缺少直播间 ID，无法初始化聊天";
        return;
      }
      this.setGroupID(groupId);

      this.initializing = true;
      try {
        await this.initTencentIm();
        if (!this.initError) {
          this.chatInited = true;
        }
      } catch (error) {
        console.error("初始化直播聊天失败:", error);
        this.initError = "聊天初始化失败，请刷新重试";
        this.chatInited = false;
      } finally {
        this.initializing = false;
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.live-chat-panel {
  display: flex;
  flex-direction: column;
  flex: 1;
  height: 100%;
  min-height: 0;
  max-height: 100%;
  overflow: hidden;
  position: relative;
}

.chat-error {
  flex-shrink: 0;
  margin-bottom: 8px;
}

.chat-list {
  flex: 1 1 0;
  height: 0;
  min-height: 0;
  overflow-x: hidden;
  overflow-y: auto;
  padding: 4px 0;
  overscroll-behavior: contain;
}

.chat-bottom-anchor {
  height: 1px;
  flex-shrink: 0;
}

.chat-loading {
  text-align: center;
  color: #909399;
  font-size: 12px;
  padding: 8px 0;
}

.chat-item {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin-bottom: 12px;

  &.is-system {
    justify-content: center;

    .chat-bubble {
      background: #f4f4f5;
      border-radius: 12px;
      padding: 4px 12px;
    }

    .chat-text {
      color: #909399;
      font-size: 12px;
    }
  }
}

.chat-bubble {
  min-width: 0;
  flex: 1;
}

.chat-user {
  font-size: 12px;
  color: #909399;
  margin-bottom: 4px;
}

.chat-text {
  font-size: 14px;
  color: #303133;
  line-height: 1.5;
  word-break: break-all;
}

.chat-unread {
  position: absolute;
  left: 50%;
  bottom: 12px;
  transform: translateX(-50%);
  padding: 4px 12px;
  background: $theme_color;
  color: #fff;
  font-size: 12px;
  border-radius: 12px;
  cursor: pointer;
  z-index: 2;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
}
</style>
