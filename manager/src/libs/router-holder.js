/** 延迟持有 router 实例，避免 router ↔ util ↔ axios ↔ api 循环依赖 */
let routerInstance = null;

export function setRouter(router) {
  routerInstance = router;
}

export function getRouter() {
  return routerInstance;
}
