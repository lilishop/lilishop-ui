// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue';
import App from './App';
import router from './router';
import ViewUI from 'view-design';
import './assets/styles/theme.less';
import './assets/iconfont/iconfont.css';
import * as filters from './plugins/filters';
import store from '@/vuex/store'
import storage from '@/plugins/storage';
// 全局引入封装组件
import {InstallAll} from '@/components/global.js';

Vue.use(ViewUI);
Vue.use(InstallAll);
Vue.config.productionTip = false;

Object.keys(filters).forEach(key => {
  Vue.filter(key, filters[key]);
});

router.beforeEach((to, from, next) => {
  ViewUI.LoadingBar.start();
  window.document.title = to.meta.title === undefined ? 'lili shop' : to.meta.title
  next();
});

router.afterEach(route => {
  ViewUI.LoadingBar.finish();
});

Vue.prototype.linkTo = function (url) {
  if (url.substr(0, 1) === '/') { // 非外部链接，没有origin，只有路由地址
    window.open(location.origin + url, '_blank');
  } else { // 外部链接，完整的url地址
    window.open(url, '_blank')
  }
}
Vue.prototype.Cookies = storage
/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  store,
  components: { App },
  template: '<App/>'
});
