import 'core-js/stable'
import 'regenerator-runtime/runtime'

// 引入 Vue 和应用程序组件
import Vue from 'vue'
import App from '@/App'

// 引入 store 和 router
import store from '@/store'
import router from '@/router'

// 引入自定义的 mixin
import MainMixin from './mixins/main-mixin'

// 引入全局组件
import face from '@/components/face'
import faceNull from '@/components/face-null'

// 引入配置文件和其他核心模块
import config from "@/config/config";
import './core/lazy-use'
import './core/global-component'
import './core/filter'
import './core/directives'

// 引入权限控制和图标库
import '@/permission'
import '@/icons'

// 引入自定义过滤器，并注册为全局过滤器
import * as filters from "./plugins/filters";
Object.keys(filters).forEach((key) => {
  Vue.filter(key, filters[key]);
});

// 引入自定义全局css
import '@/assets/css/global.less'

// 关闭生产提示
Vue.config.productionTip = false

// 注册全局 mixin
Vue.mixin(MainMixin) 
Vue.component('face', face)
Vue.component('face-null', faceNull)


// 添加自定义原型方法
Vue.prototype.linkToGoods = function (goodsId, skuId) {  // 跳转买家端商品
  if (localStorage.getItem('storeFlag') == 'false') {
    window.open(`${config.PC_URL}goodsDetail?skuId=${skuId}&goodsId=${goodsId}`, '_blank')
  } else {
    window.open(`${config.PC_URL}goodsDetail?skuId=${skuId}&goodsId=${goodsId}`, '_blank')
  }
};
Vue.prototype.linkToStore = function (storeId) {  // 跳转商家端商品
  console.log(`${config.PC_URL}/Merchant?id=${storeId}`)
  window.open(`${config.PC_URL}/Merchant?id=${storeId}`, '_blank')
};
// 订单跳转商家订单页面
Vue.prototype.linkToOrders = function (sn) {
  if (localStorage.getItem('storeFlag') == 'false') {
    // 商家
    window.open(`${config.PC_STORE}order-detail?sn=${sn}`, '_blank')
  } else {
    // 用户
    window.open(`${config.PC_URL}home/OrderDetail?sn=${sn}`, '_blank')
  }
};

const Instance = new Vue({
  router,
  store,
  mixins: [MainMixin],
  render: h => h(App),
}).$mount('#app')
export default Instance
