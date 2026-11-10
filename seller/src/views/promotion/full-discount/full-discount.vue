<!--
  满额活动列表页（支持满减活动 FULL_MINUS、满折活动 FULL_RATE、满赠活动 FULL_GIFT）
  @author Bulbasaur
  @since 2026-11-09
-->
<template>
  <div class="search full-cut">
    <el-card>
      <el-form
        ref="searchFormRef"
        :model="searchForm"
        inline
        label-width="70px"
        class="search-form"
        @keyup.enter="handleSearch"
      >
        <el-form-item label="活动名称" prop="promotionName">
          <el-input
            v-model="searchForm.promotionName"
            placeholder="请输入活动名称"
            clearable
            style="width: 240px"
          />
        </el-form-item>
        <el-form-item label="活动状态" prop="promotionStatus">
          <el-select
            v-model="searchForm.promotionStatus"
            placeholder="请选择"
            clearable
            style="width: 240px"
          >
            <el-option label="未开始" value="NEW" />
            <el-option label="已开始/上架" value="START" />
            <el-option label="已结束/下架" value="END" />
            <el-option label="紧急关闭/作废" value="CLOSE" />
          </el-select>
        </el-form-item>
        <el-form-item label="活动时间">
          <el-date-picker
            v-model="selectDate"
            type="daterange"
            clearable
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            style="width: 240px"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" class="search-btn" @click="handleSearch">搜索</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card>
      <div class="operation padding-row">
        <el-button type="primary" @click="add">{{ addBtnText }}</el-button>
      </div>
      <el-table
        ref="table"
        v-loading="loading"
        border
        :data="data"
        class="mt_10"
        style="width: 100%"
      >
        <el-table-column prop="promotionName" label="活动名称" min-width="140" show-overflow-tooltip />
        <el-table-column label="阶梯优惠规则" min-width="240" show-overflow-tooltip>
          <template #default="{ row }">
            <span v-if="row">{{ formatRowRules(row) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="startTime" label="开始时间" width="170" />
        <el-table-column prop="endTime" label="结束时间" width="170" />
        <el-table-column label="适用范围" width="100">
          <template #default="{ row }">
            <span v-if="row">{{ row.scopeType === "ALL" ? "全品类" : "指定商品" }}</span>
          </template>
        </el-table-column>
        <el-table-column label="活动类型" width="90">
          <template #default="{ row }">
            <el-tag v-if="row" size="small" effect="plain" :type="activityTagType(row)">
              {{ activityTypeText(row) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="活动状态" width="100">
          <template #default="{ row }">
            <el-tag v-if="row" :type="promotionStatusTagType(row.promotionStatus)">
              {{ promotionStatusText(row.promotionStatus) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="right" width="160" fixed="right">
          <template #default="{ row }">
            <template v-if="row">
              <a class="link-text" @click="goDetail(row)">
                {{ row.promotionStatus === "NEW" ? "编辑" : "查看" }}
              </a>
              <template v-if="row.promotionStatus === 'NEW' || row.promotionStatus === 'START'">
                <span class="op-split">|</span>
                <a class="link-text" @click="openOrClose(row)">关闭</a>
              </template>
            </template>
          </template>
        </el-table-column>
      </el-table>

      <div class="mt_10" style="display: flex; justify-content: flex-end">
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
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { getFullDiscountList, updateFullDiscount } from "@/api/promotion.js";
import { Message, Modal } from "@/utils/message";

const props = defineProps({
  /**
   * 固定活动子类型（FULL_MINUS-满减，FULL_RATE-满折，FULL_GIFT-满赠）
   */
  defaultActivityType: {
    type: String,
    default: "",
  },
});

const route = useRoute();
const router = useRouter();

const currentActivityType = computed(() => {
  if (props.defaultActivityType) {
    return props.defaultActivityType;
  }
  const routePath = String(route.path || "");
  const routeName = String(route.name || "");
  if (routePath.includes("full-rate") || routeName.includes("full-rate")) {
    return "FULL_RATE";
  }
  if (routePath.includes("full-gift") || routeName.includes("full-gift")) {
    return "FULL_GIFT";
  }
  return "FULL_MINUS";
});

const addBtnText = computed(() => {
  if (currentActivityType.value === "FULL_RATE") return "新增满折活动";
  if (currentActivityType.value === "FULL_GIFT") return "新增满赠活动";
  return "新增满减活动";
});

const selectDate = ref([]);
const total = ref(0);
const loading = ref(false);
const searchForm = reactive({
  pageNumber: 1,
  pageSize: 20,
  sort: "createTime",
  order: "desc",
  promotionName: "",
  promotionStatus: "",
});
const data = ref([]);
const searchFormRef = ref(null);

watch(currentActivityType, () => {
  searchForm.pageNumber = 1;
  getDataList();
});

onMounted(() => {
  init();
});

function resolveRowType(row) {
  if (row?.activityType) return row.activityType;
  if (row?.fullRateFlag) return "FULL_RATE";
  if (!row?.fullMinusFlag && row?.giftFlag) return "FULL_GIFT";
  return "FULL_MINUS";
}

function activityTypeText(row) {
  const type = resolveRowType(row);
  if (type === "FULL_RATE") return "满折";
  if (type === "FULL_GIFT") return "满赠";
  return "满减";
}

function activityTagType(row) {
  const type = resolveRowType(row);
  if (type === "FULL_RATE") return "warning";
  if (type === "FULL_GIFT") return "success";
  return "danger";
}

function formatRowRules(row) {
  if (row?.title) return row.title;
  if (row?.rulesJson) {
    try {
      const rules = JSON.parse(row.rulesJson);
      if (Array.isArray(rules) && rules.length) {
        const type = resolveRowType(row);
        return rules
          .map((r) => {
            if (type === "FULL_RATE") return `满${r.fullMoney}元打${r.fullRate}折`;
            if (type === "FULL_GIFT") {
              const count = Array.isArray(r.giftItems) ? r.giftItems.length : 1;
              return `满${r.fullMoney}元赠${count}种商品`;
            }
            return `满${r.fullMoney}元减${r.fullMinus}元`;
          })
          .join("；");
      }
    } catch (e) {
      // ignore
    }
  }
  if (row?.fullMoney != null) {
    if (row.fullRateFlag) return `满${row.fullMoney}元打${row.fullRate}折`;
    if (row.giftFlag) return `满${row.fullMoney}元享赠品`;
    return `满${row.fullMoney}元减${row.fullMinus}元`;
  }
  return "-";
}

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
  return map[status] || "danger";
}

function init() {
  getDataList();
}

function openOrClose(row) {
  if (row.promotionStatus === "NEW" || row.promotionStatus === "START") {
    Modal.confirm({
      title: "提示",
      content: "确认关闭此活动吗？需要一定时间才能生效，请耐心等待",
      loading: true,
      onOk: () => {
        updateFullDiscount(row.id).then((res) => {
          Modal.remove();
          if (res.success) {
            Message.success("关闭成功");
            getDataList();
          }
        });
      },
    });
  }
}

function changePage() {
  getDataList();
}

function changePageSize() {
  searchForm.pageNumber = 1;
  getDataList();
}

function handleSearch() {
  searchForm.pageNumber = 1;
  searchForm.pageSize = 20;
  getDataList();
}

function getDataList() {
  loading.value = true;
  if (selectDate.value && selectDate.value[0] && selectDate.value[1]) {
    searchForm.startTime = selectDate.value[0].getTime();
    searchForm.endTime = selectDate.value[1].getTime();
  } else {
    searchForm.startTime = null;
    searchForm.endTime = null;
  }
  const query = {
    ...searchForm,
    activityType: currentActivityType.value,
  };
  getFullDiscountList(query).then((res) => {
    loading.value = false;
    if (res.success) {
      data.value = res.result.records;
      total.value = res.result.total;
    }
  });
}

function add() {
  router.push({
    name: "full-discount-detail",
    query: { activityType: currentActivityType.value },
  });
}

function goDetail(row) {
  router.push({
    name: "full-discount-detail",
    query: { id: row.id, activityType: resolveRowType(row) },
  });
}
</script>

<style lang="scss" scoped>
.link-text {
  color: #409eff;
  cursor: pointer;
  text-decoration: none;
}

.op-split {
  margin: 0 8px;
  color: #dcdfe6;
}

.mt_10 {
  margin-top: 10px;
}

.operation {
  margin-bottom: 10px;
}

.padding-row {
  padding: 0 0 10px;
}
</style>
