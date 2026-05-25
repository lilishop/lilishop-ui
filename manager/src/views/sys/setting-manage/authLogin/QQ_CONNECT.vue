<template>
  <div class="layout">
    <div class="row" v-for="(item, index) in formValidate" :key="index">
      <div class="col">
        <el-card shadow="never" :body-style="{ padding: '0 16px' }">
          <div class="icon-item" v-if="item.clientType == 'APP'">
            <img class="icon" src="../../../../assets/setting/app.svg" alt="" />
          </div>
          <div class="icon-item" v-if="item.clientType == 'PC'">
            <img class="icon" src="../../../../assets/setting/pc.svg" alt="" />
          </div>
          <div class="icon-item" v-if="item.clientType == 'WECHAT_MP'">
            <img class="icon" src="../../../../assets/setting/wechat_mp.svg" alt="" />
          </div>
          <div class="icon-item" v-if="item.clientType == 'H5'">
            <img class="icon" src="../../../../assets/setting/h5.svg" alt="" />
          </div>
          <div class="pay-title">{{ way[item.clientType] }}</div>
          <div>
            <el-divider content-position="left">登录设置</el-divider>
            <div class="pay-list">
              <el-form
                style="width: 100%"
                ref="formValidate"
                :model="formValidate"
                :rules="ruleValidate"
                label-width="80px"
              >
                <el-form-item label="appId" prop="appId">
                  <el-input @keyup.enter="setupSetting" class="label-appkey" v-model="item.appId" />
                </el-form-item>
                <el-form-item label="appKey" prop="appKey">
                  <el-input @keyup.enter="setupSetting" v-model="item.appKey" />
                </el-form-item>
              </el-form>
              <el-button @click="setupSetting">保存设置</el-button>
            </div>
          </div>
        </el-card>
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
      ruleValidate: {},
      way: {
        APP: "移动应用端",
        H5: "移动端",
        WECHAT_MP: "小程序端",
        PC: "PC端",
      },
      formValidate: {},
    };
  },
  props: ["res", "type"],
  created() {
    this.init();
  },
  methods: {
    submit(name) {
      const that = this;
      if (handleSubmit(that, name)) {
        this.setupSetting();
      }
    },
    setupSetting() {
      setSetting(this.type, {
        qqConnectSettingItemList: this.formValidate,
      }).then((res) => {
        if (res.success) {
          this.$Message.success("保存成功!");
          this.$Modal.remove();
        } else {
          this.$Message.error("保存失败!");
          this.$Modal.remove();
        }
      });
    },
    async init() {
      this.formValidate = JSON.parse(this.res).qqConnectSettingItemList;
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
@import "../setting/style.scss";
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
  width: 350px;
  margin-right: 20px;
  display: flex;
  margin-bottom: 20px;
}

.label-item {
  display: flex;
  align-items: center;
}
.pay-list {
  display: flex;
  justify-content: center;
  padding-bottom: 10px;
  flex-direction: column;
  align-items: center;
  :deep(.el-button){
    width: 100px;
  }
}
.icon-item {
  width: 100%;
  padding: 30px;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
}
.el-form-item {
  display: flex;
  align-items: center;
}
.icon {
  width: 100px;
  height: 100px;
}
</style>
