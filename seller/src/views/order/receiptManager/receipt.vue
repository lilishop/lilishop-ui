<template>
  <div class="search">
    <Card>
      <Form ref="searchForm" :model="searchForm" inline :label-width="70" class="search-form">
        <Form-item label="订单编号" prop="orderSn">
          <Input type="text" v-model="searchForm.orderSn" clearable placeholder="请输入订单编号" style="width: 240px" />
        </Form-item>
        <Form-item label="会员名称" prop="memberName">
          <Input type="text" v-model="searchForm.memberName" clearable placeholder="请输入会员名称" style="width: 240px" />
        </Form-item>
        <Form-item label="发票抬头" prop="receiptTitle">
          <Input type="text" v-model="searchForm.receiptTitle" clearable placeholder="请输入发票抬头" style="width: 240px" />
        </Form-item>
        <Form-item label="状态" prop="receiptStatus">
          <Select v-model="searchForm.receiptStatus" placeholder="请选择" clearable style="width: 240px">
            <Option :value="0">未开票</Option>
            <Option :value="1">已开票</Option>
          </Select>
        </Form-item>
        <Button @click="handleSearch" type="primary" class="search-btn">搜索</Button>
        <Button @click="handleReset" class="search-btn">重置</Button>
      </Form>
      </Card>

    <Card>
      <div class="receipt-tip">
          订单状态为已发货/已完成可开票
      </div>
      <Table class="mt_10" :loading="loading" border :columns="columns" :data="data" ref="table">
        <!-- 订单详情格式化 -->
        <template slot="orderSlot" slot-scope="scope">
          <a @click="$router.push({name: 'order-detail',query: {sn: scope.row.orderSn}})">{{scope.row.orderSn}}</a>
        </template>
      </Table>
      <Row type="flex" justify="end" class="mt_10">
        <Page :current="searchForm.pageNumber" :total="total" :page-size="searchForm.pageSize" @on-change="changePage" @on-page-size-change="changePageSize" :page-size-opts="[10, 20, 50]" size="small"
          show-total show-elevator show-sizer></Page>
      </Row>
    </Card>
    <Modal
      v-model="receiptModalVisible"
      title="发票信息"
      :mask-closable="false"
      width="680"
    >
      <div v-if="receiptDetailLoading" class="receipt-modal-loading">
        <Spin size="large" />
      </div>
      <div v-else class="receipt-modal-content">
        <div v-if="hasValue(currentReceipt.orderSn)" class="receipt-item">
          <span class="receipt-label">订单号：</span>
          <span class="receipt-value">{{ currentReceipt.orderSn }}</span>
        </div>
        <div v-if="hasValue(currentReceipt.memberName)" class="receipt-item">
          <span class="receipt-label">会员名称：</span>
          <span class="receipt-value">{{ currentReceipt.memberName }}</span>
        </div>
        <div v-if="hasValue(currentReceipt.receiptType) || hasValue(currentReceipt.invoiceKind)" class="receipt-item">
          <span class="receipt-label">发票类型：</span>
          <span class="receipt-value">{{ formatReceiptType(currentReceipt) }}</span>
        </div>
        <div v-if="hasValue(currentReceipt.receiptTitle)" class="receipt-item">
          <span class="receipt-label">发票抬头：</span>
          <span class="receipt-value">{{ currentReceipt.receiptTitle }}</span>
        </div>
        <div v-if="hasValue(currentReceipt.companyName)" class="receipt-item">
          <span class="receipt-label">单位名称：</span>
          <span class="receipt-value">{{ currentReceipt.companyName }}</span>
        </div>
        <div v-if="hasValue(currentReceipt.personalName)" class="receipt-item">
          <span class="receipt-label">个人名称：</span>
          <span class="receipt-value">{{ currentReceipt.personalName }}</span>
        </div>
        <div v-if="hasValue(currentReceipt.taxpayerId)" class="receipt-item">
          <span class="receipt-label">纳税人识别号：</span>
          <span class="receipt-value">{{ currentReceipt.taxpayerId }}</span>
        </div>
        <div v-if="hasValue(currentReceipt.companyAddress)" class="receipt-item">
          <span class="receipt-label">单位地址：</span>
          <span class="receipt-value">{{ currentReceipt.companyAddress }}</span>
        </div>
        <div v-if="hasValue(currentReceipt.companyPhone)" class="receipt-item">
          <span class="receipt-label">单位电话：</span>
          <span class="receipt-value">{{ currentReceipt.companyPhone }}</span>
        </div>
        <div v-if="hasValue(currentReceipt.bankName)" class="receipt-item">
          <span class="receipt-label">开户银行：</span>
          <span class="receipt-value">{{ currentReceipt.bankName }}</span>
        </div>
        <div v-if="hasValue(currentReceipt.bankAccount)" class="receipt-item">
          <span class="receipt-label">银行账号：</span>
          <span class="receipt-value">{{ currentReceipt.bankAccount }}</span>
        </div>
        <div v-if="hasValue(currentReceipt.receiptContent)" class="receipt-item">
          <span class="receipt-label">发票内容：</span>
          <span class="receipt-value">{{ currentReceipt.receiptContent }}</span>
        </div>
        <div v-if="hasPrice(currentReceipt.receiptPrice)" class="receipt-item">
          <span class="receipt-label">发票金额：</span>
          <span class="receipt-value">{{ formatPrice(currentReceipt.receiptPrice) }}</span>
        </div>
        <div v-if="hasValue(currentReceipt.receiptPhone)" class="receipt-item">
          <span class="receipt-label">收票人手机：</span>
          <span class="receipt-value">{{ currentReceipt.receiptPhone }}</span>
        </div>
        <div v-if="hasValue(currentReceipt.receiptEmail)" class="receipt-item">
          <span class="receipt-label">收票人邮箱：</span>
          <span class="receipt-value">{{ currentReceipt.receiptEmail }}</span>
        </div>
        <div v-if="hasValue(getInvoiceAddress(currentReceipt))" class="receipt-item">
          <span class="receipt-label">发票附件：</span>
          <span class="receipt-value">
            <a @click="viewInvoiceFile(getInvoiceAddress(currentReceipt))">查看附件</a>
          </span>
        </div>
      </div>
      <div slot="footer">
        <template v-if="receiptModalMode === 'invoicing'">
          <Upload
            :action="uploadFileUrl"
            :data="receiptUploadData"
            :headers="{ ...accessToken }"
            :format="['jpg', 'jpeg', 'png', 'pdf']"
            :max-size="10240"
            :on-success="handleInvoiceUploadSuccess"
            :on-error="handleInvoiceUploadError"
            :on-format-error="handleInvoiceFormatError"
            :on-exceeded-size="handleInvoiceMaxSize"
            :show-upload-list="false"
            style="display: inline-block; margin-right: 8px"
          >
            <Button :disabled="receiptDetailLoading">上传发票</Button>
          </Upload>
          <Button @click="receiptModalVisible = false">取消</Button>
          <Button
            type="primary"
            :loading="invoiceSubmitting"
            @click="submitInvoicing"
          >
            确认开票
          </Button>
        </template>
        <Button v-else @click="receiptModalVisible = false">关闭</Button>
      </div>
    </Modal>
  </div>
