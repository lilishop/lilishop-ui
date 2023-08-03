<template>
  <div>
    <card _Title="收货地址" />
    <div class="add-box">
      <Form :model="formData" ref="form" label-position="left" :label-width="100" :rules="ruleInline">
        <FormItem label="收件人" prop="name">
          <i-input v-model="formData.name" placeholder="请输入收件人姓名" style="width: 600px"></i-input>
        </FormItem>
        <FormItem label="收件地区" prop="address">
          <span>{{ formData.address || '暂无地址' }}</span>

          <Button type="default" style="margin-left: 10px;" size="small" @click="$refs.map.open()">选择</Button>
        </FormItem>
        <FormItem label="详细地址" prop="detail">
          <i-input v-model="formData.detail" placeholder="请输入详细地址" style="width: 600px"></i-input>
        </FormItem>
        <FormItem label="手机号码" prop="mobile">
          <i-input v-model="formData.mobile" placeholder="请输入收件人手机号" style="width: 600px"></i-input>
        </FormItem>
        <FormItem label="地址别名">
          <i-input v-model="formData.alias" length :maxlength="4" placeholder="请输入地址别名，例如公司" style="width: 600px">
          </i-input>
        </FormItem>
        <FormItem label="默认地址">
          <i-switch v-model="formData.isDefault" />
        </FormItem>
      </Form>
    </div>
    <div class="mt_20">
      <Button type="primary" class="mr_10" :loading="loading" @click="save">保存收货地址</Button>
      <Button @click="$router.back()">返回</Button>
    </div>

    <multipleMap  ref="map" @callback="getAddress" />
  </div>
</template>

<script>
import card from "@/components/card";

import multipleMap from "@/components/map/multiple-map";
import * as RegExp from "@/plugins/RegExp.js";
import {
  newMemberAddress,
  editMemberAddress,
  getAddrDetail,
} from "@/api/address";
export default {
  name: "AddAddress",
  data() {
    return {
      formData: {
        // 添加地址表单
        isDefault: false,
      },
      ruleInline: {
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
      },
      loading: false, // 加载状态
      mapMsg: {}, // 地图信息
    };
  },
  methods: {
    save() {
      // 保存地址
      this.$refs.form.validate((valid) => {
        if (valid) {
          const params = JSON.parse(JSON.stringify(this.formData));
          params.consigneeAddressPath = params.address.replace(/\s/g, ",");
          delete params.address;
          this.loading = true;
          if (this.$route.query.id) {
            editMemberAddress(params)
              .then((res) => {
                if (res.success) {
                  this.loading = false;
                  this.$router.push("/home/MyAddress");
                }
              })
              .catch(() => {
                this.loading = false;
              });
          } else {
            newMemberAddress(params)
              .then((res) => {
                if (res.success) {
                  this.loading = false;
                  this.$router.push("/home/MyAddress");
                }
              })
              .catch(() => {
                this.loading = false;
              });
          }
        }
      });
    },
    getAddrById(id) {
      // 获取地址详情
      getAddrDetail(id).then((res) => {
        if (res.success) {
          console.log(res);
          const data = res.result;
          data.address = res.result.consigneeAddressPath.replace(/,/g, " ");
          this.formData = data;
        }
      });
    },
    getAddress(val) {
      // 获取地图选择信息
      if(val.type === 'select'){
        const paths = val.data.map(item => item.name).join(',')
        const ids = val.data.map(item => item.id).join(',')
        this.$set(this.formData,'address',paths)
        this.$set(this.formData,'consigneeAddressIdPath',ids)
        const coord = val.data[val.data.length - 1].center.split(',')
        this.formData.lat = coord[1]
        this.formData.lon = coord[0]
      }else{
        this.$set(this.formData, "address", val.data.addr);
        this.$set(this.formData, "consigneeAddressIdPath", val.data.addrId);
        this.$set(this.formData, "detail", val.data.address);
        this.formData.lat = val.data.position.lat;
        this.formData.lon = val.data.position.lng;
      }


    },
  },
  mounted() {
    const id = this.$route.query.id;
    if (id) this.getAddrById(id);
  },
  components: {
    card,
    multipleMap
  },
};
</script>

<style scoped lang="scss">
.add-box {
  margin: 40px 0;
}
</style>
