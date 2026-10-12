<template>
  <div>
    <el-dialog
      v-model="selectGoodsType"
      title="选择商品类型"
      width="720px"
      :show-close="false"
      :close-on-click-modal="false"
    >
      <div class="goods-type-cards">
        <button
          type="button"
          class="goods-type-card"
          :class="{ active: pendingGoodsType === item.type }"
          v-for="item in goodsTypeWay"
          :key="item.type"
          @click="handleClickGoodsType(item)"
        >
          <div class="card-icon" :class="item.tone">
            <el-icon :size="26"><component :is="item.icon" /></el-icon>
          </div>
          <div class="card-copy">
            <h3>{{ item.title }}</h3>
            <p>{{ item.desc }}</p>
          </div>
        </button>
      </div>
      <template #footer>
        <div class="goods-type-actions">
          <el-button @click="cancelGoodsType">取消</el-button>
          <el-button type="primary" @click="confirmGoodsType">确认</el-button>
        </div>
      </template>
    </el-dialog>

    <div class="content-goods-publish">
      <div class="goods-category">
        <ul v-if="categoryListLevel1.length > 0">
          <li
            v-for="(item, index) in categoryListLevel1"
            :class="{ activeClass: category[0].name === item.name }"
            @click="handleSelectCategory(item, index, 1)"
            :key="index"
          >
            <span>{{ item.name }}</span>
            <span>&gt;</span>
          </li>
        </ul>
        <ul v-if="categoryListLevel2.length > 0">
          <li
            v-for="(item, index) in categoryListLevel2"
            :class="{ activeClass: category[1].name === item.name }"
            @click="handleSelectCategory(item, index, 2)"
            :key="index"
          >
            <span>{{ item.name }}</span>
            <span>&gt;</span>
          </li>
        </ul>
        <ul v-if="categoryListLevel3.length > 0">
          <li
            v-for="(item, index) in categoryListLevel3"
            :class="{ activeClass: category[2].name === item.name }"
            @click="handleSelectCategory(item, index, 3)"
            :key="index"
          >
            <span>{{ item.name }}</span>
          </li>
        </ul>
      </div>
      <p class="current-goods-category">
        您当前选择：
        <span v-if="selectedTypeTitle">{{ selectedTypeTitle }}</span>
        <span v-else>未选择商品类型</span>
        <span v-show="category[0].name"> ／ {{ category[0].name }}</span>
        <span v-show="category[1].name">> {{ category[1].name }}</span>
        <span v-show="category[2].name">> {{ category[2].name }}</span>
      </p>
    </div>
    <div class="footer">
      <div class="footer-btns">
        <el-button type="primary" @click="openGoodsTypeDialog">商品类型</el-button>
        <el-button type="primary" @click="next">下一步</el-button>
      </div>
    </div>
  </div>
</template>
<script setup>
import { computed, markRaw, onMounted, ref, watch } from "vue";
import * as API_GOODS from "@/api/goods";
import { Box, Calendar, CreditCard, Ticket } from "@element-plus/icons-vue";
import { Message } from "@/utils/message";

const emit = defineEmits(["change"]);

const selectGoodsType = ref(false);
// icon 直接存组件对象：<script setup> 下无 components 选项，字符串名无法在 <component :is> 中解析
const goodsTypeWay = ref([
  {
    title: "实物商品",
    desc: "零售批发，物流配送",
    type: "PHYSICAL_GOODS",
    icon: markRaw(Box),
    tone: "tone-physical",
  },
  {
    title: "虚拟商品",
    desc: "虚拟核验，无需物流",
    type: "VIRTUAL_GOODS",
    icon: markRaw(Ticket),
    tone: "tone-virtual",
  },
  {
    title: "电子卡券",
    desc: "卡密自动发卡，无需物流",
    type: "E_COUPON",
    icon: markRaw(CreditCard),
    tone: "tone-coupon",
  },
  {
    title: "预约商品",
    desc: "时段预约，到店或上门",
    type: "APPOINTMENT_GOODS",
    icon: markRaw(Calendar),
    tone: "tone-appointment",
  },
]);
const category = ref([
  { name: "", id: "" },
  { name: "", id: "" },
  { name: "", id: "" },
]);
const goodsType = ref("");
const pendingGoodsType = ref("");
const categoryListLevel1 = ref([]);
const categoryListLevel2 = ref([]);
const categoryListLevel3 = ref([]);

