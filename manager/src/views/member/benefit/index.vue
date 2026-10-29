<template>

  <div class="search member-benefit">

    <el-card shadow="never" class="table-card">

      <template #header>

        <div class="card-header-bar">

          <div class="header-title">

            <span>客户权益列表</span>

          </div>

          <div class="header-actions">

            <el-button size="small" @click="getData">刷新</el-button>

            <el-button type="primary" size="small" @click="openAdd">添加权益设置</el-button>

          </div>

        </div>

      </template>



      <div class="benefit-list-panel">

        <el-table

          v-loading="loading"

          stripe

          border

          :data="data"

          empty-text="暂无数据"

          class="custom-benefit-table"

          style="width: 100%"

        >

          <!-- 权益ID -->

          <el-table-column prop="id" label="权益ID" min-width="190" show-overflow-tooltip />



          <!-- 权益LOGO -->

          <el-table-column label="权益LOGO" width="86" align="center">

            <template #default="{ row }">

              <div v-if="row && row.benefitLogo" class="logo-thumb-wrapper">

                <el-image

                  :src="row.benefitLogo"

                  fit="contain"

                  preview-teleported

                  :preview-src-list="[row.benefitLogo]"

                  class="logo-thumb-img"

                >

                  <template #error>

                    <div class="logo-slot">无图</div>

                  </template>

                </el-image>

              </div>

              <span v-else>-</span>

            </template>

          </el-table-column>



          <!-- 权益名称 -->

          <el-table-column prop="benefitName" label="权益名称" min-width="180" show-overflow-tooltip />



          <!-- 权益编码 -->

          <el-table-column prop="benefitCode" label="权益编码" min-width="140" show-overflow-tooltip />



          <!-- 权益类型 -->

          <el-table-column label="权益类型" width="140" align="center">

            <template #default="{ row }">

              {{ row ? benefitTypeLabel(row.benefitType) : "-" }}

            </template>

          </el-table-column>



          <!-- 排序 -->

          <el-table-column prop="benefitSort" label="排序" width="80" align="center" />



          <!-- 状态 -->

          <el-table-column label="状态" width="110" align="center">

            <template #default="{ row }">

              <el-switch

                v-if="row"

                :model-value="row.benefitState === 'OPEN'"

                inline-prompt

                active-text="开启"

                inactive-text="关闭"

                :loading="!!row._benefitStateLoading"

                @change="(checked) => onBenefitStateSwitch(row, checked)"

              />

            </template>

          </el-table-column>



          <!-- 操作 -->

          <el-table-column label="操作" width="140" align="center" fixed="right">

            <template #default="{ row }">

              <template v-if="row">

                <a class="link-text" @click="openEdit(row)">编辑</a>

                <span class="op-split">|</span>

                <a class="link-text" @click="remove(row)">删除</a>

              </template>

            </template>

          </el-table-column>

        </el-table>

      </div>



      <div class="pagination-wrap mt_10">

        <el-pagination

          v-model:current-page="searchForm.pageNumber"

          v-model:page-size="searchForm.pageSize"

          :total="total"

          :page-sizes="[20, 30, 50]"

          layout="total, sizes, prev, pager, next, jumper"

          size="small"

          @current-change="changePage"

          @size-change="changePageSize"

        />

      </div>

    </el-card>



    <el-dialog

      v-model="couponPickerVisible"

      title="选择优惠券"

      width="80%"

      append-to-body

      modal-class="member-benefit-coupon-picker-modal"

      :close-on-click-modal="false"

      destroy-on-close

      @close="handleCouponPickerClose"

    >

      <couponTemplate

        v-if="couponPickerVisible"

        ref="couponPicker"

        manualConfirm

        :selectedList="couponPickerSelectedList"

        getType="ACTIVITY"

        promotionStatus="START"

      />

      <template #footer>

        <el-button @click="couponPickerVisible = false">取消</el-button>

        <el-button type="primary" @click="confirmCouponPicker">确定</el-button>

      </template>

    </el-dialog>



    <el-drawer

      v-model="addFlag"

      title="添加权益设置"

      size="1120px"

      direction="rtl"

      :z-index="950"

      :close-on-click-modal="false"

      append-to-body

      destroy-on-close

      class="benefit-form-drawer"

    >

      <el-form ref="addForm" :model="formAdd" :rules="rulesAdd" label-width="110px">

        <el-form-item label="权益类型" prop="benefitType">

          <el-select

            v-model="formAdd.benefitType"

            clearable

            placeholder="请选择权益类型"

            style="width: 100%"

            @change="onAddBenefitTypeChange"

          >

            <el-option

              v-for="item in benefitTypeOptions"

              :key="item.value"

              :value="item.value"

              :label="item.description"

            />

          </el-select>

        </el-form-item>

        <el-form-item

          v-show="formAdd.benefitType === 'GIFT_POINT'"

          label="赠送积分"

          prop="giftPoint"

          :required="formAdd.benefitType === 'GIFT_POINT'"

        >

          <el-input-number

            v-model="formAdd.giftPoint"

            :min="0"

            :max="99999"

            :precision="0"

            style="width: 220px"

            placeholder="必填，范围 0-99999"

          />

        </el-form-item>

        <el-form-item

          v-show="formAdd.benefitType === 'COUPON_PACKAGE'"

          class="benefit-coupon-form-item"

          label="赠送优惠券"

          prop="couponPackageRows"

          :required="formAdd.benefitType === 'COUPON_PACKAGE'"

        >

          <div class="benefit-coupon-field">

            <el-button plain class="mb_10" @click="openCouponPicker('add')">添加优惠券</el-button>

            <el-table

              border

              size="small"

              class="benefit-coupon-table"

              :data="formAdd.couponPackageRows"

              empty-text="请添加优惠券"

            >

              <el-table-column prop="couponName" label="优惠券名称" min-width="180" show-overflow-tooltip />

              <el-table-column label="有效期" min-width="280">

                <template #default="{ row }">

                  <span v-if="row" v-html="row.validRange || '-'" />

                </template>

              </el-table-column>

              <el-table-column prop="faceValueLabel" label="面额" min-width="100" />

              <el-table-column label="赠送张数" width="150">

                <template #default="{ row, $index }">

                  <el-input-number

                    v-if="row"

                    :model-value="row.quantity"

                    :min="1"

                    :max="10"

                    :precision="0"

                    style="width: 100px"

                    @change="(val) => onCouponQuantityChange('add', $index, val)"

                  />

                </template>

              </el-table-column>

              <el-table-column label="操作" width="90" align="center">

                <template #default="{ row, $index }">

                  <a v-if="row" class="link-text" @click="removeCouponRow('add', $index)">删除</a>

                </template>

              </el-table-column>

            </el-table>

          </div>

        </el-form-item>

        <el-form-item label="权益名称" prop="benefitName">

          <el-input v-model="formAdd.benefitName" maxlength="50" placeholder="请输入权益名称" />

        </el-form-item>

        <el-form-item label="权益LOGO" prop="benefitLogo">

          <div class="benefit-logo-field">

            <div v-if="formAdd.benefitLogo" class="benefit-logo-thumb">

              <img :src="formAdd.benefitLogo" alt="" />

            </div>

            <div class="benefit-logo-upload">

              <upload-pic-input v-model="formAdd.benefitLogo" placeholder="请上传权益 LOGO 图片地址" style="width: 100%" />

            </div>

          </div>

        </el-form-item>

        <el-form-item label="权益介绍" prop="benefitDesc">

          <el-input v-model="formAdd.benefitDesc" type="textarea" :rows="4" maxlength="500" placeholder="请输入权益介绍" />

        </el-form-item>

        <el-form-item label="启用状态" prop="benefitState">

          <el-radio-group v-model="formAdd.benefitState">

            <el-radio value="OPEN">开启</el-radio>

            <el-radio value="CLOSE">关闭</el-radio>

          </el-radio-group>

        </el-form-item>

        <el-form-item label="排序" prop="benefitSort">

          <el-input-number v-model="formAdd.benefitSort" :min="1" :max="9999" :precision="0" style="width: 220px" />

        </el-form-item>

      </el-form>

      <div class="benefit-drawer-footer-btns">

        <el-button @click="addFlag = false">取消</el-button>

        <el-button type="primary" :loading="submitAddLoading" @click="submitAdd">提交</el-button>

      </div>

    </el-drawer>



    <el-drawer

      v-model="editFlag"

      title="编辑权益设置"

      size="1120px"

      direction="rtl"

      :z-index="950"

      :close-on-click-modal="false"

      append-to-body

      destroy-on-close

      class="benefit-form-drawer"

    >

      <el-form ref="editForm" :model="formEdit" :rules="rulesEdit" label-width="110px">

        <el-input v-model="formEdit.id" v-show="false" />

        <el-form-item label="权益类型" prop="benefitType">

          <el-select

            v-model="formEdit.benefitType"

            clearable

            placeholder="请选择权益类型"

            style="width: 100%"

            @change="onEditBenefitTypeChange"

          >

            <el-option

              v-for="item in benefitTypeOptions"

              :key="item.value"

              :value="item.value"

              :label="item.description"

            />

          </el-select>

        </el-form-item>

        <el-form-item

          v-show="formEdit.benefitType === 'GIFT_POINT'"

          label="赠送积分"

          prop="giftPoint"

          :required="formEdit.benefitType === 'GIFT_POINT'"

        >

          <el-input-number

            v-model="formEdit.giftPoint"

            :min="0"

            :max="99999"

            :precision="0"

            style="width: 220px"

            placeholder="必填，范围 0-99999"

          />

        </el-form-item>

        <el-form-item

          v-show="formEdit.benefitType === 'COUPON_PACKAGE'"

          class="benefit-coupon-form-item"

          label="赠送优惠券"

          prop="couponPackageRows"

          :required="formEdit.benefitType === 'COUPON_PACKAGE'"

        >

          <div class="benefit-coupon-field">

            <el-button plain class="mb_10" @click="openCouponPicker('edit')">添加优惠券</el-button>

            <el-table

              border

              size="small"

              class="benefit-coupon-table"

              :data="formEdit.couponPackageRows"

              empty-text="请添加优惠券"

            >

              <el-table-column prop="couponName" label="优惠券名称" min-width="180" show-overflow-tooltip />

              <el-table-column label="有效期" min-width="280">

                <template #default="{ row }">

                  <span v-if="row" v-html="row.validRange || '-'" />

                </template>

              </el-table-column>

              <el-table-column prop="faceValueLabel" label="面额" min-width="100" />

              <el-table-column label="赠送张数" width="150">

                <template #default="{ row, $index }">

                  <el-input-number

                    v-if="row"

                    :model-value="row.quantity"

                    :min="1"

                    :max="10"

                    :precision="0"

                    style="width: 100px"

                    @change="(val) => onCouponQuantityChange('edit', $index, val)"

                  />

                </template>

              </el-table-column>

              <el-table-column label="操作" width="90" align="center">

                <template #default="{ row, $index }">

                  <a v-if="row" class="link-text" @click="removeCouponRow('edit', $index)">删除</a>

                </template>

              </el-table-column>

            </el-table>

          </div>

        </el-form-item>

        <el-form-item label="权益名称" prop="benefitName">

          <el-input v-model="formEdit.benefitName" maxlength="50" placeholder="请输入权益名称" />

        </el-form-item>

        <el-form-item label="权益LOGO" prop="benefitLogo">

          <div class="benefit-logo-field">

            <div v-if="formEdit.benefitLogo" class="benefit-logo-thumb">

              <img :src="formEdit.benefitLogo" alt="" />

            </div>

            <div class="benefit-logo-upload">

              <upload-pic-input v-model="formEdit.benefitLogo" placeholder="请上传权益 LOGO 图片地址" style="width: 100%" />

            </div>

          </div>

        </el-form-item>

        <el-form-item label="权益介绍" prop="benefitDesc">

          <el-input v-model="formEdit.benefitDesc" type="textarea" :rows="4" maxlength="500" placeholder="请输入权益介绍" />

        </el-form-item>

        <el-form-item label="启用状态" prop="benefitState">

          <el-radio-group v-model="formEdit.benefitState">

            <el-radio value="OPEN">开启</el-radio>

            <el-radio value="CLOSE">关闭</el-radio>

          </el-radio-group>

        </el-form-item>

        <el-form-item label="排序" prop="benefitSort">

          <el-input-number v-model="formEdit.benefitSort" :min="1" :max="9999" :precision="0" style="width: 220px" />

        </el-form-item>

      </el-form>

      <div class="benefit-drawer-footer-btns">

        <el-button @click="editFlag = false">取消</el-button>

        <el-button type="primary" :loading="submitEditLoading" @click="submitEdit">提交</el-button>

      </div>

    </el-drawer>

  </div>

