<template>
  <div class="search">
    <Card>
      <Row @keydown.enter.native="handleSearch">
        <Form ref="searchForm" :model="searchForm" inline :label-width="85" class="search-form">
          <Form-item label="上传时间">
            <DatePicker v-model="selectDate" type="daterange" format="yyyy-MM-dd" clearable
                        @on-change="selectDateRange" placeholder="选择起始时间" style="width: 200px"></DatePicker>
          </Form-item>
          <Button @click="handleSearch" type="primary" icon="ios-search" class="search-btn">搜索</Button>
        </Form>
      </Row>
      <Row>
        <div class="oss-operation padding-row">
          <div>
            <Upload
              ref="up"
              :action="commonUrl + '/common/common/upload/file'"
              :data="{directoryPath: searchForm.fileDirectoryId,}"
              :headers="accessToken"
              :max-size="20480"
              :on-error="handleError"
              :on-exceeded-size="handleMaxSize"
              :on-success="handleSuccess"
              :show-upload-list="false"
              multiple
              style="display: inline-block;margin-right: 5px;"
            >
              <Button type="primary">上传图片</Button>
            </Upload>
            <Dropdown @on-click="handleDropdown">
              <Button>更多操作<Icon type="md-arrow-dropdown"/></Button>
              <DropdownMenu slot="list">
                <DropdownItem name="refresh">刷新</DropdownItem>
                <DropdownItem name="removeAll">批量删除</DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </div>
        </div>
      </Row>
      <!--<Row >-->
        <Alert show-icon>
          已选择<span >{{ selectCount }}</span> 项
          <a class="select-clear" @click="clearSelectAll">清空</a>
          <span v-if="selectCount > 0" style="margin-left: 15px">共计 {{ totalSize }} 存储量</span>
        </Alert>
      <!--</Row>-->
      <Row class="flex">
        <div class="article-category mr_10">
          <Tree :data="treeData" @on-contextmenu="handleContextMenu" @on-select-change="handleCateChange">
            <template slot="contextMenu" v-if="!isComponent">
              <DropdownItem @click.native="handleContextMenuEdit">编辑</DropdownItem>
              <DropdownItem style="color: #ed4014" @click.native="handleContextMenuDelete">删除</DropdownItem>
            </template>
          </Tree>
          <Alert v-if="!isComponent">鼠标右键编辑/删除分组</Alert>
          <div class="group-row flex" v-if="!isComponent">
            <Button @click="handleClickAddGroup">添加分组</Button>
          </div>
        </div>
        <Table
          ref="table"
          :columns="isComponent ? viewColumns : columns"
          :data="data"
          :loading="loading"
          border
          class="table"
          sortable="custom"
          @on-sort-change="changeSort"
          @on-selection-change="changeSelect">
          <template slot="fileKey" slot-scope="{ row }">
            <a @click="copyFileUrl(row)">{{ row.fileKey }}</a>
          </template>
        </Table>
      </Row>
      <Row class="mt_10" justify="end" type="flex">
        <Page
          :current="searchForm.pageNumber"
          :page-size="searchForm.pageSize"
          :page-size-opts="pageSizeOpts"
          :total="total"
          show-elevator
          show-sizer
          show-total
          size="small"
          @on-change="changePage"
          @on-page-size-change="changePageSize"
        ></Page>
      </Row>
    </Card>
    <!--查看大图-->
    <Modal v-model="picVisible" :title="picTitle" draggable>
      <img :src="file.url" alt="无效的图片链接" style="width: 100%; margin: 0 auto; display: block"/>
      <div slot="footer">
        <span>文件类型：{{file.fileType}} 文件大小：{{file.msize}} 创建时间：{{file.createTime}}</span>
      </div>
    </Modal>
    <!-- 添加分组修改分组编辑框 -->
    <Modal v-model="enableGroup" :title="insertOrUpdate === 'insert' ? '添加分组' : '修改分组'" :loading="groupLoading" @on-ok="submitAddGroup" footer-hide>
      <Form ref="formValidate" :label-width="80" :model="groupFormValidate" :rules="groupRuleValidate">
        <FormItem label="所在分组" prop="id">
          <Cascader v-model="groupFormValidate.id" :data="treeData" change-on-select @on-change="treeDataChange"></Cascader>
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
  import { commonUrl } from "@/libs/axios";
  const config = require('@/config/index');
  import { getFileListData, deleteFile, getFileDirectory, addFileDirectory, delFileDirectory, updateFileDirectory } from "@/api/index";

  export default {
    name: "ossManage",
    data() {
      return {
        commonUrl, // 上传文件路径
        config, // api地址
        accessToken: {}, // 上传token鉴权
        loading: false, // 表单加载状态
        searchForm: {
          // 搜索框对应data对象
          name: "",
          fileKey: "",
          fileType: "",
          pageNumber: 1, // 当前页数
          pageSize: 10, // 页面大小
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
          {type: "selection", width: 60, align: "center",},
          {
            title: "缩略图(点击预览)",
            key: "url",
            width: 300,
            align: "center",
            render: (h, params) => {
              if (params.row.fileType.includes("image") > 0) {
                return h("img", {
                  attrs: {src: params.row.url || "", alt: "加载图片失败",},
                  style: {cursor: "pointer", width: "80px", height: "60px", margin: "10px 0", "object-fit": "contain",},
                  on: {click: () => {this.showPic(params.row);},},
                });
              } else if (params.row.fileType.includes("video") > 0) {
                // 如果视频文件大小超过5MB不予加载video
                if (params.row.fileSize < 1024 * 1024 * 5) {
                  return h("video", {
                    style: {cursor: "pointer", width: "80px", height: "60px", margin: "10px 0", "object-fit": "contain",},
                    on: {click: () => {this.showVideo(params.row);},},
                    },
                    [h("source", {attrs: {src: params.row.url,},}),]
                  );
                } else {
                  return h("img", {
                    attrs: {src: require("@/assets/play.png"),},
                    style: {cursor: "pointer", width: "80px", height: "60px", margin: "10px 0", "object-fit": "contain",},
                    on: {click: () => {this.showVideo(params.row);},},
                  });
                }
              } else {
                return h("span", "非多媒体类型");
              }
            },
          },
          {title: "文件类型", key: "fileType", width: 115, className: this.selectImage == true ? "none" : "",},
          {
            title: "文件大小",
            key: "fileSize",
            width: 115,
            sortable: true,
            className: this.selectImage == true ? "none" : "",
            render: (h, params) => {
              let m = ((params.row.fileSize * 1.0) / (1024 * 1024)).toFixed(2) + " MB";
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
                h("Button", {
                  props: {type: "default", size: "small",},
                  style: {marginRight: "5px", display: this.selectImage === true ? "inline-block" : "none",},
                  on: {click: () => {this.selectedParams(params.row);},},
                }, "选择"),
                h("Button", {
                  props: {type: "info", size: "small",},
                  style: {marginRight: "5px", display: this.selectImage == true ? "none" : "inline-block",},
                  on: {click: () => {this.download(params.row);},},
                }, "下载"),
                h("Button", {
                  props: {type: "error", size: "small",},
                  style: {display: this.selectImage == true ? "none" : "inline-block",},
                  on: {click: () => {this.remove(params.row);},},
                }, "删除"),
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
                  attrs: {src: params.row.url || "", alt: "加载图片失败",},
                  style: {cursor: "pointer", width: "80px", height: "60px", margin: "10px 0", "object-fit": "contain",},
                  on: {click: () => {this.showPic(params.row);},},
                });
              } else if (params.row.fileType.includes("video") > 0) {
                // 如果视频文件大小超过5MB不予加载video
                if (params.row.fileSize < 1024 * 1024 * 5) {
                  return h("video", {
                    style: {cursor: "pointer", width: "80px", height: "60px", margin: "10px 0", "object-fit": "contain",},
                    on: {click: () => {this.showVideo(params.row);},},},
                    [h("source", {attrs: {src: params.row.url,},}),]
                  );
                } else {
                  return h("img", {
                    attrs: {src: require("@/assets/play.png"),},
                    style: {cursor: "pointer", width: "80px", height: "60px", margin: "10px 0", "object-fit": "contain",},
                    on: {click: () => {this.showVideo(params.row);},},
                  });
                }
              } else {
                return h("span", "非多媒体类型");
              }
            },
          },
          {title: "文件类型", key: "fileType", width: 115, className: this.selectImage == true ? "none" : "",},
          {
            title: "文件大小",
            key: "fileSize",
            width: 115,
            sortable: true,
            className: this.selectImage == true ? "none" : "",
            render: (h, params) => {
              let m = ((params.row.fileSize * 1.0) / (1024 * 1024)).toFixed(2) + " MB";
              return h("span", m);
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
            width: 150,
            render: (h, params) => {
              return h("div", [
                h("Button", {
                  props: {type: "default", size: "small",},
                  style: {marginRight: "5px", display: this.selectImage === true ? "inline-block" : "none",},
                  on: {click: () => {this.selectedParams(params.row);},},
                }, "选择")
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
        picVisible: false, // 图片modal
        picTitle: "", // 图片title
        enableGroup: false, // 是否展示分组
        groupFormValidate: {
          id: [],
          level: 0,
          directoryName: "",
        },
        groupRuleValidate: {
          directoryName: [{required: true, message: "请输入分组名称", trigger: "blur",},],
          id: [{required: true, message: "请选择分组", trigger: "blur", type: "array",},],
        },
        selectImage: false, //是否是选择
      }
    },
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
    watch: {
      selectImage(val) {
        if (val && !this.data.length) this.init();
      },
      choose(val) {
        if (val) this.selectImage = val
      }
    },
    mounted() {
      if(!this.isComponent) { // 是组件的话，初始化不调用接口
        this.init();
      }
    },
    methods: {
      // 初始化数据
      init() {
        this.accessToken = {
          accessToken: this.getStore("accessToken"),
        };
        this.getDataList();
        this.getAllList();
      },
      // 搜索
      handleSearch() {
        this.searchForm.title = this.searchForm.name;
        this.searchForm.pageNumber = 1;
          this.searchForm.pageSize = 5;
        this.getDataList();
      },
      // 起止时间从新赋值
      selectDateRange(v) {
        if (v) {
          this.searchForm.startDate = v[0];
          this.searchForm.endDate = v[1];
        }
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
      // 查看大图
      showPic(v) {
        this.file = v;
        this.file.msize = ((v.fileSize * 1.0) / (1024 * 1024)).toFixed(2) + " MB";

        this.picTitle = v.name + "(" + v.fileKey + ")";
        this.picVisible = true;
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
      // 下载文件
      download(v) {
        window.open(
          v.url + "?attname=&response-content-type=application/octet-stream"
        );
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
            });
          },
        });
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
                this.$Message.success("批量删除文件成功");
                this.clearSelectAll();
                this.getDataList();
              }
            });
          },
        });
      },
      // 获取OSS资源
      getDataList() {
        this.pageSizeOpts = [10, 20, 50];
        this.loading = true;
        getFileListData(this.searchForm).then((res) => {
          this.loading = false;

          this.data = res.result.records;
          this.total = res.result.total;
        });
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
      // 清除选中状态
      clearSelectAll() {
        this.$refs.table.selectAll(false);
        this.totalSize = "";
      },
      // 更多操作
      handleDropdown(name) {
        if (name === "refresh") {
          this.getDataList();
        } else if (name === "removeAll") {
          this.removeAll();
        }
      },
      handleContextMenu(val) {
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
              this.getAllList();
            }
          },
        });
      },
      // 选择分类回调
      handleCateChange(data) {
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
            let res;
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
            obj.contextmenu = true;
            obj.parentId = item.parentId;
            obj.children = this.getTree(item.children); // 递归调用
            arr.push(obj);
          });
        }
        return arr;
      },
      /**
       * 选择
       */
      selectedParams(val) {
        this.$emit("callback", val);
      },
    }
  }
</script>

<style lang="scss">
// 建议引入通用样式 可删除下面样式代码
@import "@/styles/table-common.scss";
.export {
  margin: 10px 20px 10px 0;
}

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
.ivu-card {
  width: 100%;
}
.modal-footer {
  text-align: center;
  > * {
    margin: 0 10px;
  }
}
</style>
