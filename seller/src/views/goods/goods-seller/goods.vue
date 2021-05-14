<template>
  <div class="search">

    <Card>
      <Row @keydown.enter.native="handleSearch">
        <Form ref="searchForm" :model="searchForm" inline :label-width="70" class="search-form">
          <Form-item label="商品名称" prop="goodsName">
            <Input type="text" v-model="searchForm.goodsName" placeholder="请输入商品名称" clearable style="width: 200px" />
          </Form-item>
          <Form-item label="状态" prop="status">
            <Select v-model="searchForm.marketEnable" placeholder="请选择" clearable style="width: 200px">
              <Option value="DOWN">下架</Option>
              <Option value="UPPER">上架</Option>
            </Select>
          </Form-item>
          <Form-item label="商品编号" prop="sn">
            <Input type="text" v-model="searchForm.sn" placeholder="商品编号" clearable style="width: 200px" />
          </Form-item>
          <Button @click="handleSearch" type="primary" icon="ios-search" class="search-btn">搜索</Button>
          <Button @click="handleReset" class="search-btn">重置</Button>
        </Form>
      </Row>
      <Row class="operation padding-row">
        <Button @click="addGoods" type="primary">添加商品</Button>
        <Dropdown @on-click="handleDropdown">
          <Button type="default">
            批量操作
            <Icon type="ios-arrow-down"></Icon>
          </Button>
          <DropdownMenu slot="list">
            <DropdownItem name="uppers">批量上架</DropdownItem>
            <DropdownItem name="lowers">批量下架</DropdownItem>
            <DropdownItem name="deleteAll">批量删除</DropdownItem>
            <DropdownItem name="batchShipTemplate">批量设置运费模板</DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </Row>

      <Table :loading="loading" border :columns="columns" :data="data" ref="table" sortable="custom" @on-sort-change="changeSort" @on-selection-change="changeSelect">

        <!-- 商品栏目格式化 -->
        <template slot="goodsSlot" slot-scope="scope">
          <div style="margin-top: 5px;height: 90px; display: flex;">
            <div style="">
              <img :src="scope.row.original" style="height: 80px;margin-top: 3px;width: 70px">
            </div>

            <div style="margin-left: 13px;">
              <div class="div-zoom">
                <a>{{scope.row.goodsName}}</a>
              </div>
            </div>
          </div>

        </template>

      </Table>

      <Row type="flex" justify="end" class="page">
        <Page :current="searchForm.pageNumber" :total="total" :page-size="searchForm.pageSize" @on-change="changePage" @on-page-size-change="changePageSize" :page-size-opts="[10, 20, 50]" size="small"
          show-total show-elevator show-sizer></Page>
      </Row>
    </Card>

    <Modal title="更新库存" v-model="updateStockModalVisible" :mask-closable="false" :width="500">
      <Input type="number" v-model="stockAllUpdate" placeholder="全部修改，如不需全部修改，则不需输入" />
      <Table :columns="updateStockColumns" :data="stockList" border :span-method="handleSpan"></Table>
      <div slot="footer">
        <Button type="text" @click="updateStockModalVisible = false">取消</Button>
        <Button type="primary" @click="updateStock">更新</Button>
      </div>
    </Modal>

    <!-- 批量设置运费模板 -->
    <Modal title="批量设置运费模板" v-model="shipTemplateModal" :mask-closable="false" :width="500">
      <Form ref="shipTemplateForm" :model="shipTemplateForm" :label-width="120">
        <FormItem class="form-item-view-el" label="运费" prop="freightPayer">
          <RadioGroup @on-change="logisticsTemplateUndertakerChange" v-model="shipTemplateForm.freightPayer">
            <Radio label="BUYER">
              <span>买家承担运费</span>
            </Radio>
            <Radio label="STORE">
              <span>使用物流规则</span>
            </Radio>
          </RadioGroup>
        </FormItem>

        <FormItem class="form-item-view-el" label="物流模板" prop="templateId" v-if="shipTemplateShow">
          <Select v-model="shipTemplateForm.templateId" style="width: 200px">
            <Option v-for="item in logisticsTemplate" :value="item.id" :key="item.id">{{ item.name }}
            </Option>
          </Select>
        </FormItem>
      </Form>
      <div slot="footer">
        <Button type="text" @click="shipTemplateModal = false">取消</Button>
        <Button type="primary" @click="saveShipTemplate">更新</Button>
      </div>
    </Modal>
  </div>
</template>

