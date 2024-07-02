<template>
  <div>
    <Card>
      <Row @keydown.enter.native.prevent="handleSearch">
        <Form
          ref="searchForm"
          :model="searchForm"
          inline
          :label-width="70"
          class="search-form"
        >
          <Form-item label="会员名称" prop="memberName">
            <Input
              type="text"
              v-model="searchForm.memberName"
              placeholder="请输入会员名称"
              clearable
              style="width: 200px"
            />
          </Form-item>
          <Form-item label="状态">
            <Select
              v-model="searchForm.distributionStatus"
              style="width: 200px"
            >
              <Option
                v-for="item in distributionStatusList"
                :value="item.value"
                :key="item.value"
              >{{ item.label }}
              </Option
              >
            </Select>
          </Form-item>
          <Button
            @click="handleSearch"
            type="primary"
            icon="ios-search"
            class="search-btn"
          >搜索
          </Button
          >
        </Form>
      </Row>
      <Table
        :loading="loading"
        border
        :columns="columns"
        :data="data"
        ref="table"
        class="mt_10"
      ></Table>
      <Row type="flex" justify="end" class="mt_10">
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
    <Modal title="修改分销员" v-model="modalVisible" :mask-closable="false" :width="600">
      <Form ref="distributionForm" :model="distributionForm" :label-width="150" :rules="distributionFormValidate">
        <FormItem label="姓名" prop="name">
          <Input v-model="distributionForm.name" clearable style="width: 100%"/>
        </FormItem>
        <FormItem label="身份证号" prop="idNumber">
          <Input v-model="distributionForm.idNumber" clearable style="width: 100%"/>
        </FormItem>
        <FormItem label="结算银行开户行名称" prop="settlementBankAccountName">
          <Input v-model="distributionForm.settlementBankAccountName" clearable style="width: 100%"/>
        </FormItem>
        <FormItem label="结算银行开户账号" prop="settlementBankAccountNum">
          <Input v-model="distributionForm.settlementBankAccountNum" clearable style="width: 100%"/>
        </FormItem>
        <FormItem label="结算银行开户支行名称" prop="settlementBankBranchName">
          <Input v-model="distributionForm.settlementBankBranchName" clearable style="width: 100%"/>
        </FormItem>
      </Form>
      <div slot="footer">
        <Button type="text" @click="modalVisible = false">取消</Button>
        <Button type="primary" :loading="submitLoading" @click="handleSubmit">提交</Button>
      </div>
    </Modal>
  </div>
</template>

<script>
import {editDistribution, getDistributionListData, resumeDistribution, retreatDistribution} from "@/api/distribution";
import {distributionStatusList} from "./dataJson.js";
import {regular} from "@/utils";

