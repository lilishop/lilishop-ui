<template>
  <div class="layout">
    <el-form ref="formValidateRef" label-width="150px" label-position="right" :model="formValidate" :rules="ruleValidate">
      <el-form-item label="消费1元赠送积分" prop="consumer">
        <el-input type="number" v-model="formValidate.consumer">
          <template #append>积分</template>
        </el-input>
      </el-form-item>

      <el-form-item label="注册账号" prop="register">
        <el-input type="number" v-model="formValidate.register">
          <template #append>积分</template>
        </el-input>
      </el-form-item>

      <el-form-item label="每日签到积分" prop="signIn">
        <el-input type="number" v-model="formValidate.signIn">
          <template #append>积分</template>
        </el-input>
      </el-form-item>
      <el-form-item label="订单评价赠送积分" prop="comment">
        <el-input type="number" v-model="formValidate.comment">
          <template #append>积分</template>
        </el-input>
      </el-form-item>

      <el-form-item
        class="label-item"
        v-for="(point, index) in formValidate.pointSettingItems"
        :key="index"
        :label="'签到设置' + (index + 1)"
      >
        <div class="label-item">
          <el-input-number :min="1" v-model="point.day" />
          <el-input-number :min="0" v-model="point.point" />
          <el-button plain type="danger" @click="delSign(point, index)">删除</el-button>
          <span class="ml_10"
            >签到<span class="theme_color">{{ point.day }}</span
            >天，赠送<span class="theme_color">{{ point.point }}</span
            >积分</span
          >
        </div>
      </el-form-item>
      <el-form-item label="操作：">
        <el-button @click="addSign">新增签到</el-button>
      </el-form-item>
      <div class="label-btns">
        <el-button type="primary" @click="submit('formValidate')">保存</el-button>
      </div>
    </el-form>
  </div>
</template>

<script setup>
import { reactive, ref } from "vue";
import { ElMessage } from "element-plus";
import { setSetting } from "@/api/index";
import { handleSubmit } from "./validate";

const props = defineProps(["res", "type"]);

const ruleValidate = reactive({});
const formValidate = ref({});
const result = ref("");

// 模板 ref 与 data 同名会互相覆盖，改名 formValidateRef
const formValidateRef = ref(null);

function submit(name) {
  // validate.js 的 handleSubmit 未去 vm 化，仍按 that.$refs[name] 取值，此处用表单 ref 构造同构对象
  handleSubmit({ $refs: { [name]: formValidateRef.value } }, name)
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
function delSign(item, index) {
  formValidate.value.pointSettingItems.splice(index, 1);
}
function addSign() {
  if (formValidate.value.pointSettingItems.length >= 4) {
    ElMessage.error("最多设置4项签到设置",
    );
    return false;
  }
  formValidate.value.pointSettingItems.push({
    point: "0",
    day: formValidate.value.pointSettingItems.length,
  });
}
function init() {
  result.value = JSON.parse(props.res);
  Object.keys(result.value).map((item) => {
    if (item == "pointSettingItems") {
      return false;
    }
    result.value[item] += "";
  });

  formValidate.value = { ...result.value };

  Object.keys(formValidate.value).forEach((item) => {
    ruleValidate[item] = [
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
}

init();
</script>

<style lang="scss" scoped>
@import "./style.scss";

.label-item {
  display: flex;

  > .el-input-number {
    width: 120px;
    margin-right: 5px;
  }

  > .el-input-number:nth-last-of-type(1) {
    width: 180px;
    margin-right: 5px;
  }

  > .el-input {
    width: 180px;
    margin: 0 10px;
  }
}

:deep(.el-input){
  width: 180px !important;
}

.el-input {
  width: 180px;
  margin-right: 10px;
}

.label-btns {
  :deep(.el-button){
    margin-right: 10px;
  }
}
</style>
