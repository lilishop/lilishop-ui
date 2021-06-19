<template>
  <div class="search">
    <Row>
      <Col>
      <Card>
        <Row @keydown.enter.native="handleSearch">
          <Form ref="searchForm" :model="searchForm" inline :label-width="70" class="search-form">
            <Form-item label="系统类型" prop="orderSn">
              <Select v-model="searchForm.type" placeholder="请选择系统类型" clearable style="width: 200px">
                <Option value="IOS">苹果</Option>
                <Option value="ANDROID">安卓</Option>
              </Select>
            </Form-item>
            <Button @click="handleSearch" type="primary" icon="ios-search">搜索</Button>
          </Form>
        </Row>
        <Row class="operation" style="margin-top: 20px">
          <Button @click="addAppVersion" type="primary">添加</Button>
        </Row>
        <Row class="padding-row">
          <Table :loading="loading" border :columns="columns" :data="data" ref="table" sortable="custom" @on-sort-change="changeSort" @on-selection-change="changeSelect"></Table>
        </Row>
        <Row type="flex" justify="end" class="page">
          <Page :current="searchForm.pageNumber" :total="total" :page-size="searchForm.pageSize" @on-change="changePage" @on-page-size-change="changePageSize" :page-size-opts="[10, 20, 50]"
            size="small" show-total show-elevator show-sizer></Page>
        </Row>
      </Card>
      </Col>
    </Row>
    <Modal :title="modalTitle" v-model="modalVisible" :mask-closable="false" :width="1000">
      <Form ref="form" :model="form" :label-width="100" :rules="formValidate">
        <FormItem label="版本名称" prop="versionName">
          <Input v-model="form.versionName" maxlength="15" clearable style="width: 40%" />
        </FormItem>
        <FormItem label="版本号" prop="version">
          <Input v-model="form.version" maxlength="15" clearable style="width: 40%" />
        </FormItem>
        <FormItem label="更新时间" prop="versionUpdateDate">
          <DatePicker v-model="form.versionUpdateDate" type="datetime" format="yyyy-MM-dd HH:mm:ss" clearable placeholder="请选择" style="width: 200px"></DatePicker>
        </FormItem>
        <FormItem label="强制更新">
          <RadioGroup type="button" button-style="solid" v-model="form.forceUpdate">
            <Radio :label="true">强制更新</Radio>
            <Radio :label="false">非强制更新</Radio>
          </RadioGroup>
        </FormItem>
        <FormItem label="类型">
          <RadioGroup type="button" button-style="solid" v-model="form.type">
            <Radio label="IOS">苹果</Radio>
            <Radio label="ANDROID">安卓</Radio>
          </RadioGroup>
        </FormItem>
        <FormItem label="下载地址" prop="downloadUrl">
          <Input v-model="form.downloadUrl" maxlength="100" clearable style="width: 40%" />
        </FormItem>
        <FormItem class="form-item-view-el" label="更新内容" prop="content">
             <Input v-model="form.content" :rows="6" maxlength="100" show-word-limit type="textarea" placeholder="Enter something..."  />
        </FormItem>
      </Form>
      <div slot="footer">
        <Button type="text" @click="modalVisible = false">取消</Button>
        <Button type="primary" :loading="submitLoading" @click="saveAppVersion">保存</Button>
      </div>
    </Modal>
    <div>
      <!-- 查看版本信息 -->
      <Modal :title="queryModalTitle" v-model="queryModalVisible" :width="700">
        <Form>
          <div class="div-version">
            <FormItem label="版本名称:">
              {{form.versionName}}
            </FormItem>
          </div>
          <div class="div-version">
            <FormItem label="版本号:">
              {{form.version}}
            </FormItem>
          </div>

          <FormItem label="更新时间:">
            <div>
              {{versionUpdateDate}}
            </div>
          </FormItem>
          <FormItem label="强制更新:">
            <span v-if="form.forceUpdate == 1">强制更新</span>
            <span v-else>非强制更新</span>
          </FormItem>
          <FormItem label="类型">
            <span v-if="form.type == 'IOS'">IOS</span>
            <span v-else>安卓</span>
          </FormItem>
          <FormItem label="下载地址:">
            {{form.downloadUrl}}
          </FormItem>
          <FormItem label="更新内容:">
            <div v-html="form.content">

            </div>
          </FormItem>
        </Form>
        <div slot="footer">
          <Button type="text" @click="queryModalVisible = false">取消</Button>
        </div>
      </Modal>
    </div>
  </div>
</template>

<script>
import * as API_Setting from "@/api/setting";

