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
  <div class="search" :class="{ 'oss-manage-picker': isComponent }">
    <el-card class="tabs-card category-tabs-card">
      <el-tabs v-model="activeCategoryTab" @tab-change="handleCategoryTabChange">
        <el-tab-pane label="图片" name="IMAGE" />
        <el-tab-pane label="视频" name="VIDEO" />
        <el-tab-pane label="文件" name="FILE" />
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
                        ref="up"
                        :action="sellerUrl + '/store/common/upload/file'"
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
      <el-form ref="form" label-width="95px" :model="form" :rules="formValidate">
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
        ref="formValidate"
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
import {sellerUrl} from "@/libs/axios";
import config from "@/config/index";

const playIcon =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='%23409eff' d='M8 5v14l11-7z'/%3E%3C/svg%3E";

let dp;
export default {
  name: "oss-manage",
  components: { Delete, Download, View, Document },
  props: {
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
  },
  data() {
    return {
      sellerUrl, // 上传文件路径
      config, // api地址
      fileDirectoryId: "",
      groupFormValidate: {
        id: "",
        level: 0,
        parentId: "0",
        directoryName: "",
      },
      groupRuleValidate: {
        directoryName: [
          {
            required: true,
            message: "请输入分组名称",
            trigger: "blur",
          },
        ],
      },
      enableGroup: false, // 是否展示分组
      selectImage: false, //是否是选择
      accessToken: {}, // 上传token鉴权
      loading: false, // 表单加载状态
      fileType: "pic", // 兼容外部调用：pic / video
      showType: "list", // 展示类型
      modalVisible: false, // 添加或编辑显示
      uploadVisible: false, // 上传展示
      videoVisible: false, // 视频预览
      picVisible: false, // 图片预览
      fileVisible: false, // 文件预览
      picTitle: "", // 图片 title
      videoTitle: "", // 视频 title
      fileTitle: "", // 文件 title
      pendingVideoUrl: "", // 待播放视频地址
      modalTitle: "", // 添加或编辑标题
      activeRoleTab: "STORE", // 商家固定为 STORE，与素材 ownerId（storeId）一致
      activeCategoryTab: "IMAGE",
      searchForm: {
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
      },
      oldKey: "", // 请求参数
      form: {
        // 表单
        name: "",
        fileKey: "",
      },
      file: {}, // 文件数据
      // 表单验证规则
      formValidate: {
        name: [{required: true, message: "不能为空", trigger: "blur"}],
        fileKey: [{required: true, message: "不能为空", trigger: "blur"}],
      },
      submitLoading: false, // 添加或编辑提交状态
      selectList: [], // 多选数据
      selectCount: 0, // 多选计数
      totalSize: "", // 文件大小统计
      columns: [
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
            if (this.isImageFile(params.row)) {
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
                    this.showPic(params.row);
                  },
                },
              });
            } else if (this.isVideoFile(params.row)) {
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
                        this.showVideo(params.row);
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
                      this.showVideo(params.row);
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
          className: this.selectImage == true ? "none" : "",
        },
        {
          title: "文件大小",
          key: "fileSize",
          width: 115,
          sortable: true,
          className: this.selectImage == true ? "none" : "",
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
                    display: this.selectImage === true ? "inline-block" : "none",
                  },
                  on: {
                    click: () => {
                      this.selectedParams(params.row);
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
                    display: this.selectImage === true ? "inline-block" : "none",
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
                    display: this.selectImage == true ? "none" : "inline-block",
                  },
                  on: {
                    click: () => {
                      this.download(params.row);
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
                    display: this.selectImage == true ? "none" : "inline-block",
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
                    display: this.selectImage == true ? "none" : "inline-block",
                  },
                  on: {
                    click: () => {
                      this.remove(params.row);
                    },
                  },
                },
                "删除"
              ),
            ]);
          },
        },
      ],
      viewColumns: [
        {
          title: "缩略图(点击预览)",
          key: "url",
          // width: 150,
          align: "center",
          render: (h, params) => {
            if (this.isImageFile(params.row)) {
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
                    this.showPic(params.row);
                  },
                },
              });
            } else if (this.isVideoFile(params.row)) {
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
                        this.showVideo(params.row);
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
                      this.showVideo(params.row);
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
                      this.selectImage === true ? "inline-block" : "none",
                  },
                  on: {
                    click: () => {
                      this.selectedParams(params.row);
                    },
                  },
                },
                "选择"
              )
            ]);
          },
        },
      ],
      data: [], // 表单数据
      total: 0, // 表单数据总数
      pageSizeOpts: [5, 10, 20], // 页码展示项
      list: [], // 列表
      //树结构
      treeData: [],
      treeDataDefault: [],
      treeRenderKey: 0,
      selectedGroupData: "",
      insertOrUpdate: "insert",
      groupLoading: false,
      // 图片列表
      selectedOss: [],
      myData: [
        {
          title: 'parent 1',
          expand: true,
          render: (h, {root, node, data}) => {
            return h('span', {style: {display: 'inline-block', width: '100%'}}, [
              h('span', [h("Icon", {type: 'ios-folder-outline', style: {marginRight: '8px'}}), h('span', data.title)]),
              h('span', {style: {display: 'inline-block', float: 'right', marginRight: '32px'}},
                [h("Button", {
                  ...this.buttonProps,
                  icon: 'ios-add',
                  type: 'primary',
                  style: {width: '64px'},
                  onClick: () => {
                    this.append(data)
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
      ],
      buttonProps: {type: 'default', size: 'small',},
    };
  },
  watch: {
    selectImage(val) {
      if (val) {
        if (this.isComponent) {
          // 弹窗选图模式：加载本店素材，而非平台管理员资源
          this.activeRoleTab = "STORE";
          this.searchForm.userEnums = "STORE";
          this.init();
        } else if (!this.data.length) {
          this.init();
        }
      }
    },
    choose(val) {
      if (val) this.selectImage = val
    },
    selectedOss(val) {
      if (val && val.length && !(this.isComponent && this.selectImage)) {
        this.$emit("callback", { url: val[val.length - 1].split(",")[1] });
      }
    },
    // 弹窗打开时重置状态并加载分组与素材列表
    initialize(val) {
      if (val && this.isComponent) {
        this.selectedOss = [];
        this.activeRoleTab = "STORE";
        this.activeCategoryTab = "IMAGE";
        this.searchForm.userEnums = "STORE";
        this.searchForm.fileCategory = "IMAGE";
        delete this.searchForm.fileDirectoryId;
        this.selectedGroupData = "";
        this.selectImage = true;
      }
    },
  },
  computed: {
    // 商家端展示分组树与分组维护能力
    canShowGroups() {
      return this.activeRoleTab === "STORE";
    },
    // 商家端允许上传图片/视频/文件
    canUploadImages() {
      return this.activeRoleTab === "STORE";
    },
    uploadButtonText() {
      const textMap = {
        IMAGE: "上传图片",
        VIDEO: "上传视频",
        FILE: "上传文件",
      };
      return textMap[this.activeCategoryTab] || "上传图片";
    },
    uploadData() {
      const data = {
        userEnums: this.activeRoleTab,
        directoryType: this.activeRoleTab,
      };
      const directoryId = this.searchForm.fileDirectoryId;
      if (directoryId && directoryId !== "0") {
        data.directoryPath = directoryId;
      }
      return data;
    },
  },

  methods: {
    beforeUpload(file) {
      if (!this.canUploadImages) {
        ElMessage.warning("当前模块不支持上传");
        return false;
      }
      const maxSize = 20480 * 1024;
      if (file && file.size > maxSize) {
        this.handleMaxSize(file);
        return false;
      }
      return true;
    },
    handleTreeNodeClick(data) {
      if (data) {
        this.handleCateChange([data]);
      }
    },
    onTreeDropdownCommand(cmd, data) {
      this.selectedGroupData = data;
      if (cmd === "edit") {
        this.handleContextMenuEdit(null, null, data);
      } else if (cmd === "delete") {
        this.handleContextMenuDelete();
      }
    },
    onMouseOver(item, index) {
      this.data[index].isShowPreview = true;
      this.$forceUpdate();
    },
    onMouseOut(item, index) {
      this.data[index].isShowPreview = false;
    },
    handleRoleTabChange(name) {
      this.activeRoleTab = name;
      this.searchForm.pageNumber = 1;
      this.searchForm.userEnums = name;
      delete this.searchForm.fileDirectoryId;
      this.selectedGroupData = "";
      this.groupFormValidate.id = "";
      this.groupFormValidate.level = 0;
      this.selectedOss = [];
      this.updateTreeDataByRole();
      this.getDataList();
    },
    handleCategoryTabChange(name) {
      this.activeCategoryTab = name;
      this.searchForm.fileCategory = name;
      this.searchForm.fileType = "";
      this.searchForm.pageNumber = 1;
      delete this.searchForm.fileDirectoryId;
      this.selectedGroupData = "";
      this.selectedOss = [];
      if (this.showType === "list") {
        this.searchForm.pageSize = 20;
      } else {
        this.searchForm.pageSize = 12;
      }
      this.updateTreeDataByRole();
      this.getDataList();
    },
    updateTreeDataByRole() {
      const rootTitleMap = {
        IMAGE: "全部图片",
        VIDEO: "全部视频",
        FILE: "全部文件",
      };
      const currentTree = this.filterTreeByRole(this.treeDataDefault, this.activeRoleTab);
      this.treeData = [
        {
          title: rootTitleMap[this.activeCategoryTab] || "全部图片",
          label: "全部分类",
          value: "0",
          type: this.activeRoleTab,
          level: 0,
          children: [],
          id: "0",
          categoryId: 0,
        },
        ...currentTree,
      ];
      this.treeRenderKey += 1;
    },
    filterTreeByRole(tree = [], role) {
      if (!tree || !tree.length) return [];
      return tree
        .filter((item) => item.type === role)
        .map((item) => ({
          ...item,
          children: [],
        }));
    },
    // 复选框值改变时触发
    selectOssChange(e) {
      if (this.maxSelect === 1 && e.length > 1) {
        const last = e[e.length - 1];
        this.selectedOss = [last];
        e = [last];
      }
      if (e) {
        this.selectList = e.map(item => {
          return {id: item.split(',')[0]}
        });
        this.selectCount = e.length;
        // let size = 0;
        // e.forEach((item) => {size += item.fileSize * 1.0;});
        // this.totalSize = ((size * 1.0) / (1024 * 1024)).toFixed(2) + " MB";
        this.$emit("selected", e);
      }
    },
    handleCardClick(item, event) {
      if (!(this.isComponent && this.selectImage)) return;
      if (event?.target?.closest?.(".preview") || event?.target?.closest?.(".card-checkbox")) {
        return;
      }
      const key = `${item.id},${item.url}`;
      let next;
      if (this.maxSelect === 1) {
        next = this.selectedOss.includes(key) ? [] : [key];
      } else if (this.selectedOss.includes(key)) {
        next = this.selectedOss.filter((k) => k !== key);
      } else {
        next = [...this.selectedOss, key];
      }
      this.selectedOss = next;
      this.selectOssChange(next);
    },
    // 页码改变时回调
    pageChange(value) {
      this.selectedOss = [];
      this.searchForm.pageNumber = value;
      this.getDataList();
    },
    // 自定义tree节点显示内容和交互
    renderContent(h, {root, node, data}) {
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
                            this.handleContextMenuEdit(root, node, data)
                          }
                        }
                      }, "编辑"),
                      h("DropdownItem", {
                        nativeOn: {
                          click: () => {
                            this.handleContextMenuDelete()
                          }
                        }
                      }, "删除"),
                    ])
                  ]),
              ])
          ]
        );
      }

    },


    handleContextMenu(val) {
      console.log('handleContextMenu', val);
      this.selectedGroupData = val;
    },
    // 编辑分组
    handleContextMenuEdit(root, node, data) {
      this.insertOrUpdate = "update";
      this.enableGroup = true;
      this.groupFormValidate.id = data.value;
      this.groupFormValidate.directoryName = data.title || data.label;
      this.groupFormValidate.level = 0;
      this.groupFormValidate.parentId = "0";
    },
    // 删除分组
    async handleContextMenuDelete(val) {
      ElMessageBox.confirm("是否删除该分组", "提示", { type: "warning" }).then(async () => {
          const res = await delFileDirectory(this.selectedGroupData.value);
          if (res.success) {
            ElMessage.success("删除成功!");
            this.getDataList();
            this.getAllList();
          }
      }).catch(() => {});
    },
    async submitAddGroup() {
      this.$refs["formValidate"].validate(async (valid) => {
        if (valid) {
          let res;
          const params = {
            directoryName: this.groupFormValidate.directoryName,
            level: 0,
            parentId: "0",
            directoryType: this.activeRoleTab,
          };
          if (this.insertOrUpdate === "insert") {
            res = await addFileDirectory(params);
          } else {
            params.id = this.groupFormValidate.id;
            res = await updateFileDirectory(params);
          }

          if (res.success) {
            ElMessage.success("操作成功!");
            this.enableGroup = false;
            this.getAllList();
          }
          } else {
          ElMessage.error("请填写完整信息!");
        }
      });
    },
    handleClickAddGroup() {
      this.insertOrUpdate = "insert";
      this.groupFormValidate = {
        id: "",
        level: 0,
        parentId: "0",
        directoryName: "",
      };
      this.enableGroup = true;
    },
    copyFileUrl(row) {
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
    },

    // 获取全部文件目录
    getAllList(parent_id) {
      this.loading = true;
      getFileDirectory(parent_id).then((res) => {
        this.loading = false;
        if (res.success) {
          this.treeDataDefault = this.getTree(res.result);
          this.updateTreeDataByRole();
        }
      });
    },
    // 文件目录分类格式化：仅展示一级分组
    getTree(tree = []) {
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
    },

    // 选择分类回调
    handleCateChange(data) {
      if (data) {
        this.selectedGroupData = data[0];
        let {value, type, level} = data[0];
        this.list.push({value, type, level});
        this.searchForm.fileDirectoryId = value;
        if (value === "0" || value === 0) {
          delete this.searchForm.fileDirectoryId;
        }
        this.searchForm.userEnums = type || this.activeRoleTab;
        this.getDataList();
        this.selectedOss = [];
      }
    },
    /**
     * 选择
     */
    selectedParams(val) {
      this.$emit("callback", val);
    },
    handleSelectConfirm() {
      if (!this.selectedOss.length) {
        ElMessage.warning("请选择图片");
        return;
      }
      const last = this.selectedOss[this.selectedOss.length - 1];
      this.$emit("callback", { url: last.split(",")[1] });
    },
    handleSelectCancel() {
      this.selectedOss = [];
      this.$emit("callback", { url: "" });
    },
    // 初始化数据
    init() {
      this.accessToken = {
        accessToken: this.getStore("accessToken"),
      };
      this.searchForm.userEnums = this.activeRoleTab;
      this.searchForm.fileCategory = this.activeCategoryTab;
      this.getDataList();
      this.getAllList();
    },
    // 查看大图
    showPic(v) {
      this.prepareFileMeta(v);
      this.picTitle = v.name || "图片预览";
      this.picVisible = true;
    },
    // 查看文件（PDF 等）
    showFile(v) {
      this.prepareFileMeta(v);
      this.fileTitle = v.name || "文件预览";
      this.fileVisible = true;
    },
    // 查看视频
    showVideo(v) {
      this.prepareFileMeta(v);
      this.videoTitle = v.name || "视频预览";
      this.pendingVideoUrl = v.url;
      this.videoVisible = true;
    },
    initDPlayer() {
      const container = this.$refs.dplayerRef;
      if (!container || !this.pendingVideoUrl) return;
      if (dp) {
        dp.destroy();
        dp = null;
      }
      dp = new DPlayer({
        container,
        screenshot: true,
        video: {
          url: this.pendingVideoUrl,
        },
      });
    },
    // 关闭视频
    closeVideo() {
      if (dp) {
        dp.destroy();
        dp = null;
      }
      this.pendingVideoUrl = "";
    },
    // 分页 改变页码
    changePage(v) {
      this.searchForm.pageNumber = v;
      this.getDataList();
      this.clearSelectAll();
    },
    // 分页 改变页数
    changePageSize(v) {
      this.searchForm.pageNumber = 1;
      this.searchForm.pageSize = v;
      this.getDataList();
    },
    // 排序
    changeSort(e) {
      this.searchForm.sort = e.key;
      this.searchForm.order = e.order;
      if (e.order == "normal") {
        this.searchForm.order = "";
      }
      this.getDataList();
    },
    // 起止时间筛选已移除
    // 改变查看方式
    changeShowType() {
      this.searchForm.pageNumber = 1;
      if (this.showType == "list") {
        this.searchForm.pageSize = 20;
      } else {
        this.searchForm.pageSize = 12;
      }
      this.getDataList();
    },
    // 获取列表数据
    getDataList(type = null) {
      if (this.showType == "list") {
        this.pageSizeOpts = [10, 20, 50];
      } else {
        this.pageSizeOpts = [12, 24, 48];
      }
      this.loading = true;
      getFileListData(this.searchForm)
        .then((res) => {
          if (res && res.success && res.result) {
            this.data = res.result.records || [];
            this.total = res.result.total || 0;
          } else {
            this.data = [];
            this.total = 0;
          }
        })
        .catch(() => {
          this.data = [];
          this.total = 0;
        })
        .finally(() => {
          this.loading = false;
        });
    },
    // 兼容外部按场景切换分类（如装修选图/选视频）
    changeFileType() {
      const categoryMap = {
        pic: "IMAGE",
        video: "VIDEO",
        file: "FILE",
        all: "IMAGE",
      };
      const category = categoryMap[this.fileType] || "IMAGE";
      this.activeCategoryTab = category;
      this.handleCategoryTabChange(category);
    },
    isImageFile(row) {
      return row?.fileCategory === "IMAGE" || (row?.fileType && row.fileType.includes("image"));
    },
    isVideoFile(row) {
      return row?.fileCategory === "VIDEO" || (row?.fileType && row.fileType.includes("video"));
    },
    isPdfFile(row) {
      return (
        row?.fileType === "application/pdf" ||
        (row?.name && row.name.toLowerCase().endsWith(".pdf"))
      );
    },
    previewFile(item) {
      if (this.isVideoFile(item)) {
        this.showVideo(item);
      } else if (this.isImageFile(item)) {
        this.showPic(item);
      } else {
        this.showFile(item);
      }
    },
    prepareFileMeta(v) {
      this.file = v;
      this.file.msize = ((v.fileSize * 1.0) / (1024 * 1024)).toFixed(2) + " MB";
    },
    // 上传文件超过大小限制
    handleMaxSize() {
      ElMessage.warning("所选文件大小过大，不得超过 20MB");
    },
    // 上传成功回调
    handleSuccess(res, file) {
      if (!this.canUploadImages) {
        ElMessage.warning("当前模块不支持上传");
        return;
      }
      if (res.success) {
        ElMessage.success("上传文件 " + file.name + " 成功");
        this.getDataList();
      } else {
        ElMessage.error(res.message);
      }
    },
    // 上传失败回调
    handleError(error, file, fileList) {
      ElMessage.error(error.toString());
    },
    // 清空上传文件
    clearFiles() {
      this.$refs.up.clearFiles();
    },
    // 取消修改文件名
    handleCancel() {
      this.modalVisible = false;
    },
    // 下载文件
    download(v) {
      window.open(
        v.url + "?attname=&response-content-type=application/octet-stream"
      );
    },
    // 批量删除文件
    removeAll() {
      if (this.selectCount <= 0) {
        ElMessage.warning("您还未选择要删除的数据");
        return;
      }
      ElMessageBox.confirm("您确认要删除所选的 " + this.selectCount + " 个文件?", "确认删除", { type: "warning" }).then(() => {
          let ids = "";
          this.selectList.forEach(function (e) {
            ids += e.id + ",";
          });
          ids = ids.substring(0, ids.length - 1);
          deleteFile(ids).then((res) => {
            if (res.success) {
              this.selectedOss = [];
              // this.clearSelectAll();
              this.init();
              ElMessage.success("批量删除文件成功");
            }
          })
            .catch((err) => {
              console.log("失败", err);
            });
      }).catch(() => {});
    },
    // 单个删除文件
    remove(v) {
      ElMessageBox.confirm("您确认要删除文件 " + v.name + " ?", "确认删除", { type: "warning" }).then(() => {
          deleteFile(v.id).then((res) => {
            if (res.success) {
              ElMessage.success("删除文件 " + v.name + " 成功");
              this.getDataList();
            }
          })
      }).catch(() => {});
    },
    // 提交修改文件名
    handleSubmit() {
      this.$refs.form.validate((valid) => {
        if (valid) {
          this.submitLoading = true;
          let params = {
            id: this.form.id,
            key: this.oldKey,
            newKey: this.form.fileKey,
            newName: this.form.name,
          };
          renameFile(params).then((res) => {
            this.submitLoading = false;
            if (res.success) {
              ElMessage.success("操作成功");
              this.getDataList();
              this.modalVisible = false;
            }
          });
        }
      });
    },
    // 修改文件名modal
    rename(v) {
      this.modalTitle = "编辑文件名";
      // 转换null为""
      for (let attr in v) {
        if (v[attr] == null) {
          v[attr] = "";
        }
      }
      let str = JSON.stringify(v);
      let data = JSON.parse(str);
      this.form = data;
      this.oldKey = data.fileKey;
      this.modalVisible = true;
    },
    // 清除选中状态
    clearSelectAll() {
      this.$refs.table.selectAll(false);
      this.totalSize = "";
    },
    // 选中回调
    changeSelect(e) {
      this.selectList = e;
      this.selectCount = e.length;
      let size = 0;
      e.forEach((item) => {
        size += item.fileSize * 1.0;
      });
      this.totalSize = ((size * 1.0) / (1024 * 1024)).toFixed(2) + " MB";
      this.$emit("selected", e)
    },
  },
  mounted() {
    if (!this.isComponent) {
      // 是组件的话，初始化不调用接口
      this.init();
    } else {
      this.searchForm.pageSize = 18; // 页面大小
    }
  },
};
</script>
