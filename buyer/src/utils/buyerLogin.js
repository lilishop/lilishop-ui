/**
 * 买家端内部链接跳转（首页装修、列表等共用）
 *
 * @author Mike
 * @date 2026-08-05
 */

/** 内部链接新窗口打开，外链直接打开。浏览商品详情不要求登录。 */
export function openLink(url, router) {
  if (!url) return;
  if (url.charAt(0) !== "/") {
    window.open(url, "_blank");
    return;
  }
  window.open(router.resolve(url).href, "_blank");
}
