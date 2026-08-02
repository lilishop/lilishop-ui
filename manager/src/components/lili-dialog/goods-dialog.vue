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
<script>
import * as API_Goods from "@/api/goods";
import { goodsTypeLabel, goodsTypeTagType } from "@/constants/goodsType";
export default {
  props: {
    selectedWay: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      type: "multiple",
      selectedList: [],
      skuList: [],
      total: 0,
      goodsParams: {
        pageNumber: 1,
        pageSize: 15,
        order: "desc",
        goodsName: "",
        sn: "",
        categoryPath: "",
        marketEnable: "UPPER",
        authFlag: "PASS",
        sort: "createTime",
      },
      category: [],
      goodsData: [],
      empty: false,
      loading: false,
    };
  },
  watch: {
    category(val) {
      this.goodsParams.categoryPath = val && val.length ? val[2] : "";
    },
    selectedWay: {
      handler(val) {
        this.selectedList = Array.isArray(val) ? val.slice() : [];
      },
      deep: true,
      immediate: true,
    },
    "goodsParams.categoryPath": {
      handler() {
        this.goodsData = [];
        this.goodsParams.pageNumber = 1;
        this.getQueryGoodsList();
      },
      deep: true,
    },
  },
  mounted() {
    this.init();
  },
  methods: {
    goodsTypeLabel,
    goodsTypeTagType,
    onSearchGoods() {
      this.goodsData = [];
      this.goodsParams.pageNumber = 1;
      this.getQueryGoodsList();
    },
    changePageSize(v) {
      this.goodsParams.pageNumber = v;
      this.getQueryGoodsList();
    },
    getQueryGoodsList() {
      this.loading = true;
      API_Goods.getGoodsSkuData(this.goodsParams)
        .then((res) => {
          this.initGoods(res);
        })
        .finally(() => {
          this.loading = false;
        });
    },
    initGoods(res) {
      const records = res?.result?.records || [];
      if (records.length) {
        records.forEach((item) => {
          item.selected = false;
          item.___type = "goods";
          this.selectedList.forEach((e) => {
            if (e.id && e.id === item.id) {
              item.selected = true;
            }
          });
        });
        this.total = res.result.total || 0;
        this.goodsData = records;
        this.empty = false;
      } else {
        this.goodsData = [];
        this.empty = true;
      }
    },
    emitSelected(list) {
      this.selectedList = list;
      this.$emit("selected", this.selectedList);
    },
    init() {
      API_Goods.getGoodsSkuData(this.goodsParams).then((res) => {
        this.initGoods(res);
      });
      API_Goods.getCategoryTree({ deleteFlag: false }).then((res) => {
        if (res.success) {
          this.deepGroup(res.result);
        }
      });
    },
    deepGroup(val) {
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
        this.skuList.push({
          value: item.id,
          label: item.name,
          children: childWay,
        });
      });
    },
    checkedGoods(val) {
      if (this.type !== "multiple") {
        this.goodsData.forEach((item) => {
          item.selected = false;
        });
        val.selected = true;
        this.emitSelected([val]);
        return;
      }

      if (!val.selected) {
        val.selected = true;
        this.emitSelected([...this.selectedList, val]);
      } else {
        val.selected = false;
        this.emitSelected(this.selectedList.filter((item) => item.id !== val.id));
      }
    },
  },
};
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
