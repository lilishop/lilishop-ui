/**
 * 已向用户提示的请求异常兜底；只识别本模块登记的错误，不屏蔽代码异常。
 * @author Bulbasaur
 * @since 2026-11-09
 */
const handledErrors = new WeakSet();

/** 登记已由请求层提示的错误，仍保持原请求的拒绝语义。 */
export function markHandledRequestError(error) {
  handledErrors.add(error);
  // 开发服务器的错误遮罩有独立监听器，通过同一 Symbol 识别已提示的异常。
  Object.defineProperty(error, Symbol.for("lilishop.buyer.handledRequestError"), { value: true });
  return error;
}

/** 判断错误是否已由请求层向用户展示。 */
export function isHandledRequestError(error) {
  return !!error && typeof error === "object" && handledErrors.has(error);
}

/** 页面处理预期请求失败；程序错误继续向上抛出，避免被静默吞掉。 */
export function catchHandledRequestError(error) {
  if (!isHandledRequestError(error)) throw error;
}

/**
 * 覆盖未返回 Promise 的事件回调及 Vue 异步钩子；只有已提示的请求异常免于重复报错。
 * 未登记异常沿用已有 Vue 错误处理，无处理器时重新抛出供开发环境定位。
 */
export function setupRequestErrorHandling(app, target = window) {
  target.addEventListener("unhandledrejection", (event) => {
    if (isHandledRequestError(event.reason)) event.preventDefault();
  });
  const previous = app.config.errorHandler;
  app.config.errorHandler = (error, instance, info) => {
    if (isHandledRequestError(error)) return;
    if (previous) return previous(error, instance, info);
    throw error;
  };
}
