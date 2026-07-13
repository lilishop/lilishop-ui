import { getSetting } from "@/api/index";

/** @type {Record<string, any> | null} */
let cachedSetting = null;
/** @type {Promise<Record<string, any> | null> | null} */
let fetchingPromise = null;

/** 获取直播配置（带缓存） */
export async function fetchLiveSetting(force = false) {
  if (!force && cachedSetting) {
    return cachedSetting;
  }
  if (!force && fetchingPromise) {
    return fetchingPromise;
  }

  fetchingPromise = (async () => {
    try {
      const res = await getSetting("LIVE_SETTING");
      if (res?.success && res?.result) {
        cachedSetting = res.result;
        return cachedSetting;
      }
      console.warn("获取直播配置失败", res);
      return null;
    } catch (error) {
      console.error("获取直播配置异常:", error);
      return null;
    } finally {
      fetchingPromise = null;
    }
  })();

  return fetchingPromise;
}

/** 解析 IM SDK AppID（系统设置，兼容旧逻辑） */
export function resolveSdkAppId(setting) {
  if (!setting?.imSdkAppid) {
    return 0;
  }
  const id = Number(setting.imSdkAppid);
  return Number.isNaN(id) ? 0 : id;
}

/** 从直播间详情解析 IM SDK AppID */
export function resolveSdkAppIdFromDetail(detail) {
  return resolveImConfigFromDetail(detail).sdkAppId;
}

/** 从直播间详情解析 IM 配置 */
export function resolveImConfigFromDetail(detail) {
  if (!detail) {
    return { sdkAppId: 0, secretKey: "", userSig: "" };
  }

  const sdkRaw = detail.sdkAppId ?? detail.imSdkAppId ?? detail.imSdkAppid;
  const sdkAppId =
    sdkRaw == null || sdkRaw === "" ? 0 : Number(sdkRaw);

  const secretKey =
    detail.imSdkSecretKey ?? detail.sdkSecretKey ?? detail.secretKey ?? "";
  const userSig =
    detail.userSig ?? detail.imUserSig ?? detail.adminUserSig ?? "";

  return {
    sdkAppId: Number.isNaN(sdkAppId) ? 0 : sdkAppId,
    secretKey: String(secretKey || ""),
    userSig: String(userSig || ""),
  };
}
