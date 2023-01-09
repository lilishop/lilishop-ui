<template>
  <div id="app">
    <router-view v-if="showView" />
  </div>
</template>
<script>
export default {
  name: 'App',
  data () {
    return {
      // 用于点击当前页的router时，刷新当前页
      showView: true,
      beforeUnload: '',
      Handler: ''
    }
  },
  methods: {
    // 刷新当前路由方法
    refreshView () {
      this.showView = false
      this.$nextTick(() => (this.showView = true))
    },
    beforeunloadHandler () {
      this.beforeUnload = new Date().getTime();
    },
    // 页面关闭后 重置btnHide
    unloadHandler (e) {
      this.Handler = new Date().getTime() - this.beforeUnload;
      if (this.Handler <= 5) {
        var storage = window.localStorage;
        storage.clear()
        localStorage.setItem('btnHide', 1)
      }
    },
  },

  mounted () {
    window.addEventListener('beforeunload', e => this.beforeunloadHandler(e))
    window.addEventListener('unload', e => this.unloadHandler(e))
  },
  destroyed () {
    window.removeEventListener('beforeunload', e => this.beforeunloadHandler(e))
    window.removeEventListener('unload', e => this.unloadHandler(e))
  },

}
</script>
