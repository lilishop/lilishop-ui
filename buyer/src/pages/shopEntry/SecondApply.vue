<template>
  <div class="photo-msg">
    <el-form ref="secondForm" :model="form" :rules="rules" label-width="140px" scroll-to-error>
      <div class="section-title">结算银行信息</div>
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
        <div class="form-actions">
          <el-button size="large" @click="$emit('change', 0)">上一步</el-button>
          <el-button type="primary" size="large" :loading="loading" @click="next"
            >下一步：填写其他信息</el-button
          >
        </div>
      </el-form-item>
    </el-form>
  </div>
</template>
<script setup>
import { onBeforeUnmount, onMounted, reactive, ref } from 'vue';
import { applySecond } from '@/api/shopentry';

const SECOND_APPLY_DRAFT_KEY = 'shopEntrySecondDraft';

const emit = defineEmits(['change']);
const props = defineProps({
  content: {
    default: () => ({}),
    type: Object
  }
});

const secondForm = ref(null);
const loading = ref(false); // 加载状态
const form = reactive({}); // 表单数据
const rules = { // 验证规则
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
};

// 下一步
function next() {
  secondForm.value.validate((valid) => {
    if (valid) {
      loading.value = true;
      applySecond(form)
        .then((res) => {
          loading.value = false;
          if (res.success) {
            sessionStorage.removeItem(SECOND_APPLY_DRAFT_KEY);
            emit('change', 2);
          }
        })
        .catch(() => {
          loading.value = false;
        });
    }
  });
}

function restoreDraft() {
  const draft = sessionStorage.getItem(SECOND_APPLY_DRAFT_KEY);
  if (!draft) return;
  try {
    Object.assign(form, JSON.parse(draft));
  } catch (e) {
    sessionStorage.removeItem(SECOND_APPLY_DRAFT_KEY);
  }
}

function saveDraft() {
  sessionStorage.setItem(SECOND_APPLY_DRAFT_KEY, JSON.stringify(form));
}

onMounted(() => {
  if (props.content && Object.keys(props.content).length) {
    Object.assign(form, JSON.parse(JSON.stringify(props.content)));
  } else {
    restoreDraft();
  }
});

onBeforeUnmount(() => {
  saveDraft();
});
</script>
<style lang="scss" scoped>
.section-title {
  display: flex;
  align-items: center;
  margin: 24px 0 18px;
  font-size: 16px;
  font-weight: 600;
  color: #303133;

  &::before {
    content: '';
    width: 4px;
    height: 18px;
    border-radius: 2px;
    background: $theme_color;
    margin-right: 8px;
  }
}
.el-input {
  width: 360px;
}
.form-actions {
  margin-top: 8px;

  .el-button {
    min-width: 120px;
  }

  .el-button--primary {
    min-width: 240px;
  }
}
</style>
