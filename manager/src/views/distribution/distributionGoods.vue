<template>
  <div class="search">
    <Card>
      <Row @keydown.enter.native="handleSearch">
        <Form ref="searchForm" :model="searchForm" inline :label-width="70" class="search-form">
          <Form-item label="商品名称" prop="goodsName">
            <Input
              type="text"
              v-model="searchForm.goodsName"
              placeholder="请输入商品名称"
              clearable
              style="width: 200px"
            />
          </Form-item>
          <Button @click="handleSearch" type="primary" icon="ios-search" class="search-btn">搜索</Button>
        </Form>
      </Row>
      <Row class="operation" style="margin-top: 10px">
        <Button @click="delAll">批量删除</Button>
      </Row>
      <Table :loading="loading" border :columns="columns" :data="data" ref="table" sortable="custom" @on-sort-change="changeSort" @on-selection-change="changeSelect">
        <template slot="goodsName" slot-scope="{row}">
          <div>
            <div class="div-zoom">
              <a @click="linkTo(row.goodsId,row.skuId)">{{row.goodsName}}</a>
            </div>
            <Poptip trigger="hover" title="扫码在手机中查看" transfer>
              <div slot="content">
                <vue-qr :text="wapLinkTo(row.goodsId,row.skuId)"  :margin="0" colorDark="#000" colorLight="#fff" :size="150"></vue-qr>
              </div>
              <img src="../../assets/qrcode.svg" class="hover-pointer" width="20" height="20" alt="">
            </Poptip>
          </div>
        </template>
      </Table>
      <Row type="flex" justify="end" class="page">
        <Page :current="searchForm.pageNumber" :total="total" :page-size="searchForm.pageSize" @on-change="changePage" @on-page-size-change="changePageSize" :page-size-opts="[10,20,50]" size="small" show-total show-elevator show-sizer></Page>
      </Row>
    </Card>
  </div>
</template>

<script>
import {
        getDistributionGoods,
        delDistributionGoods
    } from "@/api/distribution";
import {getShopListData} from '@/api/shops'
export default {
  name: "distributionGoods",
  components: {
  },
  data() {
    return {
      shopList:[], // 店铺列表
      loading: true, // 表单加载状态
      searchForm: { // 搜索框初始化对象
        pageNumber: 1, // 当前页数
        pageSize: 10, // 页面大小
        sort: "createTime", // 默认排序字段
        order: "desc", // 默认排序方式
      },
      selectList: [], // 多选数据
      selectCount: 0, // 多选计数
      columns: [
        // 表头
        {
          type: "selection",
          width: 60,
          align: "center",
          fixed: "left",
        },
        {
          title: "商品图片",
          fixed: "left",
          key: "thumbnail",
          width: 120,
          align: "center",
                    render: (h, params) => {
                      return h("img", {
                        attrs: {
                          src: params.row.thumbnail,
                          alt: "加载图片失败"
                        },
                        style: {
                          cursor: "pointer",
                          width: "80px",
                          height: "60px",
                          margin: "10px 0",
                          "object-fit": "contain"
                        }
                      });
                    }
        },
        {
          title: "商品名称",
          slot: "goodsName",
          minWidth: 200,
          tooltip: true
        },
        {
          title: "商品价格",
          key: "price",
          minWidth: 100,
          render: (h, params) => {
            return h("div", this.$options.filters.unitPrice(params.row.price,'￥'));
          }
        },
        {
          title: "库存",
          key: "quantity",
        },
        {
          title: "添加时间",
          key: "createTime",
          width: 170
        },
        {
          title: "店铺名称",
          key: "storeName",
          tooltip: true
        },
        {
            title: "佣金金额",
            key: "commission",
            sortable: false,
            render: (h, params) => {
                return h("div", this.$options.filters.unitPrice(params.row.commission,'￥'));
            }

        },
        {
          title: "操作",
          key: "action",
          align: "center",
          fixed: "right",
          width: 150,
          render: (h, params) => {
            return h("div", [
              h(
                "Button",
                {
                  props: {
                    type: "error",
                    size: "small"
                  },
                  on: {
                    click: () => {
                      this.remove(params.row);
                    }
                  }
                },
                "下架"
              )
            ]);
          }
        }
      ],
      data: [], // 表单数据
      total: 0 // 表单数据总数
    };
  },
  methods: {
    init() {
      this.getDataList();
      // this.getShopList()
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
      this.init();
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
      // 带多条件搜索参数获取表单数据 请自行修改接口
      getDistributionGoods(this.searchForm).then(res => {
        this.loading = false;
        if (res.success) {
          this.data = res.result.records;
          this.total = res.result.total;
        }
      });
      this.total = this.data.length;
      this.loading = false;
    },
    remove(v) {
      this.$Modal.confirm({
        title: "确认删除",
        // 记得确认修改此处
        content: "您确认要删除么?",
        loading: true,
        onOk: () => {
          // 删除
          delDistributionGoods(v.id).then(res => {
            this.$Modal.remove();
            if (res.success) {
              this.$Message.success("删除成功");
              this.getDataList();
            }
          });
        }
      });
    },
    delAll() {
      if (this.selectCount <= 0) {
        this.$Message.warning("您还未选择要删除的数据");
        return;
      }
      this.$Modal.confirm({
        title: "确认删除",
        content: "您确认要删除所选的 " + this.selectCount + " 条数据?",
        loading: true,
        onOk: () => {
          let ids = []
          this.selectList.forEach(item => {
              ids.push(item.id)
          });
          // 批量删除
          delDistributionGoods(ids.toString()).then(res => {
            this.$Modal.remove();
            if (res.success) {
              this.$Message.success("删除成功");
              this.clearSelectAll();
              this.getDataList();
            }
          });
        }
      });
    },
    getShopList(val){
      const params = {
        pageNumber:1,
        pageSize:10,
        storeName:''
      }
      if(val){
        params.storeName = val;
      }else {
        params.storeName = ''
      }

      getShopListData(params).then(res => {
        this.shopList = res.result.records
      })
    },
    searchChange(val){
      this.getShopList(val)
    }
  },
  mounted() {
    this.init();
  }
};
</script>
<style lang="scss">
  @import "@/styles/table-common.scss";
</style>

