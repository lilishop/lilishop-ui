/**
 * 触发浏览器下载 blob 响应
 */
export function downloadBlob(blob, filename) {
  if (!blob) return;
  const link = document.createElement("a");
  link.style.display = "none";
  const url = window.URL.createObjectURL(new Blob([blob]));
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}
