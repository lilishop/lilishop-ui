<template>
  <div class="search">
    <Card>
      <Row @keydown.enter.native="handleSearch">
        <Form ref="searchForm" :model="searchForm" inline :label-width="70" class="search-form">
          <Form-item label="会员名称" prop="memberName">
            <Input
              type="text"
              v-model="searchForm.memberName"
              clearable
              placeholder="请输入会员名称"
              style="width: 200px"
            />
          </Form-item>
          <Form-item label="订单号" prop="orderSn">
            <Input
              type="text"
              v-model="searchForm.orderSn"
              clearable
              placeholder="请输入商品名"
              style="width: 200px"
            />
          </Form-item>
          <Form-item label="状态" prop="status">
            <Select v-model="searchForm.status" placeholder="请选择" clearable style="width: 200px">
              <Option value="NEW">新投诉</Option>
              <Option value="CANCEL">已撤销</Option>
              <Option value="WAIT_APPEAL">待申诉</Option>
              <Option value="COMMUNICATION">对话中</Option>
              <Option value="WAIT_ARBITRATION">等待仲裁</Option>
              <Option value="COMPLETE">已完成</Option>

            </Select>
          </Form-item>
          <Button @click="handleSearch" type="primary" icon="ios-search" class="search-btn">搜索</Button>
          <Button @click="handleReset" class="search-btn">重置</Button>
        </Form>
      </Row>
      <Table
        :loading="loading"
        border
        :columns="columns"
        :data="data"
        ref="table"
        sortable="custom"
        @on-sort-change="changeSort"
        @on-selection-change="changeSelect"
      >
        <template slot-scope="{row}" slot="goodsName">
          <a class="mr_10" @click="linkTo(row.goodsId,row.skuId)">{{row.goodsName}}</a>
          <Poptip trigger="hover" title="扫码在手机中查看" transfer>
            <div slot="content">
              <vue-qr :text="wapLinkTo(row.goodsId,row.skuId)"  :margin="0" colorDark="#000" colorLight="#fff" :size="150"></vue-qr>
            </div>
            <img src="../../../assets/qrcode.svg" style="vertical-align:bottom;" class="hover-pointer" width="20" height="20" alt="">
          </Poptip>
        </template>
      </Table>
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
    <Modal
      :title="modalTitle"
      v-model="modalVisible"
      :mask-closable="false"
      :width="500"
    >
      <Form ref="form" :model="form" :label-width="100" :rules="formValidate">
        <FormItem label="评价内容">
          <span v-if="content == ''">暂无评价</span>
          <span v-else>{{content}}</span>
        </FormItem>
        <FormItem label="评价图片">
          <upload-pic-thumb
                            v-model="image"
                            :disable="true"
                            :remove="false"
          ></upload-pic-thumb>
        </FormItem>
        <FormItem label="回复内容" prop="reply">
          <Input v-if="replyStatus == false"
            v-model="form.reply"
            type="textarea"
            maxlength="200"
            :rows="4"
            clearable
            style="width:260px"
          />
          <span v-else>
            {{form.reply}}
          </span>
        </FormItem>
        <FormItem label="回复图片" prop="replyImage">
          <upload-pic-thumb v-if="replyStatus == false"
            v-model="form.replyImage"
            :limit="5"
          ></upload-pic-thumb>
          <upload-pic-thumb v-else
            v-model="form.replyImage"
            :disable="true"
             :remove="false"
          ></upload-pic-thumb>
        </FormItem>
      </Form>
      <div slot="footer">
        <Button type="text" @click="modalVisible = false">取消</Button>
        <Button v-if="replyStatus == false" type="primary" :loading="submitLoading" @click="handleSubmit" >回复
        </Button
        >
      </div>
    </Modal>
  </div>
</template>

