<template>
  <div class="layout">
    <el-form ref="formValidateRef" label-width="150px" label-position="right" :model="formValidate" :rules="ruleValidate">
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

      <el-form-item label="提现规则说明" prop="withdrawRule">
        <div style="display: flex; flex-direction: column; width: 500px;">
          <el-input
            v-model="formValidate.withdrawRule"
            type="textarea"
            :rows="6"
            placeholder="请输入提现规则说明（需包含可提现额度、每日提现次数、提现时间、到账时间等，以满足微信审核要求）"
          />
          <div class="rule-tip">展示在移动端/小程序提现页面底部，用于满足微信审核对提现规则公示的要求。</div>
        </div>
      </el-form-item>

      <div class="label-btns">
        <el-button type="primary" @click="submit('formValidateRef')">保存</el-button>
      </div>
    </el-form>
  </div>
</template>
<script setup>
import { getCurrentInstance, reactive, ref } from "vue";
import { ElMessage } from "element-plus";
import { setSetting } from "@/api/index";
import { handleSubmit } from "./validate";

const DEFAULT_WITHDRAW_RULE = `1. 提现额度：单笔最低提现金额以页面展示为准，单日累计最高提现 5000 元；
2. 提现次数：每个用户每日最多可申请提现 1 次；
3. 提现时间：支持全天 24 小时随时发起提现申请；
4. 到账时间：提交申请后预计 1~3 个工作日内审核并到账至您的微信零钱；
5. 手续费说明：提现免收手续费；
6. 如有其他疑问或遇到提现未到账，请联系在线客服协助处理。`;

const props = defineProps(["res", "type"]);

// handleSubmit(that, name) 通过 that.$refs[name] 取表单实例
const { proxy } = getCurrentInstance();

const result = ref("");
// 只做属性合并的成组对象
const ruleValidate = reactive({});
const formValidate = ref({});
// 历史遗留：声明后未在模板使用，原样保留
const switchTitle = ref("提现审核是否开启");

// 模板 ref 与 data 同名会互相覆盖，改名 formValidateRef 并同步改 script
const formValidateRef = ref(null);

function submit(name) {
  handleSubmit(proxy, name)
    .then(() => {
      setupSetting();
    })
    .catch(() => {});
}
function setupSetting() {
  setSetting(props.type, formValidate.value).then((res) => {
    if (res.success) {
      ElMessage.success("保存成功!");
    } else {
      ElMessage.error("保存失败!");
    }
  });
}
function init() {
  result.value = JSON.parse(props.res || "{}");
  Object.keys(result.value).map((item) => {
    result.value[item] += "";
  });
  formValidate.value = { ...result.value };
  if (!formValidate.value.withdrawRule) {
    formValidate.value.withdrawRule = DEFAULT_WITHDRAW_RULE;
  }
  Object.keys(formValidate.value).forEach((item) => {
    if (item === "minPrice") {
      ruleValidate[item] = [
        {
          required: true,
          message: "请填写必填项",
          trigger: "blur",
        },
        {
          validator: (rule, value, callback) => {
            if (Number(value) < 0) {
              callback(new Error("不能输入负数！"));
            } else {
              callback();
            }
          },
          trigger: "change",
        },
      ];
    } else if (item === "withdrawRule") {
      ruleValidate[item] = [
        {
          required: false,
          trigger: "blur",
        },
      ];
    } else {
      ruleValidate[item] = [
        {
          required: true,
          message: "请填写必填项",
          trigger: "blur",
        },
      ];
    }
  });
}

init();
</script>

<style lang="scss" scoped>
@import "./style.scss";
:deep(.el-form-item__content){
  align-items: flex-start;
  padding-bottom: 5px;
}
.rule-tip {
  font-size: 12px;
  color: #999;
  line-height: 1.5;
  margin-top: 6px;
}
</style>
