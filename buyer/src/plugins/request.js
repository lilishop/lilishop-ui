import axios from "axios";
import { ElLoading } from "element-plus";
import { Message, Modal } from "@/utils/message";
import Storage from "./storage";
import { router } from "../router/index.js";
import store from "../vuex/store";
import { handleRefreshToken } from "@/api/index";
import { v4 as uuidv4 } from "uuid";

const qs = require("qs");

export const buyerUrl =
  process.env.NODE_ENV === "development"
    ? BASE.API_DEV.buyer
    : BASE.API_PROD.buyer;

let isRefreshToken = 0;
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
  (config) => {
    const { loading } = config;
    const isPutPost = config.method === "put" || config.method === "post";
    const isJson = config.headers["Content-Type"] === "application/json";
    const isFile = config.headers["Content-Type"] === "multipart/form-data";
    if (isPutPost && isJson) {
      config.data = JSON.stringify(config.data);
    }
    if (isPutPost && !isFile && !isJson) {
      config.data = qs.stringify(config.data, {
        arrayFormat: "repeat",
      });
    }

    const method = (config.method || "get").toLowerCase();
    const isReadRequest = method === "get" || method === "head";
    const shouldShowLoading =
      loading === true ||
      (!isReadRequest && loading !== false && !isMemberCenterRoute());

    if (typeof window !== "undefined" && shouldShowLoading) {
      config.loading = ElLoading.service({ fullscreen: true });
    }

    let uuid = Storage.getItem("uuid");
    if (!uuid) {
      uuid = uuidv4();
      Storage.setItem("uuid", uuid);
    }
    config.headers["uuid"] = uuid;

    const accessToken = Storage.getItem("accessToken");
    if (accessToken && (config.needToken || config.optionalToken)) {
      config.headers["accessToken"] = accessToken;
      try {
        const jwtData = JSON.parse(
          decodeURIComponent(
            escape(
              window
                .atob(accessToken.split(".")[1].replace(/-/g, "+").replace(/_/g, "/"))
            )
          )
        );
        if (jwtData.exp < Math.round(new Date() / 1000)) {
          refresh({ response: { config } });
        }
      } catch {
        Storage.removeItem("accessToken");
        Storage.removeItem("refreshToken");
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

function buildRejectError(error, errorData = {}) {
  const message =
    errorData.message ||
    (error?.code === "ECONNABORTED" ? "连接超时，请稍候再试！" : "网络错误，请稍后再试！");
  return Object.assign(new Error(message), { data: errorData });
}

async function refresh(error) {
  const getTokenRes = await refreshToken();
  if (getTokenRes === "success") {
    if (error?.response?.config) {
      error.response.config.headers.accessToken = Storage.getItem("accessToken");
      return service(error.response.config);
    }
    router.go(0);
    return new Promise(() => {});
  }
  Storage.removeItem("accessToken");
  Storage.removeItem("refreshToken");
  Storage.removeItem("userInfo");
  Storage.setItem("cartNum", 0);
  store.commit("SET_CARTNUM", 0);
  const currentRoute = router.currentRoute.value;
  Modal.confirm({
    title: "请登录",
    content: "请登录后执行此操作",
    okText: "立即登录",
    cancelText: "继续浏览",
    onOk: () => {
      router.push({
        path: "/login",
        query: {
          rePath: currentRoute.path,
          query: JSON.stringify(currentRoute.query),
        },
      });
    },
    onCancel: () => {
      router.push("/");
      Modal.remove();
    },
  });
  return Promise.reject(new Error("登录已过期"));
}

service.interceptors.response.use(
  async (response) => {
    await closeLoading(response);
    return response.data;
  },
  async (error) => {
    if (typeof window === "undefined") return Promise.reject(error);
    await closeLoading(error);
    const errorResponse = error.response || {};
    const errorData = errorResponse.data || {};

    if (
      errorResponse.status === 401 ||
      errorResponse.status === 403 ||
      error.response?.data?.code === 20004
    ) {
      isRefreshToken++;
      if (isRefreshToken === 1) {
        isRefreshToken = 0;
        return refresh(error);
      }
      return Promise.reject(buildRejectError(error, errorData));
    }
    if (errorResponse.status === 404) {
      return Promise.reject(buildRejectError(error, { message: "请求的资源不存在" }));
    }
    if (error.message && !error.config?.skipMessage) {
      const _message =
        error.code === "ECONNABORTED"
          ? "连接超时，请稍候再试！"
          : "网络错误，请稍后再试！";
      Message.error(errorData.message || _message);
    }
    return Promise.reject(buildRejectError(error, errorData));
  }
);

const closeLoading = (target) => {
  if (!target.config || !target.config.loading) return true;
  return new Promise((resolve) => {
    setTimeout(() => {
      target.config.loading.close();
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

function getTokenDebounce() {
  let lock = false;
  let success = false;
  return function () {
    if (!lock) {
      lock = true;
      const oldRefreshToken = Storage.getItem("refreshToken");
      handleRefreshToken(oldRefreshToken)
        .then((res) => {
          if (res.success) {
            const { accessToken, refreshToken: newRefreshToken } = res.result;
            Storage.setItem("accessToken", accessToken);
            Storage.setItem("refreshToken", newRefreshToken);
            success = true;
            lock = false;
          } else {
            success = false;
            lock = false;
          }
        })
        .catch(() => {
          success = false;
          lock = false;
        });
    }
    return new Promise((resolve) => {
      const timer = setInterval(() => {
        if (!lock) {
          clearInterval(timer);
          resolve(success ? "success" : "fail");
        }
      }, 500);
    });
  };
}
