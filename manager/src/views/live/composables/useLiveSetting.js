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

/** 解析 IM SDK AppID */
export function resolveSdkAppId(setting) {
  if (!setting?.imSdkAppid) {
    return 0;
  }
  const id = Number(setting.imSdkAppid);
  return Number.isNaN(id) ? 0 : id;
}
