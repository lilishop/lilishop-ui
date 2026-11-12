/**
 * 商家导航的权限菜单检索及详情页归属；仅在已授权菜单中定位，不增加访问权限。
 * @author Bulbasaur
 * @since 2026-11-08
 */

// 非菜单页面回到对应业务入口；多个候选项按实际已授权入口匹配。
const DETAIL_MENUS = {
  "goods-operation-edit": ["goods"],
  "goods-template-operation-edit": ["template-goods"],
  "goods-draft-operation-edit": ["draftGoods", "draft-goods", "goods"],
  "card-key-pool": ["goods"],
  "add-coupon": ["coupon"],
  "coupon-receive": ["coupon"],
  "add-live": ["live"],
  "bill-detail": ["storeBill", "accountStatementBill"],
  "order-detail": ["orderList", "virtualOrderList"],
  "export-order-deliver": ["orderList"],
  "order-complaint-detail": ["orderComplaint"],
  "return-goods-order-detail": ["returnGoodsOrder", "returnMoneyOrder"],
  "full-discount-detail": ["full-discount", "full-cut"],
  "seckill-goods": ["seckill"],
  "pintuan-goods": ["pintuan"],
  "pintuan-edit": ["pintuan"],
  main: ["wapList"],
  renovation: ["pcList"],
  "appointment-system-form-designer": ["appointment-system-forms"],
  "procurement-purchase-order-operation": ["procurementPurchaseOrderList"],
  "procurement-inbound-operation": ["procurementInboundList"],
  "procurement-inventory-count-detail": ["procurementInventoryCountList"],
  "procurement-damage-report-operation": ["procurementDamageReportList"],
  "stock-outbound-operation": ["stockOutboundList"],
};

/** 将权限树展开为带栏目与分组信息的可跳转菜单，用于搜索和路由定位。 */
export function flattenNavigation(menus) {
  return menus.flatMap((top) => (top.children || []).flatMap((group) =>
    (group.children || []).filter((leaf) => leaf.name && typeof leaf.component === "function")
      .map((leaf) => ({ ...leaf, topName: top.name, topTitle: top.title, groupTitle: group.title }))
  ));
}

const FULL_DISCOUNT_DETAIL_MENUS = {
  FULL_GIFT: ["store-full-gift", "full-gift", "full-discount", "full-cut"],
  FULL_RATE: ["store-full-rate", "full-rate", "full-discount", "full-cut"],
  FULL_MINUS: ["full-discount", "full-cut"],
};

function resolveDetailMenuCandidates(routeName, routeQuery = {}) {
  if (routeName === "full-discount-detail") {
    const type = routeQuery?.activityType;
    if (type && FULL_DISCOUNT_DETAIL_MENUS[type]) {
      return FULL_DISCOUNT_DETAIL_MENUS[type];
    }
  }
  return DETAIL_MENUS[routeName] || [];
}

/** 优先精确匹配菜单，再匹配详情页业务入口；无授权入口时返回空，不沿用旧账号栏目。 */
export function findNavigationItem(items, routeName, routeQuery = {}) {
  return (
    items.find((item) => item.name === routeName) ||
    resolveDetailMenuCandidates(routeName, routeQuery)
      .map((name) => items.find((item) => item.name === name || item.path === name))
      .find(Boolean) ||
    null
  );
}

/** 按菜单、分组和栏目检索，空格分隔的关键词须全部匹配。 */
export function searchNavigation(items, keyword) {
  const terms = keyword.trim().toLowerCase().split(/\s+/).filter(Boolean);
  return items.filter((item) => {
    const text = `${item.topTitle} ${item.groupTitle} ${item.title}`.toLowerCase();
    return terms.every((term) => text.includes(term));
  });
}
