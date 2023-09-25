<template>
  <Tabs value="name1">
    <TabPane label="平台菜单" name="name1">
      <managerMenu></managerMenu>

    </TabPane>
    <TabPane label="店铺菜单" name="name2">
      <storeMenu></storeMenu>

    </TabPane>
  </Tabs>
</template>
<script>

import managerMenu from "./menu";
import storeMenu from "./storeMenu";

export default {
  components: {
    managerMenu, storeMenu
  },

}
</script>
