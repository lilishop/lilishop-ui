<template>
  <div class="logistics">
    <Card>
      <Table :loading="loading" border :columns="columns" :data="data" ref="table"></Table>
    </Card>
    <Modal v-model="openModal" :title="openModalTitle" @on-ok="submit" @on-cancel="cancelModal">
      <h3 style="color: #ff3c2a; margin-bottom: 10px">是否需要电子面单</h3>

      <ButtonGroup style="margin-bottom: 10px;">
        <Button :type="faceSheetForm.faceSheetFlag ? 'primary' : 'default'"
          @click="faceSheetForm.faceSheetFlag = true">需要</Button>
        <Button :type="!faceSheetForm.faceSheetFlag ? 'primary' : 'default'"
          @click="faceSheetForm.faceSheetFlag = false">不需要</Button>
      </ButtonGroup>
      <Card v-if="openText" class="modalStyle">
        <h3 style="color: #ff3c2a; margin-bottom: 10px">请输入详细信息</h3>
        <Form ref="formValidate" :label-width="150" label-position="right" :model="faceSheetForm" :rules="ruleValidate">
          <FormItem label="customerName" prop="customerName">
            <Input v-model="faceSheetForm.customerName" type="text" class="faceSheetInput"></Input>
          </FormItem>
          <FormItem label="customerPwd" prop="customerPwd">
            <Input v-model="faceSheetForm.customerPwd" type="text" class="faceSheetInput"></Input>
          </FormItem>
          <FormItem label="monthCode" prop="monthCode">
            <Input v-model="faceSheetForm.monthCode" type="text" class="faceSheetInput"></Input>
          </FormItem>
          <FormItem label="sendSite" prop="sendSite">
            <Input v-model="faceSheetForm.sendSite" type="text" class="faceSheetInput"></Input>
          </FormItem>
          <FormItem label="sendStaff" prop="sendStaff">
            <Input v-model="faceSheetForm.sendStaff" type="text" class="faceSheetInput"></Input>
          </FormItem>
          <FormItem label="支付方式" prop="payType">
            <Select v-model="faceSheetForm.payType" class="faceSheetInput">
              <Option value="1">现付</Option>
              <Option value="2">到付</Option>
              <Option value="3">月结</Option>
              <Option value="4">第三方支付(仅SF支持)</Option>
            </Select>
          </FormItem>
          <FormItem label="快递类型" prop="expType">
            <Input v-model="faceSheetForm.expType" type="text" class="faceSheetInput" />
          </FormItem>
          <div style="width:100%;text-align:center;">
            <a style="padding-right: 20px" @click="frontDownload('use')">使用说明</a>
            <a @click="frontDownload('type')">快递类型</a>
          </div>
        </Form>
      </Card>
      <br />
    </Modal>
  </div>
</template>

<script>
import * as API_Shop from "@/api/shops";

