export const result = [
  {
    name: "lili",
    showAlways: true,
    level: 0,
    type: -1,
    title: "商品",
    path: "",
    component: "",
    icon: "md-home",
    isMenu: true,
    url: "",
    description: "",
    permTypes: [],
    children: [
      {
        name: "goods-list",
        showAlways: true,
        level: 1,
        type: 0,
        title: "商品管理",
        path: "",
        component: "Main",
        icon: "md-person",
        isMenu: true,
        url: "",
        permTypes: [],
        children: [
          {
            name: "goods-operation",
            showAlways: true,
            level: 2,
            type: 0,
            title: "商品发布",
            path: "goods-operation",
            component: "goods-operation",
            icon: "md-person",
            isMenu: true,
            url: "",
            children: null,
            permTypes: []
          },
          {
            name: "goods",
            showAlways: true,
            level: 2,
            type: 0,
            title: "商品列表",
            path: "goods",
            component: "goods/goods-seller/goods",
            icon: "md-person",
            isMenu: true,
            url: "",
            children: null,
            permTypes: []
          },
          // {
          //   name: "daft-goods",
          //   showAlways: true,
          //   level: 2,
          //   type: 0,
          //   title: "草稿商品",
          //   path: "daft-goods",
          //   component: "goods/goods-seller/draftGoods",
          //   icon: "md-person",
          //   isMenu: true,
          //   url: "",
          //   children: null,
          //   permTypes: []
          // },

          {
            path: "template-goods",
            props: {type: "TEMPLATE"},
            showAlways: true,
            level: 2,
            type: 0,
            title: "商品模版",
            component: "goods/goods-seller/draftGoods",
            icon: "md-person",
            isMenu: true,
            url: "",
            name: "template-goods",
            children: null,
            permTypes: []
          },
          {
            name: "category",
            showAlways: true,
            level: 2,
            type: 0,
            title: "店铺分类",
            path: "category",
            component: "goods/goods-manage/category",
            icon: "md-person",
            isMenu: true,
            url: "",
            children: null,
            permTypes: []
          }
        ]
      }
    ]
  },

  {
    name: "order",
    showAlways: true,
    level: 0,
    type: -1,
    title: "订单",
    path: "",
    component: "",
    icon: "md-home",
    isMenu: true,
    url: "",
    description: "",
    permTypes: [],
    children: [
      {
        name: "order",
        showAlways: true,
        level: 1,
        type: 0,
        title: "订单管理",
        path: "/order",
        component: "Main",
        icon: "md-person",
        isMenu: true,
        url: "",
        permTypes: [],
        children: [
          {
            name: "orderList",
            showAlways: true,
            level: 2,
            type: 0,
            title: "商品订单",
            path: "orderList",
            component: "order/order/orderList",
            icon: "md-person",
            isMenu: true,
            url: "",
            children: null,
            permTypes: []
          },
          {
            name: "virtualOrderList",
            showAlways: true,
            level: 2,
            type: 0,
            title: "虚拟订单",
            path: "virtualOrderList",
            component: "order/order/virtualOrderList",
            icon: "md-person",
            isMenu: true,
            url: "",
            children: null,
            permTypes: []
          }
        ]
      },
      {
        name: "memberComment",
        showAlways: true,
        level: 1,
        type: 0,
        title: "评价管理",
        path: "/order",
        component: "Main",
        icon: "md-person",
        isMenu: true,
        url: "",
        permTypes: [],
        children: [
          {
            name: "memberComment",
            showAlways: true,
            level: 2,
            type: 0,
            title: "评价管理",
            path: "memberComment",
            component: "member/memberComment",
            icon: "md-person",
            isMenu: true,
            url: "",
            children: null,
            permTypes: []
          }
        ]
      },
      {
        name: "order",
        showAlways: true,
        level: 1,
        type: 0,
        title: "售后管理",
        path: "/order",
        component: "Main",
        icon: "md-person",
        isMenu: true,
        url: "",
        permTypes: [],
        children: [
          {
            name: "returnGoodsOrder",
            showAlways: true,
            level: 2,
            type: 0,
            title: "退货管理",
            path: "returnGoodsOrder",
            component: "order/after-order/returnGoodsOrder",
            icon: "md-person",
            isMenu: true,
            url: "",
            permTypes: [],
            children: null
          },
          {
            name: "returnMoneyOrder",
            showAlways: true,
            level: 2,
            type: 0,
            title: "退款管理",
            path: "returnMoneyOrder",
            component: "order/after-order/returnMoneyOrder",
            icon: "md-person",
            isMenu: true,
            url: "",
            permTypes: [],
            children: null
          },
          {
            name: "orderComplaint",
            showAlways: true,
            level: 2,
            type: 0,
            title: "投诉管理",
            path: "orderComplaint",
            component: "order/after-order/orderComplaint",
            icon: "md-person",
            isMenu: true,
            url: "",
            permTypes: [],
            children: null
          }
        ]
      }
    ]
  },

  {
    name: "bill",
    showAlways: true,
    level: 0,
    type: -1,
    title: "财务",
    path: "",
    component: "",
    icon: "md-home",
    isMenu: true,
    url: "",
    description: "",
    permTypes: [],
    children: [
      {
        name: "bill",
        showAlways: true,
        level: 1,
        type: 0,
        title: "财务管理",
        path: "/bill",
        component: "Main",
        icon: "md-person",
        isMenu: true,
        url: "",
        permTypes: [],
        children: [
          {
            name: "accountStatementBill",
            showAlways: true,
            level: 2,
            type: 0,
            title: "财务对账",
            path: "accountStatementBill",
            component: "shop/bill/accountStatementBill",
            icon: "md-person",
            isMenu: true,
            url: "",
            permTypes: [],
            children: null
          },
          {
            name: "storeBill",
            showAlways: true,
            level: 2,
            type: 0,
            title: "店铺结算",
            path: "storeBill",
            component: "shop/bill/storeBill",
            icon: "md-person",
            isMenu: true,
            url: "",
            permTypes: [],
            children: null
          }
        ]
      },

      {
        name: "receiptManager",
        showAlways: true,
        level: 1,
        type: 0,
        title: "发票管理",
        path: "/bill",
        component: "Main",
        icon: "md-person",
        isMenu: true,
        url: "",
        permTypes: [],
        children: [
          {
            name: "receipt",
            showAlways: true,
            level: 2,
            type: 0,
            title: "发票管理",
            path: "receipt",
            component: "order/receiptManager/receipt",
            icon: "md-person",
            isMenu: true,
            url: "",
            children: null,
            permTypes: []
          }
        ]
      }
    ]
  },
  {
    name: "promotion",
    showAlways: true,
    level: 0,
    type: -1,
    title: "营销",
    path: "",
    component: "",
    icon: "md-home",
    isMenu: true,
    url: "",
    description: "",
    permTypes: [],
    children: [
      {
        name: "promotion",
        showAlways: true,
        level: 1,
        type: 0,
        title: "平台活动",
        path: "/promotion",
        component: "Main",
        icon: "md-person",
        isMenu: true,
        url: "",
        permTypes: [],
        children: [
          {
            name: "pintuan",
            showAlways: true,
            level: 2,
            type: 0,
            title: "拼团活动",
            path: "pintuan",
            component: "promotion/pintuan/pintuan",
            icon: "md-person",
            isMenu: true,
            url: "",
            permTypes: [],
            children: null
          },
          {
            name: "seckill",
            showAlways: true,
            level: 2,
            type: 0,
            title: "秒杀活动",
            path: "seckill",
            component: "promotion/seckill/seckill",
            icon: "md-person",
            isMenu: true,
            url: "",
            permTypes: [],
            children: null
          }
        ]
      },
      {
        name: "lives",
        showAlways: true,
        level: 1,
        type: 0,
        title: "直播活动",
        path: "/promotion",
        component: "Main",
        icon: "md-person",
        isMenu: true,
        url: "",
        permTypes: [],
        children: [
          {
            name: "live",
            showAlways: true,
            level: 2,
            type: 0,
            title: "直播管理",
            path: "live",
            component: "promotion/live/live",
            icon: "md-person",
            isMenu: true,
            url: "",
            permTypes: [],
            children: null
          },
          {
            name: "liveGoods",
            showAlways: true,
            level: 2,
            type: 0,
            title: "直播商品",
            path: "liveGoods",
            component: "promotion/live/liveGoods",
            icon: "md-person",
            isMenu: true,
            url: "",
            permTypes: [],
            children: null
          }
        ]
      },
      {
        name: "storePromotion",
        showAlways: true,
        level: 1,
        type: 0,
        title: "商家活动",
        path: "/storePromotion",
        component: "Main",
        icon: "md-person",
        isMenu: true,
        url: "",
        permTypes: [],
        children: [
          {
            name: "full-cut",
            showAlways: true,
            level: 2,
            type: 0,
            title: "满额活动",
            path: "full-cut",
            component: "promotion/fullCut/fullCut",
            icon: "md-person",
            isMenu: true,
            url: "",
            permTypes: [],
            children: null
          },
          {
            name: "coupon",
            showAlways: true,
            level: 2,
            type: 0,
            title: "优惠券",
            path: "coupon",
            component: "promotion/coupon/coupon",
            icon: "md-person",
            isMenu: true,
            url: "",
            permTypes: [],
            children: null
          },

        ]
      },
      {
        name: "distribution",
        showAlways: true,
        level: 1,
        type: 0,
        title: "分销管理",
        path: "/distribution",
        component: "Main",
        icon: "md-person",
        isMenu: true,
        url: "",
        permTypes: [],
        children: [
          {
            name: "distributionGoods",
            showAlways: true,
            level: 2,
            type: 0,
            title: "分销商品",
            path: "distributionGoods",
            component: "distribution/distributionGoods",
            icon: "md-person",
            isMenu: true,
            url: "",
            permTypes: [],
            children: null
          },
          {
            name: "distributionOrder",
            showAlways: true,
            level: 2,
            type: 0,
            title: "分销订单",
            path: "distributionOrder",
            component: "distribution/distributionOrder",
            icon: "md-person",
            isMenu: true,
            url: "",
            permTypes: [],
            children: null
          }
        ]
      }
    ]
  },

  {
    name: "statistics",
    showAlways: true,
    level: 0,
    type: -1,
    title: "统计",
    path: "",
    component: "",
    icon: "md-home",
    isMenu: true,
    url: "",
    description: "",
    permTypes: [],
    children: [
      {
        name: "statistics",
        showAlways: true,
        level: 1,
        type: 0,
        title: "统计管理",
        path: "/statistics",
        component: "Main",
        icon: "md-person",
        isMenu: true,
        url: "",
        permTypes: [],
        children: [
          {
            name: "goodsStatistics",
            showAlways: true,
            level: 2,
            type: 0,
            title: "商品统计",
            path: "goodsStatistics",
            component: "statistics/goods",
            icon: "md-person",
            isMenu: true,
            url: "",
            permTypes: [],
            children: null
          },
          {
            name: "orderStatistics",
            showAlways: true,
            level: 2,
            type: 0,
            title: "订单统计",
            path: "orderStatistics",
            component: "statistics/order",
            icon: "md-person",
            isMenu: true,
            url: "",
            permTypes: [],
            children: null
          },
          {
            name: "trafficStatistics",
            showAlways: true,
            level: 2,
            type: 0,
            title: "流量统计",
            path: "trafficStatistics",
            component: "statistics/traffic",
            icon: "md-person",
            isMenu: true,
            url: "",
            permTypes: [],
            children: null
          },

        ]
      }
    ]
  },

  {
    name: "settings",
    showAlways: true,
    level: 0,
    type: -1,
    title: "设置",
    path: "",
    component: "",
    icon: "md-home",
    isMenu: true,
    url: "",
    description: "",
    children: [
      {
        name: "user-manage",
        showAlways: true,
        level: 1,
        type: 0,
        title: "页面设置",
        path: "user-manage",
        component: "sys/user-manage/userManage",
        icon: "md-person",
        isMenu: true,
        url: "",
        permTypes: [],
        children: []
      },
      {
        name: "ship",
        showAlways: true,
        level: 1,
        type: 0,
        title: "配送设置",
        path: "",
        component: "Main",
        icon: "md-person",
        isMenu: true,
        url: "",
        permTypes: [],
        children: [
          {
            name: "shipTemplate",
            showAlways: true,
            level: 2,
            type: 0,
            title: "配送模板",
            path: "shipTemplate",
            component: "shop/ship/shipTemplate",
            icon: "md-person",
            isMenu: true,
            url: "",
            permTypes: [],
            children: null
          },
          {
            name: "logistics",
            showAlways: true,
            level: 2,
            type: 0,
            title: "物流公司",
            path: "logistics",
            component: "shop/ship/logistics",
            icon: "md-person",
            isMenu: true,
            url: "",
            permTypes: [],
            children: null
          }
        ]
      },
      {
        name: "shop",
        showAlways: false,
        level: 1,
        type: 0,
        title: "店铺管理",
        path: "/shop",
        component: "Main",
        icon: "md-person",
        isMenu: true,
        url: "",
        description: "",
        children: [
          {
            name: "shopSetting",
            showAlways: true,
            level: 2,
            type: 0,
            title: "店铺设置",
            path: "shopSetting",
            component: "shop/shopSetting",
            icon: "md-log-in",
            isMenu: true,
            url: null,
            description: null,
            children: null,
            permTypes: []
          },
          {
            name: "shopAddress",
            showAlways: true,
            level: 2,
            type: 0,
            title: "自提管理",
            path: "shopAddress",
            component: "shop/shopAddress",
            icon: "md-log-in",
            isMenu: true,
            url: null,
            description: null,
            children: null,
            permTypes: []
          }

        ]
      }
    ]
  },
  {
    name: "messages",
    showAlways: true,
    level: 0,
    type: -1,
    title: "消息",
    path: "",
    component: "",
    icon: "md-home",
    isMenu: true,
    url: "",
    description: "",
    children: [
      {
        name: "user-manage",
        showAlways: true,
        level: 1,
        type: 0,
        title: "系统消息",
        path: "user-manage",
        component: "sys/user-manage/userManage",
        icon: "md-person",
        isMenu: true,
        url: "",
        permTypes: [],
        children: [
          {
            name: "message_index",
            showAlways: true,
            level: 2,
            type: 0,
            title: "系统消息",
            path: "message",
            component: "message",
            icon: "md-person",
            isMenu: true,
            url: "",
            permTypes: [],
            children: null
          }
        ]
      }
    ]
  }
];
