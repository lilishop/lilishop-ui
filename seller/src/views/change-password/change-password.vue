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
        <el-form-item label="原密码" prop="oldPass">
          <el-input
            v-model="editPasswordForm.oldPass"
            type="password"
            show-password
            placeholder="请输入现在使用的密码"
          />
        </el-form-item>
        <el-form-item label="新密码" prop="newPassword">
          <SetPassword v-model="editPasswordForm.newPassword" @on-change="changeInputPass" />
        </el-form-item>
        <el-form-item label="确认新密码" prop="rePass">
          <el-input
            v-model="editPasswordForm.rePass"
            type="password"
            show-password
            placeholder="请再次输入新密码"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :loading="savePassLoading" @click="editPassword">
            保存
          </el-button>
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
  name: "change_pass",
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
        oldPass: "",
        newPassword: "",
        rePass: "",
      },
      strength: "",
      passwordValidate: {
        oldPass: [{ required: true, message: "请输入原密码", trigger: "blur" }],
        newPassword: [
          { required: true, message: "请输入新密码", trigger: "blur" },
          { min: 6, message: "请至少输入6个字符", trigger: "blur" },
          { max: 32, message: "最多输入32个字符", trigger: "blur" },
        ],
        rePass: [
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
    editPassword() {
      const params = {
        password: this.md5(this.editPasswordForm.oldPass),
        newPassword: this.md5(this.editPasswordForm.newPassword),
      };
      this.$refs.editPasswordForm.validate((valid) => {
        if (!valid) return;
        this.savePassLoading = true;
        changePass(params)
          .then((res) => {
            if (res?.success) {
              ElMessageBox.alert("修改密码成功，需重新登录", "修改密码成功", {
                confirmButtonText: "确定",
              }).then(() => {
                this.$store.commit("logout", this);
                this.$store.commit("clearOpenedSubmenu");
                this.$router.push({ name: "login" });
              });
            }
          })
          .finally(() => {
            this.savePassLoading = false;
          });
      });
    },
    cancelEditPass() {
      this.$store.commit("removeTag", "change_pass");
      localStorage.storeOpenedList = JSON.stringify(
        this.$store.state.app.storeOpenedList
      );
      const list = this.$store.state.app.storeOpenedList;
      const lastPageName = list.length > 1 ? list[list.length - 1].name : list[0].name;
      this.$router.push({ name: lastPageName });
    },
  },
};
</script>
