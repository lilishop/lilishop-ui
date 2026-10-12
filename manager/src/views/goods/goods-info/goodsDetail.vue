<template>
  <div class="goods-detail-page" v-loading="loading">
    <el-dialog v-model="goodsPictureVisible" title="预览图片" width="720px">
      <img v-if="goodsPictureVisible" :src="previewGoodsPicture" class="preview-image" alt="" />
    </el-dialog>

    <el-dialog
      v-model="auditModalVisible"
      title="商品审核"
      width="500px"
      :close-on-click-modal="false"
      destroy-on-close
    >
      <el-form ref="auditForm" :model="goodsAuditForm" label-width="100px">
        <el-form-item label="审核结果" prop="auth_flag">
          <el-radio-group v-model="goodsAuditForm.auth_flag">
            <el-radio :value="1">审核通过</el-radio>
            <el-radio :value="2">审核拒绝</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="auditModalVisible = false">取消</el-button>
        <el-button type="primary" :loading="auditSubmitLoading" @click="submitAudit">提交审核</el-button>
      </template>
    </el-dialog>

    <el-drawer
      v-model="slotCapacityVisible"
      title="时段可约数量"
      size="440px"
      direction="rtl"
      append-to-body
      destroy-on-close
      class="slot-capacity-drawer"
    >
      <div v-if="currentSlotCapacities.length" class="slot-drawer-body">
        <div class="slot-drawer-list">
          <div
            v-for="(row, index) in currentSlotCapacities"
            :key="`${row.startTime}-${row.endTime}-${index}`"
            class="slot-drawer-list-item"
          >
            <div class="slot-drawer-list-main">
              <span class="slot-drawer-list-no">{{ index + 1 }}</span>
              <span class="slot-drawer-list-time">{{ row.startTime }} ~ {{ row.endTime }}</span>
            </div>
            <span
              class="slot-drawer-list-qty"
              :class="{ 'is-unlimited': !Number(row.capacity) }"
            >
              {{ formatSlotCapacity(row.capacity) }}
            </span>
          </div>
        </div>
      </div>

      <el-empty v-else class="slot-drawer-empty" description="暂无时段可约数量" :image-size="72" />
    </el-drawer>

    <div v-if="goods.id" class="goods-detail-summary">
      <img v-if="goods.thumbnail" :src="goods.thumbnail" class="goods-detail-summary-thumb" alt="" />
      <div class="goods-detail-summary-main">
        <h2 class="goods-detail-summary-title">{{ goods.goodsName }}</h2>
        <div class="goods-detail-summary-meta">
          <el-tag size="small">{{ goodsTypeText(goods.goodsType) }}</el-tag>
          <el-tag size="small" :type="goods.marketEnable === 'UPPER' ? 'success' : 'info'">
            {{ marketEnableText(goods.marketEnable) }}
          </el-tag>
          <el-tag size="small" :type="authFlagTagType(goods.authFlag)">
            {{ authFlagText(goods.authFlag) }}
          </el-tag>
        </div>
        <div class="goods-detail-summary-price">
          <priceColorScheme :value="goods.price" :color="$mainColor" />
        </div>
      </div>
      <div v-if="goods.authFlag === 'TOBEAUDITED'" class="goods-detail-summary-actions">
        <el-button type="primary" @click="openAuditModal">审核</el-button>
      </div>
    </div>

    <div ref="sectionNav" class="goods-section-nav">
      <button
        v-for="(tab, index) in sectionTabs"
        :key="tab.name"
        type="button"
        class="goods-section-nav-item"
        :class="{ active: activeTab === tab.name }"
        @click="jumpToTab(tab.name)"
      >
        <span class="goods-section-nav-index">{{ index + 1 }}</span>
        {{ tab.label }}
      </button>
    </div>

    <el-form label-width="120px" class="goods-detail-form">
      <!-- 基础信息 -->
      <div id="goods-section-basic" class="goods-section" data-section="basic">
        <div class="goods-section-hd">
          <span class="goods-section-index">{{ sectionNo("basic") }}</span>
          <div class="goods-section-hd-text">
            <h3>基础信息</h3>
            <p>类目、标题、品牌与计量单位</p>
          </div>
        </div>
        <div class="goods-section-bd">
          <el-form-item label="商品ID">
            <span class="detail-value">{{ goods.id || "—" }}</span>
          </el-form-item>
          <el-form-item label="店铺名称">
            <span class="detail-value">{{ goods.storeName || "—" }}</span>
          </el-form-item>
          <el-form-item label="商品分类">
            <span class="detail-value">{{ categoryText }}</span>
          </el-form-item>
          <el-form-item label="商品名称">
            <span class="detail-value">{{ goods.goodsName || "—" }}</span>
          </el-form-item>
          <el-form-item label="商品价格">
            <priceColorScheme :value="goods.price" :color="$mainColor" />
          </el-form-item>
          <el-form-item label="商品卖点">
            <span class="detail-value">{{ goods.sellingPoint || "—" }}</span>
          </el-form-item>
          <el-form-item label="商品品牌">
            <span class="detail-value">{{ brandText(goods.brandId) }}</span>
          </el-form-item>
          <el-form-item label="商品类型">
            <span class="detail-value">{{ goodsTypeText(goods.goodsType) }}</span>
          </el-form-item>
          <el-form-item label="计量单位">
            <span class="detail-value">{{ goods.goodsUnit || "—" }}</span>
          </el-form-item>

          <div v-if="displayGoodsParams.length" class="goods-submodule">
            <div class="goods-submodule-hd">商品参数</div>
            <el-form-item
              v-for="(item, index) in displayGoodsParams"
              :key="item.paramId || `${item.paramName}-${index}`"
              :label="item.paramName"
            >
              <span class="detail-value">{{ item.paramValue || "—" }}</span>
            </el-form-item>
          </div>
        </div>
      </div>

      <!-- 图文信息 -->
      <div id="goods-section-media" class="goods-section" data-section="media">
        <div class="goods-section-hd">
          <span class="goods-section-index">{{ sectionNo("media") }}</span>
          <div class="goods-section-hd-text">
            <h3>图文信息</h3>
            <p>主图、视频与商品详情描述</p>
          </div>
        </div>
        <div class="goods-section-bd">
          <el-form-item label="商品主图">
            <div v-if="goods.goodsGalleryList && goods.goodsGalleryList.length" class="gallery-list">
              <div
                v-for="(item, index) in goods.goodsGalleryList"
                :key="index"
                class="demo-upload-list"
                @click="handleViewGoodsPicture(item)"
              >
                <img :src="item" alt="" />
                <div class="demo-upload-list-cover">
                  <el-icon class="preview-icon"><View /></el-icon>
                </div>
              </div>
            </div>
            <span v-else class="detail-value muted">暂无主图</span>
          </el-form-item>
          <el-form-item label="主图视频">
            <video v-if="goods.goodsVideo" controls class="goods-video-player" :src="goods.goodsVideo" />
            <span v-else class="detail-value muted">暂无视频</span>
          </el-form-item>
          <div class="goods-submodule">
            <div class="goods-submodule-hd">PC商品描述</div>
            <div class="goods-desc-content" v-html="goods.intro || '<p>—</p>'"></div>
          </div>
          <div class="goods-submodule">
            <div class="goods-submodule-hd">移动端描述</div>
            <div class="goods-desc-content" v-html="goods.mobileIntro || '<p>—</p>'"></div>
          </div>
        </div>
      </div>

      <!-- 预约规则 -->
      <div
        v-if="isAppointmentGoods"
        id="goods-section-appointment"
        class="goods-section"
        data-section="appointment"
      >
        <div class="goods-section-hd">
          <span class="goods-section-index">{{ sectionNo("appointment") }}</span>
          <div class="goods-section-hd-text">
            <h3>预约规则</h3>
            <p>可约日期、取消规则与时段划分</p>
          </div>
        </div>
        <div class="goods-section-bd">
          <el-descriptions v-if="appointmentSettings" :column="2" border>
            <el-descriptions-item label="服务方式">
              {{ formatServiceModes(appointmentSettings.serviceModes) }}
            </el-descriptions-item>
            <el-descriptions-item label="显示剩余数量">
              {{ appointmentSettings.showRemainingQty ? "是" : "否" }}
            </el-descriptions-item>
            <el-descriptions-item label="可预约日期">
              {{ bookableDateText }}
            </el-descriptions-item>
            <el-descriptions-item label="预约日期范围">
              {{ bookableDaysText }}
            </el-descriptions-item>
            <el-descriptions-item label="提前预约">
              {{ advanceBookingText }}
            </el-descriptions-item>
            <el-descriptions-item label="取消订单">
              {{ cancelRuleText }}
            </el-descriptions-item>
            <el-descriptions-item label="表单信息">
              {{ formSubmitText }}
            </el-descriptions-item>
          </el-descriptions>
          <div v-if="appointmentSlots.length" class="goods-submodule">
            <div class="goods-submodule-hd">预约时段</div>
            <el-table :data="appointmentSlots" border style="width: 100%">
              <el-table-column label="开始时间" prop="startTime" min-width="120" />
              <el-table-column label="结束时间" prop="endTime" min-width="120" />
              <el-table-column label="启用" width="90" align="center">
                <template #default="{ row }">
                  {{ row.slotEnabled ? "是" : "否" }}
                </template>
              </el-table-column>
            </el-table>
          </div>
        </div>
      </div>

      <!-- 价格库存 -->
      <div id="goods-section-price" class="goods-section" data-section="price">
        <div class="goods-section-hd">
          <span class="goods-section-index">{{ sectionNo("price") }}</span>
          <div class="goods-section-hd-text">
            <h3>价格库存</h3>
            <p>销售模式、规格与库存</p>
          </div>
        </div>
        <div class="goods-section-bd">
          <el-form-item label="销售模式">
            <span class="detail-value">{{ salesModelDisplayText }}</span>
          </el-form-item>
          <el-form-item v-if="goods.salesModel === 'WHOLESALE'" label="销售规则">
            <el-table border :data="wholesaleData" style="width: 100%">
              <el-table-column label="销售规则" min-width="320">
                <template #default="{ row }">
                  <span v-if="row">
                    当商品购买数量 ≥ {{ row.num }} 时，售价为 ￥{{ row.price }} / {{ goods.goodsUnit || "件" }}
                  </span>
                </template>
              </el-table-column>
            </el-table>
          </el-form-item>
          <div class="goods-submodule">
            <div class="goods-submodule-hd">SKU 规格</div>
            <el-table :data="skuData" border style="width: 100%">
              <el-table-column prop="id" label="SKU ID" min-width="180" show-overflow-tooltip />
              <el-table-column prop="specs" label="规格" min-width="160" show-overflow-tooltip />
              <el-table-column prop="sn" label="货号" min-width="120" show-overflow-tooltip />
              <el-table-column v-if="goods.salesModel !== 'WHOLESALE'" label="价格" width="120">
                <template #default="{ row }">
                  <priceColorScheme v-if="row" :value="row.price" :color="$mainColor" />
                </template>
              </el-table-column>
              <el-table-column
                v-if="!isAppointmentGoods && goods.salesModel !== 'WHOLESALE'"
                prop="quantity"
                label="库存"
                width="90"
                align="center"
              />
              <el-table-column
                v-if="isAppointmentGoods"
                label="时段可约数量"
                width="130"
                align="center"
              >
                <template #default="{ row }">
                  <el-button
                    v-if="hasSlotCapacities(row)"
                    link
                    type="primary"
                    @click="openSlotCapacityDialog(row)"
                  >
                    可预约数量
                  </el-button>
                  <span v-else class="muted">—</span>
                </template>
              </el-table-column>
              <el-table-column
                v-if="needsLogistics"
                prop="weight"
                label="重量(kg)"
                width="100"
                align="center"
              />
              <el-table-column label="规格图片" min-width="160">
                <template #default="{ row }">
                  <div v-if="row && row.image && row.image.length" class="sku-image-list">
                    <img
                      v-for="(item, index) in row.image"
                      :key="index"
                      :src="item"
                      class="sku-image"
                      alt=""
                      @click="handleViewGoodsPicture(item)"
                    />
                  </div>
                  <span v-else class="muted">—</span>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </div>
      </div>

      <!-- 其他信息 -->
      <div id="goods-section-other" class="goods-section" data-section="other">
        <div class="goods-section-hd">
          <span class="goods-section-index">{{ sectionNo("other") }}</span>
          <div class="goods-section-hd-text">
            <h3>其他信息</h3>
            <p>上架状态、审核与统计信息</p>
          </div>
        </div>
        <div class="goods-section-bd">
          <el-form-item label="上架状态">
            <span class="detail-value">{{ marketEnableText(goods.marketEnable) }}</span>
          </el-form-item>
          <el-form-item label="审核状态">
            <el-tag :type="authFlagTagType(goods.authFlag)">{{ authFlagText(goods.authFlag) }}</el-tag>
            <el-button
              v-if="goods.authFlag === 'TOBEAUDITED'"
              type="primary"
              link
              class="audit-inline-btn"
              @click="openAuditModal"
            >
              审核
            </el-button>
          </el-form-item>
          <el-form-item v-if="goods.authMessage" label="审核说明">
            <span class="detail-value">{{ goods.authMessage }}</span>
          </el-form-item>
          <el-form-item label="推荐商品">
            <span class="detail-value">{{ goods.recommend ? "是" : "否" }}</span>
          </el-form-item>
          <el-form-item label="总库存">
            <span class="detail-value">{{ goods.quantity ?? "—" }}</span>
          </el-form-item>
          <el-form-item label="销量">
            <span class="detail-value">{{ goods.buyCount ?? 0 }}</span>
          </el-form-item>
          <el-form-item label="创建时间">
            <span class="detail-value">{{ goods.createTime || "—" }}</span>
          </el-form-item>
          <el-form-item label="更新时间">
            <span class="detail-value">{{ goods.updateTime || "—" }}</span>
          </el-form-item>
        </div>
      </div>
    </el-form>
  </div>
