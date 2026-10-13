<template>
  <div class="search" v-loading="loading">
    <el-card>
      <div class="main-content" v-if="complaintInfo.id">
        <div class="div-flow-left">
          <div class="div-form-default">
            <h3>投诉信息</h3>
            <dl>
              <dt>投诉商品</dt>
              <dd>
                <div>
                  <img :src="complaintInfo.goodsImage" style="height: 60px" alt="" />
                </div>
                <a class="link-text">{{ complaintInfo.goodsName }}</a><br />
                <span>{{ complaintInfo.num }}(数量)</span>
              </dd>
            </dl>
            <dl>
              <dt>投诉状态</dt>
              <dd>{{ complainStatusText(complaintInfo.complainStatus) }}</dd>
            </dl>
            <dl>
              <dt>投诉时间</dt>
              <dd>{{ complaintInfo.createTime }}</dd>
            </dl>
            <dl>
              <dt>投诉主题</dt>
              <dd>{{ complaintInfo.complainTopic }}</dd>
            </dl>
            <dl>
              <dt>投诉内容</dt>
              <dd>{{ complaintInfo.content }}</dd>
            </dl>
            <dl>
              <dt>投诉凭证</dt>
              <dd v-if="!images.length">暂无投诉凭证</dd>
              <dd v-else>
                <div class="div-img" v-for="(item, index) in images" :key="index">
                  <img class="complain-img" :src="item" alt="" />
                </div>
              </dd>
            </dl>
          </div>

          <div class="div-form-default" v-if="complaintInfo.complainStatus === 'WAIT_APPEAL'">
            <h3>商家申诉</h3>
            <dl>
              <dt>申诉内容</dt>
              <dd>
                <el-input
                  v-model="appeal.appealContent"
                  type="textarea"
                  maxlength="200"
                  :rows="4"
                  clearable
                  style="width: 260px"
                />
              </dd>
            </dl>
            <dl>
              <dt>申诉凭证</dt>
              <dd>
                <upload-pic-thumb v-model="appeal.appealImages" :limit="5" />
              </dd>
            </dl>
            <dl>
              <dt></dt>
              <dd>
                <el-button type="primary" :loading="submitLoading" @click="appealSubmit">提交申诉</el-button>
              </dd>
            </dl>
          </div>

          <div class="div-form-default" v-else-if="complaintInfo.appealContent">
            <h3>商家申诉信息</h3>
            <dl>
              <dt>申诉时间</dt>
              <dd>{{ complaintInfo.appealTime }}</dd>
            </dl>
            <dl>
              <dt>申诉内容</dt>
              <dd>{{ complaintInfo.appealContent }}</dd>
            </dl>
            <dl>
              <dt>申诉凭证</dt>
              <dd v-if="!appealImages.length">暂无申诉凭证</dd>
              <dd v-else>
                <div class="div-img" v-for="(item, index) in appealImages" :key="index">
                  <img class="complain-img" :src="item" alt="" />
                </div>
              </dd>
            </dl>
          </div>

          <div class="div-form-default">
            <h3>对话详情</h3>
            <dl>
              <dt>对话记录</dt>
              <dd>
                <div class="div-content">
                  <p
                    v-for="(item, index) in complaintInfo.orderComplaintCommunications || []"
                    :key="index"
                  >
                    <span v-if="item.owner == 'STORE'">商家[{{ item.createTime }}]</span>
                    <span v-else-if="item.owner == 'BUYER'">买家[{{ item.createTime }}]</span>
                    <span v-else-if="item.owner == 'PLATFORM'">平台[{{ item.createTime }}]</span>
                    {{ item.content }}
                  </p>
                </div>
              </dd>
            </dl>
            <dl v-if="complaintInfo.complainStatus != 'COMPLETE'">
              <dt>发送对话</dt>
              <dd>
                <el-input
                  v-model="params.content"
                  type="textarea"
                  maxlength="200"
                  :rows="4"
                  clearable
                  style="width: 260px"
                />
              </dd>
            </dl>
            <dl v-if="complaintInfo.complainStatus != 'COMPLETE'">
              <dt></dt>
              <dd>
                <div style="text-align: left; margin-top: 10px">
                  <el-button type="primary" :loading="submitLoading" @click="handleSubmit">
                    回复
                  </el-button>
                  <el-button type="primary" :loading="submitLoading" @click="returnDataList" style="margin-left: 5px">
                    返回列表
                  </el-button>
                </div>
              </dd>
            </dl>
          </div>

          <div class="div-form-default" v-if="complaintInfo.complainStatus == 'COMPLETE'">
            <h3>仲裁结果</h3>
            <dl>
              <dt>仲裁意见</dt>
              <dd>{{ complaintInfo.arbitrationResult }}</dd>
            </dl>
          </div>
        </div>

        <div class="div-flow-center"></div>

        <div class="div-flow-right">
          <div class="div-form-default">
            <h3>订单相关信息</h3>
            <dl>
              <dt>订单编号</dt>
              <dd>{{ complaintInfo.orderSn }}</dd>
            </dl>
            <dl>
              <dt>下单时间</dt>
              <dd>{{ complaintInfo.orderTime || complaintInfo.createTime }}</dd>
            </dl>
            <dl>
              <dt>订单金额</dt>
              <dd>
                <span class="price-text">{{ $filters.unitPrice(complaintInfo.orderPrice, "￥") }}</span>
              </dd>
            </dl>
          </div>
          <div class="div-form-default">
            <h3>收件人信息</h3>
            <dl>
              <dt>收货人</dt>
              <dd>{{ complaintInfo.consigneeName }}</dd>
            </dl>
            <dl>
              <dt>收货地址</dt>
              <dd>{{ complaintInfo.consigneeAddressPath }}</dd>
            </dl>
            <dl>
              <dt>收货人手机</dt>
              <dd>{{ complaintInfo.consigneeMobile }}</dd>
            </dl>
          </div>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import * as API_Order from "@/api/order";