<script>
  import * as API_Member from "@/api/member";
  import * as API_Order from "@/api/order";
  import uploadPicThumb from "@/views/my-components/lili/upload-pic-thumb";

  export default {
    name: "orderComplaint",
    components: {
      uploadPicThumb
    },
    data() {
      return {
        image:[],//评价图片
        replyStatus:false,//回复状态
        modalType: 0, // 添加或编辑标识
        modalVisible: false, // 添加或编辑显示
        modalTitle: "", // 添加或编辑标题
        openTip: true, // 显示提示
        loading: true, // 表单加载状态
        content: "",//评价内容
        searchForm: {
          // 搜索框初始化对象
          pageNumber: 1, // 当前页数
          pageSize: 10, // 页面大小
          sort: "createTime", // 默认排序字段
          order: "desc", // 默认排序方式
        },
        form: {}, // 表单数据
        submitLoading: false, // 添加或编辑提交状态
        selectList: [], // 多选数据
        selectCount: 0, // 多选计数
        columns: [
          // 表头
          {
            title: "会员名称",
            key: "memberName",
            sortable: false,
          },
          {
            title: "订单编号",
            key: "orderSn",
            sortType: "desc",
          },
          {
            title: "商品名称",
            slot: "goodsName",
            sortType: "desc",
          },
          {
            title: "投诉主题",
            key: "complainTopic",
          },
          {
            title: "投诉时间",
            key: "createTime",
          },
          {
            title: "投诉状态",
            key: "complainStatus",
            render: (h, params) => {
              if (params.row.complainStatus == "NEW") {
                return h('div', [h('tag',{props: {color: "purple"}}, '新投诉'),]);
              } else if (params.row.complainStatus == "CANCEL") {
                return h('div', [h('tag', {props: {color: "cyan"}}, '已撤销'),]);
              } else if (params.row.complainStatus == "WAIT_APPEAL") {
                return h('div', [h('tag', {props: {color: "volcano"}}, '待申诉'),]);
              } else if (params.row.complainStatus == "COMMUNICATION") {
                return h('div', [h('tag', {props: {color: "orange"}}, '对话中'),]);
              }else if (params.row.complainStatus == "WAIT_ARBITRATION") {
                return h('div', [h('tag', {props: {color: "blue"}}, '等待仲裁'),]);
              }else if (params.row.complainStatus == "COMPLETE") {
                return h('div', [h('tag', {props: {color: "green"}}, '已完成'),]);
              }
            }
          },

          {
            title: "操作",
            key: "action",
            align: "center",
            width: 120,
            render: (h, params) => {
              if(params.row.complainStatus === "COMPLETE"){
                return h("div", [
                  h(
                    "Button",
                    {
                      props: {
                        type: "primary",
                        size: "small",
                        icon: "ios-create-outline",
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
                    "详情"
                  ),
                ]);
              }else{
                return h("div", [
                  h(
                    "Button",
                    {
                      props: {
                        type: "primary",
                        size: "small",
                        icon: "ios-create-outline",
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
                    "处理"
                  ),
                ]);
              }

            },
          },

        ],
        data: [], // 表格数据
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
        this.searchForm = {}
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
        API_Order.getComplainPage(this.searchForm).then((res) => {
          this.loading = false;
          if (res.success) {
            this.data = res.result.records;
            this.total = res.result.total;
          }
        });
        this.total = this.data.length;
        this.loading = false;
      },
      //回复
      handleSubmit() {
        this.$refs.form.validate((valid) => {
          if (valid) {
            API_Member.replyMemberReview(this.form.id, this.form).then((res) => {
              this.submitLoading = false;
              if (res.success) {
                this.$Message.success("回复成功");
                this.getDataList();
                this.modalVisible = false;
              }
            });
          }
        });
      },
      //投诉详情
      detail(v) {
        let id = v.id;
        this.$router.push({
          name: "order-complaint-detail",
          query: { id: id },
        });
      },
    },
    activated() {
      this.init();
    },
  };
</script>
<style lang="scss">
  // 建议引入通用样式 可删除下面样式代码
  @import "@/styles/table-common.scss";
</style>
