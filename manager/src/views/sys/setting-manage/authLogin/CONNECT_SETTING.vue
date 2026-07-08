<template>
  <div class="layout">
    <div class="row">
      <div class="col">
        <el-card shadow="never" :body-style="{ padding: '0 16px' }">
          <el-divider content-position="left">登录设置</el-divider>
          <div class="form-list">
            <el-form
              ref="formValidate"
              label-width="140px"
              label-position="right"
              :model="formValidate"
              :rules="ruleValidate"
            >
              <el-form-item label="买家PC端域名" prop="pc">
                <el-input v-model="formValidate.pc" />
              </el-form-item>
              <el-form-item label="买家WAP端域名" prop="wap">
                <el-input v-model="formValidate.wap" />
              </el-form-item>
              <el-form-item label="登录回调域名" prop="callbackUrl">
                <el-input maxlength="300" v-model="formValidate.callbackUrl" />
              </el-form-item>
              <el-form-item label="操作">
                <el-button @click="setupSetting">保存设置</el-button>
              </el-form-item>
            </el-form>
          </div>
        </el-card>
      </div>
    </div>
  </div>
</template>
<script>
import { ElMessage } from "element-plus";
import { setSetting } from "@/api/index";
import { handleSubmit } from "../setting/validate";

export default {
  data() {
    return {
      ruleValidate: {},
      formValidate: {
        pc: "",
        wap: "",
        callbackUrl: "",
      },
    };
  },
  props: ["res", "type"],
  created() {
    this.init();
  },
  methods: {
    submit(name) {
      handleSubmit(this, name)
        .then(() => {
          this.setupSetting();
        })
        .catch(() => {});
    },
    setupSetting() {
      setSetting(this.type, this.formValidate).then((res) => {
        if (res.success) {
          ElMessage.success("保存成功!");
        } else {
          ElMessage.error("保存失败!");
        }
      });
    },
    init() {
      const setting = JSON.parse(this.res || "{}");
      this.formValidate = { ...setting };
      Object.keys(this.formValidate).forEach((item) => {
        if (item.indexOf("pId") < 0) {
          this.ruleValidate[item] = [
            {
              required: true,
              message: "请填写必填项",
              trigger: "blur",
            },
          ];
        }
      });
    },
  },
};
</script>

<style lang="scss" scoped>
@import "../setting/style.scss";

.label-item {
  display: flex;
}

.form-list {
  padding: 16px;
}
.pay-title {
  text-align: center;
  margin: 10px 0;
}

.col {
  width: 100%;
}
.layout {
  padding: 20px;

  display: flex;
  align-items: center;
  flex-wrap: wrap;
  justify-content: flex-start;
}
.row {
  width: 100%;
  max-width: 720px;
  margin-right: 10px;
  display: flex;
  margin-bottom: 20px;
}

:deep(.el-input) {
  width: 480px !important;
}

.el-input {
  width: 480px;
}

.label-item {
  display: flex;
  align-items: center;
}

.icon-item {
  width: 100%;
  padding: 30px;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
}
.el-form-item {
  display: flex;
  align-items: center;
}

:deep(.el-form-item__label) {
  white-space: nowrap;
}
</style>
