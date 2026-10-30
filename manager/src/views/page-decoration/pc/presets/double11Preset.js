export const DOUBLE11_PAGE_DOCUMENT = {
  "version": 2,
  "pageType": "INDEX",
  "name": "双11 平台首页",
  "pageStyle": {
    "backgroundColor": "#ffffff"
  },
  "list": [
    {
      "id": "row_top_bar",
      "rowStyle": {
        "width": "100%",
        "backgroundColor": "#0f172a",
        "margin": [
          0,
          0,
          0,
          0
        ],
        "padding": [
          0,
          0,
          0,
          0
        ],
        "height": 40
      },
      "components": [
        {
          "id": "cmp_top_bar",
          "type": "topBar",
          "name": "快捷栏",
          "componentStyle": {
            "widthRatio": "100%",
            "backgroundColor": "transparent"
          },
          "options": {
            "showCity": true,
            "defaultCity": "北京市",
            "showThemeToggle": false,
            "showCart": true,
            "showOrder": true,
            "quickLinks": [
              {
                "title": "双11超级会场",
                "url": "/special"
              },
              {
                "title": "企业特惠采购",
                "url": "/company"
              },
              {
                "title": "官方客户服务",
                "url": "/article"
              },
              {
                "title": "无障碍浏览",
                "url": "/accessible"
              }
            ]
          }
        }
      ]
    },
    {
      "id": "row_search_header",
      "rowStyle": {
        "width": "1200",
        "backgroundColor": "#ffffff",
        "margin": [
          0,
          0,
          0,
          0
        ],
        "padding": [
          12,
          0,
          12,
          0
        ],
        "height": 120
      },
      "components": [
        {
          "id": "cmp_search_header",
          "type": "searchHeader",
          "name": "搜索头",
          "componentStyle": {
            "widthRatio": "100%",
            "backgroundColor": "#ffffff"
          },
          "options": {
            "logoUrl": "https://lilishop-pc.oss-cn-beijing.aliyuncs.com/static/logo/logo.png",
            "logoAlt": "双11全球狂欢节",
            "placeholder": "双11爆款 5折封顶 · 跨店每满300减50",
            "hotWords": [
              "iPhone 16 Pro",
              "雅诗兰黛小棕瓶",
              "戴森吹风机",
              "华为Mate 70",
              "五粮液普五",
              "耐克碳板跑鞋"
            ],
            "showSearchTypes": true,
            "defaultSearchType": "goods",
            "storePlaceholder": "请输入店铺名称"
          }
        }
      ]
    },
    {
      "id": "row_cat_nav",
      "rowStyle": {
        "width": "1200",
        "backgroundColor": "#ffffff",
        "margin": [
          0,
          0,
          12,
          0
        ],
        "padding": [
          0,
          0,
          0,
          0
        ],
        "height": 48
      },
      "components": [
        {
          "id": "cmp_cat_nav",
          "type": "categoryNav",
          "name": "类目导航",
          "componentStyle": {
            "widthRatio": "100%",
            "backgroundColor": "#ffffff"
          },
          "options": {
            "categories": [
              {
                "id": "1",
                "name": "双11狂欢主会场",
                "href": "/special",
                "active": true
              },
              {
                "id": "2",
                "name": "潮流数码",
                "href": "/goodsList?categoryId=1"
              },
              {
                "id": "3",
                "name": "奢宠美妆",
                "href": "/goodsList?categoryId=2"
              },
              {
                "id": "4",
                "name": "品质家电",
                "href": "/goodsList?categoryId=3"
              },
              {
                "id": "5",
                "name": "服饰鞋包",
                "href": "/goodsList?categoryId=4"
              },
              {
                "id": "6",
                "name": "生鲜食品",
                "href": "/goodsList?categoryId=5"
              },
              {
                "id": "7",
                "name": "领券中心",
                "href": "/couponCenter"
              }
            ]
          }
        }
      ]
    },
    {
      "id": "row_hero_three_col",
      "rowStyle": {
        "width": "1200",
        "backgroundColor": "transparent",
        "margin": [
          0,
          0,
          14,
          0
        ],
        "padding": [
          0,
          0,
          0,
          0
        ],
        "justifyContent": "space-between",
        "alignItems": "stretch",
        "gap": 12,
        "height": 320
      },
      "components": [
        {
          "id": "cmp_mega_menu",
          "type": "categoryMegaMenu",
          "name": "多级菜单",
          "componentStyle": {
            "widthRatio": "16.67%",
            "backgroundColor": "#ffffff",
            "radius": [
              8,
              8,
              8,
              8
            ],
            "padding": [
              0,
              0,
              0,
              0
            ]
          },
          "options": {
            "showAll": true,
            "categories": [
              {
                "id": "c1",
                "name": "潮流数码"
              },
              {
                "id": "c2",
                "name": "奢宠美妆"
              },
              {
                "id": "c3",
                "name": "智能家电"
              },
              {
                "id": "c4",
                "name": "服饰鞋包"
              },
              {
                "id": "c5",
                "name": "运动潮流"
              },
              {
                "id": "c6",
                "name": "精品生鲜"
              },
              {
                "id": "c7",
                "name": "居家生活"
              },
              {
                "id": "c8",
                "name": "母婴玩具"
              }
            ],
            "title": "分类"
          }
        },
        {
          "id": "cmp_carousel",
          "type": "carousel",
          "name": "轮播图",
          "componentStyle": {
            "widthRatio": "66.67%",
            "backgroundColor": "#ffffff",
            "radius": [
              8,
              8,
              8,
              8
            ],
            "padding": [
              0,
              0,
              0,
              0
            ]
          },
          "options": {
            "interval": 4000,
            "height": 420,
            "banners": [
              {
                "title": "双11全球狂欢 · 潮流数码甄选",
                "subtitle": "定金膨胀100抵300 抢千元大额神券",
                "image": "https://lilishop-pc.oss-cn-beijing.aliyuncs.com/static/carousel/banner_1.png",
                "url": "/goodsList"
              },
              {
                "title": "奢宠美妆 · 经典护肤狂欢",
                "subtitle": "买1赠1正装量 跨店每满300减50",
                "image": "https://lilishop-pc.oss-cn-beijing.aliyuncs.com/static/carousel/banner_2.png",
                "url": "/goodsList"
              },
              {
                "title": "运动潮流 · 破界开练",
                "subtitle": "顶级碳板竞速 全场低至5折起",
                "image": "https://lilishop-pc.oss-cn-beijing.aliyuncs.com/static/carousel/banner_3.png",
                "url": "/goodsList"
              },
              {
                "title": "极简家居 · 美学生活",
                "subtitle": "大牌家电以旧换新 至高补贴20%",
                "image": "https://lilishop-pc.oss-cn-beijing.aliyuncs.com/static/carousel/banner_4.png",
                "url": "/goodsList"
              }
            ],
            "fitMode": "contain"
          }
        },
        {
          "id": "cmp_user_benefits",
          "type": "userBenefits",
          "name": "用户权益",
          "componentStyle": {
            "widthRatio": "16.67%",
            "backgroundColor": "#ffffff",
            "radius": [
              8,
              8,
              8,
              8
            ],
            "padding": [
              0,
              0,
              0,
              0
            ]
          },
          "options": {
            "badgeText": "请登录",
            "welcomeText": "欢迎来到商城",
            "subtitle": "登录后查看专属权益",
            "avatar": "",
            "loginText": "登录",
            "registerText": "注册",
            "loginUrl": "/login",
            "registerUrl": "/signUp",
            "showCart": true,
            "showCoupons": true,
            "showOrders": true,
            "cartText": "购物车",
            "couponText": "优惠券",
            "orderText": "订单",
            "cartUrl": "/cart",
            "couponUrl": "/member/coupon",
            "orderUrl": "/member/order"
          }
        }
      ]
    },
    {
      "id": "row_notice",
      "rowStyle": {
        "width": "1200",
        "backgroundColor": "#ffffff",
        "margin": [
          0,
          0,
          14,
          0
        ],
        "padding": [
          4,
          12,
          4,
          12
        ],
        "borderRadius": "8px",
        "height": 40
      },
      "components": [
        {
          "id": "cmp_notice",
          "type": "noticeBar",
          "name": "公告快讯",
          "componentStyle": {
            "widthRatio": "100%",
            "backgroundColor": "transparent"
          },
          "options": {
            "title": "双11大促快讯",
            "scrollSpeed": 3500,
            "notices": [
              {
                "tag": "狂欢速递",
                "text": "双11大促全面开启！跨店每满300减50，可叠加全品类大额神券！",
                "time": "10分钟前",
                "url": "/article"
              },
              {
                "tag": "官方保障",
                "text": "全场大促商品保价至11月30日，买贵一键退差价！顺丰次日达！",
                "time": "30分钟前",
                "url": "/article"
              },
              {
                "tag": "整点免单",
                "text": "每晚8点锁定直播间，整点抽免单锦鲤，大额无门槛红包疯狂撒！",
                "time": "1小时前",
                "url": "/article"
              },
              {
                "tag": "物流升级",
                "text": "全国核心仓全面开跑，千万级爆款预售好物极速发货次日达！",
                "time": "2小时前",
                "url": "/article"
              }
            ]
          }
        }
      ]
    },
    {
      "id": "row_channels",
      "rowStyle": {
        "width": "1200",
        "backgroundColor": "#ffffff",
        "margin": [
          0,
          0,
          16,
          0
        ],
        "padding": [
          16,
          14,
          16,
          14
        ],
        "borderRadius": "8px",
        "height": 120
      },
      "components": [
        {
          "id": "cmp_channel_grid",
          "type": "channelGrid",
          "name": "频道宫格",
          "componentStyle": {
            "widthRatio": "100%",
            "backgroundColor": "transparent"
          },
          "options": {
            "columns": 5,
            "channels": [
              {
                "id": "1",
                "title": "双11预售",
                "subtitle": "定金最高膨胀3倍",
                "icon": "Present",
                "url": "/special"
              },
              {
                "id": "2",
                "title": "领券中心",
                "subtitle": "跨店每满300减50",
                "icon": "Ticket",
                "url": "/couponCenter"
              },
              {
                "id": "3",
                "title": "百亿补贴",
                "subtitle": "大牌正品官方补",
                "icon": "Medal",
                "url": "/goodsList"
              },
              {
                "id": "4",
                "title": "限时秒杀",
                "subtitle": "爆款低至1折抢",
                "icon": "Timer",
                "url": "/goodsList"
              },
              {
                "id": "5",
                "title": "大牌免息",
                "subtitle": "至高24期分期免息",
                "icon": "CreditCard",
                "url": "/goodsList"
              },
              {
                "id": "6",
                "title": "新品首发",
                "subtitle": "年度重磅科技旗舰",
                "icon": "Opportunity",
                "url": "/goodsList"
              },
              {
                "id": "7",
                "title": "潮流数码",
                "subtitle": "旗舰手机立省千元",
                "icon": "Cellphone",
                "url": "/goodsList"
              },
              {
                "id": "8",
                "title": "奢宠美妆",
                "subtitle": "买1赠1大牌正装",
                "icon": "MagicStick",
                "url": "/goodsList"
              },
              {
                "id": "9",
                "title": "超市生鲜",
                "subtitle": "原产地直采次日达",
                "icon": "Shop",
                "url": "/goodsList"
              },
              {
                "id": "10",
                "title": "会员专享",
                "subtitle": "积分当钱双倍膨胀",
                "icon": "Trophy",
                "url": "/member"
              }
            ]
          }
        }
      ]
    },
    {
      "id": "row_coupon_title",
      "rowStyle": {
        "width": "1200",
        "backgroundColor": "transparent",
        "margin": [
          0,
          0,
          8,
          0
        ],
        "padding": [
          0,
          0,
          0,
          0
        ],
        "height": 48
      },
      "components": [
        {
          "id": "cmp_coupon_title",
          "type": "titleBar",
          "name": "标题栏",
          "componentStyle": {
            "widthRatio": "100%",
            "backgroundColor": "transparent"
          },
          "options": {
            "title": "双11狂欢领券中心",
            "subtitle": "MEGA COUPONS · 跨店每满300减50 整点限量秒",
            "tag": "叠券折上折",
            "moreText": "前往领券中心 >",
            "moreUrl": "/couponCenter"
          }
        }
      ]
    },
    {
      "id": "row_coupons",
      "rowStyle": {
        "width": "1200",
        "backgroundColor": "transparent",
        "margin": [
          0,
          0,
          16,
          0
        ],
        "padding": [
          0,
          0,
          0,
          0
        ],
        "height": 160
      },
      "components": [
        {
          "id": "cmp_coupon_list",
          "type": "couponList",
          "name": "优惠券",
          "componentStyle": {
            "widthRatio": "100%",
            "backgroundColor": "transparent"
          },
          "options": {
            "columns": 4,
            "skin": "red",
            "showLimitText": true,
            "coupons": [
              {
                "id": "1",
                "price": 50,
                "consumeThreshold": 300,
                "title": "双11跨店通用券",
                "limitText": "全场跨店可用 每满300减50"
              },
              {
                "id": "2",
                "price": 100,
                "consumeThreshold": 699,
                "title": "潮流数码专享神券",
                "limitText": "手机/电脑/智能数码专享"
              },
              {
                "id": "3",
                "price": 200,
                "consumeThreshold": 1200,
                "title": "品质家电重磅狂欢券",
                "limitText": "大牌家电以旧换新专区"
              },
              {
                "id": "4",
                "price": 30,
                "consumeThreshold": 99,
                "title": "双11新客超级礼金",
                "limitText": "首次下单无门槛专属立减"
              }
            ]
          }
        }
      ]
    },
    {
      "id": "row_hotzone",
      "rowStyle": {
        "width": "1200",
        "backgroundColor": "transparent",
        "margin": [
          0,
          0,
          16,
          0
        ],
        "padding": [
          0,
          0,
          0,
          0
        ],
        "height": 750
      },
      "components": [
        {
          "id": "cmp_hotzone",
          "type": "hotZone",
          "name": "热区",
          "componentStyle": {
            "widthRatio": "100%",
            "backgroundColor": "#ffffff",
            "radius": [
              8,
              8,
              8,
              8
            ]
          },
          "options": {
            "imageUrl": "https://lilishop-pc.oss-cn-beijing.aliyuncs.com/static/hot-zone/hotzone_default.png",
            "hotzones": [
              {
                "id": "hz1",
                "title": "数码潮流会场",
                "url": "/goodsList",
                "left": 4,
                "top": 12,
                "width": 21,
                "height": 76
              },
              {
                "id": "hz2",
                "title": "美妆奢护狂欢",
                "url": "/goodsList",
                "left": 28,
                "top": 12,
                "width": 21,
                "height": 76
              },
              {
                "id": "hz3",
                "title": "品质家电狂欢",
                "url": "/goodsList",
                "left": 52,
                "top": 12,
                "width": 21,
                "height": 76
              },
              {
                "id": "hz4",
                "title": "抢千万大促红包",
                "url": "/couponCenter",
                "left": 75,
                "top": 12,
                "width": 21,
                "height": 76
              }
            ]
          }
        }
      ]
    },
    {
      "id": "row_promos",
      "rowStyle": {
        "width": "1200",
        "backgroundColor": "transparent",
        "margin": [
          0,
          0,
          16,
          0
        ],
        "padding": [
          0,
          0,
          0,
          0
        ],
        "height": 220
      },
      "components": [
        {
          "id": "cmp_promo_group",
          "type": "promoGroup",
          "name": "促销群",
          "componentStyle": {
            "widthRatio": "100%",
            "backgroundColor": "transparent"
          },
          "options": {
            "columns": 3,
            "promos": [
              {
                "id": "p1",
                "title": "双11定金膨胀",
                "subtitle": "100抵300 抢跑双11",
                "image": "https://lilishop-pc.oss-cn-beijing.aliyuncs.com/static/promo-group/promo_1.png",
                "tag": "预售锁定",
                "url": "/goodsList"
              },
              {
                "id": "p2",
                "title": "大牌狂欢买1送1",
                "subtitle": "买大牌正装赠等量好礼",
                "image": "https://lilishop-pc.oss-cn-beijing.aliyuncs.com/static/promo-group/promo_2.png",
                "tag": "狂欢赠礼",
                "url": "/goodsList"
              },
              {
                "id": "p3",
                "title": "爆款百亿补贴",
                "subtitle": "全网比价 买贵必赔",
                "image": "https://lilishop-pc.oss-cn-beijing.aliyuncs.com/static/promo-group/promo_3.png",
                "tag": "官方直补",
                "url": "/goodsList"
              }
            ]
          }
        }
      ]
    },
    {
      "id": "row_goods_split",
      "rowStyle": {
        "width": "1200",
        "backgroundColor": "transparent",
        "margin": [
          0,
          0,
          16,
          0
        ],
        "padding": [
          0,
          0,
          0,
          0
        ],
        "justifyContent": "space-between",
        "height": 360
      },
      "components": [
        {
          "id": "cmp_goods_card",
          "type": "goodsCard",
          "name": "商品卡片",
          "componentStyle": {
            "widthRatio": "50%",
            "backgroundColor": "#ffffff",
            "radius": [
              8,
              8,
              8,
              8
            ],
            "padding": [
              16,
              16,
              16,
              16
            ]
          },
          "options": {
            "goodsId": "1",
            "title": "双11机皇甄选 · 旗舰 5G 智能手机 12GB+256GB",
            "subtitle": "超光影影像系统 潜望长焦防抖 满血旗舰芯",
            "tag": "双11爆款机皇",
            "badge": "立省600元",
            "price": "3999.00",
            "originalPrice": "4599.00",
            "image": "https://lilishop-pc.oss-cn-beijing.aliyuncs.com/static/goods/goods_1.png",
            "url": "/goods/1"
          }
        },
        {
          "id": "cmp_goods_bar",
          "type": "goodsBar",
          "name": "商品条",
          "componentStyle": {
            "widthRatio": "50%",
            "backgroundColor": "#ffffff",
            "radius": [
              8,
              8,
              8,
              8
            ],
            "padding": [
              16,
              16,
              16,
              16
            ]
          },
          "options": {
            "goods": [
              {
                "id": "2",
                "goodsName": "无线头戴式深度主动降噪耳机 空间音频Hi-Res",
                "price": "1099.00",
                "originalPrice": "1499.00",
                "thumbnail": "https://lilishop-pc.oss-cn-beijing.aliyuncs.com/static/goods/goods_2.png",
                "tag": "降噪TOP1"
              },
              {
                "id": "3",
                "goodsName": "14英寸全面屏轻薄笔记本电脑 酷睿i7 高刷防眩光",
                "price": "5699.00",
                "originalPrice": "6299.00",
                "thumbnail": "https://lilishop-pc.oss-cn-beijing.aliyuncs.com/static/goods/goods_3.png",
                "tag": "直降600"
              },
              {
                "id": "4",
                "goodsName": "运动健康专业监测智能手表 心率血氧长续航防水",
                "price": "899.00",
                "originalPrice": "1199.00",
                "thumbnail": "https://lilishop-pc.oss-cn-beijing.aliyuncs.com/static/goods/goods_4.png",
                "tag": "抢购热卖"
              }
            ]
          }
        }
      ]
    },
    {
      "id": "row_freelayout",
      "rowStyle": {
        "width": "1200",
        "backgroundColor": "#e11d48",
        "margin": [
          0,
          0,
          16,
          0
        ],
        "padding": [
          14,
          20,
          14,
          20
        ],
        "borderRadius": "8px",
        "height": 450
      },
      "components": [
        {
          "id": "cmp_freelayout",
          "type": "freeLayout",
          "name": "自由排版",
          "componentStyle": {
            "widthRatio": "100%",
            "backgroundColor": "transparent"
          },
          "options": {
            "height": 450,
            "elements": [
              {
                "type": "badge",
                "title": "双11全球狂欢季",
                "tag": "11.11 MEGA SALE",
                "backgroundColor": "#ffffff",
                "color": "#e11d48"
              },
              {
                "type": "slogan",
                "text": "全场官方正品保障 · 全程保价买贵退差 · 顺丰极速配送"
              },
              {
                "type": "button",
                "text": "立即前往大促专题会场 >",
                "url": "/special"
              }
            ]
          }
        }
      ]
    },
    {
      "id": "row_floor1_title",
      "rowStyle": {
        "width": "1200",
        "backgroundColor": "transparent",
        "margin": [
          0,
          0,
          8,
          0
        ],
        "padding": [
          0,
          0,
          0,
          0
        ],
        "height": 48
      },
      "components": [
        {
          "id": "cmp_floor1_title",
          "type": "titleBar",
          "name": "标题栏",
          "componentStyle": {
            "widthRatio": "100%",
            "backgroundColor": "transparent"
          },
          "options": {
            "title": "1F 潮流数码狂欢",
            "subtitle": "DIGITAL & GADGETS · 旗舰影像与前沿智能科技",
            "tag": "数码盛典",
            "moreText": "查看更多数码 >",
            "moreUrl": "/goodsList?categoryId=1"
          }
        }
      ]
    },
    {
      "id": "row_floor1_grid",
      "rowStyle": {
        "width": "1200",
        "backgroundColor": "#ffffff",
        "margin": [
          0,
          0,
          16,
          0
        ],
        "padding": [
          16,
          16,
          16,
          16
        ],
        "borderRadius": "8px",
        "height": ""
      },
      "components": [
        {
          "id": "cmp_grid_floor",
          "type": "gridFloor",
          "name": "网格楼层",
          "componentStyle": {
            "widthRatio": "100%",
            "backgroundColor": "transparent"
          },
          "options": {
            "floorNo": "1F",
            "title": "潮流数码狂欢",
            "subtitle": "DIGITAL & GADGETS",
            "posterImage": "https://lilishop-pc.oss-cn-beijing.aliyuncs.com/static/banner-floor/floor_banner_1.png",
            "posterTitle": "数码狂欢盛典",
            "posterSubtitle": "最高立省1000元",
            "goods": [
              {
                "id": "1",
                "goodsName": "【双11爆款】旗舰 5G 智能手机 12GB+256GB 超光影潜望长焦",
                "price": "3999.00",
                "originalPrice": "4599.00",
                "sales": 15820,
                "positiveRate": "99.8%",
                "isSelf": true,
                "thumbnail": "https://lilishop-pc.oss-cn-beijing.aliyuncs.com/static/goods/goods_1.png"
              },
              {
                "id": "2",
                "goodsName": "【立减400】无线头戴式深度主动降噪蓝牙耳机 空间音频Hi-Res高保真",
                "price": "1099.00",
                "originalPrice": "1499.00",
                "sales": 28410,
                "positiveRate": "99.5%",
                "isSelf": true,
                "thumbnail": "https://lilishop-pc.oss-cn-beijing.aliyuncs.com/static/goods/goods_2.png"
              },
              {
                "id": "3",
                "goodsName": "【大牌补贴】14英寸全面屏轻薄商务笔记本电脑 酷睿i7 120Hz高刷防眩光",
                "price": "5699.00",
                "originalPrice": "6299.00",
                "sales": 9320,
                "positiveRate": "99.2%",
                "isSelf": true,
                "thumbnail": "https://lilishop-pc.oss-cn-beijing.aliyuncs.com/static/goods/goods_3.png"
              },
              {
                "id": "4",
                "goodsName": "【直降300】运动健康专业监测智能手表 心率血氧ECG 50米专业防水",
                "price": "899.00",
                "originalPrice": "1199.00",
                "sales": 19500,
                "positiveRate": "99.6%",
                "isSelf": true,
                "thumbnail": "https://lilishop-pc.oss-cn-beijing.aliyuncs.com/static/goods/goods_4.png"
              }
            ]
          }
        }
      ]
    },
    {
      "id": "row_banner_floor",
      "rowStyle": {
        "width": "1200",
        "backgroundColor": "#ffffff",
        "margin": [
          0,
          0,
          16,
          0
        ],
        "padding": [
          16,
          16,
          16,
          16
        ],
        "borderRadius": "8px",
        "height": ""
      },
      "components": [
        {
          "id": "cmp_banner_floor",
          "type": "bannerFloor",
          "name": "横幅楼层",
          "componentStyle": {
            "widthRatio": "100%",
            "backgroundColor": "transparent"
          },
          "options": {
            "bannerImage": "https://lilishop-pc.oss-cn-beijing.aliyuncs.com/static/banner-floor/floor_banner_1.png",
            "title": "双11大牌品质生活盛典",
            "subtitle": "以旧换新重磅补贴 跨店每满300减50",
            "goods": [
              {
                "id": "5",
                "goodsName": "【买1赠1正装】奢宠酵母焕活修护精华露 50ml 紧致淡纹修护抗皱滋养",
                "price": "680.00",
                "originalPrice": "890.00",
                "sales": 34100,
                "positiveRate": "99.9%",
                "isSelf": true,
                "thumbnail": "https://lilishop-pc.oss-cn-beijing.aliyuncs.com/static/goods/goods_5.png"
              },
              {
                "id": "6",
                "goodsName": "【官方补贴】意式半自动家用复古咖啡机 20Bar高压恒温萃取蒸汽奶泡一体",
                "price": "899.00",
                "originalPrice": "1280.00",
                "sales": 8760,
                "positiveRate": "99.1%",
                "isSelf": false,
                "thumbnail": "https://lilishop-pc.oss-cn-beijing.aliyuncs.com/static/goods/goods_6.png"
              },
              {
                "id": "7",
                "goodsName": "【大促5折】碳板专业竞速轻量缓震跑步鞋 透气防滑男女马拉松同款跑鞋",
                "price": "459.00",
                "originalPrice": "699.00",
                "sales": 22100,
                "positiveRate": "99.4%",
                "isSelf": true,
                "thumbnail": "https://lilishop-pc.oss-cn-beijing.aliyuncs.com/static/goods/goods_7.png"
              },
              {
                "id": "8",
                "goodsName": "【限时特惠】极简静音无雾负离子香薰加湿器 大容量客厅卧室通用",
                "price": "299.00",
                "originalPrice": "399.00",
                "sales": 14200,
                "positiveRate": "99.0%",
                "isSelf": false,
                "thumbnail": "https://lilishop-pc.oss-cn-beijing.aliyuncs.com/static/goods/goods_8.png"
              }
            ]
          }
        }
      ]
    },
    {
      "id": "row_channel_floor",
      "rowStyle": {
        "width": "1200",
        "backgroundColor": "#ffffff",
        "margin": [
          0,
          0,
          16,
          0
        ],
        "padding": [
          16,
          16,
          16,
          16
        ],
        "borderRadius": "8px",
        "height": ""
      },
      "components": [
        {
          "id": "cmp_channel_floor",
          "type": "channelFloor",
          "name": "频道楼层",
          "componentStyle": {
            "widthRatio": "100%",
            "backgroundColor": "transparent"
          },
          "options": {
            "title": "双11智能生活场景馆",
            "subtitle": "SMART LIFE SHOWROOM",
            "heroImage": "https://lilishop-pc.oss-cn-beijing.aliyuncs.com/static/promo-group/promo_1.png",
            "heroTitle": "智能生活新时代",
            "heroSubtitle": "畅享未来智慧家庭科技",
            "goods": [
              {
                "id": "1",
                "goodsName": "【双11爆款】旗舰 5G 智能手机 12GB+256GB 超光影潜望长焦",
                "price": "3999.00",
                "originalPrice": "4599.00",
                "sales": 15820,
                "positiveRate": "99.8%",
                "isSelf": true,
                "thumbnail": "https://lilishop-pc.oss-cn-beijing.aliyuncs.com/static/goods/goods_1.png"
              },
              {
                "id": "3",
                "goodsName": "【大牌补贴】14英寸全面屏轻薄商务笔记本电脑 酷睿i7 120Hz高刷防眩光",
                "price": "5699.00",
                "originalPrice": "6299.00",
                "sales": 9320,
                "positiveRate": "99.2%",
                "isSelf": true,
                "thumbnail": "https://lilishop-pc.oss-cn-beijing.aliyuncs.com/static/goods/goods_3.png"
              },
              {
                "id": "6",
                "goodsName": "【官方补贴】意式半自动家用复古咖啡机 20Bar高压恒温萃取蒸汽奶泡一体",
                "price": "899.00",
                "originalPrice": "1280.00",
                "sales": 8760,
                "positiveRate": "99.1%",
                "isSelf": false,
                "thumbnail": "https://lilishop-pc.oss-cn-beijing.aliyuncs.com/static/goods/goods_6.png"
              }
            ]
          }
        }
      ]
    },
    {
      "id": "row_grid_title",
      "rowStyle": {
        "width": "1200",
        "backgroundColor": "transparent",
        "margin": [
          0,
          0,
          8,
          0
        ],
        "padding": [
          0,
          0,
          0,
          0
        ],
        "height": 48
      },
      "components": [
        {
          "id": "cmp_grid_title",
          "type": "titleBar",
          "name": "标题栏",
          "componentStyle": {
            "widthRatio": "100%",
            "backgroundColor": "transparent"
          },
          "options": {
            "title": "双11爆款必买热销榜",
            "subtitle": "TOP RANKINGS · 平台高人气甄选热卖",
            "tag": "实时榜单",
            "moreText": "查看完整榜单 >",
            "moreUrl": "/goodsList"
          }
        }
      ]
    },
    {
      "id": "row_goods_grid",
      "rowStyle": {
        "width": "1200",
        "backgroundColor": "#ffffff",
        "margin": [
          0,
          0,
          16,
          0
        ],
        "padding": [
          16,
          16,
          16,
          16
        ],
        "borderRadius": "8px",
        "height": ""
      },
      "components": [
        {
          "id": "cmp_goods_grid",
          "type": "goodsGrid",
          "name": "商品宫格",
          "componentStyle": {
            "widthRatio": "100%",
            "backgroundColor": "transparent"
          },
          "options": {
            "columns": 5,
            "goods": [
              {
                "id": "1",
                "goodsName": "【双11爆款】旗舰 5G 智能手机 12GB+256GB 超光影潜望长焦",
                "price": "3999.00",
                "originalPrice": "4599.00",
                "sales": 15820,
                "positiveRate": "99.8%",
                "isSelf": true,
                "thumbnail": "https://lilishop-pc.oss-cn-beijing.aliyuncs.com/static/goods/goods_1.png"
              },
              {
                "id": "2",
                "goodsName": "【立减400】无线头戴式深度主动降噪蓝牙耳机 空间音频Hi-Res高保真",
                "price": "1099.00",
                "originalPrice": "1499.00",
                "sales": 28410,
                "positiveRate": "99.5%",
                "isSelf": true,
                "thumbnail": "https://lilishop-pc.oss-cn-beijing.aliyuncs.com/static/goods/goods_2.png"
              },
              {
                "id": "3",
                "goodsName": "【大牌补贴】14英寸全面屏轻薄商务笔记本电脑 酷睿i7 120Hz高刷防眩光",
                "price": "5699.00",
                "originalPrice": "6299.00",
                "sales": 9320,
                "positiveRate": "99.2%",
                "isSelf": true,
                "thumbnail": "https://lilishop-pc.oss-cn-beijing.aliyuncs.com/static/goods/goods_3.png"
              },
              {
                "id": "4",
                "goodsName": "【直降300】运动健康专业监测智能手表 心率血氧ECG 50米专业防水",
                "price": "899.00",
                "originalPrice": "1199.00",
                "sales": 19500,
                "positiveRate": "99.6%",
                "isSelf": true,
                "thumbnail": "https://lilishop-pc.oss-cn-beijing.aliyuncs.com/static/goods/goods_4.png"
              },
              {
                "id": "5",
                "goodsName": "【买1赠1正装】奢宠酵母焕活修护精华露 50ml 紧致淡纹修护抗皱滋养",
                "price": "680.00",
                "originalPrice": "890.00",
                "sales": 34100,
                "positiveRate": "99.9%",
                "isSelf": true,
                "thumbnail": "https://lilishop-pc.oss-cn-beijing.aliyuncs.com/static/goods/goods_5.png"
              },
              {
                "id": "6",
                "goodsName": "【官方补贴】意式半自动家用复古咖啡机 20Bar高压恒温萃取蒸汽奶泡一体",
                "price": "899.00",
                "originalPrice": "1280.00",
                "sales": 8760,
                "positiveRate": "99.1%",
                "isSelf": false,
                "thumbnail": "https://lilishop-pc.oss-cn-beijing.aliyuncs.com/static/goods/goods_6.png"
              },
              {
                "id": "7",
                "goodsName": "【大促5折】碳板专业竞速轻量缓震跑步鞋 透气防滑男女马拉松同款跑鞋",
                "price": "459.00",
                "originalPrice": "699.00",
                "sales": 22100,
                "positiveRate": "99.4%",
                "isSelf": true,
                "thumbnail": "https://lilishop-pc.oss-cn-beijing.aliyuncs.com/static/goods/goods_7.png"
              },
              {
                "id": "8",
                "goodsName": "【限时特惠】极简静音无雾负离子香薰加湿器 大容量客厅卧室通用",
                "price": "299.00",
                "originalPrice": "399.00",
                "sales": 14200,
                "positiveRate": "99.0%",
                "isSelf": false,
                "thumbnail": "https://lilishop-pc.oss-cn-beijing.aliyuncs.com/static/goods/goods_8.png"
              }
            ]
          }
        }
      ]
    },
    {
      "id": "row_video_title",
      "rowStyle": {
        "width": "1200",
        "backgroundColor": "transparent",
        "margin": [
          0,
          0,
          8,
          0
        ],
        "padding": [
          0,
          0,
          0,
          0
        ],
        "height": 48
      },
      "components": [
        {
          "id": "cmp_video_title",
          "type": "titleBar",
          "name": "标题栏",
          "componentStyle": {
            "widthRatio": "100%",
            "backgroundColor": "transparent"
          },
          "options": {
            "title": "超级直播间 · 现场真实开箱",
            "subtitle": "LIVE SHOWROOM · 官方实机深度拆解上手评测",
            "tag": "直播带货",
            "moreText": "进入官方直播 >",
            "moreUrl": "/special"
          }
        }
      ]
    },
    {
      "id": "row_video",
      "rowStyle": {
        "width": "1200",
        "backgroundColor": "#ffffff",
        "margin": [
          0,
          0,
          16,
          0
        ],
        "padding": [
          16,
          16,
          16,
          16
        ],
        "borderRadius": "8px",
        "height": 450
      },
      "components": [
        {
          "id": "cmp_video",
          "type": "video",
          "name": "视频",
          "componentStyle": {
            "widthRatio": "100%",
            "backgroundColor": "transparent"
          },
          "options": {
            "videoUrl": "https://vjs.zencdn.net/v/oceans.mp4",
            "height": 450,
            "coverUrl": "https://lilishop-pc.oss-cn-beijing.aliyuncs.com/static/video/video_cover.png",
            "url": "/goodsList?brand=1",
            "title": "双11全球狂欢发布盛典 · 年度旗舰好物真实开箱测评",
            "autoplay": false
          }
        }
      ]
    },
    {
      "id": "row_brand_title",
      "rowStyle": {
        "width": "1200",
        "backgroundColor": "transparent",
        "margin": [
          0,
          0,
          8,
          0
        ],
        "padding": [
          0,
          0,
          0,
          0
        ],
        "height": 48
      },
      "components": [
        {
          "id": "cmp_brand_title",
          "type": "titleBar",
          "name": "标题栏",
          "componentStyle": {
            "widthRatio": "100%",
            "backgroundColor": "transparent"
          },
          "options": {
            "title": "双11合作品牌盛典",
            "subtitle": "GLOBAL BRANDS · 国际一线大牌 官方正品直供",
            "tag": "旗舰直营",
            "moreText": "逛品牌特惠街 >",
            "moreUrl": "/goodsList"
          }
        }
      ]
    },
    {
      "id": "row_brand_wall",
      "rowStyle": {
        "width": "1200",
        "backgroundColor": "#ffffff",
        "margin": [
          0,
          0,
          16,
          0
        ],
        "padding": [
          16,
          16,
          16,
          16
        ],
        "borderRadius": "8px",
        "height": ""
      },
      "components": [
        {
          "id": "cmp_brand_wall",
          "type": "brandWall",
          "name": "品牌墙",
          "componentStyle": {
            "widthRatio": "100%",
            "backgroundColor": "transparent"
          },
          "options": {
            "brands": [
              {
                "id": "1",
                "name": "Apple 官方旗舰店",
                "logo": "https://lilishop-pc.oss-cn-beijing.aliyuncs.com/static/brand-wall/brand_1.png",
                "tag": "正品补贴"
              },
              {
                "id": "2",
                "name": "Sony 索尼官方旗舰店",
                "logo": "https://lilishop-pc.oss-cn-beijing.aliyuncs.com/static/brand-wall/brand_2.png",
                "tag": "新品独家"
              },
              {
                "id": "3",
                "name": "Estee Lauder 雅诗兰黛",
                "logo": "https://lilishop-pc.oss-cn-beijing.aliyuncs.com/static/brand-wall/brand_3.png",
                "tag": "买1送1"
              },
              {
                "id": "4",
                "name": "Nike 耐克官方商城",
                "logo": "https://lilishop-pc.oss-cn-beijing.aliyuncs.com/static/brand-wall/brand_4.png",
                "tag": "低至5折"
              }
            ]
          }
        }
      ]
    },
    {
      "id": "row_article_title",
      "rowStyle": {
        "width": "1200",
        "backgroundColor": "transparent",
        "margin": [
          0,
          0,
          8,
          0
        ],
        "padding": [
          0,
          0,
          0,
          0
        ],
        "height": 48
      },
      "components": [
        {
          "id": "cmp_article_title",
          "type": "titleBar",
          "name": "标题栏",
          "componentStyle": {
            "widthRatio": "100%",
            "backgroundColor": "transparent"
          },
          "options": {
            "title": "双11终极省钱秘籍",
            "subtitle": "SHOPPING GUIDE · 官方大促规则与折上折凑单全攻略",
            "tag": "必看攻略",
            "moreText": "查看更多专栏 >",
            "moreUrl": "/article"
          }
        }
      ]
    },
    {
      "id": "row_article",
      "rowStyle": {
        "width": "1200",
        "backgroundColor": "#ffffff",
        "margin": [
          0,
          0,
          16,
          0
        ],
        "padding": [
          20,
          24,
          20,
          24
        ],
        "borderRadius": "8px",
        "height": ""
      },
      "components": [
        {
          "id": "cmp_article",
          "type": "articleContent",
          "name": "文章内容",
          "componentStyle": {
            "widthRatio": "100%",
            "backgroundColor": "transparent"
          },
          "options": {
            "title": "2026 双11全球狂欢省钱全攻略：每满300减50终极凑单秘籍",
            "author": "商城大促运营中心",
            "date": "2026-10-28",
            "views": 89420,
            "content": "<p>2026年双11全球购物狂欢节已经重磅启幕！今年我们奉行<strong>“最省钱、最简单、最快发货”</strong>三大核心主张，彻底剔除复杂计算，带来真金白银的诚意优惠。</p><h2>一、三大核心优惠叠加规则</h2><p>本届双11平台支持<strong>四层重磅优惠无缝叠加</strong>：</p><ul><li><strong>第一层：官方直降</strong> —— 参与活动商品直接享受平台核定降价折扣。</li><li><strong>第二层：跨店每满300减50</strong> —— 全场带有双11标识商品均参与，上不封顶！</li><li><strong>第三层：品类大额神券</strong> —— 潮流数码满699减100、品质家电满1200减200，折上再减！</li><li><strong>第四层：红包与金币</strong> —— 每日整点直播红包、签到金币抵扣，结算直接抵现金。</li></ul><blockquote>跨店满减与神券支持跨品类智能凑单！系统将在购物车为您自动计算并推荐最优凑单组合，无需手动换算。</blockquote><h2>二、官方服务保障体系</h2><p>为了让您购物无忧，平台联合品牌官方推出四大服务护航计划：</p><ul><li><strong>全周期价保承诺</strong>：全场商品保价至11月30日，降价一键秒退差额；</li><li><strong>顺丰急速直达</strong>：核心商品入驻前置仓，同城最快次日达；</li><li><strong>7天无理由退换</strong>：官方上门取件，运费险全额承保。</li></ul>"
          }
        }
      ]
    },
    {
      "id": "row_goods_list_title",
      "rowStyle": {
        "width": "1200",
        "backgroundColor": "transparent",
        "margin": [
          0,
          0,
          8,
          0
        ],
        "padding": [
          0,
          0,
          0,
          0
        ],
        "height": 48
      },
      "components": [
        {
          "id": "cmp_goods_list_title",
          "type": "titleBar",
          "name": "标题栏",
          "componentStyle": {
            "widthRatio": "100%",
            "backgroundColor": "transparent"
          },
          "options": {
            "title": "双11全品类爆品清单",
            "subtitle": "MEGA PRODUCTS · 官方甄选自营直降特惠商品",
            "tag": "热卖专区",
            "moreText": "浏览全店商品 >",
            "moreUrl": "/goodsList"
          }
        }
      ]
    },
    {
      "id": "row_goods_list",
      "rowStyle": {
        "width": "1200",
        "backgroundColor": "#ffffff",
        "margin": [
          0,
          0,
          16,
          0
        ],
        "padding": [
          16,
          16,
          16,
          16
        ],
        "borderRadius": "8px",
        "height": ""
      },
      "components": [
        {
          "id": "cmp_goods_list",
          "type": "goodsList",
          "name": "商品列表",
          "componentStyle": {
            "widthRatio": "100%",
            "backgroundColor": "transparent"
          },
          "options": {
            "goods": [
              {
                "id": "1",
                "goodsName": "【双11爆款】旗舰 5G 智能手机 12GB+256GB 超光影潜望长焦",
                "price": "3999.00",
                "originalPrice": "4599.00",
                "sales": 15820,
                "positiveRate": "99.8%",
                "isSelf": true,
                "thumbnail": "https://lilishop-pc.oss-cn-beijing.aliyuncs.com/static/goods/goods_1.png"
              },
              {
                "id": "2",
                "goodsName": "【立减400】无线头戴式深度主动降噪蓝牙耳机 空间音频Hi-Res高保真",
                "price": "1099.00",
                "originalPrice": "1499.00",
                "sales": 28410,
                "positiveRate": "99.5%",
                "isSelf": true,
                "thumbnail": "https://lilishop-pc.oss-cn-beijing.aliyuncs.com/static/goods/goods_2.png"
              },
              {
                "id": "3",
                "goodsName": "【大牌补贴】14英寸全面屏轻薄商务笔记本电脑 酷睿i7 120Hz高刷防眩光",
                "price": "5699.00",
                "originalPrice": "6299.00",
                "sales": 9320,
                "positiveRate": "99.2%",
                "isSelf": true,
                "thumbnail": "https://lilishop-pc.oss-cn-beijing.aliyuncs.com/static/goods/goods_3.png"
              },
              {
                "id": "4",
                "goodsName": "【直降300】运动健康专业监测智能手表 心率血氧ECG 50米专业防水",
                "price": "899.00",
                "originalPrice": "1199.00",
                "sales": 19500,
                "positiveRate": "99.6%",
                "isSelf": true,
                "thumbnail": "https://lilishop-pc.oss-cn-beijing.aliyuncs.com/static/goods/goods_4.png"
              },
              {
                "id": "5",
                "goodsName": "【买1赠1正装】奢宠酵母焕活修护精华露 50ml 紧致淡纹修护抗皱滋养",
                "price": "680.00",
                "originalPrice": "890.00",
                "sales": 34100,
                "positiveRate": "99.9%",
                "isSelf": true,
                "thumbnail": "https://lilishop-pc.oss-cn-beijing.aliyuncs.com/static/goods/goods_5.png"
              },
              {
                "id": "6",
                "goodsName": "【官方补贴】意式半自动家用复古咖啡机 20Bar高压恒温萃取蒸汽奶泡一体",
                "price": "899.00",
                "originalPrice": "1280.00",
                "sales": 8760,
                "positiveRate": "99.1%",
                "isSelf": false,
                "thumbnail": "https://lilishop-pc.oss-cn-beijing.aliyuncs.com/static/goods/goods_6.png"
              },
              {
                "id": "7",
                "goodsName": "【大促5折】碳板专业竞速轻量缓震跑步鞋 透气防滑男女马拉松同款跑鞋",
                "price": "459.00",
                "originalPrice": "699.00",
                "sales": 22100,
                "positiveRate": "99.4%",
                "isSelf": true,
                "thumbnail": "https://lilishop-pc.oss-cn-beijing.aliyuncs.com/static/goods/goods_7.png"
              },
              {
                "id": "8",
                "goodsName": "【限时特惠】极简静音无雾负离子香薰加湿器 大容量客厅卧室通用",
                "price": "299.00",
                "originalPrice": "399.00",
                "sales": 14200,
                "positiveRate": "99.0%",
                "isSelf": false,
                "thumbnail": "https://lilishop-pc.oss-cn-beijing.aliyuncs.com/static/goods/goods_8.png"
              }
            ]
          }
        }
      ]
    },
    {
      "id": "row_recommend_title",
      "rowStyle": {
        "width": "1200",
        "backgroundColor": "transparent",
        "margin": [
          0,
          0,
          8,
          0
        ],
        "padding": [
          0,
          0,
          0,
          0
        ],
        "height": 48
      },
      "components": [
        {
          "id": "cmp_recommend_title",
          "type": "titleBar",
          "name": "标题栏",
          "componentStyle": {
            "widthRatio": "100%",
            "backgroundColor": "transparent"
          },
          "options": {
            "title": "猜你喜欢 · 智能推荐流",
            "subtitle": "FOR YOU · 根据您的偏好精准测算",
            "tag": "专属推荐",
            "moreText": "换一批推荐 >",
            "moreUrl": "/goodsList"
          }
        }
      ]
    },
    {
      "id": "row_recommend_feed",
      "rowStyle": {
        "width": "1200",
        "backgroundColor": "#ffffff",
        "margin": [
          0,
          0,
          24,
          0
        ],
        "padding": [
          16,
          16,
          16,
          16
        ],
        "borderRadius": "8px",
        "height": ""
      },
      "components": [
        {
          "id": "cmp_recommend_feed",
          "type": "recommendFeed",
          "name": "推荐商品",
          "componentStyle": {
            "widthRatio": "100%",
            "backgroundColor": "transparent"
          },
          "options": {
            "featuredTitle": "双11专属甄选机皇",
            "goods": [
              {
                "id": "1",
                "goodsName": "【双11爆款】旗舰 5G 智能手机 12GB+256GB 超光影潜望长焦",
                "price": "3999.00",
                "originalPrice": "4599.00",
                "sales": 15820,
                "positiveRate": "99.8%",
                "isSelf": true,
                "thumbnail": "https://lilishop-pc.oss-cn-beijing.aliyuncs.com/static/goods/goods_1.png"
              },
              {
                "id": "2",
                "goodsName": "【立减400】无线头戴式深度主动降噪蓝牙耳机 空间音频Hi-Res高保真",
                "price": "1099.00",
                "originalPrice": "1499.00",
                "sales": 28410,
                "positiveRate": "99.5%",
                "isSelf": true,
                "thumbnail": "https://lilishop-pc.oss-cn-beijing.aliyuncs.com/static/goods/goods_2.png"
              },
              {
                "id": "3",
                "goodsName": "【大牌补贴】14英寸全面屏轻薄商务笔记本电脑 酷睿i7 120Hz高刷防眩光",
                "price": "5699.00",
                "originalPrice": "6299.00",
                "sales": 9320,
                "positiveRate": "99.2%",
                "isSelf": true,
                "thumbnail": "https://lilishop-pc.oss-cn-beijing.aliyuncs.com/static/goods/goods_3.png"
              },
              {
                "id": "4",
                "goodsName": "【直降300】运动健康专业监测智能手表 心率血氧ECG 50米专业防水",
                "price": "899.00",
                "originalPrice": "1199.00",
                "sales": 19500,
                "positiveRate": "99.6%",
                "isSelf": true,
                "thumbnail": "https://lilishop-pc.oss-cn-beijing.aliyuncs.com/static/goods/goods_4.png"
              },
              {
                "id": "5",
                "goodsName": "【买1赠1正装】奢宠酵母焕活修护精华露 50ml 紧致淡纹修护抗皱滋养",
                "price": "680.00",
                "originalPrice": "890.00",
                "sales": 34100,
                "positiveRate": "99.9%",
                "isSelf": true,
                "thumbnail": "https://lilishop-pc.oss-cn-beijing.aliyuncs.com/static/goods/goods_5.png"
              },
              {
                "id": "6",
                "goodsName": "【官方补贴】意式半自动家用复古咖啡机 20Bar高压恒温萃取蒸汽奶泡一体",
                "price": "899.00",
                "originalPrice": "1280.00",
                "sales": 8760,
                "positiveRate": "99.1%",
                "isSelf": false,
                "thumbnail": "https://lilishop-pc.oss-cn-beijing.aliyuncs.com/static/goods/goods_6.png"
              },
              {
                "id": "7",
                "goodsName": "【大促5折】碳板专业竞速轻量缓震跑步鞋 透气防滑男女马拉松同款跑鞋",
                "price": "459.00",
                "originalPrice": "699.00",
                "sales": 22100,
                "positiveRate": "99.4%",
                "isSelf": true,
                "thumbnail": "https://lilishop-pc.oss-cn-beijing.aliyuncs.com/static/goods/goods_7.png"
              },
              {
                "id": "8",
                "goodsName": "【限时特惠】极简静音无雾负离子香薰加湿器 大容量客厅卧室通用",
                "price": "299.00",
                "originalPrice": "399.00",
                "sales": 14200,
                "positiveRate": "99.0%",
                "isSelf": false,
                "thumbnail": "https://lilishop-pc.oss-cn-beijing.aliyuncs.com/static/goods/goods_8.png"
              }
            ]
          }
        }
      ]
    },
    {
      "id": "row_footer_nav",
      "rowStyle": {
        "width": "100%",
        "backgroundColor": "#1e293b",
        "margin": [
          0,
          0,
          0,
          0
        ],
        "padding": [
          32,
          0,
          24,
          0
        ],
        "height": 450
      },
      "components": [
        {
          "id": "cmp_footer_nav",
          "type": "footerNav",
          "name": "页脚",
          "componentStyle": {
            "widthRatio": "100%",
            "backgroundColor": "transparent"
          },
          "options": {
            "services": [
              {
                "title": "官方正品",
                "desc": "100%正品保障 假一赔十"
              },
              {
                "title": "全场保价",
                "desc": "价保30天 买贵退差"
              },
              {
                "title": "极速物流",
                "desc": "顺丰速运 核心仓次日达"
              },
              {
                "title": "售后无忧",
                "desc": "7天无理由退换 上门取件"
              }
            ],
            "copyright": "Copyright © 2026 Lilishop. 双11全球狂欢节组委会 版权所有"
          }
        }
      ]
    }
  ]
};
