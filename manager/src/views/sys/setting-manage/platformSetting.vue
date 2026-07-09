<template>
  <div>
    <el-card>
      <el-tabs v-model="tabName" style="overflow: visible">
        <el-tab-pane label="基础设置" name="base">
          <div v-loading="loading" style="display:flex;position:relative">
            <el-form
              ref="baseForm"
              :model="base"
              label-width="140px"
              label-position="right"
              :rules="baseValidate"
            >
              <el-form-item label="网站名称" prop="siteName">
                <el-input v-model="base.siteName" placeholder="请输入网站名称" style="width: 350px" />
              </el-form-item>
              <el-form-item label="ICP证书号" prop="icp">
                <el-input v-model="base.icp" placeholder="请输入ICP证书号" style="width: 350px" />
              </el-form-item>
              <el-form-item label="Logo" prop="logo">
                <upload-pic-input v-model="base.logo" style="width: 350px" />
              </el-form-item>
              <el-form-item label="商家中心Logo" prop="sellerLogo">
                <upload-pic-input v-model="base.sellerLogo" style="width: 350px" />
              </el-form-item>
              <el-form-item>
                <el-button type="primary" style="width: 100px;margin-right:5px" :loading="saveLoading" @click="saveBase">
                  保存
                </el-button>
              </el-form-item>
            </el-form>
          </div>
        </el-tab-pane>
        <el-tab-pane label="积分设置" name="point">
          <div v-loading="loading" style="display:flex;position:relative">
            <el-form
              ref="pointForm"
              :model="point"
              label-width="140px"
              label-position="right"
              :rules="pointValidate"
            >
              <el-form-item label="注册" prop="register">
                <el-input v-model="point.register" placeholder="请输入注册赠送积分" style="width: 350px" />
              </el-form-item>
              <el-form-item label="登陆" prop="login">
                <el-input v-model="point.login" placeholder="请输入登陆赠送积分" style="width: 350px" />
              </el-form-item>
              <el-form-item label="消费一元" prop="money">
                <el-input v-model="point.money" placeholder="请输入积分" style="width: 350px" />
              </el-form-item>
              <el-form-item>
                <el-button type="primary" style="width: 100px;margin-right:5px" :loading="saveLoading" @click="savePoint">
                  保存
                </el-button>
              </el-form-item>
            </el-form>
          </div>
        </el-tab-pane>
        <el-tab-pane label="订单设置" name="order">
          <div v-loading="loading" style="display:flex;position:relative">
            <el-form
              ref="orderForm"
              :model="order"
              label-width="140px"
              label-position="right"
              :rules="orderValidate"
            >
              <el-form-item label="自动取消 分钟" prop="autoCancel">
                <el-input v-model="order.autoCancel" placeholder="请输入自动取消分钟" style="width: 350px" />
              </el-form-item>
              <el-form-item label="自动收货 天" prop="autoReceive">
                <el-input v-model="order.autoReceive" placeholder="请输入自动收货天数" style="width: 350px" />
              </el-form-item>
              <el-form-item label="自动收货 天" prop="autoComplete">
                <el-input v-model="order.autoComplete" placeholder="请输入自动完成天数" style="width: 350px" />
              </el-form-item>
              <el-form-item>
                <el-button type="primary" style="width: 100px;margin-right:5px" :loading="saveLoading" @click="saveOrder">
                  保存
                </el-button>
              </el-form-item>
            </el-form>
          </div>
        </el-tab-pane>
        <el-tab-pane label="商品设置" name="goods">
          <div v-loading="loading" style="display:flex;position:relative">
            <el-form
              ref="goodsForm"
              :model="goods"
              label-width="140px"
              label-position="right"
              :rules="goodsValidate"
            >
              <el-form-item label="是否开启商品审核" prop="goodsCheck">
                <el-radio-group v-model="goods.goodsCheck">
                  <el-radio-button value="OPEN">开启</el-radio-button>
                  <el-radio-button value="CLOSE">关闭</el-radio-button>
                </el-radio-group>
              </el-form-item>
              <el-form-item label="商品页面小图宽度" prop="smallPictureWidth">
                <el-input v-model="goods.smallPictureWidth" placeholder="商品页面小图宽度" style="width: 350px" />
              </el-form-item>
              <el-form-item label="商品页面小图高度" prop="smallPictureHeight">
                <el-input v-model="goods.smallPictureHeight" placeholder="商品页面小图高度" style="width: 350px" />
              </el-form-item>
              <el-form-item label="缩略图宽度" prop="abbreviationPictureWidth">
                <el-input v-model="goods.abbreviationPictureWidth" placeholder="缩略图宽度" style="width: 350px" />
              </el-form-item>
              <el-form-item label="缩略图高度" prop="abbreviationPictureHeight">
                <el-input v-model="goods.abbreviationPictureHeight" placeholder="缩略图高度" style="width: 350px" />
              </el-form-item>
              <el-form-item label="原图宽" prop="originalPictureWidth">
                 <el-input v-model="goods.originalPictureWidth" placeholder="原图宽" style="width: 350px" />
              </el-form-item>
              <el-form-item label="原图高" prop="originalPictureHeight">
                <el-input v-model="goods.originalPictureHeight" placeholder="原图高" style="width: 350px" />
              </el-form-item>
              <el-form-item>
                <el-button type="primary" style="width: 100px;margin-right:5px" :loading="saveLoading" @click="saveGoods">
                  保存
                </el-button>
              </el-form-item>
            </el-form>
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script>
import { ElMessage } from "element-plus";
import { getParams, editParams } from "@/api/platform.js";
import uploadPicInput from "@/components/lili/upload-pic-input";
import { regular } from "@/utils";

