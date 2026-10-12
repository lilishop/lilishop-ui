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
<script setup>
import { computed, ref, watch } from "vue";
import { getChildRegion } from "@/api/common.js";

const props = defineProps(["addressId"]);
const emit = defineEmits(["selected"]);

const data = ref([]);
const addr = ref([]);

const cascaderProps = computed(() => {
  return {
    value: "value",
    label: "label",
    lazy: true,
    lazyLoad: loadData,
  };
});

function change(val) {
  if (!val || !val.length) {
    emit("selected", [[], []]);
    return;
  }
  const labels = resolveLabels(val);
  emit("selected", [val, labels]);
}

function resolveLabels(values) {
  const labels = [];
  let options = data.value;
  for (const v of values) {
    const node = options.find((item) => item.value === v);
    if (!node) break;
    labels.push(node.label);
    options = node.children || [];
  }
  return labels;
}

function loadData(node, resolve) {
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
}

async function init() {
  const res = await getChildRegion(0);
  data.value = res.result.map((item) => ({
    value: item.id,
    label: item.name,
    leaf: item.name === "台湾省",
  }));
}

async function reviewData() {
  const addrArr = JSON.parse(JSON.stringify(props.addressId.split(",")));
  const length = addrArr.length;
  const root = await getChildRegion(0);
  const arr0 = root.result.map((item) => ({
    value: item.id,
    label: item.name,
    leaf: item.name === "台湾省",
    children: [],
  }));

  if (length > 0) {
    const children = await getChildRegion(addrArr[0]);
    const arr1 = handleData(children.result);
    arr0.forEach((e) => {
      if (e.value === addrArr[0]) {
        e.children = arr1;
      }
    });
  }
  if (length > 1) {
    let arr1 = arr0.find((e) => e.value === addrArr[0])?.children || [];
    const children = await getChildRegion(addrArr[1]);
    const arr2 = handleData(children.result);
    arr1.forEach((e) => {
      if (e.value === addrArr[1]) {
        e.children = arr2;
      }
    });
  }
  if (length > 2) {
    const arr1 = arr0.find((e) => e.value === addrArr[0])?.children || [];
    const arr2 = arr1.find((e) => e.value === addrArr[1])?.children || [];
    const children = await getChildRegion(addrArr[2]);
    const arr3 = handleData(children.result);
    arr2.forEach((e) => {
      if (e.value === addrArr[2]) {
        e.children = arr3;
      }
    });
  }
  data.value = arr0;
  addr.value = addrArr;
}

function handleData(list) {
  return list.map((child) => ({
    value: child.id,
    label: child.name,
    leaf: child.level === "street",
    children: child.level === "street" ? undefined : [],
  }));
}

watch(
  () => props.addressId,
  (v) => {
    if (v) {
      reviewData();
    } else {
      init();
    }
  },
  { immediate: true }
);
</script>
