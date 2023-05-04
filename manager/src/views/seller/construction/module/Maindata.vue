<template>
  <div>
    <div class="btnstyle">
      <Button type="info" @click="nextStep('name1')" style="margin-right: 10px">上一步
      </Button>
      <Button type="warning" @click="nextStep('name2')">下一步</Button>
    </div>
    <div class="formstyle">
      <Card>
        <Form label-colon ref="submitFrom" :model="submitFrom" :rules="ruleValidate" :label-width="160">
          <FormItem prop="organization_type" label="主体类型">
            <Select v-model="submitFrom.organization_type" placeholder="请选择主体类型">
              <Option v-for="item in subjectType" :value="item.value" :key="item.value">{{ item.title }}
              </Option>
            </Select>
          </FormItem>
          <FormItem label="代理商名称" prop="merchant_shortname">
            <div class="item">
              <Input v-model="submitFrom.merchant_shortname" />

            </div>
          </FormItem>
          <FormItem label="是否是金融机构">
            <i-switch v-model="submitFrom.finance_institution">
              <span slot="open">是</span>
              <span slot="close">否</span>
            </i-switch>
          </FormItem>

          <!--
            1、主体为“小微/个人卖家”时，不填。
            2、主体为“个体工商户/企业”时，请上传营业执照。
            3、主体为“政府机关/事业单位/社会组织”时，请上传登记证书。
          -->
          <div v-if="
            submitFrom.organization_type != '2401' &&
            submitFrom.organization_type != '2500'
          ">
            <h2>营业执照/登记证书信息</h2>
            <FormItem v-if="
              submitFrom.organization_type != '2' &&
              submitFrom.organization_type != '4'
            " label="登记证书类型">
              <Select v-model="submitFrom.certificate_info.cert_type" placeholder="登记证书类型">
                <Option :value="item.value" v-for="(item, index) in certTypeList" :key="index">
                  {{ item.label }}
                </Option>
              </Select>
            </FormItem>
            <FormItem label="营业执照照片/登记证书照片" prop="business_license_info.business_license_copy">
              <div class="label-item-upload">
                <Input v-show="false" v-model="
                  submitFrom.business_license_info.business_license_copy
                ">
                </Input>
                <img v-if="
                  submitFrom.business_license_info &&
                  submitFrom.business_license_info.business_license_copy
                " class="img" :src="submitFrom.business_license_info.business_license_copy" />
                <img v-else class="img" src="../../../../assets/emptyImg.png" alt="" />
                <Button @click="onClickImg('business_license_copy')">选择图片
                </Button>
              </div>
              <div class="tips">
                <p>1、主体为“个体工商户/企业”时，请上传营业执照的证件图片。</p>
                <p>
                  2、主体为“政府机关/事业单位/社会组织”时，请上传登记证书的证件图片。
                </p>
                <p>
                  （1）请上传证件的彩色扫描件或彩色数码拍摄件，黑白复印件需加盖公章（公章信息需完整）
                  。
                </p>
                <p>
                  （2）不得添加无关水印（非微信支付商户申请用途的其他水印）。
                </p>
                <p>
                  （3）需提供证件的正面拍摄件，完整、照面信息清晰可见。信息不清晰、扭曲、压缩变形、反光、不完整均不接受。
                </p>
                <p>（4）不接受二次剪裁、翻拍、PS的证件照片。</p>
              </div>
            </FormItem>
            <FormItem prop="business_license_info.business_license_number" label="注册号/统一社会信用代码">
              <Input v-model="
                submitFrom.business_license_info.business_license_number
              " placeholder="请输入注册号/统一社会信用代码"></Input>
              <div class="hrtop">
                <p>
                  1、主体为“个体工商户/企业”时，请填写营业执照上的注册号/统一社会信用代码，须为18位数字|大写字母。
                </p>
                <p>
                  2、主体为“政府机关/事业单位/社会组织”时，请填写登记证书的证书编号。
                </p>
              </div>
            </FormItem>
            <FormItem prop="business_license_info.merchant_name" label="商户名称">
              <Input v-model="submitFrom.business_license_info.merchant_name" placeholder="请输入商户名称"></Input>
              <div class="hrtop">
                <p>
                  1、请填写营业执照/登记证书的商家名称，2~110个字符，支持括号 。
                </p>
                <p>
                  2、个体工商户/政府机关/事业单位/社会组织，不能以“公司”结尾。
                </p>
                <p>
                  3、个体工商户，若营业执照上商户名称为空或为“无”，请填写"个体户+经营者姓名"，如“个体户张三”
                  。
                </p>
              </div>
            </FormItem>
            <FormItem prop="business_license_info.legal_person" label="个体户经营者/法人姓名">
              <Input v-model="submitFrom.business_license_info.legal_person" placeholder="请输入个体户经营者/法人姓名"></Input>
              <div class="hrtop">请填写营业执照的经营者/法定代表人姓名</div>
            </FormItem>

            <FormItem label="注册地址" prop="business_license_info.company_address">
              <Input v-model="submitFrom.business_license_info.company_address" placeholder="请输入注册地址"></Input>
              <div class="hrtop">请填写登记证书的注册地址</div>
            </FormItem>
            <FormItem label="有效期限开始日期" prop="business_license_info.business_time">
              <DatePicker clearable type="date" placeholder="请选择有效期开始时间" format="yyyy-MM-dd"
                :value="submitFrom.business_license_info.business_time_startTime" @on-change="
                  submitFrom.business_license_info.business_time_startTime = $event
                " />
            </FormItem>
            <FormItem label="有效期限结束日期" prop="business_license_info.period_end">
              <DatePicker clearable type="date" placeholder="请选择有效期结束时间" format="yyyy-MM-dd"
                :value="submitFrom.business_license_info.business_time_endTime" @on-change="
                  submitFrom.business_license_info.business_time_endTime = $event
                " />

              <Button @click="longTimeEffect" :type="
                submitFrom.business_license_info.business_time_endTime == '长期'
                  ? 'primary'
                  : 'default'
              " style="margin-left: 10px">长期有效
              </Button>
            </FormItem>

          </div>
          <div v-if="submitFrom.finance_institution">
            <h2>金融机构许可证信息</h2>
            <FormItem label="金融机构类型	" prop="finance_institution_info.finance_type">
              <Select v-model="submitFrom.finance_institution_info.finance_type" placeholder="请选择金融机构类型">
                <Option value="BANK_AGENT">银行业,
                  适用于商业银行、政策性银行、农村合作银行、村镇银行、开发性金融机构等
                </Option>
                <Option value="PAYMENT_AGENT">支付机构, 适用于非银行类支付机构
                </Option>
                <Option value="INSURANCE">保险业,
                  适用于保险、保险中介、保险代理、保险经纪等保险类业务
                </Option>
                <Option value="TRADE_AND_SETTLE">交易及结算类金融机构,
                  适用于交易所、登记结算类机构、银行卡清算机构、资金清算中心等
                </Option>
                <Option value="OTHER">其他金融机构</Option>
              </Select>
              <div class="hrtop">金融机构类型需与营业执照/登记证书上一致</div>
            </FormItem>

            <FormItem label="金融机构许可证图片" key="finance_institution_info.finance_license_pics"
              prop="finance_institution_info.finance_license_pics">
              <div class="label-item-upload">
                <Input v-show="false" v-model="submitFrom.finance_institution_info.finance_license_pics"></Input>
                <img v-if="
                  submitFrom.finance_institution_info.finance_license_pics
                " class="img" :src="
  submitFrom.finance_institution_info.finance_license_pics
