<template>
  <div style="background-color: #fff">
    <el-form ref="form" :model="form" :rules="formRule" label-width="140px" style="padding: 10px">
      <el-divider content-position="left">分销设置</el-divider>
      <el-form-item label="是否开启分销" prop="isOpen">
        <el-switch v-model="form.isOpen" active-text="开启" inactive-text="关闭" />
      </el-form-item>
      <el-form-item label="分销关系绑定天数" prop="distributionDay">
        <el-input-number v-model="form.distributionDay" :min="1" :max="365" style="width: 120px" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="submit">保存</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import { setSetting, getSetting } from "@/api/index";
import { regular } from "@/utils";
export default {
  name: "distributionSetting",
  data() {
    return {
      form: {
        isOpen: true,
        distributionDay: 1,
      },
      formRule: {
        isOpen: [regular.REQUIRED],
        distributionDay: [regular.REQUIRED],
      },
    };
  },
  mounted() {
    this.init();
  },
  methods: {
    init() {
      this.getDataList();
    },
    getDataList() {
      getSetting("DISTRIBUTION_SETTING").then((res) => {
        if (res.success) {
          this.form = res.result;
        }
      });
    },
    submit() {
      this.$refs.form.validate((valid) => {
        if (!valid) return;
        setSetting("DISTRIBUTION_SETTING", this.form).then((res) => {
          if (res.success) {
            this.$Message.success("操作成功");
            this.getDataList();
          }
        });
      });
    },
  },
};
</script>
