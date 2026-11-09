<template>
  <div class="complain-detail">
    <UserCenterLayout>
      <div class="detail-head">
        <el-tag :type="statusTagType" effect="dark">{{ statusText }}</el-tag>
        <span class="create-time">创建时间：{{ detail.createTime || "-" }}</span>
      </div>

      <section class="panel">
        <div class="panel-title">我的申诉信息</div>
        <div class="info-row">
          <span class="info-label">投诉商品</span>
          <div class="info-value">
            <button
              v-if="detail.goodsId"
              type="button"
              class="goods-info"
              @click="goGoodsDetail(detail.skuId, detail.goodsId)"
            >
              <img :src="detail.goodsImage" loading="lazy" decoding="async" alt="" />
              <span class="goods-name">{{ detail.goodsName }}</span>
            </button>
            <span v-else class="empty-text">暂无</span>
          </div>
        </div>
        <div class="info-row">
          <span class="info-label">投诉主题</span>
          <span class="info-value">{{ detail.complainTopic || "暂无" }}</span>
        </div>
        <div class="info-row">
          <span class="info-label">投诉内容</span>
          <span class="info-value">{{ detail.content || "暂无" }}</span>
        </div>
        <div class="info-row">
          <span class="info-label">补充内容</span>
          <div class="info-value">
            <div v-if="images.length" class="img-list">
              <div
                v-for="(img, index) in images"
                :key="index"
                class="demo-upload-list"
                @click="handleView(img)"
              >
                <img :src="img" loading="lazy" decoding="async" />
                <div class="demo-upload-list-cover">
                  <el-icon><View /></el-icon>
                </div>
              </div>
            </div>
            <span v-else class="empty-text">暂无</span>
          </div>
        </div>
      </section>

      <section class="panel">
        <div class="panel-title">商家申诉信息</div>
        <div class="info-row">
          <span class="info-label">申诉时间</span>
          <span class="info-value">{{ detail.appealTime || "暂无" }}</span>
        </div>
        <div class="info-row">
          <span class="info-label">申诉内容</span>
          <span class="info-value">{{ detail.appealContent || "暂无" }}</span>
        </div>
        <div class="info-row">
          <span class="info-label">申诉凭证</span>
          <div class="info-value">
            <div v-if="appealImages.length" class="img-list">
              <div
                v-for="(img, index) in appealImages"
                :key="index"
                class="demo-upload-list"
                @click="handleView(img)"
              >
                <img :src="img" loading="lazy" decoding="async" />
                <div class="demo-upload-list-cover">
                  <el-icon><View /></el-icon>
                </div>
              </div>
            </div>
            <span v-else class="empty-text">暂无</span>
          </div>
        </div>
      </section>

      <section class="panel">
        <div class="panel-title">平台仲裁</div>
        <div class="info-row">
          <span class="info-label">仲裁意见</span>
          <span class="info-value">{{ detail.arbitrationResult || "暂无" }}</span>
        </div>
      </section>

      <section class="panel">
        <div class="panel-title">对话详情</div>
        <div v-if="communications.length" class="chat-list">
          <div
            v-for="(item, i) in communications"
            :key="i"
            class="chat-item"
            :class="{
              'is-buyer': item.owner === 'BUYER',
              'is-platform': item.owner === 'PLATFORM',
            }"
          >
            <div class="chat-meta">{{ ownerName(item.owner) }} · {{ item.createTime }}</div>
            <div class="chat-bubble">{{ item.content }}</div>
          </div>
        </div>
        <div v-else class="empty-text">暂无对话</div>

        <div v-if="detail.complainStatus !== 'COMPLETE'" class="reply-box">
          <el-input
            v-model="params.content"
            type="textarea"
            :rows="3"
            maxlength="200"
            show-word-limit
            placeholder="请输入回复内容"
          />
          <el-button
            type="primary"
            :loading="submitLoading"
            class="reply-btn"
            @click="handleSubmit"
          >
            回复
          </el-button>
        </div>
      </section>

      <el-dialog title="图片预览" v-model="visible">
        <img :src="previewImage" loading="lazy" decoding="async" v-if="visible" style="width: 100%" />
      </el-dialog>
    </UserCenterLayout>
  </div>
</template>

