
import * as API_Other from '@/api/other'

// 获取楼层装修信息
export function initData(id){
  API_Other.getHomeData(id).then(res=>{

    homeData = res

  })
}


export let homeData ={}


/**
 * drawer:true   广告右侧打开抽屉中显示
 * ad_drawer:true 活动魔方右侧显示
 * notAdd: true 没有添加按钮
 * notLink: true 没有连接功能
 * notImg: true 没有选择图片功能
 * close:true 右侧关闭按钮
 */
export const modelData = [
  {
    type: "carousel",
    name: "图片轮播",
    img: "md-image",
    notTitle: false,
    close: true,
    options: {
      list: [

        {
          img: "https://i.loli.net/2020/12/05/fKH4CwImpbuD5Xj.png",
          url: "",
          link: "",
          size: "750*350"
        },
        {
          img: "https://i.loli.net/2020/12/05/12kleCgrSLfKoQs.png",
          url: "",
          link: "",
          size: "750*350"
        },
        {
          img:
            "https://shopro-1253949872.file.myqcloud.com/uploads/20200704/343e226d0d2e2d2efcf21f31a678ba46.png",
          url: "",
          link: "",
          size: "750*350"
        },
      ]
    }
  },
  {
    type: "leftOneRightTwo",
    name: "左一右二",
    notAdd: true,
    drawer: true,
    view: "tpl_ad_list",
    img: "md-image",
    options: {
      list: [
        {
          img:
            "https://shopro-1253949872.file.myqcloud.com/uploads/20200704/0669a6adec3f35d45ec66a082e03774f.png",
          url: "",
          link: "",
          size: "335*335"
        },
        {
          img:
            "https://shopro-1253949872.file.myqcloud.com/uploads/20200704/cddb5d90a4241f6235d16368534bc730.png",
          url: "",
          link: "",
          size: "335*177"
        },
        {
          img:
            "https://shopro-1253949872.file.myqcloud.com/uploads/20200704/e047d312fb5930de972ae288b9b3bae7.png",
          url: "",
          link: "",
          size: "335*177"
        }
      ]
    }
  },
  {
    type: "title",
    name: "标题栏",
    img: "md-image",
    notAdd: true,
    notLink: true,
    notImg: true,
    options: {
      list: [
        {
          title: "标题",
          color: "#000000"
        }
      ]
    }
  },
  {
    type: "leftTwoRightOne",
    name: "左二右一",
    notAdd: true,
    drawer: true,

    img: "md-image",
    options: {
      list: [
        {
          img:
            "https://shopro-1253949872.file.myqcloud.com/uploads/20200704/cddb5d90a4241f6235d16368534bc730.png",
          url: "",
          link: "",
          size: "335*177"
        },
        {
          img:
            "https://shopro-1253949872.file.myqcloud.com/uploads/20200704/e047d312fb5930de972ae288b9b3bae7.png",
          url: "",
          link: "",
          size: "335*177"
        },
        {
          img:
            "https://shopro-1253949872.file.myqcloud.com/uploads/20200704/0669a6adec3f35d45ec66a082e03774f.png",
          url: "",
          link: "",
          size: "335*335"
        }
      ]
    }
  },
  {
    type: "flexThree",
    name: "三列单行",
    drawer: true,
    notAdd: true,

    img: "md-image",
    options: {
      list: [
        {
          img:
            "https://shopro-1253949872.file.myqcloud.com/uploads/20200704/0669a6adec3f35d45ec66a082e03774f.png",
          url: "",
          link: "",
          size:"226*226 (1:1)"
        },
        {
          img:
            "https://shopro-1253949872.file.myqcloud.com/uploads/20200704/0669a6adec3f35d45ec66a082e03774f.png",
          url: "",
          link: "",
          size:"226*226 (1:1)"
        },
        {
          img:
            "https://shopro-1253949872.file.myqcloud.com/uploads/20200704/0669a6adec3f35d45ec66a082e03774f.png",
          url: "",
          link: "",
          size:"226*226 (1:1)"
        }
      ]
    }
  },
  {
    type: "flexOne",
    name: "一张大图",
    drawer: true,
    notAdd: true,

    img: "md-image",
    options: {
      list: [
        {
          img:
            "https://i.loli.net/2020/12/05/8wSNWbnqujDh6HL.png",
          url: "",
          link: "",
          size:"750*280"
        }
      ]
    }
  },
  {
    type: "flexTwo",
    name: "两张横图",
    drawer: true,
    notAdd: true,

    img: "md-image",
    options: {
      list: [
        {
          img:
            "https://shopro-1253949872.file.myqcloud.com/uploads/20200704/0669a6adec3f35d45ec66a082e03774f.png",
          url: "",
          link: "",
          size: "335*220"
        },
        {
          img:
            "https://shopro-1253949872.file.myqcloud.com/uploads/20200704/0669a6adec3f35d45ec66a082e03774f.png",
          url: "",
          link: "",
          size: "335*220"
        }
      ]
    }
  },
  {
    type: "topOneBottomTwo",
    name: "上一下二",
    drawer: true,
    notAdd: true,

    img: "md-image",
    options: {
      list: [
        {
          img:
            "https://shopro-1253949872.file.myqcloud.com/uploads/20200704/0669a6adec3f35d45ec66a082e03774f.png",
          url: "",
          link: "",
          size: "710*170"
        },
        {
          img:
            "https://shopro-1253949872.file.myqcloud.com/uploads/20200704/0669a6adec3f35d45ec66a082e03774f.png",
          url: "",
          link: "",
          size: "335*170"
        },
        {
          img:
            "https://shopro-1253949872.file.myqcloud.com/uploads/20200704/0669a6adec3f35d45ec66a082e03774f.png",
          url: "",
          link: "",
          size: "335*170"
        }
      ]
    }
  },
  {
    type: "topTwoBottomOne",
    name: "上二下一",
    drawer: true,
    notAdd: true,

    img: "md-image",
    options: {
      list: [
        {
          img:
            "https://shopro-1253949872.file.myqcloud.com/uploads/20200704/0669a6adec3f35d45ec66a082e03774f.png",
          url: "",
          link: "",

          size: "335*170"
        },
        {
          img:
            "https://shopro-1253949872.file.myqcloud.com/uploads/20200704/0669a6adec3f35d45ec66a082e03774f.png",
          url: "",
          link: "",
          size: "335*170"
        },
        {
          img:
            "https://shopro-1253949872.file.myqcloud.com/uploads/20200704/0669a6adec3f35d45ec66a082e03774f.png",
          url: "",
          link: "",
          size: "710*170"
        }
      ]
    }
  },
  {
    type: "flexFive",
    name: "五列单行",
    drawer: true,
    notAdd: true,

    img: "md-image",
    options: {
      list: [
        {
          img: "https://picsum.photos/id/127/200/200",
          url: "",
          link: "",
          size:"75*75（1:1）"
        },
        {
          img:
            "https://shopro-1253949872.file.myqcloud.com/uploads/20200704/0669a6adec3f35d45ec66a082e03774f.png",
          url: "",
          link: "",
          size:"75*75（1:1）"
        },
        {
          img:
            "https://shopro-1253949872.file.myqcloud.com/uploads/20200704/0669a6adec3f35d45ec66a082e03774f.png",
          url: "",
          link: "",
          size:"75*75（1:1）"
        },
        {
          img:
            "https://shopro-1253949872.file.myqcloud.com/uploads/20200704/0669a6adec3f35d45ec66a082e03774f.png",
          url: "",
          link: "",
          size:"75*75（1:1）"
        },
        {
          img:
            "https://shopro-1253949872.file.myqcloud.com/uploads/20200704/0669a6adec3f35d45ec66a082e03774f.png",
          url: "",
          link: "",
          size:"75*75（1:1）"
        }
      ]
    }
  },
  {
    type: "flexFour",
    name: "四列单行",
    drawer: true,
    notAdd: true,

    img: "md-image",
    options: {
      list: [
        {
          img:
            "https://shopro-1253949872.file.myqcloud.com/uploads/20200704/0669a6adec3f35d45ec66a082e03774f.png",
          url: "",
          link: "",
          size:"88*88（1:1）"
        },
        {
          img:
            "https://shopro-1253949872.file.myqcloud.com/uploads/20200704/0669a6adec3f35d45ec66a082e03774f.png",
          url: "",
          link: "",
          size:"88*88（1:1）"
        },
        {
          img:
            "https://shopro-1253949872.file.myqcloud.com/uploads/20200704/0669a6adec3f35d45ec66a082e03774f.png",
          url: "",
          link: "",
          size:"88*88（1:1）"
        },
        {
          img:
            "https://shopro-1253949872.file.myqcloud.com/uploads/20200704/0669a6adec3f35d45ec66a082e03774f.png",
          url: "",
          link: "",
          size:"88*88（1:1）"
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
          img:
            "https://shopro-1253949872.file.myqcloud.com/uploads/20200704/0669a6adec3f35d45ec66a082e03774f.png",
          url: "",
          link: "",
          title: "88*88（1:1）"
        },
        {
          img:
            "https://shopro-1253949872.file.myqcloud.com/uploads/20200704/0669a6adec3f35d45ec66a082e03774f.png",
          url: "",
          link: "",
          title: "88*88（1:1）"
        },
        {
          img:
            "https://shopro-1253949872.file.myqcloud.com/uploads/20200704/0669a6adec3f35d45ec66a082e03774f.png",
          url: "",
          link: "",
          title: "88*88（1:1）"
        },
        {
          img:
            "https://shopro-1253949872.file.myqcloud.com/uploads/20200704/0669a6adec3f35d45ec66a082e03774f.png",
          url: "",
          link: "",
          title: "88*88（1:1）"
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
          img:
            "https://i.loli.net/2020/12/05/SoGAv7gYybuWzED.png",
          url: "",
          link: "",
          title: "标题",
          size: "88*88 (1:1)"
        },
        {
          img:
            "https://i.loli.net/2020/12/05/JXR5K3sbIeENjqH.png",
          url: "",
          link: "",
          title: "标题",
          size: "88*88 (1:1)"
        },
        {
          img:
            "https://i.loli.net/2020/12/05/KlZfnCFIdEV231Y.png",
          url: "",
          link: "",
          title: "标题",
          size: "88*88 (1:1)"
        },
        {
          img:
            "https://i.loli.net/2020/12/05/GfmMyN2wrUVIlci.png",
          url: "",
          link: "",
          title: "标题",
          size: "88*88 (1:1)"
        },
        {
          img:
            "https://i.loli.net/2020/12/05/eznDa3iNby5FkYL.png",
          url: "",
          link: "",
          title: "标题",
          size: "88*88 (1:1)"
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
          titleWay: [
            {
              title: "精选",
              desc: "电子推荐"
            },
            {
              title: "实惠",
              desc: "便宜好货"
            },
            {
              title: "进口",
              desc: "国际自营"
            },
            {
              title: "推荐",
              desc: "喂奶推荐"
            }
          ],
          listWay: [
            {
              img:
                "https://api.7wpp.com/uploads/20200930/78d480fa1025394b9be24ef5eef17489.png",
              price: "120",
              title:
                " 微软 (Microsoft) Xbox 无线控制器/手柄 湛蓝色 | 3.5mm耳机接口蓝牙连接 Xbox主机电脑平板通用",
              type: "精选"
            },
            {
              img:
                "https://i.loli.net/2020/12/05/c9mptI5Pg8qJ6ny.png",
              title:
                "宏碁(acer) DP高清线1.2版 2K*4KDisplayPort公对公接线笔记本电脑显卡连接显示器视频线1.5米",
              price: "190",
              type: "精选"
            },
            {
              img:
                "https://i.loli.net/2020/12/05/QsSYIPF743Hgf8q.png",
              title:
                "宏碁(acer) DP高清线1.2版 2K*4KDisplayPort公对公接线笔记本电脑显卡连接显示器视频线1.5米",
              price: "10",
              type: "精选"
            },
            {
              img:
                "https://i.loli.net/2020/12/05/VTwDYcLWnukGxat.png",
              title:
                "宏碁(acer) DP高清线1.2版 2K*4KDisplayPort公对公接线笔记本电脑显卡连接显示器视频线1.5米",
              price: "190",
              type: "精选"
            },
            {
              img:
                "https://i.loli.net/2020/12/05/SIFwaVpE4YJAuQf.png",
              title:
                "宏碁(acer) DP高清线1.2版 2K*4KDisplayPort公对公接线笔记本电脑显卡连接显示器视频线1.5米",
              price: "10",
              type: "精选"
            },
            {
              img:
                "https://api.7wpp.com/uploads/20201110/86d4dedc0d88ce4b1329b02a4b87fe7d.jpg",
              title:
                "宏碁(acer) DP高清线1.2版 2K*4KDisplayPort公对公接线笔记本电脑显卡连接显示器视频线1.5米",
              price: "190",
              type: "精选"
            },
            {
              img:
                "https://api.7wpp.com/uploads/20200930/0d9102613d7b7e738c83504f80194cd4.jpg",
              title:
                "宏碁(acer) DP高清线1.2版 2K*4KDisplayPort公对公接线笔记本电脑显卡连接显示器视频线1.5米",
              price: "10",
              type: "精选"
            },
          ]
        }
      ]
    }
  },
  {
    notAdd: true,
    notImg: true,
    type: "joinGroup",
    name: "拼团活动",
    img: "md-image",
    options: {
      list: [
        {
          title: "测试拼团"
        }
      ]
    }
  },
  {
    notAdd: true,
    notImg: true,
    type: "integral",
    name: "积分活动",
    img: "md-image",
    options: {
      list: [
        {
          title: "测试积分"
        }
      ]
    }
  },
  {
    notAdd: true,
    notImg: true,
    type: "spike",
    name: "秒杀活动",
    img: "md-image",
    options: {
      list: [
        {
          title: "测试秒杀"
        }
      ]
    }
  },
  {
    notAdd: true,
    notImg: true,
    type: "group",
    name: "团购活动",
    img: "md-image",
    options: {
      list: [
        {
          title: "测试团购"
        }
      ]
    }
  }
];