</template>



<script setup>

import { ref, computed, nextTick, onMounted } from "vue";

import * as API_Member from "@/api/member.js";

import { getPlatformCoupon } from "@/api/promotion";

import { formatPromotionCouponValidityHtml } from "@/utils/promotions";

import couponTemplate from "@/views/promotions/coupon/coupon.vue";

import uploadPicInput from "@/components/lili/upload-pic-input.vue";

import { ElMessage, ElMessageBox } from "element-plus";



defineOptions({ name: "memberBenefit" });



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

  giftPoint: null,

  couponPackageRows: [],

});



// 模板 ref（couponPicker 为优惠券选择组件，addForm/editForm 为表单）

const couponPicker = ref(null);

const addForm = ref(null);

const editForm = ref(null);

// 动态 ref 映射表（原 this.$refs[refName]）

const formRefs = { addForm, editForm };



const benefitTypeOptions = ref([]);

const loading = ref(false);

const total = ref(0);

const searchForm = ref({

  pageNumber: 1,

  pageSize: 20,

});

const data = ref([]);

const addFlag = ref(false);

const editFlag = ref(false);

const submitAddLoading = ref(false);

const submitEditLoading = ref(false);

const formAdd = ref(buildDefaultForm());

const formEdit = ref(buildDefaultForm());

