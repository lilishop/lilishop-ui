/**
 * drawer:true   广告右侧打开抽屉中显示
 * drawerPromotions:true   广告右侧打开抽屉中显示
 * ad_drawer:true 活动魔方右侧显示
 * notAdd: true 没有添加按钮
 * notLink: true 没有链接功能
 * notImg: true 没有选择图片功能
 * close:true 右侧关闭按钮
 * group: 'base' | 'marketing' | 'tools'  组件面板分组（无 group 的条目不在面板显示，仅供抽屉使用）
 */
export const modelData = [

  {
    type: "flexOne",
    name: "热区",
    icon: "Picture",
    group: "base",
    // drawer: true,
    notAdd: true,
    onlyImg: true,
    img: "md-image",
    options: {
      list: [
        {
          img: "https://i.loli.net/2020/12/05/8wSNWbnqujDh6HL.png",
          url: "",
          link: "",
          size: "750*280",
          model: "hotzone"
        }
      ]
    }
  },
  {
    type: "carousel",
    name: "轮播图",
    icon: "PictureFilled",
    group: "base",
    img: "md-image",
    // onlyImg: true,
    notTitle: false,
    close: true,
    options: {
      list: [
        {
          img: "https://i.loli.net/2020/12/05/fKH4CwImpbuD5Xj.png",
          url: "",
          link: "",
          size: "750*350",
          model: "link"
        },
        {
          img: "https://i.loli.net/2020/12/05/12kleCgrSLfKoQs.png",
          url: "",
          link: "",
          size: "750*350",
          model: "link"
        },
        {
          img: "https://i.loli.net/2021/05/14/ZlzcCdnpejtN9gL.png",
          url: "",
          link: "",
          size: "750*350",
          model: "link"
        }
      ]
    }
  },
  {
    type: "leftOneRightTwo",
    name: "左一右二",
    notAdd: true,
    drawer: true,
    // onlyImg: true,
    view: "tpl_ad_list",
    img: "md-image",
    options: {
      list: [
        {
          img: "https://i.loli.net/2021/05/14/dtNvI5UxchXn8gz.png",
          url: "",
          link: "",
          size: "335*335",
          model: "link"
        },
        {
          img: "https://i.loli.net/2021/05/14/kdB3AE9ay4c1SnN.png",
          url: "",
          link: "",
          size: "335*177",
          model: "link"
        },
        {
          img: "https://i.loli.net/2021/05/14/FmDr9ksiXeEqYLU.png",
          url: "",
          link: "",
          size: "335*177",
          model: "link"
        }
      ]
    }
  },
  {
    type: "title",
    name: "标题栏",
    icon: "Collection",
    group: "tools",
    img: "md-image",
    // notTitle:true,
    notAdd: true,
    notImg: true,
    options: {
      list: [
        {
          title: "标题",
          color: "#282828",
          title1: '副标题',
          color1: "#999999",
          bk_color: "#FFFFFF",
          textAlign: "left",
          link: "",
          url: '',
          model: "link"
        }
      ]
    }
  },
  {
    type: "leftTwoRightOne",
    name: "左二右一",
    notAdd: true,
    drawer: true,
    // onlyImg: true,
    img: "md-image",
    options: {
      list: [
        {
          img: "https://i.loli.net/2021/05/14/kdB3AE9ay4c1SnN.png",
          url: "",
          link: "",
          size: "335*177",
          model: "link"
        },
        {
          img: "https://i.loli.net/2021/05/14/FmDr9ksiXeEqYLU.png",
          url: "",
          link: "",
          size: "335*177",
          model: "link"
        },
        {
          img: "https://i.loli.net/2021/05/14/dtNvI5UxchXn8gz.png",
          url: "",
          link: "",
          size: "335*335",
          model: "link"
        }
      ]
    }
  },
  {
    type: "flexThree",
    name: "三列单行",
    drawer: true,
    notAdd: true,
    // onlyImg: true,
    img: "md-image",
    options: {
      list: [
        {
          img: "https://i.loli.net/2021/05/14/dtNvI5UxchXn8gz.png",
          url: "",
          link: "",
          size: "226*226 (1:1)",
          model: "link"
        },
        {
          img: "https://i.loli.net/2021/05/14/dtNvI5UxchXn8gz.png",
          url: "",
          link: "",
          size: "226*226 (1:1)",
          model: "link"
        },
        {
          img: "https://i.loli.net/2021/05/14/dtNvI5UxchXn8gz.png",
          url: "",
          link: "",
          size: "226*226 (1:1)",
          model: "link"
        }
      ]
    }
  },
  {
    type: "flexTwo",
    name: "两张横图",
    drawer: true,
    notAdd: true,
    // onlyImg: true,
    img: "md-image",
    options: {
      list: [
        {
          img: "https://i.loli.net/2021/05/14/dtNvI5UxchXn8gz.png",
          url: "",
          link: "",
          size: "335*220",
          model: "link"
        },
        {
          img: "https://i.loli.net/2021/05/14/dtNvI5UxchXn8gz.png",
          url: "",
          link: "",
          size: "335*220",
          model: "link"
        }
      ]
    }
  },
  {
    type: "topOneBottomTwo",
    name: "上一下二",
    drawer: true,
    notAdd: true,
    // onlyImg: true,
    img: "md-image",
    options: {
      list: [
        {
          img: "https://i.loli.net/2021/05/14/dtNvI5UxchXn8gz.png",
          url: "",
          link: "",
          size: "710*170",
          model: "link"
        },
        {
          img: "https://i.loli.net/2021/05/14/dtNvI5UxchXn8gz.png",
          url: "",
          link: "",
          size: "335*170",
          model: "link"
        },
        {
          img: "https://i.loli.net/2021/05/14/dtNvI5UxchXn8gz.png",
          url: "",
          link: "",
          size: "335*170",
          model: "link"
        }
      ]
    }
  },
  {
    type: "topTwoBottomOne",
    name: "上二下一",
    drawer: true,
    notAdd: true,
    // onlyImg: true,
    img: "md-image",
    options: {
      list: [
        {
          img: "https://i.loli.net/2021/05/14/dtNvI5UxchXn8gz.png",
          url: "",
          link: "",
          size: "335*170",
          model: "link"
        },
        {
          img: "https://i.loli.net/2021/05/14/dtNvI5UxchXn8gz.png",
          url: "",
          link: "",
          size: "335*170",
          model: "link"
        },
        {
          img: "https://i.loli.net/2021/05/14/dtNvI5UxchXn8gz.png",
          url: "",
          link: "",
          size: "710*170",
          model: "link"
        }
      ]
    }
  },
  {
    type: "flexFive",
    name: "五列单行",
    drawer: true,
    notAdd: true,
    // onlyImg: true,
    img: "md-image",
    options: {
      list: [
        {
          img: "https://picsum.photos/id/127/200/200",
          url: "",
          link: "",
          size: "75*75（1:1）",
          model: "link"
        },
        {
          img: "https://i.loli.net/2021/05/14/dtNvI5UxchXn8gz.png",
          url: "",
          link: "",
          size: "75*75（1:1）",
          model: "link"
        },
        {
          img: "https://i.loli.net/2021/05/14/dtNvI5UxchXn8gz.png",
          url: "",
          link: "",
          size: "75*75（1:1）",
          model: "link"
        },
        {
          img: "https://i.loli.net/2021/05/14/dtNvI5UxchXn8gz.png",
          url: "",
          link: "",
          size: "75*75（1:1）",
          model: "link"
        },
        {
          img: "https://i.loli.net/2021/05/14/dtNvI5UxchXn8gz.png",
          url: "",
          link: "",
          size: "75*75（1:1）",
          model: "link"
        }
      ]
    }
  },
  {
    type: "flexFour",
    name: "四列单行",
    drawer: true,
    notAdd: true,
    // onlyImg: true,
    img: "md-image",
    options: {
      list: [
        {
          img: "https://i.loli.net/2021/05/14/dtNvI5UxchXn8gz.png",
          url: "",
          link: "",
          size: "88*88（1:1）",
          model: "link"
        },
        {
          img: "https://i.loli.net/2021/05/14/dtNvI5UxchXn8gz.png",
          url: "",
          link: "",
          size: "88*88（1:1）",
          model: "link"
        },
        {
          img: "https://i.loli.net/2021/05/14/dtNvI5UxchXn8gz.png",
          url: "",
          link: "",
          size: "88*88（1:1）",
          model: "link"
        },
        {
          img: "https://i.loli.net/2021/05/14/dtNvI5UxchXn8gz.png",
          url: "",
          link: "",
          size: "88*88（1:1）",
          model: "link"
        }
      ]
    }
  },
  {
    type: "textPicture",
    name: "文字图片",
    icon: "Document",
    group: "base",
    drawer: true,
    notAdd: true,

    img: "md-image",
    options: {
      list: [
        {
          img: "https://i.loli.net/2021/05/14/dtNvI5UxchXn8gz.png",
          url: "",
          link: "",
          title: "文字",
          size: "88*88（1:1）",
          model: "link"
        },
        {
          img: "https://i.loli.net/2021/05/14/dtNvI5UxchXn8gz.png",
          url: "",
          link: "",
          title: "文字",
          size: "88*88（1:1）",
          model: "link"
        },
        {
          img: "https://i.loli.net/2021/05/14/dtNvI5UxchXn8gz.png",
          url: "",
          link: "",
          title: "文字",
          size: "88*88（1:1）",
          model: "link"
        },
        {
          img: "https://i.loli.net/2021/05/14/dtNvI5UxchXn8gz.png",
          url: "",
          link: "",
          title: "文字",
          size: "88*88（1:1）",
          model: "link"
        }
      ]
    }
  },

  {
    type: "tpl_ad_list",
    name: "图片魔方",
    icon: "Grid",
    group: "base",
    img: "md-image",
    options: {
      list: [
        {
          bg_img: "",
          name: "",
          url: ""
        }
      ]
    }
  },
  {
    type: "menu",
    name: "宫格导航",
    icon: "Menu",
    group: "base",
    img: "md-image",
    close: true,
    options: {
      list: [
        {
          img: "https://i.loli.net/2020/12/05/SoGAv7gYybuWzED.png",
          url: "",
          link: "",
          title: "标题",
          size: "88*88 (1:1)",
          model: "link"
        },
        {
          img: "https://i.loli.net/2020/12/05/JXR5K3sbIeENjqH.png",
          url: "",
          link: "",
          title: "标题",
          size: "88*88 (1:1)",
          model: "link"
        },
        {
          img: "https://i.loli.net/2020/12/05/KlZfnCFIdEV231Y.png",
          url: "",
          link: "",
          title: "标题",
          size: "88*88 (1:1)",
          model: "link"
        },
        {
          img: "https://i.loli.net/2020/12/05/GfmMyN2wrUVIlci.png",
          url: "",
          link: "",
          title: "标题",
          size: "88*88 (1:1)",
          model: "link"
        }
      ]
    }
  },
  {
    type: "search",
    name: "搜索",
    icon: "Search",
    group: "base",
    img: "md-image",
    notAdd: true,
    notLink: true,
    notImg: true,
    options: {
      list: [
        {
          title: "搜索"
        }
      ]
    }
  },
  {
    type: "notice",
    name: "公告",
    icon: "Bell",
    group: "base",
    img: "md-image",
    notAdd: false,
    notLink: true,
    notImg: true,
    options: {
      list: [
        {
          title: [{ context: "这是一条公告" }],
          color: "#666",
          bk_color: "#FFF",
          direction: "horizontal",
          img: 'http://files.sxcfx.cn/upload/20220318/71e5d27aca82aeedf647052e1e4ceaaa.png'
        }
      ]
    }
  },
  {
    notAdd: true,
    notImg: true,
    notLink: true,
    drawerPromotions: true,
    group: "marketing",
    type: "promotionDetail",
    promotionsType: "PINTUAN",
    name: "拼团活动",
    icon: "UserFilled",
    subBkColor: "#e1212b",
    subName: "惊喜折扣",
    subColor: "#fff",
    img: "md-image",
    options: {
      list: [
        {
          type: "PINTUAN",
          title: "超值拼团",
          title1: "惊喜折扣",
          bk_color: "#e1212b",
          color1: "#fff",
          groupSuccess: "134人拼团成功",
          data: [
            {
              goodsName: "iPhone 16 Pro 5G智能手机 256GB 白色钛金属",
              price: 8999,
              originalPrice: 9999,
              thumbnail: "/demo/apple-phone.png",
              groupNum: 2,
              joined: 3
            },
            {
              goodsName: "Xiaomi 15 5G智能手机 12GB+256GB 白色",
              price: 3999,
              originalPrice: 4299,
              thumbnail: "/demo/xiaomi-phone.png",
              groupNum: 2,
              joined: 8
            },
            {
              goodsName: "vivo X200 5G智能手机 12GB+256GB 宝石蓝",
              price: 4199,
              originalPrice: 4599,
              thumbnail: "/demo/vivo-phone.png",
              groupNum: 2,
              joined: 5
            },
            {
              goodsName: "iPhone 16 5G智能手机 128GB 群青色",
              price: 5999,
              originalPrice: 6499,
              thumbnail: "/demo/apple-phone.png",
              groupNum: 2,
              joined: 12
            },
            {
              goodsName: "Redmi K80 5G智能手机 12GB+256GB 玄夜黑",
              price: 2499,
              originalPrice: 2799,
              thumbnail: "/demo/xiaomi-phone.png",
              groupNum: 2,
              joined: 21
            },
            {
              goodsName: "vivo S20 5G智能手机 8GB+256GB 凤羽金",
              price: 2299,
              originalPrice: 2599,
              thumbnail: "/demo/vivo-phone.png",
              groupNum: 2,
              joined: 16
            }
          ]
        }
      ]
    }
  },
  {
    notAdd: true,
    notImg: true,
    notLink: true,
    drawerPromotions: true,
    group: "marketing",
    type: "promotionDetail",
    promotionsType: "LIVE",
    name: "直播活动",
    icon: "VideoPlay",
    subBkColor: "#e1212b",
    subName: "优惠好价",
    subColor: "#fff",
    img: "md-image",
    options: {
      layoutStyle: "1",
      list: [
        {
          type: "LIVE",
          title: "精彩直播",
          title1: "精彩抢先看",
          bk_color: "#e1212b",
          color1: "#fff",
          data: [
            {
              title: "直播标题直播标题直播标题直播标题",
              anchorName: "樱桃小丸子",
              status: "LIVE",
              cover: "/demo/apple-phone.png"
            },
            {
              title: "直播标题直播标题直播标题直播标题",
              anchorName: "樱桃小丸子",
              status: "REPLAY",
              cover: "/demo/xiaomi-phone.png"
            },
            {
              title: "直播标题直播标题直播标题直播标题",
              anchorName: "樱桃小丸子",
              status: "PREVIEW",
              startTime: "7/29 10:00",
              cover: "/demo/vivo-phone.png"
            }
          ]
        }
      ]
    }
  },
  {
    notAdd: true,
    notImg: true,
    notLink: true,
    drawerPromotions: true,
    group: "marketing",
    type: "promotionDetail",
    promotionsType: "SECKILL",
    name: "秒杀活动",
    icon: "Timer",
    subBkColor: "#e1212b",
    subName: "x点场",
    subColor: "#fff",
    img: "md-image",
    options: {
      layoutStyle: "1",
      list: [
        {
          type: "SECKILL",
          title: "限时秒杀",
          title1: "邀请你的好友来参与",
          bk_color: "#e1212b",
          color1: "#fff",
          data: [
            {
              goodsName: "一家很有品的店",
              price: 234,
              thumbnail: "/demo/apple-phone.png"
            },
            {
              goodsName: "一家很有品的店",
              price: 177,
              thumbnail: "/demo/xiaomi-phone.png"
            },
            {
              goodsName: "一家很有品的店",
              price: 177,
              thumbnail: "/demo/vivo-phone.png"
            },
            {
              goodsName: "一家很有品的店",
              price: 234,
              thumbnail: "/demo/apple-phone.png"
            }
          ]
        }
      ]
    }
  },
  {
    notAdd: true,
    notImg: true,
    notLink: true,
    drawerPromotions: true,
    group: "marketing",
    type: "promotionDetail",
    promotionsType: "KANJIA",
    name: "砍价活动",
    icon: "Scissor",
    subBkColor: "#e1212b",
    subName: "超值好物",
    subColor: "#fff",
    img: "md-image",
    options: {
      layoutStyle: "1",
      list: [
        {
          type: "KANJIA",
          title: "砍价免费拿",
          title1: "邀请好友来砍价",
          bk_color: "#e1212b",
          color1: "#fff",
          data: [
            {
              goodsName: "一家很有品的店",
              price: 234,
              purchasePrice: 99,
              thumbnail: "/demo/apple-phone.png"
            },
            {
              goodsName: "一家很有品的店",
              price: 177,
              purchasePrice: 77,
              thumbnail: "/demo/xiaomi-phone.png"
            },
            {
              goodsName: "一家很有品的店",
              price: 177,
              purchasePrice: 77,
              thumbnail: "/demo/vivo-phone.png"
            },
            {
              goodsName: "一家很有品的店",
              price: 234,
              purchasePrice: 99,
              thumbnail: "/demo/apple-phone.png"
            }
          ]
        }
      ]
    }
  },
  {
    type: "video",
    name: "视频",
    icon: "VideoCamera",
    group: "base",
    img: "md-image",
    notAdd: true,
    notImg: true,
    notLink: true,
    notTitle: true,
    options: {
      list: [
        {
          videoUrl: "",
          poster: "",
          autoplay: false,
          aspectRatio: "16:9",
          style: {
            bgType: "color",
            bgColorStart: "#F5F5F5",
            bgColorEnd: "#F5F5F5",
            bgGradientDir: "horizontal",
            bgRadius: 0,
            bottomBgColor: "#F5F5F5",
            bgImage: "",
            margin: 0,
            padding: 0,
            borderShow: false,
            borderStyle: "solid",
            borderWidth: 1,
            borderColor: "#e5e5e5",
            shadowShow: false,
            shadowColor: "rgba(0,0,0,0.1)",
            shadowX: 0,
            shadowY: 0,
            shadowBlur: 10,
            shadowSpread: 0,
          },
        },
      ],
    }
  },
  {
    type: "blank",
    name: "辅助空白",
    icon: "Crop",
    group: "tools",
    img: "md-image",
    options: {
      bgColor: "#f5f5f5",
      height: 10,
      paddingX: 0,
      pageGap: 10
    }
  },
  {
    type: "line",
    name: "辅助线",
    icon: "Minus",
    group: "tools",
    img: "md-image",
    options: {
      bgColor: "#FFFFFF",
      lineColor: "#979797",
      lineStyle: "dashed",
      lineHeight: 1,
      paddingX: 0,
      pageGap: 10
    }
  },
  {
    type: "richText",
    name: "富文本",
    icon: "EditPen",
    group: "tools",
    img: "md-image",
    options: {
      content: "",
      bgColor: "#FFFFFF",
      paddingX: 12,
      pageGap: 10,
      borderRadius: 0
    }
  },
  {
    type: "integral",
    name: "积分商城",
    icon: "Coin",
    group: "marketing",
    img: "md-image",
    options: {
      layoutStyle: "1",
      list: [
        {
          title: "积分兑好礼",
          count: 6,
          data: [
            {
              goodsName: "一家很有品的店",
              points: 200,
              originalPrice: 234,
              thumbnail: "/demo/apple-phone.png"
            },
            {
              goodsName: "一家很有品的店",
              points: 150,
              originalPrice: 177,
              thumbnail: "/demo/xiaomi-phone.png"
            },
            {
              goodsName: "一家很有品的店",
              points: 150,
              originalPrice: 177,
              thumbnail: "/demo/vivo-phone.png"
            },
            {
              goodsName: "一家很有品的店",
              points: 200,
              originalPrice: 234,
              thumbnail: "/demo/apple-phone.png"
            }
          ]
        }
      ]
    }
  },
  {
    type: "coupon",
    name: "优惠券",
    icon: "Ticket",
    group: "marketing",
    img: "md-image",
    options: {
      layoutStyle: "1",
      list: [
        {
          title: "优惠券",
          count: 5,
          data: [
            {
              id: 1,
              couponType: "PRICE",
              price: 70,
              consumeThreshold: 500,
              storeName: "platform"
            },
            {
              id: 2,
              couponType: "PRICE",
              price: 50,
              consumeThreshold: 300,
              storeName: "platform"
            },
            {
              id: 3,
              couponType: "PRICE",
              price: 30,
              consumeThreshold: 200,
              storeName: "platform"
            },
            {
              id: 4,
              couponType: "PRICE",
              price: 20,
              consumeThreshold: 100,
              storeName: "platform"
            },
            {
              id: 5,
              couponType: "PRICE",
              price: 10,
              consumeThreshold: 0,
              storeName: "platform"
            }
          ]
        }
      ]
    }
  },
  {
    type: "article",
    name: "文章列表",
    icon: "Tickets",
    group: "base",
    img: "md-image",
    options: {
      list: [{ title: "文章列表", categoryId: "", count: 3 }],
      bgColor: "#FFFFFF",
      paddingX: 0,
      pageGap: 10,
      borderRadius: 0
    }
  },
  {
    type: "shop",
    name: "店铺列表",
    icon: "Shop",
    group: "base",
    img: "md-image",
    options: {
      list: [{ title: "店铺列表", count: 4 }],
      bgColor: "#FFFFFF",
      paddingX: 0,
      pageGap: 10,
      borderRadius: 0
    }
  },
  {
    type: "goods",
    name: "商品列表",
    icon: "Goods",
    group: "base",
    img: "md-image",
    notAdd: true,
    notLink: true,
    notImg: true,
    options: {
      list: [
        {
          layout: "list",
          showName: true,
          showPrice: true,
          showSales: true,
          cartShow: true,
          cartStyle: "plus",
          cartAction: "detail",
          dataMode: "category",
          categoryId: "",
          brandId: "",
          storeId: "",
          goodsList: [],
          count: 6,
          sortType: "default"
        }
      ],
      bgColor1: "#FFFFFF",
      bgColor2: "#FFFFFF",
      titleColor: "#282828",
      toneMode: "theme",
      priceColor: "#FF5C58",
      salesColor: "#666666",
      paddingTop: 10,
      paddingBottom: 10,
      paddingX: 12,
      contentGap: 10,
      pageGap: 10,
      borderRadius: 0,
      contentRadius: 7
    }
  },
];
