<template>
  <div class="login" @keyup.enter="handleSubmit('formInline')">
    <!-- 顶部logo -->
    <div class="top-content" @click="hideVerify">
      <div class="logo-box">
        <img :src="$store.state.logoImg" @click="$router.push('/')" />
        <div>欢迎登录</div>
      </div>
    </div>
    <!-- 登录主体 包含轮播图 登录模块 -->
    <div class="login-container">
      <!-- 轮播 -->
      <el-carousel :interval="5000" arrow="never" class="login-carousel" height="550px">
        <el-carousel-item>
          <div class="demo-carousel" @click="hideVerify">
            <img src="https://lili-system.oss-cn-beijing.aliyuncs.com/background.jpg" />
          </div>
        </el-carousel-item>
      </el-carousel>
      <!-- 登录模块 -->
      <div class="form-box" @click="hideVerify">
        <div class="login-tabs">
          <span :class="{ active: type }" @click="type = true">账号登录</span>
          <span :class="{ active: !type }" @click="type = false">验证码登录</span>
        </div>

        <div>
          <div>
          <!-- 账号密码登录 -->
          <el-form ref="formInline" :model="formData" :rules="ruleInline" v-show="type === true"
                @click.self="hideVerify">
            <el-form-item prop="username">
              <el-input type="text" v-model="formData.username" clearable placeholder="用户名">
                <template #prepend><el-icon><User /></el-icon></template>
              </el-input>
            </el-form-item>
            <el-form-item prop="password">
              <el-input type="password" v-model="formData.password" clearable placeholder="密码">
                <template #prepend><el-icon><Lock /></el-icon></template>
              </el-input>
            </el-form-item>
            <el-form-item>
              <el-button class="login-btn" @click.stop="handleSubmit('formInline')">登录</el-button>
            </el-form-item>
          </el-form>
          <!-- 验证码登录 -->
          <el-form ref="formSms" :model="formSms" :rules="ruleInline" v-show="type === false"
                @click.self="hideVerify">
            <el-form-item prop="mobile">
              <el-input type="text" v-model="formSms.mobile" clearable placeholder="手机号">
                <template #prepend><el-icon><Iphone /></el-icon></template>
              </el-input>
            </el-form-item>
            <el-form-item prop="code">
              <el-input type="text" v-model="formSms.code" placeholder="手机验证码">
                <template #prepend><el-icon style="font-weight: bold"><Document /></el-icon></template>
                <template #append><el-button @click.stop="sendCode">{{ codeMsg }}</el-button></template>
              </el-input>
            </el-form-item>
            <el-form-item>
              <el-button class="login-btn" @click="handleSubmit('formSms')">登录</el-button>
            </el-form-item>
          </el-form>
        </div>
          <div class="other">
            <div class="other-login">
              <svg t="1631154795933" class="icon" @click="handleWebLogin('QQ')" viewBox="0 0 1024 1024" version="1.1"
                  xmlns="http://www.w3.org/2000/svg" p-id="4969" width="32" height="32">
                <path
                  d="M824.8 613.2c-16-51.4-34.4-94.6-62.7-165.3C766.5 262.2 689.3 112 511.5 112 331.7 112 256.2 265.2 261 447.9c-28.4 70.8-46.7 113.7-62.7 165.3-34 109.5-23 154.8-14.6 155.8 18 2.2 70.1-82.4 70.1-82.4 0 49 25.2 112.9 79.8 159-26.4 8.1-85.7 29.9-71.6 53.8 11.4 19.3 196.2 12.3 249.5 6.3 53.3 6 238.1 13 249.5-6.3 14.1-23.8-45.3-45.7-71.6-53.8 54.6-46.2 79.8-110.1 79.8-159 0 0 52.1 84.6 70.1 82.4 8.5-1.1 19.5-46.4-14.5-155.8z"
                  p-id="4970" fill="#1296db"></path>
              </svg>
              <svg t="1631154766336" class="icon" @click="handleWebLogin('WECHAT_PC')" viewBox="0 0 1024 1024"
                  version="1.1"
                  xmlns="http://www.w3.org/2000/svg" p-id="3844" width="32" height="32">
                <path
                  d="M683.058 364.695c11 0 22 1.016 32.943 1.976C686.564 230.064 538.896 128 370.681 128c-188.104 0.66-342.237 127.793-342.237 289.226 0 93.068 51.379 169.827 136.725 229.256L130.72 748.43l119.796-59.368c42.918 8.395 77.37 16.79 119.742 16.79 11 0 21.46-0.48 31.914-1.442a259.168 259.168 0 0 1-10.455-71.358c0.485-148.002 128.744-268.297 291.403-268.297l-0.06-0.06z m-184.113-91.992c25.99 0 42.913 16.79 42.913 42.575 0 25.188-16.923 42.579-42.913 42.579-25.45 0-51.38-16.85-51.38-42.58 0-25.784 25.93-42.574 51.38-42.574z m-239.544 85.154c-25.384 0-51.374-16.85-51.374-42.58 0-25.784 25.99-42.574 51.374-42.574 25.45 0 42.918 16.79 42.918 42.575 0 25.188-16.924 42.579-42.918 42.579z m736.155 271.655c0-135.647-136.725-246.527-290.983-246.527-162.655 0-290.918 110.88-290.918 246.527 0 136.128 128.263 246.587 290.918 246.587 33.972 0 68.423-8.395 102.818-16.85l93.809 50.973-25.93-84.677c68.907-51.93 120.286-119.815 120.286-196.033z m-385.275-42.58c-16.923 0-34.452-16.79-34.452-34.179 0-16.79 17.529-34.18 34.452-34.18 25.99 0 42.918 16.85 42.918 34.18 0 17.39-16.928 34.18-42.918 34.18z m188.165 0c-16.984 0-33.972-16.79-33.972-34.179 0-16.79 16.927-34.18 33.972-34.18 25.93 0 42.913 16.85 42.913 34.18 0 17.39-16.983 34.18-42.913 34.18z"
                  fill="#09BB07" p-id="3845"></path>
              </svg>
            </div>
            <div class="register">
              <span class="register-link" @click.stop="$router.push('signUp')">立即注册</span>
              <span @click.stop="$router.push('forgetPassword')">忘记密码</span>
            </div>
          </div>
        </div>
      </div>


      <!-- 拼图验证码 -->
      <verify ref="verify" class="verify-con" verifyType="LOGIN" @change="verifyChange"></verify>
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

