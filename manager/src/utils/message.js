import { ElMessage, ElMessageBox } from "element-plus";

const MESSAGE_BOX_Z_STYLE_ID = "lili-message-box-z-style";

/** EP 2.14 打开 MessageBox 时会用 nextZIndex() 覆盖 options.zIndex，需动态压过当前最高遮罩 */
function getMaxOverlayZIndex() {
  if (typeof document === "undefined") {
    return 2000;
  }
  let max = 2000;
  document.querySelectorAll(".el-overlay").forEach((el) => {
    const z = Number.parseInt(window.getComputedStyle(el).zIndex, 10);
    if (Number.isFinite(z) && z > max) {
      max = z;
    }
  });
  return max + 100;
}

function applyMessageBoxLayerZIndex(zIndex) {
  if (typeof document === "undefined") {
    return;
  }
  let styleEl = document.getElementById(MESSAGE_BOX_Z_STYLE_ID);
  if (!styleEl) {
    styleEl = document.createElement("style");
    styleEl.id = MESSAGE_BOX_Z_STYLE_ID;
    document.head.appendChild(styleEl);
  }
  styleEl.textContent = `.el-overlay.is-message-box { z-index: ${zIndex} !important; }`;
}

function prepareMessageBoxLayer(options = {}) {
  const zIndex = options.zIndex ?? getMaxOverlayZIndex();
  applyMessageBoxLayerZIndex(zIndex);
  return zIndex;
}

/**
 * 兼容原 view-design Message API，便于业务页渐进迁移
 */
export const Message = {
  success(content) {
    return ElMessage.success(normalize(content));
  },
  error(content) {
    return ElMessage.error(normalize(content));
  },
  warning(content) {
    return ElMessage.warning(normalize(content));
  },
  info(content) {
    return ElMessage.info(normalize(content));
  },
};

export const Notice = {
  open(options = {}) {
    const fn = Message[options.type] || Message.info;
    return fn(options.desc || options.title || "");
  },
  info(options) {
    return Message.info(options?.desc || options?.title || "");
  },
  success(options) {
    return Message.success(options?.desc || options?.title || "");
  },
  warning(options) {
    return Message.warning(options?.desc || options?.title || "");
  },
  error(options) {
    return Message.error(options?.desc || options?.title || "");
  },
};

export const Modal = {
  confirm(options = {}) {
    prepareMessageBoxLayer(options);
    const content = normalizeModalContent(options.content || options.title || "确认操作？");
    const title = options.title || "提示";
    return ElMessageBox.confirm(content, title, {
      confirmButtonText: options.okText || "确定",
      cancelButtonText: options.cancelText || "取消",
      type: options.type || "warning",
      beforeClose: (action, instance, done) => {
        if (action !== "confirm") {
          done();
          if (typeof options.onCancel === "function") {
            options.onCancel();
          }
          return;
        }
        if (typeof options.onOk !== "function") {
          done();
          return;
        }
        const result = options.onOk();
        if (result && typeof result.then === "function") {
          instance.confirmButtonLoading = true;
          result
            .then(() => done())
            .catch(() => {})
            .finally(() => {
              instance.confirmButtonLoading = false;
            });
          return;
        }
        done();
      },
    }).catch(() => {
      if (typeof options.onCancel === "function") {
        options.onCancel();
      }
    });
  },
  warning(options = {}) {
    prepareMessageBoxLayer(options);
    const content = normalizeModalContent(options.content || options.title || "");
    const title = options.title || "提示";
    return ElMessageBox.alert(content, title, {
      confirmButtonText: options.okText || "确定",
      type: "warning",
    }).then(() => {
      if (typeof options.onOk === "function") {
        return options.onOk();
      }
    });
  },
  remove() {
    try {
      ElMessageBox.close();
    } catch (_) {
      // MessageBox 已关闭时忽略，避免操作已销毁 DOM 触发 parentNode 报错
    }
  },
};

function normalize(content) {
  if (typeof content === "string") return content;
  if (content && content.content) return content.content;
  return String(content ?? "");
}

function normalizeModalContent(content) {
  const text = normalize(content);
  return text.replace(/<\/?p>/gi, "").trim();
}

export function setupLegacyMessage(app) {
  app.config.globalProperties.$Message = Message;
  app.config.globalProperties.$Modal = Modal;
  app.config.globalProperties.$Notice = Notice;
}
