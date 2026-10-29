/**
 * 打印指定 DOM 区域（支持标准 A4 纵向与完整打印样式隔离）
 */
export function printElement(elementId, title = "打印发货单") {
  const el = document.getElementById(elementId);
  if (!el) {
    return;
  }
  const iframe = document.createElement("iframe");
  iframe.style.cssText = "position:fixed;right:0;bottom:0;width:0;height:0;border:0";
  document.body.appendChild(iframe);
  const doc = iframe.contentWindow.document;
  doc.open();
  doc.write(
    `<!DOCTYPE html><html><head><title>${title}</title><style>
      @page {
        size: portrait;
        margin: 8mm 10mm;
      }
      * {
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
        box-sizing: border-box !important;
      }
      html, body {
        margin: 0 !important;
        padding: 0 !important;
        background: #ffffff !important;
        width: 100% !important;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "PingFang SC", "Microsoft YaHei", sans-serif;
        color: #000000;
      }
      .invoice-wrap {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'PingFang SC', 'Microsoft YaHei', sans-serif;
        color: #000;
        padding: 4px 6px;
        background: #fff;
        line-height: 1.4;
        font-size: 12px;
        width: 100%;
      }
      .inv-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-end;
        padding-bottom: 10px;
        border-bottom: 2px solid #000;
        margin-bottom: 10px;
      }
      .inv-title-box h2 {
        margin: 0 0 4px;
        font-size: 18px;
        font-weight: 700;
        color: #000;
        letter-spacing: 1px;
      }
      .inv-sub-title {
        font-size: 10px;
        color: #555;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
      .inv-meta-right {
        text-align: right;
      }
      .barcode-svg {
        display: inline-block;
      }
      .barcode-text {
        font-family: monospace;
        font-size: 13px;
        font-weight: 700;
        margin-top: 2px;
        letter-spacing: 1px;
        color: #000;
      }
      .inv-meta-table {
        width: 100%;
        border-collapse: collapse;
        border: 1px solid #000;
        margin-bottom: 10px;
      }
      .inv-meta-table td {
        border: 1px solid #000;
        padding: 5px 8px;
        font-size: 12px;
        line-height: 16px;
      }
      .inv-meta-table .m-k {
        width: 75px;
        background: #f3f4f6;
        font-weight: 600;
        color: #111;
        text-align: center;
        white-space: nowrap;
      }
      .inv-meta-table .m-v {
        color: #000;
      }
      .inv-table {
        width: 100% !important;
        table-layout: fixed !important;
        border-collapse: collapse;
        border: 1px solid #000;
        margin-bottom: 0 !important;
        font-size: 12px;
      }
      .inv-table th {
        background: #f3f4f6;
        color: #000;
        font-weight: 700;
        text-align: center;
        padding: 6px 4px;
        border: 1px solid #000;
      }
      .inv-table td {
        padding: 6px 6px;
        border: 1px solid #000;
        color: #000;
        vertical-align: middle;
        word-break: break-all;
        overflow-wrap: break-word;
      }
      .inv-table .goods-title {
        font-weight: 600;
        line-height: 1.3;
      }
      .inv-table .goods-specs {
        font-size: 11px;
        color: #444;
        margin-top: 2px;
      }
      .check-box-square {
        display: inline-block;
        width: 14px;
        height: 14px;
        border: 1.5px solid #000;
        border-radius: 2px;
      }
      .inv-summary-bar {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 6px 10px;
        background: #f9fafb;
        border: 1px solid #000;
        border-top: none;
        margin-top: -1px !important;
        margin-bottom: 14px;
        font-size: 12px;
      }
      .inv-summary-left {
        color: #111;
        font-weight: 600;
      }
      .inv-summary-right {
        display: flex;
        gap: 16px;
        align-items: baseline;
      }
      .inv-summary-right .sum-item {
        display: flex;
        align-items: baseline;
        gap: 4px;
      }
      .inv-summary-right .sum-total {
        font-size: 15px;
        font-weight: 700;
        color: #000;
      }
      .inv-sign-area {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 12px;
        padding: 10px 4px 6px;
        border-top: 1px dashed #666;
        font-size: 12px;
        color: #222;
        margin-bottom: 6px;
      }
      .sign-line {
        border-bottom: 1px solid #000;
        display: inline-block;
        width: 80px;
        height: 14px;
        vertical-align: middle;
        margin-left: 4px;
      }
      .inv-footer-note {
        text-align: center;
        font-size: 11px;
        color: #666;
        padding-top: 6px;
        border-top: 1px solid #e5e7eb;
      }
    </style></head><body>${el.innerHTML}</body></html>`
  );
  doc.close();
  iframe.contentWindow.focus();
  setTimeout(() => {
    iframe.contentWindow.print();
    setTimeout(() => {
      if (document.body.contains(iframe)) {
        document.body.removeChild(iframe);
      }
    }, 1500);
  }, 100);
}
