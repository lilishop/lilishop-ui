<template>
  <div class="sign-up" @click="hideVerify">
    <div class="top-content">
      <div class="top-inner">
        <div class="logo-box">
          <img :src="logoImg" @click="$router.push('/')" />
          <div>欢迎注册</div>
        </div>
        <div class="to-login">已有账号？<a @click.stop="$router.push('login')">立即登录</a></div>
      </div>
    </div>
    <div class="signup-banner">
      <img
        class="signup-bg"
        src="https://lili-system.oss-cn-beijing.aliyuncs.com/background.jpg"
        alt=""
      />
      <div class="signup-card">
        <el-form
          ref="formRegistRef"
          :model="formRegist"
          :rules="ruleInline"
          class="signup-form"
        >
          <el-form-item prop="username">
            <el-input
              type="text"
              v-model="formRegist.username"
              clearable
              placeholder="用户名"
            >
              <template #prepend><el-icon><User /></el-icon></template>
            </el-input>
          </el-form-item>
          <el-form-item prop="password">
            <el-input
              type="password"
              v-model="formRegist.password"
              clearable
              placeholder="请输入大于6位密码"
            >
              <template #prepend><el-icon><Lock /></el-icon></template>
            </el-input>
          </el-form-item>
          <el-form-item prop="mobilePhone">
            <el-input
              type="text"
              v-model="formRegist.mobilePhone"
              clearable
              placeholder="手机号"
            >
              <template #prepend><el-icon><Iphone /></el-icon></template>
            </el-input>
          </el-form-item>
          <el-form-item prop="code">
            <el-input
              type="text"
              v-model="formRegist.code"
              clearable
              placeholder="手机验证码"
            >
              <template #prepend><el-icon style="font-weight: bold"><Document /></el-icon></template>
              <template #append><el-button @click.stop="sendCode">{{ codeMsg }}</el-button></template>
            </el-input>
          </el-form-item>
          <el-form-item>
            <el-button class="signup-btn" @click="handleRegist">注册</el-button>
          </el-form-item>
          <p class="agreement">点击注册，表示您同意《<router-link to="/article?id=1371992704333905920">商城用户协议</router-link>》</p>
        </el-form>
        <Verify
          ref="verify"
          class="verify-con"
          :verifyType="verifyType"
          @change="verifyChange"
        ></Verify>
      </div>
    </div>
    <div class="foot">
      <div type="flex" justify="space-around" class="help">
        <router-link to="/article" class="item">帮助</router-link>
        <router-link to="/article?id=1371779927900160000" class="item">隐私</router-link>
        <router-link to="/article?id=1371992704333905920" class="item">条款</router-link>
      </div>
      <div type="flex" justify="center" class="copyright">
        Copyright © {{year}} - Present
        <a href="https://pickmall.cn" target="_blank" style="margin: 0 5px">{{config.title}}</a>
        版权所有
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref, computed } from "vue";
import { useRouter } from "vue-router";
import { Message } from "@/utils/message";
import * as RegExp from '@/plugins/RegExp.js';
import { md5 } from '@/plugins/md5.js';
import * as apiLogin from '@/api/login.js';
import { sendSms } from '@/api/common.js';
import Verify from '@/components/verify';
import { User, Lock, Iphone, Document } from '@element-plus/icons-vue';
import config from '@/config';
import { useAppStore } from '@/stores/app';

defineOptions({ name: 'SignUp' });

const router = useRouter();
const appStore = useAppStore();
const logoImg = computed(() => appStore.logoImg);

const year = new Date().getFullYear();
const formRegist = reactive({
  // 注册表单
  mobilePhone: '',
  code: '',
  username: '',
  password: ''
});
const ruleInline = reactive({
  // 验证规则
  username: [{ required: true, message: '请输入用户名' }],
  password: [
    { required: true, message: '请输入密码' },
    { type: 'string', min: 6, message: '密码不能少于6位' }
  ],
  mobilePhone: [
    { required: true, message: '请输入手机号码' },
    {
      pattern: RegExp.mobile,
      trigger: 'blur',
      message: '请输入正确的手机号'
    }
  ],
  code: [{ required: true, message: '请输入手机验证码' }]
});
const verifyStatus = ref(false); // 是否验证通过
const verifyType = ref('REGISTER'); // 验证状态
const codeMsg = ref('发送验证码'); // 提示文字
const interval = ref(''); // 定时器
const time = ref(60); // 倒计时

const formRegistRef = ref(null);
const verify = ref(null);

function hideVerify() {
  verify.value?.close?.();
}

// 注册
function handleRegist () {
  formRegistRef.value.validate((valid) => {
    if (!valid) {
      return;
    }
    const data = JSON.parse(JSON.stringify(formRegist));
    data.password = md5(data.password);
    apiLogin.regist(data).then((res) => {
      if (res.success) {
        Message.success('注册成功!');
        router.push('login');
      } else {
        Message.warning(res.message || '注册失败');
      }
    }).catch((err) => {
      console.warn('注册请求失败', err);
    });
  }).catch(() => {
    // 表单校验使用回调模式，此 catch 仅为兜底
  });
}

