<template>
  <div class="layout">
    <el-form ref="formValidateRef" label-width="150px" label-position="right" :model="formValidate" :rules="ruleValidate">
      <el-form-item label="云IM地址" prop="httpUrl">
        <el-input v-model="formValidate.httpUrl"/>
        <span class="desc">配置买家端联系客服以及商家端登录客服跳转的路径</span>
      </el-form-item>

      <el-divider content-position="left">客服图片存储</el-divider>
      <el-form-item label="OSS Bucket" prop="imageOssBucket">
        <el-input v-model.trim="formValidate.imageOssBucket" placeholder="客服图片专用桶名称" />
        <span class="desc">使用独立于商品、头像的桶，并在 OSS 控制台设为公共读、私有写。</span>
      </el-form-item>
      <el-form-item label="OSS Endpoint" prop="imageOssEndpoint">
        <el-input v-model.trim="formValidate.imageOssEndpoint" placeholder="oss-cn-beijing.aliyuncs.com" />
        <span class="desc">填写公网节点域名，不含 https:// 或路径。</span>
      </el-form-item>
      <el-form-item label="AccessKey ID" prop="imageOssAccessKeyId">
        <el-input v-model.trim="formValidate.imageOssAccessKeyId" autocomplete="off" />
      </el-form-item>
      <el-form-item label="AccessKey Secret" prop="imageOssAccessKeySecret">
        <el-input v-model.trim="formValidate.imageOssAccessKeySecret" type="password" show-password autocomplete="new-password" />
      </el-form-item>
      <el-form-item>
        <span class="desc">客户和客服的图片统一按会话所属店铺存储。支持 PNG、JPG、GIF、WebP，单张不超过10MB。四项均留空时无法发送图片，上传失败不会写入通用桶；持有图片链接即可查看。</span>
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

const props = defineProps(["res", "type"]);

// handleSubmit(that, name) 通过 that.$refs[name] 取表单实例
const { proxy } = getCurrentInstance();

// 只做属性合并的成组对象
const ruleValidate = reactive({}); // 验证规则
const formValidate = ref({ // 表单数据
  httpUrl: "",
  imageOssBucket: "",
  imageOssEndpoint: "",
  imageOssAccessKeyId: "",
  imageOssAccessKeySecret: "",
});
const result = ref("");

// 模板 ref 与 data 同名会互相覆盖，改名 formValidateRef 并同步改 script
const formValidateRef = ref(null);

// 保存
function submit(name) {
  handleSubmit(proxy, name)
    .then(() => {
      setupSetting();
    })
    .catch(() => {});
}

// 保存设置
function setupSetting() {
  setSetting(props.type, formValidate.value).then((res) => {
    if (res.success) {
      ElMessage.success("保存成功!");
    } else {
      ElMessage.error("保存失败!");
    }
  });
}

// 实例化数据
function init() {
  result.value = JSON.parse(props.res);

  formValidate.value = { ...formValidate.value, ...result.value };
  ruleValidate.httpUrl = [
      {
        required: true,
        message: "请填写必填项",
        trigger: "blur",
      },
    ];
  ["imageOssBucket", "imageOssEndpoint", "imageOssAccessKeyId", "imageOssAccessKeySecret"].forEach((key) => {
    ruleValidate[key] = [{ validator: validateImageStorage, trigger: "blur" }];
  });
}

// 四项配置可整体留空；填写任一项后必须完整，避免只保存节点或密钥导致上传不可用。
function validateImageStorage(rule, value, callback) {
  const keys = ["imageOssBucket", "imageOssEndpoint", "imageOssAccessKeyId", "imageOssAccessKeySecret"];
  const values = keys.map((key) => (formValidate.value[key] || "").trim());
  if (values.some(Boolean) && !values.every(Boolean)) {
    callback(new Error("请完整填写客服图片 OSS 的四项配置"));
    return;
  }
  callback();
}

init();
</script>

<style lang="scss" scoped>
@import "./style.scss";

.label-item {
  display: flex;
}

:deep(.el-input){
  width: 300px !important;
  margin: 0 10px;
}

.el-input {
  width: 300px;
  margin-right: 10px;
}
</style>