</template>

<script setup>
import { computed, nextTick, onMounted, reactive, ref } from "vue";
import { useRoute } from "vue-router";
import { View } from "@element-plus/icons-vue";
import { authGoods, getBrandListData, getGoodsDetail } from "@/api/goods";
import { ElMessage } from "element-plus";

defineOptions({ name: "goodsDetail" });

const route = useRoute();

const loading = ref(false);
const goods = ref({});
const brandList = ref([]);
const previewGoodsPicture = ref("");
const goodsPictureVisible = ref(false);
const wholesaleData = ref([]);
const skuData = ref([]);
const activeTab = ref("basic");
const slotCapacityVisible = ref(false);
const currentSlotCapacities = ref([]);
const goodsAuditForm = reactive({
  auth_flag: 1,
});
const auditModalVisible = ref(false);
const auditSubmitLoading = ref(false);

const isAppointmentGoods = computed(() => {
  return goods.value.goodsType === "APPOINTMENT_GOODS";
});
const needsLogistics = computed(() => {
  return goods.value.goodsType === "PHYSICAL_GOODS";
});
const salesModelDisplayText = computed(() => {
  const type = goods.value.goodsType;
  const model = goods.value.salesModel;
  if (type === "APPOINTMENT_GOODS") return "预约型";
  if (type === "E_COUPON") return "电子卡券";
  if (type === "VIRTUAL_GOODS") return "虚拟型";
  if (model === "WHOLESALE") return "批发型";
  if (model === "RETAIL") return "零售型";
  return model || "—";
});
const sectionTabs = computed(() => {
  const tabs = [
    { name: "basic", label: "基础信息" },
    { name: "media", label: "图文信息" },
  ];
  if (isAppointmentGoods.value) {
    tabs.push({ name: "appointment", label: "预约规则" });
  }
  tabs.push(
    { name: "price", label: "价格库存" },
    { name: "other", label: "其他信息" },
  );
  return tabs;
});
const categoryText = computed(() => {
  const names = goods.value.categoryName;
  if (!names || !names.length) return "—";
  return names.join(" > ");
});
/** 兼容扁平列表与历史嵌套分组两种 params 结构 */
const displayGoodsParams = computed(() => {
  let list = goods.value.goodsParamsDTOList;
  if ((!Array.isArray(list) || !list.length) && goods.value.params) {
    list = parseParamsJson(goods.value.params);
  }
  if (!Array.isArray(list) || !list.length) return [];
  const flat = [];
  list.forEach((item) => {
    if (Array.isArray(item?.goodsParamsItemDTOList) && item.goodsParamsItemDTOList.length) {
      item.goodsParamsItemDTOList.forEach((child) => {
        if (child?.paramName) flat.push(child);
      });
    } else if (item?.paramName) {
      flat.push(item);
    }
  });
  return flat;
});
const appointmentSettings = computed(() => {
  return goods.value.appointmentSettings || null;
});
const appointmentSlotTemplate = computed(() => {
  return goods.value.appointmentSlotTemplate || null;
});
const appointmentSlots = computed(() => {
  return appointmentSlotTemplate.value?.slots || [];
});
const bookableDateText = computed(() => {
  const s = appointmentSettings.value;
  if (!s) return "—";
  if (s.bookableDateMode === "CUSTOM") {
    const parts = [];
    if (s.bookableCustomStartDate && s.bookableCustomEndDate) {
      parts.push(`${s.bookableCustomStartDate} ~ ${s.bookableCustomEndDate}`);
    }
    const weekdays = formatWeekdays(s.bookableWeekdays);
    if (weekdays) parts.push(weekdays);
    return parts.length ? parts.join("；") : "自定义";
  }
  if (s.bookableDateMode === "EVERY_DAY") return "每天";
  return "—";
});
const bookableDaysText = computed(() => {
  const s = appointmentSettings.value;
  if (!s || s.bookableDays == null) return "—";
  return `对用户展示 ${s.bookableDays} 天内的可预约日期`;
});
const advanceBookingText = computed(() => {
  const s = appointmentSettings.value;
  if (!s) return "—";
  if (s.advanceMode === "NONE") return "无需提前预约";
  if (s.advanceMode === "REQUIRE_HOURS" && s.advanceHours != null) {
    return `需提前 ${s.advanceHours} 小时进行预约`;
  }
  return "—";
});
const cancelRuleText = computed(() => {
  const s = appointmentSettings.value;
  if (!s) return "—";
  if (s.cancelMode === "NOT_ALLOWED") return "不允许取消";
  if (s.cancelMode === "ALLOW_BEFORE_HOURS" && s.cancelAheadHours != null) {
    return `服务开始 ${s.cancelAheadHours} 小时之前，允许取消并自动退款`;
  }
  return "—";
});
const formSubmitText = computed(() => {
  const s = appointmentSettings.value;
  if (!s) return "—";
  if (s.formSubmitMode === "PER_APPOINTMENT") return "每个预约提交一次";
  if (s.formSubmitMode === "PER_ORDER") return "每单提交一次";
  return "—";
});

