<template>
  <div class="login" @click="hideVerify">
    <div class="login-hero">
      <img class="login-bg" :src="loginBg" alt="" />
      <div class="login-panel" @keyup.enter="submitLogin">
        <div class="login-wrap">
        <img class="login-logo" :src="loginLogo" alt="LILISHOP" />
        <Header class="login-header-init" />

        <el-tabs v-model="loginType" class="login-tabs">
          <el-tab-pane label="账号登录" name="passwordLogin">
            <el-form
              ref="usernameLoginFormRef"
              :model="form"
              :rules="rules"
              class="form"
            >
              <el-form-item prop="username">
                <el-input
                  v-model="form.username"
                  size="large"
                  clearable
                  placeholder="请输入用户名"
                  autocomplete="off"
                >
                  <template #prefix>
                    <el-icon><User /></el-icon>
                  </template>
                </el-input>
              </el-form-item>
              <el-form-item prop="password">
                <el-input
                  v-model="form.password"
                  type="password"
                  size="large"
                  show-password
                  placeholder="请输入密码"
                  autocomplete="off"
                >
                  <template #prefix>
                    <el-icon><Lock /></el-icon>
                  </template>
                </el-input>
              </el-form-item>
            </el-form>
          </el-tab-pane>
          <el-tab-pane label="手机登录" name="mobileLogin">
            <el-form
              ref="formSmsRef"
              :model="formSms"
              :rules="ruleInline"
              class="form"
              @click.self="hideVerify"
            >
              <el-form-item prop="mobile">
                <el-input
                  v-model="formSms.mobile"
                  size="large"
                  maxlength="11"
                  clearable
                  placeholder="请输入手机号"
                >
                  <template #prefix>
                    <el-icon><Iphone /></el-icon>
                  </template>
                </el-input>
              </el-form-item>
              <el-form-item prop="code">
                <div class="code-field">
                  <el-input
                    v-model="formSms.code"
                    size="large"
                    placeholder="请输入验证码"
                    class="code-input"
                  >
                    <template #prefix>
                      <el-icon><Message /></el-icon>
                    </template>
                  </el-input>
                  <el-button
                    class="send-code-btn"
                    link
                    :disabled="!isMobileValid || time !== 60"
                    :loading="sendCodeLoading"
                    @click="sendCode"
                  >
                    {{ codeMsg }}
                  </el-button>
                </div>
              </el-form-item>
            </el-form>
          </el-tab-pane>
        </el-tabs>

        <el-button
          class="login-btn"
          type="primary"
          size="large"
          :loading="loading"
          :disabled="!canSubmitLogin"
          @click="submitLogin"
        >
          <span v-if="!loading">登录</span>
          <span v-else>登录中</span>
        </el-button>

        <verify
          ref="verifyRef"
          class="verify-con"
          verifyType="LOGIN"
          @change="verifyChange"
        />
      </div>
    </div>
    </div>
    <Footer class="login-footer" />
  </div>
</template>

