<template>
  <div>
    <goods-list :key="`${activeStatus}-${refreshKey}`" scheduled-only :scheduled-status="activeStatus" @edit-schedule="editSchedule" @delete-schedule="deleteSchedule">
      <template #scheduled-controls>
      <el-tabs v-model="activeStatus">
        <el-tab-pane label="定时上架" name="SCHEDULED_UPPER" />
        <el-tab-pane label="定时下架" name="SCHEDULED_DOWN" />
      </el-tabs>
        <div class="schedule-actions">
          <el-button type="primary" @click="openSchedule('UPPER')">添加定时上架</el-button>
          <el-button type="primary" plain @click="openSchedule('DOWN')">添加定时下架</el-button>
        </div>
      </template>
    </goods-list>
    <el-drawer v-model="dialogVisible" :title="dialogTitle" direction="rtl" size="min(560px, 100vw)" :close-on-click-modal="false" :close-on-press-escape="!saving" :show-close="!saving" append-to-body>
      <el-form label-width="90px" @submit.prevent>
        <el-form-item v-if="!editing" label="选择商品" required>
          <div class="selected-goods-field">
            <el-button v-if="!editing" :disabled="saving" @click="openGoodsPicker">选择商品</el-button>
            <span class="selected-count">已选 {{ form.goodsIds.length }} 件商品</span>
            <div v-if="selectedProducts.length" class="selected-products" aria-label="已选商品列表">
              <div v-for="goods in selectedProducts" :key="goods.goodsId" class="selected-product">
                <el-image :src="goods.thumbnail || goods.original" fit="contain" class="selected-product-image">
                  <template #error><span class="selected-product-placeholder">暂无图片</span></template>
                </el-image>
                <div class="selected-product-info">
                  <div class="selected-product-name" :title="goods.goodsName">{{ goods.goodsName }}</div>
                  <div class="selected-product-code">SPU：{{ goods.goodsId }}</div>
                </div>
                <el-button link type="primary" :disabled="saving" :aria-label="`移除${goods.goodsName}`" @click="removeGoods(goods.goodsId)">移除</el-button>
              </div>
            </div>
          </div>
        </el-form-item>
        <el-form-item :label="form.status === 'UPPER' ? '上架时间' : '下架时间'" required>
          <el-date-picker v-model="form.triggerTime" type="datetime" value-format="YYYY-MM-DD HH:mm:ss" placeholder="请选择执行时间" :disabled-date="disabledPastDate" style="width: 100%" />
        </el-form-item>
        <el-form-item label="原因"><el-input v-model="form.reason" maxlength="200" placeholder="选填" /></el-form-item>
      </el-form>
      <template #footer>
        <el-button :disabled="saving" @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="saveSchedule">确定</el-button>
      </template>
    </el-drawer>
    <lili-dialog ref="goodsPicker" product-mode :market-enable="form.status === 'UPPER' ? 'DOWN' : 'UPPER'" auth-flag="" @selected-goods-data="selectGoods" />
  </div>
</template>

<script setup>
/**
 * 商家商品定时上架列表，复用统一的商品筛选和列表布局。
 * @author Bulbasaur
 * @since 2026-11-03
 */
import GoodsList from "@/views/goods/goods-seller/goods.vue";
import { computed, ref } from "vue";
import { scheduleGoodsMarket, cancelGoodsMarketSchedule } from "@/api/goods";
import LiliDialog from "@/views/lili-dialog/index.vue";
import { Message, Modal } from "@/utils/message";

defineOptions({ name: "goodsScheduledUpper" });

const activeStatus = ref("SCHEDULED_UPPER");
const refreshKey = ref(0);
const dialogVisible = ref(false);
const saving = ref(false);
const editing = ref(false);
const goodsPicker = ref(null);
const selectedGoods = ref([]);
const selectedProducts = computed(() => [...new Map(selectedGoods.value.map(goods => [goods.goodsId, goods])).values()]);
const form = ref({ status: "UPPER", goodsIds: [], triggerTime: "", reason: "" });
const dialogTitle = computed(() => `${editing.value ? '编辑' : '添加'}定时${form.value.status === 'UPPER' ? '上架' : '下架'}`);