onMounted(() => {
  loadBrandList();
  initGoods(route.query.id);
});

function sectionNo(name) {
  const index = sectionTabs.value.findIndex((tab) => tab.name === name);
  return index >= 0 ? index + 1 : "";
}
function parseParamsJson(paramsJson) {
  if (!paramsJson) return [];
  try {
    const array = JSON.parse(paramsJson);
    if (!Array.isArray(array)) return [];
    const items = [];
    array.forEach((element) => {
      if (Array.isArray(element?.goodsParamsItemDTOList)) {
        items.push(...element.goodsParamsItemDTOList);
      } else if (element?.paramName) {
        items.push(element);
      }
    });
    return items;
  } catch {
    return [];
  }
}
function jumpToTab(name) {
  activeTab.value = name;
  nextTick(() => {
    const el = document.getElementById(`goods-section-${name}`);
    el?.scrollIntoView({ behavior: "smooth", block: "start" });
  });
}
function loadBrandList() {
  getBrandListData().then((res) => {
    brandList.value = Array.isArray(res) ? res : res?.result || [];
  });
}
function initGoods(id) {
  if (!id) return;
  loading.value = true;
  getGoodsDetail(id)
    .then((res) => {
      if (!res?.success) return;
      goods.value = res.result || {};
      skuData.value = (res.result?.skuList || []).map((sku) => ({
        id: sku.id,
        specs: sku.simpleSpecs || sku.goodsName,
        sn: sku.sn,
        weight: sku.weight,
        price: sku.price,
        image: sku.goodsGalleryList,
        quantity: sku.quantity,
        slotCapacities: sku.slotCapacities,
      }));
      wholesaleData.value = res.result?.wholesaleList || [];
    })
    .finally(() => {
      loading.value = false;
    });
}
function brandText(brandId) {
  if (!brandId || brandId === "0") return "—";
  const brand = brandList.value.find((item) => String(item.id) === String(brandId));
  return brand?.name || brandId;
}
function goodsTypeText(v) {
  if (v === "PHYSICAL_GOODS") return "实物商品";
  if (v === "VIRTUAL_GOODS") return "虚拟商品";
  if (v === "E_COUPON") return "电子卡券";
  if (v === "APPOINTMENT_GOODS") return "预约商品";
  return v || "—";
}
function normalizeSlotCapacities(caps) {
  if (!Array.isArray(caps) || !caps.length) return [];
  return caps.map((item) => ({
    startTime: item.startTime || "",
    endTime: item.endTime || "",
    capacity: item.slotCapacity ?? item.capacity ?? 0,
  }));
}
function hasSlotCapacities(row) {
  return slotCapacityCount(row) > 0;
}
function slotCapacityCount(row) {
  return normalizeSlotCapacities(row?.slotCapacities).length;
}
function openSlotCapacityDialog(row) {
  currentSlotCapacities.value = normalizeSlotCapacities(row?.slotCapacities);
  slotCapacityVisible.value = true;
}
function formatSlotCapacity(capacity) {
  const value = Number(capacity);
  if (!value) return "不限制";
  return String(value);
}
function marketEnableText(v) {
  if (v === "UPPER") return "上架";
  if (v === "DOWN") return "下架";
  return "—";
}
function authFlagText(v) {
  if (v === "TOBEAUDITED") return "待审核";
  if (v === "PASS") return "通过";
  if (v === "REFUSE") return "拒绝";
  return v || "—";
}
function authFlagTagType(v) {
  if (v === "PASS") return "success";
  if (v === "TOBEAUDITED") return "warning";
  if (v === "REFUSE") return "danger";
  return "info";
}
function formatServiceModes(modes) {
  if (!modes || !modes.length) return "—";
  const map = {
    IN_STORE: "到店服务",
    ON_SITE: "上门服务",
  };
  return modes.map((m) => map[m] || m).join("、");
}
function formatWeekdays(weekdays) {
  if (!Array.isArray(weekdays) || !weekdays.length) return "";
  const map = {
    1: "周一",
    2: "周二",
    3: "周三",
    4: "周四",
    5: "周五",
    6: "周六",
    7: "周日",
  };
  return weekdays.map((d) => map[d] || d).join("、");
}
function handleViewGoodsPicture(url) {
  previewGoodsPicture.value = url;
  goodsPictureVisible.value = true;
}
function openAuditModal() {
  goodsAuditForm.auth_flag = 1;
  auditSubmitLoading.value = false;
  auditModalVisible.value = true;
}
function submitAudit() {
  if (!goods.value.id) return;
  auditSubmitLoading.value = true;
  const formData = new FormData();
  formData.append("goodsIds", goods.value.id);
  formData.append("authFlag", goodsAuditForm.auth_flag === 1 ? "PASS" : "REFUSE");
  authGoods(formData)
    .then((res) => {
      if (res.success) {
        ElMessage.success("审核成功");
        auditModalVisible.value = false;
        initGoods(goods.value.id);
      }
    })
    .finally(() => {
      auditSubmitLoading.value = false;
    });
}
</script>

