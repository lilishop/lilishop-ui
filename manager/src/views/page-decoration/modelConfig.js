import nav1Img from '@/assets/nav/1.jpg';
import nav2Img from '@/assets/nav/2.jpg';
import nav3Img from '@/assets/nav/3.jpg';
import nav4Img from '@/assets/nav/4.jpg';
import nav5Img from '@/assets/nav/5.jpg';
import decorate1Img from '@/assets/nav/decorate1.png';
import decorateImg from '@/assets/nav/decorate.png';
import decorate2Img from '@/assets/nav/decorate2.jpeg';
import decorate11Img from '@/assets/nav/decorate11.jpeg';
import decorate3Img from '@/assets/nav/decorate3.jpeg';
import decorate4Img from '@/assets/nav/decorate4.jpeg';
import decorate5Img from '@/assets/nav/decorate5.jpeg';
import decorate6Img from '@/assets/nav/decorate6.jpeg';
import decorate7Img from '@/assets/nav/decorate7.jpeg';
import decorate8Img from '@/assets/nav/decorate8.png';
import decorate9Img from '@/assets/nav/decorate9.png';
import decorate10Img from '@/assets/nav/decorate10.jpeg';

export const modelData = [{
    type: 'carousel',
    name: '图片轮播',
    icon: 'md-image',
    showName: '',
    size: "790*340",
    options: {
      list: [{
          img: nav1Img,
          url: ''
        },
        {
          img: nav2Img,
          url: ''
        },
        {
          img: nav3Img,
          url: ''
        }
      ],
    },
  },
//   {
//     type: 'carousel1',
//     name: '图片轮播1',
//     icon: 'md-image',
//     size: "1200*470",
//     options: {
//       list: [{
//           img: nav1Img,
//           url: '',
//           bgColor: 'yellow'
//         },
//         {
//           img: nav2Img,
//           url: '',
//           bgColor: 'purple'
//         },
//         {
//           img: nav3Img,
//           url: '',
//           bgColor: 'blue'
//         }
//       ],
//     },
//   },
//   {
//     type: 'carousel2',
//     name: '图片轮播2',
//     icon: 'md-image',
//     size: "590*470",
//     options: {
//       list: [{
//           img: nav1Img,
//           url: ''
//         },
//         {
//           img: nav2Img,
//           url: ''
//         },
//         {
//           img: nav3Img,
//           url: ''
//         }
//       ],
//       listRight: [
//         [{
//             img: nav1Img,
//             url: ''
//           },
//           {
//             img: nav2Img,
//             url: ''
//           },
//           {
//             img: nav3Img,
//             url: ''
//           }
//         ],
//         [{
//             img: nav1Img,
//             url: ''
//           },
//           {
//             img: nav2Img,
//             url: ''
//           },
//           {
//             img: nav3Img,
//             url: ''
//           }
//         ],
//       ]
//     },
//   },
  {
    type: 'hotAdvert',
    name: '热门广告',
    icon: 'md-image',
    showName: '',
    options: {
      list: [{
          img: decorate1Img,
          url: '',
          size: '1200*自定义'
        },
        {
          img: nav1Img,
          url: '',
          size: '230*190'
        },
        {
          img: nav1Img,
          url: '',
          size: '230*190'
        },
        {
          img: nav1Img,
          url: '',
          size: '230*190'
        },
        {
          img: nav1Img,
          url: '',
          size: '230*190'
        },
        {
          img: nav1Img,
          url: '',
          size: '230*190'
        }
      ],
    },
  },
  {
    type: 'seckill',
    name: '促销活动',
    icon: 'md-image',
    showName: '',
    options: {
      list: [{
          time: 6,
          goodsList: [{
              img: nav1Img,
              price: 20,
              originalPrice: 30,
              name: '阿迪达斯三叶草asdasdafads123213a',
              url: ''
            },
            {
              img: nav2Img,
              price: 20,
              originalPrice: 30,
              name: '阿迪达斯三叶草asdasdafadsa',
              url: ''
            },
            {
              img: nav3Img,
              price: 20,
              originalPrice: 30,
              name: '阿迪达斯三叶草asdasdafadsa',
              url: ''
            },
            {
              img: nav4Img,
              price: 20,
              originalPrice: 30,
              name: '阿迪达斯三叶草asdasdafadsa',
              url: ''
            },
            {
              img: nav5Img,
              price: 20,
              originalPrice: 30,
              name: '阿迪达斯三叶草asdasdafadsa',
              url: ''
            },
            {
              img: nav1Img,
              price: 20,
              originalPrice: 30,
              name: '阿迪达斯三叶草asdasdafadsa',
              url: ''
            },
            {
              img: nav2Img,
              price: 20,
              originalPrice: 30,
              name: '阿迪达斯三叶草asdasdafadsa',
              url: ''
            },
            {
              img: nav3Img,
              price: 20,
              originalPrice: 30,
              name: '阿迪达斯三叶草asdasdafadsa',
              url: ''
            },
            {
              img: nav4Img,
              price: 20,
              originalPrice: 30,
              name: '阿迪达斯三叶草asdasdafadsa',
              url: ''
            },
            {
              img: nav5Img,
              price: 20,
              originalPrice: 30,
              name: '阿迪达斯三叶草asdasdafadsa',
              url: ''
            },
          ]
        },
        {
          time: 8,
          goodsList: [{
              img: nav1Img,
              url: ''
            },
            {
              img: nav2Img,
              url: ''
            },
            {
              img: nav3Img,
              url: ''
            },
            {
              img: nav4Img,
              url: ''
            },
            {
              img: nav5Img,
              url: ''
            },
          ]
        },
        {
          time: 10,
          goodsList: [{
              img: nav1Img,
              url: ''
            },
            {
              img: nav2Img,
              url: ''
            },
            {
              img: nav3Img,
              url: ''
            },
            {
              img: nav4Img,
              url: ''
            },
            {
              img: nav5Img,
              url: ''
            },
          ]
        },
        {
          time: 12,
          goodsList: [{
              img: nav1Img,
              url: ''
            },
            {
              img: nav2Img,
              url: ''
            },
            {
              img: nav3Img,
              url: ''
            },
            {
              img: nav4Img,
              url: ''
            },
            {
              img: nav5Img,
              url: ''
            },
          ]
        },
        {
          time: 14,
          goodsList: []
        },
        {
          time: 16,
          goodsList: []
        },
        {
          time: 18,
          goodsList: []
        }

      ]
    },
  },
  {
    type: 'discountAdvert',
    name: '折扣广告',
    icon: 'md-image',
    options: {
      bgImg: {
        img: decorateImg,
        url: '',
        size: "1300*596"
      },
      classification: [{
        img: decorate2Img,
        url: '',
        size: '190*210'
      }, {
        img: decorate2Img,
        url: '',
        size: '190*210'
      }, {
        img: decorate2Img,
        url: '',
        size: '190*210'
      }, {
        img: decorate2Img,
        url: '',
        size: '190*210'
      }, {
        img: decorate2Img,
        url: '',
        size: '190*210'
      }, {
        img: decorate2Img,
        url: '',
        size: '190*210'
      }, {
        img: decorate2Img,
        url: '',
        size: '190*210'
      }, {
        img: decorate2Img,
        url: '',
        size: '190*210'
      }, {
        img: decorate2Img,
        url: '',
        size: '190*210'
      }, {
        img: decorate2Img,
        url: '',
        size: '190*210'
      }, ],
      brandList: [{
        img: decorate11Img,
        url: '',
        size: '240*105'
      }, {
        img: decorate11Img,
        url: '',
        size: '240*105'
      }, {
        img: decorate11Img,
        url: '',
        size: '240*105'
      }, {
        img: decorate11Img,
        url: '',
        size: '240*105'
      }, ]
    },
  },
  {
    type: 'recommend',
    name: '好货推荐',
    icon: 'md-image',
    options: {
      contentLeft: {
        title: '发现好货',
        secondTitle: '更多好货',
        bgColor: '#449dae',
        url: '',
        list: [{
            img: decorate3Img,
            name: '阿迪达斯三叶草',
            describe: '也许是每一款经典系列都应该有一个独特的故事吧',
            url: '',
            size: '160*160'
          },
          {
            img: decorate4Img,
            name: '360行车记录',
            describe: '夜行 监控 电子狗 蓝牙',
            url: '',
            size: '80*80'
          },
          {
            img: decorate4Img,
            name: '360行车记录',
            describe: '夜行 监控 电子狗 蓝牙',
            url: '',
            size: '80*80'
          },
          {
            img: decorate4Img,
            name: '360行车记录',
            describe: '夜行 监控 电子狗 蓝牙',
            url: '',
            size: '80*80'
          },
          {
            img: decorate4Img,
            name: '360行车记录',
            describe: '夜行 监控 电子狗 蓝牙',
            url: '',
            size: '80*80'
          },
          {
            img: decorate4Img,
            name: '360行车记录',
            describe: '夜行 监控 电子狗 蓝牙',
            url: '',
            size: '80*80'
          },
          {
            img: decorate4Img,
            name: '360行车记录',
            describe: '夜行 监控 电子狗 蓝牙',
            url: '',
            size: '80*80'
          },
        ]
      },
      contentRight: {
        title: '特色推荐',
        secondTitle: '更多特色推荐',
        bgColor: '#a25684',
        url: '',
        list: [{
            img: decorate5Img,
            name: '好心情喝出来',
            describe: '遇见懂你的饮品',
            url: '',
            size: '100*100'
          },
          {
            img: decorate5Img,
            name: '好心情喝出来',
            describe: '遇见懂你的饮品',
            url: '',
            size: '100*100'
          },
          {
            img: decorate5Img,
            name: '好心情喝出来',
            describe: '遇见懂你的饮品',
            url: '',
            size: '100*100'
          },
          {
            img: decorate5Img,
            name: '好心情喝出来',
            describe: '遇见懂你的饮品',
            url: '',
            size: '100*100'
          },
        ]
      }
    },
  },
  {
    type: 'newGoodsSort',
    name: '新品排行',
    icon: 'md-image',
    options: {
      left: {
        title: '特卖',
        secondTitle: "更多特卖",
        bgColor: '#c43d7e',
        url: '',
        list: [{
            name: '新年心愿单',
            describe: '满269减50,满999减100',
            img: decorate6Img,
            url: '',
            size: "160*160"
          },
          {
            name: 'Ms.Maggie 冬季时尚',
            describe: '满269减50',
            img: decorate6Img,
            url: '',
            size: "90*90"
          },
          {
            name: 'Ms.Maggie 冬季时尚',
            describe: '满269减50',
            img: decorate6Img,
            url: '',
            size: "90*90"
          },
          {
            name: 'Ms.Maggie 冬季时尚',
            describe: '满269减50',
            img: decorate6Img,
            url: '',
            size: "90*90"
          },
          {
            name: '阿迪达斯 领跑时尚',
            describe: '满269减50',
            img: decorate6Img,
            url: '',
            size: "90*90"
          },
        ],
      },
      middle: {
        title: '新品',
        secondTitle: "更多新品",
        bgColor: '#e66a07',
        url: '',
        list: [{
            name: '阿迪达斯 领跑时尚',
            describe: '满269减50',
            img: decorate6Img,
            url: '',
            size: "90*90"
          },
          {
            name: '阿迪达斯 领跑时尚',
            describe: '满269减50',
            img: decorate6Img,
            url: '',
            size: "90*90"
          },
          {
            name: '阿迪达斯 领跑时尚',
            describe: '满269减50',
            img: decorate6Img,
            url: '',
            size: "90*90"
          },
          {
            name: '阿迪达斯 领跑时尚',
            describe: '满269减50',
            img: decorate6Img,
            url: '',
            size: "90*90"
          },
          {
            name: '阿迪达斯 领跑时尚',
            describe: '满269减50',
            img: decorate6Img,
            url: '',
            size: "90*90"
          },
          {
            name: '阿迪达斯 领跑时尚',
            describe: '满269减50',
            img: decorate6Img,
            url: '',
            size: "90*90"
          },
        ]
      },
      right: {
        title: '排行榜',
        secondTitle: "精品风向标",
        bgColor: '#b62323',
        url: '',
        list: [{
            name: '小米红米3s手机壳保护套红米3高配版指纹男女款潮版磨砂硬壳防摔 收藏截图 送大礼包',
            price: 14.9,
            img: decorate7Img,
            url: ''
          },
          {
            name: '小米红米3s手机壳保护套红米3高配版指纹男女款潮版磨砂硬壳防摔 收藏截图 送大礼包',
            price: 14.9,
            img: decorate7Img,
            url: ''
          },
          {
            name: '小米红米3s手机壳保护套红米3高配版指纹男女款潮版磨砂硬壳防摔 收藏截图 送大礼包',
            price: 14.9,
            img: decorate7Img,
            url: ''
          },
          {
            name: '小米红米3s手机壳保护套红米3高配版指纹男女款潮版磨砂硬壳防摔 收藏截图 送大礼包',
            price: 14.9,
            img: decorate7Img,
            url: ''
          },
          {
            name: '小米红米3s手机壳保护套红米3高配版指纹男女款潮版磨砂硬壳防摔 收藏截图 送大礼包',
            price: 14.9,
            img: decorate7Img,
            url: ''
          },
          {
            name: '小米红米3s手机壳保护套红米3高配版指纹男女款潮版磨砂硬壳防摔 收藏截图 送大礼包',
            price: 14.9,
            img: decorate7Img,
            url: ''
          },
        ]
      }
    },
  },
  {
    type: 'firstAdvert',
    name: '首页广告',
    icon: 'md-image',
    options: {
      list: [{
          name: '生鲜',
          describe: "年货带回家 满199减60",
          img: decorate8Img,
          url: '',
          fromColor: '#e89621',
          toColor: "#f5c568",
          size: '170*170'
        },
        {
          name: '众筹',
          describe: "年货带回家",
          img: decorate9Img,
          url: '',
          fromColor: "#325bb4",
          toColor: '#4c9afe',
          size: '170*170'
        },
        {
          name: '生鲜',
          describe: "年货带回家 满199减60",
          img: decorate8Img,
          url: '',
          fromColor: "#1c9daf",
          toColor: '#40cda7',
          size: '170*170'
        },
        {
          name: '众筹',
          describe: "备孕有孕检测仪",
          img: decorate9Img,
          url: '',
          fromColor: "#d13837",
          toColor: '#df6d4f',
          size: '170*170'
        },
        {
          name: '生鲜',
          describe: "年货带回家 满199减60",
          img: decorate8Img,
          url: '',
          fromColor: "#ca4283",
          toColor: '#eb75cf',
          size: '170*170'
        },
        {
          name: '众筹',
          describe: "备孕有孕检测仪",
          img: decorate9Img,
          url: '',
          fromColor: "#5d40c1",
          toColor: '#8c5fdb',
          size: '170*170'
        },
      ],
    },
  },
  {
    type: 'bannerAdvert',
    name: '横幅广告',
    icon: 'md-image',
    options: {
      img: '',
      url: '',
      size: '1200*自定义'
    },
  },
  {
    type: 'oneRowThreeColumns',
    name: '一行三列',
    icon: 'md-image',
    options: {
      list:[
        {
          img: decorate8Img,
          url:"",
          size:"385*165"
        },
        {
          img: decorate8Img,
          url:"",
          size:"385*165"
        },
        {
          img: decorate8Img,
          url:"",
          size:"385*165"
        },
      ]
    },
  },
  {
    type: 'goodsType',
    name: '商品模块',
    icon: 'md-image',
    options: {
      title:"智能家居",
      labels:[
        {
          label: '音箱',
          ___index:0,

        },
        {
          label: '门锁',
          ___index:1
        },
        {
          label: '路由器',
          ___index:2
        },
        {
          label: '智能设备',
          ___index:3
        },
      ],
      list:[
        {
          img: "https://i.loli.net/2021/05/14/KTLSrOVJmEdX12A.png",
          price: "120",
          title:" 微软 (Microsoft) Xbox 无线控制器/手柄 湛蓝色 | 3.5mm耳机接口蓝牙连接 Xbox主机电脑平板通用",
          desc:"万家宝藏好店等你来",
          url:'',
          ___index: 0
        },

      ]
    },
  },
  {
    type: 'onlyGoodsModel',
    name: '商品模块2',
    icon: 'md-image',
    options: {
      list:[
        {
          img: "https://i.loli.net/2021/05/14/KTLSrOVJmEdX12A.png",
          price: "120",
          title:" 微软 (Microsoft) Xbox 无线控制器/手柄 湛蓝色 | 3.5mm耳机接口蓝牙连接 Xbox主机电脑平板通用",
          desc:"万家宝藏好店等你来",
          url:'',
        },
      ]
    },
  },
  {
    type: 'mixModel',
    name: '混合模块',
    icon: 'md-image',
    options: {
      left:{
        model:'goods',
        //数据集合
        data:{
          image:{
            url:"",
            src:'https://lili-system.oss-cn-beijing.aliyuncs.com/mix-bg1.png',
            size:"197 * 344"
          },
          list:[
            {
              img:"https://i.loli.net/2021/05/14/KTLSrOVJmEdX12A.png",
              title:"商品标题",
              price:"120",
              url:"",
            },
            {
              img:"https://i.loli.net/2021/05/14/KTLSrOVJmEdX12A.png",
              title:"商品标题",
              price:"120",
              url:"",
            },
            {
              img:"https://i.loli.net/2021/05/14/KTLSrOVJmEdX12A.png",
              title:"商品标题",
              price:"120",
              url:"",
            },
            {
              img:"https://i.loli.net/2021/05/14/KTLSrOVJmEdX12A.png",
              title:"商品标题",
              price:"120",
              url:"",
            },
          ],
          badge:{
            label:"精选",
            url:""
          }

        }
      },
      right:{
        model:'brand',
        data:{
          image:{
            url:"",
            src:'https://lili-system.oss-cn-beijing.aliyuncs.com/mix-bg2.png',
            size:"254 * 344"
          },
          list:[
            {
              img:"https://i.loli.net/2021/05/14/KTLSrOVJmEdX12A.png",

              url:"",
            },
            {
              img:"https://i.loli.net/2021/05/14/KTLSrOVJmEdX12A.png",

              url:"",
            },
            {
              img:"https://i.loli.net/2021/05/14/KTLSrOVJmEdX12A.png",

              url:"",
            },
            {
              img:"https://i.loli.net/2021/05/14/KTLSrOVJmEdX12A.png",
              url:"",
            },
            {
              img:"https://i.loli.net/2021/05/14/KTLSrOVJmEdX12A.png",
              title:"商品标题",
              price:"120",
              url:"",
            },
            {
              img:"https://i.loli.net/2021/05/14/KTLSrOVJmEdX12A.png",
              title:"商品标题",
              price:"120",
              url:"",
            },
          ],
          badge:"",
        }
      },
    },
  },

  {
    type: 'forYour',
    name: '为你推荐',
    icon: 'md-image',
    options: {
        model:'goods',
        title:"为你推荐",
        //数据集合
        data:{
          image:{
            url:"",
            src:'https://lili-system.oss-cn-beijing.aliyuncs.com/mix-bg3.png',
            size:"197 * 344"
          },
          list:[
            {
              img:"https://lili-system.oss-cn-beijing.aliyuncs.com/example1.png",
              title:"标题",
              desc:"精品好物等你挑",
              url:"",
              size:"346 * 554"
            },
            {
              img:"https://lili-system.oss-cn-beijing.aliyuncs.com/example2.png",
              title:"标题",
              desc:"精品好物等你挑",
              url:"",
              size:"190 * 156"
            },
            {
              img:"https://lili-system.oss-cn-beijing.aliyuncs.com/example3.png",
              title:"标题",
              desc:"精品好物等你挑",
              url:"",
              size:"190 * 156"
            },
            {
              img:"https://lili-system.oss-cn-beijing.aliyuncs.com/example4.png",
              title:"标题",
              desc:"精品好物等你挑",
              url:"",
              size:"190 * 156"
            },
          ],
          hot:{
            title:"最近热卖",
            list:[
              {
                img:"https://i.loli.net/2021/05/14/KTLSrOVJmEdX12A.png",
                title:"商品标题",
                price:"120",
                url:"",
              },{
                img:"https://i.loli.net/2021/05/14/KTLSrOVJmEdX12A.png",
                title:"商品标题",
                price:"120",
                url:"",
              },{
                img:"https://i.loli.net/2021/05/14/KTLSrOVJmEdX12A.png",
                title:"商品标题",
                price:"120",
                url:"",
              },{
                img:"https://i.loli.net/2021/05/14/KTLSrOVJmEdX12A.png",
                title:"商品标题",
                price:"120",
                url:"",
              },
            ]
          }
      },

    },
  },

  {
    type: 'notEnough',
    name: '还没逛够',
    icon: 'md-image',
    options: {
      list: [
        [{
            img: decorate10Img,
            name: 'Apple/苹果 13 英寸：MacBook Pro Multi-Touch Bar 和 Touch ID 2.9GHz 处理器 512GB 存储容量',
            price: 6666,
            url: ''
          },
          {
            img: decorate10Img,
            name: 'Apple/苹果 13 英寸：MacBook Pro Multi-Touch Bar 和 Touch ID 2.9GHz 处理器 512GB 存储容量',
            price: 6666,
            url: ''
          },
          {
            img: decorate10Img,
            name: 'Apple/苹果 13 英寸：MacBook Pro Multi-Touch Bar 和 Touch ID 2.9GHz 处理器 512GB 存储容量',
            price: 6666,
            url: ''
          },
          {
            img: decorate10Img,
            name: 'Apple/苹果 13 英寸：MacBook Pro Multi-Touch Bar 和 Touch ID 2.9GHz 处理器 512GB 存储容量',
            price: 6666,
            url: ''
          },
          {
            img: decorate10Img,
            name: 'Apple/苹果 13 英寸：MacBook Pro Multi-Touch Bar 和 Touch ID 2.9GHz 处理器 512GB 存储容量',
            price: 6666,
            url: ''
          },
          {
            img: decorate10Img,
            name: 'Apple/苹果 13 英寸：MacBook Pro Multi-Touch Bar 和 Touch ID 2.9GHz 处理器 512GB 存储容量',
            price: 6666,
            url: ''
          },
          {
            img: decorate10Img,
            name: 'Apple/苹果 13 英寸：MacBook Pro Multi-Touch Bar 和 Touch ID 2.9GHz 处理器 512GB 存储容量',
            price: 6666,
            url: ''
          },
          {
            img: decorate10Img,
            name: 'Apple/苹果 13 英寸：MacBook Pro Multi-Touch Bar 和 Touch ID 2.9GHz 处理器 512GB 存储容量',
            price: 6666,
            url: ''
          },
          {
            img: decorate10Img,
            name: 'Apple/苹果 13 英寸：MacBook Pro Multi-Touch Bar 和 Touch ID 2.9GHz 处理器 512GB 存储容量',
            price: 6666,
            url: ''
          },
          {
            img: decorate10Img,
            name: 'Apple/苹果 13 英寸：MacBook Pro Multi-Touch Bar 和 Touch ID 2.9GHz 处理器 512GB 存储容量',
            price: 6666,
            url: ''
          },
        ],
        [{
            img: decorate10Img,
            name: 'Apple/苹果 13 英寸：MacBook Pro Multi-Touch Bar 和 Touch ID 2.9GHz 处理器 512GB 存储容量',
            price: 6666,
            url: ''
          },
          {
            img: decorate10Img,
            name: 'Apple/苹果 13 英寸：MacBook Pro Multi-Touch Bar 和 Touch ID 2.9GHz 处理器 512GB 存储容量',
            price: 6666,
            url: ''
          },
          {
            img: decorate10Img,
            name: 'Apple/苹果 13 英寸：MacBook Pro Multi-Touch Bar 和 Touch ID 2.9GHz 处理器 512GB 存储容量',
            price: 6666,
            url: ''
          },
          {
            img: decorate10Img,
            name: 'Apple/苹果 13 英寸：MacBook Pro Multi-Touch Bar 和 Touch ID 2.9GHz 处理器 512GB 存储容量',
            price: 6666,
            url: ''
          },
          {
            img: decorate10Img,
            name: 'Apple/苹果 13 英寸：MacBook Pro Multi-Touch Bar 和 Touch ID 2.9GHz 处理器 512GB 存储容量',
            price: 6666,
            url: ''
          },
          {
            img: decorate10Img,
            name: 'Apple/苹果 13 英寸：MacBook Pro Multi-Touch Bar 和 Touch ID 2.9GHz 处理器 512GB 存储容量',
            price: 6666,
            url: ''
          },
          {
            img: decorate10Img,
            name: 'Apple/苹果 13 英寸：MacBook Pro Multi-Touch Bar 和 Touch ID 2.9GHz 处理器 512GB 存储容量',
            price: 6666,
            url: ''
          },
          {
            img: decorate10Img,
            name: 'Apple/苹果 13 英寸：MacBook Pro Multi-Touch Bar 和 Touch ID 2.9GHz 处理器 512GB 存储容量',
            price: 6666,
            url: ''
          },
          {
            img: decorate10Img,
            name: 'Apple/苹果 13 英寸：MacBook Pro Multi-Touch Bar 和 Touch ID 2.9GHz 处理器 512GB 存储容量',
            price: 6666,
            url: ''
          },
          {
            img: decorate10Img,
            name: 'Apple/苹果 13 英寸：MacBook Pro Multi-Touch Bar 和 Touch ID 2.9GHz 处理器 512GB 存储容量',
            price: 6666,
            url: ''
          },
        ],
        [{
            img: decorate10Img,
            name: 'Apple/苹果 13 英寸：MacBook Pro Multi-Touch Bar 和 Touch ID 2.9GHz 处理器 512GB 存储容量',
            price: 6666,
            url: ''
          },
          {
            img: decorate10Img,
            name: 'Apple/苹果 13 英寸：MacBook Pro Multi-Touch Bar 和 Touch ID 2.9GHz 处理器 512GB 存储容量',
            price: 6666,
            url: ''
          },
          {
            img: decorate10Img,
            name: 'Apple/苹果 13 英寸：MacBook Pro Multi-Touch Bar 和 Touch ID 2.9GHz 处理器 512GB 存储容量',
            price: 6666,
            url: ''
          },
          {
            img: decorate10Img,
            name: 'Apple/苹果 13 英寸：MacBook Pro Multi-Touch Bar 和 Touch ID 2.9GHz 处理器 512GB 存储容量',
            price: 6666,
            url: ''
          },
          {
            img: decorate10Img,
            name: 'Apple/苹果 13 英寸：MacBook Pro Multi-Touch Bar 和 Touch ID 2.9GHz 处理器 512GB 存储容量',
            price: 6666,
            url: ''
          },
          {
            img: decorate10Img,
            name: 'Apple/苹果 13 英寸：MacBook Pro Multi-Touch Bar 和 Touch ID 2.9GHz 处理器 512GB 存储容量',
            price: 6666,
            url: ''
          },
          {
            img: decorate10Img,
            name: 'Apple/苹果 13 英寸：MacBook Pro Multi-Touch Bar 和 Touch ID 2.9GHz 处理器 512GB 存储容量',
            price: 6666,
            url: ''
          },
          {
            img: decorate10Img,
            name: 'Apple/苹果 13 英寸：MacBook Pro Multi-Touch Bar 和 Touch ID 2.9GHz 处理器 512GB 存储容量',
            price: 6666,
            url: ''
          },
          {
            img: decorate10Img,
            name: 'Apple/苹果 13 英寸：MacBook Pro Multi-Touch Bar 和 Touch ID 2.9GHz 处理器 512GB 存储容量',
            price: 6666,
            url: ''
          },
          {
            img: decorate10Img,
            name: 'Apple/苹果 13 英寸：MacBook Pro Multi-Touch Bar 和 Touch ID 2.9GHz 处理器 512GB 存储容量',
            price: 6666,
            url: ''
          },
        ],
        [{
            img: decorate10Img,
            name: 'Apple/苹果 13 英寸：MacBook Pro Multi-Touch Bar 和 Touch ID 2.9GHz 处理器 512GB 存储容量',
            price: 6666,
            url: ''
          },
          {
            img: decorate10Img,
            name: 'Apple/苹果 13 英寸：MacBook Pro Multi-Touch Bar 和 Touch ID 2.9GHz 处理器 512GB 存储容量',
            price: 6666,
            url: ''
          },
          {
            img: decorate10Img,
            name: 'Apple/苹果 13 英寸：MacBook Pro Multi-Touch Bar 和 Touch ID 2.9GHz 处理器 512GB 存储容量',
            price: 6666,
            url: ''
          },
          {
            img: decorate10Img,
            name: 'Apple/苹果 13 英寸：MacBook Pro Multi-Touch Bar 和 Touch ID 2.9GHz 处理器 512GB 存储容量',
            price: 6666,
            url: ''
          },
          {
            img: decorate10Img,
            name: 'Apple/苹果 13 英寸：MacBook Pro Multi-Touch Bar 和 Touch ID 2.9GHz 处理器 512GB 存储容量',
            price: 6666,
            url: ''
          },
          {
            img: decorate10Img,
            name: 'Apple/苹果 13 英寸：MacBook Pro Multi-Touch Bar 和 Touch ID 2.9GHz 处理器 512GB 存储容量',
            price: 6666,
            url: ''
          },
          {
            img: decorate10Img,
            name: 'Apple/苹果 13 英寸：MacBook Pro Multi-Touch Bar 和 Touch ID 2.9GHz 处理器 512GB 存储容量',
            price: 6666,
            url: ''
          },
          {
            img: decorate10Img,
            name: 'Apple/苹果 13 英寸：MacBook Pro Multi-Touch Bar 和 Touch ID 2.9GHz 处理器 512GB 存储容量',
            price: 6666,
            url: ''
          },
          {
            img: decorate10Img,
            name: 'Apple/苹果 13 英寸：MacBook Pro Multi-Touch Bar 和 Touch ID 2.9GHz 处理器 512GB 存储容量',
            price: 6666,
            url: ''
          },
          {
            img: decorate10Img,
            name: 'Apple/苹果 13 英寸：MacBook Pro Multi-Touch Bar 和 Touch ID 2.9GHz 处理器 512GB 存储容量',
            price: 6666,
            url: ''
          },
        ],

      ],
      navList: [{
          title: '精选',
          desc: '猜你喜欢'
        },
        {
          title: '智能先锋',
          desc: '大电器城'
        },
        {
          title: '居家优品',
          desc: '品质生活'
        },
        {
          title: '超市百货',
          desc: '百货生鲜'
        },
      ]
    },
  },
]
