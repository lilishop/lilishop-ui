<template>
  <div>
    <el-cascader
      v-model="addr"
      :options="data"
      :props="cascaderProps"
      placeholder="请选择地址"
      style="width: 350px"
      @change="change"
    />
  </div>
</template>
<script>
import { getChildRegion } from "@/api/common.js";

export default {
  props: ["addressId"],
  data() {
    return {
      data: [],
      addr: [],
    };
  },
  computed: {
    cascaderProps() {
      return {
        value: "value",
        label: "label",
        lazy: true,
        lazyLoad: this.loadData,
      };
    },
  },
  methods: {
    change(val) {
      if (!val || !val.length) {
        this.$emit("selected", [[], []]);
        return;
      }
      const labels = this.resolveLabels(val);
      this.$emit("selected", [val, labels]);
    },
    resolveLabels(values) {
      const labels = [];
      let options = this.data;
      for (const v of values) {
        const node = options.find((item) => item.value === v);
        if (!node) break;
        labels.push(node.label);
        options = node.children || [];
      }
      return labels;
    },
    loadData(node, resolve) {
      const parentId = node.level === 0 ? 0 : node.value;
      getChildRegion(parentId).then((res) => {
        if (!res.result || res.result.length <= 0) {
          resolve([]);
          return;
        }
        const nodes = res.result.map((child) => {
          const isLeaf =
            child.level === "street" ||
            node.label === "香港特别行政区" ||
            child.name === "台湾省";
          return {
            value: child.id,
            label: child.name,
            leaf: isLeaf,
          };
        });
        resolve(nodes);
      });
    },
    async init() {
      const data = await getChildRegion(0);
      this.data = data.result.map((item) => ({
        value: item.id,
        label: item.name,
        leaf: item.name === "台湾省",
      }));
    },
    async reviewData() {
      const addr = JSON.parse(JSON.stringify(this.addressId.split(",")));
      const length = addr.length;
      const root = await getChildRegion(0);
      const arr0 = root.result.map((item) => ({
        value: item.id,
        label: item.name,
        leaf: item.name === "台湾省",
        children: [],
      }));

      if (length > 0) {
        const children = await getChildRegion(addr[0]);
        const arr1 = this.handleData(children.result);
        arr0.forEach((e) => {
          if (e.value === addr[0]) {
            e.children = arr1;
          }
        });
      }
      if (length > 1) {
        let arr1 = arr0.find((e) => e.value === addr[0])?.children || [];
        const children = await getChildRegion(addr[1]);
        const arr2 = this.handleData(children.result);
        arr1.forEach((e) => {
          if (e.value === addr[1]) {
            e.children = arr2;
          }
        });
      }
      if (length > 2) {
        const arr1 = arr0.find((e) => e.value === addr[0])?.children || [];
        const arr2 = arr1.find((e) => e.value === addr[1])?.children || [];
        const children = await getChildRegion(addr[2]);
        const arr3 = this.handleData(children.result);
        arr2.forEach((e) => {
          if (e.value === addr[2]) {
            e.children = arr3;
          }
        });
      }
      this.data = arr0;
      this.addr = addr;
    },
    handleData(data) {
      return data.map((child) => ({
        value: child.id,
        label: child.name,
        leaf: child.level === "street",
        children: child.level === "street" ? undefined : [],
      }));
    },
  },
  watch: {
    addressId: {
      handler(v) {
        if (v) {
          this.reviewData();
        } else {
          this.init();
        }
      },
      immediate: true,
    },
  },
};
</script>
