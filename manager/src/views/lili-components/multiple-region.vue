<template>
  <Modal :mask-closable="false" :value="switched" v-model="switched" title="选择地址" @on-ok="submit" @on-cancel="cancel">
    <div class="flex">
      <Spin size="large" fix v-if="spinShow"></Spin>
      <Tree ref="tree" class="tree" :data="data" expand-node show-checkbox multiple></Tree>
    </div>
  </Modal>
</template>
<script>
import { getAllCity } from "@/api/index";
export default {
  data() {
    return {
      switched: false,
      asyncLoading: false,
      num: 10,
      modalFlag: false,
      spinShow: false,
      timerNum: 10,
      data: [],
      id: 0,
      selectedWay: [],
      addValidate: {
        parentName: "无父级",
      },
      ruleValidate: {
        adCode: [
          {
            required: true,
            message: "区域编码不能为空",
            trigger: "blur",
          },
        ],

        center: [
          {
            required: true,
            message: "经纬度不能为空",
            trigger: "blur",
          },
        ],
        name: [
          {
            required: true,
            message: "名称不能为空",
            trigger: "blur",
          },
        ],
      },
      callBackData: "",
    };
  },
  mounted() {
    this.init();
  },
  methods: {
    cancel() {
      this.switched = false;
      // this.$emit("close",true)
    },
    open(val) {
      if (val) {
        this.callBackData = val;
        this.data = JSON.parse(JSON.stringify(this.data));
        val.areaId.split(",").forEach((ids) => {
          this.data.forEach((item) => {
            if (item.id == ids) {
              item.selected = true;

            }
            item.children &&
              item.children.forEach((child) => {
                if (child.id == ids) {
                  child.checked = true;
                }
              });
          });
        });

        console.log(this.data);
      }

      this.switched = true;
    },

    submit() {
      // 筛选出省市
      let list = this.$refs.tree.getCheckedAndIndeterminateNodes();
      let sort = [];
      list.forEach((item) => {
        item.selectedList = [];
        if (item.level == "province") {
          sort.push({
            ...item,
          });
        }
        sort.forEach((sortItem, sortIndex) => {
          if (item.level != "province" && sortItem.id == item.parentId) {
            sortItem.selectedList.push({
              ...item,
            });
          }
        });
      });

      this.$emit(
        "selected",
        list.filter((item) => {
          return item.level == "province";
        })
      );

      this.cancel();
    },

    init() {
      getAllCity().then((res) => {
        if (res.result) {
          res.result.forEach((item) => {
            item.children.forEach((child) => {
              child.title = child.name;
            });

            let data = {
              title: item.name,

              ...item,
            };
            this.data.push(data);
            this.selectedWay.push({ name: data.title, id: data.id });
          });
        }
      });
    },
  },
};
</script>
<style scoped lang="scss">
.flex {
  display: flex;
  position: relative;
}
.tree {
  flex: 2;
}
.form {
  flex: 8;
}
.button-list {
  margin-left: 80px;
  > * {
    margin: 0 4px;
  }
}
/deep/ .ivu-modal-body {
  height: 400px !important;
  overflow: auto;
}
</style>
