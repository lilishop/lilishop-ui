<template>
  <div class="pintuan-goods-page">
    <!-- 顶部标题与返回栏 -->
    <el-card shadow="never" class="header-card">
      <div class="page-header-row">
        <div class="header-left">
          <div class="header-title">
            <span>拼团活动商品管理</span>
            <el-tag
              v-if="pintuanInfo.promotionStatus"
              :type="promotionStatusTagType(pintuanInfo.promotionStatus)"
              size="small"
              effect="plain"
              class="status-tag"
            >
              {{ promotionStatusText(pintuanInfo.promotionStatus) }}
            </el-tag>
            <span v-if="pintuanId" class="activity-id font-mono">ID: {{ pintuanId }}</span>
          </div>
        </div>
        <div class="header-right">
          <el-button @click="back">返回拼团列表</el-button>
        </div>
      </div>
    </el-card>

    <!-- 活动信息卡片 -->
    <el-card shadow="never" class="info-card mt_10">
      <div class="section-header">
        <span class="section-indicator"></span>
        <span class="section-title">活动信息</span>
      </div>

      <el-descriptions :column="3" border class="custom-descriptions">
        <el-descriptions-item label="活动名称">
          <span class="font-semibold text-dark">{{ pintuanInfo.promotionName || "-" }}</span>
        </el-descriptions-item>

        <el-descriptions-item label="活动状态">
          <el-tag
            v-if="pintuanInfo.promotionStatus"
            :type="promotionStatusTagType(pintuanInfo.promotionStatus)"
            size="small"
            effect="dark"
          >
            {{ promotionStatusText(pintuanInfo.promotionStatus) }}
          </el-tag>
          <span v-else>-</span>
        </el-descriptions-item>

        <el-descriptions-item label="所属店铺">
          <span class="text-secondary">{{ pintuanInfo.storeName || "全平台 / 自营" }}</span>
        </el-descriptions-item>

        <el-descriptions-item label="活动开始时间">
          <span class="font-mono text-dark">{{ pintuanInfo.startTime || "-" }}</span>
        </el-descriptions-item>

        <el-descriptions-item label="活动结束时间">
          <span class="font-mono text-dark">{{ pintuanInfo.endTime || "-" }}</span>
        </el-descriptions-item>

        <el-descriptions-item label="成团人数">
          <span class="font-mono text-dark">
            {{ pintuanInfo.requiredNum ? `${pintuanInfo.requiredNum} 人` : "-" }}
          </span>
        </el-descriptions-item>

        <el-descriptions-item label="限购数量">
          <span class="font-mono text-dark">
            {{ pintuanInfo.limitNum > 0 ? `${pintuanInfo.limitNum} 件` : "不限购" }}
          </span>
        </el-descriptions-item>

        <el-descriptions-item label="虚拟成团">
          <el-tag
            v-if="pintuanInfo.fictitious != null"
            :type="pintuanInfo.fictitious ? 'success' : 'info'"
            size="small"
            effect="plain"
          >
            {{ pintuanInfo.fictitious ? "已开启" : "未开启" }}
          </el-tag>
          <span v-else>-</span>
        </el-descriptions-item>

        <el-descriptions-item label="活动ID">
          <span class="font-mono text-secondary">{{ pintuanId || "-" }}</span>
        </el-descriptions-item>

        <el-descriptions-item
          v-if="pintuanInfo.pintuanRule"
          label="规则说明"
          :span="3"
        >
          <span class="text-secondary rule-desc">{{ pintuanInfo.pintuanRule }}</span>
        </el-descriptions-item>
      </el-descriptions>
    </el-card>

    <!-- 拼团商品列表卡片 -->
    <el-card shadow="never" class="info-card mt_10">
      <div class="card-header-bar">
        <div class="header-title-group">
          <span class="section-indicator"></span>
          <span class="section-title">已报名拼团商品</span>
          <span class="total-badge">共 {{ total }} 件商品</span>
        </div>
        <div class="header-actions">
          <el-button size="small" @click="getDataList">刷新</el-button>
        </div>
      </div>

      <el-table
        ref="table"
        v-loading="loading"
        border
        stripe
        :data="goodsData"
        style="width: 100%"
        empty-text="暂无报名的拼团商品"
        class="custom-table"
      >
        <!-- 商品图片 -->
        <el-table-column label="商品图片" width="76" align="center">
          <template #default="{ row }">
            <div v-if="row && (row.thumbnail || row.small || row.goodsImage)" class="goods-thumb-box">
              <el-image
                :src="row.thumbnail || row.small || row.goodsImage"
                fit="cover"
                preview-teleported
                :preview-src-list="[row.thumbnail || row.small || row.goodsImage]"
                class="goods-thumb-img"
              >
                <template #error>
                  <div class="thumb-slot">无图</div>
                </template>
              </el-image>
            </div>
            <div v-else class="goods-thumb-box thumb-slot">无图</div>
          </template>
        </el-table-column>

        <!-- 商品名称 -->
        <el-table-column prop="goodsName" label="商品名称" min-width="220" show-overflow-tooltip>
          <template #default="{ row }">
            <div v-if="row">
              <a
                class="goods-link"
                @click="handleLinkTo(row.goodsId, row.skuId)"
              >
                {{ row.goodsName || "-" }}
              </a>
              <div v-if="row.skuId" class="sku-sub-text font-mono">
                SKU: {{ row.skuId }}
              </div>
            </div>
          </template>
        </el-table-column>

        <!-- 所属商家 -->
        <el-table-column prop="storeName" label="所属商家" min-width="140" show-overflow-tooltip>
          <template #default="{ row }">
            <span class="text-secondary">{{ (row && row.storeName) || "-" }}</span>
          </template>
        </el-table-column>

        <!-- 商品原价 -->
        <el-table-column label="商品原价" width="120" align="right">
          <template #default="{ row }">
            <span v-if="row" class="original-price font-mono">
              {{ $filters.unitPrice(row.originalPrice, "￥") }}
            </span>
          </template>
        </el-table-column>

        <!-- 拼团价格 -->
        <el-table-column label="拼团价格" width="130" align="right">
          <template #default="{ row }">
            <span v-if="row" class="pintuan-price font-mono font-semibold">
              {{ $filters.unitPrice(row.price, "￥") }}
            </span>
          </template>
        </el-table-column>

        <!-- 活动库存 -->
        <el-table-column label="活动库存" width="100" align="right">
          <template #default="{ row }">
            <span v-if="row" class="font-mono text-dark">{{ row.quantity ?? "-" }}</span>
          </template>
        </el-table-column>

        <!-- 限购数量 -->
        <el-table-column label="限购数量" width="100" align="right">
          <template #default="{ row }">
            <span v-if="row" class="font-mono text-dark">
              {{ row.limitNum > 0 ? row.limitNum : "不限" }}
            </span>
          </template>
        </el-table-column>

        <!-- 操作 -->
        <el-table-column label="查看" width="140" align="center" fixed="right">
          <template #default="{ row }">
            <template v-if="row">
              <el-button
                link
                type="primary"
                @click="handleLinkTo(row.goodsId, row.skuId)"
              >
                PC查看
              </el-button>

              <el-popover
                trigger="hover"
                placement="top"
                width="180"
              >
                <template #reference>
                  <el-button link type="primary" class="ml_8">
                    手机扫码
                  </el-button>
                </template>
                <div class="qr-popover-content">
                  <div class="qr-popover-title">扫码在手机中查看</div>
                  <vue-qr
                    :text="handleWapLinkTo(row.goodsId, row.skuId)"
                    :margin="4"
                    color-dark="#000"
                    color-light="#fff"
                    :size="140"
                  />
                </div>
              </el-popover>
            </template>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页区域 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="searchForm.pageNumber"
          v-model:page-size="searchForm.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="total"
          background
          layout="total, sizes, prev, pager, next, jumper"
          size="default"
          @current-change="changePage"
          @size-change="changePageSize"
        />
      </div>
    </el-card>

    <!-- 底部返回卡片 -->
    <el-card shadow="never" class="footer-card mt_10">
      <div class="footer-actions">
        <el-button @click="back">返回拼团列表</el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref, computed, getCurrentInstance } from "vue";
