/**
 * 卡密商品（E_COUPON / 电子卡券）— 买家端公共常量与工具
 *
 * 与 VIRTUAL_GOODS（核销型虚拟）区分：E_COUPON 常规促销走 BUY_NOW，
 * 特殊活动走 PINTUAN / POINTS / KANJIA；禁止 CART / VIRTUAL。
 * 需求：lilishop/docs/requirements/card-key-goods-v4.md · M-02
 *
 * @author Mike
 * @date 2026-07-31
 */
export const E_COUPON_GOODS_TYPE = "E_COUPON";
export const E_COUPON_ORDER_TYPE = "E_COUPON";

/** 单次购买数量上限（O-09 默认：min(quantity, 999)） */
export const E_COUPON_MAX_BUY_NUM = 999;

/** 常规立即购买（秒杀/满减/券/限时/第N件等） */
export const E_COUPON_CART_BUY_NOW = "BUY_NOW";
export const E_COUPON_CART_PINTUAN = "PINTUAN";
export const E_COUPON_CART_POINTS = "POINTS";
export const E_COUPON_CART_KANJIA = "KANJIA";

export function isECoupon(goodsType) {
  return goodsType === E_COUPON_GOODS_TYPE;
}

export function isECouponOrder(orderType) {
  return orderType === E_COUPON_ORDER_TYPE;
}

/** 可售库存：E_COUPON 读 SKU quantity（由卡池 syncSkuStock 同步） */
export function getECouponStock(sku) {
  if (!sku) return 0;
  return Number(sku.quantity) || 0;
}

export function getECouponMaxBuyNum(sku) {
  const stock = getECouponStock(sku);
  if (stock <= 0) return 1;
  return Math.min(stock, E_COUPON_MAX_BUY_NUM);
}

/**
 * 解析 E_COUPON 结算 cartType / way
 * @param {object} opts
 * @param {string} [opts.routeWay] 路由 query.way
 * @param {'BUY_NOW'|'PINTUAN'|'POINTS'|'KANJIA'} [opts.action] 用户点击的购买入口
 */
export function resolveECouponCartType({ routeWay, action } = {}) {
  if (action === E_COUPON_CART_PINTUAN) return E_COUPON_CART_PINTUAN;
  if (action === E_COUPON_CART_POINTS) return E_COUPON_CART_POINTS;
  if (action === E_COUPON_CART_KANJIA) return E_COUPON_CART_KANJIA;
  if (action === E_COUPON_CART_BUY_NOW) return E_COUPON_CART_BUY_NOW;
  const way = routeWay ? String(routeWay).toUpperCase() : "";
  if (way === "KANJIA") return E_COUPON_CART_KANJIA;
  if (way === "PINTUAN") return E_COUPON_CART_PINTUAN;
  if (way === "POINT" || way === "POINTS") return E_COUPON_CART_POINTS;
  return E_COUPON_CART_BUY_NOW;
}

/** 详情页 promotionMap 初始结构（切换 SKU 时完整重置） */
export function createEmptyPromotionMap() {
  return {
    SECKILL: null,
    FULL_DISCOUNT: null,
    COUPON: [],
    DISCOUNT: null,
    NTH: null,
    PINTUAN: null,
    KANJIA: null,
  };
}

/** 卡密履约状态（与后端 CardKeyFulfillStatusEnum 一致） */
export const CARD_KEY_FULFILL_STATUS = {
  PENDING: "PENDING",
  DELIVERED: "DELIVERED",
  FAILED: "FAILED",
  NOT_APPLICABLE: "NOT_APPLICABLE",
};

export const CARD_KEY_FULFILL_STATUS_TEXT = {
  PENDING: "待发放",
  DELIVERED: "已发放",
  FAILED: "发放失败",
  NOT_APPLICABLE: "不适用",
};

export function cardKeyFulfillAlertType(status) {
  const map = {
    PENDING: "info",
    DELIVERED: "success",
    FAILED: "warning",
  };
  return map[status] || "info";
}

export function formatCardKeyFulfillStatus(status) {
  return CARD_KEY_FULFILL_STATUS_TEXT[status] || status || "—";
}

export function resolveCardKeyFulfillMessage(line) {
  if (line && line.message) return line.message;
  return formatCardKeyFulfillStatus(line?.status);
}

