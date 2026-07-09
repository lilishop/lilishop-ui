<template>
  <div class="layout">
    <el-form ref="formValidate" label-width="150px" label-position="right" :model="formValidate" :rules="ruleValidate">
      <el-form-item label="订单自动取消" prop="autoCancel">
        <el-input type="number" v-model="formValidate.autoCancel">
          <template #append>分</template>
        </el-input>
        <span class="desc">发起订单后，多少分钟未操作取消订单</span>
      </el-form-item>

      <el-form-item label="订单自动收货" class="label-item" prop="autoReceive">
        <el-input type="number" v-model="formValidate.autoReceive">
          <template #append>天</template>
        </el-input>
        <span class="desc">发货后多少天自动完成收货</span>
      </el-form-item>

      <el-form-item label="自动好评" prop="autoEvaluation">
        <el-input type="number" v-model="formValidate.autoEvaluation">
          <template #append>天</template>
        </el-input>
        <span class="desc">订单发货后，多少天后自动好评</span>
      </el-form-item>
      <el-form-item label="已完成订单允许退单" prop="closeAfterSale">
        <el-input type="number" v-model="formValidate.closeAfterSale">
          <template #append>天</template>
        </el-input>
        <span class="desc">订单完成后，多少天内允许退单，如果天数为0,则完成订单当天可以退单，之后就不再允许。</span>
      </el-form-item>
      <el-form-item label="已完成订单允许投诉" prop="closeComplaint">
        <el-input type="number" v-model="formValidate.closeComplaint">
          <template #append>天</template>
        </el-input>
        <span class="desc">订单完成后，多少天内允许投诉，如果天数为0,则不允许投诉</span>
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
      ruleValidate: {},
      formValidate: {
        autoCancel: "",
        autoEvaluation: "",
        autoReceive: "",
        closeAfterSale: "",
        closeComplaint: "",
      },
      result: "",
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

.label-item {
  display: flex;
}

.el-input {
  width: 180px;
  margin-right: 10px;
}

:deep(.el-input){
  width: 180px !important;
}

.desc {
  font-size: 12px;
  color: #999;
}
</style>
