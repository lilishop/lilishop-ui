<template>
  <div>
    <Drawer width="300px" title="页面配置"  v-model="drawer">
      <!-- 内容 -->
      <h3>
        内容设置
      </h3>
      <div class="config-item flex flex-a-c flex-j-sb">
        <div>
          <Tooltip theme="light" placement="bottom-end" max-width="100" content="关闭之后部分页面点击'查看''详情'等按钮将跳到新页面展示" >
            <div>
              多标签Tab页内嵌模式
            </div>
          </Tooltip>
        </div>
        <i-switch v-model="setting.isUseTabsRouter"></i-switch>
      </div>
    </Drawer>
  </div>
</template>

<script>
import { mapState } from 'vuex'
export default {
  name: "configDrawer",
  data() {
    return {
      drawer: false,

    };
  },
  computed: {
    ...mapState({
      setting: state => {
        return state.setting.setting
      }
    })
  },
  watch: {
    setting: {
      handler(val) {
        this.setStore('setting', val)
        this.$store.commit('updateSetting', val);
      },
      deep: true
    }
  },
  mounted() {
  },
  methods: {
    open() {
      this.drawer = true
    },
    close() {
      this.drawer = false
    },
    toggle() {
      this.drawer != this.drawer
    },
  }
}
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
