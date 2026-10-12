<template>
  <div class="invoice-modal">
    <el-dialog v-model="invoiceAvailable" width="640">
      <template #header><p>
        <span>发票信息</span>
      </p></template>
      <div class="nav-content">
        <el-form :model="invoiceForm" ref="formRef" label-position="left" :rules="formRules" label-width="118px">
          <el-form-item label="发票类型">
            <el-radio-group v-model="invoice" type="button" button-style="solid" @change="onInvoiceKindChange">
              <el-radio :label="1">电子普通发票</el-radio>
              <el-radio :label="2">增值税专用发票</el-radio>
            </el-radio-group>
          </el-form-item>

          <!-- 电子普通发票 -->
          <div v-if="invoice === 1" key="invoice-normal">
            <el-form-item label="发票抬头">
              <el-radio-group v-model="type" type="button" button-style="solid" @change="onHeaderTypeChange">
                <el-radio :label="1">个人</el-radio>
                <el-radio :label="2">单位</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item :label="type === 1 ? '个人名称' : '单位名称'" :prop="type === 1 ? 'personalName' : 'companyName'">
              <el-input v-if="type === 1" v-model="invoiceForm.personalName"></el-input>
              <el-input v-else v-model="invoiceForm.companyName"></el-input>
            </el-form-item>

            <el-form-item label="纳税人识别号" v-if="type === 2" prop="taxpayerId">
              <el-input v-model="invoiceForm.taxpayerId"></el-input>
            </el-form-item>
            <el-form-item label="发票内容">
              <el-radio-group v-model="invoiceForm.receiptContent" type="button" button-style="solid">
                <el-radio label="商品明细">商品明细</el-radio>
                <el-radio label="商品类别">商品类别</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item label="收票人手机" prop="receiptPhone">
              <el-input v-model="invoiceForm.receiptPhone"></el-input>
            </el-form-item>
            <el-form-item label="收票人邮箱" prop="receiptEmail">
              <el-input v-model="invoiceForm.receiptEmail" placeholder="可选"></el-input>
            </el-form-item>
          </div>

          <!-- 增值税专用发票（固定为单位） -->
          <div v-else key="invoice-vat">
            <el-form-item label="发票抬头">
              <span class="inv-title-fixed">单位</span>
            </el-form-item>
            <el-form-item label="单位名称" prop="companyName">
              <el-input v-model="invoiceForm.companyName" placeholder="与营业执照一致"></el-input>
            </el-form-item>
            <el-form-item label="纳税人识别号" prop="taxpayerId">
              <el-input v-model="invoiceForm.taxpayerId"></el-input>
            </el-form-item>
            <el-form-item label="单位地址" prop="companyAddress">
              <el-input v-model="invoiceForm.companyAddress" placeholder="注册地址"></el-input>
            </el-form-item>
            <el-form-item label="单位电话" prop="companyPhone">
              <el-input v-model="invoiceForm.companyPhone" placeholder="固话或手机"></el-input>
            </el-form-item>
            <el-form-item label="开户银行" prop="bankName">
              <el-input v-model="invoiceForm.bankName"></el-input>
            </el-form-item>
            <el-form-item label="银行账号" prop="bankAccount">
              <el-input v-model="invoiceForm.bankAccount"></el-input>
            </el-form-item>
            <el-form-item label="发票内容">
              <el-radio-group v-model="invoiceForm.receiptContent" type="button" button-style="solid">
                <el-radio label="商品明细">商品明细</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item label="收票人手机" prop="receiptPhone">
              <el-input v-model="invoiceForm.receiptPhone"></el-input>
            </el-form-item>
            <el-form-item label="收票人邮箱" prop="receiptEmail">
              <el-input v-model="invoiceForm.receiptEmail" placeholder="可选"></el-input>
            </el-form-item>
          </div>
        </el-form>
        <div style="text-align: center">
          <el-button type="primary" :loading="loading" @click="submit">保存发票信息</el-button>
          <el-button type="default" @click="invoiceAvailable = false">取消</el-button>
        </div>
      </div></el-dialog>
  </div>
