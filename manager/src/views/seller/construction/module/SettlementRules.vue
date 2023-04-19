<template>
  <div>
    <Card>
      <div class="btnstyle">
        <Button type="warning" @click="nextStep">下一步</Button>
      </div>
      <Form
        label-colon
        ref="settlement_info"
        :model="settlement_info"
        :label-width="160"
      >
        <FormItem label="入驻结算规则ID" v-if="settlement_info && settlement_info.settlement_id">
          <Input
            v-model="settlement_info.settlement_id"
            placeholder="请输入入驻结算规则ID"
          ></Input>
          <div class="hrtop">
            请选择结算规则ID，详细参见
            <a href="#" @click="routeRules">费率结算规则对照表</a>
          </div>
        </FormItem>

        <FormItem label="所属行业">
          <Input
            v-model="settlement_info.qualification_type"
            placeholder="请输入所属行业"
          ></Input>
          <div class="hrtop">
            请选择结算规则ID，详细参见
            <a href="#" @click="routeRules">费率结算规则对照表</a>
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
import ossManage from "@/views/sys/oss-manage/ossManage";
import { editConstruction } from "@/api/shops";

export default {
  components: {
    ossManage,
  },
  data() {
    return {
      settlement_info: {
        settlement_id: "",
        qualification_type: "",
      },
      picModelFlag: false, // 预览图片显隐
      selected: "", // 已选数据
    };
  },
  methods: {
    routeRules() {
      window.open("https://kf.qq.com/faq/220228IJb2UV220228uEjU3Q.html");
    },
    nextStep() {
      console.log(this.settlement_info);
      this.$store.commit("submitSettlementRules", this.settlement_info);
    },
    onClickImg(item) {
      this.selected = item;
      this.$refs.ossManage.selectImage = true;
      this.picModelFlag = true;
    },
    callbackSelected(val) {
      if (this.selected == "qualifications") {
        this.settlement_info[this.selected] = [val.url];
        this.picModelFlag = false;
      } else {
        this.picModelFlag = false;
        this.settlement_info[this.selected] = val.url;
      }
    },
  },
  mounted() {
    // this.settlement_info = this.$store.state.formDataList.settlement_info;
    if (this.$route.query.id) {
      editConstruction(this.$route.query.id).then((res) => {
        if (res.code == 200) {
          this.settlement_info = res.result.settlement_info;
        }
      });
    }
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
</style>
