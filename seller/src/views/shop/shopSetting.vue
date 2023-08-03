<template>
  <div class="search">
    <Card style="margin-left: 10px">
      <Tabs v-model="type" @on-click="handleClickType">
        <TabPane label="基本信息" name="INFO">
          <Form ref="form" :model="form" :label-width="100" :rules="formValidate">
            <FormItem label="店铺名称">
              <Input v-model="storeName" disabled clearable style="width: 20%" />
            </FormItem>
            <FormItem label="店铺地址" prop="storeAddressPath">
              <span>{{ form.storeAddressPath }}</span>
              <Button style="margin-left: 10px;" @click="handleChangeAddress('storeAddress')">选择</Button>
            </FormItem>
            <FormItem label="详细地址" prop="shopAddressDetail">
              <Input v-model="form.storeAddressDetail" clearable style="width: 20%" maxlength="50" />
            </FormItem>
            <FormItem label="店铺LOGO">
              <upload-pic-thumb v-model="form.storeLogo" :multiple="false"></upload-pic-thumb>
            </FormItem>
            <FormItem label="店铺简介" prop="content" class="wangEditor">
              <Input type="textarea" :rows="8" v-model="form.storeDesc" style="width: 30%"></Input>
            </FormItem>
            <FormItem label="店铺楼层" prop="content" class="wangEditor">
              <i-switch v-model="form.pageShow" @on-change="pageShow"></i-switch>
              <span class="desc">店铺楼层装修是否开启，开启后移动端PC端将会自动展示装修的内容</span>
            </FormItem>
            <FormItem label="开启自提" prop="content" class="wangEditor">
              <i-switch v-model="form.selfPickFlag" @on-change="changeSelfPickFlag"></i-switch>
              <span class="desc">店铺是否开启自提功能</span>
            </FormItem>
            <Form-item>
              <Button @click="handleSubmit" :loading="submitLoading" type="primary" style="margin-right: 5px">修改
              </Button>
            </Form-item>
          </Form>
        </TabPane>
        <TabPane label="发货地址">
          <Form ref="addressGoods" :model="addressGoods" :label-width="100" :rules="addressGoodsValidate">
            <FormItem label="发货人姓名" prop="salesConsignorName">
              <Input v-model="addressGoods.salesConsignorName" maxlength="11" clearable style="width: 20%">
              </Input>
            </FormItem>
            <FormItem label="发货人手机号" prop="salesConsignorMobile">
              <Input v-model="addressGoods.salesConsignorMobile" maxlength="11" clearable style="width: 20%">
              </Input>
            </FormItem>
            <FormItem label="地址" prop="salesConsignorAddressId">
              <span>{{ addressGoods.salesConsignorAddressPath }}</span>
              <Button style="margin-left: 10px;" @click="handleChangeAddress('addressGoods')">选择</Button>
            </FormItem>
            <!-- <FormItem label="地址名称" prop="salesConsignorAddressPath">
              <Input
                v-model="addressGoods.salesConsignorAddressPath"
                clearable
                style="width: 20%"
              >
              </Input>
            </FormItem> -->
            <FormItem label="详细地址" prop="salesConsignorDetail">
              <Input v-model="addressGoods.salesConsignorDetail" clearable style="width: 20%">
              </Input>
            </FormItem>
            <Button @click="setAddressGoods" type="primary" style="margin-left: 8px">确认
            </Button>
          </Form>
        </TabPane>
        <TabPane label="退货地址" name="REFUND_GOODS_ADDRESS">
          <Form ref="addressForm" :model="addressForm" :label-width="100" :rules="afterFormValidate">
            <FormItem label="收货人" prop="salesConsigneeName">
              <Input v-model="addressForm.salesConsigneeName" maxlength="11" clearable style="width: 20%" />
            </FormItem>
            <FormItem label="收货人电话" prop="salesConsigneeMobile">
              <Input v-model="addressForm.salesConsigneeMobile" maxlength="11" style="width: 20%" />
            </FormItem>
            <FormItem label="售后地址">
              <span>{{ addressForm.salesConsigneeAddressPath }}</span>
              <Button style="margin-left: 10px;" @click="handleChangeAddress('salesConsigneeAddressPath')">选择</Button>
            </FormItem>
            <FormItem label="详细地址" prop="salesConsigneeDetail">
              <Input v-model="addressForm.salesConsigneeDetail" clearable style="width: 20%" maxlength="50" />
            </FormItem>

            <Form-item>
              <Button @click="afterHandleSubmit" :loading="submitLoading" type="primary" style="margin-right: 5px">修改
              </Button>
            </Form-item>
          </Form>
        </TabPane>
        <TabPane label="库存预警" name="STOCK_WARNING">
          <Form ref="stockWarningForm" :model="stockWarningForm" :label-width="100" :rules="stockWarningFormValidate">
            <FormItem label="预警数" prop="stockWarning">
              <InputNumber :min="0" :max="99999" v-model="stockWarningForm.stockWarning" type="number" maxlength="6"
                clearable style="width: 20%" />
            </FormItem>

            <Form-item>
              <Button @click="stockWarningHandleSubmit" :loading="submitLoading" type="primary"
                style="margin-right: 5px">修改
              </Button>
            </Form-item>
          </Form>
        </TabPane>
        <!-- Udesk 坐席功能 后续维护 -->
        <!-- <TabPane label="客服设置" name="UDESK">
          <Form
            ref="udeskForm"
            :model="udeskForm"
            :label-width="100"
            :rules="udeskFormValidate"
          >
            <FormItem label="坐席id" prop="merchantEuid">
              <Input
                v-model="udeskForm.merchantEuid"
                maxlength="30"
                clearable
                style="width: 20%"
              />
            </FormItem>
            <Form-item>
              <Button
                @click="merchantSubmit"
                :loading="submitLoading"
                type="primary"
                style="margin-right: 5px"
                >修改
              </Button>
            </Form-item>
          </Form>
        </TabPane> -->
      </Tabs>
    </Card>

    <multipleMap ref="map" @callback="callbackAddress" />
  </div>
