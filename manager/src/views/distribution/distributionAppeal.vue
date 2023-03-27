<template>
    <div>
      <Card>
        <Row @keydown.enter.native="handleSearch">
          <Form
            ref="searchForm"
            :model="searchForm"
            inline
            :label-width="70"
            class="search-form"
          >
            <Form-item label="会员名称" prop="memberName">
              <Input
                type="text"
                v-model="searchForm.memberName"
                placeholder="请输入会员名称"
                clearable
                style="width: 200px"
              />
            </Form-item>
            <Button
              @click="handleSearch"
              type="primary"
              class="search-btn"
              >搜索</Button
            >
          </Form>
        </Row>
        <Table
          class="mt_10"
          :loading="loading"
          border
          :columns="columns"
          :data="data"
          ref="table"
        ></Table>
        <Row type="flex" justify="end" class="mt_10">
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
    </div>
  </template>
  
  <script>
  import {
  getDistributionListData,
  retreatDistribution,
  resumeDistribution,
  auditDistribution,
} from "@/api/distribution";
  
  export default {
    name: "distributionApply",
    data() {
      return {
        loading: true, // 表单加载状态
        searchForm: {
          // 搜索框初始化对象
          pageNumber: 1, // 当前页数
          pageSize: 10, // 页面大小
          sort: "createTime", // 默认排序字段
          order: "desc", // 默认排序方式
          startDate: "", // 起始时间
          endDate: "", // 终止时间
        },
        columns: [
          {
            title: "会员名称",
            key: "memberName",
            minWidth: 150,
            tooltip: true,
          },
          {
            title: "会员姓名",
            key: "name",
            minWidth: 120,
          },
          {
          title: "状态",
          key: "distributionStatus",
          width: 150,
          sortable: false,
          render: (h, params) => {
            if (params.row.distributionStatus == "APPEAL") {
              return h("Tag", {props: {color: "geekblue",},},"申诉");
            } else if (params.row.distributionStatus == "RETREAT") {
              return h("Tag", {props: {color: "volcano",},},"清退");
            } else if (params.row.distributionStatus == "REFUSE") {
              return h("Tag", {props: {color: "red",},},"拒绝");
            }
          },
        },
          {
            title: "提交时间",
            key: "createTime",
            minWidth: 150,
          },
          {
            title: "操作",
            key: "action",
            align: "center",
            fixed: "right",
            width: 200,
            render: (h, params) => {
              return h("div", [
                h(
                  "Button",
                  {
                    props: {
                      type: "success",
                      size: "small",
                    },
                    style: {
                      marginRight: "5px",
                    },
                    on: {
                      click: () => {
                        this.resume(params.row);
                      },
                    },
                  },
                  "通过"
                ),
                h(
                  "Button",
                  {
                    props: {
                      type: "error",
                      size: "small",
                    },
                    on: {
                      click: () => {
                        this.retreat(params.row);
                      },
                    },
                  },
                  "拒绝"
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
      // 初始化数据
      init() {
        this.getDataList();
      },
      // 分页 改变页码
      changePage(v) {
        this.searchForm.pageNumber = v;
        this.getDataList();
        this.clearSelectAll();
      },
      // 分页 改变页数
      changePageSize(v) {
        this.searchForm.pageSize = v;
        this.getDataList();
      },
      // 搜索
      handleSearch() {
        this.searchForm.pageNumber = 1;
        this.searchForm.pageSize = 10;
        this.getDataList();
      },
      // 获取列表数据
      getDataList() {
        this.loading = true;
        this.searchForm.distributionStatus = "APPEAL";
        getDistributionListData(this.searchForm).then((res) => {
          this.loading = false;
          if (res.success) {
            this.data = res.result.records;
            this.total = res.result.total;
          }
        });
        this.total = this.data.length;
        this.loading = false;
      },
         // 恢复分销商
    resume(v) {
      this.$Modal.confirm({
        title: "提示",
        // 记得确认修改此处
        content: "您确认要通过 " + v.memberName + " 的申诉?",
        loading: true,
        onOk: () => {
          // 删除
          resumeDistribution(v.id).then((res) => {
            this.$Modal.remove();
            if (res.success) {
              this.$Message.success("操作成功");
              this.getDataList();
            }
          });
        },
      });
    },
     // 清退分销商
     retreat(v) {
      this.$Modal.confirm({
        title: "提示",
        // 记得确认修改此处
        content: "您确认要拒绝 " + v.memberName + "的申诉 ?",
        loading: true,
        onOk: () => {
          // 删除
          retreatDistribution(v.id).then((res) => {
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
  