const couponPickerVisible = ref(false);

const couponPickerWhich = ref("add");



// 动态表单映射表（原 this[formKey]）

const formMap = { formAdd, formEdit };



const rulesAdd = computed(() => buildFormRules("add"));

const rulesEdit = computed(() => buildFormRules("edit"));

const couponPickerSelectedList = computed(() => {

  const form = couponPickerWhich.value === "add" ? formAdd.value : formEdit.value;

  return (form.couponPackageRows || []).map((r) => ({

    id: r.couponId,

    couponName: r.couponName || "",

  }));

});



function benefitTypeLabel(v) {

  if (!v) return "-";

  const opt = benefitTypeOptions.value.find((o) => o.value === v);

  return opt ? opt.description : v;

}

function touchFormField(refName, field) {

  nextTick(() => {

    const ref = formRefs[refName]?.value;

    if (ref && typeof ref.validateField === "function") {

      // validateField rejects on failure; catch to avoid dev-server [object Object] overlay

      ref.validateField(field, () => {});

    }

  });

}

function onCouponQuantityChange(which, index, val) {

  const formKey = which === "add" ? "formAdd" : "formEdit";

  const refName = which === "add" ? "addForm" : "editForm";

  formMap[formKey].value.couponPackageRows[index].quantity = val;

  touchFormField(refName, "couponPackageRows");

}

