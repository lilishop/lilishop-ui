<template>
  <div class="login" @keyup.enter="handleSubmit('formInline')">
    <!-- 顶部logo -->
    <div class="top-content" @click='$refs.verify.show = false'>
      <div class="logo-box">
        <img
          :src="logoImg"
          @click="$router.push('/')"
        />
        <div>欢迎登录</div>
      </div>
    </div>
    <!-- 登录主体 包含轮播图 登录模块 -->
    <div class="login-container">
      <!-- 轮播 -->
      <Carousel loop :autoplay-speed="5000" class="login-carousel" arrow="never">
        <CarouselItem>
          <div class="demo-carousel" @click='$refs.verify.show = false'>
            <img
              src="https://wanmi-b2b.oss-cn-shanghai.aliyuncs.com/201811141632252680"
            />
          </div>
        </CarouselItem>
      </Carousel>
      <!-- 登录模块 -->
      <div class="form-box" @click='$refs.verify.show = false'>
        <div class="account-number">
          <div class="tab-switch">
            <span>{{type?'账号登录':'验证码登录'}}</span>
            <span @click="type = !type">{{type?'验证码登录':'账号登录'}}</span>
          </div>
          <div @click="$router.push('signUp')">立即注册</div>
        </div>
        <!-- 账号密码登录 -->
        <Form
          ref="formInline"
          :model="formData"
          :rules="ruleInline"
          v-show="type === true"
          @click.self='$refs.verify.show = false'
        >
          <FormItem prop="username">
            <i-input
              type="text"
              v-model="formData.username"
              clearable
              placeholder="用户名"
            >
              <Icon type="md-person" slot="prepend"></Icon>
            </i-input>
          </FormItem>
          <FormItem prop="password">
            <i-input
              type="password"
              v-model="formData.password"
              clearable
              placeholder="密码"
            >
              <Icon type="md-lock" slot="prepend"> </Icon>
            </i-input>
          </FormItem>
          <FormItem>
            <Button
              type="error"
              @click.stop="handleSubmit('formInline')"
              long
              >登录</Button>
          </FormItem>
        </Form>
        <!-- 验证码登录 -->
        <Form
          ref="formSms"
          :model="formSms"
          :rules="ruleInline"
          v-show="type === false"
          @click.self='$refs.verify.show = false'
        >
          <FormItem prop="mobile">
            <i-input
              type="text"
              v-model="formSms.mobile"
              clearable
              placeholder="手机号"
            >
              <Icon type="md-lock" slot="prepend"></Icon>
            </i-input>
          </FormItem>
          <FormItem prop="code">
            <i-input
              type="text"
              v-model="formSms.code"
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
            <Button @click.stop="verifyBtnClick" long :type="verifyStatus?'success':'default'">{{verifyStatus?'验证通过':'点击完成安全验证'}}</Button>
          </FormItem>
          <FormItem>
            <Button
              type="error"
              @click="handleSubmit('formSms')"
              long
              >登录</Button>
          </FormItem>
        </Form>
        <div class="regist">
          <span @click="$router.push('forgetPassword')">忘记密码</span>
        </div>
        <div class="other-login">
          <Icon custom="icomoon icon-qq" color="" class="icon-hover" @click="handleWebLogin('QQ')"/>
          <Icon custom="icomoon icon-wechat" color="" class="icon-hover"  @click="handleWebLogin('WECHAT_PC')"/>
        </div>
      </div>
      <!-- 拼图验证码 -->
      <verify
        ref="verify"
        class="verify-con"
        verifyType="LOGIN"
        @change="verifyChange"
      ></verify>
    </div>
    <div class="foot">
      <Row type="flex" justify="space-around" class="help">
        <router-link to="/article" class="item" target="_blank">帮助</router-link>
        <router-link to="/article?id=1371779927900160000" class="item" target="_blank">隐私</router-link>
        <router-link to="/article?id=1371992704333905920" class="item" target="_blank">条款</router-link>
      </Row>
      <Row type="flex" justify="center" class="copyright">
        Copyright © 2021 - Present
        <a href="https://pickmall.cn" target="_blank" style="margin: 0 5px">lili-shop</a>
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
import { webLogin, loginCallback } from '@/api/login.js';
import storage from '@/plugins/storage.js';
import verify from '@/components/verify';

