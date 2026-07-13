<style lang="scss">
@import "./ossManage.scss";

.group-row {
  padding-top: 10px;
  border-top: 1px solid #ededed;
  margin-top: 10px;
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

.tab-empty {
  padding: 48px 0;
  color: #999;
  text-align: center;
}

.tabs-card {
  margin-bottom: 16px;
}

.oss-tree-node {
  display: inline-flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding-right: 8px;
}

.oss-tree-more {
  cursor: pointer;
  color: #909399;
  padding: 0 4px;
}

</style>
<template>
  <div class="search">
    <el-card class="tabs-card">
      <el-tabs v-model="activeRoleTab" @tab-change="handleRoleTabChange">
        <el-tab-pane label="商家" name="STORE" />
      </el-tabs>
    </el-card>
    <el-row>
      <el-card>
        <div>
          <div class="operation">
            <el-row @keyup.enter="handleSearch">
              <el-form
                ref="searchForm"
                label-width="85px"
                :model="searchForm"
                class="search-form"
                inline
              >
                <el-form-item label="上传时间">
                  <el-date-picker
                    v-model="selectDate"
                    clearable
                    value-format="YYYY-MM-DD"
                    start-placeholder="开始日期"
                    end-placeholder="结束日期"
                    style="width: 240px"
                    type="daterange"
                    @change="selectDateRange"
                  />
                </el-form-item>
                <el-form-item>
                  <el-button class="search-btn" type="primary" @click="handleSearch">搜索</el-button>
                </el-form-item>
                <el-form-item v-if="canUploadImages">
                  <el-upload
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
                    <el-button>上传图片</el-button>
                  </el-upload>
                </el-form-item>
              </el-form>
            </el-row>
          </div>
          <el-row class="oss-manage-box">
            <el-col v-if="canShowGroups" :span="isComponent ? 5 : 4">
              <div class="file-list">
                <div class="article-category mr_10">
                  <el-tree
                    :data="treeData"
                    node-key="value"
                    :props="{ label: 'title', children: 'children' }"
                    highlight-current
                    class="demo-tree-render"
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
                <div v-if="!isComponent">
                  <div class="oss-operation padding-row" style="display: flex; flex-direction: row-reverse">
                    <div>
                      <el-button v-if="showType == 'list'" @click="removeAll">批量删除</el-button>
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
                            'oss-card-selectable': isComponent && selectImage
                          }"
                          @mouseenter="onMouseOver(item, index)"
                          @mouseleave="onMouseOut(item, index)"
                          @click="toggleSelectedOss(item)"
                        >
                          <el-checkbox
                            :value="item.id + ',' + item.url"
                            class="card-checkbox"
                            @click.stop
                          />
                          <img :src="item.url" alt="" />
                          <div v-if="item.isShowPreview" class="preview">
                            <div @click.stop.prevent="download(item)">
                              <el-tooltip content="下载" placement="top">
                                <el-icon :size="18"><Download /></el-icon>
                              </el-tooltip>
                            </div>
                            <div @click.stop.prevent="remove(item)">
                              <el-tooltip content="删除" placement="top">
                                <el-icon :size="18"><Delete /></el-icon>
                              </el-tooltip>
                            </div>
                            <div @click.stop.prevent="showPic(item)">
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
        alt="无效的图片链接"
        style="width: 100%; margin: 0 auto; display: block"
      />
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
    >
      <div id="dplayer"></div>
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
        <el-form-item label="所在分组" prop="id">
          <el-cascader
            v-model="defaultValue"
            :options="treeData"
            :props="{ value: 'value', label: 'label', children: 'children', checkStrictly: true }"
            style="width: 100%"
            @change="treeDataChange"
          />
        </el-form-item>
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
import { Delete, Download, View } from "@element-plus/icons-vue";
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
import playImg from "@/assets/play.png";

