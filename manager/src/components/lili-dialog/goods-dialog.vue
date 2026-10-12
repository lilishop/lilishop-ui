<template>
  <div class="wrapper">
    <div class="wap-content">
      <div class="query-wrapper">
        <div class="query-item">
          <div>搜索范围</div>
          <el-input
            v-model="goodsParams.goodsName"
            placeholder="商品名称"
            clearable
            style="width: 150px"
            @clear="onSearchGoods"
            @keyup.enter="onSearchGoods"
          />
        </div>
        <div class="query-item">
          <el-cascader
            v-model="category"
            :options="skuList"
            placeholder="请选择商品分类"
            popper-class="goods-dialog-cascader-popper"
            style="width: 250px"
            clearable
          />
        </div>
        <div class="query-item">
          <el-button type="primary" @click="onSearchGoods">搜索</el-button>
        </div>
      </div>
      <div>
        <div class="wap-content-list">
          <div
            class="wap-content-item"
            :class="{ active: item.selected }"
            @click="checkedGoods(item, index)"
            v-for="(item, index) in goodsData"
            :key="index"
          >
            <div>
              <img :src="item.thumbnail" alt="" />
            </div>
            <div class="wap-content-desc">
              <div class="wap-content-desc-title">{{ item.goodsName }}</div>

              <div class="wap-sku">
                {{ item.goodsUnit }}
                <el-tag
                  v-if="item.goodsType"
                  style="margin-left: 6px"
                  size="small"
                  :type="goodsTypeTagType(item.goodsType)"
                >
                  {{ goodsTypeLabel(item.goodsType) }}
                </el-tag>
                <el-tag
                  style="margin-left: 6px"
                  :type="item.salesModel === 'RETAIL' ? 'info' : 'primary'"
                >
                  {{ item.salesModel === "RETAIL" ? "零售型" : "批发型" }}
                </el-tag>
              </div>
              <div class="wap-content-desc-bottom">
                <div>￥{{ $filters.unitPrice(item.price) }}</div>
                <div v-if="item.goodsType === 'E_COUPON'" class="pool-stock-hint">
                  库存 {{ item.quantity != null ? item.quantity : "—" }}（卡池）
                </div>
              </div>
            </div>
          </div>
          <div v-if="loading" v-loading="loading" class="loading-mask" />

          <div v-if="empty" class="empty">暂无商品信息</div>
        </div>
        <el-pagination
          v-model:current-page="goodsParams.pageNumber"
          class="pageration"
          :total="total"
          :page-size="goodsParams.pageSize"
          layout="total, prev, pager, next"
          size="small"
          @current-change="changePageSize"
        />
      </div>
    </div>
  </div>
</template>
<script setup>
import { onMounted, reactive, ref, watch } from "vue";
import * as API_Goods from "@/api/goods";
import { goodsTypeLabel, goodsTypeTagType } from "@/constants/goodsType";

const props = defineProps({
  selectedWay: {
    type: Array,
    default: () => [],
  },
});
const emit = defineEmits(["selected"]);

const type = ref("multiple");
const selectedList = ref([]);
const skuList = ref([]);
const total = ref(0);
const goodsParams = reactive({
  pageNumber: 1,
  pageSize: 15,
  order: "desc",
  goodsName: "",
  sn: "",
  categoryPath: "",
  marketEnable: "UPPER",
  authFlag: "PASS",
  sort: "createTime",
});
const category = ref([]);
const goodsData = ref([]);
const empty = ref(false);
const loading = ref(false);

watch(category, (val) => {
  goodsParams.categoryPath = val && val.length ? val[2] : "";
});
watch(
  () => props.selectedWay,
  (val) => {
    selectedList.value = Array.isArray(val) ? val.slice() : [];
  },
  { deep: true, immediate: true }
);
watch(
  () => goodsParams.categoryPath,
  () => {
    goodsData.value = [];
    goodsParams.pageNumber = 1;
    getQueryGoodsList();
  },
  { deep: true }
);

onMounted(() => {
  init();
});

function onSearchGoods() {
  goodsData.value = [];
  goodsParams.pageNumber = 1;
  getQueryGoodsList();
}
function changePageSize(v) {
  goodsParams.pageNumber = v;
  getQueryGoodsList();
}
function getQueryGoodsList() {
  loading.value = true;
  API_Goods.getGoodsSkuData(goodsParams)
    .then((res) => {
      initGoods(res);
    })
    .finally(() => {
      loading.value = false;
    });
}
function initGoods(res) {
  const records = res?.result?.records || [];
  if (records.length) {
    records.forEach((item) => {
      item.selected = false;
      item.___type = "goods";
      selectedList.value.forEach((e) => {
        if (e.id && e.id === item.id) {
          item.selected = true;
        }
      });
    });
    total.value = res.result.total || 0;
    goodsData.value = records;
    empty.value = false;
  } else {
    goodsData.value = [];
    empty.value = true;
  }
}
function emitSelected(list) {
  selectedList.value = list;
  emit("selected", selectedList.value);
}
function init() {
  API_Goods.getGoodsSkuData(goodsParams).then((res) => {
    initGoods(res);
  });
  API_Goods.getCategoryTree({ deleteFlag: false }).then((res) => {
    if (res.success) {
      deepGroup(res.result);
    }
  });
}
function deepGroup(val) {
  val.forEach((item) => {
    let childWay = [];
    if (item.children) {
      item.children.forEach((child) => {
        if (child.children) {
          child.children.forEach((grandson, index, arr) => {
            arr[index] = {
              value: grandson.id,
              label: grandson.name,
            };
          });
        }
        childWay.push({
          value: child.id,
          label: child.name,
          children: child.children,
        });
      });
    }
    skuList.value.push({
      value: item.id,
      label: item.name,
      children: childWay,
    });
  });
}
function checkedGoods(val) {
  if (type.value !== "multiple") {
    goodsData.value.forEach((item) => {
      item.selected = false;
    });
    val.selected = true;
    emitSelected([val]);
    return;
  }

  if (!val.selected) {
    val.selected = true;
    emitSelected([...selectedList.value, val]);
  } else {
    val.selected = false;
    emitSelected(selectedList.value.filter((item) => item.id !== val.id));
  }
}

// 父组件 lili-dialog/index.vue 通过 $refs.goodsDialog.type = "single" 切换单选；
// expose 的 ref 外部读写等价于原 data 字段
defineExpose({ type });
</script>
<style scoped lang="scss">
@import "./style.scss";
.wap-content {
  width: 100%;
}
.empty {
  text-align: center;
  padding: 8px 0;
  width: 100%;
}
.wap-content {
  flex: 1;
  padding: 0;
}
.wap-content-list {
  display: flex;
  position: relative;
  flex-wrap: wrap;
  height: 340px;
}
.wap-content-item {
  width: 210px;
  margin: 10px 7px;
  padding: 6px 0;
}
.active {
  background: url("../../assets/selected.png") no-repeat;
  background-position: right;
  background-size: 10%;
}
.pageration {
  display: flex;
  justify-content: flex-end;
  width: 100%;
  margin-top: 16px;
  padding-right: 8px;
  box-sizing: border-box;
}
</style>
<style lang="scss">
.pool-stock-hint {
  font-size: 12px;
  color: #999;
  margin-top: 4px;
}
</style>
