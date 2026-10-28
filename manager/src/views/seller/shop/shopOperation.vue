<template>
  <div>
    <el-card>
      <el-button
        class="mb_10"
        v-if="shopForm.storeDisable === 'APPLYING'"
        type="primary"
        @click="auditHandler"
        >审核</el-button
      >
      <el-form
        ref="shopFormRef"
        :model="shopForm"
        label-width="130px"
        label-position="right"
        :rules="shopValidate"
      >
        <el-tabs v-model="tabName" style="overflow: visible">
          <el-tab-pane label="基本信息" class="tab" name="base">
            <el-divider content-position="left">基本信息</el-divider>
            <!-- 遮罩层  -->
            <div v-if="isRead" class="mask">只读不可修改</div>
            <div>
              <el-form-item label="会员名称" prop="memberName">
                <div class="item">
                  <el-input disabled v-model="shopForm.memberName" />
                  <el-button type="default" @click="selectMember()" v-if="!$route.query.shopId"
                    >选择会员</el-button
                  >
                </div>
              </el-form-item>
              <el-form-item label="店铺名称" prop="storeName">
                <el-input v-model="shopForm.storeName" clearable style="width: 350px" />
              </el-form-item>

              <el-form-item label="是否自营" prop="selfOperated">
                <el-radio-group v-model="shopForm.selfOperated">
                  <el-radio-button value="true">自营</el-radio-button>
                  <el-radio-button value="false">非自营</el-radio-button>
                </el-radio-group>
              </el-form-item>

              <el-form-item label="店铺所在地" prop="storeAddressPath">
                <span>{{ shopForm.storeAddressPath || "暂无地址" }}</span>
                <el-button
                  style="margin-left: 10px"
                  type="default"
                  @click="handleClickAddress('storeAddressPath')"
                  >选择</el-button
                >
              </el-form-item>

              <el-form-item label="店铺详细地址" prop="storeAddressDetail">
                <el-input
                  v-model="shopForm.storeAddressDetail"
                  clearable
                  style="width: 350px"
                />
              </el-form-item>

              <el-form-item label="店铺logo" class="storeLogo">
                <div class="store-logo-block">
                  <el-avatar
                    shape="square"
                    :size="100"
                    :src="shopForm.storeLogo"
                  />
                  <el-button @click="handleCLickImg('storeLogo')" type="primary"
                    >选择图片</el-button
                  >
                </div>
              </el-form-item>

              <el-form-item label="店铺简介" prop="storeDesc" style="width: 350px">
                <el-input
                  v-model="shopForm.storeDesc"
                  type="textarea"
                  :rows="4"
                  maxlength="200"
                  show-word-limit
                  clearable
                  style="width: 400px"
                />
              </el-form-item>
              <br />
              <el-divider content-position="left">退货收件地址</el-divider>
              <el-form-item label="收件人姓名">
                <el-input
                  v-model="shopForm.salesConsigneeName"
                  clearable
                  style="width: 350px"
                />
              </el-form-item>
              <el-form-item label="收件人手机">
                <el-input
                  v-model="shopForm.salesConsigneeMobile"
                  clearable
                  maxlength="11"
                  style="width: 350px"
                />
              </el-form-item>
              <el-form-item label="地址信息">
                {{ shopForm.salesConsigneeAddressPath || "暂无地址" }}
                <el-button
                  style="margin-left: 10px"
                  type="default"
                  @click="handleClickAddress('salesConsigneeAddressPath')"
                  >选择</el-button
                >
              </el-form-item>
              <el-form-item label="详细地址">
                <el-input
                  v-model="shopForm.salesConsigneeDetail"
                  clearable
                  style="width: 350px"
                />
              </el-form-item>
            </div>
          </el-tab-pane>

          <!-- 入驻信息 -->
          <el-tab-pane label="入驻信息" class="tab" name="entry">
            <!-- 遮罩层  -->
            <div v-if="isRead" class="mask">只读不可修改</div>
            <el-divider content-position="left">公司信息</el-divider>
            <div v-loading="loading">
              <el-form-item label="公司名称" prop="companyName">
                <el-input v-model="shopForm.companyName" clearable style="width: 350px" />
              </el-form-item>

              <el-form-item label="公司电话" prop="companyPhone">
                <el-input v-model="shopForm.companyPhone" clearable style="width: 350px" />
              </el-form-item>
              <el-form-item label="公司所在地" prop="companyAddressIdPath">
                <span>{{ shopForm.companyAddressPath }}</span>
                <el-button
                  style="margin-left: 10px"
                  type="default"
                  @click="handleClickAddress('companyAddressPath')"
                  >选择</el-button
                >
              </el-form-item>
              <el-form-item label="公司详细地址" prop="companyAddress">
                <el-input v-model="shopForm.companyAddress" clearable style="width: 350px" />
              </el-form-item>
              <el-form-item label="员工总数" prop="employeeNum">
                <el-input-number
                  style="width: 150px"
                  :min="1"
                  :max="9999999"
                  v-model="shopForm.employeeNum"
                />
              </el-form-item>
              <el-form-item label="注册资金" prop="registeredCapital">
                <el-input-number
                  style="width: 150px"
                  :min="1"
                  :max="9999999"
                  v-model="shopForm.registeredCapital"
                />
                <span style="margin-left: 10px">万</span>
              </el-form-item>
              <el-form-item label="联系人姓名" prop="linkName">
                <el-input v-model="shopForm.linkName" clearable style="width: 200px" />
              </el-form-item>
              <el-form-item label="联系人手机" prop="linkPhone">
                <el-input
                  v-model="shopForm.linkPhone"
                  maxlength="11"
                  clearable
                  style="width: 200px"
                />
              </el-form-item>
              <el-form-item label="电子邮箱" prop="companyEmail">
                <el-input v-model="shopForm.companyEmail" clearable style="width: 200px" />
              </el-form-item>

              <el-divider content-position="left">营业执照信息</el-divider>

              <el-form-item label="营业执照号" prop="licenseNum">
                <el-input v-model="shopForm.licenseNum" clearable style="width: 200px" />
              </el-form-item>

              <el-form-item label="法定经营范围" prop="scope">
                <el-input v-model="shopForm.scope" clearable style="width: 200px" />
              </el-form-item>

              <el-form-item label="营业执照电子版" prop="licencePhoto">
                <div class="store-logo-block">
                  <el-avatar
                    shape="square"
                    :size="100"
                    :src="shopForm.licencePhoto"
                  />
                  <el-button @click="handleCLickImg('licencePhoto')" type="primary"
                    >选择图片</el-button
                  >
                </div>
              </el-form-item>
              <el-divider content-position="left">法人信息</el-divider>

              <el-form-item label="法人姓名" prop="legalName">
                <el-input v-model="shopForm.legalName" clearable style="width: 200px" />
              </el-form-item>
              <el-form-item label="法人证件号" prop="legalId">
                <el-input v-model="shopForm.legalId" clearable style="width: 200px" />
              </el-form-item>
              <el-form-item label="法人身份证照片" prop="legalPhoto">
                <div class="legal-photo-block">
                  <div class="legal-photo-list">
                    <el-avatar
                      class="legal-photo"
                      shape="square"
                      :size="100"
                      @click="handleCLickImg('legalPhoto', 0)"
                      :src="shopForm.legalPhoto[0]"
                    />
                    <el-avatar
                      class="legal-photo"
                      shape="square"
                      :size="100"
                      @click="handleCLickImg('legalPhoto', 1)"
                      :src="shopForm.legalPhoto[1]"
                    />
                  </div>
                  <div class="form-tip">点击图片上传身份证正反面，要求身份证清晰，四角无缺漏</div>
                </div>
              </el-form-item>

              <el-divider content-position="left">结算银行信息</el-divider>
              <el-form-item label="银行开户名" prop="settlementBankAccountName">
                <el-input
                  v-model="shopForm.settlementBankAccountName"
                  clearable
                  style="width: 200px"
                />
              </el-form-item>
              <el-form-item label="银行账号" prop="settlementBankAccountNum">
                <el-input
                  v-model="shopForm.settlementBankAccountNum"
                  clearable
                  style="width: 200px"
                />
              </el-form-item>
              <el-form-item label="银行支行名称" prop="settlementBankBranchName">
                <el-input
                  v-model="shopForm.settlementBankBranchName"
                  clearable
                  style="width: 200px"
                />
              </el-form-item>
              <el-form-item label="支行联行号" prop="settlementBankJointName">
                <el-input
                  v-model="shopForm.settlementBankJointName"
                  clearable
                  style="width: 200px"
                />
              </el-form-item>
            </div>
          </el-tab-pane>
          <el-tab-pane label="经营范围" class="tab" name="category">
            <!-- 遮罩层  -->
            <div v-if="isRead" class="mask">只读不可修改</div>
            <el-form-item label="经营类目" prop="goodsManagementCategory">
              <div class="category-panel">
                <div class="category-toolbar">
                  <el-checkbox
                    v-model="checkAll"
                    :indeterminate="indeterminate"
                    @change="handleCheckAll"
                    >全选
                  </el-checkbox>
                  <span class="category-count"
                    >已选 {{ checkAllGroup.length }} / {{ categories.length }} 项</span
                  >
                </div>
                <el-checkbox-group
                  v-model="checkAllGroup"
                  class="category-grid"
                  @change="checkAllGroupChange"
                >
                  <el-checkbox
                    v-for="(item, i) in categories"
                    :key="i + 1"
                    :value="String(item.id)"
                    >{{ item.name }}
                  </el-checkbox>
                </el-checkbox-group>
              </div>
            </el-form-item>
          </el-tab-pane>

          <el-tab-pane label="结算信息" class="tab" name="settlement">
            <el-alert type="info" :closable="false" show-icon class="settlement-alert">
              已添加<span class="theme_color">{{ settlementCycle.length }}</span
              >个结算日，最多可添加5个结算日，当月不包含所设日期时，将会顺延到下一个结算日
            </el-alert>
            <el-form-item label="结算日期">
              <div class="settlement-panel">
                <div class="settlement-tags">
                  <el-tag
                    v-for="item in settlementCycle"
                    :key="item"
                    closable
                    class="settlement-tag"
                    @close="removesettlementCycle(item)"
                    >每月 {{ item }} 日
                  </el-tag>
                  <span v-if="!settlementCycle.length" class="settlement-empty"
                    >暂未添加结算日</span
                  >
                </div>
                <div class="settlement-actions">
                  <template v-if="settlementShow">
                    <el-input-number
                      size="small"
                      :max="31"
                      :min="1"
                      v-model="day"
                    />
                    <el-button
                      v-if="addSettlementConfirmBtn"
                      type="primary"
                      @click="addsettlementCycleConfirm"
                      size="small"
                      >确认
                    </el-button>
                    <el-button type="default" @click="cancelSettlementCycle" size="small"
                      >取消
                    </el-button>
                  </template>
                  <el-button
                    type="primary"
                    plain
                    @click="addsettlementCycle"
                    size="small"
                    v-if="addSettlementBtn && settlementCycle.length < 5"
                    >+ 添加结算日期
                  </el-button>
                </div>
              </div>
            </el-form-item>
          </el-tab-pane>
        </el-tabs>
      </el-form>
      <div style="text-align: center">
        <el-button
          type="default"
          v-show="tabNameList.indexOf(tabName) > 0"
          class="mr_10"
          @click="prev"
          >上一步</el-button
        >
        <el-button
          type="primary"
          v-show="tabNameList.indexOf(tabName) < tabNameList.length - 1"
          @click="next"
          >下一步</el-button
        >
        <el-button
          type="primary"
          v-show="tabNameList.indexOf(tabName) === tabNameList.length - 1"
          @click="save"
          v-if="!isRead"
        >
          {{ shopId ? "修改" : "保存" }}
        </el-button>
      </div>
    </el-card>

    <el-dialog
      v-model="picModelFlag"
      width="1200px"
      append-to-body
      destroy-on-close
      :show-close="true"
    >
      <ossManage
        @callback="callbackSelected"
        :isComponent="true"
        :initialize="picModelFlag"
        ref="ossManageRef"
      />
    </el-dialog>

    <el-dialog
      v-model="memberModalFlag"
      width="1200px"
      append-to-body
      destroy-on-close
      :show-close="true"
    >
      <memberLayout
        v-if="memberModalFlag"
        :selectedMember="true"
        @callback="callbackMember"
        ref="memberLayoutRef"
      />
    </el-dialog>

    <el-dialog v-model="auditModel" width="360px" append-to-body :show-close="true">
      <template #header>
        <span style="color: #f60; text-align: center; display: block">审核店铺</span>
      </template>
      <div style="text-align: center">
        <p>您确认要审核通过该店铺</p>
      </div>
      <template #footer>
        <el-button type="danger" :loading="auditModalLoading" @click="audit('REFUSED')"
          >驳回</el-button
        >
        <el-button type="primary" :loading="auditModalLoading" @click="audit('PASS')"
          >通过</el-button
        >
      </template>
    </el-dialog>

    <multipleMap ref="map" @callback="getAddress" />
  </div>
