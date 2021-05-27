<template>
  <div class="search">
    <Card>
      <Row @keydown.enter.native="handleSearch">
        <Form ref="searchForm" :model="searchForm" inline :label-width="70" class="search-form">
          <Form-item label="会员名称" prop="memberName">
            <Input
              type="text"
              v-model="searchForm.memberName"
              placeholder="请输入会员名称"
              clearable
              style="width: 200px"
            />
          </Form-item>
          <Form-item label="店铺名称" prop="storeName">
            <Input
              type="text"
              v-model="searchForm.storeName"
              placeholder="请输入店铺名称"
              clearable
              style="width: 200px"
            />
          </Form-item>
          <Form-item label="创建时间" prop="createTime">
            <DatePicker v-model="selectDate" type="datetimerange" format="yyyy-MM-dd HH:mm:ss" clearable @on-change="selectDateRange" placeholder="选择起始时间" style="width: 200px"></DatePicker>
          </Form-item>
          <Button @click="handleSearch" type="primary" icon="ios-search" class="search-btn">搜索</Button>
        </Form>
      </Row>
      <Table :loading="loading" border :columns="columns" :data="data" ref="table" sortable="custom" @on-sort-change="changeSort" @on-selection-change="changeSelect"></Table>
      <Row type="flex" justify="end" class="page">
        <Page :current="searchForm.pageNumber" :total="total" :page-size="searchForm.pageSize" @on-change="changePage" @on-page-size-change="changePageSize" :page-size-opts="[10, 20, 50]"
              size="small" show-total show-elevator show-sizer></Page>
      </Row>
    </Card>
  </div>
</template>

<script>
  import {
    getShopListData,
    disableShop,
    enableBrand,
    shopAudit,
  } from "@/api/shops";
  import shopOperation from "./shopOperation";
  export default {
    name: "shop",
    components: {
      shopOperation,
    },
    data() {
      return {
        shopId: "", // 店铺id
        modalFlag: false, // 新增、编辑标识
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
        selectDate: null, // 创建时间
        form: {
          // 添加或编辑表单对象初始化数据
          memberName: "",
          storeName: "",
          shopDisable: "",
          id: "",
          createTime: "",
        },
        selectList: [], // 多选数据
        selectCount: 0, // 多选计数
        columns: [
          // 表头
          {
            title: "店铺名称",
            key: "storeName",
            minWidth: 120,
            align: "left",
          },
          {
            title: "会员名称",
            key: "memberName",
            align: "left",
            minWidth: 120,
          },
          {
            title: "店铺地址",
            key: "storeAddressPath",
            width: 300,
            sortable: false,
            render: (h, params) => {
            return h(
              "Tag",
              {

              },
              params.row.storeAddressPath ||  "暂未填写"
            );
          },
          },
          {
            title: "是否自营",
            key: "selfOperated",
            align: "left",
            width: 120,
            render: (h, params) => {
              return h(
                "Tag",
                {
                  props: {
                    color: params.row.selfOperated ? "default" : "primary",
                  },
                },
                params.row.selfOperated ? "自营" : "非自营"
              );
            },
          },

          {
            title: "创建时间",
            key: "createTime",
            align: "left",
            width: 170,
            sortable: false,
          },
          {
            title: "操作",
            key: "action",
            width: 170,
            align: "center",
            fixed: "right",
            render: (h, params) => {
              let enableOrDisable = "";
              if (params.row.storeDisable == "OPEN") {
                enableOrDisable = h(
                  "Button",
                  {
                    props: {
                      size: "small",
                      type: "error"
                    },
                    style: {
                      marginRight: "5px",
                    },
                    on: {
                      click: () => {
                        this.disable(params.row);
                      },
                    },
                  },
                  "关闭"
                );
              } else if (params.row.storeDisable == "CLOSED") {
                enableOrDisable = h(
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
                        this.enable(params.row);
                      },
                    },
                  },
                  "开启"
                );
              } else if (params.row.storeDisable == "APPLYING") {
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
                          this.audit(params.row);
                        },
                      },
                    },
                    "审核"
                  ),
                  h(
                    "Button",
                    {
                      props: {
                        type: "primary",
                        size: "small",
                      },
                      style: {
                        marginRight: "5px",
                      },
                      on: {
                        click: () => {
                          this.edit(params.row);
                        },
                      },
                    },
                    "修改"
                  ),
                ]);
              }

              return h("div", [
                h(
                  "Button",
                  {
                    props: {
                      size: "small",
                    },
                    style: {
                      marginRight: "5px",
                      display: this.selectedShop ? "inline-block" : "none",
                    },
                    on: {
                      click: () => {
                        this.callback(params.row);
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
                    },
                    on: {
                      click: () => {
                        this.edit(params.row);
                      },
                    },
                  },
                  "修改"
                ),
                enableOrDisable,
              ]);
            },
          },
        ],
        data: [], // 表单数据
        total: 0, // 表单数据总数
        selectedShop: false, //用于是否选择店铺
      };
    },

    methods: {
      callbackShop() {
        this.init();
      },
      // 回调给父级
      callback(val) {
        this.$emit("callback", val);
      },
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
      selectDateRange(v) {
        if (v) {
          this.searchForm.startDate = v[0];
          this.searchForm.endDate = v[1];
        }
      },

      getDataList() {
        this.loading = true;
        // 带多条件搜索参数获取表单数据 请自行修改接口
        this.searchForm.storeDisable='APPLYING'
        getShopListData(this.searchForm).then((res) => {
          this.loading = false;
          if (res.success) {
            this.data = res.result.records;
            this.total = res.result.total;
          }
        });
        this.total = this.data.length;
        this.loading = false;
      },
      add() {
        this.$router.push({ path: '/shop-operation'});
      },
      edit(v) {
        this.$router.push({ path: '/shop-operation', query: { shopId: v.id } });
      },
      disable(v) {
        this.$Modal.confirm({
          title: "确认禁用",
          content: "您确认要禁用店铺 " + v.storeName + " ?",
          loading: true,
          onOk: () => {
            disableShop(v.id).then((res) => {
              this.$Modal.remove();
              if (res.success) {
                this.$Message.success("操作成功");
                this.getDataList();
              }
            });
          },
        });
      },
      audit(v) {
        this.$Modal.confirm({
          title: "审核店铺",
          content: "您确认要审核通过店铺 " + v.storeName + " ?",
          okText: "通过",
          cancelText: "驳回",
          loading: true,
          onOk: () => {
            shopAudit(v.id, 0).then((res) => {
              this.$Modal.remove();
              if (res.success) {
                this.$Message.success("操作成功");
                this.getDataList();
              }
            });
          },
          onCancel: () => {
            shopAudit(v.id, 1).then((res) => {
              this.$Modal.remove();
              if (res.success) {
                this.$Message.success("操作成功");
                this.getDataList();
              }
            });
          },
        });
      },
      enable(v) {
        this.$Modal.confirm({
          title: "确认启用",
          content: "您确认要启用店铺 " + v.storeName + " ?",
          loading: true,
          onOk: () => {
            enableBrand(v.id).then((res) => {
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
<style lang="scss">
  // 建议引入通用样式 可删除下面样式代码
  @import "@/styles/table-common.scss";
</style>
