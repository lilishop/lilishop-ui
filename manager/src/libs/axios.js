import axios from "axios";
import { getStore, setStore } from "./storage.js";
import { getRouter } from "./router-holder";
import { Message } from "@/utils/message";
import Cookies from "js-cookie";
import {v4 as uuidv4} from 'uuid';

// 统一请求路径前缀
export const managerApiUrl =
  process.env.NODE_ENV === "development"
    ? BASE.API_DEV.manager
    : BASE.API_PROD.manager;
export const managerUrl = managerApiUrl + BASE.PREFIX;
// 文件上传接口
export const uploadFile = managerApiUrl + "/manager/common/upload/file";


const service = axios.create({
  timeout: 8000,
  baseURL: managerUrl
});

function refreshAccessToken(token) {
  return service({
    method: "get",
    url: `/passport/user/refresh/${token}`,
    _isRefreshRequest: true
  });
}

function redirectToLogin(message) {
  const router = getRouter();
  Cookies.set("userInfoManager", "");
  setStore("accessToken", "");
  if (router && router.currentRoute.value.name !== "login") {
    if (message) {
      Message.error(message);
    } else {
      Message.error("未知错误，请重新登录");
    }
    router.push("/login");
  }
}
service.interceptors.request.use(
  config => {
    if (config.method == "get") {
      config.params = {
        _t: Date.parse(new Date()) / 1000,
        ...config.params
      };
    }
    let uuid = getStore("uuid");
    if (!uuid) {
      uuid = uuidv4();
      setStore('uuid', uuid);
    }
    config.headers["uuid"] = uuid;
    return config;
  },
  err => {
    Message.error("请求超时");
    return Promise.reject(err);
  }
);

// http response 拦截器
service.interceptors.response.use(
  response => {
    const data = response.data;
    // 根据返回的code值来做不同的处理(和后端约定)
    switch (data.code) {
      case 401:
      case 20004:
        redirectToLogin(data.message || null);
        return data;
      case 400:
      case 500:
        Message.error(data.message || "系统异常");
        return data;
      default:
        if (!data.success && data.message) {
          Message.error(data.message);
        }
        return data;
    }
  },
  async error => {
    const response = error.response;
    const config = error.config;
    if (response) {
      const code = response.data && response.data.code;
      if (response.status === 401) {
        // 这种情况一般调到登录页
        redirectToLogin("登录状态已过期，请重新登录");
      } else if (
        (response.status === 403 || code === 20004) &&
        config &&
        !config._isRefreshRequest &&
        !config._retryAfterRefresh
      ) {
        // accessToken 过期：刷新 token 后重试原请求
        config._retryAfterRefresh = true;
        const result = await refreshToken();
        if (result === "success") {
          config.headers.accessToken = getStore("accessToken");
          return service(config);
        }
        redirectToLogin(null);
      } else if (response.status === 404) {
        // 避免刷新token报错
        Message.error("请求的资源不存在");
      } else {
        // 其他错误处理
        Message.error(
          (response.data && response.data.message) || "系统异常，请稍后重试"
        );
      }
    } else {
      // 断网/超时等无响应的错误
      Message.error(
        error.code === "ECONNABORTED"
          ? "请求超时，请稍后重试"
          : "网络异常，请检查网络连接"
      );
    }
    return Promise.reject(error);
  }
);

// 刷新 token 单例 Promise：并发 403 时共享同一次刷新，避免重复请求
let refreshTokenPromise = null;
function refreshToken() {
  if (!refreshTokenPromise) {
    const oldRefreshToken = getStore("refreshToken");
    refreshTokenPromise = refreshAccessToken(oldRefreshToken)
      .then(res => {
        if (res.success) {
          const { accessToken, refreshToken: newRefreshToken } = res.result;
          setStore("accessToken", accessToken);
          setStore("refreshToken", newRefreshToken);
          return "success";
        }
        return "fail";
      })
      .catch(() => "fail")
      .finally(() => {
        refreshTokenPromise = null;
      });
  }
  return refreshTokenPromise;
}

