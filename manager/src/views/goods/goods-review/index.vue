<template>
  <div class="goods-review-page search">
    <!-- 顶部筛选表单 -->
    <el-card shadow="never" class="filter-card">
      <el-form
        ref="searchFormRef"
        :model="searchForm"
        inline
        label-width="76px"
        class="search-form"
        @keyup.enter="handleSearch"
      >
        <el-form-item label="客户ID" prop="memberId">
          <el-input
            v-model="searchForm.memberId"
            placeholder="请输入客户ID"
            clearable
            style="width: 180px"
          />
        </el-form-item>
        <el-form-item label="客户名称" prop="memberName">
          <el-input
            v-model="searchForm.memberName"
            placeholder="请输入客户名称"
            clearable
            style="width: 160px"
          />
        </el-form-item>
        <el-form-item label="商品名称" prop="goodsName">
          <el-input
            v-model="searchForm.goodsName"
            placeholder="请输入商品名称"
            clearable
            style="width: 180px"
          />
        </el-form-item>
        <el-form-item label="店铺名称" prop="storeName">
          <el-input
            v-model="searchForm.storeName"
            placeholder="请输入店铺名称"
            clearable
            style="width: 160px"
          />
        </el-form-item>
        <el-form-item label="评价等级" prop="grade">
          <el-select
            v-model="searchForm.grade"
            placeholder="全部等级"
            clearable
            style="width: 120px"
          >
            <el-option label="全部" value="" />
            <el-option label="好评" value="GOOD" />
            <el-option label="中评" value="MODERATE" />
            <el-option label="差评" value="WORSE" />
          </el-select>
        </el-form-item>
        <el-form-item label="页面展示" prop="status">
          <el-select
            v-model="searchForm.status"
            placeholder="全部状态"
            clearable
            style="width: 120px"
          >
            <el-option label="全部" value="" />
            <el-option label="展示" value="OPEN" />
            <el-option label="隐藏" value="CLOSE" />
          </el-select>
        </el-form-item>
        <el-form-item label="评价时间">
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD"
            style="width: 230px"
            @change="handleDateChange"
          />
        </el-form-item>
        <el-form-item class="form-actions">
          <el-button type="primary" class="search-btn" @click="handleSearch">
            搜索
          </el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 评价数据表格 -->
    <el-card shadow="never" class="table-card mt_10">
      <template #header>
        <div class="card-header-bar">
          <div class="header-title">
            <span>商品评价列表</span>
            <span class="total-badge">共 {{ total }} 条评价</span>
          </div>
          <div class="header-actions">
            <el-button size="small" @click="getDataList">刷新</el-button>
          </div>
        </div>
      </template>

      <el-table
        ref="table"
        v-loading="loading"
        border
        stripe
        :data="data"
        style="width: 100%"
        class="custom-review-table"
      >
        <!-- 客户ID -->
        <el-table-column label="客户ID" width="185" align="center">
          <template #default="{ row }">
            <span v-if="row" class="font-mono text-dark">{{ row.memberId || "-" }}</span>
          </template>
        </el-table-column>

        <!-- 评价客户 -->
        <el-table-column label="评价客户" width="130">
          <template #default="{ row }">
            <div v-if="row" class="member-cell">
              <el-avatar :size="28" :src="row.memberProfile || undefined" class="member-avatar">
                {{ (row.memberName || "用")[0] }}
              </el-avatar>
              <span class="member-name font-medium" :title="row.memberName">
                {{ row.memberName || "-" }}
              </span>
            </div>
          </template>
        </el-table-column>

        <!-- 商品信息 -->
        <el-table-column label="商品信息" min-width="260">
          <template #default="{ row }">
            <div v-if="row" class="goods-cell">
              <div class="goods-thumb-box">
                <el-image
                  v-if="row.goodsImage"
                  :src="row.goodsImage"
                  fit="cover"
                  preview-teleported
                  :preview-src-list="[row.goodsImage]"
                  class="goods-thumb-img"
                >
                  <template #error>
                    <div class="thumb-slot">无图</div>
                  </template>
                </el-image>
                <div v-else class="thumb-slot">无图</div>
              </div>
              <div class="goods-cell-info">
                <div class="goods-cell-title" :title="row.goodsName || '商品已失效或无名称'">
                  <span v-if="row.goodsName" class="font-medium text-dark">{{ row.goodsName }}</span>
                  <span v-else class="text-placeholder">商品已删除或无名称</span>
                </div>
                <div class="goods-cell-meta">
                  <span v-if="row.storeName" class="store-tag">
                    {{ row.storeName }}
                  </span>
                  <span v-if="row.orderNo" class="order-no font-mono" :title="row.orderNo">
                    单号: {{ row.orderNo }}
                  </span>
                </div>
              </div>
            </div>
          </template>
        </el-table-column>

        <!-- 评价等级 -->
        <el-table-column label="评价等级" width="110" align="center">
          <template #default="{ row }">
            <div v-if="row" class="grade-cell">
              <el-tag
                :type="gradeTagType(row.grade)"
                effect="light"
                size="small"
                class="grade-tag"
              >
                {{ gradeText(row.grade) }}
              </el-tag>
              <div
                v-if="row.descriptionScore || row.serviceScore || row.deliveryScore"
                class="score-sub-text"
              >
                <el-tooltip placement="top">
                  <template #content>
                    <div>描述评分：{{ row.descriptionScore || 0 }} 分</div>
                    <div>服务态度：{{ row.serviceScore || 0 }} 分</div>
                    <div>物流配送：{{ row.deliveryScore || 0 }} 分</div>
                  </template>
                  <span class="score-summary font-mono">
                    {{ calcAverageScore(row) }}分
                  </span>
                </el-tooltip>
              </div>
            </div>
          </template>
        </el-table-column>

        <!-- 评价内容与凭证 -->
        <el-table-column label="评价内容" min-width="240">
          <template #default="{ row }">
            <div v-if="row" class="content-cell">
              <div class="content-text" :title="row.content">
                {{ row.content || "默认好评" }}
              </div>
              <!-- 图片凭证 -->
              <div v-if="row.parsedImages && row.parsedImages.length" class="content-images-row">
                <div class="mini-thumbs">
                  <el-image
                    v-for="(img, idx) in row.parsedImages.slice(0, 3)"
                    :key="img || idx"
                    :src="img"
                    :preview-src-list="row.parsedImages"
                    :initial-index="idx"
                    preview-teleported
                    fit="cover"
                    class="mini-thumb-img"
                  >
                    <template #error>
                      <div class="thumb-slot">无图</div>
                    </template>
                  </el-image>
                  <span v-if="row.parsedImages.length > 3" class="thumb-more-tag">
                    +{{ row.parsedImages.length - 3 }}
                  </span>
                </div>
              </div>
              <!-- 商家已回复标记 -->
              <div v-if="row.reply" class="reply-hint-tag">
                <el-tag size="small" type="success" effect="plain">
                  商家已回复
                </el-tag>
              </div>
            </div>
          </template>
        </el-table-column>

        <!-- 置顶状态 -->
        <el-table-column label="置顶" width="80" align="center">
          <template #default="{ row }">
            <el-tag
              v-if="row && row.top"
              type="danger"
              effect="dark"
              size="small"
            >
              已置顶
            </el-tag>
            <span v-else class="text-placeholder">-</span>
          </template>
        </el-table-column>

        <!-- 页面展示开关 -->
        <el-table-column label="页面展示" width="95" align="center">
          <template #default="{ row }">
            <el-switch
              v-if="row"
              v-model="row.status"
              active-value="OPEN"
              inactive-value="CLOSE"
              inline-prompt
              active-text="展示"
              inactive-text="隐藏"
              @change="changeSwitch(row)"
            />
          </template>
        </el-table-column>

        <!-- 评价时间 -->
        <el-table-column prop="createTime" label="评价时间" width="160" align="center">
          <template #default="{ row }">
            <span class="time-text font-mono">{{ row.createTime }}</span>
          </template>
        </el-table-column>

        <!-- 操作栏 -->
        <el-table-column label="操作" width="140" align="center" fixed="right">
          <template #default="{ row }">
            <div v-if="row" class="action-buttons">
              <el-button link type="primary" @click="info(row)">
                详情
              </el-button>
              <el-button
                link
                :type="row.top ? 'warning' : 'primary'"
                @click="updateTop(row)"
              >
                {{ row.top ? "取消置顶" : "置顶" }}
              </el-button>
              <el-button link type="danger" @click="remove(row)">
                删除
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <!-- 底部分页 -->
      <div class="pagination-wrap mt_10">
        <el-pagination
          v-model:current-page="searchForm.pageNumber"
          v-model:page-size="searchForm.pageSize"
          :page-sizes="[20, 50, 100]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          size="small"
          @current-change="getDataList"
          @size-change="() => { searchForm.pageNumber = 1; getDataList(); }"
        />
      </div>
    </el-card>

    <!-- 评价详情弹窗 -->
    <el-dialog
      v-model="infoFlag"
      :title="infoTitle"
      width="720px"
      destroy-on-close
      class="review-detail-dialog"
      @closed="onInfoDialogClosed"
    >
      <div v-loading="infoLoading" class="detail-container">
        <!-- 1. 商品与关联订单简报 -->
        <div class="product-banner-card">
          <div class="product-banner-left">
            <el-image
              v-if="infoData.goodsImage"
              :src="infoData.goodsImage"
              fit="cover"
              class="banner-goods-img"
              preview-teleported
              :preview-src-list="[infoData.goodsImage]"
            >
              <template #error>
                <div class="banner-img-slot">无图</div>
              </template>
            </el-image>
            <div v-else class="banner-goods-img banner-img-slot">无图</div>
            <div class="banner-info">
              <div class="banner-title" :title="infoData.goodsName">
                {{ infoData.goodsName || "商品名称" }}
              </div>
              <div class="banner-meta">
                <span v-if="infoData.storeName" class="meta-item">
                  {{ infoData.storeName }}
                </span>
                <span v-if="infoData.orderNo" class="meta-item font-mono">
                  订单号：{{ infoData.orderNo }}
                  <el-button
                    link
                    type="primary"
                    style="padding: 0 4px"
                    @click="copyText(infoData.orderNo, '订单号')"
                  >
                    复制
                  </el-button>
                </span>
              </div>
            </div>
          </div>
          <div class="banner-right">
            <span class="switch-label">页面展示：</span>
            <el-switch
              v-if="detailStatusReady"
              v-model="infoData.status"
              active-value="OPEN"
              inactive-value="CLOSE"
              inline-prompt
              active-text="展示"
              inactive-text="隐藏"
              @change="changeSwitchView"
            />
          </div>
        </div>

        <!-- 2. 客户评价详情区块 -->
        <div class="evaluation-detail-section">
          <!-- 客户头像与等级 -->
          <div class="section-user-header">
            <div class="user-profile">
              <el-avatar :size="42" :src="infoData.memberProfile || undefined" class="detail-avatar">
                {{ (infoData.memberName || "用")[0] }}
              </el-avatar>
              <div class="user-meta">
                <div class="user-name font-semibold">{{ infoData.memberName }}</div>
                <div class="user-id-line">
                  <span class="user-id font-mono">客户ID：{{ infoData.memberId || "-" }}</span>
                  <el-button
                    v-if="infoData.memberId"
                    link
                    type="primary"
                    class="copy-btn"
                    @click="copyText(infoData.memberId, '客户ID')"
                  >
                    复制
                  </el-button>
                </div>
                <div class="eval-time">{{ infoData.createTime }}</div>
              </div>
            </div>
            <div class="user-badges">
              <el-tag :type="gradeTagType(infoData.grade)" effect="dark" size="small">
                {{ gradeText(infoData.grade) }}
              </el-tag>
              <el-tag
                v-if="infoData.top"
                type="danger"
                effect="plain"
                size="small"
                style="margin-left: 6px"
              >
                已置顶
              </el-tag>
            </div>
          </div>

          <!-- 三维度评分展示 -->
          <div class="ratings-row">
            <div class="rate-item">
              <span class="rate-label">描述相符：</span>
              <span class="rate-val font-semibold">{{ infoData.descriptionScore || 5 }} 分</span>
            </div>
            <div class="rate-item">
              <span class="rate-label">服务态度：</span>
              <span class="rate-val font-semibold">{{ infoData.serviceScore || 5 }} 分</span>
            </div>
            <div class="rate-item">
              <span class="rate-label">物流服务：</span>
              <span class="rate-val font-semibold">{{ infoData.deliveryScore || 5 }} 分</span>
            </div>
          </div>

          <!-- 评价内容文本 -->
          <div class="eval-content-box">
            <div class="content-body">
              {{ infoData.content || "用户未填写详细文字评价（默认好评）" }}
            </div>
          </div>

          <!-- 评价图片列表 -->
          <div v-if="infoData.parsedImages && infoData.parsedImages.length" class="eval-images-box">
            <div class="box-label">评价凭证图片 ({{ infoData.parsedImages.length }}张)：</div>
            <div class="images-grid">
              <div
                v-for="(img, idx) in infoData.parsedImages"
                :key="img || idx"
                class="image-item"
              >
                <el-image
                  :src="img"
                  :preview-src-list="infoData.parsedImages"
                  :initial-index="idx"
                  preview-teleported
                  fit="cover"
                  class="grid-img"
                >
                  <template #error>
                    <div class="banner-img-slot">无图</div>
                  </template>
                </el-image>
              </div>
            </div>
          </div>
        </div>

        <!-- 3. 商家回复区块 -->
        <div v-if="infoData.reply" class="merchant-reply-section">
          <div class="reply-header">
            <span class="reply-title">商家回复答复</span>
          </div>
          <div class="reply-content-box">
            {{ infoData.reply }}
          </div>
          <div v-if="infoData.parsedReplyImages && infoData.parsedReplyImages.length" class="reply-images-box">
            <div class="box-label">商家答复附图：</div>
            <div class="images-grid">
              <div
                v-for="(img, idx) in infoData.parsedReplyImages"
                :key="img || idx"
                class="image-item"
              >
                <el-image
                  :src="img"
                  :preview-src-list="infoData.parsedReplyImages"
                  :initial-index="idx"
                  preview-teleported
                  fit="cover"
                  class="grid-img"
                >
                  <template #error>
                    <div class="banner-img-slot">无图</div>
                  </template>
                </el-image>
              </div>
            </div>
          </div>
        </div>

        <div v-else class="no-reply-hint">
          <span>暂无商家答复记录</span>
        </div>
      </div>

      <template #footer>
        <el-button @click="infoFlag = false">关 闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { nextTick, ref } from "vue";
