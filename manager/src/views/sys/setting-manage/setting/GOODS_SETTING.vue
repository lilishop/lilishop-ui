<template>
  <div class="layout">
    <el-form ref="formValidateRef" label-width="150px" label-position="right" :model="formValidate" :rules="ruleValidate">
      <el-form-item label="商品审核" prop="goodsCheck">
        <el-radio-group v-model="formValidate.goodsCheck">
          <el-radio-button value="true">开启</el-radio-button>
          <el-radio-button value="false">关闭</el-radio-button>
        </el-radio-group>
        <span class="desc">商品审核关闭后，商家添加商品则无需审核直接上架</span>
      </el-form-item>
      <div class="label-item">
        <el-form-item class="label-item" label="缩略图宽" prop="abbreviationPictureWidth">
          <el-input type="number" v-model="formValidate.abbreviationPictureWidth">
            <template #prepend>宽</template>
            <template #append>px</template>
          </el-input>
        </el-form-item>
        <el-form-item class="label-item" label="缩略图高" prop="abbreviationPictureHeight">
          <el-input type="number" v-model="formValidate.abbreviationPictureHeight">
            <template #prepend>高</template>
            <template #append>px</template>
          </el-input>
        </el-form-item>
      </div>
      <div class="label-item">
        <el-form-item label="小图宽" prop="smallPictureWidth">
          <el-input type="number" v-model="formValidate.smallPictureWidth">
            <template #prepend>宽</template>
            <template #append>px</template>
          </el-input>
        </el-form-item>
        <el-form-item label="小图高" class="label-item" prop="smallPictureHeight">
          <el-input type="number" v-model="formValidate.smallPictureHeight">
            <template #prepend>高</template>
            <template #append>px</template>
          </el-input>
        </el-form-item>
      </div>
      <div class="label-item">
        <el-form-item class="label-item" label="原图宽高" prop="originalPictureWidth">
          <el-input type="number" v-model="formValidate.originalPictureWidth">
            <template #prepend>宽</template>
            <template #append>px</template>
          </el-input>
        </el-form-item>
        <el-form-item class="label-item" label="原图宽高" prop="originalPictureHeight">
          <el-input type="number" v-model="formValidate.originalPictureHeight">
            <template #prepend>高</template>
            <template #append>px</template>
          </el-input>
        </el-form-item>
      </div>
      <div class="label-btns goods-setting-btns">
        <div class="goods-setting-save-row">
          <el-button type="primary" @click="submit('formValidate')">保存</el-button>
        </div>
      </div>
    </el-form>
  </div>
</template>
<script setup>
import { reactive, ref } from "vue";
import { ElMessage } from "element-plus";
import { setSetting } from "@/api/index";

const props = defineProps(["res", "type"]);

// 表单数据（init 中整体替换）
const formValidate = ref({
  goodsCheck: 1,
  smallPictureHeight: "0",
  smallPictureWidth: "0",
  abbreviationPictureWidth: "0",
  abbreviationPictureHeight: "0",
  originalPictureWidth: "0",
  originalPictureHeight: "0",
});
// 校验规则（只做属性合并）
const ruleValidate = reactive({});
const result = ref("");

// 模板 ref 与 data 变量 formValidate 同名会互相覆盖，改名 formValidateRef
const formValidateRef = ref(null);
// 动态 ref 映射表（模板中以字符串名称调用 submit）
const refsMap = { formValidate: formValidateRef };

function submit(name) {
  refsMap[name].value.validate((valid) => {
    if (valid) {
      setupSetting();
    } else {
      ElMessage.error("请正确填写内容!");
    }
  });
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
  result.value = JSON.parse(props.res);
  Object.keys(result.value).map((item) => {
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
}
.goods-setting-btns {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 10px;
  margin-left: 150px;
}
:deep(.el-input){
  width: 180px !important;
}
</style>
