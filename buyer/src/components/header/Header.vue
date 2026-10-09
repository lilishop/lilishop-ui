<template>
  <div class="box">
    <div class="nav width_1200_auto">
      <ul class="location flex">
        <li v-if="$route.path.includes('home')" style="margin-left:10px">
          <router-link to="/">首页</router-link>
        </li>
        <ul class="flex">
          <li>Hi，欢迎来到{{ config.title }}</li>
          <li class="first" v-show="!userInfo.username">
            <router-link :to="`/signUp`" class="nav-item">
              <span>立即注册</span>
            </router-link>
          </li>
          <li v-show="!userInfo.username">
            <router-link class="nav-item" :to="`/login?rePath=${$route.path}&query=${JSON.stringify($route.query)}`">
              <span>请登录</span>
            </router-link>
          </li>
        </ul>
      </ul>
      <ul class="detail flex">
        <li v-show="!!userInfo.username">
          <div class="username-p">
            <div>
              <el-avatar class="person-icon" :src="userInfo.face" :size="24" />
              <span class="username">{{ $filters.secrecyMobile(
                  userInfo.nickName ? userInfo.nickName : userInfo.username ) }}</span>
            </div>
            <transition name='fade'>
              <!-- 下拉菜单通过父级 hover 的 CSS 控制显隐，transition 内无需 v-if/v-show -->
              <!-- eslint-disable-next-line vue/require-toggle-inside-transition -->
              <ul class="drop-items">
                <li @click="goUserCenter('/home')">我的主页</li>
                <li @click="goUserCenter('/home/Coupons')">优惠券</li>
                <li @click="goUserCenter('/home/Favorites')">我的收藏</li>
                <li @click="signOutFun">退出登录</li>
              </ul>
            </transition>
          </div>
        </li>
        <li @click="goUserCenter('/home/MyOrder')"><span class="nav-item">我的订单</span></li>
        <li @click="goUserCenter('/home/MyTracks')"><span class="nav-item">我的足迹</span></li>
        <li @click="goUserCenter('/home/MsgList')">
          <span class="nav-item">
            我的消息
            <i v-if="unreadMsg > 0" class="msg-badge">{{ unreadLabel }}</i>
          </span>
        </li>
        <li v-if="$route.name !== 'Cart'" class="cart-nav-item">
          <el-dropdown
            class="cart-nav-dropdown"
            placement="bottom-start"
            trigger="hover"
            @visible-change="handleCartDropdownVisible"
          >
            <span class="nav-item" @click="goToPay">
              <el-icon :size="18"><ShoppingCart /></el-icon>
              购物车（{{ Number(cartNum) > 99 ? '99+' : cartNum }}）
            </span>
            <template #dropdown>
              <div class="shopping-cart-null" v-show="shoppingCart.length <= 0">
                <el-icon class="cart-null-icon"><ShoppingCart /></el-icon>
                <span>你的购物车没有宝贝哦</span>
                <span>赶快去添加商品吧~</span>
              </div>
              <div class="shopping-cart-list" v-show="shoppingCart.length > 0">
                <div class="shopping-cart-box" v-for="(item, index) in shoppingCart" @click="goToPay" :key="index">
                  <div class="shopping-cart-img">
                    <img :src="item.goodsSku.thumbnail" alt="" />
                  </div>
                  <div class="shopping-cart-info">
                    <p class="goods-title">{{ item.goodsSku.goodsName }}</p>
                    <div class="shopping-cart-detail">
                      <span>数量 {{ item.num }}</span>
                      <span class="shopping-price">{{ $filters.unitPrice(item.purchasePrice, '￥') }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </template>
          </el-dropdown>
        </li>
        <li>
          <span class="nav-item" @click="shopEntry">店铺入驻</span>
        </li>

      </ul>
    </div>
  </div>
</template>

<script>
import { Modal } from "@/utils/message";
import { ShoppingCart } from '@element-plus/icons-vue';
import storage from '@/plugins/storage.js';
import {cartGoodsAll} from '@/api/cart.js';
import {logout} from '@/api/account.js';
import config from '@/config';
import { refreshUnreadMessage } from '@/utils/unreadMessage';

export default {
  components: { ShoppingCart },
  name: 'M-Header',
  created() {
    if (storage.getItem('userInfo')) {
      this.userInfo = JSON.parse(storage.getItem('userInfo'));
      refreshUnreadMessage();
    }
  },

  data() {
    return {
      config,
      userInfo: {}, // 用户信息
      shoppingCart: [], // 购物车
      cartLoading: false,
      cartLoadedAt: 0,
      cartCacheTime: 5000
    };
  },
  computed: {
    // 购物车商品数量
    cartNum() {
      return this.$store.state.cartNum;
    },
    unreadMsg() {
      return Number(this.$store.state.unreadMsg) || 0;
    },
    unreadLabel() {
      return this.unreadMsg > 99 ? '99+' : String(this.unreadMsg);
    }
  },
  methods: {
    goToPay() {
      if (!this.userInfo.username) {
        Modal.confirm({
          title: '温馨提示',
          content: '请登录后执行此操作',
          okText: '立即登录',
          cancelText: '取消',
          onOk: () => {
            this.$router.push({
              path: '/login',
              query: {
                rePath: '/cart',
                query: JSON.stringify(this.$route.query || {}),
              },
            });
          },
        });
        return;
      }
      this.$router.push('/cart');
    },
    myInfo() { // 跳转会员中心
      this.$router.push('/home');
    },
    signOutFun() { // 退出登录
      logout().then(res => {
        storage.removeItem('accessToken');
        storage.removeItem('refreshToken');
        storage.removeItem('userInfo');
        storage.removeItem('cartNum');
        this.$store.commit('SET_CARTNUM', 0)
        this.$store.commit('SET_UNREAD_MSG', 0)
        this.$router.push('/login');
      });
    },
    goUserCenter(path) {
      // 跳转我的订单，我的足迹、收藏等
      if (this.userInfo.username) {
        this.$router.push({path: path});
      } else {
        Modal.confirm({
          title: '请登录',
          content: '请登录后执行此操作',
          okText: '立即登录',
          cancelText: '继续浏览',
          onOk: () => {
            this.$router.push({
              path: '/login',
              query: {
                rePath: this.$route.path,
                query: JSON.stringify(this.$route.query || {}),
              },
            });
          }
        });
      }
    },
    shopEntry() {
      if (storage.getItem('accessToken')) {
        this.$router.push({
          path: '/shopEntry',
          query: { id: 1 },
        });
        return;
      }
      Modal.confirm({
        title: '温馨提示',
        content: '请登录后执行此操作',
        okText: '立即登录',
        cancelText: '取消',
        onOk: () => {
          this.$router.push({
            path: '/login',
            query: {
              rePath: '/shopEntry',
              query: JSON.stringify({ id: 1 }),
            },
          });
        },
      });
    },
    handleCartDropdownVisible(visible) {
      if (visible) {
        this.getCartList();
      }
    },
    getCartList() {
      // 获取购物车列表
      if (!this.userInfo.username || this.cartLoading) {
        return;
      }
      const now = Date.now();
      if (this.cartLoadedAt && now - this.cartLoadedAt < this.cartCacheTime) {
        return;
      }
      this.cartLoadedAt = now;
      this.cartLoading = true;
      cartGoodsAll().then((res) => {
        if (res.success) {
          this.shoppingCart = (res.result && res.result.skuList) || [];
          this.$store.commit('SET_CARTNUM', this.shoppingCart.length);
          this.Cookies.setItem('cartNum', this.shoppingCart.length);
        }
      }).finally(() => {
        this.cartLoading = false;
      });
    }
  }
};
</script>

<style scoped lang="scss">

.box {
  width: 100%;
  font-size: 14px;
  height: 40px;
  background: #333;
  color: #fff;
  display: flex;
  align-items: center;
}

.nav {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  height: 100%;
}

.nav > ul {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  align-items: center;
}

.nav > ul > li,
.location > ul.flex > li {
  cursor: pointer;
  float: none;
  line-height: 40px;
  margin-right: 15px;
  display: flex;
  align-items: center;
}

.nav a,
.nav-item {
  font-size: 14px;
  font-weight: normal;
  text-decoration: none;
  cursor: pointer;
  color: #fff;
  display: inline-flex;
  align-items: center;
  line-height: 1;
}

.nav-item {
  padding-left: 20px;
  gap: 4px;
}

.msg-badge {
  min-width: 16px;
  height: 16px;
  padding: 0 4px;
  border-radius: 8px;
  background: $theme_color;
  color: #fff;
  font-size: 12px;
  font-style: normal;
  line-height: 16px;
  text-align: center;
}

.cart-nav-item {
  :deep(.cart-nav-dropdown),
  :deep(.el-dropdown) {
    display: inline-flex;
    align-items: center;
    margin: 0;
    padding: 0;
    vertical-align: middle;
    line-height: 40px;
  }

  :deep(.el-tooltip__trigger),
  :deep(.el-dropdown-selfdefine),
  :deep([aria-expanded="true"]) {
    outline: none !important;
    border: none !important;
    box-shadow: none !important;
  }
}

.location a {
  border-left: none;
}


.icon {
  color: gray;
  vertical-align: middle;
}

.city {
  padding: 10px 15px;
}

.city-item {
  font-weight: bold;
  cursor: pointer;
  padding: 5px;
}

.city-item:hover {
  color: $theme_color;
}

.person-icon {
  color: $theme_color;
  background-color: #f0cdb2;
}


.shopping-cart-null {
  width: 320px;
  padding: 28px 16px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.cart-null-icon {
  font-size: 36px;
  margin-bottom: 12px;
  color: #ccc;
}

.shopping-cart-null span {
  font-size: 13px;
  line-height: 1.6;
  color: #999;
}

.shopping-cart-list {
  width: 320px;
  max-height: 320px;
  overflow-y: auto;
  padding: 4px 0;
  box-sizing: border-box;
  color: #333;
}

.shopping-cart-box {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px 16px;
  cursor: pointer;

  &:hover {
    background: #fafafa;
  }

  & + .shopping-cart-box {
    border-top: 1px solid #f2f2f2;
  }
}

.shopping-cart-img {
  width: 64px;
  height: 64px;
  flex-shrink: 0;
  border-radius: 6px;
  overflow: hidden;
  background: #f5f5f5;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
}

.shopping-cart-info {
  flex: 1;
  min-width: 0;
  min-height: 64px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.shopping-cart-info .goods-title {
  margin: 0;
  font-size: 13px;
  line-height: 1.4;
  color: #333;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
  white-space: normal;
}

.shopping-cart-detail {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 8px;
  color: #999;
  font-size: 14px;
}

.shopping-price {
  color: $theme_color;
  font-size: 14px;
  font-weight: 600;
}

.username-p {
  position: relative;
  z-index: 100;

  div {
    cursor: pointer;
    display: flex;
    align-items: center;

    > span {
      margin-left: 5px;
    }
  }

  .drop-items {
    position: absolute;
    display: none;
    flex-direction: column;
    top: calc(100% + 10px);
    left: 50%;
    transform: translateX(-50%);
    margin: 0;
    padding: 4px 0;
    z-index: 1000;
    min-width: 100px;
    width: max-content;
    background-color: #fff;
    border: 1px solid #eee;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
    list-style: none;

    li {
      display: block;
      float: none;
      width: 100%;
      margin: 0;
      padding: 8px 16px;
      line-height: 1.4;
      color: #666;
      font-size: 14px;
      font-weight: normal;
      text-align: center;
      white-space: nowrap;
      border-bottom: 1px solid #f0f0f0;
      box-sizing: border-box;

      &:last-child {
        border-bottom: none;
      }

      &:hover {
        cursor: pointer;
        color: $theme_color;
        background-color: #fff7f7;
      }
    }

    &::before {
      position: absolute;
      top: -6px;
      left: 50%;
      transform: translateX(-50%);
      content: '';
      width: 0;
      height: 0;
      border: 6px solid transparent;
      border-bottom-color: #fff;
    }

    &::after {
      content: '';
      position: absolute;
      width: 100%;
      height: 10px;
      top: -10px;
      left: 0;
    }
  }

  &:hover {
    .drop-items {
      display: flex;
    }
  }
}

.my-page {
  padding: 3px 5px;
  width: 180px;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.my-page a {
  margin: 0px;
  padding: 0px;
  border: none;
}

.my-info {
  padding: 5px;
  width: 50%;
  height: 100%;
  text-align: center;
  cursor: pointer;
}

.my-info:hover {
  box-shadow: 0px 0px 5px #ccc;
}

.my-info i {
  font-size: 28px;
}

.my-info p {
  font-size: 14px;
}

.sign-out {
  padding: 5px;
  width: 50%;
  height: 100%;
  text-align: center;
  cursor: pointer;
}

.sign-out:hover {
  box-shadow: 0px 0px 5px $border_color;
}

.sign-out i {
  font-size: 28px;
}

.sign-out p {
  font-size: 14px;
}

.goods-title:hover {
  color: $theme_color;
}

.cart-badge {
  position: absolute;
  right: -8px;
  font-style: normal;
  background-color: $theme_color;
  color: #fff;
  font-size: 12px;
  width: 17px;
  height: 17px;
  border-radius: 10px;
  line-height: 17px;
  text-align: center;
  z-index: 3;
  top: 3px;
}
</style>
