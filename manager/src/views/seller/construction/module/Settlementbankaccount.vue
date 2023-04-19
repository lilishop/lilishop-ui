<template>
  <div>
    <div class="btn-style">
      <Button type="info" @click="nextStep('name4')" style="margin-right: 10px"
        >上一步</Button
      >
      <Button type="warning" @click="nextStep('name7')">下一步</Button>
    </div>
    <Card>
      <Form
        label-colon
        ref="submitFrom.account_info"
        :model="submitFrom.account_info"
        :label-width="160"
        :rules="account_info"
      >
        <FormItem prop="bank_account_type" label="账户类型">
          <Select
            v-model="submitFrom.account_info.bank_account_type"
            placeholder="账户类型"
          >
            <Option value="74">对公账户</Option>
            <Option value="75">对私账户</Option>
          </Select>
        </FormItem>

        <FormItem prop="account_bank" label="开户银行">
          <Input disabled style="width:200px;" v-model="submitFrom.account_info.account_bank" />
          <Button style="margin-left:10px;" @click="searchBank">选择</Button>
          <!-- <Select
            v-model="submitFrom.account_info.account_bank"
            :remote-method="bankHandleSearch"
            :loading="searchLoading"
            loading-text="搜索中..."
            placeholder="请输入"
            style="width: 200px"
            filterable
          >
            <Option v-for="(item,index) in bankData" :value="item.bankName"  :key="index" >{{item.bankName}}</Option>
          </Select> -->
          <div class="hr-top">
            1、17家直连银行，请根据<a href="#" @click="bakRules"
              >对照表</a
            >
            直接填写银行名 ;
          </div>
          <div>2、非17家直连银行，该参数请填写为“其他银行”。</div>
        </FormItem>
        <FormItem prop="bank_address_code" label="省市编码">
          <Input
            v-model="submitFrom.account_info.bank_address_code"
            placeholder="请输入省市编码"
          ></Input>
          <div class="hr-top">
            至少精确到市，详细参见
            <a href="#" @click="numRules">省市区编号对照表</a>。
          </div>
          <div style="color: red">
            注：仅当省市区编号对照表中无对应的省市区编号时，可向上取该银行对应市级编号或省级编号。
          </div>
        </FormItem>
        <FormItem  label="开户名称" prop="account_name">
          <Input
            v-model="submitFrom.account_info.account_name"
            placeholder="请输入开户名称 "
          ></Input>

        </FormItem>
        <FormItem prop="bank_branch_id" label="联行号">
          <Input
            v-model="submitFrom.account_info.bank_branch_id"
            placeholder="请输入联行号"
          ></Input>
          <div class="hr-top">
            1、17家直连银行无需填写，如为其他银行，则全称（含支行）和联行号二选一。
          </div>
          <div>
            2、详细参见
            <a href="#" @click="bankNameRules"
              >全称（含支行）对照表。</a
            >
          </div>
        </FormItem>
        <FormItem prop="bank_name" label="全称（含支行）">
          <Input
            v-model="submitFrom.account_info.bank_name"
            placeholder="请输入全称（含支行）"
          ></Input>
          <div class="hr-top">
            1、17家直连银行无需填写，如为其他银行，则全称（含支行）和
            联行号二选一。
          </div>
          <div>
            2、需填写银行全称，如"深圳农村商业银行XXX支行"，详细参见
            <a href="#" @click="bankNameRules">全称（含支行）对照表。</a
            >。
          </div>
        </FormItem>
        <FormItem prop="account_number" label="银行账号">
          <Input
            v-model="submitFrom.account_info.account_number"
            placeholder="请输入银行账号"
          ></Input>
          <div class="hr-top">
            数字，长度遵循系统支持的
            <a href="#" @click="backNumRules"> 卡号长度要求表</a>。
          </div>
        </FormItem>
        <!-- <FormItem
          label="入账银行卡正面照片	"
          key="bank_card_front_img"
          prop="bank_card_front_img"
           v-if="submitFrom.account_info.bank_account_type === '75'"
        >
        {{submitFrom.account_info}}

        <Input v-show="false" v-model="submitFrom.account_info.bank_card_front_img"></Input>

          <div class="label-item-upload">
            <img
              v-if="
                submitFrom.account_info &&
                submitFrom.account_info.bank_card_front_img
              "
              class="img"
              :src="submitFrom.account_info.bank_card_front_img"
            />
            <img
              v-else
              class="img"
              src="../../../../assets/emptyImg.png"
              alt=""
            />
            <Button @click="onClickImg('bank_card_front_img')">选择图片</Button>
          </div>
        </FormItem> -->
