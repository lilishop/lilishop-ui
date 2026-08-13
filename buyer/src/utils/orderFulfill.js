export function isNoDeliveryPackage(pkg) {
  if (!pkg) return false;
  return pkg.fulfillmentMode === "NO_DELIVERY" || pkg.logisticsRequired === false;
}

export function isNoDeliveryOrder(packages) {
  if (!Array.isArray(packages) || !packages.length) return false;
  return packages.every(isNoDeliveryPackage);
}

export function getFulfillmentModeLabel(mode) {
  const map = {
    WHOLE: "整单发货",
    SPLIT: "拆单发货",
    NO_DELIVERY: "无需配送",
  };
  return map[mode] || mode || "-";
}