import { useRoute, useRouter } from "vue-router";
import { getPintuanGoodsList, getPintuanDetail } from "@/api/promotion.js";
import vueQr from "vue-qr";

const route = useRoute();
const router = useRouter();
const { proxy } = getCurrentInstance() || {};

const loading = ref(false);
const pintuanInfo = ref({});
const goodsData = ref([]);
const total = ref(0);

const searchForm = reactive({
  pageNumber: 1,
  pageSize: 20,
});

const pintuanId = computed(() => {
  return route.query.id || pintuanInfo.value.id || "";
});

function promotionStatusText(status) {
  const map = {
    NEW: "未开始",
    START: "已开始",
    END: "已结束",
    CLOSE: "已关闭",
  };
  return map[status] || "未知";
}

function promotionStatusTagType(status) {
  const map = {
    NEW: "info",
    START: "success",
    END: "danger",
    CLOSE: "danger",
  };
  return map[status] || "info";
}

function handleLinkTo(goodsId, skuId) {
  if (proxy && typeof proxy.linkTo === "function") {
    proxy.linkTo(goodsId, skuId);
  } else {
    const pcUrl = window.BASE?.PC_URL || "";
    const url = skuId
      ? `${pcUrl}/goodsDetail?skuId=${skuId}&goodsId=${goodsId}`
      : `${pcUrl}/goodsDetail?goodsId=${goodsId}`;
    window.open(url, "_blank");
  }
}

function handleWapLinkTo(goodsId, skuId) {
  if (proxy && typeof proxy.wapLinkTo === "function") {
    return proxy.wapLinkTo(goodsId, skuId);
  }
  const wapUrl = window.BASE?.WAP_URL || "";
  if (skuId) {
    return `${wapUrl}/pages/product/goods?id=${skuId}&goodsId=${goodsId}`;
  }
  return `${wapUrl}/pages/product/goods?goodsId=${goodsId}`;
}

