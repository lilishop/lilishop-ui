<template>
  <div>
    <div class="btnstyle">
      <Button type="info" @click="nextStep('name3')" style="margin-right: 10px"
        >上一步</Button
      >
      <Button type="warning" @click="nextStep('name4')">下一步</Button>
    </div>
    <Card>
      <Form
        label-colon
        ref="submitFrom.contact_info"
        :model="submitFrom.contact_info"
        :label-width="250"
      >
        <!-- <FormItem
          label="绑定openId"
          prop="openId"
        >
         <vue-qr
            :text="qrCode"
            :margin="0"
            colorDark="#000"
            colorLight="#fff"
            :size="150"
          ></vue-qr>
          <Button :loading='bindOpenId' :type="submitFrom.contact_info.openid ? 'primary' : 'default'" style="margin-left:10px" @click="verification">{{ submitFrom.contact_info.openid ? '已' : '' }}绑定</Button>
      </FormItem> -->
      </Form>
      <Form
        label-colon
        ref="submitFrom.contact_info"
        :model="submitFrom.contact_info"
        :rules="contact_info_rule"
        :label-width="250"
      >
        <FormItem label="超级管理员类型" prop="contact_type">
          <Select
            @on-change="changeSwitchcontact_type"
            v-model="submitFrom.contact_info.contact_type"
            placeholder="请选择超级管理员类型"
          >
            <Option value="66">经办人</Option>
            <Option value="65">经营者/法人</Option>
          </Select>
        </FormItem>
        <FormItem label="超级管理员姓名" prop="contact_name">
          <Input
            v-model="submitFrom.contact_info.contact_name"
            placeholder="请输入超级管理员姓名"
          ></Input>
        </FormItem>
        <FormItem
          v-if="submitFrom.contact_info.contact_type=='66'"
          label="超级管理员证件类型"
          prop="contact_id_doc_type"
        >
          <Select
            v-model="submitFrom.contact_info.contact_id_doc_type"
            placeholder="请选择超级管理员证件类型"
            @on-change="changeSwitchcontact_id_doc_type"
          >
            <Option
              v-for="item in DocumentType"
              :value="item.value"
              :key="item.value"
              >{{ item.title }}</Option
            >
          </Select>
        </FormItem>
        <FormItem  v-if="submitFrom.contact_info.contact_type=='66'" label="超级管理员身份证件号码" prop="contact_id_card_number">
          <Input
            v-model="submitFrom.contact_info.contact_id_card_number"
            placeholder="请输入超级管理员身份证件号码"
          ></Input>
          <div>
            1.可传身份证、来往内地通行证、来往大陆通行证、护照等证件号码。
          </div>
        </FormItem>
        <FormItem
          v-if="submitFrom.contact_info.contact_type === '66'"
          label="超级管理员证件正面照片"
          prop="contact_id_doc_copy"
        >
        <Input v-show="false" v-model="submitFrom.contact_info.contact_id_doc_copy" ></Input>
          <div class="label-item-upload">
            <img
              v-if="submitFrom.contact_info.contact_id_doc_copy"
              class="img"
              :src="submitFrom.contact_info.contact_id_doc_copy"
            />
            <img
              v-else
              class="img"
              src="../../../../assets/emptyImg.png"
              alt=""
            />
            <Button @click="onClickImg('contact_id_doc_copy')">选择图片</Button>
          </div>
          <div>
            1.可上传1张图片，请填写通过图片上传API预先上传图片生成好的MediaID。
            2.、请上传彩色照片or彩色扫描件or复印件（需加盖公章鲜章），可添加“微信支付”相关水印（如微信支付认证）
          </div>
        </FormItem>
        <FormItem
          v-if="submitFrom.contact_info.contact_type === '66'"
          label="超级管理员证件反面照片"
        >
         <Input v-show="false" v-model="submitFrom.contact_info.contact_id_doc_copy_back" ></Input>

          <div class="label-item-upload">
            <img
              v-if="submitFrom.contact_info.contact_id_doc_copy_back"
              class="img"
              :src="submitFrom.contact_info.contact_id_doc_copy_back"
            />
            <img
              v-else
              class="img"
              src="../../../../assets/emptyImg.png"
              alt=""
            />
            <Button @click="onClickImg('contact_id_doc_copy_back')"
              >选择图片</Button
            >
          </div>
          <div>
            1、可上传1张图片，请填写通过图片上传API预先上传图片生成好的MediaID。
            2、请上传彩色照片or彩色扫描件or复印件（需加盖公章鲜章），可添加“微信支付”相关水印（如微信支付认证）。
          </div>
        </FormItem>
        <FormItem
          v-if="submitFrom.contact_info.contact_type === '66'"
          label="超级管理员证件有效期开始时间"
          prop="contact_id_doc_period_begin"
        >
          <DatePicker
            clearable
            type="date"
            placeholder="请选择证件有效期开始时间"
            format="yyyy-MM-dd"
            :value="submitFrom.contact_info.contact_id_doc_period_begin"
            @on-change="
              submitFrom.contact_info.contact_id_doc_period_begin = $event
            "
          />
        </FormItem>
        <FormItem
          v-if="submitFrom.contact_info.contact_type === '66'"
          label="超级管理员证件有效期结束时间"
          prop="contact_id_doc_period_end"
        >
          <DatePicker
            clearable
            type="date"
            placeholder="请选择证件有效期结束时间"
            format="yyyy-MM-dd"
            :value="submitFrom.contact_info.contact_id_doc_period_end"
            @on-change="
              submitFrom.contact_info.contact_id_doc_period_end = $event
            "
          />

          <Button @click="longTimeEffect" :type="
                submitFrom.contact_info.contact_id_doc_period_end == '长期'
                  ? 'primary'
                  : 'default'
              " style="margin-left: 10px">长期有效
              </Button>


        </FormItem>
        <FormItem
          v-if="submitFrom.contact_info.contact_type === '66'"
          label="业务办理授权函"
          prop="business_authorization_letter"
        >
         <Input v-show="false" v-model="submitFrom.contact_info.business_authorization_letter" ></Input>

          <div class="label-item-upload">
            <img
              v-if="submitFrom.contact_info.business_authorization_letter"
              class="img"
              :src="submitFrom.contact_info.business_authorization_letter"
            />
            <img
              v-else
              class="img"
              src="../../../../assets/emptyImg.png"
              alt=""
            />
            <Button @click="onClickImg('business_authorization_letter')"
              >选择图片</Button
            >
          </div>
          <div>
            1、请参照
            <a href="#" @click="Examplediagram">示例图</a>
            打印业务办理授权函，全部信息需打印，不支持手写商户信息，并加盖公章。
            2、可上传1张图片,请填写通过图片上传API预先上传图片生成好的MediaID。
          </div>
        </FormItem>
        <!-- <FormItem label="超级管理员微信OpenID">
          <Input
            v-model="submitFrom.contact_info.openid"
            placeholder="请输入超级管理员微信OpenID"
          ></Input>
        </FormItem> -->
        <FormItem label="联系手机">
          <Input
            v-model="submitFrom.contact_info.mobile_phone"
            placeholder="请输入联系手机"
          ></Input>
          <div>用于接收微信支付的重要管理信息及日常操作验证码</div>
        </FormItem>
        <FormItem label="联系邮箱">
          <Input
            v-model="submitFrom.contact_info.contact_email"
            placeholder="请输入联系邮箱"
          ></Input>
          <div>
            1、小微选填，个体工商户/企业/党政、机关及事业单位/其他组织必填；
            2、用于接收微信支付的开户邮件及日常业务通知；
          </div>
        </FormItem>
      </Form>
    </Card>
    <Modal width="1200px" v-model="picModelFlag">
      <ossManage @callback="callbackSelected" ref="ossManage" />
    </Modal>
  </div>