" />
                <img v-else class="img" src="../../../../assets/emptyImg.png" alt="" />
                <Button @click="onClickImg('finance_license_pics')">选择图片
                </Button>
              </div>
            </FormItem>
            <div style="color: #a0a0a0">
              1、根据所属金融机构类型的许可证要求提供,详情查看
              <a href="#" @click="Examplediagramfinancial">示例图</a>
            </div>
            <div style="color: #a0a0a0">
              2、请提供为“申请商家主体”所属的许可证,可授权使用总公司/分公司的特殊资质。
            </div>
            <hr />
          </div>

          <h2>经营者/法人身份证件</h2>
          <FormItem label="证件持有人类型" prop="id_holder_type">
            <Select v-model="submitFrom.id_holder_type" placeholder="请选择证件持有人类型">
              <Option value="LEGAL">法人</Option>
              <Option value="SUPER">经办人</Option>
            </Select>
            <div class="hrbotm">
              若因特殊情况，无法提供法人证件时，可上传经办人。（经办人：经商户授权办理微信支付业务的人员，授权范围包括但不限于签约，入驻过程需完成账户验证）。
            </div>
          </FormItem>
          <FormItem label="证件类型" prop="id_doc_type">
            <Select v-model="submitFrom.id_doc_type" placeholder="请选择证件持有人类型">
              <Option v-for="item in DocumentType" :value="item.value" :key="item.value">{{ item.title }}
              </Option>
            </Select>
          </FormItem>
          <FormItem label="法定代表人说明函" v-if="submitFrom.id_holder_type == 'LEGAL'">
            <div class="label-item-upload">
              <img v-if="submitFrom.authorize_letter_copy" class="img" :src="submitFrom.authorize_letter_copy" />
              <img v-else class="img" src="../../../../assets/emptyImg.png" alt="" />
              <Button @click="onClickImg('authorize_letter_copy')">选择图片
              </Button>
            </div>
            <div class="hrbotm">
              若因特殊情况，无法提供法定代表人证件时，请参照示例图打印法定代表人说明函，全部信息需打印，不支持手写商户信息，并加盖公章
              <a href="#" @click="RepresentativeExamplediagram">示例图</a>
            </div>
          </FormItem>
          <div v-if="submitFrom.id_doc_type == 'IDENTIFICATION_TYPE_MAINLAND_IDCARD'">

            <FormItem label="身份证人像面照片	" prop="id_card_info.id_card_copy" key="id_card_info.id_card_copy">
              <Input v-show="false" v-model="submitFrom.id_card_info.id_card_copy"></Input>

              <div class="label-item-upload">
                <img v-if="submitFrom.id_card_info.id_card_copy" class="img"
                  :src="submitFrom.id_card_info.id_card_copy" />
                <img v-else class="img" src="../../../../assets/emptyImg.png" alt="" />
                <Button @click="onClickImg('id_card_copy')">选择图片</Button>
              </div>
              <div class="tips">请上传个体户经营者/法人的身份证人像面照片</div>
            </FormItem>
            <FormItem label="身份证国徽面照片	" prop="id_card_info.id_card_national" key="id_card_info.id_card_national">
              <Input v-show="false" v-model="submitFrom.id_card_info.id_card_national"></Input>
              <div class="label-item-upload">
                <img v-if="submitFrom.id_card_info.id_card_national" class="img"
                  :src="submitFrom.id_card_info.id_card_national" />
                <img v-else class="img" src="../../../../assets/emptyImg.png" alt="" />
                <Button @click="onClickImg('id_card_national')">选择图片</Button>
              </div>
              <div class="hrbotm">
                请上传个体户经营者/法定代表人的身份证国徽面照片
              </div>
            </FormItem>

            <FormItem label="身份证姓名" key="id_card_info.id_card_name" prop="id_card_info.id_card_name">
              <Input v-model="submitFrom.id_card_info.id_card_name" placeholder="请输入身份证姓名"></Input>
              <div class="hrbotm">
                请填写个体户经营者/法定代表人对应身份证的姓名，2~30个中文字符、英文字符、符号
              </div>
            </FormItem>
            <FormItem label="身份证号码" key="id_card_info.id_card_number" prop="id_card_info.id_card_number">
              <Input v-model="submitFrom.id_card_info.id_card_number" placeholder="请输入身份证号码"></Input>
            </FormItem>
            <FormItem label="身份证居住地址" v-if="submitFrom.organization_type == '2'">
              <Input v-model="submitFrom.id_card_info.id_card_address" placeholder="请输入身份证居住地址"></Input>
            </FormItem>
            <FormItem key="id_card_info.id_card_valid_time_begin" label="身份证有效期开始时间"
              prop="id_card_info.id_card_valid_time_begin">
              <DatePicker clearable type="date" placeholder="请选择身份证有效期开始时间" format="yyyy-MM-dd" @on-change="
                submitFrom.id_card_info.id_card_valid_time_begin = $event
              " v-model="submitFrom.id_card_info.id_card_valid_time_begin" />
            </FormItem>

            <FormItem key="id_card_info.id_card_valid_time" label="身份证有效期结束时间" prop="id_card_info.id_card_valid_time">
              <DatePicker clearable type="date" placeholder="请选择身份证有效期结束时间" format="yyyy-MM-dd"
                @on-change="submitFrom.id_card_info.id_card_valid_time = $event"
                v-model="submitFrom.id_card_info.id_card_valid_time" />
            </FormItem>
          </div>


          <div v-if="submitFrom.id_doc_type != 'IDENTIFICATION_TYPE_MAINLAND_IDCARD'">
            <FormItem label="证件正面照片	" prop="id_doc_info.id_doc_copy">
              <div class="label-item-upload">
                <Input v-show="false" v-model="submitFrom.id_doc_info.id_doc_copy"></Input>

                <img v-if="submitFrom.id_doc_info.id_doc_copy" class="img" :src="submitFrom.id_doc_info.id_doc_copy" />
                <img v-else class="img" src="../../../../assets/emptyImg.png" alt="" />
                <Button @click="onClickImg('id_doc_copy')">选择图片</Button>
              </div>
              <div class="hrbotm">
                请上传彩色照片or彩色扫描件or复印件（需加盖公章鲜章），可添加“微信支付”相关水印（如微信支付认证）。
              </div>
            </FormItem>
            <FormItem label="证件反面照片	" prop="id_doc_info.id_doc_copy_back">
              <Input v-show="false" v-model="submitFrom.id_doc_info.id_doc_copy_back"></Input>
              <div class="label-item-upload">
                <img v-if="submitFrom.id_doc_info.id_doc_copy_back" class="img"
                  :src="submitFrom.id_doc_info.id_doc_copy_back" />
                <img v-else class="img" src="../../../../assets/emptyImg.png" alt="" />
                <Button @click="onClickImg('id_doc_copy_back')">选择图片
                </Button>
              </div>
              <div class="hrbotm">
                请上传彩色照片or彩色扫描件or复印件（需加盖公章鲜章），可添加“微信支付”相关水印（如微信支付认证）。
              </div>
            </FormItem>
            <FormItem prop="id_doc_info.id_doc_name" label="证件姓名">
              <Input v-model="submitFrom.id_doc_info.id_doc_name" placeholder="请输入证件姓名"></Input>
            </FormItem>
            <FormItem prop="id_doc_info.id_doc_number" label="证件号码">
              <Input v-model="submitFrom.id_doc_info.id_doc_number" placeholder="请输入证件号码"></Input>
            </FormItem>
            <FormItem prop="id_doc_info.id_doc_address" label="证件居住地址">
              <Input v-model="submitFrom.id_doc_info.id_doc_address" placeholder="请输入证件居住地址"></Input>
              <div class="hrbotm">
                请按照证件上住址填写，若证件上无住址则按照实际住址填写，如广东省深圳市南山区xx路xx号xx室。
              </div>
            </FormItem>
            <FormItem label="证件有效期开始时间" prop="id_doc_info.doc_period_begin" key="id_doc_info.doc_period_begin">
              <DatePicker clearable type="date" placeholder="请选择证件有效期开始时间" format="yyyy-MM-dd"
                @on-change="submitFrom.id_doc_info.doc_period_begin = $event"
                :value="submitFrom.id_doc_info.doc_period_begin" />
            </FormItem>
            <FormItem label="证件有效期结束时间" prop="id_doc_info.doc_period_end" key="id_doc_info.doc_period_end">
              <DatePicker clearable type="date" placeholder="请选择证件有效期结束时间" format="yyyy-MM-dd"
                @on-change="submitFrom.id_doc_info.doc_period_end = $event"
                :value="submitFrom.id_doc_info.doc_period_end" />
            </FormItem>
          </div>

          <div v-if="submitFrom.organization_type == '2'">
            <h2>最终受益人信息列表(UBO)</h2>
            <FormItem label="经营者/法人是否为受益人">
              <i-switch v-model="submitFrom.owner">
                <span slot="open">是</span>
                <span slot="close">否</span>
              </i-switch>
            </FormItem>
            <span v-if="submitFrom.owner == 'false'">
              <FormItem label="证件类型" :prop="`ubo_info_list[0].ubo_id_doc_type`">
                <Select v-model="submitFrom.ubo_info_list[0].ubo_id_doc_type" placeholder="请选择证件持有人类型">
                  <Option v-for="item in DocumentType" :value="item.value" :key="item.value">{{ item.title }}</Option>
                </Select>
              </FormItem>

              <FormItem label="证件正面照片	" :prop="`ubo_info_list[0].ubo_id_doc_copy`">

                <div class="label-item-upload">
                  <img v-if="submitFrom.ubo_info_list[0].ubo_id_doc_copy" class="img"
                    :src="submitFrom.ubo_info_list[0].ubo_id_doc_copy" />
                  <img v-else class="img" src="../../../../assets/emptyImg.png" alt="" />
                  <Button @click="onClickImg('ubo_id_doc_copy')">选择图片</Button>
                </div>
                <div class="hrbotm">
                  请上传彩色照片or彩色扫描件or复印件（需加盖公章鲜章），可添加“微信支付”相关水印（如微信支付认证）。
                </div>
              </FormItem>
              <FormItem label="证件反面照片	" prop="ubo_info_list[0].ubo_id_doc_copy_back">
                <div class="label-item-upload">
                  <img v-if="submitFrom.ubo_info_list[0].ubo_id_doc_copy_back" class="img"
                    :src="submitFrom.ubo_info_list[0].ubo_id_doc_copy_back" />
                  <img v-else class="img" src="../../../../assets/emptyImg.png" alt="" />
                  <Button @click="onClickImg('ubo_id_doc_copy_back')">选择图片</Button>
                </div>
                <div class="hrbotm">
                  请上传彩色照片or彩色扫描件or复印件（需加盖公章鲜章），可添加“微信支付”相关水印（如微信支付认证）。
                </div>
              </FormItem>
              <FormItem label="证件姓名	" key="ubo_info_list[0].ubo_id_doc_name" prop="ubo_info_list[0].ubo_id_doc_name">
                <Input v-model="submitFrom.ubo_info_list[0].ubo_id_doc_name" placeholder="请输入证件姓名"></Input>
              </FormItem>
              <FormItem label="证件号码	">
                <Input v-model="submitFrom.ubo_info_list[0].ubo_id_doc_number" placeholder="请输入证件号码"></Input>
              </FormItem>
              <FormItem label="证件居住地址">
                <Input v-model="submitFrom.ubo_info_list[0].ubo_id_doc_address" placeholder="请输入证件居住地址"></Input>
                <div class="hrbotm">
                  请按照证件上住址填写，若证件上无住址则按照实际住址填写，如广东省深圳市南山区xx路xx号xx室。
                </div>
              </FormItem>
              <FormItem label="证件有效期开始时间">
                <DatePicker clearable type="date" placeholder="请选择证件有效期开始时间" format="yyyy-MM-dd" @on-change="
                  submitFrom.ubo_info_list[0].ubo_id_doc_period_begin = $event
                " :value="submitFrom.ubo_info_list[0].ubo_id_doc_period_begin"></DatePicker>
              </FormItem>
              <FormItem label="证件有效期结束时间">
                <DatePicker clearable type="date" placeholder="请选择证件有效期结束时间" format="yyyy-MM-dd" @on-change="
                  submitFrom.ubo_info_list[0].ubo_id_doc_period_end = $event
                " :value="submitFrom.ubo_info_list[0].ubo_id_doc_period_end"></DatePicker>
              </FormItem>
            </span>
          </div>
        </Form>
      </Card>
    </div>
    <Modal width="1200px" v-model="picModelFlag">
      <ossManage @callback="callbackSelected" ref="ossManage" />
    </Modal>
    <Modal width="1200px" v-model="agencyModalFlag"></Modal>
  </div>