import { Message } from "@/utils/message";
import uploadPicThumb from "@/views/my-components/lili/upload-pic-thumb";

defineOptions({ name: "orderComplaintDetail" });

const route = useRoute();
const router = useRouter();

const emptyComplaint = () => ({
  id: "",
  orderComplaintCommunications: [],
});

const loading = ref(false);
const id = ref("");
const complaintInfo = ref(emptyComplaint());
const images = ref([]);
const appealImages = ref([]);
const submitLoading = ref(false);
const params = reactive({
  content: "",
  complainId: "",
});
const appeal = reactive({
  orderComplaintId: "",
  appealContent: "",
  appealImages: [],
});

onMounted(() => {
  id.value = route.query.id;
  getDetail();
});

watch(
  () => route.query.id,
  (val) => {
    id.value = val;
    getDetail();
  }
);

function complainStatusText(v) {
  const map = {
    NEW: "新投诉",
    CANCEL: "已撤销",
    WAIT_APPEAL: "待申诉",
    COMMUNICATION: "对话中",
    WAIT_ARBITRATION: "等待仲裁",
    COMPLETE: "已完成",
  };
  return map[v] || v || "-";
}
function getDetail() {
  if (!id.value) return;
  loading.value = true;
  API_Order.getOrderComplainDetail(id.value)
    .then((res) => {
      loading.value = false;
      if (res.success) {
        complaintInfo.value = res.result || emptyComplaint();
        images.value = (res.result.images || "")
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);
        appealImages.value = (res.result.appealImages || "")
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);
      }
    })
    .catch(() => {
      loading.value = false;
    });
}
function returnDataList() {
  router.push({ name: "orderComplaint" });
}
function appealSubmit() {
  if (!appeal.appealContent) {
    Message.error("请填写申诉内容");
    return;
  }
  submitLoading.value = true;
  const appealImages = Array.isArray(appeal.appealImages)
    ? appeal.appealImages
    : [];
  API_Order.appeal({
    orderComplaintId: id.value,
    appealContent: appeal.appealContent,
    appealImages,
  })
    .then((res) => {
      submitLoading.value = false;
      if (res.success) {
        Message.success("申诉成功");
        appeal.appealContent = "";
        appeal.appealImages = [];
        getDetail();
      }
    })
    .catch(() => {
      submitLoading.value = false;
    });
}
function handleSubmit() {
  if (!params.content) {
    Message.error("请填写对话内容");
    return;
  }
  submitLoading.value = true;
  params.complainId = id.value;
  API_Order.addOrderCommunication(params)
    .then((res) => {
      submitLoading.value = false;
      if (res.success) {
        Message.success("对话成功");
        params.content = "";
        getDetail();
      }
    })
    .catch(() => {
      submitLoading.value = false;
    });
}
</script>

