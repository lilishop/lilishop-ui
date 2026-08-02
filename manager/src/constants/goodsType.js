/**
 * 卡密商品（E_COUPON）— 平台端公共常量
 *
 * @author Mike
 * @date 2026-08-02
 */
export const E_COUPON_GOODS_TYPE = "E_COUPON";

export function isECoupon(goodsType) {
  return goodsType === E_COUPON_GOODS_TYPE;
}

export function goodsTypeLabel(goodsType) {
  const map = {
    E_COUPON: "电子卡券",
    VIRTUAL_GOODS: "虚拟商品",
    PHYSICAL_GOODS: "实物商品",
  };
  return map[goodsType] || goodsType || "—";
}

export function goodsTypeTagType(goodsType) {
  if (goodsType === E_COUPON_GOODS_TYPE) return "warning";
  if (goodsType === "VIRTUAL_GOODS") return "info";
  return "";
}

export function eCouponStockHint(goodsType) {
  if (!isECoupon(goodsType)) return "";
  return "库存来自卡池同步（quantity）";
}

export function promotionPriceMin(goodsType) {
  return isECoupon(goodsType) ? 0 : 0.01;
}
