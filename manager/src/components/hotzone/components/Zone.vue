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
        <img width="17" height="17" src="../assets/styles/icons8-edit-64.png"></img>
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
      :modal="false"
      append-to-body
      width="520px"
      @close="cancelZone"
    >
      <div>
        <div class="hz-edit-img">
          <img class="show-image" :src="zoneForm.img" alt />
        </div>

        <el-form :model="zoneForm" label-width="90px" class="hz-edit-form">
          <el-form-item label="跳转链接：">
            <el-input type="textarea" v-if="zoneForm.type === 'other' && zoneForm.title === '外部链接'" v-model="zoneForm.link" />
            <el-button size="small" type="primary" @click="handleSelectLink"
              >选择链接</el-button
            >
          </el-form-item>
        </el-form>
      </div>
      <template #footer>
        <el-button @click="cancelZone">取消</el-button>
        <el-button type="primary" @click="saveZone">保存</el-button>
      </template>
    </el-dialog>
    <!-- 选择商品。链接 -->
    <liliDialog ref="liliDialog" @selectedLink="selectedLink"></liliDialog>
    <!-- 选择图片 -->
    <el-dialog width="1200px" v-model="picModelFlag" append-to-body destroy-on-close>
      <ossManage
        @callback="callbackSelected"
        :isComponent="true"
        :initialize="picModelFlag"
        ref="ossManageRef"
      />
      <template #footer />
    </el-dialog>
  </li>
</template>

<script setup>
import { ref, reactive, watch, nextTick, onMounted } from "vue";
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
const currentShowIndex = ref(-1);
const zoneForm = reactive({
  img: "",
  link: "",
  type: "",
});

// 未在原 data 中声明、直接挂载在 this 上的遗留字段（仅赋值，未被读取）
let selectedNav;

const liliDialog = ref(null);
// 模板 ref 与 import 组件同名会互相覆盖，故改名 ossManageRef
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
  const index = props.index;

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
// 选择图片
function handleSelectImg() {
  picModelFlag.value = true;
  nextTick(() => {
    if (ossManageRef.value) {
      ossManageRef.value.selectImage = true;
    }
  });
}
// 选择图片回调
function callbackSelected(item) {
  picModelFlag.value = false;
  zoneForm.img = item.url;
}

// 调起选择链接弹窗
function handleSelectLink(item, index) {
  if (item) selectedNav = item;
  liliDialog.value.open("link");
}
// 已选链接
function selectedLink(val) {
  zoneForm.link = formatLinkType(val);
  settingZone(val);
  changeInfo(zoneForm);
}
function settingZone(val) {
  zoneForm.type = val.___type || val.type;
  zoneForm.title = val.title;
  if(val.pageType == "special"){
      zoneForm.id = val.id;
      zoneForm.pageType = val.pageType
      zoneForm.type = val.pageType
      zoneForm.title = val.name
    }
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
function saveZone() {
  showModal.value = false;
  changeInfo(zoneForm);
}
function cancelZone() {
  showModal.value = false;
}
function delZone() {
  delItem(currentIndex.value);
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

// 外部访问：父组件 Hotzone.vue 通过 $refs 调用 showModalFn/delItem；
// 自定义指令 changeSize/dragItem 通过 binding.instance 调用 handlehideZone/changeInfo
defineExpose({
  showModalFn,
  delItem,
  handlehideZone,
  changeInfo,
});
</script>

<style scoped lang="scss">
.hz-edit-form :deep(.el-form-item__label) {
  white-space: nowrap;
}
</style>