<script>

import { Message, Spin } from "@/utils/message";
import * as RegExp from "@/plugins/RegExp.js";
import { md5 } from "@/plugins/md5.js";
import * as apiLogin from "@/api/login.js";
import { sendSms } from "@/api/common.js";
import { webLogin, loginCallback } from "@/api/login.js";
import storage from "@/plugins/storage.js";
import verify from "@/components/verify";
import { User, Lock, Document, Iphone } from "@element-plus/icons-vue";
import config from "@/config";

export default {
  name: "Login",
  components: {
    verify,
    User,
    Lock,
    Document,
    Iphone,
  },
  data() {
    return {
      config,
      type: true, // true 账号登录  false 验证码登录
      formData: {
        // 登录表单
        username: "",
        password: "",
      },
      formSms: {
        // 手机号登录
        code: "",
        mobile: "",
      },
      verifyStatus: false, // 是否图片验证通过
      codeSent: false, // 是否已成功发送短信验证码
      ruleInline: {
        // 验证规则
        username: [{required: true, message: "请输入用户名"}],
        password: [
          {required: true, message: "请输入密码"},
          {type: "string", min: 6, message: "密码不能少于6位"},
        ],
        mobile: [
          {required: true, message: "请输入手机号码"},
          {
            pattern: RegExp.mobile,
            message: "请输入正确的手机号",
          },
        ],
        code: [{required: true, message: "请输入手机验证码"}],
      },
      codeMsg: "发送验证码", // 验证码文字
      interval: null, // 定时器
      time: 60, // 倒计时
      year: new Date().getFullYear(),
    };
  },
  methods: {
    hideVerify() {
      this.$refs.verify?.close?.();
    },

    // 登录
    handleSubmit(name) {
      this.$refs[name].validate((valid) => {
        if (valid) {
          if (this.type) {
            this.$refs.verify?.init();
          } else {
            if (!this.codeSent) {
              Message.warning("请先获取短信验证码");
              return;
            }
            const data = JSON.parse(JSON.stringify(this.formSms));
            apiLogin.smsLogin(data).then((res) => {
              this.hideVerify();
              if (res.success) {
                Message.success("登录成功");
                storage.setItem("accessToken", res.result.accessToken);
                storage.setItem("refreshToken", res.result.refreshToken);
                storage.setItem('getTimes',0)
                apiLogin.getMemberMsg().then((res) => {
                  if (res.success) {
                    storage.setItem("userInfo", res.result);
                    let query = this.$route.query;
                    if (query.rePath) {
                      this.$router.push({
                        path: query.rePath,
                        query: JSON.parse(query.query),
                      });
                    } else {
                      this.$router.push("/");
                    }
                  }
                });
              } else {
                Message.error(res.message);
              }
            }).catch(() => {});
          }
        }
      });
    },
    // 发送手机验证码
    sendCode() {
      if (this.time !== 60) return;
      if (this.formSms.mobile === "") {
        Message.warning("请先填写手机号");
        return;
      }
      if (!RegExp.mobile.test(this.formSms.mobile)) {
        Message.warning("请输入正确的手机号");
        return;
      }
      this.$refs.verify?.init();
    },
    dispatchSms() {
      sendSms({
        mobile: this.formSms.mobile,
        verificationEnums: "LOGIN",
      }).then((res) => {
        if (res.success) {
          Message.success("验证码发送成功");
          this.codeSent = true;
          this.interval = setInterval(() => {
            this.time--;
            if (this.time === 0) {
              this.time = 60;
              this.codeMsg = "重新发送";
              this.verifyStatus = false;
              this.codeSent = false;
              clearInterval(this.interval);
            } else {
              this.codeMsg = this.time;
            }
          }, 1000);
        } else {
          this.verifyStatus = false;
          Message.warning(res.message);
        }
      }).catch(() => {
        this.verifyStatus = false;
      });
    },
    verifyChange(con) {
      // 拼图验证码回显
      if (!con.status) return;

      if (this.type === true) {
        // 账号密码登录
        let data = JSON.parse(JSON.stringify(this.formData));
        data.password = md5(data.password);
        this.hideVerify();
        Spin.show();
        apiLogin
          .login(data)
          .then((res) => {
            if (res.success) {
              this.loginSuccess(res.result.accessToken,res.result.refreshToken);
            } else {
              Spin.hide();
              Message.error(res.message);
            }
          })
          .catch(() => {
            Spin.hide();
          });
      } else {
        this.verifyStatus = true;
        this.hideVerify();
        this.dispatchSms();
      }
    },
    handleWebLogin(type) {
      // 第三方登录
      webLogin(type);
    },
    loginSuccess(accessToken,refreshToken){
      Message.success("登录成功");
      storage.setItem("accessToken", accessToken);
      storage.setItem("refreshToken", refreshToken);
      apiLogin.getMemberMsg().then((res) => {
        Spin.hide();
        if (res.success) {
          storage.setItem("userInfo", res.result);
          let query = this.$route.query;
          if (query.rePath) {
            this.$router.push({
              path: query.rePath,
              query: JSON.parse(query.query),
            });
          } else {
            this.$router.push("/");
          }
        }
      });
    },

  },
  beforeUnmount() {
    clearInterval(this.interval);
  },
  mounted() {
    let uuid = this.$route.query.state;
    if (uuid) {
      storage.setItem("uuid", uuid);
      loginCallback(uuid).then((res) => {
        if (res.success) {
          this.loginSuccess(res.result.accessToken,res.result.refreshToken);
        }
      });
    }
  },
  watch: {
    type(v) {
      if (v) {
        this.$refs.formInline.resetFields();
      } else {
        this.$refs.formSms.resetFields();
      }
      this.verifyStatus = false;
      this.codeSent = false;
      this.hideVerify();
      clearInterval(this.interval);
      this.codeMsg = "发送验证码";
      this.time = 60;
    },
    "formSms.mobile"() {
      this.codeSent = false;
      this.verifyStatus = false;
      clearInterval(this.interval);
      this.codeMsg = "发送验证码";
      this.time = 60;
    },
  },
};
</script>
<style scoped lang="scss">
.login {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.top-content {
  width: 100%;
  height: 72px;
  position: relative;
  z-index: 1;
  background-color: #fff;
  border-bottom: 1px solid #eee;

  .logo-box {
    width: 1200px;
    max-width: calc(100% - 48px);
    height: 72px;
    margin: 0 auto;
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
}

.login-carousel {
  width: 100%;
  height: 550px;

  .demo-carousel {
    height: 550px;
    width: 100%;
    overflow: hidden;

    img {
      display: block;
      width: 100%;
      height: 550px;
      object-fit: cover;
      object-position: center;
    }
  }
}

.login-container {
  --login-card-right: max(96px, 10%);
  position: relative;
  width: 100%;
  height: 550px;
}

.form-box {
  width: 460px;
  box-sizing: border-box;
  position: absolute;
  top: 48px;
  right: var(--login-card-right);
  padding: 32px 32px 24px;
  background: #fff;
  border-radius: 4px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);

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

.login-tabs {
  display: flex;
  gap: 32px;
  margin-bottom: 28px;
  border-bottom: 1px solid #f0f0f0;

  span {
    position: relative;
    padding-bottom: 14px;
    color: #666;
    font-size: 18px;
    line-height: 26px;
    cursor: pointer;

    &.active {
      color: #171A26;
      font-weight: 600;

      &::after {
        content: "";
        position: absolute;
        left: 0;
        right: 0;
        bottom: -1px;
        height: 2px;
        background: $theme_color;
      }
    }
  }
}

.login-btn {
  width: 100%;
  height: 48px;
  border-radius: 4px;
  font-size: 18px;
}

.login-btn {
  background: $theme_color !important;
  border-color: $theme_color !important;
  color: #fff !important;
}

.verify-con {
  position: absolute;
  right: var(--login-card-right);
  top: 90px;
  z-index: 10;
}

.other {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 4px;
}

.other-login {
  display: flex;
  align-items: center;
  gap: 12px;

  > svg {
    cursor: pointer;
    width: 32px;
    height: 32px;
  }
}

.register {
  display: flex;
  align-items: center;
  gap: 16px;
  font-size: 15px;

  span {
    color: #666;
    cursor: pointer;

    &:hover {
      color: $theme_color;
    }
  }

  .register-link {
    color: $theme_color;
  }
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


