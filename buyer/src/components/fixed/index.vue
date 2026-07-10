<template>
    <div class="shadow-box">
        <div class="shadow-item flex flex-a-c flex-j-c" v-for="(item,index) in iconList" @click="handleClickIcon(item)" :key="index">
          <img class="icon" :src="getIconUrl(item.icon)">
          <div class="shadow-label">{{item.label}}</div>
          <div class="line" v-if="iconList.length-1 !=index"></div>
        </div>
    </div>
</template>

<script>
import { getIconUrl } from "@/assets/iconfont/iconMap";
import storage from "@/plugins/storage.js";

export default {
  name: "fixed-index",
  data(){
    return{
      iconList:[
        {
          icon:"user",
          label:"会员中心",
          path:"/home",
          requireLogin: true,
        },
        {
          icon:"carts",
          label:"购物车",
          path:"/cart",
          requireLogin: true,
        },
        {
          icon:"notification",
          label:"消息",
          path:"/home/MsgList",
          requireLogin: true,
        },
        {
          icon:"collage",
          label:"收藏",
          path:"/home/Favorites",
          requireLogin: true,
        },
        {
          icon:"back",
          label:"顶部",
          path:"back"
        },
      ],
      isScrolling:false,
      timeoutId:"",
    }
  },
  mounted() {
    const vm = this
    // 添加滚轮事件监听器
    window.addEventListener('wheel', function() {
      if (vm.isScrolling) {
        // 如果页面正在滚动，则取消定时器并设置 isScrolling 为 false
        window.cancelAnimationFrame(vm.timeoutId);
        vm.isScrolling  = false;
      }
    });


  },
  methods:{
    getIconUrl,
    scrollToTop() {
      const c = document.documentElement.scrollTop || document.body.scrollTop;
      if (c > 0) {
        this.timeoutId = window.requestAnimationFrame(this.scrollToTop);
        window.scrollTo(0, c - c / 4);
        this.isScrolling = true;
      }else {
        this.isScrolling = false;
      }
    },
    isLoggedIn () {
      const rawUserInfo = storage.getItem('userInfo');
      if (rawUserInfo) {
        try {
          return !!JSON.parse(rawUserInfo).username;
        } catch {
          return false;
        }
      }
      return !!storage.getItem('accessToken');
    },
    goLogin (rePath) {
      this.$router.push({
        path: '/login',
        query: {
          rePath,
          query: JSON.stringify(this.$route.query || {}),
        },
      });
    },
    handleClickIcon (val) {
      if (val.path === 'back') {
        this.scrollToTop();
        return;
      }
      if (val.requireLogin && !this.isLoggedIn()) {
        this.goLogin(val.path);
        return;
      }
      this.$router.push(val.path);
    },
  }
}
</script>

<style scoped lang="scss">
.shadow-box{
  width: 64px;
  height: 354px;
  border-radius: 10px;
  opacity: 1;

  background: #FFFFFF;

  box-shadow: 0px 1px 10px 0px rgba(154, 154, 154, 0.5);
}
.shadow-label{
  font-size: 13px;
  font-weight: normal;
  line-height: 16px;
  text-align: center;
  letter-spacing: 0px;
  color: #666666;
}
.icon{
  margin-top: 15px;
  width: 20px;
  height: 20px;
  margin-bottom: 5px;
}
.shadow-item{
  cursor: pointer;
  flex-direction: column;
  height: 70px;
  >.line{
    width: 34px;
    height: 1px;
    opacity: 1;
    margin-top: 17px;
    border: 0.7px solid #EAEAEA;
  }
}
</style>
