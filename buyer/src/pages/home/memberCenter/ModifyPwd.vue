<template>
  <div class="wrapper">
    <UserCenterLayout>
    <!--  手机号验证  -->
    <el-form ref="formDataRef" :model="formData" label-position="left" label-width="100px" :rules="ruleInLines"
          v-if="(status == 2 || status == 3) && !showPwd">
      <el-form-item label="手机号">
        <div class="phone">{{ displayMobile }}</div>
      </el-form-item>
      <el-form-item label="图片验证码" prop="picture" style="width: 350px">
        <el-input v-model="formData.picture" size="large" maxlength="4"></el-input>
      </el-form-item>
      <el-form-item label="短信验证码" prop="msg">
        <el-input v-model="formData.msg" size="large" maxlength="6" style="width: 250px">
          <template #append><span>输入验证码</span></template>
        </el-input>
      </el-form-item>
    </el-form>
    <div v-if="(status == 2 || status == 3) && !showPwd" style="text-align: center;width: 50%">
      <el-button type="primary" class="ml_10" @click="submitRegister">下一步</el-button>
    </div>

    <!--  修改  -->
    <el-form ref="formRegisterRef" :model="formRegister" :rules="ruleInline" label-width="80px" v-if="status == 1 && !showPwd">
      <el-form-item label="旧密码" prop="password">
        <el-input type="password" v-model="formRegister.password" clearable size="large" placeholder="请输入旧密码"
                 style="width: 300px"
                 maxlength="12">
          <template #prepend><el-icon><Lock /></el-icon></template>
        </el-input>
      </el-form-item>
      <el-form-item label="新密码" prop="newPassword">
        <el-input type="password" v-model="formRegister.newPassword" clearable size="large" placeholder="请输入新密码"
                 style="width: 300px"
                 maxlength="12">
          <template #prepend><el-icon><Lock /></el-icon></template>
        </el-input>
      </el-form-item>
      <el-form-item label="确认密码" prop="againPassword">
        <el-input type="password" v-model="formRegister.againPassword" clearable size="large" placeholder="请输入确认密码"
                 style="width: 300px"
                 maxlength="12">
          <template #prepend><el-icon><Lock /></el-icon></template>
        </el-input>
      </el-form-item>

    </el-form>
    <div v-if="status == 1 && !showPwd" style="width: 50%;text-align: center">
      <el-button type="primary" class="ml_10" @click="handleRegist">修改</el-button>
    </div>
    <!-- 设置&修改的第二种情况   -->
    <el-form ref="formDataUpdateRef" :model="formDataUpdate" label-position="left" label-width="100px" :rules="ruleIn"
          v-if="showPwd">
      <el-form-item label="新密码" prop="newPassword">
        <el-input type="password" v-model="formDataUpdate.newPassword" clearable size="large" placeholder="请输入新密码"
                 style="width: 300px"
                 maxlength="12">
          <template #prepend><el-icon><Lock /></el-icon></template>
        </el-input>
      </el-form-item>
      <el-form-item label="确认密码" prop="againPassword">
        <el-input type="password" v-model="formDataUpdate.againPassword" clearable size="large" placeholder="请输入确认密码"
                 style="width: 300px"
                 maxlength="12">
          <template #prepend><el-icon><Lock /></el-icon></template>
        </el-input>
      </el-form-item>
    </el-form>
    <div v-if="showPwd" style="text-align: center;width: 50%">
      <el-button type="primary" class="ml_10" @click="setPassword">设置</el-button>
    </div>
    </UserCenterLayout>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { Message } from "@/utils/message";
import { Lock } from '@element-plus/icons-vue';
import {
  setPwd,
  editPwd
} from '@/api/account';
import { getMemberMsg } from '@/api/login.js';
import storage from '@/plugins/storage.js';
import { md5 } from '@/plugins/md5.js'
import { secrecyMobile } from '@/plugins/filters.js'

defineOptions({ name: 'modifyPwd' });

const route = useRoute();
const router = useRouter();

