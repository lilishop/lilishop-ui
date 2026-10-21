/**
 * 店铺端楼层装修组件清单配置
 * drawer: true   广告右侧打开抽屉中显示
 * notAdd: true   没有添加按钮
 * notLink: true  没有链接功能
 * notImg: true   没有选择图片功能
 * close: true    右侧关闭按钮
 * group: 'base' | 'marketing' | 'tools'  组件面板分组（无 group 的条目不在面板显示，仅供抽屉使用）
 */
import * as API_Other from "@/api/other";

// 获取楼层装修信息
export function initData(id) {
  API_Other.getHomeData(id).then(res => {
    homeData = res;
  });
}

export let homeData = {};

export const modelData = [
  {
    "type": "flexOne",
    "name": "热区",
    "icon": "Picture",
    "group": "base",
    "notAdd": true,
    "onlyImg": true,
    "img": "md-image",
    "options": {
      "list": [
        {
          "img": "https://i.loli.net/2020/12/05/8wSNWbnqujDh6HL.png",
          "url": "",
          "link": "",
          "size": "750*280",
          "model": "hotzone"
        }
      ]
    }
  },
  {
    "type": "carousel",
    "name": "轮播图",
    "icon": "PictureFilled",
    "group": "base",
    "img": "md-image",
    "notTitle": false,
    "close": true,
    "options": {
      "list": [
        {
          "img": "https://i.loli.net/2020/12/05/fKH4CwImpbuD5Xj.png",
          "url": "",
          "link": "",
          "size": "750*350",
          "model": "link"
        },
        {
          "img": "https://i.loli.net/2020/12/05/12kleCgrSLfKoQs.png",
          "url": "",
          "link": "",
          "size": "750*350",
          "model": "link"
        },
        {
          "img": "https://i.loli.net/2021/05/14/ZlzcCdnpejtN9gL.png",
          "url": "",
          "link": "",
          "size": "750*350",
          "model": "link"
        }
      ]
    }
  },
  {
    "type": "leftOneRightTwo",
    "name": "左一右二",
    "notAdd": true,
    "drawer": true,
    "view": "tpl_ad_list",
    "img": "md-image",
    "options": {
      "list": [
        {
          "img": "https://i.loli.net/2021/05/14/dtNvI5UxchXn8gz.png",
          "url": "",
          "link": "",
          "size": "335*335",
          "model": "link"
        },
        {
          "img": "https://i.loli.net/2021/05/14/kdB3AE9ay4c1SnN.png",
          "url": "",
          "link": "",
          "size": "335*177",
          "model": "link"
        },
        {
          "img": "https://i.loli.net/2021/05/14/FmDr9ksiXeEqYLU.png",
          "url": "",
          "link": "",
          "size": "335*177",
          "model": "link"
        }
      ]
    }
  },
  {
    "type": "title",
    "name": "标题栏",
    "icon": "Collection",
    "group": "tools",
    "img": "md-image",
    "notAdd": true,
    "notImg": true,
    "options": {
      "list": [
        {
          "title": "标题",
          "color": "#282828",
          "title1": "副标题",
          "color1": "#999999",
          "bk_color": "#FFFFFF",
          "textAlign": "left",
          "link": "",
          "url": "",
          "model": "link"
        }
      ]
    }
  },
  {
    "type": "leftTwoRightOne",
    "name": "左二右一",
    "notAdd": true,
    "drawer": true,
    "img": "md-image",
    "options": {
      "list": [
        {
          "img": "https://i.loli.net/2021/05/14/kdB3AE9ay4c1SnN.png",
          "url": "",
          "link": "",
          "size": "335*177",
          "model": "link"
        },
        {
          "img": "https://i.loli.net/2021/05/14/FmDr9ksiXeEqYLU.png",
          "url": "",
          "link": "",
          "size": "335*177",
          "model": "link"
        },
        {
          "img": "https://i.loli.net/2021/05/14/dtNvI5UxchXn8gz.png",
          "url": "",
          "link": "",
          "size": "335*335",
          "model": "link"
        }
      ]
    }
  },
  {
    "type": "flexThree",
    "name": "三列单行",
    "drawer": true,
    "notAdd": true,
    "img": "md-image",
    "options": {
      "list": [
        {
          "img": "https://i.loli.net/2021/05/14/dtNvI5UxchXn8gz.png",
          "url": "",
          "link": "",
          "size": "226*226 (1:1)",
          "model": "link"
        },
        {
          "img": "https://i.loli.net/2021/05/14/dtNvI5UxchXn8gz.png",
          "url": "",
          "link": "",
          "size": "226*226 (1:1)",
          "model": "link"
        },
        {
          "img": "https://i.loli.net/2021/05/14/dtNvI5UxchXn8gz.png",
          "url": "",
          "link": "",
          "size": "226*226 (1:1)",
          "model": "link"
        }
      ]
    }
  },
  {
    "type": "flexTwo",
    "name": "两张横图",
    "drawer": true,
    "notAdd": true,
    "img": "md-image",
    "options": {
      "list": [
        {
          "img": "https://i.loli.net/2021/05/14/dtNvI5UxchXn8gz.png",
          "url": "",
          "link": "",
          "size": "335*220",
          "model": "link"
        },
        {
          "img": "https://i.loli.net/2021/05/14/dtNvI5UxchXn8gz.png",
          "url": "",
          "link": "",
          "size": "335*220",
          "model": "link"
        }
      ]
    }
  },
  {
    "type": "topOneBottomTwo",
    "name": "上一下二",
    "drawer": true,
    "notAdd": true,
    "img": "md-image",
    "options": {
      "list": [
        {
          "img": "https://i.loli.net/2021/05/14/dtNvI5UxchXn8gz.png",
          "url": "",
          "link": "",
          "size": "710*170",
          "model": "link"
        },
        {
          "img": "https://i.loli.net/2021/05/14/dtNvI5UxchXn8gz.png",
          "url": "",
          "link": "",
          "size": "335*170",
          "model": "link"
        },
        {
          "img": "https://i.loli.net/2021/05/14/dtNvI5UxchXn8gz.png",
          "url": "",
          "link": "",
          "size": "335*170",
          "model": "link"
        }
      ]
    }
  },
  {
    "type": "topTwoBottomOne",
    "name": "上二下一",
    "drawer": true,
    "notAdd": true,
    "img": "md-image",
    "options": {
      "list": [
        {
          "img": "https://i.loli.net/2021/05/14/dtNvI5UxchXn8gz.png",
          "url": "",
          "link": "",
          "size": "335*170",
          "model": "link"
        },
        {
          "img": "https://i.loli.net/2021/05/14/dtNvI5UxchXn8gz.png",
          "url": "",
          "link": "",
          "size": "335*170",
          "model": "link"
        },
        {
          "img": "https://i.loli.net/2021/05/14/dtNvI5UxchXn8gz.png",
          "url": "",
          "link": "",
          "size": "710*170",
          "model": "link"
        }
      ]
    }
  },
  {
    "type": "flexFive",
    "name": "五列单行",
    "drawer": true,
    "notAdd": true,
    "img": "md-image",
    "options": {
      "list": [
        {
          "img": "https://picsum.photos/id/127/200/200",
          "url": "",
          "link": "",
          "size": "75*75（1:1）",
          "model": "link"
        },
        {
          "img": "https://i.loli.net/2021/05/14/dtNvI5UxchXn8gz.png",
          "url": "",
          "link": "",
          "size": "75*75（1:1）",
          "model": "link"
        },
        {
          "img": "https://i.loli.net/2021/05/14/dtNvI5UxchXn8gz.png",
          "url": "",
          "link": "",
          "size": "75*75（1:1）",
          "model": "link"
        },
        {
          "img": "https://i.loli.net/2021/05/14/dtNvI5UxchXn8gz.png",
          "url": "",
          "link": "",
          "size": "75*75（1:1）",
          "model": "link"
        },
        {
          "img": "https://i.loli.net/2021/05/14/dtNvI5UxchXn8gz.png",
          "url": "",
          "link": "",
          "size": "75*75（1:1）",
          "model": "link"
        }
      ]
    }
  },
  {
    "type": "flexFour",
    "name": "四列单行",
    "drawer": true,
    "notAdd": true,
    "img": "md-image",
    "options": {
      "list": [
        {
          "img": "https://i.loli.net/2021/05/14/dtNvI5UxchXn8gz.png",
          "url": "",
          "link": "",
          "size": "88*88（1:1）",
          "model": "link"
        },
        {
          "img": "https://i.loli.net/2021/05/14/dtNvI5UxchXn8gz.png",
          "url": "",
          "link": "",
          "size": "88*88（1:1）",
          "model": "link"
        },
        {
          "img": "https://i.loli.net/2021/05/14/dtNvI5UxchXn8gz.png",
          "url": "",
          "link": "",
          "size": "88*88（1:1）",
          "model": "link"
        },
        {
          "img": "https://i.loli.net/2021/05/14/dtNvI5UxchXn8gz.png",
          "url": "",
          "link": "",
          "size": "88*88（1:1）",
          "model": "link"
        }
      ]
    }
  },
  {
    "type": "textPicture",
    "name": "文字图片",
    "icon": "Document",
    "group": "base",
    "drawer": true,
    "notAdd": true,
    "img": "md-image",
    "options": {
      "list": [
        {
          "img": "https://i.loli.net/2021/05/14/dtNvI5UxchXn8gz.png",
          "url": "",
          "link": "",
          "title": "文字",
          "size": "88*88（1:1）",
          "model": "link"
        },
        {
          "img": "https://i.loli.net/2021/05/14/dtNvI5UxchXn8gz.png",
          "url": "",
          "link": "",
          "title": "文字",
          "size": "88*88（1:1）",
          "model": "link"
        },
        {
          "img": "https://i.loli.net/2021/05/14/dtNvI5UxchXn8gz.png",
          "url": "",
          "link": "",
          "title": "文字",
          "size": "88*88（1:1）",
          "model": "link"
        },
        {
          "img": "https://i.loli.net/2021/05/14/dtNvI5UxchXn8gz.png",
          "url": "",
          "link": "",
          "title": "文字",
          "size": "88*88（1:1）",
          "model": "link"
        }
      ]
    }
  },
  {
    "type": "tpl_ad_list",
    "name": "图片魔方",
    "icon": "Grid",
    "group": "base",
    "img": "md-image",
    "options": {
      "list": [
        {
          "bg_img": "",
          "name": "",
          "url": ""
        }
      ]
    }
  },
  {
    "type": "search",
    "name": "搜索",
    "icon": "Search",
    "group": "base",
    "img": "md-image",
    "notAdd": true,
    "notLink": true,
    "notImg": true,
    "options": {
      "list": [
        {
          "title": "搜索"
        }
      ]
    }
  },
  {
    "type": "notice",
    "name": "公告",
    "icon": "Bell",
    "group": "base",
    "img": "md-image",
    "notAdd": false,
    "notLink": true,
    "notImg": true,
    "options": {
      "list": [
        {
          "title": [
            {
              "context": "这是一条公告"
            }
          ],
          "color": "#666",
          "bk_color": "#FFF",
          "direction": "horizontal",
          "img": "http://files.sxcfx.cn/upload/20220318/71e5d27aca82aeedf647052e1e4ceaaa.png"
        }
      ]
    }
  },
  {
    "type": "video",
    "name": "视频",
    "icon": "VideoCamera",
    "group": "base",
    "img": "md-image",
    "notAdd": true,
    "notImg": true,
    "notLink": true,
    "notTitle": true,
    "options": {
      "list": [
        {
          "videoUrl": "",
          "poster": "",
          "autoplay": false,
          "aspectRatio": "16:9",
          "style": {
            "bgType": "color",
            "bgColorStart": "#F5F5F5",
            "bgColorEnd": "#F5F5F5",
            "bgGradientDir": "horizontal",
            "bgRadius": 0,
            "bottomBgColor": "#F5F5F5",
            "bgImage": "",
            "margin": 0,
            "padding": 0,
            "borderShow": false,
            "borderStyle": "solid",
            "borderWidth": 1,
            "borderColor": "#e5e5e5",
            "shadowShow": false,
            "shadowColor": "rgba(0,0,0,0.1)",
            "shadowX": 0,
            "shadowY": 0,
            "shadowBlur": 10,
            "shadowSpread": 0
          }
        }
      ]
    }
  },
  {
    "type": "blank",
    "name": "辅助空白",
    "icon": "Crop",
    "group": "tools",
    "img": "md-image",
    "options": {
      "bgColor": "#f5f5f5",
      "height": 10,
      "paddingX": 0,
      "pageGap": 0
    }
  },
  {
    "type": "line",
    "name": "辅助线",
    "icon": "Minus",
    "group": "tools",
    "img": "md-image",
    "options": {
      "bgColor": "#FFFFFF",
      "lineColor": "#979797",
      "lineStyle": "dashed",
      "lineHeight": 1,
      "paddingX": 0,
      "pageGap": 0
    }
  },
  {
    "type": "richText",
    "name": "富文本",
    "icon": "EditPen",
    "group": "tools",
    "img": "md-image",
    "options": {
      "content": "",
      "bgColor": "#FFFFFF",
      "paddingX": 12,
      "pageGap": 0,
      "borderRadius": 0
    }
  },
  {
    "type": "coupon",
    "name": "优惠券",
    "icon": "Ticket",
    "group": "marketing",
    "img": "md-image",
    "options": {
      "layoutStyle": "1",
      "list": [
        {
          "title": "优惠券",
          "count": 5,
          "data": [
            {
              "id": 1,
              "couponType": "PRICE",
              "price": 70,
              "consumeThreshold": 500,
              "storeName": "platform"
            },
            {
              "id": 2,
              "couponType": "PRICE",
              "price": 50,
              "consumeThreshold": 300,
              "storeName": "platform"
            },
            {
              "id": 3,
              "couponType": "PRICE",
              "price": 30,
              "consumeThreshold": 200,
              "storeName": "platform"
            },
            {
              "id": 4,
              "couponType": "PRICE",
              "price": 20,
              "consumeThreshold": 100,
              "storeName": "platform"
            },
            {
              "id": 5,
              "couponType": "PRICE",
              "price": 10,
              "consumeThreshold": 0,
              "storeName": "platform"
            }
          ]
        }
      ]
    }
  },
  {
    "type": "goods",
    "name": "商品列表",
    "icon": "Goods",
    "group": "marketing",
    "img": "md-image",
    "notAdd": true,
    "notLink": true,
    "notImg": true,
    "options": {
      "list": [
        {
          "layout": "list",
          "showName": true,
          "showPrice": true,
          "showSales": true,
          "cartShow": true,
          "cartStyle": "plus",
          "cartAction": "detail",
          "dataMode": "category",
          "categoryId": "",
          "brandId": "",
          "storeId": "",
          "goodsList": [],
          "count": 6,
          "sortType": "default"
        }
      ],
      "bgColor1": "#FFFFFF",
      "bgColor2": "#FFFFFF",
      "titleColor": "#282828",
      "toneMode": "theme",
      "priceColor": "#FF5C58",
      "salesColor": "#666666",
      "paddingTop": 10,
      "paddingBottom": 10,
      "paddingX": 12,
      "contentGap": 10,
      "pageGap": 0,
      "borderRadius": 0,
      "contentRadius": 7
    }
  }
];
