<template>
  <div class="login" @click="$refs.verify.show = false">
    <div class="login-brand">
      <div class="brand-inner">
        <p class="brand-name">LILISHOP</p>
        <h1 class="brand-title">企业级电商运营管理平台</h1>
        <p class="brand-desc">为平台运营团队提供稳定、高效、可扩展的管理能力</p>
        <ul class="brand-features">
          <li>全渠道订单与售后协同处理</li>
          <li>商品、营销、会员一体化运营</li>
          <li>多店铺管理与经营数据分析</li>
        </ul>
      </div>
      <p class="brand-copyright">Copyright © {{ year }} Lilishop</p>
    </div>

    <div class="login-panel" @keyup.enter="submitLogin">
      <div class="login-wrap">
        <Header />

        <div class="login-intro">
          <h2 class="login-title">账号登录</h2>
          <p class="login-subtitle">请使用管理员账号登录运营后台</p>
        </div>

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

        <el-button
          class="login-btn"
          type="primary"
          size="large"
          :loading="loading"
          @click="submitLogin"
        >
          <span v-if="!loading">{{ $t("login") }}</span>
          <span v-else>{{ $t("logining") }}</span>
        </el-button>

        <verify
          ref="verify"
          class="verify-con"
          verifyType="LOGIN"
          @change="verifyChange"
        />
        <Footer />
      </div>
    </div>
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
      year: new Date().getFullYear(),
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
  display: flex;
  min-height: 100vh;
  width: 100%;
  background: #fff;
}

.login-brand {
  position: relative;
  flex: 0 0 46%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 56px 64px;
  color: #fff;
  background: linear-gradient(160deg, #1b2a41 0%, #243a5c 52%, #1a2f4d 100%);
  overflow: hidden;

  &::before {
    content: "";
    position: absolute;
    inset: 0;
    background:
      radial-gradient(circle at 18% 22%, rgba($theme_color, 0.22), transparent 36%),
      radial-gradient(circle at 82% 78%, rgba(255, 255, 255, 0.08), transparent 30%);
    pointer-events: none;
  }

  &::after {
    content: "";
    position: absolute;
    left: 0;
    top: 0;
    width: 4px;
    height: 100%;
    background: linear-gradient(180deg, $theme_color 0%, $warning_color 100%);
  }

  .brand-inner {
    position: relative;
    z-index: 1;
    max-width: 460px;
    margin-top: 8vh;
  }

  .brand-name {
    margin: 0 0 18px;
    font-size: 14px;
    font-weight: 600;
    letter-spacing: 4px;
    color: rgba(255, 255, 255, 0.72);
  }

  .brand-title {
    margin: 0;
    font-size: 34px;
    line-height: 1.35;
    font-weight: 600;
    letter-spacing: 1px;
  }

  .brand-desc {
    margin: 18px 0 0;
    font-size: 15px;
    line-height: 1.7;
    color: rgba(255, 255, 255, 0.72);
  }

  .brand-features {
    margin: 36px 0 0;
    padding: 0;
    list-style: none;

    li {
      position: relative;
      padding-left: 18px;
      margin-bottom: 14px;
      font-size: 14px;
      line-height: 1.6;
      color: rgba(255, 255, 255, 0.86);

      &::before {
        content: "";
        position: absolute;
        left: 0;
        top: 9px;
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: $theme_color;
      }
    }
  }

  .brand-copyright {
    position: relative;
    z-index: 1;
    margin: 0;
    font-size: 13px;
    color: rgba(255, 255, 255, 0.45);
  }
}

.login-panel {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 48px 32px;
  background: #f7f9fc;
}

.login-wrap {
  position: relative;
  width: 400px;
  padding: 40px 42px 32px;
  background: #fff;
  border: 1px solid #e8edf3;
  border-radius: 12px;
  box-shadow: 0 12px 32px rgba(31, 45, 61, 0.06);
}

:deep(.header) {
  margin-bottom: 0;
  justify-content: flex-start !important;
}

:deep(.logo) {
  width: 168px !important;
  height: auto !important;
}

.login-intro {
  margin: 28px 0 32px;

  .login-title {
    margin: 0;
    font-size: 24px;
    font-weight: 600;
    color: #1f2329;
  }

  .login-subtitle {
    margin: 10px 0 0;
    font-size: 14px;
    color: #8a9199;
  }
}

:deep(.el-input__wrapper) {
  background-color: #fff !important;
  box-shadow: 0 0 0 1px #dce3eb inset !important;
  border-radius: 8px;
  padding: 4px 14px;
  transition: box-shadow 0.2s ease;

  &.is-focus {
    box-shadow: 0 0 0 1px $theme_color inset,
      0 0 0 3px rgba($theme_color, 0.12) !important;
  }
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
  border: none;
  border-radius: 8px;
  font-size: 15px;
  letter-spacing: 2px;
  background: $theme_color;
  box-shadow: none;
  transition: background-color 0.2s ease, opacity 0.2s ease;

  &:hover {
    background: color-mix(in srgb, #{$theme_color} 96%, black);
    opacity: 1;
  }
}

:deep(.foot) {
  position: static;
  width: 100%;
  margin-top: 28px;
  color: #9aa3ad;
}

:deep(.foot .item),
:deep(.foot .href) {
  color: #9aa3ad !important;
}

:deep(.foot .item:hover) {
  color: #6b7280 !important;
}

@media (max-width: 992px) {
  .login {
    flex-direction: column;
  }

  .login-brand {
    flex: none;
    padding: 36px 28px 28px;

    .brand-inner {
      margin-top: 0;
    }

    .brand-title {
      font-size: 26px;
    }

    .brand-features {
      margin-top: 24px;
    }

    .brand-copyright {
      display: none;
    }
  }

  .login-panel {
    padding: 24px 20px 40px;
  }

  .login-wrap {
    width: 100%;
    max-width: 400px;
    padding: 32px 24px 24px;
  }
}
</style>
