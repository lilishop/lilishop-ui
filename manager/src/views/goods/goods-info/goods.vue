<template>
  <div class="search">
    <Card>
      <Form
        ref="searchForm"
        :model="searchForm"
        inline
        :label-width="70"
        class="search-form"
        @keydown.enter.native="handleSearch"
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
        <Form-item label="商品编号" prop="id">
          <Input
            type="text"
            v-model="searchForm.id"
            placeholder="请输入商品编号"
            clearable
            style="width: 240px"
          />
        </Form-item>
        <Form-item label="店铺名称" prop="id">
          <Input
            type="text"
            v-model="searchForm.storeName"
            placeholder="请输入店铺名称"
            clearable
            style="width: 240px"
          />
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
        <Button
          @click="handleSearch"
          class="search-btn"
          type="primary"
          icon="ios-search"
          >搜索</Button
        >
      </Form>
    </Card>
    <Card>

       <div class="goods-tab">
        <Tabs v-model="currentStatus" @on-click="goodsStatusClick">
          <TabPane v-for="(item,index) in goodsStatusWithCount" :key="index" :label="item.title" :name="item.value">
          </TabPane>
        </Tabs>
      </div>

      <!-- 批量操作按钮 -->
      <div class="batch-operations" style="margin: 10px 0;">
        <Button
          type="success"
          :disabled="selectedRows.length === 0"
          @click="batchUpper"
          style="margin-right: 10px;"
        >
          批量上架
        </Button>
        <Button
          type="warning"
          :disabled="selectedRows.length === 0"
          @click="batchLower"
          style="margin-right: 10px;"
        >
          批量下架
        </Button>
        <Button
          v-if="currentStatus === 'TOBEAUDITED'"
          type="primary"
          :disabled="selectedRows.length === 0"
          @click="batchAudit"
        >
          批量审核
        </Button>
      </div>

      <Table
        :loading="loading"
        :columns="columns"
        :data="data"
        ref="table"
        class="mt_10"
        @on-select="onSelect"
        @on-select-all="onSelectAll"
        @on-selection-change="onSelectionChange"
      >
        <!-- 商品图片格式化 -->
        <template slot="imageSlot" slot-scope="{ row }">
          <div style="margin-top: 5px;">
            <img
              :src="row.original"
              style="height: 50px; width: 50px; object-fit: cover;"
            />
          </div>
        </template>

        <!-- 商品栏目格式化 -->
        <template slot="goodsSlot" slot-scope="{ row }">
          <div style="margin: 5px 0px; padding: 10px 0px;">
            <div class="div-zoom">
              <a @click="linkTo(row.id, row.skuId)">{{ row.goodsName }}</a>
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
      title="下架操作"
      v-model="modalVisible"
      :mask-closable="false"
      :width="500"
    >
      <Form ref="underForm" :model="underForm" :label-width="100">
        <FormItem label="下架原因" prop="reason">
          <Input v-model="underForm.reason" clearable style="width: 100%" />
        </FormItem>
      </Form>
      <div slot="footer">
        <Button type="text" @click="modalVisible = false">取消</Button>
        <Button type="primary" :loading="submitLoading" @click="lower"
          >提交</Button
        >
      </div>
    </Modal>
    <Modal
      title="商品审核"
      v-model="auditModalVisible"
      :mask-closable="false"
      :width="500"
    >
      <Form ref="auditForm" :model="goodsAuditForm" :label-width="100">
        <FormItem label="审核结果" prop="auth_flag">
          <RadioGroup v-model="goodsAuditForm.auth_flag">
            <Radio :label="1">审核通过</Radio>
            <Radio :label="2">审核拒绝</Radio>
          </RadioGroup>
        </FormItem>
        <!-- <FormItem label="审核备注" prop="reason" v-if="goodsAuditForm.auth_flag === 2">
          <Input v-model="goodsAuditForm.reason" type="textarea" :rows="3" placeholder="请输入拒绝原因" />
        </FormItem> -->
      </Form>
      <div slot="footer">
        <Button type="text" @click="auditModalVisible = false">取消</Button>
        <Button type="primary" @click="confirmAudit">提交审核</Button>
      </div>
    </Modal>
    <!-- 批量审核弹框 -->
    <Modal
      title="批量商品审核"
      v-model="batchAuditModalVisible"
      :mask-closable="false"
      :width="500"
    >
      <Form ref="batchAuditForm" :model="batchAuditForm" :label-width="100">
        <FormItem label="审核结果" prop="auth_flag">
          <RadioGroup v-model="batchAuditForm.auth_flag">
            <Radio :label="1">审核通过</Radio>
            <Radio :label="2">审核拒绝</Radio>
          </RadioGroup>
        </FormItem>
        <FormItem label="审核备注" prop="reason" v-if="batchAuditForm.auth_flag === 2">
          <Input v-model="batchAuditForm.reason" type="textarea" :rows="3" placeholder="请输入拒绝原因" />
        </FormItem>
        <FormItem label="选中商品">
          <div style="max-height: 200px; overflow-y: auto;">
            <Tag v-for="item in selectedRows" :key="item.id" style="margin: 2px;">{{item.goodsName}}</Tag>
          </div>
        </FormItem>
      </Form>
      <div slot="footer">
        <Button type="text" @click="batchAuditModalVisible = false">取消</Button>
        <Button type="primary" @click="submitBatchAudit">提交审核</Button>
      </div>
    </Modal>
  </div>
