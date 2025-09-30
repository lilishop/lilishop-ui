<template>

  <div class="layout">
    <div class="row">
      <div class="col">
        <Card :padding="0">
            <Divider orientation="left">登录设置</Divider>
            <div class="form-list">
              <Form
                ref="formValidate"
                label-width="120"
                label-position="right"
                :model="formValidate"
                :rules="ruleValidate"
              >
                <FormItem  label="买家PC端域名" prop="pc">
                  <Input  v-model="formValidate.pc" class="w200" />
                </FormItem>
                <FormItem label="买家WAP端域名" prop="wap">
                  <Input  v-model="formValidate.wap" class="w200" />
                </FormItem>
                <FormItem label="登录回调域名" prop="callbackUrl">
                  <Input maxlength="300" v-model="formValidate.callbackUrl"  class="w200" />
                </FormItem>
                <FormItem label="操作" >
                  <Button @click="setupSetting">保存设置</Button>
                </FormItem>
              </Form>
            </div>
        </Card>
      </div>
    </div>
  </div>

</template>
<script>
import { setSetting } from "@/api/index";
import { handleSubmit } from "../setting/validate";

export default {
  data() {
    return {
      ruleValidate: {}, // 验证规则
      formValidate: {
        pc:"",
        wap:"",
        callbackUrl:""
      } // 表单数据
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
      this.res = JSON.parse(this.res);

      this.$set(this, "formValidate", { ...this.res });
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


.form-list{
  padding:  16px;

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
  width: 600px;
  margin-right: 10px;
  display: flex;
  margin-bottom: 20px;
  ::v-deep .ivu-card-body {
    padding: 0 16px !important;
  }
}

.label-item {
  display: flex;
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
.ivu-form-item {
  display: flex;

  align-items: center;
}
.ivu-row {
  width: 100%;
}
</style>
