<template>
  <div class="search">
    <el-card>
      <el-form
        ref="searchFormRef"
        :model="searchForm"
        inline
        label-width="70px"
        class="search-form"
        @keyup.enter="handleSearch"
      >
        <el-form-item label="会员名称" prop="memberName">
          <el-input v-model="searchForm.memberName" clearable placeholder="请输入会员名称" style="width: 200px" />
        </el-form-item>
        <el-form-item label="商品名称" prop="goodsName">
          <el-input v-model="searchForm.goodsName" clearable placeholder="请输入商品名" style="width: 200px" />
        </el-form-item>
        <el-form-item label="回复状态" prop="replyStatus">
          <el-select v-model="searchForm.replyStatus" placeholder="请选择" clearable style="width: 140px">
            <el-option label="已回复" :value="true" />
            <el-option label="未回复" :value="false" />
          </el-select>
        </el-form-item>
        <el-form-item label="有无图片" prop="haveImage">
          <el-select v-model="searchForm.haveImage" placeholder="请选择" clearable style="width: 140px">
            <el-option label="有图" value="1" />
            <el-option label="无图" value="0" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="searchForm.status" placeholder="请选择" clearable style="width: 140px">
            <el-option label="展示" value="OPEN" />
            <el-option label="隐藏" value="CLOSE" />
          </el-select>
        </el-form-item>
        <el-form-item label="评论日期">
          <el-date-picker
            v-model="selectDate"
            type="datetimerange"
            value-format="YYYY-MM-DD HH:mm:ss"
            clearable
            start-placeholder="开始时间"
            end-placeholder="结束时间"
            style="width: 360px"
            @change="selectDateRange"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" class="search-btn" @click="handleSearch">搜索</el-button>
          <el-button class="search-btn" @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card>
      <div class="comment-tab">
        <el-tabs v-model="currentGrade" @tab-click="onGradeTabClick">
          <el-tab-pane v-for="item in gradeTabs" :key="item.title" :label="item.title" :name="item.value" />
        </el-tabs>
      </div>
      <el-table v-loading="loading" border :data="data" ref="tableRef" class="mt_10" style="width: 100%">
        <el-table-column label="会员" min-width="160">
          <template #default="{ row }">
            <div class="member-cell">
              <el-avatar :size="32" :src="row.memberProfile" />
              <span class="cell-name" :title="row.memberName">{{ row.memberName }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="商品" min-width="200">
          <template #default="{ row }">
            <div class="goods-cell">
              <el-image
                v-if="row.goodsImage"
                :src="row.goodsImage"
                :preview-src-list="[row.goodsImage]"
                preview-teleported
                fit="cover"
                style="width: 40px; height: 40px; flex-shrink: 0; border-radius: 4px"
              />
              <span class="cell-name" :title="row.goodsName">{{ row.goodsName }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="content" label="评价内容" min-width="240" show-overflow-tooltip />
        <el-table-column label="评价" width="200">
          <template #default="{ row }">
            <div class="grade-cell">
              <el-rate :model-value="avgScore(row)" disabled allow-half size="small" />
              <el-tag v-if="row.grade === 'GOOD'" type="success" size="small">好评</el-tag>
              <el-tag v-else-if="row.grade === 'MODERATE'" type="warning" size="small">中评</el-tag>
              <el-tag v-else type="danger" size="small">差评</el-tag>
              <el-tag v-if="row.top" type="primary" size="small" effect="plain">置顶</el-tag>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="90">
          <template #default="{ row }">
            <el-tag v-if="row.status === 'OPEN'" type="success">展示</el-tag>
            <el-tag v-else type="danger">隐藏</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="回复状态" width="100">
          <template #default="{ row }">
            <el-tag v-if="row.replyStatus" type="success">已回复</el-tag>
            <el-tag v-else type="primary">未回复</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建日期" width="170" />
        <el-table-column label="操作" align="right" fixed="right" width="100">
          <template #default="{ row }">
            <a class="link-text" @click="detail(row)">{{ row.replyStatus ? "查看" : "回复" }}</a>
          </template>
        </el-table-column>
      </el-table>

      <div class="mt_10" style="display: flex; justify-content: flex-end">
        <el-pagination
          v-model:current-page="searchForm.pageNumber"
          v-model:page-size="searchForm.pageSize"
          :page-sizes="[10, 20, 50]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          size="small"
          @current-change="changePage"
          @size-change="changePageSize"
        />
      </div>
    </el-card>

    <el-drawer
      v-model="modalVisible"
      title="评价详情"
      size="600px"
      append-to-body
      :close-on-click-modal="false"
    >
      <div v-loading="detailLoading" class="comment-detail">
        <template v-if="detailInfo.id">
          <div class="detail-header">
            <el-avatar :size="44" :src="detailInfo.memberProfile" />
            <div class="detail-header-info">
              <div class="detail-member-line">
                <span class="detail-member-name">{{ detailInfo.memberName }}</span>
                <el-tag v-if="detailInfo.grade === 'GOOD'" type="success" size="small" effect="light">好评</el-tag>
                <el-tag v-else-if="detailInfo.grade === 'MODERATE'" type="warning" size="small" effect="light">
                  中评
                </el-tag>
                <el-tag v-else type="danger" size="small" effect="light">差评</el-tag>
              </div>
            </div>
            <span class="detail-time">{{ detailInfo.createTime }}</span>
          </div>

          <p class="detail-content" :class="{ 'is-empty': !content }">
            {{ content || "买家未填写评价内容" }}
          </p>
          <div v-if="image.length" class="image-list">
            <el-image
              v-for="(img, index) in image"
              :key="index"
              :src="img"
              :preview-src-list="image"
              :initial-index="index"
              preview-teleported
              fit="cover"
              class="detail-image"
            />
          </div>

          <div class="detail-meta">
            <div class="meta-scores">
              <span class="score-item">
                描述相符
                <el-rate :model-value="detailInfo.descriptionScore" disabled size="small" />
              </span>
              <span class="score-item">
                服务态度
                <el-rate :model-value="detailInfo.serviceScore" disabled size="small" />
              </span>
              <span class="score-item">
                物流服务
                <el-rate :model-value="detailInfo.deliveryScore" disabled size="small" />
              </span>
            </div>
            <div class="meta-goods">
              <el-image
                v-if="detailInfo.goodsImage"
                :src="detailInfo.goodsImage"
                :preview-src-list="[detailInfo.goodsImage]"
                preview-teleported
                fit="cover"
                class="meta-goods-image"
              />
              <span class="meta-goods-name" :title="detailInfo.goodsName">{{ detailInfo.goodsName }}</span>
              <span class="meta-order-no">订单号：{{ detailInfo.orderNo || "-" }}</span>
            </div>
          </div>

          <div class="reply-section">
            <div class="reply-title">商家回复</div>
            <div v-if="replyStatus" class="reply-bubble">
              <p class="reply-text">{{ form.reply || "-" }}</p>
              <div v-if="form.replyImage.length" class="image-list">
                <el-image
                  v-for="(img, index) in form.replyImage"
                  :key="index"
                  :src="img"
                  :preview-src-list="form.replyImage"
                  :initial-index="index"
                  preview-teleported
                  fit="cover"
                  class="detail-image"
                />
              </div>
            </div>
            <el-form v-else ref="formRef" :model="form" :rules="formValidate" label-position="top">
              <el-form-item prop="reply">
                <el-input
                  v-model="form.reply"
                  type="textarea"
                  maxlength="200"
                  :rows="4"
                  resize="none"
                  show-word-limit
                  placeholder="请输入回复内容，回复后将展示在商品评价中"
                />
              </el-form-item>
              <el-form-item label="回复图片" class="reply-upload-item">
                <upload-pic-thumb v-model="form.replyImage" :limit="5" />
              </el-form-item>
            </el-form>
          </div>
        </template>
      </div>
      <template #footer>
        <el-button @click="modalVisible = false">取消</el-button>
        <el-button v-if="!replyStatus" type="primary" :loading="submitLoading" @click="handleSubmit">回复</el-button>
      </template>
    </el-drawer>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref } from "vue";
import * as API_Member from "@/api/member";
import { Message } from "@/utils/message";
import uploadPicThumb from "@/views/my-components/lili/upload-pic-thumb";

defineOptions({ name: "memberComment" });

const detailInfo = ref({});
const image = ref([]);
const replyStatus = ref(false);
const modalVisible = ref(false);
const loading = ref(true);
const detailLoading = ref(false);
const content = ref("");

const defaultSearchForm = () => ({
  pageNumber: 1,
  pageSize: 10,
  sort: "createTime",
  order: "desc",
  startTime: "",
  endTime: "",
});
const searchForm = ref(defaultSearchForm());
const selectDate = ref(null);
const gradeTabs = [
  { title: "全部评价", value: "" },
  { title: "好评", value: "GOOD" },
  { title: "中评", value: "MODERATE" },
  { title: "差评", value: "WORSE" },
];
const currentGrade = ref("");
const form = reactive({
  id: "",
  replyImage: [],
  reply: "",
});
const formValidate = {
  reply: [{ required: true, message: "请输入回复内容", trigger: "blur" }],
};
const submitLoading = ref(false);
const data = ref([]);
const total = ref(0);

// searchFormRef/tableRef：模板 ref 改名避免与顶层变量互相覆盖
const searchFormRef = ref(null);
const tableRef = ref(null);
// formRef：模板 ref 改名避免与顶层变量 form 互相覆盖
const formRef = ref(null);

onMounted(() => {
  init();
});

function init() {
  getDataList();
}
function changePage() {
  getDataList();
}
function changePageSize() {
  searchForm.value.pageNumber = 1;
  getDataList();
}
function handleSearch() {
  searchForm.value.pageNumber = 1;
  searchForm.value.pageSize = 10;
  getDataList();
}
function handleReset() {
  searchForm.value = defaultSearchForm();
  selectDate.value = null;
  currentGrade.value = "";
  getDataList();
}
function onGradeTabClick(tab) {
  currentGrade.value = tab.paneName;
  searchForm.value.grade = tab.paneName || undefined;
  searchForm.value.pageNumber = 1;
  getDataList();
}
function selectDateRange(v) {
  if (v && v.length === 2) {
    searchForm.value.startTime = v[0];
    searchForm.value.endTime = v[1];
  } else {
    searchForm.value.startTime = "";
    searchForm.value.endTime = "";
  }
}
function avgScore(row) {
  const scores = [row.deliveryScore, row.serviceScore, row.descriptionScore].filter(
    (s) => typeof s === "number"
  );
  if (!scores.length) return 0;
  return scores.reduce((a, b) => a + b, 0) / scores.length;
}
function getDataList() {
  loading.value = true;
  API_Member.getMemberReview(searchForm.value)
    .then((res) => {
      if (res.success) {
        data.value = res.result.records;
        total.value = res.result.total;
      }
    })
    .finally(() => {
      loading.value = false;
    });
}
function handleSubmit() {
  formRef.value.validate((valid) => {
    if (!valid) return;
    submitLoading.value = true;
    API_Member.replyMemberReview(form.id, form)
      .then((res) => {
        if (res.success) {
          Message.success("回复成功");
          getDataList();
          modalVisible.value = false;
        }
      })
      .finally(() => {
        submitLoading.value = false;
      });
  });
}
function detail(v) {
  modalVisible.value = true;
  detailInfo.value = {};
  form.reply = "";
  form.replyImage = [];
  image.value = [];
  detailLoading.value = true;
  API_Member.getMemberInfoReview(v.id)
    .then((res) => {
      if (res.success) {
        form.id = res.result.id;
        content.value = res.result.content;
        form.reply = res.result.reply;
        replyStatus.value = res.result.replyStatus;
        image.value = res.result.images ? (res.result.images || "").split(",") : [];
        form.replyImage = res.result.replyImage ? (res.result.replyImage || "").split(",") : [];
        detailInfo.value = res.result;
      }
    })
    .finally(() => {
      detailLoading.value = false;
    });
}
</script>

<style lang="scss" scoped>
@import "@/styles/table-common.scss";
.link-text {
  color: #409eff;
  cursor: pointer;
  text-decoration: none;
}
.comment-tab {
  :deep(.el-tabs__item) {
    font-size: 14px;
  }
  :deep(.el-tabs__header) {
    margin-bottom: 0;
  }
}
.member-cell,
.goods-cell {
  display: flex;
  align-items: center;
  gap: 8px;
  .cell-name {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}
.grade-cell {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}
.comment-detail {
  min-height: 200px;
}
.detail-header {
  display: flex;
  align-items: center;
  gap: 12px;
  .detail-header-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 4px;
    .detail-member-line {
      display: flex;
      align-items: center;
      gap: 8px;
      .detail-member-name {
        font-size: 15px;
        font-weight: 600;
      }
    }
  }
  .detail-time {
    font-size: 12px;
    color: #999;
    flex-shrink: 0;
  }
}
.detail-content {
  margin: 14px 0 0;
  font-size: 14px;
  line-height: 1.7;
  color: #333;
  word-break: break-all;
  white-space: pre-wrap;
  &.is-empty {
    color: #999;
  }
}
.detail-meta {
  margin-top: 14px;
  padding: 10px 12px;
  background: #f7f8fa;
  border-radius: 6px;
  .meta-scores {
    display: flex;
    flex-wrap: wrap;
    gap: 8px 20px;
    .score-item {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 12px;
      color: #888;
    }
  }
  .meta-goods {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-top: 10px;
    padding-top: 10px;
    border-top: 1px dashed #e4e7ed;
    .meta-goods-image {
      width: 32px;
      height: 32px;
      flex-shrink: 0;
      border-radius: 4px;
    }
    .meta-goods-name {
      flex: 1;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      font-size: 13px;
      color: #606266;
    }
    .meta-order-no {
      flex-shrink: 0;
      font-size: 12px;
      color: #999;
    }
  }
}
.reply-section {
  margin-top: 16px;
  .reply-title {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 14px;
    font-weight: 600;
    margin-bottom: 10px;
    &::before {
      content: "";
      width: 3px;
      height: 14px;
      border-radius: 2px;
      background: #409eff;
    }
  }
  .reply-bubble {
    padding: 12px;
    background: #ecf5ff;
    border-radius: 6px;
    .reply-text {
      margin: 0;
      font-size: 13px;
      line-height: 1.7;
      color: #333;
      word-break: break-all;
      white-space: pre-wrap;
    }
  }
  .reply-upload-item {
    margin-bottom: 0;
    :deep(.el-form-item__label) {
      font-size: 12px;
      color: #999;
      line-height: 1.4;
      padding-bottom: 4px;
    }
  }
}
.image-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 10px;
  .detail-image {
    width: 92px;
    height: 92px;
    border-radius: 6px;
  }
}
</style>