export function isCardKeyFulfillApplicable(item) {
  if (!item) return false;
  const status = item.cardKeyFulfillStatus;
  if (status) return status !== CARD_KEY_FULFILL_STATUS.NOT_APPLICABLE;
  if (item.cardKeyDelivered != null || (item.cardKeys && item.cardKeys.length)) return true;
  return item.goodsType === E_COUPON_GOODS_TYPE;
}

function normalizeCardKeyFulfillLine(source) {
  const status =
    source.cardKeyFulfillStatus ||
    (source.cardKeyDelivered
      ? CARD_KEY_FULFILL_STATUS.DELIVERED
      : CARD_KEY_FULFILL_STATUS.PENDING);
  const cardKeys =
    status === CARD_KEY_FULFILL_STATUS.DELIVERED && source.cardKeyDelivered
      ? source.cardKeys || []
      : [];
  return {
    key: source.sn || source.orderSn || source.id || source.skuId,
    goodsName: source.goodsName,
    status,
    message: source.cardKeyFulfillMessage,
    cardKeys,
    isGift: !!source.isGift,
  };
}

/** 汇总 E_COUPON 主单行 + 满赠子单摘要的履约行 */
export function collectCardKeyFulfillLines(orderItems = [], giftSummaries = []) {
  const lines = [];
  (orderItems || []).forEach((item) => {
    if (!isCardKeyFulfillApplicable(item)) return;
    lines.push(normalizeCardKeyFulfillLine(item));
  });
  (giftSummaries || []).forEach((gift) => {
    lines.push(normalizeCardKeyFulfillLine({ ...gift, isGift: true }));
  });
  return lines;
}

export function orderHasCardKeySection({ orderItems, giftSummaries, isECouponOrder } = {}) {
  if (isECouponOrder) return true;
  if (Array.isArray(giftSummaries) && giftSummaries.length > 0) return true;
  if (collectCardKeyFulfillLines(orderItems, []).length > 0) return true;
  return (orderItems || []).some(
    (item) =>
      item.goodsType === E_COUPON_GOODS_TYPE ||
      (Array.isArray(item.cardKeys) && item.cardKeys.length > 0)
  );
}

export function flattenCardKeyFulfillLines(lines, withGoodsName = false) {
  const rows = [];
  (lines || []).forEach((line) => {
    if (line.status !== CARD_KEY_FULFILL_STATUS.DELIVERED) return;
    (line.cardKeys || []).forEach((ck) => {
      rows.push(withGoodsName ? { ...ck, goodsName: line.goodsName } : { ...ck });
    });
  });
  return rows;
}

/** 订单是否含已交付或可展示的卡密行（含满赠 E_COUPON 子单行） */
export function orderHasCardKeyContent(orderItems, giftSummaries) {
  const lines = collectCardKeyFulfillLines(orderItems, giftSummaries);
  return flattenCardKeyFulfillLines(lines).length > 0;
}

/** 扁平化订单项卡密（仅 cardKeyDelivered 且含 cardKeys；兼容旧逻辑） */
export function flattenOrderCardKeys(orderItems, withGoodsName = false, giftSummaries) {
  const lines = collectCardKeyFulfillLines(orderItems, giftSummaries);
  if (lines.some((line) => line.status)) {
    return flattenCardKeyFulfillLines(lines, withGoodsName);
  }
  const rows = [];
  (orderItems || []).forEach((item) => {
    if (!item.cardKeyDelivered || !item.cardKeys || !item.cardKeys.length) return;
    item.cardKeys.forEach((ck) => {
      rows.push(withGoodsName ? { ...ck, goodsName: item.goodsName } : { ...ck });
    });
  });
  return rows;
}

/** createTrade 后是否无需进入收银台（积分单 / 0 元 / 服务端已标记） */
export function shouldSkipPaymentPage(tradeResult, way) {
  if (!tradeResult) return false;
  if (way === E_COUPON_CART_POINTS) return true;
  if (tradeResult.needPay === false || tradeResult.paid === true) return true;
  const price =
    tradeResult.price != null
      ? Number(tradeResult.price)
      : tradeResult.flowPrice != null
        ? Number(tradeResult.flowPrice)
        : null;
  if (price != null && !Number.isNaN(price) && price <= 0) return true;
  return false;
}