</template>
<script>
import ossManage from "@/views/sys/oss-manage/ossManage";

import { editConstruction } from "@/api/shops";
import { regular } from "@/utils";
import { validateIDCard } from "@/libs/validate";

export default {
  components: {
    ossManage,
  },
  computed: {
    subjectType () {
      return this.$store.state.app.weChatApplyList;
    },
    DocumentType () {
      return this.$store.state.app.weChatApplyDocTypeList;
    }
  },
  data () {
    return {
      ruleValidate: {
        organization_type: [regular.REQUIRED],
        "business_license_info.business_license_number": [regular.REQUIRED],
        "business_license_info.business_license_copy": [
          { required: true, message: "参数必填", trigger: "change" },
        ],
        "business_license_info.merchant_name": [regular.REQUIRED],
        "business_license_info.legal_person": [regular.REQUIRED],
        "business_license_info.id_card_national": [regular.REQUIRED],
        // "business_license_info.period_begin": [regular.REQUIRED],
        // "business_license_info.period_end": [regular.REQUIRED],
        "business_license_info.company_address": [regular.REQUIRED],
        "id_card_info.id_card_number": [
          { required: true, message: "身份证号不能为空", trigger: "blur" },
          { validator: validateIDCard, trigger: "blur" },
        ],
        id_holder_type: [regular.REQUIRED],
        id_doc_type: [regular.REQUIRED],
        "id_card_info.id_card_copy": [
          { required: true, message: "参数必填", trigger: "change" },
        ],
        "id_card_info.id_card_national": [
          { required: true, message: "参数必填", trigger: "change" },
        ],
        "id_card_info.id_card_name": [regular.REQUIRED],
        "id_card_info.id_card_valid_time_begin": [
          { required: true, message: "参数必填", trigger: "change" },
        ],
        "id_card_info.id_card_valid_time": [
          { required: true, message: "参数必填", trigger: "change" },
        ],

        "id_doc_info.doc_period_end": [regular.REQUIRED],
        "id_doc_info.doc_period_begin": [regular.REQUIRED],
        "ubo_info_list[0].ubo_id_doc_type": [regular.REQUIRED],
        "ubo_info_list[0].ubo_id_doc_copy": [regular.REQUIRED],
        "ubo_info_list[0].ubo_id_doc_copy_back": [regular.REQUIRED],
        "ubo_info_list[0].ubo_id_doc_name": [regular.REQUIRED],
        "id_doc_info.id_doc_name": [regular.REQUIRED],
        "id_doc_info.id_doc_number": [regular.REQUIRED],
        "id_doc_info.id_doc_address": [regular.REQUIRED],
        "id_doc_info.id_doc_copy": [
          { required: true, message: "参数必填", trigger: "change" },
        ],
        "id_doc_info.id_doc_copy_back": [
          { required: true, message: "参数必填", trigger: "change" },
        ],
        "id_doc_info.id_card_copy": [regular.REQUIRED],
        "id_doc_info.id_card_national": [regular.REQUIRED],
        "finance_institution_info.finance_type": [regular.REQUIRED],
        "finance_institution_info.finance_license_pics": [
          { required: true, message: "参数必填", trigger: "change" },
        ],
      },
      picModelFlag: false, // 预览图片显隐
      selected: "", // 已选数据
      certTypeList: [],
      agencyModalFlag: false, // 代理人弹窗显隐
    };
  },
  props: {
    // 主体类型
    mainType: {
      type: String,
      default: "",
    },
    submitFrom: {
      type: Object,
      default: () => {
      },
    },
  },
  watch: {
    mainType (val) {
      console.log(val);
      if (val) {
        this.submitFrom.organization_type = val;
      }
    },
    "submitFrom.organization_type": {
      handler (val) {
        // 证书类型赋值
        let certType;
        if (val == "3") {
          certType = [
            {
              label: "事业单位法人证书",
              value: "CERTIFICATE_TYPE_2388",
            },
          ];
        } else if (val == "2502") {
          certType = [
            {
              label: "统一社会信用代码证书",
              value: "CERTIFICATE_TYPE_2389",
            },
          ];
        } else if (val == "1708") {
          certType = [
            {
              label: "统一社会信用代码证书",
              value: "CERTIFICATE_TYPE_2389",
            },
            {
              label: "社会团体法人登记证书",
              value: "CERTIFICATE_TYPE_2394",
            },
            {
              label: "民办非企业单位登记证书",
              value: "CERTIFICATE_TYPE_2395",
            },
            {
              label: "基金会法人登记证书",
              value: "CERTIFICATE_TYPE_2396",
            },
            {
              label: "宗教活动场所登记证",
              value: "CERTIFICATE_TYPE_2399",
            },
            {
              label: "政府部门下发的其他有效证明文件",
              value: "CERTIFICATE_TYPE_2400",
            },
            {
              label: "执业许可证/执业证",
              value: "CERTIFICATE_TYPE_2520",
            },
            {
              label: "基层群众性自治组织特别法人统一社会信用代码证",
              value: "CERTIFICATE_TYPE_2521",
            },
            {
              label: "农村集体经济组织登记证",
              value: "CERTIFICATE_TYPE_2522",
            },
          ];
        }
        this.certTypeList = certType;
      },
      immediate: true,
    },
  },
  mounted () {
  },

  methods: {
    // 设置为长期有效
    longTimeEffect () {

      this.$set(this.submitFrom.business_license_info, 'business_time_endTime', '长期');
      this.$forceUpdate()

    },
    validated () {
      return this.$refs["submitFrom"].validate((valid) => {
        return valid;
      });
    },
    RepresentativeExamplediagram () {
      window.open("https://kf.qq.com/faq/220127aUzAju220127UfiuQr.html");
    },
    Examplediagramfinancial () {
      window.open("https://kf.qq.com/faq/220215IrMRZ3220215n6buiU.html");
    },
    Examplediagram () {
      window.open("https://kf.qq.com/faq/200114u2y2yQ200114uEz26z.html");
    },
    //选择会员
    selectAgency () {
      this.$refs["agencyLayout"].selectedAgency = true;
      this.agencyModalFlag = true;
    },
    // 选择会员的回调
    callbackAgency (val) {
      if (val) {
        this.submitFrom.account_code = val.accountCode;
        this.submitFrom.merchant_shortname = val.accountName;
        this.agencyModalFlag = false;
      }
    },

    nextStep (name) {
      // submitFrom.finance_institution_info.finance_license_pics
      // this.$store.commit("submitMaindata", this.submitFrom);
      this.$emit("callbackTab", name);
    },
    onClickImg (item) {
      this.selected = item;
      this.$refs.ossManage.selectImage = true;
      this.picModelFlag = true;
    },
    callbackSelected (val) {
      if (this.selected == "finance_license_pics") {
        this.submitFrom.finance_institution_info[this.selected] = val.url;
        this.picModelFlag = false;
      }
      if (this.selected == "cert_copy") {
        this.submitFrom.certificate_info[this.selected] = val.url;
        this.picModelFlag = false;
      } else if (this.selected == "certificate_letter_copy") {
        this.submitFrom[this.selected] = val.url;
        this.picModelFlag = false;
      } else if (this.selected == "authorize_letter_copy") {
        this.submitFrom.authorize_letter_copy = val.url;
        this.picModelFlag = false;
      } else if (
        this.selected == "id_card_copy" ||
        this.selected == "id_card_national"
      ) {
        this.submitFrom.id_card_info[this.selected] = val.url;
        this.submitFrom.id_card_info[this.selected] = val.url;
        this.picModelFlag = false;
      } else if (
        this.selected == "id_doc_copy" ||
        this.selected == "id_doc_copy_back" ||
        this.selected == "ubo_id_doc_copy" ||
        this.selected == "id_doc_copy_back" ||
        this.selected == "ubo_id_doc_copy_back"
      ) {
        this.submitFrom.ubo_info_list[0][this.selected] = val.url;
        this.submitFrom.id_doc_info[this.selected] = val.url;
        this.picModelFlag = false;
      } else {
        this.$nextTick(() => {
          this.submitFrom.business_license_info[this.selected] = val.url;
          this.$forceUpdate();
        });
        // this.$set(this.submitFrom.business_license_info,[this.selected],val.url)

        this.picModelFlag = false;
      }
    },
  },
};
</script>
<style scoped lang="scss">
h2 {
  margin-left: 5px;
}

.selectedMember {
  width: 100%;
}

.item {
  width: 350px !important;
  display: flex;

  >* {
    margin: 0 4px;
  }
}

::v-deep.ivu-select {
  width: 250px;
}

.formstyle {
  display: flex;
  flex-direction: column;
}

::v-deep .ivu-form-item-label {
  overflow: hidden;
}

.btnstyle {
  margin-bottom: 10px;
  display: flex;
  justify-content: flex-end;
}

// ::v-deep .ivu-card-body {
//   width: 660px;
// }
.label-item-upload {
  display: flex;
  align-items: flex-end;

  img {
    margin-right: 10px;
    width: 100px;
    height: 100px;
  }
}

hr {
  margin: 15px 0px 15px 0px;
}

.hrbotm {
  margin-bottom: 15px;
  color: #a0a0a0;
}

.hrtop {
  color: #a0a0a0;
}

::v-deep .ivu-form-item-label {
  white-space: nowrap;
}

h2 {
  margin-bottom: 10px;
}

.tips {
  color: #a0a0a0;

  >p {
    color: #a0a0a0;
  }
}
</style>
