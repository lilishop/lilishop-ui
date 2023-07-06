import Vue from 'vue';
import Vuex from 'vuex';

import app from './modules/app';
import setting from './modules/setting';
import user from './modules/user';
import dict from './modules/dict';

Vue.use(Vuex);

const store = new Vuex.Store({
    state: {
        // 状态

    },
    mutations: {
        // 改变方法
    },
    actions: {

    },
    modules: {
        app,
        user,
        setting,
        dict
    }
});

export default store;
