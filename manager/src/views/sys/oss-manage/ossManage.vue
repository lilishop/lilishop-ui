<style lang="scss">
@import "./ossManage.scss";

.group-row {
  padding-top: 16px;
  margin-top: 8px;
  border-top: 1px solid #ededed;
  display: flex;
  align-items: center;
  justify-content: center;

  > * {
    margin-right: 10px;
  }
}

.article-category {
  flex: 2;
  min-width: 200px;
}

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

.tab-empty {
  padding: 48px 0;
  color: #999;
  text-align: center;
}

.tabs-card {
  margin-bottom: 16px;
}

.oss-group-tree {
  padding: 4px 8px 0;

  :deep(.el-tree-node__expand-icon) {
    display: none;
  }

  :deep(.el-tree-node) {
    margin-bottom: 6px;
  }

  :deep(.el-tree-node__content) {
    padding: 0 10px !important;
    height: 42px;
    border-radius: 6px;
    font-size: 15px;
    line-height: 42px;
  }

  :deep(.el-tree-node__content:hover) {
    background: #f5f7fa;
  }

  :deep(.el-tree-node.is-current > .el-tree-node__content) {
    background: #ecf5ff;
    color: #409eff;
    font-weight: 500;
  }
}

.oss-tree-node {
  display: inline-flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding-right: 4px;
  font-size: 15px;
}

.oss-tree-more {
  cursor: pointer;
  color: #909399;
  padding: 0 4px;
  font-size: 16px;
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
  <div class="search">
    <el-card v-if="!isComponent" class="tabs-card">
      <el-tabs v-model="activeRoleTab" @tab-change="handleRoleTabChange">
        <el-tab-pane label="管理员" name="MANAGER" />
        <el-tab-pane label="商家" name="STORE" />
        <el-tab-pane label="用户" name="MEMBER" />
        <el-tab-pane label="客服" name="CUSTOMER" />
      </el-tabs>
    </el-card>
    <el-card class="tabs-card category-tabs-card">
      <el-tabs v-model="activeCategoryTab" @tab-change="handleCategoryTabChange">
        <el-tab-pane label="图片" name="IMAGE" />
        <el-tab-pane label="视频" name="VIDEO" />
        <el-tab-pane v-if="!isComponent" label="文件" name="FILE" />
      </el-tabs>
    </el-card>
    <el-row>
      <el-card>
        <div>
          <el-row class="oss-manage-box">
            <el-col v-if="canShowGroups" :span="isComponent ? 5 : 4">
              <div class="file-list">
                <div class="article-category mr_10">
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
                  <div v-if="!isComponent" class="group-row flex">
                    <el-button @click="handleClickAddGroup">添加分组</el-button>
                  </div>
                </div>
              </div>
            </el-col>
            <el-col :span="canShowGroups ? (isComponent ? 19 : 20) : 24">
              <div class="pic-list">
                <div>
                  <div class="oss-operation padding-row" style="display: flex; flex-direction: row-reverse">
                    <div>
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
                        <el-button>{{ uploadButtonText }}</el-button>
                      </el-upload>
                      <el-button v-if="!isComponent && showType == 'list'" @click="removeAll">批量删除</el-button>
                    </div>
                  </div>
                </div>
                <div>
                  <el-checkbox-group v-model="selectedOss" @change="selectOssChange">
                    <div class="img-box">
                      <div v-for="(item, index) in data" :key="index" class="img-item">
                        <div
                          class="card"
                          :class="{
                            'custom-checkbox-card-checked': selectedOss.includes(item.id + ',' + item.url),
                            'oss-card-selectable': isComponent && selectImage,
                          }"
                          @mouseenter="onMouseOver(item, index)"
                          @mouseleave="onMouseOut(item, index)"
                          @click="handleCardClick(item, $event)"
                        >
                          <el-checkbox
                            :value="item.id + ',' + item.url"
                            class="card-checkbox"
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
                          <div v-if="item.isShowPreview" class="preview">
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
                          <div class="text">{{ item.name }}</div>
                        </el-tooltip>
                      </div>
                    </div>
                  </el-checkbox-group>
                </div>
                <div class="page-box">
                  <el-pagination
                    v-model:current-page="searchForm.pageNumber"
                    v-model:page-size="searchForm.pageSize"
                    :total="total"
                    layout="prev, pager, next, jumper"
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
      </el-card>
    </el-row>
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
import DPlayer from "dplayer";
import {managerApiUrl} from "@/libs/axios";
import config from "@/config/index";
import playIcon from "@/assets/play.png";
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

