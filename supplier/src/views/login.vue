<template>
  <div
    class="login"
    :class="{ 'bg-s': isRetailer, 'bg-b': !isRetailer }"
    @click="$refs.verify.show = false"
  >
    <Row type="flex" @keydown.enter.native="submitLogin">
      <Col style="width: 368px">
        <login-header />
        <Row style="flex-direction: column">
          <Form
            ref="usernameLoginForm"
            :model="form"
            :rules="rules"
            class="form"
          >
            <FormItem prop="username">
              <Input
                v-model="form.username"
                prefix="ios-contact"
                size="large"
                clearable
                placeholder="请输入用户名"
                autocomplete="off"
              />
            </FormItem>
            <FormItem prop="password">
              <Input
                type="password"
                v-model="form.password"
                prefix="ios-lock"
                size="large"
                password
                placeholder="请输入密码"
                autocomplete="off"
              />
            </FormItem>
          </Form>

          <Row>
            <div
              class="login-btn"
              type="primary"
              size="large"
              :class="{ 'login-btn-s': isRetailer }"
              :loading="loading"
              @click="submitLogin"
              long
            >
              <span v-if="!loading">登录</span>
              <span v-else>登录中</span>
            </div>
          </Row>
        </Row>
        <login-footer />
        <!-- 拼图验证码 -->
        <verify
          ref="verify"
          class="verify-con"
          verifyType="LOGIN"
          @change="verifyChange"
        ></verify>
      </Col>
    </Row>
  </div>
</template>

<script>
import { login, userMsg } from "@/api/index";
import { loginSupplier, supplierMsg } from "@/api/supplier";
import Cookies from "js-cookie";
import Header from "@/views/main-components/header";
import Footer from "@/views/main-components/footer";
import util from "@/libs/util.js";
import verify from "@/views/my-components/verify";
export default {
  components: {
    "login-header": Header,
    "login-footer": Footer,
    verify,
  },
  data() {
    return {
      saveLogin: true, // 保存登录状态
      loading: false, // 加载状态
      isRetailer: false, //
      // selectClient: "Retailer",
      clientList: [
        { key: "Supplier", value: "供应端" },
        { key: "Retailer", value: "零售端" },
      ],
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
      },
    };
  },
  methods: {
    afterLogin(res) {
      let accessToken = res.result.accessToken;
      this.setStore("accessToken", accessToken);
      this.setStore("refreshToken", res.result.refreshToken);

      if (this.isRetailer) {
        // 获取用户信息
        userMsg().then((res) => {
          if (res.success) {
            this.setStore("saveLogin", this.saveLogin);
            this.setStore("role", "Retailer");
            if (this.saveLogin) {
              // 保存7天
              Cookies.set("userInfoSeller", JSON.stringify(res.result), {
                expires: 7,
              });
            } else {
              Cookies.set("userInfoSeller", JSON.stringify(res.result));
            }
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
      } else {
        supplierMsg().then((res) => {
          if (res.success) {
            this.setStore("saveLogin", this.saveLogin);
            this.setStore("role", "Supplier");
            if (this.saveLogin) {
              // 保存7天
              Cookies.set("userInfoSeller", JSON.stringify(res.result), {
                expires: 7,
              });
            } else {
              Cookies.set("userInfoSeller", JSON.stringify(res.result));
            }
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
      }
    },
    changeClient() {
      this.isRetailer = !this.isRetailer;
      Cookies.set("accessToken", "");
      Cookies.set("userInfoSeller", "");
      this.$store.commit("clearOpenedSubmenu");
      this.setStore("accessToken", "");
      this.setStore("role", "");
      window.localStorage.setItem("menuData", "");
      this.form.username = "";
      this.form.password = "";
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

      let fd = new FormData();
      fd.append("username", this.form.username);
      fd.append("password", this.md5(this.form.password));
      if (this.isRetailer) {
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
        loginSupplier(fd)
          .then((res) => {
            this.loading = false;
            if (res && res.success) {
              this.afterLogin(res);
            }
          })
          .catch(() => {
            this.loading = false;
          });
      }

      this.$refs.verify.show = false;
    },
  },
};
</script>
<style lang="scss" scoped>
.plaque {
  display: flex;
  align-items: center;
  justify-content: space-between;
  // height: 14px;
  margin-top: -30px;
}

.plaque-text {
  margin-left: 20px;
  font-size: 20px;
}

.bg-s {
  // background: url("../assets/background-s.svg") no-repeat;
  background: url("../assets/background.png") no-repeat;
}
.bg-b {
  background: url("../assets/background-s.svg") no-repeat;
}
.login {
  height: 100%;
  background-size: 100%;
  background-position-y: bottom;
  background-color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;

  .verify-con {
    position: absolute;
    top: 126px;
    z-index: 10;
    left: 20px;
  }
  .form {
    padding-top: 1vh;
  }
  .login-btn-s {
    background: linear-gradient(
      135deg,
      $warning_color 0%,
      $theme_color 100%
    ) !important;

    border-radius: 20px !important;
  }
  .login-btn {
    background: linear-gradient(135deg, $theme_color 0%, $warning_color 100%);
    height: 40px;
    cursor: pointer;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
    color: #fff;
    width: 100%;
    text-align: center;
    transition: 0.35s;
  }
  .login-btn:hover {
    opacity: 0.9;
    border-radius: 10px;
  }
}
</style>