</template>

<script setup>
import { nextTick, reactive, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import memberLayout from "@/views/member/list/index";
import ossManage from "@/views/sys/oss-manage/ossManage";
import { getCategoryTree } from "@/api/goods";
import { shopDetail, shopAdd, shopEdit, getShopByMemberId, shopAudit } from "@/api/shops";
import uploadPicInput from "@/components/lili/upload-pic-input";
import multipleMap from "@/components/map/multiple-map";
import { Message } from "@/utils/message";

defineOptions({ name: "shop-operation" });

const route = useRoute();
const router = useRouter();

const shopFormRef = ref(null);
const ossManageRef = ref(null);
const memberLayoutRef = ref(null);
const map = ref(null);

const shopId = ref(route.query.shopId); // 店铺id
const isRead = ref(false); // 是否只读，只有在店铺通过审核才可修改
const selectedFormBtnName = ref(""); // 点击图片绑定form
const loading = ref(false);
const auditModel = ref(false);
const auditModalLoading = ref(false);
const picModelFlag = ref(false); // 图片选择器
const address = ref(""); // 地址
const returnAddress = ref(""); // 退货地址
const memberModalFlag = ref(false); // 商家账号
const settlementShow = ref(false); // 是否展示结算日输入框
const addSettlementConfirmBtn = ref(false); // 添加结算日确认按钮
const addSettlementBtn = ref(true); // 添加结算日按钮
const day = ref(1); //结算日
const tabName = ref("base"); // tab栏name值
const tabNameList = ref(["base", "entry", "category", "settlement"]); // tab栏name值数组
const shopValidate = reactive({
  // 表单验证规则
  memberName: [{ required: true, message: "会员不能为空" }],
  storeAddressPath: [{ required: true, message: "店铺地址不能为空" }],
  storeName: [{ required: true, message: "店铺名称不能为空" }],
  companyAddress: [{ required: true, message: "公司地址不能为空" }],
  storeAddressDetail: [{ required: true, message: "店铺详细地址不能为空" }],
  storeDesc: [{ required: true, message: "店铺简介不能为空" }],
  storeCenter: [{ required: true, message: "店铺未定位" }],
  companyName: [{ required: true, message: "公司名称不能为空" }],
  companyPhone: [{ required: true, message: "公司电话不能为空" }],
  employeeNum: [
    {
      required: true,
      type: "number",
      message: "员工总数不能为空",
      trigger: "blur",
    },
  ],
  companyAddressIdPath: [{ required: true, message: "请选择公司地址" }],
  registeredCapital: [
    {
      required: true,
      type: "number",
      message: "注册资金不能为空",
      trigger: "blur",
    },
  ],
  linkName: [{ required: true, message: "联系人姓名不能为空" }],
  linkPhone: [
    { required: true, message: "联系人手机号不能为空" },
    {
      type: "string",
      pattern: /^1[3|4|5|6|7|8][0-9]{9}$/,
      message: "手机号格式出错",
      trigger: "blur",
    },
  ],
  companyEmail: [
    { required: true, message: "邮箱不能为空" },
    { type: "email", message: "邮箱格式错误" },
  ],
  licenseNum: [{ required: true, message: "营业执照号不能为空" }],
  scope: [{ required: true, message: "法定经营范围不能为空" }],
  licencePhoto: [{ required: true, message: "营业执照电子版不能为空" }],
  legalName: [{ required: true, message: "法人姓名不能为空" }],
  legalId: [{ required: true, message: "法人证件号不能为空" }],
  settlementBankAccountName: [{ required: true, message: "银行开户名不能为空" }],
  settlementBankAccountNum: [{ required: true, message: "银行账号不能为空" }],
  settlementBankBranchName: [{ required: true, message: "银行支行名称不能为空" }],
  settlementBankJointName: [{ required: true, message: "支行联行号不能为空" }],

  salesConsigneeMobile: [
    {
      type: "string",
      pattern: /^1[3|4|5|6|7|8][0-9]{9}$/,
      message: "手机号格式出错",
      trigger: "blur",
    },
  ],
});
const indeterminate = ref(true); // 复选框全选样式
const checkAll = ref(false); // 全选
const checkAllGroup = ref([]); // 全选数组
const submitLoading = ref(false); // 添加或编辑提交状态
const settlementCycle = ref([]); // 结算日
const shopForm = ref({
  // 店铺数据
  storeAddressPath: "",

  settlementCycle: "",
  selfOperated: "false",
  memberName: "",
  companyName: "",
  addressPath: "",
  addressIdPath: "",
  companyAddressPath: "",
  companyAddressIdPath: "",
  companyAddress: "",
  companyEmail: "",
  employeeNum: 1,
  registeredCapital: 1,
  linkName: "",
  linkPhone: "",
  licenseNum: "",
  scope: "",
  licencePhoto: "",
  legalName: "",
  legalId: "",
  legalPhoto: ["", ""],
  companyPhone: "",
  settlementBankAccountName: "",
  settlementBankAccountNum: "",
  settlementBankBranchName: "",
  settlementBankJointName: "",
  businesses: "",
  storeName: "",
  storeLogo: "",
  storeDesc: "",
  ddCode: "",
});
const categories = ref([]); // 分类

const infoResult = ref({}); // 店铺详情
const picIndex = ref(""); // 存储身份证图片下标，方便赋值
const currentAddress = ref(""); //当前选中的地址

// 历史遗留：regionClick 中未在 data 声明、直接挂到 this 上的字段
let showRegion = false;
let regionId = "";

// 选择地址
function handleClickAddress(val) {
  currentAddress.value = val;
  map.value.open();
}
// 选择会员的回调
function callbackMember(val) {
  if (val) {
    //选择会员后需要检验此会员是否开过店铺
    getShopByMemberId(val.id).then((res) => {
      if (res.success) {
        if (res.result != null) {
          Message.error("当前会员已经拥有店铺");
        } else {
          shopForm.value.memberId = val.id;
          shopForm.value.memberName = val.username;
        }
        memberModalFlag.value = false;
      }
    });
  }
}

//选择会员
function selectMember() {
  memberModalFlag.value = true;
}

//修改地址
function regionClick() {
  showRegion = true;
  regionId = "";
}
//删除所选择的结算日
function removesettlementCycle(name) {
  settlementCycle.value = settlementCycle.value.filter((i) => i !== name);
}
//确认添加方法
function addsettlementCycle() {
  settlementShow.value = true;
  addSettlementConfirmBtn.value = true;
  addSettlementBtn.value = false;
}
//添加结算日
function addsettlementCycleConfirm() {
  if (!day.value) {
    Message.warning("请输入正确的结算日，1-31的整数");
    return;
  }
  if (settlementCycle.value.includes(day.value)) {
    Message.warning("已有该结算日，不能重复输入");
    return;
  }
  settlementCycle.value.push(day.value);
  addSettlementConfirmBtn.value = false;
  addSettlementBtn.value = true;
  settlementShow.value = false;
  day.value = 1;
}
//取消添加结算日
function cancelSettlementCycle() {
  addSettlementConfirmBtn.value = false;
  addSettlementBtn.value = true;
  settlementShow.value = false;
  day.value = 1;
}
// 选择公司地址
function selectedRegion(val) {
  shopForm.value.companyAddressIdPath = val[0].toString();
  shopForm.value.companyAddressPath = val[1].toString().replace(/\s/g, "");
}
// 选择退货收件地址
function selectedConsigneeRegion(val) {
  shopForm.value.salesConsigneeAddressId = val[0].toString();
  shopForm.value.salesConsigneeAddressPath = val[1].toString().replace(/\s/g, "");
}
// 选择图片modal
function handleCLickImg(val, index) {
  picModelFlag.value = true;
  selectedFormBtnName.value = val;
  picIndex.value = index;
  nextTick(() => {
    if (ossManageRef.value) {
      ossManageRef.value.selectImage = true;
    }
  });
}
// 图片回显
function callbackSelected(val) {
  picModelFlag.value = false;
  if (picIndex.value === 0 || picIndex.value === 1) {
    shopForm.value[selectedFormBtnName.value][picIndex.value] = val.url;
  } else {
    shopForm.value[selectedFormBtnName.value] = val.url;
  }
  picIndex.value = "";
}
// 初始化数据
function init() {
  getCategories();
  if (shopId.value) {
    getShopDetail();
  }
}
function next() {
  // 下一步
  let index = tabNameList.value.indexOf(tabName.value) + 1;
  tabName.value = tabNameList.value[index];
}
function prev() {
  // 上一步
  let index = tabNameList.value.indexOf(tabName.value) - 1;
  tabName.value = tabNameList.value[index];
}
// 获取店铺详情
function getShopDetail() {
  shopDetail(shopId.value).then((res) => {
    if (res.success) {
      infoResult.value = res.result;
      shopForm.value = res.result;
      shopForm.value.selfOperated
        ? (shopForm.value.selfOperated = "true")
        : (shopForm.value.selfOperated = "false");

      checkAllGroup.value = shopForm.value.goodsManagementCategory.split(",");
      if (shopForm.value.settlementCycle) {
        settlementCycle.value = shopForm.value.settlementCycle.split(",");
      }
      shopForm.value.legalPhoto = shopForm.value.legalPhoto.split(",");

      address.value = shopForm.value.companyAddressIdPath;
      returnAddress.value = shopForm.value.salesConsigneeAddressId;
    }
  });
}
// 保存
function save() {
  shopFormRef.value.validate((valid) => {
    //校验结算日是否已经确认完成
    if (settlementShow.value) {
      Message.error("请确认当前所填结算日信息");
      return;
    }
    //校验经营类目
    if (checkAllGroup.value == "") {
      Message.error("请选择店铺经营类目");
      tabName.value = "category";
      return;
    }
    if (valid) {
      const params = JSON.parse(JSON.stringify(shopForm.value));
      //处理经营类目，结算日
      params.goodsManagementCategory = checkAllGroup.value;
      params.settlementCycle = settlementCycle.value;
      if (shopId.value) {
        delete params.memberId;
        shopEdit(shopId.value, filterFun(params)).then((res) => {
          if (res.success) {
            Message.success("编辑成功");
            router.push({ name: "shopList" });
          }
        });
      } else {
        //添加店铺单独需要检验的参数
        if (params.memberName == "") {
          Message.error("请选择开店的会员");
          return;
        }
        shopAdd(filterFun(params)).then((resp) => {
          if (resp.success) {
            Message.success("添加成功");
            shopForm.value = {};
            router.push({ name: "shopList" });
          }
        });
      }
    }
  });
}
// 筛选值为空的参数
function filterFun(params) {
  Object.entries(params).map((value) => {
    if (!value[1] || value[1] === "" || value[1] === "null") {
      delete params[value[0]];
    }
  });
  return params;
}
// 点击定位获取店铺地址
function getAddress(val) {
  if (val.type === "select") {
    const paths = val.data.map((item) => item.name).join(",");

    const ids = val.data.map((item) => item.id).join(",");

    if (currentAddress.value === "storeAddressPath") {
      shopForm.value.storeAddressPath = paths;
      shopForm.value.storeAddressIdPath = ids;

      shopForm.value.center = val.data[val.data.length - 1].center;
    } else if (currentAddress.value === "salesConsigneeAddressPath") {
      shopForm.value.salesConsigneeAddressPath = paths;
      shopForm.value.salesConsigneeAddressId = ids;
    } else if (currentAddress.value === "companyAddressPath") {
      shopForm.value.companyAddressPath = paths;
      shopForm.value.companyAddressIdPath = ids;
    }
  } else {
    if (currentAddress.value === "storeAddressPath") {
      shopForm.value.storeCenter = val.data.position.lng + "," + val.data.position.lat;
      shopForm.value.storeAddressPath = val.data.addr;
      shopForm.value.storeAddressIdPath = val.data.addrId;
    } else if (currentAddress.value === "salesConsigneeAddressPath") {
      shopForm.value.salesConsigneeAddressPath = val.data.addr;
      shopForm.value.salesConsigneeAddressId = val.data.addrId;
    } else if (currentAddress.value === "companyAddressPath") {
      shopForm.value.companyAddressPath = val.data.addr;
      shopForm.value.companyAddressIdPath = val.data.addrId;
    }
  }
}
// 全部选中
function handleCheckAll(checked) {
  indeterminate.value = false;
  if (checked) {
    const checkAllDate = [];
    categories.value.forEach((i) => checkAllDate.push(String(i.id)));
    checkAllGroup.value = checkAllDate;
  } else {
    checkAllGroup.value = [];
  }
}
// 经营类目的选择
function checkAllGroupChange(data) {
  if (data.length === categories.value.length) {
    indeterminate.value = false;
    checkAll.value = true;
  } else if (data.length > 0) {
    indeterminate.value = true;
    checkAll.value = false;
  } else {
    indeterminate.value = false;
    checkAll.value = false;
  }
}
// 获取所有分类
function getCategories() {
  getCategoryTree().then((res) => {
    if (res.success) {
      categories.value = res.result;
    }
  });
}
function auditHandler() {
  auditModel.value = true;
}
// 审核店铺
function audit(operation) {
  let id = route.query.shopId;
  if (operation === "PASS") {
    shopAudit(id, 0).then((res) => {
      auditModel.value = false;
      if (res.success) {
        Message.success("操作成功");
        router.push({ name: "shopAuth" });
      }
    });
  } else {
    shopAudit(id, 1).then((res) => {
      auditModel.value = false;
      if (res.success) {
        Message.success("操作成功");
        router.push({ name: "shopAuth" });
      }
    });
  }
}

init();
</script>
<style lang="scss" scoped>
.selectedMember {
  width: 100%;
}

.mask {
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  background: rgba(105, 105, 105, 0.1);
  z-index: 9;
}

:deep(.el-tabs__header) {
  margin: 0;
}

.tab {
  padding: 16px;
  position: relative;
}

.category-panel {
  width: 100%;
  max-width: 960px;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  background: #fff;
  overflow: hidden;
}

.category-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 16px;
  background: #f8f9fb;
  border-bottom: 1px solid #e4e7ed;

  :deep(.el-checkbox) {
    height: 32px;
  }
}

