import Vue from 'vue';
import Vuex from 'vuex';
import * as actions from './actions';
import * as mutations from './mutations';
import * as getters from './getters';
import storage from '@/plugins/storage.js'

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    category: [], // 全部分类
    navList: [],
    cartNum: storage.getItem('cartNum') || 0
  },
  getters,
  actions,
  mutations
});
