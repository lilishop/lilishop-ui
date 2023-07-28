<template>
  <div class="model-carousel">
    <div class="nav-body clearfix">
      <!-- 侧边导航占位 -->
      <div class="nav-side"></div>
      <div class="nav-content">
        <!-- 轮播图 -->
<!--        autoplay autoplay-speed="10000"-->
        <Carousel :height="333.9" autoplay :autoplay-speed="5000">
          <CarouselItem  v-for="(item, index) in data.options.list" :key="index">
            <div class="swiper-img" >
              <img
                :src="item.img"
                @click="linkTo(item.url)"
                class="hover-pointer"
              />
            </div>
          </CarouselItem>
        </Carousel>
      </div>
      <div class="nav-right">
        <div class="person-msg">
          <div class="user-box" @click="entryControl({ path: 'home' })">
            <img class="user-face" :src="userInfo.face || defaultAvatar"  alt />
            <div class="welcome">
              Hi, {{
                userInfo.nickName || `欢迎来到${config.title}` | secrecyMobile
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
            <div class="btns" @click="$router.push('login')" shape="circle"
            >登录</div
            >
            <div class="btns sign-up" @click="$router.push('signUp')" shape="circle"
            >注册</div
            >
          </div>

          <div class="gray-line"></div>
          <div class="icon-list flex flex-j-sb" >
            <div class="icon-item" @click="entryControl(item)" :key="index" v-for="(item, index) in entranceList">
              <img class="icon" :src="require(`@/assets/iconfont/${item.icon}.png`)">
              <div>
                {{ item.label }}
              </div>
            </div>
          </div>
          <div class="icon-list flex flex-j-sb" >
            <div class="icon-item" :key="index"  @click="entryControl(item)" v-for="(item, index) in appendList">
              <img class="icon" :src="require(`@/assets/iconfont/${item.icon}.png`)">
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

import storage from "@/plugins/storage";
export default {
  name: "modelCarousel",
  props: ["data"],
  data() {
    return {
      config: require("@/config"),
      defaultAvatar: require("@/assets/images/default.png"),
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
    // 快捷跳转中心
    entryControl(val) {
      console.log("val",val)
      let url = this.$router.resolve(val.path);
      window.open(url.href, '_blank');
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
  width: 637px;
  height: 329.9px;
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
  width: 1200px;
  height: 340px;
  overflow: hidden;
}

.hover-pointer {
  //display: block;
  //width: 100%;
  //height: 100%;
  width: 637px;
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

/* 导航主体 */
.nav-body {
  width: 1200px;
  height: 340px;
  margin: 0px auto;
}

.nav-side {
  height: 334px;
  width: 263.2px;
  border-bottom-left-radius: 10px;
  border-bottom-right-radius: 10px;
  float: left;
  padding: 0px;
  color: #fff;
  // background-color: #6e6568;


}


/*导航内容*/
.nav-content {
  width: 637px;
  margin-left: 10.8px;

  margin-top: 10px;
  height: 333.9px;

  float: left;
  position: relative;
}

.nav-right {
  float: left;
  margin-top: 10px;
  width: 263.2px;
  margin-left: 10px;

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
