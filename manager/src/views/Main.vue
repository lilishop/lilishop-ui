<style lang="scss">
@import "./main.scss";
</style>
<template>
  <div class="main">
    <div class="sidebar-menu-con menu-bar">
      <shrinkable-menu />
    </div>
    <div
      class="main-header-con"
      :class="{ 'has-tabs': setting.isUseTabsRouter }"
      :style="{ height: setting.isUseTabsRouter ? '106px' : '60px' }"
    >
      <div class="main-header">
        <div class="header-logo-con">
          <img :src="domainLogo" key="max-logo" />
        </div>
        <div class="header-avator-con">
          <div class="flex flex-a-c user-module" style="height: 100%">
            <message-tip v-if="tipsMessage" :res="tipsMessage" />
            <div class="user-dropdown-menu-con" style="margin-left: 24px; display: flex; align-items: center; height: 100%">
              <el-row
                type="flex"
                justify="end"
                align="middle"
                class="user-dropdown-innercon"
              >
                <el-dropdown trigger="hover" @command="handleClickUserDropdown">
                  <div class="dropList">
                    <span class="main-user-name">{{ userInfo.nickName }}</span>
                    <el-avatar
                      :size="32"
                      :src="avatarPath"
                      style="background: #fff; margin-left: 10px"
                    >
                      <el-icon><UserFilled /></el-icon>
                    </el-avatar>
                  </div>
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item command="personalCenter">
                        {{ $t("userCenter") }}
                      </el-dropdown-item>
                      <el-dropdown-item command="changePass">
                        {{ $t("changePass") }}
                      </el-dropdown-item>
                      <el-dropdown-item divided command="loginOut">
                        {{ $t("logout") }}
                      </el-dropdown-item>
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
              </el-row>
            </div>
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
  </div>
</template>

<script>
import { UserFilled } from "@element-plus/icons-vue";
import shrinkableMenu from "./main-parts/shrinkable-menu/shrinkable-menu.vue";
import tagsPageOpened from "./main-parts/tags-page-opened.vue";
import messageTip from "./main-parts/message-tip.vue";
import circleLoading from "@/components/lili/circle-loading.vue";
import Cookies from "js-cookie";
import util from "@/libs/util.js";
import { getNoticePage, logout } from "@/api/index";
import config from "@/config/index.js";
import defaultLogo from "@/assets/logo.png";

export default {
  components: {
    UserFilled,
    shrinkableMenu,
    tagsPageOpened,
    messageTip,
    circleLoading,
  },
  data() {
    return {
      config,
      sliceNum: 5,
      userInfo: "",
      tipsMessage: "",
      defaultLogo,
      domainLogo: "",
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
      return this.$store.state.app.pageOpenedList;
    },
    avatarPath() {
      return localStorage.avatorImgPath;
    },
  },
  methods: {
    init() {
      const userInfo = JSON.parse(Cookies.get("userInfoManager"));
      this.userInfo = userInfo;
      this.checkTag(this.$route.name);
      this.domainLogo = localStorage.getItem("icon") || this.defaultLogo;
      const link =
        document.querySelector("link[rel*='icon']") ||
        document.createElement("link");
      link.type = "image/x-icon";
      link.href = localStorage.getItem("domainIcon");
      link.rel = "shortcut icon";
      document.getElementsByTagName("head")[0].appendChild(link);
      window.document.title = localStorage.getItem("title") + " - 运营后台";
      getNoticePage({}).then((res) => {
        if (res.success) {
          this.tipsMessage = res.result;
          this.$store.state.notices = res.result;
        }
      });
    },
    handleClickUserDropdown(name) {
      if (name === "personalCenter") {
        util.openNewPage(this, "personal-center");
        this.$router.push({ name: "personal-center" });
      } else if (name === "changePass") {
        util.openNewPage(this, "change-password");
        this.$router.push({ name: "change_password" });
      } else if (name === "loginOut") {
        logout().then(() => {
          this.$store.commit("logout", this);
          this.$store.commit("setAdded", false);
          this.setStore("accessToken", "");
          this.setStore("refreshToken", "");
          this.$router.push({ path: "/login" });
        });
      }
    },
    checkTag(name) {
      const openpageHasTag = util.findOpenedPageIndex(
        this.pageTagsList,
        name,
        this.$route.path
      ) >= 0;
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
    onLogoError(e) {
      if (e?.target && e.target.src !== this.defaultLogo) {
        e.target.src = this.defaultLogo;
      }
    },
  },
  watch: {
    $route(to) {
      this.checkTag(to.name);
      localStorage.currentPageName = to.name;
    },
  },
  mounted() {
    this.init();
    this.resize();
    window.addEventListener("resize", this.resize);
    this.$store.commit("setOpenedList");
  },
  beforeUnmount() {
    window.removeEventListener("resize", this.resize);
  },
  created() {
    this.$store.commit("setOpenedList");
  },
};
</script>