</template>

<script>
import { getGoodsListData,getGoodsNumerData, upGoods, lowGoods, authGoods } from "@/api/goods";
import vueQr from "vue-qr";
export default {
  components: {
    "vue-qr": vueQr,
  },
  name: "goods",
  data() {
    return {
      id: "", //要操作的id
      loading: true, // 表单加载状态
      modalVisible: false, // 添加或编辑显示
      searchForm: {
        // 搜索框初始化对象
        pageNumber: 1, // 当前页数
        pageSize: 20, // 页面大小
        sort: "create_time", // 默认排序字段
        order: "desc", // 默认排序方式
      },
      underForm: {
        // 下架原因
        reason: "",
      },
      goodsAuditForm: {
        // 商品审核表单
        auth_flag: 1,
      },
      auditModalVisible: false, // 审核弹框显示状态
      currentAuditGoods: null, // 当前审核的商品
      submitLoading: false, // 添加或编辑提交状态
      columns: [
        {
          type: 'selection',
          width: 60,
          align: 'center'
        },
        {
          title: "商品ID",
          key: "id",
          width: 180,
          tooltip: true,
        },
        {
          title: "商品图片",
          key: "original",
          width: 180,
          slot: "imageSlot",
        },
        {
          title: "商品名称",
          key: "goodsName",
          minWidth: 180,
          slot: "goodsSlot",
        },
        {
          title: "价格",
          key: "price",
          width: 100,
          render: (h, params) => {
            return h("priceColorScheme", {props:{value:params.row.price,color:this.$mainColor}} );
          },
        },
        {
          title: "销量",
          key: "buyCount",
          width: 100,
          render: (h, params) => {
            return h("span", params.row.buyCount || 0);
          },
        },
        {
          title: "库存",
          key: "quantity",
          width: 100,
          render: (h, params) => {
            return h("span", params.row.quantity || 0);
          },
        },
        {
          title: "销售模式",
          key: "salesModel",
          width: 100,
          render: (h, params) => {
            if (params.row.salesModel === "RETAIL") {
              return h("Tag", { props: { color: "orange" } }, "零售");
            } else if (params.row.salesModel === "WHOLESALE") {
              return h("Tag", { props: { color: "magenta" } }, "批发");
            } else {
              return h("Tag", { props: { color: "volcano" } }, "其他类型");
            }
          },
        },
        {
          title: "商品类型",
          key: "goodsType",
          width: 120,
          render: (h, params) => {
            if (params.row.goodsType === "PHYSICAL_GOODS") {
              return h("Tag", { props: { color: "green" } }, "实物商品");
            } else if (params.row.goodsType === "VIRTUAL_GOODS") {
              return h("Tag", { props: { color: "volcano" } }, "虚拟商品");
            } else {
              return h("Tag", { props: { color: "geekblue" } }, "电子卡券");
            }
          },
        },
        {
          title: "状态",
          key: "marketEnable",
          width: 120,
          render: (h, params) => {
            if (params.row.marketEnable == "DOWN") {
              return h("Tag", { props: { color: "volcano" } }, "下架");
            } else if (params.row.marketEnable == "UPPER") {
              return h("Tag", { props: { color: "green" } }, "上架");
            }
          },
        },
        {
          title: "审核状态",
          key: "authFlag",
          width: 180,
          render: (h, params) => {
            if (params.row.authFlag == "TOBEAUDITED") {
              return h("Tag", { props: { color: "volcano" } }, "待审核");
            } else if (params.row.authFlag == "PASS") {
              return h("Tag", { props: { color: "green" } }, "通过");
            } else if (params.row.authFlag == "REFUSE") {
              return h("Tag", { props: { color: "red" } }, "拒绝");
            }
          },
        },
        {
          title: "店铺名称",
          key: "storeName",
          width: 180,  // 使用minWidth替代width
          tooltip: true,
        },
        {
          title: "操作",
          key: "action",
          align: "center",
          fixed: "right",
          width: 200,
          render: (h, params) => {
            // 如果是待审核状态，显示审核按钮
            if (params.row.authFlag === "TOBEAUDITED") {
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
                        this.openAuditModal(params.row);
                      },
                    },
                  },
                  "审核"
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
                        this.showDetail(params.row);
                      },
                    },
                  },
                  "查看"
                ),
              ]);
            }
            // 原有的上架/下架逻辑
            else if (params.row.marketEnable == "DOWN") {
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
                        this.showDetail(params.row);
                      },
                    },
                  },
                  "查看"
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
                        this.edit(params.row);
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
                        this.showDetail(params.row);
                      },
                    },
                  },
                  "查看"
                ),
              ]);
            }
          },
        },
      ],
      data: [], // 表单数据
      total: 0, // 表单数据总数
      currentStatus: '',
      goodsNumerData: {},
      goodsAuditForm: {
        // 商品编辑表单
        auth_flag: 1,
      },
      selectedRows: [], // 选中的行数据
      selectAll: false, // 全选状态
      batchAuditModalVisible: false, // 批量审核弹框显示状态
      batchAuditForm: {
        auth_flag: 1,
        reason: ''
      },
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
    // 初始化数据
    init() {
      this.getDataList();
      this.getNumberData();
    },
    // 分页 改变页码
    changePage(v) {
      this.searchForm.pageNumber = v;
      this.getDataList();
    },
    // 分页 改变页数
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
    // 获取数据
    getDataList() {
      this.loading = true;
      getGoodsListData(this.searchForm).then((res) => {
        this.loading = false;
        if (res.success) {
          this.data = res.result.records;
          this.total = res.result.total;
        }
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
    // 编辑
    edit(v) {
      this.id = v.id;
      if (v.underMessage) {
        this.underForm.reason = v.underMessage;
      } else {
        this.underForm.reason = "";
      }
      this.modalVisible = true;
    },
    // 下架
    lower() {
      let params = {
        goodsId: this.id,
        reason:this.underForm.reason
      };
      lowGoods(params).then((res) => {
        this.$Modal.remove();
        if (res.success) {
          this.$Message.success("操作成功");
          this.modalVisible = false;
          this.getDataList();
          this.getNumberData(); // 添加这行
        }
      });
    },
    // 上架
    upper(v) {
      this.$Modal.confirm({
        title: "确认上架",
        content: "您确认要上架 " + v.goodsName + " ?",
        loading: true,
        onOk: () => {
           let params = {
            goodsId: v.id
          };
          upGoods(params).then((res) => {
            this.$Modal.remove();
            if (res.success) {
              this.$Message.success("上架成功");
              this.getDataList();
              this.getNumberData(); // 添加这行
            }
          });
        },
      });
    },

    //查看商品详情
    showDetail(v) {
      let id = v.id;
      this.$options.filters.customRouterPush({
        name: "goods-detail",
        query: { id: id },
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
    examine(v, authFlag) {
      // 审核商品
      let examine = "通过";
      this.goodsAuditForm.authFlag = "PASS";
      if (authFlag != 1) {
        examine = "拒绝";
        this.goodsAuditForm.authFlag = "REFUSE";
      }

      this.$Modal.confirm({
        title: "确认审核",
        content: "您确认要审核" + examine + " " + v.goodsName + " ?",
        loading: true,
        onOk: () => {
          this.goodsAuditForm.goodsIds=v.id;
          let formData = new FormData();
          formData.append('goodsIds', v.id);
          formData.append('authFlag', this.goodsAuditForm.authFlag);

          authGoods(formData).then((res) => {
            this.$Modal.remove();
            if (res.success) {
              this.$Message.success("审核成功");
              this.getDataList();
              this.getNumberData();
            }
          });
        },
      });
    },

    // 打开审核弹框
    openAuditModal(goods) {
      this.currentAuditGoods = goods;
      this.goodsAuditForm.auth_flag = 1;
      this.goodsAuditForm.reason = '';
      this.auditModalVisible = true;
    },

    // 确认审核（二次确认）
    confirmAudit() {
      const auditText = this.goodsAuditForm.auth_flag === 1 ? '通过' : '拒绝';
      this.$Modal.confirm({
        title: '确认审核',
        content: `您确认要审核${auditText} "${this.currentAuditGoods.goodsName}" 吗？`,
        loading: true,
        onOk: () => {
          this.submitAudit();
        },
      });
    },

    // 提交审核
    submitAudit() {
      let formData = new FormData();
      formData.append('goodsIds', this.currentAuditGoods.id);
      formData.append('authFlag', this.goodsAuditForm.auth_flag === 1 ? 'PASS' : 'REFUSE');
      authGoods(formData).then((res) => {
        this.$Modal.remove();
        if (res.success) {
          this.$Message.success('审核成功');
          this.auditModalVisible = false;
          this.getDataList();
          this.getNumberData();
        }
      });
    },

    // 选择框事件处理
    onSelect(selection, row) {
      // 单行选择时触发
    },

    onSelectAll(selection) {
      // 全选时触发
    },

    onSelectionChange(selection) {
      this.selectedRows = selection;
    },

    // 批量上架
    batchUpper() {
      if (this.selectedRows.length === 0) {
        this.$Message.warning('请先选择要上架的商品');
        return;
      }

      const goodsNames = this.selectedRows.map(item => item.goodsName).join('、');
      this.$Modal.confirm({
        title: '确认批量上架',
        content: `您确认要上架以下商品吗？\n${goodsNames}`,
        loading: true,
        onOk: () => {
          // 提取所有选中商品的ID
          const goodsIds = this.selectedRows.map(item => item.id);
          const params = {
            goodsId: goodsIds // 传递ID数组
          };

          upGoods(params).then((res) => {
            this.$Modal.remove();
            if (res.success) {
              this.$Message.success('批量上架成功');
              this.selectedRows = [];
              this.selectAll = false;
              this.getDataList();
              this.getNumberData();
            }
          }).catch(() => {
            this.$Modal.remove();
          });
        }
      });
    },

    // 批量下架
    batchLower() {
      if (this.selectedRows.length === 0) {
        this.$Message.warning('请先选择要下架的商品');
        return;
      }

      const goodsNames = this.selectedRows.map(item => item.goodsName).join('、');
      this.$Modal.confirm({
        title: '确认批量下架',
        content: `您确认要下架以下商品吗？\n${goodsNames}`,
        loading: true,
        onOk: () => {
          // 提取所有选中商品的ID
          const goodsIds = this.selectedRows.map(item => item.id);
          const params = {
            goodsId: goodsIds, // 传递ID数组
            reason: '批量下架操作' // 可以设置默认下架原因
          };

          lowGoods(params).then((res) => {
            this.$Modal.remove();
            if (res.success) {
              this.$Message.success('批量下架成功');
              this.selectedRows = [];
              this.selectAll = false;
              this.getDataList();
              this.getNumberData();
            }
          }).catch(() => {
            this.$Modal.remove();
          });
        }
      });
    },

    // 批量审核
    batchAudit() {
      if (this.selectedRows.length === 0) {
        this.$Message.warning('请先选择要审核的商品');
        return;
      }

      // 重置批量审核表单
      this.batchAuditForm = {
        auth_flag: 1,
        reason: ''
      };
      this.batchAuditModalVisible = true;
    },

    // 提交批量审核
    submitBatchAudit() {
      if (this.selectedRows.length === 0) {
        this.$Message.warning('请先选择要审核的商品');
        return;
      }

      // 如果是拒绝审核，必须填写原因
      if (this.batchAuditForm.auth_flag === 2 && !this.batchAuditForm.reason.trim()) {
        this.$Message.warning('审核拒绝时必须填写拒绝原因');
        return;
      }

      const actionText = this.batchAuditForm.auth_flag === 1 ? '通过' : '拒绝';
      const goodsNames = this.selectedRows.map(item => item.goodsName).join('、');

      this.$Modal.confirm({
        title: `确认批量审核${actionText}`,
        content: `您确认要${actionText}以下商品的审核吗？\n${goodsNames}`,
        loading: true,
        onOk: () => {
          // 提取所有选中商品的ID
          const goodsIds = this.selectedRows.map(item => item.id);

          let formData = new FormData();
          formData.append('goodsId', goodsIds);
          formData.append('authFlag', this.batchAuditForm.auth_flag === 1 ? 'PASS' : 'REFUSE');
          formData.append('reason', this.batchAuditForm.reason || '');

          // 修正：直接调用authGoods，不传递'batch'参数
          authGoods(formData).then((res) => {
            this.$Modal.remove();
            if (res.success) {
              this.$Message.success(`批量审核${actionText}成功`);
              this.selectedRows = [];
              this.selectAll = false;
              this.batchAuditModalVisible = false;
              this.getDataList();
              this.getNumberData();
            }
          }).catch(() => {
            this.$Modal.remove();
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
<style lang="scss" scoped>
// Tab组件样式
.goods-tab {
  ::v-deep .ivu-tabs-tab {
    font-size: 14px;
  }
}
</style>
