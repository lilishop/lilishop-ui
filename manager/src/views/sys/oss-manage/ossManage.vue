<style lang="scss">
@import "./ossManage.scss";

.modal-footer {
  text-align: center;
  > * {
    margin: 0 10px;
  }
}
</style>

<template>
  <div class="search" :class="{ 'is-component-search': isComponent }">
    <!-- 独立页面模式：统一现代顶部控制栏 -->
    <el-card v-if="!isComponent" class="oss-header-card" shadow="never">
      <div class="header-content">
        <div class="header-left">
          <!-- 角色切换 -->
          <el-radio-group v-model="activeRoleTab" size="default" @change="handleRoleTabChange">
            <el-radio-button label="MANAGER">管理员</el-radio-button>
            <el-radio-button label="STORE">商家</el-radio-button>
            <el-radio-button label="MEMBER">用户</el-radio-button>
            <el-radio-button label="CUSTOMER">客服</el-radio-button>
          </el-radio-group>

          <div class="divider"></div>

          <!-- 媒体分类切换 -->
          <el-radio-group v-model="activeCategoryTab" size="default" @change="handleCategoryTabChange">
            <el-radio-button v-if="allowImage" label="IMAGE">图片</el-radio-button>
            <el-radio-button v-if="allowVideo" label="VIDEO">视频</el-radio-button>
            <el-radio-button v-if="!onlyImage" label="FILE">文件</el-radio-button>
          </el-radio-group>
        </div>

        <div class="header-right">
          <el-input
            v-model="searchForm.name"
            placeholder="搜索素材原名..."
            clearable
            :prefix-icon="Search"
            class="search-input"
            @clear="handleSearch"
            @keyup.enter="handleSearch"
          />
          <el-button :icon="Search" @click="handleSearch">搜索</el-button>
          <el-button :icon="Refresh" @click="handleReset">刷新</el-button>
        </div>
      </div>
    </el-card>

    <!-- 主体卡片 -->
    <component
      :is="isComponent ? 'div' : 'el-card'"
      :class="isComponent ? 'is-component-card' : 'oss-main-card'"
      shadow="never"
    >
      <el-row class="oss-manage-box">
        <!-- 左侧目录树 -->
        <el-col v-if="canShowGroups" :span="isComponent ? 5 : 4" class="file-list">
          <div class="group-header">
            <span class="group-title">
              <el-icon><Folder /></el-icon>
              <span>资源分组</span>
            </span>
            <el-tooltip v-if="!isComponent" content="新建分组" placement="top">
              <el-button
                type="primary"
                link
                :icon="Plus"
                class="add-group-btn"
                @click="handleClickAddGroup"
              >
                新建
              </el-button>
            </el-tooltip>
          </div>

          <el-tree
            :key="treeRenderKey"
            :data="treeData"
            node-key="value"
            :props="{ label: 'title', children: 'children' }"
            :indent="0"
            highlight-current
            class="demo-tree-render oss-group-tree"
            @node-click="handleTreeNodeClick"
          >
            <template #default="{ data: nodeData }">
              <span v-if="nodeData" class="oss-tree-node">
                <span class="node-left">
                  <el-icon class="oss-tree-icon">
                    <Files v-if="nodeData.value === '0'" />
                    <FolderOpened v-else-if="selectedGroupData && selectedGroupData.value === nodeData.value" />
                    <Folder v-else />
                  </el-icon>
                  <span class="node-title">{{ nodeData.title }}</span>
                </span>
                <el-dropdown
                  v-if="nodeData.value !== '0' && !isComponent"
                  trigger="click"
                  @command="(cmd) => onTreeDropdownCommand(cmd, nodeData)"
                >
                  <el-icon class="oss-tree-more" @click.stop><MoreFilled /></el-icon>
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item command="edit">重命名</el-dropdown-item>
                      <el-dropdown-item command="delete" style="color: #f56c6c">删除分组</el-dropdown-item>
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
              </span>
            </template>
          </el-tree>
        </el-col>

        <!-- 右侧资源展示区 -->
        <el-col :span="canShowGroups ? (isComponent ? 19 : 20) : 24" class="pic-list">
          <!-- 操作工具条 -->
          <div class="oss-toolbar">
            <div class="toolbar-left">
              <el-checkbox
                v-model="isAllSelected"
                :indeterminate="isIndeterminate"
                class="select-all-checkbox"
              >
                全选本页
              </el-checkbox>

              <span v-if="selectCount > 0" class="selection-badge">
                已选 <b>{{ selectCount }}</b> 项
              </span>

              <el-button
                v-if="!isComponent"
                type="danger"
                plain
                size="small"
                :icon="Delete"
                :disabled="selectCount === 0"
                @click="removeAll"
              >
                批量删除
              </el-button>

              <el-button
                v-if="selectCount > 0"
                type="info"
                link
                size="small"
                @click="clearCurrentSelection"
              >
                取消已选
              </el-button>
            </div>

            <div class="toolbar-right">
              <el-upload
                v-if="canUploadImages"
                ref="upRef"
                :action="managerApiUrl + '/manager/common/upload/file'"
                :accept="uploadAccept"
                :data="uploadData"
                :headers="accessToken"
                :before-upload="beforeUpload"
                :on-error="handleError"
                :on-success="handleSuccess"
                :show-file-list="false"
                multiple
                style="display: inline-block"
              >
                <el-button type="primary" :icon="Upload">{{ uploadButtonText }}</el-button>
              </el-upload>
            </div>
          </div>

          <!-- 素材卡片网格 -->
          <div v-loading="loading">
            <el-checkbox-group v-if="data.length > 0" v-model="selectedOss" @change="selectOssChange">
              <div class="img-box">
                <div v-for="(item, index) in data" :key="index" class="img-item">
                  <div
                    class="card"
                    :class="{
                      'custom-checkbox-card-checked': selectedOss.includes(item.id + ',' + item.url),
                      'oss-card-selectable': isComponent && selectImage,
                    }"
                    @click="handleCardClick(item, $event)"
                  >
                    <!-- 右上角多选框 -->
                    <el-checkbox
                      :value="item.id + ',' + item.url"
                      class="card-checkbox"
                      @click.stop
                    />

                    <!-- 媒体缩略展示 -->
                    <div class="card-preview-media">
                      <img
                        v-if="isImageFile(item)"
                        :src="item.url"
                        :alt="item.name"
                        loading="lazy"
                      />
                      <template v-else-if="isVideoFile(item)">
                        <video class="card-media" :src="item.url" muted />
                        <div class="video-play-overlay">
                          <el-icon :size="24"><VideoPlay /></el-icon>
                        </div>
                      </template>
                      <div v-else class="card-file-generic" :class="getFileBadgeClass(item)">
                        <el-icon :size="34"><Document /></el-icon>
                        <span class="file-badge">{{ getFileExt(item) }}</span>
                      </div>
                    </div>

                    <!-- 悬浮操作栏（非弹窗模式下展示高频快捷操作） -->
                    <div v-if="!isComponent" class="card-actions" @click.stop>
                      <el-tooltip content="预览" placement="top">
                        <span class="action-btn" @click="previewFile(item)">
                          <el-icon><View /></el-icon>
                        </span>
                      </el-tooltip>
                      <el-tooltip content="复制链接" placement="top">
                        <span class="action-btn" @click="copyFileUrl(item)">
                          <el-icon><CopyDocument /></el-icon>
                        </span>
                      </el-tooltip>
                      <el-tooltip content="下载" placement="top">
                        <span class="action-btn" @click="download(item)">
                          <el-icon><Download /></el-icon>
                        </span>
                      </el-tooltip>
                      <el-tooltip content="重命名" placement="top">
                        <span class="action-btn" @click="rename(item)">
                          <el-icon><Edit /></el-icon>
                        </span>
                      </el-tooltip>
                      <el-tooltip content="删除" placement="top">
                        <span class="action-btn btn-delete" @click="remove(item)">
                          <el-icon><Delete /></el-icon>
                        </span>
                      </el-tooltip>
                    </div>
                  </div>

                  <!-- 文件名称与参数 -->
                  <el-tooltip :content="item.name" placement="bottom">
                    <div class="text" @click="!isComponent && previewFile(item)">{{ item.name }}</div>
                  </el-tooltip>
                  <div class="sub-info">{{ getFileSubInfo(item) }}</div>
                </div>
              </div>
            </el-checkbox-group>

            <!-- 空状态 -->
            <div v-else class="empty-box">
              <el-empty description="暂无相关素材文件" :image-size="120">
                <el-upload
                  v-if="canUploadImages"
                  :action="managerApiUrl + '/manager/common/upload/file'"
                  :accept="uploadAccept"
                  :data="uploadData"
                  :headers="accessToken"
                  :before-upload="beforeUpload"
                  :on-error="handleError"
                  :on-success="handleSuccess"
                  :show-file-list="false"
                  multiple
                >
                  <el-button type="primary" :icon="Upload">立即上传</el-button>
                </el-upload>
              </el-empty>
            </div>
          </div>

          <!-- 分页器 -->
          <div class="page-box">
            <el-pagination
              v-model:current-page="searchForm.pageNumber"
              v-model:page-size="searchForm.pageSize"
              :page-sizes="pageSizeOpts"
              :total="total"
              layout="total, sizes, prev, pager, next, jumper"
              background
              @current-change="pageChange"
              @size-change="changePageSize"
            />
          </div>

          <!-- 选图弹窗模式下的底部按钮 -->
          <div v-if="isComponent && selectImage && !hideSelectFooter" class="oss-select-footer">
            <el-button @click="handleSelectCancel">取消</el-button>
            <el-button type="primary" @click="handleSelectConfirm">确定</el-button>
          </div>
        </el-col>
      </el-row>
    </component>

    <!-- 大图浏览查看器（支持翻页、缩放、旋转） -->
    <el-image-viewer
      v-if="imageViewerVisible"
      :url-list="previewImageList"
      :initial-index="previewImageIndex"
      @close="imageViewerVisible = false"
    />

    <!-- 重命名弹窗 -->
    <el-dialog
      v-model="modalVisible"
      :close-on-click-modal="false"
      :title="modalTitle"
      width="500px"
      destroy-on-close
    >
      <el-form ref="formRef" label-width="95px" :model="form" :rules="formValidate">
        <el-form-item label="原文件名" prop="name">
          <el-input v-model="form.name" />
        </el-form-item>
        <el-form-item label="存储文件名" prop="fileKey">
          <el-input v-model="form.fileKey" disabled />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="handleCancel">取消</el-button>
        <el-button :loading="submitLoading" type="primary" @click="handleSubmit">提交</el-button>
      </template>
    </el-dialog>

    <!-- 普通文件预览弹窗（PDF等） -->
    <el-dialog v-model="fileVisible" :title="fileTitle" width="800px" destroy-on-close>
      <iframe
        v-if="isPdfFile(file)"
        :src="file.url"
        style="width: 100%; height: 70vh; border: none"
        title="文件预览"
      />
      <div v-else class="file-preview-fallback">
        <el-icon :size="64"><Document /></el-icon>
        <p class="file-preview-name">{{ file.name }}</p>
        <p class="file-preview-tip">该文件类型暂不支持在线直接预览</p>
        <el-button type="primary" :icon="Download" @click="download(file)">下载文件</el-button>
      </div>
      <template #footer>
        <span>文件类型：{{ file.fileType }} · 文件大小：{{ file.msize }} · 创建时间：{{ file.createTime }}</span>
      </template>
    </el-dialog>

    <!-- 视频播放弹窗 -->
    <el-dialog
      v-model="videoVisible"
      :title="videoTitle"
      width="800px"
      destroy-on-close
      @close="closeVideo"
      @opened="initDPlayer"
    >
      <div ref="dplayerRef"></div>
      <template #footer>
        <span>文件类型：{{ file.fileType }} · 文件大小：{{ file.msize }} · 创建时间：{{ file.createTime }}</span>
      </template>
    </el-dialog>

    <!-- 分组添加/修改弹窗 -->
    <el-dialog
      v-model="enableGroup"
      :title="insertOrUpdate === 'insert' ? '添加分组' : '修改分组'"
      width="500px"
      :close-on-click-modal="false"
      destroy-on-close
    >
      <el-form
        ref="formValidateRef"
        label-width="80px"
        :model="groupFormValidate"
        :rules="groupRuleValidate"
      >
        <el-form-item label="分组名称" prop="directoryName">
          <el-input v-model="groupFormValidate.directoryName" placeholder="请输入分组名称" />
        </el-form-item>
      </el-form>
      <div class="modal-footer">
        <el-button @click="enableGroup = false">取消</el-button>
        <el-button type="primary" :loading="groupLoading" @click="submitAddGroup">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
