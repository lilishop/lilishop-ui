import axios from "axios";
import config from "@/config/config";
import { getToken, removeAll } from "@/utils/auth";

import { Notification, MessageBox } from "element-ui";
import qs from "qs";

// 创建 axios 实例
const request = axios.create({
  // API 请求的默认前缀
  baseURL: config.BASE_API_URL,

  // 请求超时时间
  timeout: 20000,
});

let isRefreshing = false
/**
 * 异常拦截处理器
 *
 * @param {*} error
 */
const errorHandler = (error) => {
  console.log(error);
  // 判断是否是响应错误信息
  if (error.response) {
    if (error.response.status == 401) {
      removeAll();
      location.reload();
    } else if (error.response.status == 403) {
      if(!isRefreshing){
      
      /**
       * 403提示将重新从商家移动端进入当前页面
       */
      MessageBox("当前登录已失效，请从关闭重新进入。", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        closeOnPressEscape: false,
        closeOnClickModal: false,
        type: "warning",
      })
        .then(() => {
          isRefreshing = true
          window.close();
          Notification({
            title:"登录失效提示",
            message: "请手动关闭当前页面",
            type:"error",
            position: "top-right",
          });

        })
        .catch(() => {
          isRefreshing = true
          Notification({
            title:"登录失效提示",
            message: "请手动关闭当前页面",
            type:"error",
            position: "top-right",
          });
        });
        isRefreshing = false
      }
    } else if(error.response.status == 400){
      Notification({
        message: error.response.data.message,
        position: "top-right",
        type:"error",
      });
    }
  }

  return Promise.reject(error);
};

// 请求拦截器
request.interceptors.request.use((config) => {
  const token = getToken();

  if (token) {
    config.headers["accessToken"] = `${token}`;
    return config;
  }
}, errorHandler);

// 响应拦截器
request.interceptors.response.use((response) => {
  return response.data;
}, errorHandler);

/**
 * GET 请求
 *
 * @param {String} url
 * @param {Object} data
 * @param {Object} options
 * @returns {Promise<any>}
 */
export const get = (url, data = {}, options = {}) => {
  return request({
    url,
    params: data,
    method: "get",
    ...options,
  });
};

/**
 * POST 请求
 *
 * @param {String} url
 * @param {Object} data
 * @param {Object} options
 * @returns {Promise<any>}
 */
export const post = (url, data = {}, options = {}) => {
  return request({
    url,
    method: "post",
    data: qs.stringify(data),
    ...options,
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });
};

/**
 * del 请求
 *
 * @param {String} url
 * @param {Object} data
 * @param {Object} options
 * @returns {Promise<any>}
 */
export const del = (url, data = {}, options = {}) => {
  return request({
    url,
    method: "delete",
    data: data,
    ...options,
  });
};

/**
 * 上传文件 POST 请求
 *
 * @param {String} url
 * @param {Object} data
 * @param {Object} options
 * @returns {Promise<any>}
 */
export const upload = (url, data = {}, options = {}) => {
  return request({
    url: config.BASE_COMMON + url,
    method: "post",
    data: data,
    ...options,
  });
};
