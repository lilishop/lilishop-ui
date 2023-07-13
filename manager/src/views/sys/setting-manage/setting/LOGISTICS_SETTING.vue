<template>
  <div class="layout">
    <Form ref="formValidate" :label-width="150" label-position="right" :model="formValidate" :rules="ruleValidate">
      <FormItem label="平台 " prop="endPoint">
        <RadioGroup v-model="formValidate.type" type="button">
          <Radio label="KDNIAO">快递鸟</Radio>
          <Radio label="KUAIDI100">快递100</Radio>
          <Radio label="SHUNFENG">顺丰</Radio>
        </RadioGroup>
      </FormItem>
      <FormItem v-if="formValidate.type === 'KDNIAO'" label="快递鸟 商户ID" prop="kdniaoEbusinessID">
        <Input v-model="formValidate.kdniaoEbusinessID" />
      </FormItem>
      <FormItem v-if="formValidate.type === 'KDNIAO'" label="快递鸟 AppKey" prop="kdniaoAppKey">
        <Input class="label-appkey" v-model="formValidate.kdniaoAppKey" />
      </FormItem>
      <FormItem v-if="formValidate.type === 'KDNIAO'" label="快递鸟 requestType" prop="requestType">
        <Input class="label-appkey" v-model="formValidate.requestType" />
      </FormItem>

      <FormItem v-if="formValidate.type === 'KUAIDI100'" label="快递100 授权码" prop="kuaidi100Customer">
        <Input class="label-appkey" v-model="formValidate.kuaidi100Customer" />
      </FormItem>
      <FormItem v-if="formValidate.type === 'KUAIDI100'" label="快递100 Key" prop="kuaidi100Key">
        <Input class="label-appkey" v-model="formValidate.kuaidi100Key" />
      </FormItem>
      <div v-if="formValidate.type === 'SHUNFENG'">
        <FormItem label="顾客编码" prop="clientCode">
          <Input v-model="formValidate.clientCode" />
        </FormItem>
        <FormItem label="校验码" prop="checkWord">
          <Input v-model="formValidate.checkWord" />
        </FormItem>
        <FormItem label="请求地址" prop="callUrl">
          <Input class="label-appkey" v-model="formValidate.callUrl" />
        </FormItem>

        <FormItem label="打印模板" prop="templateCode">
          <Input class="label-appkey" v-model="formValidate.templateCode" />
        </FormItem>
        <FormItem label="月结号" prop="monthlyCardNo">
          <Input class="label-appkey" v-model="formValidate.monthlyCardNo" />
        </FormItem>
      </div>
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
      result:"",
      formValidate: {   // 表单数据
        type: "",
        kdniaoEbusinessID: "",
        kdniaoAppKey: "",
        requestType:"",
        kuaidi100Customer: "",
        kuaidi100Key: "",
      },
    };
  },
  props: ["res", 'type'],
  created() {
    this.init();
  },
  methods: {
    // 验证
    submit(name) {
      let that = this;
      if (handleSubmit(that, name)) {
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
      this.$set(this, "formValidate", { ...this.result });
      Object.keys(this.formValidate).forEach((item) => {
        this.ruleValidate[item] = [
          {
            required: true,
            message: "请填写必填项",
            trigger: "blur",
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

/deep/ .ivu-input {
  width: 300px !important;
  margin: 0 10px;
}

.ivu-input-wrapper {
  width: 300px;
  margin-right: 10px;
}</style>