import { useTable } from "@/utils/useTable";
import * as API_Member from "@/api/member";
import { ElMessage, ElMessageBox } from "element-plus";

defineOptions({ name: "goods-review" });

const searchFormRef = ref(null);
const table = ref(null);

const infoData = ref({});
const infoFlag = ref(false);
const infoLoading = ref(false);
const infoTitle = ref("");
const currentReviewId = ref("");
const detailStatusReady = ref(false);
const dateRange = ref([]);

function cleanSingleUrl(val) {
  if (!val) return "";
  if (typeof val === "object") {
    val = val.url || val.src || val.link || "";
  }
  if (typeof val !== "string") return "";
  val = val.trim().replace(/^['"]|['"]$/g, "");
  if (!val) return "";

  if ((val.startsWith("{") && val.endsWith("}")) || (val.startsWith("[") && val.endsWith("]"))) {
    try {
      const parsed = JSON.parse(val);
      const list = parseImageList(parsed);
      return list[0] || "";
    } catch {
      return "";
    }
  }

  if (/^(https?:|\/\/|\/|data:image\/)/i.test(val) && !/[{}[\]"'\s]/.test(val)) {
    return val;
  }
  return "";
}

function parseImageList(val) {
  if (!val) return [];
  if (Array.isArray(val)) {
    return val.map(cleanSingleUrl).filter(Boolean);
  }
  if (typeof val === "object") {
    const single = cleanSingleUrl(val);
    return single ? [single] : [];
  }
  if (typeof val !== "string") return [];
  val = val.trim();
  if (!val || val === "[]" || val === "{}") return [];

  if ((val.startsWith("[") && val.endsWith("]")) || (val.startsWith("{") && val.endsWith("}"))) {
    try {
      const parsed = JSON.parse(val);
      return parseImageList(parsed);
    } catch {
      // 容错降级
    }
  }

  if (val.includes(",")) {
    return val.split(",").map(cleanSingleUrl).filter(Boolean);
  }

  const single = cleanSingleUrl(val);
  if (single) return [single];

  const matched = val.match(/https?:\/\/[^\s"'}[\]]+/g);
  if (matched) {
    return matched.map(cleanSingleUrl).filter(Boolean);
  }

  return [];
}

const parseImages = parseImageList;

const memberIdCache = new Map();
const storeNameCache = new Map();

function enrichEvaluationRows(records) {
  if (!records || !records.length) return;
  records.forEach((row) => {
    if (!row || !row.id) return;

    // 优先读取任意别名属性
    row.memberId = row.memberId || row.buyerId || row.userId || row.member_id || "";

    if (memberIdCache.has(row.id) && !row.memberId) {
      row.memberId = memberIdCache.get(row.id);
    }
    if (storeNameCache.has(row.id) && !row.storeName) {
      row.storeName = storeNameCache.get(row.id);
    }

    // 若依然缺失关键展示字段，异步调用单条评价详情接口补齐
    if (!row.memberId || !row.storeName || !row.goodsName || !row.goodsImage) {
      API_Member.getMemberInfoReview(row.id)
        .then((res) => {
          if (res && res.result) {
            const detail = res.result;
            if (detail.memberId && !row.memberId) {
              row.memberId = detail.memberId;
              memberIdCache.set(row.id, detail.memberId);
            }
            if (detail.storeName && !row.storeName) {
              row.storeName = detail.storeName;
              storeNameCache.set(row.id, detail.storeName);
            }
            if (detail.goodsName && !row.goodsName) {
              row.goodsName = detail.goodsName;
            }
            if (detail.goodsImage && !row.goodsImage) {
              row.goodsImage = cleanSingleUrl(detail.goodsImage);
            }
            if (detail.orderNo && !row.orderNo) {
              row.orderNo = detail.orderNo;
            }
          }
        })
        .catch(() => {});
    }
  });
}

const { loading, data, total, searchForm, getDataList, handleSearch, resetSearch } = useTable(
  API_Member.getMemberReview,
  {
    pageSize: 20,
    sort: "createTime",
    order: "desc",
    form: {
      memberId: "",
      goodsName: "",
      memberName: "",
      storeName: "",
      grade: "",
      status: "",
      startTime: "",
      endTime: "",
    },
    resolve: (res) => {
      if (res && res.success && res.result) {
        const records = (res.result.records || []).map((row) => ({
          ...row,
          memberId: row.memberId || row.buyerId || row.userId || row.member_id || "",
          goodsImage: cleanSingleUrl(row.goodsImage),
          memberProfile: cleanSingleUrl(row.memberProfile),
          parsedImages: parseImageList(row.images),
          parsedReplyImages: parseImageList(row.replyImage),
        }));
        enrichEvaluationRows(records);
        return { records, total: res.result.total || 0 };
      }
      return null;
    },
  }
);

function handleDateChange(val) {
  if (val && val.length === 2) {
    searchForm.startTime = `${val[0]} 00:00:00`;
    searchForm.endTime = `${val[1]} 23:59:59`;
  } else {
    searchForm.startTime = "";
    searchForm.endTime = "";
  }
}

function handleReset() {
  dateRange.value = [];
  searchForm.memberId = "";
  searchForm.startTime = "";
  searchForm.endTime = "";
  resetSearch();
}

function gradeTagType(grade) {
  if (grade === "GOOD") return "success";
  if (grade === "MODERATE") return "warning";
  return "danger";
}

function gradeText(grade) {
  if (grade === "GOOD") return "好评";
  if (grade === "MODERATE") return "中评";
  return "差评";
}

function calcAverageScore(row) {
  const scores = [row.descriptionScore, row.serviceScore, row.deliveryScore].filter(
    (s) => typeof s === "number" && !isNaN(s)
  );
  if (!scores.length) return "5.0";
  const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
  return avg.toFixed(1);
}

function copyText(text, label = "客户ID") {
  if (!text) return;
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard
      .writeText(String(text))
      .then(() => ElMessage.success(`已复制${label}到剪贴板`))
      .catch(() => ElMessage.info(String(text)));
  } else {
    ElMessage.info(String(text));
  }
}

function changeSwitchView(status) {
  if (!detailStatusReady.value || !currentReviewId.value) {
    return;
  }
  API_Member.updateMemberReview(currentReviewId.value, { status }).then((res) => {
    if (res.success) {
      ElMessage.success("修改展示状态成功!");
      getDataList();
    }
  });
}

function changeSwitch(row) {
  if (!row || !row.id) {
    return;
  }
  API_Member.updateMemberReview(row.id, { status: row.status }).then((res) => {
    if (res.success) {
      ElMessage.success("修改展示状态成功");
      getDataList();
    }
  });
}

function updateTop(v) {
  const top = !v.top;
  API_Member.updateMemberReviewTop(v.id, { top }).then((res) => {
    if (res.success) {
      data.value = data.value.map((item) => {
        if (item.goodsId !== v.goodsId) {
          return item;
        }
        return {
          ...item,
          top: item.id === v.id ? top : false,
        };
      });
      ElMessage.success(top ? "置顶成功!" : "取消置顶成功!");
      getDataList();
    }
  });
}

function info(v) {
  currentReviewId.value = v.id;
  detailStatusReady.value = false;
  infoData.value = {};
  infoFlag.value = true;
  infoLoading.value = true;
  infoTitle.value = `客户 ${v.memberName || "用户"} 的评价详情`;
  API_Member.getMemberInfoReview(v.id)
    .then((res) => {
      infoLoading.value = false;
      if (res && res.result) {
        const item = res.result;
        infoData.value = {
          ...item,
          goodsImage: cleanSingleUrl(item.goodsImage),
          memberProfile: cleanSingleUrl(item.memberProfile),
          parsedImages: parseImageList(item.images),
          parsedReplyImages: parseImageList(item.replyImage),
        };
        nextTick(() => {
          detailStatusReady.value = true;
        });
      }
    })
    .catch(() => {
      infoLoading.value = false;
    });
}

function onInfoDialogClosed() {
  detailStatusReady.value = false;
  currentReviewId.value = "";
  infoData.value = {};
}

function remove(v) {
  ElMessageBox.confirm(`确认要删除客户 "${v.memberName || "用户"}" 的商品评论吗？`, "确认删除", {
    type: "warning",
    confirmButtonText: "确认删除",
    cancelButtonText: "取消",
  })
    .then(() => {
      return API_Member.delMemberReview(v.id).then(() => {
        ElMessage.success("删除成功");
        getDataList();
      });
    })
    .catch(() => {});
}
</script>

<style lang="scss" scoped>
.goods-review-page {
  padding: 16px 20px;
  background-color: #f6f8fa;
  min-height: calc(100vh - 110px);
}

.font-mono {
  font-family: SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
}

.font-semibold {
  font-weight: 600;
}

.filter-card {
  border-radius: 8px;
  border: 1px solid #ebeef5;

  :deep(.el-card__body) {
    padding: 16px 16px 2px;
  }

  .search-form {
    display: flex;
    flex-wrap: wrap;
    align-items: center;

    .el-form-item {
      margin-bottom: 14px;
      margin-right: 16px;
    }

    .form-actions {
      margin-left: auto;
    }
  }
}

.table-card {
  border-radius: 8px;
  border: 1px solid #ebeef5;

  .card-header-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .header-title {
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 15px;
      font-weight: 600;
      color: #303133;

      .total-badge {
        font-size: 12px;
        font-weight: normal;
        color: #909399;
      }
    }
  }

  .pagination-wrap {
    display: flex;
    justify-content: flex-end;
    padding-top: 6px;
  }
}

/* 表格单元格深度样式穿透 */
:deep(.custom-review-table) {
  th.el-table__cell {
    background-color: #fafafa !important;
    color: #303133;
    font-weight: 600;
    font-size: 13px;
  }

  td.el-table__cell {
    padding: 10px 0;
  }

  /* 商品信息列 */
  .goods-cell {
    display: flex;
    align-items: center;
    gap: 10px;
    text-align: left;

    .goods-thumb-box {
      width: 44px;
      height: 44px;
      min-width: 44px;
      max-width: 44px;
      border-radius: 4px;
      overflow: hidden;
      background-color: #f5f7fa;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 1px solid #ebeef5;
      flex-shrink: 0;

      .goods-thumb-img {
        width: 100%;
        height: 100%;
        display: block;
      }

      .thumb-slot {
        font-size: 11px;
        color: #c0c4cc;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        height: 100%;
      }
    }

    .goods-cell-info {
      flex: 1;
      min-width: 0;

      .goods-cell-title {
        font-size: 13px;
        line-height: 1.4;
        max-height: 36px;
        overflow: hidden;
        text-overflow: ellipsis;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        margin-bottom: 3px;
      }

      .goods-cell-meta {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 6px;
        font-size: 11px;
        color: #909399;

        .store-tag {
          color: #409eff;
          background-color: #ecf5ff;
          padding: 1px 5px;
          border-radius: 2px;
          font-size: 11px;
        }

        .order-no {
          color: #909399;
          font-size: 11px;
        }
      }
    }
  }

  /* 客户列 */
  .member-cell {
    display: flex;
    align-items: center;
    gap: 8px;

    .member-avatar {
      flex-shrink: 0;
      background-color: #e9eef3;
      color: #606266;
      font-size: 12px;
    }

    .member-name {
      font-size: 13px;
      color: #303133;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }

  /* 评价等级列 */
  .grade-cell {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;

    .grade-tag {
      font-weight: 500;
    }

    .score-sub-text {
      .score-summary {
        font-size: 11px;
        color: #e6a23c;
        cursor: pointer;
      }
    }
  }

  /* 评价内容列 */
  .content-cell {
    text-align: left;

    .content-text {
      font-size: 13px;
      color: #303133;
      line-height: 1.5;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
      text-overflow: ellipsis;
      margin-bottom: 6px;
    }

    .content-images-row {
      margin-bottom: 6px;

      .mini-thumbs {
        display: flex;
        align-items: center;
        gap: 6px;

        .mini-thumb-img {
          width: 34px;
          height: 34px;
          min-width: 34px;
          max-width: 34px;
          border-radius: 4px;
          border: 1px solid #ebeef5;
          cursor: pointer;
          transition: transform 0.2s;

          &:hover {
            transform: scale(1.08);
          }
        }

        .thumb-more-tag {
          font-size: 11px;
          color: #909399;
          background: #f0f2f5;
          padding: 2px 5px;
          border-radius: 3px;
        }
      }
    }

    .reply-hint-tag {
      display: inline-block;
    }
  }

  /* 文本与操作列 */
  .time-text {
    font-size: 12px;
    color: #909399;
  }

  .text-placeholder {
    color: #c0c4cc;
    font-size: 12px;
  }

  .action-buttons {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;

    .el-button {
      padding: 0 4px;
      font-size: 12px;
    }
  }
}

/* 详情弹窗 */
.review-detail-dialog {
  .detail-container {
    padding: 4px 0;
  }

  /* 商品简报条 */
  .product-banner-card {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background-color: #f8fafc;
    border: 1px solid #ebeef5;
    border-radius: 6px;
    padding: 12px 16px;
    margin-bottom: 16px;

    .product-banner-left {
      display: flex;
      align-items: center;
      gap: 12px;
      flex: 1;
      min-width: 0;

      .banner-goods-img {
        width: 54px;
        height: 54px;
        border-radius: 6px;
        flex-shrink: 0;
        border: 1px solid #ebeef5;
      }

      .banner-img-slot {
        display: flex;
        justify-content: center;
        align-items: center;
        width: 100%;
        height: 100%;
        color: #c0c4cc;
        font-size: 12px;
      }

      .banner-info {
        flex: 1;
        min-width: 0;

        .banner-title {
          font-size: 14px;
          font-weight: 600;
          color: #303133;
          line-height: 1.4;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          margin-bottom: 4px;
        }

        .banner-meta {
          display: flex;
          align-items: center;
          gap: 14px;
          font-size: 12px;
          color: #909399;

          .meta-item {
            display: inline-flex;
            align-items: center;
            gap: 4px;
          }
        }
      }
    }

    .banner-right {
      display: flex;
      align-items: center;
      gap: 6px;
      flex-shrink: 0;
      margin-left: 12px;

      .switch-label {
        font-size: 13px;
        color: #606266;
      }
    }
  }

  /* 评价详情卡片 */
  .evaluation-detail-section {
    border: 1px solid #ebeef5;
    border-radius: 6px;
    padding: 16px;
    margin-bottom: 14px;

    .section-user-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 14px;

      .user-profile {
        display: flex;
        align-items: center;
        gap: 10px;

        .detail-avatar {
          background-color: #ecf5ff;
          color: #409eff;
          font-size: 14px;
        }

        .user-meta {
          .user-name {
            font-size: 14px;
            color: #303133;
          }

          .user-id-line {
            display: flex;
            align-items: center;
            gap: 6px;
            font-size: 12px;
            color: #606266;
            margin: 2px 0;

            .copy-btn {
              padding: 0;
              font-size: 12px;
            }
          }

          .eval-time {
            font-size: 12px;
            color: #909399;
          }
        }
      }
    }

    .ratings-row {
      display: flex;
      flex-wrap: wrap;
      gap: 32px;
      background-color: #fafafa;
      padding: 10px 16px;
      border-radius: 6px;
      margin-bottom: 14px;

      .rate-item {
        display: flex;
        align-items: center;
        gap: 4px;
        font-size: 13px;

        .rate-label {
          color: #606266;
        }

        .rate-val {
          color: #e6a23c;
        }
      }
    }

    .eval-content-box {
      margin-bottom: 14px;

      .content-body {
        font-size: 13px;
        color: #303133;
        line-height: 1.6;
        background: #fdfdfd;
        border: 1px solid #f2f3f5;
        border-radius: 6px;
        padding: 12px 14px;
        white-space: pre-wrap;
        word-break: break-all;
      }
    }

    .eval-images-box {
      .box-label {
        font-size: 12px;
        color: #909399;
        margin-bottom: 8px;
      }

      .images-grid {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;

        .image-item {
          width: 80px;
          height: 80px;
          border-radius: 6px;
          overflow: hidden;
          border: 1px solid #ebeef5;
          cursor: pointer;

          .grid-img {
            width: 100%;
            height: 100%;
            transition: transform 0.2s;

            &:hover {
              transform: scale(1.06);
            }
          }
        }
      }
    }
  }

  /* 商家回复区块 */
  .merchant-reply-section {
    border: 1px solid #faecd8;
    background-color: #fdf6ec;
    border-radius: 6px;
    padding: 14px 16px;
    margin-bottom: 10px;

    .reply-header {
      margin-bottom: 8px;

      .reply-title {
        font-size: 13px;
        font-weight: 600;
        color: #e6a23c;
      }
    }

    .reply-content-box {
      font-size: 13px;
      color: #303133;
      line-height: 1.6;
      background: #ffffff;
      border: 1px solid #faecd8;
      border-radius: 6px;
      padding: 10px 14px;
      white-space: pre-wrap;
      word-break: break-all;
      margin-bottom: 10px;
    }

    .reply-images-box {
      .box-label {
        font-size: 12px;
        color: #909399;
        margin-bottom: 6px;
      }

      .images-grid {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;

        .image-item {
          width: 70px;
          height: 70px;
          border-radius: 6px;
          overflow: hidden;
          border: 1px solid #ebeef5;
          cursor: pointer;

          .grid-img {
            width: 100%;
            height: 100%;
          }
        }
      }
    }
  }

  .no-reply-hint {
    text-align: center;
    padding: 12px 0;
    font-size: 12px;
    color: #c0c4cc;
  }
}
</style>
