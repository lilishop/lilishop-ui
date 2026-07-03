<template>
  <div>
    <BaseHeader></BaseHeader>

    <div class="container width_1200">
      <div class="layoutAll">
        <el-aside class="side-bar" width="200px">
          <el-menu
            class="side-menu"
            :default-active="$route.name"
            :default-openeds="['订单中心', '会员中心']"
            @select="onSelect"
          >
            <div class="user-icon">
              <div class="user-img">
                <img
                  :src="userInfo.face"
                  style="width: 100%; height: 100%"
                  v-if="userInfo.face"
                  alt
                />
                <el-avatar v-else :size="96" class="mb_10"><el-icon><User /></el-icon></el-avatar>
              </div>
              <p>{{ userInfo.nickName }}</p>
            </div>

            <template v-for="(menu, index) in menuList" :key="index">
              <el-sub-menu v-if="menu.display" :index="menu.title">
                <template #title>
                  <el-icon><Location /></el-icon>
                  <span>{{ menu.title }}</span>
                </template>
                <el-menu-item
                  v-for="(chlidren, i) in menu.menus"
                  :key="i"
                  :index="chlidren.path"
                >{{ chlidren.title }}</el-menu-item>
              </el-sub-menu>
            </template>
          </el-menu>
        </el-aside>
        <el-main class="content ml_10">
          <router-view></router-view>
        </el-main>
      </div>
    </div>
  </div>
</template>

<script>
import { Location, User } from '@element-plus/icons-vue';
import menuList from "./menu";
import Storage from "@/plugins/storage.js";

export default {
  components: { Location, User },
  name: "Home",
  data() {
    return {
      menuList,
    };
  },
  computed: {
    userInfo() {
      if (Storage.getItem("userInfo")) {
        return JSON.parse(Storage.getItem("userInfo"));
      }
      return {};
    },
  },
  methods: {
    onSelect(name) {
      this.$router.push({ name });
    },
  },
};
</script>

<style scoped lang="scss">
.content {
  padding: 15px 50px;
}

.header {
  @include background_color($light_background_color);
}

.side-menu,
.side-bar,
.content {
  @include white_background_color();
  @include title_color($light_title_color);
}

.side-bar {
  min-height: 600px;
  height: auto;
}

.layoutAll {
  display: flex;
  min-height: 1200px;
  @include background_color($light_background_color);
}

.container {
  margin: 0 auto;
  padding: 20px 0;
}

.side-bar a {
  @include title_color($light_title_color);
}

.user-icon {
  height: 200px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.user-img {
  margin-bottom: 15px;
  width: 96px;
  height: 96px;
  border-radius: 48px;
  overflow: hidden;
}

.layout-footer-center {
  padding: 0px 15px;
  padding-bottom: 15px;
  text-align: center;
}
</style>
