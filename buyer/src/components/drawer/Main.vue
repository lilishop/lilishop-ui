<template>
  <div>
    <div class="wrapper" :style="{right:handleDrawer ? '300px' : '0px'}">

      <div class="barItem" @mouseenter="showCartNum(item)" @click="clickBar(item)" v-for="(item,index) in resetConfig.menuList" :key="index">
        <el-tooltip placement="left" :content="item.title">
          <el-icon :size="20"><component :is="resolveIcon(item.icon)" /></el-icon>
          <p class="barTitle" v-if="item.titleShow"> {{item.title}}</p>
          <div class="circle" v-if="item.title === '购物车'">
            {{ Number(cartNum) > 99 ? '99+' : cartNum }}
          </div>
        </el-tooltip>
      </div>

    </div>
    <el-drawer width="300" class="popup" :title="drawerData.title" :modal="resetConfig.mask" :show-close="resetConfig.closable"
      v-model="handleDrawer">
      <drawerPage :title="drawerData.title" />
    </el-drawer>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Modal } from "@/utils/message";
import storage from '@/plugins/storage.js';
import Configuration from './config';
import drawerPage from './Drawer'
import {cartCount} from '@/api/cart.js'
import { resolveIcon } from '@/utils/iconMap'
import { useAppStore } from '@/stores/app'

defineOptions({ name: 'Main' })

const route = useRoute()
const router = useRouter()
const appStore = useAppStore()

const resetConfig = ref(Configuration) // 菜单项
const handleDrawer = ref(false) // 是否可展开
const drawerData = ref('') // 菜单基础数据

// 用户信息
const userInfo = computed(() => {
  return storage.getItem('userInfo');
})

// 购物车商品数量
const cartNum = computed(() => appStore.cartNum)

function showCartNum (item) { // 获取购物车数量
  if (userInfo.value && item.title === '购物车') {
    getCartList()
  }
}

function clickBar (val) { // tabbar点击操作
  if (!userInfo.value) {
    Modal.confirm({
      title: '请登录',
      content: '请登录后执行此操作',
      okText: '立即登录',
      cancelText: '继续浏览',
      onOk: () => {
        router.push({
          path: '/login',
          query: {
            rePath: route.path,
            query: JSON.stringify(route.query || {}),
          },
        });
      }
    });
  } else {
    if (val.display) {
      handleDrawer.value = true
      drawerData.value = val
    } else {
      handleDrawer.value = false
      switch (val.title) {
        case '会员中心':
          router.push('/home')
          break;
        case '我的资产':
          router.push('/home/MoneyManagement')
          break;
      }
    }
  }
}

function getCartList () { // 获取购物车列表
  cartCount().then(res => {
    appStore.setCartNum(res.result)
    storage.setItem('cartNum', res.result)
  })
}
</script>

<style scoped lang="scss">
  .wrapper {
    background-color: #000!important;
  }
  .barItem {
    text-align: center;
    padding: 13px 0;

    cursor: pointer;
    color: #fff;
    &:hover{
      background-color: $theme_color;
      .circle{
        color: $theme_color;
        background-color: #fff;
      }
    }
  }

  .barTitle {
    writing-mode: vertical-lr;
    letter-spacing: 2px;
    padding: 4px 0;

  }

  .circle {
    min-width: 20px;
    height: 20px;
    padding: 0 4px;
    border-radius: 10px;
    color: #fff;
    background: $theme_color;
    font-size: 12px;
    line-height: 20px;
    box-sizing: border-box;
  }

  .wrapper {
    width: 40px;
    position: fixed;
    transition: .35s;
    height: 100%;
    z-index: 9999;
    background: $dark_background_color;
    top: 0;
    display: flex;
    justify-content: center;
    flex-direction: column;
  }
  :deep(.popup .el-drawer__body) {
    padding: 0 !important;
    background-color: #eee;
  }
  :deep(.popup) {
    z-index: 3001;
  }
</style>
