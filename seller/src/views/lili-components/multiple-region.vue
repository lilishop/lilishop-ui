<template>
  <el-dialog
    v-model="switched"
    title="选择地址"
    width="600px"
    :close-on-click-modal="false"
    destroy-on-close
    @close="cancel"
  >
    <div v-loading="spinShow" class="flex">
      <el-tree
        ref="treeRef"
        class="tree"
        :data="data"
        :props="treeProps"
        node-key="id"
        show-checkbox
      />
    </div>
    <template #footer>
      <el-button @click="cancel">取消</el-button>
      <el-button type="primary" @click="submit">确定</el-button>
    </template>
  </el-dialog>
</template>
<script setup>
import { ref, reactive, nextTick, onMounted } from "vue";
import { getAllCity } from "@/api/index";
import { useAppStore } from "@/stores/app";

const emit = defineEmits(["selected"]);

const appStore = useAppStore();

const treeRef = ref(null);
const switched = ref(false);
const spinShow = ref(false);
const data = ref([]);
const selectedWay = ref([]);
const treeProps = reactive({
  label: "title",
  children: "children",
});

onMounted(() => {
  init();
});

function clear() {
  data.value = [];
  selectedWay.value = [];
  init();
}

function cancel() {
  switched.value = false;
  data.value.forEach((item) => {
    item.disabled = false;
    item.children.forEach((child) => {
      child.disabled = false;
    });
  });
}

function open(val, index) {
  if (val) {
    let checkedData = appStore.shipTemplates;
    let checkData = [];
    let disabledData = checkedData.filter((item, i) => {
      if (i != index) {
        return i != index;
      } else {
        checkData.push(item);
      }
    });
    checkData.forEach((check) => {
      check.areaId.split(",").forEach((ids) => {
        data.value.forEach((item) => {
          if (check.selectedAll) {
            check.area.split(",").forEach((area) => {
              if (area == item.name) {
                item.checked = true;
              }
            });
          }
          item.children.forEach((child) => {
            if (item.checked) {
              child.checked = true;
            }
            if (child.id == ids) {
              child.checked = true;
            }
          });
        });
      });
    });
    disabledData.forEach((dis) => {
      dis.areaId.split(",").forEach((ids) => {
        data.value.forEach((item) => {
          if (dis.selectedAll) {
            dis.area.split(",").forEach((area) => {
              if (area == item.name) {
                item.disabled = true;
              }
            });
          }
          item.children.forEach((child) => {
            if (item.disabled) {
              child.disabled = true;
            } else if (child.id == ids) {
              child.disabled = true;
            }
          });
        });
      });
    });
    syncTreeCheckedKeys();
  }
  switched.value = true;
}

function syncTreeCheckedKeys() {
  nextTick(() => {
    const keys = [];
    data.value.forEach((item) => {
      if (item.checked) {
        keys.push(item.id);
      }
      item.children.forEach((child) => {
        if (child.checked) {
          keys.push(child.id);
        }
      });
    });
    if (treeRef.value) {
      treeRef.value.setCheckedKeys(keys);
    }
  });
}

function submit() {
  const checkedNodes = treeRef.value.getCheckedNodes(false, true);
  const halfCheckedNodes = treeRef.value.getHalfCheckedNodes();
  let list = [...checkedNodes, ...halfCheckedNodes];

  let sort = [];
  list.forEach((item) => {
    item.selectedList = [];
    item.selectedAll = false;
    if (item.level == "province" && !item.disabled) {
      sort.push({ ...item });
    }
    sort.forEach((sortItem) => {
      if (item.level != "province" && sortItem.id == item.parentId && !item.disabled) {
        sortItem.selectedList.push({ ...item });
      }
    });
  });

  data.value.forEach((whether) => {
    sort.forEach((item) => {
      if (
        item.id == whether.id &&
        item.selectedList.length == whether.children.length
      ) {
        item.selectedList.forEach((child) => {
          child.selectedAll = true;
        });
        item.selectedAll = true;
      }
    });
  });

  emit("selected", sort);
  cancel();
}

function init() {
  spinShow.value = true;
  getAllCity()
    .then((res) => {
      if (res.result) {
        data.value = [];
        res.result.forEach((item) => {
          item.children.forEach((child) => {
            child.title = child.name;
          });
          data.value.push({
            title: item.name,
            ...item,
          });
          selectedWay.value.push({ name: item.name, id: item.id });
        });
        appStore.regions = data.value;
      }
    })
    .finally(() => {
      spinShow.value = false;
    });
}

defineExpose({ clear, open });
</script>
<style scoped lang="scss">
.flex {
  display: flex;
  position: relative;
  min-height: 400px;
}
.tree {
  flex: 1;
  width: 100%;
}
:deep(.el-dialog__body) {
  max-height: 450px;
  overflow: auto;
}
</style>