<script setup>
import { computed, reactive, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { User, Lock, Iphone, Message } from "@element-plus/icons-vue";
import * as RegExp from "@/utils/regular.js";
import { sendSms } from "@/api/common.js";
import { login, storeSmsLogin, userMsg } from "@/api/index";
import util from "@/libs/util.js";
import { setStore } from "@/libs/storage";
import { ElMessage } from "element-plus";
import { md5 } from "@/utils/md5.js";
import Footer from "@/views/main-components/footer";
import Header from "@/views/main-components/header";
import verify from "@/views/my-components/verify";
import Cookies from "js-cookie";
import { useAppStore } from "@/stores/app";

const route = useRoute();
const router = useRouter();
const appStore = useAppStore();

const loginBg = require("@/assets/login-bg.jpg");
const loginLogo = require("@/assets/logo-lilishop.png");
const saveLogin = ref(true);
const sendCodeLoading = ref(false);
const loading = ref(false);
const verifyStatus = ref(false);
const smsCodeSent = ref(false);
const time = ref(60);
const loginType = ref("passwordLogin");
const form = reactive({
  username: "",
  password: "",
  mobile: "",
  code: "",
});
const formSms = reactive({
  mobile: "",
  code: "",
});
const rules = {
  username: [{ required: true, message: "账号不能为空", trigger: "blur" }],
  password: [{ required: true, message: "密码不能为空", trigger: "blur" }],
};
const ruleInline = {
  mobile: [
    { required: true, message: "请输入手机号码" },
    {
      pattern: RegExp.mobile,
      message: "请输入正确的手机号",
    },
  ],
  code: [{ required: true, message: "请输入手机验证码" }],
};
const codeMsg = ref("发送验证码");
let interval = null;

const usernameLoginFormRef = ref(null);
const formSmsRef = ref(null);
const verifyRef = ref(null);

const isMobileValid = computed(() => {
  return RegExp.mobile.test(formSms.mobile);
});
const canSubmitLogin = computed(() => {
  if (loginType.value === "passwordLogin") {
    return !!(form.username.trim() && form.password.trim());
  }
  return smsCodeSent.value;
});

watch(
  () => formSms.mobile,
  () => {
    smsCodeSent.value = false;
    verifyStatus.value = false;
    formSms.code = "";
  }
);

window.localStorage.setItem("menuData", "");

function hideVerify() {
  verifyRef.value.show = false;
}

function afterLogin(res) {
  const accessToken = res.result.accessToken;
  setStore("accessToken", accessToken);
  setStore("refreshToken", res.result.refreshToken);

  userMsg()
    .then((res) => {
      if (res.success) {
        setStore("saveLogin", saveLogin.value);
        if (saveLogin.value) {
          Cookies.set("userInfoSeller", JSON.stringify(res.result), {
            expires: 7,
          });
        } else {
          Cookies.set("userInfoSeller", JSON.stringify(res.result));
        }

        util.initRouter();
        appStore.setAvatarPath(res.result.storeLogo);

        const redirectRouter = route.query.redirect;
        router.push({
          path: redirectRouter || "/home",
        });
      } else {
        loading.value = false;
      }
    })
    .catch(() => {
      loading.value = false;
    });
}

function sendCode() {
  if (!isMobileValid.value) {
    ElMessage.warning("请输入正确的手机号");
    return;
  }
  if (!verifyStatus.value) {
    verifyRef.value.init();
    return;
  }
  if (time.value === 60) {
    sendCodeLoading.value = true;
    const params = {
      mobile: formSms.mobile,
      verificationEnums: "LOGIN",
    };
    sendSms(params)
      .then((res) => {
        if (res.success) {
          smsCodeSent.value = true;
          ElMessage.success("验证码发送成功");
          interval = setInterval(() => {
            time.value--;
            if (time.value === 0) {
              sendCodeLoading.value = false;
              time.value = 60;
              codeMsg.value = "重新发送";
              verifyStatus.value = false;
              clearInterval(interval);
            } else {
              codeMsg.value = time.value;
            }
          }, 1000);
        } else {
          ElMessage.warning(res.message);
        }
      })
      .catch(() => {
        sendCodeLoading.value = false;
      });
  }
}

function submitLogin() {
  if (!canSubmitLogin.value) return;

  if (loginType.value === "passwordLogin") {
    usernameLoginFormRef.value.validate((valid) => {
      if (valid) {
        verifyRef.value.init();
      }
    });
  } else if (loginType.value === "mobileLogin") {
    formSmsRef.value.validate((valid) => {
      if (valid) {
        loading.value = true;
        storeSmsLogin(formSms)
          .then((res) => {
            loading.value = false;
            if (res.success) {
              afterLogin(res);
            }
          })
          .catch(() => {
            loading.value = false;
          });
      }
    });
  }
}

function verifyChange(con) {
  if (!con.status) return;

  if (loginType.value === "passwordLogin") {
    loading.value = true;
    const fd = new FormData();
    fd.append("username", form.username);
    fd.append("password", md5(form.password));
    login(fd)
      .then((res) => {
        loading.value = false;
        if (res && res.success) {
          afterLogin(res);
        }
      })
      .catch(() => {
        loading.value = false;
      });
  } else {
    verifyStatus.value = true;
    sendCode();
  }

  hideVerify();
}
</script>

<style lang="scss" scoped>
.login {
  position: relative;
  min-height: 100vh;
  width: 100%;
  background-color: #fff;
  overflow: hidden;
}

.login-hero {
  position: relative;
  width: 100%;
  aspect-ratio: 1024 / 426;
}

.login-bg {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  object-fit: fill;
  pointer-events: none;
  user-select: none;
  z-index: 0;
}

.login-panel {
  position: absolute;
  inset: 0;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 0 12vw 0 0;
  background: transparent;
}

.login-wrap {
  position: relative;
  width: 320px;
  padding: 40px 42px 32px;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
}

.login-logo {
  display: block;
  width: 168px;
  height: auto;
  margin: 0 auto;
}

.login-header-init {
  display: none;
}

.login-tabs {
  margin-top: 28px;

  :deep(.el-tabs__header) {
    margin-bottom: 24px;
    display: flex;
    justify-content: center;
  }

  :deep(.el-tabs__nav-wrap) {
    flex: none;
  }

  :deep(.el-tabs__nav-wrap::after) {
    display: none;
  }

  :deep(.el-tabs__nav) {
    float: none;
    display: flex;
    justify-content: center;
  }

  :deep(.el-tabs__item) {
    padding: 0 0 12px;
    margin-right: 32px;
    height: auto;
    font-size: 15px;
    color: #8a9199;
    transition: color 0.2s ease, font-size 0.2s ease;

    &:last-child {
      margin-right: 0;
    }

    &.is-active {
      font-size: 18px;
      font-weight: 600;
      color: #1f2329;
    }

    &:hover {
      color: $theme_color;
    }
  }

  :deep(.el-tabs__active-bar) {
    height: 2px;
    background-color: $theme_color;
    border-radius: 1px;
  }
}

:deep(.el-input__wrapper) {
  background-color: #fff !important;
  box-shadow: 0 0 0 1px #e5e7eb inset !important;
  border-radius: 8px;
  padding: 4px 14px;
  transition: box-shadow 0.2s ease;

  &.is-focus {
    box-shadow: 0 0 0 1px $theme_color inset,
      0 0 0 3px rgba($theme_color, 0.12) !important;
  }
}

:deep(.el-input-group__prepend),
:deep(.el-input-group__append) {
  background-color: transparent;
  box-shadow: none;
  border: none;
  padding: 0;
}

:deep(.el-input-group__prepend) {
  padding-right: 8px;
}

:deep(.el-input-group__append) {
  padding-left: 8px;
}

:deep(.el-input__prefix) {
  color: #a0a7b0;
}

:deep(.el-input__inner) {
  background-color: transparent !important;

  &:-webkit-autofill,
  &:-webkit-autofill:hover,
  &:-webkit-autofill:focus,
  &:-webkit-autofill:active {
    -webkit-box-shadow: 0 0 0 1000px #fff inset !important;
    box-shadow: 0 0 0 1000px #fff inset !important;
    -webkit-text-fill-color: #606266 !important;
    caret-color: #606266;
    transition: background-color 99999s ease-out;
  }
}

:deep(.el-form-item) {
  margin-bottom: 22px;
}

.send-code-btn {
  flex-shrink: 0;
  min-width: 90px;
  padding: 0 4px;
  font-size: 14px;
  white-space: nowrap;
  color: $theme_color !important;

  &:not(.is-disabled):hover {
    opacity: 0.85;
  }

  &.is-disabled {
    color: #c0c4cc !important;
  }
}

.code-field {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;

  .code-input {
    flex: 1;
    min-width: 0;
  }
}

.verify-con {
  position: absolute;
  top: 150px;
  z-index: 10;
  left: 20px;
}

.form {
  padding-top: 2px;
}

.login-btn {
  width: 100%;
  height: 44px;
  margin-top: 4px;
  border: none !important;
  border-radius: 8px;
  font-size: 15px;
  letter-spacing: 2px;
  color: #fff !important;
  background: linear-gradient(135deg, $theme_color 0%, $warning_color 100%) !important;
  box-shadow: none;
  transition: opacity 0.2s ease;

  &:not(.is-disabled):hover {
    opacity: 0.9;
  }

  &.is-disabled,
  &.is-disabled:hover,
  &.is-disabled:focus {
    color: #fff !important;
    border-color: transparent !important;
    background: linear-gradient(
      135deg,
      rgba($theme_color, 0.45) 0%,
      rgba($warning_color, 0.45) 100%
    ) !important;
    opacity: 1;
    cursor: not-allowed;
  }
}

:deep(.login-footer.foot) {
  position: absolute;
  bottom: 24px;
  left: 0;
  right: 0;
  z-index: 2;
  width: 100%;
  margin-top: 0;
  text-align: center;
  color: #000;
}

:deep(.login-footer .information) {
  justify-content: center;
}

:deep(.login-footer .copyright p) {
  color: #000;
}

:deep(.login-footer a) {
  color: #000 !important;

  &:hover {
    color: #333 !important;
  }
}

@media (max-width: 992px) {
  .login-panel {
    justify-content: center;
    padding: 0 20px;
  }

  .login-wrap {
    width: 100%;
    max-width: 340px;
    padding: 32px 24px 24px;
  }
}
</style>