let dp;
export default {
  name: "oss-manage",
  components: { Delete, Download, View },
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
  },
  data() {
    return {
      sellerUrl, // 上传文件路径
      config, // api地址
      fileDirectoryId: "",
      groupFormValidate: {
        id: [],
        level: 0,
        directoryName: "",
      },
      defaultValue: [], // 默认分组id
      groupRuleValidate: {
        directoryName: [
          {
            required: true,
            message: "请输入分组名称",
            trigger: "blur",
          },
        ],
        id: [
          {
            required: true,
            message: "请选择分组",
            trigger: "blur",
            type: "array",
          },
        ],
      },
      enableGroup: false, // 是否展示分组
      selectImage: false, //是否是选择
      accessToken: {}, // 上传token鉴权
      loading: false, // 表单加载状态
      fileType: "all", // 文件类型
      showType: "list", // 展示类型
      modalVisible: false, // 添加或编辑显示
      uploadVisible: false, // 上传展示
      videoVisible: false, // 文件modal
      picVisible: false, // 图片modal
      picTitle: "", // 图片title
      videoTitle: "", // 视频title
      modalTitle: "", // 添加或编辑标题
      activeRoleTab: "STORE",
      searchForm: {
        // 搜索框对应data对象
        name: "",
        fileKey: "",
        fileType: "",
        fileCategory: "",
        userEnums: "STORE",
        pageNumber: 1, // 当前页数
        pageSize: 20, // 页面大小
        sort: "createTime", // 默认排序字段
        order: "desc", // 默认排序方式
        startDate: "", // 起始时间
        endDate: "", // 终止时间
      },
      selectDate: null, // 选择日期绑定modal
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
                    src: playImg,
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
                    src: playImg,
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
      selectedGroupData: "",
      insertOrUpdate: "insert",
      groupLoading: false,
      // 图片列表
      selectedOss: [],
    };
  },
  watch: {
    selectImage(val) {
      if (val && !this.data.length) this.init();
    },
    choose(val) {
      if (val) this.selectImage = val
    },
    selectedOss(val) {
      if (val && val.length) {
        this.$emit("callback", {url: val[val.length - 1].split(',')[1]});
      }
    },
    // 初始化监听 是否清空所选图片
    initialize(val) {
      if (val && this.isComponent) {
        this.selectedOss = [];
      }
    },
    defaultValue(val) {
      if (val) {
        this.groupFormValidate.parentId = val;
      }
    },
  },
  computed: {
    canShowGroups() {
      return this.activeRoleTab === "MANAGER";
    },
    canUploadImages() {
      return this.activeRoleTab === "MANAGER" || this.activeRoleTab === "STORE";
    },
    uploadData() {
      return {
        directoryPath: this.searchForm.fileDirectoryId,
        userEnums: this.activeRoleTab,
        directoryType: this.activeRoleTab,
      };
    },
  },

  methods: {
    beforeUpload(file) {
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
      this.defaultValue = [];
      this.groupFormValidate.id = [];
      this.groupFormValidate.level = 0;
      this.selectedOss = [];
      this.updateTreeDataByRole();
      this.getDataList();
    },
    updateTreeDataByRole() {
      const currentTree = this.filterTreeByRole(this.treeDataDefault, this.activeRoleTab);
      this.treeData = [
        {
          title: "全部图片",
          label: "全部分类",
          value: "0",
          type: this.activeRoleTab,
          level: 0,
          children: currentTree,
          id: "0",
          categoryId: 0,
        },
      ];
    },
    filterTreeByRole(tree = [], role) {
      if (!tree || !tree.length) return [];
      return tree.reduce((arr, item) => {
        const children = this.filterTreeByRole(item.children || [], role);
        if (item.type === role || children.length) {
          arr.push({
            ...item,
            children,
          });
        }
        return arr;
      }, []);
    },
    // 复选框值改变时触发
    selectOssChange(e) {
      if (e) {
        if (this.maxSelect > 0 && e.length > this.maxSelect) {
          e = e.slice(-this.maxSelect);
          this.selectedOss = e;
        }
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
    toggleSelectedOss(item) {
      if (!item) return;
      const value = `${item.id},${item.url}`;
      const index = this.selectedOss.indexOf(value);
      if (index > -1) {
        this.selectedOss.splice(index, 1);
      } else if (this.maxSelect === 1) {
        this.selectedOss = [value];
      } else {
        if (this.maxSelect > 0 && this.selectedOss.length >= this.maxSelect) {
          this.selectedOss = this.selectedOss.slice(1);
        }
        this.selectedOss.push(value);
      }
      this.selectOssChange(this.selectedOss);
    },
    // 页码改变时回调
    pageChange(value) {
      this.selectedOss = [];
      this.searchForm.pageNumber = value;
      this.getDataList();
    },

    handleContextMenu(val) {
      console.log('handleContextMenu', val);
      this.selectedGroupData = val;
    },
    // 编辑分组
    handleContextMenuEdit(root, node, data) {
      this.insertOrUpdate = "update";
      this.enableGroup = true;
      this.groupFormValidate.directoryName = data.label;
      this.groupFormValidate.id = [data.value];
      this.groupFormValidate.level = data.level;
      this.groupFormValidate.parentId = data.parentId;
      this.defaultValue = [data.parentId];
    },
    // 删除分组
    async handleContextMenuDelete(val) {
      this.$Modal.confirm({
        title: "提示",
        content: "是否删除该分组",
        onOk: async () => {
          const res = await delFileDirectory(this.selectedGroupData.value);
          if (res.success) {
            this.$Message.success("删除成功!");
            this.getDataList();
            this.getAllList();
          }
        },
      });
    },
    treeDataChange(value) {
      if (value && value.length) {
        this.groupFormValidate.id = value;
        if (value[value.length - 1] == "0") {
          this.groupFormValidate.level = 0;
        } else {
          const node = this.findTreeNodeByValue(this.treeData, value[value.length - 1]);
          this.groupFormValidate.level = node ? Number(node.level) + 1 : 0;
        }
      }
    },
    findTreeNodeByValue(nodes, value) {
      if (!nodes || !nodes.length) return null;
      for (const node of nodes) {
        if (String(node.value) === String(value)) return node;
        const found = this.findTreeNodeByValue(node.children, value);
        if (found) return found;
      }
      return null;
    },
    // 保存/修改分组
    async submitAddGroup() {
      this.$refs["formValidate"].validate(async (valid) => {
        if (valid) {
          let res
          const params = {...this.groupFormValidate};
          params.directoryType = (this.selectedGroupData && this.selectedGroupData.type) || this.activeRoleTab;
          if (this.insertOrUpdate === "insert") {
            params.parentId = params.id[params.id.length - 1];
            delete params.id;
            res = await addFileDirectory(params);
          } else {
            params.id = params.id[params.id.length - 1];
            params.parentId = params.parentId[params.parentId.length - 1];
            res = await updateFileDirectory(params);
          }

          if (res.success) {
            this.$Message.success("操作成功!");
            this.enableGroup = false;
            this.getAllList();
          }
          this.$Modal.remove();
        } else {
          this.$Message.error("请填写完整信息!");
        }
      });
    },
    // 添加/修改分组
    handleClickAddGroup() {
      this.insertOrUpdate = "insert";
      if (this.selectedGroupData) {
        this.groupFormValidate.id = [this.selectedGroupData.value];
      } else {
        this.groupFormValidate.id = ["0"];
      }
      this.enableGroup = true;
      this.groupFormValidate.directoryName = "";
    },
    copyFileUrl(row) {
      const textArea = document.createElement("textarea");
      textArea.value = row.url;
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand("copy");
        this.$Message.success("复制成功");
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
    // 文件目录分类格式化方法
    getTree(tree = []) {
      let arr = [];
      if (!!tree && tree.length !== 0) {
        tree.forEach((item) => {
          let obj = {};
          obj.title = item.directoryName;
          obj.value = item.id; // 拥有者id
          obj.type = item.directoryType; // 用户类型
          obj.label = item.directoryName;
          obj.level = item.level;
          obj.expand = false;
          obj.selected = false;
          obj.contextmenu = false;
          obj.parentId = item.parentId;
          obj.children = this.getTree(item.children); // 递归调用
          arr.push(obj);
        });
      }
      return arr;
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
          this.groupFormValidate.level = 0;
        } else {
          this.groupFormValidate.level = Number(level) + 1;
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
    // 初始化数据
    init() {
      this.accessToken = {
        accessToken: this.getStore("accessToken"),
      };
      this.searchForm.userEnums = this.activeRoleTab;
      this.getDataList();
      this.getAllList();
    },
    // 查看大图
    showPic(v) {
      this.file = v;
      this.file.msize = ((v.fileSize * 1.0) / (1024 * 1024)).toFixed(2) + " MB";

      this.picTitle = v.name + "(" + v.fileKey + ")";
      this.picVisible = true;
    },
    // 查看视频
    showVideo(v) {
      dp = new DPlayer({
        container: document.getElementById("dplayer"),
        screenshot: true,
        video: {
          url: v.url,
        },
      });
      this.file = v;
      this.file.msize = ((v.fileSize * 1.0) / (1024 * 1024)).toFixed(2) + " MB";
      this.videoTitle = v.name + "(" + v.fileKey + ")";
      this.videoVisible = true;
    },
    // 关闭视频
    closeVideo() {
      dp.destroy();
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
    // 起止时间从新赋值
    selectDateRange(v) {
      if (v && v.length === 2) {
        this.searchForm.startDate = v[0];
        this.searchForm.endDate = v[1];
      } else {
        this.searchForm.startDate = "";
        this.searchForm.endDate = "";
      }
    },
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
      getFileListData(this.searchForm).then((res) => {
        this.loading = false;

        this.data = res.result.records;
        this.total = res.result.total;
      });
    },
    // 搜索
    handleSearch() {
      this.searchForm.title = this.searchForm.name;
      this.searchForm.pageNumber = 1;
      if (this.showType == "list") {
        this.searchForm.pageSize = 20;
      } else {
        this.searchForm.pageSize = 12;
      }
      this.getDataList();
    },
    // 文件类型筛选
    changeFileType() {
      const name = this.fileType;
      this.searchForm.fileType = "";
      this.searchForm.fileCategory = "";
      if (name === "pic") {
        this.searchForm.fileCategory = "IMAGE";
      } else if (name === "video") {
        this.searchForm.fileCategory = "VIDEO";
      }
      this.handleSearch();
    },
    isImageFile(row) {
      return row?.fileCategory === "IMAGE" || (row?.fileType && row.fileType.includes("image"));
    },
    isVideoFile(row) {
      return row?.fileCategory === "VIDEO" || (row?.fileType && row.fileType.includes("video"));
    },
    // 上传文件超过大小限制
    handleMaxSize() {
      this.$Message.warning("所选文件大小过大，不得超过 20MB");
    },
    // 上传成功回调
    handleSuccess(res, file) {
      if (res.success) {
        this.$Message.success("上传文件 " + file.name + " 成功");
        this.getDataList();
      } else {
        this.$Message.error(res.message);
      }
    },
    // 上传失败回调
    handleError(error, file, fileList) {
      this.$Message.error(error.toString());
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
        this.$Message.warning("您还未选择要删除的数据");
        return;
      }
      this.$Modal.confirm({
        title: "确认删除",
        content: "您确认要删除所选的 " + this.selectCount + " 个文件?",
        loading: true,
        onOk: () => {
          let ids = "";
          this.selectList.forEach(function (e) {
            ids += e.id + ",";
          });
          ids = ids.substring(0, ids.length - 1);
          deleteFile(ids).then((res) => {
            this.$Modal.remove();
            if (res.success) {
              this.selectedOss = [];
              // this.clearSelectAll();
              this.init();
              this.$Message.success("批量删除文件成功");
            }
          })
            .catch((err) => {
              console.log("失败", err);
            });
        },
      });
    },
    // 单个删除文件
    remove(v) {
      this.$Modal.confirm({
        title: "确认删除",
        content: "您确认要删除文件 " + v.name + " ?",
        loading: true,
        onOk: () => {
          deleteFile(v.id).then((res) => {
            this.$Modal.remove();
            if (res.success) {
              this.$Message.success("删除文件 " + v.name + " 成功");
              this.getDataList();
            }
          })
        },
      });
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
              this.$Message.success("操作成功");
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