<!--        <h3>银行账户证明材料</h3>-->
<!--        <FormItem FormItem label="结算证明函">-->
<!--          <div class="label-item-upload">-->
<!--            <img-->
<!--              v-if="-->
<!--                submitFrom.account_info.account_cert_info &&-->
<!--                submitFrom.account_info.account_cert_info.settlement_cert_pic-->
<!--              "-->
<!--              class="img"-->
<!--              :src="-->
<!--                submitFrom.account_info.account_cert_info.settlement_cert_pic-->
<!--              "-->
<!--            />-->
<!--            <img-->
<!--              v-else-->
<!--              class="img"-->
<!--              src="../../../../assets/emptyImg.png"-->
<!--              alt=""-->
<!--            />-->
<!--            <Button @click="onClickImg('settlement_cert_pic')">选择图片</Button>-->
<!--          </div>-->
<!--          <div class="hr-top">-->
<!--            请参照 <a href="#" @click="printCert">示例图</a>打印结算证明函。-->
<!--          </div>-->
<!--        </FormItem>-->
<!--        <FormItem FormItem label="关系证明函">-->
<!--          <div class="label-item-upload">-->
<!--            <img-->
<!--              v-if="-->
<!--                submitFrom.account_info.account_cert_info &&-->
<!--                submitFrom.account_info.account_cert_info.relation_cert_pic-->
<!--              "-->
<!--              class="img"-->
<!--              :src="submitFrom.account_info.account_cert_info.relation_cert_pic"-->
<!--            />-->
<!--            <img-->
<!--              v-else-->
<!--              class="img"-->
<!--              src="../../../../assets/emptyImg.png"-->
<!--              alt=""-->
<!--            />-->
<!--            <Button @click="onClickImg('relation_cert_pic')">选择图片</Button>-->
<!--          </div>-->
<!--          <div class="hr-top">-->
<!--            请参照-->
<!--            <a href="#" @click="printRelationCert">示例图</a>-->
<!--            打印关系证明函。-->
<!--          </div>-->
<!--        </FormItem>-->
<!--        <FormItem FormItem label="其他补充证明">-->
<!--          <div class="label-item-upload">-->
<!--            <div-->
<!--              class="flex"-->
<!--              v-if="submitFrom.account_info.account_cert_info &&-->
<!--                submitFrom.account_info.account_cert_info.other_cert_pics.length-->
<!--              "-->
<!--            >-->
<!--              <div-->
<!--                class="img-item"-->
<!--                v-for="(item, index) in submitFrom.account_info-->
<!--                  .account_cert_info.other_cert_pics"-->
<!--                :key="index"-->
<!--              >-->
<!--                <img class="img" :src="item" />-->
<!--                <Icon @click="handleDelImg(index)" size="20" type="md-close" />-->
<!--              </div>-->
<!--            </div>-->
<!--            <img-->
<!--              v-else-->
<!--              class="img"-->
<!--              src="../../../../assets/emptyImg.png"-->
<!--              alt=""-->
<!--            />-->
<!--            <Button @click="onClickImg('other_cert_pics')">选择图片</Button>-->
<!--          </div>-->
<!--          <div class="hr-top">-->
<!--            请提供非同名结算的法律法规、政策通知、政府或上级部门公文等证明文件，以作上述材料的补充证明。-->
<!--          </div>-->
<!--        </FormItem>-->
<!--        <FormItem-->
<!--          label="开户许可证"-->
<!--          prop="opening_permit_img"-->
<!--          key="opening_permit_img"-->
<!--          v-if="submitFrom.account_info.bank_account_type === '74'"-->
<!--        >-->
<!--          <div class="label-item-upload">-->
<!--            <Input-->
<!--              v-show="false"-->
<!--              v-model="submitFrom.account_info.opening_permit_img"-->
<!--            ></Input>-->
<!--            <img-->
<!--              v-if="submitFrom.account_info && submitFrom.account_info.opening_permit_img"-->
<!--              class="img"-->
<!--              :src="submitFrom.account_info.opening_permit_img"-->
<!--            />-->
<!--            <img-->
<!--              v-else-->
<!--              class="img"-->
<!--              src="../../../../assets/emptyImg.png"-->
<!--              alt=""-->
<!--            />-->
<!--            <Button @click="onClickImg('opening_permit_img')">选择图片</Button>-->
<!--          </div>-->
<!--        </FormItem>-->
      </Form>
    </Card>
    <Modal width="1200px" v-model="picModelFlag">
      <ossManage @callback="callbackSelected" ref="ossManage" />
    </Modal>
    <Modal title="选择银行" v-model="showBankList">
      <Input placeholder="请输入搜索银行" v-model="searchBankName" />
      <div class='bank-list'>

        <div v-for="(item,index) in bankData" class='bank-item flex ' :key="index">
          <div>{{item.bankBranchName}}</div>
          <div><Button size="small" @click="handlerSearchBank(item)">选择</Button></div>
        </div>
      </div>
       <Page :total="bankTotal" size="small"
        @on-change="changePageNum"
        style="text-align:right"
        @on-page-size-change="changePageSize"
        :page-size="bankPageParams.pageSize"
        ></Page>
    </Modal>
  </div>
</template>
<script>
import ossManage from "@/views/sys/oss-manage/ossManage";
import { getBankInfo } from "@/api/shops";