</template>

<script>
import * as API_Order from "@/api/order";
import { uploadFile } from "@/libs/axios";

export default {
  name: "receipt",
  data() {
    return {
      loading: true, // 表单加载状态
      receiptModalVisible: false,
      receiptDetailLoading: false,
      invoiceSubmitting: false,
      receiptModalMode: "detail",
      uploadFileUrl: uploadFile,
      accessToken: {},
      receiptUploadData: {
        directoryPath: "receipt"
      },
      currentReceipt: {},
      selectedReceiptRow: null,
      searchForm: {
        // 搜索框初始化对象
        pageNumber: 1, // 当前页数
        pageSize: 10, // 页面大小
        sort: "createTime", // 默认排序字段
        order: "desc", // 默认排序方式
        receiptStatus: "", // 发票状态
      },
      columns: [
        {
          title: "订单号",
          key: "orderSn",
          minWidth: 120,
          slot: "orderSlot",
        },
        {
          title: "会员名称",
          key: "memberName",
          minWidth: 90,
          tooltip: true,
        },

        {
          title: "发票抬头",
          key: "receiptTitle",
          minWidth: 90,
          tooltip: true,
          render: (h, params) => {
            return h("div", params.row.receiptTitle || "暂未填写");
          },
        },
        {
          title: "纳税人识别号",
          key: "taxpayerId",
          minWidth: 100,
          tooltip: true,
          render: (h, params) => {
            return h("div", params.row.taxpayerId || "暂未填写");
          },
        },
        {
          title: "发票内容",
          key: "receiptContent",
          minWidth: 90,
          tooltip: true,
          render: (h, params) => {
            return h("div", params.row.receiptContent || "暂未填写");
          },
        },
        {
          title: "发票金额",
          key: "billPrice",
          width: 150,
          render: (h, params) => {
            return h("priceColorScheme", {props:{value:params.row.receiptPrice,color:this.$mainColor}} );
          },
        },
        {
          title: "发票状态",
          key: "receiptStatus",
          width: 100,
          tooltip: true,
          render: (h, params) => {
            if (Number(params.row.receiptStatus) === 0) {
              return h("div", [
                h("tag", { props: { color: "volcano" } }, "未开票"),
              ]);
            } else {
              return h("div", [
                h("tag", { props: { color: "green" } }, "已开票"),
              ]);
            }
          },
        },
        {
          title: "订单状态",
          key: "orderStatus",
          width: 100,
          render: (h, params) => {
            if (params.row.orderStatus == "UNPAID") {
              return h("div", [
                h("tag", { props: { color: "magenta" } }, "未付款"),
              ]);
            } else if (params.row.orderStatus == "PAID") {
              return h("div", [
                h("tag", { props: { color: "blue" } }, "已付款"),
              ]);
            } else if (params.row.orderStatus == "UNDELIVERED") {
              return h("div", [
                h("tag", { props: { color: "geekblue" } }, "待发货"),
              ]);
            } else if (params.row.orderStatus == "DELIVERED") {
              return h("div", [
                h("tag", { props: { color: "cyan" } }, "已发货"),
              ]);
            } else if (params.row.orderStatus == "COMPLETED") {
              return h("div", [
                h("tag", { props: { color: "green" } }, "已完成"),
              ]);
            } else if (params.row.orderStatus == "TAKE") {
              return h("div", [
                h("tag", { props: { color: "volcano" } }, "待核验"),
              ]);
            } else if (params.row.orderStatus == "CANCELLED") {
              return h("div", [
                h("tag", { props: { color: "red" } }, "已取消"),
              ]);
            }
          },
        },

        {
          title: "操作",
          key: "action",
          align: "center",
          fixed: 'right',
          width: 200,
          render: (h, params) => {
            const disabled = !this.canInvoicing(params.row);
            const detailStyle = { color: "#2d8cf0", cursor: "pointer", textDecoration: "none", marginRight: "12px" };
            const style = disabled
              ? { color: "#c5c8ce", cursor: "not-allowed", textDecoration: "none" }
              : { color: "#2d8cf0", cursor: "pointer", textDecoration: "none" };
            const on = disabled ? {} : { click: () => { this.openReceiptModal(params.row, "invoicing"); } };
            return h("div", [
              h(
                "a",
                {
                  style: detailStyle,
                  on: { click: () => { this.openReceiptModal(params.row, "detail"); } },
                },
                "详情"
              ),
              h(
                "a",
                {
                  style,
                  on,
                },
                "开票"
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
    canInvoicing(row) {
      if (!row) return false;
      const orderStatus = row.orderStatus;
      const receiptStatus = Number(row.receiptStatus);
      return (orderStatus === "COMPLETED" || orderStatus === "DELIVERED") && receiptStatus === 0;
    },
    initUploadAccessToken() {
      this.accessToken = {
        accessToken: this.getStore("accessToken")
      };
    },
    hasValue(value) {
      if (value === null || value === undefined) return false;
      return String(value).trim() !== "";
    },
    hasPrice(value) {
      return value !== null && value !== undefined && value !== "";
    },
    formatValue(value) {
      if (value === null || value === undefined) return "暂无";
      const text = String(value).trim();
      return text ? text : "暂无";
    },
    formatPrice(value) {
      if (value === null || value === undefined || value === "") return "暂无";
      return `￥${value}`;
    },
    isVatSpecialReceipt(receipt) {
      if (!receipt) return false;
      const receiptType = receipt.receiptType != null ? String(receipt.receiptType).trim() : "";
      return receiptType === "2" || receiptType === "增值税专用发票" || receipt.invoiceKind === "VAT_SPECIAL";
    },
    formatReceiptType(receipt) {
      if (!receipt || (!receipt.receiptType && !receipt.invoiceKind)) return "电子普通发票";
      const receiptType = receipt.receiptType != null ? String(receipt.receiptType).trim() : "";
      if (receiptType === "电子普通发票" || receiptType === "增值税专用发票") return receiptType;
      return this.isVatSpecialReceipt(receipt) ? "增值税专用发票" : "电子普通发票";
    },
    formatReceiptHeaderType(receipt) {
      if (!receipt) return "暂无";
      if (this.isVatSpecialReceipt(receipt)) return "单位";
      if (receipt.companyName) return "单位";
      if (receipt.personalName) return "个人";
      const receiptTitle = receipt.receiptTitle != null ? String(receipt.receiptTitle).trim() : "";
      if (receiptTitle === "单位" || receiptTitle === "个人") return receiptTitle;
      return receipt.taxpayerId ? "单位" : "个人";
    },
    getReceiptTitleLabel(receipt) {
      return this.formatReceiptHeaderType(receipt) === "单位" ? "单位名称" : "个人名称";
    },
    getReceiptTitleName(receipt) {
      if (!receipt) return "";
      if (receipt.companyName) return receipt.companyName;
      if (receipt.personalName) return receipt.personalName;
      const receiptTitle = receipt.receiptTitle != null ? String(receipt.receiptTitle).trim() : "";
      if (receiptTitle === "单位" || receiptTitle === "个人") return "";
      return receiptTitle;
    },
    getInvoiceAddress(receipt) {
      if (!receipt) return "";
      return receipt.invoiceAddress || receipt.invoiceFileUrl || "";
    },
    buildInvoicingPayload() {
      const invoiceAddress = this.getInvoiceAddress(this.currentReceipt);
      return invoiceAddress ? { invoiceAddress } : {};
    },
    handleInvoiceUploadSuccess(res) {
      if (res && res.success && res.result) {
        this.$set(this.currentReceipt, "invoiceAddress", res.result);
        if (this.selectedReceiptRow) {
          this.$set(this.selectedReceiptRow, "invoiceAddress", res.result);
        }
        this.$Message.success("发票上传成功");
      } else {
        this.$Message.error((res && res.message) || "发票上传失败");
      }
    },
    handleInvoiceUploadError() {
      this.$Message.error("发票上传失败");
    },
    handleInvoiceFormatError() {
      this.$Notice.warning({
        title: "文件格式不正确",
        desc: "请上传 jpg、jpeg、png 或 pdf 格式文件"
      });
    },
    handleInvoiceMaxSize() {
      this.$Notice.warning({
        title: "超过文件大小限制",
        desc: "发票附件不能超过 10MB"
      });
    },
    viewInvoiceFile(url) {
      if (!url) return;
      window.open(url, "_blank");
    },
    // 初始化数据
    init() {
      this.getData();
    },
    // 改变页码
    changePage(v) {
      this.searchForm.pageNumber = v;
      this.getData();
    },
    // 改变页数
    changePageSize(v) {
      this.searchForm.pageSize = v;
      this.getData();
    },
    // 搜索
    handleSearch() {
      this.searchForm.pageNumber = 1;
      this.searchForm.pageSize = 10;
      this.getData();
    },
    // 重置搜索条件
    handleReset() {
      this.searchForm = {};
      this.searchForm.pageNumber = 1;
      this.searchForm.pageSize = 10;
      this.getData();
    },
    // 时间段从新赋值
    selectDateRange(v) {
      if (v) {
        this.searchForm.startDate = v[0];
        this.searchForm.endDate = v[1];
      }
    },
    // 获取数据
    getData() {
      this.loading = true;
      API_Order.getReceiptPage(this.searchForm).then((res) => {
        this.loading = false;
        if (res.success) {
          this.data = res.result.records;
          this.total = res.result.total;
        }
      });
      this.total = this.data.length;
      this.loading = false;
    },
    async openReceiptModal(row, mode = "detail") {
      if (!row) return;
      this.receiptModalMode = mode;
      this.selectedReceiptRow = row;
      this.currentReceipt = { ...row };
      this.receiptModalVisible = true;
      this.receiptDetailLoading = true;
      try {
        const res = await API_Order.getReceiptDetail(row.id);
        if (res.success && res.result) {
          this.currentReceipt = { ...row, ...res.result };
        } else {
          this.$Message.warning("发票详情获取失败，已展示列表中的发票信息");
        }
      } catch (e) {
        this.$Message.error("发票详情获取失败");
      } finally {
        this.receiptDetailLoading = false;
      }
    },
    async submitInvoicing() {
      if (!this.selectedReceiptRow) return;
      if (!this.canInvoicing(this.selectedReceiptRow)) {
        this.$Message.warning("当前订单状态不支持开票");
        return;
      }
      const params = this.buildInvoicingPayload();
      if (!params.invoiceAddress) {
        this.$Message.warning("请先上传发票");
        return;
      }
      this.invoiceSubmitting = true;
      try {
        const res = await API_Order.invoicing(this.selectedReceiptRow.id, params);
        if (res.success) {
          this.$Message.success("开票成功");
          this.receiptModalVisible = false;
          this.getData();
        }
      } catch (e) {
        this.$Message.error("开票失败");
      } finally {
        this.invoiceSubmitting = false;
      }
    },
  },
  mounted() {
    this.initUploadAccessToken();
    this.init();
  },
};
</script>
<style lang="scss">
// 建议引入通用样式 可删除下面样式代码
@import "@/styles/table-common.scss";

.receipt-modal-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 240px;
}

.receipt-modal-content {
  max-height: 460px;
  overflow-y: auto;
}

.receipt-item {
  display: flex;
  margin-bottom: 12px;
  line-height: 22px;
}

.receipt-tip {
  margin-bottom: 16px;
  padding: 8px 12px;
  color: #ff9900;
  background: #fff7e6;
  border: 1px solid #ffd591;
  border-radius: 4px;
}

.receipt-label {
  width: 110px;
  color: #515a6e;
  flex-shrink: 0;
  text-align: right;
}

.receipt-value {
  flex: 1;
  color: #17233d;
  word-break: break-all;
}
</style>
