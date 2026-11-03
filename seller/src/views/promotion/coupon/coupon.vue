<template>
  <div class="search">
    <el-card>
      <el-form
        ref="searchFormRef"
        :model="searchForm"
        inline
        label-width="90px"
        class="search-form mb_10"
        @keyup.enter="handleSearch"
      >
        <el-form-item label="优惠券名称" prop="couponName">
          <el-input
            v-model="searchForm.couponName"
            placeholder="请输入优惠券名称"
            clearable
            style="width: 240px"
          />
        </el-form-item>
        <el-form-item label="获取方式" prop="getType">
          <el-select v-model="searchForm.getType" placeholder="请选择" clearable style="width: 240px">
            <el-option label="免费获取" value="FREE" />
            <el-option label="活动获取" value="ACTIVITY" />
          </el-select>
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
      <div class="operation padding-row" v-if="getType !== 'ACTIVITY'">
        <el-button type="primary" @click="add">添加优惠券</el-button>
        <el-button class="activity-coupon-button" @click="addActivityCoupon">添加活动优惠券</el-button>
        <el-button @click="delAll">批量关闭</el-button>
        <el-button type="warning" @click="receivePage()">优惠券领取记录</el-button>
      </div>

      <el-table
        ref="table"
        v-loading="loading"
        border
        :data="data"
        class="mt_10"
        style="width: 100%"
        row-key="id"
        @selection-change="changeSelect"
      >
        <el-table-column type="selection" width="52" align="center" />
        <el-table-column prop="couponName" label="优惠券名称" min-width="180" show-overflow-tooltip />
        <el-table-column label="面额/折扣" width="150">
          <template #default="{ row }">
            <span v-if="row">
              <span v-if="row.price" :style="{ color: $mainColor }">
                {{ $filters.unitPrice(row.price, "￥") }}</span>
              <span v-else>{{ row.couponDiscount }}折</span>
            </span>
          </template>
        </el-table-column>
        <el-table-column label="已领取数量/总数量" width="180">
          <template #default="{ row }">
            <span v-if="row">
              {{ row.receivedNum }}/{{ row.publishNum === 0 ? "不限制" : row.publishNum }}</span>
          </template>
        </el-table-column>
        <el-table-column label="已被使用的数量/已领取数量" width="200">
          <template #default="{ row }">
            <span v-if="row">{{ row.usedNum }}/{{ row.receivedNum }}</span>
          </template>
        </el-table-column>
        <el-table-column label="获取方式" width="120">
          <template #default="{ row }">
            <el-tag v-if="row" :type="getTypeTagType(row.getType)">{{ getTypeText(row.getType) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="优惠券类型" width="120">
          <template #default="{ row }">
            <el-tag v-if="row" :type="couponTypeTagType(row.couponType)">
              {{ couponTypeText(row.couponType) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="品类描述" width="120">
          <template #default="{ row }">
            <el-tag v-if="row" :type="scopeTypeTagType(row.scopeType)">
              {{ scopeTypeText(row.scopeType) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="活动时间" width="200">
          <template #default="{ row }">
            <div v-if="row" class="activity-time" v-html="$filters.xssFilter(formatActivityTime(row))"></div>
          </template>
        </el-table-column>
        <el-table-column
          v-if="showStatusColumn"
          label="状态"
          width="100"
          align="center"
          fixed="right"
        >
          <template #default="{ row }">
            <el-tag v-if="row" :type="promotionStatusTagType(row.promotionStatus)">
              {{ promotionStatusText(row.promotionStatus) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          v-if="showActionColumn"
          label="操作"
          width="250"
          align="right"
          fixed="right"
        >
          <template #default="{ row }">
            <template v-if="row">
              <a
                v-if="row.promotionStatus === 'CLOSE' || row.promotionStatus === 'NEW'"
                class="link-text"
                @click="see(row)"
              >
                编辑
              </a>
              <a v-else class="link-text" @click="see(row, 'onlyView')">查看</a>
              <span
                v-if="row.promotionStatus === 'START' || row.promotionStatus === 'NEW'"
                class="op-split"
              >
                |
              </span>
              <a
                v-if="row.promotionStatus === 'START' || row.promotionStatus === 'NEW'"
                class="link-text"
                @click="close(row)"
              >
                关闭
              </a>
              <span class="op-split">|</span>
              <a class="link-text" @click="receivePage(row.id)">领取记录</a>
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
import { nextTick, onMounted, reactive, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import {
  getShopCouponList,
  updateCouponStatus,
} from "@/api/promotion";
import { formatPromotionCouponValidityHtml } from "@/utils/promotions";
import { Message, Modal } from "@/utils/message";

defineOptions({ name: "coupon" });

const props = defineProps({
  getType: {
    type: String,
    default: "",
  },
  promotionStatus: {
    type: String,
    default: "",
  },
  selectedList: {
    type: Array,
    default: () => [],
  },
});
const emit = defineEmits(["selected"]);

const route = useRoute();
const router = useRouter();

const loading = ref(true);
const searchForm = reactive({
  pageNumber: 1,
  pageSize: 20,
  sort: "create_time",
  order: "desc",
  getType: "",
});
const selectList = ref([]);
const selectCount = ref(0);
const data = ref([]);
const total = ref(0);
const selectDate = ref([]);
const showActionColumn = ref(true);
const showStatusColumn = ref(true);
const isSyncingSelection = ref(false);

// searchFormRef/table：模板 ref 绑定（searchFormRef 原名 searchForm，改名避免与顶层变量互相覆盖）
const searchFormRef = ref(null);
const table = ref(null);

watch(
  () => route.fullPath,
  (fullPath) => {
    if (fullPath == "/promotions/manager-coupon") {
      init();
    }
  }
);

watch(
  () => props.selectedList,
  (val) => {
    if (isSyncingSelection.value) return;
    if (isSameSelection(val, selectList.value)) return;
    nextTick(() => {
      syncTableSelection(val);
    });
  },
  { deep: true }
);

function formatActivityTime(row) {
  return formatPromotionCouponValidityHtml(row);
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

function scopeTypeText(type) {
  const map = {
    ALL: "全品类",
    PORTION_GOODS_CATEGORY: "商品分类",
    PORTION_SHOP_CATEGORY: "店铺分类",
    PORTION_GOODS: "指定商品",
  };
  return map[type] || "未知";
}

function scopeTypeTagType(type) {
  const map = {
    ALL: "info",
    PORTION_GOODS_CATEGORY: "warning",
    PORTION_SHOP_CATEGORY: "warning",
    PORTION_GOODS: "primary",
  };
  return map[type] || "danger";
}

function getTypeText(type) {
  const map = {
    FREE: "免费获取",
    ACTIVITY: "活动获取",
    INSIDE: "内购",
    IGAME: "游戏人生",
  };
  return map[type] || "未知";
}

function getTypeTagType(type) {
  const map = {
    FREE: "danger",
    ACTIVITY: "warning",
    INSIDE: "success",
    IGAME: "success",
  };
  return map[type] || "info";
}

function couponTypeText(type) {
  const map = {
    DISCOUNT: "打折",
    PRICE: "减免现金",
  };
  return map[type] || "未知";
}

function couponTypeTagType(type) {
  const map = {
    DISCOUNT: "primary",
    PRICE: "info",
  };
  return map[type] || "info";
}

function isSameSelection(next, current) {
  const a = next || [];
  const b = current || [];
  if (a.length !== b.length) return false;
  const nextIds = a.map((item) => item.id).sort().join(",");
  const currentIds = b.map((item) => item.id).sort().join(",");
  return nextIds === currentIds;
}

function syncTableSelection(selected) {
  const tableEl = table.value;
  if (!tableEl) return;
  const nextList = selected ? [...selected] : [];
  isSyncingSelection.value = true;
  tableEl.clearSelection();
  if (nextList.length) {
    data.value.forEach((row) => {
      if (nextList.some((item) => item.id === row.id)) {
        tableEl.toggleRowSelection(row, true);
      }
    });
  }
  selectList.value = nextList;
  selectCount.value = nextList.length;
  nextTick(() => {
    isSyncingSelection.value = false;
  });
}

function check() {
  emit("selected", selectList.value);
}

function receivePage(id) {
  if (id) {
    router.push({ name: "coupon-receive", query: { couponId: id } });
  } else {
    router.push({ name: "coupon-receive" });
  }
}

function init() {
  getDataList();
}

function add() {
  router.push({ name: "add-coupon" });
}

function addActivityCoupon() {
  router.push({ name: "add-coupon", query: { getType: "ACTIVITY" } });
}

function changePage(v) {
  searchForm.pageNumber = v;
  getDataList();
}

function changePageSize(v) {
  searchForm.pageNumber = 1;
  searchForm.pageSize = v;
  getDataList();
}

function handleSearch() {
  searchForm.pageNumber = 1;
  searchForm.pageSize = 20;
  getDataList();
}

function clearSelectAll() {
  table.value?.clearSelection();
}

function changeSelect(e) {
  if (isSyncingSelection.value) return;
  selectList.value = e;
  selectCount.value = e.length;
  if (props.getType === "ACTIVITY") check();
}

function getDataList() {
  loading.value = true;
  if (selectDate.value && selectDate.value[0] && selectDate.value[1]) {
    searchForm.startTime = new Date(selectDate.value[0]).getTime();
    searchForm.endTime = new Date(selectDate.value[1]).getTime();
  } else {
    searchForm.startTime = null;
    searchForm.endTime = null;
  }
  getShopCouponList(searchForm)
    .then((res) => {
      if (res.success) {
        data.value = res.result.records;
        total.value = res.result.total;
        nextTick(() => {
          if (props.selectedList.length) {
            syncTableSelection(props.selectedList);
          }
        });
      }
    })
    .finally(() => {
      loading.value = false;
    });
}

function see(v, only) {
  const data = only ? { onlyView: true, id: v.id } : { id: v.id };
  router.push({ name: "add-coupon", query: data });
}

function close(v) {
  Modal.confirm({
    title: "确认关闭",
    content: "确认要关闭此优惠券么?",
    loading: true,
    onOk: () => {
      updateCouponStatus({
        couponIds: v.id,
        effectiveDays: 0,
      })
        .then((res) => {
          Modal.remove();
          if (res.success) {
            Message.success("优惠券已关闭");
            getDataList();
          }
        })
        .catch(() => {
          Modal.remove();
        });
    },
  });
}

function delAll() {
  if (selectCount.value <= 0) {
    Message.warning("您还未选择要下架的优惠券");
    return;
  }
  Modal.confirm({
    title: "确认下架",
    content: "您确认要下架所选的 " + selectCount.value + " 条数据?",
    loading: true,
    onOk: () => {
      const ids = selectList.value.map((e) => e.id);
      updateCouponStatus({
        couponIds: ids.toString(),
        promotionStatus: "CLOSE",
      }).then((res) => {
        Modal.remove();
        if (res.success) {
          Message.success("下架成功");
          clearSelectAll();
          getDataList();
        }
      });
    },
  });
}

onMounted(() => {
  if (props.getType) {
    searchForm.getType = props.getType;
    showActionColumn.value = false;
  }
  if (props.promotionStatus) {
    searchForm.promotionStatus = props.promotionStatus;
    showStatusColumn.value = false;
  }
  init();
});
</script>

<style scoped>
.activity-coupon-button {
  --el-button-text-color: #b35c12;
  --el-button-bg-color: #fff7ed;
  --el-button-border-color: #fed7aa;
  --el-button-hover-text-color: #9a4b0b;
  --el-button-hover-bg-color: #ffedd5;
  --el-button-hover-border-color: #fdba74;
  --el-button-active-text-color: #9a4b0b;
  --el-button-active-bg-color: #fed7aa;
  --el-button-active-border-color: #fb923c;
  font-weight: 500;
}

.link-text {
  color: #409eff;
  cursor: pointer;
  text-decoration: none;
}
.op-split {
  margin: 0 8px;
  color: #dcdee2;
}
.activity-time {
  line-height: 1.5;
  word-break: break-all;
}
.mb_10 {
  margin-bottom: 10px;
}
.mt_10 {
  margin-top: 10px;
}
.padding-row {
  margin-bottom: 10px;
}
</style>
