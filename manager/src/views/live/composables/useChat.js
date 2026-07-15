/* eslint-disable no-console */
import { nextTick, ref, unref, watch } from "vue";
import TencentCloudChat from "@tencentcloud/chat";
import { resolveImConfigFromDetail } from "./useLiveSetting";
import { genTestUserSig } from "../utils/GenerateTestUserSig";

const MAX_MESSAGE_COUNT = 100;
const ADMIN_IM_USER_ID = "admin";

export function useChat(liveId, userInfo, liveDetail) {
  const chat = ref(null);
  const groupID = ref("");
  const messageList = ref([]);
  const chatListRef = ref(null);
  const bottomAnchorRef = ref(null);
  const isAtBottom = ref(true);
  const unreadCount = ref(0);
  const isLoadingHistory = ref(false);
  const hasMoreHistory = ref(true);
  const nextReqMessageID = ref("");
  const imReady = ref(false);
  const initError = ref("");

  let loginPromise = null;
  let historyLoaded = false;

  function resetSessionState() {
    imReady.value = false;
    loginPromise = null;
    historyLoaded = false;
    hasMoreHistory.value = true;
    nextReqMessageID.value = "";
    isLoadingHistory.value = false;
  }

  function detachChatEvents(instance) {
    if (!instance) return;
    instance.off(TencentCloudChat.EVENT.MESSAGE_RECEIVED, onMessageReceived);
    instance.off(TencentCloudChat.EVENT.SDK_READY, onSdkReady);
    instance.off(TencentCloudChat.EVENT.SDK_NOT_READY, onSdkNotReady);
    instance.off(TencentCloudChat.EVENT.KICKED_OUT, onKickedOut);
  }

  function attachChatEvents(instance) {
    instance.on(TencentCloudChat.EVENT.MESSAGE_RECEIVED, onMessageReceived);
    instance.on(TencentCloudChat.EVENT.SDK_READY, onSdkReady);
    instance.on(TencentCloudChat.EVENT.SDK_NOT_READY, onSdkNotReady);
    instance.on(TencentCloudChat.EVENT.KICKED_OUT, onKickedOut);
  }

  async function initTencentIm() {
    initError.value = "";
    resetSessionState();

    if (!groupID.value) {
      const fallbackGroupId = unref(liveId);
      if (fallbackGroupId) {
        groupID.value = `${fallbackGroupId}`;
      }
    }
    if (!groupID.value) {
      initError.value = "直播间群组 ID 不存在";
      console.warn("groupID 不存在，跳过 IM 初始化");
      return;
    }

    const detail = unref(liveDetail) || {};
    const { sdkAppId, secretKey, userSig: detailUserSig } = resolveImConfigFromDetail(detail);
    if (!sdkAppId) {
      initError.value = "直播间详情缺少 IM SDK APPID";
      return;
    }

    let userSig = detailUserSig;
    if (!userSig) {
      if (!secretKey) {
        initError.value = "直播间详情缺少 IM 登录凭证";
        return;
      }
      userSig = genTestUserSig({
        SDKAppID: sdkAppId,
        secretKey,
        userID: ADMIN_IM_USER_ID,
      }).userSig;
    }

    if (chat.value) {
      detachChatEvents(chat.value);
      try {
        await chat.value.logout?.();
      } catch (error) {
        console.warn("IM logout error:", error);
      }
      chat.value = null;
    }

    const chatInstance = TencentCloudChat.create({ SDKAppID: sdkAppId });
    chat.value = chatInstance;
    chatInstance.setLogLevel(1);
    attachChatEvents(chatInstance);

    try {
      await loginChat(userSig);
      await waitForSdkReady();
      await joinGroupAndLoadHistory();
    } catch (error) {
      initError.value = error?.message || "IM 初始化失败";
      console.warn("initTencentIm error:", error);
    }
  }

  function waitForSdkReady(timeoutMs = 15000) {
    if (imReady.value) {
      return Promise.resolve();
    }
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error("IM SDK 就绪超时"));
      }, timeoutMs);

      const onReady = () => {
        clearTimeout(timer);
        chat.value?.off(TencentCloudChat.EVENT.SDK_READY, onReady);
        resolve();
      };

      chat.value?.on(TencentCloudChat.EVENT.SDK_READY, onReady);
    });
  }

  function loginChat(userSig) {
    if (!chat.value) {
      return Promise.reject(new Error("IM 实例不存在"));
    }
    if (loginPromise) {
      return loginPromise;
    }

    loginPromise = chat.value
      .login({
        userID: ADMIN_IM_USER_ID,
        userSig,
      })
      .then((imResponse) => {
        if (imResponse.data.repeatLogin === true) {
          imReady.value = true;
        }
        return imResponse;
      })
      .catch((imError) => {
        const message = imError?.message || "IM 登录失败";
        initError.value = message;
        throw imError;
      })
      .finally(() => {
        loginPromise = null;
      });

    return loginPromise;
  }

  function onSdkNotReady() {
    console.log("[SDK Not Ready]");
    imReady.value = false;
  }

  function onSdkReady() {
    console.log("[SDK Ready]");
    imReady.value = true;
    updateUserInfo();
  }

  function onKickedOut() {
    console.log("[用户被踢下线]");
    imReady.value = false;
    initError.value = "IM 已下线，请刷新页面";
  }

  async function joinGroupAndLoadHistory() {
    if (!chat.value || !imReady.value || !groupID.value) {
      return;
    }
    await joinGroup();
    await getHistoryMessageList("");
  }

  function updateUserInfo() {
    if (!chat.value || !userInfo) {
      return;
    }

    chat.value.updateMyProfile({
      nick: userInfo.nickName || userInfo.username || "管理员",
      avatar: userInfo.face || "",
      gender: TencentCloudChat.TYPES.GENDER_UNKNOWN,
      allowType: TencentCloudChat.TYPES.ALLOW_TYPE_ALLOW_ANY,
    });
  }

  async function joinGroup() {
    if (!chat.value || !imReady.value || !groupID.value) {
      return;
    }

    try {
      const imResponse = await chat.value.joinGroup({
        groupID: groupID.value,
        type: TencentCloudChat.TYPES.GRP_AVCHATROOM,
      });
      console.log("[加群成功]", imResponse);
    } catch (imError) {
      console.warn("joinGroup error:", imError);
      throw imError;
    }
  }

  async function getHistoryMessageList(nextReqId) {
    if (!chat.value || !imReady.value || !groupID.value) {
      return;
    }
    if (isLoadingHistory.value || !hasMoreHistory.value) {
      return;
    }
    if (!nextReqId && historyLoaded) {
      return;
    }

    isLoadingHistory.value = true;

    const requestParams = {
      conversationID: `GROUP${groupID.value}`,
      direction: 0,
    };

    if (nextReqId) {
      requestParams.nextReqMessageID = nextReqId;
    }

    try {
      const imResponse = await chat.value.getMessageList(requestParams);
      const msgList = imResponse.data.messageList;
      const nextId = imResponse.data.nextReqMessageID;
      const isCompleted = imResponse.data.isCompleted;

      const formattedMessages = msgList.map((msg) => formatReceivedMessage(msg));
      formattedMessages.forEach((msg) => {
        addMessageToList(msg, "append");
      });

      scrollToBottom(true);

      nextReqMessageID.value = nextId;
      hasMoreHistory.value = !isCompleted;
      historyLoaded = true;
    } catch (imError) {
      console.warn("getMessageList error:", imError);
      throw imError;
    } finally {
      isLoadingHistory.value = false;
    }
  }

  function formatReceivedMessage(message) {
    let messageText = "";
    let username = "";
    let isSystem = false;

    if (message.from === "@TIM#SYSTEM") {
      username = "系统消息";
      isSystem = true;
    } else {
      username = message.nick || message.from || "用户";
    }

    const avatar = message.avatar || null;
    const textType = TencentCloudChat.TYPES.MSG_TEXT;
    const customType = TencentCloudChat.TYPES.MSG_CUSTOM;

    if (message.type === textType || message.type === "TIMTextElem") {
      messageText = message.payload?.text || "";
    } else if (message.type === customType || message.type === "TIMCustomElem") {
      try {
        const customData = JSON.parse(message.payload.data);
        messageText = customData.content || "系统消息";
        username = "系统消息";
        isSystem = true;
      } catch {
        messageText = "系统消息";
        username = "系统消息";
        isSystem = true;
      }
    } else {
      messageText = "欢迎加入直播间";
    }

    return {
      username,
      message: messageText,
      avatar: isSystem ? null : avatar,
      messageId: message.ID,
      time: message.time,
      type: message.type,
      isSystem,
    };
  }

  function onMessageReceived(event) {
    const msgList = event.data;

    msgList.forEach((message) => {
      const formattedMessage = formatReceivedMessage(message);
      if (!formattedMessage.message?.trim() && !formattedMessage.isSystem) {
        return;
      }

      addMessageToList(formattedMessage, "append");
      isAtBottom.value = true;
      unreadCount.value = 0;
      scrollToBottom(true);
    });
  }

  function addMessageToList(message, mode = "append") {
    const exists = messageList.value.some((item) => item.messageId === message.messageId);
    if (exists) {
      return;
    }

    if (mode === "append") {
      messageList.value.push(message);
      if (messageList.value.length > MAX_MESSAGE_COUNT) {
        const removeCount = messageList.value.length - MAX_MESSAGE_COUNT;
        messageList.value.splice(0, removeCount);
      }
    } else {
      messageList.value.unshift(message);
      if (messageList.value.length > MAX_MESSAGE_COUNT) {
        const removeCount = messageList.value.length - MAX_MESSAGE_COUNT;
        messageList.value.splice(-removeCount, removeCount);
      }
    }

    messageList.value.sort((a, b) => a.time - b.time);
  }

  function scrollToBottom(force = false) {
    if (!force && !isAtBottom.value) {
      return;
    }

    nextTick(() => {
      const run = () => {
        const anchor = bottomAnchorRef.value;
        if (anchor?.scrollIntoView) {
          anchor.scrollIntoView({ block: "end" });
        }
        const el = chatListRef.value;
        if (el) {
          el.scrollTop = el.scrollHeight;
        }
      };

      run();
      requestAnimationFrame(run);
      setTimeout(run, 50);
      setTimeout(run, 150);
    });
  }

  watch(
    () => messageList.value.length,
    () => {
      if (isAtBottom.value) {
        scrollToBottom(true);
      }
    }
  );

  function checkIfAtBottom(scrollDetail) {
    const { scrollTop, scrollHeight, clientHeight } = scrollDetail;
    const isNearBottom = scrollTop + clientHeight >= scrollHeight - 10;

    if (isNearBottom && !isAtBottom.value) {
      isAtBottom.value = true;
      unreadCount.value = 0;
    } else if (!isNearBottom && isAtBottom.value) {
      isAtBottom.value = false;
    }
  }

  function onScroll() {
    const el = chatListRef.value;
    if (!el) {
      return;
    }

    checkIfAtBottom({
      scrollTop: el.scrollTop,
      scrollHeight: el.scrollHeight,
      clientHeight: el.clientHeight,
    });
  }

  function scrollToBottomAndClearUnread() {
    unreadCount.value = 0;
    isAtBottom.value = true;
    scrollToBottom(true);
  }

  function setGroupID(id) {
    groupID.value = id;
  }

  function cleanup() {
    resetSessionState();
    if (chat.value) {
      detachChatEvents(chat.value);
      try {
        chat.value.logout?.();
      } catch (error) {
        console.error("清理腾讯云 IM 失败:", error);
      }
      chat.value = null;
    }
  }

  return {
    chat,
    groupID,
    messageList,
    chatListRef,
    bottomAnchorRef,
    isAtBottom,
    unreadCount,
    isLoadingHistory,
    hasMoreHistory,
    imReady,
    initError,
    initTencentIm,
    scrollToBottom,
    scrollToBottomAndClearUnread,
    onScroll,
    setGroupID,
    cleanup,
  };
}
