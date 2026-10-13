<template>
  <div>
    <el-dialog v-model="showAddr" width="800" title="收件人地址">
      <el-form
        :model="formData"
        ref="formRef"
        label-position="left"
        label-width="100px"
        :rules="ruleInline"
      >
        <el-form-item label="收件人" prop="name">
          <el-input v-model="formData.name" style="width: 600px"></el-input>
        </el-form-item>
        <el-form-item label="收件地区" prop="address">
          {{ formData.address || '暂无地址' }}
          <el-button type="primary" style="margin-left: 10px;" size="small" @click="mapRef.open()">选择</el-button>
        </el-form-item>
        <el-form-item label="详细地址" prop="detail">
          <el-input v-model="formData.detail" style="width: 600px"></el-input>
        </el-form-item>
        <el-form-item label="手机号码" prop="mobile">
          <el-input v-model="formData.mobile" style="width: 600px"></el-input>
        </el-form-item>
        <el-form-item label="地址别名">
          <el-input
            v-model="formData.alias"
            :maxlength="5"
            show-word-limit
            placeholder="请输入地址别名，例如公司"
            style="width: 600px"
          ></el-input>
        </el-form-item>
        <el-form-item label="默认地址">
          <el-switch v-model="formData.isDefault" />
        </el-form-item>
      </el-form>
      <template #footer><div class="mt_20">
        <el-button @click="hide">取消</el-button>
        <el-button type="primary" class="mr_10" :loading="loading" @click="save">保存收货地址</el-button>
      </div></template>
    </el-dialog>
    <multipleMap ref="mapRef" @callback="getAddress"></multipleMap>
  </div>
</template>

<script setup>
import { ref, watch } from "vue";
import { Message } from "@/utils/message";
import multipleMap from "@/components/map/multiple-map";
import {
  newMemberAddress,
  editMemberAddress,
  getAddrDetail
} from '@/api/address';

defineOptions({ name: 'addressManage' });

const props = defineProps({
  id: { // 传入的地址id
    defalut: '',
    type: String
  }
});

const emit = defineEmits(['change']);

const showAddr = ref(false); // 控制模态框显隐
const formData = ref({ // 表单数据
  isDefault: false
});
const ruleInline = { // 验证规则
  name: [{ required: true, message: '请输入收件人姓名', trigger: 'blur' }],
  address: [{ required: true, message: '请输入地址', trigger: 'change' }],
  detail: [
    { required: true, message: '请输入详细地址', trigger: 'blur' }
  ],
  mobile: [
    { required: true, message: '手机号不能为空', trigger: 'blur' },
    {
      type: 'string',
      pattern: /^1[3|4|5|6|7|8][0-9]{9}$/,
      message: '手机号格式出错',
      trigger: 'blur'
    }
  ]
};
const loading = ref(false); // 提交的加载状态
const mapMsg = ref({}); // 地图信息

const formRef = ref(null);
const mapRef = ref(null);

function save () { // 保存地址
  formRef.value.validate((valid) => {
    if (valid) {
      const params = JSON.parse(JSON.stringify(formData.value));
      params.consigneeAddressPath = params.address.replace(/\s/g, ',');
      delete params.address;
      loading.value = true;
      if (props.id) {
        editMemberAddress(params).then((res) => {
          loading.value = false;
          if (res.success) {
            Message.success('编辑地址成功');
            emit('change', true);
            hide();
          }
        }).catch(() => { loading.value = false; });
      } else {
        newMemberAddress(params).then((res) => {
          loading.value = false;
          if (res.success) {
            Message.success('新增地址成功');
            emit('change', true);
            hide();
          }
        }).catch(() => { loading.value = false; });
      }
    }
  });
}

function getAddrById (id) {
  // 获取地址详情
  getAddrDetail(id).then((res) => {
    if (res.success) {
      const data = res.result;
      data.address = res.result.consigneeAddressPath.replace(/,/g, ' ');
      formData.value = data;
    }
  });
}

function getAddress (val) {
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

function show () { // 地址模态框显示
  showAddr.value = true;
}

function hide () { // 地址模态框隐藏
  showAddr.value = false;
}

defineExpose({ show, hide });

watch(
  () => props.id, // 传入的地址id
  (v) => {
    if (v) {
      getAddrById(v);
    } else {
      formData.value = {isDefault: false}
      formRef.value.resetFields();
    }
  }
);
</script>

<style scoped lang="scss">
.add-box {
  margin: 40px 0;
}
</style>
