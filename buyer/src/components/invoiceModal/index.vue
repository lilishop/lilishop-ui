<template>
  <div class="invoice-modal">
    <Modal v-model="invoiceAvailable" width="600" footer-hide>
      <p slot="header">
        <span>发票信息</span>
      </p>
      <!-- <div>
                <div>为响应环保，自营全面启用电子普通发票，非自营发票由第三方商家实际开具。</div>
                <div>电子普通发票是税务机关认可的有效收付款凭证，与纸质普通发票具有同等法律效力，可用于报销入账、售后维权等。</div>
                <div>如商品由第三方卖家销售，发票类型及内容将由该卖家决定。</div>
            </div> -->
      <!-- 普通发票 -->
      <div class="nav-content">
        <Form
          :model="invoiceForm"
          ref="form"
          label-position="left"
          :rules="ruleInline"
          :label-width="110"
        >
          <FormItem label="发票类型">
            <RadioGroup v-model="invoiceForm.type" type="button" button-style="solid">
              <Radio :label="1">个人</Radio>
              <Radio :label="2">单位</Radio>
            </RadioGroup>
          </FormItem>
          <FormItem
            label="发票抬头"
            v-if="invoiceForm.type == 2"
            prop="receiptTitle"
          >
            <i-input v-model="invoiceForm.receiptTitle"></i-input>
          </FormItem>
          <FormItem
            label="纳税人识别号"
            v-if="invoiceForm.type == 2"
            prop="taxpayerId"
          >
            <i-input v-model="invoiceForm.taxpayerId"></i-input>
          </FormItem>
          <FormItem label="发票内容">
            <RadioGroup v-model="invoiceForm.receiptContent" type="button" button-style="solid">
              <Radio label="不开发票">不开发票</Radio>
              <Radio label="商品明细">商品明细</Radio>
            </RadioGroup>
          </FormItem>
        </Form>
        <div style="text-align: center">
          <Button type="primary" :loading="loading" @click="save">保存发票信息</Button>
          <Button type="default" @click="invoiceAvailable = false">取消</Button>
        </div>
      </div>
    </Modal>
  </div>
</template>
<script>
import { saveReceipt } from '@/api/member.js';
import { TINumber } from '@/plugins/RegExp.js';
export default {
  name: 'invoiceModal',
  data () {
    return {
      invoiceAvailable: false, // 模态框显隐
      loading: false, // 提交状态
      invoiceForm: { // 发票表单
        // 普票表单
        receiptTitle: '', // 发票抬头
        taxpayerId: '', // 纳税人识别号
        receiptContent: '不开发票', // 发票内容
        type: 1 // 1 个人 2 单位
      },
      ruleInline: {
        receiptTitle: [{ required: true, message: '请填写公司名称' }],
        taxpayerId: [
          { required: true, message: '请填写纳税人识别号' },
          { pattern: TINumber, message: '请填写正确的纳税人识别号' }
        ]
      }
    };
  },
  methods: {
    save () {
      if (this.invoiceForm.type === 1) {
        // 个人
        let flag = true;
        this.receiptItems.forEach((e) => {
          if (
            e.receiptTitle === '个人' &&
            e.receiptContent === this.invoiceForm.receiptContent
          ) {
            this.$emit('change', e);
            flag = false;
            this.invoiceAvailable = false;
          }
        });

        if (flag) {
          let params = {
            receiptTitle: '个人',
            receiptContent: this.invoiceForm.receiptContent
          };
          this.loading = true;
          saveReceipt(params)
            .then((res) => {
              this.loading = false;
              if (res.success) {
                this.$emit('change', res.result);
                this.invoiceAvailable = false;
              }
            })
            .catch(() => {
              this.loading = false;
            });
        }
      } else {
        // 单位
        this.$refs.form.validate((valid) => {
          if (valid) {
            this.loading = true;
            let params = {
              receiptTitle: this.invoiceForm.receiptTitle,
              taxpayerId: this.invoiceForm.taxpayerId,
              receiptContent: this.invoiceForm.receiptContent
            };
            let flag = true;
            this.receiptItems.forEach((e) => {
              if (e.taxpayerId === params.taxpayerId) {
                flag = false;
              }
            });
            if (!flag) {
              this.$Message.error('已有当前税号的发票信息，请直接选择已有发票');
            } else {
              saveReceipt(params)
                .then((res) => {
                  this.loading = false;
                  if (res.success) {
                    this.$emit('change', res.result);
                    this.invoiceAvailable = false;
                  }
                })
                .catch(() => {
                  this.loading = false;
                });
            }
          }
        });
      }
    }
  }
};
</script>
<style lang="scss" scoped>
/** 普票 */
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
  width: 500px;
  margin: 10px auto;
}
</style>
