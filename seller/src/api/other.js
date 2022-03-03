// 统一请求路径前缀在libs/axios.js中修改
import {
  getRequest,
  postRequest,
  putRequest,
  deleteRequest,
  importRequest,
  getRequestWithNoToken,
  putRequestWithNoForm,
  postRequestWithNoForm,
} from "@/libs/axios";

/**
 * 楼层装修设置
 *
 */
export const setHomeSetup = params => {

  return postRequest("/other/pageData/add", params);
};

/**
 * 获取页面信息
 *
 */
export const getHomeData = params => {

  return getRequest(`/other/pageData/${params}`);
};


/**
 * 查询楼层装修
 *
 */
export const getHomeList = params => {

  return getRequest("/other/pageData/pageDataList", params);
};




/**
 * 发布页面
 *
 */

 export const releasePageHome = (id) => {

  return putRequest(`/other/pageData/release/${id}`);
};


/**
 * 修改楼层装修
 *
 */
 export const updateHome = (id, params) => {

  return putRequest(`/other/pageData/update/${id}`, params);
};

/**
 * 删除楼层装修
 *
 */
export const removePageHome = (id) => {

  return deleteRequest(`/other/pageData/remove/${id}`);
};