// 1为修改    2为设置     3为提交校验的下一步
const status = ref('');
const mobile = ref('');
const showPwd = ref(false); // 显示密码
const formData = reactive({ // 验证表单
  picture: '',
  msg: ''
});
const formDataUpdate = reactive({ // 直接输入新密码表单
  newPassword: '',
  againPassword: ''
});
const formRegister = reactive({ // 第三步 新密码表单
  password: '',
  againPassword: '',
  newPassword: ''
});
const ruleInLines = { // 验证规则
  picture: [
    {required: true, message: '请输入图片验证码', trigger: 'blur'}
  ],
  msg: [
    {required: true, message: '请输入短信验证码', trigger: 'blur'}
  ]
};
const ruleIn = { // 验证规则
  newPassword: [
    {required: true, message: '请输入新密码', trigger: 'blur'},
    {type: 'string', min: 6, message: '密码不能少于6位'}
  ],
  againPassword: [
    {required: true, message: '请输入新密码', trigger: 'blur'},
    {type: 'string', min: 6, message: '密码不能少于6位'}
  ]
};
const ruleInline = { // 验证规则
  password: [
    {required: true, message: '请输入旧密码', trigger: 'blur'}
  ],
  newPassword: [
    {required: true, message: '请输入新密码', trigger: 'blur'},
    {type: 'string', min: 6, message: '密码不能少于6位'}
  ],
  againPassword: [
    {required: true, message: '请确认新密码', trigger: 'blur'},
    {type: 'string', min: 6, message: '密码不能少于6位'}
  ]
};

const formDataRef = ref(null);
const formRegisterRef = ref(null);
const formDataUpdateRef = ref(null);

const displayMobile = computed(() => {
  if (!mobile.value) return '未绑定手机号';
  return secrecyMobile(mobile.value);
});

function loadMobile () {
  const rawUserInfo = storage.getItem('userInfo');
  if (rawUserInfo) {
    try {
      const userInfo = JSON.parse(rawUserInfo);
      if (userInfo && userInfo.mobile) mobile.value = userInfo.mobile;
    } catch {
      // 缓存的用户信息解析失败时忽略，改走接口获取
    }
  }
  if (!storage.getItem('accessToken')) return;
  getMemberMsg().then(res => {
    if (res.success && res.result) {
      storage.setItem('userInfo', res.result);
      mobile.value = res.result.mobile || '';
    }
  }).catch((err) => {
    console.warn('获取会员信息失败', err);
  });
}

function normalizePwdError (message) {
  if (!message) return '修改失败，请稍后重试';
  if (String(message).includes('旧密码') || String(message).includes('密码不正确')) {
    return '旧密码不正确';
  }
  return message;
}

// 修改
function handleRegist () {
  formRegisterRef.value.validate((valid) => {
    if (valid) {
      const {newPassword, againPassword, password} = formRegister
      if (newPassword !== againPassword) {
        Message.error({
          content: '新密码和确认密码不一致'
        });
        return
      }
      const params = {newPassword, password}
      params.newPassword = md5(newPassword)
      params.password = md5(password)
      editPwd(params).then(res => {
        if (res.success && res.result) {
          Message.success('修改密码成功');
          router.push('/home')
        } else {
          Message.error(normalizePwdError(res.message));
        }
      }).catch((err) => {
        Message.error(normalizePwdError(err?.message || err?.data?.message));
      });
    }
  })
}

// 提交验证
function submitRegister () {
  formDataRef.value.validate((valid) => {
    if (valid) {
      showPwd.value = true
    }
  })
}

// 设置密码
function setPassword () {
  formDataUpdateRef.value.validate((valid) => {
    if (valid) {
      const {newPassword, againPassword} = formDataUpdate
      if (newPassword === '') {
        Message.error({
          content: '请输入密码'
        });
        return
      }
      if (newPassword !== againPassword) {
        Message.error({
          content: '新密码和确认密码不一致'
        });
        return
      }
      const params = {password: newPassword}
      params.password = md5(newPassword)
      setPwd(params).then(res => {
        if (res.message === 'success' && res.result) {
          Message.success('支付密码设置成功');
          router.push('/home')
        }
      });
    }
  })
}

onMounted(() => {
  status.value = route.query.status
  loadMobile()
});
</script>

<style scoped lang="scss">
  .wrapper {
    text-align: center;
  }
  .phone {
    text-align: left;
  }
</style>
