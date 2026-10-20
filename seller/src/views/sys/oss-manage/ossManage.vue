<style lang="scss">
@import "./ossManage.scss";

.table {
  flex: 11;
}

.el-card {
  width: 100%;
}

.modal-footer {
  text-align: center;

  > * {
    margin: 0 10px;
  }
}

.oss-select-footer {
  margin-top: 16px;
  padding-top: 12px;
  border-top: 1px solid #ededed;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.oss-group-tree {
  flex: 1;
  padding: 4px 4px 0;

  :deep(.el-tree-node__expand-icon) {
    display: none;
  }

  :deep(.el-tree-node) {
    margin-bottom: 4px;
  }

  :deep(.el-tree-node__content) {
    padding: 0 10px !important;
    height: 38px;
    border-radius: 6px;
    font-size: 14px;
    line-height: 38px;
  }

  :deep(.el-tree-node__content:hover) {
    background: #f5f7fa;
  }

  :deep(.el-tree-node.is-current > .el-tree-node__content) {
    background: var(--el-color-primary-light-9);
    color: var(--el-color-primary);
    font-weight: 500;
  }
}

.oss-tree-node {
  display: inline-flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding-right: 4px;
  font-size: 14px;

  &:hover .oss-tree-more {
    opacity: 1;
  }
}

.oss-tree-more {
  cursor: pointer;
  color: #909399;
  padding: 0 4px;
  font-size: 16px;
  opacity: 0;
  transition: opacity 0.2s;

  &:hover {
    color: var(--el-color-primary);
  }
}

.file-preview-fallback {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 16px;
  color: #606266;

  .file-preview-name {
    margin: 16px 0 8px;
    font-size: 16px;
    font-weight: 500;
    word-break: break-all;
    text-align: center;
  }

  .file-preview-tip {
    margin: 0 0 20px;
    color: #909399;
  }
}

