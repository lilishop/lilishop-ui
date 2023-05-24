import {
  otherRouter
} from '@/router/router';
import {
  router
} from '@/router/index';
import Util from '@/libs/util';
import Vue from 'vue';

const app = {
  state: {
    // 银行列表
    bankList:{
      personalBankList:[], // 对私
      companyBankList:[] // 对公
    },

    // 微信进件主体类型
    weChatApplyList:[
      {
        title: "小微商户",
        value: "2401",
        desc: "指无营业执照的个人商家。",
      },
      {
        title: "个体卖家",
        value: "2500",
        desc: "无营业执照，已持续从事电子商务经营活动满6个月，且期间经营收入累计超过20万元的个人商家。",
      },
      {
        title: "个体工商户",
        value: "4",
        desc: "营业执照上的主体类型一般为个体户、个体工商户、个体经营",
      },
      {
        title: "企业",
        value: "2",
        desc: "营业执照上的主体类型一般为有限公司、有限责任公司",
      },
      {
        title: "事业单位",
        value: "3",
        desc: "包括国内各类事业单位，如：医疗、教育、学校等单位",
      },
      {
        title: "社会组织",
        value: "1708",
        desc: "包括社会团体、民办非企业、基金会、基层群众性自治组织、农村集体经济组织等组织",
      },
      {
        title: "政府机关",
        value: "2502",
        desc: "包括国内各级、各类政府机关，如：机关党委、税务、民政、人社、工商、商务、市监等",
      },
    ],
    // 微信进件经营者/法人证件类型
    weChatApplyDocTypeList:[
      {
        title: "中国大陆居民-身份证",
        value: "IDENTIFICATION_TYPE_MAINLAND_IDCARD",
      },
      {
        title: "其他国家或地区居民-护照",
        value: "IDENTIFICATION_TYPE_OVERSEA_PASSPORT",
      },
      {
        title: "中国香港居民--来往内地通行证",
        value: "IDENTIFICATION_TYPE_HONGKONG",
      },
      {
        title: "中国澳门居民--来往内地通行证",
        value: "IDENTIFICATION_TYPE_MACAO",
      },
      {
        title: "中国台湾居民--来往大陆通行证",
        value: "IDENTIFICATION_TYPE_TAIWAN",
      },
      {
        title: "外国人居留证",
        value: "IDENTIFICATION_TYPE_FOREIGN_RESIDENT",
      },
      {
        title: "港澳居民证",
        value: "IDENTIFICATION_TYPE_HONGKONG_MACAO_RESIDENT",
      },
      {
        title: "台湾居民证",
        value: "IDENTIFICATION_TYPE_TAIWAN_RESIDENT",
      },
    ],
    styleStore: "", // 移动端楼层装修中选择风格存储
    added: false, // 加载路由标识
    navList: [], // 顶部菜单
    currNav: "", // 当前顶部菜单name
    currNavTitle: "", // 当前顶部菜单标题
    cachePage: [],
    lang: '',
    pageOpenedList: [{ // 打开过的页面，顶部历史菜单项
      title: '首页',
      path: '',
      name: 'home_index'
    }],
    hotWords:[], //今日热词数据
    // 面包屑数组 左侧菜单
    menuList: [],
    tagsList: [...otherRouter.children], //这块是面包屑的内容不能删除
    routers: [otherRouter],
    messageCount: 0,
    // 在这里定义你不想要缓存的页面的name属性值(参见路由配置router.js)
    dontCache: ['test', 'test']
  },
  mutations: {
    // 设置银行列表
    setBankList(status,res){
      status.bankList[res.label] = res.value
      console.log(status.bankList,res)
    },
    // 动态添加主界面路由，需要缓存
    updateAppRouter(state, routes) {
      state.routers.push(...routes);
      router.addRoutes(routes);
    },
    // 动态添加全局路由404、500等页面，不需要缓存
    updateDefaultRouter(state, routes) {
      router.addRoutes(routes);
    },
    setAdded(state, v) {
      state.added = v;
    },
    setNavList(state, list) {
      state.navList = list;
    },
    setCurrNav(state, v) {
      state.currNav = v;
    },
    setCurrNavTitle(state, v) {
      state.currNavTitle = v;
    },
    setTagsList(state, list) {
      state.tagsList.push(...list);
    },
    updateMenulist(state, routes) {
      state.menuList = routes;
    },
    closePage(state, name) {
      state.cachePage.forEach((item, index) => {
        if (item == name) {
          state.cachePage.splice(index, 1);
        }
      });
    },
    initCachePage(state) {
      if (localStorage.cachePage) {
        state.cachePage = JSON.parse(localStorage.cachePage);
      }
    },
    removeTag(state, name) {
      state.pageOpenedList.map((item, index) => {
        if (item.name == name) {
          state.pageOpenedList.splice(index, 1);
        }
      });
    },
    pageOpenedList(state, get) {
      let openedPage = state.pageOpenedList[get.index];
      if (get.argu) {
        openedPage.argu = get.argu;
      }
      if (get.query) {
        openedPage.query = get.query;
      }
      state.pageOpenedList.splice(get.index, 1, openedPage);
      localStorage.pageOpenedList = JSON.stringify(state.pageOpenedList);
    },
    clearAllTags(state) {
      state.pageOpenedList.splice(1);
      state.cachePage.length = 0;
      localStorage.pageOpenedList = JSON.stringify(state.pageOpenedList);
    },
    clearOtherTags(state, vm) {
      let currentName = vm.$route.name;
      let currentIndex = 0;
      state.pageOpenedList.forEach((item, index) => {
        if (item.name == currentName) {
          currentIndex = index;
        }
      });
      if (currentIndex == 0) {
        state.pageOpenedList.splice(1);
      } else {
        state.pageOpenedList.splice(currentIndex + 1);
        state.pageOpenedList.splice(1, currentIndex - 1);
      }
      let newCachepage = state.cachePage.filter(item => {
        return item == currentName;
      });
      state.cachePage = newCachepage;
      localStorage.pageOpenedList = JSON.stringify(state.pageOpenedList);
    },
    setOpenedList(state) {
      state.pageOpenedList = localStorage.pageOpenedList ? JSON.parse(localStorage.pageOpenedList) : [otherRouter.children[0]];
    },
    setAvatarPath(state, path) {
      localStorage.avatorImgPath = path;
    },
    switchLang(state, lang) {
      state.lang = lang;
      localStorage.lang = lang;
      Vue.config.lang = lang;
    },
    setMessageCount(state, count) {
      state.messageCount = count;
    },
    increateTag(state, tagObj) {
      if (!Util.oneOf(tagObj.name, state.dontCache)) {
        state.cachePage.push(tagObj.name);
        localStorage.cachePage = JSON.stringify(state.cachePage);
      }
      state.pageOpenedList.push(tagObj);
      localStorage.pageOpenedList = JSON.stringify(state.pageOpenedList);
    }
  }
};

export default app;
