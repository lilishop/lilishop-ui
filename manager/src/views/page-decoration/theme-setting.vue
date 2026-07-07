<template>
  <div class="theme-setting">
    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <span>主题色设置</span>
          <span class="desc">配置买家端 PC 与移动端（小程序）的主题色，保存后前台自动生效</span>
        </div>
      </template>
      <el-form
        ref="formValidate"
        v-loading="loading"
        label-width="150px"
        label-position="right"
        :model="formValidate"
        :rules="ruleValidate"
      >
        <el-form-item label="主题色" prop="themeColor">
          <el-color-picker v-model="formValidate.themeColor" />
          <span class="field-desc">买家端主色，用于按钮、价格、标签等</span>
        </el-form-item>
        <el-form-item label="高亮主题色" prop="lightColor">
          <el-color-picker v-model="formValidate.lightColor" />
          <span class="field-desc">用于渐变、高亮背景等</span>
        </el-form-item>
        <el-form-item label="辅助高亮色" prop="aiderLightColor">
          <el-color-picker v-model="formValidate.aiderLightColor" />
          <span class="field-desc">用于渐变辅助色、次要强调</span>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :loading="saveLoading" @click="submit">保存</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script>
import { getSetting, setSetting } from "@/api/index";

const SETTING_KEY = "THEME_SETTING";

export default {
  name: "theme-setting",
  data() {
    return {
      loading: false,
      saveLoading: false,
      formValidate: {
        themeColor: "#ff3c2a",
        lightColor: "#ff6b35",
        aiderLightColor: "#ff9f28",
      },
      ruleValidate: {
        themeColor: [{ required: true, message: "请选择主题色", trigger: "change" }],
        lightColor: [{ required: true, message: "请选择高亮主题色", trigger: "change" }],
        aiderLightColor: [
          { required: true, message: "请选择辅助高亮色", trigger: "change" },
        ],
      },
    };
  },
  mounted() {
    this.loadSetting();
  },
  methods: {
    loadSetting() {
      this.loading = true;
      getSetting(SETTING_KEY)
        .then((res) => {
          if (res.success && res.result) {
            this.formValidate = {
              ...this.formValidate,
              ...res.result,
            };
          }
        })
        .finally(() => {
          this.loading = false;
        });
    },
    submit() {
      this.$refs.formValidate.validate((valid) => {
        if (!valid) return;
        this.saveLoading = true;
        setSetting(SETTING_KEY, this.formValidate)
          .then((res) => {
            if (res.success) {
              this.$Message.success("保存成功");
            } else {
              this.$Message.error("保存失败");
            }
          })
          .finally(() => {
            this.saveLoading = false;
          });
      });
    },
  },
};
</script>

<style scoped lang="scss">
.theme-setting {
  .card-header {
    display: flex;
    flex-direction: column;
    gap: 4px;

    .desc {
      font-size: 12px;
      color: #999;
      font-weight: normal;
    }
  }

  .field-desc {
    margin-left: 10px;
    color: #999;
    font-size: 12px;
  }
}
</style>
