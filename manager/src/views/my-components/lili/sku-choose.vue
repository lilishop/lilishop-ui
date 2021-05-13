<template>
  <div class="sku-choose">
    <Button @click="showDrawer=true" :icon="icon">{{text}}</Button>
    <span @click="clearSelectData" class="clear">清空已选</span>
    <Collapse simple class="collapse">
      <Panel name="1">
        已选择
        <span class="select-count">{{selectObj.length}}</span> 件
        <p slot="content">
          <Tag
            v-for="(item, i) in selectObj"
            :key="i"
            :name="item.id"
            color="default"
            closable
            @on-close="handleCancelObj"
          >{{createName(item)}}
          </Tag>
        </p>
      </Panel>
    </Collapse>
    <Drawer title="选择SKU" closable v-model="showDrawer" :width="width" draggable>
      <Form ref="searchForm" :model="searchForm" inline :label-width="55">
        <Form-item label="名称" prop="goodsName">
          <Input
            type="text"
            v-model="searchForm.goodsName"
            clearable
            placeholder="输入商品名称"
            style="width: 200px"
          />
        </Form-item>
        <Form-item style="margin-left:-35px;" class="br">
          <Button @click="handleSearchData" type="primary" icon="ios-search">搜索</Button>
          <Button @click="handleResetObj">重置</Button>
        </Form-item>
      </Form>
      <Table
        :loading="showLoading"
        border
        :columns="tableColumns"
        :data="tableData"
        :height="height"
        ref="tableData"
      ></Table>
      <Row type="flex" justify="end" style="margin: 10px 0;">
        <Page
          :current="searchForm.pageNumber"
          :total="tableTotal"
          :page-size="searchForm.pageSize"
          @on-change="changeDataPage"
          @on-page-size-change="changeDataPageSize"
          :page-size-opts="[10,20,50]"
          size="small"
          show-total
          show-elevator
          show-sizer
        ></Page>
      </Row>
      <div class="my-drawer-footer">
        已选择
        <span class="select-count">{{selectObj.length}}</span> 件
        <Button @click="clearSelectData" style="margin-left:10px">清空已选</Button>
        <Button @click="showDrawer=false" type="primary" style="margin-left:10px">关闭</Button>
      </div>
    </Drawer>
  </div>
</template>