import { regular } from "@/utils";
export default {
  components: {
    ossManage,
  },
  data() {
    return {
      picModelFlag: false, // 预览图片显隐
      selected: "", // 已选数据
      bankData: [], // 银行数据
      searchLoading:false,
      searchBankName:"",
      bankPageParams:{
        pageNumber:1,
        pageSize:20,
        bankName:""
      },
      bankTotal:0,
      showBankList:false,
      account_info:{
        bank_account_type:[regular.REQUIRED],
        account_bank:[regular.REQUIRED],
        bank_address_code:[regular.REQUIRED],
        // bank_category:[regular.REQUIRED],
        bank_branch_id:[regular.REQUIRED],
        account_number:[regular.REQUIRED],
        bank_name:[regular.REQUIRED],
        account_name:[regular.REQUIRED],
        opening_permit_img:[
          { required: true, message: "参数必填", trigger: "change" },
        ],

        // bank_card_front_img:[
        //   { required: true, message: "参数必填", trigger: "change" },
        // ]
      }
    };
  },
  props: {
    submitFrom: {
      type: Object,
      default: () => {},
    },
  },
  watch:{

    searchBankName(val){
      if(val){
        this.bankPageParams.pageNumber = 1

        this.bankHandleSearch(val)
      }
    }

  },
  mounted() {
    this.bankHandleSearch();
  },
  methods: {
    validated(){
      return this.$refs['submitFrom.account_info'].validate((valid) => {
        return valid
      })
    },

    handlerSearchBank(val){
      this.submitFrom.account_info.account_bank = val.accountBank
      this.submitFrom.account_info.bank_address_code = val.bankAliasCode
      this.submitFrom.account_info.bank_name = val.bankBranchName
      this.submitFrom.account_info.bank_branch_id = val.bankBranchId

      this.showBankList = false
    },
    searchBank(){
      this.showBankList = true;
    },
    changePageNum(val){
      this.bankPageParams.pageNumber = val;
      this.bankHandleSearch();
    },
    changePageSize(val){
      this.bankPageParams.pageNumber = 1;
      this.bankPageParams.pageSize = val;
      this.bankHandleSearch();
    },
    bankHandleSearch() {
      this.bankPageParams.bankName = this.searchBankName
      this.searchLoading = true
      getBankInfo(this.bankPageParams).then(
        (res) => {
          this.searchLoading = false
          if (res.success) {
            this.bankData = res.result.records;
            console.log(this.bankData)
            this.bankTotal = res.result.total
          }
        }
      );
    },
    printRelationCert() {
      window.open("https://kf.qq.com/faq/220127YjURBN220127fuA7bE.html");
    },
    printCert() {
      window.open("https://kf.qq.com/faq/220127YjURBN220127fuA7bE.html");
    },
    backNumRules() {
      window.open(
        "https://pay.weixin.qq.com/wiki/doc/apiv3_partner/terms_definition/chapter1_1_3.shtml#part-4"
      );
    },
    bankNameRules() {
      window.open(
        "https://pay.weixin.qq.com/wiki/doc/apiv3_partner/terms_definition/chapter1_1_3.shtml#part-6"
      );
    },
    numRules() {
      window.open(
        "https://pay.weixin.qq.com/wiki/doc/apiv3_partner/terms_definition/chapter1_1_3.shtml"
      );
    },
    bakRules() {
      window.open(
        "https://pay.weixin.qq.com/wiki/doc/apiv3_partner/terms_definition/chapter1_1_3.shtml#part-4"
      );
    },
    handleDelImg(index) {
      this.submitFrom.account_info.account_cert_info.other_cert_pics.splice(
        index,
        1
      );
    },
    nextStep(name) {
      // console.log(this.submitFrom.account_info);
      // this.$store.commit("submitSettlementbank", this.submitFrom.account_info);
      this.$emit("callbackTab", name);
    },
    onClickImg(item) {
      this.selected = item;
      this.$refs.ossManage.selectImage = true;
      this.picModelFlag = true;
    },
    callbackSelected(val) {
      if (this.selected == "other_cert_pics") {
        this.submitFrom.account_info.account_cert_info[this.selected].push(
          val.url
        );
      } else if (this.selected === 'opening_permit_img') {
        this.$set(this.submitFrom.account_info,'opening_permit_img',val.url)
      }else if (this.selected === 'bank_card_front_img') {
          this.$set(this.submitFrom.account_info,'bank_card_front_img',val.url)
      } else {
        this.submitFrom.account_info.account_cert_info[this.selected] = val.url;
      }
      this.picModelFlag = false;
    },
  },
};
</script>
<style scoped lang="scss">
.btn-style {
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
.hr-top {
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
.bank-item{
  padding: 16px;
  border-bottom: 1px solid #ededed;
  align-items: center;
  justify-content: space-between;
}
.bank-list{
  margin: 10px 0;
  height: 400px;
  overflow-y: auto;
}
</style>
