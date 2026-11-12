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
    <div class="btns">
      <el-button
        @click="clickBtn(item)"
        size="small"
        v-for="(item, index) in way"
        :key="index"
        :type="item.selected ? 'primary' : ''"
      >{{ item.title }}</el-button>
    </div>
    <div class="model-title-view-btn">
      <el-button size="default" type="default" v-if="hasCache" @click="clearCache">清空本地缓存</el-button>
      <el-button size="default" type="primary" @click="handleSpinShow">保存页面</el-button>

      <el-dialog
        :title="progress ? '保存页面' : '保存中'"
        v-model="saveDialog"
        :show-close="true"
        :close-on-click-modal="false"
        append-to-body
        destroy-on-close
        @closed="handleDialogClosed"
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
            <el-button size="small" @click="witeLocalStore">写入</el-button>
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
const num = ref(0); // 提交进度
const saveDialog = ref(false); // 加载状态
const way = ref([
  // 装修tab栏切换
  {
    title: "首页",
    name: "index",
    selected: true,
  },
]);

const submitWay = reactive({
  // 表单信息
  pageShow: route.query.type === "true" || route.query.type === true || route.query.type === "OPEN",
  name: route.query.name || "店铺首页模板",
  pageClientType: "H5",
});

// 模板名称（优先读写 store 中的 name，便于与页面设置面板联动）
const editingName = ref(false);
const nameInput = ref(null);
const pageName = computed({
  get() {
    const fromStore = appStore.styleStore && appStore.styleStore.name;
    return fromStore || submitWay.name;
  },
  set(val) {
    submitWay.name = val;
    if (appStore.styleStore && typeof appStore.styleStore === "object") {
      appStore.styleStore.name = val;
    }
  },
});
function startEditName() {
  editingName.value = true;
  nextTick(() => {
    nameInput.value?.focus();
  });
}

onMounted(() => {
  const store = appStore.styleStore;
  if (store && typeof store === "object" && !store.name && route.query.name) {
    store.name = route.query.name;
  }
  hasCache.value = !!(getStore("sellerMobilePageCache") || getStore("managerMobilePageCache"));
});

watch(
  () => route.query.type,
  (val) => {
    submitWay.pageShow = val === "true" || val === true || val === "OPEN";
  }
);

watch(
  () => props.pagetype,
  (val) => {
    way.value.length = 0;
    if (val == "INDEX") {
      way.value.push({ title: "首页", name: "index", selected: true });
    } else if (val == "SPECIAL") {
      way.value.push({ title: "专题", name: "special", selected: true });
    }
  },
  { immediate: true }
);

function clearCache() {
  setStore("sellerMobilePageCache", "");
  setStore("managerMobilePageCache", "");
  hasCache.value = false;
  Message.success("清空成功");
}

function witeLocalStore() {
  setStore("sellerMobilePageCache", appStore.styleStore);
  hasCache.value = true;
  Message.success("写入成功");
}

function clickBtn(val) {
  way.value.forEach((item) => {
    item.selected = false;
  });
  val.selected = true;
  emit("selected", val.name);
}

function handleSpinShow() {
  progress.value = true;
  num.value = 0;
  saveDialog.value = true;
}

function handleDialogClosed() {
  progress.value = true;
  num.value = 0;
}

function save() {
  if (!pageName.value || !pageName.value.trim()) {
    Message.error("请填写模板名称");
    return false;
  }
  const title = appStore.styleStore && appStore.styleStore.title;
  if (!title || !String(title).trim()) {
    Message.error("请填写页面标题");
    return false;
  }

  if (appStore.styleStore == void 0 && route.query.pagetype != "SPECIAL") {
    Message.error("请装修楼层");
    return false;
  }

  const payload = {
    ...submitWay,
    pageShow: submitWay.pageShow ? "OPEN" : "CLOSE",
    name: pageName.value,
    pageData: JSON.stringify(appStore.styleStore),
    pageType: route.query.pagetype || "INDEX",
  };

  route.query.id ? updateHome(payload) : submit(payload);
}

function updateHome(payload) {
  progress.value = false;
  num.value = 20;
  const data = payload || {
    pageData: JSON.stringify(appStore.styleStore),
    name: pageName.value,
    pageShow: submitWay.pageShow ? "OPEN" : "CLOSE",
    pageType: submitWay.pageType || route.query.pagetype || "INDEX",
    pageClientType: "H5",
  };
  API_Other.updateHome(route.query.id, data)
    .then((res) => {
      num.value = 60;
      if (res.success) {
        num.value = 100;
        setTimeout(() => {
          saveDialog.value = false;
          progress.value = true;
          num.value = 0;
          Message.success("修改成功");
          goBack();
        }, 800);
      } else {
        progress.value = true;
        num.value = 0;
        saveDialog.value = false;
        Message.error("修改失败，请稍后重试");
      }
    })
    .catch(() => {
      progress.value = true;
      num.value = 0;
      saveDialog.value = false;
      Message.error("修改失败，请稍后重试");
    });
}

function goBack() {
  if (window.history.state?.back) {
    router.go(-1);
  } else {
    window.close();
    router.push("/wapList");
  }
}

function submit(payload) {
  progress.value = false;
  num.value = 20;
  const data = payload || {
    ...submitWay,
    pageShow: submitWay.pageShow ? "OPEN" : "CLOSE",
    name: pageName.value,
    pageData: JSON.stringify(appStore.styleStore),
    pageType: route.query.pagetype || "INDEX",
  };
  API_Other.setHomeSetup(data)
    .then((res) => {
      num.value = 60;
      if (res.success) {
        num.value = 100;
        setTimeout(() => {
          saveDialog.value = false;
          progress.value = true;
          num.value = 0;
          Message.success("保存成功");
          goBack();
        }, 800);
      } else {
        progress.value = true;
        num.value = 0;
        saveDialog.value = false;
        Message.error("保存失败，请稍后重试");
      }
    })
    .catch(() => {
      progress.value = true;
      num.value = 0;
      saveDialog.value = false;
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
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #333;
  font-size: 14px;
  background: #fff;
  border-bottom: 1px solid #ebeef5;
  padding: 0 16px;
  margin-bottom: 12px;
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
  .model-title-left {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .page-name {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 14px;
    color: #303133;
    font-weight: 500;
  }
  .page-name-edit {
    cursor: pointer;
    color: #909399;
    font-size: 14px;
    &:hover {
      color: #409eff;
    }
  }
  > .model-title-view-btn {
    display: flex;
    align-items: center;
    gap: 10px;
  }
}
.btns {
  * {
    margin: 0 4px;
  }
}
</style>
