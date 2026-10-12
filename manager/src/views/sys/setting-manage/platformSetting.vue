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

<script setup>
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import { ElMessage } from "element-plus";
import { getParams, editParams } from "@/api/platform.js";
import uploadPicInput from "@/components/lili/upload-pic-input";
import { regular } from "@/utils";

defineOptions({ name: "setting-manage" });

const route = useRoute();

const tabName = ref("base");
const loading = ref(false);
const saveLoading = ref(false);
const base = ref({
  siteName: "",
  icp: "",
  logo: "",
  sellerLogo: "",
});
const point = ref({
  register: "",
  login: "",
  money: "",
});
const order = ref({
  autoCancel: "",
  autoReceive: "",
  autoComplete: "",
});
const goods = ref({
  goodsCheck: "OPEN",
  smallPictureWidth: "",
  smallPictureHeight: "",
  abbreviationPictureWidth: "",
  abbreviationPictureHeight: "",
  originalPictureWidth: "",
  originalPictureHeight: "",
});
// 历史遗留：wechat/qq/weibo/alipay 未在 data 中声明，直接挂 this，且模板中无对应表单项
let wechat;
let qq;
let weibo;
let alipay;
const baseValidate = {
  siteName: [{ required: true, message: "不能为空", trigger: "blur" }],
  icp: [{ required: true, message: "不能为空", trigger: "blur" }],
  logo: [{ required: true, message: "不能为空", trigger: "blur" }],
  sellerLogo: [{ required: true, message: "不能为空", trigger: "blur" }],
};
const pointValidate = {
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
};
const orderValidate = {
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
};
const goodsValidate = {
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
};

const baseForm = ref(null);
const pointForm = ref(null);
const orderForm = ref(null);
const goodsForm = ref(null);
// 历史遗留：以下表单 ref 在模板中不存在，对应 save 方法也从未被模板调用
const wechatForm = ref(null);
const qqForm = ref(null);
const alipayForm = ref(null);

function init() {
  initBase();
  initPoint();
  initOrder();
  initGoods();
  initWechat();
  initQQ();
  initWeibo();
  initAlipay();
}
function initBase() {
  loading.value = true;
  getParams("base").then((res) => {
    if (res.success) {
      loading.value = false;
      if (res.result) {
        base.value = res.result;
      }
    }
  });
}
function initPoint() {
  loading.value = true;
  getParams("point").then((res) => {
    if (res.success) {
      loading.value = false;
      if (res.result) {
        point.value = res.result;
      }
    }
  });
}
function initOrder() {
  loading.value = true;
  getParams("order").then((res) => {
    if (res.success) {
      loading.value = false;
      if (res.result) {
        order.value = res.result;
      }
    }
  });
}
function initGoods() {
  loading.value = true;
  getParams("goods").then((res) => {
    if (res.success) {
      loading.value = false;
      if (res.result) {
        goods.value = res.result;
      }
    }
  });
}
function initWeibo() {
  loading.value = true;
  getParams("weibo").then((res) => {
    if (res.success) {
      loading.value = false;
      if (res.result) {
        weibo = res.result;
      }
    }
  });
}
function initWechat() {
  loading.value = true;
  getParams("wechat").then((res) => {
    if (res.success) {
      loading.value = false;
      if (res.result) {
        wechat = res.result;
      }
    }
  });
}
function initQQ() {
  loading.value = true;
  getParams("qq").then((res) => {
    if (res.success) {
      loading.value = false;
      if (res.result) {
        qq = res.result;
      }
    }
  });
}
function initAlipay() {
  loading.value = true;
  getParams("alipay").then((res) => {
    if (res.success) {
      loading.value = false;
      if (res.result) {
        alipay = res.result;
      }
    }
  });
}
function saveBase() {
  baseForm.value.validate((valid) => {
    if (valid) {
      saveLoading.value = true;
      base.value.id = "base";
      editParams(base.value, "base").then((res) => {
        saveLoading.value = false;
        if (res.success) {
          ElMessage.success("保存成功");
        }
      });
    }
  });
}
function savePoint() {
  pointForm.value.validate((valid) => {
    if (valid) {
      saveLoading.value = true;
      point.value.id = "point";
      editParams(point.value, "point").then((res) => {
        saveLoading.value = false;
        if (res.success) {
          ElMessage.success("保存成功");
        }
      });
    }
  });
}
function saveOrder() {
  orderForm.value.validate((valid) => {
    if (valid) {
      saveLoading.value = true;
      order.value.id = "order";
      editParams(order.value, "order").then((res) => {
        saveLoading.value = false;
        if (res.success) {
          ElMessage.success("保存成功");
        }
      });
    }
  });
}
function saveGoods() {
  goodsForm.value.validate((valid) => {
    if (valid) {
      saveLoading.value = true;
      goods.value.id = "goods";
      editParams(goods.value, "goods").then((res) => {
        saveLoading.value = false;
        if (res.success) {
          ElMessage.success("保存成功");
        }
      });
    }
  });
}
function saveWechat() {
  wechatForm.value.validate((valid) => {
    if (valid) {
      saveLoading.value = true;
      wechat.id = "wechat";
      editParams(wechat, "wechat").then((res) => {
        saveLoading.value = false;
        if (res.success) {
          ElMessage.success("保存成功");
        }
      });
    }
  });
}
function saveQQ() {
  qqForm.value.validate((valid) => {
    if (valid) {
      saveLoading.value = true;
      qq.id = "qq";
      editParams(qq, "qq").then((res) => {
        saveLoading.value = false;
        if (res.success) {
          ElMessage.success("保存成功");
        }
      });
    }
  });
}
function saveWeibo() {
  // 历史遗留 bug：此处校验的是 wechatForm 而非 weiboForm，原样保留
  wechatForm.value.validate((valid) => {
    if (valid) {
      saveLoading.value = true;
      weibo.id = "weibo";
      editParams(weibo, "weibo").then((res) => {
        saveLoading.value = false;
        if (res.success) {
          ElMessage.success("保存成功");
        }
      });
    }
  });
}
function saveAlipay() {
  alipayForm.value.validate((valid) => {
    if (valid) {
      saveLoading.value = true;
      alipay.id = "alipay";
      editParams(alipay, "alipay").then((res) => {
        saveLoading.value = false;
        if (res.success) {
          ElMessage.success("保存成功");
        }
      });
    }
  });
}

onMounted(() => {
  const name = route.query.name;
  if (name) {
    tabName.value = name;
  }
  init();
});
</script>
