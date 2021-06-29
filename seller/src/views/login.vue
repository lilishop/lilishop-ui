<template>
  <div class="login" @click="$refs.verify.show = false">
    <Row type="flex" @keydown.enter.native="submitLogin">
      <Col style="width: 368px">
      <Header />
      <Row style="flex-direction: column;">
        <Form ref="usernameLoginForm" :model="form" :rules="rules" class="form">
          <FormItem prop="username">
            <Input v-model="form.username" prefix="ios-contact" size="large" clearable placeholder="请输入用户名" autocomplete="off" />
          </FormItem>
          <FormItem prop="password">
            <Input type="password" v-model="form.password" prefix="ios-lock" size="large" password placeholder="请输入密码" autocomplete="off" />
          </FormItem>
        </Form>

        <Row>
          <Button class="login-btn" type="primary" size="large" :loading="loading" @click="submitLogin" long>
            <span v-if="!loading">{{ $t("login") }}</span>
            <span v-else>{{ $t("logining") }}</span>
          </Button>
        </Row>

      </Row>
      <Footer />
      <!-- 拼图验证码 -->
      <verify ref="verify" class="verify-con" verifyType="LOGIN" @change="verifyChange"></verify>
      </Col>
      <!-- <LangSwitch /> -->
    </Row>
  </div>
</template>

<script>
import { login, userMsg } from "@/api/index";
import { validateMobile } from "@/libs/validate";
import Cookies from "js-cookie";
import Header from "@/views/main-components/header";
import Footer from "@/views/main-components/footer";
import LangSwitch from "@/views/main-components/lang-switch";
import util from "@/libs/util.js";
import verify from "@/views/my-components/verify";
export default {
  components: {
    LangSwitch,
    Header,
    Footer,
    verify,
  },
  data() {
    return {
      saveLogin: true, // 保存登录状态
      loading: false, // 加载状态
      form: {
        // 表单数据
        username: "",
        password: "",
        mobile: "",
        code: "",
      },
      rules: {
        // 验证规则
        username: [
          {
            required: true,
            message: "账号不能为空",
            trigger: "blur",
          },
        ],
        password: [
          {
            required: true,
            message: "密码不能为空",
            trigger: "blur",
          },
        ],
        imgCode: [
          {
            required: true,
            message: "验证码不能为空",
            trigger: "blur",
          },
        ],
        mobile: [
          {
            required: true,
            message: "手机号不能为空",
            trigger: "blur",
          },
          {
            validator: validateMobile,
            trigger: "blur",
          },
        ],
      },
    };
  },
  methods: {
    afterLogin(res) {
      let accessToken = res.result.accessToken;
      this.setStore("accessToken", accessToken);
      this.setStore("refreshToken", res.result.refreshToken);

      // 获取用户信息
      userMsg().then((res) => {
        if (res.success) {
          this.setStore("saveLogin", this.saveLogin);
          if (this.saveLogin) {
            // 保存7天
            Cookies.set("userInfo", JSON.stringify(res.result), {
              expires: 7,
            });
          } else {
            Cookies.set("userInfo", JSON.stringify(res.result));
          }
          this.setStore("userInfo", res.result);
          this.$store.commit("setAvatarPath", res.result.storeLogo);
          // 加载菜单
          util.initRouter(this);
          this.$router.push({
            name: "home_index",
          });
        } else {
          this.loading = false;
        }
      });
    },
    submitLogin() {
      // 登录提交
      this.$refs.usernameLoginForm.validate((valid) => {
        if (valid) {
          this.$refs.verify.init();
        }
      });
    },
    verifyChange(con) {
      // 拼图验证码回显
      if (!con.status) return;

      this.loading = true;
      login({
        username: this.form.username,
        password: this.md5(this.form.password),
      })
        .then((res) => {
          this.loading = false;
          if (res && res.success) {
            this.afterLogin(res);
          }
        })
        .catch(() => {
          this.loading = false;
        });
      this.$refs.verify.show = false;
    },
  },
};
</script>
<style lang="scss" scoped>
.row {
  padding: 70px 50px;
  border-radius: 0.8em;
}
.login {
  height: 100%;
  background: url("../assets/background.png") no-repeat;
  background-size: 100%;
  background-position-y: bottom;
  background-color: #edf0f3;
  display: flex;
  align-items: center;
  justify-content: center;

  .ivu-tabs-nav-container {
    line-height: 2;
    font-size: 17px;
    box-sizing: border-box;
    white-space: nowrap;
    overflow: hidden;
    position: relative;
    zoom: 1;
  }
  /deep/ .ivu-row {
    display: flex;

  }
  .verify-con {
    position: absolute;
    top: 126px;
    z-index: 10;
    left: 20px;
  }
  .form {
    padding-top: 1vh;

    .input-verify {
      width: 67%;
    }
  }

  .forget-pass,
  .other-way {
    font-size: 14px;
  }

  .login-btn,
  .other-login {
    margin-top: 3vh;
  }

  .icons {
    display: flex;
    align-items: center;
  }

  .other-icon {
    cursor: pointer;
    margin-left: 10px;
    display: flex;
    align-items: center;
    color: rgba(0, 0, 0, 0.2);

    :hover {
      color: #2d8cf0;
    }
  }
}
.flex {
  justify-content: center;
}
</style>
