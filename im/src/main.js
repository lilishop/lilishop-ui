import 'core-js/stable'
import 'regenerator-runtime/runtime'

import Vue from 'vue'
import App from '@/App'
import store from '@/store'
import router from '@/router'
import MainMixin from './mixins/main-mixin'
import face from '@/components/face'
import faceNull from '@/components/face-null'
import config from "@/config/config";
import './core/lazy-use'
import './core/global-component'
import './core/filter'
import './core/directives'
import '@/permission'
import '@/icons'
import * as filters from "./plugins/filters";
Object.keys(filters).forEach((key) => {
  Vue.filter(key, filters[key]);
});

// 引入自定义全局css
import '@/assets/css/global.less'

Vue.config.productionTip = false
Vue.mixin(MainMixin)  // 引入mixins
Vue.component('face', face)
Vue.component('face-null', faceNull)

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
