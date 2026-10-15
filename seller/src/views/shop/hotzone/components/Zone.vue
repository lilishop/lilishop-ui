<template>
  <li
    v-drag-item
    :style="{
      top: zoneTop,
      left: zoneLeft,
      width: zoneWidth,
      height: zoneHeight,
    }"
  >
    <ul
      v-change-size
      class="hz-m-box"
      :class="{
        'hz-z-hidden': tooSmall,
        'hz-m-hoverbox': !hideZone,
      }"
    >
      <li class="hz-u-index" :title="`热区${index + 1}`">{{ index + 1 }}</li>
      
      <li
        title="删除该热区"
        v-show="!hideZone"
        class="hz-u-close hz-icon hz-icon-trash"
        @click.prevent.stop="delItem(index)"
        @mousedown.stop
        @mouseup.stop
        @mousemove.stop
      ></li>
      <li
        title="编辑该热区"
        v-show="!hideZone"
        class="hz-u-close hz-icon hz-icon-edit"
        @click.prevent.stop="showModalFn(index)"
        @mousedown.stop
        @mouseup.stop
        @mousemove.stop
      >
        <img width="17" height="17" src="../assets/styles/icons8-edit-64.png" />
      </li>
      <li class="hz-flex-img">
        <img class="hz-u-img" :src="zoneForm.img" />
      </li>
      <li class="hz-u-square hz-u-square-tl" data-pointer="dealTL"></li>
      <li class="hz-u-square hz-u-square-tc" data-pointer="dealTC"></li>
      <li class="hz-u-square hz-u-square-tr" data-pointer="dealTR"></li>
      <li class="hz-u-square hz-u-square-cl" data-pointer="dealCL"></li>
      <li class="hz-u-square hz-u-square-cr" data-pointer="dealCR"></li>
      <li class="hz-u-square hz-u-square-bl" data-pointer="dealBL"></li>
      <li class="hz-u-square hz-u-square-bc" data-pointer="dealBC"></li>
      <li class="hz-u-square hz-u-square-br" data-pointer="dealBR"></li>
    </ul>
   
    <el-dialog
      v-model="showModal"
      title="编辑热区"
      width="420px"
      :close-on-click-modal="false"
      append-to-body
      @close="cancelZone"
    >
      <div>
        <div class="hz-edit-img">
          <img class="show-image" :src="zoneForm.img" alt />
        </div>

        <el-form :model="zoneForm" label-width="90px" class="hz-edit-form">
          <!-- <el-form-item label="图片链接：">
            <el-input v-model="zoneForm.img"></el-input>
            <el-button size="small" type="primary" @click="handleSelectImg"
              >选择图片</el-button
            >
            :v-model="zoneForm.type === 'goods' ? zoneForm.goodsName : zoneForm.link"
          </el-form-item> -->
          <el-form-item label="跳转链接：">
            <el-input type="textarea" v-if="zoneForm.type === 'other' && zoneForm.title === '外部链接'" v-model="zoneForm.link" ></el-input>
            <el-button size="small" type="primary" @click="handleSelectLink"
              >选择链接</el-button
            >
          </el-form-item>
        </el-form>
      </div>
    </el-dialog>
    <!-- 选择商品。链接 -->
    <liliDialog ref="liliDialog" @selectedLink="selectedLink"></liliDialog>
    <!-- 选择图片 -->
    <el-dialog width="1200px" v-model="picModelFlag">
      <ossManage @callback="callbackSelected" :isComponent="true"  :initialize="picModelFlag" ref="ossManageRef"/>
    </el-dialog>
  </li>
</template>

<script setup>
import { ref, reactive, watch, onMounted } from "vue";
// 自定义指令：script setup 中以 vXxx 命名的顶层变量即注册为指令
import vChangeSize from "../directives/changeSize";
import vDragItem from "../directives/dragItem";
import ossManage from "@/views/sys/oss-manage/ossManage";
import { formatLinkType } from "@/utils/filters";

defineOptions({ name: "Zone" });

const props = defineProps(["index", "setting"]);
const emit = defineEmits(["changeInfo", "delItem"]);

const zoneTop = ref("");
const zoneLeft = ref("");
const zoneWidth = ref("");
const zoneHeight = ref("");
const hideZone = ref(false);
const tooSmall = ref(false);
const showModal = ref(false);
const picModelFlag = ref(false);
const currentIndex = ref(0);
const zoneForm = reactive({
  img: "",
  link: "",
  type: "",
});
// 历史遗留：原 Options 写法 this.selectedNav 未在 data 声明（只赋值未读取），此处补声明仅作占位
const selectedNav = ref(null);

// ossManageRef：模板 ref 与组件 import 同名，改名避免互相覆盖
const liliDialog = ref(null);
const ossManageRef = ref(null);

onMounted(() => {
  setZoneInfo(props.setting);
});

function setZoneInfo(val) {
  zoneTop.value = getZoneStyle(val.topPer);
  zoneLeft.value = getZoneStyle(val.leftPer);
  zoneWidth.value = getZoneStyle(val.widthPer);
  zoneHeight.value = getZoneStyle(val.heightPer);
  tooSmall.value = val.widthPer < 0.01 && val.heightPer < 0.01;
  zoneForm.link = val.link;
  settingZone(val);
}
function handlehideZone(isHide = true) {
  if (hideZone.value === isHide) {
    return;
  }

  hideZone.value = isHide;
}
function changeInfo(info = {}) {
  const { index } = props;

  emit("changeInfo", {
    info,
    index,
    zoneInfo: zoneForm,
  });
}
function showModalFn(index) {
  showModal.value = true;
  currentIndex.value = index;
}
// 选择图片回调
function callbackSelected(item) {
  picModelFlag.value = false;
  zoneForm.img = item.url;
}

// 调起选择链接弹窗
function handleSelectLink(item, index) {
  // 历史遗留：selectedNav 只赋值未读取，原样保留
  if (item) selectedNav.value = item;
  liliDialog.value.open("link");
}
// 已选链接
function selectedLink(val) {
  zoneForm.link = formatLinkType(val);
  settingZone(val);
  changeInfo(zoneForm);
  showModal.value = false;
}
function settingZone(val) {
  zoneForm.type = val.___type || val.type;
  zoneForm.title = val.title;
  switch (val.___type) {
    case "goods":
      zoneForm.id = val.id;
      zoneForm.goodsId = val.goodsId;
      zoneForm.goodsName = val.goodsName;
      break;
    case "category":
      zoneForm.id = val.allId;
      zoneForm.name = val.name;
      break;
    case "shops":
      zoneForm.id = val.id;
      zoneForm.storeName = val.storeName;
      break;
    case "pages":
      zoneForm.id = val.id;
      zoneForm.___path = val.___path;
      zoneForm.title = val.title;
      break;
    case "marketing":
      zoneForm.id = val.id;
      zoneForm.goodsId = val.goodsId;
      zoneForm.goodsName = val.goodsName;
      break;
    default:
      break;
  }
}
function cancelZone() {
  showModal.value = false;
}
function delItem(index) {
  emit("delItem", index);
}
function getZoneStyle(val) {
  return `${(val || 0) * 100}%`;
}

watch(
  () => props.setting,
  (val) => {
    setZoneInfo(val);
  },
  { deep: true }
);

// 父组件 Hotzone.vue 通过 $refs 调用 showModalFn / delItem
defineExpose({
  showModalFn,
  delItem,
});
</script>

<style scoped lang="scss">
.hz-edit-form :deep(.el-form-item__label) {
  white-space: nowrap;
}
</style>
