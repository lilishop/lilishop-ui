<template>
  <div class="search">
    <el-card style="margin-left: 10px">
      <el-tabs v-model="type" @click="handleClickType">
        <el-tab-pane label="基本信息" name="INFO">
          <el-form ref="formRef" :model="form" label-width="100px" :rules="formValidate">
            <el-form-item label="店铺名称">
              <el-input v-model="storeName" disabled clearable style="width: 20%" />
            </el-form-item>
            <el-form-item label="店铺地址" prop="storeAddressPath">
              <span>{{ form.storeAddressPath }}</span>
              <el-button style="margin-left: 10px;" @click="handleChangeAddress('storeAddress')">选择</el-button>
            </el-form-item>
            <el-form-item label="详细地址" prop="shopAddressDetail">
              <el-input v-model="form.storeAddressDetail" clearable style="width: 20%" maxlength="50" />
            </el-form-item>
            <el-form-item label="店铺LOGO">
              <upload-pic-thumb v-model="form.storeLogo" :multiple="false"></upload-pic-thumb>
            </el-form-item>
            <el-form-item label="店铺简介" prop="content" class="wangEditor">
              <el-input type="textarea" :rows="8" v-model="form.storeDesc" style="width: 30%"></el-input>
            </el-form-item>
            <el-form-item label="店铺楼层" prop="content" class="wangEditor">
              <el-switch v-model="form.pageShow" @change="pageShow" />
              <span class="desc">店铺楼层装修是否开启，开启后移动端PC端将会自动展示装修的内容</span>
            </el-form-item>
            <el-form-item label="开启自提" prop="content" class="wangEditor">
              <el-switch v-model="form.selfPickFlag" @change="changeSelfPickFlag" />
              <span class="desc">店铺是否开启自提功能</span>
            </el-form-item>
            <el-form-item>
              <el-button @click="handleSubmit" :loading="submitLoading" type="primary" style="margin-right: 5px">修改
              </el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>
        <el-tab-pane label="发货地址">
          <el-form ref="addressGoodsRef" :model="addressGoods" label-width="120px" :rules="addressGoodsValidate" class="shop-setting-form">
            <el-form-item label="发货人姓名" prop="salesConsignorName">
              <el-input v-model="addressGoods.salesConsignorName" maxlength="11" clearable style="width: 20%">
              </el-input>
            </el-form-item>
            <el-form-item label="发货人手机号" prop="salesConsignorMobile">
              <el-input v-model="addressGoods.salesConsignorMobile" maxlength="11" clearable style="width: 20%">
              </el-input>
            </el-form-item>
            <el-form-item label="地址" prop="salesConsignorAddressId">
              <span>{{ addressGoods.salesConsignorAddressPath }}</span>
              <el-button style="margin-left: 10px;" @click="handleChangeAddress('addressGoods')">选择</el-button>
            </el-form-item>
            <!-- <el-form-item label="地址名称" prop="salesConsignorAddressPath">
              <el-input
                v-model="addressGoods.salesConsignorAddressPath"
                clearable
                style="width: 20%"
              >
              </el-input>
            </el-form-item> -->
            <el-form-item label="详细地址" prop="salesConsignorDetail">
              <el-input v-model="addressGoods.salesConsignorDetail" clearable style="width: 20%">
              </el-input>
            </el-form-item>
            <el-button @click="setAddressGoods" type="primary" style="margin-left: 8px">确认
            </el-button>
          </el-form>
        </el-tab-pane>
        <el-tab-pane label="退货地址" name="REFUND_GOODS_ADDRESS">
          <el-form ref="addressFormRef" :model="addressForm" label-width="100px" :rules="afterFormValidate">
            <el-form-item label="收货人" prop="salesConsigneeName">
              <el-input v-model="addressForm.salesConsigneeName" maxlength="11" clearable style="width: 20%" />
            </el-form-item>
            <el-form-item label="收货人电话" prop="salesConsigneeMobile">
              <el-input v-model="addressForm.salesConsigneeMobile" maxlength="11" style="width: 20%" />
            </el-form-item>
            <el-form-item label="售后地址">
              <span>{{ addressForm.salesConsigneeAddressPath }}</span>
              <el-button style="margin-left: 10px;" @click="handleChangeAddress('salesConsigneeAddressPath')">选择</el-button>
            </el-form-item>
            <el-form-item label="详细地址" prop="salesConsigneeDetail">
              <el-input v-model="addressForm.salesConsigneeDetail" clearable style="width: 20%" maxlength="50" />
            </el-form-item>

            <el-form-item>
              <el-button @click="afterHandleSubmit" :loading="submitLoading" type="primary" style="margin-right: 5px">修改
              </el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>
        <!-- Udesk 坐席功能 后续维护 -->
        <!-- <el-tab-pane label="客服设置" name="UDESK">
          <el-form
            ref="udeskForm"
            :model="udeskForm"
            label-width="100px"
            :rules="udeskFormValidate"
          >
            <el-form-item label="坐席id" prop="merchantEuid">
              <el-input
                v-model="udeskForm.merchantEuid"
                maxlength="30"
                clearable
                style="width: 20%"
              />
            </el-form-item>
            <el-form-item>
              <el-button
                @click="merchantSubmit"
                :loading="submitLoading"
                type="primary"
                style="margin-right: 5px"
                >修改
              </el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane> -->
      </el-tabs>
    </el-card>

    <multipleMap ref="mapRef" @callback="callbackAddress" />
  </div>
