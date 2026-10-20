<template>
  <div class="hotzone-box">
    <div class="hotzone-item">
      <div ref="content" class="hz-m-wrap">
        <img alt="热区背景图" class="hz-u-img" :src="image" />
        <ul class="hz-m-area" v-add-item>
          <zone
            class="hz-m-item"
            v-for="(zone, index) in zones"
            :key="index"
            :index="index"
            :setting="zone"
            :ref="(el) => setZoneRef(el, index)"
            @delItem="removeItem($event)"
            @changeInfo="changeInfo($event)"
          ></zone>
        </ul>
      </div>
    </div>
    <div>
      <div class="hotzone-add-box-body">
        <div
          v-for="(zone, index) in zones"
          :key="index"
          class="hotzone-box-item-main"
        >
          <div class="hotzone-box-item wes-2">
            <div>{{ index + 1 }}</div>
            <div @click="editZone(index)">
              <div class="hotzone-box-item-text">
                {{ showZoneText(zone) }}
              </div>
            </div>
            <div class="hotzone-box-item-actions">
              <div class="hotzone-btn" @click="editZone(index)">修改</div>
              <div class="hotzone-btn" @click="delZone(index)">删除</div>
            </div>
          </div>
        </div>
      </div>
      <div class="hotzone-add-box-footer" @click="addHotzone">
        <svg
          viewBox="64 64 896 896"
          focusable="false"
          class=""
          data-icon="plus"
          width="1em"
          height="1em"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            d="M482 152h60q8 0 8 8v704q0 8-8 8h-60q-8 0-8-8V160q0-8 8-8z"
          ></path>
          <path
            d="M176 474h672q8 0 8 8v60q0 8-8 8H176q-8 0-8-8v-60q0-8 8-8z"
          ></path>
        </svg>
        <div class="hotzone-add-box-text">添加热区</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, getCurrentInstance } from "vue";
import Zone from "./Zone";
import vAddItem from "../directives/addItem";

defineOptions({ name: "HotZone" });

const props = defineProps({
  image: {
    type: String,
    required: true,
  },
  zonesInit: {
    type: Array,
    default: () => [],
  },
  max: {
    type: Number,
  },
});
const emit = defineEmits([
  "choose",
  "erase",
  "overRange",
  "remove",
  "add",
  "change",
]);

const zones = ref([]);
const zoneRefs = ref([]);
const instance = getCurrentInstance();

onMounted(() => {
  zones.value = props.zonesInit.concat();
});

// v-for 内的动态 ref：按 index 收集 Zone 组件实例
function setZoneRef(el, index) {
  if (el) zoneRefs.value[index] = el;
}

async function addHotzone() {
  let perInfo = {
    topPer: 0.15,
    leftPer: 0.3,
    widthPer: 0.2,
    heightPer: 0.2,
    img: "",
    link: "",
    type: "",
    title: "",
  };
  let images = await getImageSize(props.image);
  if (images) {
    if (images.height >= 1000) {
      perInfo.heightPer = convertNumberToDecimal(images.height) / (images.height / 1000);
    } else {
      perInfo.heightPer = convertNumberToDecimal(images.height);
    }
    perInfo.widthPer = convertNumberToDecimal(images.width) / 2;
  }
  addItem(perInfo);
}

function convertNumberToDecimal(num) {
  if (num >= 10000) {
    return num / 100000;
  } else if (num >= 1000) {
    return num / 10000;
  } else if (num >= 100) {
    return num / 1000;
  } else if (num >= 10) {
    return num / 100;
  }
}

function getImageSize(url) {
  return new Promise(function (resolve, reject) {
    let image = new Image();
    image.onload = function () {
      resolve({
        width: image.width,
        height: image.height,
      });
    };
    image.onerror = function () {
      reject(new Error("error"));
    };
    image.src = url;
  });
}

function editZone(index) {
  zoneRefs.value[index].showModalFn(index);
}

function delZone(index) {
  zoneRefs.value[index].delItem(index);
}

function showZoneText(zone) {
  switch (zone.type) {
    case "goods":
      return `商品：${zone.goodsName}`;
    case "category":
      return `分类：${zone.name}`;
    case "shops":
      return `店铺：${zone.storeName}`;
    case "pages":
      return `文章：${zone.title}`;
    case "marketing":
      return `促销活动商品：${zone.goodsName}`;
    case "other":
      return `${zone.title}`;
    default:
      return "请选择跳转链接";
  }
}

function changeInfo(res) {
  let { info, index, zoneInfo } = res;
  info = { ...zoneInfo, ...info };
  // 改变热区并发送change通知
  Object.assign(zones.value[index], info);
  hasChange("changeInfo");
  instance.proxy.$forceUpdate();
}

function addItem(setting) {
  zones.value.push(setting);
  emit("choose");
  // this.hasChange()  不应该发送通知，mouseup判定成功才应该发
  // this.$emit('add', setting)
}

function eraseItem(index = zones.value.length - 1) {
  zones.value.splice(index, 1);
  emit("erase", index);
}

function isOverRange() {
  return props.max && zones.value.length > props.max;
}

function overRange() {
  const index = zones.value.length - 1;

  zones.value.splice(index, 1);
  emit("overRange", index);
}

function removeItem(index = zones.value.length - 1) {
  zones.value.splice(index, 1);
  hasChange("removeItem");
  emit("remove", index);
}

function changeItem(info, isAdd) {
  const index = zones.value.length - 1;
  // 改变热区并发送change通知
  Object.assign(zones.value[index], info);
  hasChange("changeItem");
  isAdd && emit("add", zones.value[index]);
}

function hasChange(from) {
  emit("change", zones.value);
}

// v-add-item 指令通过 binding.instance 调用以下方法/读取 zones
defineExpose({
  zones,
  addItem,
  eraseItem,
  isOverRange,
  overRange,
  changeItem,
});
</script>

<style scoped lang="scss">
@import "../assets/styles/main.css";
.hotzone-box {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 468px;
  > div {
    margin: 6px;
    padding: 12px;
    border-radius: 10px;
    height: 100%;
  }
  > div:nth-of-type(1) {
    // display: flex;
    width: 50%;
    overflow: auto;
    // justify-content: center;
    background: #ededed;
  }
  > div:nth-of-type(2) {
    width: 50%;
    min-width: 0;
    background: #f7f7f7;
    overflow: hidden;
  }
}

.hotzone-add-box-body {
  height: 90%;
  overflow-y: auto;
  overflow-x: hidden;
}

.hotzone-box-item-main {
  margin-top: 10px;
  margin-bottom: 20px;
}

.hotzone-box-item {
  align-items: center;
  display: flex;
  gap: 8px;
  border-bottom: 1px solid #ededed;
  font-size: 12px;
  padding: 5px 10px 0;
  width: 100%;
  box-sizing: border-box;
  min-width: 0;

  > div:nth-child(2) {
    flex: 1;
    min-width: 0;
  }
}

.hotzone-add-box-footer {
  align-items: center;
  background: #fff;
  border: none;
  border-radius: 5px;
  color: #ff5c58;
  display: flex;
  height: 40px;
  justify-content: center;
  margin-top: 10px;
  cursor: pointer;
}

.hotzone-btn {
  cursor: pointer;
}

.hotzone-box-item-actions {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  gap: 8px;
  white-space: nowrap;
}

.hotzone-box-item-text {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  cursor: pointer;
}

.hotzone-add-box-text {
  font-size: 12px;
  line-height: 20px;
  margin: 0 0 0 4px;
}
</style>