export default {
  name: 'Login',
  components: {
    verify
  },
  data () {
    return {
      type: true, // true 账号登录  false 验证码登录
      formData: {
        // 登录表单
        username: '',
        password: ''
      },
      formSms: { // 手机号登录
        code: '',
        mobile: ''
      },
      verifyStatus: false, // 是否图片验证通过
      ruleInline: {
        // 验证规则
        username: [{ required: true, message: '请输入用户名' }],
        password: [
          { required: true, message: '请输入密码' },
          { type: 'string', min: 6, message: '密码不能少于6位' }
        ],
        mobile: [
          { required: true, message: '请输入手机号码' },
          {
            pattern: RegExp.mobile,
            message: '请输入正确的手机号'
          }
        ],
        code: [{ required: true, message: '请输入手机验证码' }]
      },
      codeMsg: '发送验证码', // 验证码文字
      interval: null, // 定时器
      time: 60, // 倒计时
      logoImg: '' // logo图片
    };
  },
  methods: {
    // 登录
    handleSubmit (name) {
      this.$refs[name].validate((valid) => {
        if (valid) {
          if (this.type) {
            this.$refs.verify.init();
          } else {
            let data = JSON.parse(JSON.stringify(this.formSms));
            apiLogin.smsLogin(data).then((res) => {
              this.$refs.verify.show = false;
              if (res.success) {
                this.$Message.success('登录成功');
                storage.setItem('accessToken', res.result.accessToken);
                storage.setItem('refreshToken', res.result.refreshToken);
                apiLogin.getMemberMsg().then((res) => {
                  if (res.success) {
                    storage.setItem('userInfo', res.result);
                    let query = this.$route.query;
                    if (query.rePath) {
                      this.$router.push({path: query.rePath, query: JSON.parse(query.query)});
                    } else {
                      this.$router.push('/');
                    }
                  }
                });
              } else {
                this.$Message.error(res.message);
              }
            });
          }
        } else {
          // this.$Message.error('请填写正确的用户名或密码');
        }
      });
    },
    // 发送手机验证码
    sendCode () {
      if (this.time === 60) {
        if (this.formSms.mobile === '') {
          this.$Message.warning('请先填写手机号');
          return;
        }
        if (!this.verifyStatus) {
          this.$Message.warning('请先完成安全验证');
          return;
        }
        let params = {
          mobile: this.formSms.mobile,
          verificationEnums: 'LOGIN'
        };
        sendSms(params).then(res => {
          if (res.success) {
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
    verifyChange (con) { // 拼图验证码回显
      if (!con.status) return;

      if (this.type === true) { // 账号密码登录
        let data = JSON.parse(JSON.stringify(this.formData));
        data.password = md5(data.password);
        this.$refs.verify.show = false;
        this.$Spin.show();
        apiLogin.login(data).then((res) => {
          if (res.success) {
            this.$Message.success('登录成功');
            storage.setItem('accessToken', res.result.accessToken);
            storage.setItem('refreshToken', res.result.refreshToken);
            apiLogin.getMemberMsg().then((res) => {
              this.$Spin.hide();
              if (res.success) {
                storage.setItem('userInfo', res.result);
                let query = this.$route.query;
                if (query.rePath) {
                  this.$router.push({path: query.rePath, query: JSON.parse(query.query)});
                } else {
                  this.$router.push('/');
                }
              }
            });
          } else {
            this.$Spin.hide();
            this.$Message.error(res.message);
          }
        }).catch(() => {
          this.$Spin.hide()
        });
      } else {
        this.verifyStatus = true;
        this.$refs.verify.show = false;
      }
    },
    // 开启滑块验证
    verifyBtnClick () {
      if (!this.verifyStatus) {
        this.$refs.verify.init();
      }
    },
    handleWebLogin (type) { // 第三方登录
      webLogin(type);
    }
  },
  mounted () {
    let uuid = this.$route.query.state;
    if (uuid) {
      storage.setItem('uuid', uuid);
      loginCallback(uuid).then(res => {
        if (res.success) {
          const result = res.result;
          storage.setItem('accessToken', result.accessToken);
          storage.setItem('refreshToken', result.refreshToken);
          apiLogin.getMemberMsg().then((res) => {
            if (res.success) {
              storage.setItem('userInfo', res.result);
              let query = this.$route.query;
              if (query.rePath) {
                this.$router.push({path: query.rePath, query: JSON.parse(query.query)});
              } else {
                this.$router.push('/');
              }
            }
          });
        }
      });
    }
    this.logoImg = this.Cookies.getItem('logo')
  },
  watch: {
    type (v) {
      if (v) {
        this.$refs.formInline.resetFields();
      } else {
        this.$refs.formSms.resetFields();
      }
      this.verifyStatus = false;
      this.$refs.verify.show = false;
      clearInterval(this.interval);
      this.codeMsg = '发送验证码';
      this.time = 60;
    }
  }
};
</script>
<style scoped lang="scss">
.login {
  height: 100%;
  background-color: #f0f2f5;
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
      width: 150px;
      cursor: pointer;
    }
    div {
      font-size: 20px;
      margin-top: 10px;
    }
  }
}
.login-carousel {
  width: 100%;
  height: 550px;
  .demo-carousel {
    height: 550px;
    width: inherit;
    display: flex;
    justify-content: center;
  }
}

.login-container {
  position: relative;
  width: 100%;
  height: 550px;
}

.form-box {
  width: 350px;
  box-sizing: border-box;
  position: absolute;
  top: 80px;
  right: 15%;
  padding: 20px;
  background:rgba(255,255,255,.8);
  .account-number{
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    font-weight: bold;
    >div:nth-child(2){
      color: $theme_color;
      cursor: pointer;
    }
    .tab-switch{
      height: 40px;
      font-size: 14px;

      span:nth-child(1){
        font-size: 16px;
        border-right: 1px solid #ddd;
        padding-right: 10px;
      }

      span:nth-child(2){
        cursor: pointer;
        padding-left: 10px;
        &:hover{
          color: $theme_color;
        }
      }
    }
  }
}

.verify-con{
  position: absolute;
  right: 16%;
  top: 90px;
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
.icon-hover{
  cursor: pointer;
}
</style>