<style lang="scss" scoped>
.goods-detail-page {
  padding: 12px;
}

.goods-detail-summary {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 12px;
  padding: 20px 24px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
}

.goods-detail-summary-main {
  flex: 1;
  min-width: 0;
}

.goods-detail-summary-actions {
  flex-shrink: 0;
  margin-left: auto;
}

.audit-inline-btn {
  margin-left: 12px;
  vertical-align: middle;
}

.goods-detail-summary-thumb {
  width: 88px;
  height: 88px;
  object-fit: cover;
  border-radius: 8px;
  border: 1px solid #f0f0f0;
  flex-shrink: 0;
}

.goods-detail-summary-title {
  margin: 0 0 10px;
  color: #252931;
  font-size: 18px;
  font-weight: 600;
  line-height: 1.4;
}

.goods-detail-summary-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 10px;
}

.goods-detail-summary-price {
  font-size: 18px;
  font-weight: 600;
}

.goods-section-nav {
  position: sticky;
  top: 0;
  z-index: 20;
  display: flex;
  align-items: center;
  height: 56px;
  margin: 0 0 12px;
  padding: 0 12px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
}

.goods-section-nav-item {
  position: relative;
  display: inline-flex;
  align-items: center;
  height: 56px;
  padding: 0 18px;
  border: none;
  background: transparent;
  color: #555;
  font-size: 14px;
  cursor: pointer;
}

