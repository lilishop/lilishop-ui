<template>
  <div>
    <el-card class="change-pass">
      <template #header>修改密码</template>
      <el-form
        ref="editPasswordFormRef"
        :model="editPasswordForm"
        label-width="100px"
        label-position="right"
        :rules="passwordValidate"
        style="width: 450px"
        class="mt_10"
      >
        <el-form-item label="原密码" prop="oldPassword">
          <el-input
            v-model="editPasswordForm.oldPassword"
            type="password"
            show-password
            placeholder="请输入现在使用的密码"
          />
        </el-form-item>
        <el-form-item label="新密码" prop="newPassword">
          <SetPassword v-model="editPasswordForm.newPassword" @on-change="changeInputPass" />
        </el-form-item>
        <el-form-item label="确认新密码" prop="rePassword">
          <el-input
            v-model="editPasswordForm.rePassword"
            type="password"
            show-password
            placeholder="请再次输入新密码"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :loading="savePassLoading" @click="saveEditPass">保存</el-button>
          <el-button @click="cancelEditPass">取消</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { reactive, ref } from "vue";
import { useRouter } from "vue-router";
import SetPassword from "@/components/lili/set-password";
import { changePass } from "@/api/index";
import { ElMessageBox } from "element-plus";
import { md5 } from "@/utils/md5.js";
import { useAppStore } from "@/stores/app";
import { useUserStore } from "@/stores/user";

defineOptions({ name: "change-password" });

const router = useRouter();
const appStore = useAppStore();
const userStore = useUserStore();

const editPasswordFormRef = ref(null);
const savePassLoading = ref(false);
const editPasswordForm = reactive({
  oldPassword: "",
  newPassword: "",
  rePassword: "",
});
const strength = ref("");
const valideRePassword = (rule, value, callback) => {
  if (value !== editPasswordForm.newPassword) {
    callback(new Error("两次输入密码不一致"));
  } else {
    callback();
  }
};
const passwordValidate = {
  oldPassword: [{ required: true, message: "请输入原密码", trigger: "blur" }],
  newPassword: [
    { required: true, message: "请输入新密码", trigger: "blur" },
    { min: 6, message: "请至少输入6个字符", trigger: "blur" },
    { max: 32, message: "最多输入32个字符", trigger: "blur" },
  ],
  rePassword: [
    { required: true, message: "请再次输入新密码", trigger: "blur" },
    { validator: valideRePassword, trigger: "blur" },
  ],
};

function changeInputPass(v, grade, strengthVal) {
  strength.value = strengthVal;
}

function saveEditPass() {
  const params = {
    password: md5(editPasswordForm.oldPassword),
    newPassword: md5(editPasswordForm.newPassword),
    passStrength: md5(strength.value),
  };
  editPasswordFormRef.value.validate((valid) => {
    if (!valid) return;
    savePassLoading.value = true;
    changePass(params).then((res) => {
      savePassLoading.value = false;
      if (res.success) {
        ElMessageBox.alert("修改密码成功，需重新登录", "修改密码成功", {
          confirmButtonText: "确定",
          callback: () => {
            userStore.logout();
            router.push({ name: "login" });
          },
        });
      }
    });
  });
}

function cancelEditPass() {
  appStore.removeTag("change_password");
  localStorage.pageOpenedList = JSON.stringify(appStore.pageOpenedList);
  const list = appStore.pageOpenedList;
  const lastPageName = list.length > 1 ? list[list.length - 1].name : list[0].name;
  router.push({ name: lastPageName });
}
</script>
