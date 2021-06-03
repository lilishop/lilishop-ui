<style lang="scss">
  @import "@/styles/table-common.scss";
</style>
<template>
  <div class="search">
    <Card>
      <Table
        :loading="loading"
        border
        :columns="columns"
        :data="data"
        ref="table"
        sortable="custom"
        @on-sort-change="changeSort"
        @on-selection-change="changeSelect"
      ></Table>
      <Row type="flex" justify="end" class="page">
        <Page
          :current="pageNumber"
          :total="total"
          :page-size="pageSize"
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
    <!-- 修改模态框 -->
    <Modal v-model="formValidate" :title="modalTitle" @on-ok="" width="500">
      <Form
        ref="formValidate"
        :model="form"
        :label-width="80"
      >
        <FormItem label="用户名" prop="userName">
          <span> {{form.userName}}</span>
        </FormItem>
        <FormItem label="手机号码" prop="mobile">
          <span> {{form.mobile}}</span>
        </FormItem>
        <FormItem label="类型" prop="type">
          <span v-if="form.type == 'FUNCTION'">功能建议</span>
          <span v-if="form.type == 'OPTIMIZE'">优化反馈</span>
          <span v-if="form.type == 'OTHER'">其他意见</span>
        </FormItem>
        <FormItem label="反馈内容" prop="context">
          <Input style="width: 85%" v-model="form.context" type="textarea" disabled :autosize="{minRows: 3,maxRows: 5}"
          ></Input>
        </FormItem>
        <FormItem label="相关材料" prop="images">
          <div v-if="form.images == null">
            暂无
          </div>
          <div v-else>
            <span v-for="(item, index) in this.form.images.split(',')">
              <Avatar shape="square" icon="ios-person" size="large" style="width: 80px;height: 90px;margin-right: 5px" :src="item"
              />
            </span>
          </div>
        </FormItem>
      </Form>
      <div slot="footer">
        <Button type="text" @click="formValidate = false">取消</Button>
      </div>
    </Modal>
  </div>
</template>

<script>
  import {
    getMemberFeedback,
    getMemberFeedbackDetail
  } from "@/api/other";

  export default {
    name: "role-manage",
    data() {
      return {
        loading: true, // 加载状态
        modalType: 0, // 0 添加 1 编辑
        form: {}, // 表单数据
        searchForm: { // 请求参数
          pageNumber: 1,
          pageSize: 10,
        },
        modalTitle: "详细", // modal标题
        formValidate: false, // modal显隐
        images: [], // 图片列表
        columns: [ // 表头
          {
            type: "selection",
            width: 60,
            align: "center",
          },
          {
            title: "会员名称",
            key: "userName",
            minWidth: 120,
            tooltip: true

          },
          {
            title: "手机号码",
            key: "mobile",
            minWidth: 120,
            tooltip: true

          },
          {
            title: "反馈内容",
            key: "context",
            minWidth: 380,
            tooltip: true
          },
          {
            title: "类型",
            key: "type",
            minWidth: 120,
            render: (h, params) => {
              if (params.row.type == "FUNCTION") {
                return h('div', [h('span', {}, "功能建议")]);
              } else if (params.row.type == "OPTIMIZE") {
                return h('div', [h('span', {}, "优化反馈")]);
              } else if (params.row.type == "OTHER") {
                return h('div', [h('span', {}, "其他意见")]);
              } else {
                return h('div', [h('span', {}, "未知意见")]);
              }
            }
          },
          {
            title: "创建时间",
            key: "createTime",
            width: 170,
            sortable: true,
          },
          {
            title: "操作",
            key: "action",
            align: "center",
            fixed: "right",
            width: 130,
            render: (h, params) => {
              return h("div", [
                h(
                  "Button",
                  {
                    props: {
                      size: "small",
                      type: "info"
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
                )
              ]);
            },
          },
        ],
        data: [],
        pageNumber: 1,
        pageSize: 10,
        total: 0,
        permData: [],
        editRolePermId: "",
        selectAllFlag: false,
        depData: [],
        dataType: 0,
        editDepartments: [],

        saveRoleWay: [], //用户保存用户点击的菜单
      };
    },
    methods: {
      init() {
        this.getFeedback();
      },

      changePage(v) {
        this.searchForm.pageNumber = v;
        this.getFeedback();
      },
      changePageSize(v) {
        this.searchForm.pageSize = v;
        this.getFeedback();
      },
      changeSort(e) {
        this.sortColumn = e.key;
        this.sortType = e.order;
        if (e.order == "normal") {
          this.sortType = "";
        }
        this.getFeedback();
      },

      /**
       * 查询意见反馈
       */
      getFeedback() {
        this.loading = true;
        getMemberFeedback(this.searchForm).then((res) => {
          this.loading = false;
          if (res.success) {
            this.data = res.result.records;
            this.total = res.result.total;
          }
        });
      },
      /**
       * 投诉建议详细
       */
      detail(v) {
        getMemberFeedbackDetail(v.id).then((res) => {
          this.loading = false;
          if (res.success) {
            this.$set(this, "form", res.result);
            this.formValidate = true
          }
        });

      }
    },
    mounted() {
      this.init();
    },
  };
</script>
