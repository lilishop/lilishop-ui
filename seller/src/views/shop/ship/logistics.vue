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
    </Card>
  </div>
</template>

<script>
  import * as API_Shop from "@/api/shops";

  export default {
    name: "logistics",
    components: {},
    data() {
      return {
        loading: true, // 表单加载状态
        searchForm: {
          // 搜索框初始化对象
          pageNumber: 1, // 当前页数
          pageSize: 10, // 页面大小
          sort: "createTime", // 默认排序字段
          order: "desc", // 默认排序方式
        },
        form: {
          // 添加或编辑表单对象初始化数据
          sn: "",
          sellerName: "",
          startTime: "",
          endTime: "",
          billPrice: "",
        },
        // 表单验证规则
        formValidate: {},
        submitLoading: false, // 添加或编辑提交状态
        selectList: [], // 多选数据
        selectCount: 0, // 多选计数
        columns: [

          {
            title: "物流公司",
            key: "name",
            minWidth: 120,
            sortable: false,
          },
          {
            title: "状态",
            key: "selected",
            minWidth: 120,
            sortable: true,
            render: (h, params) => {
              if(params.row.selected === null || params.row.selected === ""){
                return h("div", [h("tag", {props: {color: "volcano"}}, "关闭")]);
              }else{
                return h("div", [h("tag", {props: {color: "green"}}, "开启")]);
              }
            }
          },
          {
            title: "操作",
            key: "action",
            align: "center",
            width: 200,
            render: (h, params) => {
              if(params.row.selected === null){
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
                          this.checked(params.row);
                        },
                      },
                    },
                    "开启"
                  ),
                ]);
              }else{
                return h("div", [
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
                          this.unChecked(params.row);
                        },
                      },
                    },
                    "关闭"
                  ),
                ]);
              }

            },
          },
        ],
        data: [], // 表单数据
      };
    },
    methods: {
      init() {
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
      changeSelect(e) {
        this.selectList = e;
        this.selectCount = e.length;
      },
      getDataList() {
        this.loading = true;
        API_Shop.getLogistics().then((res) => {
          this.loading = false;
          if (res.success) {
            this.data = res.result;
          }
        });
        this.loading = false;
      },
      //物流公司选中
      checked(v) {
        this.$Modal.confirm({
          title: "确认开启",
          // 记得确认修改此处
          content: "您确认开启此物流公司?",
          loading: true,
          onOk: () => {
            API_Shop.logisticsChecked(v.id).then((res) => {
              this.$Modal.remove();
              if (res.success) {
                this.$Message.success("物流公司开启成功");
                this.init();
              }
            });
          }
        });
      },
      //物流公司取消选中
      unChecked(v){
        this.$Modal.confirm({
          title: "确认关闭",
          // 记得确认修改此处
          content: "您确认关闭此物流公司?",
          loading: true,
          onOk: () => {
            API_Shop.logisticsUnChecked(v.selected).then((res) => {
              this.$Modal.remove();
              if (res.success) {
                this.$Message.success("物流公司关闭成功");
                this.init();
              }
            });
          }
        });
      }
    },
    mounted() {
      this.init();
    },
  };
</script>
<style lang="scss">
  // 建议引入通用样式 可删除下面样式代码
  // @import "@/styles/table-common.scss";
  .search {
    .operation {
      margin-bottom: 2vh;
    }

    .select-count {
      font-weight: 600;
      color: #40a9ff;
    }

    .select-clear {
      margin-left: 10px;
    }

    .page {
      margin-top: 2vh;
    }

    .drop-down {
      margin-left: 5px;
    }
  }
</style>
