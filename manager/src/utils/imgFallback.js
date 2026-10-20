/**
 * 全局图片加载失败占位：
 * 在捕获阶段监听 <img> 的 error 事件（error 不冒泡），失败时替换为内联 SVG 占位图。
 * - 每张图片只替换一次，占位图自身加载失败不会再次触发，避免死循环
 * - 空 src 不处理
 * - 需要自行处理 error 的图片可添加 data-no-fallback 属性跳过
 */
const PLACEHOLDER =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64' fill='none' stroke='#c0c4cc' stroke-width='2' stroke-linejoin='round'>" +
      "<rect width='64' height='64' fill='#f5f7fa' stroke='none'/>" +
      "<rect x='14' y='18' width='36' height='28' rx='3'/>" +
      "<circle cx='25' cy='28' r='3'/>" +
      "<path d='M14 42l10-9 8 7 6-5 12 9'/></svg>"
  );

export function setupImgFallback() {
  document.addEventListener(
    "error",
    (event) => {
      const el = event.target;
      if (!el || el.tagName !== "IMG") return;
      if (el.dataset.noFallback !== undefined || el.dataset.fallbackApplied) return;
      if (!el.getAttribute("src")) return;
      el.dataset.fallbackApplied = "1";
      el.src = PLACEHOLDER;
    },
    true
  );
}