let dp;
</script>

<script setup>
import {
  computed,
  getCurrentInstance,
  onMounted,
  reactive,
  ref,
  watch,
} from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import {
  Delete,
  Download,
  View,
  Document,
  Folder,
  FolderOpened,
  Files,
  Plus,
  MoreFilled,
  Search,
  Refresh,
  Upload,
  VideoPlay,
  CopyDocument,
  Edit,
} from "@element-plus/icons-vue";
import {
  addFileDirectory,
  deleteFile,
  delFileDirectory,
  getFileDirectory,
  getFileListData,
  renameFile,
  updateFileDirectory,
} from "@/api/index";
import DPlayer from "dplayer";
import { managerApiUrl } from "@/libs/axios";
import { getStore } from "@/libs/storage";

defineOptions({ name: "oss-manage" });

const props = defineProps({
  isComponent: {
    default: false,
    type: Boolean,
  },
  choose: {
    type: String,
    default: "",
  },
  initialize: {
    type: Boolean,
    default: false,
  },
  maxSelect: {
    type: Number,
    default: 0,
  },
  hideSelectFooter: {
    type: Boolean,
    default: false,
  },
  mediaType: {
    type: String,
    default: "",
  },
  onlyImage: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["callback", "selected"]);

const allowVideo = computed(() => {
  if (props.onlyImage || props.mediaType === "IMAGE") return false;
  if (props.isComponent && fileType.value === "pic") return false;
  return true;
});

const allowImage = computed(() => {
  if (props.mediaType === "VIDEO") return false;
  if (props.isComponent && fileType.value === "video") return false;
  return true;
});

const { proxy } = getCurrentInstance();

// 目录分组
const groupFormValidate = ref({
  id: "",
  level: 0,
  parentId: "0",
  directoryName: "",
});
const groupRuleValidate = {
  directoryName: [
    {
      required: true,
      message: "请输入分组名称",
      trigger: "blur",
    },
  ],
};
const enableGroup = ref(false);
const selectImage = ref(false);
const accessToken = ref({});
const loading = ref(false);
const fileType = ref("pic");
const showType = ref("list");
const modalVisible = ref(false);
const videoVisible = ref(false);
const picVisible = ref(false);
const fileVisible = ref(false);
const picTitle = ref("");
const videoTitle = ref("");
const fileTitle = ref("");
const pendingVideoUrl = ref("");
const modalTitle = ref("");
const activeRoleTab = ref("MANAGER");
const activeCategoryTab = ref("IMAGE");

const searchForm = reactive({
  name: "",
  fileKey: "",
  fileType: "",
  fileCategory: "IMAGE",
  userEnums: "MANAGER",
  pageNumber: 1,
  pageSize: 20,
  sort: "createTime",
  order: "desc",
});

const oldKey = ref("");
const form = ref({
  name: "",
  fileKey: "",
});
const file = ref({});
const formValidate = {
  name: [{ required: true, message: "不能为空", trigger: "blur" }],
  fileKey: [{ required: true, message: "不能为空", trigger: "blur" }],
};
const submitLoading = ref(false);
const selectList = ref([]);
const selectCount = ref(0);

const data = ref([]);
const total = ref(0);
const pageSizeOpts = ref([20, 40, 60, 100]);

const treeData = ref([]);
const treeDataDefault = ref([]);
const treeRenderKey = ref(0);
const selectedGroupData = ref(null);
const insertOrUpdate = ref("insert");
const groupLoading = ref(false);

const selectedOss = ref([]);

// 大图全屏浏览
const imageViewerVisible = ref(false);
const previewImageList = ref([]);
const previewImageIndex = ref(0);

// DOM refs
const upRef = ref(null);
const formRef = ref(null);
const formValidateRef = ref(null);
const dplayerRef = ref(null);

// 全选与半选联动
const isAllSelected = computed({
  get() {
    if (!data.value.length) return false;
    const currentKeys = data.value.map((item) => `${item.id},${item.url}`);
    return currentKeys.every((k) => selectedOss.value.includes(k));
  },
  set(val) {
    const currentKeys = data.value.map((item) => `${item.id},${item.url}`);
    if (val) {
      const merged = Array.from(new Set([...selectedOss.value, ...currentKeys]));
      selectedOss.value = merged;
      selectOssChange(merged);
    } else {
      const filtered = selectedOss.value.filter((k) => !currentKeys.includes(k));
      selectedOss.value = filtered;
      selectOssChange(filtered);
    }
  },
});

const isIndeterminate = computed(() => {
  if (!data.value.length) return false;
  const currentKeys = data.value.map((item) => `${item.id},${item.url}`);
  const selectedInPage = currentKeys.filter((k) => selectedOss.value.includes(k));
  return selectedInPage.length > 0 && selectedInPage.length < currentKeys.length;
});

function clearCurrentSelection() {
  selectedOss.value = [];
  selectOssChange([]);
}

watch(selectImage, (val) => {
  if (val) {
    if (props.isComponent) {
      activeRoleTab.value = "MANAGER";
      searchForm.userEnums = "MANAGER";
      init();
    } else if (!data.value.length) {
      init();
    }
  }
});

watch(
  () => props.choose,
  (val) => {
    if (val) selectImage.value = val;
  }
);

watch(selectedOss, (val) => {
  if (val && val.length && !(props.isComponent && selectImage.value)) {
    emit("callback", { url: val[val.length - 1].split(",")[1] });
  }
});

watch(
  () => props.initialize,
  (val) => {
    if (val && props.isComponent) {
      selectedOss.value = [];
      activeRoleTab.value = "MANAGER";
      searchForm.userEnums = "MANAGER";
      if (!allowVideo.value) {
        activeCategoryTab.value = "IMAGE";
        searchForm.fileCategory = "IMAGE";
      }
      delete searchForm.fileDirectoryId;
      selectedGroupData.value = null;
    }
  }
);

const canShowGroups = computed(() => {
  return activeRoleTab.value === "MANAGER";
});

const canUploadImages = computed(() => {
  return activeRoleTab.value === "MANAGER" && activeCategoryTab.value !== "FILE";
});

const uploadAccept = computed(() => {
  if (activeCategoryTab.value === "VIDEO") return "video/*";
  return "image/*";
});

const uploadButtonText = computed(() => {
  const textMap = {
    IMAGE: "上传图片",
    VIDEO: "上传视频",
  };
  return textMap[activeCategoryTab.value] || "上传图片";
});

const uploadData = computed(() => {
  const data = {
    userEnums: activeRoleTab.value,
    directoryType: activeRoleTab.value,
  };
  const directoryId = searchForm.fileDirectoryId;
  if (directoryId && directoryId !== "0") {
    data.directoryPath = directoryId;
  }
  return data;
});

function beforeUpload(file) {
  if (!canUploadImages.value) {
    ElMessage.warning("当前模块不支持上传");
    return false;
  }
  if (activeCategoryTab.value === "IMAGE") {
    const isImg =
      (file?.type && file.type.startsWith("image/")) ||
      /\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i.test(file?.name || "");
    if (!isImg) {
      ElMessage.warning("请上传图片格式文件");
      return false;
    }
  } else if (activeCategoryTab.value === "VIDEO") {
    const isVid =
      (file?.type && file.type.startsWith("video/")) ||
      /\.(mp4|webm|ogg|mov|avi|mkv)$/i.test(file?.name || "");
    if (!isVid) {
      ElMessage.warning("请上传视频格式文件");
      return false;
    }
  }
  const maxSize = 20480 * 1024;
  if (file && file.size > maxSize) {
    handleMaxSize(file);
    return false;
  }
  return true;
}

function handleTreeNodeClick(data) {
  if (data) {
    handleCateChange([data]);
  }
}

function onTreeDropdownCommand(cmd, data) {
  selectedGroupData.value = data;
  if (cmd === "edit") {
    handleContextMenuEdit(null, null, data);
  } else if (cmd === "delete") {
    handleContextMenuDelete();
  }
}

function handleRoleTabChange(name) {
  activeRoleTab.value = name;
  searchForm.pageNumber = 1;
  searchForm.userEnums = name;
  delete searchForm.fileDirectoryId;
  selectedGroupData.value = null;
  groupFormValidate.value.id = "";
  groupFormValidate.value.level = 0;
  selectedOss.value = [];
  updateTreeDataByRole();
  getDataList();
}

function handleCategoryTabChange(name) {
  activeCategoryTab.value = name;
  searchForm.fileCategory = name;
  searchForm.fileType = "";
  searchForm.pageNumber = 1;
  updateTreeDataByRole();
  getDataList();
}

function handleSearch() {
  searchForm.pageNumber = 1;
  getDataList();
}

function handleReset() {
  searchForm.name = "";
  searchForm.pageNumber = 1;
  getDataList();
}

function updateTreeDataByRole() {
  const currentTree = filterTreeByRole(treeDataDefault.value, activeRoleTab.value);
  const rootLabelMap = {
    IMAGE: "全部图片",
    VIDEO: "全部视频",
    FILE: "全部文件",
  };
  const rootTitle = rootLabelMap[activeCategoryTab.value] || "全部素材";
  treeData.value = [
    {
      title: rootTitle,
      label: "全部分类",
      value: "0",
      type: activeRoleTab.value,
      level: 0,
      children: [],
      id: "0",
      categoryId: 0,
    },
    ...currentTree,
  ];
  treeRenderKey.value += 1;
}

function filterTreeByRole(tree = [], role) {
  if (!tree || !tree.length) return [];
  return tree
    .filter((item) => item.type === role)
    .map((item) => ({
      ...item,
      children: [],
    }));
}

function selectOssChange(e) {
  if (props.maxSelect === 1 && e.length > 1) {
    const last = e[e.length - 1];
    selectedOss.value = [last];
    e = [last];
  }
  if (e) {
    selectList.value = e.map((item) => ({
      id: item.split(",")[0],
    }));
    selectCount.value = e.length;
    emit("selected", e);
  }
}

function handleCardClick(item, event) {
  if (props.isComponent && selectImage.value) {
    if (event?.target?.closest?.(".card-checkbox")) {
      return;
    }
    const key = `${item.id},${item.url}`;
    let next;
    if (props.maxSelect === 1) {
      next = selectedOss.value.includes(key) ? [] : [key];
    } else if (selectedOss.value.includes(key)) {
      next = selectedOss.value.filter((k) => k !== key);
    } else {
      next = [...selectedOss.value, key];
    }
    selectedOss.value = next;
    selectOssChange(next);
  } else {
    // 独立管理端模式：点击卡片直接预览
    previewFile(item);
  }
}

function pageChange(value) {
  searchForm.pageNumber = value;
  getDataList();
}

function changePageSize(val) {
  searchForm.pageSize = val;
  searchForm.pageNumber = 1;
  getDataList();
}

function handleContextMenuEdit(root, node, data) {
  insertOrUpdate.value = "update";
  enableGroup.value = true;
  groupFormValidate.value.id = data.value;
  groupFormValidate.value.directoryName = data.title || data.label;
  groupFormValidate.value.level = 0;
  groupFormValidate.value.parentId = "0";
}

async function handleContextMenuDelete() {
  if (!selectedGroupData.value) return;
  ElMessageBox.confirm("是否删除该分组？", "提示", {
    type: "warning",
    confirmButtonText: "确认删除",
    cancelButtonText: "取消",
  })
    .then(async () => {
      const res = await delFileDirectory(selectedGroupData.value.value);
      if (res.success) {
        ElMessage.success("删除成功!");
        delete searchForm.fileDirectoryId;
        selectedGroupData.value = null;
        getDataList();
        getAllList();
      }
    })
    .catch(() => {});
}

async function submitAddGroup() {
  formValidateRef.value.validate(async (valid) => {
    if (valid) {
      let res;
      const params = {
        directoryName: groupFormValidate.value.directoryName,
        level: 0,
        parentId: "0",
        directoryType: activeRoleTab.value,
      };
      if (insertOrUpdate.value === "insert") {
        res = await addFileDirectory(params);
      } else {
        params.id = groupFormValidate.value.id;
        res = await updateFileDirectory(params);
      }

      if (res.success) {
        ElMessage.success("操作成功!");
        enableGroup.value = false;
        getAllList();
      }
    } else {
      ElMessage.error("请填写完整信息!");
    }
  });
}

function handleClickAddGroup() {
  insertOrUpdate.value = "insert";
  groupFormValidate.value = {
    id: "",
    level: 0,
    parentId: "0",
    directoryName: "",
  };
  enableGroup.value = true;
}

function copyFileUrl(row) {
  const text = row.url;
  if (navigator?.clipboard?.writeText) {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        ElMessage.success("文件链接已复制到剪贴板");
      })
      .catch(() => {
        fallbackCopyText(text);
      });
  } else {
    fallbackCopyText(text);
  }
}

