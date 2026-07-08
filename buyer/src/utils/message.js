import { ElLoading, ElMessage, ElMessageBox } from "element-plus";

const MESSAGE_OFFSET = 36;

let loadingInstance = null;
export const Spin = {
  show(options = {}) {
    Spin.hide();
    const config =
      typeof options === "string"
        ? { text: options }
        : options && typeof options === "object"
          ? options
          : {};
    loadingInstance = ElLoading.service({
      lock: true,
      text: config.text || "加载中...",
      background: config.background || "rgba(255, 255, 255, 0.7)",
      ...config,
    });
  },
  hide() {
    if (loadingInstance) {
      loadingInstance.close();
      loadingInstance = null;
    }
  },
};

export const Message = {
  success(content) {
    return showMessage("success", content);
  },
  error(content) {
    return showMessage("error", content);
  },
  warning(content) {
    return showMessage("warning", content);
  },
  info(content) {
    return showMessage("info", content);
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
    const title = options.title || "提示";
    const boxOptions = {
      confirmButtonText: options.okText || "确定",
      cancelButtonText: options.cancelText || "取消",
      type: options.type || "warning",
    };

    if (options.loading) {
      return ElMessageBox.confirm(content, title, {
        ...boxOptions,
        beforeClose: (action, instance, done) => {
          if (action !== "confirm") {
            if (typeof options.onCancel === "function") {
              options.onCancel();
            }
            done();
            return;
          }
          if (typeof options.onOk !== "function") {
            done();
            return;
          }
          instance.confirmButtonLoading = true;
          Promise.resolve(options.onOk())
            .then(() => {
              instance.confirmButtonLoading = false;
              done();
            })
            .catch(() => {
              instance.confirmButtonLoading = false;
            });
        },
      });
    }

    return ElMessageBox.confirm(content, title, boxOptions)
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

function showMessage(type, content) {
  return ElMessage[type]({
    message: normalize(content),
    offset: MESSAGE_OFFSET,
  });
}

function normalize(content) {  if (typeof content === "string") return content;
  if (content && content.content) return content.content;
  return String(content ?? "");
}

export function setupLegacyMessage(app) {
  app.config.globalProperties.$Message = Message;
  app.config.globalProperties.$Modal = Modal;
  app.config.globalProperties.$Notice = Notice;
  app.config.globalProperties.$Spin = Spin;
}
