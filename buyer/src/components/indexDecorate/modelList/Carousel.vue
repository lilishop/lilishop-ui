<template>
  <div class="model-carousel">
    <div class="nav-body">
      <!-- 侧边导航占位（与 CateNav 分类栏同宽，勿与 CateNav .nav-side 混用类名） -->
      <div class="carousel-side-spacer"></div>
      <div class="nav-content">
        <!-- 轮播图：无有效图片时不挂载 el-carousel；勿对 el-carousel 使用随图片变化的 key，否则 Vue3 patch 会报 emitsOptions 错误 -->
        <el-carousel
          v-if="displaySlides.length"
          height="334px"
          :interval="5000"
          :loop="displaySlides.length > 1"
        >
          <el-carousel-item
            v-for="(item, index) in displaySlides"
            :key="carouselItemKey(item, index)"
          >
            <div class="swiper-img">
              <img
                :src="item.img"
                @click="linkTo(item.url)"
                class="hover-pointer"
              />
            </div>
          </el-carousel-item>
        </el-carousel>
        <div v-else class="swiper-img carousel-placeholder"></div>
      </div>
      <div class="nav-right">
        <div class="person-msg">
          <div class="user-box" @click="entryControl({ path: 'home' })">
            <img class="user-face" :src="userInfo.face || defaultAvatar"  alt />
            <div class="welcome">
              Hi, {{
                $filters.secrecyMobile(userInfo.nickName || `欢迎来到${config.title}`)
              }}
            </div>
          </div>
          <div v-if="userInfo.id">
            <div class="icon-list"></div>
            <!-- #TODO 后续增加 -->
            <!-- <div class="icon-list flex flex-j-sb" >
              <div class="icon-item" :key="index"  @click="entryControl(item)" v-for="(item,index) in recentList">
                <div class="value">
                  {{ item.value}}
                </div>
                <div class="label">
                  {{ item.label}}
                </div>
              </div>
            </div> -->
          </div>
          <div v-else class="flex flex-a-c ">
            <div class="btns" @click="goLogin">登录</div>
            <div class="btns sign-up" @click="$router.push('signUp')">注册</div>
          </div>

          <div class="gray-line"></div>
          <div class="icon-list flex flex-j-sb" >
            <div class="icon-item" @click="entryControl(item)" :key="index" v-for="(item, index) in entranceList">
              <img class="icon" :src="getIconUrl(item.icon)">
              <div>
                {{ item.label }}
              </div>
            </div>
          </div>
          <div class="icon-list flex flex-j-sb" >
            <div class="icon-item" :key="index"  @click="entryControl(item)" v-for="(item, index) in appendList">
              <img class="icon" :src="getIconUrl(item.icon)">
              <div>
                {{ item.label }}
              </div>
            </div>
          </div>



        </div>

      </div>
    </div>
  </div>
</template>

<script>

import { Modal } from "@/utils/message";
import storage from "@/plugins/storage";
import config from "@/config";
import defaultAvatar from "@/assets/images/default.png";
import { getIconUrl } from "@/assets/iconfont/iconMap";
export default {
  name: "modelCarousel",
  props: ["data"],
  computed: {
    carouselList() {
      return this.data?.options?.list || [];
    },
    displaySlides() {
      return this.carouselList.filter((item) => item && item.img);
    },
  },
  data() {
    return {
      config,
      defaultAvatar,
      userInfo: {}, // 用户信息
      entranceList: [
        {
          icon: "collage",
          label: "宝贝收藏",
          path: "/home/Favorites"
        },
        {
          icon: "shop",
          label: "收藏店铺",
          path: "/home/Favorites?type=STORE"
        },
        {
          icon: "carts",
          label: "购物车",
          path: "/cart"
        },
        {
          icon: "story",
          label: "我的足迹",
          path: "/home/MyTracks"
        },
      ],
      appendList: [
        {
          icon: "support",
          label: "帮助中心",
          path: "/article"
        },
        {
          icon: "feedback",
          label: "我的评论",
          path: "/home/CommentList"
        },
        {
          icon: "notice",
          label: "收货地址",
          path: "/home/MyAddress"
        },
        {
          icon: "notification",
          label: "我的消息",
          path: "/home/MsgList"
        },
      ],
      recentList: [
        {
          value: "0",
          label: "购物车"
        },
        {
          value: "0",
          label: "待收货"
        },
        {
          value: "0",
          label: "待发货"
        },
        {
          value: "0",
          label: "代付款"
        },
      ],
    };
  },
  methods: {
    getIconUrl,
    carouselItemKey(item, index) {
      return item?.img || item?.url || `slide-${index}`;
    },
    resolveRoute(pathStr) {
      if (!pathStr) return { path: "/" };
      const [path, search] = pathStr.split("?");
      if (!search) return { path };
      return {
        path,
        query: Object.fromEntries(new URLSearchParams(search)),
      };
    },
    isMemberRoute(location) {
      return location.path.startsWith("/home/") || location.path === "/cart";
    },
    promptLoginThenNavigate(location) {
      Modal.confirm({
        title: "温馨提示",
        content: "请登录后执行此操作",
        okText: "立即登录",
        cancelText: "取消",
        onOk: () => {
          this.$router.push({
            path: "/login",
            query: {
              rePath: location.path,
              query: JSON.stringify(location.query || {}),
            },
          });
        },
      });
    },
    goLogin() {
      this.$router.push("/login");
    },
    // 快捷跳转中心
    entryControl(val) {
      const location = this.resolveRoute(val.path);
      if (this.isMemberRoute(location) && !storage.getItem("userInfo")) {
        this.promptLoginThenNavigate(location);
        return;
      }
      const url = this.$router.resolve(location);
      window.open(url.href, "_blank");
    },
  },
  mounted() {
    if (storage.getItem("userInfo"))
      this.userInfo = JSON.parse(storage.getItem("userInfo"));

  },
};
</script>