export default {
  name: "distribution",
  components: {},
  data() {
    return {
      distributionStatusList, // 分销状态
      loading: true, // 表单加载状态
      modalVisible: false, // 添加或编辑显示
      distributionForm: {
        name: "",
        idNumber: "",
        settlementBankAccountName: "",
        settlementBankAccountNum: "",
        settlementBankBranchName: ""
      },
      // 表单验证规则
      distributionFormValidate: {
        name: [
          regular.REQUIRED,
          regular.VARCHAR20
        ],
        idNumber: [
          regular.REQUIRED,
          regular.VARCHAR20
        ],
        settlementBankAccountName: [
          regular.REQUIRED,
          regular.VARCHAR20
        ],
        settlementBankAccountNum: [
          regular.REQUIRED,
          regular.VARCHAR20
        ],
        settlementBankBranchName: [
          regular.REQUIRED,
          regular.VARCHAR20
        ],
      },
      submitLoading: false, // 编辑提交状态
      searchForm: {
        // 搜索框初始化对象
        pageNumber: 1, // 当前页数
        pageSize: 10, // 页面大小
      },
      columns: [
        {
          title: "会员名称",
          key: "memberName",
          minWidth: 120,
          tooltip: true,
        },
        {
          title: "姓名",
          key: "name",
          minWidth: 100,
        },
        {
          title: "身份证号",
          key: "idNumber",
          minWidth: 120,
        },
        {
          title: "结算银行开户行名称",
          key: "settlementBankAccountName",
          minWidth: 120,
        },
        {
          title: "结算银行开户账号",
          key: "settlementBankAccountNum",
          minWidth: 120,
        },
        {
          title: "结算银行开户支行名称",
          key: "settlementBankBranchName",
          minWidth: 120,
        },
        {
          title: "推广单数",
          key: "distributionOrderCount",
          minWidth: 120,
          width: 150,
        },
        {
          title: "分销订单金额",
          key: "distributionOrderPrice",
          width: 150,
          sortable: false,
          render: (h, params) => {
            return h("priceColorScheme", {props: {value: params.row.distributionOrderPrice, color: this.$mainColor}});
          },
        },
        {
          title: "分销金额",
          key: "rebateTotal",
          width: 150,
          sortable: false,
          render: (h, params) => {
            return h("priceColorScheme", {props: {value: params.row.rebateTotal, color: this.$mainColor}});
          },

        },
        {
          title: "待提现金额",
          key: "canRebate",
          width: 150,
          sortable: false,
          render: (h, params) => {
            return h("priceColorScheme", {props: {value: params.row.canRebate, color: 'green'}});
          },
        },
        {
          title: "冻结金额",
          key: "commissionFrozen",
          width: 150,
          sortable: false,
          render: (h, params) => {
            return h("priceColorScheme", {props: {value: params.row.commissionFrozen, color: '#347dda'}});
          },
        },
        {
          title: "状态",
          key: "distributionStatus",
          width: 150,
          sortable: false,
          render: (h, params) => {
            if (params.row.distributionStatus == "PASS") {
              return h("Tag", {props: {color: "green",},}, "通过");
            } else if (params.row.distributionStatus == "APPLY") {
              return h("Tag", {props: {color: "geekblue",},}, "待审核");
            } else if (params.row.distributionStatus == "RETREAT") {
              return h("Tag", {props: {color: "volcano",},}, "清退");
            } else if (params.row.distributionStatus == "REFUSE") {
              return h("Tag", {props: {color: "red",},}, "拒绝");
            }
          },
        },
        {
          title: "操作",
          key: "action",
          align: "center",
          fixed: "right",
          width: 140,
          render: (h, params) => {
            return h(
              "div",
              {
                style: {
                  display: "flex",
                  justifyContent: "center",
                },
              },
              [
                h(
                  "Button",
                  {
                    props: {
                      type: "error",
                      size: "small",
                    },
                    style: {
                      marginRight: "5px",
                      display:
                        params.row.distributionStatus != "RETREAT"
                          ? "block"
                          : "none",
                    },
                    on: {
                      click: () => {
                        this.retreat(params.row);
                      },
                    },
                  },
                  "清退"
                ),
                h(
                  "Button",
                  {
                    props: {
                      type: "success",
                      size: "small",
                    },
                    style: {
                      marginRight: "5px",
                      display:
                        params.row.distributionStatus == "RETREAT"
                          ? "block"
                          : "none",
                    },
                    on: {
                      click: () => {
                        this.resume(params.row);
                      },
                    },
                  },
                  "恢复"
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
                  "编辑"
                ), h(
                "div",
                {
                  style: {
                    display: "flex",
                    justifyContent: "center",
                  },
                })
              ]
            );
          },
        },
      ],
      data: [], // 表单数据
      total: 0, // 表单数据总数
    };
  },
  methods: {
    // 初始化数据
    init() {
      this.getDataList();
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
      this.searchForm.pageSize = 10;
      this.getDataList();
    },
    // 获取列表数据
    getDataList() {
      this.loading = true;
      this.searchForm.status = "PASS";
      getDistributionListData(this.searchForm).then((res) => {
        this.loading = false;
        if (res.success) {
          this.data = res.result.records;
          this.total = res.result.total;
        }
      });
    },
    // 清退分销商
    retreat(v) {
      this.$Modal.confirm({
        title: "提示",
        // 记得确认修改此处
        content: "您确认要清退 " + v.memberName + " ?",
        loading: true,
        onOk: () => {
          // 删除
          retreatDistribution(v.id).then((res) => {
            this.$Modal.remove();
            if (res.success) {
              this.$Message.success("操作成功");
              this.getDataList();
            }
          });
        },
      });
    },
    // 恢复分销商
    resume(v) {
      this.$Modal.confirm({
        title: "提示",
        // 记得确认修改此处
        content: "您确认要恢复 " + v.memberName + " ?",
        loading: true,
        onOk: () => {
          // 删除
          resumeDistribution(v.id).then((res) => {
            this.$Modal.remove();
            if (res.success) {
              this.$Message.success("操作成功");
              this.getDataList();
            }
          });
        },
      });
    },
    // 编辑
    edit(v) {
      this.$refs.distributionForm.resetFields();
      // 转换null为""
      for (let attr in v) {
        if (v[attr] === null) {
          v[attr] = "";
        }
      }
      let str = JSON.stringify(v);
      let data = JSON.parse(str);
      this.distributionForm = data;
      this.modalVisible = true;
    },
    // 提交表单
    handleSubmit() {
      this.$refs.distributionForm.validate((valid) => {
        if (valid) {
          // 编辑
          editDistribution(this.distributionForm).then((res) => {
            this.submitLoading = false;
            if (res.success) {
              this.$Message.success("操作成功");
              this.getDataList();
              this.modalVisible = false;
            }
          });
        }
      });
    },
  },
  mounted() {
    this.init();
  },
};
</script>
