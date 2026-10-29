<template>
  <div class="seckill-goods-page">
    <!-- 顶部标题与返回栏 -->
    <el-card shadow="never" class="header-card">
      <div class="page-header-row">
        <div class="header-left">
          <div class="header-title">
            <span>秒杀活动商品管理</span>
            <el-tag
              v-if="seckillInfo.promotionStatus"
              :type="seckillStatusTagType(seckillInfo.promotionStatus)"
              size="small"
              effect="plain"
              class="status-tag"
            >
              {{ seckillStatusText(seckillInfo.promotionStatus) }}
            </el-tag>
            <span v-if="seckillId" class="activity-id font-mono">ID: {{ seckillId }}</span>
          </div>
        </div>
        <div class="header-right">
          <el-button @click="back">返回秒杀列表</el-button>
        </div>
      </div>
    </el-card>

    <!-- 活动信息卡片 -->
    <el-card shadow="never" class="info-card mt_10">
      <div class="section-header">
        <span class="section-indicator"></span>
        <span class="section-title">活动信息</span>
      </div>

      <el-descriptions :column="2" border class="custom-descriptions">
        <el-descriptions-item label="活动名称">
          <span class="font-semibold text-dark">{{ seckillInfo.promotionName || "-" }}</span>
        </el-descriptions-item>

        <el-descriptions-item label="活动状态">
          <el-tag
            v-if="seckillInfo.promotionStatus"
            :type="seckillStatusTagType(seckillInfo.promotionStatus)"
            size="small"
            effect="dark"
          >
            {{ seckillStatusText(seckillInfo.promotionStatus) }}
          </el-tag>
          <span v-else>-</span>
        </el-descriptions-item>

        <el-descriptions-item label="活动开始时间">
          <span class="font-mono text-dark">{{ seckillInfo.startTime || "-" }}</span>
        </el-descriptions-item>

        <el-descriptions-item label="报名截止时间">
          <span class="font-mono text-dark">{{ unixDate(seckillInfo.applyEndTime) }}</span>
        </el-descriptions-item>

        <el-descriptions-item label="时间场次" :span="2">
          <div class="hours-tags-row">
            <template v-if="seckillInfo.hours">
              <el-tag
                v-for="item in unixHours(seckillInfo.hours)"
                :key="item"
                size="small"
                effect="light"
                class="hour-tag"
              >
                {{ item }}
              </el-tag>
            </template>
            <span v-else class="text-placeholder">未设置场次</span>
          </div>
        </el-descriptions-item>

        <el-descriptions-item v-if="seckillInfo.seckillRule" label="规则说明" :span="2">
          <span class="text-secondary">{{ seckillInfo.seckillRule }}</span>
        </el-descriptions-item>
      </el-descriptions>
    </el-card>

    <!-- 秒杀商品列表卡片 -->
    <el-card shadow="never" class="info-card mt_10">
      <div class="card-header-bar">
        <div class="header-title-group">
          <span class="section-indicator"></span>
          <span class="section-title">已报名秒杀商品</span>
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
        :data="goodsList"
        style="width: 100%"
        empty-text="暂无报名的秒杀商品"
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
        <el-table-column prop="goodsName" label="商品名称" min-width="200" show-overflow-tooltip>
          <template #default="{ row }">
            <span class="font-semibold text-dark">{{ row.goodsName || "-" }}</span>
          </template>
        </el-table-column>

        <!-- 商家名称 -->
        <el-table-column prop="storeName" label="所属商家" min-width="140" show-overflow-tooltip>
          <template #default="{ row }">
            <span class="text-secondary">{{ row.storeName || "-" }}</span>
          </template>
        </el-table-column>

        <!-- 活动场次 -->
        <el-table-column label="活动场次" width="110" align="center">
          <template #default="{ row }">
            <el-tag v-if="row && row.timeLine != null" size="small" effect="plain" type="warning">
              {{ row.timeLine }}:00 场
            </el-tag>
          </template>
        </el-table-column>

        <!-- 原价 -->
        <el-table-column label="商品原价" width="120" align="right">
          <template #default="{ row }">
            <span v-if="row" class="original-price font-mono">
              {{ $filters.unitPrice(row.originalPrice, "￥") }}
            </span>
          </template>
        </el-table-column>

        <!-- 秒杀价格 -->
        <el-table-column label="秒杀价格" width="130" align="right">
          <template #default="{ row }">
            <span v-if="row" class="seckill-price font-mono font-semibold">
              {{ $filters.unitPrice(row.price, "￥") }}
            </span>
          </template>
        </el-table-column>

        <!-- 库存 -->
        <el-table-column label="活动库存" width="100" align="right">
          <template #default="{ row }">
            <span v-if="row" class="font-mono text-dark">{{ row.quantity ?? "-" }}</span>
          </template>
        </el-table-column>

        <!-- 操作 -->
        <el-table-column label="操作" width="110" align="center" fixed="right">
          <template #default="{ row, $index }">
            <el-button
              v-if="row"
              link
              type="danger"
              @click="delGoods($index, row)"
            >
              删除
            </el-button>
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
          @current-change="changePage"
          @size-change="changePageSize"
        />
      </div>
    </el-card>

    <!-- 底部操作栏 -->
    <el-card shadow="never" class="footer-card mt_10">
      <div class="footer-actions">
        <el-button type="primary" @click="back">返回秒杀列表</el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import {
  seckillGoodsList,
  seckillDetail,
  delSeckillGoods,
} from "@/api/promotion.js";
import { unixToDate } from "@/utils/filters";
import { ElMessage, ElMessageBox } from "element-plus";
import { useAppStore } from "@/stores/app";

