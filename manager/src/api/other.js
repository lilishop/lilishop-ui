// 统一请求路径前缀在libs/axios.js中修改
import {
  getRequest,
  postRequest,
  putRequest,
  deleteRequest
} from "@/libs/axios";

/**
 * 楼层装修设置
 *
 */
export const setHomeSetup = params => {

  return postRequest("/pageData/add", params);
};

/**
 * 获取页面信息
 *
 */
export const getHomeData = params => {

  return getRequest(`/pageData/${params}`);
};


/**
 * 查询楼层装修列表
 *
 */
export const getHomeList = params => {

  return getRequest("/pageData/pageDataList", params);
};


/**
 * 修改楼层装修
 *
 */
export const updateHome = (id, params) => {

  return putRequest(`/pageData/update/${id}`, params);
};

/**
 * 删除楼层装修
 *
 */
export const removePageHome = (id) => {

  return deleteRequest(`/pageData/remove/${id}`);
};


/**
 * 发布页面
 *
 */
export const releasePageHome = (id) => {

  return putRequest(`/pageData/release/${id}`);
};

//管理员获取发送列表
export const getMessagePage = (params) => {
  return getRequest(`/message`, params);
};
//管理员获取发送列表
export const sendMessage = (params) => {
  return postRequest(`/message`, params);
};
//管理员获取发送详情列表
export const getShopMessage = (params) => {
  return getRequest(`/message/store`, params);
};

//管理员获取会员意见反馈
export const getMemberFeedback = (params) => {
  return getRequest(`/feedback`, params);
};

//管理员获取会员意见反馈
export const getMemberFeedbackDetail = (id) => {
  return getRequest(`/feedback/${id}`);
};

//管理员获取发送详情列表
export const getMemberMessage = (params) => {
  return getRequest(`/message/member`, params);
};