</template>
<script setup>
import { computed, nextTick, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { receiptSelect } from '@/api/cart.js';
import { mobile, email } from '@/plugins/RegExp.js';

defineOptions({ name: 'invoiceModal' });

const props = defineProps(['invoiceData']);

const emit = defineEmits(['change']);

const route = useRoute();

const invoice = ref(1); // 1 电子普通发票 2 增值税专用发票
const invoiceAvailable = ref(false);
const loading = ref(false);
const invoiceForm = ref({
  receiptTitle: '',
  personalName: '',
  companyName: '',
  taxpayerId: '',
  receiptContent: '商品明细',
  receiptPhone: '',
  receiptEmail: '',
  companyAddress: '',
  companyPhone: '',
  bankName: '',
  bankAccount: ''
});
const type = ref(1);

const formRef = ref(null);

const formRules = computed(() => {
  const receiptPhoneRules = [
    { required: true, message: '请填写收票人手机', trigger: 'blur' },
    { pattern: mobile, message: '请填写正确的手机号码', trigger: 'blur' }
  ];
  // 收票人邮箱可选：仅校验格式；提示文案须与手机区分，避免误用「请填写收票人手机」
  const receiptEmailRules = [
    {
      validator (rule, val, cb) {
        const s = val != null ? String(val).trim() : '';
        if (!s) {
          cb();
          return;
        }
        if (!email.test(s)) {
          cb(new Error('请填写正确的收票人邮箱'));
          return;
        }
        cb();
      },
      trigger: 'blur'
    }
  ];

  if (invoice.value === 2) {
    return {
      companyName: [{ required: true, message: '请填写单位名称', trigger: 'blur' }],
      taxpayerId: [{ required: true, message: '请填写纳税人识别号', trigger: 'blur' }],
      companyAddress: [{ required: true, message: '请填写单位地址', trigger: 'blur' }],
      companyPhone: [{ required: true, message: '请填写单位电话', trigger: 'blur' }],
      bankName: [{ required: true, message: '请填写开户银行', trigger: 'blur' }],
      bankAccount: [{ required: true, message: '请填写银行账号', trigger: 'blur' }],
      receiptPhone: receiptPhoneRules,
      receiptEmail: receiptEmailRules
    };
  }

  const rules = {
    receiptPhone: receiptPhoneRules,
    receiptEmail: receiptEmailRules
  };
  if (type.value === 1) {
    rules.personalName = [{ required: true, message: '请填写个人名称', trigger: 'blur' }];
  } else {
    rules.companyName = [{ required: true, message: '请填写单位名称', trigger: 'blur' }];
    rules.taxpayerId = [{ required: true, message: '请填写纳税人识别号', trigger: 'blur' }];
  }
  return rules;
});

watch(() => props.invoiceData, (val) => {
  if (!val) return;
  invoiceForm.value = { ...invoiceForm.value, ...val };
  if (!invoiceForm.value.receiptPhone) invoiceForm.value.receiptPhone = '';
  if (!invoiceForm.value.receiptEmail) invoiceForm.value.receiptEmail = '';
  if (!invoiceForm.value.receiptContent) invoiceForm.value.receiptContent = '商品明细';
  if (!invoiceForm.value.companyAddress) invoiceForm.value.companyAddress = '';
  if (!invoiceForm.value.companyPhone) invoiceForm.value.companyPhone = '';
  if (!invoiceForm.value.bankName) invoiceForm.value.bankName = '';
  if (!invoiceForm.value.bankAccount) invoiceForm.value.bankAccount = '';
  if (!invoiceForm.value.personalName) invoiceForm.value.personalName = '';
  if (!invoiceForm.value.companyName) invoiceForm.value.companyName = '';

  const rt = val.receiptType;
  if (rt === 2 || rt === '2' || val.invoiceKind === 'VAT_SPECIAL') {
    invoice.value = 2;
    type.value = 2;
  } else {
    invoice.value = 1;
    if (val.taxpayerId) type.value = 2;
    else type.value = 1;
  }
  // 兼容后端 receiptTitle 存「个人/单位」，实际名称在 personalName/companyName；旧数据名称可能只在 receiptTitle
  const titleAsName = (t) => (t && t !== '个人' && t !== '单位' ? t : '');
  if (invoice.value === 2) {
    invoiceForm.value.companyName = val.companyName || titleAsName(val.receiptTitle) || '';
  } else if (type.value === 2) {
    invoiceForm.value.companyName = val.companyName || titleAsName(val.receiptTitle) || '';
    invoiceForm.value.personalName = val.personalName || '';
  } else {
    invoiceForm.value.personalName = val.personalName || titleAsName(val.receiptTitle) || '';
    invoiceForm.value.companyName = val.companyName || '';
  }
  if (invoice.value === 1) {
    invoiceForm.value.companyAddress = '';
    invoiceForm.value.companyPhone = '';
    invoiceForm.value.bankName = '';
    invoiceForm.value.bankAccount = '';
  }
  if (invoice.value === 2) {
    invoiceForm.value.personalName = '';
  }
}, { deep: true, immediate: true });

function onHeaderTypeChange (val) {
  if (invoice.value === 1 && val === 1 && invoiceForm.value.personalName === '个人') {
    invoiceForm.value.personalName = '';
  }
  nextTick(() => {
    if (formRef.value) formRef.value.clearValidate();
  });
}

function onInvoiceKindChange (val) {
  type.value = val === 2 ? 2 : 1;
  invoiceForm.value = {
    receiptTitle: '',
    personalName: '',
    companyName: '',
    taxpayerId: '',
    receiptContent: '商品明细',
    receiptPhone: '',
    receiptEmail: '',
    companyAddress: '',
    companyPhone: '',
    bankName: '',
    bankAccount: ''
  };
  nextTick(() => {
    if (formRef.value) formRef.value.clearValidate();
  });
}

async function save () {
  if (invoice.value === 2) {
    invoiceForm.value.receiptContent = '商品明细';
  }

  return await new Promise(resolve => {
    formRef.value.validate(valid => resolve(valid));
  });
}

async function submit () {
  if (!await save()) return;
  loading.value = true;
  const raw = JSON.parse(JSON.stringify(invoiceForm.value));
  if (invoice.value === 1) {
    delete raw.companyAddress;
    delete raw.companyPhone;
    delete raw.bankName;
    delete raw.bankAccount;
    delete raw.invoiceAddress;
    if (type.value === 1) {
      delete raw.taxpayerId;
    }
  } else {
    delete raw.personalName;
  }
  const isCompanyTitle = invoice.value === 2 || type.value === 2;
  const titleName = isCompanyTitle
    ? (raw.companyName != null ? String(raw.companyName).trim() : '')
    : (raw.personalName != null ? String(raw.personalName).trim() : '');
  const submit = {
    way: route.query.way,
    ...raw,
    receiptType: invoice.value,
    receiptTitle: isCompanyTitle ? '单位' : '个人',
    personalName: isCompanyTitle ? '' : titleName,
    companyName: isCompanyTitle ? titleName : ''
  };
  let receipt = await receiptSelect(submit);
  if (receipt.success) {
    emit('change', true);
  }
  loading.value = false;
}

defineExpose({ invoiceAvailable });
</script>
<style lang="scss" scoped>
.inv-type {
  text-align: center;
}
.add-inv {
  font-size: 12px;
  color: #438cde;
  cursor: pointer;
  &:hover {
    color: $theme_color;
  }
}

.nav-content {
  width: 520px;
  margin: 10px auto;
}

.inv-title-fixed {
  line-height: 32px;
  color: #515a6e;
}
</style>
