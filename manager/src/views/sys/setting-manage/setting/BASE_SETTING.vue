<template>
  <div class="setting-page">
    <el-form ref="formValidateRef" label-width="150px" label-position="right" :model="formValidate" :rules="ruleValidate">
      <div class="setting-section">
        <div class="section-title">商城信息</div>
        <el-form-item label="商城名称" prop="siteName">
          <el-input v-model="formValidate.siteName" />
        </el-form-item>
        <el-form-item label="站点地址" prop="staticPageAddress">
          <el-input v-model="formValidate.staticPageAddress" />
        </el-form-item>
        <el-form-item label="wap站点地址" prop="staticPageWapAddress">
          <el-input v-model="formValidate.staticPageWapAddress" />
        </el-form-item>

        <el-form-item label="商城Logo" prop="domainLogo">
          <div class="upload-item">
            <div class="upload-row">
              <img alt="商城 Logo" v-if="formValidate.domainLogo" class="img img-logo" :src="formValidate.domainLogo" />
              <img v-else class="img img-logo" src="../../../../assets/emptyImg.png" alt="" />
              <el-button @click="onClickImg('domainLogo')">选择图片</el-button>
            </div>
            <span class="field-desc">各端logo统一展示，建议比例 17:6</span>
          </div>
        </el-form-item>
        <el-form-item label="商城Icon" prop="domainIcon">
          <div class="upload-item">
            <div class="upload-row">
              <img alt="商城图标" v-if="formValidate.domainIcon" class="img" :src="formValidate.domainIcon" />
              <img v-else class="img" src="../../../../assets/emptyImg.png" alt="" />
              <el-button @click="onClickImg('domainIcon')">选择图片</el-button>
            </div>
            <span class="field-desc">各端网站icon统一展示，建议比例 1:1</span>
          </div>
        </el-form-item>
      </div>

      <div class="setting-section">
        <div class="section-title">公司信息</div>
        <el-form-item label="公司名称" prop="companyName">
          <el-input v-model="formValidate.companyName" />
        </el-form-item>
        <el-form-item label="公司链接" prop="companyUrl">
          <el-input v-model="formValidate.companyUrl" />
        </el-form-item>
        <el-form-item label="官网地址" prop="website">
          <el-input v-model="formValidate.website" />
        </el-form-item>
        <el-form-item label="ICP备案号" prop="icp">
          <el-input v-model="formValidate.icp" />
        </el-form-item>
        <el-form-item label="版权归属" prop="copyrightOwner">
          <el-input v-model="formValidate.copyrightOwner" placeholder="留空时使用商城名称" maxlength="100" />
          <span class="field-desc">仅填写版权归属名称，Copyright © 和当前年份由系统自动显示</span>
        </el-form-item>
      </div>

      <div class="submit-bar">
        <el-button type="primary" @click="submit('formValidateRef')">保存</el-button>
      </div>
    </el-form>
    <el-dialog v-model="picModelFlag" width="1200px" append-to-body destroy-on-close :show-close="true">
      <ossManage
        @callback="callbackSelected"
        :isComponent="true"
        :initialize="picModelFlag"
        ref="ossManageRef"
      />
    </el-dialog>
  </div>
</template>
<script setup>
import { ref, reactive, nextTick, getCurrentInstance } from "vue";
import { ElMessage } from "element-plus";
import { setSetting } from "@/api/index";
import { setStore } from "@/libs/storage";
import { handleSubmit } from "./validate";
import ossManage from "@/views/sys/oss-manage/ossManage";

defineOptions({ title: "基础设置" });

const props = defineProps({
  res: {
    type: null,
    default: "",
  },
  type: "",
});

// validate.js 的 handleSubmit 仍接收组件实例读取 $refs
const { proxy } = getCurrentInstance();

const picModelFlag = ref(false);
const formValidate = ref({
  buyerSideLogo: "",
  companyName: "",
  companyUrl: "",
  copyrightOwner: "",
  domainLogo: "",
  icp: "",
  storeSideLogo: "",
  siteName: "",
  staticPageAddress: "",
  staticPageWapAddress: "",
  website: "",
});
const selected = ref("");
const ruleValidate = reactive({});
const result = ref("");

// 模板 ref：formValidate/ossManage 与顶层变量重名，改名避免互相覆盖
const formValidateRef = ref(null);
const ossManageRef = ref(null);

function onClickImg(item) {
  selected.value = item;
  picModelFlag.value = true;
  nextTick(() => {
    if (ossManageRef.value) {
      ossManageRef.value.selectImage = true;
    }
  });
}
function submit(name) {
  handleSubmit(proxy, name)
    .then(() => {
      setupSetting();
    })
    .catch(() => {});
}
function callbackSelected(val) {
  picModelFlag.value = false;
  formValidate.value[selected.value] = val.url;
}
function setupSetting() {
  formValidate.value.buyerSideLogo = formValidate.value.domainLogo;
  formValidate.value.storeSideLogo = formValidate.value.domainLogo;
  formValidate.value.buyerSideIcon = formValidate.value.domainIcon;
  formValidate.value.storeSideIcon = formValidate.value.domainIcon;
  setSetting(props.type, formValidate.value).then((res) => {
    if (res.success) {
      ElMessage.success("保存成功!");
      localStorage.setItem("icon", formValidate.value.domainLogo);
      window.document.title = formValidate.value.siteName + " - 运营后台";
      setStore("title", formValidate.value.siteName);
    } else {
      ElMessage.error("保存失败!");
    }
  });
}
function init() {
  result.value = JSON.parse(props.res);
  formValidate.value = { copyrightOwner: "", ...result.value };
  Object.keys(result.value).forEach((item) => {
    if (item === "copyrightOwner") return;
    ruleValidate[item] = [
      {
        required: true,
        message: "请填写必填项",
        trigger: "blur",
      },
    ];
  });
}

init();
</script>
<style scoped lang="scss">
@import "./style.scss";

.setting-page {
  padding: 16px 0;
}

.setting-section {
  background: #fff;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  padding: 20px 24px 4px;
  margin-bottom: 16px;
}

.section-title {
  font-size: 15px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 20px;
}

.field-desc {
  margin-top: 8px;
  color: #999;
  font-size: 12px;
  line-height: 1.4;
}

.upload-item {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.upload-row {
  display: flex;
  align-items: flex-end;
  img {
    margin-right: 10px;
    width: 100px;
    height: 100px;
    object-fit: contain;
  }
  // Logo 按建议比例 17:6 展示
  img.img-logo {
    width: 170px;
    height: 60px;
    border: 1px solid #ebeef5;
    border-radius: 4px;
    background: #fafafa;
  }
}

// 覆盖共享样式里 :deep(.el-input) 的 200px !important，统一输入框宽度
:deep(.el-input) {
  width: 400px !important;
}

.submit-bar {
  text-align: center;
  margin: 24px 0 8px;
}
</style>
