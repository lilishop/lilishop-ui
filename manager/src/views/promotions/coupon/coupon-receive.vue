<template>
  <div class="search">
    <el-button style="margin-bottom: 10px" @click="back()">返回</el-button>

    <el-card>
      <el-form ref="searchFormRef" :model="searchForm" inline label-width="90px" class="search-form mb_10">
        <el-form-item label="优惠券名称" prop="couponName">
          <el-input
            v-model="searchForm.couponName"
            placeholder="请输入优惠券名称"
            clearable
            style="width: 240px"
          />
        </el-form-item>
        <el-form-item label="会员名称" prop="memberName">
          <el-input
            v-model="searchForm.memberName"
            placeholder="请输入会员名称"
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
        <el-form-item label="优惠券状态" prop="memberCouponStatus">
          <el-select v-model="searchForm.memberCouponStatus" placeholder="请选择" clearable style="width: 240px">
            <el-option label="已领取" value="NEW" />
            <el-option label="已使用" value="USED" />
            <el-option label="已过期" value="EXPIRE" />
            <el-option label="已作废" value="CLOSED" />
          </el-select>
        </el-form-item>
        <el-form-item label="活动时间">
          <el-date-picker
            v-model="selectDate"
            type="daterange"
            clearable
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            placeholder="选择起始时间"
            style="width: 240px"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" class="search-btn" @click="handleSearch">搜索</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card>
      <el-table
        v-if="refreshTable"
        ref="tableRef"
        v-loading="loading"
        border
        :data="data"
        class="mt_10"
        style="width: 100%"
        @selection-change="changeSelect"
      >
        <el-table-column prop="memberName" label="会员名称" min-width="130" fixed="left" />
        <el-table-column prop="couponName" label="优惠券名称" min-width="100" show-overflow-tooltip />
        <el-table-column label="发布店铺" min-width="100">
          <template #default="{ row }">
            <span v-if="row">{{ (row.storeName === "platform" && "平台") || row.storeName }}</span>
          </template>
        </el-table-column>
        <el-table-column label="面额/折扣" width="100">
          <template #default="{ row }">
            <priceColorScheme
              v-if="row && row.couponType === 'PRICE'"
              :value="row.price"
              :color="$mainColor"
            />
            <span v-else-if="row">{{ row.discount }}折</span>
          </template>
        </el-table-column>
        <el-table-column prop="consumeThreshold" label="使用门槛" width="130" />
        <el-table-column label="获取方式" width="120">
          <template #default="{ row }">
            <template v-if="row">
              <el-tag v-if="row.getType === 'FREE'" type="danger">免费获取</el-tag>
              <el-tag v-else-if="row.getType === 'ACTIVITY'" type="warning">活动获取</el-tag>
              <el-tag v-else-if="row.getType === 'INSIDE'" type="success">内购</el-tag>
              <el-tag v-else>未知</el-tag>
            </template>
          </template>
        </el-table-column>
        <el-table-column label="会员优惠券状态" width="130">
          <template #default="{ row }">
            <template v-if="row">
              <el-tag v-if="row.memberCouponStatus == 'NEW'" type="primary">已领取</el-tag>
              <el-tag v-else-if="row.memberCouponStatus == 'USED'" type="success">已使用</el-tag>
              <el-tag v-else-if="row.memberCouponStatus == 'EXPIRE'" type="danger">已过期</el-tag>
              <el-tag v-else-if="row.memberCouponStatus == 'CLOSED'" type="info">已作废</el-tag>
              <el-tag v-else type="danger">未知</el-tag>
            </template>
          </template>
        </el-table-column>
        <el-table-column label="优惠券类型" width="120">
          <template #default="{ row }">
            <template v-if="row">
              <el-tag v-if="row.couponType === 'DISCOUNT'" type="warning">打折</el-tag>
              <el-tag v-else-if="row.couponType === 'PRICE'" type="danger">减免现金</el-tag>
              <el-tag v-else>未知</el-tag>
            </template>
          </template>
        </el-table-column>
        <el-table-column label="品类描述" width="120">
          <template #default="{ row }">
            <template v-if="row">
              <el-tag v-if="row.scopeType == 'ALL'">全品类</el-tag>
              <el-tag v-else-if="row.scopeType == 'PORTION_GOODS_CATEGORY'" type="warning">商品分类</el-tag>
              <el-tag v-else-if="row.scopeType == 'PORTION_SHOP_CATEGORY'" type="danger">店铺分类</el-tag>
              <el-tag v-else-if="row.scopeType == 'PORTION_GOODS'" type="danger">指定商品</el-tag>
              <el-tag v-else type="danger">未知</el-tag>
            </template>
          </template>
        </el-table-column>
        <el-table-column label="有效时间" width="200">
          <template #default="{ row }">
            <template v-if="row">
              <span v-if="row.getType === 'ACTIVITY' && row.rangeDayType === 'DYNAMICTIME'">长期有效</span>
              <div v-else-if="row.startTime && row.endTime">
                {{ row.startTime }}<br />{{ row.endTime }}
              </div>
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
import { onMounted, reactive, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { getCouponReceiveList } from "@/api/promotion";
import { useAppStore } from "@/stores/app";

defineOptions({ name: "coupon-recevie" });

const props = defineProps({
  promotionStatus: {
    type: String,
    default: "",
  },
});
const emit = defineEmits(["selected"]);

const route = useRoute();
const router = useRouter();
const appStore = useAppStore();

const loading = ref(true);
const searchForm = reactive({
  pageNumber: 1,
  pageSize: 20,
  sort: "create_time",
  order: "desc",
  getType: "",
  couponId: route.query.couponId,
});
const selectList = ref([]);
const selectCount = ref(0);
const data = ref([]);
const total = ref(0);
const refreshTable = ref(true);
const selectDate = ref([]);

// 历史遗留：原代码读取未定义属性 this.couponId，恒为 falsy，原样保留
let couponId;
// 历史遗留：原代码读取未定义属性 this.getType，恒为 falsy，原样保留
let getType;

const searchFormRef = ref(null);
const tableRef = ref(null);

watch(
  () => route.query,
  (e) => {
    searchForm.couponId = e.couponId;
    if (couponId) {
      getDataList();
    } else {
      searchFormRef.value?.resetFields();
    }
  }
);

function back() {
  appStore.removeTag("coupon-receive");
  router.go(-1);
}

function check() {
  emit("selected", selectList.value);
}

function init() {
  getDataList();
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

function changeSelect(e) {
  selectList.value = e;
  selectCount.value = e.length;
  if (getType === "ACTIVITY") check();
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
  getCouponReceiveList(searchForm).then((res) => {
    loading.value = false;
    if (res.success) {
      data.value = res.result.records;
      total.value = res.result.total;
    }
  });
}

onMounted(() => {
  init();
});
</script>
