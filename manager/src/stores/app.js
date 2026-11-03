import { defineStore } from "pinia";
import { otherRouter } from "@/router/router";
import i18n from "@/locale";

const removedPageNames = new Set(["memberRecycle", "fictitiousOrderList"]);

// 原 vuex app 模块 + 根 state（openStyleStore/openStoreId/notices）合并
// mutation 全部转为同名 action；两个例外：
// - pageOpenedList mutation 与 state 同名，改名 updateOpenedList
// - clearOtherTags 原接收组件实例 vm，改为直接接收当前路由名 currentName
export const useAppStore = defineStore("app", {
  state: () => ({
    // 原根 state
    openStyleStore: "",
    openStoreId: "",
    notices: "",
    // 原 app 模块
    styleStore: "", // 移动端楼层装修中选择风格存储
    added: false, // 加载路由标识
    navList: [], // 顶部菜单
    currNav: "", // 当前顶部菜单name
    currNavTitle: "", // 当前顶部菜单标题
    cachePage: [],
    lang: "",
    pageOpenedList: [
      {
        // 打开过的页面，顶部历史菜单项
        title: "首页",
        path: "",
        name: "home_index",
      },
    ],
    hotWords: [], //今日热词数据
    // 面包屑数组 左侧菜单
    menuList: [],
    tagsList: [...otherRouter.children], //这块是面包屑的内容不能删除
    routers: [otherRouter],
    messageCount: 0,
    // 在这里定义你不想要缓存的页面的name属性值(参见路由配置router.js)
    dontCache: ["test", "test"],
  }),
  actions: {
    // 动态添加主界面路由，需要缓存
    updateAppRouter(routes) {
      this.routers.push(...routes);
      // 实际 addRoute 在 util.registerDynamicRoutes 中完成
    },
    updateDefaultRouter(routes) {
      // 兼容旧调用，404 由 registerDynamicRoutes 注册
    },
    setAdded(v) {
      this.added = v;
    },
    setNavList(list) {
      this.navList = list;
    },
    setCurrNav(v) {
      this.currNav = v;
    },
    setCurrNavTitle(v) {
      this.currNavTitle = v;
    },
    setTagsList(list) {
      this.tagsList.push(...list);
    },
    updateMenulist(routes) {
      this.menuList = routes;
    },
    closePage(name) {
      this.cachePage.forEach((item, index) => {
        if (item == name) {
          this.cachePage.splice(index, 1);
        }
      });
    },
    initCachePage() {
      if (localStorage.cachePage) {
        this.cachePage = JSON.parse(localStorage.cachePage).filter((name) => !removedPageNames.has(name));
        localStorage.cachePage = JSON.stringify(this.cachePage);
      }
    },
    removeTag(name) {
      this.pageOpenedList.map((item, index) => {
        if (item.name == name) {
          this.pageOpenedList.splice(index, 1);
        }
      });
    },
    updateOpenedList(get) {
      let openedPage = this.pageOpenedList[get.index];
      if (get.argu) {
        openedPage.argu = get.argu;
      }
      if (get.query) {
        openedPage.query = get.query;
      }
      this.pageOpenedList.splice(get.index, 1, openedPage);
      localStorage.pageOpenedList = JSON.stringify(this.pageOpenedList);
    },
    clearAllTags() {
      this.pageOpenedList.splice(1);
      this.cachePage.length = 0;
      localStorage.pageOpenedList = JSON.stringify(this.pageOpenedList);
    },
    clearOtherTags(currentName) {
      let currentIndex = 0;
      this.pageOpenedList.forEach((item, index) => {
        if (item.name == currentName) {
          currentIndex = index;
        }
      });
      if (currentIndex == 0) {
        this.pageOpenedList.splice(1);
      } else {
        this.pageOpenedList.splice(currentIndex + 1);
        this.pageOpenedList.splice(1, currentIndex - 1);
      }
      let newCachepage = this.cachePage.filter((item) => {
        return item == currentName;
      });
      this.cachePage = newCachepage;
      localStorage.pageOpenedList = JSON.stringify(this.pageOpenedList);
    },
    setOpenedList() {
      this.pageOpenedList = localStorage.pageOpenedList
        ? JSON.parse(localStorage.pageOpenedList).filter((page) => !removedPageNames.has(page.name))
        : [otherRouter.children[0]];
      localStorage.pageOpenedList = JSON.stringify(this.pageOpenedList);
    },
    setAvatarPath(path) {
      localStorage.avatorImgPath = path;
    },
    switchLang(lang) {
      this.lang = lang;
      localStorage.lang = lang;
      i18n.global.locale = lang;
    },
    setMessageCount(count) {
      this.messageCount = count;
    },
    increateTag(tagObj) {
      if (this.dontCache.indexOf(tagObj.name) < 0) {
        this.cachePage.push(tagObj.name);
        localStorage.cachePage = JSON.stringify(this.cachePage);
      }
      this.pageOpenedList.push(tagObj);
      localStorage.pageOpenedList = JSON.stringify(this.pageOpenedList);
    },
  },
});
