<template>
  <div>
    <el-drawer v-model="drawer" title="页面配置" size="300px">
      <h3>内容设置</h3>
      <div class="config-item flex flex-a-c flex-j-sb">
        <div>
          <el-tooltip
            placement="bottom-end"
            content="关闭之后部分页面点击'查看''详情'等按钮将跳到新页面展示"
          >
            <div>多标签Tab页内嵌模式</div>
          </el-tooltip>
        </div>
        <el-switch v-model="setting.isUseTabsRouter" />
      </div>
    </el-drawer>
  </div>
</template>

<script>
import { mapState } from "vuex";

export default {
  name: "configDrawer",
  data() {
    return {
      drawer: false,
    };
  },
  computed: {
    ...mapState({
      setting: (state) => state.setting.setting,
    }),
  },
  watch: {
    setting: {
      handler(val) {
        this.setStore("setting", val);
        this.$store.commit("updateSetting", val);
      },
      deep: true,
    },
  },
  methods: {
    open() {
      this.drawer = true;
    },
    close() {
      this.drawer = false;
    },
  },
};
</script>

<style lang="scss" scoped>
* {
  color: #333 !important;
}

h3 {
  margin: 10px 0 20px 0;
}

.config-item {
  cursor: pointer;
  margin-bottom: 20px;
  justify-content: space-between;
}
</style>
