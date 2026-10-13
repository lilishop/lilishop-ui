<template>
  <div>
    <UserCenterLayout>
    <div class="add-box">
      <el-form :model="formData" ref="formRef" label-position="left" label-width="100px" :rules="ruleInline">
        <el-form-item label="收件人" prop="name">
          <el-input v-model="formData.name" placeholder="请输入收件人姓名" style="width: 600px"></el-input>
        </el-form-item>
        <el-form-item label="收件地区" prop="address">
          <span>{{ formData.address || '暂无地址' }}</span>

          <el-button type="default" style="margin-left: 10px;" size="small" @click="mapRef.open()">选择</el-button>
        </el-form-item>
        <el-form-item label="详细地址" prop="detail">
          <el-input v-model="formData.detail" placeholder="请输入详细地址" style="width: 600px"></el-input>
        </el-form-item>
        <el-form-item label="手机号码" prop="mobile">
          <el-input v-model="formData.mobile" placeholder="请输入收件人手机号" style="width: 600px"></el-input>
        </el-form-item>
        <el-form-item label="地址别名">
          <el-input v-model="formData.alias" :maxlength="5" show-word-limit placeholder="请输入地址别名，例如公司" style="width: 600px">
          </el-input>
        </el-form-item>
        <el-form-item label="默认地址">
          <el-switch v-model="formData.isDefault" />
        </el-form-item>
      </el-form>
    </div>
    <div class="action-bar mt_20">
      <el-button @click="$router.back()">返回</el-button>
      <el-button type="primary" class="ml_10" :loading="loading" @click="save">保存收货地址</el-button>
    </div>
    </UserCenterLayout>

    <multipleMap  ref="mapRef" @callback="getAddress" />
  </div>
</template>

<script setup>
import { onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import multipleMap from "@/components/map/multiple-map";
import * as RegExp from "@/plugins/RegExp.js";
import {
  newMemberAddress,
  editMemberAddress,
  getAddrDetail,
} from "@/api/address";

defineOptions({ name: "AddAddress" });

const route = useRoute();
const router = useRouter();

const formRef = ref(null);
const mapRef = ref(null);

const formData = ref({
  // 添加地址表单
  isDefault: false,
});
const ruleInline = {
  // 验证规则
  name: [{ required: true, message: "请输入姓名", trigger: "blur" }],
  address: [{ required: true, message: "请输入地址", trigger: "change" }],
  detail: [
    { required: true, message: "请输入详细地址", trigger: "blur" },
  ],
  mobile: [
    { required: true, message: "请输入手机号码" },
    {
      pattern: RegExp.mobile,
      trigger: "blur",
      message: "请输入正确的手机号",
    },
  ],
};
const loading = ref(false); // 加载状态
const mapMsg = ref({}); // 地图信息

// 保存地址
function save() {
  formRef.value.validate((valid) => {
    if (valid) {
      const params = JSON.parse(JSON.stringify(formData.value));
      params.consigneeAddressPath = params.address.replace(/\s/g, ",");
      delete params.address;
      loading.value = true;
      if (route.query.id) {
        editMemberAddress(params)
          .then((res) => {
            loading.value = false;
            if (res.success) {
              router.push("/home/MyAddress");
            }
          })
          .catch(() => {
            loading.value = false;
          });
      } else {
        newMemberAddress(params)
          .then((res) => {
            loading.value = false;
            if (res.success) {
              router.push("/home/MyAddress");
            }
          })
          .catch(() => {
            loading.value = false;
          });
      }
    }
  });
}
function getAddrById(id) {
  // 获取地址详情
  getAddrDetail(id).then((res) => {
    if (res.success) {
      const data = res.result;
      data.address = res.result.consigneeAddressPath.replace(/,/g, " ");
      formData.value = data;
    }
  });
}
function getAddress(val) {
  // 获取地图选择信息
  if(val.type === 'select'){
    const paths = val.data.map(item => item.name).join(',')
    const ids = val.data.map(item => item.id).join(',')
    formData.value['address'] = paths
    formData.value['consigneeAddressIdPath'] = ids
    const coord = val.data[val.data.length - 1].center.split(',')
    formData.value.lat = coord[1]
    formData.value.lon = coord[0]
  }else{
    formData.value["address"] = val.data.addr;
    formData.value["consigneeAddressIdPath"] = val.data.addrId;
    formData.value["detail"] = val.data.address;
    formData.value.lat = val.data.position.lat;
    formData.value.lon = val.data.position.lng;
  }


}

onMounted(() => {
  const id = route.query.id;
  if (id) getAddrById(id);
});
</script>

<style scoped lang="scss">
.add-box {
  margin: 40px 0;
}

.action-bar {
  display: flex;
  justify-content: flex-end;
}
</style>
