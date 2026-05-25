<template>
  <div>
    <el-card class="change-pass">
      <template #header>修改密码</template>
      <el-form
        ref="editPasswordForm"
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

<script>
import SetPassword from "@/components/lili/set-password";
import { changePass } from "@/api/index";
import { ElMessageBox } from "element-plus";

export default {
  name: "change-password",
  components: {
    SetPassword,
  },
  data() {
    const valideRePassword = (rule, value, callback) => {
      if (value !== this.editPasswordForm.newPassword) {
        callback(new Error("两次输入密码不一致"));
      } else {
        callback();
      }
    };
    return {
      savePassLoading: false,
      editPasswordForm: {
        oldPassword: "",
        newPassword: "",
        rePassword: "",
      },
      strength: "",
      passwordValidate: {
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
      },
    };
  },
  methods: {
    changeInputPass(v, grade, strength) {
      this.strength = strength;
    },
    saveEditPass() {
      const params = {
        password: this.md5(this.editPasswordForm.oldPassword),
        newPassword: this.md5(this.editPasswordForm.newPassword),
        passStrength: this.md5(this.strength),
      };
      this.$refs.editPasswordForm.validate((valid) => {
        if (!valid) return;
        this.savePassLoading = true;
        changePass(params).then((res) => {
          this.savePassLoading = false;
          if (res.success) {
            ElMessageBox.alert("修改密码成功，需重新登录", "修改密码成功", {
              confirmButtonText: "确定",
              callback: () => {
                this.$store.commit("logout", this);
                this.$router.push({ name: "login" });
              },
            });
          }
        });
      });
    },
    cancelEditPass() {
      this.$store.commit("removeTag", "change_password");
      localStorage.pageOpenedList = JSON.stringify(this.$store.state.app.pageOpenedList);
      const list = this.$store.state.app.pageOpenedList;
      const lastPageName = list.length > 1 ? list[list.length - 1].name : list[0].name;
      this.$router.push({ name: lastPageName });
    },
  },
};
</script>
