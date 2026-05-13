<template>
  <div class="search member-benefit">
    <Card>
      <Row class="operation padding-row">
        <Button type="primary" @click="openAdd">添加权益设置</Button>
      </Row>
      <Table
        :loading="loading"
        stripe
        :columns="columns"
        :data="data"
        no-data-text="暂无数据"
        class="mt_10 benefit-list-table benefit-list-table--no-vertical-borders"
      ></Table>
      <Row type="flex" justify="end" class="mt_10">
        <Page
          :current="searchForm.pageNumber"
          :total="total"
          :page-size="searchForm.pageSize"
          @on-change="changePage"
          @on-page-size-change="changePageSize"
          :page-size-opts="[20, 30, 50]"
          size="small"
          show-total
          show-elevator
          show-sizer
        ></Page>
      </Row>
    </Card>

    <!-- 平台优惠券选择（与「添加优惠券活动」coupon-publish 相同组件） -->
    <Modal
      v-model="couponPickerVisible"
      title="选择优惠券"
      width="80%"
      :z-index="3000"
      :mask-closable="false"
      @on-ok="handleCouponPickerClose"
      @on-cancel="handleCouponPickerClose"
    >
      <couponTemplate
        v-if="couponPickerVisible"
        :selectedList="couponPickerSelectedList"
        getType="ACTIVITY"
        promotionStatus="START"
        @selected="onCouponTemplateSelected"
      />
    </Modal>

    <Drawer
      v-model="addFlag"
      title="添加权益设置"
      width="1120"
      placement="right"
      :z-index="950"
      :mask-closable="false"
      :closable="true"
      scrollable
      class-name="benefit-form-drawer"
    >
      <Form ref="addForm" :model="formAdd" :rules="rulesAdd" :label-width="110">
        <FormItem label="权益类型" prop="benefitType">
          <Select
            v-model="formAdd.benefitType"
            clearable
            placeholder="请选择权益类型"
            style="width: 100%"
            @on-change="onAddBenefitTypeChange"
          >
            <Option v-for="item in benefitTypeOptions" :key="item.value" :value="item.value">{{ item.description }}</Option>
          </Select>
        </FormItem>
        <FormItem
          v-show="formAdd.benefitType === 'GIFT_POINT'"
          label="赠送积分"
          prop="giftPoint"
          :required="formAdd.benefitType === 'GIFT_POINT'"
        >
          <InputNumber
            v-model="formAdd.giftPoint"
            :min="0"
            :max="99999"
            :precision="0"
            style="width: 220px"
            placeholder="必填，范围 0-99999"
          />
        </FormItem>
        <FormItem
          v-show="formAdd.benefitType === 'COUPON_PACKAGE'"
          label="赠送优惠券"
          prop="couponPackageRows"
          :required="formAdd.benefitType === 'COUPON_PACKAGE'"
        >
          <div>
            <Button type="dashed" icon="ios-add" class="mb_10" @click="openCouponPicker('add')">添加优惠券</Button>
            <Table
              border
              size="small"
              :columns="couponPackageTableColumns"
              :data="formAdd.couponPackageRows"
              no-data-text="请添加优惠券"
            ></Table>
          </div>
        </FormItem>
        <FormItem label="权益名称" prop="benefitName">
          <Input v-model="formAdd.benefitName" maxlength="50" placeholder="请输入权益名称" />
        </FormItem>
        <FormItem label="权益LOGO" prop="benefitLogo">
          <div class="benefit-logo-field">
            <div v-if="formAdd.benefitLogo" class="benefit-logo-thumb">
              <img :src="formAdd.benefitLogo" alt="" />
            </div>
            <div class="benefit-logo-upload">
              <upload-pic-input v-model="formAdd.benefitLogo" placeholder="请上传权益 LOGO 图片地址" style="width: 100%" />
            </div>
          </div>
        </FormItem>
        <FormItem label="权益介绍" prop="benefitDesc">
          <Input v-model="formAdd.benefitDesc" type="textarea" :rows="4" maxlength="500" placeholder="请输入权益介绍" />
        </FormItem>
        <FormItem label="启用状态" prop="benefitState">
          <RadioGroup v-model="formAdd.benefitState">
            <Radio label="OPEN">开启</Radio>
            <Radio label="CLOSE">关闭</Radio>
          </RadioGroup>
        </FormItem>
        <FormItem label="排序" prop="benefitSort">
          <InputNumber v-model="formAdd.benefitSort" :min="1" :max="9999" :precision="0" style="width: 220px" />
        </FormItem>
      </Form>
      <div class="benefit-drawer-footer-btns">
        <Button @click="addFlag = false">取消</Button>
        <Button type="primary" :loading="submitAddLoading" @click="submitAdd">提交</Button>
      </div>
    </Drawer>

    <Drawer
      v-model="editFlag"
      title="编辑权益设置"
      width="1120"
      placement="right"
      :z-index="950"
      :mask-closable="false"
      :closable="true"
      scrollable
      class-name="benefit-form-drawer"
    >
      <Form ref="editForm" :model="formEdit" :rules="rulesEdit" :label-width="110">
        <Input v-model="formEdit.id" v-show="false" />
        <FormItem label="权益类型" prop="benefitType">
          <Select
            v-model="formEdit.benefitType"
            clearable
            placeholder="请选择权益类型"
            style="width: 100%"
            @on-change="onEditBenefitTypeChange"
          >
            <Option v-for="item in benefitTypeOptions" :key="item.value" :value="item.value">{{ item.description }}</Option>
          </Select>
        </FormItem>
        <FormItem
          v-show="formEdit.benefitType === 'GIFT_POINT'"
          label="赠送积分"
          prop="giftPoint"
          :required="formEdit.benefitType === 'GIFT_POINT'"
        >
          <InputNumber
            v-model="formEdit.giftPoint"
            :min="0"
            :max="99999"
            :precision="0"
            style="width: 220px"
            placeholder="必填，范围 0-99999"
          />
        </FormItem>
        <FormItem
          v-show="formEdit.benefitType === 'COUPON_PACKAGE'"
          label="赠送优惠券"
          prop="couponPackageRows"
          :required="formEdit.benefitType === 'COUPON_PACKAGE'"
        >
          <div>
            <Button type="dashed" icon="ios-add" class="mb_10" @click="openCouponPicker('edit')">添加优惠券</Button>
            <Table
              border
              size="small"
              :columns="couponPackageTableColumnsEdit"
              :data="formEdit.couponPackageRows"
              no-data-text="请添加优惠券"
            ></Table>
          </div>
        </FormItem>
        <FormItem label="权益名称" prop="benefitName">
          <Input v-model="formEdit.benefitName" maxlength="50" placeholder="请输入权益名称" />
        </FormItem>
        <FormItem label="权益LOGO" prop="benefitLogo">
          <div class="benefit-logo-field">
            <div v-if="formEdit.benefitLogo" class="benefit-logo-thumb">
              <img :src="formEdit.benefitLogo" alt="" />
            </div>
            <div class="benefit-logo-upload">
              <upload-pic-input v-model="formEdit.benefitLogo" placeholder="请上传权益 LOGO 图片地址" style="width: 100%" />
            </div>
          </div>
        </FormItem>
        <FormItem label="权益介绍" prop="benefitDesc">
          <Input v-model="formEdit.benefitDesc" type="textarea" :rows="4" maxlength="500" placeholder="请输入权益介绍" />
        </FormItem>
        <FormItem label="启用状态" prop="benefitState">
          <RadioGroup v-model="formEdit.benefitState">
            <Radio label="OPEN">开启</Radio>
            <Radio label="CLOSE">关闭</Radio>
          </RadioGroup>
        </FormItem>
        <FormItem label="排序" prop="benefitSort">
          <InputNumber v-model="formEdit.benefitSort" :min="1" :max="9999" :precision="0" style="width: 220px" />
        </FormItem>
      </Form>
      <div class="benefit-drawer-footer-btns">
        <Button @click="editFlag = false">取消</Button>
        <Button type="primary" :loading="submitEditLoading" @click="submitEdit">提交</Button>
      </div>
    </Drawer>
  </div>