</style>
<template>
  <div class="search oss-manage" :class="{ 'oss-manage-picker': isComponent }">
    <div class="oss-panel">
      <div class="oss-toolbar">
        <div class="oss-tabs">
          <div
            class="oss-tab"
            :class="{ active: activeCategoryTab === 'IMAGE' }"
            @click="handleCategoryTabChange('IMAGE')"
          >图片</div>
          <div
            class="oss-tab"
            :class="{ active: activeCategoryTab === 'VIDEO' }"
            @click="handleCategoryTabChange('VIDEO')"
          >视频</div>
          <div
            v-if="!isComponent"
            class="oss-tab"
            :class="{ active: activeCategoryTab === 'FILE' }"
            @click="handleCategoryTabChange('FILE')"
          >文件</div>
        </div>
        <div class="oss-actions">
          <el-upload
            v-if="canUploadImages"
            ref="upRef"
            :action="sellerUrl + '/store/common/upload/file'"
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
            <el-button type="primary">{{ uploadButtonText }}</el-button>
          </el-upload>
          <el-button v-if="!isComponent && showType == 'list'" @click="removeAll">批量删除</el-button>
        </div>
      </div>

      <el-row class="oss-manage-box">
        <el-col v-if="canShowGroups" :span="isComponent ? 5 : 4">
          <div class="oss-side">
            <div v-if="!isComponent" class="oss-add-group">
              <el-button class="oss-add-group-btn" @click="handleClickAddGroup">+ 添加分组</el-button>
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
              <template #default="{ data }">
                <span v-if="data" class="oss-tree-node">
                  <span>{{ data.title }}</span>
                  <el-dropdown
                    v-if="data.value !== '0' && !isComponent"
                    trigger="click"
                    @command="(cmd) => onTreeDropdownCommand(cmd, data)"
                  >
                    <span class="oss-tree-more" @click.stop>···</span>
                    <template #dropdown>
                      <el-dropdown-menu>
                        <el-dropdown-item command="edit">编辑</el-dropdown-item>
                        <el-dropdown-item command="delete">删除</el-dropdown-item>
                      </el-dropdown-menu>
                    </template>
                  </el-dropdown>
                </span>
              </template>
            </el-tree>
          </div>
        </el-col>
        <el-col :span="canShowGroups ? (isComponent ? 19 : 20) : 24">
          <div class="oss-main">
            <el-checkbox-group v-model="selectedOss" @change="selectOssChange">
              <div class="oss-grid">
                <div v-for="(item, index) in data" :key="index" class="oss-grid-item">
                  <div
                    class="oss-card"
                    :class="{
                      'is-checked': selectedOss.includes(item.id + ',' + item.url),
                      'oss-card-selectable': isComponent && selectImage,
                    }"
                    @mouseenter="onMouseOver(item, index)"
                    @mouseleave="onMouseOut(item, index)"
                    @click="handleCardClick(item, $event)"
                  >
                    <el-checkbox
                      :value="item.id + ',' + item.url"
                      class="oss-card-check"
                      @click.stop
                    />
                    <img v-if="isImageFile(item)" :src="item.url" alt="" />
                    <video
                      v-else-if="isVideoFile(item)"
                      class="card-media"
                      :src="item.url"
                      muted
                    />
                    <div v-else class="card-file">
                      <el-icon :size="28"><Document /></el-icon>
                    </div>
                    <div v-if="item.isShowPreview" class="oss-card-ops">
                      <div @click.prevent="download(item)">
                        <el-tooltip content="下载" placement="top">
                          <el-icon :size="18"><Download /></el-icon>
                        </el-tooltip>
                      </div>
                      <div @click.prevent="remove(item)">
                        <el-tooltip content="删除" placement="top">
                          <el-icon :size="18"><Delete /></el-icon>
                        </el-tooltip>
                      </div>
                      <div
                        @click.prevent="previewFile(item)"
                      >
                        <el-tooltip content="预览" placement="top">
                          <el-icon :size="22"><View /></el-icon>
                        </el-tooltip>
                      </div>
                    </div>
                  </div>
                  <el-tooltip :content="item.name" placement="bottom">
                    <div class="oss-name">{{ item.name }}</div>
                  </el-tooltip>
                </div>
              </div>
            </el-checkbox-group>
            <el-empty v-if="!loading && !data.length" description="暂无文件" :image-size="100" />
            <div class="oss-pager">
              <el-pagination
                v-model:current-page="searchForm.pageNumber"
                v-model:page-size="searchForm.pageSize"
                :total="total"
                layout="total, prev, pager, next, jumper"
                size="small"
                @current-change="pageChange"
              />
            </div>
            <div v-if="isComponent && selectImage && !hideSelectFooter" class="oss-select-footer">
              <el-button @click="handleSelectCancel">取消</el-button>
              <el-button type="primary" @click="handleSelectConfirm">确定</el-button>
            </div>
          </div>
        </el-col>
      </el-row>
    </div>
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

    <el-dialog v-model="picVisible" :title="picTitle" width="600px">
      <img
        :src="file.url"
        alt="图片加载失败"
        style="width: 100%; margin: 0 auto; display: block"
      />
      <template #footer>
        <span>文件类型：{{ file.fileType }} 文件大小：{{ file.msize }} 创建时间：{{ file.createTime }}</span>
      </template>
    </el-dialog>

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
        <p class="file-preview-tip">该文件类型暂不支持在线预览</p>
        <el-button type="primary" @click="download(file)">下载文件</el-button>
      </div>
      <template #footer>
        <span>文件类型：{{ file.fileType }} 文件大小：{{ file.msize }} 创建时间：{{ file.createTime }}</span>
      </template>
    </el-dialog>

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
        <span>文件类型：{{ file.fileType }} 文件大小：{{ file.msize }} 创建时间：{{ file.createTime }}</span>
      </template>
    </el-dialog>

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
          <el-input v-model="groupFormValidate.directoryName" />
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
/**
 * 商家素材管理（OSS 资源库）。
 * - 固定 STORE 角色，仅管理本店素材，API 走 /store/common/*
 * - 支持图片/视频/文件分类、分组 CRUD、上传、预览、下载、删除
 * - isComponent=true 时作为弹窗选择器嵌入商品编辑、店铺装修等页面
 */

