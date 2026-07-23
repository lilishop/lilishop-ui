/**
 * IM 身份判断（与 main-mixin.loadUserSetting 一致）
 * - 买家从商城「联系客服」进入：URL 带 ?id=店铺ID
 * - 商家从商家后台进入：URL 无 id
 */
export function isBuyerImMode(route) {
  return !!route?.query?.id;
}

export function isStoreImMode(route) {
  return !isBuyerImMode(route);
}

export function syncImTokenFromRoute(route, setTokenFn) {
  const token = route?.query?.token;
  if (token) {
    setTokenFn(token);
  }
}
