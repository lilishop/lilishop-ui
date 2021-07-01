<template>
  <div id="app">
    <router-view/>
  </div>
</template>

<script>
import {v4 as uuidv4} from 'uuid';
import storage from '@/plugins/storage';
import {getLogo} from '@/api/common.js';
export default {
  name: 'App',
  mounted () {
    let uuid = storage.getItem('uuid');
    if (!uuid) {
      uuid = uuidv4();
      storage.setItem('uuid', uuid);
    }
    if (!this.Cookies.getItem('logo')) {
      setTimeout(() => {
        getLogo().then(res => {
          if (res.success) {
            let logoObj = JSON.parse(res.result.settingValue)
            this.Cookies.setItem('logo', logoObj.buyerSideLogo)
          }
        })
      }, 1000)
    }
  }
};
</script>
<style lang="scss">
#app{
  @include background_color($light_background_color);
}
</style>
