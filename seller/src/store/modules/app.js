import { otherRouter } from "@/router/router";
import Util from "@/libs/util";

const app = {
  state: {
    shipTemplates: "",
    regions: [],
    styleStore: "",
    loading: false,
    added: false,
    navList: [],
    currNav: "",
    currNavTitle: "",
    cachePage: [],
    lang: "",
    isFullScreen: false,
    openedSubmenuArr: [],
    menuTheme: "dark",
    themeColor: "",
    storeOpenedList: [
      {
        title: "首页",
        path: "",
        name: "home_index",
      },
    ],
    currentPageName: "",
    currentPath: [
      {
        title: "首页",
        path: "",
        name: "home_index",
      },
    ],
    menuList: [],
    routers: [otherRouter],
    tagsList: [...otherRouter.children],
    messageCount: 0,
    dontCache: ["test", "test"],
    refMenu: "",
  },
  mutations: {
    childrenMenu(state, v) {
      state.refMenu = v;
    },
    updateAppRouter(state, routes) {
      state.routers.push(...routes);
    },
    updateDefaultRouter() {},
    setLoading(state, v) {
      state.loading = v;
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
    addOpenSubmenu(state, name) {
      if (name.length && state.openedSubmenuArr.indexOf(name) === -1) {
        state.openedSubmenuArr.push(name);
      }
    },
    closePage(state, name) {
      state.cachePage.forEach((item, index) => {
        if (item == name) {
          state.cachePage.splice(index, 1);
        }
      });
      localStorage.cachePage = JSON.stringify(state.cachePage);
    },
    initCachepage(state) {
      if (localStorage.cachePage) {
        state.cachePage = JSON.parse(localStorage.cachePage);
      }
    },
    removeTag(state, name) {
      state.storeOpenedList.map((item, index) => {
        if (item.name == name) {
          state.storeOpenedList.splice(index, 1);
        }
      });
    },
    storeOpenedList(state, get) {
      let openedPage = state.storeOpenedList[get.index];
      if (get.argu) openedPage.argu = get.argu;
      if (get.query) openedPage.query = get.query;
      state.storeOpenedList.splice(get.index, 1, openedPage);
      localStorage.storeOpenedList = JSON.stringify(state.storeOpenedList);
    },
    clearAllTags(state) {
      state.storeOpenedList.splice(1);
      state.cachePage.length = 0;
      localStorage.cachePage = "";
      localStorage.storeOpenedList = JSON.stringify(state.storeOpenedList);
    },
    clearOtherTags(state, vm) {
      let currentName = vm.$route.name;
      let currentIndex = 0;
      state.storeOpenedList.forEach((item, index) => {
        if (item.name == currentName) {
          currentIndex = index;
        }
      });
      if (currentIndex == 0) {
        state.storeOpenedList.splice(1);
      } else {
        state.storeOpenedList.splice(currentIndex + 1);
        state.storeOpenedList.splice(1, currentIndex - 1);
      }
      state.cachePage = state.cachePage.filter((item) => item == currentName);
      localStorage.cachePage = JSON.stringify(state.cachePage);
      localStorage.storeOpenedList = JSON.stringify(state.storeOpenedList);
    },
    setOpenedList(state) {
      state.storeOpenedList = localStorage.storeOpenedList
        ? JSON.parse(localStorage.storeOpenedList)
        : [otherRouter.children[0]];
    },
    setCurrentPath(state, pathArr) {
      state.currentPath = pathArr;
    },
    setCurrentPageName(state, name) {
      state.currentPageName = name;
    },
    setAvatarPath(state, path) {
      localStorage.avatorImgPath = path;
    },
    switchLang(state, lang) {
      state.lang = lang;
      localStorage.lang = lang;
    },
    clearOpenedSubmenu(state) {
      state.openedSubmenuArr.length = 0;
    },
    setMessageCount(state, count) {
      state.messageCount = count;
    },
    increateTag(state, tagObj) {
      if (!Util.oneOf(tagObj.name, state.dontCache)) {
        state.cachePage.push(tagObj.name);
        localStorage.cachePage = JSON.stringify(state.cachePage);
      }
      state.storeOpenedList.push(tagObj);
      localStorage.storeOpenedList = JSON.stringify(state.storeOpenedList);
    },
  },
};

export default app;