function fallbackCopyText(text) {
  const textArea = document.createElement("textarea");
  textArea.value = text;
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();
  try {
    document.execCommand("copy");
    ElMessage.success("文件链接已复制到剪贴板");
  } catch (err) {
    ElMessage.error("复制失败，请手动复制");
  }
  document.body.removeChild(textArea);
}

function getAllList(parent_id) {
  getFileDirectory(parent_id).then((res) => {
    if (res.success) {
      treeDataDefault.value = getTree(res.result);
      updateTreeDataByRole();
    }
  });
}

function getTree(tree = []) {
  const flat = [];
  const walk = (nodes) => {
    if (!nodes || !nodes.length) return;
    nodes.forEach((item) => {
      flat.push({
        title: item.directoryName,
        value: item.id,
        type: item.directoryType,
        label: item.directoryName,
        level: 0,
        expand: false,
        selected: false,
        contextmenu: false,
        parentId: "0",
        children: [],
      });
      if (item.children && item.children.length) {
        walk(item.children);
      }
    });
  };
  walk(tree);
  return flat;
}

function handleCateChange(data) {
  if (data && data[0]) {
    selectedGroupData.value = data[0];
    const { value, type } = data[0];
    searchForm.fileDirectoryId = value;
    if (value === "0" || value === 0) {
      delete searchForm.fileDirectoryId;
    }
    searchForm.userEnums = type || activeRoleTab.value;
    searchForm.pageNumber = 1;
    getDataList();
  }
}

