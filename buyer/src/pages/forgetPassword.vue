<template>
  <div class="login">
    <!-- 顶部logo -->
    <div class="top-content">
      <div class="logo-box">
        <img
          src="../assets/images/logo1.png"
          @click="$router.push('/')"
        />
        <div>修改密码</div>
      </div>
    </div>
    <div class="login-container">
        <!-- 验证手机号 -->
        <Form
          ref="formFirst"
          :model="formFirst"
          :rules="ruleInline"
          style="width:300px;"
          v-show="step === 0"
        >
          <FormItem prop="mobile">
            <i-input
              type="text"
              v-model="formFirst.mobile"
              clearable
              placeholder="手机号"
            >
              <Icon type="md-phone-portrait" slot="prepend"></Icon>
            </i-input>
          </FormItem>
          <FormItem prop="code">
            <i-input
              type="text"
              v-model="formFirst.code"
              clearable
              placeholder="手机验证码"
            >
              <Icon
                type="ios-text-outline"
                style="font-weight: bold"
                slot="prepend"
              />
              <Button slot="append" @click="sendCode">{{ codeMsg }}</Button>
            </i-input>
          </FormItem>
          <FormItem>
            <Button @click="verifyBtnClick" long :type="verifyStatus?'success':'default'">{{verifyStatus?'验证通过':'点击完成安全验证'}}</Button>
          </FormItem>
          <FormItem>
            <Button type="error" @click="next" :loading="loading" long>下一步</Button>
          </FormItem>
        </Form>
        <Form
          ref="form"
          :model="form"
          :rules="ruleInline"
          style="width:300px;"
          v-show="step === 1"
        >
          <FormItem prop="password">
            <i-input
              type="password"
              v-model="form.password"
              clearable
              placeholder="请输入至少六位密码"
            >
              <Icon type="md-lock" slot="prepend"></Icon>
            </i-input>
          </FormItem>
          <FormItem prop="password">
            <i-input
              type="password"
              v-model="form.oncePasd"
              clearable
              placeholder="请再次输入密码"
            >
              <Icon type="md-lock" slot="prepend"></Icon>
            </i-input>
          </FormItem>
          <FormItem>
            <Button type="error" size="large" @click="handleSubmit" :loading="loading1" long>提交</Button>
          </FormItem>
        </Form>
        <!-- 拼图验证码 -->
        <Verify
          ref="verify"
          class="verify-con"
          :verifyType="verifyType"
          @change="verifyChange"
        ></Verify>
        <div class="login-btn"><a @click="$router.push('login')">前往登录</a></div>
    </div>
    <div class="foot">
      <Row type="flex" justify="space-around" class="help">
        <a class="item" href="https://lilishop.com" target="_blank">帮助</a>
        <a class="item" href="https://lilishop.com" target="_blank">隐私</a>
        <a class="item" href="https://lilishop.com" target="_blank">条款</a>
      </Row>
      <Row type="flex" justify="center" class="copyright">
        Copyright © 2020 - Present
        <a href="http://lili.cn" target="_blank" style="margin: 0 5px"
          >lili-shop</a
        >
        版权所有
      </Row>
    </div>
  </div>
</template>