function buildFormRules(which) {

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

          const form = formMap[formKey].value;

          validateGiftPoint(form, value, callback);

        },

        trigger: ["change", "blur"],

      },

    ],

    couponPackageRows: [

      {

        validator: (rule, value, callback) => {

          const form = formMap[formKey].value;

          validateCouponPackage(form, callback);

        },

        trigger: "change",

      },

    ],

  };

}

function validateGiftPoint(form, value, callback) {

  if (form.benefitType !== GIFT_POINT) return callback();

  if (value === null || value === undefined || value === "") {

    return callback(new Error("请输入赠送积分"));

  }

  const n = Number(value);

  if (Number.isNaN(n) || n < 0 || n > 99999) {

    return callback(new Error("赠送积分范围为 0-99999"));

  }

  callback();

}

function validateCouponPackage(form, callback) {

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

}

function formatCouponFace(row) {

  if (!row) return "-";

  if (row.price !== undefined && row.price !== null && row.price !== "") {

    return `¥${row.price}`;

  }

  if (row.couponDiscount !== undefined && row.couponDiscount !== null && row.couponDiscount !== "") {

    return `${row.couponDiscount}折`;

  }

  return "-";

}

function formatCouponValidity(row) {

  return formatPromotionCouponValidityHtml(row);

}