function handleSelectConfirm() {
  if (!selectedOss.value.length) {
    ElMessage.warning("请选择图片");
    return;
  }
  const last = selectedOss.value[selectedOss.value.length - 1];
  emit("callback", { url: last.split(",")[1] });
}

function handleSelectCancel() {
  selectedOss.value = [];
  emit("callback", { url: "" });
}

function init() {
  accessToken.value = {
    accessToken: getStore("accessToken"),
  };
  searchForm.userEnums = activeRoleTab.value;
  searchForm.fileCategory = activeCategoryTab.value;
  getDataList();
  getAllList();
}

function handleImagePreview(item) {
  const imageList = data.value.filter((i) => isImageFile(i));
  previewImageList.value = imageList.map((i) => i.url);
  const idx = imageList.findIndex((i) => i.id === item.id);
  previewImageIndex.value = idx >= 0 ? idx : 0;
  imageViewerVisible.value = true;
}

function showFile(v) {
  prepareFileMeta(v);
  fileTitle.value = v.name || "文件预览";
  fileVisible.value = true;
}

function showVideo(v) {
  prepareFileMeta(v);
  videoTitle.value = v.name || "视频预览";
  pendingVideoUrl.value = v.url;
  videoVisible.value = true;
}

function initDPlayer() {
  const container = dplayerRef.value;
  if (!container || !pendingVideoUrl.value) return;
  if (dp) {
    dp.destroy();
    dp = null;
  }
  dp = new DPlayer({
    container,
    screenshot: true,
    video: {
      url: pendingVideoUrl.value,
    },
  });
}