export default {
  name: "logistics",
  data() {
    return {
      row: {},
      openModal: false,
      loading: true, // 表单加载状态
      searchForm: {
        // 搜索框初始化对象
        pageNumber: 1, // 当前页数
        pageSize: 10, // 页面大小
        sort: "createTime", // 默认排序字段
        order: "desc", // 默认排序方式
      },
      openModalTitle: '开启信息',
      ruleValidate: {
        // customerName: [{ required: true, message: "请填写必填项" ,trigger: "blur" }],
        // payType: [{ required: true, message: "请填写必填项" ,trigger: "change" }],
        // expType: [{ required: true, message: "请填写必填项" ,trigger: "blur" }],
        // customerPwd: [{ required: true, message: "请填写必填项" ,trigger: "blur" }],
        // monthCode: [{ required: true, message: "请填写必填项" ,trigger: "blur" }],
        // sendSite: [{ required: true, message: "请填写必填项" ,trigger: "blur" }],
        // sendStaff: [{ required: true, message: "请填写必填项" ,trigger: "blur" }],

      },
      faceSheetForm: {
        faceSheetFlag: false,
        customerName: "",
        payType: '1',
        expType: '1',
        customerPwd: "",
        monthCode: "",
        sendSite: "",
        sendStaff: "",
      },
      columns: [
        {
          title: "物流公司",
          key: "name",
          minWidth: 120,
          sortable: false,
        },
        {
          title: "状态",
          key: "selected",
          minWidth: 120,
          sortable: true,
          render: (h, params) => {
            if (!params.row.selected) {
              return h("div", [h("tag", { props: { color: "volcano" } }, "关闭")]);
            } else {
              return h("div", [h("tag", { props: { color: "green" } }, "开启")]);
            }
          }
        },
        {
          title: "操作",
          key: "action",
          align: "center",
          width: 200,
          render: (h, params) => {
            if (!params.row.selected) {
              return h("div", [
                h(
                  "Button",
                  {
                    props: {
                      type: "success",
                      size: "small",
                    },
                    style: {
                      marginRight: "5px",
                    },
                    on: {
                      click: () => {
                        this.open(params.row);
                      },
                    },
                  },
                  "开启"
                ),
              ]);
            } else {
              return h("div", [
                h(
                  "Button",
                  {
                    props: {
                      type: "error",
                      size: "small",
                    },
                    style: {
                      marginRight: "5px",
                    },
                    on: {
                      click: () => {
                        this.close(params.row);
                      },
                    },
                  },
                  "关闭"
                ),
                h(
                  "Button",
                  {
                    props: {
                      type: "info",
                      size: "small",
                    },
                    on: {
                      click: () => {
                        this.getFaceSheetInfo(params.row);
                      },
                    },
                  },
                  "修改"
                ),
              ]);
            }

          },
        },
      ],
      data: [], // 表单数据
      openText: false,
    };
  },
  watch: {
    'faceSheetForm.faceSheetFlag'(val) {
      this.openText = val ? true : false
      console.log(this.openText )
    }
  },
  methods: {
    //获取状态
    getfaceSheetFlag(e) {
      console.log(e);
      if (e === true) {
        console.log("打开");
        this.openText = true;
      } else {
        console.log("关闭");
        this.openText = false;
      }
    },
    // 初始化数据
    init() {
      this.getDataList();
    },
    // 获取数据
    getDataList() {
      this.loading = true;
      API_Shop.getLogistics().then((res) => {
        this.loading = false;
        if (res.success) {
          this.data = res.result;
        }
      });
      this.loading = false;
    },
    cancelModal() {
      this.faceSheetFlag = false;
      this.faceSheetForm.faceSheetFlag = false;
    },
    // 开启
    open(v) {
      this.row = v;
      this.openModal = true;
      this.searchForm.faceSheetFlag = "false"; //开弹框 等于v
      if (this.searchForm.faceSheetFlag == "true") {
        this.openText = true;
      } else {
        this.openText = false;
      }
    },
    //修改
    getFaceSheetInfo(v) {
      this.row = v;
      this.logisticsId = v.logisticsId;
      this.openModalTitle = '修改信息';
      API_Shop.getIsCheck(this.logisticsId).then((res) => {
        if (res.success) {
          // this.searchForm = res.result.recordes;
          this.faceSheetForm.faceSheetFlag = res.result.faceSheetFlag; //开弹框 等于v
          if (this.faceSheetForm.faceSheetFlag === true) {
            this.openText = true;
          } else {
            this.faceSheetForm.faceSheetFlag = false
            this.openText = false;
          }
          this.faceSheetForm.customerName = res.result.customerName;
          this.faceSheetForm.customerPwd = res.result.customerPwd;
          this.faceSheetForm.monthCode = res.result.monthCode;
          this.faceSheetForm.sendSite = res.result.sendSite;
          this.faceSheetForm.sendStaff = res.result.sendStaff;
          this.faceSheetForm.payType = res.result.payType;
          this.faceSheetForm.expType = res.result.expType;
        }
      });
      this.openModal = true;
    },
    frontDownload(val) {
      var a = document.createElement("a"); //创建一个<a></a>标签
      //根据点击按钮来下载不同文件
      if (val === 'use') {
        a.href = "static/instructions.xlsx"; // 给a标签的href属性值加上地址，注意，这里是绝对路径，不用加 点.
        a.download = "使用说明.xlsx"; //设置下载文件文件名，这里加上.xlsx指定文件类型，pdf文件就指定.fpd即可
      } else if (val === 'type') {
        a.href = "static/logisticsType.xlsx"; // 给a标签的href属性值加上地址，注意，这里是绝对路径，不用加 点.
        a.download = "快递类型.xlsx"; //设置下载文件文件名，这里加上.xlsx指定文件类型，pdf文件就指定.fpd即可
      }
      a.style.display = "none"; // 障眼法藏起来a标签
      document.body.appendChild(a); // 将a标签追加到文档对象中
      a.click(); // 模拟点击了a标签，会触发a标签的href的读取，浏览器就会自动下载了
      a.remove(); // 一次性的，用完就删除a标签
    },

    submit() {
      if (!this.row.selected) {
        API_Shop.logisticsChecked(
          this.row.logisticsId,
          this.faceSheetForm
        ).then((res) => {
          this.openModal = false;
          this.$Modal.remove();
          if (res.success) {
            this.$Message.success("物流公司开启成功");
            this.init();
          }
        });
      } else {
        API_Shop.editChecked(this.logisticsId, this.faceSheetForm).then((res) => {
          if (res.success) {
            this.$Message.success("修改成功");
            this.init();
          }
        });
      }
    },
    // 关闭
    close(v) {
      this.$Modal.confirm({
        title: "确认关闭",
        content: "您确认关闭此物流公司?",
        loading: true,
        onOk: () => {
          API_Shop.logisticsUnChecked(v.logisticsId).then((res) => {
            this.$Modal.remove();
            if (res.success) {
              this.$Message.success("物流公司关闭成功");
              this.init();
            }
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
.faceSheetInput {
  width: 300px;
}
</style>
