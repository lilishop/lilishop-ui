<template>
  <div>
    <Card>
      <Tabs v-model="tab" value="name1">
        <TabPane label="主体类型" name="name1">
          <Main @callback="callbackMain" :submitFrom="submitFrom" />
        </TabPane>

        <TabPane label="主体资料" name="name3">
          <Maindata ref="Maindata" @callbackTab="callbackTab" :mainType="mainType" :submitFrom="submitFrom"></Maindata>
        </TabPane>
        <TabPane label="超级管理员信息" name="name2">
          <Superinformation ref="Superinformation" @callbackTab="callbackTab" :submitFrom="submitFrom"></Superinformation>
        </TabPane>
        <TabPane label="店铺信息" name="name4">
          <Businessdata ref="Businessdata" @callbackTab="callbackTab" :submitFrom="submitFrom"></Businessdata>
        </TabPane>
        <!-- <TabPane label="结算规则" name="name5"
          ><SettlementRules></SettlementRules
        ></TabPane> -->
        <TabPane label="结算账户信息" name="name6">
          <Settlementbankaccount ref="Settlementbankaccount" @callbackTab="callbackTab" :submitFrom="submitFrom">
          </Settlementbankaccount>
        </TabPane>
        <TabPane label="补充材料" name="name7">
          <Supplementarymaterials @callbackTab="callbackTab" @validate="validate" :submitFrom="submitFrom">
          </Supplementarymaterials>
        </TabPane>
      </Tabs>

      <div class="btn flex">
        <ButtonGroup>


          <Button type="primary" @click="validate" :loading="loading">提交</Button>
          <Button type="default" @click="handleDraftSave" :loading="loading">暂存</Button>
        </ButtonGroup>
      </div>
    </Card>
  </div>
</template>
<script>
import {
  Businessdata,
  Maindata,
  Settlementbankaccount,
  SettlementRules,
  Superinformation,
  Supplementarymaterials,
  Main,
} from "./page";
// import Superinformation from "./module/Superinformation.vue";
// import Maindata from "./module/Maindata.vue";
// import Businessdata from "./module/Businessdata";
// import SettlementRules from "./module/SettlementRules.vue";
// import Settlementbankaccount from "./module/Settlementbankaccount.vue";
// import Supplementarymaterials from "./module/Supplementarymaterials.vue";
import { postConstruction,editputConstruction, draftSave, editConstruction } from "@/api/shops";

