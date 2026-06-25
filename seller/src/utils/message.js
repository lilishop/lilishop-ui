import { ElMessage, ElMessageBox } from "element-plus";

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
    const content = options.content || options.title || "确认操作？";
    return ElMessageBox.confirm(content, options.title || "提示", {
      confirmButtonText: options.okText || "确定",
      cancelButtonText: options.cancelText || "取消",
      type: options.type || "warning",
    })
      .then(() => {
        if (typeof options.onOk === "function") {
          return options.onOk();
        }
      })
      .catch(() => {
        if (typeof options.onCancel === "function") {
          options.onCancel();
        }
      });
  },
  warning(options = {}) {
    const content = options.content || options.title || "";
    return ElMessageBox.alert(content, options.title || "提示", {
      confirmButtonText: options.okText || "确定",
      type: "warning",
    }).then(() => {
      if (typeof options.onOk === "function") {
        return options.onOk();
      }
    });
  },
  remove() {
    ElMessageBox.close();
  },
};

function normalize(content) {
  if (typeof content === "string") return content;
  if (content && content.content) return content.content;
  return String(content ?? "");
}

export function setupLegacyMessage(app) {
  app.config.globalProperties.$Message = Message;
  app.config.globalProperties.$Modal = Modal;
  app.config.globalProperties.$Notice = Notice;
}
