<template>
  <div class="search">
    <Card>
      <Row @keydown.enter.native="handleSearch"></Row>
      <Row class="operation padding-row">
        <Button @click="add" type="primary">添加</Button>
      </Row>
      <Table
        :loading="loading"
        border
        :columns="columns"
        :data="data"
        ref="table"
        sortable="custom"
        @on-sort-change="changeSort"
        @on-selection-change="changeSelect"
      >
        <!-- 页面展示 -->
        <template slot="disableSlot" slot-scope="scope">
          <i-switch size="large" v-model="scope.row.disabled == 'OPEN'?true:false" @on-change="changeSwitch(scope.row)">
            <span slot="open">展示</span>
            <span slot="close">隐藏</span>
          </i-switch>
        </template>
      </Table>
      <Row type="flex" justify="end" class="page">
        <Page
          :current="searchForm.pageNumber"
          :total="total"
          :page-size="searchForm.pageSize"
          @on-change="changePage"
          @on-page-size-change="changePageSize"
          :page-size-opts="[10, 20, 50]"
          size="small"
          show-total
          show-elevator
          show-sizer
        ></Page>
      </Row>
    </Card>
    <Modal
      :title="modalTitle"
      v-model="modalVisible"
      :mask-closable="false"
      :width="500"
    >
      <Form ref="form" :model="form" :label-width="120" :rules="formValidate">
        <FormItem label="物流公司名称" prop="name">
          <Input v-model="form.name" clearable style="width: 100%"/>
        </FormItem>
        <FormItem label="物流公司代码" prop="code">
          <Input v-model="form.code" clearable style="width: 100%"/>
        </FormItem>
        <FormItem label="支持电子面单">
          <i-switch v-model="form.standBy" size="large">
            <span slot="open">开</span>
            <span slot="close">关</span>
          </i-switch>
        </FormItem>
        <FormItem label="电子面单表单">
          <Input v-model="form.formItems" clearable style="width: 100%"/>
        </FormItem>
        <FormItem label="禁用状态" prop="disabled">
          <i-switch v-model="form.disabled" size="large">
            <span slot="open">开启</span>
            <span slot="close">禁用</span>
          </i-switch>
        </FormItem>
      </Form>
      <div slot="footer">
        <Button type="text" @click="modalVisible = false">取消</Button>
        <Button type="primary" :loading="submitLoading" @click="handleSubmit"
        >提交
        </Button
        >
      </div>
    </Modal>
  </div>
</template>

