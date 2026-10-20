<template>
  <!-- 预览保存 -->
  <div class="model-title">
    <div class="model-title-left">
      <el-button size="default" @click="goBack">返回</el-button>
      <div class="page-name">
        <template v-if="!editingName">
          <span class="page-name-label">当前页面：{{ pageName }}</span>
          <el-icon class="page-name-edit" @click="startEditName"><Edit /></el-icon>
        </template>
        <el-input
          v-else
          ref="nameInput"
          v-model="pageName"
          size="small"
          style="width: 200px"
          maxlength="30"
          placeholder="请输入模板名称"
          @blur="editingName = false"
          @keyup.enter="editingName = false"
        />
      </div>
    </div>
    <div class="model-title-view-btn">
      <!-- TODO 后期会补全 目前版本暂无 -->
      <!-- <Poptip placement="bottom" width="100">
        <el-button size="default" @click="creatQrCode">预览模板</el-button>
        <template #content><div class="default-view-content">
          <div>临时预览</div>
          <div ref="qrCodeUrl"></div>
        </div>
      </template></el-popconfirm>-->
      <el-button size="default" type="default" v-if="hasCache" @click="clearCache">清空本地缓存</el-button>
      <el-button size="default" type="primary" @click="handleSpinShow">保存页面</el-button>

      <el-dialog
        title="保存中"
        v-model="saveDialog"
        :show-close="true"
        :close-on-click-modal="false"
        append-to-body
        destroy-on-close
      >
        <div v-if="progress">
          <div class="model-item">
            模板名称
            <el-input style="width: 200px" v-model="pageName" placeholder="请输入模板名称" />
          </div>
          <div class="model-item">
            是否立即发布
            <el-switch
              v-model="submitWay.pageShow"
              active-text="开"
              inactive-text="关"
            />
          </div>
          <div class="model-item">
            将当前装修内容写入到本地缓存中，下次进入页面时可继续使用
            <el-button type="small" @click="witeLocalStore">写入</el-button>
          </div>

          <el-button type="primary" @click="save()">保存</el-button>
        </div>
        <el-progress v-else :percentage="num" status="success" />
      </el-dialog>
    </div>
  </div>
