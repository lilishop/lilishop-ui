<template>
  <div class="layout">

    <Form ref="formValidate" :label-width="150" label-position="right" :model="formValidate" :rules="ruleValidate">
      <FormItem label="提现审核是否开启">
        <i-switch v-model="formValidate.apply" style="margin-top:7px;"><span slot="open">开</span>
          <span slot="close">关</span>
        </i-switch>
      </FormItem>

      <FormItem  label="最低提现金额" prop="minPrice">
        ￥<Input class="label-appkey" v-model="formValidate.minPrice" />
      </FormItem>

      <FormItem label="提现方式" prop="type">
        <RadioGroup v-model="formValidate.type">
          <Radio label="WECHAT">微信</Radio>
          <Radio label="ALI">支付宝</Radio>
        </RadioGroup>
      </FormItem>

      <FormItem label="微信提现应用ID" prop="wechatAppId">
        <Input class="label-appkey" v-model="formValidate.wechatAppId" />
      </FormItem>

      <div class="label-btns">
        <Button type="primary" @click="submit('formValidate')">保存</Button>
      </div>
    </Form>
  </div>
</template>
<script>
import { setSetting } from "@/api/index";
import { handleSubmit } from "./validate";
export default {
  data() {
    return {
      result:"",
      ruleValidate: {}, // 验证规则
      formValidate: {},// 表单数据

      switchTitle: "提现审核是否开启", // 切换title
    };
  },
  created() {
    this.init();
  },
  props: ["res", "type"],
  methods: {
    // 保存
    submit(name) {
      let that = this;
       if( handleSubmit(that, name )){
        this.setupSetting()
      }
    },
    // 保存设置
    setupSetting() {

      setSetting(this.type, this.formValidate).then((res) => {
        if (res.success) {
          this.$Message.success("保存成功!");
        } else {
          this.$Message.error("保存失败!");
        }
      });
    },
    // 实例化数据
    init() {
      this.result = JSON.parse(this.res);
      Object.keys(this.result).map((item) => {
        this.result[item] += "";
      });
      this.$set(this, "formValidate", { ...this.result });
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
/deep/ .ivu-form-item-content{
  align-items: center;
  padding-bottom: 5px;
}
</style>
