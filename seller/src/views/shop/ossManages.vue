<style lang="scss">
  // 建议引入通用样式 可删除下面样式代码
  @import "@/styles/table-common.scss";
  @import "./ossManage.scss";
</style>
<template>
  <div class="search">
    <Row>
      <Card>
        <div class="operation">
          <Row @keydown.enter.native="handleSearch">
            <Form ref="searchForm" :label-width="85" :model="searchForm" class="search-form" inline>
              <Form-item label="上传时间">
                <DatePicker v-model="selectDate" clearable format="yyyy-MM-dd" placeholder="选择起始时间" style="width: 200px" type="daterange" @on-change="selectDateRange"></DatePicker>
              </Form-item>
              <Button class="search-btn" icon="ios-search" type="primary" @click="handleSearch">搜索
              </Button>
            </Form>
          </Row>

          <Row class="oss-manage-box">
            <Col :span="isComponent?5:4">
              <div class="file-list">
                <div class="article-category mr_10">
                  <Tree :data="treeData" :render="renderContent" @on-select-change.self="handleCateChange" class="demo-tree-render"></Tree>
                  <div class="group-row flex" v-if="!isComponent">
                    <Button @click="handleClickAddGroup">添加分组</Button>
                  </div>
                </div>
              </div>
            </Col>
            <Col :span="isComponent?19:20">
              <div class="pic-list">
                <div>
                  <div class="oss-operation padding-row" style="display: flex;flex-direction: row-reverse;">
                    <div>
                      <Upload
                        ref="up"
                        :action="commonUrl + '/common/common/upload/file'"
                        :data="{
                  directoryPath: searchForm.fileDirectoryId,
                }"
                        :headers="accessToken"
                        :max-size="20480"
                        :on-error="handleError"
                        :on-exceeded-size="handleMaxSize"
                        :on-success="handleSuccess"
                        :show-upload-list="false"
                        multiple
                        style="display: inline-block"
                      >
                        <Button>上传图片</Button>
                      </Upload>
                      <Dropdown @on-click="handleDropdown" v-if="!isComponent">
                        <Button>
                          更多操作
                          <Icon type="md-arrow-dropdown"/>
                        </Button>
                        <DropdownMenu slot="list">
                          <DropdownItem name="refresh">刷新</DropdownItem>
                          <DropdownItem v-show="showType == 'list'" name="removeAll"
                          >批量删除
                          </DropdownItem>
                        </DropdownMenu>
                      </Dropdown>
                    </div>
                  </div>
                </div>
                <div>
                  <CheckboxGroup v-model="selectedOss" @on-change="selectOssChange">
                    <div class="img-box">
                      <div v-for="(item, index) in data" :key="index" class="img-item">
                        <Checkbox :label="item.id+','+item.url" class="check-box">
                          <template>
                            <div class="card"  @mouseenter.active="onMouseOver(item, index)" @mouseleave.active="onMouseOut(item, index)">
                              <!--<div class="custom-checkbox-card-mask"><div class="custom-checkbox-card-mask-dot"/></div>-->
                              <img :src="item.url" alt="" />
                              <div v-if="item.isShowPreview" class="preview">
                                <div @click.prevent="download(item)"><Tooltip content="下载"><Icon type="md-cloud-download" size="18" /></Tooltip></div>
                                <div @click.prevent="remove(item)"><Tooltip content="删除"><Icon type="md-trash" size="18" /></Tooltip></div>
                                <div @click.prevent="showPic(item)"><Tooltip content="预览"><Icon type="ios-eye" size="22" /></Tooltip></div>
                              </div>
                            </div>
                          </template>
                        </Checkbox>
                        <div>
                          <Tooltip :content="item.name" placement="bottom">
                            <div class="text" @click="copyFileUrl(item)">{{item.name}}</div>
                          </Tooltip>
                        </div>
                      </div>
                    </div>
                  </CheckboxGroup>
                </div>
                <div class="page-box">
                  <Page :total="total" :page-size="searchForm.pageSize" show-elevator @on-change="pageChange" size="small" />
                </div>
              </div>
            </Col>
          </Row>

        </div>

      </Card>
    </Row>
    <Modal
      v-model="modalVisible"
      :mask-closable="false"
      :title="modalTitle"
      :width="500"
    >
      <Form ref="form" :label-width="95" :model="form" :rules="formValidate">
        <FormItem label="原文件名" prop="name">
          <Input v-model="form.name"/>
        </FormItem>
        <FormItem label="存储文件名" prop="fileKey">
          <Input v-model="form.fileKey" disabled/>
        </FormItem>
      </Form>
      <div slot="footer">
        <Button type="text" @click="handleCancel">取消</Button>
        <Button :loading="submitLoading" type="primary" @click="handleSubmit"
        >提交
        </Button>
      </div>
    </Modal>

    <Modal v-model="picVisible" :title="picTitle" draggable>
      <img
        :src="file.url"
        alt="无效的图片链接"
        style="width: 100%; margin: 0 auto; display: block"
      />
      <div slot="footer">
        <span
        >文件类型：{{ file.fileType }} 文件大小：{{ file.msize }} 创建时间：{{
            file.createTime
          }}</span
        >
      </div>
    </Modal>

    <Modal
      v-model="videoVisible"
      :title="videoTitle"
      :width="800"
      draggable
      @on-cancel="closeVideo"
    >
      <div id="dplayer"></div>
      <div slot="footer">
        <span
        >文件类型：{{ file.fileType }} 文件大小：{{ file.msize }} 创建时间：{{
            file.createTime
          }}</span
        >
      </div>
    </Modal>

    <!-- 添加分组修改分组编辑框 -->
    <Modal
      v-model="enableGroup"
      :title="insertOrUpdate === 'insert' ? '添加分组' : '修改分组'"
      :loading="groupLoading"
      @on-ok="submitAddGroup"
      footer-hide
    >
      <Form
        ref="formValidate"
        :label-width="80"
        :model="groupFormValidate"
        :rules="groupRuleValidate"
      >
        <FormItem label="所在分组" prop="id">
          <Cascader
            v-model="groupFormValidate.id"
            :data="treeData"
            change-on-select
            @on-change="treeDataChange"
          ></Cascader>
        </FormItem>
        <FormItem label="分组名称" prop="directoryName">
          <Input v-model="groupFormValidate.directoryName"/>
        </FormItem>
      </Form>
      <div class="modal-footer">
        <Button @click="enableGroup = false">取消</Button>
        <Button type="primary" @click="submitAddGroup">确定</Button>
      </div>
    </Modal>
  </div>
