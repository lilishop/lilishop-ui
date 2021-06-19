<template>
  <div class="wrapper">
    <card _Title="我的发票"></card>
    <empty v-if="list.length===0" />
    <div v-else>
      <Button size="small" @click="invoiceAvailable = true">新增发票</Button>
      <div class="receipt-item" v-for="(item,index) in list" :key="index">
        <p><span>发票抬头：</span>{{item.receiptTitle}}</p>
        <p><span>发票内容：</span> {{item.receiptContent}}</p>
        <p><span>纳税人识别号：</span> {{item.taxpayerId}}</p>
      </div>
    </div>
    <Modal v-model="invoiceAvailable" width="600" footer-hide>
        <Form
          :model="form"
          ref="form"
          label-position="left"
          :rules="ruleInline"
          :label-width="110"
        >
          <FormItem label="发票类型">
            <RadioGroup v-model="form.type" type="button" button-style="solid">
              <Radio :label="2">单位</Radio>
            </RadioGroup>
          </FormItem>
          <FormItem
            label="发票抬头"
            prop="receiptTitle"
          >
            <i-input v-model="form.receiptTitle"></i-input>
          </FormItem>
          <FormItem
            label="纳税人识别号"
            prop="taxpayerId"
          >
            <i-input v-model="form.taxpayerId"></i-input>
          </FormItem>
          <FormItem label="发票内容">
            <RadioGroup v-model="form.receiptContent" type="button" button-style="solid">
              <Radio label="商品明细">商品明细</Radio>
            </RadioGroup>
          </FormItem>
        </Form>
        <div style="text-align: center">
          <Button type="primary" :loading="loading" @click="save">保存发票信息</Button>
          <Button type="default" @click="invoiceAvailable = false">取消</Button>
        </div>
    </Modal>
  </div>
</template>

<script>
import { receiptList, saveReceipt } from '@/api/member.js';
import { TINumber } from '@/plugins/RegExp.js';
export default {
  name: 'Invoice',
  data () {
    return {
      list: [], // 发票列表
      form: { // 添加发票表单
        type: 2,
        receiptTitle: '', // 发票抬头
        taxpayerId: '', // 纳税人识别号
        receiptContent: '商品明细'
      },
      ruleInline: { // 验证规则
        receiptTitle: [{ required: true, message: '请填写公司名称' }],
        taxpayerId: [
          { required: true, message: '请填写纳税人识别号' },
          { pattern: TINumber, message: '请填写正确的纳税人识别号' }
        ]
      },
      loading: false, // 加载状态
      invoiceAvailable: false // 添加发票模态框显隐
    };
  },
  mounted () {
    this.getList()
  },
  methods: {
    getList () { // 获取发票列表
      receiptList().then(res => {
        this.list = res.result.records;
      })
    },
    save () { // 保存发票
      this.$refs.form.validate((valid) => {
        if (valid) {
          this.loading = true;
          let params = {
            receiptTitle: this.form.receiptTitle,
            taxpayerId: this.form.taxpayerId,
            receiptContent: this.form.receiptContent
          };
          saveReceipt(params).then((res) => {
            this.loading = false;
            if (res.success) {
              this.getList();
              this.resetData();
              this.invoiceAvailable = false;
            }
          }).catch(() => {
            this.loading = false;
          });
        }
      });
    },
    resetData () { // 重置表单数据
      this.$refs.form.resetFields();
    }
  }
};
</script>

<style scoped lang="scss">
.receipt-item {
  cursor: pointer;
  font-size: 14px;
  border-bottom: 1px solid #eee;

  > p {
    padding: 12px 0;
  }
}
</style>
