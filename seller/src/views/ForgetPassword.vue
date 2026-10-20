<template>
  <div class="forget-password" @click="hideVerify">
    <div style="height: 50px"></div>
    <div class="logo-box">
      <img alt="店铺 Logo" :src="logoImg" width="150" @click="$router.push('/')" />
      <div>修改密码</div>
    </div>
    <div class="login-container">
      <el-form
        ref="formFirstRef"
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
        ref="formRef"
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
        ref="verifyRef"
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

<script setup>
import { computed, onMounted, reactive, ref } from "vue";
import { useRouter } from "vue-router";
import { Iphone, Message, Lock } from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";
import { md5 } from "@/utils/md5.js";
import * as RegExp from "@/utils/regular.js";
import * as apiLogin from "@/api/index.js";
import { sendSms } from "@/api/common.js";
import config from "@/config/index";
import verify from "@/views/my-components/verify";
import { useAppStore } from "@/stores/app";

defineOptions({ name: "ForgetPassword" });

const router = useRouter();
const appStore = useAppStore();

const logoImg = computed(() => appStore.logoImg);

const loading = ref(false);
const loading1 = ref(false);
const formFirst = reactive({
  mobile: "",
  code: "",
});
const form = reactive({
  password: "",
  oncePasd: "",
});
const year = new Date().getFullYear();
const step = ref(0);
const ruleInline = {
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
};
const verifyStatus = ref(false);
const verifyType = ref("FIND_USER");
const codeMsg = ref("发送验证码");
const interval = ref("");
const time = ref(60);

const formFirstRef = ref(null);
const formRef = ref(null);
const verifyRef = ref(null);

function hideVerify() {
  verifyRef.value.show = false;
}

function next() {
  formFirstRef.value.validate((valid) => {
    if (valid) {
      loading.value = true;
      const data = JSON.parse(JSON.stringify(formFirst));
      apiLogin
        .validateCode(data)
        .then((res) => {
          loading.value = false;
          if (res.success) {
            step.value = 1;
          } else {
            ElMessage.warning(res.message);
          }
        })
        .catch(() => {
          loading.value = false;
        });
    }
  });
}

function handleSubmit() {
  formRef.value.validate((valid) => {
    if (valid) {
      const params = JSON.parse(JSON.stringify(form));
      if (params.password !== params.oncePasd) {
        ElMessage.warning("两次输入密码不一致");
        return;
      }
      params.mobile = formFirst.mobile;
      params.password = md5(params.password);
      delete params.oncePasd;
      loading1.value = true;

      apiLogin
        .forgetAndModify(params)
        .then((res) => {
          loading1.value = false;
          if (res.success) {
            ElMessage.success("修改密码成功");
            router.push("login");
          }
        })
        .catch(() => {
          loading1.value = false;
        });
    }
  });
}

function sendCode() {
  if (time.value === 60) {
    if (formFirst.mobile === "") {
      ElMessage.warning("请先填写手机号");
      return;
    }
    if (!verifyStatus.value) {
      ElMessage.warning("请先完成安全验证");
      return;
    }
    const params = {
      mobile: formFirst.mobile,
      verificationEnums: "FIND_USER",
    };
    sendSms(params)
      .then((res) => {
        if (res.success) {
          ElMessage.success("验证码发送成功");
          interval.value = setInterval(() => {
            time.value--;
            if (time.value === 0) {
              time.value = 60;
              codeMsg.value = "重新发送";
              verifyStatus.value = false;
              clearInterval(interval.value);
            } else {
              codeMsg.value = time.value;
            }
          }, 1000);
        } else {
          ElMessage.warning(res.message);
        }
      })
      .catch(() => {});
  }
}

function verifyChange(con) {
  if (!con.status) return;
  hideVerify();
  verifyStatus.value = true;
}

function verifyBtnClick() {
  if (!verifyStatus.value) {
    verifyRef.value.init();
  }
}

onMounted(() => {
  document.querySelector(".forget-password").style.height = window.innerHeight + "px";
  formFirstRef.value.resetFields();
});
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
