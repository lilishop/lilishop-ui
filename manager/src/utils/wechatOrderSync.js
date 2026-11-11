/**
 * 小程序订单上报状态及日志显示口径，成功仅表示发货接口受理。
 * @author Bulbasaur
 * @since 2026-11-09
 */
export const wechatSyncOptions = [
  { value: "UNCHECKED", label: "待核查", type: "info" },
  { value: "PENDING", label: "待上报", type: "warning" },
  { value: "PROCESSING", label: "处理中", type: "warning" },
  { value: "SUCCESS", label: "上报成功", type: "success" },
  { value: "FAILED", label: "上报失败", type: "danger" },
];

/** 查找页面和日志的统一状态标签，重复请求跳过使用独立说明。 */
export function wechatSyncLabel(value) {
  if (value === "SKIPPED") return "已跳过重复";
  return wechatSyncOptions.find((item) => item.value === value)?.label || value || "—";
}

/** 返回 Element Plus 标签类型，未知状态使用中性色。 */
export function wechatSyncTag(value) {
  return wechatSyncOptions.find((item) => item.value === value)?.type || "info";
}