</template>

<script>
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
  import { commonUrl } from "@/libs/axios";

  const config = require("@/config/index");

  let dp;
  export default {
    name: "oss-manage",
    props: {
      isComponent: {
        default: false,
        type: Boolean,
      },
      choose: {
        type: String,
        default: ""
      }
    },
    data() {
      return {
        commonUrl, // 上传文件路径
        config, // api地址
        fileDirectoryId: "",
        groupFormValidate: {
          id: [],
          level: 0,
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
        searchForm: {
          // 搜索框对应data对象
          name: "",
          fileKey: "",
          fileType: "",
          pageNumber: 1, // 当前页数
          pageSize: 27, // 页面大小
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
              if (params.row.fileType.includes("image") > 0) {
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
              } else if (params.row.fileType.includes("video") > 0) {
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
                      src: require("@/assets/play.png"),
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
                m = "[店铺]";
              } else {
                m = "[会员]";
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
                ),
                h(
                  "Button",
                  {
                    props: {
                      type: "info",
                      size: "small",
                    },
                    style: {
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
                  "Button",
                  {
                    props: {
                      type: "error",
                      size: "small",
                    },
                    style: {
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
              if (params.row.fileType.includes("image") > 0) {
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
              } else if (params.row.fileType.includes("video") > 0) {
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
                      src: require("@/assets/play.png"),
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
                m = "[店铺]";
              } else {
                m = "[会员]";
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
        myData: [
          {
            title: 'parent 1',
            expand: true,
            render: (h, { root, node, data }) => {
              return h('span', {style: {display: 'inline-block', width: '100%'}}, [
                h('span', [h("Icon", {type: 'ios-folder-outline', style: {marginRight: '8px'}}), h('span', data.title)]),
                h('span', {style: {display: 'inline-block', float: 'right', marginRight: '32px'}},
                  [h("Button", {...this.buttonProps, icon: 'ios-add', type: 'primary', style: {width: '64px'}, onClick: () => { this.append(data) }})
                  ])
              ]);
            },
            children: [
              {title: 'child 1-1', expand: true, children: [{title: 'leaf 1-1-1', expand: true}, {title: 'leaf 1-1-2', expand: true}]},
              {title: 'child 1-2', expand: true, children: [{title: 'leaf 1-2-1', expand: true}, {title: 'leaf 1-2-1', expand: true}]}
            ]
          }
        ],
        buttonProps: {type: 'default', size: 'small',},
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
        if (val) {
          this.$emit("callback", {url: val[val.length-1].split(',')[1]});
        }
      }
    },

    methods: {
      onMouseOver(item, index) {
        this.$set(this.data[index], 'isShowPreview', true);
        this.$forceUpdate();
      },
      onMouseOut(item, index) {
        this.$set(this.data[index], 'isShowPreview', false);
      },
      // 复选框值改变时触发
      selectOssChange(e) {
        if (e) {
          this.selectList = e.map(item => {return { id: item.split(',')[0]}});
          this.selectCount = e.length;
          // let size = 0;
          // e.forEach((item) => {size += item.fileSize * 1.0;});
          // this.totalSize = ((size * 1.0) / (1024 * 1024)).toFixed(2) + " MB";
          this.$emit("selected", e);
        }
      },
      // 页码改变时回调
      pageChange(value) {
        this.$set(this, 'selectedOss', []);
        this.searchForm.pageNumber = value;
        this.getDataList();
      },
      // 自定义tree节点显示内容和交互
      renderContent (h, { root, node, data }) {
        return h('span', {style: {display: 'inline-block', width: '100%'}},
          [
            h('span', [h("Icon", {type: 'ios-paper-outline', style: {marginRight: '8px'}}), h('span', data.title)]),
            h('span', {style: {display: 'inline-block', float: 'right', marginRight: '10px'}},
              [
                h("Dropdown", {style: {marginLeft: "4px"}},
                  [
                    h("Icon", {props: {type: 'ios-more', size: "20",}, style: {display: 'inline-block'}, on:{click: () => {}}}),
                    h("DropdownMenu", {slot: "list"
                    }, [
                      h("DropdownItem", { nativeOn:{click: () => {this.handleContextMenuEdit()}} }, "编辑"),
                      h("DropdownItem", { nativeOn:{click: () => {this.handleContextMenuDelete()}} }, "删除"),
                    ])
                  ]),
              ])
          ]);
      },




      handleContextMenu(val) {
        console.log('handleContextMenu', val);
        this.selectedGroupData = val;
      },
      // 编辑分组
      handleContextMenuEdit(val) {
        this.insertOrUpdate = "update";

        this.enableGroup = true;
        // this.groupFormValidate = this.selectedGroupData;

        this.groupFormValidate.directoryName = this.selectedGroupData.title;
        this.groupFormValidate.id = [this.selectedGroupData.value];
        this.groupFormValidate.level = this.selectedGroupData.level;

        this.groupFormValidate.parentId = this.selectedGroupData.parentId;
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
      treeDataChange(value, selectedData) {
        if (value && value.length) {
          if (value[value.length -1] == '0') {
            this.groupFormValidate.level = 0;
          } else {
            this.groupFormValidate.level = Number(selectedData[selectedData.length -1].level) + 1;
          }
        }
      },
      // 保存/修改分组
      async submitAddGroup() {
        this.$refs["formValidate"].validate(async (valid) => {
          if (valid) {
            let res
            const params = { ...this.groupFormValidate };

            if (this.insertOrUpdate === "insert") {
              // params.directoryType = this.selectedGroupData.directoryType
              params.parentId = params.id[params.id.length - 1];
              // params.type = this.selectedGroupData.type
              delete params.id;
              res = await addFileDirectory(params);
            } else {
              params.id = params.id[params.id.length - 1];
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
            this.treeData = this.getTree(res.result);
            this.treeDataDefault = this.getTree(res.result);
            this.treeData.unshift({
              title: "全部图片",
              label: "全部分类",
              value: "0",
              level: 0,
              children: [],
              id: "0",
              categoryId: 0,
            });
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
          this.searchForm.userEnums = type;
          this.getDataList();
          this.$set(this, 'selectedOss', []);
        }
      },
      /**
       * 选择
       */
      selectedParams(val) {
        this.$emit("callback", val);
      },
      // 更多操作
      handleDropdown(name) {
        if (name === "refresh") {
          this.getDataList('refresh');
        } else if (name === "removeAll") {
          this.removeAll();
        }
      },
      // 初始化数据
      init() {
        this.accessToken = {
          accessToken: this.getStore("accessToken"),
        };
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
        if (v) {
          this.searchForm.startDate = v[0];
          this.searchForm.endDate = v[1];
        }
      },
      // 改变查看方式
      changeShowType() {
        this.searchForm.pageNumber = 1;
        if (this.showType == "list") {
          this.searchForm.pageSize = 10;
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
          if (type === 'refresh') {
            this.$Message.success('刷新成功！');
          }
        });
      },
      // 搜索
      handleSearch() {
        this.searchForm.title = this.searchForm.name;
        this.searchForm.pageNumber = 1;
        if (this.showType == "list") {
          this.searchForm.pageSize = 5;
        } else {
          this.searchForm.pageSize = 12;
        }
        this.getDataList();
      },
      // 文件类型筛选
      changeFileType() {
        let name = this.fileType;
        if (name == "all") {
          this.searchForm.fileType = "";
        } else if (name == "pic") {
          this.searchForm.fileType = "image";
        } else if (name == "video") {
          this.searchForm.fileType = "video";
        }
        this.handleSearch();
      },
      // 上传文件超过大小限制
      handleMaxSize(file) {
        this.$Notice.warning({
          title: "文件大小过大",
          desc: "所选文件大小过大, 不得超过 1M.",
        });
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
            this.selectList.forEach(function (e) {ids += e.id + ",";});
            ids = ids.substring(0, ids.length - 1);
            deleteFile(ids).then((res) => {
              this.$Modal.remove();
              if (res.success) {
                this.$set(this, 'selectedOss', []);
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
        this.searchForm.pageSize =18; // 页面大小
      }
    },
  };
</script>
