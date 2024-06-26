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
              style="width: 200px"
            />
          </Form-item>
          <Form-item label="商品编号" prop="goodsId">
            <Input
              type="text"
              v-model="searchForm.goodsId"
              placeholder="请输入商品编号"
              clearable
              style="width: 200px"
            />
          </Form-item>
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
          <Form-item label="商品分类" prop="category">
            <Cascader
              v-model="category"
              placeholder="请选择商品分类"
              style="width: 200px"
              :data="categoryList"
            ></Cascader>
          </Form-item>
          <Form-item label="货号" prop="id">
            <Input
              type="text"
              v-model="searchForm.skuSn"
              placeholder="请输入货号"
              clearable
              style="width: 200px"
            />
          </Form-item>
          <Button @click="handleSearch" type="primary" class="search-btn">搜索</Button>
          <Button @click="handleReset" class="search-btn">重置</Button>
        </Form>
      </Row>
      <Tabs @on-click="switchTabs" value="updateStock" v-model="stockType">
        <TabPane label="商品库存管理" name="stockManage">
          <Row class="operation padding-row">
            <Button @click="exportStock" type="primary" class="export">批量导出</Button>
            <Button @click="openImportStock" class="export">批量导入</Button>
          </Row>
          <Table
            class="mt_10"
            border
            :loading="loading"
            :columns="stockManageColumns"
            :data="stockAllData"
            ref="table"
          >
            <template slot="goodsSlot" slot-scope="{ row }">
              <div style="margin-top: 5px; height: 90px; display: flex">
                <div style="">
                  <img :src="row.thumbnail" style="height: 80px; margin-top: 3px; width: 70px"/>
                </div>
                <div style="margin-left: 13px;margin-top: 5px;">
                  <div class="div-zoom" style="color: black;">
                    {{ row.goodsName }}
                  </div>
                  <div class="div-zoom" style="margin-top: 5px;">
                    ID: {{ row.goodsId }}
                  </div>
                </div>
              </div>
            </template>
            <template slot="skuSlot" slot-scope="{ row }">
              <div style="margin-top: 5px; height: 90px; display: flex">
                <div style="margin-left: 13px;margin-top: 5px;">
                  <div class="div-zoom" style="color: black;">
                    {{ row.simpleSpecs }}
                  </div>
                  <div class="div-zoom" style="margin-top: 5px;">
                    ID: {{ row.id }}
                  </div>
                </div>
              </div>
            </template>
          </Table>
        </TabPane>
        <TabPane label="预警商品" name="warnList">
          <Table
            class="mt_10"
            border
            :loading="loading"
            :columns="columns"
            :data="warnData"
            ref="table"
          >
          </Table>
        </TabPane>
        <TabPane label="设置预警" name="warnSetting">
          <Table
            class="mt_10"
            border
            :loading="loading"
            :columns="settingColumns"
            :data="skuAllData"
            ref="table"
          >
            <template slot="alertQuantitySlot" slot-scope="{ row }">
              <Input type="number" v-model="row.alertQuantity" clearable placeholder="请输入预警库存"
                     @on-blur="updateWarnStock(row)" @on-change="checkVal(row)"/>
            </template>
          </Table>
        </TabPane>
      </Tabs>
      <Row type="flex" justify="end" class="mt_10">
        <Page
          :current="searchForm.pageNumber"
          :total="total"
          :page-size="searchForm.pageSize"
          @on-change="changePage"
          @on-page-size-change="changePageSize"
          :page-size-opts="[20, 50]"
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
      <Table
        class="mt_10"
        :columns="updateStockColumns"
        :data="stockList"
        border
      ></Table>
      <div slot="footer">
        <Button type="text" @click="updateStockModalVisible = false">取消</Button>
        <Button type="primary" @click="updateStock">更新</Button>
      </div>
    </Modal>

    <Modal title="导入商品信息" v-model="importModal" :mask-closable="false">
      <div style="text-align: center">
        <Upload :before-upload="handleUpload" name="files"
                accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                multiple type="drag" :action="action" :headers="accessToken">
          <div style="padding: 50px 0">
            <Icon type="ios-cloud-upload" size="102" style="color: #3399ff"></Icon>
            <h2>选择或拖拽文件上传</h2>
          </div>
          <Spin fix v-if="spinShow"></Spin>
        </Upload>
      </div>
      <div slot="footer">
        <Button type="text" @click="importModal = false">确定</Button>
      </div>
    </Modal>
  </div>
</template>

<script>
import {
  getGoodsCategoryAll,
  getGoodsListDataByStockSeller,
  getGoodsSkuListDataSeller,
  importStockExcel,
  queryExportStock,
  updateGoodsAlertStocks,
  updateGoodsSkuStocks
} from "@/api/goods";

