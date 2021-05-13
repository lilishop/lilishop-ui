
<template>
  <Menu
    ref="sideMenu"
    :active-name="$route.name"
    :open-names="singleOpenName"
    theme="light"
    width="110px"
    @on-select="changeMenu"
  >
    <template v-for="item in menuList">
      <MenuItem :name="item.name" :key="item.name">
        {{item.title}}
      </MenuItem>
    </template>
  </Menu>
</template>

<script>
export default {
  name: "sidebarMenu",
  data() {
    return {
      singleOpenName: []
    };
  },
  props: {
    menuList: {
      type:Array,
      default:[]
    },
    openNames: {
      type: Array
    }
  },
  methods: {

  },

};
</script>
<style lang="scss" scoped>
@import "../styles/menu.scss";
</style>
