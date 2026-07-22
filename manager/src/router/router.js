import Main from "@/views/Main.vue";
import config from "@/config/index";

// 不作为Main组件的子页面展示的页面单独写，如下
export const loginRouter = {
  path: "/login",
  name: "login",
  meta: {
    title: `登录 - ${config.title}运营后台`
  },
  component: () => import("@/views/login.vue")
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
      title: '首页',
      name: "home_index",
      component: () => import("@/views/home/home.vue")
    },
    {
      path: "personal-center",
      title: "个人中心",
      name: "personal-center",
      meta: { title: "个人中心" },
      component: () => import("@/views/personal-center/personal-center.vue")
    },
    {
      path: "change-password",
      title: "修改密码",
      name: "change_password",
      component: () => import("@/views/change-password/change-password.vue")
    },
    {
      path: "category",
      title: "分类列表",
      name: "category",
      component: () => import("@/views/goods/goods-manage/category.vue")
    },
    {
      path: "parameter",
      title: "参数绑定",
      name: "parameter",
      component: () => import("@/views/goods/goods-manage/parameter.vue")
    },
    {
      path: "shop",
      title: "店铺列表",
      name: "shop",
      component: () => import("@/views/seller/shop/shopList.vue")
    },
    {
      path: "shop-detail",
      title: "店铺详细",
      name: "shop-detail",
      component: () => import("@/views/seller/shop/shopDetail.vue")
    },
    {
      path: "bill-detail",
      title: "结算单详情",
      name: "bill-detail",
      component: () => import("@/views/seller/bill/bill-detail.vue")
    },
    {
      path: "apply-goods",
      title: "商品审核列表",
      name: "apply-goods",
      component: () => import("@/views/goods/goods-info/goodsApply.vue")
    },
    {
      path: "manager-goods",
      title: "管理端商品列表",
      name: "manager-goods",
      component: () => import("@/views/goods/goods-info/goods.vue")
    },
    {
      path: "goods-brand",
      title: "商品品牌",
      name: "goods-brand",
      component: () => import("@/views/goods/goods-manage/brand.vue")
    },
    {
      path: "goods-category",
      title: "商品分类",
      name: "goods-category",
      component: () => import("@/views/goods/goods-manage/category.vue")
    },
    {
      path: "goods-group",
      title: "商品分组",
      name: "goods-group",
      component: () => import("@/views/goods/group/index.vue")
    },
    {
      path: "goods-parameter",
      title: "商品参数",
      name: "goods-parameter",
      component: () => import("@/views/goods/goods-manage/parameter.vue")
    },
    {
      path: "goods-parameter-edit",
      title: "编辑商品参数",
      name: "goods-parameter-edit",
      component: () => import("@/views/goods/goods-manage/parameter-edit.vue")
    },
    {
      path: "order-complaint-detail",
      title: "投诉详情",
      name: "order-complaint-detail",
      component: () =>
        import("@/views/order/after-order/orderComplaintDetail.vue")
    },
    {
      path: "order-list",
      title: "订单列表",
      name: "order-list",
      component: () => import("@/views/order/order/orderList.vue")
    },
    {
      path: "order-detail",
      title: "订单详情",
      name: "order-detail",
      component: () => import("@/views/order/order/orderDetail.vue")
    },
    {
      path: "after-order-detail",
      title: "售后单详情",
      name: "after-order-detail",
      component: () =>
        import("@/views/order/after-order/afterSaleOrderDetail.vue")
    },
    {
      path: "shop-operation",
      title: "店铺详情",
      name: "shop-operation",
      component: () => import("@/views/seller/shop/shopOperation.vue")
    },
    {
      path: "member-detail",
      title: "会员详情",
      name: "member-detail",
      component: () => import("@/views/member/list/memberDetail.vue")
    },
    {
      path: "member-group",
      title: "会员分组",
      name: "member-group",
      component: () => import("@/views/member/group/index.vue")
    },
    {
      path: "member-grade",
      title: "客户等级",
      name: "member-grade",
      component: () => import("@/views/member/grade/index.vue")
    },
    {
      path: "member-benefit",
      title: "客户权益管理",
      name: "member-benefit",
      component: () => import("@/views/member/benefit/index.vue")
    },
    {
      path: "member-grade-experience",
      title: "等级权益设置",
      name: "member-grade-experience",
      component: () => import("@/views/member/grade/experience-setting.vue")
    },
    {
      path: "member-grade-experience-log",
      title: "客户经验值记录",
      name: "member-grade-experience-log",
      component: () => import("@/views/member/grade/experience-log.vue")
    },
    

    {
      path: "goods/goods-info/goodsDetail",
      title: "商品详情",
      name: "goods-detail",
      component: () => import("@/views/goods/goods-info/goodsDetail.vue")
    },
    {
      path: "promotions/add-points-goods",
      title: "添加积分商品",
      name: "add-points-goods",
      component: () =>
        import("@/views/promotions/points-goods/points-goods-add.vue")
    },
    {
      path: "promotions/edit-points-goods",
      title: "修改积分商品",
      name: "edit-points-goods",
      component: () =>
        import("@/views/promotions/points-goods/points-goods-edit.vue")
    },
    {
      path: "promotions/manager-points-goods-category",
      title: "积分商品分类",
      name: "manager-points-goods-category",
      component: () =>
        import("@/views/promotions/points-goods-category/points-goods-category.vue")
    },
    {
      path: "promotions/add-kanJia-activity-goods",
      title: "添加砍价活动",
      name: "add-kanJia-activity-goods",
      component: () => import("@/views/promotions/kanjia/kanjia-activity-add-goods.vue")
    },
    {
      path: "promotions/edit-kanJia-activity-goods",
      title: "修改砍价活动",
      name: "edit-kanJia-activity-goods",
      component: () => import("@/views/promotions/kanjia/kanjia-activity-edit-goods.vue")
    },
    {
      path: "promotions/manager-coupon",
      title: "平台优惠券",
      name: "manager-coupon",
      component: () => import("@/views/promotions/coupon/coupon.vue")
    },
    {
      path: "promotions/gift-card-cash",
      title: "礼品卡",
      name: "manager-gift-card-cash",
      component: () =>
        import("@/views/promotions/gift-card-cash/gift-card-cash-activity.vue")
    },
    {
      path: "promotions/add-gift-card-cash-activity",
      title: "添加礼品卡",
      name: "add-gift-card-cash-activity",
      component: () =>
        import("@/views/promotions/gift-card-cash/gift-card-cash-activity-add.vue")
    },
    {
      path: "promotions/edit-gift-card-cash-activity",
      title: "编辑礼品卡",
      name: "edit-gift-card-cash-activity",
      component: () =>
        import("@/views/promotions/gift-card-cash/gift-card-cash-activity-add.vue")
    },
    {
      path: "promotions/gift-card-cash-records",
      title: "礼品卡记录",
      name: "gift-card-cash-records",
      component: () =>
        import("@/views/promotions/gift-card-cash/gift-card-cash-records.vue")
    },
    {
      path: "promotions/gift-card-cash-batch-credentials",
      title: "制卡批次卡密",
      name: "gift-card-cash-batch-credentials",
      component: () =>
        import("@/views/promotions/gift-card-cash/gift-card-cash-batch-credentials.vue")
    },
    {
      path: "promotions/coupon-receive",
      title: "优惠券领取记录",
      name: "coupon-receive",
      component: () => import("@/views/promotions/coupon/coupon-receive.vue"),
    },
    {
      path: "promotions/add-platform-coupon",
      title: "添加平台优惠券",
      name: "add-platform-coupon",
      component: () => import("@/views/promotions/coupon/coupon-publish.vue")
    },
    {
      path: "promotions/edit-platform-coupon",
      title: "编辑平台优惠券",
      name: "edit-platform-coupon",
      component: () => import("@/views/promotions/coupon/coupon-publish.vue")
    },
    {
      path: "promotions/add-coupon-activity",
      title: "添加优惠券活动",
      name: "add-coupon-activity",
      component: () => import("@/views/promotions/coupon-activity/coupon-publish.vue")
    },
    {
      path: "promotions/edit-coupon-activity",
      title: "编辑平台优惠券活动",
      name: "edit-coupon-activity",
      component: () => import("@/views/promotions/coupon-activity/coupon-publish.vue")
    },
    {
      path: "promotions/coupon-activity-info",
      title: "券活动详情",
      name: "coupon-activity-info",
      component: () => import("@/views/promotions/coupon-activity/coupon-info.vue")
    },
    {
      path: "promotions/manager-pintuan",
      title: "平台拼团",
      name: "manager-pintuan",
      component: () => import("@/views/promotions/pintuan/pintuan.vue")
    },
    {
      path: "promotions/pintuan/pintuan-goods",
      title: "拼团商品",
      name: "pintuan-goods",
      component: () => import("@/views/promotions/pintuan/pintuan-goods.vue")
    },
    {
      path: "promotions/full-discount-detail",
      title: "满减满折详情",
      name: "full-discount-detail",
      component: () => import("@/views/promotions/full-discount/full-discount-detail.vue")
    },
    {
      path: "promotions/flash-discount",
      title: "限时直降",
      name: "flash-discount",
      component: () => import("@/views/promotions/flash-discount/flash-discount.vue")
    },
    {
      path: "promotions/nth-item-discount",
      title: "第N件优惠",
      name: "nth-item-discount",
      component: () => import("@/views/promotions/nth-item-discount/nth-item-discount.vue")
    },
    {
      path: "promotions/seckill/manager-seckill-add",
      title: "编辑秒杀活动",
      name: "manager-seckill-add",
      component: () => import("@/views/promotions/seckill/seckill-add.vue")
    },
    {
      path: "promotions/seckill/seckill-goods",
      title: "秒杀商品",
      name: "seckill-goods",
      component: () => import("@/views/promotions/seckill/seckill-goods.vue")
    },
    {
      path: "/floorList/renovation",
      title: "编辑模板",
      name: "renovation",
      component: () => import("@/views/page-decoration/renovation.vue")
    },
    {
      path: "/floorList/main",
      title: "编辑模板",
      name: "main",
      component: () => import("@/views/page-decoration/wap/main.vue")
    },
    {
      path: "/floorList/theme-setting",
      title: "主题色设置",
      name: "theme-setting",
      component: () => import("@/views/page-decoration/theme-setting.vue")
    },
    {
      path: "add-sms-sign",
      title: "短信签名",
      name: "add-sms-sign",
      component: () => import("@/views/sys/message/smsSign.vue")
    },
    {
      path: "live-add",
      title: "创建直播",
      name: "live-add",
      component: () => import("@/views/live/add.vue")
    },
    {
      path: "live-edit",
      title: "编辑直播",
      name: "live-edit",
      component: () => import("@/views/live/edit.vue")
    },
    {
      path: "live-manage-detail",
      title: "直播详情",
      name: "live-manage-detail",
      component: () => import("@/views/live/detail.vue")
    },
    {
      path: "live-control-panel",
      title: "直播中控台",
      name: "live-control-panel",
      component: () => import("@/views/live/control-panel.vue")
    },
    {
      path: "live-detail",
      title: "查看直播",
      name: "live-detail",
      component: () => import("@/views/promotions/live/live-detail.vue")
    },
    {
      path: "finance-platform-report",
      title: "平台经营报表",
      name: "finance-platform-report",
      component: () => import("@/views/finance/platform-report.vue")
    },
    {
      path: "finance-store-settlement",
      title: "店铺结算汇总",
      name: "finance-store-settlement",
      component: () => import("@/views/finance/store-settlement.vue")
    },
    {
      path: "finance-payment-method",
      title: "支付方式汇总",
      name: "finance-payment-method",
      component: () => import("@/views/finance/payment-method.vue")
    },
    {
      path: "finance-settlement-ledger",
      title: "结算台账",
      name: "finance-settlement-ledger",
      component: () => import("@/views/finance/settlement-ledger.vue")
    },
    {
      path: "finance-refund-log",
      title: "退款流水",
      name: "finance-refund-log",
      component: () => import("@/views/finance/refundLog.vue")
    },
    {
      path: "finance-wallet-log",
      title: "钱包流水",
      name: "finance-wallet-log",
      component: () => import("@/views/finance/walletLog.vue")
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
      path: "procurement/purchase-order/detail",
      title: "采购单详情",
      name: "manager-procurement-order-detail",
      component: () => import("@/views/procurement/purchase-order/detail.vue")
    },
    {
      path: "procurement/inbound/detail",
      title: "入库单详情",
      name: "manager-procurement-inbound-detail",
      component: () => import("@/views/procurement/inbound/detail.vue")
    },
    {
      path: "procurement/inventory-count/detail",
      title: "盘点单详情",
      name: "manager-inventory-count-detail",
      component: () => import("@/views/procurement/inventory-count/detail.vue")
    },
    {
      path: "procurement/damage-report/detail",
      title: "报损单详情",
      name: "manager-damage-report-detail",
      component: () => import("@/views/procurement/damage-report/detail.vue")
    }
  ]
};

export const page404 = {
  path: "/*",
  name: "error-404",
  meta: {
    title: "404-页面不存在"
  },
  component: () => import("@/views/error-page/404.vue")
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

export const externalLink = {
  path: "/external-link",
  meta: {
    title: "外部链接"
  },
  name: "external-link",
  component: () => import("@/views/external-link/index.vue")
};

// 所有上面定义的路由都要写在下面的routers里
export const routers = [loginRouter, otherRouter, page500, page403, externalLink];