<style lang="scss" scoped>
.main-content {
  min-height: 600px;
  padding: 10px;
}

.div-flow-left {
  width: 49%;
  letter-spacing: normal;
  display: inline-block;
  border-right: solid #f5f5f5 1px;

  .div-form-default {
    width: 97%;

    h3 {
      font-weight: 600;
      line-height: 22px;
      background-color: #f5f5f5;
      padding: 6px 0 6px 12px;
      border-bottom: solid 1px #e7e7e7;
    }

    dl {
      font-size: 0;
      line-height: 30px;
      clear: both;
      padding: 0;
      margin: 0;
      border-bottom: dotted 1px #e6e6e6;
      overflow: hidden;

      dt {
        display: inline-block;
        width: 13%;
        vertical-align: top;
        text-align: right;
        padding: 15px 1% 15px 0;
        margin: 0;
        font-size: 12px;
      }

      dd {
        display: inline-block;
        width: 84%;
        padding: 15px 0 15px 1%;
        margin: 0;
        border-left: 1px solid #f0f0f0;
        font-size: 12px;
      }
    }
  }
}

.div-img {
  width: 130px;
  height: 130px;
  text-align: center;
  float: left;
}

.div-flow-center {
  width: 2%;
  display: inline-block;
}

.div-flow-right {
  width: 49%;
  vertical-align: top;
  word-spacing: normal;
  display: inline-block;

  .div-form-default {
    width: 97%;

    h3 {
      font-weight: 600;
      line-height: 22px;
      background-color: #f5f5f5;
      padding: 6px 0 6px 12px;
      border-bottom: solid 1px #e7e7e7;
    }

    dl {
      font-size: 0;
      line-height: 30px;
      clear: both;
      padding: 0;
      margin: 0;
      border-bottom: dotted 1px #e6e6e6;
      overflow: hidden;

      dt {
        display: inline-block;
        width: 13%;
        vertical-align: top;
        text-align: right;
        padding: 15px 1% 15px 0;
        margin: 0;
        font-size: 12px;
      }

      dd {
        display: inline-block;
        width: 84%;
        padding: 15px 0 15px 1%;
        margin: 0;
        border-left: 1px solid #f0f0f0;
        font-size: 12px;
      }
    }
  }
}

.complain-img {
  width: 120px;
  height: 120px;
  text-align: center;
}

.div-content {
  overflow-y: auto;
  overflow-x: auto;
  height: 150px;
  scrollbar-width: auto;

  &::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  &::-webkit-scrollbar-thumb {
    border-radius: 4px;
    background-color: rgba(50, 50, 50, 0.45);
  }

  &::-webkit-scrollbar-track {
    border-radius: 4px;
    background-color: rgba(50, 50, 50, 0.12);
  }
}

.link-text {
  color: #409eff;
  cursor: pointer;
}

.price-text {
  color: #ff5c58;
  font-weight: 600;
}
</style>