.goods-section-nav-index {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  margin-right: 8px;
  border: 1px solid #c9cdd4;
  border-radius: 50%;
  color: #85878a;
  font-size: 12px;
  line-height: 18px;
}

.goods-section-nav-item.active {
  color: var(--el-color-primary);
  font-weight: 600;
}

.goods-section-nav-item.active .goods-section-nav-index {
  border-color: var(--el-color-primary);
  background: var(--el-color-primary);
  color: #fff;
}

.goods-section-nav-item.active::after {
  content: "";
  position: absolute;
  left: 18px;
  right: 18px;
  bottom: 0;
  height: 2px;
  background: var(--el-color-primary);
}

.goods-section-nav-item:hover {
  color: var(--el-color-primary);
}

.goods-section {
  scroll-margin-top: 68px;
  margin-bottom: 12px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
}

.goods-section-hd {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 20px 24px 16px;
  border-bottom: 1px solid #f0f0f0;
}

.goods-section-index {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  margin-top: 1px;
  border-radius: 50%;
  background: var(--el-color-primary);
  color: #fff;
  font-size: 13px;
  font-weight: 600;
  line-height: 24px;
  flex-shrink: 0;
}

.goods-section-hd-text h3 {
  margin: 0;
  color: #252931;
  font-size: 16px;
  font-weight: 600;
  line-height: 24px;
}

