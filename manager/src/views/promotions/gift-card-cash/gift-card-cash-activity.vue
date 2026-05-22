<template>
  <div class="search">
    <Card>
      <Form
        ref="searchForm"
        :model="searchForm"
        inline
        :label-width="80"
        class="search-form mb_10"
      >
        <Form-item label="礼品卡名称" prop="giftCardName">
          <Input
            v-model="searchForm.giftCardName"
            type="text"
            placeholder="模糊搜索礼品卡名称"
            clearable
            style="width: 260px"
          />
        </Form-item>
        <Button type="primary" icon="ios-search" class="search-btn" @click="handleSearch"
          >搜索</Button
        >
      </Form>
    </Card>
    <Card>
      <Row class="operation padding-row">
        <Button type="primary" @click="addActivity">添加礼品卡</Button>
      </Row>
      <Table :loading="loading" :columns="columns" :data="data" ref="table">
        <template slot-scope="{ row }" slot="action">
          <template v-if="canEdit(row)">
            <a :style="linkStyle" @click.prevent="goEdit(row)">编辑</a>
            <span :style="sepStyle">|</span>
          </template>
          <a :style="linkStyle" @click.prevent="goView(row)">查看</a>
          <template v-if="canBatchCreate(row)">
            <span :style="sepStyle">|</span>
            <a :style="linkStyle" @click.prevent="openBatchCreate(row)">批量制卡</a>
          </template>
          <template v-if="canBatchIssue(row)">
            <span :style="sepStyle">|</span>
            <a :style="linkStyle" @click.prevent="openBatchIssue(row)">批量发卡</a>
          </template>
          <span :style="sepStyle">|</span>
          <a :style="linkStyle" @click.prevent="goRecords(row)">查看记录</a>
        </template>
      </Table>
      <Row type="flex" justify="end" class="mt_10">
        <Page
          :current="searchForm.pageNumber"
          :total="total"
          :page-size="searchForm.pageSize"
          :page-size-opts="[20, 50, 100]"
          size="small"
          show-total
          show-elevator
          show-sizer
          @on-change="changePage"
          @on-page-size-change="changePageSize"
        />
      </Row>
    </Card>
    <Modal
      v-model="batchCreateVisible"
      title="批量制卡"
      :mask-closable="false"
      width="520"
      @on-visible-change="onBatchCreateVisible"
    >
      <Form ref="batchForm" :model="batchForm" :rules="batchFormRule" :label-width="100">
        <FormItem label="礼品卡名称">
          <span>{{ batchCtx.giftCardName || "-" }}</span>
        </FormItem>
        <FormItem label="面值">
          <template v-if="batchCtx.faceValue != null && batchCtx.faceValue !== ''">
            <priceColorScheme
              :value="batchCtx.faceValue"
              :color="$mainColor"
            ></priceColorScheme>
          </template>
          <span v-else>-</span>
        </FormItem>
        <FormItem label="当前库存">
          <span>{{ fmtInt(batchCtx.headroom) }}</span>
        </FormItem>
        <FormItem label="制卡张数" prop="quantity">
          <InputNumber
            v-model="batchForm.quantity"
            :min="1"
            :max="batchQuantityMax"
            :precision="0"
            placeholder="请输入制卡张数"
            style="width: 220px"
          />
        </FormItem>
        <FormItem label="本批备注" prop="batchRemark">
          <Input
            v-model="batchForm.batchRemark"
            type="textarea"
            :rows="2"
            maxlength="64"
            show-word-limit
            placeholder="选填，最多64字"
            style="width: 100%"
          />
        </FormItem>
      </Form>
      <div slot="footer">
        <Button @click="batchCreateVisible = false">取消</Button>
        <Button type="primary" :loading="batchCreateSubmitting" @click="submitBatchCreate"
          >确定</Button
        >
      </div>
    </Modal>
    <Modal
      v-model="batchIssueVisible"
      title="批量发卡"
      :mask-closable="false"
      width="560"
      @on-visible-change="onBatchIssueVisible"
    >
      <div class="gcc-batch-issue-body">
        <Form :label-width="100">
          <FormItem label="礼品卡名称">
            <span>{{ issueCtx.giftCardName || "-" }}</span>
          </FormItem>
        </Form>
        <Alert type="info" show-icon class="mb_10">
          请先下载模板，按列填写<strong>手机号</strong>、<strong>发卡数量</strong>后上传；发卡不区分制卡批次。
        </Alert>
        <div class="gcc-batch-issue-actions">
          <Button
            type="primary"
            ghost
            icon="md-download"
            :loading="issueTemplateDownloading"
            @click="downloadIssueTemplate"
          >
            下载 Excel 模板
          </Button>
        </div>
        <div class="gcc-batch-issue-upload">
          <span class="gcc-batch-issue-upload-label">上传已填写的 Excel</span>
          <Upload
            :before-upload="onIssueImportBeforeUpload"
            accept=".xls,.xlsx,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            :show-upload-list="false"
          >
            <Button type="dashed" icon="ios-cloud-upload-outline">选择文件</Button>
          </Upload>
          <span v-if="issueFileName" class="gcc-batch-issue-filename">{{ issueFileName }}</span>
        </div>
      </div>
      <div slot="footer">
        <Button @click="batchIssueVisible = false">取消</Button>
        <Button type="primary" :loading="issueImportSubmitting" @click="submitIssueImport"
          >开始发卡</Button
        >
      </div>
    </Modal>
  </div>