function closeVideo() {
  if (dp) {
    dp.destroy();
    dp = null;
  }
  pendingVideoUrl.value = "";
}

function getDataList() {
  loading.value = true;
  getFileListData(searchForm)
    .then((res) => {
      if (res && res.success && res.result) {
        let records = res.result.records || [];
        if (!allowVideo.value) {
          records = records.filter((item) => !isVideoFile(item));
        }
        data.value = records;
        total.value = res.result.total || 0;
      } else {
        data.value = [];
        total.value = 0;
      }
    })
    .catch(() => {
      data.value = [];
      total.value = 0;
    })
    .finally(() => {
      loading.value = false;
    });
}

function changeFileType() {
  const categoryMap = {
    pic: "IMAGE",
    video: "VIDEO",
    file: props.isComponent ? "IMAGE" : "FILE",
    all: "IMAGE",
  };
  const category = categoryMap[fileType.value] || "IMAGE";
  activeCategoryTab.value = category;
  handleCategoryTabChange(category);
}

function isImageFile(row) {
  return row?.fileCategory === "IMAGE" || (row?.fileType && row.fileType.includes("image"));
}

function isVideoFile(row) {
  return row?.fileCategory === "VIDEO" || (row?.fileType && row.fileType.includes("video"));
}

function isPdfFile(row) {
  return (
    row?.fileType === "application/pdf" ||
    (row?.name && row.name.toLowerCase().endsWith(".pdf"))
  );
}

