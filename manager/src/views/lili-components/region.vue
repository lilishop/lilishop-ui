<template>
  <div>
    <Cascader
      :data="data"
      :load-data="loadData"
      change-on-select
      @on-visible-change="handleChangeOnSelect"
      @on-change="change"
    ></Cascader>
  </div>
</template>
<script>

import * as API_Setup from "@/api/index.js";
export default {
  data() {
    return {
      data: [], // 地区数据
      selected: [], // 已选地区
      id: 0, // 默认id
      changeOnSelect: false, // 选择时变动
    };
  },
  mounted() {
    this.init();
  },

  props: ['addressId'],
  methods: {
    change(val, selectedData) {
      /**
       * @returns [regionId,region]
       */
      this.$emit("selected", [
        val,
        selectedData[selectedData.length - 1].__label.split("/"),
      ]);
    },
    /**
     * 动态设置change-on-select的值
     * 当级联选择器弹窗展开时，设置change-on-select为true，即可以点选菜单选项值发生变化
     * 当级联选择器弹窗关闭时，设置change-on-select为false，即能够设置初始值
     */
    handleChangeOnSelect(value) {
      this.changeOnSelect = value;
    },
    loadData(item, callback) {
      item.loading = true;
      API_Setup.getRegion(item.value).then((res) => {
        if (res.result.length <= 0) {
          item.loading = false;
          this.selected = item;

          /**
           * 处理数据并返回
           */
        } else {
          res.result.forEach((child) => {
            item.loading = false;

            let data = {
              value: child.id,
              label: child.name,
              loading: false,
              children: [],
            };

            if (
              child.level == "street" ||
              item.label == "香港特别行政区" ||
              item.label == "澳门特别行政区"
            ) {
              item.children.push({
                value: child.id,
                label: child.name,
              });
            } else {
              item.children.push(data);
            }
          });
          this.selected = item;
          callback();
        }
      });
    },
    init() {
      API_Setup.getRegion(this.id).then((res) => {
        let way = [];

        res.result.forEach((item) => {
          let data;
          // 台湾省做处理
          if (item.name == "台湾省") {
            data = {
              value: item.id,
              label: item.name,
            };
          } else {
            data = {
              value: item.id,
              label: item.name,
              loading: false,
              children: [],
            };
          }
          way.push(data);
        });

        this.data = way;
      });
    },
  },
};
</script>
<style scoped lang="scss">
</style>
