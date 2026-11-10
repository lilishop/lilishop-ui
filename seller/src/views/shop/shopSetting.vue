<template>
  <div class="search">
    <el-card style="margin-left: 10px">
      <el-tabs v-model="type">
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
import Cookies from "js-cookie";
import util from "@/libs/util.js";
import { Message } from "@/utils/message";

defineOptions({ name: "shopSetting" });

const currentKey = ref(""); // 存储当前点击地址的key
const type = ref("INFO");

const storeName = ref(""); // 店铺名称

const form = ref({
  storeAddressPath: "", // 店铺地址中文
  storeCenter: "", // 经度 + 纬度
  longitude: "", // 经度
  latitude: "", // 纬度
  storeAddressDetail: "", // 详细地址
  storeAddressIdPath: "", // 地址
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
const submitLoading = ref(false);

const formRef = ref(null);
const mapRef = ref(null);

// 回调地址
function callbackAddress(val) {
  if (val.type === "select") {
    const paths = val.data.map((item) => item.name).join(",");
    const ids = val.data.map((item) => item.id).join(",");

    if (currentKey.value === "storeAddress") {
      form.value.storeAddressPath = paths;
      form.value.storeAddressIdPath = ids;
      form.value.storeCenter = val.data[val.data.length - 1].center;
    }
  } else {
    if (
      currentKey.value === "storeAddress" ||
      currentKey.value === "storeAddressstoreAddress"
    ) {
      form.value.storeAddressPath = val.data.addr;
      form.value.storeAddressIdPath = val.data.addrId;
      form.value.storeCenter =
        val.data.position.lng + "," + val.data.position.lat;
    }
  }
}

// 修改地址
function handleChangeAddress(key) {
  currentKey.value = key;
  mapRef.value.open();
}

// 初始化数据
function init() {
  getShopInfo();
}

// 获取店铺信息
function getShopInfo() {
  API_Shop.getShopInfo().then((res) => {
    if (res.success) {
      form.value = res.result;
      storeName.value = res.result.storeName;
      form.value.storeCenter = res.result.storeCenter;
      Cookies.set("userInfoSeller", JSON.stringify(util.pickSellerProfile(res.result)));
    }
  });
}

function pageShow(val) {
  form.value.pageShow = val;
}

function changeSelfPickFlag(item) {
  if (item) {
    form.value.selfPickFlag = item;
  }
}

// 提交保存
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

onMounted(() => {
  init();
});
</script>
<style scoped lang="scss">
.desc {
  margin-left: 10px;
  color: #999;
}
</style>