<style scoped lang="scss">
.label {
  font-size: 12px;
  font-weight: normal;
  line-height: 14px;
  text-align: center;
  letter-spacing: 0px;

  color: #666666;
}

.swiper-img {
  overflow: hidden;
  width: 100%;
  height: 329.9px;
}

.carousel-placeholder {
  border-radius: 10px;
  background: #ececec;
}

.icon-list {
  width: 216px
}

.icon-list:nth-last-of-type(1) {
  margin-top: 20px;
}

.hot-box {
  margin-top: 35px;
  width: 216px;

}

.hot-tag {
  margin-right: 6px;
  width: 36px;
  height: 18px;
  border-radius: 4px;
  opacity: 1;
  font-size: 12px;
  border: 1px solid $theme_color;
  color: $theme_color;
  text-align: center;
  line-height: 18px;
}

.gray-line {
  width: 216px;
  height: 1px;
  border: 1px solid #E5E5E5;
  margin-bottom: 13px;
}

.icon {
  width: 20px !important;
  height: 20px !important;
  margin-bottom: 7px;
}

.icon-item {

  cursor: pointer;
  text-align: center;

  >div {
    font-size: 11px;
    font-weight: normal;
    line-height: 13px;
    text-align: center;
    letter-spacing: 0px;

    color: #666666;
  }

  >.value {
    font-size: 14px;

    line-height: 17px;
    text-align: center;
    font-weight: 400;
    letter-spacing: 0px;
    margin-bottom: 3px;
    color: $theme_color;
  }

  >.label {
    font-weight: 400;
    font-size: 12px;

    line-height: 14px;
    text-align: center;
    letter-spacing: 0px;
    color: #666666;
    margin-bottom: 13px;
  }
}

.model-carousel {
  width: 100%;
  max-width: 1200px;
  height: 340px;
  margin: 0 auto;
  overflow: hidden;
  box-sizing: border-box;
  position: relative;
  z-index: 0;
}

.hover-pointer {
  width: 100%;
  height: 329.9px;
  object-fit: cover;
  border-radius: 10px;
}

.welcome {
  font-size: 14px;
  font-weight: normal;
  line-height: 17px;
  text-align: center;
  letter-spacing: 0px;

  color: #333333;
}

.hr {
  width: 216px;
  height: 1px;
  border: 1px solid #E5E5E5;
}

.btns {
  margin-top: 21px;
  margin-bottom: 13px;
  width: 77px;
  height: 28px;
  border-radius: 14px;
  opacity: 1;
  font-size: 13px;
  font-weight: normal;
  line-height: 28px;
  text-align: center;
  cursor: pointer;
  letter-spacing: 0px;

  color: #FFFFFF;
  background: $theme_color;
}

.sign-up {
  background: #F39519;
  margin-left: 10px;
}

.avatar {
  margin-bottom: 13px;
}

.user-face {

  margin-bottom: 12px;
  width: 70px;
  height: 70px;
  border-radius: 50%;

}

/* 导航主体：263.2 + 10 + 1fr + 10 + 263.2 = 1200px，与下方楼层右缘对齐 */
.nav-body {
  width: 100%;
  max-width: 1200px;
  height: 340px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 263.2px minmax(0, 1fr) 263.2px;
  column-gap: 10px;
  align-items: start;
  box-sizing: border-box;
}

.carousel-side-spacer {
  grid-column: 1;
  width: 263.2px;
  height: 334px;
  flex-shrink: 0;
  border-bottom-left-radius: 10px;
  border-bottom-right-radius: 10px;
  pointer-events: none;
}


/*导航内容*/
.nav-content {
  grid-column: 2;
  width: 100%;
  min-width: 0;
  margin-top: 10px;
  height: 333.9px;
  position: relative;
  overflow: hidden;

  :deep(.el-carousel) {
    width: 100%;
    height: 100%;
    border-radius: 10px;
    overflow: hidden;
  }

  :deep(.el-carousel__container) {
    height: 334px;
  }

  :deep(.el-carousel__item) {
    width: 100%;
  }
}

.nav-right {
  grid-column: 3;
  width: 263.2px;
  min-width: 263.2px;
  max-width: 263.2px;
  margin-top: 10px;

  border-radius: 10px;
  background: #FFFFFF;

  .person-msg {
    cursor: pointer;
    height: 333px;
    display: flex;
    align-items: center;
    flex-direction: column;
    padding-top: 28px;
    padding-bottom: 25px;

    >.user-box{
      text-align: center;
    }
  }

  .shop-msg {
    div {
      width: 100%;
      margin: 10px 27px;

      span {
        cursor: pointer;
        text-align: center;
        font-weight: bold;
        margin-left: 5px;
      }

      span:nth-child(1) {
        @include content_color($theme_color);
        margin-left: 0;
      }

      span:nth-child(2) {
        font-weight: normal;
      }

      span:nth-child(3):hover {
        color: $theme_color;
      }
    }

    ul {
      li {
        cursor: pointer;
        margin: 5px 0;
        color: #999395;
        width: 150px;
        font-size: 12px;

        &:hover {
          color: $theme_color;
        }
      }
    }
  }
}
</style>
