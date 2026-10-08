// tinymce 按需加载：只有用到富文本编辑器的页面才注入脚本，避免首屏全量加载
let loadingPromise = null;

export function loadTinymce() {
  if (window.tinymce) {
    return Promise.resolve();
  }
  if (!loadingPromise) {
    loadingPromise = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = window.location.origin + process.env.BASE_URL + "tinymce/tinymce.min.js";
      script.onload = () => resolve();
      script.onerror = () => {
        loadingPromise = null;
        reject(new Error("tinymce 加载失败"));
      };
      document.head.appendChild(script);
    });
  }
  return loadingPromise;
}
