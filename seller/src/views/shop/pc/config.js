/**

 * 店铺 PC 楼层装修组件配置清单（与运营后台保持相同布局）

 * 共 4 大分类，19 个组件

 */



const ALL_COMPONENT_GROUPS = [

  {

    key: 'structure',

    title: '结构',

    description: '页头、页脚与基础框架',

    icon: 'House'

  },

  {

    key: 'navigation',

    title: '导航',

    description: '类目、频道和入口',

    icon: 'Compass'

  },

  {

    key: 'media',

    title: '广告',

    description: '轮播、热区与活动图',

    icon: 'Picture'

  },

  {

    key: 'commerce',

    title: '商品',

    description: '商品列表、楼层和推荐',

    icon: 'ShoppingBag'

  },

  {

    key: 'marketing',

    title: '营销',

    description: '用户权益、优惠券等促销能力',

    icon: 'Ticket'

  },

  {

    key: 'content',

    title: '内容',

    description: '标题、文章和公告',

    icon: 'Document'

  }

];



const ALL_COMPONENT_DEFINITIONS = [

  // 1. 结构 (3个)









  // 2. 导航 (3个)

  {

    type: 'categoryNav',
    defaultRowHeight: 48,
    name: '类目导航',
    group: 'navigation',
    icon: 'List',
    description: '横向主导航栏条目、分类图标与高亮角标',
    defaultOptions: {
      showAllCategory: false,
      allCategoryText: '全部分类',
      allCategoryIcon: '',
      textColor: '#334155',
      activeColor: '#e11d48',
      navItems: [
        { title: '应急救援', img: 'https://lilishop-pc.oss-cn-beijing.aliyuncs.com/static/category-nav/cat_1.png', url: '/goodsList?categoryId=1', badge: '' },
        { title: '新鲜蔬菜', img: 'https://lilishop-pc.oss-cn-beijing.aliyuncs.com/static/category-nav/cat_2.png', url: '/goodsList?categoryId=2', badge: '' },
        { title: '乳品烘焙', img: 'https://lilishop-pc.oss-cn-beijing.aliyuncs.com/static/category-nav/cat_3.png', url: '/goodsList?categoryId=3', badge: '' },
        { title: '肉禽蛋品', img: 'https://lilishop-pc.oss-cn-beijing.aliyuncs.com/static/category-nav/cat_4.png', url: '/goodsList?categoryId=4', badge: '' },
        { title: '生鲜门店', img: 'https://lilishop-pc.oss-cn-beijing.aliyuncs.com/static/category-nav/cat_5.png', url: '/goodsList?categoryId=5', badge: '' },
        { title: '母婴育儿', img: 'https://lilishop-pc.oss-cn-beijing.aliyuncs.com/static/category-nav/cat_6.png', url: '/goodsList?categoryId=6', badge: '' },
        { title: '美护百货', img: 'https://lilishop-pc.oss-cn-beijing.aliyuncs.com/static/category-nav/cat_7.png', url: '/goodsList?categoryId=7', badge: '' },
        { title: '粮油调味', img: 'https://lilishop-pc.oss-cn-beijing.aliyuncs.com/static/category-nav/cat_8.png', url: '/goodsList?categoryId=8', badge: '' },
        { title: '酒水饮料', img: 'https://lilishop-pc.oss-cn-beijing.aliyuncs.com/static/category-nav/cat_9.png', url: '/goodsList?categoryId=9', badge: '' },
        { title: '海鲜水产', img: 'https://lilishop-pc.oss-cn-beijing.aliyuncs.com/static/category-nav/cat_10.png', url: '/goodsList?categoryId=10', badge: '' }
      ]
    },
    defaultComponentStyle: {
      widthRatio: '100%',
      backgroundColor: '#ffffff',
      height: 42,
      radius: [0, 0, 0, 0],
      padding: [0, 0, 0, 0]
    }
  },

  {

    type: 'channelGrid',
    defaultRowHeight: '',
    name: '频道宫格',
    group: 'navigation',
    icon: 'Grid',
    description: '4~8 列频道入口与图文卡片',
    defaultOptions: {
      columns: 4,
      imageRadius: 10,
      gap: 12,
      items: [
        { title: '企业采购', subtitle: '批量省心', img: 'https://lilishop-pc.oss-cn-beijing.aliyuncs.com/static/channel-grid/channel_1.png', url: '/goodsList?channel=1' },
        { title: '领券中心', subtitle: '先领再买', img: 'https://lilishop-pc.oss-cn-beijing.aliyuncs.com/static/channel-grid/channel_2.png', url: '/couponCenter' },
        { title: '新品首发', subtitle: '每月上新', img: 'https://lilishop-pc.oss-cn-beijing.aliyuncs.com/static/channel-grid/channel_3.png', url: '/goodsList?channel=3' },
        { title: '品牌馆', subtitle: '精选好店', img: 'https://lilishop-pc.oss-cn-beijing.aliyuncs.com/static/channel-grid/channel_4.png', url: '/brand' }
      ]
    },
    defaultComponentStyle: {
      widthRatio: '100%',
      backgroundColor: 'transparent',
      radius: [0, 0, 0, 0],
      padding: [10, 0, 10, 0]
    }
  },

  {

    type: 'categoryMegaMenu',
    defaultRowHeight: 320,
    name: '商品分类',
    group: 'navigation',
    icon: 'Fold',
    description: '垂直分类菜单与多级展开弹层',
    defaultOptions: {
      title: '商品分类',
      source: 'system',
      textColor: '#111927',
      fontSize: 14,
      activeColor: '#409EFF',
      categories: [
        {
          name: '精选频道',
          subCategories: [
            { name: '每日精选', items: ['新品尝鲜', '大牌特惠', '超级秒杀', '今日热卖'] },
            { name: '特色专区', items: ['企业团购', '会员专享', '积分兑换', '清仓特卖'] }
          ]
        },
        {
          name: '新品上架',
          subCategories: [
            { name: '本周新发', items: ['数码新品', '秋季服饰', '美妆尝新', '家居收纳'] },
            { name: '潮流榜单', items: ['人气推荐', '编辑精选', '预售抢先'] }
          ]
        },
        {
          name: '企业采购',
          subCategories: [
            { name: '办公采购', items: ['办公用纸', '文具收纳', '商用打印', '会议茶水'] },
            { name: '员工福利', items: ['节日礼盒', '数码卡券', '健康体检', '员工关怀'] }
          ]
        },
        {
          name: '领券中心',
          subCategories: [
            { name: '平台券', items: ['全场满减', '品类专享', '运费券', '会员特权'] },
            { name: '大牌券', items: ['数码大额券', '生鲜补贴', '美妆立减', '母婴满减'] }
          ]
        }
      ]
    },
    defaultComponentStyle: {
      widthRatio: '16.67%',
      backgroundColor: '#ffffff',
      radius: [8, 8, 8, 8],
      padding: [0, 0, 0, 0]
    }
  },



  // 3. 广告 (6个)

  {

    type: 'carousel',
    defaultRowHeight: 320,
    name: '轮播图',
    group: 'media',
    icon: 'PictureRounded',
    description: '首页大图焦点轮播',
    defaultOptions: {
      autoPlay: true,
      interval: 4000,
      showArrow: true,
      effect: 'fade',
      showIndicator: true,
      fitMode: 'contain',
      aspectRatio: '2.5:1',
      height:  420,
      list: [
        {
          img: 'https://lilishop-pc.oss-cn-beijing.aliyuncs.com/static/carousel/banner_1.png',
          title: '出游囤好货 · 迎接小长假',
          url: '/goodsList?seckill=1'
        },
        {
          img: 'https://lilishop-pc.oss-cn-beijing.aliyuncs.com/static/carousel/banner_2.png',
          title: '爆款潮电 · 科技新品首发',
          url: '/goodsList?category=1'
        },
        {
          img: 'https://lilishop-pc.oss-cn-beijing.aliyuncs.com/static/carousel/banner_3.png',
          title: '原产地直采 · 绿色鲜果集市',
          url: '/goodsList?category=2'
        },
        {
          img: 'https://lilishop-pc.oss-cn-beijing.aliyuncs.com/static/carousel/banner_4.png',
          title: '甄选大牌美妆 · 唤醒肌肤活力',
          url: '/goodsList?category=3'
        }
      ]
    },
    defaultComponentStyle: {
      widthRatio: '66.67%',
      backgroundColor: '#ffffff',
      radius: [8, 8, 8, 8],
      padding: [0, 0, 0, 0]
    }
  },

  {

    type: 'brandWall',
    defaultRowHeight: '',
    name: '品牌图',
    group: 'media',
    icon: 'Medal',
    description: '精选品牌与活动推广图片列表',
    defaultOptions: {
      columns: 4,
      gap: 12,
      items: [
        { title: '数码潮玩 · 爆款立减500', img: 'https://lilishop-pc.oss-cn-beijing.aliyuncs.com/static/brand-wall/brand_1.png', url: '/goodsList?category=1' },
        { title: '美妆奢宠 · 每满300减50', img: 'https://lilishop-pc.oss-cn-beijing.aliyuncs.com/static/brand-wall/brand_2.png', url: '/goodsList?category=2' },
        { title: '运动潮品 · 爆款低至5折', img: 'https://lilishop-pc.oss-cn-beijing.aliyuncs.com/static/brand-wall/brand_3.png', url: '/goodsList?category=3' },
        { title: '品质生活 · 限时第2件半价', img: 'https://lilishop-pc.oss-cn-beijing.aliyuncs.com/static/brand-wall/brand_4.png', url: '/goodsList?category=4' }
      ]
    },
    defaultComponentStyle: {
      widthRatio: '100%',
      backgroundColor: 'transparent',
      radius: [0, 0, 0, 0],
      padding: [10, 0, 10, 0]
    }
  },

  {
    type: 'hotZone',
    defaultRowHeight: 750,
    name: '热区图',
    group: 'media',
    icon: 'Aim',
    description: '一张大图框选多个跳转热区',
    defaultOptions: {
      imageUrl: 'https://lilishop-pc.oss-cn-beijing.aliyuncs.com/static/hot-zone/hotzone_default.png',
      zones: [
        {
          title: '大促主会场 · 领券中心',
          url: '/couponCenter',
          left: 3.5,
          top: 12,
          width: 28.5,
          height: 76
        },
        {
          title: '数码潮电馆 · 爆款直降',
          url: '/goodsList?category=1',
          left: 35.5,
          top: 12,
          width: 28.5,
          height: 76
        },
        {
          title: '美妆奢品馆 · 5折特惠',
          url: '/goodsList?category=2',
          left: 67.5,
          top: 12,
          width: 29,
          height: 76
        }
      ]
    },
    defaultComponentStyle: {
      widthRatio: '100%',
      backgroundColor: 'transparent',
      radius: [8, 8, 8, 8],
      padding: [10, 0, 10, 0]
    }
  },

  {

    type: 'freeLayout',
    defaultRowHeight: 450,

    name: '自由布局',

    group: 'media',

    icon: 'FullScreen',

    description: '在固定高度容器内绝对定位自由拖放组件',

    defaultOptions: {

      height: 450,

      elements: []

    },

    defaultComponentStyle: {

      backgroundColor: '#ffffff',

      radius: [12, 12, 12, 12]

    }

  },

  {

    type: 'promoGroup',
    defaultRowHeight: 220,

    name: '活动卡组',

    group: 'media',

    icon: 'Files',

    description: '2~4 列自适应大促卡片矩阵',

    defaultOptions: {

      columns: 3,

      cards: [
        { title: '限时秒杀', subtitle: '抢券立减50元 · 爆款直降', bgImg: 'https://lilishop-pc.oss-cn-beijing.aliyuncs.com/static/promo-group/promo_1.png', url: '/goodsList?seckill=1' },
        { title: '品牌特惠', subtitle: '大牌买一送一 · 领百元神券', bgImg: 'https://lilishop-pc.oss-cn-beijing.aliyuncs.com/static/promo-group/promo_2.png', url: '/goodsList?brand=1' },
        { title: '新品首发', subtitle: '首单专享特惠 · 1元起尝鲜', bgImg: 'https://lilishop-pc.oss-cn-beijing.aliyuncs.com/static/promo-group/promo_3.png', url: '/goodsList?new=1' }
      ]

    },

    defaultComponentStyle: {

      backgroundColor: 'transparent',

      radius: [12, 12, 12, 12]

    }

  },

  {

    type: 'video',
    defaultRowHeight: 450,
    name: '视频',
    group: 'media',
    icon: 'VideoCamera',
    description: '品牌宣传与商品视频播放',
    defaultOptions: {
      videoUrl: '',
      height: 450,
      coverUrl: 'https://lilishop-pc.oss-cn-beijing.aliyuncs.com/static/video/video_cover.png',
      url: '',
      autoPlay: false,
      loop: false,
      controls: true,
      height: 450
    },

    defaultComponentStyle: {

      radius: [12, 12, 12, 12]

    }

  },



  // 4. 商品 (8个)

  {

    type: 'goodsList',
    defaultRowHeight: '',

    name: '商品列表',

    group: 'commerce',

    icon: 'Goods',

    description: '基础网格商品流，支持手动选品与分类加载',

    defaultOptions: {

      dataSource: 'manual', // 'manual' | 'category'

      categoryIds: [],

      goodsCount: 12,

      goods: [
        {
          id: '1',
          goodsName: '旗舰 5G 智能手机 12GB+256GB 超光影影像系统',
          price: '3999.00',
          originalPrice: '4599.00',
          thumbnail: 'https://lilishop-pc.oss-cn-beijing.aliyuncs.com/static/goods/goods_1.png'
        },
        {
          id: '2',
          goodsName: '无线头戴式深度主动降噪蓝牙耳机 空间音频Hi-Res',
          price: '1099.00',
          originalPrice: '1499.00',
          thumbnail: 'https://lilishop-pc.oss-cn-beijing.aliyuncs.com/static/goods/goods_2.png'
        },
        {
          id: '3',
          goodsName: '14英寸 全面屏轻薄商务笔记本电脑 酷睿i7 高刷防眩光',
          price: '5699.00',
          originalPrice: '6299.00',
          thumbnail: 'https://lilishop-pc.oss-cn-beijing.aliyuncs.com/static/goods/goods_3.png'
        },
        {
          id: '4',
          goodsName: '运动健康专业监测智能手表 心率血氧长续航50米防水',
          price: '899.00',
          originalPrice: '1199.00',
          thumbnail: 'https://lilishop-pc.oss-cn-beijing.aliyuncs.com/static/goods/goods_4.png'
        },
        {
          id: '5',
          goodsName: '奢宠酵母焕活修护精华露 50ml 紧致淡纹抗皱滋养',
          price: '680.00',
          originalPrice: '890.00',
          thumbnail: 'https://lilishop-pc.oss-cn-beijing.aliyuncs.com/static/goods/goods_5.png'
        },
        {
          id: '6',
          goodsName: '意式半自动家用复古咖啡机 20Bar高压恒温萃取蒸汽奶泡',
          price: '899.00',
          originalPrice: '1280.00',
          thumbnail: 'https://lilishop-pc.oss-cn-beijing.aliyuncs.com/static/goods/goods_6.png'
        },
        {
          id: '7',
          goodsName: '碳板专业竞速轻量缓震跑步鞋 透气防滑男女同款潮鞋',
          price: '459.00',
          originalPrice: '699.00',
          thumbnail: 'https://lilishop-pc.oss-cn-beijing.aliyuncs.com/static/goods/goods_7.png'
        },
        {
          id: '8',
          goodsName: '极简静音无雾负离子香薰加湿器 大容量客厅卧室通用',
          price: '299.00',
          originalPrice: '399.00',
          thumbnail: 'https://lilishop-pc.oss-cn-beijing.aliyuncs.com/static/goods/goods_8.png'
        },
        {
          id: '9',
          goodsName: '智能降噪AI翻译蓝牙墨镜 超轻防紫外线偏光太阳镜',
          price: '599.00',
          originalPrice: '799.00',
          thumbnail: 'https://lilishop-pc.oss-cn-beijing.aliyuncs.com/static/goods/goods_1.png'
        },
        {
          id: '10',
          goodsName: '15.6英寸 4K超高清便携式显示器 Type-C一线直连高色域',
          price: '1299.00',
          originalPrice: '1699.00',
          thumbnail: 'https://lilishop-pc.oss-cn-beijing.aliyuncs.com/static/goods/goods_3.png'
        },
        {
          id: '11',
          goodsName: '国AA级减蓝光润眼长臂台灯 智能感光多档色温无极调光',
          price: '249.00',
          originalPrice: '359.00',
          thumbnail: 'https://lilishop-pc.oss-cn-beijing.aliyuncs.com/static/goods/goods_4.png'
        },
        {
          id: '12',
          goodsName: '航空级铝镁合金静音万向轮拉杆登机箱 20英寸防刮耐磨',
          price: '499.00',
          originalPrice: '699.00',
          thumbnail: 'https://lilishop-pc.oss-cn-beijing.aliyuncs.com/static/goods/goods_7.png'
        }
      ],

      columns: 6,

      showTitle: true,

      showPrice: true,

      showOriginalPrice: true,

      showCartBtn: true,

      showTags: true

    },

    defaultComponentStyle: {

      backgroundColor: 'transparent'

    }

  },

  {

    type: 'gridFloor',
    defaultRowHeight: '',

    name: '宫格楼层',

    group: 'commerce',

    icon: 'Grid',

    description: '百货大楼层：1F标题 + 左侧立体海报 + 右侧商品网格',

    defaultOptions: {

      showFloorTitle: true,

      floorNum: '1F',

      title: '潮流数码',

      subtitle: 'DIGITAL & TECH',

      subCategories: ['旗舰手机', '轻薄笔电', '降噪耳机', '智能穿戴', '数码配件'],

      moreUrl: '/goods',

      showPoster: true,

      posterImg: 'https://lilishop-pc.oss-cn-beijing.aliyuncs.com/static/banner-floor/floor_banner_1.png',

      posterTitle: '数码潮电 酷玩季',

      posterSub: '领券最高立减 600 元',

      posterUrl: '/goods',

      posterTags: ['爆款低至5折', '新品首发', '分期免息'],

      columns: 4,

      goodsCount: 8,

      goods: [
        {
          id: '101',
          goodsName: '旗舰 5G 智能手机 12GB+256GB 超光影影像系统',
          price: '3999.00',
          originalPrice: '4599.00',
          thumbnail: 'https://lilishop-pc.oss-cn-beijing.aliyuncs.com/static/goods/goods_1.png'
        },
        {
          id: '102',
          goodsName: '无线头戴式深度主动降噪蓝牙耳机 空间音频Hi-Res',
          price: '1099.00',
          originalPrice: '1499.00',
          thumbnail: 'https://lilishop-pc.oss-cn-beijing.aliyuncs.com/static/goods/goods_2.png'
        },
        {
          id: '103',
          goodsName: '14英寸 全面屏轻薄商务笔记本电脑 酷睿i7 高刷防眩光',
          price: '5699.00',
          originalPrice: '6299.00',
          thumbnail: 'https://lilishop-pc.oss-cn-beijing.aliyuncs.com/static/goods/goods_3.png'
        },
        {
          id: '104',
          goodsName: '运动健康专业监测智能手表 心率血氧长续航50米防水',
          price: '899.00',
          originalPrice: '1199.00',
          thumbnail: 'https://lilishop-pc.oss-cn-beijing.aliyuncs.com/static/goods/goods_4.png'
        },
        {
          id: '105',
          goodsName: '奢宠酵母焕活修护精华露 50ml 紧致淡纹抗皱滋养',
          price: '680.00',
          originalPrice: '890.00',
          thumbnail: 'https://lilishop-pc.oss-cn-beijing.aliyuncs.com/static/goods/goods_5.png'
        },
        {
          id: '106',
          goodsName: '意式半自动家用复古咖啡机 20Bar高压恒温萃取蒸汽奶泡',
          price: '899.00',
          originalPrice: '1280.00',
          thumbnail: 'https://lilishop-pc.oss-cn-beijing.aliyuncs.com/static/goods/goods_6.png'
        },
        {
          id: '107',
          goodsName: '碳板专业竞速轻量缓震跑步鞋 透气防滑男女同款潮鞋',
          price: '459.00',
          originalPrice: '699.00',
          thumbnail: 'https://lilishop-pc.oss-cn-beijing.aliyuncs.com/static/goods/goods_7.png'
        },
        {
          id: '108',
          goodsName: '极简静音无雾负离子香薰加湿器 大容量客厅卧室通用',
          price: '299.00',
          originalPrice: '399.00',
          thumbnail: 'https://lilishop-pc.oss-cn-beijing.aliyuncs.com/static/goods/goods_8.png'
        }
      ]

    },

    defaultComponentStyle: {

      backgroundColor: '#ffffff',

      radius: [12, 12, 12, 12],

      padding: [20, 20, 20, 20]

    }

  },

  {

    type: 'goodsGrid',
    defaultRowHeight: '',
    name: '商品宫格',
    group: 'commerce',
    icon: 'Menu',
    description: '严谨商品矩阵：带网格分割线商品单元格',
    defaultOptions: {
      title: '爆款热卖榜',
      subtitle: '近30天爆卖好物精选',
      showBorder: true,
      showMoreLink: true,
      moreText: '查看全部',
      columns: 5,
      goods: [
        { id: '1', goodsName: '旗舰 5G 智能手机 12GB+256GB 超光影影像系统', price: '3999.00', originalPrice: '4599.00', thumbnail: 'https://lilishop-pc.oss-cn-beijing.aliyuncs.com/static/goods/goods_1.png' },
        { id: '2', goodsName: '无线头戴式深度主动降噪蓝牙耳机 空间音频Hi-Res', price: '1099.00', originalPrice: '1499.00', thumbnail: 'https://lilishop-pc.oss-cn-beijing.aliyuncs.com/static/goods/goods_2.png' },
        { id: '3', goodsName: '14英寸 全面屏轻薄商务笔记本电脑 酷睿i7 高刷防眩光', price: '5699.00', originalPrice: '6299.00', thumbnail: 'https://lilishop-pc.oss-cn-beijing.aliyuncs.com/static/goods/goods_3.png' },
        { id: '4', goodsName: '运动健康专业监测智能手表 心率血氧长续航50米防水', price: '899.00', originalPrice: '1199.00', thumbnail: 'https://lilishop-pc.oss-cn-beijing.aliyuncs.com/static/goods/goods_4.png' },
        { id: '5', goodsName: '奢宠酵母焕活修护精华露 50ml 紧致淡纹抗皱滋养', price: '680.00', originalPrice: '890.00', thumbnail: 'https://lilishop-pc.oss-cn-beijing.aliyuncs.com/static/goods/goods_5.png' },
        { id: '6', goodsName: '意式半自动家用复古咖啡机 20Bar高压恒温萃取蒸汽奶泡', price: '899.00', originalPrice: '1280.00', thumbnail: 'https://lilishop-pc.oss-cn-beijing.aliyuncs.com/static/goods/goods_6.png' },
        { id: '7', goodsName: '碳板专业竞速轻量缓震跑步鞋 透气防滑男女同款潮鞋', price: '459.00', originalPrice: '699.00', thumbnail: 'https://lilishop-pc.oss-cn-beijing.aliyuncs.com/static/goods/goods_7.png' },
        { id: '8', goodsName: '极简静音无雾负离子香薰加湿器 大容量客厅卧室通用', price: '299.00', originalPrice: '399.00', thumbnail: 'https://lilishop-pc.oss-cn-beijing.aliyuncs.com/static/goods/goods_8.png' },
        { id: '9', goodsName: '折叠屏旗舰手机 典藏陶瓷白 悬停双旋水滴铰链', price: '6999.00', originalPrice: '7999.00', thumbnail: 'https://lilishop-pc.oss-cn-beijing.aliyuncs.com/static/goods/goods_1.png' },
        { id: '10', goodsName: '真无线触控降噪蓝牙耳机 超低延迟游戏降噪', price: '599.00', originalPrice: '799.00', thumbnail: 'https://lilishop-pc.oss-cn-beijing.aliyuncs.com/static/goods/goods_2.png' }
      ]
    },

    defaultComponentStyle: {

      backgroundColor: '#ffffff',

      radius: [12, 12, 12, 12],

      padding: [16, 16, 16, 16]

    }

  },

  {

    type: 'goodsCard',
    defaultRowHeight: 360,

    name: '商品卡片',

    group: 'commerce',

    icon: 'Postcard',

    description: '精选单品爆款特写大卡片',

    defaultOptions: {
      type: 'goodsCard',
      showSales: false,
      goodsId: '1',
      goodsInfo: { id: '1', goodsName: '旗舰 5G 智能手机 12GB+256GB 超光影影像系统', price: '3999.00', originalPrice: '4599.00', thumbnail: 'https://lilishop-pc.oss-cn-beijing.aliyuncs.com/static/goods/goods_1.png' },
      customTitle: '年度年度旗舰 · 科技美学',
      customDesc: '搭载新一代旗舰处理器，超光影三主摄影像，120Hz高刷原色护眼屏，重磅直降立减600元。',
      badge: '重磅首发',
      goods: [
        { id: '1', goodsName: '旗舰 5G 智能手机 12GB+256GB 超光影影像系统', price: '3999.00', originalPrice: '4599.00', thumbnail: 'https://lilishop-pc.oss-cn-beijing.aliyuncs.com/static/goods/goods_1.png' }
      ]
    },

    defaultComponentStyle: {

      backgroundColor: '#ffffff',

      radius: [12, 12, 12, 12],

      padding: [24, 24, 24, 24]

    }

  },

  {

    type: 'bannerFloor',
    defaultRowHeight: '',

    name: '横幅楼层',

    group: 'commerce',

    icon: 'Reading',

    description: '左侧海报横幅 + 右侧商品网格',

    defaultOptions: {
      title: '大牌热销榜',
      subtitle: '经典楼层 · 专享特惠',
      bannerImg: 'https://lilishop-pc.oss-cn-beijing.aliyuncs.com/static/banner-floor/floor_banner_1.png',
      bannerUrl: '/goodsList?category=1',
      goodsCount: 6,
      columns: 3,
      goods: [
        { id: '1', goodsName: '旗舰 5G 智能手机 12GB+256GB 超光影影像系统', price: '3999.00', originalPrice: '4599.00', thumbnail: 'https://lilishop-pc.oss-cn-beijing.aliyuncs.com/static/goods/goods_1.png' },
        { id: '2', goodsName: '无线头戴式深度主动降噪蓝牙耳机 空间音频Hi-Res', price: '1099.00', originalPrice: '1499.00', thumbnail: 'https://lilishop-pc.oss-cn-beijing.aliyuncs.com/static/goods/goods_2.png' },
        { id: '3', goodsName: '14英寸 全面屏轻薄商务笔记本电脑 酷睿i7 高刷防眩光', price: '5699.00', originalPrice: '6299.00', thumbnail: 'https://lilishop-pc.oss-cn-beijing.aliyuncs.com/static/goods/goods_3.png' },
        { id: '4', goodsName: '运动健康专业监测智能手表 心率血氧长续航50米防水', price: '899.00', originalPrice: '1199.00', thumbnail: 'https://lilishop-pc.oss-cn-beijing.aliyuncs.com/static/goods/goods_4.png' },
        { id: '5', goodsName: '奢宠酵母焕活修护精华露 50ml 紧致淡纹抗皱滋养', price: '680.00', originalPrice: '890.00', thumbnail: 'https://lilishop-pc.oss-cn-beijing.aliyuncs.com/static/goods/goods_5.png' },
        { id: '6', goodsName: '意式半自动家用复古咖啡机 20Bar高压恒温萃取蒸汽奶泡', price: '899.00', originalPrice: '1280.00', thumbnail: 'https://lilishop-pc.oss-cn-beijing.aliyuncs.com/static/goods/goods_6.png' }
      ]
    },

    defaultComponentStyle: {

      backgroundColor: '#ffffff',

      radius: [12, 12, 12, 12],

      padding: [16, 16, 16, 16]

    }

  },

  {

    type: 'goodsBar',
    defaultRowHeight: '',

    name: '商品条',

    group: 'commerce',

    icon: 'DArrowRight',

    description: '单行横向横滑商品条',

    defaultOptions: {
      title: '限时好物推荐',
      subtitle: '每日人气尖货爆款直降',
      columns: 6,
      goods: [
        { id: '1', goodsName: '旗舰 5G 智能手机 12GB+256GB 超光影影像系统', price: '3999.00', originalPrice: '4599.00', thumbnail: 'https://lilishop-pc.oss-cn-beijing.aliyuncs.com/static/goods/goods_1.png' },
        { id: '2', goodsName: '无线头戴式深度主动降噪蓝牙耳机 空间音频Hi-Res', price: '1099.00', originalPrice: '1499.00', thumbnail: 'https://lilishop-pc.oss-cn-beijing.aliyuncs.com/static/goods/goods_2.png' },
        { id: '3', goodsName: '14英寸 全面屏轻薄商务笔记本电脑 酷睿i7 高刷防眩光', price: '5699.00', originalPrice: '6299.00', thumbnail: 'https://lilishop-pc.oss-cn-beijing.aliyuncs.com/static/goods/goods_3.png' },
        { id: '4', goodsName: '运动健康专业监测智能手表 心率血氧长续航50米防水', price: '899.00', originalPrice: '1199.00', thumbnail: 'https://lilishop-pc.oss-cn-beijing.aliyuncs.com/static/goods/goods_4.png' },
        { id: '5', goodsName: '奢宠酵母焕活修护精华露 50ml 紧致淡纹抗皱滋养', price: '680.00', originalPrice: '890.00', thumbnail: 'https://lilishop-pc.oss-cn-beijing.aliyuncs.com/static/goods/goods_5.png' },
        { id: '6', goodsName: '意式半自动家用复古咖啡机 20Bar高压恒温萃取蒸汽奶泡', price: '899.00', originalPrice: '1280.00', thumbnail: 'https://lilishop-pc.oss-cn-beijing.aliyuncs.com/static/goods/goods_6.png' }
      ]
    },

    defaultComponentStyle: {

      backgroundColor: '#ffffff',

      radius: [12, 12, 12, 12],

      padding: [16, 16, 16, 16]

    }

  },

  {type: 'channelFloor',
    defaultRowHeight: '',

    name: '频道楼层',

    group: 'commerce',

    icon: 'CollectionTag',

    description: '场景频道：主视觉 + 活动入口 + 精选商品组合',

    defaultOptions: {
      showTitle: true,
      title: '场景频道',
      subtitle: '主视觉 + 商品组合楼层',
      heroImage: 'https://lilishop-pc.oss-cn-beijing.aliyuncs.com/static/banner-floor/floor_banner_1.png',
      heroTitle: '品质生活馆',
      heroSubtitle: '精选场景好物，一站购齐',
      heroButtonText: '进入频道',
      heroHref: '/goods',
      heroStyle: 'gradient',
      promos: [
        { title: '大牌补贴', desc: '领券最高减100', tag: '限时', url: '/goods' },
        { title: '新品驾到', desc: '官方正品首发', tag: '新品', url: '/goods' }
      ],
      goodsCount: 6,
      goods: [
        { id: '1', goodsName: '旗舰 5G 智能手机 12GB+256GB 超光影影像系统', price: '3999.00', originalPrice: '4599.00', thumbnail: 'https://lilishop-pc.oss-cn-beijing.aliyuncs.com/static/goods/goods_1.png' },
        { id: '2', goodsName: '无线头戴式深度主动降噪蓝牙耳机 空间音频Hi-Res', price: '1099.00', originalPrice: '1499.00', thumbnail: 'https://lilishop-pc.oss-cn-beijing.aliyuncs.com/static/goods/goods_2.png' },
        { id: '3', goodsName: '14英寸 全面屏轻薄商务笔记本电脑 酷睿i7 高刷防眩光', price: '5699.00', originalPrice: '6299.00', thumbnail: 'https://lilishop-pc.oss-cn-beijing.aliyuncs.com/static/goods/goods_3.png' },
        { id: '4', goodsName: '运动健康专业监测智能手表 心率血氧长续航50米防水', price: '899.00', originalPrice: '1199.00', thumbnail: 'https://lilishop-pc.oss-cn-beijing.aliyuncs.com/static/goods/goods_4.png' },
        { id: '5', goodsName: '意式半自动家用复古咖啡机 20Bar高压恒温萃取蒸汽奶泡', price: '899.00', originalPrice: '1280.00', thumbnail: 'https://lilishop-pc.oss-cn-beijing.aliyuncs.com/static/goods/goods_6.png' },
        { id: '6', goodsName: '奢宠酵母焕活修护精华露 50ml 紧致淡纹抗皱滋养', price: '680.00', originalPrice: '890.00', thumbnail: 'https://lilishop-pc.oss-cn-beijing.aliyuncs.com/static/goods/goods_5.png' }
      ]
    },

    defaultComponentStyle: {
      backgroundColor: '#ffffff',
      radius: [12, 12, 12, 12],
      padding: [20, 20, 20, 20]
    }
  },

  {
    type: 'recommendFeed',
    defaultRowHeight: '',

    name: '推荐商品',

    group: 'commerce',

    icon: 'Star',

    description: '猜你喜欢：精选大卡+瀑布网格推荐流',

    defaultOptions: {
      title: '猜你喜欢',
      subtitle: '真实推荐商品流',
      layoutStyle: 'featured',
      pageSize: 8,
      maxPages: 3,
      backgroundColor: '#f8fafc',
      imageRadius: 10,
      gap: 12,
      goods: [
        { id: '1', goodsName: '旗舰 5G 智能手机 12GB+256GB 超光影影像系统', price: '3999.00', originalPrice: '4599.00', thumbnail: 'https://lilishop-pc.oss-cn-beijing.aliyuncs.com/static/goods/goods_1.png' },
        { id: '2', goodsName: '无线头戴式深度主动降噪蓝牙耳机 空间音频Hi-Res', price: '1099.00', originalPrice: '1499.00', thumbnail: 'https://lilishop-pc.oss-cn-beijing.aliyuncs.com/static/goods/goods_2.png' },
        { id: '3', goodsName: '14英寸 全面屏轻薄商务笔记本电脑 酷睿i7 高刷防眩光', price: '5699.00', originalPrice: '6299.00', thumbnail: 'https://lilishop-pc.oss-cn-beijing.aliyuncs.com/static/goods/goods_3.png' },
        { id: '4', goodsName: '运动健康专业监测智能手表 心率血氧长续航50米防水', price: '899.00', originalPrice: '1199.00', thumbnail: 'https://lilishop-pc.oss-cn-beijing.aliyuncs.com/static/goods/goods_4.png' },
        { id: '5', goodsName: '奢宠酵母焕活修护精华露 50ml 紧致淡纹抗皱滋养', price: '680.00', originalPrice: '890.00', thumbnail: 'https://lilishop-pc.oss-cn-beijing.aliyuncs.com/static/goods/goods_5.png' },
        { id: '6', goodsName: '意式半自动家用复古咖啡机 20Bar高压恒温萃取蒸汽奶泡', price: '899.00', originalPrice: '1280.00', thumbnail: 'https://lilishop-pc.oss-cn-beijing.aliyuncs.com/static/goods/goods_6.png' },
        { id: '7', goodsName: '碳板专业竞速轻量缓震跑步鞋 透气防滑男女同款潮鞋', price: '459.00', originalPrice: '699.00', thumbnail: 'https://lilishop-pc.oss-cn-beijing.aliyuncs.com/static/goods/goods_7.png' },
        { id: '8', goodsName: '极简静音无雾负离子香薰加湿器 大容量客厅卧室通用', price: '299.00', originalPrice: '399.00', thumbnail: 'https://lilishop-pc.oss-cn-beijing.aliyuncs.com/static/goods/goods_8.png' }
      ]
    },

    defaultComponentStyle: {
      backgroundColor: '#f8fafc',
      radius: [12, 12, 12, 12],
      padding: [24, 20, 24, 20]
    }
  },

  // 5. 营销 (2个)





  // 6. 内容 (3个)

  {

    type: 'titleBar',
    defaultRowHeight: 48,

    name: '标题栏',

    group: 'content',

    icon: 'Edit',

    description: '楼层独立大标题与查看更多入口',

    defaultOptions: {

      mainTitle: '楼层标题',

      subtitle: '副标题说明文字',

      align: 'left', // 'left' | 'center'

      showMore: true,

      moreText: '查看更多 >',

      moreUrl: '/'

    },

    defaultComponentStyle: {
      widthRatio: '100%',
      backgroundColor: 'transparent',
      padding: [16, 8, 12, 8]
    }

  },



  {
    type: 'noticeBar',
    defaultRowHeight: 40,

    name: '公告快讯',

    group: 'content',

    icon: 'Bell',

    description: '跑马灯/垂直翻滚公告快讯条',

    defaultOptions: {
      title: '公告快讯',
      showMore: true,
      moreText: '更多',
      moreUrl: '/article',
      items: [
        { tag: '最新', title: '商城秋季大促重磅开启，全场满300立减50元！', time: '10-28', url: '/article' },
        { tag: '活动', title: '会员专享积分商城全新上线，精选好礼0元兑换', time: '10-27', url: '/article' },
        { tag: '通知', title: '关于商城系统例行优化维护及物流发货保障通知', time: '10-26', url: '/article' },
        { tag: '热议', title: '品质生活馆场景专区火热来袭，领券最高减100', time: '10-25', url: '/article' }
      ]
    },

    defaultComponentStyle: {
      widthRatio: '100%',
      backgroundColor: '#ffffff',
      radius: [8, 8, 8, 8],
      padding: [0, 16, 0, 16]
    }
  }
];

