import { post, get, upload, del } from "@/utils/request";

// 获取聊天列表服务接口
export const ServeGetTalkList = (data) => {
  return get("/im/talk/list", data);
};

// 获取聊天列表服务接口
export const ServeGetStoreTalkList = (data) => {
  return get("/im/talk/store/list", data);
};

// 聊天列表创建服务接口
export const ServeCreateTalkList = (id) => {
  return get(`/im/talk/user/${id}`);
};

// 删除聊天列表服务接口
export const ServeDeleteTalkList = (data) => {
  return del("/im/talk", data);
};

// 对话列表置顶服务接口
export const ServeTopTalkList = (data) => {
  return post("/im/talk/top", data);
};

// 清除聊天消息未读数服务接口
export const ServeClearTalkUnreadNum = (data) => {
  return post("/im/talk/update-unread-num", data);
};

// 获取聊天记录服务接口
export const ServeTalkRecords = (data) => {
  return get("/im/message", data);
};

// 获取转发会话记录详情列表服务接口
export const ServeGetForwardRecords = (data) => {
  return get("/im/talk/get-forward-records", data);
};

// 对话列表置顶服务接口
export const ServeSetNotDisturb = (data) => {
  return post("/im/talk/disturb", data);
};

// 查找用户聊天记录服务接口
export const ServeFindTalkRecords = (data) => {
  return get("/im/talk/find-chat-records", data);
};

// 搜索用户聊天记录服务接口
export const ServeSearchTalkRecords = (data) => {
  return get("/im/talk/search-chat-records", data);
};

export const ServeGetRecordsContext = (data) => {
  return get("/im/talk/get-records-context", data);
};

// 发送代码块消息服务接口
export const ServeSendTalkCodeBlock = (data) => {
  return post("/im/talk/message/code", data);
};

// 发送聊天文件服务接口
export const ServeSendTalkFile = (data) => {
  return post("/im/talk/message/file", data);
};

// 发送聊天图片服务接口
export const ServeSendTalkImage = (data) => {
  return upload("/common/common/upload/file", data);
};

// 发送表情包服务接口
export const ServeSendEmoticon = (data) => {
  return post("/im/talk/message/emoticon", data);
};

// 转发消息服务接口
export const ServeForwardRecords = (data) => {
  return post("/im/talk/message/forward", data);
};

// 撤回消息服务接口
export const ServeRevokeRecords = (data) => {
  return post("/im/talk/message/revoke", data);
};

// 删除消息服务接口
export const ServeRemoveRecords = (data) => {
  return post("/im/talk/message/delete", data);
};

// 收藏表情包服务接口
export const ServeCollectEmoticon = (data) => {
  return post("/im/talk/message/collect", data);
};

//投票
export const ServeSendVote = (data) => {
  return post("/im/talk/message/vote", data);
};

export const ServeConfirmVoteHandle = (data) => {
  return post("/im/talk/message/vote/handle", data);
};
