<template>
  <div class="login" @click="$refs.verify.show = false">
    <el-row class="flex" @keyup.enter="submitLogin">
      <el-col style="width: 368px">
        <Header />
        <el-row style="flex-direction: column">
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

          <el-row>
            <el-button
              class="login-btn"
              type="primary"
              size="large"
              :loading="loading"
              style="width: 100%"
              @click="submitLogin"
            >
              <span v-if="!loading">{{ $t("login") }}</span>
              <span v-else>{{ $t("logining") }}</span>
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
import { User, Lock } from "@element-plus/icons-vue";
import { login, userInfo } from "@/api/index";
import Cookies from "js-cookie";
import Header from "@/views/main-parts/header";
import Footer from "@/views/main-parts/footer";
import util from "@/libs/util.js";
import verify from "@/components/verify";

export default {
  components: {
    Header,
    Footer,
    verify,
    User,
    Lock,
  },
  data() {
    return {
      loading: false,
      form: {
        username: "",
        password: "",
        mobile: "",
        code: "",
      },
      rules: {
        username: [
          { required: true, message: "账号不能为空", trigger: "blur" },
        ],
        password: [
          { required: true, message: "密码不能为空", trigger: "blur" },
        ],
      },
    };
  },
  methods: {
    afterLogin(res) {
      const accessToken = res.result.accessToken;
      const refreshToken = res.result.refreshToken;
      this.setStore("accessToken", accessToken);
      this.setStore("refreshToken", refreshToken);
      userInfo().then((res) => {
        if (res.success) {
          Cookies.set("userInfoManager", JSON.stringify(res.result));
          this.$store.commit("setAvatarPath", res.result.avatar);
          util.initRouter(this);
          this.$store.commit("setOpenedList");
          this.$store.commit("initCachePage");
          this.$router.push({ name: "home_index" });
        } else {
          this.loading = false;
        }
      });
    },
    submitLogin() {
      this.$refs.usernameLoginForm.validate((valid) => {
        if (valid) {
          this.$refs.verify.init();
        }
      });
    },
    verifyChange(con) {
      if (!con.status) return;
      this.loading = true;
      const fd = new FormData();
      fd.append("username", this.form.username);
      fd.append("password", this.md5(this.form.password));
      login(fd)
        .then((res) => {
          if (res && res.success) {
            this.afterLogin(res);
          } else {
            this.loading = false;
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
.login {
  height: 100%;
  background: url("../assets/background.png") no-repeat;
  background-color: #f0f2f5;
  display: flex;
  background-size: cover;
  align-items: center;
  justify-content: center;

  .verify-con {
    position: absolute;
    top: 150px;
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
}
.flex {
  justify-content: center;
}
</style>