function openSchedule(status) {
  editing.value = false;
  form.value = { status, goodsIds: [], triggerTime: "", reason: "" };
  selectedGoods.value = [];
  dialogVisible.value = true;
}

function editSchedule(row) {
  const upper = activeStatus.value === "SCHEDULED_UPPER";
  editing.value = true;
  selectedGoods.value = [{ goodsId: row.id, goodsName: row.goodsName }];
  form.value = {
    status: upper ? "UPPER" : "DOWN",
    goodsIds: [row.id],
    triggerTime: (upper ? row.scheduledUpperTime : row.scheduledDownTime) || "",
    reason: (upper ? row.scheduledUpperReason : row.scheduledDownReason) || "",
  };
  dialogVisible.value = true;
}

function deleteSchedule(row) {
  const status = activeStatus.value === "SCHEDULED_UPPER" ? "UPPER" : "DOWN";
  Modal.confirm({
    title: "删除定时计划",
    content: `确认删除“${row.goodsName}”的定时${status === 'UPPER' ? '上架' : '下架'}计划？`,
    onOk: async () => {
      const res = await cancelGoodsMarketSchedule(row.id, status);
      if (res.success) {
        Message.success("定时计划已删除");
        refreshKey.value++;
      }
    },
  });
}

function openGoodsPicker() {
  goodsPicker.value.goodsData = selectedGoods.value.slice();
  goodsPicker.value.open("goods");
}

function selectGoods(goods) {
  selectedGoods.value = (goods || []).filter(item => item.goodsId);
  // 通用选择器返回SKU；上下架按商品操作，同一商品的多个SKU只提交一次。
  form.value.goodsIds = [...new Set(selectedGoods.value.map(item => item.goodsId))];
}

function removeGoods(goodsId) {
  selectGoods(selectedGoods.value.filter(item => item.goodsId !== goodsId));
}

function disabledPastDate(date) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date.getTime() < today.getTime();
}

async function saveSchedule() {
  if (saving.value) return;
  if (!form.value.goodsIds.length) return Message.warning("请选择商品");
  const time = new Date((form.value.triggerTime || "").replace(/-/g, "/")).getTime();
  if (!Number.isFinite(time) || time <= Date.now()) return Message.warning("请选择晚于当前时间的执行时间");
  saving.value = true;
  try {
    const res = await scheduleGoodsMarket({ ...form.value });
    if (res.success) {
      Message.success(editing.value ? "定时计划修改成功" : "定时任务添加成功");
      activeStatus.value = form.value.status === "UPPER" ? "SCHEDULED_UPPER" : "SCHEDULED_DOWN";
      refreshKey.value++;
      dialogVisible.value = false;
    }
  } catch {
    // 保留表单以便重试，请求错误由全局拦截器提示。
  } finally {
    saving.value = false;
  }
}
</script>

<style scoped>
.schedule-actions { margin: 10px 0; }
.selected-goods-field { width: 100%; min-width: 0; }
.selected-count { margin-left: 12px; color: #909399; }
.selected-products {
  width: 100%;
  max-height: 320px;
  overflow-y: auto;
  margin-top: 12px;
  border: 1px solid #ebeef5;
  border-radius: 6px;
}
.selected-product { display: flex; align-items: center; gap: 12px; padding: 12px; }
.selected-product + .selected-product { border-top: 1px solid #ebeef5; }
.selected-product-image { width: 48px; height: 48px; flex-shrink: 0; border-radius: 4px; background: #f5f7fa; }
.selected-product-placeholder { display: flex; align-items: center; justify-content: center; height: 100%; font-size: 11px; color: #909399; }
.selected-product-info { flex: 1; min-width: 0; }
.selected-product-name { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; color: #303133; line-height: 20px; }
.selected-product-code { margin-top: 4px; color: #909399; font-size: 12px; line-height: 18px; overflow-wrap: anywhere; }
</style>
