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

<script setup>
import { computed, ref, watch } from "vue";
import { useSettingStore } from "@/stores/setting";
import { setStore } from "@/libs/storage";

defineOptions({ name: "configDrawer" });

const settingStore = useSettingStore();

const drawer = ref(false);

const setting = computed(() => settingStore.setting);

watch(
  setting,
  (val) => {
    setStore("setting", val);
    settingStore.updateSetting(val);
  },
  { deep: true }
);

function open() {
  drawer.value = true;
}

function close() {
  drawer.value = false;
}

defineExpose({ open, close });
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