export default {
  components: {
    Superinformation,
    Maindata,
    Businessdata,
    SettlementRules,
    Settlementbankaccount,
    Supplementarymaterials,
    Main,
  },
  data () {
    return {
      mainType: "", //主体类型
      submitFrom: {
        organization_type: "",
        finance_institution: false,
        business_license_info: {
          business_license_copy: "",
          business_license_number: "",
          merchant_name: "",
          legal_person: "",
          company_address: "",
          business_time: ["", ""],
          business_time_startTime: "",
          business_time_endTime: ""
        },
        legal_person_commitment: "",
        legal_person_video: "",
        business_addition_msg: "",
        business_addition_pics: "",
        qualifications: "",
        sales_scene_info: {
          merchant_shortname: "",
          store_url: "",
          store_qr_code: "",
        },
        account_info: {
          bank_account_type: "",
          merchant_shortname: "",
          account_bank: "",
          bank_address_code: "",
          bank_branch_id: "",
          bank_name: "",
          account_number: "",
          account_name: "",
          account_cert_info: {
            settlement_cert_pic: "",
            relation_cert_pic: "",
            other_cert_pics: [],
          },
        },
        contact_info: {
          contact_type: "",
          contact_name: "",
          contact_id_doc_type: "",
          contact_id_card_number: "",
          contact_id_doc_copy: "",
          contact_id_doc_copy_back: "",
          contact_id_doc_period_begin: "",
          contact_id_doc_period_end: "",
          business_authorization_letter: "",
          openid: "",
          mobile_phone: "",
          contact_email: "",
        },
        certificate_info: {
          cert_copy: "",
          cert_type: "",
          cert_number: "",
          merchant_name: "",
          company_address: "",
          legal_person: "",
          period_begin: "",
          period_end: "",
        },
        certificate_letter_copy: "",
        finance_institution_info: {
          cert_copy: "",
          finance_type: "",
          finance_license_pics: "",
        },
        id_holder_type: "",
        authorize_letter_copy: null,
        owner: true,
        id_doc_type: "",
        id_card_info: {
          id_card_copy: "",
          id_card_national: "",
          id_card_name: "",
          id_card_number: "",
          id_card_address: "",
          card_period_begin: "",
          card_period_end: "",
        },
        id_doc_info: {
          id_doc_copy: "",
          id_doc_copy_back: "",
          id_doc_name: "",
          id_doc_number: "",
          id_doc_address: "",
          doc_period_begin: "",
          doc_period_end: "",
        },
        ubo_info_list: [
          {
            ubo_id_doc_type: "",
            ubo_id_doc_copy: "",
            ubo_id_doc_copy_back: "",
            ubo_id_doc_name: "",
            ubo_id_doc_number: "",
            ubo_id_doc_address: "",
            ubo_period_begin: "",
            ubo_period_end: "",
          },
        ],
      },

      tab: "name1",
      loading: false,
    };
  },
  created () {
    if (this.$route.query.id) {
      editConstruction(this.$route.query.id).then((res) => {
        if (res.result) {
          this.submitFrom = res.result;
          if (!this.submitFrom.business_license_info.business_time) {
            this.submitFrom.business_license_info.business_time = ["", ""]
          }
          else {

            this.submitFrom.business_license_info.business_time = this.submitFrom.business_license_info.business_time.split(',');
            this.submitFrom.business_license_info.business_time_startTime = this.submitFrom.business_license_info.business_time[0];
            this.submitFrom.business_license_info.business_time_endTime = this.submitFrom.business_license_info.business_time[1];
          }
        }
      });
    }
  },
  methods: {
    // 保存到草稿
    handleDraftSave () {
      this.loading = true
      draftSave(this.submitFrom).then((res) => {
        if (res.success) {
          this.$router.push("progressFormList");
        }
        this.loading = false;
      });
    },
    // 验证
    async validate () {
      this.loading = true;

      if (!(await this.$refs.Maindata.validated())) {
        this.$Message.error("请填写主体资料必填项");
        this.loading = false;
        return false;
      }
      if (!(await this.$refs.Superinformation.validated())) {
        this.$Message.error("请填写超级管理员必填项");
        this.loading = false;
        return false;
      }
      if (!(await this.$refs.Businessdata.validated())) {
        this.$Message.error("请填写店铺必填项");
        this.loading = false;
        return false;
      }
      if (!(await this.$refs.Settlementbankaccount.validated())) {
        this.$Message.error("请填写主结算账户信息必填项");
        this.loading = false;
        return false;
      }

      const params = { ...this.submitFrom }
      !params.finance_institution ? delete params.finance_institution_info : ''
      params.owner ? delete params.ubo_info_list : ''
      params.id_doc_type == 'IDENTIFICATION_TYPE_MAINLAND_IDCARD' ? delete params.id_doc_info : delete params.id_card_info

      // 当超级管理员类型是不是经办人 删除 contact_id_doc_copy contact_id_doc_copy_back
      // contact_id_doc_type
      if (params.contact_info.contact_type == '65') {
        delete params.contact_info.contact_id_doc_copy
        delete params.contact_info.contact_id_doc_copy_back
        delete params.contact_info.contact_id_doc_period_begin
        delete params.contact_info.contact_id_doc_period_end
        delete params.contact_info.business_authorization_letter
        delete params.contact_info.contact_id_doc_type
      }
      // 如果是小微商户需删除
      if(params.organization_type == '2401'||params.organization_type == '2500'){
        delete params.business_license_info
        delete params.sales_scene_info.mini_program_sub_appid
      }
      // 如果不是企业删除
      if(params.organization_type != '2'){
        delete params.id_card_info.id_card_address
      }

      if(params.business_license_info){
        if (params.business_license_info.business_time_startTime) {
          params.business_license_info.business_time = `${params.business_license_info.business_time_startTime},${params.business_license_info.business_time_endTime}`
          delete params.business_license_info.business_time_startTime
          delete params.business_license_info.business_time_endTime
        } else {
          params.business_license_info.business_time = params.business_license_info.business_time.join(',')
        }
      }

      if (this.$route.query.id) {
        editputConstruction(this.$route.query.id, params).then(
          (res) => {
            if (res.success) {
              this.$router.push("progressFormList");
            }
            this.loading = false;
          }
        );
      } else {
        postConstruction(params).then((res) => {
          if (res.success) {
            this.$router.push("progressFormList");
          }
          this.loading = false;
        });
      }
    },
    // 步骤选择的主体赋值
    callbackMain (val) {
      this.mainType = val;
      this.tab = "name3";
    },
    callbackTab (val) {
      this.tab = val;
    },
  },
};
</script>
<style lang="scss" scoped>
.btn {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 60px;
  background-color: cornsilk;
  align-items: center;
  justify-content: center;
}
</style>
