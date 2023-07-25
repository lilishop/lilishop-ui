 <template>
  <div class="login" @click="$refs.verify.show = false">
    <Row type="flex" @keydown.enter.native="submitLogin">
      <Col style="width: 368px">
      <Header />
      <Row style="flex-direction: column">
        <Tabs v-model="loginType">
          <Tab-pane label="账号密码登录" name="passwordLogin">
            <!--账号密码登录-->
            <Form ref="usernameLoginForm" :model="form" :rules="rules" class="form">
              <FormItem prop="username">
                <Input v-model="form.username" prefix="ios-contact" size="large" clearable placeholder="请输入用户名"
                  autocomplete="off" />
              </FormItem>
              <FormItem prop="password">
                <Input type="password" v-model="form.password" prefix="ios-lock" size="large" password placeholder="请输入密码"
                  autocomplete="off" />
              </FormItem>
            </Form>
            <div class="register">
              <a @click="$router.push('forgetPassword')">忘记密码</a>
            </div>
          </Tab-pane>
          <Tab-pane label="验证码登录" name="mobileLogin">
            <!-- 验证码登录 -->
            <Form ref="formSms" :model="formSms" :rules="ruleInline" @click.self='$refs.verify.show = false'>
              <FormItem prop="mobile">
                <i-input type="text" v-model="formSms.mobile" clearable placeholder="手机号">
                  <Icon type="md-lock" slot="prepend"></Icon>
                </i-input>
              </FormItem>
              <FormItem prop="code">
                <i-input type="text" v-model="formSms.code" placeholder="手机验证码">
                  <Icon type="ios-text-outline" style="font-weight: bold" slot="prepend" />
                  <Button slot="append" @click="sendCode">{{ codeMsg }}</Button>
                </i-input>
              </FormItem>
              <FormItem>
                <Button @click.stop="verifyBtnClick" long :type="verifyStatus ? 'success' : 'default'">{{ verifyStatus ?
                  '验证通过' :
                  '点击完成安全验证' }}
                </Button>
              </FormItem>
            </Form>
          </Tab-pane>
        </Tabs>
        <Row>
          <div class="login-btn" type="primary" size="large" :loading="loading" @click="submitLogin" long>
            <span v-if="!loading">登录</span>
            <span v-else>登录中</span>
          </div>
        </Row>
      </Row>
      <Footer />
      <!-- 拼图验证码 -->
      <verify ref="verify" class="verify-con" verifyType="LOGIN" @change="verifyChange"></verify>
      </Col>
    </Row>
  </div>
</template>

<script>
import { getCurrentPermissionList } from "@/api/index";
import { login, userMsg, storeSmsLogin } from "@/api/index";
import { sendSms } from "@/api/common.js";
import Cookies from "js-cookie";
import Header from "@/views/main-components/header";
import Footer from "@/views/main-components/footer";
import util from "@/libs/util.js";
import verify from "@/views/my-components/verify";
export default {
  components: {
    Header,
    Footer,
    verify,
  },
  data() {
    return {
      saveLogin: true, // 保存登录状态
      loading: false, // 加载状态
      verifyStatus: false, // 是否图片验证通过
      time: 60, // 倒计时
      loginType: 'passwordLogin', //登陆类型
      form: {
        // 表单数据
        username: "",
        password: "",
        mobile: "",
        code: "",
      },
      formSms: {
        mobile: '',
        code: '',
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
      ruleInline: {
        // 验证规则
        username: [{ required: true, message: "请输入用户名" }],
        password: [
          { required: true, message: "请输入密码" },
          { type: "string", min: 6, message: "密码不能少于6位" },
        ],
        mobile: [
          { required: true, message: "请输入手机号码" },
          {
            pattern: RegExp.mobile,
            message: "请输入正确的手机号",
          },
        ],
        code: [{ required: true, message: "请输入手机验证码" }],
      },
      codeMsg: "发送验证码", // 验证码文字
    };
  },
  created() {
    window.localStorage.setItem("menuData", "");
  },

  methods: {
    afterLogin(res) {
      let accessToken = res.result.accessToken;
      this.setStore("accessToken", accessToken);
      this.setStore("refreshToken", res.result.refreshToken);

      // 获取用户信息
      userMsg().then((res) => {
        if (res.success) {
          // location.reload();
          // this.$router.go(0);

          this.setStore("saveLogin", this.saveLogin);
          if (this.saveLogin) {
            // 保存7天
            Cookies.set("userInfoSeller", JSON.stringify(res.result), {
              expires: 7,
            });
          } else {
            Cookies.set("userInfoSeller", JSON.stringify(res.result));
          }

          util.initRouter(this);
          this.$store.commit("setAvatarPath", res.result.storeLogo);

          const redirectRouter = this.$route.query.redirect;
          // 加载菜单
          const push = {
            path: redirectRouter || "/home",
          }

          this.$router.push(push);
        } else {
          this.loading = false;
        }
      });
    },
    // 发送手机验证码
    sendCode() {
      if (this.time === 60) {
        if (this.formSms.mobile === "") {
          this.$Message.warning("请先填写手机号");
          return;
        }
        if (!this.verifyStatus) {
          this.$Message.warning("请先完成安全验证");
          return;
        }
        let params = {
          mobile: this.formSms.mobile,
          verificationEnums: "LOGIN",
        };
        sendSms(params).then((res) => {
          if (res.success) {
            this.$Message.success("验证码发送成功");
            let that = this;
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
    submitLogin() {
      // 登录提交
      if (this.loginType == 'passwordLogin') {
        this.$refs.usernameLoginForm.validate((valid) => {
          if (valid) {
            this.$refs.verify.init();
          }
        });
      } else if (this.loginType == 'mobileLogin') {
        this.$refs['formSms'].validate((valid) => {
          if (valid) {
            storeSmsLogin(this.formSms).then(res => {
              if (res.success) {
                this.afterLogin(res)
              }
            })
          }
        })
      }
    },
    verifyChange(con) {
      // 拼图验证码回显
      if (!con.status) return;

      if (this.loginType == 'passwordLogin') {
        this.loading = true;
        let fd = new FormData();
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
      }
      this.verifyStatus = true;
      this.$refs.verify.show = false;
    },

    // 开启滑块验证
    verifyBtnClick() {
      if (!this.verifyStatus) {
        this.$refs.verify.init();
      }
    },
  },
};
</script>
<style lang="scss" scoped>
.login {
  height: 100%;
  background: url("../assets/background.png") no-repeat;
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