<script>
import {
  getGoodsListDataSeller,
  getGoodsSkuListDataSeller,
  updateGoodsSkuStocks,
  upGoods,
  lowGoods,
  deleteGoods,
  batchShipTemplate,
} from "@/api/goods";

import * as API_Store from "@/api/shops";

export default {
  name: "goods",
  data() {
    return {
      id: "", //要操作的id
      loading: true, // 表单加载状态
      shipTemplateForm: {
        freightPayer: "BUYER",
      },
      shipTemplateShow: false, //物流模板是否显示
      shipTemplateModal: false, // 物流模板是否显示
      logisticsTemplate: [], // 物流列表
      updateStockModalVisible: false, // 更新库存模态框显隐
      stockAllUpdate: undefined, // 更新库存数量
      searchForm: {
        // 搜索框初始化对象
        pageNumber: 1, // 当前页数
        pageSize: 10, // 页面大小
        sort: "create_time", // 默认排序字段
        order: "desc", // 默认排序方式
      },
      stockList: [], // 库存列表
      form: {
        // 添加或编辑表单对象初始化数据
        goodsName: "",
        sn: "",
        marketEnable: "",
        price: "",
        sellerName: "",
      },
      updateStockColumns: [
        {
          title: "sku规格",
          key: "sn",
          minWidth: 120,
          render: (h, params) => {
            return h("div", {}, params.row.simpleSpecs);
          },
        },
        {
          title: "审核状态",
          key: "isAuth",
          width: 130,
          render: (h, params) => {
            if (params.row.isAuth == "TOBEAUDITED") {
              return h("div", [
                h("Badge", {
                  props: {
                    status: "error",
                    text: "待审核",
                  },
                }),
              ]);
            } else if (params.row.isAuth == "PASS") {
              return h("div", [
                h("Badge", {
                  props: {
                    status: "success",
                    text: "审核通过",
                  },
                }),
              ]);
            } else if (params.row.isAuth == "REFUSE") {
              return h("div", [
                h("Badge", {
                  props: {
                    status: "error",
                    text: "审核拒绝",
                  },
                }),
              ]);
            }
          },
        },
        {
          title: "操作",
          key: "action",
          align: "center",
          width: 200,
          render: (h, params) => {
            let vm = this;
            return h("InputNumber", {
              props: {
                value: params.row.quantity,
              },
              on: {
                "on-change": (event) => {
                  vm.stockList[params.index].quantity = event;
                },
              },
            });
          },
        },
      ],
      // 表单验证规则
      formValidate: {},
      submitLoading: false, // 添加或编辑提交状态
      selectList: [], // 多选数据
      selectCount: 0, // 多选计数
      columns: [
        {
          type: "selection",
          width: 60,
          align: "center",
        },
        {
          title: "商品编号",
          key: "sn",
          width: 200,
          tooltip: true,
        },
        {
          title: "商品名称",
          key: "goodsName",
          minWidth: 200,
          slot: "goodsSlot",
        },

        {
          title: "市场价格",
          key: "cost",
          width: 130,
          render: (h, params) => {
            return h(
              "div",
              this.$options.filters.unitPrice(params.row.cost, "￥")
            );
          },
        },
        {
          title: "商品价格",
          key: "price",
          width: 130,
          render: (h, params) => {
            return h(
              "div",
              this.$options.filters.unitPrice(params.row.price, "￥")
            );
          },
        },
        {
          title: "库存",
          key: "quantity",
          width: 120,
          render: (h, params) => {
            if (params.row.quantity) {
              return h("div", params.row.quantity);
            } else {
              return h("div", 0);
            }
          },
        },
        {
          title: "审核状态",
          key: "isAuth",
          width: 120,
          render: (h, params) => {
            if (params.row.isAuth == "PASS") {
              return h("div", [
                h("Badge", {
                  props: {
                    status: "success",
                    text: "审核通过",
                  },
                }),
              ]);
            } else if (params.row.isAuth == "TOBEAUDITED") {
              return h("div", [
                h("Badge", {
                  props: {
                    status: "error",
                    text: "待审核",
                  },
                }),
              ]);
            } else if (params.row.isAuth == "REFUSE") {
              return h("div", [
                h("Badge", {
                  props: {
                    status: "error",
                    text: "审核拒绝",
                  },
                }),
              ]);
            }
          },
        },
        {
          title: "上架状态",
          key: "marketEnable",
          width: 130,
          sortable: false,
          render: (h, params) => {
            if (params.row.marketEnable == "DOWN") {
              return h("div", [
                h("Badge", {
                  props: {
                    status: "error",
                    text: "下架",
                  },
                }),
              ]);
            } else if (params.row.marketEnable == "UPPER") {
              return h("div", [
                h("Badge", {
                  props: {
                    status: "success",
                    text: "上架",
                  },
                }),
              ]);
            } else {
            }
          },
        },

        {
          title: "操作",
          key: "action",
          align: "center",
          width: 200,
          render: (h, params) => {
            let enableOrDisable = "";
            let showEditStock = "";
            if (params.row.marketEnable == "DOWN") {
              enableOrDisable = h(
                "Button",
                {
                  props: {
                    size: "small",
                    type: "success",
                  },
                  style: {
                    marginRight: "5px",
                  },
                  on: {
                    click: () => {
                      this.upper(params.row);
                    },
                  },
                },
                "上架"
              );
            } else {
              showEditStock = h(
                "Button",
                {
                  props: {
                    type: "default",
                    size: "small",
                  },
                  style: {
                    marginRight: "5px",
                  },
                  on: {
                    click: () => {
                      this.getStockDetail(params.row.id);
                    },
                  },
                },
                "库存"
              );
              enableOrDisable = h(
                "Button",
                {
                  props: {
                    type: "warning",
                    size: "small",
                  },
                  style: {
                    marginRight: "5px",
                  },
                  on: {
                    click: () => {
                      this.lower(params.row);
                    },
                  },
                },
                "下架"
              );
            }
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
                      this.editGoods(params.row);
                    },
                  },
                },
                "编辑"
              ),
              showEditStock,
              enableOrDisable,
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
    addGoods() {
      this.$router.push({ name: "goods-operation" });
    },
    editGoods(v) {
      this.$router.push({ name: "goods-operation-edit", query: { id: v.id } });
    },

    //批量操作
    handleDropdown(v) {
      //批量上架
      if (v == "uppers") {
        this.uppers();
      }
      //批量下架
      if (v == "lowers") {
        this.lowers();
      }
      //批量删除商品
      if (v == "deleteAll") {
        this.deleteAll();
      }
      //批量设置运费模板
      if (v == "batchShipTemplate") {
        this.batchShipTemplate();
      }
    },
    getStockDetail(id) {
      getGoodsSkuListDataSeller({ goodsId: id, pageSize: 1000 }).then((res) => {
        if (res.success) {
          this.updateStockModalVisible = true;
          this.stockAllUpdate = undefined;
          this.stockList = res.result.records;
        }
      });
    },
    updateStock() {
      let updateStockList = this.stockList.map((i) => {
        let j = { skuId: i.id, quantity: i.quantity };
        if (this.stockAllUpdate) {
          j.quantity = this.stockAllUpdate;
        }
        return j;
      });
      updateGoodsSkuStocks(updateStockList).then((res) => {
        if (res.success) {
          this.updateStockModalVisible = false;
          this.$Message.success("更新库存成功");
        }
      });
    },
    changePage (v) {
      this.searchForm.pageNumber = v;
      this.getDataList();
      this.clearSelectAll();
    },
    changePageSize (v) {
      this.searchForm.pageSize = v;
      this.getDataList();
    },
    handleSearch () {
      this.searchForm.pageNumber = 1;
      this.searchForm.pageSize = 10;
      this.getDataList();
    },
    handleReset () {
      this.searchForm = {};
      this.searchForm.pageNumber = 1;
      this.searchForm.pageSize = 10;
      // 重新加载数据
      this.getDataList();
    },
    changeSort (e) {
      this.searchForm.sort = e.key;
      this.searchForm.order = e.order;
      if (e.order === "normal") {
        this.searchForm.order = "";
      }
      this.getDataList();
    },
    clearSelectAll () {
      this.$refs.table.selectAll(false);
    },
    changeSelect (e) {
      this.selectList = e;
      this.selectCount = e.length;
    },
    //保存运费模板信息
    saveShipTemplate () {
      if (this.shipTemplateForm.freightPayer == "BUYER") {
        {
          this.shipTemplateForm.templateId = 0;
        }
      }
      this.$Modal.confirm({
        title: "确认设置运费模板",
        content:
          "您确认要设置所选的 " + this.selectCount + " 个商品的运费模板?",
        loading: true,
        onOk: () => {
          let ids = [];
          this.selectList.forEach(function (e) {
            ids.push(e.id);
          });
          // 批量设置运费模板
          batchShipTemplate(this.shipTemplateForm).then((res) => {
            this.$Modal.remove();
            if (res.success) {
              this.$Message.success("运费模板设置成功");
              this.clearSelectAll();
              this.getDataList();
            }
            this.shipTemplateModal = false;
          });
        },
      });
    },
    //批量设置运费模板
    batchShipTemplate() {
      if (this.selectCount <= 0) {
        this.$Message.warning("您还未选择要设置运费模板的商品");
        return;
      }
      let data = [];
      this.selectList.forEach(function (e) {
        data.push(e.id);
      });
      this.shipTemplateForm.goodsId = data;
      this.shipTemplateModal = true;
    },
    //运费承担者变化
    logisticsTemplateUndertakerChange(v) {
      //如果是卖家承担运费 需要显示运费模板
      if (v == "STORE") {
        API_Store.getShipTemplate().then((res) => {
          if (res.success) {
            this.logisticsTemplate = res.result;
          }
        });
        this.shipTemplateShow = true;
      }
      if (v == "BUYER") {
        this.shipTemplateShow = false;
      }
    },
    getDataList() {
      this.loading = true;
      // 带多条件搜索参数获取表单数据
      getGoodsListDataSeller(this.searchForm).then((res) => {
        this.loading = false;
        if (res.success) {
          this.data = res.result.records;
          this.total = res.result.total;
        }
      });
    },
    //下架商品
    lower(v) {
      this.$Modal.confirm({
        title: "确认下架",
        content: "您确认要下架 " + v.goodsName + " ?",
        loading: true,
        onOk: () => {
          let params = {
            goodsId: v.id,
          };
          lowGoods(params).then((res) => {
            this.$Modal.remove();
            if (res.success) {
              this.$Message.success("下架成功");
              this.getDataList();
            }
          });
        },
      });
    },
    //批量下架
    lowers() {
      if (this.selectCount <= 0) {
        this.$Message.warning("您还未选择要下架的商品");
        return;
      }
      this.$Modal.confirm({
        title: "确认下架",
        content: "您确认要下架所选的 " + this.selectCount + " 个商品?",
        loading: true,
        onOk: () => {
          let ids = [];
          this.selectList.forEach(function (e) {
            ids.push(e.id);
          });
          let params = {
            goodsId: ids.toString(),
          };
          // 批量上架
          lowGoods(params).then((res) => {
            this.$Modal.remove();
            if (res.success) {
              this.$Message.success("下架成功");
              this.clearSelectAll();
              this.getDataList();
            }
          });
        },
      });
    },
    //批量删除商品
    deleteAll() {
      if (this.selectCount <= 0) {
        this.$Message.warning("您还未选择要删除的商品");
        return;
      }
      this.$Modal.confirm({
        title: "确认删除",
        content: "您确认要删除所选的 " + this.selectCount + " 个商品?",
        loading: true,
        onOk: () => {
          let ids = [];
          this.selectList.forEach(function (e) {
            ids.push(e.id);
          });
          let params = {
            goodsId: ids.toString(),
          };
          // 批量删除
          deleteGoods(params).then((res) => {
            this.$Modal.remove();
            if (res.success) {
              this.$Message.success("删除成功");
              this.clearSelectAll();
              this.getDataList();
            }
          });
        },
      });
    },
    //批量上架
    uppers(v) {
      if (this.selectCount <= 0) {
        this.$Message.warning("您还未选择要上架的商品");
        return;
      }
      this.$Modal.confirm({
        title: "确认上架",
        content: "您确认要上架所选的 " + this.selectCount + " 个商品?",
        loading: true,
        onOk: () => {
          let ids = [];
          this.selectList.forEach(function (e) {
            ids.push(e.id);
          });
          let params = {
            goodsId: ids.toString(),
          };
          // 批量上架
          upGoods(params).then((res) => {
            this.$Modal.remove();
            if (res.success) {
              this.$Message.success("上架成功");
              this.clearSelectAll();
              this.getDataList();
            }
          });
        },
      });
    },
    upper(v) {
      this.$Modal.confirm({
        title: "确认上架",
        content: "您确认要上架 " + v.goodsName + " ?",
        loading: true,
        onOk: () => {
          let params = {
            goodsId: v.id,
          };
          upGoods(params).then((res) => {
            this.$Modal.remove();
            if (res.success) {
              this.$Message.success("上架成功");
              this.getDataList();
            }
          });
        },
      });
    },
  },
  activated () {
    this.init();
  },
};
</script>
<style lang="scss" scoped>
@import "@/styles/table-common.scss";
/deep/ .ivu-table-wrapper {
  width: 100% i !important;
}
</style>
