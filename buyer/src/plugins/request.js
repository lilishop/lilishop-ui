import axios from "axios";
import { markHandledRequestError, isHandledRequestError } from "@/utils/requestError";
import { ElLoading } from "element-plus";
import { Message, Modal } from "@/utils/message";
import Storage from "./storage";
import { router } from "../router/index.js";
import { useAppStore } from "@/stores/app";
import { handleRefreshToken } from "@/api/index";
import { v4 as uuidv4 } from "uuid";

const qs = require("qs");

export const buyerUrl =
  process.env.NODE_ENV === "development"
    ? BASE.API_DEV.buyer
    : BASE.API_PROD.buyer;

let loginPrompt = null;
const refreshToken = getTokenDebounce();

/** 会员中心（/home/*）页面使用局部 loading，不启用全屏遮罩 */
function isMemberCenterRoute() {
  try {
    const path = router.currentRoute?.value?.path || "";
    return path === "/home" || path.startsWith("/home/");
  } catch {
    return false;
  }
}

const service = axios.create({
  timeout: 10000,
  baseURL: buyerUrl,
  paramsSerializer: (params) =>
    qs.stringify(params, {
      arrayFormat: "repeat",
    }),
});

service.interceptors.request.use(
  async (config) => {
    const { loading } = config;
    const isPutPost = config.method === "put" || config.method === "post";
    const isJson = config.headers["Content-Type"] === "application/json";
    const isFile = config.headers["Content-Type"] === "multipart/form-data";
    if (!config._dataSerialized && isPutPost && isJson) {
      config.data = JSON.stringify(config.data);
    }
    if (!config._dataSerialized && isPutPost && !isFile && !isJson) {
      config.data = qs.stringify(config.data, {
        arrayFormat: "repeat",
      });
    }

    config._dataSerialized = true;

    const method = (config.method || "get").toLowerCase();
    const isReadRequest = method === "get" || method === "head";
    const shouldShowLoading =
      loading === true ||
      (!isReadRequest && loading !== false && !isMemberCenterRoute());

    if (typeof window !== "undefined" && shouldShowLoading) {
      config._loadingInstance = ElLoading.service({ fullscreen: true });
    }

    let uuid = Storage.getItem("uuid");
    if (!uuid) {
      uuid = uuidv4();
      Storage.setItem("uuid", uuid);
    }
    config.headers["uuid"] = uuid;

    const accessToken = Storage.getItem("accessToken");
    if (accessToken && (config.needToken || config.optionalToken)) {
      try {
        const jwtData = JSON.parse(
          decodeURIComponent(
            escape(
              window
                .atob(accessToken.split(".")[1].replace(/-/g, "+").replace(/_/g, "/"))
            )
          )
        );
        const expired = jwtData.exp < Math.round(new Date() / 1000);
        if (expired) {
          if (config.needToken) {
            return refresh(config);
          }
          // 公开接口：丢弃过期 token，匿名继续请求，避免浏览商品时被引导登录
          Storage.removeItem("accessToken");
          Storage.removeItem("refreshToken");
        } else {
          config.headers["accessToken"] = accessToken;
        }
      } catch {
        Storage.removeItem("accessToken");
        Storage.removeItem("refreshToken");
        if (config.needToken) {
          return refresh(config);
        }
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

/** 保留请求配置、状态与错误码，供页面判断业务失败并定位原因。 */
function buildRejectError(error, errorData = {}) {
  const message =
    errorData.message ||
    (error?.code === "ECONNABORTED" ? "连接超时，请稍候再试！" : "网络错误，请稍后再试！");
  return Object.assign(new Error(message), { data: errorData, config: error.config, response: error.response, code: error.code });
}

/**
 * 刷新凭证并返回请求配置；请求拦截器不能返回业务响应。每个业务请求最多刷新一次。
 * 刷新失败时保持 Promise 拒绝，阻止后续支付、订单等成功回调继续执行。
 */
async function refresh(config) {
  if (!config._retryAfterRefresh) {
    config._retryAfterRefresh = true;
    const result = await refreshToken();
    if (result === "success") {
      config.headers.accessToken = Storage.getItem("accessToken");
      return config;
    }
  }
  Storage.removeItem("accessToken");
  Storage.removeItem("refreshToken");
  Storage.removeItem("userInfo");
  Storage.setItem("cartNum", 0);
  useAppStore().setCartNum(0);
  // 多个受保护接口同时失败时共用一个弹窗，关闭后允许再次提示。
  if (!loginPrompt) {
    const currentRoute = router.currentRoute.value;
    loginPrompt = Modal.confirm({
      title: "请登录",
      content: "请登录后执行此操作",
      okText: "立即登录",
      cancelText: "继续浏览",
      onOk: () => router.push({
        path: "/login",
        query: { rePath: currentRoute.path, query: JSON.stringify(currentRoute.query) },
      }),
      onCancel: () => router.push("/"),
    }).finally(() => { loginPrompt = null; });
  }
  const error = Object.assign(new Error("登录已过期"), { code: "AUTH_EXPIRED", config });
  throw markHandledRequestError(error);
}

service.interceptors.response.use(
  async (response) => {
    await closeLoading(response);
    const config = response.config;
    if (!config.skipAuthHandler && [401, 403, 20004].includes(response.data?.code)) {
      return service(await refresh(config));
    }
    return response.data;
  },
  async (error) => {
    if (typeof window === "undefined") return Promise.reject(error);
    await closeLoading(error);
    if (isHandledRequestError(error)) return Promise.reject(error);
    const errorResponse = error.response || {};
    const errorData = errorResponse.data || {};

    if (
      !error.config?.skipAuthHandler &&
      (errorResponse.status === 401 ||
        errorResponse.status === 403 ||
        error.response?.data?.code === 20004)
    ) {
      return service(await refresh(error.config || errorResponse.config));
    }
    if (!axios.isAxiosError(error) || axios.isCancel(error)) return Promise.reject(error);
    const rejected = buildRejectError(error, errorResponse.status === 404
      ? { ...errorData, message: "请求的资源不存在" }
      : errorData);
    if (!error.config?.skipMessage && axios.isAxiosError(error) && !axios.isCancel(error)) {
      Message.error(rejected.message);
      markHandledRequestError(rejected);
    }
    return Promise.reject(rejected);
  }
);

const closeLoading = (target) => {
  if (typeof target.config?._loadingInstance?.close !== "function") return true;
  return new Promise((resolve) => {
    setTimeout(() => {
      target.config._loadingInstance.close();
      delete target.config._loadingInstance;
      resolve();
    }, 200);
  });
};

export const Method = {
  GET: "get",
  POST: "post",
  PUT: "put",
  DELETE: "delete",
};

export default function request(options) {
  return service(options);
}

/** 并发刷新共用同一个 Promise；不轮询，不保留上次刷新结果，失败后允许下次重试。 */
function getTokenDebounce() {
  let pending = null;
  return function () {
    if (pending) return pending;
    const token = Storage.getItem("refreshToken");
    if (!token) return Promise.resolve("fail");
    pending = handleRefreshToken(token)
      .then((res) => {
        if (!res.success || !res.result?.accessToken || !res.result?.refreshToken) return "fail";
        Storage.setItem("accessToken", res.result.accessToken);
        Storage.setItem("refreshToken", res.result.refreshToken);
        return "success";
      })
      .catch(() => "fail")
      .finally(() => { pending = null; });
    return pending;
  };
}
