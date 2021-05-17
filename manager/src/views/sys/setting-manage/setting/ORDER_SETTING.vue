<template>
  <div class="layout">
    <Form ref="formValidate" :label-width="150" label-position="right" :model="formValidate" :rules="ruleValidate">

      <FormItem label="订单自动取消" prop="autoCancel">
        <Input type='number' v-model="formValidate.autoCancel">
        <span slot="append">分</span>
        </Input>
      </FormItem>

      <FormItem label="订单自动收货" class="label-item" prop="autoReceive">
        <Input type='number' v-model="formValidate.autoReceive">
        <span slot="append">天</span>
        </Input>

      </FormItem>
      <FormItem label="订单自动完成" prop="autoComplete">
        <Input type='number' v-model="formValidate.autoComplete">
        <span slot="append">天</span>
        </Input>

      </FormItem>

      <FormItem label="自动评价" prop="autoEvaluation">
        <Input type='number' v-model="formValidate.autoEvaluation">
        <span slot="append">天</span>
        </Input>

      </FormItem>
      <FormItem label="售后自动取消" prop="autoCancelAfterSale">
        <Input type='number' v-model="formValidate.autoCancelAfterSale">
        <span slot="append">天</span>
        </Input>

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
      ruleValidate: {}, // 验证规则
      formValidate: { // 表单数据
        autoCancel: "",
        autoComplete: "",
        autoEvaluation: "",
        autoReceive: "",
        autoCancelAfterSale: "",
      },
    };
  },
  props: ["res", "type"],
  created() {
    this.init();
  },
  methods: {
    submit(name) {
      let that = this;
      if (handleSubmit(that, name)) {
        this.setupSetting();
      }
    },

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
      this.res = JSON.parse(this.res);
  Object.keys(this.res).map((item) => {
        this.res[item] += "";
      });
      this.$set(this, "formValidate", { ...this.res });
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
.label-item {
  display: flex;
}
.ivu-input-wrapper {
  width: 100px;
  margin-right: 10px;
}
/deep/ .ivu-input {
  width: 100px !important;
}
</style>