</template>

<script>
import * as API_Member from "@/api/member.js";
import { getPlatformCoupon } from "@/api/promotion";
import { formatPromotionCouponValidityHtml } from "@/utils/promotions";
import couponTemplate from "@/views/promotions/coupon/coupon.vue";
import uploadPicInput from "@/components/lili/upload-pic-input.vue";

const GIFT_POINT = "GIFT_POINT";
const COUPON_PACKAGE = "COUPON_PACKAGE";

const buildDefaultForm = () => ({
  id: "",
  benefitName: "",
  benefitCode: "",
  benefitType: "",
  benefitLogo: "",
  benefitDesc: "",
  benefitSort: 1,
  benefitState: "OPEN",
  benefitConfig: "",
  /** 仅 UI：赠送积分数量；提交时写入 benefitConfig */
  giftPoint: null,
  /** 仅 UI：券礼包已选优惠券（含展示字段）；提交时写入 benefitConfig.coupons */
  couponPackageRows: [],
});

export default {
  name: "memberBenefit",
  components: {
    uploadPicInput,
    couponTemplate,
  },
  data() {
    return {
      benefitTypeOptions: [],
      loading: false,
      total: 0,
      searchForm: {
        pageNumber: 1,
        pageSize: 20,
      },
      columns: [
        {
          title: "权益类型",
          key: "benefitType",
          width: 132,
          render: (h, params) => {
            const v = params.row.benefitType;
            let text = "-";
            if (v) {
              const opt = this.benefitTypeOptions.find((o) => o.value === v);
              text = opt ? opt.description : v;
            }
            return h(
              "span",
              {
                attrs: { title: text },
                class: "benefit-list-cell-ellipsis benefit-list-cell-ellipsis--type",
              },
              text
            );
          },
        },
        {
          title: "权益名称",
          key: "benefitName",
          width: 188,
          render: (h, params) => {
            const text = params.row.benefitName || "-";
            return h(
              "span",
              {
                attrs: { title: text },
                class: "benefit-list-cell-ellipsis benefit-list-cell-ellipsis--name",
              },
              text
            );
          },
        },
        {
          title: "权益LOGO",
          key: "benefitLogo",
          width: 116,
          align: "center",
          render: (h, params) => {
            const src = params.row.benefitLogo;
            if (!src) return h("span", "-");
            return h(
              "div",
              {
                class: "benefit-logo-thumb benefit-logo-thumb--table",
              },
              [
                h("img", {
                  attrs: { src, alt: "" },
                }),
              ]
            );
          },
        },
        {
          title: "状态",
          key: "benefitState",
          width: 118,
          align: "center",
          render: (h, params) => {
            const row = params.row;
            return h("i-switch", {
              props: {
                value: row.benefitState === "OPEN",
                size: "large",
                loading: !!row._benefitStateLoading,
              },
              on: {
                "on-change": (checked) => {
                  this.onBenefitStateSwitch(row, checked);
                },
              },
            }, [
              h("span", { slot: "open" }, "开启"),
              h("span", { slot: "close" }, "关闭"),
            ]);
          },
        },
        {
          title: "操作",
          key: "action",
          align: "center",
          width: 140,
          render: (h, params) => {
            const linkStyle = {
              color: "#2d8cf0",
              cursor: "pointer",
              textDecoration: "none",
            };
            const sep = h("span", { style: { margin: "0 8px", color: "#dcdee2" } }, "|");
            return h("div", { style: { display: "flex", justifyContent: "center" } }, [
              h("a", { style: linkStyle, on: { click: () => this.openEdit(params.row) } }, "编辑"),
              sep,
              h("a", { style: linkStyle, on: { click: () => this.remove(params.row) } }, "删除"),
            ]);
          },
        },
      ],
      data: [],
      addFlag: false,
      editFlag: false,
      submitAddLoading: false,
      submitEditLoading: false,
      formAdd: buildDefaultForm(),
      formEdit: buildDefaultForm(),
      couponPickerVisible: false,
      couponPickerWhich: "add",
    };
  },
  computed: {
    rulesAdd() {
      return this.buildFormRules("add");
    },
    rulesEdit() {
      return this.buildFormRules("edit");
    },
    couponPackageTableColumns() {
      return this.buildCouponPackageTableColumns("add");
    },
    couponPackageTableColumnsEdit() {
      return this.buildCouponPackageTableColumns("edit");
    },
    /** 传给优惠券列表组件，用于勾选回显（与 coupon-publish 一致用 id） */
    couponPickerSelectedList() {
      const form = this.couponPickerWhich === "add" ? this.formAdd : this.formEdit;
      return (form.couponPackageRows || []).map((r) => ({
        id: r.couponId,
        couponName: r.couponName || "",
      }));
    },
  },
  methods: {
    buildFormRules(which) {
      const formKey = which === "add" ? "formAdd" : "formEdit";
      return {
        benefitType: [{ required: true, message: "请选择权益类型", trigger: "change" }],
        benefitName: [{ required: true, message: "请输入权益名称", trigger: "blur" }],
        benefitLogo: [{ required: true, message: "请配置权益LOGO", trigger: "change" }],
        benefitSort: [{ required: true, type: "number", message: "请输入排序", trigger: "change" }],
        benefitState: [{ required: true, message: "请选择启用状态", trigger: "change" }],
        giftPoint: [
          {
            validator: (rule, value, callback) => {
              const form = this[formKey];
              this.validateGiftPoint(form, value, callback);
            },
            trigger: ["change", "blur"],
          },
        ],
        couponPackageRows: [
          {
            validator: (rule, value, callback) => {
              const form = this[formKey];
              this.validateCouponPackage(form, callback);
            },
            trigger: "change",
          },
        ],
      };
    },
    validateGiftPoint(form, value, callback) {
      if (form.benefitType !== GIFT_POINT) return callback();
      if (value === null || value === undefined || value === "") {
        return callback(new Error("请输入赠送积分"));
      }
      const n = Number(value);
      if (Number.isNaN(n) || n < 0 || n > 99999) {
        return callback(new Error("赠送积分范围为 0-99999"));
      }
      callback();
    },
    validateCouponPackage(form, callback) {
      if (form.benefitType !== COUPON_PACKAGE) return callback();
      const rows = form.couponPackageRows || [];
      if (!rows.length) {
        return callback(new Error("请添加至少一张优惠券"));
      }
      for (let i = 0; i < rows.length; i++) {
        const q = Number(rows[i].quantity);
        if (Number.isNaN(q) || q < 1 || q > 10) {
          return callback(new Error("每张券赠送张数需在 1～10 之间"));
        }
      }
      callback();
    },
    formatCouponFace(row) {
      if (!row) return "-";
      if (row.price !== undefined && row.price !== null && row.price !== "") {
        return `¥${row.price}`;
      }
      if (row.couponDiscount !== undefined && row.couponDiscount !== null && row.couponDiscount !== "") {
        return `${row.couponDiscount}折`;
      }
      return "-";
    },
    formatCouponValidity(row) {
      return formatPromotionCouponValidityHtml(row);
    },
    buildCouponDisplayRow(detail, quantity) {
      const qty = Math.min(10, Math.max(1, Number(quantity) || 1));
      return {
        couponId: detail.id,
        quantity: qty,
        couponName: detail.couponName || "",
        faceValueLabel: this.formatCouponFace(detail),
        validRange: this.formatCouponValidity(detail),
      };
    },
    buildCouponPackageTableColumns(which) {
      const formKey = which === "add" ? "formAdd" : "formEdit";
      const linkStyle = { color: "#2d8cf0", cursor: "pointer" };
      return [
        { title: "优惠券名称", key: "couponName", minWidth: 100, tooltip: true },
        {
          title: "有效期",
          minWidth: 100,
          render: (h, p) =>
            h("span", {
              domProps: { innerHTML: p.row.validRange || "-" },
            }),
        },
        { title: "面额", key: "faceValueLabel", minWidth: 100 },
        {
          title: "赠送张数",
          key: "quantity",
          width: 150,
          render: (h, params) =>
            h("InputNumber", {
              props: {
                min: 1,
                max: 10,
                precision: 0,
                value: params.row.quantity,
              },
              style: { width: "100px" },
              on: {
                "on-change": (val) => {
                  this.$set(this[formKey].couponPackageRows[params.index], "quantity", val);
                  this.$nextTick(() => {
                    const ref = which === "add" ? this.$refs.addForm : this.$refs.editForm;
                    if (ref) ref.validateField("couponPackageRows");
                  });
                },
              },
            }),
        },
        {
          title: "操作",
          key: "action",
          width: 90,
          align: "center",
          render: (h, params) =>
            h(
              "a",
              {
                style: linkStyle,
                on: {
                  click: () => {
                    this.removeCouponRow(which, params.index);
                  },
                },
              },
              "删除"
            ),
        },
      ];
    },
    /** 构造 benefitConfig JSON 字符串 */
    buildBenefitConfigString(slice) {
      const { benefitType, giftPoint, couponPackageRows } = slice;
      if (benefitType === GIFT_POINT) {
        return JSON.stringify({ giftPoint: Number(giftPoint) });
      }
      if (benefitType === COUPON_PACKAGE) {
        const coupons = (couponPackageRows || []).map((r) => ({
          couponId: String(r.couponId),
          quantity: Math.min(10, Math.max(1, Number(r.quantity) || 1)),
        }));
        return JSON.stringify({ coupons });
      }
      return "";
    },
    /** 从详情 benefitConfig 解析赠送积分，解析失败时返回 null */
    parseGiftPointFromConfig(benefitType, benefitConfigStr) {
      if (benefitType !== GIFT_POINT || !benefitConfigStr) return null;
      try {
        const o = JSON.parse(benefitConfigStr);
        if (o && typeof o.giftPoint !== "undefined") {
          const n = Number(o.giftPoint);
          return Number.isNaN(n) ? null : n;
        }
      } catch (e) {
        /* ignore */
      }
      return null;
    },
    onAddBenefitTypeChange(val) {
      if (val !== GIFT_POINT) {
        this.formAdd.giftPoint = null;
      }
      if (val !== COUPON_PACKAGE) {
        this.formAdd.couponPackageRows = [];
      }
      this.$nextTick(() => {
        if (this.$refs.addForm && val !== GIFT_POINT) {
          this.$refs.addForm.validateField("giftPoint");
        }
        if (this.$refs.addForm && val !== COUPON_PACKAGE) {
          this.$refs.addForm.validateField("couponPackageRows");
        }
      });
    },
    onEditBenefitTypeChange(val) {
      if (val !== GIFT_POINT) {
        this.formEdit.giftPoint = null;
      }
      if (val !== COUPON_PACKAGE) {
        this.formEdit.couponPackageRows = [];
      }
      this.$nextTick(() => {
        if (this.$refs.editForm && val !== GIFT_POINT) {
          this.$refs.editForm.validateField("giftPoint");
        }
        if (this.$refs.editForm && val !== COUPON_PACKAGE) {
          this.$refs.editForm.validateField("couponPackageRows");
        }
      });
    },
    parseCouponsFromConfig(str) {
      if (!str) return [];
      try {
        const o = JSON.parse(str);
        if (o && Array.isArray(o.coupons)) {
          return o.coupons.map((c) => ({
            couponId: c.couponId,
            quantity: c.quantity,
          }));
        }
      } catch (e) {
        /* ignore */
      }
      return [];
    },
    /** 与添加时 formatCouponFace 一致；仅有 faceValueText 时去掉「减免」前缀 */
    normalizeCouponFaceFromDetail(item) {
      let face = this.formatCouponFace(item);
      if (face !== "-") return face;
      const raw = item.faceValueText;
      if (raw == null || raw === "") return "-";
      return String(raw)
        .replace(/^减免现金\s*/, "")
        .replace(/^减免\s*/, "")
        .trim() || "-";
    },
    /** 管理端详情 couponItems → 表格行（面额展示与添加一致） */
    mapCouponItemsToPackageRows(items) {
      if (!Array.isArray(items)) return [];
      return items.map((item) => {
        const face = this.normalizeCouponFaceFromDetail(item);
        const validHtml = item.validityText
          ? String(item.validityText).replace(/\n/g, "<br/>")
          : "-";
        return {
          couponId: item.couponId,
          quantity: Math.min(10, Math.max(1, Number(item.quantity) || 1)),
          couponName: item.couponName || "",
          faceValueLabel: face,
          validRange: validHtml,
        };
      });
    },
    async hydrateCouponRowsForEdit(snippets) {
      const rows = [];
      for (const s of snippets) {
        const cid = s.couponId;
        const qty = s.quantity;
        try {
          const res = await getPlatformCoupon(cid);
          if (res && res.success && res.result) {
            rows.push(this.buildCouponDisplayRow(res.result, qty));
          } else {
            rows.push({
              couponId: cid,
              quantity: Math.min(10, Math.max(1, Number(qty) || 1)),
              couponName: String(cid),
              faceValueLabel: "-",
              validRange: "-",
            });
          }
        } catch (e) {
          rows.push({
            couponId: cid,
            quantity: Math.min(10, Math.max(1, Number(qty) || 1)),
            couponName: String(cid),
            faceValueLabel: "-",
            validRange: "-",
          });
        }
      }
      this.$set(this.formEdit, "couponPackageRows", rows);
    },
    handleCouponPickerClose() {
      this.couponPickerVisible = false;
    },
    openCouponPicker(which) {
      this.couponPickerWhich = which;
      this.couponPickerVisible = true;
    },
    /** 与 coupon-publish `selectedCoupon`：表格多选变更时同步到券礼包配置 */
    onCouponTemplateSelected(selectedRows) {
      const which = this.couponPickerWhich;
      const form = which === "add" ? this.formAdd : this.formEdit;
      const refName = which === "add" ? "addForm" : "editForm";
      const list = selectedRows || [];
      const rows = list.map((row) => {
        const existing = (form.couponPackageRows || []).find((r) => String(r.couponId) === String(row.id));
        const qty = existing ? existing.quantity : 1;
        return this.buildCouponDisplayRow(row, qty);
      });
      this.$set(form, "couponPackageRows", rows);
      this.$nextTick(() => {
        const ref = this.$refs[refName];
        if (ref) ref.validateField("couponPackageRows");
      });
    },
    removeCouponRow(which, index) {
      const form = which === "add" ? this.formAdd : this.formEdit;
      const refName = which === "add" ? "addForm" : "editForm";
      form.couponPackageRows.splice(index, 1);
      this.$nextTick(() => {
        const ref = this.$refs[refName];
        if (ref) ref.validateField("couponPackageRows");
      });
    },
    init() {
      this.loadBenefitTypes();
      this.getData();
    },
    loadBenefitTypes() {
      API_Member.getMemberBenefitTypes().then((res) => {
        if (res && res.success && Array.isArray(res.result)) {
          this.benefitTypeOptions = res.result;
        } else {
          this.benefitTypeOptions = [];
        }
      });
    },
    changePage(page) {
      this.searchForm.pageNumber = page;
      this.getData();
    },
    changePageSize(size) {
      this.searchForm.pageSize = size;
      this.searchForm.pageNumber = 1;
      this.getData();
    },
    getData() {
      this.loading = true;
      const params = { ...this.searchForm };
      API_Member.getMemberBenefitByPage(params).then((res) => {
        this.loading = false;
        if (res && res.success && res.result) {
          this.data = Array.isArray(res.result.records) ? res.result.records : [];
          this.total = Number(res.result.total) || 0;
        } else {
          this.data = [];
          this.total = 0;
        }
      });
    },
    openAdd() {
      this.addFlag = true;
      this.submitAddLoading = false;
      this.$nextTick(() => {
        if (this.$refs.addForm) this.$refs.addForm.resetFields();
        this.formAdd = buildDefaultForm();
      });
    },
    submitAdd() {
      if (!this.$refs.addForm) {
        this.$Message.warning("表单未就绪，请稍后重试");
        return;
      }
      this.$refs.addForm.validate((valid) => {
        if (!valid) return;
        this.submitAddLoading = true;
        const { giftPoint, couponPackageRows, ...rest } = this.formAdd;
        const payload = {
          ...rest,
          benefitConfig: this.buildBenefitConfigString({
            benefitType: this.formAdd.benefitType,
            giftPoint,
            couponPackageRows,
          }),
        };
        API_Member.addMemberBenefit(payload).then((res) => {
          this.submitAddLoading = false;
          if (res && res.success) {
            this.$Message.success("添加成功");
            this.addFlag = false;
            this.getData();
          } else if (res && res.message) {
            this.$Message.error(res.message);
          } else {
            this.$Message.error("添加失败");
          }
        }).catch(() => {
          this.submitAddLoading = false;
          this.$Message.error("网络异常，请稍后重试");
        });
      });
    },
    openEdit(row) {
      this.editFlag = true;
      this.submitEditLoading = false;
      this.$nextTick(() => {
        if (this.$refs.editForm) this.$refs.editForm.resetFields();
      });
      API_Member.getMemberBenefit(row.id).then((res) => {
        if (res && res.success && res.result) {
          const raw = res.result;
          /** 新接口：{ benefit, couponItems }；旧接口：扁平 MemberBenefit */
          const detail = raw.benefit != null ? raw.benefit : raw;
          const couponItems = raw.couponItems;
          const bt = detail.benefitType || "";
          const parsed = this.parseGiftPointFromConfig(bt, detail.benefitConfig || "");
          const couponSnippets = this.parseCouponsFromConfig(detail.benefitConfig || "");

          let couponRows = [];
          if (bt === COUPON_PACKAGE && Array.isArray(couponItems) && couponItems.length) {
            couponRows = this.mapCouponItemsToPackageRows(couponItems);
          }

          this.formEdit = {
            id: detail.id || row.id || "",
            benefitName: detail.benefitName || "",
            benefitCode: detail.benefitCode || "",
            benefitType: bt,
            benefitLogo: detail.benefitLogo || "",
            benefitDesc: detail.benefitDesc || "",
            benefitSort: Number(detail.benefitSort) > 0 ? Number(detail.benefitSort) : 1,
            benefitState: detail.benefitState || "OPEN",
            benefitConfig: detail.benefitConfig || "",
            giftPoint: bt === GIFT_POINT ? (parsed !== null ? parsed : null) : null,
            couponPackageRows: couponRows,
          };

          if (bt === COUPON_PACKAGE && couponRows.length === 0 && couponSnippets.length) {
            this.hydrateCouponRowsForEdit(couponSnippets);
          }
        }
      });
    },
    submitEdit() {
      if (!this.$refs.editForm) {
        this.$Message.warning("表单未就绪，请稍后重试");
        return;
      }
      this.$refs.editForm.validate((valid) => {
        if (!valid) return;
        this.submitEditLoading = true;
        const { id, giftPoint, couponPackageRows, ...rest } = this.formEdit;
        const payload = {
          ...rest,
          benefitConfig: this.buildBenefitConfigString({
            benefitType: this.formEdit.benefitType,
            giftPoint,
            couponPackageRows,
          }),
        };
        API_Member.updateMemberBenefit(id, payload).then((res) => {
          this.submitEditLoading = false;
          if (res && res.success) {
            this.$Message.success("修改成功");
            this.editFlag = false;
            this.getData();
          } else if (res && res.message) {
            this.$Message.error(res.message);
          } else {
            this.$Message.error("修改失败");
          }
        }).catch(() => {
          this.submitEditLoading = false;
          this.$Message.error("网络异常，请稍后重试");
        });
      });
    },
    onBenefitStateSwitch(row, checked) {
      const nextState = checked ? "OPEN" : "CLOSE";
      const prevState = row.benefitState;
      if (nextState === prevState) return;
      const text = checked ? "开启" : "关闭";
      this.$Modal.confirm({
        title: "提示",
        content: `<p>确定${text}该客户权益？</p>`,
        onOk: () => {
          this.$set(row, "_benefitStateLoading", true);
          return API_Member.updateMemberBenefitState(row.id, nextState)
            .then((res) => {
              this.$set(row, "_benefitStateLoading", false);
              if (res && res.success) {
                this.$Message.success(`${text}成功`);
                this.$set(row, "benefitState", nextState);
              } else {
                this.getData();
              }
            })
            .catch(() => {
              this.$set(row, "_benefitStateLoading", false);
            });
        },
      });
    },
    remove(row) {
      this.$Modal.confirm({
        title: "提示",
        content: "<p>确定删除该客户权益？</p>",
        onOk: () => {
          API_Member.deleteMemberBenefit(row.id).then((res) => {
            if (res && res.success) {
              this.$Message.success("删除成功");
              this.getData();
            } else if (res && res.message) {
              this.$Message.error(res.message);
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

<style lang="scss" scoped>
.benefit-drawer-footer-btns {
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid #e8eaec;
  text-align: right;
}
.benefit-drawer-footer-btns .ivu-btn + .ivu-btn {
  margin-left: 8px;
}

</style>

<!--
  权益 LOGO 缩略图：固定 100×100。
  不使用 .member-benefit 前缀：Modal 默认 transfer 到 body，弹窗内节点不在 .member-benefit 下。
  Table 列 render 生成的节点在子组件内，同样用非 scoped。
-->
<style lang="scss">
.benefit-logo-thumb {
  width: 100px;
  height: 100px;
  min-width: 100px;
  min-height: 100px;
  max-width: 100px;
  max-height: 100px;
  flex-shrink: 0;
  border: 1px solid #dcdee2;
  border-radius: 4px;
  background: #f8f8f9;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
}
.benefit-logo-thumb img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
}
.benefit-logo-thumb--table {
  margin: 0 auto;
}

/* 权益列表：固定类型/名称列宽并省略过长文案（悬浮 title 可看全文） */
.member-benefit .benefit-list-table table {
  table-layout: fixed;
}
.member-benefit .benefit-list-cell-ellipsis {
  display: inline-block;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  vertical-align: middle;
}
.member-benefit .benefit-list-cell-ellipsis--type {
  max-width: 118px;
}
.member-benefit .benefit-list-cell-ellipsis--name {
  max-width: 172px;
}

/* 列表不出现列与列之间的竖线（保留行间分隔） */
.member-benefit .benefit-list-table--no-vertical-borders .ivu-table th,
.member-benefit .benefit-list-table--no-vertical-borders .ivu-table td {
  border-right: none !important;
}
</style>

<style lang="scss" scoped>
.benefit-logo-field {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  flex-wrap: wrap;
}
.benefit-logo-upload {
  flex: 1;
  min-width: 200px;
}
</style>