export const getRequest = (url, params, resBlob) => {
  let accessToken = getStore("accessToken");
  let data = {
    method: "get",
    url: `${url}`,
    params: params,
    headers: {
      accessToken: accessToken
    },
    responseType: "blob"
  };
  if (resBlob != "blob") {
    delete data.responseType;
  }
  return service(data);
};


export const postBlobRequest = (url, data) => {
  let accessToken = getStore("accessToken");
  return service({
    method: "post",
    url: `${url}`,
    data: data,
    responseType: "blob",
    headers: {
      "Content-Type": "application/json",
      accessToken: accessToken
    }
  });
};

// 个别需等待外部平台的操作可传超时毫秒数，现有调用保持 8 秒默认值。
export const postRequest = (url, params, headers, timeout = 8000) => {
  let accessToken = getStore("accessToken");
  return service({
    method: "post",
    timeout,
    url: `${url}`,
    data: params,
    transformRequest: headers
      ? undefined
      : [
          function(data) {
            let ret = "";
            for (let it in data) {
              ret +=
                encodeURIComponent(it) +
                "=" +
                encodeURIComponent(data[it]) +
                "&";
            }
            ret = ret.substring(0, ret.length - 1);
            return ret;
          }
        ],
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      accessToken: accessToken,
      ...headers
    }
  });
};

/** 不带form表单不带transformRequest */
export const postRequestWithNoForm = (url, params) => {
  let accessToken = getStore("accessToken");
  return service({
    method: "post",
    url: `${url}`,
    data: params,

    headers: {
      accessToken: accessToken
    }
  });
};

// export const postRequestWithHeaders = (url, params) => {
//   let accessToken = getStore("accessToken");
//   return axios({
//     method: "post",
//     url: `${url}`,
//     data: params,

//     headers: {
//       accessToken: accessToken,
//       "Content-Type": "application/x-www-form-urlencoded"
//     }
//   });
// };

export const putRequest = (url, params, headers) => {
  let accessToken = getStore("accessToken");
  return service({
    method: "put",
    url: `${url}`,
    data: params,
    transformRequest: headers
      ? undefined
      : [
          function(data) {
            let ret = "";
            for (let it in data) {
              ret +=
                encodeURIComponent(it) +
                "=" +
                encodeURIComponent(data[it]) +
                "&";
            }
            ret = ret.substring(0, ret.length - 1);
            return ret;
          }
        ],
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      accessToken: accessToken,
      ...headers
    }
  });
};

export const putRequestWithNoForm = (url, params) => {
  let accessToken = getStore("accessToken");
  return service({
    method: "put",
    url: `${url}`,
    data: params,

    headers: {
      accessToken: accessToken
    }
  });
};

export const deleteRequest = (url, params) => {
  let accessToken = getStore("accessToken");
  return service({
    method: "delete",
    url: `${url}`,
    params: params,
    headers: {
      accessToken: accessToken
    }
  });
};

export const importRequest = (url, params) => {
  let accessToken = getStore("accessToken");
  return service({
    method: "post",
    url: `${url}`,
    data: params,
    headers: {
      accessToken: accessToken
    }
  });
};

export const uploadFileRequest = (url, params) => {
  let accessToken = getStore("accessToken");
  return service({
    method: "post",
    url: `${url}`,
    data: params,
    headers: {
      accessToken: accessToken,
      'Content-Type': 'multipart/form-data'
    }
  });
};

/**
 * 无需token验证的请求 避免旧token过期导致请求失败
 * @param {*} url
 * @param {*} params
 */
export const getRequestWithNoToken = (url, params) => {
  return service({
    method: "get",
    url: `${url}`,
    params: params
  });
};

/**
 * 无需token验证的请求 避免旧token过期导致请求失败
 * @param {*} url
 * @param {*} params
 */
export const postRequestWithNoToken = (url, params) => {
  return service({
    method: "post",
    url: `${url}`,
    params: params
  });
};

/**
 * 无需token验证的请求 避免旧token过期导致请求失败
 * @param {*} url
 * @param {*} params
 */
export const postRequestWithNoTokenData = (url, params) => {
  return service({
    method: "post",
    url: `${url}`,
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    data: params
  });
};