<script>
import * as RegExp from '@/plugins/RegExp.js';
import { md5 } from '@/plugins/md5.js';
import * as apiLogin from '@/api/login.js';
import { sendSms } from '@/api/common.js';
import Verify from '@/components/verify';
export default {
  name: 'Login',
  components: { Verify },
  data () {
    return {
      loading: false,
      loading1: false,
      formFirst: {
        // 注册表单
        mobile: '',
        code: ''
      },
      form: {
        password: '',
        oncePasd: ''
      },
      step: 0,
      ruleInline: {
        // 验证规则
        mobile: [
          { required: true, message: '请输入手机号码' },
          {
            pattern: RegExp.mobile,
            trigger: 'blur',
            message: '请输入正确的手机号'
          }
        ],
        code: [{ required: true, message: '请输入手机验证码' }],
        password: [{required: true, message: '密码不能为空'}, {pattern: RegExp.password, message: '密码不能少于6位'}]
      },
      verifyStatus: false,
      verifyType: 'FIND_USER',
      codeMsg: '发送验证码',
      interval: '',
      time: 60
    };
  },
  methods: {
    // 提交短信验证码，修改密码
    next () {
      this.$refs.formFirst.validate((valid) => {
        if (valid) {
          this.loading = true;
          let data = JSON.parse(JSON.stringify(this.formFirst));
          apiLogin.validateCode(data).then((res) => {
            this.loading = false;
            if (res.code === 200) {
            //   this.$Message.success('');
              this.step = 1;
            } else {
              this.$Message.warning(res.message);
            }
          }).catch(() => { this.loading = false; });
        } else {}
      });
    },
    handleSubmit () { // 提交密码
      this.$refs.form.validate(valid => {
        if (valid) {
          let params = JSON.parse(JSON.stringify(this.form));
          if (params.password !== params.oncePasd) {
            this.$Message.warning('两次输入密码不一致');
            return;
          };
          params.mobile = this.formFirst.mobile;
          params.password = md5(params.password);
          delete params.oncePasd;
          this.loading1 = true;

          apiLogin.resetPassword(params).then(res => {
            this.loading1 = false;
            console.log(res);
            if (res.code === 200) {
              this.$Message.success('修改密码成功');
              this.$router.push('login');
            }
          }).catch(() => { this.loading = false; });
        };
      });
    },
    sendCode () { // 发送验证码
      if (this.time === 60) {
        if (this.formFirst.mobile === '') {
          this.$Message.warning('请先填写手机号');
          return;
        }
        if (!this.verifyStatus) {
          this.$Message.warning('请先完成安全验证');
          return;
        }
        let params = {
          mobile: this.formFirst.mobile,
          verificationEnums: 'FIND_USER'
        };
        sendSms(params).then(res => {
          if (res.code === 200) {
            this.$Message.success('验证码发送成功');
            let that = this;
            this.interval = setInterval(() => {
              that.time--;
              if (that.time === 0) {
                that.time = 60;
                that.codeMsg = '重新发送';
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
    verifyChange (con) { // 验证通过
      if (!con.status) return;
      this.$refs.verify.show = false;
      this.verifyStatus = true;
    },
    verifyBtnClick () {
      if (!this.verifyStatus) {
        this.$refs.verify.show = true;
      }
    }
  },
  mounted () {
    this.$refs.formFirst.resetFields();
  },
  watch: {
  }
};
</script>
<style scoped lang="scss">
.login {
  height: 100%;
}
.top-content {
  width: 100%;
  height: 80px;
  position: relative;
  z-index: 1;
  box-shadow: 0 1px 1px #ddd;
  background-color: #fff;

  .logo-box {
    width: 80%;
    max-width: 1200px;
    height: 80px;
    margin: 0 auto;
    display: flex;
    align-items: center;
    img {
      width: 200px;
      cursor: pointer;
    }
  }
  div {
    font-size: 20px;
    margin-top: 10px;
  }
}

.login-container {
  position: relative;
  margin: 10px auto;
  width: 1200px;
  background-color: #fff;
  padding: 20px;
  .login-btn{
    position: absolute;
    right: 20px;
    top: 20px;
  }
}

.verify-con{
  position: absolute;
  left: 400px;
  top: 50px;
  z-index: 10;
}

.other-login {
  margin: 0 auto;
  .ivu-icon {
    font-size: 24px;
  }
}
.regist {
  display: flex;
  justify-content: flex-end;
  margin-top: -10px;
  span {
    margin-left: 10px;
    &:hover {
      cursor: pointer;
      color: $theme_color;
    }
  }
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
