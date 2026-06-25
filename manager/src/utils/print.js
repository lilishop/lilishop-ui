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
      .lineH30{line-height:30px}
      .f14{font-size:14px;color:#333}
      .printgoodtitle{font-size:14px;line-height:1.5;margin-top:15px;color:#333}
      .printgoodinfo{padding:10px}
      .printgooditem{display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #eee}
      .printgoodname{flex:1}
      .printgoodguid{margin-top:4px;color:#666;font-size:12px}
      .printgoodguiditem{margin-right:8px}
      .printgoodnumber{white-space:nowrap;margin-left:12px}
    </style></head><body>${el.innerHTML}</body></html>`
  );
  doc.close();
  iframe.contentWindow.focus();
  iframe.contentWindow.print();
  setTimeout(() => document.body.removeChild(iframe), 1000);
}
