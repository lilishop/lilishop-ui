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
        ref="tree"
        class="tree"
        :data="data"
        :props="treeProps"
        node-key="id"
        show-checkbox
        default-expand-all
      />
    </div>
    <template #footer>
      <el-button @click="cancel">取消</el-button>
      <el-button type="primary" @click="submit">确定</el-button>
    </template>
  </el-dialog>
</template>
<script>
import { getAllCity } from "@/api/index";
export default {
  data() {
    return {
      switched: false,
      spinShow: false,
      data: [],
      selectedWay: [],
      callBackData: "",
      treeProps: {
        label: "title",
        children: "children",
      },
    };
  },
  mounted() {
    this.init();
  },
  methods: {
    clear() {
      this.data = [];
      this.selectedWay = [];
      this.init();
    },
    cancel() {
      this.switched = false;
      this.data.forEach((item) => {
        item.disabled = false;
        item.children.forEach((child) => {
          child.disabled = false;
        });
      });
    },
    open(val, index) {
      if (val) {
        let checkedData = this.$store.state.shipTemplate;
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
            this.data.forEach((item) => {
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
            this.data.forEach((item) => {
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
        this.syncTreeCheckedKeys();
      }
      this.switched = true;
    },
    syncTreeCheckedKeys() {
      this.$nextTick(() => {
        const keys = [];
        this.data.forEach((item) => {
          if (item.checked) {
            keys.push(item.id);
          }
          item.children.forEach((child) => {
            if (child.checked) {
              keys.push(child.id);
            }
          });
        });
        if (this.$refs.tree) {
          this.$refs.tree.setCheckedKeys(keys);
        }
      });
    },
    submit() {
      const checkedNodes = this.$refs.tree.getCheckedNodes(false, true);
      const halfCheckedNodes = this.$refs.tree.getHalfCheckedNodes();
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

      this.data.forEach((whether) => {
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

      this.$emit("selected", sort);
      this.cancel();
    },
    init() {
      this.spinShow = true;
      getAllCity()
        .then((res) => {
          if (res.result) {
            this.data = [];
            res.result.forEach((item) => {
              item.children.forEach((child) => {
                child.title = child.name;
              });
              this.data.push({
                title: item.name,
                ...item,
              });
              this.selectedWay.push({ name: item.name, id: item.id });
            });
            this.$store.state.regions = this.data;
          }
        })
        .finally(() => {
          this.spinShow = false;
        });
    },
  },
};
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