// 发送短信验证码
function sendCode () {
  if (time.value !== 60) return;
  if (formRegist.mobilePhone === '') {
    Message.warning('请先填写手机号');
    return;
  }
  if (!RegExp.mobile.test(formRegist.mobilePhone)) {
    Message.warning('请输入正确的手机号');
    return;
  }
  verify.value?.init();
}

function dispatchSms () {
  sendSms({
    mobile: formRegist.mobilePhone,
    verificationEnums: 'REGISTER'
  }).then(res => {
    if (res.success) {
      Message.success('验证码发送成功');
      interval.value = setInterval(() => {
        time.value--;
        if (time.value === 0) {
          time.value = 60;
          codeMsg.value = '重新发送';
          verifyStatus.value = false;
          clearInterval(interval.value);
        } else {
          codeMsg.value = time.value;
        }
      }, 1000);
    } else {
      verifyStatus.value = false;
      Message.warning(res.message || '验证码发送失败');
    }
  }).catch(() => {
    verifyStatus.value = false;
  });
}

function verifyChange (con) {
  if (!con.status) return;
  hideVerify();
  verifyStatus.value = true;
  dispatchSms();
}

onMounted(() => {
  formRegistRef.value.resetFields();
});
</script>
<style scoped lang="scss">
.sign-up {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f5f5f5;
}

.top-content {
  background: #fff;
  border-bottom: 1px solid #eee;
}

.top-inner {
  width: 1200px;
  max-width: calc(100% - 48px);
  height: 72px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.logo-box {
  display: flex;
  align-items: center;

  img {
    height: 36px;
    width: auto;
    cursor: pointer;
  }

  div {
    margin-left: 16px;
    padding-left: 16px;
    border-left: 1px solid #e5e5e5;
    font-size: 18px;
    font-weight: 600;
    color: #171A26;
    line-height: 24px;
  }
}

.to-login {
  font-size: 15px;
  color: #666;

  a {
    margin-left: 4px;
    color: $theme_color;
    cursor: pointer;
  }
}

.signup-banner {
  position: relative;
  height: 680px;
  overflow: hidden;
}

.signup-bg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
}

.signup-card {
  position: absolute;
  top: 50%;
  right: max(72px, 8%);
  transform: translateY(-50%);
  z-index: 1;
  width: 480px;
  box-sizing: border-box;
  padding: 36px 40px 28px;
  background: #fff;
  border-radius: 4px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
}

.signup-form {
  width: 100%;
}

.signup-card {
  :deep(.el-form-item) {
    margin-bottom: 22px;
  }

  :deep(.el-form-item__error) {
    padding-top: 2px;
    font-size: 12px;
    line-height: 16px;
  }

  :deep(.el-input__wrapper),
  :deep(.el-input-group__prepend),
  :deep(.el-input-group__append) {
    box-shadow: none;
    background: #fff;
  }

  :deep(.el-input) {
    height: 48px;
    border: 1px solid #e5e5e5;
    border-radius: 4px;
  }

  :deep(.el-input__inner) {
    height: 48px;
    font-size: 16px;
    color: #171A26;
  }

  :deep(.el-input-group__prepend) {
    padding: 0 14px;
    color: #999;
    font-size: 18px;
    border-right: 1px solid #f0f0f0;
  }

  :deep(.el-input-group__append) {
    padding: 0;
    border-left: 1px solid #f0f0f0;
  }

  :deep(.el-input-group__append .el-button) {
    height: 46px;
    margin: 0;
    padding: 0 14px;
    border: none;
    color: $theme_color;
    font-size: 16px;
    background: transparent;
  }
}

.signup-btn {
  width: 100%;
  height: 48px;
  border-radius: 4px;
  font-size: 18px;
  background: $theme_color !important;
  border-color: $theme_color !important;
  color: #fff !important;
}

.agreement {
  margin: 0;
  font-size: 14px;
  line-height: 22px;
  color: #999;

  a {
    color: $theme_color;
    text-decoration: none;
  }
}

.verify-con {
  position: absolute;
  left: 50%;
  top: 120px;
  transform: translateX(-50%);
  z-index: 10;
}

.foot {
  position: fixed;
  bottom: 24px;
  width: 420px;
  left: calc(50% - 210px);
  color: #999;
  font-size: 14px;
  text-align: center;

  .help {
    display: flex;
    justify-content: center;
    gap: 24px;
    margin-bottom: 8px;

    .item {
      color: #666;
      text-decoration: none;

      &:hover {
        color: $theme_color;
      }
    }
  }

  .copyright {
    display: flex;
    justify-content: center;
    align-items: center;

    a {
      color: #666;
      text-decoration: none;
    }
  }
}
</style>