.goods-section-hd-text p {
  margin: 2px 0 0;
  color: #85878a;
  font-size: 12px;
  line-height: 18px;
}

.goods-section-bd {
  padding: 20px 24px 24px;
}

.goods-detail-form :deep(.el-form-item) {
  margin-bottom: 16px;
}

.detail-value {
  color: #252931;
  line-height: 24px;
  word-break: break-word;
}

.detail-value.muted,
.muted {
  color: #909399;
}

.goods-submodule {
  margin-top: 8px;
  padding-top: 20px;
  border-top: 1px dashed #eee;
}

.goods-submodule-hd {
  margin: 0 0 16px;
  padding-left: 8px;
  border-left: 3px solid var(--el-color-primary);
  color: #252931;
  font-size: 14px;
  font-weight: 600;
  line-height: 16px;
}

.param-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.param-tag {
  margin: 0;
}

.gallery-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.demo-upload-list {
  position: relative;
  width: 88px;
  height: 88px;
  overflow: hidden;
  border: 1px solid #ebeef5;
  border-radius: 6px;
  cursor: pointer;
}

.demo-upload-list img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.demo-upload-list-cover {
  display: none;
  position: absolute;
  inset: 0;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.45);
}

.demo-upload-list:hover .demo-upload-list-cover {
  display: flex;
}

