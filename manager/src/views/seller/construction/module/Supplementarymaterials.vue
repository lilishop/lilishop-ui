<template>
  <div>
    <div class="btnstyle">
      <Button type="info" @click="nextStep('name6')" style="margin-right: 10px"
        >上一步</Button
      >

    </div>
    <Card>
      <Form
        label-colon
        ref="submitFrom.addition_info"
        :model="submitFrom.addition_info"
        :label-width="160"
      >
        <!-- <FormItem label="法人开户承诺函">

          <div class="label-item-upload">
            <img
              v-if="submitFrom.legal_person_commitment"
              class="img"
              :src="submitFrom.legal_person_commitment"
            />
            <img
              v-else
              class="img"
              src="../../../../assets/emptyImg.png"
              alt=""
            />
            <Button @click="onClickImg('legal_person_commitment')"
              >选择图片</Button
            >
          </div>
          <div class="hrtop">
            请上传法定代表人或负责人亲笔签署的开户承诺函扫描件
            <a href="#" @click="downloadTemplate">（下载模板）</a
            >。亲笔签名承诺函内容清晰可见，不得有涂污，破损，字迹不清晰现象。
          </div>
        </FormItem>
        <FormItem FormItem label="法人开户意愿视频">
          <div class="label-item-upload">
            <img
              v-if="submitFrom.business_addition_pics"
              class="img"
              :src="submitFrom.business_addition_pics"
            />
            <img
              v-else
              class="img"
              src="../../../../assets/emptyImg.png"
              alt=""
            />
            <Button @click="onClickImg('business_addition_pics')"
              >选择图片</Button
            >
          </div>

          <div class="hrtop">
            1、建议法人按如下话术录制“法人开户意愿视频”：
            我是#公司全称#的法定代表人（或负责人），特此证明本公司申请的商户号为我司真实意愿开立且用于XX业务（或XX服务）。我司现有业务符合法律法规及腾讯的相关规定。
          </div>
          <div>
            2、支持上传5M内的视频，格式可为avi、wmv、mpeg、mp4、mov、mkv、flv、f4v、m4v、rmvb；
          </div>
        </FormItem> -->

        <FormItem FormItem label="补充材料">
          <div class="label-item-upload">
            <div class="flex" v-if="picArr.length">
              <div
                class="img-item"
                v-for="(item, index) in picArr"
                :key="index"
              >
                <img class="img" :src="item" />
                <Icon @click="handleDelImg(index)" size="20" type="md-close" />
              </div>
            </div>
            <img
              v-else
              class="img"
              src="../../../../assets/emptyImg.png"
              alt=""
            />
            <Button @click="onClickImg('business_addition_pics')"
              >选择图片</Button
            >
          </div>
          <div class="hrtop">最多可上传5张照片</div>
        </FormItem>
        <FormItem label="特殊资质图片">
          <div class="label-item-upload">
            <div class="flex" v-if="otherPicArr.length">
              <div
                class="img-item"
                v-for="(item, index) in otherPicArr"
                :key="index"
              >
                <img class="img" :src="item" />
                <Icon
                  @click="handleDelImg(index, 'qualifications')"
                  size="20"
                  type="md-close"
                />
              </div>
            </div>
            <img
              v-else
              class="img"
              src="../../../../assets/emptyImg.png"
              alt=""
            />
            <Button @click="onClickImg('qualifications')">选择图片</Button>
          </div>
          <div class="hrtop">
            1、根据所属行业的特殊资质要求提供，详情查看
            <a
              target="_blank"
              href="https://kf.qq.com/faq/220228qEfuAz220228bMFji6.html"
              >费率结算规则对照表</a
            >
          </div>
          <div>
            2、最多可上传5张照片，请填写通过图片上传API接口预先上传图片生成好的MediaID
          </div>
        </FormItem>
        <FormItem FormItem label="补充说明">
          <Input
            v-model="submitFrom.business_addition_desc"
            placeholder="请输入补充说明"
          ></Input>
          <div class="hrtop">512字以内</div>
        </FormItem>
      </Form>
    </Card>
    <Modal width="1200px" v-model="picModelFlag">
      <ossManage @callback="callbackSelected" ref="ossManage" />
    </Modal>
  </div>
</template>
<script>
import { submitForm } from "@/api/promotion";
import { editputConstruction } from "@/api/shops";
import ossManage from "@/views/sys/oss-manage/ossManage";
import { editConstruction } from "@/api/shops";

export default {
  components: {
    ossManage,
  },
  data() {
    return {
      picModelFlag: false, // 预览图片显隐
      selected: "", // 已选数据
      picArr: [], //补充材料
      otherPicArr: [], //特殊资质
    };
  },
  props: {
    submitFrom: {
      type: Object,
      default: () => {},
    },
  },
  watch: {
    submitFrom: {
      handler(val) {
        if (val.qualifications) {
          this.otherPicArr = val.qualifications.split(",");
        }
        if (val.business_addition_pics) {
          this.picArr = val.business_addition_pics.split(",");
        }
      },
      deep: true,
    },
  },
  methods: {

    downloadTemplate() {
      window.open("https://kf.qq.com/faq/191018yUFjEj191018Vfmaei.html");
    },

    onClickImg(item) {
      this.selected = item;
      this.$refs.ossManage.selectImage = true;
      this.picModelFlag = true;
    },
    handleDelImg(index, type) {
      if (type) {
        this.otherPicArr.splice(index, 1);
        this.submitFrom.qualifications = this.otherPicArr.join(",");
      } else {
        this.picArr.splice(index, 1);
        this.submitFrom.business_addition_pics = this.picArr.join(",");
      }
    },
    nextStep(name) {
      this.$emit("callbackTab", name);
    },
    callbackSelected(val) {
      if (this.selected == "business_addition_pics") {
        this.picArr.push(val.url);
        this.submitFrom.business_addition_pics = this.picArr.join(",");
      }
      if (this.selected == "qualifications") {
        this.otherPicArr.push(val.url);
        this.submitFrom.qualifications = this.otherPicArr.join(",");
      }
      this.picModelFlag = false;
    },
  },
};
</script>
<style scoped lang="scss">
.btnstyle {
  margin-bottom: 10px;
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
.hrtop {
  margin-top: 15px;
}
div {
  color: #a0a0a0;
}
.img-item {
  position: relative;
  overflow: hidden;
  margin: 10px;
  cursor: pointer;
}
.ivu-icon {
  position: absolute;
  right: 0;
}
</style>