function previewFile(item) {
  if (isVideoFile(item)) {
    showVideo(item);
  } else if (isImageFile(item)) {
    handleImagePreview(item);
  } else {
    showFile(item);
  }
}

function prepareFileMeta(v) {
  file.value = v;
  file.value.msize = ((v.fileSize * 1.0) / (1024 * 1024)).toFixed(2) + " MB";
}

function handleMaxSize() {
  ElMessage.warning("所选文件大小过大，不得超过 20MB");
}

function handleSuccess(res, file) {
  if (!canUploadImages.value) {
    ElMessage.warning("仅管理员模块支持上传文件");
    return;
  }
  if (res.success) {
    ElMessage.success("上传文件 " + file.name + " 成功");
    getDataList();
  } else {
    ElMessage.error(res.message);
  }
}

function handleError(error) {
  ElMessage.error(error ? error.toString() : "上传失败");
}

function handleCancel() {
  modalVisible.value = false;
}

function download(v) {
  window.open(v.url + "?attname=&response-content-type=application/octet-stream");
}

function removeAll() {
  if (selectCount.value <= 0) {
    ElMessage.warning("您还未选择要删除的数据");
    return;
  }
  ElMessageBox.confirm(
    "您确认要删除所选的 " + selectCount.value + " 个文件?",
    "确认删除",
    {
      type: "warning",
      confirmButtonText: "确定删除",
      cancelButtonText: "取消",
    }
  )
    .then(() => {
      let ids = selectList.value.map((e) => e.id).join(",");
      deleteFile(ids).then((res) => {
        if (res.success) {
          selectedOss.value = [];
          selectList.value = [];
          selectCount.value = 0;
          init();
          ElMessage.success("批量删除文件成功");
        }
      });
    })
    .catch(() => {});
}