export default {
  name: "goods",
  data() {
    return {
      importModal: false,
      id: "", //要操作的id
      loading: true, // 表单加载状态
      updateStockModalVisible: false, // 更新库存模态框显隐
      stockAllUpdate: undefined, // 更新库存数量
      stockType: 'stockManage',
      searchForm: {
        // 搜索框初始化对象
        pageNumber: 1, // 当前页数
        pageSize: 20, // 页面大小
        sort: "create_time", // 默认排序字段
        order: "desc", // 默认排序方式
      },
      checkFlag: false, //检测成功标志
      // 表单验证规则
      formValidate: {},
      //修改库存的数据
      stockList: [],
      stockManageColumns: [
        {
          title: "商品信息",
          key: "goodsName",
          midwidth: 400,
          slot: "goodsSlot",
        }, {
          title: "SKU信息",
          key: "simpleSpecs",
          midwidth: 400,
          tooltip: true,
          slot: "skuSlot",
        }, {
          title: "上架状态",
          key: "marketEnable",
          width: 130,
          sortable: false,
          render: (h, params) => {
            if (params.row.marketEnable == "DOWN") {
              return h("Tag", {props: {color: "red"}}, "下架");
            } else if (params.row.marketEnable == "UPPER") {
              return h("Tag", {props: {color: "green"}}, "上架");
            }
          },
        }, {
          title: "审核状态",
          key: "authFlag",
          width: 120,
          render: (h, params) => {
            if (params.row.authFlag == "PASS") {
              return h("Tag", {props: {color: "green"}}, "通过");
            } else if (params.row.authFlag == "TOBEAUDITED") {
              return h("Tag", {props: {color: "volcano"}}, "待审核");
            } else if (params.row.authFlag == "REFUSE") {
              return h("Tag", {props: {color: "red"}}, "审核拒绝");
            }
          },
        }, {
          title: "库存",
          key: "quantity",
          midwidth: 280,
          render: (h, params) => {
            if (params.row.quantity) {
              return h("div", params.row.quantity);
            } else {
              return h("div", 0);
            }
          },
        },],
      //列表名称
      columns: [
        {
          title: "商品名称",
          key: "goodsName",
          midwidth: 400,
          tooltip: true,
        },
        {
          title: "库存",
          key: "quantity",
          midwidth: 280,
          render: (h, params) => {
            if (params.row.quantity) {
              return h("div", params.row.quantity);
            } else {
              return h("div", 0);
            }
          },
        },
        {
          title: "预警值",
          key: "alertQuantity",
          midwidth: 280,
          render: (h, params) => {
            if (params.row.alertQuantity) {
              return h("div", params.row.alertQuantity);
            } else {
              return h("div", 0);
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
            return h("div", [
              h(
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
                      this.openUpdataStockModal(params.row);
                    },
                  },
                },
                "库存"
              ),
            ]);
          },
        },
      ],
      settingColumns: [
        {
          title: "商品名称",
          key: "goodsName",
        },
        {
          title: "库存",
          key: "quantity",
          width: 400,
          render: (h, params) => {
            if (params.row.quantity) {
              return h("div", params.row.quantity);
            } else {
              return h("div", 0);
            }
          },
        },
        {
          title: "预警值",
          key: "alertQuantity",
          width: 400,
          slot: 'alertQuantitySlot',
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
          title: "审核状态",
          key: "authFlag",
          width: 130,
          render: (h, params) => {
            if (params.row.authFlag == "TOBEAUDITED") {
              return h("Tag", {props: {color: "blue"}}, "待审核");
            } else if (params.row.authFlag == "PASS") {
              return h("Tag", {props: {color: "green"}}, "通过");
            } else if (params.row.authFlag == "REFUSE") {
              return h("Tag", {props: {color: "red"}}, "审核拒绝");
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
      warnData: [], // 表单数据
      skuAllData: [], //SKU数据
      stockAllData: [],//SKU库存数据
      total: 0, //sku数据总数
      categoryList: [], //分类列表
      category: '', //选中分类
      selectedSku: {},
    };
  },
  methods: {
    init() {
      // 初始化数据
      this.getDataList();
      this.deepGroup();
    },
    openUpdataStockModal(row) {
      this.stockList = []
      this.selectedSku = JSON.parse(JSON.stringify(row));
      this.stockList.push(this.selectedSku);
      this.updateStockModalVisible = true;
    },
    // 更新库存
    updateStock() {
      let updateStockList = this.stockList.map((i) => {
        let j = {skuId: i.id, quantity: i.quantity};
        return j;
      });
      updateGoodsSkuStocks(updateStockList).then((res) => {
        if (res.success) {
          this.updateStockModalVisible = false;
          this.$Message.success("更新库存成功");
          this.getDataList();
        }
      });
    },
    //修改预警值
    updateWarnStock(row) {
      if (this.checkFlag) {
        let submit = {skuId: row.id, alertQuantity: row.alertQuantity}
        updateGoodsAlertStocks(submit).then(res => {
          if (res.success) {
            this.$Message.success('更新成功')
          }
        })
      }
    },
    //检测输入值是否正确
    checkVal(row) {
      if (
        !/^[+]{0,1}(\d+)$|^[+]{0,1}(\d+\.\d+)$/.test(row.alertQuantity) ||
        parseInt(row.alertQuantity) < 0 ||
        parseInt(row.alertQuantity) > 99999999
      ) {
        // 校验未通过 进行提示
        this.$Message.error("请输入0~99999999之间的数字值")
        row.alertQuantity = 0
        this.checkFlag = false;
        return;
      }
      this.checkFlag = true;
    },
    //切换分页
    switchTabs() {
      this.handleReset();
      this.getDataList();
    },
    // 改变页数
    changePageSize(v) {
      this.searchForm.pageSize = v;
      this.getDataList();
    },
    //改变页码
    changePage(v) {
      this.searchForm.pageNumber = v;
      this.getDataList();
      this.clearSelectAll();
    },
    // 搜索
    handleSearch() {
      this.searchForm.pageNumber = 1;
      this.searchForm.pageSize = 10;
      this.searchForm.categoryPath = this.category ? this.category.join(",") : null;
      this.getDataList();
    },
    // 重置搜索条件
    handleReset() {
      this.searchForm = {};
      this.category = [];
      this.searchForm.pageNumber = 1;
      this.searchForm.pageSize = 10;
      // 重新加载数据
      this.getDataList();
    },
    // 获取商品列表数据
    getDataList() {
      this.loading = true;
      // 带多条件搜索参数获取表单数据
      if (this.stockType == 'warnList') {
        //调用预警库存
        getGoodsListDataByStockSeller(this.searchForm).then(res => {
          if (res.success) {
            this.warnData = res.result.records
            this.total = res.result.total
            this.loading = false;
          }
        })
      } else if (this.stockType == 'warnSetting') {
        //调用获取全部sku
        getGoodsSkuListDataSeller(this.searchForm).then(res => {
          if (res.success) {
            this.skuAllData = res.result.records
            this.total = res.result.total
            this.loading = false;
          }
        })
      } else if (this.stockType == 'stockManage') {
        //调用获取全部sku
        getGoodsSkuListDataSeller(this.searchForm).then(res => {
          if (res.success) {
            this.stockAllData = res.result.records
            this.total = res.result.total
            this.loading = false;
          }
        })
      }
    },
    //组织分类树
    deepGroup() {
      getGoodsCategoryAll().then(res => {
        if (res.success) {
          res.result.forEach((item) => {
            let childWay = []; //第二级
            // 第二层
            if (item.children) {
              item.children.forEach((child) => {
                // // 第三层
                if (child.children) {
                  child.children.forEach((grandson, index, arr) => {
                    arr[index] = {
                      value: grandson.id,
                      label: grandson.name,
                      children: "",
                    };
                  });
                }
                let children = {
                  value: child.id,
                  label: child.name,
                  children: child.children,
                };
                childWay.push(children);
              });
            }
            // 第一层
            let way = {
              value: item.id,
              label: item.name,
              children: childWay,
            };
            this.categoryList.push(way);
          });
        }
      })
    },
    // 导出订单
    async exportStock() {
      let randomNumber = '';
      for (let i = 0; i < 10; i++) {
        randomNumber += Math.floor(Math.random() * 10);
      }
      ;
      queryExportStock(this.searchForm)
        .then((res) => {
          const blob = new Blob([res], {
            type: "application/vnd.ms-excel;charset=utf-8",
          });
          //对于<a>标签，只有 Firefox 和 Chrome（内核） 支持 download 属性
          //IE10以上支持blob但是依然不支持download
          if ("download" in document.createElement("a")) {
            //支持a标签download的浏览器
            const link = document.createElement("a"); //创建a标签
            link.download = randomNumber + ".xlsx"; //a标签添加属性
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
    openImportStock() {
      this.importModal = true;
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
    upload() {
      let fd = new FormData();
      fd.append("files", this.file);
      this.spinShow = true;

      importStockExcel(fd).then(res => {
        if (res.success) {
          this.spinShow = false;
          this.$Message.success("导入成功");
          this.importModal = false;
          this.getDataList();
        }
      })
    },
  },
  mounted() {
    this.init();
  },
};
</script>
<style lang="scss" scoped>
@import "@/styles/table-common.scss";
</style>
