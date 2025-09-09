<template>
  <div class="search">
    <Card>

      <Row @keydown.enter.native="handleSearch">
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
              style="width: 240px"
            />
          </Form-item>
          <Form-item label="状态" prop="status">
            <Select
              v-model="searchForm.marketEnable"
              placeholder="请选择"
              clearable
              style="width: 240px"
            >
              <Option value="DOWN">下架</Option>
              <Option value="UPPER">上架</Option>
            </Select>
          </Form-item>
          <Form-item label="销售模式" prop="status">
            <Select
              v-model="searchForm.salesModel"
              placeholder="请选择"
              clearable
              style="width: 240px"
            >
              <Option value="RETAIL">零售</Option>
              <Option value="WHOLESALE">批发</Option>
            </Select>
          </Form-item>
          <Form-item label="商品类型" prop="status">
            <Select
              v-model="searchForm.goodsType"
              placeholder="请选择"
              clearable
              style="width: 240px"
            >
              <Option value="PHYSICAL_GOODS">实物商品</Option>
              <Option value="VIRTUAL_GOODS">虚拟商品</Option>
            </Select>
          </Form-item>
          <Form-item label="商品编号" prop="sn">
            <Input
              type="text"
              v-model="searchForm.id"
              placeholder="商品编号"
              clearable
              style="width: 240px"
            />
          </Form-item>
          <Button @click="handleSearch" type="primary" class="search-btn">搜索</Button>
          <Button @click="handleReset" class="search-btn">重置</Button>
        </Form>
      </Row>
    </Card>
    <Card>

      <div class="goods-tab">
        <Tabs v-model="currentStatus" @on-click="goodsStatusClick">
          <TabPane v-for="(item,index) in goodsStatusWithCount" :key="index" :label="item.title" :name="item.value">
          </TabPane>
        </Tabs>
      </div>

      <Row class="operation padding-row">
        <Button @click="addGoods" type="info">添加商品</Button>
        <Button @click="openImportGoods" >导入商品</Button>
        <Button @click="uppers" >批量上架</Button>
        <Button @click="lowers" >批量下架</Button>
        <Button @click="deleteAll" >批量删除</Button>
        <Button @click="batchShipTemplate" >批量设置物流模板</Button>
      </Row>

      <Table
        class="mt_10"
        :loading="loading"
        border
        :columns="columns"
        :data="data"
        ref="table"
        @on-selection-change="changeSelect"
      >
        <!-- 商品栏目格式化 -->
        <template slot="goodsSlot" slot-scope="{ row }">
          <div style=" height: 60px; display: flex">
            <div style="">
              <img
                :src="row.original"
                style="height: 50px; margin-top: 3px; width: 50px"
              />
            </div>

            <div style="margin-left: 13px">
              <div class="div-zoom">
                <a @click="linkTo(row.id, row.skuId)">{{ row.goodsName }}</a>
              </div>
              
            </div>
          </div>
        </template>
      </Table>
      <Row type="flex" justify="end" class="mt_10">
        <Page
          :current="searchForm.pageNumber"
          :total="total"
          :page-size="searchForm.pageSize"
          @on-change="changePage"
          @on-page-size-change="changePageSize"
          :page-size-opts="[20, 50, 100]"
          size="small"
          show-total
          show-elevator
          show-sizer
        ></Page>
      </Row>
    </Card>

    <Modal
      title="更新库存"
      v-model="updateStockModalVisible"
      :mask-closable="false"
      :width="610"
    >
      <Tabs value="updateStock" v-model="updateStockType">
        <TabPane label="手动规格更新" name="updateStock">
          <Table
            class="mt_10"
            :columns="updateStockColumns"
            :data="stockList"
            border
          ></Table>
        </TabPane>
        
      </Tabs>

      <div slot="footer">
        <Button type="text" @click="updateStockModalVisible = false">取消</Button>
        <Button type="primary" @click="updateStock">更新</Button>
      </div>
    </Modal>

    <!-- 批量设置物流模板 -->
    <Modal
      title="批量设置物流模板"
      v-model="shipTemplateModal"
      :mask-closable="false"
      :width="500"
    >
      <Form ref="shipTemplateForm" :model="shipTemplateForm" :label-width="120">
        <FormItem class="form-item-view-el" label="物流模板" prop="templateId">
          <Select v-model="shipTemplateForm.templateId" style="width: 200px">
            <Option v-for="item in logisticsTemplate" :value="item.id" :key="item.id"
              >{{ item.name }}
            </Option>
          </Select>
        </FormItem>
      </Form>
      <div slot="footer">
        <Button type="text" @click="shipTemplateModal = false">取消</Button>
        <Button type="primary" @click="saveShipTemplate">更新</Button>
      </div>
    </Modal>
    <Modal title="导入商品信息" v-model="importModal" :mask-closable="false">
      <div style="text-align: center">
        <Upload :before-upload="handleUpload" name="files" accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                multiple type="drag" :action="action" :headers="accessToken">
          <div style="padding: 50px 0">
            <Icon type="ios-cloud-upload" size="102" style="color: #3399ff"></Icon>
            <h2>选择或拖拽文件上传</h2>
          </div>
          <Spin fix v-if="spinShow"></Spin>
        </Upload>
        <Button @click="exportGoods" type="text" style="color: red">下载导入模板</Button>
      </div>
      <div slot="footer">
        <Button type="text" @click="importModal = false">确定</Button>
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
  downLoadGoods,
  getGoodsNumerData
} from "@/api/goods";
import { baseUrl } from "@/libs/axios.js";
import * as API_Shop from "@/api/shops";