function remove(v) {
  ElMessageBox.confirm("您确认要删除文件 " + v.name + " ?", "确认删除", {
    type: "warning",
    confirmButtonText: "确定删除",
    cancelButtonText: "取消",
  })
    .then(() => {
      deleteFile(v.id).then((res) => {
        if (res.success) {
          ElMessage.success("删除文件 " + v.name + " 成功");
          selectedOss.value = selectedOss.value.filter((k) => !k.startsWith(`${v.id},`));
          getDataList();
        }
      });
    })
    .catch(() => {});
}

function handleSubmit() {
  formRef.value.validate((valid) => {
    if (valid) {
      submitLoading.value = true;
      let params = {
        id: form.value.id,
        key: oldKey.value,
        newKey: form.value.fileKey,
        newName: form.value.name,
      };
      renameFile(params)
        .then((res) => {
          submitLoading.value = false;
          if (res.success) {
            ElMessage.success("操作成功");
            getDataList();
            modalVisible.value = false;
          }
        })
        .catch(() => {
          submitLoading.value = false;
        });
    }
  });
}

function rename(v) {
  modalTitle.value = "编辑文件名";
  for (let attr in v) {
    if (v[attr] == null) {
      v[attr] = "";
    }
  }
  let str = JSON.stringify(v);
  let parsed = JSON.parse(str);
  form.value = parsed;
  oldKey.value = parsed.fileKey;
  modalVisible.value = true;
}

