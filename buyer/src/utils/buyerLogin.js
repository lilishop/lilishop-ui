/**
 * 买家端登录态与商品详情跳转校验
 *
 * @author Mike
 * @date 2026-08-05
 */
import storage from "@/plugins/storage";

export function isBuyerLoggedIn() {
  const rawUserInfo = storage.getItem("userInfo");
  if (rawUserInfo) {
    try {
      return !!JSON.parse(rawUserInfo).username;
    } catch {
      return false;
    }
  }
  return !!storage.getItem("accessToken");
}

export function parseInternalLink(url) {
  const [path, search = ""] = url.split("?");
  const query = {};
  if (search) {
    new URLSearchParams(search).forEach((value, key) => {
      query[key] = value;
    });
  }
  return { path, query };
}

export function isGoodsDetailPath(path) {
  return path === "/goodsDetail";
}

export function redirectToLogin(router, location) {
  router.push({
    path: "/login",
    query: {
      rePath: location.path,
      query: JSON.stringify(location.query || {}),
    },
  });
}

/** 内部链接跳转；访问商品详情前校验登录（首页装修、列表等共用） */
export function openLink(url, router) {
  if (!url) return;
  if (url.charAt(0) !== "/") {
    window.open(url, "_blank");
    return;
  }
  const location = parseInternalLink(url);
  if (!isBuyerLoggedIn() && isGoodsDetailPath(location.path)) {
    redirectToLogin(router, location);
    return;
  }
  window.open(router.resolve(url).href, "_blank");
}