</template>

<script>
import * as API_Shop from "@/api/shops";
import { validateMobile } from "@/libs/validate";
import uploadPicThumb from "@/views/my-components/lili/upload-pic-thumb";

import multipleMap from "@/views/my-components/map/multiple-map";
import * as RegExp from "@/libs/RegExp.js";
import Cookies from "js-cookie";
export default {
  name: "shopSetting",
  components: {
    uploadPicThumb,

    multipleMap
  },
  data() {
    return {
      currentKey: "", //存储当前点击地址的key
      showMap: false, // 是否展示地图
      type: "INFO",

      storeName: "", //店铺名称

      regionId: [], // 地区id
      addressForm: {
        // 退货地址
        salesConsigneeName: "", // 收货人姓名
        salesConsigneeMobile: "", // 收货人电话
        salesConsigneeAddressId: "", // 售后地址id,逗号分割
        salesConsigneeAddressPath: "", // 售后地址，逗号分割
        salesConsigneeDetail: "", // 详细地址
      },
      //库存预警form
      stockWarningForm: {
        stockWarning: 0, // 库存预警数量
      },
      //im form
      udeskForm: {
        merchantEuid: "",
      },
      stockWarningFormValidate: {
        stockWarning: [
          { required: true, type: 'number', message: "请输入库存预警数", trigger: "blur" },
        ],
      },
      udeskFormValidate: {
        merchantEuid: [
          { required: true, message: "请输入店铺坐席ID", trigger: "blur" },
        ],
      },
      afterFormValidate: {
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
      },
      form: {
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
      },

      // 表单验证规则
      formValidate: {
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
      },
      submitLoading: false, // 添加或编辑提交状态
      //发货地址
      addressGoods: {
        salesConsignorName: " ",
        salesConsignorMobile: " ",
        salesConsignorAddressId: " ",
        salesConsignorAddressPath: " ",
        salesConsignorDetail: " ",
      },

      addressGoodsValidate: {
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
      },
    };
  },
  methods: {
    // 回调地址
    callbackAddress(val) {
      if (val.type === 'select') {
        const paths = val.data.map(item => item.name).join(',')

        const ids = val.data.map(item => item.id).join(',')

        if (this.currentKey === 'storeAddress') {
          this.form.storeAddressPath = paths
          this.form.storeAddressIdPath = ids
          this.form.storeCenter = val.data[val.data.length - 1].center
        }
        if (this.currentKey === 'addressGoods') {
          this.addressGoods.salesConsignorAddressPath = paths
          this.addressGoods.salesConsignorAddressId = ids
        }
        if (this.currentKey === 'salesConsigneeAddressPath') {
          this.addressForm.salesConsigneeAddressPath = paths
          this.addressForm.salesConsigneeAddressId = ids
        }

      }
      else {
        if (this.currentKey === 'storeAddressstoreAddress') {
          this.form.storeAddressPath = val.data.addr;
          this.form.storeAddressIdPath = val.data.addrId;
          this.form.storeCenter = val.data.position.lng + "," + val.data.position.lat;
        }
        if (this.currentKey === 'addressGoods') {
          this.addressGoods.salesConsignorAddressPath = val.data.addr;
          this.addressGoods.salesConsignorAddressId = val.data.addrId;
        }
        if (this.currentKey === 'salesConsigneeAddressPath') {
          this.addressForm.salesConsigneeAddressPath = val.data.addr;
          this.addressForm.salesConsigneeAddressId = val.data.addrId;
        }
      }
    },
    // 修改地址
    handleChangeAddress(key) {
      this.currentKey = key
      this.$refs.map.open();
    },
    // 初始化数据
    init() {
      this.getShopInfo();
      this.getDeliverAddress()
    },


    setAddressGoods() {
      console.log(this.$refs.addressGoods)

      this.$refs.addressGoods.validate((valid) => {
        if (valid) {
          API_Shop.editDeliverAddress(this.addressGoods).then(res => {
            if (res.success) {
              this.$Message.success("修改成功")
            }
          })
        }
      });
    },
    //获取店铺信息
    getShopInfo() {
      this.loading = true;
      API_Shop.getShopInfo().then((res) => {
        this.loading = false;
        if (res.success) {
          this.form = res.result;

          this.storeName = res.result.storeName;
          this.form.storeCenter = res.result.storeCenter;
          Cookies.set("userInfoSeller", JSON.stringify(res.result));
          //库存预警数赋值
          this.$nextTick(() => {
            this.stockWarningForm.stockWarning = res.result.stockWarning;
          });
          if (res.result.merchantEuid) {
            //赋予坐席id
            this.udeskForm.merchantEuid = res.result.merchantEuid;
          }
        }
      });
    },
    pageShow(type) {
      this.form.pageShow = type
    },
    changeSelfPickFlag(item) {
      if (item) {
        this.form.selfPickFlag = item
      }
    },
    getDeliverAddress() {
      API_Shop.getDeliverAddress().then(res => {
        if (res.success) {
          if (res.result != '' && res.result != null) {
            this.addressGoods = res.result;
            this.regionGoods = res.result.salesConsignorAddressPath;
            this.regionIdS = res.result.salesConsignorAddressId;
          }
        }
      })
    },

    //重置
    handleReset() {
      this.$refs.form.resetFields();
    },
    //提交保存
    handleSubmit() {
      this.$refs.form.validate((valid) => {
        if (valid) {
          this.submitLoading = true;
          API_Shop.saveShopInfo(this.form).then((res) => {
            this.submitLoading = false;
            if (res.success) {
              this.$Message.success("修改成功");
              this.getShopInfo();
            }
          });
        }
      });
    },
    //修改库存预警数
    stockWarningHandleSubmit() {
      this.$refs.stockWarningForm.validate((valid) => {
        if (valid) {
          this.submitLoading = true;
          API_Shop.updateStockWarning(this.stockWarningForm).then((res) => {
            this.submitLoading = false;
            if (res.success) {
              this.$Message.success("修改成功");
              this.getShopInfo();
            }
          });
        }
      });
    },
    merchantSubmit() {
      this.$refs.udeskForm.validate((valid) => {
        if (valid) {
          this.submitLoading = true;
          API_Shop.updatEmerchantId(this.udeskForm).then((res) => {
            this.submitLoading = false;
            if (res.success) {
              this.$Message.success("修改成功");
              this.getShopInfo();
            }
          });
        }
      });
    },

    //tab切换
    handleClickType(v) {
      //退款
      if (v == "INFO") {
        this.getShopInfo();
      }
      //退货
      if (v == "REFUND_GOODS_ADDRESS") {
        this.getRefundGoodsAddress();
      }
    },
    //获取商家退货地址
    getRefundGoodsAddress() {
      API_Shop.getRefundGoodsAddress().then((res) => {
        if (res.result != null) {
          this.addressForm = res.result;
        }
      });
    },
    //提交保存
    afterHandleSubmit() {
      this.$refs.addressForm.validate((valid) => {
        if (valid) {
          this.submitLoading = true;
          API_Shop.saveRefundGoodsAddress(this.addressForm).then((res) => {
            this.submitLoading = false;
            if (res.success) {
              this.$Message.success("修改成功");
              this.getRefundGoodsAddress();
            }
          });
        }
      });
    },
  },
  mounted() {
    this.init();
  },
};
</script>
<style scoped lang="scss">
.desc {
  margin-left: 10px;
  color: #999;
}
</style>
