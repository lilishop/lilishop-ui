<style lang="scss">
@import "./main.scss";
</style>

<template>
  <div class="main" :class="{ 'menu-collapsed': !showSubMenu }">
    <div class="sidebar-menu-con menu-bar">
      <div class="logo-con">
        <img :src="storeSideLogo" key="max-logo" />
      </div>
      <shrinkable-menu />
    </div>
    <div class="main-header-con" :style="{ height: setting.isUseTabsRouter ? '106px' : '60px' }">
      <div class="main-header">
        <div class="header-avator-con">
          <div></div>
          <div class="user-dropdown-menu-con">
            <el-row
              justify="end"
              align="middle"
              class="user-dropdown-innercon"
            >
              <ul class="nav-list">
                <li class="nav-item" @click="im">
                  <el-tooltip content="联系客服" placement="bottom">
                    <el-button type="warning" size="small" :loading="load">
                      <el-icon><ChatDotRound /></el-icon>
                      客服
                    </el-button>
                  </el-tooltip>
                </li>
                <li class="nav-item" @click="handleClickSetting">
                  <el-tooltip content="设置" placement="bottom">
                    <el-icon :size="16"><Setting /></el-icon>
                  </el-tooltip>
                </li>
              </ul>
              <el-dropdown trigger="hover" @command="handleClickUserDropdown">
                <div class="dropList">
                  <el-avatar
                    :size="32"
                    :src="userInfo.storeLogo"
                    style="background: #fff; margin-left: 10px"
                  >
                    <el-icon><UserFilled /></el-icon>
                  </el-avatar>
                </div>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item command="changePass">修改密码</el-dropdown-item>
                    <el-dropdown-item divided command="loginOut">退出</el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </el-row>
          </div>
        </div>
      </div>
      <div class="tags-con" v-if="setting.isUseTabsRouter">
        <tags-page-opened :pageTagsList="pageTagsList" />
      </div>
    </div>
    <div
      class="single-page-con"
      :style="{
        top: setting.isUseTabsRouter ? '106px' : '60px',
        height: setting.isUseTabsRouter ? 'calc(100% - 116px)' : 'calc(100% - 70px)',
      }"
    >
      <div class="single-page">
        <router-view v-slot="{ Component }">
          <component :is="Component" v-if="Component" :key="$route.fullPath" />
        </router-view>
      </div>
    </div>
    <circleLoading class="loading-position" v-show="loading" />
    <configDrawer ref="config" />
  </div>
</template>

<script>
import { ChatDotRound, Setting, UserFilled } from "@element-plus/icons-vue";
import shrinkableMenu from "./main-components/shrinkable-menu/shrinkable-menu.vue";
import tagsPageOpened from "./main-components/tags-page-opened.vue";
import circleLoading from "@/views/my-components/lili/circle-loading.vue";
import configDrawer from "@/views/main-components/config-drawer.vue";
import Cookies from "js-cookie";
import util from "@/libs/util.js";
import { logout } from "@/api/index";
import { getIMDetail } from "@/api/common";
import { userMsg } from "@/api/index";
import config from "@/config/index.js";

export default {
  components: {
    ChatDotRound,
    Setting,
    UserFilled,
    shrinkableMenu,
    tagsPageOpened,
    circleLoading,
    configDrawer,
  },
  data() {
    return {
      config,
      sliceNum: 5,
      userInfo: {},
      storeSideLogo: "",
      IMLink: "",
      load: false,
    };
  },
  computed: {
    setting() {
      return this.$store.state.setting.setting;
    },
    loading() {
      return this.$store.state.app.loading;
    },
    pageTagsList() {
      return this.$store.state.app.storeOpenedList;
    },
    showSubMenu() {
      return this.$store.state.app.menuList.length > 0;
    },
    lang() {
      return this.$store.state.app.lang;
    },
  },
  methods: {
    handleClickSetting() {
      this.$refs.config.open();
    },
    async im() {
      const accessToken = this.getStore("accessToken");
      this.load = true;
      await this.getIMDetailMethods();
      const userInfo = await userMsg();
      this.load = false;
      if (userInfo.success && this.IMLink) {
        window.open(`${this.IMLink}?token=` + accessToken);
      } else {
        this.$Message.error("请登录后再联系客服");
      }
    },
    async getIMDetailMethods() {
      const res = await getIMDetail();
      if (res.success) {
        this.IMLink = res.result;
      }
    },
    init() {
      const pathArr = util.setCurrentPath(this, this.$route.name);
      if (pathArr.length >= 2) {
        this.$store.commit("addOpenSubmenu", pathArr[1].name);
      }
      this.storeSideLogo = localStorage.getItem("sellerlogoImg");
      window.document.title = localStorage.getItem("sellersiteName");
      const link =
        document.querySelector("link[rel*='icon']") ||
        document.createElement("link");
      link.type = "image/x-icon";
      link.href = localStorage.getItem("sellerIconImg");
      link.rel = "shortcut icon";
      document.getElementsByTagName("head")[0].appendChild(link);

      const userInfo = JSON.parse(Cookies.get("userInfoSeller"));
      this.userInfo = userInfo;
      this.checkTag(this.$route.name);

      const currWidth = document.body.clientWidth;
      if (currWidth <= 1200) {
        this.sliceNum = 2;
      }
    },
    handleClickUserDropdown(name) {
      if (name === "changePass") {
        util.openNewPage(this, "change_pass");
        this.$router.push({ name: "change_pass" });
      } else if (name === "loginOut") {
        logout().then(() => {
          Cookies.set("accessToken", "");
          this.$store.commit("logout", this);
          this.$store.commit("clearOpenedSubmenu");
          this.setStore("accessToken", "");
          this.setStore("refreshToken", "");
          this.$router.push({ path: "/login" });
        });
      }
    },
    checkTag(name) {
      const openpageHasTag = this.pageTagsList.some((item) => item.name === name);
      if (!openpageHasTag) {
        util.openNewPage(
          this,
          name,
          this.$route.params || {},
          this.$route.query || {}
        );
      }
    },
    resize() {
      const currWidth = document.body.clientWidth;
      const count = currWidth / 300;
      this.sliceNum = count > 6 ? 6 : count;
    },
  },
  watch: {
    $route(to) {
      this.$store.commit("setCurrentPageName", to.name);
      const pathArr = util.setCurrentPath(this, to.name);
      if (pathArr.length > 2) {
        this.$store.commit("addOpenSubmenu", pathArr[1].name);
      }
      this.checkTag(to.name);
      localStorage.currentPageName = to.name;
    },
    lang() {
      util.setCurrentPath(this, this.$route.name);
    },
  },
  created() {
    this.$store.commit("setOpenedList");
  },
  mounted() {
    this.init();
    this.resize();
    window.addEventListener("resize", this.resize);
  },
  beforeUnmount() {
    window.removeEventListener("resize", this.resize);
  },
};
</script>
