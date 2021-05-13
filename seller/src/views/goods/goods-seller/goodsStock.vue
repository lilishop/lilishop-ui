<template>
  <div class="search">
    <Row>
      <Col>
        <Card>
          <Row v-show="openSearch" @keydown.enter.native="handleSearch">
            <Form
              ref="searchForm"
              :model="searchForm"
              inline
              :label-width="70"
              class="search-form"
            >
              <Form-item label="商品名称" prop="goodsName">
                <Input
                  type="text"
                  v-model="searchForm.goodsName"
                  placeholder="请输入商品名称"
                  clearable
                  style="width: 200px"
                />
              </Form-item>
              <span v-if="drop">
                <Form-item label="状态" prop="status">
                  <Select
                    v-model="searchForm.marketEnable"
                    placeholder="请选择"
                    clearable
                    style="width: 200px"
                  >
                    <Option value="DOWN">下架</Option>
                    <Option value="UPPER">上架</Option>
                  </Select>
                </Form-item>
                <Form-item label="商品编号" prop="sn">
                  <Input
                    type="text"
                    v-model="searchForm.sn"
                    placeholder="商品编号"
                    clearable
                    style="width: 200px"
                  />
                </Form-item>
              </span>
              <Form-item style="margin-left: -35px" class="br">
                <Button @click="handleSearch" type="primary" icon="ios-search"
                  >搜索</Button
                >
                <Button @click="handleReset">重置</Button>
                <a class="drop-down" @click="dropDown">
                  {{ dropDownContent }}
                  <Icon :type="dropDownIcon"></Icon>
                </a>
              </Form-item>
            </Form>
          </Row>
          <Row class="operation">
            <Button @click="addGoods" icon="md-refresh">添加商品</Button>
            <Button @click="getDataList" icon="md-refresh">刷新</Button>
            <Button type="dashed" @click="openSearch = !openSearch">{{
              openSearch ? "关闭搜索" : "开启搜索"
            }}</Button>
            <Button type="dashed" @click="openTip = !openTip">{{
              openTip ? "关闭提示" : "开启提示"
            }}</Button>
          </Row>
          <Row v-show="openTip">
            <Alert show-icon>
              已选择 <span class="select-count">{{ selectCount }}</span> 项
              <a class="select-clear" @click="clearSelectAll">清空</a>
            </Alert>
          </Row>
          <Row>
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
          </Row>
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
      </Col>
    </Row>
    <Modal
      title="更新库存"
      v-model="updateStockModalVisible"
      :mask-closable="false"
      :width="500"
    >
      <Input
        type="number"
        v-model="updateStockParam.quantity"
      />
      <div slot="footer">
        <Button type="text" @click="updateStockModalVisible = false"
          >取消</Button
        >
        <Button type="primary" @click="updateStock">更新</Button>
      </div>
    </Modal>
  </div>
</template>

<script>
import {
  getGoodsListDataByStockSeller,
  getGoodsSkuListDataSeller,
  updateGoodsSkuStocks,
  upGoods,
  lowGoods,
} from "@/api/goods";
export default {
  name: "goods",
  components: {},
  data() {
    return {
      id: "", //要操作的id
      openSearch: true, // 显示搜索
      openTip: true, // 显示提示
      loading: true, // 表单加载状态
      updateStockModalVisible: false, // 更新库存模态框
      drop: false, // 搜索栏更多选项
      dropDownContent: "展开",
      dropDownIcon: "ios-arrow-down",
      searchForm: {
        // 搜索框初始化对象
        pageNumber: 1, // 当前页数
        pageSize: 10, // 页面大小
        sort: "create_time", // 默认排序字段
        order: "desc", // 默认排序方式
      },
      updateStockParam: { // 更新库存表单
        id: 0,
        quantity:  0,
      },
      form: {
        // 添加或编辑表单对象初始化数据
        goodsName: "",
        sn: "",
        marketEnable: "",
        price: "",
        sellerName: "",
      },
      selectList: [], // 多选数据
      selectCount: 0, // 多选计数
      columns: [ // 表格表头
        {
          type: "selection",
          width: 60,
          align: "center",
        },

        {
          title: "商品缩略图",
          key: "thumbnail",
          width: 150,
          align: "center",
          render: (h, params) => {
            return h("img", {
              attrs: {
                src: params.row.thumbnail,
                alt: "加载图片失败",
              },
              style: {
                cursor: "pointer",
                width: "80px",
                height: "60px",
                margin: "10px 0",
                "object-fit": "contain",
              },
            });
          },
        },

        {
          title: "商品名称",
          key: "goodsName",
          minWidth: 120
        },

        {
          title: "库存预警数量",
          key: "stockWarningNum",
          minWidth: 120
        },

        {
          title: "商品库存",
          key: "quantity",
          minWidth: 120
        },

        {
          title: "操作",
          key: "action",
          align: "center",
          width: 200,
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
                      this.getUpdateStock(params.row);
                    },
                  },
                },
                "库存"
              )
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
    getUpdateStock(row) {
      this.updateStockParam = {skuId: row.id, quantity: row.quantity};
      this.updateStockModalVisible = true;
    },
    updateStock() {
      let updateStockList = [this.updateStockParam];
      updateGoodsSkuStocks(updateStockList).then(res => {
        if (res.success) {
          this.updateStockModalVisible = false;
          this.$Message.success("更新库存成功");
          this.getDataList();
        }
      });
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
    dropDown() {
      if (this.drop) {
        this.dropDownContent = "展开";
        this.dropDownIcon = "ios-arrow-down";
      } else {
        this.dropDownContent = "收起";
        this.dropDownIcon = "ios-arrow-up";
      }
      this.drop = !this.drop;
    },
    getDataList() {
      this.loading = true;
      // 带多条件搜索参数获取表单数据
      getGoodsListDataByStockSeller(this.searchForm).then((res) => {
        this.loading = false;
        if (res.success) {
          this.data = res.result.goodsSkuIPage.records.map(i =>{
             i.stockWarningNum = res.result.stockWarningNum
             return i;
          });
          this.total = res.result.goodsSkuIPage.total;
        }
      });
    },
  },
  mounted() {
    this.init();
  },
};
</script>
<style lang="scss" scoped>
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
