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
              <ul class="drop-items">
                <li @click="goUserCenter('/home/MyOrder')">我的主页</li>
                <li @click="goUserCenter('/home/Coupons')">优惠券</li>
                <li @click="goUserCenter('/home/Favorites')">我的收藏</li>
                <li @click="signOutFun">退出登录</li>
              </ul>
            </transition>
          </div>
        </li>
        <li @click="goUserCenter('/home/MyOrder')"><span class="nav-item">我的订单</span></li>
        <li @click="goUserCenter('/home/MyTracks')"><span class="nav-item">我的足迹</span></li>
        <li @click="goUserCenter('/home/MsgList')"><span class="nav-item">我的消息</span></li>
        <li v-if="$route.name !== 'Cart'" class="cart-nav-item">
          <el-dropdown
            class="cart-nav-dropdown"
            placement="bottom-start"
            trigger="hover"
            @visible-change="handleCartDropdownVisible"
          >
            <span class="nav-item" @click="goToPay">
              <el-icon :size="18"><ShoppingCart /></el-icon>
              购物车（{{ cartNum < 100 ? cartNum : '99' }}）
            </span>
            <template #dropdown>
              <div class="shopping-cart-null" style="width:200px" v-show="shoppingCart.length <= 0">
                <el-icon class="cart-null-icon"><ShoppingCart /></el-icon>
                <span>你的购物车没有宝贝哦</span>
                <span>赶快去添加商品吧~</span>
              </div>
              <div class="shopping-cart-list" v-show="shoppingCart.length > 0">
                <div class="shopping-cart-box" v-for="(item, index) in shoppingCart" @click="goToPay" :key="index">
                  <div class="shopping-cart-img">
                    <img :src="item.goodsSku.thumbnail" class="hover-pointer"/>
                  </div>
                  <div class="shopping-cart-info">
                    <div class="shopping-cart-title ">
                      <p class="hover-pointer goods-title ellipsis">{{ item.goodsSku.goodsName }}</p>
                    </div>
                    <div class="shopping-cart-detail">
                      <div>
                        数量:
                        <span class="shopping-cart-text">{{ item.num }}</span>
                      </div>
                      <div class="shopping-price">
                        {{ $filters.unitPrice(item.purchasePrice, '￥') }}
                      </div>
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

export default {
  components: { ShoppingCart },
  name: 'M-Header',
  created() {
    if (storage.getItem('userInfo')) {
      this.userInfo = JSON.parse(storage.getItem('userInfo'));
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
      const url = this.$router.resolve({
        path: '/cart',
      });
      window.open(url.href, '_blank');
    },
    myInfo() { // 跳转会员中心
      let url = this.$router.resolve({
        path: '/home/MyOrder'
      });
      window.open(url.href, '_blank');
    },
    signOutFun() { // 退出登录
      logout().then(res => {
        storage.removeItem('accessToken');
        storage.removeItem('refreshToken');
        storage.removeItem('userInfo');
        storage.removeItem('cartNum');
        this.$store.commit('SET_CARTNUM', 0)
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
                rePath: this.$router.history.current.path,
                query: JSON.stringify(this.$router.history.current.query)
              }
            });
          }
        });
      }
    },
    shopEntry() {
      if (storage.getItem('accessToken')) {
        const routeUrl = this.$router.resolve({
          path: '/shopEntry',
          query: { id: 1 },
        });
        window.open(routeUrl.href, '_blank');
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
  font-size: 12px !important;
  height: 36px;
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
  line-height: 36px;
  margin-right: 15px;
  display: flex;
  align-items: center;
}

.nav a,
.nav-item {
  font-size: 13px;
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

.cart-nav-item {
  :deep(.cart-nav-dropdown),
  :deep(.el-dropdown) {
    display: inline-flex;
    align-items: center;
    margin: 0;
    padding: 0;
    vertical-align: middle;
    line-height: 36px;
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


.shopping-cart-img {
  margin-right: 15px;
  width: 40px;
  height: 40px;
}

.shopping-cart-img img {
  width: 100%;
}

.shopping-cart-info {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-content: space-between;
  width: 200px;
  overflow: hidden;
  font-size: 12px;
  line-height: 20px;
}


.shopping-cart-null {
  padding: 15px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.cart-null-icon {
  font-size: 38px;
  margin-bottom: 15px;
}

.shopping-cart-null span {
  font-size: 12px;
  line-height: 16px;
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
      font-size: 13px;
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
  font-size: 12px;
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
  font-size: 12px;
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

.shopping-cart-box {
  padding: 8px 0;
  cursor: pointer;
  display: flex;
  align-items: center;
  border-bottom: 1px #ccc dotted;
}

.shopping-cart-list {
  padding: 10px 10px;
  box-sizing: border-box;
  max-height: 300px;
  overflow-y: scroll;
  color: #333;

}

.shopping-cart-detail {
  color: #999;
  font-size: 12px;

}

.shopping-price {
  color: $theme_color;
  font-size: 14px;
  font-weight: bold;
}

</style>