<script setup>
import { catchHandledRequestError } from "@/utils/requestError";
import { computed, onMounted, reactive, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { Message } from "@/utils/message";
import { View } from "@element-plus/icons-vue";
import { getComplainDetail } from "@/api/member.js";
import { communication } from "@/api/order";

const route = useRoute();
const router = useRouter();

const detail = ref({}); // 投诉详情
const visible = ref(false); // 图片预览
const previewImage = ref(""); // 预览图片地址
const submitLoading = ref(false); // 回复消息loading
// 状态
const statusLabel = {
  NO_APPLY: "未申请",
  APPLYING: "申请中",
  COMPLETE: "已完成",
  EXPIRED: "已失效",
  CANCEL: "已取消",
  NEW: "待审核",
};
// 商家回复内容
const params = reactive({
  content: "",
  complainId: "",
});

const statusText = computed(
  () => statusLabel[detail.value.complainStatus] || detail.value.complainStatus || ""
);
const statusTagType = computed(() => {
  const map = {
    COMPLETE: "success",
    APPLYING: "warning",
    NEW: "warning",
    CANCEL: "info",
    EXPIRED: "info",
    NO_APPLY: "info",
  };
  return map[detail.value.complainStatus] || "info";
});
const images = computed(() =>
  detail.value.images ? detail.value.images.split(",").filter(Boolean) : []
);
const appealImages = computed(() =>
  detail.value.appealImages ? detail.value.appealImages.split(",").filter(Boolean) : []
);
const communications = computed(() =>
  Array.isArray(detail.value.orderComplaintCommunications)
    ? detail.value.orderComplaintCommunications
    : []
);

function ownerName(owner) {
  return owner === "PLATFORM" ? "平台" : owner === "BUYER" ? "买家" : "卖家";
}

function getDetail() {
  // 获取投诉详情
  getComplainDetail(route.query.id).then((res) => {
    if (res.success) detail.value = res.result;
  });
}
function goGoodsDetail(skuId, goodsId) {
  // 跳转商品详情
  let routerUrl = router.resolve({
    path: "/goodsDetail",
    query: { skuId, goodsId },
  });
  window.open(routerUrl.href, "_blank");
}
function handleView(name) {
  // 预览图片
  previewImage.value = name;
  visible.value = true;
}
// 回复消息
function handleSubmit() {
  if (params.content === "") {
    Message.error("请填写对话内容");
    return;
  }
  submitLoading.value = true;
  params.complainId = route.query.id;
  communication(params).then((res) => {
    submitLoading.value = false;
    if (res.success) {
      Message.success("对话成功");
      params.content = "";
      getDetail();
    }
  }).catch(catchHandledRequestError).finally(() => {
    submitLoading.value = false;
  });
}

onMounted(() => {
  getDetail();
});
</script>

<style lang="scss" scoped>
.detail-head {
  display: flex;
  align-items: center;
  gap: 12px;
  padding-bottom: 4px;
}

.create-time {
  color: #999;
  font-size: 14px;
}

.panel {
  margin-top: 16px;
  border: 1px solid #eee;
  border-radius: 8px;
  background: #fff;
  padding: 16px 20px;
}

.panel-title {
  color: #333;
  font-size: 16px;
  font-weight: 600;
  line-height: 24px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f5f5f5;
}

.info-row {
  display: flex;
  gap: 16px;
  padding: 12px 0;
  border-bottom: 1px solid #f5f5f5;

  &:last-child {
    border-bottom: none;
    padding-bottom: 4px;
  }
}

.info-label {
  flex: 0 0 80px;
  color: #999;
  font-size: 14px;
  line-height: 22px;
}

.info-value {
  flex: 1;
  min-width: 0;
  color: #333;
  font-size: 14px;
  line-height: 22px;
  word-break: break-all;
}

.empty-text {
  color: #999;
  font-size: 14px;
}

.goods-info {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  padding: 0;
  border: none;
  background: none;
  cursor: pointer;

  img {
    width: 56px;
    height: 56px;
    border-radius: 6px;
    background: #f5f5f5;
    object-fit: cover;
  }

  .goods-name {
    color: #333;
    font-size: 14px;
  }

  &:hover .goods-name {
    color: $theme_color;
  }
}

.img-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.demo-upload-list {
  width: 100px;
  height: 100px;
  border-radius: 6px;
  overflow: hidden;
  background: #f5f5f5;
  position: relative;
  box-shadow: 0 1px 1px rgba(0, 0, 0, 0.2);
  cursor: pointer;
}

.demo-upload-list img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.demo-upload-list-cover {
  display: none;
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.6);
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 24px;
}

.demo-upload-list:hover .demo-upload-list-cover {
  display: flex;
}

.chat-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px 0 4px;
}

.chat-item {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  max-width: 80%;

  &.is-buyer {
    align-self: flex-end;
    align-items: flex-end;

    .chat-bubble {
      background: $theme_color;
      color: #fff;
    }
  }

  &.is-platform .chat-bubble {
    background: #fdf3e4;
    color: #8a5a00;
  }
}

.chat-meta {
  margin-bottom: 4px;
  color: #999;
  font-size: 12px;
  line-height: 18px;
}

.chat-bubble {
  padding: 8px 12px;
  border-radius: 8px;
  background: #f5f5f5;
  color: #333;
  font-size: 14px;
  line-height: 22px;
  word-break: break-all;
}

.reply-box {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #f5f5f5;
}

.reply-btn {
  margin-top: 10px;
}
</style>