</template>

<script setup>
import { onMounted, ref } from "vue";
import * as API_Shop from "@/api/shops";
import { validateMobile } from "@/libs/validate";
import uploadPicThumb from "@/views/my-components/lili/upload-pic-thumb";
import multipleMap from "@/views/my-components/map/multiple-map";
import * as RegExp from "@/libs/RegExp.js";
import Cookies from "js-cookie";
import { Message } from "@/utils/message";

defineOptions({ name: "shopSetting" });

const currentKey = ref(""); //存储当前点击地址的key
const showMap = ref(false); // 是否展示地图
const type = ref("INFO");

const storeName = ref(""); //店铺名称

const regionId = ref([]); // 地区id
// 历史遗留：loading、regionGoods、regionIdS 未在原 data 中声明，仅在方法内赋值，保持原行为
let loading = false;
let regionGoods = null;
let regionIdS = null;
const addressForm = ref({
  // 退货地址
  salesConsigneeName: "", // 收货人姓名
  salesConsigneeMobile: "", // 收货人电话
  salesConsigneeAddressId: "", // 售后地址id,逗号分割
  salesConsigneeAddressPath: "", // 售后地址，逗号分割
  salesConsigneeDetail: "", // 详细地址
});
//im form
const udeskForm = ref({
  merchantEuid: "",
});
const udeskFormValidate = {
  merchantEuid: [
    { required: true, message: "请输入店铺坐席ID", trigger: "blur" },
  ],
};
const afterFormValidate = {
  salesConsigneeMobile: [
    { required: true, message: "手机号不能为空", trigger: "blur" },
    {
      pattern: RegExp.mobile,
      trigger: "blur",
      message: "请输入正确的手机号",
    },
  ],
  salesConsigneeName: [
    { required: true, message: "请输入收货人", trigger: "blur" },
  ],
  salesConsigneeDetail: [
    { required: true, message: "请输入详细地址", trigger: "blur" },
  ],
};
const form = ref({
  // 添加或编辑表单对象初始化数据
  storeAddressPath: "", // 店铺地址中文
  storeCenter: "", // 经度 + 纬度
  longitude: "", //经度
  latitude: "", //纬度
  storeAddressDetail: "", //详细地址
  storeAddressIdPath: "", //地址
  storeDesc: "", // 店铺描述
  pageShow: false,
  selfPickFlag: false,
});

// 表单验证规则
const formValidate = {
  addressName: [
    {
      required: true,
      message: "请输入地址名称",
      trigger: "blur",
    },
  ],
  longitude: [
    {
      required: true,
      message: "请输入地址经度",
      trigger: "blur",
    },
  ],
  latitude: [
    {
      required: true,
      message: "请输入地址纬度",
      trigger: "blur",
    },
  ],
  mobile: [
    {
      required: true,
      message: "请输入地址纬度",
      trigger: "blur",
    },
    {
      validator: validateMobile,
      trigger: "blur",
    },
  ],
  storeAddressDetail: [
    {
      required: true,
      message: "请输入详细地址",
      trigger: "blur",
    },
  ],
};
const submitLoading = ref(false); // 添加或编辑提交状态
//发货地址
const addressGoods = ref({
  salesConsignorName: " ",
  salesConsignorMobile: " ",
  salesConsignorAddressId: " ",
  salesConsignorAddressPath: " ",
  salesConsignorDetail: " ",
});

const addressGoodsValidate = {
  salesConsignorName: [
    { required: true, message: "请输入发货人姓名", trigger: "blur" },
  ],
  salesConsignorMobile: [
    { required: true, message: "手机号不能为空", trigger: "blur" },
    {
      pattern: RegExp.mobile,
      trigger: "blur",
      message: "请输入正确的手机号",
    },
  ],
  salesConsignorDetail: [
    { required: true, message: "请输入详细地址", trigger: "blur" },
  ],
};

const formRef = ref(null);
const addressGoodsRef = ref(null);
const addressFormRef = ref(null);
const udeskFormRef = ref(null);
const mapRef = ref(null);

