<template>
  <div>
    <el-cascader
      :data="data"
      :load-data="loadData"
      v-model="addr"
      @change="change"
      style="width: 300px"
    ></el-cascader>
  </div>
</template>
<script setup>
import { ref, watch } from 'vue';
import { getRegion } from '@/api/common.js';

const props = defineProps(['addressId']);
const emit = defineEmits(['selected']);

const data = ref([]); // 地区数据
const addr = ref([]); // 已选数据

function change (val, selectedData) { // 选择地区
  /**
   * @returns [regionId,region]
   */
  emit('selected', [
    val,
    selectedData[selectedData.length - 1].__label.split('/')
  ]);
}

function loadData (item, callback) { // 加载数据
  item.loading = true;
  getRegion(item.value).then((res) => {
    if (res.result.length <= 0) {
      item.loading = false;
    } else {
      res.result.forEach((child) => {
        item.loading = false;

        let data = {
          value: child.id,
          label: child.name,
          loading: false,
          children: []
        };

        if (child.level === 'street' || item.label === '香港特别行政区') {
          item.children.push({
            value: child.id,
            label: child.name
          });
        } else {
          item.children.push(data);
        }
      });
      callback();
    }
  });
}

async function init () { // 初始化地图数据
  let res = await getRegion(0);
  let arr = [];
  res.result.forEach((item) => {
    let obj;
    // 台湾省做处理
    if (item.name === '台湾省') {
      obj = {
        value: item.id,
        label: item.name
      };
    } else {
      obj = {
        value: item.id,
        label: item.name,
        loading: false,
        children: []
      };
    }
    arr.push(obj);
  });
  data.value = arr;
  console.warn('init');
}

async function reviewData () {
  // 数据回显
  let addrArr = JSON.parse(JSON.stringify(props.addressId.split(',')));
  let length = addrArr.length;
  let res = await getRegion(0);
  let arr0 = [];
  let arr1 = [];
  let arr2 = [];
  // 第一级数据
  res.result.forEach((item) => {
    let obj;
    // 台湾省做处理
    if (item.name === '台湾省') {
      obj = {
        value: item.id,
        label: item.name
      };
    } else {
      obj = {
        value: item.id,
        label: item.name,
        loading: false,
        children: []
      };
    }
    arr0.push(obj);
  });
  // 根据选择的数据来加载数据列表
  if (length > 0) {
    let children = await getRegion(addrArr[0]);
    children = handleData(children.result);
    arr0.forEach((e) => {
      if (e.value === addrArr[0]) {
        e.children = arr1 = children;
      }
    });
  }
  if (length > 1) {
    let children = await getRegion(addrArr[1]);
    children = handleData(children.result);
    arr1.forEach((e) => {
      if (e.value === addrArr[1]) {
        e.children = arr2 = children;
      }
    });
  }
  if (length > 2) {
    let children = await getRegion(addrArr[2]);
    children = handleData(children.result);
    arr2.forEach((e) => {
      if (e.value === addrArr[2]) {
        e.children = children;
      }
    });
  }
  data.value = arr0;
  addr.value = addrArr;
}

function handleData (data) {
  // 处理接口数据
  let item = [];
  data.forEach((child) => {
    let obj = {
      value: child.id,
      label: child.name,
      loading: false,
      children: []
    };

    if (child.level === 'street' || item.label === '香港特别行政区') {
      item.push({
        value: child.id,
        label: child.name
      });
    } else {
      item.push(obj);
    }
  });
  return item;
}

watch(() => props.addressId, (v) => {
  if (v) {
    reviewData();
  } else {
    init();
  }
}, { immediate: true });
</script>
<style scoped lang="scss">
</style>