defineOptions({ name: "seckill-goods" });

const route = useRoute();
const router = useRouter();
const appStore = useAppStore();

const seckillId = route.query.id;
const seckillInfo = ref({});
const loading = ref(false);
const searchForm = reactive({
  pageNumber: 1,
  pageSize: 20,
});
const total = ref(0);
const goodsList = ref([]);

function seckillStatusText(status) {
  const map = {
    NEW: "未开始",
    START: "进行中",
    END: "已结束",
    CLOSE: "已关闭",
  };
  return map[status] || status || "-";
}

function seckillStatusTagType(status) {
  const map = {
    NEW: "info",
    START: "success",
    END: "danger",
    CLOSE: "warning",
  };
  return map[status] || "info";
}

function init() {
  getSeckillMsg();
}

function changePage() {
  getDataList();
}

function changePageSize() {
  searchForm.pageNumber = 1;
  getDataList();
}

function getDataList() {
  if (!seckillId) return;
  loading.value = true;
  searchForm.seckillId = seckillId;
  seckillGoodsList(searchForm)
    .then((res) => {
      loading.value = false;
      if (res && res.success && res.result) {
        goodsList.value = res.result.records || [];
        total.value = res.result.total || 0;
      }
    })
    .catch(() => {
      loading.value = false;
    });
}

function getSeckillMsg() {
  if (!seckillId) return;
  seckillDetail(seckillId).then((res) => {
    if (res && res.success && res.result) {
      seckillInfo.value = res.result;
      getDataList();
    }
  });
}

function delGoods(index, row) {
  ElMessageBox.confirm(`确认要删除商品 "${row.goodsName || "该商品"}" 吗？删除后不可恢复。`, "确认删除", {
    type: "warning",
    confirmButtonText: "确定删除",
    cancelButtonText: "取消",
  })
    .then(() => {
      const params = {
        seckillId: row.seckillId,
        id: row.id,
      };
      delSeckillGoods(params).then((res) => {
        if (res && res.success) {
          goodsList.value.splice(index, 1);
          total.value = Math.max(0, total.value - 1);
          ElMessage.success("删除成功！");
        } else if (res && res.message) {
          ElMessage.error(res.message);
        }
      });
    })
    .catch(() => {});
}

function unixDate(time) {
  if (!time) return "-";
  return unixToDate(new Date(time) / 1000);
}

function unixHours(item) {
  if (!item) return [];
  const hourArr = String(item).split(",");
  return hourArr.map((h) => `${h.trim()}:00`);
}

function back() {
  appStore.removeTag("seckill-goods");
  router.go(-1);
}

onMounted(() => {
  init();
});
</script>

<style lang="scss" scoped>
.seckill-goods-page {
  padding-bottom: 20px;

  .header-card {
    .page-header-row {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .header-left {
        .header-title {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 16px;
          font-weight: 600;
          color: #303133;

          .status-tag {
            font-weight: normal;
          }

          .activity-id {
            font-size: 13px;
            font-weight: normal;
            color: #909399;
            background-color: #f4f4f5;
            padding: 2px 8px;
            border-radius: 4px;
          }
        }
      }
    }
  }

  .info-card {
    .section-header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 16px;

      .section-indicator {
        width: 4px;
        height: 16px;
        border-radius: 2px;
        background-color: #409eff;
      }

      .section-title {
        font-size: 15px;
        font-weight: 600;
        color: #303133;
      }
    }

    .card-header-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 14px;

      .header-title-group {
        display: flex;
        align-items: center;
        gap: 8px;

        .section-indicator {
          width: 4px;
          height: 16px;
          border-radius: 2px;
          background-color: #409eff;
        }

        .section-title {
          font-size: 15px;
          font-weight: 600;
          color: #303133;
        }

        .total-badge {
          font-size: 12px;
          font-weight: normal;
          color: #909399;
          background-color: #f4f4f5;
          padding: 2px 8px;
          border-radius: 10px;
          margin-left: 4px;
        }
      }

      .header-actions {
        display: flex;
        align-items: center;
      }
    }

    .custom-descriptions {
      :deep(.el-descriptions__label) {
        width: 140px;
        background-color: #fafafa;
        color: #606266;
        font-weight: 500;
      }

      :deep(.el-descriptions__content) {
        color: #303133;
      }
    }

    .hours-tags-row {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 6px;

      .hour-tag {
        margin: 0;
      }
    }

    .custom-table {
      .goods-thumb-box {
        width: 44px;
        height: 44px;
        margin: 0 auto;
        border: 1px solid #ebeef5;
        border-radius: 4px;
        background-color: #fafafa;
        display: flex;
        align-items: center;
        justify-content: center;
        overflow: hidden;

        .goods-thumb-img {
          width: 40px;
          height: 40px;
        }
      }

      .thumb-slot {
        font-size: 11px;
        color: #c0c4cc;
      }

      .original-price {
        color: #909399;
        text-decoration: line-through;
      }

      .seckill-price {
        color: #f56c6c;
      }
    }
  }

  .footer-card {
    .footer-actions {
      display: flex;
      justify-content: center;
      align-items: center;
    }
  }

  .font-mono {
    font-family: SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
  }

  .font-semibold {
    font-weight: 600;
  }

  .text-dark {
    color: #303133;
  }

  .text-secondary {
    color: #909399;
  }

  .text-placeholder {
    color: #c0c4cc;
  }

  .pagination-wrap {
    display: flex;
    justify-content: flex-end;
  }
}
</style>