function buildCouponDisplayRow(detail, quantity) {

  const qty = Math.min(10, Math.max(1, Number(quantity) || 1));

  return {

    couponId: detail.id,

    quantity: qty,

    couponName: detail.couponName || "",

    faceValueLabel: formatCouponFace(detail),

    validRange: formatCouponValidity(detail),

  };

}

function buildBenefitConfigString(slice) {

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

}

function parseGiftPointFromConfig(benefitType, benefitConfigStr) {

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

}

function onAddBenefitTypeChange(val) {

  if (val !== GIFT_POINT) {

    formAdd.value.giftPoint = null;

  }

  if (val !== COUPON_PACKAGE) {

    formAdd.value.couponPackageRows = [];

  }

  if (addForm.value && val !== GIFT_POINT) {

    touchFormField("addForm", "giftPoint");

  }

  if (addForm.value && val !== COUPON_PACKAGE) {

    touchFormField("addForm", "couponPackageRows");

  }

}

function onEditBenefitTypeChange(val) {

  if (val !== GIFT_POINT) {

    formEdit.value.giftPoint = null;

  }

  if (val !== COUPON_PACKAGE) {

    formEdit.value.couponPackageRows = [];

  }

  if (editForm.value && val !== GIFT_POINT) {

    touchFormField("editForm", "giftPoint");

  }

  if (editForm.value && val !== COUPON_PACKAGE) {

    touchFormField("editForm", "couponPackageRows");

  }

}

function parseCouponsFromConfig(str) {

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

}

function normalizeCouponFaceFromDetail(item) {

  let face = formatCouponFace(item);

  if (face !== "-") return face;

  const raw = item.faceValueText;

  if (raw == null || raw === "") return "-";

  return String(raw)

    .replace(/^减免现金\s*/, "")

    .replace(/^减免\s*/, "")

    .trim() || "-";

}