</template>
<script setup>
import { reactive, ref, watch, onMounted, nextTick, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import * as API_Other from "@/api/other.js";
import { Edit } from "@element-plus/icons-vue";
import { getStore, setStore } from "@/libs/storage";
import { Message } from "@/utils/message";
import { useAppStore } from "@/stores/app";

const props = defineProps(["pagetype"]);
const emit = defineEmits(["selected"]);

const route = useRoute();
const router = useRouter();
const appStore = useAppStore();

const hasCache = ref(false); // 是否有缓存
const progress = ref(true); // 展示进度
const num = ref(20); // 提交进度
const saveDialog = ref(false); // 加载状态
const way = ref([
  // 装修tab栏切换
  {
    title: "首页",
    name: "index",
    selected: true,
  },
  {
    title: "全屏广告",
    name: "advertising",
    selected: false,
  },
  {
    title: "弹窗广告",
    name: "ALERT",
    selected: false,
  },
]);

// 页面名称编辑态
const editingName = ref(false);
const nameInput = ref(null);

// 进入页面名称编辑态并聚焦输入框
function startEditName() {
  editingName.value = true;
  nextTick(() => {
    nameInput.value && nameInput.value.focus();
  });
}

const submitWay = reactive({
  // 表单信息
  pageShow: route.query.type || false,
  pageClientType: "H5"
});

// 模板名称与「页面设置」面板共用 store 中的同一份数据，双向同步
const pageName = computed({
  get() {
    const store = appStore.styleStore;
    if (store && typeof store === "object") {
      return store.name || "";
    }
    return route.query.name || "";
  },
  set(val) {
    if (!appStore.styleStore || typeof appStore.styleStore !== "object") {
      appStore.styleStore = { ...appStore.styleStore, list: [] };
    }
    appStore.styleStore.name = val;
  },
});

onMounted(() => {
  // 新建页面时把路由带来的模板名称写入 store（不覆盖已有名称）
  const store = appStore.styleStore;
  if (store && typeof store === "object" && !store.name && route.query.name) {
    store.name = route.query.name;
  }
});

watch(
  () => props.pagetype,
  (val) => {
    way.value.length = 0;
    if (val == "INDEX") {
      way.value.push({ title: "首页", name: "index", selected: true });
    } else if (val == "SPECIAL") {
      way.value.push({ title: "专题", name: "special", selected: true });
    } else if (val == "ALERT") {
      way.value.push({ title: "开屏广告", name: "alert", selected: true });
    }else if (val == "OPEN_SCREEN_ANIMATION") {
      way.value.push({ title: "app开屏页面", name: "OPEN_SCREEN_ANIMATION", selected: true });
    }
  },
  { immediate: true }
);

onMounted(() => {
  hasCache.value = getStore('managerMobilePageCache') ? true : false;
});

function clearCache(){
  setStore('managerMobilePageCache','');
  Message.success('清空成功')
}
// 将楼层装修的内容写入到本地缓存中
function witeLocalStore(){
  setStore('managerMobilePageCache', appStore.styleStore)
  Message.success('写入成功')
}

function clickBtn(val) {
  way.value.forEach((item, index) => {
    item.selected = false;
  });
  val.selected = true;
  emit("selected", val.name);
}

/**
 * 加载，并保存模板
 */
function handleSpinShow() {
  saveDialog.value = true;
}

// 填写是否发布，模板名称之后保存
function save() {
  // 楼层装修页面（非开屏/弹窗广告）需校验页面设置的必填项
  const isFloorPage =
    route.query.pagetype != "ALERT" &&
    route.query.pagetype != "OPEN_SCREEN_ANIMATION";
  if (isFloorPage) {
    if (!pageName.value || !pageName.value.trim()) {
      Message.error("请填写模板名称");
      return false;
    }
    const title = appStore.styleStore && appStore.styleStore.title;
    if (!title || !String(title).trim()) {
      Message.error("请填写页面标题");
      return false;
    }
  }

  if (
    appStore.styleStore == void 0 &&
    (route.query.pagetype && route.query.pagetype != 'ALERT' &&  route.query.pagetype != 'OPEN_SCREEN_ANIMATION')
  ) {
    Message.error("请装修楼层");
    return false;
  }

  submitWay?.pageShow === true
    ? (submitWay.pageShow = "OPEN")
    : (submitWay.pageShow = "CLOSE");

  submitWay.name = pageName.value;
  submitWay.pageData = JSON.stringify(appStore.styleStore);
  submitWay.pageType = "INDEX";
  submitWay.pageType =  route.query.pagetype ||  "INDEX";
  // submitWay.pageType = props.pagetype;

  if (route.query.pagetype == 'ALERT' || route.query.pagetype == 'OPEN_SCREEN_ANIMATION') {
    update(submitWay);
  } else {
    route.query.id ? updateHome() : submit(submitWay);
  }

  // route.query.id ? update() : submit(submitWay);
}

// 更新
function updateHome() {
  progress.value = false;
  API_Other.updateHome(route.query.id, {
    pageData: JSON.stringify(appStore.styleStore),
    name: pageName.value,
    pageShow: submitWay.pageShow,
    pageType: submitWay.pageType,
    pageClientType: "H5",
  })
    .then(res => {
      num.value = 50;
      if (res.success) {
        num.value = 80;
        /**制作保存成功动画¸ */
        setTimeout(() => {
          saveDialog.value = false;
          Message.success("修改成功");
          goBack();
        }, 1000);
      } else {
        saveDialog.value = false;
        Message.error("修改失败，请稍后重试");
      }
    });
}


// 更新
function update(submitWay) {
  if (appStore.openStyleStore == void 0) {
    Message.error("请装修楼层!");
    return false;
  }
  progress.value = false;

  let id = route.query.id;
  const pagetype = route.query.pagetype;
  const pageType = {
    INDEX: "INDEX",
    ALERT: "OPEN_SCREEN_PAGE",
    OPEN_SCREEN_ANIMATION: "OPEN_SCREEN_ANIMATION",
  }[pagetype ? pagetype : "INDEX"];

  if (pagetype) {
    submitWay.pageData = JSON.stringify(
      appStore.openStyleStore[0]
    );
    submitWay.pageType = pageType;
    id = appStore.openStoreId;
  }

  API_Other.updateHome(id, submitWay)
    .then((res) => {
      num.value = 50;
      if (res.success) {
        num.value = 80;
        /**制作保存成功动画¸ */
        setTimeout(() => {
          saveDialog.value = false;
          Message.success("修改成功");
          goBack();
        }, 1000);
      } else {
        saveDialog.value = false;
        Message.error("修改失败，请稍后重试");
      }
    });
}



// 返回查询数据页面
function goBack() {
  router.go(-1);
}

// 保存
function submit(submitWay) {
  progress.value = false;
  API_Other.setHomeSetup(submitWay)
    .then(res => {
      num.value = 50;
      if (res.success) {
        num.value = 80;
        /**制作保存成功动画¸ */
        setTimeout(() => {
          saveDialog.value = false;
          Message.success("保存成功");
          goBack();
        }, 1000);
      } else {
        progress.value = true;
        saveDialog.value = false;
        Message.error("保存失败，请稍后重试");
      }
    });
}
</script>
<style scoped lang="scss">
.model-item {
  width: 100%;
  padding: 10px 0;
  display: flex;
  align-items: center;
  > * {
    margin: 0 8px;
  }
}
.model-title {
  height: 60px;
  margin: 12px 0;
  padding: 0 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #333;
  font-size: 14px;
  background: #ffffff;
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
  box-sizing: border-box;
  > .model-title-left {
    display: flex;
    align-items: center;
    gap: 16px;
  }
  .page-name {
    display: flex;
    align-items: center;
    .page-name-label {
      font-size: 14px;
      color: #303133;
    }
    .page-name-edit {
      margin-left: 6px;
      cursor: pointer;
      color: #909399;
      &:hover {
        color: #409eff;
      }
    }
  }
  > .model-title-view-btn {
    > * {
      margin: 0 10px;
    }
  }
}
.btns {
  * {
    margin: 0 4px;
  }
}
</style>
