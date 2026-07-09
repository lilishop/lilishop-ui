<template>
  <div class="forget-password" @click="$refs.verify.show = false">
    <div style="height: 50px"></div>
    <div class="logo-box">
      <img :src="$store.state.logoImg" width="150" @click="$router.push('/')" />
      <div>修改密码</div>
    </div>
    <div class="login-container">
      <el-form
        ref="formFirst"
        :model="formFirst"
        :rules="ruleInline"
        style="width: 300px"
        v-show="step === 0"
      >
        <el-form-item prop="mobile">
          <el-input v-model="formFirst.mobile" clearable placeholder="手机号">
            <template #prepend>
              <el-icon><Iphone /></el-icon>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item prop="code">
          <el-input v-model="formFirst.code" clearable placeholder="手机验证码">
            <template #prepend>
              <el-icon><Message /></el-icon>
            </template>
            <template #append>
              <el-button @click="sendCode">{{ codeMsg }}</el-button>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item>
          <el-button
            style="width: 100%"
            :type="verifyStatus ? 'success' : 'default'"
            @click="verifyBtnClick"
          >
            {{ verifyStatus ? "验证通过" : "点击完成安全验证" }}
          </el-button>
        </el-form-item>
        <el-form-item>
          <el-button type="danger" style="width: 100%" :loading="loading" @click="next">
            下一步
          </el-button>
        </el-form-item>
      </el-form>
      <el-form
        ref="form"
        :model="form"
        :rules="ruleInline"
        style="width: 300px"
        v-show="step === 1"
      >
        <el-form-item prop="password">
          <el-input
            v-model="form.password"
            type="password"
            show-password
            clearable
            placeholder="请输入至少六位密码"
          >
            <template #prepend>
              <el-icon><Lock /></el-icon>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item prop="oncePasd">
          <el-input
            v-model="form.oncePasd"
            type="password"
            show-password
            clearable
            placeholder="请再次输入密码"
          >
            <template #prepend>
              <el-icon><Lock /></el-icon>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item>
          <el-button
            type="danger"
            size="large"
            style="width: 100%"
            :loading="loading1"
            @click="handleSubmit"
          >
            提交
          </el-button>
        </el-form-item>
      </el-form>
      <verify
        ref="verify"
        class="verify-con"
        :verifyType="verifyType"
        @change="verifyChange"
      />
      <div class="login-btn"><a @click="$router.push('login')">前往登录</a></div>
    </div>
    <div class="foot">
      <el-row justify="space-around" class="help">
        <a class="item" href="https://pickmall.cn/" target="_blank">帮助</a>
        <a class="item" href="https://pickmall.cn/" target="_blank">隐私</a>
        <a class="item" href="https://pickmall.cn/" target="_blank">条款</a>
      </el-row>
      <el-row justify="center" class="copyright">
        Copyright © {{ year }} - Present
        <a href="https://pickmall.cn/" target="_blank" style="margin: 0 5px">{{
          config.title
        }}</a>
        版权所有
      </el-row>
    </div>
  </div>
</template>

<script>
import { Iphone, Message, Lock } from "@element-plus/icons-vue";
import * as RegExp from "@/utils/regular.js";
import * as apiLogin from "@/api/index.js";
import { sendSms } from "@/api/common.js";
import config from "@/config/index";
import verify from "@/views/my-components/verify";

export default {
  name: "ForgetPassword",
  components: { verify, Iphone, Message, Lock },
  data() {
    return {
      config,
      loading: false,
      loading1: false,
      formFirst: {
        mobile: "",
        code: "",
      },
      form: {
        password: "",
        oncePasd: "",
      },
      year: new Date().getFullYear(),
      step: 0,
      ruleInline: {
        mobile: [
          { required: true, message: "请输入手机号码" },
          {
            pattern: RegExp.mobile,
            trigger: "blur",
            message: "请输入正确的手机号",
          },
        ],
        code: [{ required: true, message: "请输入手机验证码" }],
        password: [
          { required: true, message: "密码不能为空" },
          { pattern: RegExp.password, message: "密码不能少于6位" },
        ],
      },
      verifyStatus: false,
      verifyType: "FIND_USER",
      codeMsg: "发送验证码",
      interval: "",
      time: 60,
    };
  },
  methods: {
    next() {
      this.$refs.formFirst.validate((valid) => {
        if (valid) {
          this.loading = true;
          const data = JSON.parse(JSON.stringify(this.formFirst));
          apiLogin
            .validateCode(data)
            .then((res) => {
              this.loading = false;
              if (res.success) {
                this.step = 1;
              } else {
                this.$Message.warning(res.message);
              }
            })
            .catch(() => {
              this.loading = false;
            });
        }
      });
    },
    handleSubmit() {
      this.$refs.form.validate((valid) => {
        if (valid) {
          const params = JSON.parse(JSON.stringify(this.form));
          if (params.password !== params.oncePasd) {
            this.$Message.warning("两次输入密码不一致");
            return;
          }
          params.mobile = this.formFirst.mobile;
          params.password = this.md5(params.password);
          delete params.oncePasd;
          this.loading1 = true;

          apiLogin
            .forgetAndModify(params)
            .then((res) => {
              this.loading1 = false;
              if (res.success) {
                this.$Message.success("修改密码成功");
                this.$router.push("login");
              }
            })
            .catch(() => {
              this.loading1 = false;
            });
        }
      });
    },
    sendCode() {
      if (this.time === 60) {
        if (this.formFirst.mobile === "") {
          this.$Message.warning("请先填写手机号");
          return;
        }
        if (!this.verifyStatus) {
          this.$Message.warning("请先完成安全验证");
          return;
        }
        const params = {
          mobile: this.formFirst.mobile,
          verificationEnums: "FIND_USER",
        };
        sendSms(params).then((res) => {
          if (res.success) {
            this.$Message.success("验证码发送成功");
            const that = this;
            this.interval = setInterval(() => {
              that.time--;
              if (that.time === 0) {
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
        });
      }
    },
    verifyChange(con) {
      if (!con.status) return;
      this.$refs.verify.show = false;
      this.verifyStatus = true;
    },
    verifyBtnClick() {
      if (!this.verifyStatus) {
        this.$refs.verify.init();
      }
    },
  },
  mounted() {
    document.querySelector(".forget-password").style.height = window.innerHeight + "px";
    this.$refs.formFirst.resetFields();
  },
};
</script>

<style scoped lang="scss">
.forget-password {
  min-height: 700px;
}
.logo-box {
  width: 600px;
  height: 80px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  img {
    width: 150px;
    cursor: pointer;
  }
  div {
    font-size: 20px;
    margin-top: 10px;
  }
}

.login-container {
  border-top: 2px solid $theme_color;
  position: relative;
  margin: 0 auto;
  width: 600px;
  background-color: #fff;
  padding: 20px 150px;
  .login-btn {
    position: absolute;
    right: 20px;
    top: -45px;
  }
}

.verify-con {
  position: absolute;
  left: 140px;
  top: -30px;
  z-index: 10;
}

.foot {
  position: fixed;
  bottom: 4vh;
  width: 368px;
  left: calc(50% - 184px);
  color: rgba(0, 0, 0, 0.45);
  font-size: 14px;
  .help {
    margin: 0 auto;
    margin-bottom: 1vh;
    width: 60%;
    .item {
      color: rgba(0, 0, 0, 0.45);
    }
    :hover {
      color: rgba(0, 0, 0, 0.65);
    }
  }
}
</style>
