/**
 * 打印指定 DOM 区域（替代 vue-print-nb）
 */
export function printElement(elementId, title = "打印") {
  const el = document.getElementById(elementId);
  if (!el) {
    console.warn(`[print] element #${elementId} not found`);
    return;
  }
  const iframe = document.createElement("iframe");
  iframe.style.cssText = "position:fixed;right:0;bottom:0;width:0;height:0;border:0";
  document.body.appendChild(iframe);
  const doc = iframe.contentWindow.document;
  doc.open();
  doc.write(
    `<!DOCTYPE html><html><head><title>${title}</title><style>
      body{font-family:Arial,sans-serif;padding:12px;color:#333}
      table{width:100%;border-collapse:collapse}
      td,th{border:1px solid #ddd;padding:6px}
    </style></head><body>${el.innerHTML}</body></html>`
  );
  doc.close();
  iframe.contentWindow.focus();
  iframe.contentWindow.print();
  setTimeout(() => document.body.removeChild(iframe), 1000);
}
