<template>
  <div class="photo-msg">
    <el-form ref="secondForm" :model="form" :rules="rules" label-width="140px">
      <h4>基础信息</h4>
      <el-form-item prop="settlementBankAccountName" label="银行开户名">
        <el-input
          type="text"
          v-model="form.settlementBankAccountName"
          placeholder="请填写银行开户名称"
        />
      </el-form-item>
      <el-form-item prop="settlementBankAccountNum" label="银行账号">
        <el-input
          type="text"
          v-model="form.settlementBankAccountNum"
          placeholder="请填写银行账号"
        />
      </el-form-item>
      <el-form-item prop="settlementBankBranchName" label="开户银行支行名称">
        <el-input
          type="text"
          v-model="form.settlementBankBranchName"
          placeholder="请填写开户银行支行名称"
        />
      </el-form-item>
      <el-form-item prop="settlementBankJointName" label="支行联行号">
        <el-input
          type="text"
          v-model="form.settlementBankJointName"
          placeholder="请填写支行联行号"
        />
      </el-form-item>

      <el-form-item>
        <el-button @click="$emit('change', 0)">返回</el-button>
        <el-button type="primary" :loading="loading" @click="next"
          >填写其他信息</el-button
        >
      </el-form-item>
    </el-form>
  </div>
</template>
<script>
import { applySecond } from '@/api/shopentry';
export default {
  emits: ['change'],
  props: {
    content: {
      default: {},
      type: Object
    }
  },
  data () {
    return {
      loading: false, // 加载状态
      form: {}, // 表单数据
      rules: { // 验证规则
        settlementBankAccountName: [
          { required: true, message: '请填写银行开户名称' }
        ],
        settlementBankAccountNum: [
          { required: true, message: '请填写银行账号' }
        ],
        settlementBankBranchName: [
          { required: true, message: '请填写开户银行支行名称' }
        ],
        settlementBankJointName: [
          { required: true, message: '请填写支行联行号' }
        ]
      }
    };
  },
  methods: {
    // 下一步
    next () {
      this.$refs.secondForm.validate((valid) => {
        if (valid) {
          this.loading = true;
          applySecond(this.form)
            .then((res) => {
              this.loading = false;
              if (res.success) this.$emit('change', 2);
            })
            .catch(() => {
              this.loading = false;
            });
        } else {
          console.log('error');
        }
      });
    }
  },
  mounted () {
    if (this.content && Object.keys(this.content).length) {
      this.form = JSON.parse(JSON.stringify(this.content));
    }
  }
};
</script>
<style lang="scss" scoped>
h4 {
  margin-bottom: 10px;
  padding: 0 10px;
  border: 1px solid #ddd;
  background-color: #f8f8f8;
  font-weight: bold;
  color: #333;
  font-size: 14px;
  line-height: 40px;
  text-align: left;
}
.el-input {
  width: 300px;
}
</style>
