<template>
  <div class="invoice-modal">
    <el-dialog v-model="invoiceAvailable" width="640">
      <template #header><p>
        <span>发票信息</span>
      </p></template>
      <div class="nav-content">
        <el-form :model="invoiceForm" ref="form" label-position="left" :rules="formRules" label-width="118px">
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
<script>
import { receiptSelect } from '@/api/cart.js';
import { mobile, email } from '@/plugins/RegExp.js';

export default {
  name: 'invoiceModal',
  emits: ['change'],
  data () {
    return {
      invoice: 1, // 1 电子普通发票 2 增值税专用发票
      invoiceAvailable: false,
      loading: false,
      invoiceForm: {
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
      },
      type: 1
    };
  },
  props: ['invoiceData'],
  computed: {
    formRules () {
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

      if (this.invoice === 2) {
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
      if (this.type === 1) {
        rules.personalName = [{ required: true, message: '请填写个人名称', trigger: 'blur' }];
      } else {
        rules.companyName = [{ required: true, message: '请填写单位名称', trigger: 'blur' }];
        rules.taxpayerId = [{ required: true, message: '请填写纳税人识别号', trigger: 'blur' }];
      }
      return rules;
    }
  },
  watch: {
    invoiceData: {
      handler (val) {
        if (!val) return;
        this.invoiceForm = { ...this.invoiceForm, ...val };
        if (!this.invoiceForm.receiptPhone) this.invoiceForm.receiptPhone = '';
        if (!this.invoiceForm.receiptEmail) this.invoiceForm.receiptEmail = '';
        if (!this.invoiceForm.receiptContent) this.invoiceForm.receiptContent = '商品明细';
        if (!this.invoiceForm.companyAddress) this.invoiceForm.companyAddress = '';
        if (!this.invoiceForm.companyPhone) this.invoiceForm.companyPhone = '';
        if (!this.invoiceForm.bankName) this.invoiceForm.bankName = '';
        if (!this.invoiceForm.bankAccount) this.invoiceForm.bankAccount = '';
        if (!this.invoiceForm.personalName) this.invoiceForm.personalName = '';
        if (!this.invoiceForm.companyName) this.invoiceForm.companyName = '';

        const rt = val.receiptType;
        if (rt === 2 || rt === '2' || val.invoiceKind === 'VAT_SPECIAL') {
          this.invoice = 2;
          this.type = 2;
        } else {
          this.invoice = 1;
          if (val.taxpayerId) this.type = 2;
          else this.type = 1;
        }
        // 兼容后端 receiptTitle 存「个人/单位」，实际名称在 personalName/companyName；旧数据名称可能只在 receiptTitle
        const titleAsName = (t) => (t && t !== '个人' && t !== '单位' ? t : '');
        if (this.invoice === 2) {
          this.invoiceForm.companyName = val.companyName || titleAsName(val.receiptTitle) || '';
        } else if (this.type === 2) {
          this.invoiceForm.companyName = val.companyName || titleAsName(val.receiptTitle) || '';
          this.invoiceForm.personalName = val.personalName || '';
        } else {
          this.invoiceForm.personalName = val.personalName || titleAsName(val.receiptTitle) || '';
          this.invoiceForm.companyName = val.companyName || '';
        }
        if (this.invoice === 1) {
          this.invoiceForm.companyAddress = '';
          this.invoiceForm.companyPhone = '';
          this.invoiceForm.bankName = '';
          this.invoiceForm.bankAccount = '';
        }
        if (this.invoice === 2) {
          this.invoiceForm.personalName = '';
        }
      },
      deep: true,
      immediate: true
    }
  },
  methods: {
    onHeaderTypeChange (val) {
      if (this.invoice === 1 && val === 1 && this.invoiceForm.personalName === '个人') {
        this.invoiceForm.personalName = '';
      }
      this.$nextTick(() => {
        if (this.$refs.form) this.$refs.form.clearValidate();
      });
    },
    onInvoiceKindChange (val) {
      this.type = val === 2 ? 2 : 1;
      this.invoiceForm = {
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
      this.$nextTick(() => {
        if (this.$refs.form) this.$refs.form.clearValidate();
      });
    },

    async save () {
      if (this.invoice === 2) {
        this.invoiceForm.receiptContent = '商品明细';
      }

      return await new Promise(resolve => {
        this.$refs.form.validate(valid => resolve(valid));
      });
    },

    async submit () {
      if (!await this.save()) return;
      this.loading = true;
      const raw = JSON.parse(JSON.stringify(this.invoiceForm));
      if (this.invoice === 1) {
        delete raw.companyAddress;
        delete raw.companyPhone;
        delete raw.bankName;
        delete raw.bankAccount;
        delete raw.invoiceAddress;
        if (this.type === 1) {
          delete raw.taxpayerId;
        }
      } else {
        delete raw.personalName;
      }
      const isCompanyTitle = this.invoice === 2 || this.type === 2;
      const titleName = isCompanyTitle
        ? (raw.companyName != null ? String(raw.companyName).trim() : '')
        : (raw.personalName != null ? String(raw.personalName).trim() : '');
      const submit = {
        way: this.$route.query.way,
        ...raw,
        receiptType: this.invoice,
        receiptTitle: isCompanyTitle ? '单位' : '个人',
        personalName: isCompanyTitle ? '' : titleName,
        companyName: isCompanyTitle ? titleName : ''
      };
      let receipt = await receiptSelect(submit);
      if (receipt.success) {
        this.$emit('change', true);
      }
      this.loading = false;
    }
  }
};
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