onMounted(() => {
  if (!props.isComponent) {
    init();
  } else {
    searchForm.pageSize = 20;
  }
});

defineExpose({ selectImage, fileType, changeFileType });

function formatFileSize(size) {
  if (!size || isNaN(size)) return "0 KB";
  const num = Number(size);
  if (num < 1024) return num + " B";
  if (num < 1024 * 1024) return Math.round(num / 1024) + " KB";
  return (num / (1024 * 1024)).toFixed(1) + " MB";
}

function getFileFormat(item) {
  if (item?.fileType) {
    const parts = item.fileType.split("/");
    if (parts.length > 1 && parts[1]) {
      return parts[1].toUpperCase();
    }
  }
  if (item?.name) {
    const ext = item.name.split(".").pop();
    if (ext && ext !== item.name) {
      return ext.toUpperCase();
    }
  }
  return "IMG";
}

function getFileExt(item) {
  if (item?.name && item.name.includes(".")) {
    return item.name.split(".").pop().toUpperCase();
  }
  return getFileFormat(item);
}

function getFileBadgeClass(item) {
  const ext = getFileExt(item).toLowerCase();
  if (ext === "pdf") return "pdf";
  if (["doc", "docx"].includes(ext)) return "doc";
  if (["xls", "xlsx", "csv"].includes(ext)) return "xls";
  if (["zip", "rar", "7z", "tar", "gz"].includes(ext)) return "zip";
  if (["html", "htm", "js", "ts", "json", "xml", "css"].includes(ext)) return "code";
  return "generic";
}

function getFileDimension(item) {
  if (item?.width && item?.height) {
    return `${item.width}x${item.height}`;
  }
  return "未知尺寸";
}

function getFileSubInfo(item) {
  const fmt = getFileFormat(item);
  const dim = getFileDimension(item);
  const size = formatFileSize(item.fileSize);
  return `${fmt} · ${dim} · ${size}`;
}
</script>
