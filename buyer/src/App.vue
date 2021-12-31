<template>
  <div id="app">
    <router-view/>
  </div>
</template>

<script>

export default {
  name: 'App',

};
</script>
<style lang="scss">
#app{
  @include background_color($light_background_color);
}
</style>
