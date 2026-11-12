import Main from "@/views/Main.vue";
// 不作为Main组件的子页面展示的页面单独写，如下
export const loginRouter = {
  path: "/login",
  name: "login",
  meta: {
    // 站点后缀由 util.title 在路由跳转时动态拼接（站点名取自接口下发缓存）
    title: "登录"
  },
  component: () => import("@/views/login.vue")
};
export const forgetPasswordRouter = {
  path: "/forgetPassword",
  name: "forgetPassword",
  component: () => import("@/views/ForgetPassword.vue")
};

// 移动端楼层装修编辑器：全屏独立页，不在 Main（左侧菜单）布局内
export const floorDecorationRouter = {
  path: "/floorList/main",
  name: "main",
  meta: {
    title: "移动装修"
  },
  component: () => import("@/views/shop/wap/main.vue")
};

// PC端楼层装修编辑器：全屏独立页，不在 Main（左侧菜单）布局内
export const pcFloorDecorationRouter = {
  path: "/pcFloorList/main",
  name: "renovation",
  meta: {
    title: "PC装修"
  },
  component: () => import("@/views/shop/renovation.vue")
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
      path: "goods-scheduled-upper",
      title: "定时上架",
      name: "goods-scheduled-upper",
      component: () => import("@/views/goods/scheduled-upper/index.vue")
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
    /** 预约服务 · 到店/上门设置、服务人员、工单、月历（菜单由后端配置，路由在此注册） */
    {
      path: "appointment/in-store-settings",
      title: "到店服务",
      name: "appointment-in-store-settings",
      component: () => import("@/views/appointment/inStoreSettings.vue")
    },
    {
      path: "appointment/on-site-settings",
      title: "上门服务",
      name: "appointment-on-site-settings",
      component: () => import("@/views/appointment/onSiteSettings.vue")
    },
    {
      path: "appointment/service-staff",
      title: "服务人员管理",
      name: "appointment-service-staff",
      component: () => import("@/views/appointment/serviceStaffList.vue")
    },
    {
      path: "appointment/work-orders",
      title: "工单管理",
      name: "appointment-work-orders",
      component: () => import("@/views/appointment/workOrderList.vue")
    },
    {
      path: "appointment/service-calendar",
      title: "服务月历",
      name: "appointment-service-calendar",
      component: () => import("@/views/appointment/serviceCalendar.vue")
    },
    {
      path: "appointment/system-forms",
      title: "系统表单",
      name: "appointment-system-forms",
      component: () => import("@/views/appointment/systemFormList.vue")
    },
    {
      path: "appointment/system-forms/designer",
      title: "表单设计器",
      name: "appointment-system-form-designer",
      component: () => import("@/views/appointment/systemFormDesigner.vue")
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
      path: "orderVerification",
      title: "订单核销",
      name: "orderVerification",
      component: () => import("@/views/order/order/orderVerification.vue")
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
export const routers = [loginRouter, forgetPasswordRouter, floorDecorationRouter, pcFloorDecorationRouter, otherRouter, page500, page403];
