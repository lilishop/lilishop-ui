
<template>
  <el-card class="sms-setting-card">
    <div class="cardBox">
      <div class="methodItem">
        <img src="../../../assets/aliyun.png" height="172" width="440" />
        <h4>阿里云短信</h4>
      </div>
      <div class="bar">
        <div class="status" style="color: rgb(53, 189, 129)">已启用</div>
        <div><a class="links">编辑</a></div>
      </div>
    </div>
    <el-dialog v-model="modalVisible" :title="modalTitle" width="500px" :close-on-click-modal="false">
      <el-form ref="form" :model="form" label-width="100px" :rules="formValidate">
        <el-form-item label="accessKeyId" prop="addressName">
          <el-input v-model="form.accessKeyId" clearable style="width: 100%" />
        </el-form-item>
        <el-form-item label="accessSecret" prop="accessSecret">
          <el-input v-model="form.accessSecret" clearable style="width: 100%" />
        </el-form-item>
        <el-form-item label="signName" prop="signName">
          <el-input v-model="form.signName" clearable style="width: 100%" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="modalVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="saveSetting">提交</el-button>
      </template>
    </el-dialog>
  </el-card>
</template>
<script>
import { ElMessage } from "element-plus";
import { getSetting, setSetting } from "@/api/index.js";
import template from "./template";
export default {
  name: "smsSettingManage",
  components: {
    template,
  },

  data() {
    return {
      submitLoading: false,
      template,
      selected: "",
      settingData: "",
      modalTitle: "设置",
      modalVisible: false,
      form: {},
    };
  },
  methods: {
    init() {
      settingInfo("SMS_SETTING");
    },
    saveSetting() {
      setSetting("SMS_SETTING", this.form).then((res) => {
        if (res.success) {
          ElMessage.success("保存成功!");
        } else {
          ElMessage.error("保存失败!");
        }
        this.modalVisible = false;
      });
    },
    settingInfo(v) {
      alert();
      this.selected = v;
      getSetting(v).then((res) => {
        if (res.result) {
          console.log(res);
          this.modalVisible = true;
          this.form = res;
        }
      });
    },
  },
  mounted() {
    this.init();
  },
};
</script>
<style lang="scss">
.sms-setting-card {
  width: 100%;
  height: 100%;
  position: fixed;
}
.cardBox {
  display: inline-block;
  border-radius: 2px;
  line-height: 1.5;
  margin-right: 20px;
  width: 300px;
  border: 1px solid #eee;
  padding: 10px;
}

.methodItem {
  width: 100%;
  border: 1px solid #f5f5f5;
  text-align: center;
  padding: 20px 0;
}

methodItem img {
  width: 220px;
  height: 86px;
}

methodItem h4 {
  font-size: 14px;
  color: #333;
  margin-top: 5px;
}

.methodItem img {
  width: 220px;
  height: 86px;
}

.bar {
  -webkit-flex-direction: row;
  -ms-flex-direction: row;
  flex-direction: row;
  display: -webkit-box;
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
  -webkit-box-pack: justify;
  -webkit-justify-content: space-between;
  -ms-flex-pack: justify;
  justify-content: space-between;
  -webkit-align-items: center;
  -webkit-box-align: center;
  -ms-flex-align: center;
  align-items: center;
  padding: 10px 8px 0;
}
</style>