</template>

<script>
import {
  getGiftCardCashActivityPage,
  giftCardCashBatchCreate,
  downloadGiftCardCashIssueTemplate,
  giftCardCashIssueImportByActivity,
} from "@/api/promotion";

export default {
  name: "GiftCardCashActivity",
  data() {
    return {
      loading: false,
      searchForm: {
        pageNumber: 1,
        pageSize: 20,
        sort: "createTime",
        order: "desc",
        giftCardName: "",
      },
      columns: [
        {
          title: "礼品卡名称",
          key: "giftCardName",
          minWidth: 100,
          tooltip: true,
        },
        {
          title: "礼品卡类型",
          key: "cardType",
          width: 200,
          render: (h, params) => {
            const t = params.row.cardType;
            const map = { CASH: "现金卡", PICKUP: "提货卡" };
            return h("span", map[t] || t || "-");
          },
        },
        {
          title: "面值",
          key: "faceValue",
          width: 200,
          align: "right",
          render: (h, params) => {
            const v = params.row.faceValue;
            if (v === null || v === undefined || v === "") {
              return h("span", "-");
            }
            return h("priceColorScheme", {
              props: { value: v, color: this.$mainColor },
            });
          },
        },
        {
          title: "有效期",
          key: "validityType",
          width: 200,
          render: (h, params) => {
            return h("span", this.formatValidity(params.row));
          },
        },
        {
          title: "总库存",
          key: "stockTotal",
          width: 200,
          align: "center",
          render: (h, params) =>
            h("span", this.fmtInt(params.row.stockTotal)),
        },
        {
          title: "批量制卡数",
          key: "producedQuantity",
          width: 200,
          align: "center",
          render: (h, params) =>
            h("span", this.fmtInt(params.row.producedQuantity)),
        },
        {
          title: "批量发卡数",
          key: "issuedCardQuantity",
          width: 200,
          align: "center",
          render: (h, params) =>
            h("span", this.fmtInt(params.row.issuedCardQuantity)),
        },
        {
          title: "剩余库存",
          key: "remainingStock",
          width: 200,
          align: "center",
          render: (h, params) =>
            h("span", this.fmtInt(params.row.remainingStock)),
        },
        {
          title: "状态",
          key: "status",
          width: 200,
          render: (h, params) => {
            if (this.isFixedValidityExpired(params.row)) {
              return h("div", [
                h(
                  "Tag",
                  {
                    props: { color: "red" },
                  },
                  "已过期"
                ),
              ]);
            }
            return h("div", [
              h(
                "Tag",
                {
                  props: { color: "green" },
                },
                "正常"
              ),
            ]);
          },
        },
        {
          title: "创建时间",
          key: "createTime",
          width: 200,
        },
        {
          title: "操作",
          slot: "action",
          align: "right",
          width: 380,
        },
      ],
      data: [],
      total: 0,
      linkStyle: {
        color: "#2d8cf0",
        cursor: "pointer",
        textDecoration: "none",
      },
      disabledLinkStyle: {
        color: "#c5c8ce",
        cursor: "not-allowed",
      },
      sepStyle: { margin: "0 8px", color: "#dcdee2" },
      batchCreateVisible: false,
      batchCreateSubmitting: false,
      batchCtx: {
        id: "",
        giftCardName: "",
        faceValue: null,
        remainingStock: null,
        headroom: null,
      },
      batchForm: {
        quantity: null,
        batchRemark: "",
      },
      batchFormRule: {},
      batchIssueVisible: false,
      issueTemplateDownloading: false,
      issueImportSubmitting: false,
      issueCtx: {
        id: "",
        giftCardName: "",
      },
      issueFile: null,
      issueFileName: "",
    };
  },
  computed: {
    batchQuantityMax() {
      const cap = 10000;
      const h = this.batchCtx.headroom;
      if (h !== null && h !== undefined && h !== "" && Number(h) >= 1) {
        return Math.min(cap, Number(h));
      }
      return cap;
    },
  },
  created() {
    this.batchFormRule = {
      quantity: [{ validator: this.validateBatchQuantity, trigger: "change" }],
      batchRemark: [{ type: "string", max: 64, message: "备注过长", trigger: "blur" }],
    };
  },
  mounted() {
    this.getDataList();
  },
  methods: {
    validateBatchQuantity(rule, value, callback) {
      if (value === null || value === undefined || value === "") {
        callback(new Error("请填写制卡张数"));
        return;
      }
      const n = Number(value);
      if (Number.isNaN(n) || n < 1) {
        callback(new Error("制卡张数至少为 1"));
        return;
      }
      const maxQ = this.batchQuantityMax;
      if (n > maxQ) {
        callback(new Error(`制卡张数不能超过 ${maxQ}（可制卡上限与单次上限）`));
        return;
      }
      if (n > 10000) {
        callback(new Error("单次制卡不超过 10000 张"));
        return;
      }
      callback();
    },
    fmtInt(n) {
      if (n === null || n === undefined || n === "") {
        return "-";
      }
      return n;
    },
    /** 固定到期类有效期且到期时间早于当前时间，列表状态展示为「已过期」 */
    isFixedValidityExpired(row) {
      if (!row || !row.validityType || row.validEndTime == null || row.validEndTime === "") {
        return false;
      }
      const type = String(row.validityType).toUpperCase();
      const fixedEndTypes = [
        "FIXED_UNTIL",
        "FIXED_END",
        "FIXED",
        "BY_END_TIME",
        "FIXED_DATE",
      ];
      if (!fixedEndTypes.includes(type)) {
        return false;
      }
      const end = new Date(row.validEndTime);
      if (Number.isNaN(end.getTime())) {
        return false;
      }
      return end.getTime() < Date.now();
    },
    formatValidity(row) {
      if (!row || !row.validityType) {
        return "-";
      }
      const type = String(row.validityType).toUpperCase();
      if (type === "LONG_TERM") {
        return "长期有效";
      }
      if (type === "FIXED_UNTIL") {
        return row.validEndTime ? String(row.validEndTime) : "固定到期";
      }
      if (type === "AFTER_ACTIVATE_MONTHS") {
        const m = row.validMonthsAfterActivate;
        return m != null && m !== "" ? `激活后${m}个月有效` : "激活后按月";
      }
      if (
        type === "FIXED_END" ||
        type === "FIXED" ||
        type === "BY_END_TIME" ||
        type === "FIXED_DATE"
      ) {
        return row.validEndTime ? String(row.validEndTime) : type;
      }
      if (
        type === "AFTER_ACTIVATE" ||
        type === "MONTHS_AFTER_ACTIVATE" ||
        type === "RELATIVE"
      ) {
        const m = row.validMonthsAfterActivate;
        return m != null && m !== "" ? `激活后${m}个月有效` : type;
      }
      const parts = [row.validityType];
      if (row.validEndTime) {
        parts.push(String(row.validEndTime));
      }
      if (row.validMonthsAfterActivate != null && row.validMonthsAfterActivate !== "") {
        parts.push(`激活后${row.validMonthsAfterActivate}个月`);
      }
      return parts.join(" ");
    },
    addActivity() {
      this.$router.push({ name: "add-gift-card-cash-activity" });
    },
    goEdit(row) {
      if (!this.canEdit(row)) {
        return;
      }
      this.$router.push({
        name: "edit-gift-card-cash-activity",
        query: { id: row.id },
      });
    },
    goView(row) {
      this.$router.push({
        name: "edit-gift-card-cash-activity",
        query: { id: row.id, onlyView: "true" },
      });
    },
    goRecords(row) {
      this.$router.push({
        name: "gift-card-cash-records",
        query: {
          activityId: row.id,
          giftCardName: row.giftCardName || "",
        },
      });
    },
    getRemainingStock(row) {
      if (!row || row.remainingStock === null || row.remainingStock === undefined || row.remainingStock === "") {
        return 0;
      }
      const n = Number(row.remainingStock);
      if (Number.isNaN(n)) {
        return 0;
      }
      return Math.max(0, Math.floor(n));
    },
    hasRemainingStock(row) {
      return this.getRemainingStock(row) >= 1;
    },
    canEdit(row) {
      return this.hasRemainingStock(row);
    },
    /** 本次批量制卡允许的最大张数：以剩余库存为准 */
    getBatchCreateHeadroom(row) {
      return this.getRemainingStock(row);
    },
    canBatchCreate(row) {
      return this.hasRemainingStock(row);
    },
    /** 可发卡余量：与制卡独立，以剩余库存为准 */
    getBatchIssuePool(row) {
      return this.getRemainingStock(row);
    },
    canBatchIssue(row) {
      if (this.isFixedValidityExpired(row)) {
        return false;
      }
      return this.hasRemainingStock(row);
    },
    openBatchIssue(row) {
      if (!this.canBatchIssue(row)) {
        return;
      }
      this.issueCtx = {
        id: row.id,
        giftCardName: row.giftCardName,
      };
      this.issueFile = null;
      this.issueFileName = "";
      this.batchIssueVisible = true;
    },
    onBatchIssueVisible(open) {
      if (!open) {
        this.issueFile = null;
        this.issueFileName = "";
      }
    },
    downloadIssueTemplate() {
      this.issueTemplateDownloading = true;
      downloadGiftCardCashIssueTemplate()
        .then((res) => {
          this.issueTemplateDownloading = false;
          if (!res) {
            return;
          }
          if (res instanceof Blob && res.type && res.type.indexOf("json") !== -1) {
            const reader = new FileReader();
            reader.onload = () => {
              try {
                const j = JSON.parse(reader.result);
                if (j && j.message) {
                  this.$Message.error(j.message);
                } else {
                  this.$Message.error("模板下载失败");
                }
              } catch (e) {
                this.$Message.error("模板下载失败");
              }
            };
            reader.readAsText(res);
            return;
          }
          const blob =
            res instanceof Blob
              ? res
              : new Blob([res], {
                  type:
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8",
                });
          const name = "批量发卡模板.xlsx";
          if ("download" in document.createElement("a")) {
            const link = document.createElement("a");
            link.download = name;
            link.style.display = "none";
            link.href = URL.createObjectURL(blob);
            document.body.appendChild(link);
            link.click();
            URL.revokeObjectURL(link.href);
            document.body.removeChild(link);
          } else if (navigator.msSaveBlob) {
            navigator.msSaveBlob(blob, name);
          }
          this.$Message.success("模板已开始下载");
        })
        .catch(() => {
          this.issueTemplateDownloading = false;
        });
    },
    onIssueImportBeforeUpload(file) {
      this.issueFile = file;
      this.issueFileName = file.name;
      return false;
    },
    submitIssueImport() {
      if (!this.issueCtx.id) {
        return;
      }
      if (!this.issueFile) {
        this.$Message.warning("请先选择要上传的 Excel 文件");
        return;
      }
      const fd = new FormData();
      fd.append("file", this.issueFile);
      this.issueImportSubmitting = true;
      giftCardCashIssueImportByActivity(this.issueCtx.id, fd)
        .then((res) => {
          this.issueImportSubmitting = false;
          if (res && res.success) {
            this.$Message.success(
              res.result ? `发卡任务已提交，发卡批次号：${res.result}` : "发卡任务已提交"
            );
            this.batchIssueVisible = false;
            this.issueFile = null;
            this.issueFileName = "";
            this.getDataList();
          }
        })
        .catch(() => {
          this.issueImportSubmitting = false;
        });
    },
    openBatchCreate(row) {
      if (!this.canBatchCreate(row)) {
        return;
      }
      const headroom = this.getBatchCreateHeadroom(row);
      this.batchCtx = {
        id: row.id,
        giftCardName: row.giftCardName,
        faceValue: row.faceValue,
        remainingStock: row.remainingStock,
        headroom,
      };
      this.batchForm.quantity = null;
      this.batchForm.batchRemark = "";
      this.batchCreateVisible = true;
    },
    onBatchCreateVisible(open) {
      if (!open && this.$refs.batchForm && typeof this.$refs.batchForm.resetFields === "function") {
        this.$refs.batchForm.resetFields();
      }
    },
    submitBatchCreate() {
      if (!this.$refs.batchForm) {
        return;
      }
      this.$refs.batchForm.validate((valid) => {
        if (!valid) {
          return;
        }
        const q = this.batchForm.quantity;
        const payload = { quantity: q };
        const remark = (this.batchForm.batchRemark || "").trim();
        if (remark) {
          payload.batchRemark = remark;
        }
        this.batchCreateSubmitting = true;
        giftCardCashBatchCreate(this.batchCtx.id, payload)
          .then((res) => {
            this.batchCreateSubmitting = false;
            if (res.success) {
              this.$Message.success(
                res.result ? `制卡成功，批次号：${res.result}` : "制卡成功"
              );
              this.batchCreateVisible = false;
              this.getDataList();
            }
          })
          .catch(() => {
            this.batchCreateSubmitting = false;
          });
      });
    },
    changePage(v) {
      this.searchForm.pageNumber = v;
      this.getDataList();
    },
    changePageSize(v) {
      this.searchForm.pageNumber = 1;
      this.searchForm.pageSize = v;
      this.getDataList();
    },
    handleSearch() {
      this.searchForm.pageNumber = 1;
      this.getDataList();
    },
    getDataList() {
      this.loading = true;
      const params = { ...this.searchForm };
      if (!params.giftCardName) {
        delete params.giftCardName;
      }
      getGiftCardCashActivityPage(params)
        .then((res) => {
          this.loading = false;
          if (res.success && res.result) {
            this.data = res.result.records || [];
            this.total = res.result.total || 0;
          }
        })
        .catch(() => {
          this.loading = false;
        });
    },
  },
};
</script>

<style scoped>
.gcc-batch-issue-body {
  padding: 0 4px;
}
.gcc-batch-issue-actions {
  margin-bottom: 20px;
}
.gcc-batch-issue-upload {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
}
.gcc-batch-issue-upload-label {
  color: #515a6e;
  font-size: 14px;
}
.gcc-batch-issue-filename {
  color: #2d8cf0;
  font-size: 13px;
  word-break: break-all;
}
</style>
