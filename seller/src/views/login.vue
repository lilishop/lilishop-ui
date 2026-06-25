<template>
  <div class="login" @click="$refs.verify.show = false">
    <el-row class="flex" @keyup.enter="submitLogin">
      <el-col style="width: 368px">
        <Header />
        <el-row style="flex-direction: column">
          <el-tabs v-model="loginType">
            <el-tab-pane label="账号密码登录" name="passwordLogin">
              <el-form
                ref="usernameLoginForm"
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
              <div class="register">
                <a @click="$router.push('forgetPassword')">忘记密码</a>
              </div>
            </el-tab-pane>
            <el-tab-pane label="验证码登录" name="mobileLogin">
              <el-form
                ref="formSms"
                :model="formSms"
                :rules="ruleInline"
                @click.self="$refs.verify.show = false"
              >
                <el-form-item prop="mobile">
                  <el-input
                    v-model="formSms.mobile"
                    maxlength="11"
                    clearable
                    placeholder="手机号"
                  >
                    <template #prepend>
                      <el-icon><Iphone /></el-icon>
                    </template>
                  </el-input>
                </el-form-item>
                <el-form-item prop="code">
                  <el-input v-model="formSms.code" placeholder="手机验证码">
                    <template #prepend>
                      <el-icon><Message /></el-icon>
                    </template>
                    <template #append>
                      <el-button @click="sendCode" :loading="sendCodeLoading">
                        {{ codeMsg }}
                      </el-button>
                    </template>
                  </el-input>
                </el-form-item>
              </el-form>
            </el-tab-pane>
          </el-tabs>
          <el-row>
            <el-button
              class="login-btn"
              type="primary"
              size="large"
              :loading="loading"
              style="width: 100%"
              @click="submitLogin"
            >
              <span v-if="!loading">登录</span>
              <span v-else>登录中</span>
            </el-button>
          </el-row>
        </el-row>
        <verify
          ref="verify"
          class="verify-con"
          verifyType="LOGIN"
          @change="verifyChange"
        />
        <Footer />
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { User, Lock, Iphone, Message } from "@element-plus/icons-vue";
import * as RegExp from "@/utils/regular.js";
import { sendSms } from "@/api/common.js";
import { login, storeSmsLogin, userMsg } from "@/api/index";
import util from "@/libs/util.js";
import Footer from "@/views/main-components/footer";
import Header from "@/views/main-components/header";
import verify from "@/views/my-components/verify";
import Cookies from "js-cookie";

export default {
  components: {
    Header,
    Footer,
    verify,
    User,
    Lock,
    Iphone,
    Message,
  },
  data() {
    return {
      saveLogin: true,
      sendCodeLoading: false,
      loading: false,
      verifyStatus: false,
      time: 60,
      loginType: "passwordLogin",
      form: {
        username: "",
        password: "",
        mobile: "",
        code: "",
      },
      formSms: {
        mobile: "",
        code: "",
      },
      rules: {
        username: [{ required: true, message: "账号不能为空", trigger: "blur" }],
        password: [{ required: true, message: "密码不能为空", trigger: "blur" }],
      },
      ruleInline: {
        mobile: [
          { required: true, message: "请输入手机号码" },
          {
            pattern: RegExp.mobile,
            message: "请输入正确的手机号",
          },
        ],
        code: [{ required: true, message: "请输入手机验证码" }],
      },
      codeMsg: "发送验证码",
    };
  },
  created() {
    window.localStorage.setItem("menuData", "");
  },
  methods: {
    afterLogin(res) {
      const accessToken = res.result.accessToken;
      this.setStore("accessToken", accessToken);
      this.setStore("refreshToken", res.result.refreshToken);

      userMsg().then((res) => {
        if (res.success) {
          this.setStore("saveLogin", this.saveLogin);
          if (this.saveLogin) {
            Cookies.set("userInfoSeller", JSON.stringify(res.result), {
              expires: 7,
            });
          } else {
            Cookies.set("userInfoSeller", JSON.stringify(res.result));
          }

          util.initRouter(this);
          this.$store.commit("setAvatarPath", res.result.storeLogo);

          const redirectRouter = this.$route.query.redirect;
          this.$router.push({
            path: redirectRouter || "/home",
          });
        } else {
          this.loading = false;
        }
      });
    },
    sendCode() {
      if (this.formSms.mobile === "") {
        this.$Message.warning("请先填写手机号");
        return;
      }
      if (!this.verifyStatus) {
        this.$refs.verify.init();
        return;
      }
      if (this.time === 60) {
        this.sendCodeLoading = true;
        const params = {
          mobile: this.formSms.mobile,
          verificationEnums: "LOGIN",
        };
        sendSms(params)
          .then((res) => {
            if (res.success) {
              this.$Message.success("验证码发送成功");
              const that = this;
              this.interval = setInterval(() => {
                that.time--;
                if (that.time === 0) {
                  this.sendCodeLoading = false;
                  that.time = 60;
                  that.codeMsg = "重新发送";
                  that.verifyStatus = false;
                  clearInterval(that.interval);
                } else {
                  that.codeMsg = that.time;
                }
              }, 1000);
            } else {
              this.$Message.warning(res.message);
            }
          })
          .catch(() => {
            this.sendCodeLoading = false;
          });
      }
    },
    submitLogin() {
      if (this.loginType === "passwordLogin") {
        this.$refs.usernameLoginForm.validate((valid) => {
          if (valid) {
            this.$refs.verify.init();
          }
        });
      } else if (this.loginType === "mobileLogin") {
        this.$refs.formSms.validate((valid) => {
          if (valid) {
            this.loading = true;
            storeSmsLogin(this.formSms)
              .then((res) => {
                this.loading = false;
                if (res.success) {
                  this.afterLogin(res);
                }
              })
              .catch(() => {
                this.loading = false;
              });
          }
        });
      }
    },
    verifyChange(con) {
      if (!con.status) return;

      if (this.loginType === "passwordLogin") {
        this.loading = true;
        const fd = new FormData();
        fd.append("username", this.form.username);
        fd.append("password", this.md5(this.form.password));
        login(fd)
          .then((res) => {
            this.loading = false;
            if (res && res.success) {
              this.afterLogin(res);
            }
          })
          .catch(() => {
            this.loading = false;
          });
      } else {
        this.verifyStatus = true;
        this.sendCode();
      }

      this.$refs.verify.show = false;
    },
  },
};
</script>

<style lang="scss" scoped>
.login {
  min-height: 100vh;
  width: 100%;
  box-sizing: border-box;
  background-color: #fff;
  background-image: url("../assets/background.png");
  background-repeat: no-repeat;
  background-position: center bottom;
  background-size: 100% auto;
  display: flex;
  align-items: center;
  justify-content: center;

  :deep(.el-input__wrapper) {
    background-color: #fff !important;
    box-shadow: 0 0 0 1px var(--el-border-color) inset !important;

    &.is-focus {
      box-shadow: 0 0 0 1px var(--el-border-color) inset !important;
    }
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

  .verify-con {
    position: absolute;
    top: 126px;
    z-index: 10;
    left: 20px;
  }

  .form {
    padding-top: 1vh;
  }

  .login-btn {
    background: linear-gradient(135deg, $theme_color 0%, $warning_color 100%);
    height: 40px;
    border: none;
  }

  .login-btn:hover {
    opacity: 0.9;
  }

  .register {
    text-align: right;
    margin-bottom: 12px;
    a {
      color: $theme_color;
      cursor: pointer;
    }
  }
}

.flex {
  justify-content: center;
}
</style>
