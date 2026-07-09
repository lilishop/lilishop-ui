<template>
  <div class="layout">
    <el-form ref="formValidate" label-width="150px" label-position="right" :model="formValidate" :rules="ruleValidate">
      <el-form-item label="提现审核是否开启">
        <el-switch v-model="formValidate.apply" active-text="开" inactive-text="关" />
      </el-form-item>

      <el-form-item label="最低提现金额" prop="minPrice">
        ￥<el-input class="label-appkey" v-model="formValidate.minPrice" />
      </el-form-item>

      <el-form-item label="提现方式" prop="type">
        <el-radio-group v-model="formValidate.type">
          <el-radio value="WECHAT">微信</el-radio>
          <el-radio value="ALI">支付宝</el-radio>
        </el-radio-group>
      </el-form-item>

      <el-form-item label="微信提现应用ID" prop="wechatAppId">
        <el-input class="label-appkey" v-model="formValidate.wechatAppId" />
      </el-form-item>

      <div class="label-btns">
        <el-button type="primary" @click="submit('formValidate')">保存</el-button>
      </div>
    </el-form>
  </div>
</template>
<script>
import { ElMessage } from "element-plus";
import { setSetting } from "@/api/index";
import { handleSubmit } from "./validate";
export default {
  data() {
    return {
      result: "",
      ruleValidate: {},
      formValidate: {},
      switchTitle: "提现审核是否开启",
    };
  },
  created() {
    this.init();
  },
  props: ["res", "type"],
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
      this.result = JSON.parse(this.res);
      Object.keys(this.result).map((item) => {
        this.result[item] += "";
      });
      this.formValidate = { ...this.result };
      Object.keys(this.formValidate).forEach((item) => {
        this.ruleValidate[item] = [
          {
            required: true,
            message: "请填写必填项",
            trigger: "blur",
          },
          {
            validator: (rule, value, callback) => {
              if (value < 0) {
                callback(new Error("不能输入负数！"));
              } else {
                callback();
              }
            },
            trigger: "change",
          },
        ];
      });
    },
  },
};
</script>

<style lang="scss" scoped>
@import "./style.scss";
:deep(.el-form-item__content){
  align-items: center;
  padding-bottom: 5px;
}
</style>