// DPlayer 实例：原为模块级变量（多实例共享），保持原有作用域
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
import { Delete, Download, View, Document } from "@element-plus/icons-vue";
import {
  addFileDirectory,
  deleteFile,
  delFileDirectory,
  getFileDirectory,
  getFileListData,
  renameFile,
  updateFileDirectory,
} from "@/api/index";
import { sellerUrl } from "@/libs/axios";
import { getStore } from "@/libs/storage";

defineOptions({ name: "oss-manage" });

const props = defineProps({
  isComponent: {
    default: false,
    type: Boolean,
  },
  choose: {
    type: String,
    default: ""
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
});
const emit = defineEmits(["callback", "selected"]);

// $forceUpdate 依赖组件实例
const { proxy } = getCurrentInstance();

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
const enableGroup = ref(false); // 是否展示分组
const selectImage = ref(false); //是否是选择
const accessToken = ref({}); // 上传token鉴权
const loading = ref(false); // 表单加载状态
const showType = ref("list"); // 展示类型
const modalVisible = ref(false); // 添加或编辑显示
const videoVisible = ref(false); // 视频预览
const picVisible = ref(false); // 图片预览
const fileVisible = ref(false); // 文件预览
const picTitle = ref(""); // 图片 title
const videoTitle = ref(""); // 视频 title
const fileTitle = ref(""); // 文件 title
const pendingVideoUrl = ref(""); // 待播放视频地址
const modalTitle = ref(""); // 添加或编辑标题
const activeRoleTab = ref("STORE"); // 商家固定为 STORE，与素材 ownerId（storeId）一致
const activeCategoryTab = ref("IMAGE");
const searchForm = reactive({
  // 搜索框对应data对象
  name: "",
  fileKey: "",
  fileType: "",
  fileCategory: "IMAGE",
  userEnums: "STORE",
  pageNumber: 1, // 当前页数
  pageSize: 20, // 页面大小
  sort: "createTime", // 默认排序字段
  order: "desc", // 默认排序方式
});
const oldKey = ref(""); // 请求参数
const form = ref({
  // 表单
  name: "",
  fileKey: "",
});
const file = ref({}); // 文件数据
// 表单验证规则
const formValidate = {
  name: [{required: true, message: "不能为空", trigger: "blur"}],
  fileKey: [{required: true, message: "不能为空", trigger: "blur"}],
};
const submitLoading = ref(false); // 添加或编辑提交状态
const selectList = ref([]); // 多选数据
const selectCount = ref(0); // 多选计数
const data = ref([]); // 表单数据
const total = ref(0); // 表单数据总数
const pageSizeOpts = ref([5, 10, 20]); // 页码展示项
const list = ref([]); // 列表
//树结构
const treeData = ref([]);
const treeDataDefault = ref([]);
const treeRenderKey = ref(0);
const selectedGroupData = ref("");
const insertOrUpdate = ref("insert");
const groupLoading = ref(false);
// 图片列表
const selectedOss = ref([]);

// 模板 ref：up/form/formValidate 与顶层变量重名，改名避免互相覆盖
const upRef = ref(null);
const formRef = ref(null);
const formValidateRef = ref(null);
const dplayerRef = ref(null);

watch(selectImage, (val) => {
  if (val) {
    if (props.isComponent) {
      // 弹窗选图模式：加载本店素材，而非平台管理员资源
      activeRoleTab.value = "STORE";
      searchForm.userEnums = "STORE";
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
// 弹窗打开时重置状态并加载分组与素材列表
watch(
  () => props.initialize,
  (val) => {
    if (val && props.isComponent) {
      selectedOss.value = [];
      activeRoleTab.value = "STORE";
      activeCategoryTab.value = "IMAGE";
      searchForm.userEnums = "STORE";
      searchForm.fileCategory = "IMAGE";
      delete searchForm.fileDirectoryId;
      selectedGroupData.value = "";
      selectImage.value = true;
    }
  }
);

// 商家端展示分组树与分组维护能力
const canShowGroups = computed(() => {
  return activeRoleTab.value === "STORE";
});
// 商家端允许上传图片/视频（文件仅在发票上传业务中使用）
const canUploadImages = computed(() => {
  return activeRoleTab.value === "STORE" && activeCategoryTab.value !== "FILE";
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
    const isImg = (file?.type && file.type.startsWith("image/")) || /\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i.test(file?.name || "");
    if (!isImg) {
      ElMessage.warning("请上传图片格式文件");
      return false;
    }
  } else if (activeCategoryTab.value === "VIDEO") {
    const isVid = (file?.type && file.type.startsWith("video/")) || /\.(mp4|webm|ogg|mov|avi|mkv)$/i.test(file?.name || "");
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
function onMouseOver(item, index) {
  data.value[index].isShowPreview = true;
  proxy.$forceUpdate();
}
function onMouseOut(item, index) {
  data.value[index].isShowPreview = false;
}
function handleCategoryTabChange(name) {
  activeCategoryTab.value = name;
  searchForm.fileCategory = name;
  searchForm.fileType = "";
  searchForm.pageNumber = 1;
  delete searchForm.fileDirectoryId;
  selectedGroupData.value = "";
  selectedOss.value = [];
  if (showType.value === "list") {
    searchForm.pageSize = 20;
  } else {
    searchForm.pageSize = 12;
  }
  updateTreeDataByRole();
  getDataList();
}
function updateTreeDataByRole() {
  const rootTitleMap = {
    IMAGE: "全部图片",
    VIDEO: "全部视频",
    FILE: "全部文件",
  };
  const currentTree = filterTreeByRole(treeDataDefault.value, activeRoleTab.value);
  treeData.value = [
    {
      title: rootTitleMap[activeCategoryTab.value] || "全部图片",
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
// 复选框值改变时触发
function selectOssChange(e) {
  if (props.maxSelect === 1 && e.length > 1) {
    const last = e[e.length - 1];
    selectedOss.value = [last];
    e = [last];
  }
  if (e) {
    selectList.value = e.map(item => {
      return {id: item.split(',')[0]}
    });
    selectCount.value = e.length;
    // let size = 0;
    // e.forEach((item) => {size += item.fileSize * 1.0;});
    // totalSize.value = ((size * 1.0) / (1024 * 1024)).toFixed(2) + " MB";
    emit("selected", e);
  }
}
function handleCardClick(item, event) {
  if (!(props.isComponent && selectImage.value)) return;
  if (event?.target?.closest?.(".preview") || event?.target?.closest?.(".card-checkbox")) {
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
}
// 页码改变时回调
function pageChange(value) {
  selectedOss.value = [];
  searchForm.pageNumber = value;
  getDataList();
}

// 编辑分组
function handleContextMenuEdit(root, node, data) {
  insertOrUpdate.value = "update";
  enableGroup.value = true;
  groupFormValidate.value.id = data.value;
  groupFormValidate.value.directoryName = data.title || data.label;
  groupFormValidate.value.level = 0;
  groupFormValidate.value.parentId = "0";
}
// 删除分组
async function handleContextMenuDelete(val) {
  ElMessageBox.confirm("是否删除该分组", "提示", { type: "warning" }).then(async () => {
      const res = await delFileDirectory(selectedGroupData.value.value);
      if (res.success) {
        ElMessage.success("删除成功!");
        getDataList();
        getAllList();
      }
  }).catch(() => {});
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

// 获取全部文件目录
function getAllList(parent_id) {
  loading.value = true;
  getFileDirectory(parent_id).then((res) => {
    loading.value = false;
    if (res.success) {
      treeDataDefault.value = getTree(res.result);
      updateTreeDataByRole();
    }
  });
}
// 文件目录分类格式化：仅展示一级分组
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

// 选择分类回调
function handleCateChange(data) {
  if (data) {
    selectedGroupData.value = data[0];
    let {value, type, level} = data[0];
    list.value.push({value, type, level});
    searchForm.fileDirectoryId = value;
    if (value === "0" || value === 0) {
      delete searchForm.fileDirectoryId;
    }
    searchForm.userEnums = type || activeRoleTab.value;
    getDataList();
    selectedOss.value = [];
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
// 初始化数据
function init() {
  accessToken.value = {
    accessToken: getStore("accessToken"),
  };
  searchForm.userEnums = activeRoleTab.value;
  searchForm.fileCategory = activeCategoryTab.value;
  getDataList();
  getAllList();
}
// 查看大图
function showPic(v) {
  prepareFileMeta(v);
  picTitle.value = v.name || "图片预览";
  picVisible.value = true;
}
// 查看文件（PDF 等）
function showFile(v) {
  prepareFileMeta(v);
  fileTitle.value = v.name || "文件预览";
  fileVisible.value = true;
}
// 查看视频
function showVideo(v) {
  prepareFileMeta(v);
  videoTitle.value = v.name || "视频预览";
  pendingVideoUrl.value = v.url;
  videoVisible.value = true;
}
async function initDPlayer() {
  const container = dplayerRef.value;
  if (!container || !pendingVideoUrl.value) return;
  if (dp) {
    dp.destroy();
    dp = null;
  }
  const { default: DPlayer } = await import("dplayer");
  dp = new DPlayer({
    container,
    screenshot: true,
    video: {
      url: pendingVideoUrl.value,
    },
  });
}
// 关闭视频
function closeVideo() {
  if (dp) {
    dp.destroy();
    dp = null;
  }
  pendingVideoUrl.value = "";
}
// 获取列表数据
function getDataList(type = null) {
  if (showType.value == "list") {
    pageSizeOpts.value = [10, 20, 50];
  } else {
    pageSizeOpts.value = [12, 24, 48];
  }
  loading.value = true;
  getFileListData(searchForm)
    .then((res) => {
      if (res && res.success && res.result) {
        data.value = res.result.records || [];
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
    showPic(item);
  } else {
    showFile(item);
  }
}
function prepareFileMeta(v) {
  file.value = v;
  file.value.msize = ((v.fileSize * 1.0) / (1024 * 1024)).toFixed(2) + " MB";
}
// 上传文件超过大小限制
function handleMaxSize() {
  ElMessage.warning("所选文件大小过大，不得超过 20MB");
}
// 上传成功回调
function handleSuccess(res, file) {
  if (!canUploadImages.value) {
    ElMessage.warning("当前模块不支持上传");
    return;
  }
  if (res.success) {
    ElMessage.success("上传文件 " + file.name + " 成功");
    getDataList();
  } else {
    ElMessage.error(res.message);
  }
}
// 上传失败回调
function handleError(error, file, fileList) {
  ElMessage.error(error.toString());
}
// 取消修改文件名
function handleCancel() {
  modalVisible.value = false;
}
// 下载文件
function download(v) {
  window.open(
    v.url + "?attname=&response-content-type=application/octet-stream"
  );
}
// 批量删除文件
function removeAll() {
  if (selectCount.value <= 0) {
    ElMessage.warning("您还未选择要删除的数据");
    return;
  }
  ElMessageBox.confirm("您确认要删除所选的 " + selectCount.value + " 个文件?", "确认删除", { type: "warning" }).then(() => {
      let ids = "";
      selectList.value.forEach(function (e) {
        ids += e.id + ",";
      });
      ids = ids.substring(0, ids.length - 1);
      deleteFile(ids).then((res) => {
        if (res.success) {
          selectedOss.value = [];
          // clearSelectAll();
          init();
          ElMessage.success("批量删除文件成功");
        }
      })
        .catch((err) => {});
  }).catch(() => {});
}
// 单个删除文件
function remove(v) {
  ElMessageBox.confirm("您确认要删除文件 " + v.name + " ?", "确认删除", { type: "warning" }).then(() => {
      deleteFile(v.id).then((res) => {
        if (res.success) {
          ElMessage.success("删除文件 " + v.name + " 成功");
          getDataList();
        }
      })
  }).catch(() => {});
}
// 提交修改文件名
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
      renameFile(params).then((res) => {
        submitLoading.value = false;
        if (res.success) {
          ElMessage.success("操作成功");
          getDataList();
          modalVisible.value = false;
        }
      });
    }
  });
}

onMounted(() => {
  if (!props.isComponent) {
    // 是组件的话，初始化不调用接口
    init();
  } else {
    searchForm.pageSize = 18; // 页面大小
  }
});

// 父组件通过 ref 设置 selectImage 开启选图模式
defineExpose({ selectImage });
</script>