import {uploadGoodsExcel} from "../../../api/goods";

export default {
  name: "goods",
  data() {
    return {
      spinShow:false,
      accessToken: {}, // 验证token
      importModal: false,
      action: baseUrl + "/goods/import/import", // 上传接口
      id: "", //要操作的id
      loading: true, // 表单加载状态
      shipTemplateForm: {}, // 物流模板
      shipTemplateModal: false, // 物流模板是否显示
      logisticsTemplate: [], // 物流列表
      updateStockModalVisible: false, // 更新库存模态框显隐
      stockAllUpdate: undefined, // 更新库存数量
      selectList: [], // 选中的商品列表
      selectCount: 0, // 选中的商品数量
      searchForm: {
        // 搜索框初始化对象
        pageNumber: 1, // 当前页数
        pageSize: 20, // 页面大小
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
      columns: [
        {
          type: "selection",
          width: 60,
          align: "center",
        },
         {
          title: "商品ID",
          key: "id",
          width: 180,
          tooltip: true,
        },
        {
          title: "商品",
          key: "goodsName",
          minWidth: 200,
          slot: "goodsSlot",
        },
        {
          title: "销售模式",
          key: "salesModel",
          width: 150,
          render: (h, params) => {
            if (params.row.salesModel === "RETAIL") {
              return h("div", [h("Tag", { props: { color: "blue" } }, "零售")]);
            } else if (params.row.salesModel === "WHOLESALE") {
              return h("div", [h("Tag", { props: { color: "green" } }, "批发")]);
            }
          },
        },
        {
          title: "商品类型",
          key: "goodsType",
          width: 150,
          render: (h, params) => {
            if (params.row.goodsType === "PHYSICAL_GOODS") {
              return h("div", [h("Tag", { props: { color: "blue" } }, "实物")]);
            } else if (params.row.goodsType === "VIRTUAL_GOODS") {
              return h("div", [h("Tag", { props: { color: "green" } }, "虚拟")]);
            }
          },
        },
        {
          title: "价格",
          key: "price",
          width: 150,
          render: (h, params) => {
            return h("div", "￥" + params.row.price);
          },
        },
        {
          title: "销量",
          key: "buyCount",
          width: 150,
          render: (h, params) => {
            return h("span", params.row.buyCount || 0);
          },
        },
        {
          title: "库存",
          key: "quantity",
          width: 150,
          render: (h, params) => {
            return h("span", params.row.quantity || 0);
          },
        },
        {
          title: "审核状态",
          key: "authFlag",
          width: 150,
          render: (h, params) => {
            if (params.row.authFlag === "TOBEAUDITED") {
              return h("Tag", { props: { color: "gold" } }, "待审核");
            } else if (params.row.authFlag === "PASS") {
              return h("Tag", { props: { color: "green" } }, "审核通过");
            } else if (params.row.authFlag === "REFUSE") {
              return h("Tag", { props: { color: "red" } }, "审核拒绝");
            }
          },
        },
        {
          title: "状态",
          key: "marketEnable",
          width: 150,
          render: (h, params) => {
            if (params.row.marketEnable === "UPPER") {
              return h("Tag", { props: { color: "green" } }, "上架");
            } else if (params.row.marketEnable === "DOWN") {
              return h("Tag", { props: { color: "red" } }, "下架");
            }
          },
        },
        {
          title: "操作",
          key: "action",
          align: "center",
          fixed: "right",
          width: 200,
          render: (h, params) => {
            if (params.row.marketEnable == "DOWN") {
              return h("div", [
                h(
                  "a",
                  {
                    style: {
                      color: "#2d8cf0",
                      cursor: "pointer",
                      textDecoration: "none"
                    },
                    on: {
                      click: () => {
                        this.editGoods(params.row);
                      },
                    },
                  },
                  "编辑"
                ),
                h("span", {
                  style: {
                    margin: "0 8px",
                    color: "#dcdee2"
                  }
                }, "|"),
                h(
                  "a",
                  {
                    style: {
                      color: "#2d8cf0",
                      cursor: "pointer",
                      textDecoration: "none"
                    },
                    on: {
                      click: () => {
                        this.upper(params.row);
                      },
                    },
                  },
                  "上架"
                ),
                h("span", {
                  style: {
                    margin: "0 8px",
                    color: "#dcdee2"
                  }
                }, "|"),
                h(
                  "a",
                  {
                    style: {
                      color: "#2d8cf0",
                      cursor: "pointer",
                      textDecoration: "none"
                    },
                    on: {
                      click: () => {
                        this.copyGoods(params.row);
                      },
                    },
                  },
                  "复制"
                ),
              ]);
            } else {
              return h("div", [
                h(
                  "a",
                  {
                    style: {
                      color: "#2d8cf0",
                      cursor: "pointer",
                      textDecoration: "none"
                    },
                    on: {
                      click: () => {
                        this.editGoods(params.row);
                      },
                    },
                  },
                  "编辑"
                ),
                h("span", {
                  style: {
                    margin: "0 8px",
                    color: "#dcdee2"
                  }
                }, "|"),
                h(
                  "a",
                  {
                    style: {
                      color: "#2d8cf0",
                      cursor: "pointer",
                      textDecoration: "none"
                    },
                    on: {
                      click: () => {
                        this.getStockDetail(params.row.id);
                      },
                    },
                  },
                  "库存"
                ),
                h("span", {
                  style: {
                    margin: "0 8px",
                    color: "#dcdee2"
                  }
                }, "|"),
                h(
                  "a",
                  {
                    style: {
                      color: "#2d8cf0",
                      cursor: "pointer",
                      textDecoration: "none"
                    },
                    on: {
                      click: () => {
                        this.lower(params.row);
                      },
                    },
                  },
                  "下架"
                ),
                h("span", {
                  style: {
                    margin: "0 8px",
                    color: "#dcdee2"
                  }
                }, "|"),
                h(
                  "a",
                  {
                    style: {
                      color: "#2d8cf0",
                      cursor: "pointer",
                      textDecoration: "none"
                    },
                    on: {
                      click: () => {
                        this.copyGoods(params.row);
                      },
                    },
                  },
                  "复制"
                ),
              ]);
            }
          },
        },
      ],
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
      data: [], // 表单数据
      total: 0, // 表单数据总数
      updateStockType: 'updateStock',  // 更新库存状态
      goodsNumerData: {},
      currentStatus: '',
    };
  },
  computed: {
    goodsStatusWithCount() {
      return [
        {title: '全部', value: ''},
        {title: `出售中${this.goodsNumerData.upperGoodsNum ? '(' + this.goodsNumerData.upperGoodsNum + ')' : ''}`, value: 'UPPER'},
        {title: `仓库中${this.goodsNumerData.downGoodsNum ? '(' + this.goodsNumerData.downGoodsNum + ')' : ''}`, value: 'DOWN'},
        {title: `待审核${this.goodsNumerData.auditGoodsNum ? '(' + this.goodsNumerData.auditGoodsNum + ')' : ''}`, value: 'TOBEAUDITED'},
        {title: `审核未通过${this.goodsNumerData.refuseGoodsNum ? '(' + this.goodsNumerData.refuseGoodsNum + ')' : ''}`, value: 'REFUSE'}
      ];
    }
  },
  methods: {
    init() {
      // 初始化数据
      this.getDataList();
      this.getNumberData();
    },
    // 添加商品
    addGoods() {
      this.$router.push({ name: "goods-operation" });
    },
    // 编辑商品
    editGoods(v) {
      this.$router.push({ name: "goods-operation-edit", query: { id: v.id } });
    },
    // 复制商品
    copyGoods(v) {
      this.$router.push({ name: "goods-operation", query: { copyId: v.id } });
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
      //批量设置物流模板
      if (v == "batchShipTemplate") {
        this.batchShipTemplate();
      }
    },
    // 获取库存详情
    getStockDetail(id) {
      getGoodsSkuListDataSeller({ goodsId: id, pageSize: 1000 }).then((res) => {
        if (res.success) {
          this.updateStockModalVisible = true;
          this.updateStockType = 'updateStock';
          this.stockAllUpdate = undefined;
          this.stockList = res.result.records;
        }
      });
    },
    // 上传数据
    handleUpload(file) {
      this.file = file;
      this.upload();
      return false;
    },
    /**
     * 上传文件
     */
    async upload() {
      let fd = new FormData();
      fd.append("files", this.file);
      this.spinShow = true
      let res = await uploadGoodsExcel(fd);
      this.spinShow = false
      if (res.success) {
        this.$Message.success("导入成功")
        this.init();
      }
    },
    openImportGoods(){
      this.importModal = true
    },
    async exportGoods(){
      downLoadGoods()
        .then((res) => {
          const blob = new Blob([res], {
            type: "application/vnd.ms-excel;charset=utf-8",
          });
          //对于<a>标签，只有 Firefox 和 Chrome（内核） 支持 download 属性
          //IE10以上支持blob但是依然不支持download
          if ("download" in document.createElement("a")) {
            //支持a标签download的浏览器
            const link = document.createElement("a"); //创建a标签
            link.download = "商品批量导入模板.xls"; //a标签添加属性
            link.style.display = "none";
            link.href = URL.createObjectURL(blob);
            document.body.appendChild(link);
            link.click(); //执行下载
            URL.revokeObjectURL(link.href); //释放url
            document.body.removeChild(link); //释放标签
          } else {
            navigator.msSaveBlob(blob, fileName);
          }
        })
        .catch((err) => {
          console.log(err);
        });
    },
    // 更新库存
    updateStock () {
      if (this.updateStockType === 'updateStock' || this.updateStockType === 'stockAll') {
        // updateStock 手动规格更新，stockAll 批量规格更新
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
            this.getDataList();
          }
        });
      }

    },
    // 改变页码
    changePage(v) {
      this.searchForm.pageNumber = v;
      this.getDataList();
      this.clearSelectAll();
    },
    // 改变页数
    changePageSize(v) {
      this.searchForm.pageSize = v;
      this.getDataList();
    },
    // 搜索
    handleSearch() {
      this.searchForm.pageNumber = 1;
      this.searchForm.pageSize = 20;
      this.getDataList();
      this.getNumberData();
    },
    // 重置搜索条件
    handleReset() {
      this.searchForm = {};
      this.searchForm.pageNumber = 1;
      this.searchForm.pageSize = 20;
      // 重新加载数据
      this.getDataList();
      this.getNumberData();
    },
    // 清除多选
    clearSelectAll() {
      this.$refs.table.selectAll(false);
    },
    // 添加选中项
    changeSelect(e) {
      this.selectList = e;
      this.selectCount = e.length;
    },
    //保存物流模板信息
    saveShipTemplate() {
      this.$Modal.confirm({
        title: "确认设置物流模板",
        content: "您确认要设置所选的 " + this.selectCount + " 个商品的物流模板?",
        loading: true,
        onOk: () => {
          let ids = [];
          this.selectList.forEach(function (e) {
            ids.push(e.id);
          });
          // 批量设置物流模板
          batchShipTemplate(this.shipTemplateForm).then((res) => {
            this.$Modal.remove();
            if (res.success) {
              this.$Message.success("物流模板设置成功");
              this.clearSelectAll();
              this.getDataList();
            }
            this.shipTemplateModal = false;
          });
        },
      });
    },
    //批量设置物流模板
    batchShipTemplate() {
      if (this.selectCount <= 0) {
        this.$Message.warning("您还未选择要设置物流模板的商品");
        return;
      }
      this.getShipTempList();
      let data = [];
      this.selectList.forEach(function (e) {
        data.push(e.id);
      });
      this.shipTemplateForm.goodsId = data;
      this.shipTemplateModal = true;
    },
    // 获取商品列表数据
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
    // 获取物流模板
    getShipTempList() {
      API_Shop.getShipTemplate().then((res) => {
        if (res.success) {
          this.logisticsTemplate = res.result;
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
          // 批量下架
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
    getNumberData() {
      // 创建一个不包含goodsStatus字段的搜索参数
      const { goodsStatus, ...searchParams } = this.searchForm;
      getGoodsNumerData(searchParams).then((res) => {
        if (res.success) {
          this.goodsNumerData = res.result;
        }
      })
    },
    // 商品状态筛选
    goodsStatusClick(item) {
      // 根据选择的状态设置搜索条件
      if (item === 0) {
        // 全部：清除状态筛选
        delete this.searchForm.goodsStatus;
      } else {
        // 其他状态正常赋值
        this.searchForm.goodsStatus = item;
      }
      this.currentStatus = item;
      
      // tab切换时清除选中内容
      this.selectedRows = [];
      if (this.$refs.table) {
        this.$refs.table.selectAll(false);
      }
      
      this.getDataList();
    },
  },
  mounted() {
    this.init();
    this.accessToken.accessToken = this.getStore("accessToken");
  },
};
</script>
<style lang="scss" scoped>
@import "@/styles/table-common.scss";
// Tab组件样式
.goods-tab {
  ::v-deep .ivu-tabs-tab {
    font-size: 14px;
  }
}
</style>