export default {
  name: "orderList",
  components: {

  },
  data() {
    return {
      queryModalVisible: false, // 版本信息modal
      queryModalTitle: "查看更新信息", // modal标题
      loading: true, // 表单加载状态
      modalVisible: false, // 添加app版本模态框
      modalTitle: "", // 添加app版本标题
      modalType: 0, // 新增、编辑标识
      searchForm: {
        // 搜索框初始化对象
        pageNumber: 1, // 当前页数
        pageSize: 10, // 页面大小
        sort: "createTime", // 默认排序字段
        order: "desc", // 默认排序方式
        type: "",
      },
      form: {
        // 添加或编辑表单对象初始化数据
        versionName: "",
        version: "",
        forceUpdate: 1,
        type: "IOS",
        downloadUrl: "",
        content: "",
        versionUpdateDate: "",
      },
      versionUpdateDate: "", // 更新时间
      // 表单验证规则
      formValidate: {
        version: [
          { required: true, message: "版本号不能为空", trigger: "blur" },
        ],
        versionName: [
          { required: true, message: "版本名称不能为空", trigger: "blur" },
        ],
        downloadUrl: [
          { required: true, message: "下载地址不能为空", trigger: "blur" },
        ],
        versionUpdateDate: [{ required: true, message: "更新时间不能为空" }],
      },
      submitLoading: false, // 添加或编辑提交状态
      selectList: [], // 多选数据
      selectCount: 0, // 多选计数
      columns: [
        {
          title: "版本名称",
          key: "versionName",
          minWidth: 100,
        },
        {
          title: "版本号",
          key: "version",
          minWidth: 120,
        },
        {
          title: "强制更新",
          key: "forceUpdate",
          width: 100,
          render: (h, params) => {
            return h(
              "div",
              {
                props: {
                  color: params.row.forceUpdate ? "primary" : "default",
                },
              },
              params.row.forceUpdate == 0 ? "非强制" : "强制"
            );
          },
        },
        {
          title: "类型",
          key: "type",
          minWidth: 80,
          render: (h, params) => {
            if (params.row.type == "IOS") {
              return h("div", [h("span", {}, "苹果")]);
            } else {
              return h("div", [h("span", {}, "安卓")]);
            }
          },
        },

        {
          title: "更新时间",
          key: "versionUpdateDate",
          minWidth: 120,
          sortable: true,
        },

        {
          title: "操作",
          key: "action",
          align: "center",
          width: 230,
          render: (h, params) => {
            return h("div", [
              h(
                "Button",
                {
                  props: {
                    type: "info",
                    size: "small",
                  },
                  style: {
                    marginRight: "5px",
                  },
                  on: {
                    click: () => {
                      this.detail(params.row);
                    },
                  },
                },
                "查看"
              ),
              h(
                "Button",

                {
                  props: {
                    type: "info",
                    size: "small",
                    ghost: true,
                  },
                  style: {
                    marginRight: "5px",
                  },
                  on: {
                    click: () => {
                      this.editAppVersion(params.row);
                    },
                  },
                },
                "修改"
              ),
              h(
                "Button",
                {
                  props: {
                    type: "error",
                    size: "small",
                  },
                  style: {
                    marginRight: "5px",
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
      data: [], // 表单数据
      total: 0, // 表单数据总数
    };
  },
  methods: {
    init() {
      this.getData();
    },
    changePage(v) {
      this.searchForm.pageNumber = v;
      this.getData();
    },
    changePageSize(v) {
      this.searchForm.pageSize = v;
      this.getData();
    },
    handleSearch() {
      this.searchForm.pageNumber = 1;
      this.searchForm.pageSize = 10;
      this.getData();
    },
    changeSort(e) {
      this.searchForm.sort = e.key;
      this.searchForm.order = e.order;
      if (e.order === "normal") {
        this.searchForm.order = "";
      }
      this.getData();
    },
    changeSelect(e) {
      this.selectList = e;
      this.selectCount = e.length;
    },
    getData() {
      this.loading = true;
      API_Setting.appVersionPage(this.searchForm).then((res) => {
        this.loading = false;
        if (res.success) {
          this.data = res.result.records;
          this.total = res.result.total;
        }
      });
      this.total = this.data.length;
      this.loading = false;
    },
    //添加app版本信息
    addAppVersion() {
      this.modalVisible = true;
      this.modalTitle = "添加APP版本信息";
      const versionUpdateDate = this.$options.filters.unixToDate(
        new Date() / 1000
      );
      this.form = {
        forceUpdate: 0,
        type: "IOS",
        versionUpdateDate: versionUpdateDate,
        content: " ",
      };
    },
    //添加app版本信息
    editAppVersion(v) {
      this.modalVisible = true;
      this.modalTitle = "修改APP版本信息";
      this.modalType = 1;
      this.form = v;
    },
    //保存app版本信息
    saveAppVersion() {
      this.$refs.form.validate((valid) => {
        if (valid) {
          this.submitLoading = true;
          const versionUpdateDate = this.$options.filters.unixToDate(
            this.form.versionUpdateDate / 1000
          );
          this.form.versionUpdateDate = versionUpdateDate;

          this.form.updateTime = versionUpdateDate;
          if (this.modalType == 0) {
            // 添加 避免编辑后传入id等数据 记得删除
            delete this.form.id;
            API_Setting.addVersion(this.form).then((res) => {
              this.submitLoading = false;
              if (res && res.success) {
                this.$Message.success("添加成功");
                this.modalVisible = false;
                this.getData();
              }
            });
          } else {
            API_Setting.editVersion(this.form, this.form.id).then((res) => {
              this.submitLoading = false;
              if (res && res.success) {
                this.$Message.success("修改成功");
                this.modalVisible = false;
                this.getData();
              }
            });
          }
        }
      });
    },
    remove(v) {
      this.$Modal.confirm({
        title: "确认删除",
        content: "您确认要删除么?",
        loading: true,
        onOk: () => {
          // 删除
          API_Setting.deleteVersion(v.id).then((res) => {
            this.$Modal.remove();
            if (res.success) {
              this.$Message.success("删除成功");
              this.getData();
            }
          });
        },
      });
    },
    detail(v) {
      this.queryModalVisible = true;
      this.form = JSON.parse(JSON.stringify(v));
      //时间格式化有问题，所以另外单独给时间赋值
      this.versionUpdateDate = this.form.versionUpdateDate;
    },
  },
  mounted() {
    this.init();
  },
};
</script>
<style lang="scss" scoped>
.ivu-form-item {
  margin-bottom: 14px;
  vertical-align: top;
  zoom: 1;
}
.search-form {
  width: 100%;
}
// 建议引入通用样式 可删除下面样式代码
@import "@/styles/table-common.scss";
</style>
