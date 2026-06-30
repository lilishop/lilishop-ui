<template>
  <div class="scroll-show">
    <div class="content">
      <cateNav
        class="cate"
        :hover="true"
        :showNavBar="false"
        useClass="fixed-show"
      />
      <Search
        class="search-con"
        :hover="true"
        ref="search"
        :showLogo="false"
        :showTag="false"
        useClass="fixed-show"
      />
      <div class="cart">
        <span @mouseenter="getCartList">
          <el-icon class="cart-icon" :size="20" @click="goCartList"><ShoppingCart /></el-icon>
        </span>
        <i class="cart-badge">{{ cartNum < 100 ? cartNum : "99" }}</i>
      </div>
    </div>
  </div>
</template>
<script>
import Search from '@/components/Search.vue'
import cateNav from '@/components/nav/CateNav.vue'
import { cartCount } from '@/api/cart.js'
import storage from '@/plugins/storage.js'
import { ShoppingCart } from '@element-plus/icons-vue'

export default {
  components: { ShoppingCart, Search, cateNav },
  data() {
    return {
      userInfo: {}
    }
  },
  computed: {
    cartNum() {
      return this.$store.state.cartNum
    }
  },
  methods: {
    goCartList() {
      const routerUrl = this.$router.resolve({ path: '/cart' })
      window.open(routerUrl.href, '_blank')
    },
    getCartList() {
      if (storage.getItem('userInfo')) {
        cartCount().then((res) => {
          this.$store.commit('SET_CARTNUM', res.result)
          this.Cookies.setItem('cartNum', res.result)
        })
      }
    }
  },
  mounted() {
    if (storage.getItem('userInfo')) {
      this.userInfo = JSON.parse(storage.getItem('userInfo'))
    }
  }
}
</script>
<style lang="scss" scoped>
$side-col-width: 263.2px;
$col-gap: 10px;
$cart-col-width: 40px;

.scroll-show {
  height: 60px;
  overflow: hidden;
}

.content {
  width: 1200px;
  height: 60px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: $side-col-width 1fr $cart-col-width;
  column-gap: $col-gap;
  align-items: center;
}

.cate {
  min-width: 0;

  :deep(.cate-nav) {
    width: 100%;
    margin: 0;
  }

  :deep(.nav-con) {
    height: 60px;
  }
}

.search-con {
  min-width: 0;
  width: 100%;
}

.cart {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 60px;
  position: relative;
}

.cart-icon {
  font-size: 25px;
  color: $theme_color;
  cursor: pointer;
}

.cart-badge {
  position: absolute;
  font-style: normal;
  top: 12px;
  right: -2px;
  display: block;
  background-color: $theme_color;
  color: #fff;
  font-size: 12px;
  width: 17px;
  height: 17px;
  border-radius: 10px;
  line-height: 17px;
  text-align: center;
  z-index: 5;
}
</style>