.preview-icon {
  color: #fff;
  font-size: 22px;
}

.preview-image {
  width: 100%;
}

.goods-video-player {
  max-width: 420px;
  max-height: 240px;
  border-radius: 6px;
  background: #000;
}

.goods-desc-content {
  padding: 12px 16px;
  background: #fafafa;
  border: 1px solid #f0f0f0;
  border-radius: 6px;
  line-height: 1.6;
  word-break: break-word;
}

.goods-desc-content :deep(img) {
  max-width: 100%;
}

.sku-image-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.sku-image {
  width: 48px;
  height: 48px;
  object-fit: cover;
  border-radius: 4px;
  cursor: pointer;
}

</style>

<style lang="scss">
/* append-to-body 抽屉需非 scoped，与平台 detail 抽屉一致 */
.slot-capacity-drawer {
  .el-drawer__header {
    margin-bottom: 0;
    padding: 16px 24px;
    border-bottom: 1px solid #e8eaec;
  }

  .el-drawer__title {
    color: #17233d;
    font-size: 16px;
    font-weight: 600;
  }

  .el-drawer__body {
    padding: 20px 24px 24px;
    overflow-x: hidden;
    overflow-y: auto;
    background: #fff;
  }
}

.slot-capacity-drawer .slot-drawer-body {
  min-height: 200px;
}