function back() {
  if (window.history.length > 1) {
    router.go(-1);
  } else {
    router.push({ name: "manager-pintuan" });
  }
}

function changePage() {
  getDataList();
}

function changePageSize() {
  searchForm.pageNumber = 1;
  getDataList();
}

function getDataList() {
  if (!pintuanId.value) return;
  loading.value = true;
  searchForm.pintuanId = pintuanId.value;
  getPintuanGoodsList(searchForm)
    .then((res) => {
      if (res && res.success && res.result) {
        goodsData.value = res.result.records || [];
        total.value = res.result.total || 0;
      }
    })
    .finally(() => {
      loading.value = false;
    });
}

function getPintuanMsg() {
  if (!pintuanId.value) return;
  getPintuanDetail(pintuanId.value).then((res) => {
    if (res && res.success && res.result) {
      pintuanInfo.value = res.result;
    }
  });
}

function init() {
  getPintuanMsg();
  getDataList();
}

onMounted(() => {
  init();
});
</script>

<style lang="scss" scoped>
.pintuan-goods-page {
  padding: 16px 20px;
  background-color: #f0f2f5;
  min-height: 100vh;
  box-sizing: border-box;

  .mt_10 {
    margin-top: 12px;
  }

  .ml_8 {
    margin-left: 8px;
  }

  .font-mono {
    font-family: Monaco, Menlo, Consolas, "Courier New", monospace;
  }

  .font-semibold {
    font-weight: 600;
  }

  .text-dark {
    color: #303133;
  }

  .text-secondary {
    color: #606266;
  }

  .header-card {
    border: none;
    border-radius: 4px;

    :deep(.el-card__body) {
      padding: 16px 20px;
    }

    .page-header-row {
      display: flex;
      align-items: center;
      justify-content: space-between;

      .header-left {
        .header-title {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 18px;
          font-weight: 600;
          color: #1f2d3d;

          .status-tag {
            font-weight: normal;
          }

          .activity-id {
            font-size: 13px;
            color: #909399;
            font-weight: normal;
          }
        }
      }
    }
  }

  .info-card {
    border: none;
    border-radius: 4px;

    :deep(.el-card__body) {
      padding: 20px;
    }

    .section-header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 16px;

      .section-indicator {
        width: 4px;
        height: 16px;
        background-color: #409eff;
        border-radius: 2px;
      }

      .section-title {
        font-size: 15px;
        font-weight: 600;
        color: #303133;
      }
    }

    .custom-descriptions {
      :deep(.el-descriptions__label) {
        width: 120px;
        background-color: #f8f9fb;
        color: #606266;
        font-weight: 500;
      }

      :deep(.el-descriptions__content) {
        color: #303133;
      }

      .rule-desc {
        white-space: pre-wrap;
        line-height: 1.6;
      }
    }

    .card-header-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 16px;

      .header-title-group {
        display: flex;
        align-items: center;
        gap: 8px;

        .section-indicator {
          width: 4px;
          height: 16px;
          background-color: #409eff;
          border-radius: 2px;
        }

        .section-title {
          font-size: 15px;
          font-weight: 600;
          color: #303133;
        }

        .total-badge {
          font-size: 13px;
          color: #909399;
          margin-left: 6px;
        }
      }
    }

    .custom-table {
      :deep(th.el-table__cell) {
        background-color: #fafafa;
        color: #303133;
        font-weight: 600;
      }

      .goods-thumb-box {
        width: 44px;
        height: 44px;
        border-radius: 4px;
        overflow: hidden;
        background-color: #f5f7fa;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 1px solid #ebeef5;
        margin: 0 auto;

        .goods-thumb-img {
          width: 100%;
          height: 100%;
          display: block;
        }
      }

      .thumb-slot {
        font-size: 11px;
        color: #c0c4cc;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .goods-link {
        color: #303133;
        font-weight: 500;
        cursor: pointer;
        transition: color 0.2s;
        text-decoration: none;

        &:hover {
          color: #409eff;
        }
      }

      .sku-sub-text {
        font-size: 12px;
        color: #909399;
        margin-top: 2px;
      }

      .original-price {
        color: #909399;
        text-decoration: line-through;
        font-size: 13px;
      }

      .pintuan-price {
        color: #f56c6c;
        font-size: 14px;
      }
    }

    .pagination-container {
      display: flex;
      justify-content: flex-end;
      margin-top: 16px;
    }
  }

  .footer-card {
    border: none;
    border-radius: 4px;

    :deep(.el-card__body) {
      padding: 16px 20px;
    }

    .footer-actions {
      display: flex;
      justify-content: center;
      gap: 12px;
    }
  }
}

.qr-popover-content {
  text-align: center;
  padding: 6px 0;

  .qr-popover-title {
    font-size: 13px;
    font-weight: 500;
    color: #303133;
    margin-bottom: 8px;
  }
}
</style>
