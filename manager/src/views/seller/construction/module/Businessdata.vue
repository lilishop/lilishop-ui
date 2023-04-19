<template>
  <div>
    <div class="btnstyle">
      <Button type="info" @click="nextStep('name2')" style="margin-right: 10px"
        >上一步</Button
      >
      <Button type="warning" @click="nextStep('name6')">下一步</Button>
    </div>
    <Card>
      <Form
        label-colon
        ref="submitFrom.sales_scene_info"
        :model="submitFrom"
        :label-width="160"
        :rules="sales_scene_info"
      >
        <h2>店铺信息</h2>
        <FormItem label="店铺名称" prop="sales_scene_info.store_name">
          <Input
            v-model="submitFrom.sales_scene_info.store_name"
            placeholder="店铺名称"
          ></Input>
          <div class="hrtop">请填写店铺全称</div>
        </FormItem>
        <FormItem label="店铺链接">
          <Input
            v-model="submitFrom.sales_scene_info.store_url"
            placeholder="店铺链接"
          ></Input>
          <div class="hrtop">
            1、店铺二维码or店铺链接二选一必填。
            2、请填写店铺主页链接，需符合网站规范。
          </div>
        </FormItem>
        <FormItem label="店铺二维码">
          <div class="label-item-upload">
            <img
              v-if="submitFrom.sales_scene_info.store_qr_code"
              class="img"
              :src="submitFrom.sales_scene_info.store_qr_code"
            />
            <img
              v-else
              class="img"
              src="../../../../assets/emptyImg.png"
              alt=""
            />
            <Button @click="onClickImg('store_qr_code')">选择图片</Button>
          </div>
        </FormItem>
        <FormItem
          v-if="submitFrom.organization_type != '2401'"
          label="小程序AppID"
          prop="sales_scene_info.mini_program_sub_appid"
        >
          <Input
            v-model="submitFrom.sales_scene_info.mini_program_sub_appid"
            placeholder="小程序AppID"
          ></Input>
        </FormItem>
      </Form>
    </Card>
    <Modal width="1200px" v-model="picModelFlag">
      <ossManage @callback="callbackSelected" ref="ossManage" />
    </Modal>
  </div>
</template>
<script>
import ossManage from "@/views/sys/oss-manage/ossManage";

import { regular } from "@/utils";
export default {
  components: {
    ossManage,
  },
  data() {
    return {
      picModelFlag: false, // 预览图片显隐
      selected: "", // 已选数据
      sales_scene_info: {
        merchant_shortname: [regular.REQUIRED],
        "sales_scene_info.store_name": [regular.REQUIRED],
        "sales_scene_info.customer_service_phone": [regular.REQUIRED],
        "sales_scene_info.region_ids": [regular.REQUIRED],
        "sales_scene_info.shop_interior_img": [
          { required: true, message: "参数必填", trigger: "change" },
        ],
        "sales_scene_info.shop_front_img": [
          { required: true, message: "参数必填", trigger: "change" },
        ],
      },
      regionData: [],
    };
  },
  props: {
    submitFrom: {
      type: Object,
      default: () => {},
    },
  },
  computed: {

  },
  watch: {

  },

  methods: {
    validated(){
      return this.$refs['submitFrom.sales_scene_info'].validate((valid) => {
        return valid
      })
    },
    nextStep(name) {
      // console.log(this.submitFrom.sales_scene_info);
      // this.$store.commit("submitBusinessData", this.submitFrom.sales_scene_info);
      this.$emit("callbackTab", name);
    },
    onClickImg(item) {
      this.selected = item;
      this.$refs.ossManage.selectImage = true;
      this.picModelFlag = true;
    },
    callbackSelected(val) {
      this.submitFrom.sales_scene_info[this.selected] = val.url;
      this.picModelFlag = false;
    },
  },
};
</script>
<style scoped lang="scss">
h2 {
  margin-left: 5px;
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
.formstyle {
  display: flex;
}
::v-deep .ivu-form-item-label {
  overflow: hidden;
}
.btnstyle {
  margin-bottom: 10px;
  display: flex;
  justify-content: flex-end;
}
.hrtop {
  margin-top: 10px;
  color: #a0a0a0;
}
</style>
