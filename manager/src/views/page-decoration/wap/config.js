import * as API_Other from "@/api/other";

// 获取楼层装修信息
export function initData(id) {
  API_Other.getHomeData(id).then(res => {
    debugger
    homeData = res;
    console.log(res)
  });
}

export let homeData = {};

/**
 * drawer:true   广告右侧打开抽屉中显示
 * drawerPromotions:true   广告右侧打开抽屉中显示
 * ad_drawer:true 活动魔方右侧显示
 * notAdd: true 没有添加按钮
 * notLink: true 没有链接功能
 * notImg: true 没有选择图片功能
 * close:true 右侧关闭按钮
 */
export const modelData = [

  {
    type: "flexOne",
    name: "图片",
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
          model: "link"
        }
      ]
    }
  },
  {
    type: "carousel",
    name: "轮播图",
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
    img: "md-image",
    // notTitle:true,
    notAdd: true,
    notImg: true,
    options: {
      list: [
        {
          title: "标题",
          color: "#fff",
          title1: '领取',
          color1: "#fff",
          bk_color: "#FF0000",
          textAlign: "center",
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
    name: "广告魔方",
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
        },
        {
          img: "https://i.loli.net/2020/12/05/eznDa3iNby5FkYL.png",
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
    type: "goods",
    name: "商品分类",
    img: "md-image",
    notAdd: true,
    notLink: true,
    notImg: true,
    options: {
      list: [
        {
          /**
           * 2021/12/9
           * 新增索引（‘index’）判断商品归属分类
           * 之前代码没有配置index也不会收到印象
           * 新建的楼层将采用索引判断分类
           */
          titleWay: [
            {
              title: "精选",
              desc: "电子推荐",
              ___index: 0,
              bindCategory:""
            },
            {
              title: "实惠",
              desc: "便宜好货",
              ___index: 1,
              bindCategory:""
            },
            {
              title: "进口",
              desc: "国际自营",
              ___index: 2,
              bindCategory:""
            },
            {
              title: "推荐",
              desc: "喂奶推荐",
              ___index: 3,
              bindCategory:""
            }
          ],
          listWay: [
            {
              img: "https://i.loli.net/2021/05/14/KTLSrOVJmEdX12A.png",
              price: "120",
              title:
                " 微软 (Microsoft) Xbox 无线控制器/手柄 湛蓝色 | 3.5mm耳机接口蓝牙连接 Xbox主机电脑平板通用",
              type: "精选",
              ___index: 0
            },
            {
              img: "https://i.loli.net/2020/12/05/c9mptI5Pg8qJ6ny.png",
              title:
                "宏碁(acer) DP高清线1.2版 2K*4KDisplayPort公对公接线笔记本电脑显卡连接显示器视频线1.5米",
              price: "190",
              type: "精选",
              ___index: 0
            },

          ]
        }
      ]
    }
  },

  {
    type: "notice",
    name: "公告",
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
    type: "promotions",
    name: "促销活动",
    img: "md-image",
    notAdd: true,
    notLink: true,
    notImg: true,
    close: true,
    options: {
      list: []
    }
  },
  {
    notAdd: true,
    notImg: true,
    notLink: true,
    drawerPromotions: true,
    type: "promotionDetail",
    promotionsType: "PINTUAN",
    name: "拼团活动",
    subBkColor: "#e1212b",
    subName: "惊喜折扣",
    subColor: "#fff",
    img: "md-image",
    options: {
      list: []
    }
  },
  {
    notAdd: true,
    notImg: true,
    notLink: true,
    drawerPromotions: true,
    type: "promotionDetail",
    promotionsType: "LIVE",
    name: "直播活动",
    subBkColor: "#e1212b",
    subName: "优惠好价",
    subColor: "#fff",
    img: "md-image",
    options: {
      list: []
    }
  },
  {
    notAdd: true,
    notImg: true,
    notLink: true,
    drawerPromotions: true,
    type: "promotionDetail",
    promotionsType: "SECKILL",
    name: "秒杀活动",
    subBkColor: "#e1212b",
    subName: "x点场",
    subColor: "#fff",
    img: "md-image",
    options: {
      list: []
    }
  },
  {
    notAdd: true,
    notImg: true,
    notLink: true,
    drawerPromotions: true,
    type: "promotionDetail",
    promotionsType: "KANJIA",
    name: "砍价活动",
    subBkColor: "#e1212b",
    subName: "超值好物",
    subColor: "#fff",
    img: "md-image",
    options: {
      list: []
    }
  }
];