.slot-capacity-drawer .slot-drawer-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.slot-capacity-drawer .slot-drawer-list-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 14px;
  background: #fff;
  border: 1px solid #e8eaec;
  border-radius: 8px;
  transition: border-color 0.2s, box-shadow 0.2s;

  &:hover {
    border-color: var(--el-color-primary-light-5);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  }
}

.slot-capacity-drawer .slot-drawer-list-main {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}

.slot-capacity-drawer .slot-drawer-list-no {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 6px;
  background: #f0f2f5;
  color: #808695;
  font-size: 12px;
  font-weight: 600;
  flex-shrink: 0;
}

.slot-capacity-drawer .slot-drawer-list-time {
  color: #17233d;
  font-size: 14px;
  line-height: 22px;
}

.slot-capacity-drawer .slot-drawer-list-qty {
  flex-shrink: 0;
  min-width: 48px;
  padding: 2px 10px;
  border-radius: 4px;
  background: var(--el-color-primary-light-9, #ecf5ff);
  color: var(--el-color-primary);
  font-size: 13px;
  font-weight: 600;
  text-align: center;
  line-height: 22px;

  &.is-unlimited {
    background: #f0f2f5;
    color: #808695;
    font-weight: 500;
  }
}

.slot-capacity-drawer .slot-drawer-empty {
  padding-top: 48px;
}
</style>
