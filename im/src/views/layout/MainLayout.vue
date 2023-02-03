<template>
  <div class="body-bag" :class="themeBagImg">
    <el-container class="main-layout" :class="{ 'full-mode': themeMode }">
      <!-- <el-aside width="70px" class="side-edge">
        <el-container class="full-height">
          <el-header height="118px" class="logo-header">
            <div class="user-login" v-popover:usercard>
              <div class="user-box">
                <face :text="face"></face>
              </div>
            </div>
            <p class="user-status">
              <span v-if="name">{{ name }}</span>
              <span v-else>用户名称</span>
            </p>
          </el-header>
          <el-main class="sidebar-menu">
            <el-tooltip content="我的消息" placement="right" :visible-arrow="false">
              <router-link to="/message">
                <div class="menu-items" :class="{ active: idx == 0 }">
                  <i class="el-icon-chat-line-round" />
                  <span v-show="unreadNum" class="notify"></span>
                </div>
              </router-link>
            </el-tooltip>
          </el-main>
          <el-footer height="60px" class="fixed-sidebar">
            <div class="menu-items" @click="logout">
              <span class="logout">退出</span>
            </div>
          </el-footer>
        </el-container>
      </el-aside> -->

      <el-main class="no-padding" style="background: white">
        <slot name="container"></slot>
      </el-main>
    </el-container>

    <!-- 语音消息提示 -->
    <audio id="audio" preload="auto">
      <source src="~@/assets/image/1701.mp3" type="audio/mp3" />
    </audio>
  </div>
</template>
<script>
import Face from '../../components/face'
import { mapState } from "vuex";
import { ServeFindFriendApplyNum } from "@/api/contacts";

export default {
  components: { Face },
  name: "MainLayout",
  props: {
    idx: {
      type: Number,
      default: 0,
    },
  },
  computed: {
    ...mapState({
      face: (state) => state.user.face,
      name: (state) => state.user.name,
      id: (state) => state.user.id,
      defaultAvatar: (state) => state.defaultAvatar,
      socketStatus: (state) => state.socketStatus,
      unreadNum: (state) => state.notify.unreadNum,
      applyNum: (state) => state.notify.applyNum,
      notifyCueTone: (state) => state.settings.notifyCueTone,
      themeMode: (state) => state.settings.themeMode,
      themeBagImg: (state) => state.settings.themeBagImg,
    }),
  },
  watch: {
    unreadNum (n, o) {
      if (n > 0 && n > o && this.notifyCueTone) {
        this.play();
      }
    },
  },
  created () {
    this.setApplyNum();
  },
  methods: {
    play () {
      document
        .querySelector("#audio")
        .play()
        .catch(() => {
          console.error("消息提示音播放异常");
        });
    },
    logout () {
      this.$store.dispatch("ACT_USER_LOGOUT");
    },
    setApplyNum () {
      // TODO 暂且return
      return;
    },
  },
};
</script>
<style lang="less" >
.main-layout {
  position: fixed;
  width: 80%;
  height: 80%;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  margin: auto;
  overflow: hidden;
  transition: ease 0.5s;
  border-radius: 5px;

  &.full-mode {
    width: 1200px;
    height: 85%;
    border-radius: 0;
  }

  .side-edge {
    display: block;
    user-select: none;
    background-color: #fff;
    box-sizing: border-box;
    border-right: 1px solid #ededed;

    .logo-header {
      padding: 0;

      .user-status {
        text-align: center;
        margin-top: 10px;
        color: #ccc9c9;
        font-size: 13px;
        font-weight: 300;

        .online {
          color: #0d710d;
        }
      }
    }
  }

  .sidebar-menu {
    width: 60px;
    margin: 0 auto;
    text-align: center;
    padding: 0;
    overflow: hidden;

    a {
      text-decoration: none;
    }

    .menu-items {
      cursor: pointer;
      color: #706d6d;
      position: relative;
      width: 45px;
      height: 45px;
      margin: 6px auto 0;
      line-height: 45px;
      text-align: center;

      i {
        font-size: 20px;

        &:hover {
          transform: scale(1.3);
        }
      }

      .notify {
        width: 5px;
        height: 5px;
        background: #ff1e1e;
        display: inline-block;
        border-radius: 5px;
        position: absolute;
        right: 5px;
        top: 9px;
        animation: notifymove 3s infinite;
        animation-direction: alternate;
        -webkit-animation: notifymove 3s infinite;
      }

      &.active {
        color: #416641 !important;
      }
    }
  }
}

.fixed-sidebar {
  padding: 0;

  .menu-items {
    height: 25px;
    line-height: 25px;
    padding: 10px 5px;
    cursor: pointer;
    box-shadow: 0 0 0 0 #ccc9c9;
    text-align: center;
    color: #afabab;

    i {
      font-size: 20px;
    }

    .logout {
      font-weight: 300;
      font-size: 15px;
      color: #9e9e9e;
      transition: ease 0.5;

      &:hover {
        font-size: 16px;
      }
    }
  }
}

/* 主题背景图片 */
.body-bag {
  width: 100%;
  height: 100%;
  position: absolute;
  overflow: hidden;
  top: 0;
  left: 0;
  background-color: #121212;
  transition: ease-in 0.5s;

  // &.bag001 {
  //   background: url(~@/assets/image/background/001.jpg);
  //   background-repeat: no-repeat;
  //   background-size: 100% 100%;
  // }

  // &.bag002 {
  //   background: url(~@/assets/image/background/002.jpg);
  //   background-repeat: no-repeat;
  //   background-size: 100% 100%;
  // }

  // &.bag003 {
  //   background: url(~@/assets/image/background/003.jpg);
  //   background-repeat: no-repeat;
  //   background-size: 100% 100%;
  // }

  // &.bag004 {
  //   background: url(~@/assets/image/background/005.png);
  //   background-repeat: no-repeat;
  //   background-size: 100% 100%;
  // }
}

@keyframes notifymove {
  0% {
    background: #ff1e1e;
  }

  25% {
    background: #2e3238;
  }

  50% {
    background: #ff1e1e;
  }

  75% {
    background: #2e3238;
  }

  100% {
    background: #ff1e1e;
  }
}

@-webkit-keyframes notifymove {
  0% {
    background: #ff1e1e;
  }

  25% {
    background: #2e3238;
  }

  50% {
    background: #ff1e1e;
  }

  75% {
    background: #2e3238;
  }

  100% {
    background: #ff1e1e;
  }
}

@media screen and (max-width: 1000px) {
  .main-layout {
    width: 100%;
    height: 100%;
    border-radius: 0;
  }
}

// iphone
@media screen and (max-width: 767px) {
  .side-edge {
    display: none !important;
  }
}

.user-box {
  margin: 20px auto 10px auto;
  height: 35px;
  width: 35px;
  flex-shrink: 0;
  background-color: #508afe;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 14px;
  color: white;
  user-select: none;
  transition: ease 1s;
  position: relative;
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    background-color: white;
    border-radius: 3px;
  }

  .top-mask {
    width: 100%;
    height: 100%;
    background-color: rgba(22, 25, 29, 0.6);
    position: absolute;
    top: 0;
    left: 0;
    color: white;
    display: none;
    align-items: center;
    justify-content: center;
    font-weight: bold;
  }

  &:hover .top-mask {
    display: flex;
  }
}
</style>
