/**
 * 买家端内部链接跳转（首页装修、列表等共用）
 *
 * 商品详情新开标签，其余站内页面在当前页打开。外链仍新开。
 */

const NEW_TAB_PATHS = ["/goodsDetail", "/pointGoodsDetail"];

function isExternalLink(url) {
  return /^https?:\/\//i.test(url) || url.startsWith("//");
}

function normalizeInternal(url) {
  return url.charAt(0) === "/" ? url : `/${url}`;
}

function pathnameOf(url) {
  return normalizeInternal(url).split("?")[0].split("#")[0];
}

export function shouldOpenNewTab(url) {
  if (!url) return false;
  if (isExternalLink(url)) return true;
  const path = pathnameOf(url);
  return NEW_TAB_PATHS.indexOf(path) !== -1;
}

export function openLink(url, router) {
  if (!url) return;
  if (isExternalLink(url)) {
    window.open(url, "_blank");
    return;
  }
  const internal = normalizeInternal(url);
  if (shouldOpenNewTab(internal)) {
    window.open(router.resolve(internal).href, "_blank");
    return;
  }
  return router.push(internal);
}