export default {
  name: "setting-manage",
  components: {
    uploadPicInput,
  },
  data() {
    return {
      tabName: "base",
      loading: false,
      saveLoading: false,
      base: {
        siteName: "",
        icp: "",
        logo: "",
        sellerLogo: "",
      },
      point: {
        register: "",
        login: "",
        money: "",
      },
      order: {
        autoCancel: "",
        autoReceive: "",
        autoComplete: "",
      },
      goods: {
        goodsCheck: "OPEN",
        smallPictureWidth: "",
        smallPictureHeight: "",
        abbreviationPictureWidth: "",
        abbreviationPictureHeight: "",
        originalPictureWidth: "",
        originalPictureHeight: "",
      },
      baseValidate: {
        siteName: [{ required: true, message: "不能为空", trigger: "blur" }],
        icp: [{ required: true, message: "不能为空", trigger: "blur" }],
        logo: [{ required: true, message: "不能为空", trigger: "blur" }],
        sellerLogo: [{ required: true, message: "不能为空", trigger: "blur" }],
      },
      pointValidate: {
        register: [
          {
            required: true,
            validator: (rule, value, callback) => {
              if (!regular.integer.test(value)) {
                callback(new Error("请输入正整数，且不为零！"));
              } else {
                callback();
              }
            },
            trigger: "blur",
          },
        ],
        login: [
          {
            required: true,
            validator: (rule, value, callback) => {
              if (!regular.integer.test(value)) {
                callback(new Error("请输入正整数，且不为零！"));
              } else {
                callback();
              }
            },
            trigger: "blur",
          },
        ],
        money: [
          {
            required: true,
            validator: (rule, value, callback) => {
              if (!regular.integer.test(value)) {
                callback(new Error("请输入正整数，且不为零！"));
              } else {
                callback();
              }
            },
            trigger: "blur",
          },
        ],
      },
      orderValidate: {
        autoCancel: [
          {
            required: true,
            validator: (rule, value, callback) => {
              if (!regular.integer.test(value)) {
                callback(new Error("请输入正整数，且不为零！"));
              } else {
                callback();
              }
            },
            trigger: "blur",
          },
        ],
        autoReceive: [
          {
            required: true,
            validator: (rule, value, callback) => {
              if (!regular.integer.test(value)) {
                callback(new Error("请输入正整数，且不为零！"));
              } else {
                callback();
              }
            },
            trigger: "blur",
          },
        ],
        autoComplete: [
          {
            required: true,
            validator: (rule, value, callback) => {
              if (!regular.integer.test(value)) {
                callback(new Error("请输入正整数，且不为零！"));
              } else {
                callback();
              }
            },
            trigger: "blur",
          },
        ],
      },
      goodsValidate: {
        smallPictureWidth: [
          {
            required: true,
            validator: (rule, value, callback) => {
              if (!regular.integer.test(value)) {
                callback(new Error("请输入正整数，且不为零！"));
              } else {
                callback();
              }
            },
            trigger: "blur",
          },
        ],
        smallPictureHeight: [
          {
            required: true,
            validator: (rule, value, callback) => {
              if (!regular.integer.test(value)) {
                callback(new Error("请输入正整数，且不为零！"));
              } else {
                callback();
              }
            },
            trigger: "blur",
          },
        ],
        abbreviationPictureWidth: [
          {
            required: true,
            validator: (rule, value, callback) => {
              if (!regular.integer.test(value)) {
                callback(new Error("请输入正整数，且不为零！"));
              } else {
                callback();
              }
            },
            trigger: "blur",
          },
        ],
        abbreviationPictureHeight: [
          {
            required: true,
            validator: (rule, value, callback) => {
              if (!regular.integer.test(value)) {
                callback(new Error("请输入正整数，且不为零！"));
              } else {
                callback();
              }
            },
            trigger: "blur",
          },
        ],
        originalPictureWidth: [
          {
            required: true,
            validator: (rule, value, callback) => {
              if (!regular.integer.test(value)) {
                callback(new Error("请输入正整数，且不为零！"));
              } else {
                callback();
              }
            },
            trigger: "blur",
          },
        ],
        originalPictureHeight: [
          {
            required: true,
            validator: (rule, value, callback) => {
              if (!regular.integer.test(value)) {
                callback(new Error("请输入正整数，且不为零！"));
              } else {
                callback();
              }
            },
            trigger: "blur",
          },
        ],
      },
    };
  },
  methods: {
    init() {
      this.initBase();
      this.initPoint();
      this.initOrder();
      this.initGoods();
      this.initWechat();
      this.initQQ();
      this.initWeibo();
      this.initAlipay();
    },
    initBase() {
      this.loading = true;
      getParams("base").then((res) => {
        if (res.success) {
          this.loading = false;
          if (res.result) {
            this.base = res.result;
          }
        }
      });
    },
    initPoint() {
      this.loading = true;
      getParams("point").then((res) => {
        if (res.success) {
          this.loading = false;
          if (res.result) {
            this.point = res.result;
          }
        }
      });
    },
    initOrder() {
      this.loading = true;
      getParams("order").then((res) => {
        if (res.success) {
          this.loading = false;
          if (res.result) {
            this.order = res.result;
          }
        }
      });
    },
    initGoods() {
      this.loading = true;
      getParams("goods").then((res) => {
        if (res.success) {
          this.loading = false;
          if (res.result) {
            this.goods = res.result;
          }
        }
      });
    },
    initWeibo() {
      this.loading = true;
      getParams("weibo").then((res) => {
        if (res.success) {
          this.loading = false;
          if (res.result) {
            this.weibo = res.result;
          }
        }
      });
    },
    initWechat() {
      this.loading = true;
      getParams("wechat").then((res) => {
        if (res.success) {
          this.loading = false;
          if (res.result) {
            this.wechat = res.result;
          }
        }
      });
    },
    initQQ() {
      this.loading = true;
      getParams("qq").then((res) => {
        if (res.success) {
          this.loading = false;
          if (res.result) {
            this.qq = res.result;
          }
        }
      });
    },
    initAlipay() {
      this.loading = true;
      getParams("alipay").then((res) => {
        if (res.success) {
          this.loading = false;
          if (res.result) {
            this.alipay = res.result;
          }
        }
      });
    },
    saveBase() {
      this.$refs.baseForm.validate((valid) => {
        if (valid) {
          this.saveLoading = true;
          this.base.id = "base";
          editParams(this.base, "base").then((res) => {
            this.saveLoading = false;
            if (res.success) {
              ElMessage.success("保存成功");
            }
          });
        }
      });
    },
    savePoint() {
      this.$refs.pointForm.validate((valid) => {
        if (valid) {
          this.saveLoading = true;
          this.point.id = "point";
          editParams(this.point, "point").then((res) => {
            this.saveLoading = false;
            if (res.success) {
              ElMessage.success("保存成功");
            }
          });
        }
      });
    },
    saveOrder() {
      this.$refs.orderForm.validate((valid) => {
        if (valid) {
          this.saveLoading = true;
          this.order.id = "order";
          editParams(this.order, "order").then((res) => {
            this.saveLoading = false;
            if (res.success) {
              ElMessage.success("保存成功");
            }
          });
        }
      });
    },
    saveGoods() {
      this.$refs.goodsForm.validate((valid) => {
        if (valid) {
          this.saveLoading = true;
          this.goods.id = "goods";
          editParams(this.goods, "goods").then((res) => {
            this.saveLoading = false;
            if (res.success) {
              ElMessage.success("保存成功");
            }
          });
        }
      });
    },
    saveWechat() {
      this.$refs.wechatForm.validate((valid) => {
        if (valid) {
          this.saveLoading = true;
          this.wechat.id = "wechat";
          editParams(this.wechat, "wechat").then((res) => {
            this.saveLoading = false;
            if (res.success) {
              ElMessage.success("保存成功");
            }
          });
        }
      });
    },
    saveQQ() {
      this.$refs.qqForm.validate((valid) => {
        if (valid) {
          this.saveLoading = true;
          this.qq.id = "qq";
          editParams(this.qq, "qq").then((res) => {
            this.saveLoading = false;
            if (res.success) {
              ElMessage.success("保存成功");
            }
          });
        }
      });
    },
    saveWeibo() {
      this.$refs.wechatForm.validate((valid) => {
        if (valid) {
          this.saveLoading = true;
          this.weibo.id = "weibo";
          editParams(this.weibo, "weibo").then((res) => {
            this.saveLoading = false;
            if (res.success) {
              ElMessage.success("保存成功");
            }
          });
        }
      });
    },
    saveAlipay() {
      this.$refs.alipayForm.validate((valid) => {
        if (valid) {
          this.saveLoading = true;
          this.alipay.id = "alipay";
          editParams(this.alipay, "alipay").then((res) => {
            this.saveLoading = false;
            if (res.success) {
              ElMessage.success("保存成功");
            }
          });
        }
      });
    },
  },
  mounted() {
    const name = this.$route.query.name;
    if (name) {
      this.tabName = name;
    }
    this.init();
  },
};
</script>
