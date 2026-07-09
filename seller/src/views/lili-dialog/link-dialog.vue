<template>
  <div class="wrapper">
    <el-tabs v-model="activeTab" class="tabs">
      <el-tab-pane
        :label="item.title"
        :name="item.title"
        v-for="(item, i) in wap"
        :key="i"
      >
        <component
          ref="lili-component"
          :is="templateWay[item.name]"
          @selected="
            (val) => {
              changed = val;
            }
          "
        />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>
<script>
import wap from "./wap.js";
import goodsDialog from "./goods-dialog";
import templateWay from "./template/index";
export default {
  components: {
    goodsDialog,
  },
  setup() {
    return { templateWay };
  },
  data() {
    return {
      changed: "",
      selected: 0,
      selectedLink: "",
      wap,
      activeTab: wap[0]?.title || "",
    };
  },
  watch: {
    changed: {
      handler(val) {
        this.$emit("selectedLink", val[0]);
      },
      deep: true,
    },
  },
  mounted() {
    this.$nextTick(() => {
      if (this.$refs["lili-component"]?.[0]) {
        this.$refs["lili-component"][0].type = "single";
      }
    });
    this.wap.forEach((item) => {
      if (item) {
        item.selected = false;
      }
    });
  },
};
</script>
<style scoped lang="scss">
@import "./style.scss";
.wap-content-list {
  display: flex;
  flex-wrap: wrap;
}
.wap-flex {
  margin: 2px;
}
.tabs {
  width: 100%;
}
:deep(.el-tabs__content) {
  height: 500px;
  overflow: auto;
}
</style>