</template>
<script>
import vueQr from "vue-qr";
import ossManage from "@/views/sys/oss-manage/ossManage";
import { editConstruction } from "@/api/shops";
import { weChatApply } from "@/api/other";
export default {
  components: {
    ossManage,
    vueQr,
  },
  computed:{
    DocumentType(){
      return this.$store.state.app.weChatApplyDocTypeList;
    }
  },
  data() {
    return {
      qrCode: "NINEUUID" + new Date().getTime(),
      //表单校验
      Superadministratortype: false,
      showHide: false,
      picModelFlag: false,


      contact_info_rule: {
        contact_type: [
          {
            required: true,
            message: "请选择超级管理员类型",
            trigger: "change",
          },
        ],
        contact_name: [
          { required: true, message: "请输入超级管理员姓名", trigger: "blur" },
        ],
        contact_id_doc_type: [
          { required: true, message: "请选择证件类型", trigger: "change" },
        ],
        contact_id_card_number: [
          { required: true, message: "请输入证件号码", trigger: "blur" },
        ],
        contact_id_doc_copy: [
          { required: true, message: "请上传证件照片", trigger: "change" },
        ],
        contact_id_doc_copy_back: [
          { required: true, message: "请上传证件照片", trigger: "change" },
        ],
        contact_id_doc_period_begin: [
          { required: true, message: "请选择证件有效期" },
        ],
        contact_id_doc_period_end: [
          { required: true, message: "请选择证件有效期" },
        ],
        business_authorization_letter: [
          { required: true, message: "请上传授权函", trigger: "change" },
        ],
        openid: [
          {
            required: true,
            message: "请输入超级管理员微信OpenID",
            trigger: "blur",
          },
        ],
        mobile_phone: [
          { required: true, message: "请输入联系手机", trigger: "blur" },
        ],
        contact_email: [
          { required: true, message: "请输入联系邮箱", trigger: "blur" },
        ],
      },
      bindOpenId: false,
    };
  },
  props: {
    submitFrom: {
      type: Object,
      default: () => {},
    },
  },
  methods: {
    // 设置为长期有效
    longTimeEffect () {
      this.$set(this.submitFrom.contact_info, 'contact_id_doc_period_end', '长期');
      this.$forceUpdate()
      },
    validated() {
      return this.$refs["submitFrom.contact_info"].validate((valid) => {
        return valid;
      });
    },

    //验证是否绑定openid
    // async verification() {
    //   this.bindOpenId = true;
    //   const res = await weChatApply(this.qrCode);
    //   if (res.success && res.result) {
    //     this.$Message.success("已绑定");
    //     this.submitFrom.contact_info.openid = res.result;
    //   }
    //   this.bindOpenId = false;
    // },
    Examplediagram() {
      window.open("https://kf.qq.com/faq/220509Y3Yvym220509fQvYR7.html");
    },
    changeSwitchcontact_id_doc_type(v) {
      if (v == "IDENTIFICATION_TYPE_OVERSEA_PASSPORT") {
      }
    },
    changeSwitchcontact_type(v) {
      if (v == "2") {
        this.showHide = true;
        this.Superadministratortype = true;
      } else {
        this.Superadministratortype = false;
        this.showHide = false;
      }
    },
    nextStep(name) {
      // this.$refs[name].validate((valid) => {
      //   if (valid) {
      //     this.$Message.success("Success!");
      //   } else {
      //     this.$Message.error("Fail!");
      //   }
      // });
      // this.$store.commit("submitSuperadministrator", this.submitFrom.contact_info);
      this.$emit("callbackTab", name);
    },

    onClickImg(item) {
      this.selected = item;
      this.$refs.ossManage.selectImage = true;
      this.picModelFlag = true;
    },
    callbackSelected(val) {
      this.picModelFlag = false;
      this.submitFrom.contact_info[this.selected] = val.url;
    },
  },
};
</script>
<style scoped lang="scss">
// ::v-deep.ivu-select {
//   width: 300px;
// }
// ::v-deep .ivu-input {
//   width: 300px;
// }
.btnstyle {
  margin-bottom: 30px;
  display: flex;
  justify-content: flex-end;
}
.label-item-upload {
  display: flex;
  align-items: flex-end;
  img {
    margin-right: 10px;
    width: 100px;
    height: 100px;
  }
}
div {
  color: #a0a0a0;
}
</style>