function mapCouponItemsToPackageRows(items) {

  if (!Array.isArray(items)) return [];

  return items.map((item) => {

    const face = normalizeCouponFaceFromDetail(item);

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

}

async function hydrateCouponRowsForEdit(snippets) {

  const rows = [];

  for (const s of snippets) {

    const cid = s.couponId;

    const qty = s.quantity;

    try {

      const res = await getPlatformCoupon(cid);

      if (res && res.success && res.result) {

        rows.push(buildCouponDisplayRow(res.result, qty));

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

  formEdit.value.couponPackageRows = rows;

}

function handleCouponPickerClose() {

  couponPickerVisible.value = false;

}

function openCouponPicker(which) {

  couponPickerWhich.value = which;

  couponPickerVisible.value = true;

}

function confirmCouponPicker() {

  const list = couponPicker.value?.getSelection?.() || [];

  if (!list.length) {

    ElMessage.warning("请至少选择一张优惠券");

    return;

  }

  onCouponTemplateSelected(list);

  couponPickerVisible.value = false;

}

function onCouponTemplateSelected(selectedRows) {

  const which = couponPickerWhich.value;

  const form = which === "add" ? formAdd.value : formEdit.value;

  const refName = which === "add" ? "addForm" : "editForm";

  const list = selectedRows || [];

  const rows = list.map((row) => {

    const existing = (form.couponPackageRows || []).find((r) => String(r.couponId) === String(row.id));

    const qty = existing ? existing.quantity : 1;

    return buildCouponDisplayRow(row, qty);

  });

  form.couponPackageRows = rows;

  touchFormField(refName, "couponPackageRows");

}

function removeCouponRow(which, index) {

  const form = which === "add" ? formAdd.value : formEdit.value;

  const refName = which === "add" ? "addForm" : "editForm";

  form.couponPackageRows.splice(index, 1);

  touchFormField(refName, "couponPackageRows");

}

function init() {

  loadBenefitTypes();

  getData();

}

function loadBenefitTypes() {

  API_Member.getMemberBenefitTypes().then((res) => {

    if (res && res.success && Array.isArray(res.result)) {

      benefitTypeOptions.value = res.result;

    } else {

      benefitTypeOptions.value = [];

    }

  });

}

function changePage(page) {

  searchForm.value.pageNumber = page;

  getData();

}

function changePageSize(size) {

  searchForm.value.pageSize = size;

  searchForm.value.pageNumber = 1;

  getData();

}

function getData() {

  loading.value = true;

  const params = { ...searchForm.value };

  API_Member.getMemberBenefitByPage(params).then((res) => {

    loading.value = false;

    if (res && res.success && res.result) {

      data.value = Array.isArray(res.result.records) ? res.result.records : [];

      total.value = Number(res.result.total) || 0;

    } else {

      data.value = [];

      total.value = 0;

    }

  });

}

function openAdd() {

  addFlag.value = true;

  submitAddLoading.value = false;

  nextTick(() => {

    if (addForm.value) addForm.value.resetFields();

    formAdd.value = buildDefaultForm();

  });

}

function submitAdd() {

  if (!addForm.value) {

    ElMessage.warning("表单未就绪，请稍后重试");

    return;

  }

  addForm.value.validate((valid) => {

    if (!valid) return;

    submitAddLoading.value = true;

    const { giftPoint, couponPackageRows, ...rest } = formAdd.value;

    const payload = {

      ...rest,

      benefitConfig: buildBenefitConfigString({

        benefitType: formAdd.value.benefitType,

        giftPoint,

        couponPackageRows,

      }),

    };

    API_Member.addMemberBenefit(payload).then((res) => {

      submitAddLoading.value = false;

      if (res && res.success) {

        ElMessage.success("添加成功");

        addFlag.value = false;

        getData();

      } else if (res && res.message) {

        ElMessage.error(res.message);

      } else {

        ElMessage.error("添加失败");

      }

    }).catch(() => {

      submitAddLoading.value = false;

      ElMessage.error("网络异常，请稍后重试");

    });

  });

}

function openEdit(row) {

  editFlag.value = true;

  submitEditLoading.value = false;

  nextTick(() => {

    if (editForm.value) editForm.value.resetFields();

  });

  API_Member.getMemberBenefit(row.id).then((res) => {

    if (res && res.success && res.result) {

      const raw = res.result;

      const detail = raw.benefit != null ? raw.benefit : raw;

      const couponItems = raw.couponItems;

      const bt = detail.benefitType || "";

      const parsed = parseGiftPointFromConfig(bt, detail.benefitConfig || "");

      const couponSnippets = parseCouponsFromConfig(detail.benefitConfig || "");



      let couponRows = [];

      if (bt === COUPON_PACKAGE && Array.isArray(couponItems) && couponItems.length) {

        couponRows = mapCouponItemsToPackageRows(couponItems);

      }



      formEdit.value = {

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

        hydrateCouponRowsForEdit(couponSnippets);

      }

    }

  });

}

function submitEdit() {

  if (!editForm.value) {

    ElMessage.warning("表单未就绪，请稍后重试");

    return;

  }

  editForm.value.validate((valid) => {

    if (!valid) return;

    submitEditLoading.value = true;

    const { id, giftPoint, couponPackageRows, ...rest } = formEdit.value;

    const payload = {

      ...rest,

      benefitConfig: buildBenefitConfigString({

        benefitType: formEdit.value.benefitType,

        giftPoint,

        couponPackageRows,

      }),

    };

    API_Member.updateMemberBenefit(id, payload).then((res) => {

      submitEditLoading.value = false;

      if (res && res.success) {

        ElMessage.success("修改成功");

        editFlag.value = false;

        getData();

      } else if (res && res.message) {

        ElMessage.error(res.message);

      } else {

        ElMessage.error("修改失败");

      }

    }).catch(() => {

      submitEditLoading.value = false;

      ElMessage.error("网络异常，请稍后重试");

    });

  });

}

function onBenefitStateSwitch(row, checked) {

  const nextState = checked ? "OPEN" : "CLOSE";

  const prevState = row.benefitState;

  if (nextState === prevState) return;

  const text = checked ? "开启" : "关闭";

  ElMessageBox.confirm(`确定${text}该客户权益？`, "提示", { type: "warning" }).then(() => {

    row._benefitStateLoading = true;

    return API_Member.updateMemberBenefitState(row.id, nextState)

      .then((res) => {

        row._benefitStateLoading = false;

        if (res && res.success) {

          ElMessage.success(`${text}成功`);

          row.benefitState = nextState;

        } else {

          getData();

        }

      })

      .catch(() => {

        row._benefitStateLoading = false;

      });

  }).catch(() => {});

}

function remove(row) {

  ElMessageBox.confirm("确定删除该客户权益？", "提示", { type: "warning" }).then(() => {

    API_Member.deleteMemberBenefit(row.id).then((res) => {

      if (res && res.success) {

        ElMessage.success("删除成功");

        getData();

      } else if (res && res.message) {

        ElMessage.error(res.message);

      }

    });

  }).catch(() => {});

}



onMounted(() => {

  init();

});

</script>



<style lang="scss" scoped>

.card-header-bar {

  display: flex;

  justify-content: space-between;

  align-items: center;



  .header-title {

    display: flex;

    align-items: center;

    gap: 10px;

    font-size: 15px;

    font-weight: 600;

    color: #303133;

  }



  .header-actions {

    display: flex;

    align-items: center;

    gap: 8px;

  }

}



.font-mono {

  font-family: SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;

}



.font-semibold {

  font-weight: 600;

}



.text-dark {

  color: #303133;

}



.text-secondary {

  color: #606266;

}



.text-placeholder {

  color: #c0c4cc;

}



.custom-benefit-table {

  .logo-thumb-wrapper {

    width: 44px;

    height: 44px;

    margin: 0 auto;

    border: 1px solid #ebeef5;

    border-radius: 4px;

    background: #fafafa;

    display: flex;

    align-items: center;

    justify-content: center;

    overflow: hidden;



    .logo-thumb-img {

      width: 40px;

      height: 40px;

    }



    .logo-slot {

      font-size: 11px;

      color: #c0c4cc;

    }

  }

}



.pagination-wrap {

  display: flex;

  justify-content: flex-end;

}



.benefit-drawer-footer-btns {

  margin-top: 24px;

  padding-top: 16px;

  border-top: 1px solid #e8eaec;

  text-align: right;

}

.benefit-drawer-footer-btns .el-button + .el-button {

  margin-left: 8px;

}

.link-text {

  color: #409eff;

  cursor: pointer;

  text-decoration: none;

}

.op-split {

  margin: 0 8px;

  color: #dcdfe6;

}

</style>



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



.member-benefit .benefit-list-panel {

  width: 100%;

  max-width: 100%;

}

.member-benefit .benefit-list-panel .benefit-list-table {

  width: 100%;

}

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



.member-benefit .benefit-list-table--no-vertical-borders .el-table th,

.member-benefit .benefit-list-table--no-vertical-borders .el-table td {

  border-right: none !important;

}



.member-benefit-coupon-picker-modal {

  z-index: 2700 !important;

}



.benefit-form-drawer .benefit-coupon-form-item.el-form-item .el-form-item__content {

  flex: 1;

  min-width: 0;

  max-width: none;

}

.benefit-form-drawer .benefit-coupon-field {

  width: 100%;

}

.benefit-form-drawer .benefit-coupon-table {

  width: 100%;

}

.benefit-form-drawer .benefit-coupon-table table {

  width: 100% !important;

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