.category-count {
  font-size: 12px;
  color: #909399;
}

.settlement-alert {
  margin-bottom: 16px;
}

.settlement-panel {
  width: 100%;
  max-width: 960px;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  background: #fff;
  overflow: hidden;
}

.settlement-tags {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
  padding: 16px;
  min-height: 60px;
}

.settlement-tag {
  margin: 0;
}

.settlement-empty {
  color: #909399;
  font-size: 13px;
}

.settlement-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 16px;
  border-top: 1px solid #ebeef5;
  background: #f8f9fb;
}

.category-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  padding: 16px;

  :deep(.el-checkbox) {
    height: auto;
    margin-right: 0;
    padding: 5px 14px;
    border: 1px solid #dcdfe6;
    border-radius: 6px;
    background: #fff;
    transition: border-color 0.2s, background-color 0.2s;

    &:hover {
      border-color: var(--el-color-primary, #409eff);
    }

    &.is-checked {
      border-color: var(--el-color-primary, #409eff);
      background-color: var(--el-color-primary-light-9, #ecf5ff);
    }

    .el-checkbox__label {
      padding-left: 6px;
    }
  }
}

.img {
  margin-right: 10px;
  width: 100px;
  height: 100px;
}

.item {
  width: 350px !important;
  display: flex;

  > * {
    margin: 0 4px;
  }
}
.legal-photo {
  width: 100px;
  height: 100px;
  cursor: pointer;
}
.store-logo-block {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
}
.legal-photo-block {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
}
.legal-photo-list {
  display: flex;
  align-items: center;
  gap: 10px;
}
.form-tip {
  color: #999;
  font-size: 12px;
  line-height: 1.5;
}
</style>
