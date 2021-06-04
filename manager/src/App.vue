<template>
  <div id="main" class="app-main">
    <router-view></router-view>
  </div>
</template>

<script>
import {v4 as uuidv4} from 'uuid';
import {getCategoryTree} from '@/api/goods.js'
export default {
  updated() {
    if (!localStorage.getItem('category') && this.$route.path !== '/login') {
      getCategoryTree(0).then(res => {
        if (res.success) {
          localStorage.setItem('category', JSON.stringify(res.result))
        }
      })
    }
  },
  mounted() {
    let uuid = this.getStore('uuid');
    if (!uuid) {
      uuid = uuidv4();
      this.setStore('uuid', uuid);
    }
  },
};
</script>

<style>
html,
body {
  width: 100%;
  height: 100%;
  background: #f0f0f0;
  font-size: 12px;
  /* overflow: hidden; */
}

.app-main {
  width: 100%;
  height: 100%;
}

.br button {
  margin-right: 5px;
}

.operation button {
  margin-right: 5px;
}

.ivu-btn-text:focus {
  box-shadow: none !important;
}

.ivu-tag {
  cursor: pointer;
}
</style>
