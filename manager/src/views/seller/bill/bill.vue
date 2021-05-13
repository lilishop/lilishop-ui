<template>
  <div class="search">
    <Row>
      <Col>
      <Card>
        <Row @keydown.enter.native="handleSearch">
          <Form ref="searchForm" :model="searchForm" inline :label-width="70" class="search-form">
            <Form-item label="账单编号" prop="sn">
              <Input
                type="text"
                v-model="searchForm.sn"
                placeholder="请输入账单编号"
                clearable
                style="width: 200px"
              />
            </Form-item>
            <Form-item label="出帐时间" prop="createTime">
              <DatePicker v-model="selectDate" type="daterange" format="yyyy-MM-dd HH:mm:ss" clearable @on-change="selectDateRange" placeholder="选择起始时间" style="width: 200px">
              </DatePicker>
            </Form-item>
            <Button @click="handleSearch" type="primary" icon="ios-search" class="search-btn">搜索</Button>
          </Form>
        </Row>
        <Row class="operation padding-row">
          <Button @click="add" type="primary">添加</Button>
          <Button @click="delAll">批量删除</Button>
        </Row>
        <Row>
          <Table :loading="loading" border :columns="columns" :data="data" ref="table" sortable="custom"
                 @on-sort-change="changeSort"
                 @on-selection-change="changeSelect">
          </Table>
        </Row>
        <Row type="flex" justify="end" class="page">
          <Page :current="searchForm.pageNumber" :total="total" :page-size="searchForm.pageSize"
                @on-change="changePage" @on-page-size-change="changePageSize" :page-size-opts="[10, 20, 50]"
            size="small" show-total show-elevator show-sizer></Page>
        </Row>
      </Card>
      </Col>
    </Row>
    <Modal :title="modalTitle" v-model="modalVisible" :mask-closable="false" :width="500">
      <Form ref="form" :model="form" :label-width="100" :rules="formValidate">
        <FormItem label="账单号" prop="sn">
          <Input v-model="form.sn" clearable style="width: 100%" />
        </FormItem>
        <FormItem label="店铺名称" prop="sellerName">
          <Input v-model="form.sellerName" clearable style="width: 100%" />
        </FormItem>
        <FormItem label="结算开始时间" prop="startTime">
          <DatePicker v-model="form.startTime" valueType="yyyy-MM-dd HH:mm:ss" clearable style="width: 100%"></DatePicker>
        </FormItem>
        <FormItem label="结算结束时间" prop="endTime">
          <DatePicker type="date" v-model="form.endTime" clearable style="width: 100%"></DatePicker>
        </FormItem>

        <FormItem label="最终结算金额" prop="billPrice">
          <Input v-model="form.billPrice" clearable style="width: 100%" />
        </FormItem>

      </Form>
      <div slot="footer">
        <Button type="text" @click="modalVisible = false">取消</Button>
        <Button type="primary" :loading="submitLoading" @click="handleSubmit">提交
        </Button>
      </div>
    </Modal>
  </div>
</template>

<script>
import * as API_Shop from "@/api/shops";

export default {
  name: "bill",
  components: {},
  data() {
    return {
      loading: true, // 表单加载状态
      modalType: 0, // 添加或编辑标识
      modalVisible: false, // 添加或编辑显示
      modalTitle: "", // 添加或编辑标题
      searchForm: {
        // 搜索框初始化对象
        pageNumber: 1, // 当前页数
        pageSize: 10, // 页面大小
        sort: "createTime", // 默认排序字段
        order: "desc", // 默认排序方式
        startDate: "", // 起始时间
        endDate: "", // 终止时间
      },
      selectDate: null,
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
        // 表头
        {
          type: "selection",
          width: 60,
          align: "center",
        },
        {
          title: "账单号",
          key: "sn",
          minWidth: 200,
          tooltip: true
        },
        {
          title: "生成时间",
          key: "createTime",
          width: 120,
        },
        {
          title: "结算时间段",
          key: "startTime",
          width: 200,
          render: (h, params) => {
            return h('div', params.row.startTime +"~"+params.row.endTime)
          }
        },
        {
          title: "店铺名称",
          key: "storeName",
          minWidth: 120,
          tooltip: true
        },

        {
          title: "结算金额",
          key: "billPrice",
          width: 130,
          render: (h, params) => {
            return h(
              "div",
              this.$options.filters.unitPrice(params.row.billPrice, "￥")
            );
          },
        },
        {
          title: "状态",
          key: "billStatus",
          width: 100,
          render: (h, params) => {
            if(params.row.billStatus == 'OUT'){
              return h('div', '已出账')
            } else if (params.row.billStatus == 'CHECK') {
              return h('div', '已对账')
            } else if (params.row.billStatus == 'EXAMINE') {
              return h('div', '已审核')
            }else{
              return h('div', '已付款')
            }
          }
        },
        {
          title: "操作",
          key: "action",
          align: "center",
          fixed: "right",
          width: 120,
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
                      this.detail(params.row);
                    },
                  },
                },
                "详细"
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
    init() {
      this.getDataList();
    },
    changePage(v) {
      this.searchForm.pageNumber = v;
      this.getDataList();
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

      // this.searchForm

      this.searchForm.startTime &&
        (this.searchForm.startTime = this.$options.filters.unixToDate(
          this.searchForm.startTime / 1000
        ));
      this.searchForm.endTime &&
        (this.searchForm.endTime = this.$options.filters.unixToDate(
          this.searchForm.endTime / 1000
        ));

      API_Shop.getBuyBillPage(this.searchForm).then((res) => {
        this.loading = false;
        if (res.success) {
          this.data = res.result.records;
          this.total = res.result.total;
        }
      });
      this.total = this.data.length;
      this.loading = false;
    },
    handleSubmit() {
      this.$refs.form.validate((valid) => {
        if (valid) {
          this.submitLoading = true;
          if (this.modalType === 0) {
            // 添加 避免编辑后传入id等数据 记得删除
            delete this.form.id;
            this.postRequest("/bill/insertOrUpdate", this.form).then((res) => {
              this.submitLoading = false;
              if (res.success) {
                this.$Message.success("操作成功");
                this.getDataList();
                this.modalVisible = false;
              }
            });
          } else {
            // 编辑
            this.postRequest("/bill/insertOrUpdate", this.form).then((res) => {
              this.submitLoading = false;
              if (res.success) {
                this.$Message.success("操作成功");
                this.getDataList();
                this.modalVisible = false;
              }
            });
          }
        }
      });
    },
    add() {
      this.modalType = 0;
      this.modalTitle = "添加";
      this.$refs.form.resetFields();
      delete this.form.id;
      this.modalVisible = true;
    },
    detail(v) {
      let id = v.id;
      this.$router.push({
        name: "bill-detail",
        query: { id: id },
      });
    },
    remove(v) {
      this.$Modal.confirm({
        title: "确认删除",
        // 记得确认修改此处
        content: "您确认要删除 " + v.name + " ?",
        loading: true,
        onOk: () => {
          // 删除
          this.deleteRequest("/bill/delByIds/" + v.id).then((res) => {
            this.$Modal.remove();
            if (res.success) {
              this.$Message.success("操作成功");
              this.getDataList();
            }
          });
          // 模拟请求成功
          //this.$Message.success("操作成功");
          //this.$Modal.remove();
          //this.getDataList();
        },
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
          let ids = "";
          this.selectList.forEach(function (e) {
            ids += e.id + ",";
          });
          ids = ids.substring(0, ids.length - 1);
          // 批量删除
          this.deleteRequest("/bill/delByIds/" + ids).then((res) => {
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