// 回调地址
function callbackAddress(val) {
  if (val.type === 'select') {
    const paths = val.data.map(item => item.name).join(',')

    const ids = val.data.map(item => item.id).join(',')

    if (currentKey.value === 'storeAddress') {
      form.value.storeAddressPath = paths
      form.value.storeAddressIdPath = ids
      form.value.storeCenter = val.data[val.data.length - 1].center
    }
    if (currentKey.value === 'addressGoods') {
      addressGoods.value.salesConsignorAddressPath = paths
      addressGoods.value.salesConsignorAddressId = ids
    }
    if (currentKey.value === 'salesConsigneeAddressPath') {
      addressForm.value.salesConsigneeAddressPath = paths
      addressForm.value.salesConsigneeAddressId = ids
    }

  }
  else {
    if (currentKey.value === 'storeAddressstoreAddress') {
      form.value.storeAddressPath = val.data.addr;
      form.value.storeAddressIdPath = val.data.addrId;
      form.value.storeCenter = val.data.position.lng + "," + val.data.position.lat;
    }
    if (currentKey.value === 'addressGoods') {
      addressGoods.value.salesConsignorAddressPath = val.data.addr;
      addressGoods.value.salesConsignorAddressId = val.data.addrId;
    }
    if (currentKey.value === 'salesConsigneeAddressPath') {
      addressForm.value.salesConsigneeAddressPath = val.data.addr;
      addressForm.value.salesConsigneeAddressId = val.data.addrId;
    }
  }
}
// 修改地址
function handleChangeAddress(key) {
  currentKey.value = key
  mapRef.value.open();
}
// 初始化数据
function init() {
  getShopInfo();
  getDeliverAddress()
}


function setAddressGoods() {
  console.log(addressGoodsRef.value)

  addressGoodsRef.value.validate((valid) => {
    if (valid) {
      API_Shop.editDeliverAddress(addressGoods.value).then(res => {
        if (res.success) {
          Message.success("修改成功")
        }
      })
    }
  });
}
//获取店铺信息
function getShopInfo() {
  loading = true;
  API_Shop.getShopInfo().then((res) => {
    loading = false;
    if (res.success) {
      form.value = res.result;

      storeName.value = res.result.storeName;
      form.value.storeCenter = res.result.storeCenter;
      Cookies.set("userInfoSeller", JSON.stringify(res.result));
      if (res.result.merchantEuid) {
        //赋予坐席id
        udeskForm.value.merchantEuid = res.result.merchantEuid;
      }
    }
  });
}
function pageShow(type) {
  form.value.pageShow = type
}
function changeSelfPickFlag(item) {
  if (item) {
    form.value.selfPickFlag = item
  }
}
function getDeliverAddress() {
  API_Shop.getDeliverAddress().then(res => {
    if (res.success) {
      if (res.result != '' && res.result != null) {
        addressGoods.value = res.result;
        regionGoods = res.result.salesConsignorAddressPath;
        regionIdS = res.result.salesConsignorAddressId;
      }
    }
  })
}

//重置
function handleReset() {
  formRef.value.resetFields();
}
//提交保存
function handleSubmit() {
  formRef.value.validate((valid) => {
    if (valid) {
      submitLoading.value = true;
      API_Shop.saveShopInfo(form.value).then((res) => {
        submitLoading.value = false;
        if (res.success) {
          Message.success("修改成功");
          getShopInfo();
        }
      });
    }
  });
}
function merchantSubmit() {
  udeskFormRef.value.validate((valid) => {
    if (valid) {
      submitLoading.value = true;
      API_Shop.updatEmerchantId(udeskForm.value).then((res) => {
        submitLoading.value = false;
        if (res.success) {
          Message.success("修改成功");
          getShopInfo();
        }
      });
    }
  });
}

//tab切换
function handleClickType(v) {
  //退款
  if (v == "INFO") {
    getShopInfo();
  }
  //退货
  if (v == "REFUND_GOODS_ADDRESS") {
    getRefundGoodsAddress();
  }
}
//获取商家退货地址
function getRefundGoodsAddress() {
  API_Shop.getRefundGoodsAddress().then((res) => {
    if (res.result != null) {
      addressForm.value = res.result;
    }
  });
}
//提交保存
function afterHandleSubmit() {
  addressFormRef.value.validate((valid) => {
    if (valid) {
      submitLoading.value = true;
      API_Shop.saveRefundGoodsAddress(addressForm.value).then((res) => {
        submitLoading.value = false;
        if (res.success) {
          Message.success("修改成功");
          getRefundGoodsAddress();
        }
      });
    }
  });
}

onMounted(() => {
  init();
});
</script>
<style scoped lang="scss">
.desc {
  margin-left: 10px;
  color: #999;
}

.shop-setting-form {
  :deep(.el-form-item) {
    align-items: center;
  }

  :deep(.el-form-item__label) {
    white-space: nowrap;
    line-height: 32px;
  }
}
</style>
