import Main from "@/views/Main.vue";
import config from "@/config/index";
// 不作为Main组件的子页面展示的页面单独写，如下
export const loginRouter = {
  path: "/login",
  name: "login",
  meta: {
    title: `登录 - ${config.title}商家后台`
  },
  component: () => import("@/views/login.vue")
};
export const forgetPasswordRouter = {
  path: "/forgetPassword",
  name: "forgetPassword",
  component: () => import("@/views/ForgetPassword.vue")
};

// 作为Main组件的子页面展示但是不在左侧菜单显示的路由写在otherRouter里
export const otherRouter = {
  path: "/",
  name: "otherRouter",
  redirect: "/home",
  component: Main,
  children: [
    {
      path: "home",
      title: "首页",
      name: "home_index",
      component: () => import("@/views/home/home.vue")
    },
    {
      path: "change-password",
      title: "修改密码",
      name: "change_pass",
      component: () => import("@/views/change-password/change-password.vue")
    },
    {
      path: "message",
      title: "消息中心",
      name: "message_index",
      component: () => import("@/views/message/message.vue")
    },
    {
      path: "goods-operation",
      title: "添加商品",
      name: "goods-operation",
      component: () => import("@/views/goods/goods-seller/goodsOperation.vue")
    },
    {
      path: "goods-operation-edit",
      title: "编辑商品",
      name: "goods-operation-edit",
      component: () => import("@/views/goods/goods-seller/goodsOperation.vue")
    },
    {
      path: "goods-template-operation-edit",
      title: "编辑模版",
      name: "goods-template-operation-edit",
      component: () => import("@/views/goods/goods-seller/goodsOperation.vue")
    },
    {
      path: "goods-draft-operation-edit",
      title: "编辑草稿",
      name: "goods-draft-operation-edit",
      component: () => import("@/views/goods/goods-seller/goodsOperation.vue")
    },
    /** 卡密商品（E_COUPON）卡池管理；query: skuId（必填）, goodsId, goodsName */
    {
      path: "card-key-pool",
      title: "卡池管理",
      name: "card-key-pool",
      component: () => import("@/views/goods/card-key/cardKeyPool.vue")
    },
    {
      path: "add-coupon",
      title: "店铺优惠券",
      name: "add-coupon",
      component: () => import("@/views/promotion/coupon/coupon-publish.vue")
    },
    {
      path: "add-live",
      title: "创建直播",
      name: "add-live",
      component: () => import("@/views/promotion/live/addLive.vue")
    },
    {
      path: "bill-detail",
      title: "结算单详情",
      name: "bill-detail",
      component: () => import("@/views/shop/bill/billDetail.vue")
    },
    {
      path: "seckill-goods",
      title: "限时抢购商品",
      name: "seckill-goods",
      component: () => import("@/views/promotion/seckill/seckill-goods.vue")
    },
    {
      path: "pintuan-goods",
      title: "拼团商品",
      name: "pintuan-goods",
      component: () => import("@/views/promotion/pintuan/pintuan-goods.vue")
    },
    {
      path: "pintuan-edit",
      title: "新增拼团",
      name: "pintuan-edit",
      component: () => import("@/views/promotion/pintuan/pintuan-edit.vue")
    },
    {
      path: "order-detail",
      title: "订单详情",
      name: "order-detail",
      component: () => import("@/views/order/order/orderDetail.vue")
    },
    {
      path: "/floorList/main",
      title: "移动装修",
      name: "main",
      meta: { title: "移动装修" },
      component: () => import("@/views/shop/wap/main.vue"),
    },
    {
      path: "/pcFloorList/main",
      title: "PC装修",
      name: "renovation",
      meta: { title: "PC装修" },
      component: () => import("@/views/shop/renovation.vue"),
    },
    {
      path: "order-complaint-detail",
      title: "投诉详情",
      name: "order-complaint-detail",
      component: () =>
        import("@/views/order/after-order/orderComplaintDetail.vue")
    },
    {
      path: "return-goods-order-detail",
      title: "售后详情",
      name: "return-goods-order-detail",
      component: () =>
        import("@/views/order/after-order/reurnGoodsOrderDetail.vue")
    },
    {
      path: "full-discount-detail",
      title: "添加满额活动",
      name: "full-discount-detail",
      component: () => import("@/views/promotion/full-discount/full-discount-add.vue")
    },
    {
      path: "flash-discount-add",
      title: "限时直降",
      name: "flash-discount-add",
      component: () => import("@/views/promotion/flash-discount/flash-discount-add.vue")
    },
    {
      path: "nth-item-discount-add",
      title: "第N件优惠",
      name: "nth-item-discount-add",
      component: () => import("@/views/promotion/nth-item-discount/nth-item-discount-add.vue")
    },
    {
      path: "export-order-deliver",
      title: "发货",
      name: "export-order-deliver",
      component: () => import("@/views/order/order/exportOrderDeliver.vue")
    },
    {
      path: "promotions/coupon-receive",
      title: "优惠券领取记录",
      name: "coupon-receive",
      component: () => import("@/views/promotion/coupon/coupon-receive.vue"),
    },
    {
      path: "shop-finance-summary",
      title: "财务汇总",
      name: "shop-finance-summary",
      component: () => import("@/views/shop/finance/summary.vue")
    },
    {
      path: "statistics/store-performance",
      title: "店铺业绩报表",
      name: "storePerformanceReport",
      meta: { title: "店铺业绩报表" },
      component: () => import("@/views/statistics/store-performance.vue")
    },
    {
      path: "statistics/goods-comparison",
      title: "商品同比环比报表",
      name: "goodsComparisonReport",
      meta: { title: "商品同比环比报表" },
      component: () => import("@/views/statistics/goods-comparison.vue")
    },
    {
      path: "statistics/sales-order-detail",
      title: "销售订单明细报表",
      name: "salesOrderDetailReport",
      meta: { title: "销售订单明细报表" },
      component: () => import("@/views/statistics/sales-order-detail.vue")
    },
    {
      path: "statistics/goods-sales-summary",
      title: "商品销售汇总报表",
      name: "goodsSalesSummaryReport",
      meta: { title: "商品销售汇总报表" },
      component: () => import("@/views/statistics/goods-sales-summary.vue")
    },
    {
      path: "procurement/purchase-order/list",
      title: "采购单",
      name: "procurementPurchaseOrderList",
      component: () => import("@/views/procurement/purchase-order/list.vue")
    },
    {
      path: "procurement/purchase-order/operation",
      title: "采购单",
      name: "procurement-purchase-order-operation",
      component: () => import("@/views/procurement/purchase-order/operation.vue")
    },
    {
      path: "procurement/inbound/operation",
      title: "采购入库",
      name: "procurement-inbound-operation",
      component: () => import("@/views/procurement/inbound/operation.vue")
    },
    {
      path: "procurement/inventory-count/detail",
      title: "盘点明细",
      name: "procurement-inventory-count-detail",
      component: () => import("@/views/procurement/inventory-count/detail.vue")
    },
    {
      path: "procurement/damage-report/operation",
      title: "报损单",
      name: "procurement-damage-report-operation",
      component: () => import("@/views/procurement/damage-report/operation.vue")
    },
    {
      path: "alertQuantityWarnList",
      title: "预警商品",
      name: "alertQuantityWarnList",
      component: () => import("@/views/goods/goods-seller/alertQuantityWarn.vue")
    },
    {
      path: "alertQuantityWarnSetting",
      title: "设置预警",
      name: "alertQuantityWarnSetting",
      component: () => import("@/views/goods/goods-seller/alertQuantityWarn.vue")
    },
    {
      path: "order/returnMoneyOrder",
      title: "退款管理",
      name: "returnMoneyOrder",
      component: () => import("@/views/order/after-order/returnMoneyOrder.vue")
    },
    {
      path: "order/returnGoodsOrder",
      title: "退货管理",
      name: "returnGoodsOrder",
      component: () => import("@/views/order/after-order/returnGoodsOrder.vue")
    },
    {
      path: "order/memberComment",
      title: "评价管理",
      name: "memberComment",
      component: () => import("@/views/member/memberComment.vue")
    },
    {
      path: "bill/accountStatementBill",
      title: "财务对账",
      name: "accountStatementBill",
      component: () => import("@/views/shop/bill/accountStatementBill.vue")
    },
    {
      path: "bill/storeBill",
      title: "店铺结算",
      name: "storeBill",
      meta: { firstRouterName: "bill" },
      component: () => import("@/views/shop/bill/storeBill.vue")
    }
  ]
};

export const page403 = {
  path: "/403",
  meta: {
    title: "403-权限不足"
  },
  name: "error-403",
  component: () => import("@/views/error-page/403.vue")
};

export const page500 = {
  path: "/500",
  meta: {
    title: "500-服务端错误"
  },
  name: "error-500",
  component: () => import("@/views/error-page/500.vue")
};
// 所有上面定义的路由都要写在下面的routers里
export const routers = [loginRouter, forgetPasswordRouter, otherRouter, page500, page403];
