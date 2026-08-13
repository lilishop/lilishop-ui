/** @typedef {'WHOLE' | 'SPLIT' | 'NO_DELIVERY'} FulfillmentMode */

const NON_SHIPPABLE_ORDER_TYPES = ["E_COUPON", "VIRTUAL"];

/** 电子卡券 / 虚拟 / 自提订单不适用商家发货 */
export function isNonShippableOrder(order = {}) {
  if (!order) return false;
  if (NON_SHIPPABLE_ORDER_TYPES.includes(order.orderType)) return true;
  return order.deliveryMethod === "SELF_PICK_UP";
}

export function canShowShipButton(allowOperation = {}, order = {}) {
  return !!allowOperation.ship && !isNonShippableOrder(order);
}

export const FULFILLMENT_MODE_LABEL = {
  WHOLE: "整单发货",
  SPLIT: "拆单发货",
  NO_DELIVERY: "无需配送",
};

/**
 * @param {FulfillmentMode} mode
 * @param {object} form
 * @returns {string | null}
 */
export function validateFulfillForm(mode, form) {
  if (mode === "WHOLE" || mode === "SPLIT") {
    if (!form.logisticsId) return "请选择物流公司";
    if (!form.logisticsNo || !String(form.logisticsNo).trim()) return "请填写运单号";
  }
  if (mode === "NO_DELIVERY") {
    if (form.logisticsId || form.logisticsNo) return "无需配送不能填写物流信息";
    if (form.deliveryRemark && form.deliveryRemark.length > 500) {
      return "备注不能超过500字";
    }
  }
  if (mode === "SPLIT") {
    if (!form.items || !form.items.length) return "请至少选择一个商品";
    for (const item of form.items) {
      if (item.deliveryNum != null && item.deliveryNum <= 0) {
        return "发货数量必须大于0";
      }
    }
  }
  return null;
}

/** @param {object} pkg */
export function isNoDeliveryPackage(pkg) {
  if (!pkg) return false;
  return pkg.fulfillmentMode === "NO_DELIVERY" || pkg.logisticsRequired === false;
}

/** @param {string} mode */
export function getFulfillmentModeLabel(mode) {
  return FULFILLMENT_MODE_LABEL[mode] || mode || "-";
}

/**
 * @param {object} allowOperation
 * @returns {FulfillmentMode | null}
 */
export function resolveDefaultFulfillmentMode(allowOperation = {}, orderStatus) {
  if (orderStatus === "PARTS_DELIVERED") {
    return allowOperation.fulfillSplit ? "SPLIT" : null;
  }
  if (allowOperation.fulfillWhole) return "WHOLE";
  if (allowOperation.fulfillSplit) return "SPLIT";
  if (allowOperation.fulfillNoDelivery) return "NO_DELIVERY";
  return null;
}