export const COMPONENT_DEFINITIONS = ALL_COMPONENT_DEFINITIONS.filter(def => !["topBar","searchHeader","footerNav","userBenefits","couponList","articleContent"].includes(def.type));
export const COMPONENT_GROUPS = ALL_COMPONENT_GROUPS.filter(group => COMPONENT_DEFINITIONS.some(def => def.group === group.key));

export const DEFAULT_ROW_STYLE = {
  width: 1920,
  height: '',
  gap: 0,
  margin: [0, 0, 0, 0],
  padding: [0, 0, 0, 0],
  radius: [0, 0, 0, 0]
};



/**

 * 生成新行

 */

export function createRow(component = null) {
  const rowId = `row_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const components = [];
  let rowHeight = '';

  if (component) {
    if (component.type && !component.componentStyle) {
      // 传入的是组件定义 def
      components.push(createComponent(component));
      if (component.defaultRowHeight !== undefined && component.defaultRowHeight !== null) {
        rowHeight = component.defaultRowHeight;
      }
    } else {
      // 传入的是已有组件实例
      components.push(component);
      const def = COMPONENT_DEFINITIONS.find(d => d.type === component.type);
      if (def?.defaultRowHeight !== undefined && def?.defaultRowHeight !== null) {
        rowHeight = def.defaultRowHeight;
      }
    }
  }

  return {
    id: rowId,
    rowStyle: { ...DEFAULT_ROW_STYLE, height: rowHeight },
    components
  };
}



/**

 * 生成新组件实例

 */

export function createComponent(def) {

  const cmpId = `cmp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  const style = JSON.parse(JSON.stringify(def.defaultComponentStyle || {}));

  if (!style.margin) style.margin = [0, 0, 0, 0];

  if (!style.padding) style.padding = [0, 0, 0, 0];

  if (!style.radius) style.radius = [0, 0, 0, 0];

  if (!style.widthRatio) style.widthRatio = '100%';

  if (!style.backgroundColor && style.backgroundColor !== 'transparent') style.backgroundColor = '#ffffff';

  if (!style.backgroundImage) style.backgroundImage = '';

  return {

    id: cmpId,

    type: def.type,

    name: def.name,

    icon: def.icon,

    componentStyle: style,

    options: JSON.parse(JSON.stringify(def.defaultOptions || {}))

  };

}