<script>
  import {getSkuPage} from "@/api/goods";

  export default {
    name: "userChoose",
    props: {
      text: {
        type: String,
        default: "选择SKU"
      },
      icon: {
        type: String,
        default: "md-basket"
      },
      initData: {
        type: Array,
        default: []
      },
      createName: {
        type: Function,
        default: function (item) {
          return item.goodsName
        }
      }
    },
    mounted(){
      this.selectObj = this.initData
      console.log(JSON.stringify(this.initData))
    },
    data() {
      return {
        //默认值后续计算
        height: 500,
        width: 500,
        //加载状态
        showLoading: true,
        //展示抽屉
        showDrawer: false,
        selectObj: [], // 选择数据
        searchForm: { // 请求参数
          goodsName: "",
          pageNumber: 1, // 当前页数
          pageSize: 10, // 页面大小
          sort: "createTime", // 默认排序字段
          order: "desc" // 默认排序方式
        },
        tableColumns: [ // 表头
          {
            type: "index",
            width: 60,
            align: "center"
          },
          {
            title: "商品名称",
            key: "goodsName",
            minWidth: 140
          },
          {
            title: "规格",
            key: "specName",
            minWidth: 140,
          },
          {
            title: "图片",
            key: "thumbnail",
            width: 80,
            align: "center",
            render: (h, params) => {
              return h("Avatar", {
                props: {
                  src: params.row.face
                }
              });
            }
          },
          {
            title: "状态",
            key: "status",
            align: "center",
            width: 120,
            render: (h, params) => {
              if (params.row.delFlag == 0) {
                return h("div", [
                  h("Badge", {
                    props: {
                      status: "success",
                      text: "正常"
                    }
                  })
                ]);
              } else if (params.row.delFlag == -1) {
                return h("div", [
                  h("Badge", {
                    props: {
                      status: "error",
                      text: "禁用"
                    }
                  })
                ]);
              }
            }
          },
          {
            title: "创建时间",
            key: "createTime",
            sortable: true,
            sortType: "desc",
            width: 170
          },
          {
            title: "操作",
            key: "action",
            width: 130,
            align: "center",
            fixed: "right",
            render: (h, params) => {
              let select;
              this.selectObj.forEach(item => {
                if (item.id === params.row.id) {
                  select = params.row
                }
              });

              if (select) {
                return h("div", [
                  h(
                  "Button",
                  {
                    props: {
                      type: "info",
                      size: "small"
                    },
                    on: {
                      click: () => {
                        this.chooseCancel(params.row);
                      }
                    }
                  },
                  "取消选择"
                  )
                ]);
              } else {
                return h("div", [
                  h(
                  "Button",
                  {
                    props: {
                      type: "info",
                      size: "small"
                    },
                    on: {
                      click: () => {
                        this.chooseObj(params.row);
                      }
                    }
                  },
                  "选择"
                  )
                ]);
              }
            }
          }
        ],
        tableData: [], // 表格数据
        tableTotal: 0 // 总数
      };
    },
    methods: {
      changeDataPage(v) {
        this.searchForm.pageNumber = v;
        this.searchData();
      },
      changeDataPageSize(v) {
        this.searchForm.pageSize = v;
        this.searchData();
      },
      searchData() {
        this.showLoading = true;
        getSkuPage(this.searchForm).then(res => {
          this.showLoading = false;
          if (res.success) {
            this.tableData = res.result.records;
            this.tableTotal = res.result.total;
          }
        });

      },
      handleSearchData() {
        this.searchForm.pageNumber = 1;
        this.searchForm.pageSize = 10;
        this.searchData();
      },
      handleResetObj() {
        this.$refs.searchForm.resetFields();
        this.searchForm.pageNumber = 1;
        this.searchForm.pageSize = 9;
        this.searchForm.departmentId = "";
        // 重新加载数据
        this.searchData();
      },
      setData(v) {
        this.selectObj = v;
        this.$emit("on-change", this.selectObj);
      },
      chooseCancel(v) {
        let _index;
        this.selectObj.forEach((e, index) => {
          if (v.id == e.id) {
            _index = index;
          }
        });

        if (_index || _index == 0) {
          this.selectObj.splice(_index, 1);
          this.$emit("on-change", this.selectObj);
        }
      },
      chooseObj(v) {
        // 去重
        let that = this;
        let flag = true;
        this.selectObj.forEach(e => {
          if (v.id == e.id) {
            flag = false;
          }
        });
        if (flag) {
          this.selectObj.push(v);
          this.$emit("on-change", this.selectObj);
        }
      },
      clearSelectData() {
        this.selectObj = [];
        this.$emit("on-change", this.selectObj);
      },
      handleCancelObj(e, id) {
        // 删除所选用户
        let newArray = [];
        this.selectObj.forEach(e => {
          if (id != e.id) {
            newArray.push(e);
          }
        });
        this.selectObj = newArray;
        this.$emit("on-change", this.selectObj);
      }
    },
    created() {
      // 计算高度
      this.height = Number(document.documentElement.clientHeight - 230);
      this.width = Number(document.documentElement.clientWidth/2)>900?900:Number(document.documentElement.clientWidth/2)
      this.searchData();

    }
  };
</script>

<style lang="scss" scoped>
  .sku-choose {
    .clear {
      font-size: 12px;
      margin-left: 15px;
      color: #40a9ff;
      cursor: pointer;
    }

    .collapse {
      font-size: 12px;
      margin-top: 15px;
    }

    .select-count {
      font-weight: 600;
      color: #40a9ff;
    }
  }

  .my-drawer-footer {
    z-index: 10;
    width: 100%;
    position: absolute;
    bottom: 0;
    left: 0;
    border-top: 1px solid #e8e8e8;
    padding: 10px 16px;
    text-align: right;
    background: #fff;
  }
</style>