const selectedTypeTitle = computed(() => {
  const hit = goodsTypeWay.value.find((item) => item.type === goodsType.value);
  return hit ? hit.title : "";
});

watch(selectGoodsType, (val) => {
  if (val) {
    syncGoodsTypeSelection();
  }
});

function syncGoodsTypeSelection() {
  pendingGoodsType.value = goodsType.value;
}
function openGoodsTypeDialog() {
  selectGoodsType.value = true;
}
function handleClickGoodsType(item) {
  pendingGoodsType.value = item.type;
}
function cancelGoodsType() {
  syncGoodsTypeSelection();
  selectGoodsType.value = false;
}
function confirmGoodsType() {
  if (!pendingGoodsType.value) {
    Message.error("请选择商品类型");
    return;
  }
  goodsType.value = pendingGoodsType.value;
  selectGoodsType.value = false;
}
function handleSelectCategory(row, index, level) {
  if (level === 1) {
    category.value.forEach((cate) => {
      (cate.name = ""), (cate.id = "");
    });
    category.value[0].name = row.name;
    category.value[0].id = row.id;
    categoryListLevel2.value = categoryListLevel1.value[index].children;
    categoryListLevel3.value = [];
  } else if (level === 2) {
    category.value[1].name = row.name;
    category.value[1].id = row.id;
    category.value[2].name = "";
    category.value[2].id = "";
    categoryListLevel3.value = categoryListLevel2.value[index].children;
  } else {
    category.value[2].name = row.name;
    category.value[2].id = row.id;
  }
}
function GET_NextLevelCategory() {
  API_GOODS.getGoodsCategoryAll().then((res) => {
    if (res.success && res.result) {
      categoryListLevel1.value = res.result;
    }
  });
}
function next() {
  window.scrollTo(0, 0);
  if (!goodsType.value) {
    Message.error("请选择商品类型");
    openGoodsTypeDialog();
    return;
  }
  if (!category.value[0].name) {
    Message.error("请选择商品分类");
    return;
  } else if (!category.value[2].name) {
    Message.error("必须选择到三级分类");
    return;
  }
  emit("change", {
    category: category.value,
    goodsType: goodsType.value,
  });
}

onMounted(() => {
  GET_NextLevelCategory();
});

// 父组件 goodsOperation.vue 通过 ref 直接赋值 selectGoodsType 打开弹窗
defineExpose({ selectGoodsType });
</script>
<style lang="scss" scoped>
@import "./addGoods.scss";

.footer {
  display: flex;
  justify-content: center;
}

.footer-btns {
  display: flex;
  gap: 12px;
  justify-content: center;
}

.goods-type-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  width: 100%;
}

.content-goods-publish {
  .goods-category li.activeClass {
    background-color: #409eff;
    border-color: #409eff;
    color: #fff;
  }
}

.goods-type-cards {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.goods-type-card {
  position: relative;
  display: flex;
  align-items: flex-start;
  gap: 12px;
  width: 100%;
  padding: 18px 16px;
  border: 1px solid #ebeef5;
  border-radius: 10px;
  background: #fff;
  text-align: left;
  cursor: pointer;
  transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
}

.goods-type-card:hover {
  border-color: #c6e2ff;
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.08);
}

.goods-type-card.active {
  border-color: #409eff;
  background: #f5faff;
  box-shadow: 0 0 0 1px #409eff inset;
}

.card-icon {
  flex: none;
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
}

.tone-physical {
  background: #409eff;
}

.tone-virtual {
  background: #909399;
}

.tone-coupon {
  background: #e6a23c;
}

.tone-appointment {
  background: #67c23a;
}

.card-copy h3 {
  margin: 0;
  font-size: 15px;
  line-height: 22px;
  color: #303133;
  font-weight: 600;
}

.card-copy p {
  margin: 4px 0 0;
  font-size: 12px;
  line-height: 18px;
  color: #909399;
}
</style>