<script>
  import {
    getLogisticsPage,
    updateLogistics,
    addLogistics,
    delLogistics,
  } from "@/api/logistics";

  export default {
    name: "bill",
    components: {},
    data() {
      return {
        openSearch: true, // 显示搜索
        openTip: true, // 显示提示
        loading: true, // 表单加载状态
        modalType: 0, // 添加或编辑标识
        modalVisible: false, // 添加或编辑显示
        modalTitle: "", // 添加或编辑标题
        searchForm: {
          // 搜索框初始化对象
          pageNumber: 1, // 当前页数
          pageSize: 10, // 页面大小
          sort: "createTime", // 默认排序字段
          order: "desc", // 默认排序方式
          name: "",
        },
        form: {
          // 添加或编辑表单对象初始化数据
          name: "",
        },
        // 表单验证规则
        formValidate: {
          name: [
            {
              required: true,
              message: "请输入物流公司名称",
              trigger: "blur",
            },
          ],
        },
        submitLoading: false, // 添加或编辑提交状态
        selectList: [], // 多选数据
        selectCount: 0, // 多选计数
        columns: [
          // 表头
          {
            type: "selection",
            width: 60,
            align: "center",
          },
          {
            title: "物流公司名称",
            key: "name",
            minWidth: 120,
            sortable: false,
          },
          {
            title: "物流公司编码",
            key: "code",
            minWidth: 120,
            sortable: false,
          },
          {
            title: "状态",
            key: "disabled",
            width: 150,
            slot: "disableSlot",
            /*render(h, params) {
              return h("Badge", {
                props: {
                  status: params.row.disabled == 'OPEN' ? "success" : "error",
                  text: params.row.disabled == 'OPEN' ? "开启" : "禁用",
                },
              });
            },*/
          },
          {
            title: "创建时间",
            key: "createTime",
            width: 180,
            sortable: false,
          },
          {
            title: "操作",
            key: "action",
            align: "center",
            width: 150,
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
        this.getDataList();
      },
      changePage(v) {
        this.searchForm.pageNumber = v;
        this.getDataList();
        this.clearSelectAll();
      },
      changePageSize(v) {
        this.searchForm.pageSize = v;
        this.getDataList();
      },
      handleSearch() {
        this.searchForm.pageNumber = 1;
        this.searchForm.pageSize = 10;
        this.getDataList();
      },
      handleReset() {
        this.$refs.searchForm.resetFields();
        this.searchForm.pageNumber = 1;
        this.searchForm.pageSize = 10;
        // 重新加载数据
        this.getDataList();
      },
      changeSort(e) {
        this.searchForm.sort = e.key;
        this.searchForm.order = e.order;
        if (e.order === "normal") {
          this.searchForm.order = "";
        }
        this.getDataList();
      },
      clearSelectAll() {
        this.$refs.table.selectAll(false);
      },
      changeSelect(e) {
        this.selectList = e;
        this.selectCount = e.length;
      },

      getDataList() {
        this.loading = true;

        getLogisticsPage(this.searchForm).then((res) => {
          this.loading = false;
          if (res.success) {
            this.data = res.result.records;
            this.total = res.result.total;
          }
        });
        this.total = this.data.length;
        this.loading = false;
      },
      handleSubmit() {
        this.$refs.form.validate((valid) => {
          if (valid) {
            this.submitLoading = true;
            this.form.disabled = this.form.disabled == true ? "OPEN" : "CLOSE"
            if (this.modalType == 0) {
              // 添加 避免编辑后传入id等数据 记得删除
              delete this.form.id;

              this.form.disabled
                ? (this.form.disabled = "OPEN")
                : (this.form.disabled = "CLOSE");
              addLogistics(this.form).then((res) => {
                this.submitLoading = false;
                if (res.success) {
                  this.$Message.success("操作成功");
                  this.getDataList();
                  this.modalVisible = false;
                }
              });
            } else {
              // 编辑
              updateLogistics(this.id, this.form).then((res) => {
                this.submitLoading = false;
                if (res.success) {
                  this.$Message.success("操作成功");
                  this.getDataList();
                  this.modalVisible = false;
                }
              });
            }
          }
        });
      },
      add() {
        this.modalType = 0;
        this.modalTitle = "添加";
        this.form = {};
        this.$refs.form.resetFields();

        this.modalVisible = true;
      },
      detail(v) {
        this.modalType = 1;
        this.id = v.id;
        this.modalTitle = "修改";
        this.modalVisible = true;

        this.form.name = v.name;
        this.form.code = v.code;
        this.form.standBy = v.standBy;
        this.form.formItems = v.formItems;
        this.form.disabled = v.disabled;
        this.form.disabled == "OPEN"
          ? (this.form.disabled = true)
          : (this.form.disabled = false);
      },
      remove(v) {
        this.$Modal.confirm({
          title: "确认删除",
          // 记得确认修改此处
          content: "您确认要删除 " + v.name + " ?",
          loading: true,
          onOk: () => {
            // 删除
            delLogistics(v.id).then((res) => {
              this.$Modal.remove();
              if (res.success) {
                this.$Message.success("操作成功");
                this.getDataList();
              }
            });
          },
        });
      },
    },
    mounted() {
      this.init();
    },
  };
</script>
<style lang="scss" scoped>
  // 建议引入通用样式 可删除下面样式代码
  @import "@/styles/table-common.scss";
</style>