// managerApiUrl 上传文件路径、config api地址：原 data 中直接引用 import，模板直接使用 import 绑定
const fileDirectoryId = ref("");
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
const fileType = ref("pic"); // 兼容外部调用：pic / video
const showType = ref("list"); // 展示类型
const modalVisible = ref(false); // 添加或编辑显示
const uploadVisible = ref(false); // 上传展示
const videoVisible = ref(false); // 视频预览
const picVisible = ref(false); // 图片预览
const fileVisible = ref(false); // 文件预览
const picTitle = ref(""); // 图片 title
const videoTitle = ref(""); // 视频 title
const fileTitle = ref(""); // 文件 title
const pendingVideoUrl = ref(""); // 待播放视频地址
const modalTitle = ref(""); // 添加或编辑标题
const activeRoleTab = ref("MANAGER");
const activeCategoryTab = ref("IMAGE");
const searchForm = reactive({
  // 搜索框对应data对象
  name: "",
  fileKey: "",
  fileType: "",
  fileCategory: "IMAGE",
  userEnums: "MANAGER",
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
const totalSize = ref(""); // 文件大小统计
const columns = ref([
  // 表头
  {
    type: "selection",
    width: 60,
    align: "center",
  },
  {
    title: "缩略图(点击预览)",
    key: "url",
    width: 300,
    align: "center",
    render: (h, params) => {
      if (isImageFile(params.row)) {
        return h("img", {
          attrs: {
            src: params.row.url || "",
            alt: "加载图片失败",
          },
          style: {
            cursor: "pointer",
            width: "80px",
            height: "60px",
            margin: "10px 0",
            "object-fit": "contain",
          },
          on: {
            click: () => {
              showPic(params.row);
            },
          },
        });
      } else if (isVideoFile(params.row)) {
        // 如果视频文件大小超过5MB不予加载video
        if (params.row.fileSize < 1024 * 1024 * 5) {
          return h(
            "video",
            {
              style: {
                cursor: "pointer",
                width: "80px",
                height: "60px",
                margin: "10px 0",
                "object-fit": "contain",
              },
              on: {
                click: () => {
                  showVideo(params.row);
                },
              },
            },
            [
              h("source", {
                attrs: {
                  src: params.row.url,
                },
              }),
            ]
          );
        } else {
          return h("img", {
            attrs: {
              src: playIcon,
            },
            style: {
              cursor: "pointer",
              width: "80px",
              height: "60px",
              margin: "10px 0",
              "object-fit": "contain",
            },
            on: {
              click: () => {
                showVideo(params.row);
              },
            },
          });
        }
      } else {
        return h("span", "非多媒体类型");
      }
    },
  },
  {
    title: "文件类型",
    key: "fileType",
    width: 115,
    className: selectImage.value == true ? "none" : "",
  },
  {
    title: "文件大小",
    key: "fileSize",
    width: 115,
    sortable: true,
    className: selectImage.value == true ? "none" : "",
    render: (h, params) => {
      let m =
        ((params.row.fileSize * 1.0) / (1024 * 1024)).toFixed(2) + " MB";
      return h("span", m);
    },
  },
  {
    title: "上传者",
    key: "createBy",
    width: 200,
    render: (h, params) => {
      let m = "";
      if (params.row.userEnums == "MANAGER") {
        m = "[管理员]";
      } else if (params.row.userEnums == "STORE") {
        m = "[商家]";
      } else if (params.row.userEnums == "CUSTOMER") {
        m = "[客服]";
      } else {
        m = "[用户]";
      }
      m += params.row.createBy;
      return h("span", m);
    },
  },
  {
    title: "操作",
    key: "action",
    align: "center",
    fixed: "right",
    // width: 300,
    render: (h, params) => {
      return h("div", [
        h(
          "a",
          {
            style: {
              color: "#2d8cf0",
              cursor: "pointer",
              textDecoration: "none",
              marginRight: "5px",
              display: selectImage.value === true ? "inline-block" : "none",
            },
            on: {
              click: () => {
                selectedParams(params.row);
              },
            },
          },
          "选择"
        ),
        h(
          "span",
          {
            style: {
              margin: "0 8px",
              color: "#dcdee2",
              display: selectImage.value === true ? "inline-block" : "none",
            },
          },
          "|"
        ),
        h(
          "a",
          {
            style: {
              color: "#2d8cf0",
              cursor: "pointer",
              textDecoration: "none",
              marginRight: "5px",
              display: selectImage.value == true ? "none" : "inline-block",
            },
            on: {
              click: () => {
                download(params.row);
              },
            },
          },
          "下载"
        ),
        h(
          "span",
          {
            style: {
              margin: "0 8px",
              color: "#dcdee2",
              display: selectImage.value == true ? "none" : "inline-block",
            },
          },
          "|"
        ),
        h(
          "a",
          {
            style: {
              color: "#2d8cf0",
              cursor: "pointer",
              textDecoration: "none",
              display: selectImage.value == true ? "none" : "inline-block",
            },
            on: {
              click: () => {
                remove(params.row);
              },
            },
          },
          "删除"
        ),
      ]);
    },
  },
]);
const viewColumns = ref([
  {
    title: "缩略图(点击预览)",
    key: "url",
    // width: 150,
    align: "center",
    render: (h, params) => {
      if (isImageFile(params.row)) {
        return h("img", {
          attrs: {
            src: params.row.url || "",
            alt: "加载图片失败",
          },
          style: {
            cursor: "pointer",
            width: "80px",
            height: "60px",
            margin: "10px 0",
            "object-fit": "contain",
          },
          on: {
            click: () => {
              showPic(params.row);
            },
          },
        });
      } else if (isVideoFile(params.row)) {
        // 如果视频文件大小超过5MB不予加载video
        if (params.row.fileSize < 1024 * 1024 * 5) {
          return h(
            "video",
            {
              style: {
                cursor: "pointer",
                width: "80px",
                height: "60px",
                margin: "10px 0",
                "object-fit": "contain",
              },
              on: {
                click: () => {
                  showVideo(params.row);
                },
              },
            },
            [
              h("source", {
                attrs: {
                  src: params.row.url,
                },
              }),
            ]
          );
        } else {
          return h("img", {
            attrs: {
              src: playIcon,
            },
            style: {
              cursor: "pointer",
              width: "80px",
              height: "60px",
              margin: "10px 0",
              "object-fit": "contain",
            },
            on: {
              click: () => {
                showVideo(params.row);
              },
            },
          });
        }
      } else {
        return h("span", "非多媒体类型");
      }
    },
  },
  {
    title: "上传者",
    key: "createBy",
    width: 120,
    sortable: true,
    render: (h, params) => {
      let m = "";
      if (params.row.userEnums == "MANAGER") {
        m = "[管理员]";
      } else if (params.row.userEnums == "STORE") {
        m = "[商家]";
      } else if (params.row.userEnums == "CUSTOMER") {
        m = "[客服]";
      } else {
        m = "[用户]";
      }
      m += params.row.createBy;
      return h("span", m);
    },
  },
  {
    title: "操作",
    key: "action",
    align: "center",
    fixed: "right",
    width: 300,
    render: (h, params) => {
      return h("div", [
        h(
          "Button",
          {
            props: {
              type: "default",
              size: "small",
            },
            style: {
              marginRight: "5px",
              display:
                selectImage.value === true ? "inline-block" : "none",
            },
            on: {
              click: () => {
                selectedParams(params.row);
              },
            },
          },
          "选择"
        )
      ]);
    },
  },
]);
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
const buttonProps = {type: 'default', size: 'small',};
// 历史遗留死代码：模板未使用 myData，其 render 中的 append 从未定义，原样保留
const myData = ref([
  {
    title: 'parent 1',
    expand: true,
    render: (h, {root, node, data}) => {
      return h('span', {style: {display: 'inline-block', width: '100%'}}, [
        h('span', [h("Icon", {type: 'ios-folder-outline', style: {marginRight: '8px'}}), h('span', data.title)]),
        h('span', {style: {display: 'inline-block', float: 'right', marginRight: '32px'}},
          [h("Button", {
            ...buttonProps,
            icon: 'ios-add',
            type: 'primary',
            style: {width: '64px'},
            onClick: () => {
              // eslint-disable-next-line no-undef -- 历史遗留：append 从未定义，原样保留
              append(data)
            }
          })
          ])
      ]);
    },
    children: [
      {
        title: 'child 1-1',
        expand: true,
        children: [{title: 'leaf 1-1-1', expand: true}, {title: 'leaf 1-1-2', expand: true}]
      },
      {
        title: 'child 1-2',
        expand: true,
        children: [{title: 'leaf 1-2-1', expand: true}, {title: 'leaf 1-2-1', expand: true}]
      }
    ]
  }
]);

// 模板 ref：up/form/formValidate 与顶层变量重名，改名避免互相覆盖
const upRef = ref(null);
const formRef = ref(null);
const formValidateRef = ref(null);
const dplayerRef = ref(null);
// 历史遗留：模板中不存在 ref="table"，clearSelectAll 调用会报错，原样保留
const tableRef = ref(null);

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
// 初始化监听 是否清空所选图片
watch(
  () => props.initialize,
  (val) => {
    if (val && props.isComponent) {
      selectedOss.value = [];
      activeRoleTab.value = "MANAGER";
      searchForm.userEnums = "MANAGER";
      delete searchForm.fileDirectoryId;
      selectedGroupData.value = "";
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
function handleRoleTabChange(name) {
  activeRoleTab.value = name;
  searchForm.pageNumber = 1;
  searchForm.userEnums = name;
  delete searchForm.fileDirectoryId;
  selectedGroupData.value = "";
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
  if (showType.value === "list") {
    searchForm.pageSize = 20;
  } else {
    searchForm.pageSize = 12;
  }
  getDataList();
}
function updateTreeDataByRole() {
  const currentTree = filterTreeByRole(treeDataDefault.value, activeRoleTab.value);
  treeData.value = [
    {
      title: "全部图片",
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
// 自定义tree节点显示内容和交互
function renderContent(h, {root, node, data}) {
  if (data.value === '0') {
    return h('span', {style: {display: 'inline-block', width: '100%'}},
      [
        h('span', [h("Icon", {type: 'ios-paper-outline', style: {marginRight: '8px'}}), h('span', data.title)]),
        h('span', {style: {display: 'inline-block', float: 'right', marginRight: '10px'}}, [])
      ]
    );
  } else {
    return h('span', {style: {display: 'inline-block', width: '100%'}},
      [
        h('span', [h("Icon", {type: 'ios-paper-outline', style: {marginRight: '8px'}}), h('span', data.title)]),
        h('span', {style: {display: 'inline-block', float: 'right', marginRight: '10px'}},
          [
            h("Dropdown", {style: {marginLeft: "4px"}},
              [
                h("Icon", {
                  props: {type: 'ios-more', size: "20",},
                  style: {display: 'inline-block'},
                  on: {
                    click: () => {
                    }
                  }
                }),
                h("DropdownMenu", {
                  slot: "list"
                }, [
                  h("DropdownItem", {
                    nativeOn: {
                      click: () => {
                        handleContextMenuEdit(root, node, data)
                      }
                    }
                  }, "编辑"),
                  h("DropdownItem", {
                    nativeOn: {
                      click: () => {
                        handleContextMenuDelete()
                      }
                    }
                  }, "删除"),
                ])
              ]),
          ])
      ]
    );
  }

}


function handleContextMenu(val) {
  selectedGroupData.value = val;
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
function copyFileUrl(row) {
  const textArea = document.createElement("textarea");
  textArea.value = row.url;
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();
  try {
    document.execCommand("copy");
    ElMessage.success("复制成功");
  } catch (err) {
    console.error("Unable to copy to clipboard", err);
  }
  document.body.removeChild(textArea);
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
/**
 * 选择
 */
function selectedParams(val) {
  emit("callback", val);
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
// 关闭视频
function closeVideo() {
  if (dp) {
    dp.destroy();
    dp = null;
  }
  pendingVideoUrl.value = "";
}
// 分页 改变页码
function changePage(v) {
  searchForm.pageNumber = v;
  getDataList();
  clearSelectAll();
}
// 分页 改变页数
function changePageSize(v) {
  searchForm.pageNumber = 1;
  searchForm.pageSize = v;
  getDataList();
}
// 排序
function changeSort(e) {
  searchForm.sort = e.key;
  searchForm.order = e.order;
  if (e.order == "normal") {
    searchForm.order = "";
  }
  getDataList();
}
// 起止时间筛选已移除
// 改变查看方式
function changeShowType() {
  searchForm.pageNumber = 1;
  if (showType.value == "list") {
    searchForm.pageSize = 20;
  } else {
    searchForm.pageSize = 12;
  }
  getDataList();
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
// 兼容外部按场景切换分类（如装修选图/选视频）
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
    ElMessage.warning("仅管理员模块支持上传图片");
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
// 清空上传文件
function clearFiles() {
  upRef.value.clearFiles();
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
      });
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
// 修改文件名modal
function rename(v) {
  modalTitle.value = "编辑文件名";
  // 转换null为""
  for (let attr in v) {
    if (v[attr] == null) {
      v[attr] = "";
    }
  }
  let str = JSON.stringify(v);
  let data = JSON.parse(str);
  form.value = data;
  oldKey.value = data.fileKey;
  modalVisible.value = true;
}
// 清除选中状态
function clearSelectAll() {
  tableRef.value.selectAll(false);
  totalSize.value = "";
}
// 选中回调
function changeSelect(e) {
  selectList.value = e;
  selectCount.value = e.length;
  let size = 0;
  e.forEach((item) => {
    size += item.fileSize * 1.0;
  });
  totalSize.value = ((size * 1.0) / (1024 * 1024)).toFixed(2) + " MB";
  emit("selected", e)
}

onMounted(() => {
  if (!props.isComponent) {
    // 是组件的话，初始化不调用接口
    init();
  } else {
    searchForm.pageSize = 18; // 页面大小
  }
});

// 父组件通过 ref 设置 selectImage 开启选图模式；decorate.vue 还会写 fileType 并调用 changeFileType
defineExpose({ selectImage, fileType, changeFileType });
</script>
