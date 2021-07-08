import Main from "@/views/Main.vue";

// 不作为Main组件的子页面展示的页面单独写，如下
export const loginRouter = {
  path: "/login",
  name: "login",
  meta: {
    title: "登录 - lili运营后台"
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
      title: { i18n: "home" },
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
      path: "message",
      title: "消息中心",
      name: "message_index",
      component: () => import("@/views/message/message.vue")
    },
    {
      path: "category",
      title: "类型列表",
      name: "category",
      component: () => import("@/views/goods/goods-manage/category.vue")
    },
    {
      path: "message",
      title: "消息中心",
      name: "message_index",
      component: () => import("@/views/message/message.vue")
    },
    {
      path: "category",
      title: "类型列表",
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
      path: "shop-operation",
      title: "店铺操作",
      name: "shop-operation",
      component: () => import("@/views/seller/shop/shopOperation.vue")
    },
    {
      path: "shop-detail",
      title: "店铺详细",
      name: "shop-detail",
      component: () => import("@/views/seller/shop/shopDetail.vue")
    },
    {
      path: "add-edit-message",
      title: "消息详情",
      name: "add_edit_message",
      component: () =>
        import("@/views/member/message-manage/addOrEditMessage.vue")
    },
    {
      path: "add_message",
      title: "会员站内信",
      name: "add_message",
      component: () => import("@/views/member/notice/addMessage.vue")
    },
    {
      path: "message-send-detail",
      title: "消息发送详情",
      name: "message_send_detail",
      component: () =>
        import("@/views/member/message-manage/messageSendDetail.vue")
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
      path: "goods-parameter",
      title: "商品参数",
      name: "goods-parameter",
      component: () => import("@/views/goods/goods-manage/parameter.vue")
    },
    {
      path: "goods-spec",
      title: "商品参数",
      name: "goods-spec",
      component: () => import("@/views/goods/goods-manage/spec.vue")
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
      path: "goods/goods-info/goodsDetail",
      title: "商品详情",
      name: "goods-detail",
      component: () => import("@/views/goods/goods-info/goodsDetail.vue")
    },
    {
      path: "promotion/add-points-goods",
      title: "添加积分商品",
      name: "add-points-goods",
      component: () =>
        import("@/views/promotion/pointsGoods/addPointsGoods.vue")
    },
    {
      path: "promotion/edit-points-goods",
      title: "修改积分商品",
      name: "edit-points-goods",
      component: () =>
        import("@/views/promotion/pointsGoods/editPointsGoods.vue")
    },
    {
      path: "promotion/manager-points-goods-category",
      title: "积分商品分类",
      name: "manager-points-goods-category",
      component: () =>
        import("@/views/promotion/pointsGoodsCategory/pointsGoodsCategory.vue")
    },
    {
      path: "promotion/manager-coupon",
      title: "平台优惠券",
      name: "manager-coupon",
      component: () => import("@/views/promotion/coupon/coupon.vue")
    },
    {
      path: "promotion/add-platform-coupon",
      title: "添加平台优惠券",
      name: "add-platform-coupon",
      component: () => import("@/views/promotion/coupon/couponPublish.vue")
    },
    {
      path: "promotion/edit-platform-coupon",
      title: "编辑平台优惠券",
      name: "edit-platform-coupon",
      component: () => import("@/views/promotion/coupon/couponPublish.vue")
    },
    {
      path: "promotion/platform-coupon-info",
      title: "详情",
      name: "platform-coupon-info",
      component: () => import("@/views/promotion/coupon/couponInfo.vue")
    },
    {
      path: "coupon-activity/add",
      title: "添加优惠券活动",
      name: "add-coupon-activity",
      component: () => import("@/views/promotion/couponActivity/couponPublish.vue")
    },
    {
      path: "coupon-activity/edit",
      title: "编辑平台优惠券活动",
      name: "edit-coupon-activity",
      component: () => import("@/views/promotion/couponActivity/couponPublish.vue")
    },
    {
      path: "promotion/coupon-activity-info",
      title: "券活动详情",
      name: "coupon-activity-info",
      component: () => import("@/views/promotion/couponActivity/couponInfo.vue")
    },
    {
      path: "promotion/platform-coupon-info",
      title: "详情",
      name: "platform-coupon-activity",
      component: () => import("@/views/promotion/coupon/couponInfo.vue")
    },
    {
      path: "promotion/manager-pintuan",
      title: "平台拼团",
      name: "manager-pintuan",
      component: () => import("@/views/promotion/pintuan/pintuan.vue")
    },
    {
      path: "promotion/pintuan/pintuan-goods",
      title: "拼团商品",
      name: "pintuan-goods",
      component: () => import("@/views/promotion/pintuan/pintuanGoods.vue")
    },
    {
      path: "promotion/full-cut-detail",
      title: "满减满折详情",
      name: "full-cut-detail",
      component: () => import("@/views/promotion/fullCut/fullCutDetail.vue")
    },
    {
      path: "promotion/seckill/manager-seckill",
      title: "限时抢购列表",
      name: "manager-seckill",
      component: () => import("@/views/promotion/seckill/seckill.vue")
    },
    {
      path: "promotion/seckill/seckill-goods",
      title: "限时抢购商品",
      name: "seckill-goods",
      component: () => import("@/views/promotion/seckill/seckillGoods.vue")
    },
    {
      path: "promotion/seckill/manager-seckill-add",
      title: "添加限时抢购",
      name: "manager-seckill-add",
      component: () => import("@/views/promotion/seckill/addSeckill.vue")
    },
    {
      path: "/floorList/renovation",
      title: "编辑模板",
      name: "renovation",
      component: () => import("@/views/lili-floor-renovation/renovation.vue")
    },
    {
      path: "/floorList/main",
      title: "编辑模板",
      name: "main",
      component: () => import("@/views/lili-floor-renovation/wap/main.vue")
    },
    {
      path: "add-sms-sign",
      title: "短信签名",
      name: "add-sms-sign",
      component: () => import("@/views/sys/message/smsSign.vue")
    },
    {
      path: "liveDetail",
      title: "查看直播",
      name: "liveDetail",
      component: () => import("@/views/promotion/live/liveDetail.vue")
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

// 所有上面定义的路由都要写在下面的routers里
export const routers = [loginRouter, otherRouter, page500, page403];
